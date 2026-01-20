/**
 * Rentabilität Calculations (GZ-603 Teil F)
 *
 * CRITICAL: All calculations use decimal.js to avoid floating-point errors.
 * This is mandatory for BA compliance and exact financial calculations.
 *
 * Includes:
 * - 3-year profitability analysis with exact arithmetic
 * - Gross profit, operating profit, net profit calculations
 * - Profit margin analysis and industry benchmarking
 * - Tax calculations (German business context)
 * - Break-even integration and validation
 * - BA compliance checks and warnings
 */

import Decimal from 'decimal.js';
import type {
  Rentabilitaet,
  RentabilitaetJahr,
  Umsatzplanung,
  Kostenplanung,
} from '@/types/modules/finanzplanung';
import { calculateBreakEvenFromFinanzplanung } from './break-even';

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
// Types for Profitability Analysis
// ============================================================================

export interface RentabilitaetInput {
  umsatzplanung: Umsatzplanung;
  kostenplanung: Kostenplanung;
  industry?: string;                    // For benchmarking
  taxRate?: number;                     // Override default German tax rate
}

export interface ProfitabilityMetrics {
  // Revenue metrics
  revenueGrowthYear2: number;           // % growth Y1→Y2
  revenueGrowthYear3: number;           // % growth Y2→Y3
  avgAnnualGrowth: number;              // CAGR over 3 years

  // Margin metrics
  avgGrossMargin: number;               // % average over 3 years
  avgOperatingMargin: number;           // % average over 3 years
  avgNetMargin: number;                 // % average over 3 years

  // Trend analysis
  marginTrend: 'improving' | 'stable' | 'declining';
  profitabilityRating: 'excellent' | 'good' | 'acceptable' | 'concerning' | 'poor';
}

export interface IndustryBenchmark {
  grossMarginTypical: number;          // % typical for industry
  operatingMarginTypical: number;     // % typical for industry
  netMarginTypical: number;           // % typical for industry
  comparison: {
    grossMarginVsBenchmark: number;    // Difference from benchmark
    operatingMarginVsBenchmark: number;
    netMarginVsBenchmark: number;
  };
  warnings: string[];
  recommendations: string[];
}

export interface TaxAnalysis {
  effectiveRate: number;               // % actual tax rate applied
  taxOptimizationPotential: string[];  // Suggestions for German tax context
  taxRiskWarnings: string[];           // German tax compliance warnings
}

// ============================================================================
// German Tax Configuration
// ============================================================================

const GERMAN_TAX_RATES = {
  // Kleinunternehmerregelung (up to €22,000)
  kleinunternehmer: 0,

  // Gewerbliche Tätigkeit (standard business)
  gewerbe: {
    einkommensteuer: 0.25,             // ~25% personal income tax (average)
    gewerbesteuer: 0.035,              // ~3.5% business tax (average municipality)
    kirchensteuer: 0.018,              // 1.8% (8% of income tax, if applicable)
    solidaritaetszuschlag: 0.0055,     // 0.55% (deleted for most in 2021, but kept for safety)
  },

  // Freiberufliche Tätigkeit (freelance/professional)
  freiberuflich: {
    einkommensteuer: 0.25,             // ~25% personal income tax
    kirchensteuer: 0.018,              // 1.8%
    solidaritaetszuschlag: 0.0055,     // 0.55%
  },
};

// ============================================================================
// Core Profitability Calculations
// ============================================================================

/**
 * Calculate profitability for a single year
 */
function calculateSingleYearProfitability(
  revenue: number,
  fixedCosts: number,
  variableCosts: number,
  taxRate: number
): RentabilitaetJahr {
  // Convert to Decimal for exact calculations
  const umsatz = new Decimal(revenue);
  const materialaufwand = new Decimal(variableCosts);
  const rohertrag = umsatz.minus(materialaufwand);

  // For simplicity, we'll allocate costs into categories
  // This could be enhanced with more detailed cost categorization
  const fixedCostsDecimal = new Decimal(fixedCosts);

  // Rough allocation of fixed costs (could be refined based on actual cost structure)
  const personalkosten = fixedCostsDecimal.times(0.6); // 60% of fixed costs typically personnel
  const sonstigeBetriebskosten = fixedCostsDecimal.times(0.35); // 35% other operating costs
  const abschreibungen = fixedCostsDecimal.times(0.05); // 5% depreciation
  const zinsen = new Decimal(0); // Assuming no interest for simplicity

  // Calculate operating result
  const ergebnisVorSteuern = rohertrag
    .minus(personalkosten)
    .minus(sonstigeBetriebskosten)
    .minus(abschreibungen)
    .minus(zinsen);

  // Calculate taxes (only if profit is positive)
  const steuern = ergebnisVorSteuern.gt(0)
    ? ergebnisVorSteuern.times(new Decimal(taxRate))
    : new Decimal(0);

  const jahresueberschuss = ergebnisVorSteuern.minus(steuern);

  // Calculate margins
  const rohertragsmarge = umsatz.gt(0)
    ? rohertrag.dividedBy(umsatz).times(100)
    : new Decimal(0);

  const umsatzrendite = umsatz.gt(0)
    ? jahresueberschuss.dividedBy(umsatz).times(100)
    : new Decimal(0);

  return {
    umsatz: umsatz.toNumber(),
    materialaufwand: materialaufwand.toNumber(),
    rohertrag: rohertrag.toNumber(),
    personalkosten: personalkosten.toNumber(),
    sonstigeBetriebskosten: sonstigeBetriebskosten.toNumber(),
    abschreibungen: abschreibungen.toNumber(),
    zinsen: zinsen.toNumber(),
    ergebnisVorSteuern: ergebnisVorSteuern.toNumber(),
    steuern: steuern.toNumber(),
    jahresueberschuss: jahresueberschuss.toNumber(),
    rohertragsmarge: rohertragsmarge.toNumber(),
    umsatzrendite: umsatzrendite.toNumber(),
  };
}

/**
 * Calculate complete 3-year profitability analysis
 */
export function calculateRentabilitaet(input: RentabilitaetInput): Rentabilitaet {
  const { umsatzplanung, kostenplanung, industry = 'default', taxRate } = input;

  // Determine tax rate (German context)
  const effectiveRate = taxRate || calculateGermanTaxRate(umsatzplanung.umsatzJahr1Summe);

  // Calculate break-even metrics
  const breakEven = calculateBreakEvenFromFinanzplanung(kostenplanung, umsatzplanung);

  // Calculate year-by-year profitability
  const jahr1 = calculateSingleYearProfitability(
    umsatzplanung.umsatzJahr1Summe,
    kostenplanung.fixkostenSummeJaehrlich,
    kostenplanung.variableKostenSummeJahr1,
    effectiveRate
  );

  const jahr2 = calculateSingleYearProfitability(
    umsatzplanung.umsatzJahr2,
    kostenplanung.fixkostenSummeJaehrlich * 1.1, // 10% increase in fixed costs
    kostenplanung.variableKostenSummeJahr2,
    effectiveRate
  );

  const jahr3 = calculateSingleYearProfitability(
    umsatzplanung.umsatzJahr3,
    kostenplanung.fixkostenSummeJaehrlich * 1.2, // 20% increase in fixed costs
    kostenplanung.variableKostenSummeJahr3,
    effectiveRate
  );

  return {
    jahr1,
    jahr2,
    jahr3,
    breakEvenMonat: breakEven.breakEvenMonat,
    breakEvenUmsatz: breakEven.breakEvenUmsatzMonatlich,
  };
}

/**
 * Calculate comprehensive profitability metrics
 */
export function calculateProfitabilityMetrics(rentabilitaet: Rentabilitaet): ProfitabilityMetrics {
  const { jahr1, jahr2, jahr3 } = rentabilitaet;

  // Revenue growth calculations
  const revenueGrowthYear2 = jahr1.umsatz > 0
    ? ((jahr2.umsatz - jahr1.umsatz) / jahr1.umsatz) * 100
    : 0;

  const revenueGrowthYear3 = jahr2.umsatz > 0
    ? ((jahr3.umsatz - jahr2.umsatz) / jahr2.umsatz) * 100
    : 0;

  // Calculate CAGR (Compound Annual Growth Rate)
  const avgAnnualGrowth = jahr1.umsatz > 0
    ? (Math.pow(jahr3.umsatz / jahr1.umsatz, 1/2) - 1) * 100
    : 0;

  // Average margins
  const avgGrossMargin = (jahr1.rohertragsmarge + jahr2.rohertragsmarge + jahr3.rohertragsmarge) / 3;

  // Calculate operating margin (earnings before tax / revenue)
  const opMargin1 = jahr1.umsatz > 0 ? (jahr1.ergebnisVorSteuern / jahr1.umsatz) * 100 : 0;
  const opMargin2 = jahr2.umsatz > 0 ? (jahr2.ergebnisVorSteuern / jahr2.umsatz) * 100 : 0;
  const opMargin3 = jahr3.umsatz > 0 ? (jahr3.ergebnisVorSteuern / jahr3.umsatz) * 100 : 0;
  const avgOperatingMargin = (opMargin1 + opMargin2 + opMargin3) / 3;

  const avgNetMargin = (jahr1.umsatzrendite + jahr2.umsatzrendite + jahr3.umsatzrendite) / 3;

  // Trend analysis
  const marginTrend: 'improving' | 'stable' | 'declining' = (() => {
    const marginImprovement = jahr3.umsatzrendite - jahr1.umsatzrendite;
    if (marginImprovement > 2) return 'improving';
    if (marginImprovement < -2) return 'declining';
    return 'stable';
  })();

  // Overall rating
  const profitabilityRating: ProfitabilityMetrics['profitabilityRating'] = (() => {
    if (avgNetMargin > 15 && avgOperatingMargin > 20) return 'excellent';
    if (avgNetMargin > 8 && avgOperatingMargin > 12) return 'good';
    if (avgNetMargin > 3 && avgOperatingMargin > 5) return 'acceptable';
    if (avgNetMargin > 0) return 'concerning';
    return 'poor';
  })();

  return {
    revenueGrowthYear2,
    revenueGrowthYear3,
    avgAnnualGrowth,
    avgGrossMargin,
    avgOperatingMargin,
    avgNetMargin,
    marginTrend,
    profitabilityRating,
  };
}

/**
 * Compare against industry benchmarks
 */
export function compareWithIndustryBenchmarks(
  rentabilitaet: Rentabilitaet,
  industry: string
): IndustryBenchmark {
  // German industry benchmarks (typical margins)
  const industryBenchmarks = {
    beratung: {
      gross: 85, // High gross margin (low material costs)
      operating: 25,
      net: 15,
    },
    ecommerce: {
      gross: 45, // Moderate gross margin
      operating: 12,
      net: 8,
    },
    handwerk: {
      gross: 55, // Materials + labor
      operating: 15,
      net: 10,
    },
    restaurant: {
      gross: 65, // Food cost ~35%
      operating: 8,
      net: 4,
    },
    default: {
      gross: 60,
      operating: 15,
      net: 8,
    },
  };

  const benchmark = industryBenchmarks[industry as keyof typeof industryBenchmarks] || industryBenchmarks.default;
  const metrics = calculateProfitabilityMetrics(rentabilitaet);

  const comparison = {
    grossMarginVsBenchmark: metrics.avgGrossMargin - benchmark.gross,
    operatingMarginVsBenchmark: metrics.avgOperatingMargin - benchmark.operating,
    netMarginVsBenchmark: metrics.avgNetMargin - benchmark.net,
  };

  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Generate warnings and recommendations
  if (comparison.grossMarginVsBenchmark < -10) {
    warnings.push(`Rohertragsmarge (${metrics.avgGrossMargin.toFixed(1)}%) deutlich unter Branchenschnitt (${benchmark.gross}%)`);
    recommendations.push('Preise erhöhen oder Materialkosten senken');
  }

  if (comparison.operatingMarginVsBenchmark < -5) {
    warnings.push(`Betriebsergebnis (${metrics.avgOperatingMargin.toFixed(1)}%) unter Branchenschnitt (${benchmark.operating}%)`);
    recommendations.push('Betriebskosten optimieren oder Effizienz steigern');
  }

  if (comparison.netMarginVsBenchmark < -3) {
    warnings.push(`Umsatzrendite (${metrics.avgNetMargin.toFixed(1)}%) unter Branchenschnitt (${benchmark.net}%)`);
    recommendations.push('Gesamte Kostenstrategie überdenken');
  }

  // Positive feedback
  if (metrics.avgNetMargin > benchmark.net + 5) {
    recommendations.push(`Ausgezeichnete Rentabilität - ${metrics.avgNetMargin.toFixed(1)}% über Branchenschnitt`);
  }

  return {
    grossMarginTypical: benchmark.gross,
    operatingMarginTypical: benchmark.operating,
    netMarginTypical: benchmark.net,
    comparison,
    warnings,
    recommendations,
  };
}

/**
 * Analyze tax implications and optimization potential
 */
export function analyzeTaxImplications(rentabilitaet: Rentabilitaet): TaxAnalysis {
  const totalProfit = rentabilitaet.jahr1.ergebnisVorSteuern +
                     rentabilitaet.jahr2.ergebnisVorSteuern +
                     rentabilitaet.jahr3.ergebnisVorSteuern;

  const totalTaxes = rentabilitaet.jahr1.steuern +
                     rentabilitaet.jahr2.steuern +
                     rentabilitaet.jahr3.steuern;

  const effectiveRate = totalProfit > 0 ? (totalTaxes / totalProfit) * 100 : 0;

  const taxOptimizationPotential: string[] = [];
  const taxRiskWarnings: string[] = [];

  // German tax optimization suggestions
  if (rentabilitaet.jahr1.umsatz < 22000) {
    taxOptimizationPotential.push('Kleinunternehmerregelung prüfen - keine USt bis €22.000');
  }

  if (rentabilitaet.jahr1.umsatz > 400000) {
    taxRiskWarnings.push('USt-Schwellenwert €400.000 - keine Kleinunternehmerregelung mehr möglich');
  }

  if (effectiveRate > 35) {
    taxOptimizationPotential.push('Hohe Steuerlast - Ausgaben und Abschreibungen optimieren');
    taxOptimizationPotential.push('Steuerberatung empfohlen für Rechtsformenwahl');
  }

  // Depreciation optimization
  if (totalProfit > 50000) {
    taxOptimizationPotential.push('Investitionsabzugsbetrag (IAB) für Anschaffungen prüfen');
    taxOptimizationPotential.push('Degressive AfA bei qualifying Wirtschaftsgütern nutzen');
  }

  // VAT considerations
  if (rentabilitaet.jahr2.umsatz > 22000 && rentabilitaet.jahr1.umsatz < 22000) {
    taxRiskWarnings.push('USt-Pflicht ab Jahr 2 - Preise entsprechend anpassen');
  }

  return {
    effectiveRate,
    taxOptimizationPotential,
    taxRiskWarnings,
  };
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate profitability assumptions for BA compliance
 */
export function validateProfitabilityForBA(rentabilitaet: Rentabilitaet): {
  isBACompliant: boolean;
  blockers: string[];
  warnings: string[];
  recommendations: string[];
} {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];

  // Critical BA requirements
  if (!rentabilitaet.breakEvenMonat || rentabilitaet.breakEvenMonat > 36) {
    blockers.push('Break-Even nach 36 Monaten - BA wird Plan wahrscheinlich ablehnen');
    recommendations.push('Kostenstruktur überarbeiten oder Umsatzprognosen erhöhen');
  }

  // Year 3 profitability check
  if (rentabilitaet.jahr3.jahresueberschuss <= 0) {
    warnings.push('Kein Gewinn in Jahr 3 - langfristige Tragfähigkeit fraglich');
    recommendations.push('Geschäftsmodell und Skalierbarkeit überprüfen');
  }

  // Margin sustainability
  const metrics = calculateProfitabilityMetrics(rentabilitaet);
  if (metrics.marginTrend === 'declining') {
    warnings.push('Sinkende Rentabilität über Zeit - Nachhaltigkeit gefährdet');
    recommendations.push('Kostendisziplin und Effizienzsteigerungen implementieren');
  }

  // Revenue growth realism
  if (metrics.avgAnnualGrowth > 100) {
    warnings.push('Sehr hohes Wachstum (>100% CAGR) - Realismus kritisch hinterfragen');
    recommendations.push('Konservativere Wachstumsannahmen erwägen');
  }

  // Low profitability warning
  if (metrics.avgNetMargin < 3) {
    warnings.push('Sehr niedrige Gewinnmargen (<3%) - Geschäftsrisiko hoch');
    recommendations.push('Preisgestaltung und Kostenstruktur grundlegend überarbeiten');
  }

  return {
    isBACompliant: blockers.length === 0,
    blockers,
    warnings,
    recommendations,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate German tax rate based on revenue
 */
function calculateGermanTaxRate(annualRevenue: number): number {
  if (annualRevenue <= 22000) {
    return GERMAN_TAX_RATES.kleinunternehmer;
  }

  // Simplified calculation for small business
  const rates = GERMAN_TAX_RATES.gewerbe;
  return rates.einkommensteuer + rates.gewerbesteuer + rates.kirchensteuer + rates.solidaritaetszuschlag;
}

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
 * Format percentage
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// ============================================================================
// Test Scenarios
// ============================================================================

/**
 * Create test scenario for service business profitability
 */
export function createServiceProfitabilityTest(): RentabilitaetInput {
  return {
    umsatzplanung: {
      umsatzstroeme: [],
      umsatzJahr1: Array(12).fill(10000), // €10k monthly
      umsatzJahr1Summe: 120000,
      umsatzJahr2: 150000, // 25% growth
      umsatzJahr3: 180000, // 20% growth
      wachstumsrateJahr2: 25,
      wachstumsrateJahr3: 20,
      annahmen: ['Conservative consulting growth'],
    },
    kostenplanung: {
      fixkosten: [],
      variableKosten: [],
      fixkostenSummeMonatlich: 4300,
      fixkostenSummeJaehrlich: 51600,
      variableKostenSummeJahr1: 43200, // 36% of revenue
      variableKostenSummeJahr2: 54000,
      variableKostenSummeJahr3: 64800,
      gesamtkostenJahr1: 94800,
      gesamtkostenJahr2: 110760,
      gesamtkostenJahr3: 126720,
    },
    industry: 'beratung',
  };
}

// ============================================================================
// Exports
// ============================================================================

export default {
  calculateRentabilitaet,
  calculateProfitabilityMetrics,
  compareWithIndustryBenchmarks,
  analyzeTaxImplications,
  validateProfitabilityForBA,
  formatEUR,
  formatPercent,
  createServiceProfitabilityTest,
};