/**
 * Umsatzplanung Calculations (GZ-602 Teil D)
 *
 * CRITICAL: All calculations use decimal.js to avoid floating-point errors.
 * This is mandatory for BA compliance and exact financial calculations.
 *
 * Includes:
 * - Multi-stream revenue aggregation
 * - Monthly breakdown for Year 1 cash flow
 * - Growth rate calculations and validation
 * - Industry benchmarking and realism checks
 * - German business type specific guidance
 */

import Decimal from 'decimal.js';
import type {
  Umsatzplanung,
  Umsatzstrom,
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
// Types for Internal Calculations
// ============================================================================

export interface UmsatzstromInput {
  name: string;
  typ: 'produkt' | 'dienstleistung' | 'abo' | 'provision' | 'sonstige';
  einheit: string;
  preis: number;
  mengeJahr1: number[]; // 12 months
  mengeJahr2: number;
  mengeJahr3: number;
}

export interface MonthlyRevenue {
  monat: number;
  streams: Array<{
    name: string;
    menge: number;
    preis: number;
    umsatz: number;
  }>;
  gesamtumsatz: number;
}

export interface GrowthRates {
  jahr1ToJahr2: number; // %
  jahr2ToJahr3: number; // %
  durchschnittlich: number; // % CAGR
}

export interface ValidationResult {
  isRealistic: boolean;
  warnings: string[];
  recommendations: string[];
}

export interface OptimizationSuggestion {
  category: 'pricing' | 'volume' | 'timing' | 'mix';
  suggestion: string;
  impact: 'low' | 'medium' | 'high';
}

export interface AnnualProjection {
  jahr: 1 | 2 | 3;
  umsatz: number;
  wachstumsrate?: number; // % compared to previous year
}

// ============================================================================
// Core Revenue Calculations
// ============================================================================

/**
 * Calculate monthly revenue for Year 1 from multiple streams
 * Uses decimal.js for exact arithmetic
 */
export function calculateMonthlyRevenue(streams: UmsatzstromInput[]): MonthlyRevenue[] {
  const months: MonthlyRevenue[] = [];

  for (let monat = 1; monat <= 12; monat++) {
    const monthlyStreams = streams.map(stream => {
      const menge = stream.mengeJahr1[monat - 1] || 0;
      const preis = new Decimal(stream.preis);
      const mengeDecimal = new Decimal(menge);
      const umsatz = preis.times(mengeDecimal);

      return {
        name: stream.name,
        menge,
        preis: stream.preis,
        umsatz: umsatz.toNumber(),
      };
    });

    const gesamtumsatz = monthlyStreams.reduce((sum, stream) => {
      return sum.plus(new Decimal(stream.umsatz));
    }, new Decimal(0));

    months.push({
      monat,
      streams: monthlyStreams,
      gesamtumsatz: gesamtumsatz.toNumber(),
    });
  }

  return months;
}

/**
 * Calculate annual revenue from monthly data
 */
export function calculateAnnualRevenue(monthlyData: MonthlyRevenue[]): number {
  const total = monthlyData.reduce((sum, month) => {
    return sum.plus(new Decimal(month.gesamtumsatz));
  }, new Decimal(0));

  return total.toNumber();
}

/**
 * Calculate annual revenue for a specific year from streams
 */
export function calculateStreamAnnualRevenue(
  streams: UmsatzstromInput[],
  year: 1 | 2 | 3
): number {
  const total = streams.reduce((sum, stream) => {
    const preis = new Decimal(stream.preis);
    let menge: Decimal;

    if (year === 1) {
      // Sum all 12 months
      const jahr1Total = stream.mengeJahr1.reduce((monthSum, monthMenge) => {
        return monthSum.plus(new Decimal(monthMenge));
      }, new Decimal(0));
      menge = jahr1Total;
    } else if (year === 2) {
      menge = new Decimal(stream.mengeJahr2);
    } else {
      menge = new Decimal(stream.mengeJahr3);
    }

    const streamUmsatz = preis.times(menge);
    return sum.plus(streamUmsatz);
  }, new Decimal(0));

  return total.toNumber();
}

/**
 * Calculate growth rates between years
 */
export function projectGrowthRates(jahr1: number, jahr2: number, jahr3: number): GrowthRates {
  const jahr1Decimal = new Decimal(jahr1);
  const jahr2Decimal = new Decimal(jahr2);
  const jahr3Decimal = new Decimal(jahr3);
  const hundert = new Decimal(100);

  // Year 1 to Year 2 growth rate
  let jahr1ToJahr2: Decimal;
  if (jahr1Decimal.equals(0)) {
    jahr1ToJahr2 = new Decimal(0);
  } else {
    jahr1ToJahr2 = jahr2Decimal.minus(jahr1Decimal)
      .dividedBy(jahr1Decimal)
      .times(hundert);
  }

  // Year 2 to Year 3 growth rate
  let jahr2ToJahr3: Decimal;
  if (jahr2Decimal.equals(0)) {
    jahr2ToJahr3 = new Decimal(0);
  } else {
    jahr2ToJahr3 = jahr3Decimal.minus(jahr2Decimal)
      .dividedBy(jahr2Decimal)
      .times(hundert);
  }

  // CAGR (Compound Annual Growth Rate)
  let durchschnittlich: Decimal;
  if (jahr1Decimal.equals(0)) {
    durchschnittlich = new Decimal(0);
  } else {
    // CAGR = ((Ending Value / Beginning Value)^(1/years)) - 1
    const ratio = jahr3Decimal.dividedBy(jahr1Decimal);
    const exponent = new Decimal(1).dividedBy(new Decimal(2)); // 2 years
    const cagr = ratio.pow(exponent).minus(1).times(hundert);
    durchschnittlich = cagr;
  }

  return {
    jahr1ToJahr2: jahr1ToJahr2.toNumber(),
    jahr2ToJahr3: jahr2ToJahr3.toNumber(),
    durchschnittlich: durchschnittlich.toNumber(),
  };
}

// ============================================================================
// Validation and Realism Checks
// ============================================================================

/**
 * Check if growth rates are realistic for industry
 */
export function checkGrowthRateRealism(
  rate: number,
  industry: string,
  businessAge: number = 1
): boolean {
  const rateDecimal = new Decimal(rate);

  // Industry-specific growth rate limits
  const industryLimits = {
    beratung: new Decimal(30), // Conservative service business
    ecommerce: new Decimal(100), // High growth potential
    handwerk: new Decimal(25), // Location-bound, steady growth
    restaurant: new Decimal(15), // Local market limits
    software: new Decimal(150), // High scalability
    default: new Decimal(50), // General business limit
  };

  const maxRate = industryLimits[industry as keyof typeof industryLimits] ||
                  industryLimits.default;

  // Adjust for business age - newer businesses can grow faster initially
  const ageAdjustment = businessAge <= 2 ? new Decimal(1.5) : new Decimal(1);
  const adjustedMaxRate = maxRate.times(ageAdjustment);

  return rateDecimal.lte(adjustedMaxRate);
}

/**
 * Validate revenue projections for realism
 */
export function validateRevenueRealism(
  projections: AnnualProjection[],
  industry: string
): ValidationResult {
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Check growth rates
  if (projections.length >= 2) {
    const firstYear = projections[0];
    const secondYear = projections[1];

    if (firstYear.umsatz > 0) {
      const growthRate = ((secondYear.umsatz - firstYear.umsatz) / firstYear.umsatz) * 100;

      if (!checkGrowthRateRealism(growthRate, industry)) {
        warnings.push(`Wachstumsrate von ${growthRate.toFixed(1)}% ist sehr optimistisch für ${industry}`);
        recommendations.push('Überprüfen Sie Ihre Marktgröße und Wettbewerbssituation');
      }
    }
  }

  // Check for hockey stick pattern (suspicious exponential growth)
  if (projections.length >= 3) {
    const [jahr1, jahr2, jahr3] = projections;
    const growth12 = jahr1.umsatz > 0 ? (jahr2.umsatz / jahr1.umsatz) - 1 : 0;
    const growth23 = jahr2.umsatz > 0 ? (jahr3.umsatz / jahr2.umsatz) - 1 : 0;

    if (growth12 > 1 && growth23 > 1) {
      warnings.push('Exponentielles Wachstum über 2 Jahre ist sehr unwahrscheinlich');
      recommendations.push('Planen Sie eher lineares oder moderates exponentielles Wachstum');
    }
  }

  // Check for realistic first year revenue
  const firstYear = projections[0];
  if (firstYear && firstYear.umsatz > 500000) {
    warnings.push('Umsatz von >€500.000 im ersten Jahr ist sehr ambitioniert');
    recommendations.push('Berücksichtigen Sie die Aufbauzeit für Kundengewinnung');
  }

  if (firstYear && firstYear.umsatz < 10000) {
    warnings.push('Umsatz von <€10.000 im ersten Jahr ist sehr niedrig für Vollzeit-Gründung');
    recommendations.push('Prüfen Sie, ob das Business wirtschaftlich tragfähig ist');
  }

  return {
    isRealistic: warnings.length <= 1, // Allow one warning as acceptable risk
    warnings,
    recommendations,
  };
}

/**
 * Suggest revenue optimization strategies
 */
export function suggestRevenueOptimization(streams: UmsatzstromInput[]): OptimizationSuggestion[] {
  const suggestions: OptimizationSuggestion[] = [];

  // Check pricing strategy
  const avgPrice = streams.reduce((sum, stream) => sum + stream.preis, 0) / streams.length;
  if (avgPrice < 50) {
    suggestions.push({
      category: 'pricing',
      suggestion: 'Niedrige Durchschnittspreise - prüfen Sie Preiserhöhungspotenzial',
      impact: 'high',
    });
  }

  // Check volume distribution
  const totalVolume = streams.reduce((sum, stream) => {
    return sum + stream.mengeJahr1.reduce((monthSum, month) => monthSum + month, 0);
  }, 0);

  if (totalVolume < 100) {
    suggestions.push({
      category: 'volume',
      suggestion: 'Niedrige Mengen - fokussieren Sie auf Kundenwachstum',
      impact: 'high',
    });
  }

  // Check seasonality (big differences between months)
  streams.forEach(stream => {
    const max = Math.max(...stream.mengeJahr1);
    const min = Math.min(...stream.mengeJahr1);
    if (max > min * 3) {
      suggestions.push({
        category: 'timing',
        suggestion: `Starke Schwankungen bei "${stream.name}" - Saison ausgleichen?`,
        impact: 'medium',
      });
    }
  });

  // Check revenue mix
  if (streams.length === 1) {
    suggestions.push({
      category: 'mix',
      suggestion: 'Nur eine Einnahmequelle - weitere Streams für Stabilität entwickeln',
      impact: 'medium',
    });
  }

  return suggestions;
}

// ============================================================================
// Complete Calculation Function
// ============================================================================

/**
 * Calculate complete Umsatzplanung from input streams
 */
export function calculateUmsatzplanung(input: {
  umsatzstroeme: UmsatzstromInput[];
  annahmen?: string[];
}): Umsatzplanung {
  const { umsatzstroeme, annahmen = [] } = input;

  // Calculate monthly breakdown for Year 1
  const monthlyData = calculateMonthlyRevenue(umsatzstroeme);
  const umsatzJahr1 = monthlyData.map(month => month.gesamtumsatz);
  const umsatzJahr1Summe = calculateAnnualRevenue(monthlyData);

  // Calculate annual totals for Years 2 and 3
  const umsatzJahr2 = calculateStreamAnnualRevenue(umsatzstroeme, 2);
  const umsatzJahr3 = calculateStreamAnnualRevenue(umsatzstroeme, 3);

  // Calculate growth rates
  const growthRates = projectGrowthRates(umsatzJahr1Summe, umsatzJahr2, umsatzJahr3);

  // Convert UmsatzstromInput to Umsatzstrom for output
  const outputStreams: Umsatzstrom[] = umsatzstroeme.map(stream => ({
    name: stream.name,
    typ: stream.typ,
    einheit: stream.einheit,
    preis: stream.preis,
    mengeJahr1: stream.mengeJahr1,
    mengeJahr2: stream.mengeJahr2,
    mengeJahr3: stream.mengeJahr3,
  }));

  return {
    umsatzstroeme: outputStreams,
    umsatzJahr1,
    umsatzJahr1Summe,
    umsatzJahr2,
    umsatzJahr3,
    wachstumsrateJahr2: growthRates.jahr1ToJahr2,
    wachstumsrateJahr3: growthRates.jahr2ToJahr3,
    annahmen,
  };
}

// ============================================================================
// Test Scenarios
// ============================================================================

/**
 * Test scenario: Software Consulting Business
 * Realistic B2B consulting with moderate growth
 */
export function testSoftwareConsultingScenario(): Umsatzplanung {
  const scenario: UmsatzstromInput[] = [
    {
      name: 'Beratungsstunden',
      typ: 'dienstleistung',
      einheit: 'Stunde',
      preis: 120, // €120/hour
      // Year 1: Ramping up from 40 to 120 hours per month
      mengeJahr1: [40, 50, 60, 70, 80, 90, 100, 110, 115, 120, 120, 120],
      mengeJahr2: 1400, // ~117 hours/month average
      mengeJahr3: 1600, // ~133 hours/month (growth plateau)
    },
    {
      name: 'Workshop Durchführung',
      typ: 'dienstleistung',
      einheit: 'Workshop',
      preis: 2500, // €2.500 per workshop
      // Year 1: Quarterly workshops
      mengeJahr1: [0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
      mengeJahr2: 6, // Monthly workshops
      mengeJahr3: 8, // Bi-weekly workshops
    },
  ];

  const annahmen = [
    'Stundensatz basiert auf Marktanalyse für Senior-Berater',
    'Workshop-Preise orientieren sich an 2-Tages-Formaten',
    'Kapazität limitiert auf ~140 Stunden/Monat für Work-Life-Balance',
    'Kundenwachstum durch Empfehlungen und Netzwerk',
  ];

  return calculateUmsatzplanung({ umsatzstroeme: scenario, annahmen });
}

/**
 * Test scenario: E-Commerce Business
 * Higher growth potential with seasonal variations
 */
export function testECommerceScenario(): Umsatzplanung {
  const scenario: UmsatzstromInput[] = [
    {
      name: 'Produktverkauf Online',
      typ: 'produkt',
      einheit: 'Stück',
      preis: 45, // Average selling price
      // Year 1: Seasonal pattern with Q4 spike
      mengeJahr1: [20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 150, 200],
      mengeJahr2: 1200, // 100/month average
      mengeJahr3: 1800, // 150/month average (50% growth)
    },
    {
      name: 'Premium Versand',
      typ: 'dienstleistung',
      einheit: 'Sendung',
      preis: 8, // Shipping fee markup
      // 80% of product sales get premium shipping
      mengeJahr1: [16, 20, 24, 28, 32, 40, 48, 56, 64, 72, 120, 160],
      mengeJahr2: 960, // 80% of 1200
      mengeJahr3: 1440, // 80% of 1800
    },
  ];

  const annahmen = [
    'Produktpreise inkl. 50% Marge nach COGS',
    'Saisonalität: Q4 (Nov-Dez) 2-3x höhere Umsätze',
    'Versandkosten teilweise an Kunden weitergegeben',
    'Wachstum durch Online-Marketing und Produkterweiterung',
    'Keine Amazon-Abhängigkeit, eigener Shop',
  ];

  return calculateUmsatzplanung({ umsatzstroeme: scenario, annahmen });
}

// ============================================================================
// Industry Benchmark Functions
// ============================================================================

/**
 * Get industry-typical revenue patterns
 */
export function getIndustryBenchmarks(industry: string) {
  const benchmarks = {
    beratung: {
      stundensatz: { min: 80, max: 200, typical: 120 },
      auslastung: { min: 60, max: 85, typical: 75 }, // % of working hours
      wachstum: { jahr1to2: 25, jahr2to3: 15 },
      saisonalitaet: 'gering',
    },
    ecommerce: {
      durchschnittswert: { min: 25, max: 100, typical: 50 },
      konversionsrate: { min: 1, max: 5, typical: 2.5 }, // %
      wachstum: { jahr1to2: 75, jahr2to3: 40 },
      saisonalitaet: 'hoch (Q4)',
    },
    handwerk: {
      stundensatz: { min: 50, max: 120, typical: 80 },
      auslastung: { min: 70, max: 90, typical: 80 },
      wachstum: { jahr1to2: 20, jahr2to3: 15 },
      saisonalitaet: 'mittel (Wetter)',
    },
    restaurant: {
      umsatzProQm: { min: 3000, max: 8000, typical: 5000 }, // pro Jahr
      plätze: { min: 20, max: 100, typical: 40 },
      wachstum: { jahr1to2: 10, jahr2to3: 8 },
      saisonalitaet: 'mittel (Tourismus)',
    },
  };

  return benchmarks[industry as keyof typeof benchmarks] || {
    wachstum: { jahr1to2: 30, jahr2to3: 20 },
    saisonalitaet: 'unbekannt',
  };
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

  const formatted = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amountDecimal.toNumber());

  // Remove extra spaces that might be added by the locale formatting
  return formatted.replace(/\s+/g, ' ').trim();
}

/**
 * Format percentage in German format
 * Example: 0.1234 → "12,3%"
 */
export function formatPercent(value: number | Decimal, decimals: number = 1): string {
  const valueDecimal = value instanceof Decimal ? value : new Decimal(value);

  const formatted = new Intl.NumberFormat('de-DE', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(valueDecimal.dividedBy(100).toNumber());

  // Remove spaces that might be added by the locale formatting
  return formatted.replace(/\s/g, '');
}

/**
 * Calculate percentage change between two values
 */
export function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue === 0 ? 0 : 100;

  const oldDecimal = new Decimal(oldValue);
  const newDecimal = new Decimal(newValue);
  const hundred = new Decimal(100);

  const change = newDecimal.minus(oldDecimal).dividedBy(oldDecimal).times(hundred);
  return change.toNumber();
}

// ============================================================================
// Exports
// ============================================================================

export default {
  calculateMonthlyRevenue,
  calculateAnnualRevenue,
  calculateStreamAnnualRevenue,
  projectGrowthRates,
  checkGrowthRateRealism,
  validateRevenueRealism,
  suggestRevenueOptimization,
  calculateUmsatzplanung,
  testSoftwareConsultingScenario,
  testECommerceScenario,
  getIndustryBenchmarks,
  formatEUR,
  formatPercent,
  calculatePercentageChange,
};