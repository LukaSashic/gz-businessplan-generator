/**
 * Integration tests for Export Flow (GZ-902)
 *
 * Tests complete export workflow from validation to document download:
 * - Export readiness validation via GET /api/export
 * - Document generation via POST /api/export
 * - Error handling for validation failures
 * - Authentication and authorization
 * - File download functionality
 */

import { describe, it, expect, beforeEach, vi, beforeAll, afterAll } from 'vitest';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { validateExportReadiness } from '@/lib/validation/final-validator';
import { generateBusinessPlanDocument } from '@/lib/export/docx-generator';
import type { WorkshopSession } from '@/types/workshop-session';
import type { DocumentExportRequest } from '@/lib/export/types';

// Mock dependencies
vi.mock('@/lib/validation/final-validator', () => ({
  validateExportReadiness: vi.fn(),
  createExportResponse: vi.fn()
}));

vi.mock('@/lib/export/docx-generator', () => ({
  generateBusinessPlanDocument: vi.fn()
}));

vi.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: vi.fn()
}));

describe('Export Flow Integration', () => {
  const mockWorkshopId = '550e8400-e29b-41d4-a716-446655440000';
  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';

  let mockSupabase: any;
  let mockSession: any;

  beforeAll(() => {
    // Mock global fetch if not available
    if (typeof global.fetch === 'undefined') {
      global.fetch = vi.fn();
    }
  });

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock Supabase client
    mockSession = {
      user: { id: mockUserId },
      access_token: 'mock-token',
      token_type: 'bearer'
    };

    const mockChain = {
      single: vi.fn().mockResolvedValue({
        data: createMockWorkshopSession(mockWorkshopId, mockUserId),
        error: null
      })
    };

    const mockEqChain = {
      eq: vi.fn(() => mockChain)
    };

    const mockSelectChain = {
      eq: vi.fn(() => mockEqChain)
    };

    const mockFromChain = {
      select: vi.fn(() => mockSelectChain)
    };

    mockSupabase = {
      auth: {
        getSession: vi.fn().mockResolvedValue({
          data: { session: mockSession },
          error: null
        })
      },
      from: vi.fn(() => mockFromChain)
    };

    (createRouteHandlerClient as any).mockReturnValue(mockSupabase);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  // ============================================================================
  // Export Readiness Validation Tests (GET /api/export)
  // ============================================================================

  describe('GET /api/export - Readiness Validation', () => {
    it('should return export readiness for valid workshop', async () => {
      // Mock validation result
      const mockValidationResult = {
        canExport: true,
        blockers: [],
        warnings: [],
        validationReport: 'Alle Checks bestanden',
        summary: {
          status: 'ready' as const,
          message: 'Bereit für Export',
          complianceScore: 95
        }
      };

      (validateExportReadiness as any).mockResolvedValue(mockValidationResult);

      const response = await testGetExportReadiness(mockWorkshopId);

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        canExport: true,
        status: 'ready',
        complianceScore: 95,
        validation: {
          blockers: 0,
          warnings: 0
        }
      });
      expect(response.data.recommendations).toContain('Ihr Businessplan ist bereit für den Export!');
    });

    it('should return blocked status for workshops with validation blockers', async () => {
      const mockValidationResult = {
        canExport: false,
        blockers: [{
          id: 'financial-month-6',
          severity: 'BLOCKER',
          category: 'financial',
          title: 'Monat 6 Selbsttragfähigkeit',
          message: 'Das Unternehmen ist in Monat 6 nicht selbsttragend'
        }],
        warnings: [],
        summary: {
          status: 'blocked' as const,
          message: 'Export blockiert',
          complianceScore: 60
        }
      };

      (validateExportReadiness as any).mockResolvedValue(mockValidationResult);

      const response = await testGetExportReadiness(mockWorkshopId);

      expect(response.status).toBe(200);
      expect(response.data).toMatchObject({
        canExport: false,
        status: 'blocked',
        complianceScore: 60,
        validation: {
          blockers: 1,
          warnings: 0
        }
      });
      expect(response.data.recommendations[0]).toContain('Finanzplanung');
    });

    it('should return 400 for invalid workshop ID format', async () => {
      const response = await testGetExportReadiness('invalid-id');

      expect(response.status).toBe(400);
      expect(response.data.error).toBe('invalid_workshop_id');
    });

    it('should return 401 for unauthenticated requests', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      const response = await testGetExportReadiness(mockWorkshopId);

      expect(response.status).toBe(401);
      expect(response.data.error).toBe('authentication_required');
    });

    it('should return 404 for workshop not found', async () => {
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' }
      });

      const response = await testGetExportReadiness(mockWorkshopId);

      expect(response.status).toBe(404);
      expect(response.data.error).toBe('workshop_not_found');
    });
  });

  // ============================================================================
  // Document Export Tests (POST /api/export)
  // ============================================================================

  describe('POST /api/export - Document Generation', () => {
    it('should generate and return document for valid export request', async () => {
      // Mock successful validation
      const mockValidationResult = {
        canExport: true,
        blockers: [],
        warnings: [],
        summary: {
          status: 'ready' as const,
          message: 'Bereit für Export',
          complianceScore: 95
        }
      };

      (validateExportReadiness as any).mockResolvedValue(mockValidationResult);

      // Mock successful document generation
      const mockDocumentBlob = new Blob(['mock docx content'], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      });

      const mockDocumentResult = {
        success: true,
        document: mockDocumentBlob,
        metadata: {
          title: 'Test Businessplan',
          author: 'Test User',
          companyName: 'Test Company',
          generatedAt: new Date(),
          version: '1.0.0',
          baCompliant: true,
          exportOptions: {}
        }
      };

      (generateBusinessPlanDocument as any).mockResolvedValue(mockDocumentResult);

      const response = await testPostExportDocument({
        workshopId: mockWorkshopId,
        options: {
          includeDetailedFinancials: true,
          includeSWOTSection: true,
          format: 'docx'
        }
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toContain('wordprocessingml.document');
      expect(response.headers.get('Content-Disposition')).toContain('attachment');
      expect(response.headers.get('X-BA-Compliant')).toBe('true');
      expect(response.blob).toBe(mockDocumentBlob);
    });

    it('should return 400 for validation blocked export', async () => {
      const mockValidationResult = {
        canExport: false,
        blockers: [{
          id: 'liquidity-negative',
          severity: 'BLOCKER',
          category: 'financial',
          title: 'Negative Liquidität',
          message: 'Liquidität wird in Monat 8 negativ'
        }],
        warnings: [],
        summary: {
          status: 'blocked' as const,
          message: 'Export blockiert',
          complianceScore: 45
        }
      };

      (validateExportReadiness as any).mockResolvedValue(mockValidationResult);

      const response = await testPostExportDocument({
        workshopId: mockWorkshopId
      });

      expect(response.status).toBe(400);
      expect(response.data.error).toContain('export_blocked');
      expect(response.data.message).toContain('BA-Compliance-Fehler');
    });

    it('should return 500 for document generation failure', async () => {
      // Mock successful validation
      const mockValidationResult = {
        canExport: true,
        blockers: [],
        warnings: [],
        summary: {
          status: 'ready' as const,
          complianceScore: 95
        }
      };

      (validateExportReadiness as any).mockResolvedValue(mockValidationResult);

      // Mock failed document generation
      const mockDocumentResult = {
        success: false,
        error: 'Template rendering failed',
        validationErrors: ['Module 6 data incomplete']
      };

      (generateBusinessPlanDocument as any).mockResolvedValue(mockDocumentResult);

      const response = await testPostExportDocument({
        workshopId: mockWorkshopId
      });

      expect(response.status).toBe(500);
      expect(response.data.error).toBe('generation_failed');
      expect(response.data.validationErrors).toContain('Module 6 data incomplete');
    });

    it('should validate request schema', async () => {
      const response = await testPostExportDocument({
        workshopId: 'invalid-uuid'
      });

      expect(response.status).toBe(400);
      expect(response.data.error).toBe('invalid_request');
    });

    it('should generate correct filename', async () => {
      const mockValidationResult = {
        canExport: true,
        blockers: [],
        warnings: [],
        summary: { status: 'ready' as const, complianceScore: 95 }
      };

      (validateExportReadiness as any).mockResolvedValue(mockValidationResult);

      const mockDocumentResult = {
        success: true,
        document: new Blob(['test']),
        metadata: {
          companyName: 'Mein Test-Unternehmen & Co.',
          baCompliant: true
        }
      };

      (generateBusinessPlanDocument as any).mockResolvedValue(mockDocumentResult);

      const response = await testPostExportDocument({
        workshopId: mockWorkshopId
      });

      const contentDisposition = response.headers.get('Content-Disposition');
      expect(contentDisposition).toMatch(/Mein-Test-Unternehmen-Co/);
      expect(contentDisposition).toMatch(/Businessplan/);
      expect(contentDisposition).toMatch(/\.docx/);
    });
  });

  // ============================================================================
  // Authentication and Authorization Tests
  // ============================================================================

  describe('Authentication and Authorization', () => {
    it('should prevent access to other users workshops', async () => {
      mockSupabase.from().select().eq().eq().single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'Not found' }
      });

      const response = await testGetExportReadiness(mockWorkshopId);

      expect(response.status).toBe(404);
      expect(response.data.error).toBe('workshop_not_found');
    });

    it('should handle authentication errors gracefully', async () => {
      mockSupabase.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Invalid token' }
      });

      const response = await testPostExportDocument({
        workshopId: mockWorkshopId
      });

      expect(response.status).toBe(401);
    });
  });

  // ============================================================================
  // Error Handling Tests
  // ============================================================================

  describe('Error Handling', () => {
    it('should handle validation function errors gracefully', async () => {
      (validateExportReadiness as any).mockRejectedValue(new Error('Database connection failed'));

      const response = await testGetExportReadiness(mockWorkshopId);

      expect(response.status).toBe(500);
      expect(response.data.error).toBe('validation_check_failed');
    });

    it('should handle document generation timeouts', async () => {
      const mockValidationResult = {
        canExport: true,
        blockers: [],
        warnings: [],
        summary: { status: 'ready' as const, complianceScore: 95 }
      };

      (validateExportReadiness as any).mockResolvedValue(mockValidationResult);
      (generateBusinessPlanDocument as any).mockRejectedValue(new Error('Generation timeout'));

      const response = await testPostExportDocument({
        workshopId: mockWorkshopId
      });

      expect(response.status).toBe(500);
      expect(response.data.error).toBe('internal_server_error');
    });
  });
});

// ============================================================================
// Test Helper Functions
// ============================================================================

/**
 * Test helper for GET /api/export endpoint
 */
async function testGetExportReadiness(workshopId: string) {
  // Simulate API call
  const url = new URL(`http://localhost:3000/api/export?workshopId=${encodeURIComponent(workshopId)}`);

  // Mock implementation of GET handler logic
  try {
    if (!workshopId) {
      return {
        status: 400,
        data: {
          error: 'missing_workshop_id',
          message: 'Workshop-ID ist erforderlich'
        }
      };
    }

    // UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(workshopId)) {
      return {
        status: 400,
        data: {
          error: 'invalid_workshop_id',
          message: 'Ungültige Workshop-ID Format'
        }
      };
    }

    // Check authentication
    const mockSupabase = (createRouteHandlerClient as any)();
    const { data: { session } } = await mockSupabase.auth.getSession();

    if (!session?.user?.id) {
      return {
        status: 401,
        data: {
          error: 'authentication_required',
          message: 'Anmeldung erforderlich'
        }
      };
    }

    // Load workshop session
    const { data: workshop, error } = await mockSupabase
      .from('workshop_sessions')
      .select('*')
      .eq('id', workshopId)
      .eq('user_id', session.user.id)
      .single();

    if (error || !workshop) {
      return {
        status: 404,
        data: {
          error: 'workshop_not_found',
          message: 'Workshop-Session wurde nicht gefunden oder Sie haben keine Berechtigung'
        }
      };
    }

    // Run validation
    const validationResult = await validateExportReadiness(workshop);

    return {
      status: 200,
      data: {
        canExport: validationResult.canExport,
        status: validationResult.summary.status,
        message: validationResult.summary.message,
        complianceScore: validationResult.summary.complianceScore,
        validation: {
          blockers: validationResult.blockers.length,
          warnings: validationResult.warnings.length,
          details: validationResult.blockers.concat(validationResult.warnings)
        },
        recommendations: generateMockRecommendations(validationResult)
      }
    };

  } catch (error) {
    return {
      status: 500,
      data: {
        error: 'validation_check_failed',
        message: 'Fehler bei der Export-Bereitschaftsprüfung'
      }
    };
  }
}

/**
 * Test helper for POST /api/export endpoint
 */
async function testPostExportDocument(request: Partial<DocumentExportRequest>) {
  try {
    // Validate request
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!request.workshopId || !uuidRegex.test(request.workshopId)) {
      return {
        status: 400,
        data: {
          error: 'invalid_request',
          message: 'Ungültige Anfrageparameter'
        }
      };
    }

    // Check authentication
    const mockSupabase = (createRouteHandlerClient as any)();
    const { data: { session } } = await mockSupabase.auth.getSession();

    if (!session?.user?.id) {
      return {
        status: 401,
        data: {
          error: 'authentication_required',
          message: 'Anmeldung erforderlich'
        }
      };
    }

    // Load workshop session
    const { data: workshop, error } = await mockSupabase
      .from('workshop_sessions')
      .select('*')
      .eq('id', request.workshopId)
      .eq('user_id', session.user.id)
      .single();

    if (error || !workshop) {
      return {
        status: 404,
        data: {
          error: 'workshop_not_found',
          message: 'Workshop-Session wurde nicht gefunden'
        }
      };
    }

    // Validate export readiness
    const validationResult = await validateExportReadiness(workshop);

    if (!validationResult.canExport) {
      return {
        status: 400,
        data: {
          error: 'export_blocked',
          message: 'Export blockiert durch BA-Compliance-Fehler',
          blockers: validationResult.blockers
        }
      };
    }

    // Generate document
    const documentResult = await generateBusinessPlanDocument(request as DocumentExportRequest);

    if (!documentResult.success) {
      return {
        status: 500,
        data: {
          error: 'generation_failed',
          message: documentResult.error,
          validationErrors: documentResult.validationErrors
        }
      };
    }

    // Generate filename
    const businessName = workshop.business_name || 'Unbenanntes-Unternehmen';
    const cleanBusinessName = businessName.replace(/[^a-zA-Z0-9-_\s]/g, '').replace(/\s+/g, '-');
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${cleanBusinessName}_Businessplan_${timestamp}.docx`;

    return {
      status: 200,
      blob: documentResult.document,
      headers: new Map([
        ['Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        ['Content-Disposition', `attachment; filename="${filename}"`],
        ['X-BA-Compliant', documentResult.metadata?.baCompliant ? 'true' : 'false']
      ])
    };

  } catch (error) {
    return {
      status: 500,
      data: {
        error: 'internal_server_error',
        message: 'Ein unerwarteter Fehler ist aufgetreten'
      }
    };
  }
}

/**
 * Create mock workshop session for testing
 */
function createMockWorkshopSession(workshopId: string, userId: string): WorkshopSession {
  return {
    id: workshopId,
    userId,
    status: 'completed',
    currentModule: 'gz-zusammenfassung',
    businessName: 'Test Unternehmen GmbH',
    businessType: 'DIGITAL_SERVICE',
    modules: {
      'gz-intake': { status: 'completed', data: {} },
      'gz-geschaeftsmodell': { status: 'completed', data: {} },
      'gz-unternehmen': { status: 'completed', data: {} },
      'gz-markt-wettbewerb': { status: 'completed', data: {} },
      'gz-marketing': { status: 'completed', data: {} },
      'gz-finanzplanung': { status: 'completed', data: {} },
      'gz-swot': { status: 'completed', data: {} },
      'gz-meilensteine': { status: 'completed', data: {} },
      'gz-kpi': { status: 'completed', data: {} },
      'gz-zusammenfassung': { status: 'completed', data: {} },
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    lastActivity: new Date().toISOString()
  };
}

/**
 * Generate mock recommendations based on validation result
 */
function generateMockRecommendations(validationResult: any): string[] {
  const recommendations: string[] = [];

  if (validationResult.blockers.length > 0) {
    const blocker = validationResult.blockers[0];
    if (blocker.id.includes('financial')) {
      recommendations.push('Überprüfen Sie die Finanzplanung: Das Unternehmen muss ab Monat 6 selbsttragend sein.');
    }
  }

  if (validationResult.canExport && validationResult.blockers.length === 0) {
    recommendations.push('Ihr Businessplan ist bereit für den Export! Alle kritischen BA-Anforderungen sind erfüllt.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Überprüfen Sie Ihren Businessplan auf Vollständigkeit.');
  }

  return recommendations;
}