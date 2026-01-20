/**
 * Main Export API Route (GZ-902)
 *
 * POST /api/export
 *
 * Simplified export endpoint that validates workshop readiness and generates documents.
 * Uses final-validator and docx-generator from dependencies GZ-801/GZ-803 and GZ-901.
 *
 * SECURITY: Uses RLS policies to ensure users can only export their own workshops.
 * ZDR COMPLIANCE: No user data stored - immediate generation and streaming.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { z } from 'zod';

import { validateExportReadiness, createExportResponse } from '@/lib/validation/final-validator';
import { generateBusinessPlanDocument } from '@/lib/export/docx-generator';
import type { WorkshopSession } from '@/types/workshop-session';
import type { DocumentExportRequest } from '@/lib/export/types';

// ============================================================================
// Request Validation Schema
// ============================================================================

const ExportRequestSchema = z.object({
  workshopId: z.string().uuid('Workshop-ID muss ein gültiges UUID sein'),
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
 * POST /api/export
 *
 * Generate and download business plan document with BA compliance validation
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
          error: 'invalid_request',
          message: 'Ungültige Anfrageparameter',
          details: validation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        },
        { status: 400 }
      );
    }

    const { workshopId, options } = validation.data;

    // 2. Authenticate user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user?.id) {
      return NextResponse.json(
        {
          error: 'authentication_required',
          message: 'Anmeldung erforderlich'
        },
        { status: 401 }
      );
    }

    // 3. Load workshop session with RLS protection
    const workshopSession = await loadWorkshopSession(workshopId, session.user.id, supabase);
    if (!workshopSession) {
      return NextResponse.json(
        {
          error: 'workshop_not_found',
          message: 'Workshop-Session wurde nicht gefunden oder Sie haben keine Berechtigung'
        },
        { status: 404 }
      );
    }

    // 4. CRITICAL: Validate export readiness using final-validator (GZ-803)
    console.log(`[Export] Validating export readiness for workshop ${workshopId}`);
    const validationResult = await validateExportReadiness(workshopSession);

    if (!validationResult.canExport) {
      console.log(`[Export] Validation failed for workshop ${workshopId}:`,
        validationResult.blockers.map(b => b.title));

      const response = createExportResponse(validationResult);
      return NextResponse.json(response.data, { status: response.status });
    }

    // 5. Generate document using docx-generator (GZ-901)
    console.log(`[Export] Starting document generation for workshop ${workshopId}`);
    const exportRequest: DocumentExportRequest = {
      workshopId,
      options: {
        ...options,
        includeDetailedFinancials: options.includeDetailedFinancials ?? true,
        includeSWOTSection: options.includeSWOTSection ?? true,
        format: 'docx'
      }
    };

    const documentResult = await generateBusinessPlanDocument(exportRequest);

    if (!documentResult.success) {
      console.error(`[Export] Document generation failed:`, documentResult.error);
      return NextResponse.json(
        {
          error: 'generation_failed',
          message: documentResult.error || 'Dokumentgenerierung fehlgeschlagen',
          validationErrors: documentResult.validationErrors || []
        },
        { status: 500 }
      );
    }

    // 6. Prepare successful response with document blob
    const generationTime = Date.now() - startTime;
    console.log(`[Export] Document generated successfully in ${generationTime}ms for workshop ${workshopId}`);

    // Generate filename with business name and timestamp
    const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const businessName = workshopSession.businessName?.replace(/[^a-zA-Z0-9-_\s]/g, '') || 'Unbenanntes-Unternehmen';
    const cleanBusinessName = businessName.replace(/\s+/g, '-');
    const filename = `${cleanBusinessName}_Businessplan_${timestamp}.docx`;

    // Return document with proper headers
    return new NextResponse(documentResult.document, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'X-Generation-Time-Ms': generationTime.toString(),
        'X-BA-Compliant': documentResult.metadata?.baCompliant ? 'true' : 'false',
        'X-Compliance-Score': validationResult.summary.complianceScore.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

  } catch (error) {
    const generationTime = Date.now() - startTime;
    console.error('[Export] Unexpected error:', error, { generationTime });

    return NextResponse.json(
      {
        error: 'internal_server_error',
        message: 'Ein unerwarteter Fehler ist aufgetreten',
        details: process.env.NODE_ENV === 'development'
          ? (error instanceof Error ? error.message : 'Unknown error')
          : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/export?workshopId={id}
 *
 * Quick validation check to determine if workshop is ready for export
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Extract workshop ID from query parameters
    const url = new URL(request.url);
    const workshopId = url.searchParams.get('workshopId');

    if (!workshopId) {
      return NextResponse.json(
        {
          error: 'missing_workshop_id',
          message: 'Workshop-ID ist erforderlich'
        },
        { status: 400 }
      );
    }

    // Validate UUID format
    const uuidValidation = z.string().uuid().safeParse(workshopId);
    if (!uuidValidation.success) {
      return NextResponse.json(
        {
          error: 'invalid_workshop_id',
          message: 'Ungültige Workshop-ID Format'
        },
        { status: 400 }
      );
    }

    // 2. Authenticate user
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();

    if (authError || !session?.user?.id) {
      return NextResponse.json(
        {
          error: 'authentication_required',
          message: 'Anmeldung erforderlich'
        },
        { status: 401 }
      );
    }

    // 3. Load workshop session
    const workshopSession = await loadWorkshopSession(workshopId, session.user.id, supabase);
    if (!workshopSession) {
      return NextResponse.json(
        {
          error: 'workshop_not_found',
          message: 'Workshop-Session wurde nicht gefunden oder Sie haben keine Berechtigung'
        },
        { status: 404 }
      );
    }

    // 4. Run validation check
    const validationResult = await validateExportReadiness(workshopSession);

    return NextResponse.json({
      canExport: validationResult.canExport,
      status: validationResult.summary.status,
      message: validationResult.summary.message,
      complianceScore: validationResult.summary.complianceScore,
      validation: {
        blockers: validationResult.blockers.length,
        warnings: validationResult.warnings.length,
        details: validationResult.blockers.concat(validationResult.warnings).map(issue => ({
          id: issue.id,
          severity: issue.severity,
          title: issue.title,
          message: issue.message
        }))
      },
      recommendations: generateValidationRecommendations(validationResult)
    });

  } catch (error) {
    console.error('[Export] Validation check error:', error);

    return NextResponse.json(
      {
        error: 'validation_check_failed',
        message: 'Fehler bei der Export-Bereitschaftsprüfung',
        details: process.env.NODE_ENV === 'development'
          ? (error instanceof Error ? error.message : 'Unknown error')
          : undefined
      },
      { status: 500 }
    );
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Load workshop session from Supabase with RLS protection
 */
async function loadWorkshopSession(
  workshopId: string,
  userId: string,
  supabase: any
): Promise<WorkshopSession | null> {
  try {
    // Query workshop with RLS protection (user can only access their own workshops)
    const { data: workshop, error } = await supabase
      .from('workshop_sessions')
      .select('*')
      .eq('id', workshopId)
      .eq('user_id', userId) // Double-check even though RLS should handle this
      .single();

    if (error) {
      console.error('[Export] Workshop query error:', error);
      return null;
    }

    if (!workshop) {
      console.log(`[Export] Workshop ${workshopId} not found for user ${userId}`);
      return null;
    }

    // Transform database record to WorkshopSession type
    const session: WorkshopSession = {
      id: workshop.id,
      userId: workshop.user_id,
      status: workshop.status,
      currentModule: workshop.current_module,
      businessName: workshop.business_name,
      businessType: workshop.business_type,
      modules: workshop.modules || {},
      createdAt: workshop.created_at,
      updatedAt: workshop.updated_at,
      lastActivity: workshop.last_activity,
      totalDuration: workshop.total_duration,
      conversationTurns: workshop.conversation_turns
    };

    return session;

  } catch (error) {
    console.error('[Export] Failed to load workshop session:', error);
    return null;
  }
}

/**
 * Generate actionable recommendations based on validation result
 */
function generateValidationRecommendations(validationResult: any): string[] {
  const recommendations: string[] = [];

  // Handle blockers
  if (validationResult.blockers.length > 0) {
    const blocker = validationResult.blockers[0];

    if (blocker.id.includes('financial') || blocker.id.includes('month-6')) {
      recommendations.push('Überprüfen Sie die Finanzplanung: Das Unternehmen muss ab Monat 6 selbsttragend sein.');
    }

    if (blocker.id.includes('liquidity')) {
      recommendations.push('Korrigieren Sie die Liquiditätsplanung: Der Kontostand darf niemals negativ werden.');
    }

    if (blocker.id.includes('module') || blocker.id.includes('completion')) {
      recommendations.push('Vervollständigen Sie alle erforderlichen Module im Workshop.');
    }

    if (blocker.id.includes('target-audience')) {
      recommendations.push('Stellen Sie sicher, dass die Zielgruppe in allen Modulen konsistent definiert ist.');
    }
  }

  // Handle warnings
  if (validationResult.warnings.length > 0 && validationResult.blockers.length === 0) {
    recommendations.push('Es gibt kleinere Warnungen. Sie können exportieren, sollten aber die Hinweise prüfen.');
  }

  // Score-based recommendations
  if (validationResult.summary.complianceScore < 85) {
    recommendations.push('Verbessern Sie die Qualität Ihrer Antworten für eine höhere BA-Compliance.');
  }

  // Success message
  if (validationResult.canExport && validationResult.blockers.length === 0) {
    recommendations.push('Ihr Businessplan ist bereit für den Export! Alle kritischen BA-Anforderungen sind erfüllt.');
  }

  // Fallback
  if (recommendations.length === 0) {
    recommendations.push('Überprüfen Sie Ihren Businessplan auf Vollständigkeit.');
  }

  return recommendations;
}

// ============================================================================
// Rate Limiting (Simple Implementation)
// ============================================================================

const exportAttempts = new Map<string, number[]>();

function checkExportRateLimit(userId: string): boolean {
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute window
  const maxExports = 5; // Max 5 exports per minute

  if (!exportAttempts.has(userId)) {
    exportAttempts.set(userId, [now]);
    return true;
  }

  const userAttempts = exportAttempts.get(userId)!;

  // Remove old attempts outside the window
  const validAttempts = userAttempts.filter(attempt => now - attempt < windowMs);

  if (validAttempts.length >= maxExports) {
    return false;
  }

  validAttempts.push(now);
  exportAttempts.set(userId, validAttempts);
  return true;
}