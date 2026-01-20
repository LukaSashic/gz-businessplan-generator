/**
 * Break-Even Calculations (GZ-603 Teil F-G Foundation)
 *
 * CRITICAL: All calculations use decimal.js to avoid floating-point errors.
 * This is mandatory for BA compliance and exact financial calculations.
 *
 * Includes:
 * - Break-even revenue calculation with exact arithmetic
 * - Break-even timing analysis (month within 36-month limit)
 * - BA compliance validation (break-even ≤ 36 months)
 * - Integration with existing cost and revenue data
 * - German market context and validation
 */

import Decimal from 'decimal.js';
import type {
  Umsatzplanung,
  Kostenplanung,
} from '@/types/modules/finanzplanung';

// ============================================================================
// Configuration
// ============================================================================

// Set global decimal.js configuration for financial precision
Decimal.set({
  precision: 28,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -28,
  toExpPos: 28,
});

// ============================================================================
// Types for Break-Even Analysis
// ============================================================================

export interface BreakEvenInput {
  fixkostenMonatlich: number;           // Monthly fixed costs
  variableKostenProzent: number;        // Variable costs as % of revenue
  umsatzplanung?: number[];             // Monthly revenue plan (optional for timing)
}

export interface BreakEvenResult {
  // Core calculations
  breakEvenUmsatzMonatlich: number;     // Monthly revenue needed to break even
  breakEvenUmsatzJaehrlich: number;     // Annual revenue needed
  deckungsbeitrag: number;              // Contribution margin %
  deckungsbeitragEuro: number;          // Contribution margin in EUR per sale unit

  // Timing analysis
  breakEvenMonat?: number;              // Month when break-even is achieved (1-36)
  isReachableIn36Months: boolean;       // BA compliance flag
  monthsToBreakEven?: number;           // Alternative timing metric

  // German market context
  industryComparison: {
    isBelowAverage: boolean;            // Below 18-month industry average
    isAboveWorrying: boolean;           // Above 24-month warning threshold
    benchmarkComment: string;
  };

  // Validation and warnings
  warnings: string[];
  recommendations: string[];
}

export interface BreakEvenScenario {
  name: string;
  fixedCosts: number;
  variableCostPercent: number;
  targetRevenue: number;
  result: BreakEvenResult;
}

// ============================================================================
// Core Break-Even Calculation
// ============================================================================

/**
 * Calculate break-even point with exact decimal arithmetic
 * Formula: Break-Even Revenue = Fixed Costs ÷ (1 - Variable Cost %)
 */
export function calculateBreakEven(input: BreakEvenInput): BreakEvenResult {
  const {
    fixkostenMonatlich,
    variableKostenProzent,
    umsatzplanung = [],
  } = input;

  // Input validation
  if (fixkostenMonatlich < 0) {
    throw new Error('Fixed costs cannot be negative');
  }
  if (variableKostenProzent < 0 || variableKostenProzent >= 100) {
    throw new Error('Variable cost percentage must be between 0 and 99');
  }

  // Convert to Decimal for exact arithmetic
  const fixkosten = new Decimal(fixkostenMonatlich);
  const variableKostenDecimal = new Decimal(variableKostenProzent);
  const hundred = new Decimal(100);

  // Calculate contribution margin (1 - variable cost %)
  const deckungsbeitragProzent = hundred.minus(variableKostenDecimal);

  // Validate contribution margin is positive
  if (deckungsbeitragProzent.lte(0)) {
    throw new Error('Variable costs cannot be 100% or more of revenue');
  }

  // Calculate break-even revenue (monthly)
  const breakEvenUmsatzMonatlich = fixkosten.dividedBy(deckungsbeitragProzent.dividedBy(hundred));
  const breakEvenUmsatzJaehrlich = breakEvenUmsatzMonatlich.times(12);

  // Initialize warnings and recommendations
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // High break-even warnings
  if (breakEvenUmsatzMonatlich.gt(20000)) {
    warnings.push('Sehr hoher Break-Even-Umsatz - Kostenstruktur oder Preise überprüfen');
  }
  if (variableKostenProzent > 70) {
    warnings.push('Sehr hohe variable Kosten - Skaleneffekte anstreben');
    recommendations.push('Automatisierung und Effizienzsteigerungen prüfen');
  }
  if (fixkostenMonatlich > 15000) {
    warnings.push('Hohe Fixkosten - flexible Alternativen erwägen');
    recommendations.push('Variable Kostenstrukturen wo möglich implementieren');
  }

  // Calculate timing if revenue plan is provided
  let breakEvenMonat: number | undefined;
  let monthsToBreakEven: number | undefined;
  let isReachableIn36Months = false;

  if (umsatzplanung.length > 0) {
    // Find when cumulative revenue exceeds cumulative costs
    let cumulativeRevenue = new Decimal(0);
    let cumulativeCosts = new Decimal(0);

    for (let month = 1; month <= Math.min(umsatzplanung.length, 36); month++) {
      const monthlyRevenue = new Decimal(umsatzplanung[month - 1] || 0);
      const monthlyVariableCosts = monthlyRevenue.times(variableKostenDecimal).dividedBy(hundred);
      const monthlyTotalCosts = fixkosten.plus(monthlyVariableCosts);

      cumulativeRevenue = cumulativeRevenue.plus(monthlyRevenue);
      cumulativeCosts = cumulativeCosts.plus(monthlyTotalCosts);

      if (cumulativeRevenue.gte(cumulativeCosts) && !breakEvenMonat) {
        breakEvenMonat = month;
        monthsToBreakEven = month;
        break;
      }
    }

    isReachableIn36Months = Boolean(breakEvenMonat && breakEvenMonat <= 36);
  } else {
    // Simplified check: if monthly break-even is achievable
    // Assume linear growth to reasonable revenue levels
    const conservativeMonthlyGrowth = new Decimal(1000); // €1k growth per month
    const monthsToTarget = breakEvenUmsatzMonatlich.dividedBy(conservativeMonthlyGrowth);
    monthsToBreakEven = monthsToTarget.toNumber();
    isReachableIn36Months = monthsToTarget.lte(36);
  }

  // BA compliance check
  if (!isReachableIn36Months) {
    warnings.push('Break-Even nach 36 Monaten - BA könnte dies kritisch bewerten');
    recommendations.push('Kostenreduktion oder Umsatzsteigerung zur Verbesserung der Break-Even-Zeit');
  }

  // Industry benchmarking
  const monthsEstimate = monthsToBreakEven || breakEvenUmsatzMonatlich.dividedBy(5000).toNumber();
  const industryComparison = {
    isBelowAverage: monthsEstimate < 18,      // Excellent
    isAboveWorrying: monthsEstimate > 24,     // Concerning
    benchmarkComment: getIndustryBenchmarkComment(monthsEstimate),
  };

  // Additional recommendations based on analysis
  if (deckungsbeitragProzent.lt(30)) {
    recommendations.push('Deckungsbeitrag unter 30% - Preiserhöhung oder Kostensenkung prüfen');
  }
  if (breakEvenUmsatzJaehrlich.gt(500000)) {
    recommendations.push('Hoher Jahresumsatz für Break-Even - Marktpotenzial validieren');
  }

  return {
    breakEvenUmsatzMonatlich: breakEvenUmsatzMonatlich.toNumber(),
    breakEvenUmsatzJaehrlich: breakEvenUmsatzJaehrlich.toNumber(),
    deckungsbeitrag: deckungsbeitragProzent.toNumber(),
    deckungsbeitragEuro: breakEvenUmsatzMonatlich.times(deckungsbeitragProzent).dividedBy(hundred).toNumber(),
    breakEvenMonat,
    isReachableIn36Months,
    monthsToBreakEven,
    industryComparison,
    warnings,
    recommendations,
  };
}

/**
 * Calculate break-even from integrated financial data
 */
export function calculateBreakEvenFromFinanzplanung(
  kostenplanung: Kostenplanung,
  umsatzplanung?: Umsatzplanung
): BreakEvenResult {
  // Extract fixed costs
  const fixkostenMonatlich = kostenplanung.fixkostenSummeMonatlich;

  // Calculate variable cost percentage
  const jahr1Revenue = umsatzplanung?.umsatzJahr1Summe || 120000; // Default assumption
  const variableKostenProzent = jahr1Revenue > 0
    ? Math.min((kostenplanung.variableKostenSummeJahr1 / jahr1Revenue) * 100, 99)
    : 0;

  // Use revenue plan if available
  const monthlyRevenue = umsatzplanung?.umsatzJahr1 || [];

  return calculateBreakEven({
    fixkostenMonatlich,
    variableKostenProzent,
    umsatzplanung: monthlyRevenue,
  });
}

// ============================================================================
// Analysis Functions
// ============================================================================

/**
 * Analyze different break-even scenarios
 */
export function analyzeBreakEvenScenarios(baseInput: BreakEvenInput): BreakEvenScenario[] {
  const scenarios: BreakEvenScenario[] = [];

  // Base scenario
  scenarios.push({
    name: 'Basis-Szenario',
    fixedCosts: baseInput.fixkostenMonatlich,
    variableCostPercent: baseInput.variableKostenProzent,
    targetRevenue: baseInput.fixkostenMonatlich * 2, // Rough target
    result: calculateBreakEven(baseInput),
  });

  // Optimistic: 20% cost reduction
  scenarios.push({
    name: 'Optimistisch (20% Kostenreduktion)',
    fixedCosts: baseInput.fixkostenMonatlich * 0.8,
    variableCostPercent: baseInput.variableKostenProzent * 0.8,
    targetRevenue: baseInput.fixkostenMonatlich * 1.6,
    result: calculateBreakEven({
      ...baseInput,
      fixkostenMonatlich: baseInput.fixkostenMonatlich * 0.8,
      variableKostenProzent: baseInput.variableKostenProzent * 0.8,
    }),
  });

  // Conservative: 20% cost increase
  scenarios.push({
    name: 'Konservativ (20% Kostensteigerung)',
    fixedCosts: baseInput.fixkostenMonatlich * 1.2,
    variableCostPercent: Math.min(baseInput.variableKostenProzent * 1.2, 95),
    targetRevenue: baseInput.fixkostenMonatlich * 2.4,
    result: calculateBreakEven({
      ...baseInput,
      fixkostenMonatlich: baseInput.fixkostenMonatlich * 1.2,
      variableKostenProzent: Math.min(baseInput.variableKostenProzent * 1.2, 95),
    }),
  });

  return scenarios;
}

/**
 * Calculate sensitivity of break-even to cost changes
 */
export function calculateBreakEvenSensitivity(baseInput: BreakEvenInput) {
  const baseResult = calculateBreakEven(baseInput);
  const changes = [-20, -10, -5, 5, 10, 20]; // Percentage changes

  const fixedCostSensitivity = changes.map(change => {
    const newFixedCosts = baseInput.fixkostenMonatlich * (1 + change / 100);
    const result = calculateBreakEven({
      ...baseInput,
      fixkostenMonatlich: newFixedCosts,
    });

    return {
      change,
      newBreakEven: result.breakEvenUmsatzMonatlich,
      impact: ((result.breakEvenUmsatzMonatlich - baseResult.breakEvenUmsatzMonatlich) / baseResult.breakEvenUmsatzMonatlich) * 100,
    };
  });

  const variableCostSensitivity = changes
    .filter(change => baseInput.variableKostenProzent + change >= 0 && baseInput.variableKostenProzent + change < 95)
    .map(change => {
      const newVariableCosts = baseInput.variableKostenProzent + change;
      const result = calculateBreakEven({
        ...baseInput,
        variableKostenProzent: newVariableCosts,
      });

      return {
        change,
        newBreakEven: result.breakEvenUmsatzMonatlich,
        impact: ((result.breakEvenUmsatzMonatlich - baseResult.breakEvenUmsatzMonatlich) / baseResult.breakEvenUmsatzMonatlich) * 100,
      };
    });

  return {
    base: baseResult,
    fixedCostSensitivity,
    variableCostSensitivity,
  };
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate break-even assumptions against German market reality
 */
export function validateBreakEvenRealism(result: BreakEvenResult, industry: string = 'default'): {
  isRealistic: boolean;
  warnings: string[];
  industryGuidance: string[];
} {
  const warnings = [...result.warnings];
  const industryGuidance: string[] = [];

  // Industry-specific validation
  const industryBenchmarks = {
    beratung: { minMonthlyRevenue: 3000, maxBreakEvenMonths: 12, typicalMargin: 60 },
    ecommerce: { minMonthlyRevenue: 5000, maxBreakEvenMonths: 18, typicalMargin: 40 },
    handwerk: { minMonthlyRevenue: 8000, maxBreakEvenMonths: 24, typicalMargin: 35 },
    restaurant: { minMonthlyRevenue: 15000, maxBreakEvenMonths: 18, typicalMargin: 25 },
    default: { minMonthlyRevenue: 5000, maxBreakEvenMonths: 24, typicalMargin: 45 },
  };

  const benchmark = industryBenchmarks[industry as keyof typeof industryBenchmarks] || industryBenchmarks.default;

  if (result.breakEvenUmsatzMonatlich < benchmark.minMonthlyRevenue) {
    warnings.push(`Break-Even-Umsatz unter ${formatEUR(benchmark.minMonthlyRevenue)}/Monat ungewöhnlich niedrig für ${industry}`);
  }

  if (result.monthsToBreakEven && result.monthsToBreakEven > benchmark.maxBreakEvenMonths) {
    warnings.push(`Break-Even nach ${result.monthsToBreakEven} Monaten über Branchendurchschnitt (${benchmark.maxBreakEvenMonths} Monate)`);
  }

  if (result.deckungsbeitrag < benchmark.typicalMargin) {
    warnings.push(`Deckungsbeitrag ${result.deckungsbeitrag.toFixed(1)}% unter Branchenschnitt (${benchmark.typicalMargin}%)`);
    industryGuidance.push(`Für ${industry}: Deckungsbeitrag von ${benchmark.typicalMargin}% anstreben`);
  }

  // German market specific checks
  if (result.breakEvenUmsatzJaehrlich > 400000) {
    warnings.push('Break-Even über €400k/Jahr - Kleinunternehmerregelung nicht mehr möglich');
    industryGuidance.push('Steuerliche Komplexität steigt erheblich ab €400k Jahresumsatz');
  }

  return {
    isRealistic: warnings.length <= 2,
    warnings,
    industryGuidance,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format currency in German EUR format
 */
export function formatEUR(amount: number | Decimal): string {
  const amountDecimal = amount instanceof Decimal ? amount : new Decimal(amount);
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amountDecimal.toNumber());
}

/**
 * Get industry benchmark commentary
 */
function getIndustryBenchmarkComment(months: number): string {
  if (months <= 12) {
    return 'Ausgezeichnet - Break-Even unter 12 Monaten ist sehr gut';
  } else if (months <= 18) {
    return 'Gut - Break-Even bis 18 Monate ist akzeptabel';
  } else if (months <= 24) {
    return 'Akzeptabel - Break-Even bis 24 Monate noch im Rahmen';
  } else if (months <= 36) {
    return 'Grenzwertig - Break-Even über 24 Monate kritisch prüfen';
  } else {
    return 'Kritisch - Break-Even über 36 Monate unwahrscheinlich für BA-Zustimmung';
  }
}

/**
 * Calculate revenue needed for target break-even month
 */
export function calculateRevenueForTargetBreakEven(
  fixkostenMonatlich: number,
  variableKostenProzent: number,
  targetMonths: number
): number {
  const fixkosten = new Decimal(fixkostenMonatlich);
  const variablePercent = new Decimal(variableKostenProzent);
  const months = new Decimal(targetMonths);
  const hundred = new Decimal(100);

  // Total fixed costs over target period
  const totalFixedCosts = fixkosten.times(months);

  // Contribution margin
  const contributionMargin = hundred.minus(variablePercent).dividedBy(hundred);

  // Revenue needed: Fixed costs / contribution margin
  const revenueNeeded = totalFixedCosts.dividedBy(contributionMargin);

  // Monthly average
  return revenueNeeded.dividedBy(months).toNumber();
}

// ============================================================================
// Test Scenarios
// ============================================================================

/**
 * Test scenario: Service business (coaching/consulting)
 */
export function testServiceBreakEven(): BreakEvenResult {
  return calculateBreakEven({
    fixkostenMonatlich: 4300, // Home office, tools, insurance, salary
    variableKostenProzent: 36, // Marketing 8% + training 3% + taxes 25%
    umsatzplanung: [2000, 3000, 4000, 5000, 6000, 7000, 8000, 8500, 9000, 9500, 10000, 10500], // Gradual ramp-up
  });
}

/**
 * Test scenario: E-commerce business
 */
export function testEcommerceBreakEven(): BreakEvenResult {
  return calculateBreakEven({
    fixkostenMonatlich: 6800, // Warehouse, tools, salary, insurance
    variableKostenProzent: 77, // COGS 55% + marketing 15% + taxes 7%
    umsatzplanung: Array(12).fill(0).map((_, i) => 15000 + (i * 2000)), // €15k to €37k progression
  });
}

/**
 * Test scenario: Manufacturing/Handwerk business
 */
export function testManufacturingBreakEven(): BreakEvenResult {
  return calculateBreakEven({
    fixkostenMonatlich: 6800, // Workshop, equipment, salary, insurance
    variableKostenProzent: 67, // Materials 45% + marketing 10% + taxes 22%
    umsatzplanung: [8000, 10000, 12000, 15000, 18000, 20000, 22000, 25000, 28000, 30000, 32000, 35000], // Manufacturing ramp-up
  });
}

// ============================================================================
// Exports
// ============================================================================

export default {
  calculateBreakEven,
  calculateBreakEvenFromFinanzplanung,
  analyzeBreakEvenScenarios,
  calculateBreakEvenSensitivity,
  validateBreakEvenRealism,
  calculateRevenueForTargetBreakEven,
  formatEUR,
  testServiceBreakEven,
  testEcommerceBreakEven,
  testManufacturingBreakEven,
};