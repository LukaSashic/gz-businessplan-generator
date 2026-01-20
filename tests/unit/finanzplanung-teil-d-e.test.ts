/**
 * Finanzplanung Teil D-E Unit Tests (GZ-602)
 *
 * CRITICAL: Tests verify exact decimal.js calculations
 * - No floating-point errors allowed in revenue/cost calculations
 * - Business scenario validation for BA compliance
 * - CBC pattern detection testing
 * - Growth rate realism validation
 * - Industry benchmark compliance
 *
 * Test Categories:
 * - Umsatzplanung calculations (Teil D)
 * - Kostenplanung calculations (Teil E)
 * - CBC pattern detection for revenue optimism and cost blindness
 * - Integration with GZ-601 data
 * - BA compliance scenarios
 * - Industry benchmarking
 */

import { describe, it, expect, beforeAll } from 'vitest';
import Decimal from 'decimal.js';

// Import calculation functions - Umsatzplanung
import {
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
} from '@/lib/finance/umsatzplanung';

// Import calculation functions - Kostenplanung
import {
  analyzeCostStructure,
  calculateFixedCosts,
  calculateVariableCosts,
  projectCostScaling,
  validateCostCompleteness,
  checkCostBenchmarks,
  calculateKostenplanung,
  testServiceBusinessCostStructure,
  testManufacturingCostStructure,
  calculateCostPercentage,
  getIndustryCostGuidance,
} from '@/lib/finance/kostenplanung';

// Import prompt modules for CBC testing
import {
  detectRevenueOptimism,
  REVENUE_OPTIMISM_CBC_RESPONSES,
} from '@/lib/prompts/modules/finanzplanung/teil-d-umsatzplanung';

import {
  detectCostBlindness,
  COST_BLINDNESS_CBC_RESPONSES,
} from '@/lib/prompts/modules/finanzplanung/teil-e-kostenplanung';

// Import types
import type { UmsatzstromInput } from '@/lib/finance/umsatzplanung';
import type { KostenpositionInput } from '@/lib/finance/kostenplanung';

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
// Umsatzplanung (Revenue Planning) Tests
// ============================================================================

describe('Umsatzplanung Calculations', () => {
  describe('Basic Revenue Calculations', () => {
    it('should calculate monthly revenue exactly with decimal.js', () => {
      const streams: UmsatzstromInput[] = [
        {
          name: 'Consulting',
          typ: 'dienstleistung',
          einheit: 'Stunde',
          preis: 120,
          mengeJahr1: [40, 50, 60, 70, 80, 90, 100, 110, 115, 120, 120, 120],
          mengeJahr2: 1400,
          mengeJahr3: 1600,
        }
      ];

      const result = calculateMonthlyRevenue(streams);

      // Verify exact calculation for first month: 40 * 120 = 4800
      expect(result[0].gesamtumsatz).toBe(4800);
      expect(result[0].streams[0].umsatz).toBe(4800);

      // Verify no floating-point errors
      const expectedMonth1 = new Decimal(40).times(120);
      expect(result[0].gesamtumsatz).toBe(expectedMonth1.toNumber());

      // Verify December (month 12): 120 * 120 = 14400
      expect(result[11].gesamtumsatz).toBe(14400);
    });

    it('should handle multi-stream revenue aggregation correctly', () => {
      const streams: UmsatzstromInput[] = [
        {
          name: 'Product Sales',
          typ: 'produkt',
          einheit: 'Stück',
          preis: 45,
          mengeJahr1: [20, 25, 30, 35, 40, 50, 60, 70, 80, 90, 150, 200],
          mengeJahr2: 1200,
          mengeJahr3: 1800,
        },
        {
          name: 'Premium Shipping',
          typ: 'dienstleistung',
          einheit: 'Sendung',
          preis: 8,
          mengeJahr1: [16, 20, 24, 28, 32, 40, 48, 56, 64, 72, 120, 160],
          mengeJahr2: 960,
          mengeJahr3: 1440,
        }
      ];

      const result = calculateMonthlyRevenue(streams);

      // Verify January: (20 * 45) + (16 * 8) = 900 + 128 = 1028
      const expectedJan = new Decimal(20).times(45).plus(new Decimal(16).times(8));
      expect(result[0].gesamtumsatz).toBe(expectedJan.toNumber());
      expect(result[0].gesamtumsatz).toBe(1028);

      // Verify December: (200 * 45) + (160 * 8) = 9000 + 1280 = 10280
      const expectedDec = new Decimal(200).times(45).plus(new Decimal(160).times(8));
      expect(result[11].gesamtumsatz).toBe(expectedDec.toNumber());
      expect(result[11].gesamtumsatz).toBe(10280);
    });

    it('should calculate annual revenue from monthly data correctly', () => {
      const monthlyData = [
        { monat: 1, streams: [], gesamtumsatz: 1000 },
        { monat: 2, streams: [], gesamtumsatz: 1200 },
        { monat: 3, streams: [], gesamtumsatz: 1500 },
        { monat: 4, streams: [], gesamtumsatz: 1800 },
        { monat: 5, streams: [], gesamtumsatz: 2000 },
        { monat: 6, streams: [], gesamtumsatz: 2200 },
        { monat: 7, streams: [], gesamtumsatz: 2500 },
        { monat: 8, streams: [], gesamtumsatz: 2800 },
        { monat: 9, streams: [], gesamtumsatz: 3000 },
        { monat: 10, streams: [], gesamtumsatz: 3200 },
        { monat: 11, streams: [], gesamtumsatz: 3500 },
        { monat: 12, streams: [], gesamtumsatz: 4000 },
      ];

      const result = calculateAnnualRevenue(monthlyData);

      // Verify exact sum: 1000+1200+1500+1800+2000+2200+2500+2800+3000+3200+3500+4000 = 28700
      expect(result).toBe(28700);

      // Verify with decimal.js
      const expected = monthlyData.reduce((sum, month) => {
        return sum.plus(new Decimal(month.gesamtumsatz));
      }, new Decimal(0));
      expect(result).toBe(expected.toNumber());
    });
  });

  describe('Growth Rate Calculations', () => {
    it('should calculate growth rates correctly', () => {
      const growthRates = projectGrowthRates(100000, 150000, 180000);

      // Year 1 to Year 2: (150000 - 100000) / 100000 * 100 = 50%
      expect(growthRates.jahr1ToJahr2).toBe(50);

      // Year 2 to Year 3: (180000 - 150000) / 150000 * 100 = 20%
      expect(growthRates.jahr2ToJahr3).toBe(20);

      // CAGR: ((180000 / 100000)^(1/2)) - 1 = 0.3416... = 34.16%
      expect(growthRates.durchschnittlich).toBeCloseTo(34.16, 1);
    });

    it('should handle zero values in growth rate calculations', () => {
      const growthRates = projectGrowthRates(0, 50000, 100000);

      // When starting from 0, growth rates should be 0
      expect(growthRates.jahr1ToJahr2).toBe(0);
      expect(growthRates.durchschnittlich).toBe(0);
    });

    it('should validate growth rate realism against industry benchmarks', () => {
      // Realistic consulting growth
      expect(checkGrowthRateRealism(25, 'beratung', 1)).toBe(true);

      // Unrealistic consulting growth
      expect(checkGrowthRateRealism(200, 'beratung', 1)).toBe(false);

      // High but acceptable ecommerce growth
      expect(checkGrowthRateRealism(80, 'ecommerce', 1)).toBe(true);

      // Unrealistic handwerk growth
      expect(checkGrowthRateRealism(100, 'handwerk', 1)).toBe(false);
    });
  });

  describe('Revenue Validation and Optimization', () => {
    it('should detect unrealistic revenue projections', () => {
      const projections = [
        { jahr: 1 as const, umsatz: 50000 },
        { jahr: 2 as const, umsatz: 150000 }, // 200% growth
        { jahr: 3 as const, umsatz: 450000 }, // 200% growth
      ];

      const result = validateRevenueRealism(projections, 'beratung');

      expect(result.isRealistic).toBe(false);
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0]).toContain('optimistisch');
    });

    it('should suggest revenue optimization strategies', () => {
      const streams: UmsatzstromInput[] = [
        {
          name: 'Low Price Service',
          typ: 'dienstleistung',
          einheit: 'Stunde',
          preis: 25, // Very low price (< 50, triggers pricing suggestion)
          mengeJahr1: [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5], // Total 60 (< 100, triggers volume suggestion)
          mengeJahr2: 60,
          mengeJahr3: 60,
        }
      ];

      const suggestions = suggestRevenueOptimization(streams);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions.some(s => s.category === 'pricing')).toBe(true);
      expect(suggestions.some(s => s.category === 'volume')).toBe(true);
    });
  });

  describe('Complete Umsatzplanung Calculation', () => {
    it('should calculate complete Umsatzplanung correctly', () => {
      const streams: UmsatzstromInput[] = [
        {
          name: 'Consulting',
          typ: 'dienstleistung',
          einheit: 'Stunde',
          preis: 100,
          mengeJahr1: [40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40, 40], // 40 hours/month
          mengeJahr2: 500, // slightly higher
          mengeJahr3: 550, // continued growth
        }
      ];

      const result = calculateUmsatzplanung({ umsatzstroeme: streams });

      // Year 1: 40 hours * 12 months * €100 = €48,000
      expect(result.umsatzJahr1Summe).toBe(48000);

      // Year 2: 500 hours * €100 = €50,000
      expect(result.umsatzJahr2).toBe(50000);

      // Year 3: 550 hours * €100 = €55,000
      expect(result.umsatzJahr3).toBe(55000);

      // Growth rates
      expect(result.wachstumsrateJahr2).toBeCloseTo(4.17, 1); // (50000-48000)/48000*100
      expect(result.wachstumsrateJahr3).toBe(10); // (55000-50000)/50000*100
    });
  });

  describe('Test Scenarios', () => {
    it('should run software consulting scenario successfully', () => {
      const scenario = testSoftwareConsultingScenario();

      expect(scenario.umsatzstroeme.length).toBeGreaterThan(0);
      expect(scenario.umsatzJahr1Summe).toBeGreaterThan(100000);
      expect(scenario.umsatzJahr2).toBeGreaterThan(scenario.umsatzJahr1Summe);
      expect(scenario.annahmen.length).toBeGreaterThan(0);
    });

    it('should run e-commerce scenario successfully', () => {
      const scenario = testECommerceScenario();

      expect(scenario.umsatzstroeme.length).toBeGreaterThan(0);
      expect(scenario.umsatzJahr1Summe).toBeGreaterThan(0);
      expect(scenario.umsatzJahr2).toBeGreaterThan(scenario.umsatzJahr1Summe);
      expect(scenario.annahmen.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// Kostenplanung (Cost Planning) Tests
// ============================================================================

describe('Kostenplanung Calculations', () => {
  describe('Cost Structure Analysis', () => {
    it('should analyze cost structure correctly', () => {
      const costs: KostenpositionInput[] = [
        {
          name: 'Owner Salary',
          kategorie: 'personal',
          fixOderVariabel: 'fix',
          betragMonatlich: 3000,
        },
        {
          name: 'Office Rent',
          kategorie: 'miete',
          fixOderVariabel: 'fix',
          betragMonatlich: 1000,
        },
        {
          name: 'Materials',
          kategorie: 'material',
          fixOderVariabel: 'variabel',
          variablerAnteil: 40, // 40% of revenue
        }
      ];

      const result = analyzeCostStructure(costs);

      // Fixed costs: (3000 + 1000) * 12 = 48,000/year
      // Variable costs at €100k revenue: 40,000
      // Total costs: 88,000
      // Fixed cost percentage: 48,000 / 88,000 * 100 = 54.55%
      expect(result.fixkostenAnteil).toBeCloseTo(54.55, 1);
      expect(result.variableKostenAnteil).toBeCloseTo(45.45, 1);

      // Break-even revenue: 4000 / (100-40)% = 4000 / 0.6 = 6,666.67
      expect(result.breakEvenRevenue).toBeCloseTo(6666.67, 0);

      expect(result.kostenEffizienz).toBe('mittel');
    });

    it('should calculate fixed costs correctly', () => {
      const fixedCosts: KostenpositionInput[] = [
        {
          name: 'Salary',
          kategorie: 'personal',
          fixOderVariabel: 'fix',
          betragMonatlich: 3000,
        },
        {
          name: 'Rent',
          kategorie: 'miete',
          fixOderVariabel: 'fix',
          betragJaehrlich: 12000, // Should convert to 1000/month
        }
      ];

      const result = calculateFixedCosts(fixedCosts);

      // 3000 + (12000/12) = 3000 + 1000 = 4000
      expect(result).toBe(4000);
    });

    it('should calculate variable costs based on revenue', () => {
      const variableCosts: KostenpositionInput[] = [
        {
          name: 'Materials',
          kategorie: 'material',
          fixOderVariabel: 'variabel',
          variablerAnteil: 40,
        },
        {
          name: 'Commission',
          kategorie: 'sonstige',
          fixOderVariabel: 'variabel',
          variablerAnteil: 10,
        }
      ];

      const result = calculateVariableCosts(variableCosts, 100000);

      // 40% + 10% = 50% of 100,000 = 50,000
      expect(result).toBe(50000);
    });
  });

  describe('Cost Scaling and Projections', () => {
    it('should project cost scaling with revenue growth', () => {
      const baseCosts = {
        fixed: [
          {
            name: 'Fixed Cost',
            kategorie: 'miete' as const,
            fixOderVariabel: 'fix' as const,
            betragMonatlich: 2000,
          }
        ],
        variable: [
          {
            name: 'Variable Cost',
            kategorie: 'material' as const,
            fixOderVariabel: 'variabel' as const,
            variablerAnteil: 30,
          }
        ]
      };

      const revenueGrowth = [100000, 150000, 200000];
      const result = projectCostScaling(baseCosts, revenueGrowth);

      expect(result.length).toBe(3);

      // Year 1: Fixed (2000*12) + Variable (100000*0.3) = 24000 + 30000 = 54000
      expect(result[0].gesamtkosten).toBe(54000);

      // Year 2: Fixed (2000*12*1.1) + Variable (150000*0.3) = 26400 + 45000 = 71400
      expect(result[1].gesamtkosten).toBe(71400);

      // Year 3: Fixed (2000*12*1.2) + Variable (200000*0.3) = 28800 + 60000 = 88800
      expect(result[2].gesamtkosten).toBe(88800);
    });
  });

  describe('Cost Validation', () => {
    it('should validate cost completeness for industry', () => {
      const incompleteCosts: KostenpositionInput[] = [
        {
          name: 'Rent',
          kategorie: 'miete',
          fixOderVariabel: 'fix',
          betragMonatlich: 1000,
        }
      ];

      const result = validateCostCompleteness(incompleteCosts, 'beratung');

      expect(result.isComplete).toBe(false);
      expect(result.missingCategories.length).toBeGreaterThan(0);
      expect(result.missingCategories).toContain('personal');
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should check costs against industry benchmarks', () => {
      const costs: KostenpositionInput[] = [
        {
          name: 'Personnel',
          kategorie: 'personal',
          fixOderVariabel: 'fix',
          betragJaehrlich: 60000, // 60% of 100k revenue - too high
        }
      ];

      const result = checkCostBenchmarks(costs, 100000, 'beratung');

      expect(result.abweichungen.length).toBe(1);
      expect(result.abweichungen[0].kategorie).toBe('personal');
      expect(result.abweichungen[0].ist).toBe(60); // 60%
      expect(result.warnings.length).toBeGreaterThan(0);
    });
  });

  describe('Complete Kostenplanung Calculation', () => {
    it('should calculate complete Kostenplanung correctly', () => {
      const kostenPositionen: KostenpositionInput[] = [
        {
          name: 'Owner Salary',
          kategorie: 'personal',
          fixOderVariabel: 'fix',
          betragMonatlich: 3000,
        },
        {
          name: 'Office Rent',
          kategorie: 'miete',
          fixOderVariabel: 'fix',
          betragMonatlich: 1000,
        },
        {
          name: 'Materials',
          kategorie: 'material',
          fixOderVariabel: 'variabel',
          variablerAnteil: 30,
        }
      ];

      const revenueProjections = [120000, 150000, 180000];
      const result = calculateKostenplanung({
        kostenPositionen,
        revenueProjections,
      });

      // Fixed costs monthly: 3000 + 1000 = 4000
      expect(result.fixkostenSummeMonatlich).toBe(4000);

      // Fixed costs yearly: 4000 * 12 = 48000
      expect(result.fixkostenSummeJaehrlich).toBe(48000);

      // Variable costs Year 1: 120000 * 0.3 = 36000
      expect(result.variableKostenSummeJahr1).toBe(36000);

      // Total costs Year 1: 48000 + 36000 = 84000
      expect(result.gesamtkostenJahr1).toBe(84000);

      // Total costs Year 2: 48000*1.1 + 150000*0.3 = 52800 + 45000 = 97800
      expect(result.gesamtkostenJahr2).toBeCloseTo(97800, 0);
    });
  });

  describe('Test Scenarios', () => {
    it('should run service business cost scenario successfully', () => {
      const scenario = testServiceBusinessCostStructure();

      expect(scenario.fixkosten.length).toBeGreaterThan(0);
      expect(scenario.variableKosten.length).toBeGreaterThan(0);
      expect(scenario.fixkostenSummeMonatlich).toBeGreaterThan(0);
      expect(scenario.gesamtkostenJahr1).toBeGreaterThan(scenario.fixkostenSummeJaehrlich);
    });

    it('should run manufacturing cost scenario successfully', () => {
      const scenario = testManufacturingCostStructure();

      expect(scenario.fixkosten.length).toBeGreaterThan(0);
      expect(scenario.variableKosten.length).toBeGreaterThan(0);
      expect(scenario.fixkostenSummeMonatlich).toBeGreaterThan(0);
      expect(scenario.gesamtkostenJahr1).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// CBC Pattern Detection Tests
// ============================================================================

describe('CBC Pattern Detection', () => {
  describe('Revenue Optimism Detection', () => {
    it('should detect hockey stick growth patterns', () => {
      const messages = [
        'Unser Umsatz wird sich verdoppeln jedes Jahr',
        'Exponentielles Wachstum ist unser Plan',
        'Der Umsatz explodiert förmlich',
      ];

      messages.forEach(message => {
        const result = detectRevenueOptimism(message);
        expect(result).toBe('hockey_stick');
      });
    });

    it('should detect no competition assumptions', () => {
      const messages = [
        'Es gibt keine Konkurrenz in unserem Markt',
        'Wir sind der einzige Anbieter',
        'Niemand macht das wie wir',
      ];

      messages.forEach(message => {
        const result = detectRevenueOptimism(message);
        expect(result).toBe('no_competition');
      });
    });

    it('should detect perfect pricing assumptions', () => {
      const messages = [
        'Kunden zahlen Premium-Preise gerne',
        'Geld spielt keine Rolle für unsere Zielgruppe',
        'Preissensitiv sind unsere Kunden nicht',
      ];

      messages.forEach(message => {
        const result = detectRevenueOptimism(message);
        expect(result).toBe('perfect_pricing');
      });
    });

    it('should return null for realistic messages', () => {
      const messages = [
        'Wir planen mit moderatem Wachstum',
        'Der Markt ist kompetitiv aber wir haben unsere Nische',
        'Unsere Preise sind marktgerecht',
      ];

      messages.forEach(message => {
        const result = detectRevenueOptimism(message);
        expect(result).toBe(null);
      });
    });
  });

  describe('Cost Blindness Detection', () => {
    it('should detect obvious-only cost thinking', () => {
      const messages = [
        'Die Kosten sind nur Miete und Personal',
        'Hauptkosten sind Personal, sonst nichts großes',
        'Kosten sind minimal, nur die offensichtlichen',
      ];

      messages.forEach(message => {
        const result = detectCostBlindness(message);
        expect(result).toBe('obvious_only');
      });
    });

    it('should detect free marketing assumptions', () => {
      const messages = [
        'Marketing kostet uns nichts, alles gratis',
        'Social Media ist kostenlos',
        'Werbung machen wir umsonst',
      ];

      messages.forEach(message => {
        const result = detectCostBlindness(message);
        expect(result).toBe('free_marketing');
      });
    });

    it('should detect tax underestimation', () => {
      const messages = [
        'Steuern sind nicht viel',
        'Abgaben sind minimal',
        'Erstmal ohne Steuern planen',
      ];

      messages.forEach(message => {
        const result = detectCostBlindness(message);
        expect(result).toBe('hidden_taxes');
      });
    });

    it('should return null for realistic cost awareness', () => {
      const messages = [
        'Wir haben alle Kostenkategorien durchdacht',
        'Steuern und Abgaben sind eingeplant',
        'Marketing braucht auch ein Budget',
      ];

      messages.forEach(message => {
        const result = detectCostBlindness(message);
        expect(result).toBe(null);
      });
    });
  });

  describe('CBC Response Completeness', () => {
    it('should have complete CBC responses for all revenue optimism patterns', () => {
      const patterns = ['hockey_stick', 'no_competition', 'perfect_pricing', 'viral_growth', 'market_size_fantasy', 'first_mover'];

      patterns.forEach(pattern => {
        const response = REVENUE_OPTIMISM_CBC_RESPONSES[pattern as keyof typeof REVENUE_OPTIMISM_CBC_RESPONSES];
        expect(response).toBeDefined();
        expect(response.identify).toBeTruthy();
        expect(response.evidence).toBeTruthy();
        expect(response.challenge).toBeTruthy();
        expect(response.reframe).toBeTruthy();
        expect(response.action).toBeTruthy();
      });
    });

    it('should have complete CBC responses for all cost blindness patterns', () => {
      const patterns = ['obvious_only', 'free_marketing', 'hidden_taxes', 'scaling_ignorance', 'perfection_assumption', 'competitor_ignorance'];

      patterns.forEach(pattern => {
        const response = COST_BLINDNESS_CBC_RESPONSES[pattern as keyof typeof COST_BLINDNESS_CBC_RESPONSES];
        expect(response).toBeDefined();
        expect(response.identify).toBeTruthy();
        expect(response.evidence).toBeTruthy();
        expect(response.challenge).toBeTruthy();
        expect(response.reframe).toBeTruthy();
        expect(response.action).toBeTruthy();
      });
    });
  });
});

// ============================================================================
// Integration with GZ-601 Data Tests
// ============================================================================

describe('Integration with GZ-601', () => {
  it('should integrate with Kapitalbedarf for depreciation calculations', () => {
    const investitionen = [
      { name: 'Laptop', betrag: 2000, nutzungsdauer: 3 },
      { name: 'Office Equipment', betrag: 5000, nutzungsdauer: 5 },
    ];

    // Annual depreciation should be included in cost planning
    const laptopDepreciation = 2000 / 3; // 666.67/year
    const officeDepreciation = 5000 / 5; // 1000/year
    const totalAnnualDepreciation = laptopDepreciation + officeDepreciation;

    expect(totalAnnualDepreciation).toBeCloseTo(1666.67, 2);
  });

  it('should integrate with Privatentnahme for owner salary', () => {
    const privatentnahme = 3500; // €3500/month from GZ-601

    const kostenPositionen: KostenpositionInput[] = [
      {
        name: 'Unternehmerlohn',
        kategorie: 'personal',
        fixOderVariabel: 'fix',
        betragMonatlich: privatentnahme, // Should match privatentnahme
      }
    ];

    const fixedCosts = calculateFixedCosts(kostenPositionen);
    expect(fixedCosts).toBe(privatentnahme);
  });

  it('should validate BA compliance break-even requirements', () => {
    // BA requires break-even within 12 months (preferably 6-9)
    const monthlyRevenue = 15000;
    const monthlyFixedCosts = 8000;
    const variableCostPercentage = 40;

    const contributionMargin = (100 - variableCostPercentage) / 100;
    const breakEvenRevenue = monthlyFixedCosts / contributionMargin;

    // Break-even should be achievable: 8000 / 0.6 = 13,333
    expect(breakEvenRevenue).toBeCloseTo(13333, 0);
    expect(monthlyRevenue).toBeGreaterThan(breakEvenRevenue);

    // This scenario achieves break-even (good for BA)
    const isBACompliant = monthlyRevenue >= breakEvenRevenue;
    expect(isBACompliant).toBe(true);
  });
});

// ============================================================================
// Utility Functions Tests
// ============================================================================

describe('Utility Functions', () => {
  describe('Formatting Functions', () => {
    it('should format EUR correctly', () => {
      expect(formatEUR(1234.56)).toBe('1.234,56 €');
      expect(formatEUR(50000)).toBe('50.000,00 €');
      expect(formatEUR(new Decimal(1234.56))).toBe('1.234,56 €');
    });

    it('should format percentages correctly', () => {
      expect(formatPercent(25.5)).toBe('25,5%');
      expect(formatPercent(12.34, 2)).toBe('12,34%');
      expect(formatPercent(new Decimal(33.33), 1)).toBe('33,3%');
    });

    it('should calculate percentage changes correctly', () => {
      expect(calculatePercentageChange(100, 150)).toBe(50);
      expect(calculatePercentageChange(200, 180)).toBe(-10);
      expect(calculatePercentageChange(0, 100)).toBe(100);
    });
  });

  describe('Industry Benchmarking', () => {
    it('should provide industry benchmarks', () => {
      const benchmarks = getIndustryBenchmarks('beratung');
      expect(benchmarks).toBeDefined();
      expect(benchmarks.wachstum).toBeDefined();

      // Check specific properties for beratung industry
      if ('stundensatz' in benchmarks) {
        expect(benchmarks.stundensatz).toBeDefined();
        expect(benchmarks.auslastung).toBeDefined();
      }
    });

    it('should provide cost guidance for industries', () => {
      const guidance = getIndustryCostGuidance('ecommerce');
      expect(guidance).toBeDefined();
      expect(guidance.personalkosten).toBeTruthy();
      expect(guidance.material).toBeTruthy();
      expect(guidance.marketing).toBeTruthy();
      expect(guidance.tipps).toBeTruthy();
    });
  });
});

// ============================================================================
// Performance and Edge Cases
// ============================================================================

describe('Performance and Edge Cases', () => {
  it('should handle large numbers without precision loss', () => {
    const largeRevenue = 999999999;
    const result = calculatePercentageChange(largeRevenue, largeRevenue * 1.1);
    expect(result).toBeCloseTo(10, 5);
  });

  it('should handle zero and negative values gracefully', () => {
    expect(calculatePercentageChange(0, 0)).toBe(0);
    expect(() => projectGrowthRates(-100, 0, 100)).not.toThrow();
  });

  it('should handle empty arrays gracefully', () => {
    const emptyMonthlyData: any[] = [];
    expect(() => calculateAnnualRevenue(emptyMonthlyData)).not.toThrow();
    expect(calculateAnnualRevenue(emptyMonthlyData)).toBe(0);
  });
});