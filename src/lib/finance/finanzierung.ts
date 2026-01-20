/**
 * Finanzierung Calculations (GZ-601)
 *
 * CRITICAL: All calculations use decimal.js to avoid floating-point errors.
 * This is mandatory for BA compliance and exact financial calculations.
 *
 * Includes:
 * - Financing source calculations
 * - Equity/debt ratio calculations
 * - Interest and loan payment calculations
 * - Financing gap analysis
 * - Risk assessment
 */

import Decimal from 'decimal.js';
import type {
  Finanzierung,
  Finanzierungsquelle,
  FinanzierungsquelleType,
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
// Core Financing Calculations
// ============================================================================

/**
 * Calculate total financing from all sources
 */
export function calculateGesamtfinanzierung(quellen: Finanzierungsquelle[]): number {
  if (quellen.length === 0) return 0;

  const total = quellen.reduce((sum, quelle) => {
    return sum.plus(new Decimal(quelle.betrag));
  }, new Decimal(0));

  return total.toNumber();
}

/**
 * Calculate financing by type
 */
export function calculateFinancingByType(
  quellen: Finanzierungsquelle[]
): Record<FinanzierungsquelleType, number> {
  const typeMap: Record<FinanzierungsquelleType, Decimal> = {
    eigenkapital: new Decimal(0),
    gruendungszuschuss: new Decimal(0),
    bankkredit: new Decimal(0),
    foerderkredit: new Decimal(0),
    beteiligung: new Decimal(0),
    crowdfunding: new Decimal(0),
    family_friends: new Decimal(0),
    andere: new Decimal(0),
  };

  quellen.forEach((quelle) => {
    const amount = new Decimal(quelle.betrag);
    typeMap[quelle.typ] = typeMap[quelle.typ].plus(amount);
  });

  return Object.fromEntries(
    Object.entries(typeMap).map(([type, decimal]) => [
      type,
      decimal.toNumber()
    ])
  ) as Record<FinanzierungsquelleType, number>;
}

/**
 * Calculate equity and debt ratios
 */
export function calculateEquityDebtRatios(
  quellen: Finanzierungsquelle[]
): {
  eigenkapitalQuote: number;
  fremdkapitalQuote: number;
  eigenkapital: number;
  fremdkapital: number;
} {
  const byType = calculateFinancingByType(quellen);

  // Define which sources count as equity vs debt
  const eigenkapitalSources: FinanzierungsquelleType[] = [
    'eigenkapital',
    'gruendungszuschuss', // GZ is grant, not debt
    'beteiligung',
    'crowdfunding', // Assuming reward-based
  ];

  const eigenkapital = eigenkapitalSources.reduce((sum, type) => {
    return sum.plus(new Decimal(byType[type] || 0));
  }, new Decimal(0));

  const fremdkapital = new Decimal(byType.bankkredit || 0)
    .plus(new Decimal(byType.foerderkredit || 0))
    .plus(new Decimal(byType.family_friends || 0)) // Assuming loans
    .plus(new Decimal(byType.andere || 0)); // Assuming debt

  const total = eigenkapital.plus(fremdkapital);

  return {
    eigenkapital: eigenkapital.toNumber(),
    fremdkapital: fremdkapital.toNumber(),
    eigenkapitalQuote: total.eq(0) ? 0 : eigenkapital.dividedBy(total).times(100).toNumber(),
    fremdkapitalQuote: total.eq(0) ? 0 : fremdkapital.dividedBy(total).times(100).toNumber(),
  };
}

/**
 * Calculate financing gap (negative = surplus)
 */
export function calculateFinancingGap(
  kapitalbedarf: number,
  gesamtfinanzierung: number
): number {
  const kapitalbedarfDecimal = new Decimal(kapitalbedarf);
  const finanzierungDecimal = new Decimal(gesamtfinanzierung);

  return kapitalbedarfDecimal.minus(finanzierungDecimal).toNumber();
}

// ============================================================================
// Loan Calculations
// ============================================================================

/**
 * Calculate monthly loan payment (annuity)
 * Formula: P = L * (r(1+r)^n) / ((1+r)^n - 1)
 */
export function calculateLoanPayment(
  principal: number,
  annualInterestRate: number,
  termInMonths: number
): {
  monthlyPayment: number;
  totalInterest: number;
  totalPayments: number;
} {
  const principalDecimal = new Decimal(principal);
  const monthlyRate = new Decimal(annualInterestRate).dividedBy(100).dividedBy(12);
  const termDecimal = new Decimal(termInMonths);

  if (monthlyRate.eq(0)) {
    // No interest case
    const monthlyPayment = principalDecimal.dividedBy(termDecimal);
    return {
      monthlyPayment: monthlyPayment.toNumber(),
      totalInterest: 0,
      totalPayments: principalDecimal.toNumber(),
    };
  }

  // Calculate (1 + r)^n
  const onePlusRate = new Decimal(1).plus(monthlyRate);
  const compoundFactor = onePlusRate.pow(termDecimal.toNumber());

  // Calculate monthly payment
  const numerator = principalDecimal.times(monthlyRate).times(compoundFactor);
  const denominator = compoundFactor.minus(1);
  const monthlyPayment = numerator.dividedBy(denominator);

  const totalPayments = monthlyPayment.times(termDecimal);
  const totalInterest = totalPayments.minus(principalDecimal);

  return {
    monthlyPayment: Math.round(monthlyPayment.toNumber() * 100) / 100,
    totalInterest: Math.round(totalInterest.toNumber() * 100) / 100,
    totalPayments: Math.round(totalPayments.toNumber() * 100) / 100,
  };
}

/**
 * Calculate loan amortization schedule (first 12 months)
 */
export function calculateLoanAmortization(
  principal: number,
  annualInterestRate: number,
  termInMonths: number,
  monthsToCalculate: number = 12
): Array<{
  month: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}> {
  const payment = calculateLoanPayment(principal, annualInterestRate, termInMonths);
  let balance = new Decimal(principal);
  const monthlyRate = new Decimal(annualInterestRate).dividedBy(100).dividedBy(12);
  const monthlyPaymentDecimal = new Decimal(payment.monthlyPayment);

  const schedule = [];

  for (let month = 1; month <= Math.min(monthsToCalculate, termInMonths); month++) {
    const interestPayment = balance.times(monthlyRate);
    const principalPayment = monthlyPaymentDecimal.minus(interestPayment);
    balance = balance.minus(principalPayment);

    schedule.push({
      month,
      payment: monthlyPaymentDecimal.toNumber(),
      interest: interestPayment.toNumber(),
      principal: principalPayment.toNumber(),
      balance: Math.max(0, balance.toNumber()), // Prevent negative balance
    });
  }

  return schedule;
}

// ============================================================================
// Risk Assessment
// ============================================================================

/**
 * Assess financing risk level
 */
export function assessFinancingRisk(
  finanzierung: Partial<Finanzierung>,
  kapitalbedarf: number
): {
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskFactors: string[];
  recommendations: string[];
} {
  const riskFactors: string[] = [];
  const recommendations: string[] = [];

  const eigenkapitalQuote = finanzierung.eigenkapitalQuote || 0;
  const fremdkapitalQuote = finanzierung.fremdkapitalQuote || 0;
  const gap = finanzierung.finanzierungsluecke || 0;

  // Equity ratio assessment
  if (eigenkapitalQuote < 15) {
    riskFactors.push('Sehr niedrige Eigenkapitalquote (<15%)');
    recommendations.push('Eigenkapital erhöhen oder Kapitalbedarf reduzieren');
  } else if (eigenkapitalQuote < 25) {
    riskFactors.push('Niedrige Eigenkapitalquote (<25%)');
    recommendations.push('Sicherheiten oder Bürgen für Kredite organisieren');
  }

  // Debt ratio assessment
  if (fremdkapitalQuote > 85) {
    riskFactors.push('Sehr hohe Verschuldung (>85%)');
    recommendations.push('Fremdkapital reduzieren oder alternative Finanzierung suchen');
  } else if (fremdkapitalQuote > 75) {
    riskFactors.push('Hohe Verschuldung (>75%)');
    recommendations.push('Tilgungsplan konservativ planen');
  }

  // Financing gap assessment
  if (gap > 0) {
    const gapPercent = new Decimal(gap).dividedBy(kapitalbedarf).times(100);

    if (gapPercent.gt(20)) {
      riskFactors.push(`Große Finanzierungslücke (${gapPercent.toFixed(1)}%)`);
      recommendations.push('Zusätzliche Finanzierungsquellen erschließen');
    } else if (gapPercent.gt(10)) {
      riskFactors.push(`Finanzierungslücke (${gapPercent.toFixed(1)}%)`);
      recommendations.push('Reserveplan für Finanzierungslücke entwickeln');
    }
  }

  // Determine overall risk level
  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';

  if (eigenkapitalQuote <= 10 || fremdkapitalQuote >= 90 || gap > kapitalbedarf * 0.3) {
    riskLevel = 'critical';
  } else if (eigenkapitalQuote < 15 || fremdkapitalQuote > 85 || gap > kapitalbedarf * 0.20) {
    riskLevel = 'high';
  } else if (eigenkapitalQuote < 20 || fremdkapitalQuote > 75 || gap > kapitalbedarf * 0.10) {
    riskLevel = 'medium';
  }

  return {
    riskLevel,
    riskFactors,
    recommendations,
  };
}

// ============================================================================
// Gründungszuschuss Calculations
// ============================================================================

/**
 * Calculate Gründungszuschuss amounts based on previous ALG I
 */
export function calculateGruendungszuschuss(
  previousALG1: number,
  _hasChildren: boolean = false,
  phase1Months: number = 6,
  phase2Months: number = 9
): {
  phase1Monthly: number;
  phase1Total: number;
  phase2Monthly: number;
  phase2Total: number;
  totalGZ: number;
} {
  const alg1Decimal = new Decimal(previousALG1);
  const phase1MonthsDecimal = new Decimal(phase1Months);
  const phase2MonthsDecimal = new Decimal(phase2Months);

  // Phase 1: ALG I + €300 social security
  const phase1Monthly = alg1Decimal.plus(300);
  const phase1Total = phase1Monthly.times(phase1MonthsDecimal);

  // Phase 2: €300 social security only
  const phase2Monthly = new Decimal(300);
  const phase2Total = phase2Monthly.times(phase2MonthsDecimal);

  const totalGZ = phase1Total.plus(phase2Total);

  return {
    phase1Monthly: phase1Monthly.toNumber(),
    phase1Total: phase1Total.toNumber(),
    phase2Monthly: phase2Monthly.toNumber(),
    phase2Total: phase2Total.toNumber(),
    totalGZ: totalGZ.toNumber(),
  };
}

// ============================================================================
// Complete Financing Calculation
// ============================================================================

/**
 * Calculate complete financing structure
 */
export function calculateFinanzierung(
  quellen: Finanzierungsquelle[],
  kapitalbedarf: number
): Finanzierung {
  const gesamtfinanzierung = calculateGesamtfinanzierung(quellen);
  const ratios = calculateEquityDebtRatios(quellen);
  const finanzierungsluecke = calculateFinancingGap(kapitalbedarf, gesamtfinanzierung);

  return {
    quellen,
    eigenkapitalQuote: ratios.eigenkapitalQuote,
    fremdkapitalQuote: ratios.fremdkapitalQuote,
    gesamtfinanzierung,
    finanzierungsluecke,
  };
}

// ============================================================================
// Scenario Testing
// ============================================================================

/**
 * Test standard GZ + Bank loan scenario
 */
export function testStandardFinancingScenario(
  eigenkapital: number = 10000,
  gzAmount: number = 18000,
  loanAmount: number = 22000
): Finanzierung {
  const quellen: Finanzierungsquelle[] = [
    {
      typ: 'eigenkapital',
      bezeichnung: 'Eigene Ersparnisse',
      betrag: eigenkapital,
      status: 'gesichert',
    },
    {
      typ: 'gruendungszuschuss',
      bezeichnung: 'Gründungszuschuss',
      betrag: gzAmount,
      status: 'beantragt',
    },
    {
      typ: 'bankkredit',
      bezeichnung: 'Hausbank Kredit',
      betrag: loanAmount,
      zinssatz: 4.5,
      laufzeit: 60,
      status: 'geplant',
    },
  ];

  return calculateFinanzierung(quellen, 50000); // €50k total need
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Format financing source for display
 */
export function formatFinancingSource(quelle: Finanzierungsquelle): string {
  const amount = new Decimal(quelle.betrag);
  const formatted = new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount.toNumber());

  const interest = quelle.zinssatz ? ` (${quelle.zinssatz}% p.a.)` : '';
  const term = quelle.laufzeit ? ` über ${quelle.laufzeit} Monate` : '';

  return `${quelle.bezeichnung}: ${formatted}${interest}${term}`;
}

/**
 * Validate financing source
 */
export function validateFinancingSource(quelle: Finanzierungsquelle): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (quelle.betrag <= 0) {
    errors.push('Betrag muss größer als 0 sein');
  }

  if (quelle.zinssatz && (quelle.zinssatz < 0 || quelle.zinssatz > 50)) {
    errors.push('Zinssatz muss zwischen 0% und 50% liegen');
  }

  if (quelle.laufzeit && quelle.laufzeit <= 0) {
    errors.push('Laufzeit muss positiv sein');
  }

  if (quelle.typ === 'gruendungszuschuss' && quelle.betrag > 25000) {
    errors.push('Gründungszuschuss kann maximal ca. €25.000 sein');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// ============================================================================
// Exports
// ============================================================================

export default {
  calculateGesamtfinanzierung,
  calculateFinancingByType,
  calculateEquityDebtRatios,
  calculateFinancingGap,
  calculateLoanPayment,
  calculateLoanAmortization,
  assessFinancingRisk,
  calculateGruendungszuschuss,
  calculateFinanzierung,
  testStandardFinancingScenario,
  formatFinancingSource,
  validateFinancingSource,
};