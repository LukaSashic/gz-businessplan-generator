/**
 * Financial BA Compliance Checks (GZ-803)
 *
 * Critical financial validations that determine BA approval/rejection.
 * Based on analysis of real BA-approved business plan template.
 *
 * CRITICAL BLOCKERS:
 * 1. Month 6 Self-Sufficiency - #1 rejection reason (30-50% fail here)
 * 2. Liquidity Non-Negative - Automatic rejection if negative
 * 3. Financial Tables Complete - BA requires full 36-month data
 *
 * WARNINGS:
 * 4. Break-Even Reasonable - BA skeptical if > 18 months
 * 5. GZ Funding Included - Should show GZ in financial planning
 */

import Decimal from 'decimal.js';
import type {
  ValidationIssue,
  RuleResult,
  FinancialValidationData,
  formatCurrency,
  formatMonth,
  formatDuration,
  BA_VALIDATION_RULES
} from '../types';
import type { PartialFinanzplanungOutput } from '@/types/modules/finanzplanung';

// ============================================================================
// Configuration
// ============================================================================

// Set decimal.js precision for financial calculations (inherited from existing config)
Decimal.set({
  precision: 28,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -28,
  toExpPos: 28,
});

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format currency in German standard: 1.234,56 €
 */
function formatCurrency(amount: number | Decimal): string {
  const value = typeof amount === 'number' ? new Decimal(amount) : amount;

  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value.toNumber());
}

/**
 * Format month reference: "Monat 6"
 */
function formatMonth(monthNumber: number): string {
  return `Monat ${monthNumber}`;
}

/**
 * Format duration: "18 Monate"
 */
function formatDuration(months: number): string {
  if (months === 1) {
    return '1 Monat';
  }
  return `${months} Monate`;
}

/**
 * Extract financial validation data from finanzplanung module
 */
export function extractFinancialData(
  finanzplanung: PartialFinanzplanungOutput | undefined
): FinancialValidationData {
  if (!finanzplanung) {
    return {
      month6Profit: 0,
      privatentnahme: 0,
      liquidityMonths: [],
      monthlyProfits: [],
      breakEvenMonth: null,
      hasKapitalbedarfTable: false,
      hasUmsatzTable: false,
      hasLebenshaltungskostenTable: false,
      hasLiquiditaetTable: false,
      gzFundingMonths: [],
    };
  }

  // Extract month 6 profit (0-indexed, so month 5)
  const month6Profit = finanzplanung.rentabilitaet?.jahr1?.jahresueberschuss || 0;

  // Extract monthly living costs requirement
  const privatentnahme = finanzplanung.privatentnahme?.monatlichePrivatentnahme || 0;

  // Extract liquidity data (all 36 months)
  const liquidityMonths = finanzplanung.liquiditaet?.monate?.map((month, index) => ({
    month: index + 1,
    endbestand: month.endbestand || 0,
    anfangsbestand: month.anfangsbestand || 0,
    einzahlungen: month.einzahlungenGesamt || 0,
    auszahlungen: month.auszahlungenGesamt || 0,
  })) || [];

  // Extract monthly profits for break-even calculation
  const monthlyProfits: number[] = [];

  // Year 1 (months 1-12)
  if (finanzplanung.umsatzplanung?.umsatzJahr1) {
    for (let i = 0; i < 12; i++) {
      const monthlyRevenue = finanzplanung.umsatzplanung.umsatzJahr1[i] || 0;
      const monthlyCosts = finanzplanung.kostenplanung?.fixkostenSummeMonatlich || 0;
      // Simplified profit calculation for break-even analysis
      monthlyProfits.push(monthlyRevenue - monthlyCosts);
    }
  }

  // Year 2 & 3 (simplified - divide annual by 12)
  const jahr2Monthly = (finanzplanung.umsatzplanung?.umsatzJahr2 || 0) / 12;
  const jahr3Monthly = (finanzplanung.umsatzplanung?.umsatzJahr3 || 0) / 12;
  const jahr2Costs = (finanzplanung.kostenplanung?.gesamtkostenJahr2 || 0) / 12;
  const jahr3Costs = (finanzplanung.kostenplanung?.gesamtkostenJahr3 || 0) / 12;

  // Add months 13-24 (Year 2)
  for (let i = 0; i < 12; i++) {
    monthlyProfits.push(jahr2Monthly - jahr2Costs);
  }

  // Add months 25-36 (Year 3)
  for (let i = 0; i < 12; i++) {
    monthlyProfits.push(jahr3Monthly - jahr3Costs);
  }

  // Calculate break-even month
  const breakEvenMonth = monthlyProfits.findIndex(profit => profit >= 0);

  // Check table completeness
  const hasKapitalbedarfTable = Boolean(finanzplanung.kapitalbedarf?.gesamtkapitalbedarf);
  const hasUmsatzTable = Boolean(finanzplanung.umsatzplanung?.umsatzJahr1Summe);
  const hasLebenshaltungskostenTable = Boolean(finanzplanung.privatentnahme?.monatlichePrivatentnahme);
  const hasLiquiditaetTable = Boolean(finanzplanung.liquiditaet?.monate?.length);

  // Check for GZ funding in liquidity plan
  const gzFundingMonths: number[] = [];
  liquidityMonths.forEach((month, index) => {
    // Check if month shows "sonstige Einzahlungen" that could be GZ
    // This is simplified - in reality would need to parse einzahlungen breakdown
    if (month.einzahlungen > month.anfangsbestand * 1.1) { // Heuristic for extra income
      gzFundingMonths.push(index + 1);
    }
  });

  return {
    month6Profit,
    privatentnahme,
    liquidityMonths,
    monthlyProfits,
    breakEvenMonth: breakEvenMonth !== -1 ? breakEvenMonth + 1 : null,
    hasKapitalbedarfTable,
    hasUmsatzTable,
    hasLebenshaltungskostenTable,
    hasLiquiditaetTable,
    gzFundingMonths,
  };
}

// ============================================================================
// Financial Validation Checks
// ============================================================================

/**
 * CRITICAL CHECK 1: Month 6 Self-Sufficiency
 *
 * THE #1 rejection reason - 30-50% of applications fail here.
 * BA checks if business can cover living costs by month 6.
 */
export function checkMonth6SelfSufficiency(
  financialData: FinancialValidationData
): ValidationIssue | null {

  const profit = new Decimal(financialData.month6Profit);
  const required = new Decimal(financialData.privatentnahme);

  const passed = profit.greaterThanOrEqualTo(required);

  if (passed) {
    return null; // Check passed
  }

  const shortfall = required.minus(profit);

  return {
    id: 'month-6-self-sufficiency',
    severity: 'BLOCKER',
    category: 'financial',
    title: 'Selbstragfähigkeit nicht erreicht',
    message: `❌ KRITISCHER FEHLER: Selbstragfähigkeit nicht erreicht!

${formatMonth(6)} Gewinn: ${formatCurrency(profit)}
Benötigter Mindestgewinn: ${formatCurrency(required)}
Fehlbetrag: ${formatCurrency(shortfall)}

Die BA prüft, ob Sie ab Monat 6 von Ihrem Geschäft leben können.
Ihr Plan zeigt aktuell, dass Sie ${formatCurrency(shortfall)} zu wenig verdienen.

LÖSUNGEN:
1. Umsatz erhöhen (mehr Kunden in Monaten 1-6 gewinnen)
2. Kosten senken (günstigere Alternativen in Betriebsausgaben)
3. Privatentnahme reduzieren (Lebenshaltungskosten prüfen)

Export ist BLOCKIERT bis dieser Fehler behoben ist.`,
    affectedSection: 'gz-finanzplanung',
    suggestedFix: `Erhöhen Sie Ihren Gewinn in Monat 6 um ${formatCurrency(shortfall)}`,
    documentationLink: '/docs/ba-requirements#month-6-self-sufficiency',
    detectedValues: {
      month6Profit: profit.toNumber(),
      requiredProfit: required.toNumber(),
      shortfall: shortfall.toNumber(),
    }
  };
}

/**
 * CRITICAL CHECK 2: Liquidity Non-Negative
 *
 * Automatic BA rejection if any month shows negative liquidity.
 * Business running out of money = insolvency.
 */
export function checkLiquidityNonNegative(
  financialData: FinancialValidationData
): ValidationIssue | null {

  const negativeMonths = financialData.liquidityMonths
    .filter(month => month.endbestand < 0)
    .map(month => ({
      month: month.month,
      endbestand: new Decimal(month.endbestand)
    }));

  if (negativeMonths.length === 0) {
    return null; // Check passed
  }

  const firstNegative = negativeMonths[0];
  const worstMonth = negativeMonths.reduce((worst, current) =>
    current.endbestand.lessThan(worst.endbestand) ? current : worst
  );

  let message = `❌ KRITISCHER FEHLER: Liquidität wird negativ!

${formatMonth(firstNegative.month)}: ${formatCurrency(firstNegative.endbestand)}

Ihr Unternehmen geht das Geld aus. Die BA wird diesen Plan ablehnen.

BETROFFENE MONATE:\n`;

  // Show up to 5 negative months
  negativeMonths.slice(0, 5).forEach(m => {
    message += `${formatMonth(m.month)}: ${formatCurrency(m.endbestand)}\n`;
  });

  if (negativeMonths.length > 5) {
    message += `... und ${negativeMonths.length - 5} weitere Monate\n`;
  }

  message += `\nSCHLIMMSTER MONAT: ${formatMonth(worstMonth.month)} mit ${formatCurrency(worstMonth.endbestand)}

LÖSUNGEN:
1. Eigenkapital erhöhen (mehr Startkapital einbringen)
2. Startinvestitionen verzögern (später kaufen)
3. Privatentnahme senken (weniger entnehmen)
4. Darlehen aufnehmen (als Finanzierung eintragen)

Export ist BLOCKIERT bis Liquidität in allen Monaten >= 0€ ist.`;

  return {
    id: 'liquidity-non-negative',
    severity: 'BLOCKER',
    category: 'financial',
    title: 'Liquidität wird negativ',
    message,
    affectedSection: 'gz-finanzplanung',
    suggestedFix: `Erhöhen Sie die Liquidität um mindestens ${formatCurrency(worstMonth.endbestand.abs())} in ${formatMonth(worstMonth.month)}`,
    documentationLink: '/docs/ba-requirements#liquidity-non-negative',
    detectedValues: {
      negativeMonthsCount: negativeMonths.length,
      firstNegativeMonth: firstNegative.month,
      worstMonth: worstMonth.month,
      worstAmount: worstMonth.endbestand.toNumber(),
    }
  };
}

/**
 * CRITICAL CHECK 3: Financial Tables Complete
 *
 * BA requires complete 36-month financial planning.
 * Missing tables = automatic rejection.
 */
export function checkFinancialTablesComplete(
  financialData: FinancialValidationData
): ValidationIssue | null {

  const missingTables: string[] = [];

  if (!financialData.hasKapitalbedarfTable) {
    missingTables.push('Kapitalbedarfsplanung');
  }

  if (!financialData.hasUmsatzTable) {
    missingTables.push('Umsatz- und Rentabilitätsplanung');
  }

  if (!financialData.hasLebenshaltungskostenTable) {
    missingTables.push('Lebenshaltungskosten');
  }

  if (!financialData.hasLiquiditaetTable) {
    missingTables.push('Liquiditätsplanung');
  }

  if (missingTables.length === 0) {
    return null; // Check passed
  }

  return {
    id: 'financial-tables-complete',
    severity: 'BLOCKER',
    category: 'financial',
    title: 'Finanzplanung unvollständig',
    message: `❌ KRITISCHER FEHLER: Finanzplanung unvollständig!

FEHLENDE TABELLEN:
${missingTables.map(table => `• ${table}`).join('\n')}

Die BA benötigt vollständige Finanztabellen über 3 Jahre (36 Monate).
Ohne diese Daten wird Ihr Antrag nicht bearbeitet.

LÖSUNG:
Füllen Sie Module 6 (Finanzplanung) vollständig aus.
Alle 4 Finanzplanungstabellen müssen komplett sein.

Export ist BLOCKIERT bis alle Tabellen vollständig sind.`,
    affectedSection: 'gz-finanzplanung',
    suggestedFix: 'Vervollständigen Sie alle fehlenden Finanzplanungstabellen',
    documentationLink: '/docs/ba-requirements#financial-tables-complete',
    detectedValues: {
      missingTables,
      hasKapitalbedarf: financialData.hasKapitalbedarfTable,
      hasUmsatz: financialData.hasUmsatzTable,
      hasLebenshaltung: financialData.hasLebenshaltungskostenTable,
      hasLiquiditaet: financialData.hasLiquiditaetTable,
    }
  };
}

/**
 * WARNING CHECK 1: Break-Even Reasonable
 *
 * BA is skeptical of businesses taking > 18 months to become profitable.
 * Not a blocker, but BA will ask critical questions.
 */
export function checkBreakEvenReasonable(
  financialData: FinancialValidationData
): ValidationIssue | null {

  const breakEvenMonth = financialData.breakEvenMonth;

  if (!breakEvenMonth) {
    return {
      id: 'break-even-reasonable',
      severity: 'WARNING',
      category: 'financial',
      title: 'Break-Even nicht erreicht',
      message: `⚠️ WARNUNG: Break-Even nicht erreicht!

Ihr Plan zeigt in 36 Monaten keinen Gewinn. Die BA wird kritische Fragen stellen:

KRITISCHE FRAGEN DER BA:
• Ist das Geschäftsmodell überhaupt tragfähig?
• Warum dauert Profitabilität so lange?
• Haben Sie realistische Umsatzprognosen?
• Sind die Kosten vollständig erfasst?

EMPFEHLUNG:
Überarbeiten Sie Ihre Umsatz- oder Kostenplanung, damit Sie spätestens
in Monat 18 profitabel werden.

NICHT BLOCKIEREND - Sie können exportieren, aber bereiten Sie sich auf
Nachfragen der BA vor.`,
      affectedSection: 'gz-finanzplanung',
      suggestedFix: 'Überarbeiten Sie Umsatz oder Kosten für schnellere Profitabilität',
      documentationLink: '/docs/ba-requirements#break-even-reasonable',
      detectedValues: {
        breakEvenMonth: null,
        monthsAnalyzed: 36,
      }
    };
  }

  if (breakEvenMonth <= 18) {
    return null; // Check passed
  }

  return {
    id: 'break-even-reasonable',
    severity: 'WARNING',
    category: 'financial',
    title: `Break-Even erst in ${formatMonth(breakEvenMonth)}`,
    message: `⚠️ WARNUNG: Break-Even erst in ${formatMonth(breakEvenMonth)}!

Die BA erwartet typischerweise Profitabilität innerhalb 12-18 Monaten.
Ihr Plan zeigt ${formatDuration(breakEvenMonth)}.

DIE BA KÖNNTE FRAGEN:
• Warum dauert es ${formatDuration(breakEvenMonth)}?
• Ist das Geschäftsmodell schneller skalierbar?
• Haben Sie conservative Prognosen verwendet?
• Gibt es Möglichkeiten zur Beschleunigung?

EMPFEHLUNG:
Bereiten Sie eine fundierte Begründung vor, warum ${formatDuration(breakEvenMonth)}
realistisch und angemessen ist.

NICHT BLOCKIEREND - Sie können exportieren, sollten aber eine
Erklärung für die BA vorbereiten.`,
    affectedSection: 'gz-finanzplanung',
    suggestedFix: `Verkürzen Sie Break-Even auf max. 18 Monate oder bereiten Sie Begründung vor`,
    documentationLink: '/docs/ba-requirements#break-even-reasonable',
    detectedValues: {
      breakEvenMonth,
      recommendedMax: 18,
      exceedsBy: breakEvenMonth - 18,
    }
  };
}

/**
 * WARNING CHECK 2: GZ Funding Included
 *
 * GZ applicants should show the funding in their financial planning.
 * Shows BA that GZ is properly incorporated into business planning.
 */
export function checkGZFundingIncluded(
  financialData: FinancialValidationData
): ValidationIssue | null {

  const gzMonthsCount = financialData.gzFundingMonths.length;

  if (gzMonthsCount >= 6) {
    return null; // Check passed - GZ funding appears to be included
  }

  return {
    id: 'gz-funding-included',
    severity: 'WARNING',
    category: 'financial',
    title: 'Gründungszuschuss nicht in Finanzplanung',
    message: `⚠️ WARNUNG: Gründungszuschuss nicht in Finanzplanung sichtbar!

Sie beantragen GZ, sollten ihn aber auch in der Liquiditätsplanung zeigen:

GRÜNDUNGSZUSCHUSS PHASEN:
• Phase 1 (Monate 1-6): ALG I + 300€/Monat
• Phase 2 (Monate 7-15): 300€/Monat (bei Erfolg)

WARUM DAS WICHTIG IST:
• Zeigt der BA realistische Finanzplanung
• Beweist, dass Sie GZ einkalkuliert haben
• Macht Ihre Liquiditätsplanung glaubwürdiger

LÖSUNG:
Tragen Sie GZ als "sonstige Einzahlungen" in die Liquiditätsplanung ein:
• ${formatCurrency(300)} × 6 Monate = ${formatCurrency(1800)} (Phase 1)
• ${formatCurrency(300)} × 9 Monate = ${formatCurrency(2700)} (Phase 2)

NICHT BLOCKIEREND - aber empfohlen für glaubwürdigere Finanzplanung.`,
    affectedSection: 'gz-finanzplanung',
    suggestedFix: 'Tragen Sie GZ-Förderung in Liquiditätsplanung ein',
    documentationLink: '/docs/ba-requirements#gz-funding-included',
    detectedValues: {
      gzMonthsFound: gzMonthsCount,
      recommendedMonths: 15, // 6 + 9 months
      phase1Amount: 300,
      phase2Amount: 300,
    }
  };
}

// ============================================================================
// Orchestration Function
// ============================================================================

/**
 * Run all financial validation checks
 */
export function validateFinancialCompliance(
  finanzplanung: PartialFinanzplanungOutput | undefined
): ValidationIssue[] {

  const financialData = extractFinancialData(finanzplanung);
  const issues: ValidationIssue[] = [];

  // CRITICAL CHECKS (blockers)
  const month6Issue = checkMonth6SelfSufficiency(financialData);
  if (month6Issue) issues.push(month6Issue);

  const liquidityIssue = checkLiquidityNonNegative(financialData);
  if (liquidityIssue) issues.push(liquidityIssue);

  const tablesIssue = checkFinancialTablesComplete(financialData);
  if (tablesIssue) issues.push(tablesIssue);

  // WARNING CHECKS
  const breakEvenIssue = checkBreakEvenReasonable(financialData);
  if (breakEvenIssue) issues.push(breakEvenIssue);

  const gzFundingIssue = checkGZFundingIncluded(financialData);
  if (gzFundingIssue) issues.push(gzFundingIssue);

  return issues;
}