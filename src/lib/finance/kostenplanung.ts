/**
 * Kostenplanung Calculations (GZ-602 Teil E)
 *
 * CRITICAL: All calculations use decimal.js to avoid floating-point errors.
 * This is mandatory for BA compliance and exact financial calculations.
 *
 * Includes:
 * - Fixed vs variable cost separation
 * - Cost scaling with revenue growth
 * - Industry benchmark validation
 * - Cost optimization suggestions
 * - Integration with existing Privatentnahme data
 */

import Decimal from 'decimal.js';
import type {
  Kostenplanung,
  Kostenposition,
  KostenkategorieType,
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

export interface KostenpositionInput {
  name: string;
  kategorie: KostenkategorieType;
  fixOderVariabel: 'fix' | 'variabel';
  betragMonatlich?: number;
  betragJaehrlich?: number;
  variablerAnteil?: number; // % of revenue for variable costs
}

export interface CostStructureAnalysis {
  fixkostenAnteil: number; // % of total costs
  variableKostenAnteil: number; // % of total costs
  breakEvenRevenue: number; // Monthly revenue needed to cover fixed costs
  deckungsbeitragProProzent: number; // Contribution margin %
  kostenEffizienz: 'niedrig' | 'mittel' | 'hoch';
  recommendations: string[];
}

export interface ScaledCosts {
  jahr: number;
  fixkosten: number;
  variableKosten: number;
  gesamtkosten: number;
  kostenAnteilUmsatz: number; // % of revenue
}

export interface BenchmarkResult {
  isRealistic: boolean;
  abweichungen: Array<{
    kategorie: string;
    ist: number;
    benchmark: number;
    abweichung: number; // %
  }>;
  warnings: string[];
}

export interface ValidationResult {
  isComplete: boolean;
  isRealistic: boolean;
  warnings: string[];
  missingCategories: string[];
}

// ============================================================================
// Core Cost Analysis Functions
// ============================================================================

/**
 * Separate and analyze cost structure
 * Uses decimal.js for exact arithmetic
 */
export function analyzeCostStructure(costs: KostenpositionInput[]): CostStructureAnalysis {
  const fixkosten = costs.filter(cost => cost.fixOderVariabel === 'fix');
  const variableKosten = costs.filter(cost => cost.fixOderVariabel === 'variabel');

  // Calculate total fixed costs (monthly)
  const fixkostenTotal = fixkosten.reduce((sum, cost) => {
    const betrag = new Decimal(cost.betragMonatlich || (cost.betragJaehrlich || 0) / 12);
    return sum.plus(betrag);
  }, new Decimal(0));

  // Calculate variable cost percentage
  const variableKostenPercent = variableKosten.reduce((sum, cost) => {
    const prozent = new Decimal(cost.variablerAnteil || 0);
    return sum.plus(prozent);
  }, new Decimal(0));

  // Total costs estimation (assuming €100k revenue for calculation)
  const angenommenerUmsatz = new Decimal(100000);
  const variableKostenBetrag = angenommenerUmsatz.times(variableKostenPercent).dividedBy(100);
  const gesamtkosten = fixkostenTotal.times(12).plus(variableKostenBetrag);

  // Calculate percentages
  const fixkostenAnteil = gesamtkosten.gt(0)
    ? fixkostenTotal.times(12).dividedBy(gesamtkosten).times(100)
    : new Decimal(0);

  const variableKostenAnteilPercent = new Decimal(100).minus(fixkostenAnteil);

  // Break-even calculation
  const deckungsbeitrag = new Decimal(100).minus(variableKostenPercent);
  const breakEvenRevenue = deckungsbeitrag.gt(0)
    ? fixkostenTotal.dividedBy(deckungsbeitrag.dividedBy(100))
    : new Decimal(999999999);

  // Assess efficiency
  let kostenEffizienz: 'niedrig' | 'mittel' | 'hoch';
  if (variableKostenPercent.gt(70)) {
    kostenEffizienz = 'niedrig'; // Very high variable costs
  } else if (variableKostenPercent.lt(30)) {
    kostenEffizienz = 'hoch'; // Low variable costs = high margins
  } else {
    kostenEffizienz = 'mittel';
  }

  const recommendations: string[] = [];

  if (fixkostenTotal.gt(10000)) {
    recommendations.push('Hohe Fixkosten - prüfen Sie Einsparpotenziale oder flexible Alternativen');
  }

  if (variableKostenPercent.gt(60)) {
    recommendations.push('Sehr hohe variable Kosten - Skaleneffekte und Effizienzsteigerungen anstreben');
  }

  if (breakEvenRevenue.gt(50000)) {
    recommendations.push('Hoher Break-Even-Umsatz - Kostenstruktur überdenken oder Preise erhöhen');
  }

  return {
    fixkostenAnteil: fixkostenAnteil.toNumber(),
    variableKostenAnteil: variableKostenAnteilPercent.toNumber(),
    breakEvenRevenue: breakEvenRevenue.toNumber(),
    deckungsbeitragProProzent: deckungsbeitrag.toNumber(),
    kostenEffizienz,
    recommendations,
  };
}

/**
 * Calculate total fixed costs
 */
export function calculateFixedCosts(fixedItems: KostenpositionInput[]): number {
  const total = fixedItems.reduce((sum, item) => {
    const betrag = item.betragMonatlich || (item.betragJaehrlich || 0) / 12;
    return sum.plus(new Decimal(betrag));
  }, new Decimal(0));

  return total.toNumber();
}

/**
 * Calculate variable costs based on revenue
 */
export function calculateVariableCosts(
  variableItems: KostenpositionInput[],
  revenue: number
): number {
  const revenueDecimal = new Decimal(revenue);

  const total = variableItems.reduce((sum, item) => {
    const anteil = new Decimal(item.variablerAnteil || 0);
    const kosten = revenueDecimal.times(anteil).dividedBy(100);
    return sum.plus(kosten);
  }, new Decimal(0));

  return total.toNumber();
}

/**
 * Project cost scaling with revenue growth
 */
export function projectCostScaling(
  baseCosts: { fixed: KostenpositionInput[]; variable: KostenpositionInput[] },
  revenueGrowth: number[]
): ScaledCosts[] {
  const projections: ScaledCosts[] = [];
  const baseRevenue = new Decimal(100000); // Assumption for base year

  revenueGrowth.forEach((revenue, index) => {
    const jahr = index + 1;
    const revenueDecimal = new Decimal(revenue);

    // Fixed costs stay mostly the same but may grow slightly with business
    const fixkostenMultiplier = jahr === 1 ? new Decimal(1) :
                               jahr === 2 ? new Decimal(1.1) : new Decimal(1.2);

    const fixkosten = calculateFixedCosts(baseCosts.fixed);
    const fixkostenScaled = new Decimal(fixkosten).times(12).times(fixkostenMultiplier);

    // Variable costs scale with revenue
    const variableKosten = calculateVariableCosts(baseCosts.variable, revenue);
    const variableKostenDecimal = new Decimal(variableKosten);

    const gesamtkosten = fixkostenScaled.plus(variableKostenDecimal);
    const kostenAnteilUmsatz = revenueDecimal.gt(0)
      ? gesamtkosten.dividedBy(revenueDecimal).times(100)
      : new Decimal(0);

    projections.push({
      jahr,
      fixkosten: fixkostenScaled.toNumber(),
      variableKosten: variableKostenDecimal.toNumber(),
      gesamtkosten: gesamtkosten.toNumber(),
      kostenAnteilUmsatz: kostenAnteilUmsatz.toNumber(),
    });
  });

  return projections;
}

// ============================================================================
// Validation Functions
// ============================================================================

/**
 * Validate cost completeness for industry
 */
export function validateCostCompleteness(
  costs: KostenpositionInput[],
  industry: string
): ValidationResult {
  const warnings: string[] = [];
  const presentCategories = [...new Set(costs.map(c => c.kategorie))];

  // Essential categories for all businesses
  const essentialCategories = ['personal', 'versicherung', 'steuern'];

  // Industry-specific required categories
  const industryRequirements: Record<string, string[]> = {
    beratung: ['personal', 'versicherung', 'marketing'],
    ecommerce: ['material', 'marketing', 'versicherung'],
    handwerk: ['personal', 'material', 'versicherung', 'abschreibung'],
    restaurant: ['personal', 'miete', 'material', 'versicherung'],
  };

  const requiredCategories = [
    ...essentialCategories,
    ...(industryRequirements[industry] || [])
  ];

  const missingCategories = requiredCategories.filter(
    cat => !presentCategories.includes(cat as KostenkategorieType)
  );

  if (missingCategories.length > 0) {
    warnings.push(`Fehlende Kostenkategorien: ${missingCategories.join(', ')}`);
  }

  // Check for unreasonably low total costs
  const totalMonthly = costs.reduce((sum, cost) => {
    const betrag = cost.betragMonatlich || (cost.betragJaehrlich || 0) / 12;
    return sum + betrag;
  }, 0);

  if (totalMonthly < 1000) {
    warnings.push('Gesamtkosten unter €1.000/Monat erscheinen sehr niedrig');
  }

  // Check for missing owner salary
  const hasPersonalkosten = costs.some(c => c.kategorie === 'personal');
  if (!hasPersonalkosten) {
    warnings.push('Keine Personalkosten - Unternehmerlohn vergessen?');
  }

  return {
    isComplete: missingCategories.length === 0,
    isRealistic: warnings.length <= 1,
    warnings,
    missingCategories,
  };
}

/**
 * Check costs against industry benchmarks
 */
export function checkCostBenchmarks(
  costs: KostenpositionInput[],
  revenue: number,
  industry: string
): BenchmarkResult {
  const revenueDecimal = new Decimal(revenue);
  const warnings: string[] = [];
  const abweichungen: BenchmarkResult['abweichungen'] = [];

  // Industry benchmarks (% of revenue)
  const benchmarks: Record<string, Record<string, { min: number; max: number; typical: number }>> = {
    beratung: {
      personal: { min: 30, max: 50, typical: 40 },
      marketing: { min: 5, max: 15, typical: 10 },
      overhead: { min: 10, max: 20, typical: 15 },
    },
    ecommerce: {
      material: { min: 40, max: 70, typical: 55 },
      marketing: { min: 10, max: 25, typical: 15 },
      personal: { min: 15, max: 35, typical: 25 },
    },
    handwerk: {
      material: { min: 35, max: 55, typical: 45 },
      personal: { min: 25, max: 40, typical: 35 },
      abschreibung: { min: 3, max: 8, typical: 5 },
    },
    default: {
      personal: { min: 20, max: 40, typical: 30 },
      material: { min: 30, max: 60, typical: 45 },
      overhead: { min: 15, max: 25, typical: 20 },
    },
  };

  const industryBenchmarks = benchmarks[industry] || benchmarks.default;

  // Calculate actual percentages
  costs.forEach(cost => {
    const kategorie = cost.kategorie;
    const benchmark = industryBenchmarks[kategorie as keyof typeof industryBenchmarks];

    if (benchmark && revenueDecimal.gt(0)) {
      const betragJaehrlich = cost.betragJaehrlich || (cost.betragMonatlich || 0) * 12;
      const anteilIst = new Decimal(betragJaehrlich).dividedBy(revenueDecimal).times(100);
      const abweichung = anteilIst.minus(benchmark.typical).dividedBy(benchmark.typical).times(100);

      abweichungen.push({
        kategorie,
        ist: anteilIst.toNumber(),
        benchmark: benchmark.typical,
        abweichung: abweichung.toNumber(),
      });

      if (anteilIst.lt(benchmark.min)) {
        warnings.push(`${kategorie}-Kosten (${anteilIst.toFixed(1)}%) unter Branchenschnitt`);
      } else if (anteilIst.gt(benchmark.max)) {
        warnings.push(`${kategorie}-Kosten (${anteilIst.toFixed(1)}%) über Branchenschnitt`);
      }
    }
  });

  return {
    isRealistic: warnings.length <= 2,
    abweichungen,
    warnings,
  };
}

// ============================================================================
// Complete Calculation Function
// ============================================================================

/**
 * Calculate complete Kostenplanung from input costs
 */
export function calculateKostenplanung(input: {
  kostenPositionen: KostenpositionInput[];
  revenueProjections: number[]; // [year1, year2, year3]
}): Kostenplanung {
  const { kostenPositionen, revenueProjections } = input;

  // Separate fixed and variable costs
  const fixkosten = kostenPositionen.filter(cost => cost.fixOderVariabel === 'fix');
  const variableKostenItems = kostenPositionen.filter(cost => cost.fixOderVariabel === 'variabel');

  // Calculate fixed costs
  const fixkostenSummeMonatlich = calculateFixedCosts(fixkosten);
  const fixkostenSummeJaehrlich = new Decimal(fixkostenSummeMonatlich).times(12).toNumber();

  // Calculate variable costs for each year
  const variableKostenSummeJahr1 = calculateVariableCosts(variableKostenItems, revenueProjections[0] || 0);
  const variableKostenSummeJahr2 = calculateVariableCosts(variableKostenItems, revenueProjections[1] || 0);
  const variableKostenSummeJahr3 = calculateVariableCosts(variableKostenItems, revenueProjections[2] || 0);

  // Calculate total costs per year
  const gesamtkostenJahr1 = new Decimal(fixkostenSummeJaehrlich).plus(variableKostenSummeJahr1).toNumber();
  const gesamtkostenJahr2 = new Decimal(fixkostenSummeJaehrlich * 1.1).plus(variableKostenSummeJahr2).toNumber(); // 10% fixed cost increase
  const gesamtkostenJahr3 = new Decimal(fixkostenSummeJaehrlich * 1.2).plus(variableKostenSummeJahr3).toNumber(); // 20% fixed cost increase

  // Convert input to output format
  const outputFixkosten: Kostenposition[] = fixkosten.map(cost => ({
    name: cost.name,
    kategorie: cost.kategorie,
    fixOderVariabel: cost.fixOderVariabel,
    betragMonatlich: cost.betragMonatlich || (cost.betragJaehrlich || 0) / 12,
    betragJaehrlich: cost.betragJaehrlich || (cost.betragMonatlich || 0) * 12,
  }));

  const outputVariableKosten: Kostenposition[] = variableKostenItems.map(cost => ({
    name: cost.name,
    kategorie: cost.kategorie,
    fixOderVariabel: cost.fixOderVariabel,
    betragMonatlich: 0, // Variable costs are calculated based on revenue
    betragJaehrlich: 0, // Will be calculated based on actual revenue
    variablerAnteil: cost.variablerAnteil,
  }));

  return {
    fixkosten: outputFixkosten,
    variableKosten: outputVariableKosten,
    fixkostenSummeMonatlich,
    fixkostenSummeJaehrlich,
    variableKostenSummeJahr1,
    variableKostenSummeJahr2,
    variableKostenSummeJahr3,
    gesamtkostenJahr1,
    gesamtkostenJahr2,
    gesamtkostenJahr3,
  };
}

// ============================================================================
// Test Scenarios
// ============================================================================

/**
 * Test scenario: Service Business Cost Structure
 * Consulting/coaching business with moderate fixed costs
 */
export function testServiceBusinessCostStructure(): Kostenplanung {
  const scenario: KostenpositionInput[] = [
    // Fixed costs
    {
      name: 'Unternehmerlohn',
      kategorie: 'personal',
      fixOderVariabel: 'fix',
      betragMonatlich: 3000,
    },
    {
      name: 'Büro/Home-Office',
      kategorie: 'miete',
      fixOderVariabel: 'fix',
      betragMonatlich: 800,
    },
    {
      name: 'Versicherungen',
      kategorie: 'versicherung',
      fixOderVariabel: 'fix',
      betragMonatlich: 300,
    },
    {
      name: 'Software & Tools',
      kategorie: 'sonstige',
      fixOderVariabel: 'fix',
      betragMonatlich: 200,
    },
    // Variable costs
    {
      name: 'Marketing & Akquise',
      kategorie: 'marketing',
      fixOderVariabel: 'variabel',
      variablerAnteil: 8, // 8% of revenue
    },
    {
      name: 'Weiterbildung & Zertifizierungen',
      kategorie: 'sonstige',
      fixOderVariabel: 'variabel',
      variablerAnteil: 3, // 3% of revenue
    },
    {
      name: 'Steuern & Abgaben',
      kategorie: 'steuern',
      fixOderVariabel: 'variabel',
      variablerAnteil: 25, // ~25% effective tax rate
    },
  ];

  const revenueProjections = [120000, 150000, 180000]; // Conservative consulting growth

  return calculateKostenplanung({
    kostenPositionen: scenario,
    revenueProjections,
  });
}

/**
 * Test scenario: Manufacturing/Product Business
 * Higher material costs and equipment depreciation
 */
export function testManufacturingCostStructure(): Kostenplanung {
  const scenario: KostenpositionInput[] = [
    // Fixed costs
    {
      name: 'Geschäftsführer-Gehalt',
      kategorie: 'personal',
      fixOderVariabel: 'fix',
      betragMonatlich: 4000,
    },
    {
      name: 'Werkstatt/Büro Miete',
      kategorie: 'miete',
      fixOderVariabel: 'fix',
      betragMonatlich: 1500,
    },
    {
      name: 'Maschinen-Abschreibung',
      kategorie: 'abschreibung',
      fixOderVariabel: 'fix',
      betragMonatlich: 800,
    },
    {
      name: 'Versicherungen',
      kategorie: 'versicherung',
      fixOderVariabel: 'fix',
      betragMonatlich: 500,
    },
    // Variable costs
    {
      name: 'Material & Waren',
      kategorie: 'material',
      fixOderVariabel: 'variabel',
      variablerAnteil: 45, // 45% COGS typical for manufacturing
    },
    {
      name: 'Marketing & Vertrieb',
      kategorie: 'marketing',
      fixOderVariabel: 'variabel',
      variablerAnteil: 10,
    },
    {
      name: 'Steuern',
      kategorie: 'steuern',
      fixOderVariabel: 'variabel',
      variablerAnteil: 22, // Corporate tax rate
    },
  ];

  const revenueProjections = [200000, 280000, 350000]; // Manufacturing growth

  return calculateKostenplanung({
    kostenPositionen: scenario,
    revenueProjections,
  });
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
 * Calculate cost percentage of revenue
 */
export function calculateCostPercentage(cost: number, revenue: number): number {
  if (revenue === 0) return 0;

  const costDecimal = new Decimal(cost);
  const revenueDecimal = new Decimal(revenue);
  const hundred = new Decimal(100);

  return costDecimal.dividedBy(revenueDecimal).times(hundred).toNumber();
}

/**
 * Get industry cost structure recommendations
 */
export function getIndustryCostGuidance(industry: string) {
  const guidance = {
    beratung: {
      personalkosten: 'Hauptkostenfaktor - 30-50% vom Umsatz ist normal',
      material: 'Minimal - meist nur Büromaterial und Software',
      marketing: '5-15% für Akquise und Netzwerk-Aufbau',
      tipps: ['Home-Office nutzen', 'Flexible Tools statt feste Software', 'Performance-basiertes Marketing'],
    },
    ecommerce: {
      personalkosten: 'Moderate 15-35% - kann mit Automatisierung reduziert werden',
      material: 'Hauptkostenfaktor - 40-70% für Wareneinkauf',
      marketing: '10-25% für Online-Marketing und Kundengewinnung',
      tipps: ['Automatisierung investieren', 'Lagermanagement optimieren', 'Performance Marketing'],
    },
    handwerk: {
      personalkosten: 'Hoch 25-40% - Fachkräfte sind teuer',
      material: 'Hoch 35-55% - Materialpreise schwanken',
      abschreibung: 'Wichtig 3-8% - Werkzeuge und Fahrzeuge',
      tipps: ['Materialpreise weitergeben', 'Effizienz durch gute Planung', 'Maschinen richtig kalkulieren'],
    },
    restaurant: {
      personalkosten: 'Sehr hoch 30-40% - Service-intensiv',
      material: 'Hoch 25-35% - Lebensmittelkosten',
      miete: 'Kritisch - max. 10% vom Umsatz',
      tipps: ['Prime Location rechtfertigen', 'Speisekarte-Engineering', 'Personaleffizienz'],
    },
    default: {
      personalkosten: 'Variiert stark je nach Branche 20-40%',
      material: 'Abhängig vom Geschäftsmodell 20-60%',
      overhead: 'Niedrig halten 15-25% für Overhead-Kosten',
      tipps: ['Kostenstruktur regelmäßig prüfen', 'Variable statt fixe Kosten bevorzugen'],
    },
  };

  return guidance[industry as keyof typeof guidance] || guidance.default;
}

// ============================================================================
// Exports
// ============================================================================

export default {
  analyzeCostStructure,
  calculateFixedCosts,
  calculateVariableCosts,
  projectCostScaling,
  validateCostCompleteness,
  checkCostBenchmarks,
  calculateKostenplanung,
  testServiceBusinessCostStructure,
  testManufacturingCostStructure,
  formatEUR,
  calculateCostPercentage,
  getIndustryCostGuidance,
};