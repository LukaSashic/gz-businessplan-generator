/**
 * Business Plan Export API Route (GZ-901)
 *
 * POST /api/export/businessplan
 *
 * Generates and returns .docx business plan document.
 * Requires valid workshop session and BA compliance.
 *
 * SECURITY: Uses RLS policies to ensure user can only export own workshops.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

import { generateBusinessPlanDocument, checkExportReadiness } from '@/lib/export/docx-generator';
import type { DocumentExportRequest } from '@/lib/export/types';

// ============================================================================
// Request Validation Schema
// ============================================================================

const ExportRequestSchema = z.object({
  workshopId: z.string().uuid('Invalid workshop ID format'),
  options: z.object({
    includeDetailedFinancials: z.boolean().optional().default(true),
    includeSWOTSection: z.boolean().optional().default(true),
    format: z.literal('docx').optional().default('docx'),
    companyLogo: z.string().optional().default('')
  }).optional().default({})
});

// ============================================================================
// Main Export Handler
// ============================================================================

/**
 * POST /api/export/businessplan
 *
 * Generate and download BA-compliant business plan document
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // 1. Parse and validate request body
    const body = await request.json();
    const validation = ExportRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: 'Ungültige Anfrageparameter',
          details: validation.error.errors.map(err => err.message)
        },
        { status: 400 }
      );
    }

    const exportRequest: DocumentExportRequest = validation.data;

    // 2. Authenticate user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentifizierung erforderlich' },
        { status: 401 }
      );
    }

    // 3. Check export readiness (quick validation)
    const readinessCheck = await checkExportReadiness(exportRequest.workshopId);
    if (!readinessCheck.canExport) {
      return NextResponse.json(
        {
          error: 'Export nicht möglich',
          validationErrors: readinessCheck.validationResult.blockers.map(b => b.message),
          missingModules: readinessCheck.missingModules
        },
        { status: 422 } // Unprocessable Entity
      );
    }

    // 4. Generate document
    console.log(`Starting document generation for workshop ${exportRequest.workshopId}`);
    const result = await generateBusinessPlanDocument(exportRequest);

    if (!result.success) {
      console.error('Document generation failed:', result.error);
      return NextResponse.json(
        {
          error: result.error || 'Dokumentgenerierung fehlgeschlagen',
          validationErrors: result.validationErrors || []
        },
        { status: 500 }
      );
    }

    // 5. Prepare response with document blob
    const generationTime = Date.now() - startTime;
    console.log(`Document generated successfully in ${generationTime}ms`);

    // Create filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const companyName = result.metadata?.companyName?.replace(/[^a-zA-Z0-9-_]/g, '') || 'Businessplan';
    const filename = `${companyName}_Businessplan_${timestamp}.docx`;

    // Return document as blob
    return new NextResponse(result.document, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Generation-Time-Ms': generationTime.toString(),
        'X-BA-Compliant': result.metadata?.baCompliant ? 'true' : 'false',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    });

  } catch (error) {
    console.error('Export API error:', error);

    return NextResponse.json(
      {
        error: 'Interner Server-Fehler',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/export/businessplan?workshopId={id}
 *
 * Check export readiness without generating document
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Get workshop ID from query params
    const url = new URL(request.url);
    const workshopId = url.searchParams.get('workshopId');

    if (!workshopId) {
      return NextResponse.json(
        { error: 'Workshop ID erforderlich' },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidValidation = z.string().uuid().safeParse(workshopId);
    if (!uuidValidation.success) {
      return NextResponse.json(
        { error: 'Ungültige Workshop ID' },
        { status: 400 }
      );
    }

    // 2. Authenticate user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session) {
      return NextResponse.json(
        { error: 'Authentifizierung erforderlich' },
        { status: 401 }
      );
    }

    // 3. Check export readiness
    const readinessCheck = await checkExportReadiness(workshopId);

    return NextResponse.json({
      canExport: readinessCheck.canExport,
      validation: {
        passed: readinessCheck.validationResult.passed,
        blockers: readinessCheck.validationResult.blockers.length,
        warnings: readinessCheck.validationResult.warnings.length,
        overallScore: readinessCheck.validationResult.summary.overallScore
      },
      missingModules: readinessCheck.missingModules,
      recommendations: generateExportRecommendations(readinessCheck)
    });

  } catch (error) {
    console.error('Export readiness check error:', error);

    return NextResponse.json(
      {
        error: 'Fehler bei der Export-Bereitschaftsprüfung',
        details: error instanceof Error ? error.message : 'Unbekannter Fehler'
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Generate actionable recommendations for improving export readiness
 */
function generateExportRecommendations(readinessCheck: Awaited<ReturnType<typeof checkExportReadiness>>): string[] {
  const recommendations: string[] = [];

  // Missing modules
  if (readinessCheck.missingModules.length > 0) {
    recommendations.push(
      `Vervollständigen Sie die folgenden Module: ${readinessCheck.missingModules.join(', ')}`
    );
  }

  // Critical validation blockers
  if (readinessCheck.validationResult.blockers.length > 0) {
    const blocker = readinessCheck.validationResult.blockers[0];
    if (blocker.id.includes('month-6')) {
      recommendations.push('Überprüfen Sie die Finanzplanung: Das Unternehmen muss in Monat 6 selbstständig sein.');
    }
    if (blocker.id.includes('liquidity')) {
      recommendations.push('Überprüfen Sie die Liquiditätsplanung: Der Kontostand darf nie negativ werden.');
    }
  }

  // General recommendations
  if (readinessCheck.validationResult.summary.overallScore < 80) {
    recommendations.push('Überprüfen Sie alle Module auf Vollständigkeit und Qualität.');
  }

  // Default recommendation
  if (recommendations.length === 0 && readinessCheck.canExport) {
    recommendations.push('Ihr Businessplan ist bereit für den Export!');
  }

  return recommendations;
}

// ============================================================================
// Rate Limiting (Simple In-Memory)
// ============================================================================

// Simple rate limiting map (would use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxRequests = 10; // Max 10 exports per minute

  const userLimit = rateLimitMap.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    rateLimitMap.set(userId, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (userLimit.count >= maxRequests) {
    return false;
  }

  userLimit.count++;
  return true;
}