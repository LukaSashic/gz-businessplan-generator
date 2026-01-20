/**
 * Final Validator - Export Blocking Logic (GZ-803)
 *
 * This is the gatekeeper that prevents document export when critical BA
 * requirements are not met. Used by the export system (GZ-901) to validate
 * business plans before generating .docx/.pdf documents.
 *
 * BLOCKING CRITERIA:
 * - Any BLOCKER severity validation issues prevent export
 * - WARNING severity issues allow export but show warnings
 * - Validation timeouts/errors allow export (fail-safe approach)
 */

import { validateBACompliance, generateValidationReport } from './ba-compliance-checker';
import type { ValidationResult, ValidationIssue } from './types';
import type { WorkshopSession } from '@/types/workshop-session';

// ============================================================================
// Export Validation Types
// ============================================================================

export interface ExportValidationResult {
  canExport: boolean;
  blockers: ValidationIssue[];
  warnings: ValidationIssue[];
  validationReport: string;
  summary: {
    status: 'ready' | 'blocked' | 'warnings';
    message: string;
    complianceScore: number;
  };
}

export interface ExportReadinessCheck {
  timestamp: string;
  workshopId: string;
  businessName?: string;
  result: ExportValidationResult;
}

// ============================================================================
// Main Export Validation Function
// ============================================================================

/**
 * Validate if workshop is ready for document export
 *
 * This is the primary function called by the export API routes.
 * It runs BA compliance validation and determines export eligibility.
 */
export async function validateExportReadiness(
  workshopSession: WorkshopSession
): Promise<ExportValidationResult> {

  // Log export validation attempt
  console.log('[Export-Validator] Checking export readiness', {
    workshopId: workshopSession.id,
    businessName: workshopSession.businessName,
    timestamp: new Date().toISOString(),
  });

  try {
    // Run full BA compliance validation
    const validationResult = await validateBACompliance(workshopSession);

    // Generate human-readable report
    const validationReport = generateValidationReport(validationResult);

    // Determine export status
    const canExport = validationResult.passed;
    const status = getExportStatus(validationResult);

    const result: ExportValidationResult = {
      canExport,
      blockers: validationResult.blockers,
      warnings: validationResult.warnings,
      validationReport,
      summary: {
        status,
        message: getStatusMessage(status, validationResult),
        complianceScore: validationResult.summary.overallScore,
      }
    };

    // Log result
    console.log('[Export-Validator] Validation complete', {
      canExport,
      status,
      blockers: validationResult.blockers.length,
      warnings: validationResult.warnings.length,
      score: validationResult.summary.overallScore,
    });

    return result;

  } catch (error) {
    console.error('[Export-Validator] Validation failed', {
      error: error.message,
      workshopId: workshopSession.id,
    });

    // Fail-safe: Allow export but warn about validation failure
    return {
      canExport: true, // Fail-safe approach
      blockers: [],
      warnings: [{
        id: 'validation-failure',
        severity: 'WARNING',
        category: 'content',
        title: 'Validierung fehlgeschlagen',
        message: `⚠️ Die automatische BA-Validierung ist fehlgeschlagen.

Sie können trotzdem exportieren, sollten aber Ihren Plan manuell
gegen BA-Kriterien prüfen.

KRITISCHE PUNKTE:
• Monat 6 Gewinn >= Lebenshaltungskosten
• Liquidität niemals negativ
• Alle Module vollständig

Bei Fragen kontaktieren Sie den Support.`,
        suggestedFix: 'Manuell gegen BA-Kriterien prüfen',
      }],
      validationReport: 'Validierung fehlgeschlagen - manueller Check empfohlen',
      summary: {
        status: 'warnings',
        message: 'Export möglich (Validierung fehlgeschlagen)',
        complianceScore: 50,
      }
    };
  }
}

/**
 * Quick export eligibility check (without full validation)
 *
 * For UI components that need to show export button state quickly.
 * Returns cached result if available, otherwise runs quick checks.
 */
export async function checkExportEligibility(
  workshopSession: WorkshopSession,
  options: { useCache?: boolean; quickOnly?: boolean } = {}
): Promise<{ canExport: boolean; primaryIssue?: string }> {

  try {
    if (options.quickOnly) {
      // Run only quick structural checks (no financial validation)
      const hasFinancialModule = Boolean(
        workshopSession.modules?.['gz-finanzplanung']?.data
      );

      const completedModules = Object.keys(workshopSession.modules || {})
        .filter(moduleId => workshopSession.modules[moduleId]?.data);

      const hasMinimumModules = completedModules.length >= 7; // At least 7/9

      if (!hasFinancialModule) {
        return {
          canExport: false,
          primaryIssue: 'Finanzplanung fehlt',
        };
      }

      if (!hasMinimumModules) {
        return {
          canExport: false,
          primaryIssue: `Nur ${completedModules.length}/9 Module vollständig`,
        };
      }

      return { canExport: true };
    }

    // Run full validation
    const validationResult = await validateExportReadiness(workshopSession);

    return {
      canExport: validationResult.canExport,
      primaryIssue: validationResult.blockers[0]?.title,
    };

  } catch (error) {
    // Fail-safe: Allow export on check failure
    return {
      canExport: true,
      primaryIssue: 'Validierung fehlgeschlagen',
    };
  }
}

// ============================================================================
// Status and Message Helpers
// ============================================================================

function getExportStatus(validationResult: ValidationResult): 'ready' | 'blocked' | 'warnings' {
  if (validationResult.blockers.length > 0) {
    return 'blocked';
  }

  if (validationResult.warnings.length > 0) {
    return 'warnings';
  }

  return 'ready';
}

function getStatusMessage(
  status: 'ready' | 'blocked' | 'warnings',
  validationResult: ValidationResult
): string {
  switch (status) {
    case 'blocked':
      return `Export blockiert: ${validationResult.blockers.length} kritische Fehler müssen behoben werden`;

    case 'warnings':
      return `Export möglich mit ${validationResult.warnings.length} Warnungen`;

    case 'ready':
      return 'Bereit für Export - alle BA-Compliance-Checks bestanden';

    default:
      return 'Status unbekannt';
  }
}

// ============================================================================
// Export History and Tracking
// ============================================================================

/**
 * Record export validation attempt for auditing
 */
export function recordExportValidation(
  workshopId: string,
  result: ExportValidationResult
): ExportReadinessCheck {
  const record: ExportReadinessCheck = {
    timestamp: new Date().toISOString(),
    workshopId,
    result,
  };

  // Log for auditing (in production, this might go to a database)
  console.log('[Export-Audit] Validation recorded', {
    workshopId,
    canExport: result.canExport,
    status: result.summary.status,
    timestamp: record.timestamp,
  });

  return record;
}

/**
 * Generate compliance certificate for successful exports
 */
export function generateComplianceCertificate(
  workshopSession: WorkshopSession,
  validationResult: ExportValidationResult
): string {
  if (!validationResult.canExport) {
    throw new Error('Cannot generate certificate for failed validation');
  }

  const timestamp = new Date().toLocaleString('de-DE');
  const businessName = workshopSession.businessName || 'Unbenanntes Unternehmen';

  return `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏛️  BA-COMPLIANCE ZERTIFIKAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Unternehmen: ${businessName}
Workshop-ID: ${workshopSession.id}
Validiert am: ${timestamp}

✅ VALIDIERUNG BESTANDEN

Compliance-Score: ${validationResult.summary.complianceScore}%

GEPRÜFTE KRITERIEN:
✅ Selbstragfähigkeit ab Monat 6
✅ Liquidität niemals negativ
✅ Alle Pflichtabschnitte vollständig
✅ Finanzplanung komplett

${validationResult.warnings.length > 0 ?
  `⚠️  ${validationResult.warnings.length} Warnungen (nicht blockierend)` :
  '🎯 Keine Warnungen - Optimale Compliance'}

Dieser Businessplan erfüllt alle kritischen BA-Anforderungen
für Gründungszuschuss-Anträge.

Generated by GZ-Businessplan-Generator v1.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

// ============================================================================
// API Integration Helpers
// ============================================================================

/**
 * HTTP response helper for export API routes
 */
export function createExportResponse(
  validationResult: ExportValidationResult
): {
  status: number;
  data: any;
} {
  if (!validationResult.canExport) {
    // HTTP 400 Bad Request - validation failed
    return {
      status: 400,
      data: {
        error: 'export_blocked',
        message: 'Export blockiert durch BA-Compliance-Fehler',
        blockers: validationResult.blockers,
        validationReport: validationResult.validationReport,
      }
    };
  }

  if (validationResult.warnings.length > 0) {
    // HTTP 200 OK with warnings
    return {
      status: 200,
      data: {
        success: true,
        message: 'Export möglich mit Warnungen',
        warnings: validationResult.warnings,
        complianceScore: validationResult.summary.complianceScore,
      }
    };
  }

  // HTTP 200 OK - all good
  return {
    status: 200,
    data: {
      success: true,
      message: 'Export bereit - alle Checks bestanden',
      complianceScore: validationResult.summary.complianceScore,
    }
  };
}

/**
 * Middleware function for Express.js routes
 */
export async function validateExportMiddleware(
  req: any,
  res: any,
  next: any
) {
  try {
    const workshopSession = req.workshopSession as WorkshopSession;

    if (!workshopSession) {
      return res.status(400).json({
        error: 'missing_workshop_session',
        message: 'Workshop session required for validation',
      });
    }

    const validationResult = await validateExportReadiness(workshopSession);

    // Add validation result to request for downstream handlers
    req.validationResult = validationResult;

    if (!validationResult.canExport) {
      const response = createExportResponse(validationResult);
      return res.status(response.status).json(response.data);
    }

    // Validation passed, continue to export handler
    next();

  } catch (error) {
    console.error('[Export-Middleware] Validation error', error);

    // Fail-safe: Allow export but log error
    req.validationResult = {
      canExport: true,
      warnings: [{
        id: 'validation-error',
        severity: 'WARNING',
        title: 'Validierung fehlgeschlagen',
        message: 'Manuelle Prüfung empfohlen',
      }],
    };

    next();
  }
}

// ============================================================================
// Export All
// ============================================================================

export type {
  ExportValidationResult,
  ExportReadinessCheck,
} from './final-validator';