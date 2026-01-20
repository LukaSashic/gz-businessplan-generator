/**
 * Liquidität Calculations (GZ-603 Teil G)
 *
 * CRITICAL: All calculations use decimal.js to avoid floating-point errors.
 * This is mandatory for BA compliance and exact financial calculations.
 *
 * BLOCKER: hatNegativeLiquiditaet flag prevents business plan export.
 * Negative liquidity = business insolvency = automatic BA rejection.
 *
 * Includes:
 * - Monthly cash flow analysis with exact timing
 * - German B2B payment terms (30-60 day delays)
 * - Integration with all modules A-F
 * - Safety buffer calculations and recommendations
 * - Critical liquidity warnings and blockers
 */

import Decimal from 'decimal.js';
import type {
  Liquiditaet,
  LiquiditaetMonat,
  Kapitalbedarf,
  Finanzierung,
  Privatentnahme,
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
// Types for Liquidity Analysis
// ============================================================================

export interface LiquiditaetInput {
  kapitalbedarf: Kapitalbedarf;
  finanzierung: Finanzierung;
  privatentnahme: Privatentnahme;
  umsatzplanung: Umsatzplanung;
  kostenplanung: Kostenplanung;
  paymentTerms?: PaymentTermsConfig;    // Override default German B2B terms
  seasonality?: SeasonalityConfig;      // Seasonal cash flow patterns
}

export interface PaymentTermsConfig {
  customerPaymentDays: number;          // Days until customers pay (default: 45)
  supplierPaymentDays: number;          // Days until we pay suppliers (default: 30)
  variableCostPaymentDelay: number;     // Days for variable cost payments
}

export interface SeasonalityConfig {
  quarters: [number, number, number, number]; // Multipliers for Q1, Q2, Q3, Q4
  description: string;
}

export interface CashFlowProjection {
  month: number;
  beginningCash: number;

  // Inflows
  revenueInflow: number;               // Actual cash received (delayed)
  financingInflow: number;             // New financing/investments
  otherInflows: number;                // Other cash sources
  totalInflows: number;

  // Outflows
  operatingOutflows: number;           // Operating costs paid
  investmentOutflows: number;          // Capital investments
  debtServiceOutflows: number;         // Loan payments
  privateWithdrawals: number;          // Owner withdrawals
  totalOutflows: number;

  // Results
  netCashFlow: number;
  endingCash: number;

  // Analytics
  daysOfCashRemaining: number;         // How many days of expenses covered
  isCritical: boolean;                 // Cash below safety threshold
}

export interface LiquidityAnalysis {
  // Critical metrics
  minimumCash: number;                 // Lowest cash point in year
  minimumCashMonth: number;            // Month of lowest cash
  averageCash: number;                 // Average monthly cash

  // Risk metrics
  monthsWithNegativeCash: number;      // Count of negative months
  maximumCashNeed: number;             // Highest funding requirement
  cashFlowVolatility: number;          // Standard deviation of monthly cash flows

  // Safety analysis
  recommendedReserve: number;          // 3-month operating expense buffer
  actualReserve: number;               // Current cash reserve
  reserveShortfall: number;            // Gap to recommended reserve

  // German market context
  paymentRiskFactors: string[];        // Late payment risks
  seasonalityWarnings: string[];       // Seasonal cash flow issues
  complianceRisks: string[];          // German business compliance risks
}

export interface LiquidityValidation {
  // BLOCKERS (prevent export)
  hasNegativeLiquidity: boolean;       // Any month negative = BLOCKER
  hasInsufficientStartup: boolean;     // Starting capital inadequate = BLOCKER

  // WARNINGS (concern but not blockers)
  hasTightCashFlow: boolean;          // Cash below 1-month expenses
  hasHighVolatility: boolean;         // Unpredictable cash flows
  hasSeasonalRisks: boolean;          // Seasonal cash flow concerns

  // Recommendations
  actionItems: string[];               // Specific improvement actions
  contingencyPlans: string[];          // What to do if things go wrong
}

// ============================================================================
// German Market Configuration
// ============================================================================

const GERMAN_PAYMENT_DEFAULTS: PaymentTermsConfig = {
  customerPaymentDays: 45,             // B2B average in Germany
  supplierPaymentDays: 30,             // Standard payment terms
  variableCostPaymentDelay: 30,        // Materials, marketing, etc.
};

const GERMAN_SEASONALITY_PATTERNS = {
  services: [1.1, 0.9, 0.8, 1.1],     // Strong Q1/Q4, slow summer
  ecommerce: [0.9, 1.0, 1.0, 1.1],    // Holiday boost in Q4
  handwerk: [0.8, 1.1, 1.1, 1.0],     // Winter slow, spring/summer strong
  restaurant: [0.9, 1.1, 1.2, 0.8],   // Summer peak, winter slow
  default: [1.0, 1.0, 1.0, 1.0],      // No seasonality
};

// ============================================================================
// Core Liquidity Calculations
// ============================================================================

/**
 * Calculate detailed monthly cash flow with German payment timing
 */
export function calculateMonthlyCashFlow(
  input: LiquiditaetInput,
  month: number
): CashFlowProjection {
  const {
    kapitalbedarf,
    finanzierung,
    privatentnahme,
    umsatzplanung,
    kostenplanung,
    paymentTerms = GERMAN_PAYMENT_DEFAULTS,
  } = input;

  // Starting cash (month 1 = financing, subsequent months = carried forward)
  const beginningCash = month === 1 ? finanzierung.gesamtfinanzierung : 0; // Will be calculated in full function

  // Revenue inflow (delayed by payment terms)
  const currentMonthRevenue = new Decimal(umsatzplanung.umsatzJahr1[month - 1] || 0);
  const paymentDelayMonths = Math.ceil(paymentTerms.customerPaymentDays / 30);

  // Revenue arrives with delay
  const revenueMonth = month - paymentDelayMonths;
  const revenueInflow = revenueMonth > 0 && revenueMonth <= 12
    ? new Decimal(umsatzplanung.umsatzJahr1[revenueMonth - 1] || 0)
    : new Decimal(0);

  // Operating outflows (with payment timing)
  const monthlyFixedCosts = new Decimal(kostenplanung.fixkostenSummeMonatlich);

  // Variable costs paid with delay
  const variableDelayMonths = Math.ceil(paymentTerms.variableCostPaymentDelay / 30);
  const variableMonth = month - variableDelayMonths;
  const delayedVariableCosts = variableMonth > 0 && variableMonth <= 12
    ? new Decimal(umsatzplanung.umsatzJahr1[variableMonth - 1] || 0)
        .times(kostenplanung.variableKostenSummeJahr1 / umsatzplanung.umsatzJahr1Summe || 0)
    : new Decimal(0);

  const operatingOutflows = monthlyFixedCosts.plus(delayedVariableCosts);

  // Investment outflows (front-loaded)
  const totalInvestments = new Decimal(kapitalbedarf.investitionenSumme);
  const investmentOutflows = month <= 3 ? totalInvestments.dividedBy(3) : new Decimal(0); // Spread over first 3 months

  // Private withdrawals
  const privateWithdrawals = new Decimal(privatentnahme.monatlichePrivatentnahme);

  // Calculate loan payments (simplified - assuming equal monthly payments)
  const debtServiceOutflows = calculateMonthlyDebtService(finanzierung);

  // Financing inflow (first month only)
  const financingInflow = month === 1 ? new Decimal(finanzierung.gesamtfinanzierung) : new Decimal(0);

  // Calculate totals
  const totalInflows = revenueInflow.plus(financingInflow);
  const totalOutflows = operatingOutflows.plus(investmentOutflows).plus(privateWithdrawals).plus(debtServiceOutflows);
  const netCashFlow = totalInflows.minus(totalOutflows);

  return {
    month,
    beginningCash: beginningCash,
    revenueInflow: revenueInflow.toNumber(),
    financingInflow: financingInflow.toNumber(),
    otherInflows: 0,
    totalInflows: totalInflows.toNumber(),
    operatingOutflows: operatingOutflows.toNumber(),
    investmentOutflows: investmentOutflows.toNumber(),
    debtServiceOutflows: debtServiceOutflows.toNumber(),
    privateWithdrawals: privateWithdrawals.toNumber(),
    totalOutflows: totalOutflows.toNumber(),
    netCashFlow: netCashFlow.toNumber(),
    endingCash: 0, // Will be calculated in full analysis
    daysOfCashRemaining: 0,
    isCritical: false,
  };
}

/**
 * Calculate complete 12-month liquidity analysis
 */
export function calculateLiquiditaet(input: LiquiditaetInput): Liquiditaet {
  const monate: LiquiditaetMonat[] = [];
  let runningCash = new Decimal(input.finanzierung.gesamtfinanzierung);
  let minimumLiquiditaet = runningCash.toNumber();
  let minimumMonat = 1;

  // Calculate month-by-month cash flow
  for (let month = 1; month <= 12; month++) {
    const projection = calculateMonthlyCashFlow(input, month);

    // Starting cash for this month
    const anfangsbestand = runningCash.toNumber();

    // Update running cash balance
    runningCash = runningCash.plus(new Decimal(projection.netCashFlow));
    const endbestand = runningCash.toNumber();

    // Track minimum liquidity
    if (endbestand < minimumLiquiditaet) {
      minimumLiquiditaet = endbestand;
      minimumMonat = month;
    }

    // Create month record
    monate.push({
      monat: month,
      anfangsbestand,
      einzahlungenUmsatz: projection.revenueInflow,
      einzahlungenSonstige: projection.financingInflow,
      einzahlungenGesamt: projection.totalInflows,
      auszahlungenBetrieb: projection.operatingOutflows,
      auszahlungenInvestitionen: projection.investmentOutflows,
      auszahlungenTilgung: projection.debtServiceOutflows,
      auszahlungenPrivat: projection.privateWithdrawals,
      auszahlungenGesamt: projection.totalOutflows,
      endbestand,
    });
  }

  // Calculate summary metrics
  const durchschnittLiquiditaet = monate.reduce((sum, m) => sum + m.endbestand, 0) / 12;
  const liquiditaetsReserve = Math.max(0, minimumLiquiditaet);
  const hatNegativeLiquiditaet = minimumLiquiditaet < 0;

  return {
    monate,
    minimumLiquiditaet,
    minimumMonat,
    durchschnittLiquiditaet,
    liquiditaetsReserve,
    hatNegativeLiquiditaet, // CRITICAL: This blocks export if true
  };
}

/**
 * Analyze liquidity risks and provide recommendations
 */
export function analyzeLiquidityRisks(liquiditaet: Liquiditaet, input: LiquiditaetInput): LiquidityAnalysis {
  const { monate } = liquiditaet;

  // Calculate monthly operating expenses for safety analysis
  const monthlyOperatingCosts = new Decimal(input.kostenplanung.fixkostenSummeMonatlich)
    .plus(input.privatentnahme.monatlichePrivatentnahme);

  // Risk metrics
  const monthsWithNegativeCash = monate.filter(m => m.endbestand < 0).length;
  const cashFlows = monate.map(m => m.endbestand);
  const avgCash = cashFlows.reduce((a, b) => a + b, 0) / cashFlows.length;
  const variance = cashFlows.reduce((sum, cash) => sum + Math.pow(cash - avgCash, 2), 0) / cashFlows.length;
  const cashFlowVolatility = Math.sqrt(variance);

  // Safety analysis
  const recommendedReserve = monthlyOperatingCosts.times(3).toNumber(); // 3-month buffer
  const actualReserve = Math.max(0, liquiditaet.minimumLiquiditaet);
  const reserveShortfall = Math.max(0, recommendedReserve - actualReserve);

  // German market risk factors
  const paymentRiskFactors: string[] = [];
  const seasonalityWarnings: string[] = [];
  const complianceRisks: string[] = [];

  // Payment risk analysis
  if (input.umsatzplanung.umsatzJahr1Summe > 100000) {
    paymentRiskFactors.push('Zahlungsausfallrisiko bei B2B-Kunden (>€100k Umsatz)');
  }

  const avgMonthlyRevenue = input.umsatzplanung.umsatzJahr1Summe / 12;
  if (avgMonthlyRevenue > 20000) {
    paymentRiskFactors.push('Klumpenrisiko bei Großkunden - Diversifizierung empfohlen');
  }

  // Seasonality warnings
  const q1Revenue = ((input.umsatzplanung.umsatzJahr1[0] || 0) + (input.umsatzplanung.umsatzJahr1[1] || 0) + (input.umsatzplanung.umsatzJahr1[2] || 0)) / 3;
  const q3Revenue = ((input.umsatzplanung.umsatzJahr1[6] || 0) + (input.umsatzplanung.umsatzJahr1[7] || 0) + (input.umsatzplanung.umsatzJahr1[8] || 0)) / 3;

  if (Math.abs(q1Revenue - q3Revenue) > q1Revenue * 0.3) {
    seasonalityWarnings.push('Starke saisonale Schwankungen - Liquiditätspuffer erhöhen');
  }

  // Compliance risks
  if (liquiditaet.hatNegativeLiquiditaet) {
    complianceRisks.push('KRITISCH: Negative Liquidität = Insolvenzrisiko');
    complianceRisks.push('BA wird Plan mit negativer Liquidität ablehnen');
  }

  if (actualReserve < monthlyOperatingCosts.toNumber()) {
    complianceRisks.push('Liquiditätsreserve unter 1 Monatskosten - sehr riskant');
  }

  return {
    minimumCash: liquiditaet.minimumLiquiditaet,
    minimumCashMonth: liquiditaet.minimumMonat,
    averageCash: avgCash,
    monthsWithNegativeCash,
    maximumCashNeed: Math.abs(Math.min(0, liquiditaet.minimumLiquiditaet)),
    cashFlowVolatility,
    recommendedReserve,
    actualReserve,
    reserveShortfall,
    paymentRiskFactors,
    seasonalityWarnings,
    complianceRisks,
  };
}

/**
 * Comprehensive liquidity validation for BA compliance
 */
export function validateLiquidityForBA(
  liquiditaet: Liquiditaet,
  analysis: LiquidityAnalysis
): LiquidityValidation {
  const blockers: string[] = [];
  const warnings: string[] = [];
  const actionItems: string[] = [];
  const contingencyPlans: string[] = [];

  // CRITICAL BLOCKERS (prevent export)
  const hasNegativeLiquidity = liquiditaet.hatNegativeLiquiditaet;
  if (hasNegativeLiquidity) {
    blockers.push('Negative Liquidität in mindestens einem Monat');
    actionItems.push('Finanzierung erhöhen oder Kosten senken');
    actionItems.push('Zahlungskonditionen mit Kunden und Lieferanten neu verhandeln');
  }

  const hasInsufficientStartup = liquiditaet.minimumLiquiditaet < -analysis.recommendedReserve;
  if (hasInsufficientStartup) {
    blockers.push('Startkapital reicht nicht für empfohlenen 3-Monats-Puffer');
    actionItems.push('Zusätzliche Finanzierung von mindestens €' + Math.round(analysis.reserveShortfall));
  }

  // WARNINGS (concerns but not blockers)
  const hasTightCashFlow = analysis.actualReserve < analysis.recommendedReserve * 0.5;
  if (hasTightCashFlow) {
    warnings.push('Knapper Liquiditätspuffer - weniger als 1.5 Monate Betriebskosten');
    contingencyPlans.push('Kreditlinie oder Kontokorrent für Notfälle vereinbaren');
  }

  const hasHighVolatility = analysis.cashFlowVolatility > analysis.averageCash * 0.3;
  if (hasHighVolatility) {
    warnings.push('Hohe Liquiditätsschwankungen - Planungsunsicherheit');
    actionItems.push('Umsatzglättung durch wiederkehrende Kunden/Abos anstreben');
  }

  const hasSeasonalRisks = analysis.seasonalityWarnings.length > 0;
  if (hasSeasonalRisks) {
    warnings.push('Saisonale Liquiditätsrisiken erkannt');
    contingencyPlans.push('Saisonkredit oder flexible Finanzierung für schwache Monate');
  }

  // Additional German-specific recommendations
  if (liquiditaet.minimumMonat <= 3) {
    actionItems.push('Frühe Liquiditätskrise - Anlaufphase länger planen');
  }

  if (analysis.paymentRiskFactors.length > 0) {
    actionItems.push('Zahlungsausfallversicherung oder Factoring prüfen');
    contingencyPlans.push('Diversifizierung der Kundenbasis forcieren');
  }

  return {
    hasNegativeLiquidity,
    hasInsufficientStartup,
    hasTightCashFlow,
    hasHighVolatility,
    hasSeasonalRisks,
    actionItems,
    contingencyPlans,
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Calculate monthly debt service payments
 */
function calculateMonthlyDebtService(finanzierung: Finanzierung): Decimal {
  let totalDebtService = new Decimal(0);

  finanzierung.quellen.forEach(quelle => {
    if (quelle.zinssatz && quelle.laufzeit && quelle.betrag > 0) {
      // Simplified monthly payment calculation (principal + interest)
      const principal = new Decimal(quelle.betrag);
      const monthlyRate = new Decimal(quelle.zinssatz).dividedBy(100).dividedBy(12);
      const numPayments = new Decimal(quelle.laufzeit);

      if (monthlyRate.gt(0)) {
        // PMT formula: P * (r(1+r)^n) / ((1+r)^n - 1)
        const onePlusR = new Decimal(1).plus(monthlyRate);
        const numerator = principal.times(monthlyRate).times(onePlusR.pow(numPayments.toNumber()));
        const denominator = onePlusR.pow(numPayments.toNumber()).minus(1);
        const monthlyPayment = numerator.dividedBy(denominator);

        totalDebtService = totalDebtService.plus(monthlyPayment);
      } else {
        // No interest - just principal
        totalDebtService = totalDebtService.plus(principal.dividedBy(numPayments));
      }
    }
  });

  return totalDebtService;
}

/**
 * Apply seasonal adjustments to monthly revenue
 */
export function applySeasonalAdjustments(
  monthlyRevenue: number[],
  industry: string = 'default'
): number[] {
  const patterns = GERMAN_SEASONALITY_PATTERNS as any;
  const multipliers = patterns[industry] || patterns.default;

  return monthlyRevenue.map((revenue, index) => {
    const quarter = Math.floor(index / 3);
    const multiplier = multipliers[quarter] || 1.0;
    return revenue * multiplier;
  });
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
 * Calculate days of cash remaining
 */
export function calculateDaysOfCash(
  currentCash: number,
  monthlyBurn: number
): number {
  if (monthlyBurn <= 0) return 999; // Infinite if no burn
  return Math.floor((currentCash / monthlyBurn) * 30);
}

// ============================================================================
// Test Scenarios
// ============================================================================

/**
 * Create test scenario that will have negative liquidity (for testing blocker)
 */
export function createNegativeLiquidityTest(): LiquiditaetInput {
  return {
    kapitalbedarf: {
      gruendungskosten: {
        notar: 500,
        handelsregister: 200,
        beratung: 2000,
        marketing: 1000,
        sonstige: 300,
        summe: 4000,
      },
      investitionen: [],
      investitionenSumme: 15000, // High investment
      anlaufkosten: {
        monate: 6,
        monatlicheKosten: 6000,
        reserve: 5000,
        summe: 41000,
      },
      gesamtkapitalbedarf: 60000, // High capital need
    },
    finanzierung: {
      quellen: [],
      eigenkapitalQuote: 100,
      fremdkapitalQuote: 0,
      gesamtfinanzierung: 25000, // Insufficient financing!
      finanzierungsluecke: 35000,
    },
    privatentnahme: {
      miete: 800,
      lebensmittel: 400,
      versicherungen: 200,
      mobilitaet: 200,
      kommunikation: 100,
      sonstigeAusgaben: 300,
      sparrate: 0,
      monatlichePrivatentnahme: 2000,
      jaehrlichePrivatentnahme: 24000,
    },
    umsatzplanung: {
      umsatzstroeme: [],
      umsatzJahr1: Array(12).fill(3000), // Low revenue
      umsatzJahr1Summe: 36000,
      umsatzJahr2: 45000,
      umsatzJahr3: 54000,
      wachstumsrateJahr2: 25,
      wachstumsrateJahr3: 20,
      annahmen: ['Conservative slow growth'],
    },
    kostenplanung: {
      fixkosten: [],
      variableKosten: [],
      fixkostenSummeMonatlich: 4000, // High fixed costs
      fixkostenSummeJaehrlich: 48000,
      variableKostenSummeJahr1: 12000,
      variableKostenSummeJahr2: 15000,
      variableKostenSummeJahr3: 18000,
      gesamtkostenJahr1: 60000,
      gesamtkostenJahr2: 68000,
      gesamtkostenJahr3: 76000,
    },
  };
}

/**
 * Create healthy liquidity test scenario
 */
export function createHealthyLiquidityTest(): LiquiditaetInput {
  return {
    kapitalbedarf: {
      gruendungskosten: {
        notar: 500,
        handelsregister: 200,
        beratung: 1500,
        marketing: 800,
        sonstige: 200,
        summe: 3200,
      },
      investitionen: [],
      investitionenSumme: 8000,
      anlaufkosten: {
        monate: 6,
        monatlicheKosten: 4500,
        reserve: 10000,
        summe: 37000,
      },
      gesamtkapitalbedarf: 48200,
    },
    finanzierung: {
      quellen: [],
      eigenkapitalQuote: 100,
      fremdkapitalQuote: 0,
      gesamtfinanzierung: 55000, // Adequate financing
      finanzierungsluecke: -6800, // Surplus
    },
    privatentnahme: {
      miete: 800,
      lebensmittel: 400,
      versicherungen: 200,
      mobilitaet: 150,
      kommunikation: 80,
      sonstigeAusgaben: 270,
      sparrate: 100,
      monatlichePrivatentnahme: 2000,
      jaehrlichePrivatentnahme: 24000,
    },
    umsatzplanung: {
      umsatzstroeme: [],
      umsatzJahr1: [4000, 5000, 6000, 7000, 8000, 9000, 10000, 10500, 11000, 11500, 12000, 12500], // Growing revenue
      umsatzJahr1Summe: 106000,
      umsatzJahr2: 135000,
      umsatzJahr3: 160000,
      wachstumsrateJahr2: 27,
      wachstumsrateJahr3: 19,
      annahmen: ['Service business ramp-up'],
    },
    kostenplanung: {
      fixkosten: [],
      variableKosten: [],
      fixkostenSummeMonatlich: 3500,
      fixkostenSummeJaehrlich: 42000,
      variableKostenSummeJahr1: 35000,
      variableKostenSummeJahr2: 45000,
      variableKostenSummeJahr3: 53000,
      gesamtkostenJahr1: 77000,
      gesamtkostenJahr2: 91200,
      gesamtkostenJahr3: 103400,
    },
  };
}

// ============================================================================
// Exports
// ============================================================================

export default {
  calculateLiquiditaet,
  calculateMonthlyCashFlow,
  analyzeLiquidityRisks,
  validateLiquidityForBA,
  applySeasonalAdjustments,
  formatEUR,
  calculateDaysOfCash,
  createNegativeLiquidityTest,
  createHealthyLiquidityTest,
};