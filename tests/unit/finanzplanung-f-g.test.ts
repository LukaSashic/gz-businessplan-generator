/**
 * Finanzplanung Teil F-G Unit Tests (GZ-603)
 *
 * CRITICAL: Tests verify exact decimal.js calculations
 * - No floating-point errors allowed in profitability/liquidity calculations
 * - BA compliance validation for break-even and negative liquidity
 * - CBC pattern detection testing
 * - German market compliance (payment terms, taxes, seasonality)
 * - Integration with existing D+E data
 *
 * Test Categories:
 * - Break-even calculations with exact arithmetic
 * - Rentabilität calculations (Teil F)
 * - Liquidität calculations (Teil G) with negative liquidity blocking
 * - CBC pattern detection for profitability anxiety and cash flow fears
 * - Integration with modules D+E
 * - BA compliance scenarios
 * - German market specifics validation
 */

import { describe, it, expect, beforeAll } from 'vitest';
import Decimal from 'decimal.js';

// Import calculation functions - Break-even
import {
  calculateBreakEven,
  calculateBreakEvenFromFinanzplanung,
  analyzeBreakEvenScenarios,
  calculateBreakEvenSensitivity,
  validateBreakEvenRealism,
  calculateRevenueForTargetBreakEven,
  testServiceBreakEven,
  testEcommerceBreakEven,
  testManufacturingBreakEven,
  formatEUR,
} from '@/lib/finance/break-even';

// Import calculation functions - Rentabilität
import {
  calculateRentabilitaet,
  calculateProfitabilityMetrics,
  compareWithIndustryBenchmarks,
  analyzeTaxImplications,
  validateProfitabilityForBA,
  createServiceProfitabilityTest,
  formatPercent,
} from '@/lib/finance/rentabilitaet';

// Import calculation functions - Liquidität
import {
  calculateLiquiditaet,
  calculateMonthlyCashFlow,
  analyzeLiquidityRisks,
  validateLiquidityForBA,
  applySeasonalAdjustments,
  calculateDaysOfCash,
  createNegativeLiquidityTest,
  createHealthyLiquidityTest,
} from '@/lib/finance/liquiditaet';

// Import prompt modules for CBC testing
import {
  detectProfitabilityAnxiety,
  PROFITABILITY_ANXIETY_CBC_RESPONSES,
  getIndustryGuidance,
} from '@/lib/prompts/modules/finanzplanung/rentabilitaet';

import {
  detectCashFlowAnxiety,
  CASH_FLOW_ANXIETY_CBC_RESPONSES,
  getSeasonalPattern,
} from '@/lib/prompts/modules/finanzplanung/liquiditaet';

// Import types
import type {
  Rentabilitaet,
  Liquiditaet,
  Umsatzplanung,
  Kostenplanung,
  RentabilitaetInput,
} from '@/types/modules/finanzplanung';
import type { BreakEvenInput } from '@/lib/finance/break-even';
import type { LiquiditaetInput } from '@/lib/finance/liquiditaet';

// ============================================================================
// Setup
// ============================================================================

beforeAll(() => {
  // Configure decimal.js globally for tests
  Decimal.set({
    precision: 28,
    rounding: Decimal.ROUND_HALF_UP,
    toExpNeg: -28,
    toExpPos: 28,
  });
});

// ============================================================================
// Test Data
// ============================================================================

const createGZ50kScenario = () => {
  return {
    kapitalbedarf: {
      gruendungskosten: {
        notar: 500,
        handelsregister: 200,
        beratung: 1500,
        marketing: 1000,
        sonstige: 300,
        summe: 3500,
      },
      investitionen: [],
      investitionenSumme: 10000,
      anlaufkosten: {
        monate: 6,
        monatlicheKosten: 5000,
        reserve: 8000,
        summe: 38000,
      },
      gesamtkapitalbedarf: 51500,
    },
    finanzierung: {
      quellen: [],
      eigenkapitalQuote: 100,
      fremdkapitalQuote: 0,
      gesamtfinanzierung: 55000,
      finanzierungsluecke: -3500,
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
      umsatzstroeme: [] as any[],
      umsatzJahr1: [5000, 6000, 7000, 8000, 9000, 10000, 11000, 12000, 13000, 14000, 15000, 16000], // Growing
      umsatzJahr1Summe: 126000,
      umsatzJahr2: 160000,
      umsatzJahr3: 190000,
      wachstumsrateJahr2: 27,
      wachstumsrateJahr3: 19,
      annahmen: ['Conservative service business growth'],
    },
    kostenplanung: {
      fixkosten: [] as any[],
      variableKosten: [] as any[],
      fixkostenSummeMonatlich: 3500,
      fixkostenSummeJaehrlich: 42000,
      variableKostenSummeJahr1: 38000, // ~30% of revenue
      variableKostenSummeJahr2: 48000,
      variableKostenSummeJahr3: 57000,
      gesamtkostenJahr1: 80000,
      gesamtkostenJahr2: 94200,
      gesamtkostenJahr3: 107400,
    },
  } as const;
};

// ============================================================================
// Break-Even Calculation Tests
// ============================================================================

describe('Break-Even Calculations', () => {
  describe('Core Break-Even Logic', () => {
    it('should calculate break-even with decimal.js precision', () => {
      const input: BreakEvenInput = {
        fixkostenMonatlich: 5000,
        variableKostenProzent: 40,
        umsatzplanung: [6000, 7000, 8000, 8334, 8334, 8334, 8334, 8334, 8334, 8334, 8334, 8334],
      };

      const result = calculateBreakEven(input);

      // Break-even formula: 5000 / (1 - 0.4) = 5000 / 0.6 = 8333.333...
      expect(result.breakEvenUmsatzMonatlich).toBeCloseTo(8333.33, 2);
      expect(result.breakEvenUmsatzJaehrlich).toBeCloseTo(100000, 0);
      expect(result.deckungsbeitrag).toBe(60); // 100% - 40%
      expect(result.isReachableIn36Months).toBe(true);
      expect(result.breakEvenMonat).toBe(4); // Breaks even in month 4 when revenue hits 8334
    });

    it('should handle edge cases correctly', () => {
      const input: BreakEvenInput = {
        fixkostenMonatlich: 0,
        variableKostenProzent: 30,
      };

      const result = calculateBreakEven(input);
      expect(result.breakEvenUmsatzMonatlich).toBe(0);
      expect(result.isReachableIn36Months).toBe(true);
    });

    it('should reject invalid inputs', () => {
      expect(() => calculateBreakEven({
        fixkostenMonatlich: -1000,
        variableKostenProzent: 40,
      })).toThrow('Fixed costs cannot be negative');

      expect(() => calculateBreakEven({
        fixkostenMonatlich: 5000,
        variableKostenProzent: 100,
      })).toThrow('Variable cost percentage must be between 0 and 99');
    });

    it('should validate BA compliance (36 month limit)', () => {
      const highFixedCosts: BreakEvenInput = {
        fixkostenMonatlich: 20000, // Very high
        variableKostenProzent: 30,
        umsatzplanung: Array(36).fill(10000), // €10k monthly = insufficient
      };

      const result = calculateBreakEven(highFixedCosts);
      expect(result.isReachableIn36Months).toBe(false);
      expect(result.warnings).toContain('Break-Even nach 36 Monaten - BA könnte dies kritisch bewerten');
    });
  });

  describe('Break-Even Integration', () => {
    it('should integrate with existing finanzplanung data', () => {
      const scenario = createGZ50kScenario();

      const result = calculateBreakEvenFromFinanzplanung(
        scenario.kostenplanung,
        scenario.umsatzplanung
      );

      expect(result.breakEvenUmsatzMonatlich).toBeGreaterThan(0);
      expect(result.isReachableIn36Months).toBe(true);
      expect(result.industryComparison).toBeDefined();
    });

    it('should detect break-even timing correctly with real revenue progression', () => {
      const scenario = createGZ50kScenario();
      const result = calculateBreakEvenFromFinanzplanung(
        scenario.kostenplanung,
        scenario.umsatzplanung
      );

      // With 3500 fixed costs and ~30% variable costs, break-even should be around €5000/month
      // Revenue progression: 5k, 6k, 7k, 8k... should break even around month 7-8
      expect(result.breakEvenMonat).toBeGreaterThan(0);
      expect(result.breakEvenMonat).toBeLessThanOrEqual(12);
    });
  });

  describe('Industry Validation', () => {
    it('should validate different industry scenarios', () => {
      const serviceResult = testServiceBreakEven();
      expect(serviceResult.industryComparison.benchmarkComment).toContain('Break-Even');

      const ecommerceResult = testEcommerceBreakEven();
      expect(ecommerceResult.breakEvenUmsatzMonatlich).toBeGreaterThan(serviceResult.breakEvenUmsatzMonatlich);

      const manufacturingResult = testManufacturingBreakEven();
      expect(manufacturingResult.recommendations).toContain('Deckungsbeitrag unter 30%');
    });
  });
});

// ============================================================================
// Rentabilität (Profitability) Tests
// ============================================================================

describe('Rentabilität Calculations', () => {
  describe('Core Profitability Logic', () => {
    it('should calculate 3-year profitability with decimal.js precision', () => {
      const scenario = createServiceProfitabilityTest();
      const result = calculateRentabilitaet(scenario);

      // Verify structure
      expect(result.jahr1).toBeDefined();
      expect(result.jahr2).toBeDefined();
      expect(result.jahr3).toBeDefined();
      expect(result.breakEvenMonat).toBeGreaterThan(0);
      expect(result.breakEvenUmsatz).toBeGreaterThan(0);

      // Verify calculations are exact (no floating point errors)
      const jahr1 = result.jahr1;
      expect(jahr1.umsatz).toBe(120000);
      expect(jahr1.rohertrag).toBe(jahr1.umsatz - jahr1.materialaufwand);
      expect(jahr1.jahresueberschuss).toBe(jahr1.ergebnisVorSteuern - jahr1.steuern);

      // Margins should be reasonable for consulting
      expect(jahr1.rohertragsmarge).toBeGreaterThan(60); // High gross margin for services
      expect(jahr1.umsatzrendite).toBeGreaterThan(5); // Positive net margin
    });

    it('should handle growth scenarios correctly', () => {
      const scenario = createServiceProfitabilityTest();
      const result = calculateRentabilitaet(scenario);

      const metrics = calculateProfitabilityMetrics(result);

      expect(metrics.revenueGrowthYear2).toBeCloseTo(25, 1);
      expect(metrics.revenueGrowthYear3).toBeCloseTo(20, 1);
      expect(metrics.avgAnnualGrowth).toBeGreaterThan(20);
      expect(metrics.marginTrend).toBe('stable');
    });

    it('should apply German tax rates correctly', () => {
      const scenario = createServiceProfitabilityTest();
      const result = calculateRentabilitaet(scenario);

      const taxAnalysis = analyzeTaxImplications(result);

      // German effective tax rate should be 25-35%
      expect(taxAnalysis.effectiveRate).toBeGreaterThan(20);
      expect(taxAnalysis.effectiveRate).toBeLessThan(40);
      expect(taxAnalysis.taxOptimizationPotential).toContain('Kleinunternehmerregelung prüfen');
    });
  });

  describe('Industry Benchmarking', () => {
    it('should compare against industry benchmarks', () => {
      const scenario = createServiceProfitabilityTest();
      const result = calculateRentabilitaet(scenario);

      const benchmark = compareWithIndustryBenchmarks(result, 'beratung');

      expect(benchmark.grossMarginTypical).toBe(85);
      expect(benchmark.netMarginTypical).toBe(15);
      expect(benchmark.comparison.grossMarginVsBenchmark).toBeDefined();
    });

    it('should provide realistic industry guidance', () => {
      const guidance = getIndustryGuidance('beratung');
      expect(guidance.grossMargin.typical).toBe(85);
      expect(guidance.netMargin.typical).toBe(15);
      expect(guidance.guidance).toContain('hohe Margen');
    });
  });

  describe('BA Compliance Validation', () => {
    it('should validate profitability for BA compliance', () => {
      const scenario = createServiceProfitabilityTest();
      const result = calculateRentabilitaet(scenario);

      const validation = validateProfitabilityForBA(result);

      expect(validation.isBACompliant).toBe(true);
      expect(validation.blockers).toHaveLength(0);

      if (result.breakEvenMonat && result.breakEvenMonat > 36) {
        expect(validation.blockers).toContain('Break-Even nach 36 Monaten');
      }
    });

    it('should detect unrealistic growth patterns', () => {
      const unrealisticScenario: RentabilitaetInput = {
        umsatzplanung: {
          umsatzstroeme: [],
          umsatzJahr1: Array(12).fill(10000),
          umsatzJahr1Summe: 120000,
          umsatzJahr2: 500000, // 300%+ growth!
          umsatzJahr3: 1000000, // 100%+ growth!
          wachstumsrateJahr2: 317,
          wachstumsrateJahr3: 100,
          annahmen: ['Unrealistic hockey stick'],
        },
        kostenplanung: {
          fixkosten: [],
          variableKosten: [],
          fixkostenSummeMonatlich: 4000,
          fixkostenSummeJaehrlich: 48000,
          variableKostenSummeJahr1: 36000,
          variableKostenSummeJahr2: 150000,
          variableKostenSummeJahr3: 300000,
          gesamtkostenJahr1: 84000,
          gesamtkostenJahr2: 202800,
          gesamtkostenJahr3: 357600,
        },
      };

      const result = calculateRentabilitaet(unrealisticScenario);
      const metrics = calculateProfitabilityMetrics(result);
      const validation = validateProfitabilityForBA(result);

      expect(metrics.avgAnnualGrowth).toBeGreaterThan(100);
      expect(validation.warnings).toContain('Sehr hohes Wachstum (>100% CAGR)');
    });
  });
});

// ============================================================================
// Liquidität (Liquidity) Tests
// ============================================================================

describe('Liquidität Calculations', () => {
  describe('Core Liquidity Logic', () => {
    it('should calculate monthly cash flow with exact decimal arithmetic', () => {
      const scenario = createHealthyLiquidityTest();
      const result = calculateLiquiditaet(scenario);

      // Verify structure
      expect(result.monate).toHaveLength(12);
      expect(result.minimumLiquiditaet).toBeDefined();
      expect(result.minimumMonat).toBeGreaterThan(0);
      expect(result.minimumMonat).toBeLessThanOrEqual(12);
      expect(result.hatNegativeLiquiditaet).toBe(false);

      // Verify monthly calculations
      result.monate.forEach((monat, index) => {
        expect(monat.monat).toBe(index + 1);
        expect(monat.einzahlungenGesamt).toBe(
          monat.einzahlungenUmsatz + monat.einzahlungenSonstige
        );
        expect(monat.auszahlungenGesamt).toBe(
          monat.auszahlungenBetrieb +
          monat.auszahlungenInvestitionen +
          monat.auszahlungenTilgung +
          monat.auszahlungenPrivat
        );

        // Cash flow equation: beginning + inflows - outflows = ending
        expect(monat.endbestand).toBeCloseTo(
          monat.anfangsbestand + monat.einzahlungenGesamt - monat.auszahlungenGesamt,
          2
        );
      });
    });

    it('should detect negative liquidity (BLOCKER)', () => {
      const problematicScenario = createNegativeLiquidityTest();
      const result = calculateLiquiditaet(problematicScenario);

      expect(result.hatNegativeLiquiditaet).toBe(true);
      expect(result.minimumLiquiditaet).toBeLessThan(0);

      const validation = validateLiquidityForBA(result, analyzeLiquidityRisks(result, problematicScenario));
      expect(validation.hasNegativeLiquidity).toBe(true);
      expect(validation.actionItems).toContain('Finanzierung erhöhen oder Kosten senken');
    });

    it('should handle payment timing delays correctly', () => {
      const scenario = createHealthyLiquidityTest();

      // Test monthly cash flow calculation with payment delays
      const month3 = calculateMonthlyCashFlow(scenario, 3);

      expect(month3.month).toBe(3);
      expect(month3.revenueInflow).toBeGreaterThanOrEqual(0); // Delayed revenue from earlier months
      expect(month3.operatingOutflows).toBeGreaterThan(0); // Current month costs
    });
  });

  describe('German Payment Terms Integration', () => {
    it('should apply German B2B payment delays', () => {
      const scenario = createHealthyLiquidityTest();

      // Calculate first few months
      const month1 = calculateMonthlyCashFlow(scenario, 1);
      const month2 = calculateMonthlyCashFlow(scenario, 2);

      // Month 1 should have financing inflow but no revenue yet (45-day delay)
      expect(month1.financingInflow).toBeGreaterThan(0);
      expect(month1.revenueInflow).toBe(0); // No revenue yet due to payment delay

      // Month 2 should still have minimal revenue due to payment delays
      expect(month2.revenueInflow).toBeGreaterThanOrEqual(0);
    });

    it('should apply seasonal patterns correctly', () => {
      const monthlyRevenue = [10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000, 10000];

      const servicesSeasonal = applySeasonalAdjustments(monthlyRevenue, 'beratung');

      // Q1 should be higher, Q3 lower for services
      expect(servicesSeasonal[0]).toBeGreaterThan(monthlyRevenue[0]); // Q1 boost
      expect(servicesSeasonal[6]).toBeLessThan(monthlyRevenue[6]); // Q3 summer slowdown
    });

    it('should calculate appropriate safety buffers', () => {
      const scenario = createHealthyLiquidityTest();
      const result = calculateLiquiditaet(scenario);
      const analysis = analyzeLiquidityRisks(result, scenario);

      // 3-month buffer should be calculated
      const monthlyCosts = scenario.kostenplanung.fixkostenSummeMonatlich + scenario.privatentnahme.monatlichePrivatentnahme;
      expect(analysis.recommendedReserve).toBeCloseTo(monthlyCosts * 3, 100);
    });
  });

  describe('Risk Analysis', () => {
    it('should analyze liquidity risks comprehensively', () => {
      const scenario = createHealthyLiquidityTest();
      const result = calculateLiquiditaet(scenario);
      const analysis = analyzeLiquidityRisks(result, scenario);

      expect(analysis.minimumCash).toBe(result.minimumLiquiditaet);
      expect(analysis.minimumCashMonth).toBe(result.minimumMonat);
      expect(analysis.averageCash).toBeGreaterThan(0);
      expect(analysis.cashFlowVolatility).toBeGreaterThanOrEqual(0);
      expect(analysis.recommendedReserve).toBeGreaterThan(0);
    });

    it('should generate appropriate warnings for risks', () => {
      const riskyScenario = createNegativeLiquidityTest();
      const result = calculateLiquiditaet(riskyScenario);
      const analysis = analyzeLiquidityRisks(result, riskyScenario);

      expect(analysis.complianceRisks).toContain('KRITISCH: Negative Liquidität = Insolvenzrisiko');
      expect(analysis.complianceRisks).toContain('BA wird Plan mit negativer Liquidität ablehnen');
    });

    it('should calculate days of cash remaining correctly', () => {
      const daysOfCash = calculateDaysOfCash(30000, 10000); // €30k cash, €10k monthly burn
      expect(daysOfCash).toBe(90); // 3 months = 90 days

      const infiniteCash = calculateDaysOfCash(30000, 0); // No burn
      expect(infiniteCash).toBe(999);
    });
  });
});

// ============================================================================
// CBC Pattern Detection Tests
// ============================================================================

describe('CBC Pattern Detection', () => {
  describe('Profitability Anxiety Detection', () => {
    it('should detect immediate profit expectations', () => {
      const messages = [
        'Ich brauche sofort Gewinn ab dem ersten Monat',
        'Das Business muss gleich rentabel sein',
        'Break-Even nach Monat 1 ist mein Ziel',
      ];

      messages.forEach(message => {
        const detected = detectProfitabilityAnxiety(message);
        expect(detected).toBe('immediate_profit');
      });
    });

    it('should detect perfectionist margins', () => {
      const messages = [
        'Ich brauche minimum 25% Netto-Margin',
        'Unter 20% Gewinn ist inakzeptabel',
        'Hohe Marge ist wichtig für mich',
      ];

      messages.forEach(message => {
        const detected = detectProfitabilityAnxiety(message);
        expect(detected).toBe('perfectionist_margins');
      });
    });

    it('should provide appropriate CBC responses', () => {
      const response = PROFITABILITY_ANXIETY_CBC_RESPONSES.immediate_profit;

      expect(response.identify).toContain('sofortigen Gewinn');
      expect(response.evidence).toContain('erfolgreiche deutsche Unternehmen');
      expect(response.challenge).toContain('6-12 Monate Zeit');
      expect(response.reframe).toContain('strategischem Denken');
      expect(response.action).toContain('Break-Even für Monat 8-12');
    });
  });

  describe('Cash Flow Anxiety Detection', () => {
    it('should detect immediate payment expectations', () => {
      const messages = [
        'Meine Kunden zahlen sofort',
        'Payment bei Lieferung ist normal',
        '30 Tage Zahlungsziel ist zu lang',
      ];

      messages.forEach(message => {
        const detected = detectCashFlowAnxiety(message);
        expect(detected).toBe('immediate_payment');
      });
    });

    it('should detect buffer resistance', () => {
      const messages = [
        'Liquiditätspuffer ist verschwendetes Geld',
        'Cash bringt keine Zinsen',
        'Reserve ist übertrieben',
      ];

      messages.forEach(message => {
        const detected = detectCashFlowAnxiety(message);
        expect(detected).toBe('buffer_resistance');
      });
    });

    it('should detect negative liquidity panic', () => {
      const messages = [
        'Ein Minus-Monat bedeutet pleite',
        'Negativer Cash Flow = Katastrophe',
        'Game over bei negativem Cash',
      ];

      messages.forEach(message => {
        const detected = detectCashFlowAnxiety(message);
        expect(detected).toBe('negative_liquidity_panic');
      });
    });

    it('should provide appropriate CBC responses', () => {
      const response = CASH_FLOW_ANXIETY_CBC_RESPONSES.immediate_payment;

      expect(response.identify).toContain('sofortiger Zahlung');
      expect(response.evidence).toContain('Zahlungsziele');
      expect(response.challenge).toContain('30-45 Tage');
      expect(response.reframe).toContain('Standard-Geschäftspraxis');
      expect(response.action).toContain('45 Tagen Zahlungsziel');
    });
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('F-G Integration with D-E Data', () => {
  it('should integrate profitability with existing revenue/cost planning', () => {
    const scenario = createGZ50kScenario();

    // Test that we can create profitability analysis from D+E data
    const rentabilitaetInput: RentabilitaetInput = {
      umsatzplanung: scenario.umsatzplanung,
      kostenplanung: scenario.kostenplanung,
      industry: 'beratung',
    };

    const rentabilityResult = calculateRentabilitaet(rentabilitaetInput);

    expect(rentabilityResult.jahr1.umsatz).toBe(scenario.umsatzplanung.umsatzJahr1Summe);
    expect(rentabilityResult.jahr2.umsatz).toBe(scenario.umsatzplanung.umsatzJahr2);
    expect(rentabilityResult.jahr3.umsatz).toBe(scenario.umsatzplanung.umsatzJahr3);
    expect(rentabilityResult.breakEvenMonat).toBeGreaterThan(0);
  });

  it('should integrate liquidity with all A-F modules', () => {
    const scenario = createGZ50kScenario();

    const liquidityInput: LiquiditaetInput = {
      kapitalbedarf: scenario.kapitalbedarf,
      finanzierung: scenario.finanzierung,
      privatentnahme: scenario.privatentnahme,
      umsatzplanung: scenario.umsatzplanung,
      kostenplanung: scenario.kostenplanung,
    };

    const liquidityResult = calculateLiquiditaet(liquidityInput);

    expect(liquidityResult.monate).toHaveLength(12);
    expect(liquidityResult.hatNegativeLiquiditaet).toBe(false); // Should be healthy scenario

    // First month should have startup financing
    const month1 = liquidityResult.monate[0];
    expect(month1.einzahlungenSonstige).toBe(scenario.finanzierung.gesamtfinanzierung);
  });

  it('should validate complete F-G flow for BA compliance', () => {
    const scenario = createGZ50kScenario();

    // Step 1: Calculate profitability
    const rentabilityResult = calculateRentabilitaet({
      umsatzplanung: scenario.umsatzplanung,
      kostenplanung: scenario.kostenplanung,
      industry: 'beratung',
    });

    // Step 2: Calculate liquidity
    const liquidityResult = calculateLiquiditaet({
      kapitalbedarf: scenario.kapitalbedarf,
      finanzierung: scenario.finanzierung,
      privatentnahme: scenario.privatentnahme,
      umsatzplanung: scenario.umsatzplanung,
      kostenplanung: scenario.kostenplanung,
    });

    // Step 3: Validate BA compliance
    const profitabilityValidation = validateProfitabilityForBA(rentabilityResult);
    const liquidityValidation = validateLiquidityForBA(
      liquidityResult,
      analyzeLiquidityRisks(liquidityResult, {
        kapitalbedarf: scenario.kapitalbedarf,
        finanzierung: scenario.finanzierung,
        privatentnahme: scenario.privatentnahme,
        umsatzplanung: scenario.umsatzplanung,
        kostenplanung: scenario.kostenplanung,
      })
    );

    // Both should be BA compliant
    expect(profitabilityValidation.isBACompliant).toBe(true);
    expect(liquidityValidation.hasNegativeLiquidity).toBe(false);
    expect(rentabilityResult.breakEvenMonat).toBeLessThanOrEqual(36);
  });
});

// ============================================================================
// German Market Compliance Tests
// ============================================================================

describe('German Market Compliance', () => {
  describe('Currency Formatting', () => {
    it('should format EUR correctly for German locale', () => {
      expect(formatEUR(1234.56)).toBe('1.234,56 €');
      expect(formatEUR(1000000)).toBe('1.000.000,00 €');
      expect(formatEUR(0.99)).toBe('0,99 €');
    });

    it('should format percentages correctly', () => {
      expect(formatPercent(15.678)).toBe('15.7%');
      expect(formatPercent(100)).toBe('100.0%');
      expect(formatPercent(0.5)).toBe('0.5%');
    });
  });

  describe('Industry Patterns', () => {
    it('should provide German industry seasonal patterns', () => {
      const handwerkPattern = getSeasonalPattern('handwerk');
      expect(handwerkPattern.q1).toBe(0.8); // Winter weak
      expect(handwerkPattern.q2).toBe(1.2); // Spring strong
      expect(handwerkPattern.description).toContain('Witterungsbedingte');

      const beratungPattern = getSeasonalPattern('beratung');
      expect(beratungPattern.q4).toBe(1.2); // Year-end strong
      expect(beratungPattern.description).toContain('Budget-Freigabe');
    });

    it('should validate industry profitability benchmarks', () => {
      const beratungGuidance = getIndustryGuidance('beratung');
      expect(beratungGuidance.grossMargin.typical).toBe(85);
      expect(beratungGuidance.guidance).toContain('hohe Margen');

      const handwerkGuidance = getIndustryGuidance('handwerk');
      expect(handwerkGuidance.grossMargin.typical).toBe(55);
      expect(handwerkGuidance.guidance).toContain('saisonale Schwankungen');
    });
  });

  describe('Tax Compliance', () => {
    it('should calculate German tax rates correctly', () => {
      const scenario = createServiceProfitabilityTest();
      const result = calculateRentabilitaet(scenario);
      const taxAnalysis = analyzeTaxImplications(result);

      // Should be in German small business tax range
      expect(taxAnalysis.effectiveRate).toBeGreaterThan(25);
      expect(taxAnalysis.effectiveRate).toBeLessThan(35);
    });

    it('should provide German tax optimization advice', () => {
      const scenario = createServiceProfitabilityTest();
      // Modify to be under Kleinunternehmer threshold
      scenario.umsatzplanung.umsatzJahr1Summe = 20000;
      scenario.umsatzplanung.umsatzJahr2 = 21000;

      const result = calculateRentabilitaet(scenario);
      const taxAnalysis = analyzeTaxImplications(result);

      expect(taxAnalysis.taxOptimizationPotential).toContain('Kleinunternehmerregelung');
    });
  });
});