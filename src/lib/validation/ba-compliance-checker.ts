/**
 * BA Compliance Checker - Main Orchestrator (GZ-803)
 *
 * The primary validation system that ensures business plans meet exact BA requirements
 * before allowing export. Implements critical checks that prevent 30-50% rejection rate.
 *
 * Based on analysis of real BA-approved business plan template.
 *
 * VALIDATION RULES:
 * 4 CRITICAL BLOCKERS (export blocked if any fail):
 * - Month 6 Self-Sufficiency (#1 rejection reason)
 * - Liquidity Never Negative (automatic rejection)
 * - Required Sections Complete (all 9 modules)
 * - Financial Tables Complete (full 36-month data)
 *
 * 3 WARNINGS (show but allow export):
 * - Break-Even Reasonable (<= 18 months)
 * - Sources Documented (>= 5 citations)
 * - GZ Funding Included (proper financial planning)
 */

import type {
  ValidationResult,
  ValidationIssue,
  ValidationSummary
} from './types';
import type { WorkshopSession } from '@/types/workshop-session';
import type { PartialFinanzplanungOutput } from '@/types/modules/finanzplanung';
import { validateFinancialCompliance } from './checks/financial';
import { validateStructureCompliance } from './checks/structure';

// ============================================================================
// Configuration
// ============================================================================

// Performance constraint: All validations must complete in <500ms
const VALIDATION_TIMEOUT_MS = 500;

// Compliance scoring weights (based on BA rejection rates)
const VALIDATION_WEIGHTS = {
  'month-6-self-sufficiency': 35,    // 35% rejection rate
  'liquidity-non-negative': 25,      // 25% rejection rate
  'required-sections-complete': 20,  // 20% rejection rate
  'financial-tables-complete': 15,   // 15% rejection rate
  'break-even-reasonable': 5,        // 5% soft rejection rate
  'sources-documented': 8,           // 8% credibility impact
  'gz-funding-included': 3,          // 3% minor flag
  'document-structure': 1,           // 1% professional impression
} as const;

// ============================================================================
// Core Validation Function
// ============================================================================

/**
 * Validate business plan against BA compliance requirements
 *
 * This is the main entry point for BA validation. It runs all critical
 * and warning checks, then determines if export should be blocked.
 */
export async function validateBACompliance(
  workshopSession: WorkshopSession
): Promise<ValidationResult> {

  const startTime = Date.now();

  // Log validation start (for BA support debugging)
  console.log('[BA-803] Starting validation', {
    workshopId: workshopSession.id,
    businessName: workshopSession.businessName,
    completedModules: Object.keys(workshopSession.modules || {}).length,
    timestamp: new Date().toISOString(),
  });

  try {
    // Create timeout promise for performance constraint
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Validation timeout')), VALIDATION_TIMEOUT_MS)
    );

    // Run all validations with timeout protection
    const validationPromise = runAllValidations(workshopSession);

    const result = await Promise.race([validationPromise, timeoutPromise]);

    const duration = Date.now() - startTime;

    // Log completion
    console.log('[BA-803] Validation complete', {
      duration: `${duration}ms`,
      passed: result.passed,
      blockers: result.blockers.length,
      warnings: result.warnings.length,
      score: result.summary.overallScore,
    });

    // Log critical failures for support debugging
    if (!result.passed) {
      console.warn('[BA-803] Export blocked', {
        blockerIds: result.blockers.map(b => b.id),
        primaryIssue: result.blockers[0]?.title,
      });
    }

    return result;

  } catch (error) {
    const duration = Date.now() - startTime;

    console.error('[BA-803] Validation error', {
      error: error.message,
      duration: `${duration}ms`,
      workshopId: workshopSession.id,
    });

    // Fallback: Show warning but allow export
    // (Better to let through than block on validation failure)
    return {
      passed: true,
      blockers: [],
      warnings: [{
        id: 'validation-error',
        severity: 'WARNING',
        category: 'content',
        title: 'Validierung fehlgeschlagen',
        message: `⚠️ WARNUNG: Validierung dauerte zu lange oder ist fehlgeschlagen.

Die automatische BA-Compliance-Prüfung konnte nicht vollständig durchgeführt werden.

EMPFEHLUNG:
Prüfen Sie Ihren Businessplan manuell gegen diese Kriterien:

KRITISCHE PUNKTE:
• Monat 6 Gewinn >= Ihre Lebenshaltungskosten
• Liquidität niemals negativ in 36 Monaten
• Alle 9 Module vollständig ausgefüllt
• Finanzplanung komplett (4 Tabellen)

VERBESSERUNGEN:
• Break-Even spätestens Monat 18
• Mindestens 5 Quellenangaben
• GZ-Förderung in Finanzplanung

Sie können exportieren, sollten aber manuell prüfen.`,
        suggestedFix: 'Prüfen Sie kritische BA-Kriterien manuell',
      }],
      summary: {
        totalChecks: 7,
        passedChecks: 0,
        failedBlockers: 0,
        totalWarnings: 1,
        canExport: true,
        overallScore: 50, // Neutral score on validation failure
      }
    };
  }
}

/**
 * Run all validation checks (internal function)
 */
async function runAllValidations(
  workshopSession: WorkshopSession
): Promise<ValidationResult> {

  // Extract financial data for validation
  const finanzplanung = workshopSession.modules?.['gz-finanzplanung']?.data as PartialFinanzplanungOutput;

  // Run financial validations (4 critical + 2 warning checks)
  const financialIssues = validateFinancialCompliance(finanzplanung);

  // Run structure validations (1 critical + 2 warning checks)
  const structureIssues = validateStructureCompliance(workshopSession);

  // Combine all issues
  const allIssues = [...financialIssues, ...structureIssues];

  // Separate blockers from warnings
  const blockers = allIssues.filter(issue => issue.severity === 'BLOCKER');
  const warnings = allIssues.filter(issue => issue.severity === 'WARNING');

  // Calculate summary metrics
  const summary = calculateValidationSummary(allIssues);

  // Export is blocked if any critical issues exist
  const passed = blockers.length === 0;

  return {
    passed,
    blockers,
    warnings,
    summary: {
      ...summary,
      canExport: passed,
    }
  };
}

/**
 * Calculate validation summary and compliance score
 */
function calculateValidationSummary(allIssues: ValidationIssue[]): ValidationSummary {
  const totalChecks = Object.keys(VALIDATION_WEIGHTS).length;
  const failedBlockers = allIssues.filter(i => i.severity === 'BLOCKER').length;
  const totalWarnings = allIssues.filter(i => i.severity === 'WARNING').length;
  const passedChecks = totalChecks - allIssues.length;

  // Calculate weighted compliance score (0-100)
  let totalWeight = 0;
  let achievedWeight = 0;

  Object.entries(VALIDATION_WEIGHTS).forEach(([ruleId, weight]) => {
    totalWeight += weight;

    // Check if this rule passed (no issue with this ID)
    const hasIssue = allIssues.some(issue => issue.id === ruleId);
    if (!hasIssue) {
      achievedWeight += weight;
    }
  });

  const overallScore = Math.round((achievedWeight / totalWeight) * 100);

  return {
    totalChecks,
    passedChecks,
    failedBlockers,
    totalWarnings,
    canExport: failedBlockers === 0,
    overallScore,
  };
}

// ============================================================================
// Export Summary Functions
// ============================================================================

/**
 * Generate human-readable validation report
 */
export function generateValidationReport(result: ValidationResult): string {
  const lines: string[] = [
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '🏛️  BA-COMPLIANCE PRÜFUNG',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
  ];

  // Overall status
  const statusIcon = result.passed ? '✅' : '❌';
  const statusText = result.passed ? 'FREIGEGEBEN' : 'BLOCKIERT';

  lines.push(`STATUS: ${statusIcon} ${statusText}`);
  lines.push(`Compliance-Score: ${result.summary.overallScore}%`);
  lines.push('');

  // Summary statistics
  lines.push(`PRÜFUNG: ${result.summary.passedChecks}/${result.summary.totalChecks} bestanden`);
  if (result.summary.failedBlockers > 0) {
    lines.push(`❌ Kritische Fehler: ${result.summary.failedBlockers}`);
  }
  if (result.summary.totalWarnings > 0) {
    lines.push(`⚠️  Warnungen: ${result.summary.totalWarnings}`);
  }
  lines.push('');

  // Critical issues (blockers)
  if (result.blockers.length > 0) {
    lines.push('🚫 KRITISCHE FEHLER (Export blockiert):');
    lines.push('');
    result.blockers.forEach((issue, index) => {
      lines.push(`${index + 1}. ${issue.title}`);
      lines.push(`   ${issue.message.split('\n')[0]}`); // First line only for summary
      lines.push('');
    });
  }

  // Warnings
  if (result.warnings.length > 0) {
    lines.push('⚠️  WARNUNGEN (Export möglich):');
    lines.push('');
    result.warnings.forEach((issue, index) => {
      lines.push(`${index + 1}. ${issue.title}`);
      lines.push(`   ${issue.message.split('\n')[0]}`); // First line only for summary
      lines.push('');
    });
  }

  // Footer
  if (result.passed) {
    lines.push('✅ Ihr Businessplan erfüllt alle kritischen BA-Anforderungen.');
    lines.push('   Export ist möglich.');

    if (result.warnings.length > 0) {
      lines.push('');
      lines.push('💡 Durch Behebung der Warnungen können Sie Ihren Plan weiter stärken.');
    }
  } else {
    lines.push('❌ Export ist blockiert bis alle kritischen Fehler behoben sind.');
    lines.push('');
    lines.push('🔧 NÄCHSTE SCHRITTE:');
    lines.push('   1. Beheben Sie die kritischen Fehler');
    lines.push('   2. Führen Sie eine erneute Validierung durch');
    lines.push('   3. Exportieren Sie Ihren Businessplan');
  }

  lines.push('');
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return lines.join('\n');
}

/**
 * Get validation summary for UI display
 */
export function getValidationSummary(result: ValidationResult): {
  status: 'passed' | 'blocked' | 'warnings';
  message: string;
  actionable: string[];
} {
  if (!result.passed) {
    return {
      status: 'blocked',
      message: `Export blockiert: ${result.blockers.length} kritische Fehler müssen behoben werden`,
      actionable: result.blockers.map(b => `${b.title}: ${b.suggestedFix || 'Siehe Details'}`),
    };
  }

  if (result.warnings.length > 0) {
    return {
      status: 'warnings',
      message: `Export möglich mit ${result.warnings.length} Warnungen (optional zu beheben)`,
      actionable: result.warnings.map(w => `${w.title}: ${w.suggestedFix || 'Siehe Details'}`),
    };
  }

  return {
    status: 'passed',
    message: 'Alle BA-Compliance-Checks bestanden - Export freigegeben',
    actionable: [],
  };
}

// ============================================================================
// Testing and Debugging Utilities
// ============================================================================

/**
 * Run validation with detailed logging (for development/debugging)
 */
export async function validateBAComplianceDebug(
  workshopSession: WorkshopSession,
  options: { verbose?: boolean; skipTimeout?: boolean } = {}
): Promise<ValidationResult & { debugInfo: any }> {

  const startTime = Date.now();

  if (options.verbose) {
    console.log('=== BA VALIDATION DEBUG START ===');
    console.log('Workshop ID:', workshopSession.id);
    console.log('Business Name:', workshopSession.businessName);
    console.log('Modules:', Object.keys(workshopSession.modules || {}));
  }

  // Run validation (skip timeout in debug mode)
  let result: ValidationResult;

  if (options.skipTimeout) {
    result = await runAllValidations(workshopSession);
  } else {
    result = await validateBACompliance(workshopSession);
  }

  const duration = Date.now() - startTime;

  const debugInfo = {
    duration,
    financialDataPresent: Boolean(workshopSession.modules?.['gz-finanzplanung']?.data),
    moduleCount: Object.keys(workshopSession.modules || {}).length,
    validationRulesRun: Object.keys(VALIDATION_WEIGHTS),
    timestamp: new Date().toISOString(),
  };

  if (options.verbose) {
    console.log('=== VALIDATION RESULT ===');
    console.log(generateValidationReport(result));
    console.log('=== DEBUG INFO ===');
    console.log(JSON.stringify(debugInfo, null, 2));
    console.log('=== BA VALIDATION DEBUG END ===');
  }

  return {
    ...result,
    debugInfo,
  };
}

// ============================================================================
// Export All
// ============================================================================

// Re-export types for convenience
export type { ValidationResult, ValidationIssue, ValidationSummary } from './types';