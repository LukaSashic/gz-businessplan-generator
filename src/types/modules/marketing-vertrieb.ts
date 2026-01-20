/**
 * Module 05: Marketing & Vertrieb (Marketing & Sales) Types (GZ-502)
 *
 * Marketing strategy and sales process with:
 * - Sales resistance handling ("Ich bin kein Verkäufer") with CBC
 * - MI for customer relationship change talk
 * - Business type adaptation (B2B vs B2C)
 * - Industry-specific marketing channels
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const MarketingVertriebPhase = z.enum([
  'intro',             // Introduction with GROW Goal
  'kundenakquise',     // Phase 1: Customer acquisition strategy
  'kanaele',          // Phase 2: Marketing channels
  'preisgestaltung',   // Phase 3: Pricing strategy
  'verkaufsprozess',   // Phase 4: Sales process
  'sales_resistance',  // Phase 5: Handle "Ich bin kein Verkäufer" with CBC
  'completed',
]);

export type MarketingVertriebPhase = z.infer<typeof MarketingVertriebPhase>;

export const BusinessModel = z.enum([
  'b2b',      // Business-to-Business
  'b2c',      // Business-to-Consumer
  'b2b2c',    // Business-to-Business-to-Consumer
  'marketplace', // Platform/Marketplace model
]);

export type BusinessModel = z.infer<typeof BusinessModel>;

export const MarketingChannelType = z.enum([
  'digital',       // Online marketing channels
  'traditional',   // Traditional media
  'direct',        // Direct sales/networking
  'referral',      // Word-of-mouth/referrals
  'partnership',   // Strategic partnerships
  'content',       // Content marketing
  'event',         // Events/trade shows
]);

export type MarketingChannelType = z.infer<typeof MarketingChannelType>;

export const PricingStrategy = z.enum([
  'premium',       // High-price, high-value
  'competitive',   // Market price matching
  'penetration',   // Low price for market entry
  'value_based',   // Based on customer value
  'cost_plus',     // Cost + margin
  'freemium',      // Free basic + paid premium
  'subscription',  // Recurring subscription
]);

export type PricingStrategy = z.infer<typeof PricingStrategy>;

export const SalesProcessType = z.enum([
  'consultative',  // Relationship-based selling
  'transactional', // Quick, simple sales
  'solution',      // Complex solution selling
  'relationship',  // Long-term relationship building
  'self_service',  // Customer serves themselves
]);

export type SalesProcessType = z.infer<typeof SalesProcessType>;

/**
 * Sales resistance level detected (for CBC handling)
 */
export const SalesResistanceLevel = z.enum([
  'none',          // No resistance detected
  'mild',          // Some hesitation about sales
  'moderate',      // Clear discomfort with selling
  'strong',        // "Ich bin kein Verkäufer" belief
]);

export type SalesResistanceLevel = z.infer<typeof SalesResistanceLevel>;

// ============================================================================
// Sub-Schemas
// ============================================================================

export const MarketingChannelSchema = z.object({
  name: z.string(),
  type: MarketingChannelType,
  suitability: z.number().min(1).max(10),  // 1-10 score for this business
  cost: z.enum(['low', 'medium', 'high']),
  timeToResults: z.enum(['immediate', 'short_term', 'medium_term', 'long_term']),
  targetAudience: z.string(),
  implementation: z.string(),              // How to implement this channel
  kpis: z.array(z.string()),              // Key performance indicators
  budget: z.number().optional(),           // Monthly budget estimate
});

export type MarketingChannel = z.infer<typeof MarketingChannelSchema>;

export const KundenakquiseSchema = z.object({
  targetCustomerProfile: z.string(),       // Detailed ideal customer
  acquisitionChannels: z.array(MarketingChannelSchema),
  primaryChannel: z.string(),              // Main acquisition method
  secondaryChannels: z.array(z.string()),  // Supporting methods
  customerJourney: z.object({
    awareness: z.string(),                 // How they become aware
    consideration: z.string(),             // How they evaluate
    decision: z.string(),                  // What triggers purchase
    retention: z.string(),                 // How to keep them
  }),
  conversionFunnel: z.object({
    awareness: z.number(),                 // Estimated reach
    interest: z.number(),                  // % who show interest
    consideration: z.number(),             // % who consider buying
    purchase: z.number(),                  // % conversion rate
  }).optional(),
});

export type Kundenakquise = z.infer<typeof KundenakquiseSchema>;

export const PreisgestaltungSchema = z.object({
  strategy: PricingStrategy,
  basePrice: z.number(),                   // Primary price point
  priceRange: z.object({
    min: z.number(),
    max: z.number(),
  }).optional(),
  valueProposition: z.string(),            // Why this price is justified
  competitorComparison: z.array(z.object({
    competitor: z.string(),
    theirPrice: z.number(),
    yourAdvantage: z.string(),
  })),
  pricingTiers: z.array(z.object({
    name: z.string(),
    price: z.number(),
    features: z.array(z.string()),
    targetSegment: z.string(),
  })).optional(),
  discountStrategy: z.string().optional(), // When/how to discount
});

export type Preisgestaltung = z.infer<typeof PreisgestaltungSchema>;

export const VerkaufsprozessSchema = z.object({
  processType: SalesProcessType,
  salesSteps: z.array(z.object({
    step: z.string(),
    description: z.string(),
    duration: z.string(),
    tools: z.array(z.string()),
    successCriteria: z.string(),
  })),
  customerTouchpoints: z.array(z.string()), // All interaction points
  salesTools: z.array(z.string()),          // CRM, presentations, etc.
  followUpStrategy: z.string(),
  objectionHandling: z.array(z.object({
    objection: z.string(),
    response: z.string(),
  })),
  closingStrategy: z.string(),
  avgSalesCycleLength: z.string(),          // How long typical sale takes
});

export type Verkaufsprozess = z.infer<typeof VerkaufsprozessSchema>;

export const MarketingValidationSchema = z.object({
  channelsIdentified: z.boolean(),          // At least 3 channels defined
  pricingJustified: z.boolean(),           // Price has rationale
  salesProcessClear: z.boolean(),          // Process is defined
  resistanceAddressed: z.boolean(),        // Sales resistance handled
  customerJourneyMapped: z.boolean(),      // Journey is clear
  kpisIdentified: z.boolean(),            // Success metrics defined
  blockers: z.array(z.string()),
  warnings: z.array(z.string()),
  readyForNextModule: z.boolean(),
});

export type MarketingValidation = z.infer<typeof MarketingValidationSchema>;

export const MarketingMetadataSchema = z.object({
  completedAt: z.string().optional(),
  duration: z.number().optional(),
  currentPhase: MarketingVertriebPhase.optional(),
  businessModel: BusinessModel.optional(),
  salesResistanceLevel: SalesResistanceLevel.optional(),
  cbcStepsUsed: z.array(z.string()).optional(), // Which CBC steps were applied
  miTechniques: z.array(z.string()).optional(), // Which MI techniques used
  researchChannels: z.array(z.string()).optional(), // Industry research done
});

export type MarketingMetadata = z.infer<typeof MarketingMetadataSchema>;

// ============================================================================
// Main Output Schema
// ============================================================================

export const MarketingVertriebOutputSchema = z.object({
  kundenakquise: KundenakquiseSchema,
  kanaele: z.object({
    selectedChannels: z.array(MarketingChannelSchema),
    channelMix: z.string(),                  // How channels work together
    budget: z.object({
      total: z.number(),
      breakdown: z.record(z.number()),       // Channel -> Budget
    }),
    timeline: z.string(),                    // Channel rollout plan
  }),
  preisgestaltung: PreisgestaltungSchema,
  verkaufsprozess: VerkaufsprozessSchema,
  validation: MarketingValidationSchema,
  metadata: MarketingMetadataSchema,
});

export type MarketingVertriebOutput = z.infer<typeof MarketingVertriebOutputSchema>;

export const PartialMarketingVertriebOutputSchema = z.object({
  kundenakquise: KundenakquiseSchema.deepPartial().optional(),
  kanaele: z.object({
    selectedChannels: z.array(MarketingChannelSchema).optional(),
    channelMix: z.string().optional(),
    budget: z.object({
      total: z.number(),
      breakdown: z.record(z.number()),
    }).partial().optional(),
    timeline: z.string().optional(),
  }).partial().optional(),
  preisgestaltung: PreisgestaltungSchema.deepPartial().optional(),
  verkaufsprozess: VerkaufsprozessSchema.deepPartial().optional(),
  validation: MarketingValidationSchema.partial().optional(),
  metadata: MarketingMetadataSchema.partial().optional(),
});

export type PartialMarketingVertriebOutput = z.infer<typeof PartialMarketingVertriebOutputSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

export function createEmptyMarketingVertriebOutput(): PartialMarketingVertriebOutput {
  return {};
}

export function isMarketingVertriebComplete(data: PartialMarketingVertriebOutput): boolean {
  const hasChannels = Boolean(
    data.kanaele?.selectedChannels &&
    data.kanaele.selectedChannels.length >= 3
  );
  const hasPricing = Boolean(data.preisgestaltung?.basePrice);
  const hasSalesProcess = Boolean(
    data.verkaufsprozess?.salesSteps &&
    data.verkaufsprozess.salesSteps.length > 0
  );
  const hasCustomerProfile = Boolean(data.kundenakquise?.targetCustomerProfile);

  return hasChannels && hasPricing && hasSalesProcess && hasCustomerProfile;
}

// ============================================================================
// Sales Resistance CBC Schema (GZ-502)
// ============================================================================

/**
 * CBC handling for "Ich bin kein Verkäufer" limiting belief
 */
export const SalesResistanceCBCSchema = z.object({
  /** Detected resistance patterns */
  resistancePatterns: z.array(z.string()).optional(),
  /** CBC step currently being addressed */
  currentCBCStep: z.enum(['identify', 'evidence', 'challenge', 'reframe', 'action']).optional(),
  /** Evidence gathered about user's influence/persuasion experiences */
  evidenceGathered: z.array(z.object({
    situation: z.string(),
    outcome: z.string(),
    skillsUsed: z.array(z.string()),
  })).optional(),
  /** Reframing insights */
  reframes: z.array(z.string()).optional(),
  /** Action steps for authentic selling approach */
  actionSteps: z.array(z.string()).optional(),
  /** CBC completion status */
  cbcCompleted: z.boolean().optional(),
});

export type SalesResistanceCBC = z.infer<typeof SalesResistanceCBCSchema>;

// ============================================================================
// MI Customer Relationship Schema (GZ-502)
// ============================================================================

/**
 * MI tracking for customer relationship change talk
 */
export const CustomerRelationshipMISchema = z.object({
  /** Detected change talk about customer relationships */
  changeTalk: z.array(z.object({
    type: z.enum(['desire', 'ability', 'reason', 'need', 'commitment', 'activation', 'taking_steps']),
    statement: z.string(),
    strength: z.enum(['weak', 'medium', 'strong']),
  })).optional(),
  /** User's relationship preferences */
  relationshipPreferences: z.array(z.string()).optional(),
  /** Strengths in customer interaction */
  customerStrengths: z.array(z.string()).optional(),
  /** MI responses used */
  miResponses: z.array(z.string()).optional(),
});

export type CustomerRelationshipMI = z.infer<typeof CustomerRelationshipMISchema>;

// ============================================================================
// Business Type Adaptations (GZ-502)
// ============================================================================

/**
 * Business type specific question sets
 */
export const BusinessTypeAdaptationSchema = z.object({
  /** Detected business model */
  businessModel: BusinessModel,
  /** B2B specific considerations */
  b2bConsiderations: z.array(z.string()).optional(),
  /** B2C specific considerations */
  b2cConsiderations: z.array(z.string()).optional(),
  /** Industry-specific channels researched */
  industryChannels: z.array(z.object({
    channel: z.string(),
    industryFit: z.number().min(1).max(10),
    examples: z.array(z.string()),
    researchSource: z.string().optional(),
  })).optional(),
});

export type BusinessTypeAdaptation = z.infer<typeof BusinessTypeAdaptationSchema>;

// ============================================================================
// Extended Output Schema (GZ-502)
// ============================================================================

/**
 * Extended metadata including CBC, MI, and business type handling
 */
export const ExtendedMarketingMetadataSchema = MarketingMetadataSchema.extend({
  /** Sales resistance CBC tracking */
  salesResistanceCBC: SalesResistanceCBCSchema.optional(),
  /** Customer relationship MI tracking */
  customerRelationshipMI: CustomerRelationshipMISchema.optional(),
  /** Business type adaptations */
  businessTypeAdaptation: BusinessTypeAdaptationSchema.optional(),
  /** Research sources used */
  researchSources: z.array(z.string()).optional(),
  /** Conversation turns */
  conversationTurns: z.number().optional(),
});

export type ExtendedMarketingMetadata = z.infer<typeof ExtendedMarketingMetadataSchema>;

// ============================================================================
// Phase Info (GZ-502)
// ============================================================================

export const MarketingVertriebPhaseInfo: Record<MarketingVertriebPhase, {
  label: string;
  duration: number;
  questionClusters: string[];
  coachingDepth: 'shallow' | 'medium' | 'deep';
}> = {
  intro: {
    label: 'Einführung',
    duration: 5,
    questionClusters: ['goal_setting'],
    coachingDepth: 'shallow',
  },
  kundenakquise: {
    label: 'Kundenakquise',
    duration: 25,
    questionClusters: ['customer_profile', 'acquisition_channels', 'customer_journey'],
    coachingDepth: 'medium',
  },
  kanaele: {
    label: 'Marketing-Kanäle',
    duration: 20,
    questionClusters: ['channel_selection', 'channel_mix', 'budget_allocation'],
    coachingDepth: 'medium',
  },
  preisgestaltung: {
    label: 'Preisgestaltung',
    duration: 15,
    questionClusters: ['pricing_strategy', 'value_proposition', 'competitor_pricing'],
    coachingDepth: 'medium',
  },
  verkaufsprozess: {
    label: 'Verkaufsprozess',
    duration: 20,
    questionClusters: ['sales_process', 'touchpoints', 'objection_handling'],
    coachingDepth: 'medium',
  },
  sales_resistance: {
    label: 'Sales Resistance Handling',
    duration: 15,
    questionClusters: ['cbc_steps', 'reframing', 'action_planning'],
    coachingDepth: 'deep',
  },
  completed: {
    label: 'Abgeschlossen',
    duration: 0,
    questionClusters: [],
    coachingDepth: 'shallow',
  },
};

/**
 * Merge partial updates into existing data
 */
export function mergeMarketingVertriebData(
  existing: PartialMarketingVertriebOutput,
  update: PartialMarketingVertriebOutput
): PartialMarketingVertriebOutput {
  return {
    kundenakquise: existing.kundenakquise || update.kundenakquise
      ? { ...existing.kundenakquise, ...update.kundenakquise }
      : undefined,
    kanaele: existing.kanaele || update.kanaele
      ? {
          ...existing.kanaele,
          ...update.kanaele,
          selectedChannels: [
            ...(existing.kanaele?.selectedChannels || []),
            ...(update.kanaele?.selectedChannels || []).filter(
              (newChannel) =>
                !(existing.kanaele?.selectedChannels || []).some(
                  (existingChannel) => existingChannel?.name === newChannel?.name
                )
            ),
          ],
        }
      : undefined,
    preisgestaltung: existing.preisgestaltung || update.preisgestaltung
      ? { ...existing.preisgestaltung, ...update.preisgestaltung }
      : undefined,
    verkaufsprozess: existing.verkaufsprozess || update.verkaufsprozess
      ? { ...existing.verkaufsprozess, ...update.verkaufsprozess }
      : undefined,
    validation: existing.validation || update.validation
      ? { ...existing.validation, ...update.validation }
      : undefined,
    metadata: { ...existing.metadata, ...update.metadata },
  };
}

/**
 * Calculate module completion percentage
 */
export function calculateMarketingVertriebCompletion(data: PartialMarketingVertriebOutput): number {
  let score = 0;
  const maxScore = 100;

  // Customer acquisition (25 points)
  if (data.kundenakquise?.targetCustomerProfile) score += 10;
  const channelCount = data.kundenakquise?.acquisitionChannels?.length || 0;
  score += Math.min(channelCount * 5, 15); // Up to 3 channels = 15 points

  // Marketing channels (25 points)
  const selectedChannelCount = data.kanaele?.selectedChannels?.length || 0;
  score += Math.min(selectedChannelCount * 6, 18); // Up to 3 channels = 18 points
  if (data.kanaele?.channelMix) score += 7;

  // Pricing (25 points)
  if (data.preisgestaltung?.basePrice) score += 10;
  if (data.preisgestaltung?.strategy) score += 8;
  if (data.preisgestaltung?.valueProposition) score += 7;

  // Sales process (25 points)
  const salesStepCount = data.verkaufsprozess?.salesSteps?.length || 0;
  score += Math.min(salesStepCount * 5, 15); // Up to 3 steps = 15 points
  if (data.verkaufsprozess?.processType) score += 10;

  return Math.min(Math.round((score / maxScore) * 100), 100);
}