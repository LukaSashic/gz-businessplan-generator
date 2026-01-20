/**
 * BA Compliance Validation Types (GZ-803)
 *
 * TypeScript interfaces for the Bundesagentur für Arbeit compliance validation system.
 * These types ensure business plans meet exact BA requirements before export.
 *
 * Based on analysis of real BA-approved business plan template.
 */

// ============================================================================
// Core Validation Types
// ============================================================================

export interface ValidationIssue {
  id: string;
  severity: 'BLOCKER' | 'WARNING';
  category: 'financial' | 'structure' | 'content' | 'formatting';
  title: string;
  message: string;                    // Detailed German error message
  affectedSection?: string;          // Module that needs fixing
  suggestedFix?: string;             // How to resolve it
  documentationLink?: string;        // Link to help docs
  detectedValues?: Record<string, any>; // The problematic values
}

export interface ValidationResult {
  passed: boolean;                   // True if no blockers
  blockers: ValidationIssue[];       // Critical issues (export blocked)
  warnings: ValidationIssue[];       // Non-critical issues (export allowed)
  summary: ValidationSummary;
}

export interface ValidationSummary {
  totalChecks: number;
  passedChecks: number;
  failedBlockers: number;
  totalWarnings: number;
  canExport: boolean;                // False if any blockers present
  overallScore: number;              // 0-100 compliance score
}

// ============================================================================
// Financial Validation Specific Types
// ============================================================================

export interface FinancialValidationData {
  // Month 6 self-sufficiency check
  month6Profit: number;              // Ergebnis nach Steuern in month 6
  privatentnahme: number;            // Monthly living costs requirement

  // Liquidity validation
  liquidityMonths: Array<{
    month: number;
    endbestand: number;              // Liquide Mittel am Monatsende
    anfangsbestand: number;
    einzahlungen: number;
    auszahlungen: number;
  }>;

  // Break-even analysis
  monthlyProfits: number[];          // 36 months of profit data
  breakEvenMonth: number | null;     // Month when profit >= 0

  // Table completeness
  hasKapitalbedarfTable: boolean;
  hasUmsatzTable: boolean;
  hasLebenshaltungskostenTable: boolean;
  hasLiquiditaetTable: boolean;

  // GZ funding check
  gzFundingMonths: number[];         // Months where GZ is shown in plan
}

export interface StructureValidationData {
  // Required sections check
  completedModules: string[];
  moduleWordCounts: Record<string, number>;

  // Source documentation
  citationCount: number;
  footnotes: string[];

  // Document structure
  hasTitlePage: boolean;
  hasTableOfContents: boolean;
  hasExecutiveSummary: boolean;
}

// ============================================================================
// Validation Rule Configuration
// ============================================================================

export interface ValidationRule {
  id: string;
  name: string;
  severity: 'BLOCKER' | 'WARNING';
  category: 'financial' | 'structure' | 'content' | 'formatting';
  description: string;

  // BA compliance rationale
  baRationale: string;               // Why this matters for BA approval
  rejectionRate?: number;            // % of applications that fail here

  // Validation thresholds
  thresholds?: {
    minValue?: number;
    maxValue?: number;
    requiredFields?: string[];
    comparison?: 'gte' | 'lte' | 'eq' | 'ne';
  };
}

// ============================================================================
// Predefined Validation Rules (Based on Template Analysis)
// ============================================================================

export const BA_VALIDATION_RULES: Record<string, ValidationRule> = {
  'month-6-self-sufficiency': {
    id: 'month-6-self-sufficiency',
    name: 'Selbstragfähigkeit Monat 6',
    severity: 'BLOCKER',
    category: 'financial',
    description: 'Gewinn in Monat 6 muss mindestens die Privatentnahme decken',
    baRationale: 'Die BA prüft, ob das Geschäft ab Monat 6 die Lebenshaltung finanzieren kann',
    rejectionRate: 35, // 30-50% of applications fail here
    thresholds: {
      comparison: 'gte',
      // minValue is dynamic (= privatentnahme)
    }
  },

  'liquidity-non-negative': {
    id: 'liquidity-non-negative',
    name: 'Liquidität niemals negativ',
    severity: 'BLOCKER',
    category: 'financial',
    description: 'Liquide Mittel müssen in allen 36 Monaten >= 0€ sein',
    baRationale: 'Negative Liquidität bedeutet Insolvenz - automatische Ablehnung',
    rejectionRate: 25,
    thresholds: {
      minValue: 0,
      comparison: 'gte',
    }
  },

  'required-sections-complete': {
    id: 'required-sections-complete',
    name: 'Alle Pflichtabschnitte vorhanden',
    severity: 'BLOCKER',
    category: 'structure',
    description: 'Alle 9 Module müssen vollständig ausgefüllt sein',
    baRationale: 'Unvollständige Businesspläne werden nicht bearbeitet',
    rejectionRate: 20,
    thresholds: {
      requiredFields: [
        'gz-intake', 'gz-geschaeftsmodell', 'gz-unternehmen',
        'gz-markt-wettbewerb', 'gz-marketing', 'gz-finanzplanung',
        'gz-swot', 'gz-meilensteine', 'gz-kpi'
      ]
    }
  },

  'financial-tables-complete': {
    id: 'financial-tables-complete',
    name: 'Finanzplanungstabellen vollständig',
    severity: 'BLOCKER',
    category: 'financial',
    description: 'Alle 4 Finanzplanungstabellen müssen komplett ausgefüllt sein',
    baRationale: 'BA benötigt vollständige 36-Monats-Finanzplanung',
    rejectionRate: 15,
    thresholds: {
      requiredFields: [
        'kapitalbedarfsplanung',
        'umsatz-rentabilitaetsplanung',
        'lebenshaltungskosten',
        'liquiditaetsplanung'
      ]
    }
  },

  'break-even-reasonable': {
    id: 'break-even-reasonable',
    name: 'Break-Even innerhalb 18 Monaten',
    severity: 'WARNING',
    category: 'financial',
    description: 'Profitabilität sollte spätestens in Monat 18 erreicht werden',
    baRationale: 'BA ist skeptisch bei Geschäften, die > 18 Monate bis zur Profitabilität brauchen',
    rejectionRate: 5, // Soft rejection - questions but not automatic no
    thresholds: {
      maxValue: 18,
      comparison: 'lte',
    }
  },

  'sources-documented': {
    id: 'sources-documented',
    name: 'Mindestens 5 Quellenangaben',
    severity: 'WARNING',
    category: 'structure',
    description: 'Marktdaten und Annahmen sollten mit Quellen belegt werden',
    baRationale: 'BA prüft Fundierung der Marktanalyse und Wettbewerbsbetrachtung',
    rejectionRate: 8,
    thresholds: {
      minValue: 5,
      comparison: 'gte',
    }
  },

  'gz-funding-included': {
    id: 'gz-funding-included',
    name: 'Gründungszuschuss in Finanzplanung',
    severity: 'WARNING',
    category: 'financial',
    description: 'GZ-Förderung sollte in der Liquiditätsplanung aufgeführt sein',
    baRationale: 'Zeigt der BA, dass GZ in die Finanzplanung einkalkuliert wurde',
    rejectionRate: 3,
    thresholds: {
      minValue: 6, // Should appear in at least 6 months (Phase 1)
      comparison: 'gte',
    }
  },
};

// ============================================================================
// Helper Types for Rule Processing
// ============================================================================

export interface RuleContext {
  workshopData: any;                 // Full workshop state
  financialData: FinancialValidationData;
  structureData: StructureValidationData;
}

export interface RuleResult {
  passed: boolean;
  rule: ValidationRule;
  issue?: ValidationIssue;           // Only present if failed
  metadata?: Record<string, any>;    // Additional context
}

// ============================================================================
// German Currency Formatting Utilities
// ============================================================================

/**
 * Format currency in German standard: 1.234,56 €
 */
export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return '0,00 €';
  }

  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
}

/**
 * Format percentage in German standard: 15,5%
 */
export function formatPercentage(value: number): string {
  if (isNaN(value)) {
    return '0,0%';
  }

  return new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
}

/**
 * Format month reference: "Monat 6"
 */
export function formatMonth(monthNumber: number): string {
  return `Monat ${monthNumber}`;
}

/**
 * Format duration: "18 Monate"
 */
export function formatDuration(months: number): string {
  if (months === 1) {
    return '1 Monat';
  }
  return `${months} Monate`;
}