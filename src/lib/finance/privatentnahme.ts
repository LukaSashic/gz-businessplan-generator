/**
 * Privatentnahme Calculations (GZ-601)
 *
 * CRITICAL: All calculations use decimal.js to avoid floating-point errors.
 * This is mandatory for BA compliance and exact financial calculations.
 *
 * Includes:
 * - Living expense calculations
 * - Regional cost adjustments
 * - Category-based expense breakdown
 * - Annual totals and tax implications
 * - Lifestyle sustainability analysis
 */

import Decimal from 'decimal.js';
import type { Privatentnahme } from '@/types/modules/finanzplanung';

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
// Core Privatentnahme Calculations
// ============================================================================

/**
 * Calculate total monthly private withdrawal
 */
export function calculateMonatlichePrivatentnahme(
  miete: number,
  lebensmittel: number,
  versicherungen: number,
  mobilitaet: number,
  kommunikation: number,
  sonstigeAusgaben: number,
  sparrate: number = 0
): number {
  const mieteDecimal = new Decimal(miete);
  const lebensmittelDecimal = new Decimal(lebensmittel);
  const versicherungenDecimal = new Decimal(versicherungen);
  const mobilitaetDecimal = new Decimal(mobilitaet);
  const kommunikationDecimal = new Decimal(kommunikation);
  const sonstigeAusgabenDecimal = new Decimal(sonstigeAusgaben);
  const sparrateDecimal = new Decimal(sparrate);

  const total = mieteDecimal
    .plus(lebensmittelDecimal)
    .plus(versicherungenDecimal)
    .plus(mobilitaetDecimal)
    .plus(kommunikationDecimal)
    .plus(sonstigeAusgabenDecimal)
    .plus(sparrateDecimal);

  return total.toNumber();
}

/**
 * Calculate annual private withdrawal
 */
export function calculateJaehrlichePrivatentnahme(monatlichePrivatentnahme: number): number {
  const monatlichDecimal = new Decimal(monatlichePrivatentnahme);
  const jaehrlich = monatlichDecimal.times(12);

  return jaehrlich.toNumber();
}

/**
 * Calculate complete Privatentnahme object
 */
export function calculatePrivatentnahme(input: {
  miete: number;
  lebensmittel: number;
  versicherungen: number;
  mobilitaet: number;
  kommunikation: number;
  sonstigeAusgaben: number;
  sparrate?: number;
}): Privatentnahme {
  const sparrate = input.sparrate || 0;

  const monatlichePrivatentnahme = calculateMonatlichePrivatentnahme(
    input.miete,
    input.lebensmittel,
    input.versicherungen,
    input.mobilitaet,
    input.kommunikation,
    input.sonstigeAusgaben,
    sparrate
  );

  const jaehrlichePrivatentnahme = calculateJaehrlichePrivatentnahme(monatlichePrivatentnahme);

  return {
    miete: input.miete,
    lebensmittel: input.lebensmittel,
    versicherungen: input.versicherungen,
    mobilitaet: input.mobilitaet,
    kommunikation: input.kommunikation,
    sonstigeAusgaben: input.sonstigeAusgaben,
    sparrate,
    monatlichePrivatentnahme,
    jaehrlichePrivatentnahme,
  };
}

// ============================================================================
// Regional Cost Adjustments
// ============================================================================

/**
 * Adjust costs for regional differences
 */
export function adjustForRegion(
  baseCosts: Partial<Privatentnahme>,
  region: string,
  customFactors?: Record<string, number>
): Partial<Privatentnahme> {
  const regionalFactors: Record<string, number> = {
    'München': 1.4,
    'Frankfurt': 1.35,
    'Stuttgart': 1.25,
    'Hamburg': 1.2,
    'Berlin': 1.15,
    'Köln': 1.15,
    'Düsseldorf': 1.2,
    'Hannover': 1.05,
    'Nürnberg': 1.05,
    'Bremen': 1.0,
    'Dresden': 0.9,
    'Leipzig': 0.9,
    'default': 0.95,
  };

  const factor = regionalFactors[region] || regionalFactors.default;

  const adjustedCosts: Partial<Privatentnahme> = {};

  // Adjust each category with different sensitivity to regional factors
  if (baseCosts.miete !== undefined) {
    // Housing costs are most sensitive to region
    const mieteDecimal = new Decimal(baseCosts.miete);
    const housingFactor = new Decimal(customFactors?.miete ?? factor);
    adjustedCosts.miete = mieteDecimal.times(housingFactor).round().toNumber();
  }

  if (baseCosts.lebensmittel !== undefined) {
    // Food costs moderately sensitive
    const lebensmittelDecimal = new Decimal(baseCosts.lebensmittel);
    const foodFactor = new Decimal(factor).minus(1).times(0.7).plus(1); // 70% of regional factor
    adjustedCosts.lebensmittel = lebensmittelDecimal.times(foodFactor).round().toNumber();
  }

  if (baseCosts.versicherungen !== undefined) {
    // Insurance mostly uniform across Germany
    adjustedCosts.versicherungen = baseCosts.versicherungen;
  }

  if (baseCosts.mobilitaet !== undefined) {
    // Mobility varies with city (public transport vs. car)
    const mobilitaetDecimal = new Decimal(baseCosts.mobilitaet);
    const mobilityFactor = new Decimal(customFactors?.mobilitaet ?? new Decimal(factor).minus(1).times(0.5).plus(1).toNumber());
    adjustedCosts.mobilitaet = mobilitaetDecimal.times(mobilityFactor).round().toNumber();
  }

  if (baseCosts.kommunikation !== undefined) {
    // Communication costs uniform
    adjustedCosts.kommunikation = baseCosts.kommunikation;
  }

  if (baseCosts.sonstigeAusgaben !== undefined) {
    // Other expenses moderately sensitive
    const sonstigeDecimal = new Decimal(baseCosts.sonstigeAusgaben);
    const otherFactor = new Decimal(factor).minus(1).times(0.6).plus(1);
    adjustedCosts.sonstigeAusgaben = sonstigeDecimal.times(otherFactor).round().toNumber();
  }

  if (baseCosts.sparrate !== undefined) {
    // Savings rate independent of region
    adjustedCosts.sparrate = baseCosts.sparrate;
  }

  return adjustedCosts;
}

// ============================================================================
// Lifestyle Analysis
// ============================================================================

/**
 * Analyze spending patterns and sustainability
 */
export function analyzeSpendingPattern(
  privatentnahme: Privatentnahme,
  income?: number
): {
  categoryPercentages: Record<string, number>;
  housingRatio: number;
  savingsRate: number;
  sustainability: 'sustainable' | 'tight' | 'unsustainable';
  recommendations: string[];
} {
  const total = new Decimal(privatentnahme.monatlichePrivatentnahme);
  const mieteDecimal = new Decimal(privatentnahme.miete);
  const sparrateDecimal = new Decimal(privatentnahme.sparrate);

  // Calculate percentages
  const categoryPercentages = {
    miete: total.gt(0) ? mieteDecimal.dividedBy(total).times(100).toNumber() : 0,
    lebensmittel: total.gt(0) ? new Decimal(privatentnahme.lebensmittel).dividedBy(total).times(100).toNumber() : 0,
    versicherungen: total.gt(0) ? new Decimal(privatentnahme.versicherungen).dividedBy(total).times(100).toNumber() : 0,
    mobilitaet: total.gt(0) ? new Decimal(privatentnahme.mobilitaet).dividedBy(total).times(100).toNumber() : 0,
    kommunikation: total.gt(0) ? new Decimal(privatentnahme.kommunikation).dividedBy(total).times(100).toNumber() : 0,
    sonstigeAusgaben: total.gt(0) ? new Decimal(privatentnahme.sonstigeAusgaben).dividedBy(total).times(100).toNumber() : 0,
    sparrate: total.gt(0) ? sparrateDecimal.dividedBy(total).times(100).toNumber() : 0,
  };

  const housingRatio = categoryPercentages.miete;
  const savingsRate = categoryPercentages.sparrate;

  // Assess sustainability
  const recommendations: string[] = [];
  let sustainability: 'sustainable' | 'tight' | 'unsustainable' = 'sustainable';

  if (housingRatio > 40) {
    sustainability = 'tight';
    recommendations.push('Wohnkosten sind hoch (>40% der Ausgaben) - günstigere Alternativen prüfen');
  }

  if (housingRatio > 50) {
    sustainability = 'unsustainable';
    recommendations.push('Wohnkosten kritisch hoch (>50%) - dringend reduzieren');
  }

  if (savingsRate < 5) {
    recommendations.push('Sehr niedrige Sparrate (<5%) - Notgroschen aufbauen');
  }

  if (savingsRate > 30) {
    recommendations.push('Sehr hohe Sparrate (>30%) - evtl. zu konservativ für Gründungsphase');
  }

  if (categoryPercentages.lebensmittel > 20) {
    recommendations.push('Hohe Lebensmittelkosten (>20%) - Sparpotential durch Selbstkochen');
  }

  if (categoryPercentages.mobilitaet > 15) {
    recommendations.push('Hohe Mobilitätskosten (>15%) - günstigere Alternativen prüfen');
  }

  // Compare to income if provided
  if (income) {
    const incomeDecimal = new Decimal(income);
    const expenseRatio = total.dividedBy(incomeDecimal).times(100);

    if (expenseRatio.gt(90)) {
      sustainability = 'unsustainable';
      recommendations.push('Ausgaben zu hoch (>90% des Einkommens) - drastisch reduzieren');
    } else if (expenseRatio.gt(80)) {
      sustainability = 'tight';
      recommendations.push('Ausgaben hoch (>80% des Einkommens) - Puffer für Unvorhergesehenes fehlt');
    }
  }

  return {
    categoryPercentages,
    housingRatio,
    savingsRate,
    sustainability,
    recommendations,
  };
}

// ============================================================================
// Comparison Functions
// ============================================================================

/**
 * Compare with statistical averages for Germany
 */
export function compareWithAverages(
  privatentnahme: Privatentnahme,
  familyStatus: 'single' | 'partner' | 'family' = 'single'
): {
  comparison: Record<string, 'below' | 'average' | 'above'>;
  averages: Record<string, number>;
  deviations: Record<string, number>;
} {
  // Statistical averages for Germany (2024)
  const averages = {
    single: {
      miete: 800,
      lebensmittel: 400,
      versicherungen: 300,
      mobilitaet: 250,
      kommunikation: 80,
      sonstigeAusgaben: 400,
      sparrate: 200,
    },
    partner: {
      miete: 1200,
      lebensmittel: 600,
      versicherungen: 450,
      mobilitaet: 350,
      kommunikation: 120,
      sonstigeAusgaben: 600,
      sparrate: 300,
    },
    family: {
      miete: 1500,
      lebensmittel: 800,
      versicherungen: 600,
      mobilitaet: 450,
      kommunikation: 150,
      sonstigeAusgaben: 800,
      sparrate: 200,
    },
  };

  const categoryAverages = averages[familyStatus];

  const comparison: Record<string, 'below' | 'average' | 'above'> = {};
  const deviations: Record<string, number> = {};

  Object.entries(categoryAverages).forEach(([category, average]) => {
    const actualValue = privatentnahme[category as keyof Privatentnahme] as number || 0;
    const averageDecimal = new Decimal(average);
    const actualDecimal = new Decimal(actualValue);

    const deviation = actualDecimal.minus(averageDecimal).dividedBy(averageDecimal).times(100);
    deviations[category] = deviation.toNumber();

    if (deviation.lt(-20)) {
      comparison[category] = 'below';
    } else if (deviation.gt(20)) {
      comparison[category] = 'above';
    } else {
      comparison[category] = 'average';
    }
  });

  return {
    comparison,
    averages: categoryAverages,
    deviations,
  };
}

// ============================================================================
// Tax Considerations
// ============================================================================

/**
 * Calculate tax implications of private withdrawals
 */
export function calculateTaxImplications(
  privatentnahme: Privatentnahme,
  businessIncome: number,
  isFreiberufler: boolean = false
): {
  netBusinessIncome: number;
  personalTaxBurden: number;
  effectivePrivateWithdrawal: number;
  recommendations: string[];
} {
  const businessIncomeDecimal = new Decimal(businessIncome);
  const privatentnahmeDecimal = new Decimal(privatentnahme.jaehrlichePrivatentnahme);

  // Simplified tax calculation (actual depends on many factors)
  const taxableIncome = businessIncomeDecimal.minus(privatentnahmeDecimal);

  // Rough tax estimates
  let taxRate = new Decimal(0);
  if (taxableIncome.gt(60000)) {
    taxRate = new Decimal(0.35); // ~35% including solidarity tax
  } else if (taxableIncome.gt(30000)) {
    taxRate = new Decimal(0.25); // ~25%
  } else if (taxableIncome.gt(10000)) {
    taxRate = new Decimal(0.15); // ~15%
  }

  const personalTaxBurden = taxableIncome.times(taxRate);
  const netBusinessIncome = businessIncomeDecimal.minus(personalTaxBurden);
  const effectivePrivateWithdrawal = netBusinessIncome.gte(privatentnahmeDecimal)
    ? privatentnahmeDecimal.toNumber()
    : netBusinessIncome.toNumber();

  const recommendations: string[] = [];

  if (effectivePrivateWithdrawal < privatentnahme.jaehrlichePrivatentnahme) {
    recommendations.push('Geschäftseinkommen reicht nicht für geplante Privatentnahme nach Steuern');
  }

  if (privatentnahme.versicherungen < 300 && isFreiberufler) {
    recommendations.push('Als Freiberufler private Krankenversicherung als Betriebsausgabe prüfen');
  }

  if (privatentnahme.sparrate > 0) {
    recommendations.push('Sparen erfolgt aus versteuerten Privatentnahmen - evtl. betriebliche Altersvorsorge prüfen');
  }

  return {
    netBusinessIncome: netBusinessIncome.toNumber(),
    personalTaxBurden: personalTaxBurden.toNumber(),
    effectivePrivateWithdrawal,
    recommendations,
  };
}

// ============================================================================
// Scenario Testing
// ============================================================================

/**
 * Test standard scenarios for different family situations
 */
export function testStandardScenarios(): {
  single: Privatentnahme;
  partner: Privatentnahme;
  family: Privatentnahme;
} {
  const single = calculatePrivatentnahme({
    miete: 800,
    lebensmittel: 400,
    versicherungen: 300,
    mobilitaet: 200,
    kommunikation: 80,
    sonstigeAusgaben: 350,
    sparrate: 170,
  });

  const partner = calculatePrivatentnahme({
    miete: 1200,
    lebensmittel: 600,
    versicherungen: 450,
    mobilitaet: 300,
    kommunikation: 120,
    sonstigeAusgaben: 550,
    sparrate: 280,
  });

  const family = calculatePrivatentnahme({
    miete: 1500,
    lebensmittel: 800,
    versicherungen: 600,
    mobilitaet: 400,
    kommunikation: 150,
    sonstigeAusgaben: 750,
    sparrate: 200,
  });

  return { single, partner, family };
}

// ============================================================================
// Validation
// ============================================================================

/**
 * Validate Privatentnahme for reasonableness
 */
export function validatePrivatentnahme(
  privatentnahme: Privatentnahme,
  region?: string,
  familyStatus?: 'single' | 'partner' | 'family'
): {
  isRealistic: boolean;
  warnings: string[];
  suggestions: string[];
} {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const total = privatentnahme.monatlichePrivatentnahme;

  // Basic sanity checks
  if (total < 1000) {
    warnings.push('Privatentnahme unter €1.000/Monat ist sehr niedrig');
    suggestions.push('Prüfen Sie, ob alle notwendigen Ausgaben berücksichtigt sind');
  }

  if (total > 6000) {
    warnings.push('Privatentnahme über €6.000/Monat ist sehr hoch');
    suggestions.push('Identifizieren Sie Einsparpotential für die Gründungsphase');
  }

  // Category-specific checks
  if (privatentnahme.miete > total * 0.5) {
    warnings.push('Wohnkosten über 50% der Privatentnahme');
    suggestions.push('Günstigere Wohnsituation für Gründungsphase suchen');
  }

  if (privatentnahme.versicherungen < 200) {
    warnings.push('Versicherungskosten sehr niedrig - KV vergessen?');
    suggestions.push('Krankenversicherung und weitere notwendige Versicherungen prüfen');
  }

  if (privatentnahme.sparrate > total * 0.3) {
    warnings.push('Sparrate sehr hoch für Gründungsphase');
    suggestions.push('Temporär weniger sparen, mehr in Geschäft investieren');
  }

  // Regional comparison if provided
  if (region && familyStatus) {
    const averages = testStandardScenarios()[familyStatus];
    const adjustedAverages = adjustForRegion(averages, region) as Privatentnahme;

    const deviation = new Decimal(total).minus(adjustedAverages.monatlichePrivatentnahme)
      .dividedBy(adjustedAverages.monatlichePrivatentnahme).times(100);

    if (deviation.gt(50)) {
      warnings.push(`Privatentnahme ${deviation.toFixed(1)}% über ${region} Durchschnitt`);
    } else if (deviation.lt(-30)) {
      warnings.push(`Privatentnahme ${Math.abs(deviation.toNumber()).toFixed(1)}% unter ${region} Durchschnitt`);
    }
  }

  return {
    isRealistic: warnings.length === 0,
    warnings,
    suggestions,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format expenses by category for display
 */
export function formatExpenseBreakdown(privatentnahme: Privatentnahme): string[] {
  const formatter = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  });

  return [
    `Miete/Wohnen: ${formatter.format(privatentnahme.miete)}`,
    `Lebensmittel: ${formatter.format(privatentnahme.lebensmittel)}`,
    `Versicherungen: ${formatter.format(privatentnahme.versicherungen)}`,
    `Mobilität: ${formatter.format(privatentnahme.mobilitaet)}`,
    `Kommunikation: ${formatter.format(privatentnahme.kommunikation)}`,
    `Sonstige Ausgaben: ${formatter.format(privatentnahme.sonstigeAusgaben)}`,
    `Sparen: ${formatter.format(privatentnahme.sparrate)}`,
    `──────────────────────────`,
    `Gesamt/Monat: ${formatter.format(privatentnahme.monatlichePrivatentnahme)}`,
    `Gesamt/Jahr: ${formatter.format(privatentnahme.jaehrlichePrivatentnahme)}`,
  ];
}

// ============================================================================
// Exports
// ============================================================================

export default {
  calculateMonatlichePrivatentnahme,
  calculateJaehrlichePrivatentnahme,
  calculatePrivatentnahme,
  adjustForRegion,
  analyzeSpendingPattern,
  compareWithAverages,
  calculateTaxImplications,
  testStandardScenarios,
  validatePrivatentnahme,
  formatExpenseBreakdown,
};