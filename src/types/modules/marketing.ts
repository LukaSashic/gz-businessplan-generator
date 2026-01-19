/**
 * Module 05: Marketing & Vertrieb Types
 *
 * Marketing strategy, channels, pricing, and sales approach.
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const MarketingPhase = z.enum([
  'strategie',       // Phase 1: Marketing strategy
  'kanaele',         // Phase 2: Marketing channels
  'preisgestaltung', // Phase 3: Pricing
  'vertrieb',        // Phase 4: Sales approach
  'completed',
]);

export type MarketingPhase = z.infer<typeof MarketingPhase>;

export const MarketingChannel = z.enum([
  'website',
  'social_media',
  'content_marketing',
  'email_marketing',
  'seo',
  'sea',
  'networking',
  'referrals',
  'events',
  'direct_sales',
  'partnerships',
  'cold_outreach',
  'pr',
  'print',
  'local_advertising',
]);

export type MarketingChannel = z.infer<typeof MarketingChannel>;

export const PricingStrategy = z.enum([
  'cost_plus',       // Kosten + Marge
  'value_based',     // Wertbasiert
  'competition',     // Wettbewerbsorientiert
  'penetration',     // Niedrig zum Einstieg
  'skimming',        // Hoch zum Start
  'freemium',        // Basis kostenlos
  'tiered',          // Staffelpreise
]);

export type PricingStrategy = z.infer<typeof PricingStrategy>;

// ============================================================================
// Sub-Schemas
// ============================================================================

export const MarketingStrategieSchema = z.object({
  coreMesaage: z.string(),              // Kernbotschaft
  brandPersonality: z.array(z.string()), // Brand attributes
  communicationTone: z.string(),         // Tonalität
  targetAudienceReach: z.string(),       // How to reach them
  marketingGoals: z.array(z.object({
    goal: z.string(),
    metric: z.string(),
    target: z.string(),
    timeframe: z.string(),
  })),
});

export type MarketingStrategie = z.infer<typeof MarketingStrategieSchema>;

export const ChannelPlanSchema = z.object({
  channel: MarketingChannel,
  priority: z.enum(['primary', 'secondary', 'tertiary']),
  reasoning: z.string(),                 // Why this channel
  budget: z.number().optional(),         // Monthly budget EUR
  activities: z.array(z.string()),       // Specific activities
  expectedResults: z.string(),
  kpis: z.array(z.string()),
});

export type ChannelPlan = z.infer<typeof ChannelPlanSchema>;

export const KanaeleSchema = z.object({
  channels: z.array(ChannelPlanSchema).min(2),
  onlineOfflineBalance: z.string(),
  totalMarketingBudget: z.number(),      // Monthly EUR
  budgetAllocation: z.record(z.string(), z.number()), // Channel -> %
});

export type Kanaele = z.infer<typeof KanaeleSchema>;

export const PricePointSchema = z.object({
  productService: z.string(),
  price: z.number(),
  unit: z.string(),                      // e.g., "pro Stunde", "pro Projekt"
  competitorComparison: z.string(),
  valueJustification: z.string(),
});

export type PricePoint = z.infer<typeof PricePointSchema>;

export const PreisgestaltungSchema = z.object({
  strategy: PricingStrategy,
  strategyReasoning: z.string(),
  pricePoints: z.array(PricePointSchema),
  discountPolicy: z.string().optional(),
  paymentTerms: z.string(),
  priceAdjustmentPlan: z.string().optional(),
});

export type Preisgestaltung = z.infer<typeof PreisgestaltungSchema>;

export const VertriebSchema = z.object({
  salesApproach: z.enum(['direct', 'indirect', 'hybrid']),
  salesProcess: z.array(z.string()),     // Sales funnel steps
  averageSalesCycle: z.string(),         // Time from lead to close
  conversionRates: z.object({
    leadToProposal: z.number().min(0).max(100),
    proposalToClose: z.number().min(0).max(100),
  }).optional(),
  customerAcquisitionCost: z.number().optional(), // CAC
  lifetimeValue: z.number().optional(),           // LTV
  salesTools: z.array(z.string()),
});

export type Vertrieb = z.infer<typeof VertriebSchema>;

export const MarketingValidationSchema = z.object({
  strategyAlignedWithTarget: z.boolean(),
  channelsRealistic: z.boolean(),
  budgetRealistic: z.boolean(),
  pricingJustified: z.boolean(),
  salesProcessClear: z.boolean(),
  blockers: z.array(z.string()),
  warnings: z.array(z.string()),
  readyForNextModule: z.boolean(),
});

export type MarketingValidation = z.infer<typeof MarketingValidationSchema>;

export const MarketingMetadataSchema = z.object({
  completedAt: z.string().optional(),
  duration: z.number().optional(),
  currentPhase: MarketingPhase.optional(),
});

export type MarketingMetadata = z.infer<typeof MarketingMetadataSchema>;

// ============================================================================
// Main Output Schema
// ============================================================================

export const MarketingOutputSchema = z.object({
  strategie: MarketingStrategieSchema,
  kanaele: KanaeleSchema,
  preisgestaltung: PreisgestaltungSchema,
  vertrieb: VertriebSchema,
  validation: MarketingValidationSchema,
  metadata: MarketingMetadataSchema,
});

export type MarketingOutput = z.infer<typeof MarketingOutputSchema>;

export const PartialMarketingOutputSchema = z.object({
  strategie: MarketingStrategieSchema.deepPartial().optional(),
  kanaele: KanaeleSchema.deepPartial().optional(),
  preisgestaltung: PreisgestaltungSchema.deepPartial().optional(),
  vertrieb: VertriebSchema.deepPartial().optional(),
  validation: MarketingValidationSchema.partial().optional(),
  metadata: MarketingMetadataSchema.partial().optional(),
});

export type PartialMarketingOutput = z.infer<typeof PartialMarketingOutputSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

export function createEmptyMarketingOutput(): PartialMarketingOutput {
  return {};
}

export function isMarketingComplete(data: PartialMarketingOutput): boolean {
  return Boolean(
    data.strategie?.coreMesaage &&
    data.kanaele?.channels?.length &&
    data.preisgestaltung?.pricePoints?.length &&
    data.vertrieb?.salesApproach
  );
}
