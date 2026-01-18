/**
 * Module 02: Geschäftsmodell (Business Model) Types
 *
 * Based on gz-module-02-geschaeftsmodell.md GeschaeftsmodellOutput schema
 * Develops clear offering, specific target audience, customer value proposition,
 * and unique selling proposition using Value Proposition Canvas.
 */

import { z } from 'zod';

// ============================================================================
// Enums and Constants
// ============================================================================

export const DeliveryFormat = z.enum(['physical', 'digital', 'service', 'hybrid']);
export type DeliveryFormat = z.infer<typeof DeliveryFormat>;

export const PricingModel = z.enum([
  'hourly',
  'project',
  'subscription',
  'product',
  'value_based',
]);
export type PricingModel = z.infer<typeof PricingModel>;

export const USPCategory = z.enum([
  'specialization',
  'method',
  'result',
  'experience',
  'service',
  'speed',
  'local',
  'other',
]);
export type USPCategory = z.infer<typeof USPCategory>;

export const OfferClarity = z.enum(['clear', 'vague', 'needs_work']);
export type OfferClarity = z.infer<typeof OfferClarity>;

export const Gender = z.enum(['male', 'female', 'diverse', 'not_relevant']);
export type Gender = z.infer<typeof Gender>;

// ============================================================================
// Phase Tracking
// ============================================================================

export const GeschaeftsmodellPhase = z.enum([
  'angebot',        // Phase 1: Offering Definition (15 min)
  'zielgruppe',     // Phase 2: Target Audience Definition (20 min)
  'wertversprechen', // Phase 3: Value Proposition Development (15 min)
  'usp',            // Phase 4: USP Definition (20 min)
  'completed',      // Module complete
]);

export type GeschaeftsmodellPhase = z.infer<typeof GeschaeftsmodellPhase>;

export const GeschaeftsmodellPhaseInfo: Record<GeschaeftsmodellPhase, { label: string; duration: number }> = {
  angebot: { label: 'Angebot', duration: 15 },
  zielgruppe: { label: 'Zielgruppe', duration: 20 },
  wertversprechen: { label: 'Wertversprechen', duration: 15 },
  usp: { label: 'Alleinstellungsmerkmal', duration: 20 },
  completed: { label: 'Abgeschlossen', duration: 0 },
};

// ============================================================================
// Sub-Schemas
// ============================================================================

// Offering Schema
export const ScopeSchema = z.object({
  included: z.array(z.string()), // What's explicitly in scope
  excluded: z.array(z.string()), // What's explicitly NOT offered
});
export type Scope = z.infer<typeof ScopeSchema>;

export const OfferingSchema = z.object({
  mainOffering: z.string(), // Core product/service
  deliveryFormat: DeliveryFormat,
  pricingModel: PricingModel,
  scope: ScopeSchema,
  oneSentencePitch: z.string(), // "Oma-Test" - verständlich für Laien
});
export type Offering = z.infer<typeof OfferingSchema>;

// Demographics Schema (B2C)
export const DemographicsSchema = z.object({
  ageRange: z.string().optional(), // B2C
  gender: Gender.optional(),
  occupation: z.string(),
  income: z.string().optional(), // B2C
  location: z.string(),
});
export type Demographics = z.infer<typeof DemographicsSchema>;

// Firmographics Schema (B2B)
export const FirmographicsSchema = z.object({
  industry: z.string(),
  companySize: z.string(), // e.g., "10-50 Mitarbeiter"
  position: z.string(), // Decision-maker position
  budget: z.string(), // Budget range
});
export type Firmographics = z.infer<typeof FirmographicsSchema>;

// Psychographics Schema
export const PsychographicsSchema = z.object({
  goals: z.array(z.string()),
  challenges: z.array(z.string()),
  values: z.array(z.string()),
  interests: z.array(z.string()),
});
export type Psychographics = z.infer<typeof PsychographicsSchema>;

// Behavior Schema
export const BehaviorSchema = z.object({
  informationSources: z.array(z.string()), // Where they research
  decisionProcess: z.string(), // How they decide
  previousAttempts: z.array(z.string()), // What they've tried before
});
export type Behavior = z.infer<typeof BehaviorSchema>;

// Primary Persona Schema
export const PrimaryPersonaSchema = z.object({
  name: z.string(), // e.g., "Tech-Startup Gründerin Sarah"
  demographics: DemographicsSchema,
  firmographics: FirmographicsSchema.optional(), // B2B only
  psychographics: PsychographicsSchema,
  behavior: BehaviorSchema,
  buyingTrigger: z.string(), // What makes them buy NOW
});
export type PrimaryPersona = z.infer<typeof PrimaryPersonaSchema>;

// Market Size Schema
export const MarketSizeSchema = z.object({
  totalAddressableMarket: z.number(), // TAM
  tamSource: z.string(), // URL or citation
  serviceableMarket: z.number(), // SAM (your actual reach)
  samCalculation: z.string(), // Show your work
  targetFirstYear: z.number(), // How many customers Year 1
  reasoning: z.string(), // Why this is realistic
});
export type MarketSize = z.infer<typeof MarketSizeSchema>;

// Target Audience Schema
export const TargetAudienceSchema = z.object({
  primaryPersona: PrimaryPersonaSchema,
  marketSize: MarketSizeSchema,
  secondaryPersona: PrimaryPersonaSchema.optional(), // Optional, max 1 for focus
});
export type TargetAudience = z.infer<typeof TargetAudienceSchema>;

// Value Proposition Schema (Value Proposition Canvas)
export const ValuePropositionSchema = z.object({
  // Customer Side (right side of canvas)
  customerJobs: z.array(z.string()), // What customer wants to accomplish
  customerPains: z.array(z.string()), // What frustrates them
  customerGains: z.array(z.string()), // What would delight them

  // Offering Side (left side of canvas)
  productsServices: z.array(z.string()), // Your offerings
  painRelievers: z.array(z.string()), // How you solve their pains
  gainCreators: z.array(z.string()), // How you create value beyond expected

  // Synthesized value statement (customer perspective!)
  valueStatement: z.string(), // "[Target] kann mit [Angebot] [Ergebnis erreichen], ohne [Problem]"
});
export type ValueProposition = z.infer<typeof ValuePropositionSchema>;

// USP Test Schema
export const USPTestSchema = z.object({
  isUnique: z.boolean(), // Can competitors claim same?
  isRelevant: z.boolean(), // Does target audience care?
  isProvable: z.boolean(), // Can you deliver/prove it?
  isUnderstandable: z.boolean(), // Clear in 5 seconds?
  isOneSentence: z.boolean(),
});
export type USPTest = z.infer<typeof USPTestSchema>;

// USP Schema
export const USPSchema = z.object({
  statement: z.string(), // One sentence USP
  // "Für [Zielgruppe] ist [Angebot] die einzige Lösung, die [Nutzen], weil [Beweis]"
  category: USPCategory,
  proof: z.string(), // How you prove/deliver this
  measurement: z.string(), // How customer can verify (if applicable)
  uspTest: USPTestSchema,
});
export type USP = z.infer<typeof USPSchema>;

// Competitor Schema
export const CompetitorSchema = z.object({
  name: z.string(),
  offering: z.string(),
  pricePoint: z.string(),
  strength: z.string(),
  weakness: z.string(),
  yourAdvantage: z.string(), // What you do better
});
export type Competitor = z.infer<typeof CompetitorSchema>;

// Competitive Analysis Schema
// SPEC REFERENCE: gz-module-02-geschaeftsmodell.md - BA requires minimum 3 competitors
export const CompetitiveAnalysisSchema = z.object({
  directCompetitors: z.array(CompetitorSchema).min(3, 'BA erfordert mindestens 3 Wettbewerber').max(5),
  competitiveAdvantages: z.array(z.string()).min(2, 'Mindestens 2 Wettbewerbsvorteile angeben'),
  marketGaps: z.array(z.string()).min(1, 'Mindestens 1 Marktlücke identifizieren'),
});
export type CompetitiveAnalysis = z.infer<typeof CompetitiveAnalysisSchema>;

// Validation Schema
export const GeschaeftsmodellValidationSchema = z.object({
  offerClarity: OfferClarity,
  offerClarityReason: z.string().optional(),

  targetAudienceSpecific: z.boolean(),
  targetAudienceIssue: z.string().optional(), // If false, why

  marketSizeQuantified: z.boolean(),
  marketSizeSource: z.string().optional(),

  valueFromCustomerPerspective: z.boolean(),
  valuePerspectiveIssue: z.string().optional(),

  uspUnique: z.boolean(),
  uspRelevant: z.boolean(),
  uspProvable: z.boolean(),
  uspIssues: z.array(z.string()).optional(),

  competitorsAnalyzed: z.boolean(),
  minCompetitors: z.boolean(), // At least 3

  readyForNextModule: z.boolean(),
  blockers: z.array(z.string()).optional(), // What must be fixed before progressing
});
export type GeschaeftsmodellValidation = z.infer<typeof GeschaeftsmodellValidationSchema>;

// Metadata Schema
export const GeschaeftsmodellMetadataSchema = z.object({
  completedAt: z.string().optional(), // ISO timestamp
  duration: z.number().optional(), // Minutes
  iterationsNeeded: z.number().optional(), // How many refinement cycles
  coachingPatternsUsed: z.array(z.string()).optional(), // e.g., ['CBC-vague-reframe', 'MI-doubt-resolution']
  currentPhase: GeschaeftsmodellPhase.optional(),
  phaseComplete: z.boolean().optional(),
});
export type GeschaeftsmodellMetadata = z.infer<typeof GeschaeftsmodellMetadataSchema>;

// ============================================================================
// Main GeschaeftsmodellOutput Schema
// ============================================================================

export const GeschaeftsmodellOutputSchema = z.object({
  offering: OfferingSchema,
  targetAudience: TargetAudienceSchema,
  valueProposition: ValuePropositionSchema,
  usp: USPSchema,
  competitiveAnalysis: CompetitiveAnalysisSchema,
  validation: GeschaeftsmodellValidationSchema,
  metadata: GeschaeftsmodellMetadataSchema,
});

export type GeschaeftsmodellOutput = z.infer<typeof GeschaeftsmodellOutputSchema>;

// ============================================================================
// Partial Schema (for progressive updates during conversation)
// ============================================================================

export const PartialGeschaeftsmodellOutputSchema = z.object({
  offering: OfferingSchema.deepPartial().optional(),
  targetAudience: TargetAudienceSchema.deepPartial().optional(),
  valueProposition: ValuePropositionSchema.partial().optional(),
  usp: USPSchema.deepPartial().optional(),
  competitiveAnalysis: CompetitiveAnalysisSchema.deepPartial().optional(),
  validation: GeschaeftsmodellValidationSchema.partial().optional(),
  metadata: GeschaeftsmodellMetadataSchema.partial().optional(),
});

export type PartialGeschaeftsmodellOutput = z.infer<typeof PartialGeschaeftsmodellOutputSchema>;

// ============================================================================
// Phase Validators
// ============================================================================

/**
 * Required fields for each phase
 */
export const GESCHAEFTSMODELL_PHASE_REQUIRED_FIELDS: Record<GeschaeftsmodellPhase, string[]> = {
  angebot: [
    'offering.mainOffering',
    'offering.deliveryFormat',
    'offering.pricingModel',
    'offering.oneSentencePitch',
  ],
  zielgruppe: [
    'targetAudience.primaryPersona.name',
    'targetAudience.primaryPersona.demographics.occupation',
    'targetAudience.primaryPersona.demographics.location',
    'targetAudience.primaryPersona.psychographics.challenges',
    'targetAudience.primaryPersona.buyingTrigger',
    'targetAudience.marketSize.serviceableMarket',
  ],
  wertversprechen: [
    'valueProposition.customerJobs',
    'valueProposition.customerPains',
    'valueProposition.painRelievers',
    'valueProposition.valueStatement',
  ],
  usp: [
    'usp.statement',
    'usp.category',
    'usp.proof',
    'competitiveAnalysis.directCompetitors',
  ],
  completed: [], // No additional requirements
};

/**
 * Validation result for a phase
 */
export interface GeschaeftsmodellPhaseValidationResult {
  isComplete: boolean;
  missingFields: string[];
  completedFields: string[];
}

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Check if a value is considered "present" (not null, undefined, or empty)
 */
function isValuePresent(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

/**
 * Validate a specific geschaeftsmodell phase
 */
export function validateGeschaeftsmodellPhase(
  phase: GeschaeftsmodellPhase,
  data: PartialGeschaeftsmodellOutput
): GeschaeftsmodellPhaseValidationResult {
  const requiredFields = GESCHAEFTSMODELL_PHASE_REQUIRED_FIELDS[phase];
  const missingFields: string[] = [];
  const completedFields: string[] = [];

  for (const field of requiredFields) {
    const value = getNestedValue(data as Record<string, unknown>, field);
    if (isValuePresent(value)) {
      completedFields.push(field);
    } else {
      missingFields.push(field);
    }
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completedFields,
  };
}

/**
 * Phase validators - functions to check if each phase is complete
 */
export const GESCHAEFTSMODELL_PHASE_VALIDATORS: Record<
  GeschaeftsmodellPhase,
  (data: PartialGeschaeftsmodellOutput) => GeschaeftsmodellPhaseValidationResult
> = {
  angebot: (data) => validateGeschaeftsmodellPhase('angebot', data),
  zielgruppe: (data) => validateGeschaeftsmodellPhase('zielgruppe', data),
  wertversprechen: (data) => validateGeschaeftsmodellPhase('wertversprechen', data),
  usp: (data) => validateGeschaeftsmodellPhase('usp', data),
  completed: () => ({ isComplete: true, missingFields: [], completedFields: [] }),
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create an empty partial geschaeftsmodell output for initialization
 */
export function createEmptyGeschaeftsmodellOutput(): PartialGeschaeftsmodellOutput {
  return {};
}

/**
 * Merge partial updates into existing geschaeftsmodell data
 */
export function mergeGeschaeftsmodellData(
  existing: PartialGeschaeftsmodellOutput,
  update: PartialGeschaeftsmodellOutput
): PartialGeschaeftsmodellOutput {
  return {
    offering: {
      ...existing.offering,
      ...update.offering,
      scope: {
        ...existing.offering?.scope,
        ...update.offering?.scope,
      },
    },
    targetAudience: {
      ...existing.targetAudience,
      ...update.targetAudience,
      primaryPersona: {
        ...existing.targetAudience?.primaryPersona,
        ...update.targetAudience?.primaryPersona,
        demographics: {
          ...existing.targetAudience?.primaryPersona?.demographics,
          ...update.targetAudience?.primaryPersona?.demographics,
        },
        firmographics: {
          ...existing.targetAudience?.primaryPersona?.firmographics,
          ...update.targetAudience?.primaryPersona?.firmographics,
        },
        psychographics: {
          ...existing.targetAudience?.primaryPersona?.psychographics,
          ...update.targetAudience?.primaryPersona?.psychographics,
        },
        behavior: {
          ...existing.targetAudience?.primaryPersona?.behavior,
          ...update.targetAudience?.primaryPersona?.behavior,
        },
      },
      marketSize: {
        ...existing.targetAudience?.marketSize,
        ...update.targetAudience?.marketSize,
      },
    },
    valueProposition: {
      ...existing.valueProposition,
      ...update.valueProposition,
    },
    usp: {
      ...existing.usp,
      ...update.usp,
      uspTest: {
        ...existing.usp?.uspTest,
        ...update.usp?.uspTest,
      },
    },
    competitiveAnalysis: {
      directCompetitors: update.competitiveAnalysis?.directCompetitors ||
        existing.competitiveAnalysis?.directCompetitors,
      competitiveAdvantages: update.competitiveAnalysis?.competitiveAdvantages ||
        existing.competitiveAnalysis?.competitiveAdvantages,
      marketGaps: update.competitiveAnalysis?.marketGaps ||
        existing.competitiveAnalysis?.marketGaps,
    },
    validation: { ...existing.validation, ...update.validation },
    metadata: { ...existing.metadata, ...update.metadata },
  };
}

/**
 * Check if geschaeftsmodell data is complete enough to proceed to next module
 */
export function isGeschaeftsmodellComplete(data: PartialGeschaeftsmodellOutput): boolean {
  // Check required fields for BA compliance
  const hasOffering = Boolean(
    data.offering?.mainOffering &&
    data.offering?.oneSentencePitch
  );

  const hasTargetAudience = Boolean(
    data.targetAudience?.primaryPersona?.name &&
    data.targetAudience?.marketSize?.serviceableMarket
  );

  const hasValueProposition = Boolean(
    data.valueProposition?.valueStatement
  );

  const hasUSP = Boolean(
    data.usp?.statement &&
    data.usp?.proof
  );

  const hasCompetitors = Boolean(
    data.competitiveAnalysis?.directCompetitors &&
    data.competitiveAnalysis.directCompetitors.length >= 3
  );

  return hasOffering && hasTargetAudience && hasValueProposition && hasUSP && hasCompetitors;
}

/**
 * Calculate overall geschaeftsmodell progress (0-100)
 */
export function calculateGeschaeftsmodellProgress(data: PartialGeschaeftsmodellOutput): number {
  const allPhases: GeschaeftsmodellPhase[] = [
    'angebot',
    'zielgruppe',
    'wertversprechen',
    'usp',
  ];

  let totalFields = 0;
  let completedFields = 0;

  for (const phase of allPhases) {
    const validation = validateGeschaeftsmodellPhase(phase, data);
    const requiredCount = GESCHAEFTSMODELL_PHASE_REQUIRED_FIELDS[phase].length;
    totalFields += requiredCount;
    completedFields += validation.completedFields.length;
  }

  if (totalFields === 0) return 0;
  return Math.round((completedFields / totalFields) * 100);
}

/**
 * Get a human-readable label for a field path
 */
export function getGeschaeftsmodellFieldLabel(fieldPath: string): string {
  const labels: Record<string, string> = {
    // Offering
    'offering.mainOffering': 'Hauptangebot',
    'offering.deliveryFormat': 'Lieferformat',
    'offering.pricingModel': 'Preismodell',
    'offering.scope.included': 'Inkludierte Leistungen',
    'offering.scope.excluded': 'Ausgeschlossene Leistungen',
    'offering.oneSentencePitch': 'Elevator Pitch',

    // Target Audience
    'targetAudience.primaryPersona.name': 'Persona Name',
    'targetAudience.primaryPersona.demographics.occupation': 'Beruf',
    'targetAudience.primaryPersona.demographics.location': 'Standort',
    'targetAudience.primaryPersona.demographics.ageRange': 'Altersgruppe',
    'targetAudience.primaryPersona.psychographics.goals': 'Ziele',
    'targetAudience.primaryPersona.psychographics.challenges': 'Herausforderungen',
    'targetAudience.primaryPersona.buyingTrigger': 'Kaufauslöser',
    'targetAudience.marketSize.totalAddressableMarket': 'TAM',
    'targetAudience.marketSize.serviceableMarket': 'SAM',
    'targetAudience.marketSize.targetFirstYear': 'Zielkunden Jahr 1',

    // Value Proposition
    'valueProposition.customerJobs': 'Kundenaufgaben',
    'valueProposition.customerPains': 'Kundenprobleme',
    'valueProposition.customerGains': 'Kundengewinne',
    'valueProposition.painRelievers': 'Problemlöser',
    'valueProposition.gainCreators': 'Wertstifter',
    'valueProposition.valueStatement': 'Wertversprechen',

    // USP
    'usp.statement': 'USP Statement',
    'usp.category': 'USP Kategorie',
    'usp.proof': 'USP Beweis',
    'usp.measurement': 'USP Messung',
    'usp.uspTest.isUnique': 'Einzigartig',
    'usp.uspTest.isRelevant': 'Relevant',
    'usp.uspTest.isProvable': 'Belegbar',
    'usp.uspTest.isUnderstandable': 'Verständlich',
    'usp.uspTest.isOneSentence': 'Ein Satz',

    // Competitive Analysis
    'competitiveAnalysis.directCompetitors': 'Wettbewerber',
    'competitiveAnalysis.competitiveAdvantages': 'Wettbewerbsvorteile',
    'competitiveAnalysis.marketGaps': 'Marktlücken',

    // Validation
    'validation.offerClarity': 'Angebotsklarheit',
    'validation.targetAudienceSpecific': 'Zielgruppe spezifisch',
    'validation.marketSizeQuantified': 'Marktgröße quantifiziert',
    'validation.readyForNextModule': 'Bereit für nächstes Modul',
  };

  return labels[fieldPath] || fieldPath;
}

/**
 * Get BA compliance blockers
 */
export function getBAComplianceBlockers(data: PartialGeschaeftsmodellOutput): string[] {
  const blockers: string[] = [];

  // BLOCKER: Offer must be concrete
  if (data.validation?.offerClarity === 'vague') {
    blockers.push('Angebot zu vage - muss konkretisiert werden');
  }

  // BLOCKER: Target audience must be specific
  if (data.validation?.targetAudienceSpecific === false) {
    blockers.push('Zielgruppe zu breit - "alle" oder generisch');
  }

  // BLOCKER: Market size must be quantified
  if (data.validation?.marketSizeQuantified === false) {
    blockers.push('Marktgröße nicht quantifiziert - TAM/SAM mit Quelle erforderlich');
  }

  // BLOCKER: Minimum 3 competitors
  if (data.competitiveAnalysis?.directCompetitors &&
      data.competitiveAnalysis.directCompetitors.length < 3) {
    blockers.push(`Nur ${data.competitiveAnalysis.directCompetitors.length} Wettbewerber - mindestens 3 erforderlich`);
  }

  return blockers;
}

/**
 * Get BA compliance warnings
 */
export function getBAComplianceWarnings(data: PartialGeschaeftsmodellOutput): string[] {
  const warnings: string[] = [];

  // WARNING: USP not unique
  if (data.usp?.uspTest?.isUnique === false) {
    warnings.push('USP nicht einzigartig - Wettbewerber können dasselbe behaupten');
  }

  // WARNING: USP not relevant
  if (data.usp?.uspTest?.isRelevant === false) {
    warnings.push('USP nicht relevant - Zielgruppe interessiert sich nicht dafür');
  }

  // WARNING: USP not provable
  if (data.usp?.uspTest?.isProvable === false) {
    warnings.push('USP nicht belegbar - fehlender Nachweis');
  }

  // WARNING: Value not from customer perspective
  if (data.validation?.valueFromCustomerPerspective === false) {
    warnings.push('Wertversprechen aus Anbieter- statt Kundenperspektive');
  }

  return warnings;
}

/**
 * Format delivery format for display
 */
export function formatDeliveryFormat(format: DeliveryFormat): string {
  const labels: Record<DeliveryFormat, string> = {
    physical: 'Physisch',
    digital: 'Digital',
    service: 'Dienstleistung',
    hybrid: 'Hybrid',
  };
  return labels[format] || format;
}

/**
 * Format pricing model for display
 */
export function formatPricingModel(model: PricingModel): string {
  const labels: Record<PricingModel, string> = {
    hourly: 'Stundensatz',
    project: 'Projektpreis',
    subscription: 'Abonnement',
    product: 'Produktpreis',
    value_based: 'Wertbasiert',
  };
  return labels[model] || model;
}

/**
 * Format USP category for display
 */
export function formatUSPCategory(category: USPCategory): string {
  const labels: Record<USPCategory, string> = {
    specialization: 'Spezialisierung',
    method: 'Methode',
    result: 'Ergebnis',
    experience: 'Erfahrung',
    service: 'Service',
    speed: 'Geschwindigkeit',
    local: 'Lokalbezug',
    other: 'Sonstiges',
  };
  return labels[category] || category;
}
