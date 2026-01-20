/**
 * Module 06: Finanzplanung (Financial Planning) Types
 *
 * CRITICAL: All monetary values are stored as numbers but
 * calculations MUST use decimal.js to avoid floating-point errors.
 *
 * Covers:
 * - A: Kapitalbedarf (Capital Requirements)
 * - B: Finanzierung (Financing)
 * - C: Privatentnahme (Personal Withdrawals)
 * - D: Umsatzplanung (Revenue Planning)
 * - E: Kostenplanung (Cost Planning)
 * - F: Rentabilität (Profitability)
 * - G: Liquidität (Liquidity)
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const FinanzplanungPhase = z.enum([
  'kapitalbedarf',    // Phase A: Capital requirements
  'finanzierung',     // Phase B: Financing
  'privatentnahme',   // Phase C: Personal withdrawals
  'umsatzplanung',    // Phase D: Revenue planning
  'kostenplanung',    // Phase E: Cost planning
  'rentabilitaet',    // Phase F: Profitability
  'liquiditaet',      // Phase G: Liquidity
  'completed',
]);

export type FinanzplanungPhase = z.infer<typeof FinanzplanungPhase>;

export const FinanzierungsquelleType = z.enum([
  'eigenkapital',      // Own capital
  'gruendungszuschuss', // GZ grant
  'bankkredit',        // Bank loan
  'foerderkredit',     // KfW/promotional loan
  'beteiligung',       // Equity participation
  'crowdfunding',      // Crowdfunding
  'family_friends',    // F&F
  'andere',            // Other
]);

export type FinanzierungsquelleType = z.infer<typeof FinanzierungsquelleType>;

export const KostenkategorieType = z.enum([
  'personal',          // Personnel costs
  'miete',             // Rent
  'versicherung',      // Insurance
  'marketing',         // Marketing
  'material',          // Materials/goods
  'abschreibung',      // Depreciation
  'zinsen',            // Interest
  'steuern',           // Taxes
  'sonstige',          // Other
]);

export type KostenkategorieType = z.infer<typeof KostenkategorieType>;

// ============================================================================
// A: Kapitalbedarf (Capital Requirements)
// ============================================================================

export const InvestitionSchema = z.object({
  name: z.string(),
  kategorie: z.enum(['anlagen', 'ausstattung', 'fahrzeuge', 'it', 'sonstiges']),
  betrag: z.number().min(0),              // EUR - USE decimal.js for calculations!
  nutzungsdauer: z.number().optional(),   // Years for depreciation
});

export type Investition = z.infer<typeof InvestitionSchema>;

export const KapitalbedarfSchema = z.object({
  gruendungskosten: z.object({
    notar: z.number().min(0).default(0),
    handelsregister: z.number().min(0).default(0),
    beratung: z.number().min(0).default(0),
    marketing: z.number().min(0).default(0),
    sonstige: z.number().min(0).default(0),
    summe: z.number().min(0),             // Calculated total
  }),
  investitionen: z.array(InvestitionSchema),
  investitionenSumme: z.number().min(0),  // Calculated total
  anlaufkosten: z.object({
    monate: z.number().min(1).max(12).default(6),
    monatlicheKosten: z.number().min(0),
    reserve: z.number().min(0),           // Buffer/safety margin
    summe: z.number().min(0),             // Calculated total
  }),
  gesamtkapitalbedarf: z.number().min(0), // Grand total
});

export type Kapitalbedarf = z.infer<typeof KapitalbedarfSchema>;

// ============================================================================
// B: Finanzierung (Financing)
// ============================================================================

export const FinanzierungsquelleSchema = z.object({
  typ: FinanzierungsquelleType,
  bezeichnung: z.string(),
  betrag: z.number().min(0),
  zinssatz: z.number().min(0).max(100).optional(),  // % per year
  laufzeit: z.number().optional(),                   // Months
  tilgungsfrei: z.number().optional(),               // Grace months
  sicherheiten: z.string().optional(),
  status: z.enum(['gesichert', 'beantragt', 'geplant']),
});

export type Finanzierungsquelle = z.infer<typeof FinanzierungsquelleSchema>;

export const FinanzierungSchema = z.object({
  quellen: z.array(FinanzierungsquelleSchema),
  eigenkapitalQuote: z.number().min(0).max(100),     // % of total
  fremdkapitalQuote: z.number().min(0).max(100),     // % of total
  gesamtfinanzierung: z.number().min(0),
  finanzierungsluecke: z.number(),                   // Can be negative (surplus)
});

export type Finanzierung = z.infer<typeof FinanzierungSchema>;

// ============================================================================
// C: Privatentnahme (Personal Withdrawals)
// ============================================================================

export const PrivatentnahmeSchema = z.object({
  miete: z.number().min(0),
  lebensmittel: z.number().min(0),
  versicherungen: z.number().min(0),
  mobilitaet: z.number().min(0),
  kommunikation: z.number().min(0),
  sonstigeAusgaben: z.number().min(0),
  sparrate: z.number().min(0).default(0),
  monatlichePrivatentnahme: z.number().min(0),      // Calculated total
  jaehrlichePrivatentnahme: z.number().min(0),      // × 12
});

export type Privatentnahme = z.infer<typeof PrivatentnahmeSchema>;

// ============================================================================
// D: Umsatzplanung (Revenue Planning)
// ============================================================================

export const UmsatzstromSchema = z.object({
  name: z.string(),
  typ: z.enum(['produkt', 'dienstleistung', 'abo', 'provision', 'sonstige']),
  einheit: z.string(),                    // e.g., "Stunde", "Projekt", "Monat"
  preis: z.number().min(0),
  mengeJahr1: z.array(z.number().min(0)).length(12),  // Monthly Year 1
  mengeJahr2: z.number().min(0),          // Total Year 2
  mengeJahr3: z.number().min(0),          // Total Year 3
});

export type Umsatzstrom = z.infer<typeof UmsatzstromSchema>;

export const UmsatzplanungSchema = z.object({
  umsatzstroeme: z.array(UmsatzstromSchema).min(1),
  umsatzJahr1: z.array(z.number().min(0)).length(12), // Monthly totals
  umsatzJahr1Summe: z.number().min(0),
  umsatzJahr2: z.number().min(0),
  umsatzJahr3: z.number().min(0),
  wachstumsrateJahr2: z.number(),          // % growth Y1→Y2
  wachstumsrateJahr3: z.number(),          // % growth Y2→Y3
  annahmen: z.array(z.string()),           // Key assumptions
});

export type Umsatzplanung = z.infer<typeof UmsatzplanungSchema>;

// ============================================================================
// E: Kostenplanung (Cost Planning)
// ============================================================================

export const KostenpositionSchema = z.object({
  name: z.string(),
  kategorie: KostenkategorieType,
  fixOderVariabel: z.enum(['fix', 'variabel']),
  betragMonatlich: z.number().min(0),
  betragJaehrlich: z.number().min(0),     // Calculated or input
  variablerAnteil: z.number().min(0).max(100).optional(), // % of revenue
});

export type Kostenposition = z.infer<typeof KostenpositionSchema>;

export const KostenplanungSchema = z.object({
  fixkosten: z.array(KostenpositionSchema),
  variableKosten: z.array(KostenpositionSchema),
  fixkostenSummeMonatlich: z.number().min(0),
  fixkostenSummeJaehrlich: z.number().min(0),
  variableKostenSummeJahr1: z.number().min(0),
  variableKostenSummeJahr2: z.number().min(0),
  variableKostenSummeJahr3: z.number().min(0),
  gesamtkostenJahr1: z.number().min(0),
  gesamtkostenJahr2: z.number().min(0),
  gesamtkostenJahr3: z.number().min(0),
});

export type Kostenplanung = z.infer<typeof KostenplanungSchema>;

// ============================================================================
// F: Rentabilität (Profitability)
// ============================================================================

export const RentabilitaetJahrSchema = z.object({
  umsatz: z.number(),
  materialaufwand: z.number().min(0),
  rohertrag: z.number(),                  // Gross profit
  personalkosten: z.number().min(0),
  sonstigeBetriebskosten: z.number().min(0),
  abschreibungen: z.number().min(0),
  zinsen: z.number().min(0),
  ergebnisVorSteuern: z.number(),         // EBT
  steuern: z.number(),
  jahresueberschuss: z.number(),          // Net profit
  rohertragsmarge: z.number(),            // %
  umsatzrendite: z.number(),              // % (net profit / revenue)
});

export type RentabilitaetJahr = z.infer<typeof RentabilitaetJahrSchema>;

export const RentabilitaetSchema = z.object({
  jahr1: RentabilitaetJahrSchema,
  jahr2: RentabilitaetJahrSchema,
  jahr3: RentabilitaetJahrSchema,
  breakEvenMonat: z.number().min(1).max(36).optional(), // Month when profitable
  breakEvenUmsatz: z.number().optional(),              // Monthly revenue for break-even
});

export type Rentabilitaet = z.infer<typeof RentabilitaetSchema>;

// ============================================================================
// G: Liquidität (Liquidity)
// ============================================================================

export const LiquiditaetMonatSchema = z.object({
  monat: z.number().min(1).max(12),
  anfangsbestand: z.number(),
  einzahlungenUmsatz: z.number().min(0),
  einzahlungenSonstige: z.number().min(0),
  einzahlungenGesamt: z.number(),
  auszahlungenBetrieb: z.number().min(0),
  auszahlungenInvestitionen: z.number().min(0),
  auszahlungenTilgung: z.number().min(0),
  auszahlungenPrivat: z.number().min(0),
  auszahlungenGesamt: z.number(),
  endbestand: z.number(),                 // CRITICAL: Must never be negative
});

export type LiquiditaetMonat = z.infer<typeof LiquiditaetMonatSchema>;

export const LiquiditaetSchema = z.object({
  monate: z.array(LiquiditaetMonatSchema).length(12),
  minimumLiquiditaet: z.number(),         // Lowest point in the year
  minimumMonat: z.number().min(1).max(12),
  durchschnittLiquiditaet: z.number(),
  liquiditaetsReserve: z.number(),        // Safety buffer
  hatNegativeLiquiditaet: z.boolean(),    // BLOCKER if true
});

export type Liquiditaet = z.infer<typeof LiquiditaetSchema>;

// ============================================================================
// Validation
// ============================================================================

export const FinanzplanungValidationSchema = z.object({
  // Completeness
  kapitalbedarfComplete: z.boolean(),
  finanzierungComplete: z.boolean(),
  privatentnahmeComplete: z.boolean(),
  umsatzComplete: z.boolean(),
  kostenComplete: z.boolean(),
  rentabilitaetComplete: z.boolean(),
  liquiditaetComplete: z.boolean(),

  // Critical checks
  finanzierungGedeckt: z.boolean(),       // Financing covers capital needs
  liquiditaetPositiv: z.boolean(),        // No negative liquidity (BLOCKER)
  breakEvenInnerhalb36Monate: z.boolean(), // Break-even within 3 years (WARNING)

  // Realism checks
  umsatzRealistisch: z.boolean(),
  kostenVollstaendig: z.boolean(),
  margenBranchenueblich: z.boolean(),

  // Overall
  blockers: z.array(z.string()),
  warnings: z.array(z.string()),
  readyForNextModule: z.boolean(),
});

export type FinanzplanungValidation = z.infer<typeof FinanzplanungValidationSchema>;

export const FinanzplanungMetadataSchema = z.object({
  completedAt: z.string().optional(),
  duration: z.number().optional(),
  currentPhase: FinanzplanungPhase.optional(),
  calculationMethod: z.literal('decimal.js').default('decimal.js'),
});

export type FinanzplanungMetadata = z.infer<typeof FinanzplanungMetadataSchema>;

// ============================================================================
// Main Output Schema
// ============================================================================

export const FinanzplanungOutputSchema = z.object({
  kapitalbedarf: KapitalbedarfSchema,
  finanzierung: FinanzierungSchema,
  privatentnahme: PrivatentnahmeSchema,
  umsatzplanung: UmsatzplanungSchema,
  kostenplanung: KostenplanungSchema,
  rentabilitaet: RentabilitaetSchema,
  liquiditaet: LiquiditaetSchema,
  validation: FinanzplanungValidationSchema,
  metadata: FinanzplanungMetadataSchema,
});

export type FinanzplanungOutput = z.infer<typeof FinanzplanungOutputSchema>;

export const PartialFinanzplanungOutputSchema = z.object({
  kapitalbedarf: KapitalbedarfSchema.deepPartial().optional(),
  finanzierung: FinanzierungSchema.deepPartial().optional(),
  privatentnahme: PrivatentnahmeSchema.deepPartial().optional(),
  umsatzplanung: UmsatzplanungSchema.deepPartial().optional(),
  kostenplanung: KostenplanungSchema.deepPartial().optional(),
  rentabilitaet: RentabilitaetSchema.deepPartial().optional(),
  liquiditaet: LiquiditaetSchema.deepPartial().optional(),
  validation: FinanzplanungValidationSchema.partial().optional(),
  metadata: FinanzplanungMetadataSchema.partial().optional(),
});

export type PartialFinanzplanungOutput = z.infer<typeof PartialFinanzplanungOutputSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

export function createEmptyFinanzplanungOutput(): PartialFinanzplanungOutput {
  return {};
}

export function isFinanzplanungComplete(data: PartialFinanzplanungOutput): boolean {
  return Boolean(
    data.kapitalbedarf?.gesamtkapitalbedarf &&
    data.finanzierung?.gesamtfinanzierung &&
    data.privatentnahme?.monatlichePrivatentnahme &&
    data.umsatzplanung?.umsatzJahr1Summe &&
    data.kostenplanung?.gesamtkostenJahr1 &&
    data.rentabilitaet?.jahr1 &&
    data.liquiditaet?.monate?.length === 12
  );
}

/**
 * Check if financing covers capital requirements
 * MUST use decimal.js for this calculation
 */
export function hasFinancingGap(data: PartialFinanzplanungOutput): boolean {
  const kapitalbedarf = data.kapitalbedarf?.gesamtkapitalbedarf ?? 0;
  const finanzierung = data.finanzierung?.gesamtfinanzierung ?? 0;
  return finanzierung < kapitalbedarf;
}

/**
 * Check for negative liquidity (BLOCKER)
 */
export function hasNegativeLiquidity(data: PartialFinanzplanungOutput): boolean {
  if (!data.liquiditaet?.monate) return false;
  return data.liquiditaet.monate.some((m) => (m.endbestand ?? 0) < 0);
}

// ============================================================================
// Enhanced Analysis Types for GZ-603 (F-G Integration)
// ============================================================================

// Break-Even Analysis Types
export const BreakEvenAnalysisSchema = z.object({
  breakEvenUmsatzMonatlich: z.number(),
  breakEvenUmsatzJaehrlich: z.number(),
  deckungsbeitrag: z.number(),                     // Contribution margin %
  deckungsbeitragEuro: z.number(),                // Contribution margin in EUR
  breakEvenMonat: z.number().min(1).max(36).optional(),
  isReachableIn36Months: z.boolean(),
  monthsToBreakEven: z.number().optional(),
  industryComparison: z.object({
    isBelowAverage: z.boolean(),
    isAboveWorrying: z.boolean(),
    benchmarkComment: z.string(),
  }),
  warnings: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type BreakEvenAnalysis = z.infer<typeof BreakEvenAnalysisSchema>;

// Profitability Metrics Types
export const ProfitabilityMetricsSchema = z.object({
  revenueGrowthYear2: z.number(),                 // % growth Y1→Y2
  revenueGrowthYear3: z.number(),                 // % growth Y2→Y3
  avgAnnualGrowth: z.number(),                    // CAGR over 3 years
  avgGrossMargin: z.number(),                     // % average over 3 years
  avgOperatingMargin: z.number(),                 // % average over 3 years
  avgNetMargin: z.number(),                       // % average over 3 years
  marginTrend: z.enum(['improving', 'stable', 'declining']),
  profitabilityRating: z.enum(['excellent', 'good', 'acceptable', 'concerning', 'poor']),
});

export type ProfitabilityMetrics = z.infer<typeof ProfitabilityMetricsSchema>;

// Industry Benchmark Types
export const IndustryBenchmarkSchema = z.object({
  grossMarginTypical: z.number(),
  operatingMarginTypical: z.number(),
  netMarginTypical: z.number(),
  comparison: z.object({
    grossMarginVsBenchmark: z.number(),
    operatingMarginVsBenchmark: z.number(),
    netMarginVsBenchmark: z.number(),
  }),
  warnings: z.array(z.string()),
  recommendations: z.array(z.string()),
});

export type IndustryBenchmark = z.infer<typeof IndustryBenchmarkSchema>;

// Liquidity Risk Analysis Types
export const LiquidityRiskAnalysisSchema = z.object({
  minimumCash: z.number(),
  minimumCashMonth: z.number(),
  averageCash: z.number(),
  monthsWithNegativeCash: z.number(),
  maximumCashNeed: z.number(),
  cashFlowVolatility: z.number(),
  recommendedReserve: z.number(),
  actualReserve: z.number(),
  reserveShortfall: z.number(),
  paymentRiskFactors: z.array(z.string()),
  seasonalityWarnings: z.array(z.string()),
  complianceRisks: z.array(z.string()),
});

export type LiquidityRiskAnalysis = z.infer<typeof LiquidityRiskAnalysisSchema>;

// Liquidity Validation Types
export const LiquidityValidationSchema = z.object({
  hasNegativeLiquidity: z.boolean(),              // BLOCKER
  hasInsufficientStartup: z.boolean(),            // BLOCKER
  hasTightCashFlow: z.boolean(),                  // WARNING
  hasHighVolatility: z.boolean(),                 // WARNING
  hasSeasonalRisks: z.boolean(),                  // WARNING
  actionItems: z.array(z.string()),
  contingencyPlans: z.array(z.string()),
});

export type LiquidityValidation = z.infer<typeof LiquidityValidationSchema>;

// Tax Analysis Types
export const TaxAnalysisSchema = z.object({
  effectiveRate: z.number(),                      // % actual tax rate
  taxOptimizationPotential: z.array(z.string()),
  taxRiskWarnings: z.array(z.string()),
});

export type TaxAnalysis = z.infer<typeof TaxAnalysisSchema>;

// Enhanced Rentabilitaet with Analysis
export const EnhancedRentabilitaetSchema = RentabilitaetSchema.extend({
  breakEvenAnalysis: BreakEvenAnalysisSchema.optional(),
  profitabilityMetrics: ProfitabilityMetricsSchema.optional(),
  industryBenchmark: IndustryBenchmarkSchema.optional(),
  taxAnalysis: TaxAnalysisSchema.optional(),
});

export type EnhancedRentabilitaet = z.infer<typeof EnhancedRentabilitaetSchema>;

// Enhanced Liquidität with Risk Analysis
export const EnhancedLiquiditaetSchema = LiquiditaetSchema.extend({
  riskAnalysis: LiquidityRiskAnalysisSchema.optional(),
  validation: LiquidityValidationSchema.optional(),
});

export type EnhancedLiquiditaet = z.infer<typeof EnhancedLiquiditaetSchema>;

// Payment Terms Configuration
export const PaymentTermsConfigSchema = z.object({
  customerPaymentDays: z.number().min(0).max(180).default(45),
  supplierPaymentDays: z.number().min(0).max(180).default(30),
  variableCostPaymentDelay: z.number().min(0).max(180).default(30),
});

export type PaymentTermsConfig = z.infer<typeof PaymentTermsConfigSchema>;

// Seasonality Configuration
export const SeasonalityConfigSchema = z.object({
  quarters: z.tuple([z.number(), z.number(), z.number(), z.number()]),
  description: z.string(),
});

export type SeasonalityConfig = z.infer<typeof SeasonalityConfigSchema>;

// Complete Enhanced Output Schema
export const EnhancedFinanzplanungOutputSchema = FinanzplanungOutputSchema.extend({
  rentabilitaet: EnhancedRentabilitaetSchema,
  liquiditaet: EnhancedLiquiditaetSchema,
  paymentTerms: PaymentTermsConfigSchema.optional(),
  seasonality: SeasonalityConfigSchema.optional(),
});

export type EnhancedFinanzplanungOutput = z.infer<typeof EnhancedFinanzplanungOutputSchema>;
