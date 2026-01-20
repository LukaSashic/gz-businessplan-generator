/**
 * Kapitalbedarf Calculations (GZ-601)
 *
 * CRITICAL: All calculations use decimal.js to avoid floating-point errors.
 * This is mandatory for BA compliance and exact financial calculations.
 *
 * Includes:
 * - Gründungskosten calculation
 * - Investitionen summation
 * - Anlaufkosten calculation with reserves
 * - Total capital requirements
 * - German EUR formatting
 */

import Decimal from 'decimal.js';
import type {
  Kapitalbedarf,
  Investition,
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
// Gründungskosten Calculations
// ============================================================================

/**
 * Calculate total Gründungskosten from individual components
 * Uses decimal.js for exact arithmetic
 */
export function calculateGruendungskosten(
  notar: number = 0,
  handelsregister: number = 0,
  beratung: number = 0,
  marketing: number = 0,
  sonstige: number = 0
): number {
  const notarDecimal = new Decimal(notar);
  const handelsregisterDecimal = new Decimal(handelsregister);
  const beratungDecimal = new Decimal(beratung);
  const marketingDecimal = new Decimal(marketing);
  const sonstigeDecimal = new Decimal(sonstige);

  const total = notarDecimal
    .plus(handelsregisterDecimal)
    .plus(beratungDecimal)
    .plus(marketingDecimal)
    .plus(sonstigeDecimal);

  return total.toNumber();
}

/**
 * Validate Gründungskosten for reasonableness
 */
export function validateGruendungskosten(
  total: number,
  rechtsform?: string
): { isRealistic: boolean; warnings: string[] } {
  const totalDecimal = new Decimal(total);
  const warnings: string[] = [];

  // Minimum thresholds based on legal form
  const minThresholds = {
    'GmbH': new Decimal(1500),
    'UG': new Decimal(500),
    'GbR': new Decimal(200),
    'Einzelunternehmen': new Decimal(200),
    'default': new Decimal(500),
  };

  const minThreshold = rechtsform
    ? minThresholds[rechtsform as keyof typeof minThresholds] || minThresholds.default
    : minThresholds.default;

  if (totalDecimal.lt(minThreshold)) {
    warnings.push(`Gründungskosten von €${formatEUR(totalDecimal)} erscheinen sehr niedrig für ${rechtsform || 'diese Rechtsform'}`);
  }

  if (totalDecimal.gt(new Decimal(10000))) {
    warnings.push(`Gründungskosten von €${formatEUR(totalDecimal)} erscheinen sehr hoch - sind alle Posten wirklich Gründungskosten?`);
  }

  return {
    isRealistic: warnings.length === 0,
    warnings,
  };
}

// ============================================================================
// Investitionen Calculations
// ============================================================================

/**
 * Calculate total investments from array of Investition objects
 */
export function calculateInvestitionen(investitionen: Investition[]): number {
  if (investitionen.length === 0) return 0;

  const total = investitionen.reduce((sum, investition) => {
    return sum.plus(new Decimal(investition.betrag));
  }, new Decimal(0));

  return total.toNumber();
}

/**
 * Calculate investments by category
 */
export function calculateInvestitionenByCategory(
  investitionen: Investition[]
): Record<string, number> {
  const categoryTotals: Record<string, Decimal> = {};

  investitionen.forEach((investition) => {
    const category = investition.kategorie;
    const amount = new Decimal(investition.betrag);

    if (categoryTotals[category]) {
      categoryTotals[category] = categoryTotals[category].plus(amount);
    } else {
      categoryTotals[category] = amount;
    }
  });

  // Convert back to numbers for output
  return Object.fromEntries(
    Object.entries(categoryTotals).map(([category, decimal]) => [
      category,
      decimal.toNumber()
    ])
  );
}

/**
 * Calculate annual depreciation for an investment
 */
export function calculateDepreciation(
  investition: Investition,
  method: 'linear' | 'declining' = 'linear'
): number {
  const betrag = new Decimal(investition.betrag);
  const nutzungsdauer = new Decimal(investition.nutzungsdauer || 5);

  if (method === 'linear') {
    return betrag.dividedBy(nutzungsdauer).toNumber();
  }

  // For declining balance method (simplified)
  const rate = new Decimal(0.2); // 20% declining rate
  return betrag.times(rate).toNumber();
}

// ============================================================================
// Anlaufkosten Calculations
// ============================================================================

/**
 * Calculate Anlaufkosten with safety reserve
 * Formula: (monthly costs × months) + reserve
 */
export function calculateAnlaufkosten(
  monatlicheKosten: number,
  monate: number,
  reservePercent: number = 20
): {
  laufendeKosten: number;
  reserve: number;
  gesamtsumme: number;
} {
  const monatlicheKostenDecimal = new Decimal(monatlicheKosten);
  const monateDecimal = new Decimal(monate);
  const reservePercentDecimal = new Decimal(reservePercent).dividedBy(100);

  const laufendeKosten = monatlicheKostenDecimal.times(monateDecimal);
  const reserve = laufendeKosten.times(reservePercentDecimal);
  const gesamtsumme = laufendeKosten.plus(reserve);

  return {
    laufendeKosten: laufendeKosten.toNumber(),
    reserve: reserve.toNumber(),
    gesamtsumme: gesamtsumme.toNumber(),
  };
}

/**
 * Validate Anlaufkosten for reasonableness
 */
export function validateAnlaufkosten(
  monatlicheKosten: number,
  monate: number,
  total: number
): { isRealistic: boolean; warnings: string[] } {
  const warnings: string[] = [];
  const monatlicheKostenDecimal = new Decimal(monatlicheKosten);
  const monateDecimal = new Decimal(monate);
  const totalDecimal = new Decimal(total);

  // Check if months are reasonable
  if (monateDecimal.lt(3)) {
    warnings.push('Weniger als 3 Monate Anlaufzeit ist sehr optimistisch');
  }

  if (monateDecimal.gt(18)) {
    warnings.push('Mehr als 18 Monate Anlaufzeit könnte zu viel Kapital binden');
  }

  // Check if monthly costs are reasonable
  if (monatlicheKostenDecimal.lt(1000)) {
    warnings.push('Monatliche Kosten unter €1.000 erscheinen sehr niedrig');
  }

  if (monatlicheKostenDecimal.gt(10000)) {
    warnings.push('Monatliche Kosten über €10.000 sind sehr hoch - alle Posten nötig?');
  }

  // Check total calculation
  const expectedMinimum = monatlicheKostenDecimal.times(monateDecimal);
  if (totalDecimal.lt(expectedMinimum)) {
    warnings.push('Anlaufkosten-Summe ist niedriger als monatliche Kosten × Monate');
  }

  return {
    isRealistic: warnings.length === 0,
    warnings,
  };
}

// ============================================================================
// Total Kapitalbedarf Calculation
// ============================================================================

/**
 * Calculate total capital requirements
 * Formula: Gründungskosten + Investitionen + Anlaufkosten
 */
export function calculateGesamtkapitalbedarf(
  gruendungskosten: number,
  investitionen: number,
  anlaufkosten: number
): number {
  const gruendungskostenDecimal = new Decimal(gruendungskosten);
  const investitionenDecimal = new Decimal(investitionen);
  const anlaufkostenDecimal = new Decimal(anlaufkosten);

  const total = gruendungskostenDecimal
    .plus(investitionenDecimal)
    .plus(anlaufkostenDecimal);

  return total.toNumber();
}

/**
 * Calculate full Kapitalbedarf object from inputs
 */
export function calculateKapitalbedarf(input: {
  gruendungskosten: {
    notar: number;
    handelsregister: number;
    beratung: number;
    marketing: number;
    sonstige: number;
  };
  investitionen: Investition[];
  anlaufkosten: {
    monate: number;
    monatlicheKosten: number;
    reservePercent?: number;
  };
}): Kapitalbedarf {
  // Calculate Gründungskosten
  const gruendungskostenSumme = calculateGruendungskosten(
    input.gruendungskosten.notar,
    input.gruendungskosten.handelsregister,
    input.gruendungskosten.beratung,
    input.gruendungskosten.marketing,
    input.gruendungskosten.sonstige
  );

  // Calculate Investitionen
  const investitionenSumme = calculateInvestitionen(input.investitionen);

  // Calculate Anlaufkosten
  const anlaufkostenCalc = calculateAnlaufkosten(
    input.anlaufkosten.monatlicheKosten,
    input.anlaufkosten.monate,
    input.anlaufkosten.reservePercent
  );

  // Calculate total
  const gesamtkapitalbedarf = calculateGesamtkapitalbedarf(
    gruendungskostenSumme,
    investitionenSumme,
    anlaufkostenCalc.gesamtsumme
  );

  return {
    gruendungskosten: {
      notar: input.gruendungskosten.notar,
      handelsregister: input.gruendungskosten.handelsregister,
      beratung: input.gruendungskosten.beratung,
      marketing: input.gruendungskosten.marketing,
      sonstige: input.gruendungskosten.sonstige,
      summe: gruendungskostenSumme,
    },
    investitionen: input.investitionen,
    investitionenSumme,
    anlaufkosten: {
      monate: input.anlaufkosten.monate,
      monatlicheKosten: input.anlaufkosten.monatlicheKosten,
      reserve: anlaufkostenCalc.reserve,
      summe: anlaufkostenCalc.gesamtsumme,
    },
    gesamtkapitalbedarf,
  };
}

// ============================================================================
// Scenario Testing Functions
// ============================================================================

/**
 * Test the €50k GZ standard scenario
 * €15k Gründungskosten + €25k Anlauf + €10k Reserve = €50k
 */
export function testGZ50kScenario(): Kapitalbedarf {
  const scenario = {
    gruendungskosten: {
      notar: 800,
      handelsregister: 400,
      beratung: 1500,
      marketing: 2000,
      sonstige: 800,
    },
    investitionen: [
      { name: 'Laptop', kategorie: 'it' as const, betrag: 2000, nutzungsdauer: 3 },
      { name: 'Büroausstattung', kategorie: 'ausstattung' as const, betrag: 3000, nutzungsdauer: 5 },
    ],
    anlaufkosten: {
      monate: 6,
      monatlicheKosten: 4000, // €3000 private + €1000 business
      reservePercent: 25, // 25% reserve
    },
  };

  return calculateKapitalbedarf(scenario);
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format currency in German EUR format
 * Example: 1234.56 → "1.234,56 €"
 */
export function formatEUR(amount: number | Decimal): string {
  const amountDecimal = amount instanceof Decimal ? amount : new Decimal(amount);

  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amountDecimal.toNumber());
}

/**
 * Parse EUR string back to number (for form inputs)
 * Example: "1.234,56 €" → 1234.56
 */
export function parseEUR(eurString: string): number {
  const cleanedString = eurString
    .replace(/[€\s]/g, '') // Remove € and spaces
    .replace(/\./g, '') // Remove thousand separators
    .replace(',', '.'); // Replace decimal comma with dot

  return new Decimal(cleanedString || 0).toNumber();
}

/**
 * Percentage calculation with decimal precision
 */
export function calculatePercentage(part: number, total: number): number {
  if (total === 0) return 0;

  const partDecimal = new Decimal(part);
  const totalDecimal = new Decimal(total);
  const hundred = new Decimal(100);

  return partDecimal.dividedBy(totalDecimal).times(hundred).toNumber();
}

// ============================================================================
// Exports
// ============================================================================

export default {
  calculateGruendungskosten,
  validateGruendungskosten,
  calculateInvestitionen,
  calculateInvestitionenByCategory,
  calculateDepreciation,
  calculateAnlaufkosten,
  validateAnlaufkosten,
  calculateGesamtkapitalbedarf,
  calculateKapitalbedarf,
  testGZ50kScenario,
  formatEUR,
  parseEUR,
  calculatePercentage,
};