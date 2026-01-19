/**
 * Module 04: Markt & Wettbewerb (Market & Competition) Types
 *
 * Market analysis, competitor research, and positioning.
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const MarktWettbewerbPhase = z.enum([
  'marktanalyse',      // Phase 1: Market analysis
  'zielmarkt',         // Phase 2: Target market definition
  'wettbewerber',      // Phase 3: Competitor analysis
  'positionierung',    // Phase 4: Positioning
  'completed',
]);

export type MarktWettbewerbPhase = z.infer<typeof MarktWettbewerbPhase>;

export const MarketTrend = z.enum([
  'growing',     // Wachsend
  'stable',      // Stabil
  'declining',   // Rückläufig
  'emerging',    // Entstehend
]);

export type MarketTrend = z.infer<typeof MarketTrend>;

export const CompetitorType = z.enum([
  'direct',      // Same product/service, same market
  'indirect',    // Different product, same need
  'substitute',  // Alternative solution
  'potential',   // Could enter market
]);

export type CompetitorType = z.infer<typeof CompetitorType>;

// ============================================================================
// Sub-Schemas
// ============================================================================

export const MarktanalyseSchema = z.object({
  marketName: z.string(),
  marketDescription: z.string(),
  tam: z.object({                         // Total Addressable Market
    value: z.number(),                    // In EUR
    unit: z.enum(['eur', 'customers']),
    source: z.string(),                   // Citation/URL
  }),
  sam: z.object({                         // Serviceable Available Market
    value: z.number(),
    calculation: z.string(),              // Show your work
  }),
  som: z.object({                         // Serviceable Obtainable Market
    value: z.number(),
    timeframe: z.string(),                // e.g., "Year 1"
    reasoning: z.string(),
  }),
  trend: MarketTrend,
  trendExplanation: z.string(),
  drivers: z.array(z.string()),           // Market growth drivers
  barriers: z.array(z.string()),          // Market entry barriers
});

export type Marktanalyse = z.infer<typeof MarktanalyseSchema>;

export const ZielmarktSchema = z.object({
  geographicFocus: z.string(),            // Region/area
  customerSegments: z.array(z.object({
    name: z.string(),
    size: z.number(),
    characteristics: z.array(z.string()),
    reachStrategy: z.string(),
  })),
  primarySegment: z.string(),             // Main focus
  seasonality: z.string().optional(),     // If applicable
});

export type Zielmarkt = z.infer<typeof ZielmarktSchema>;

export const WettbewerberSchema = z.object({
  name: z.string(),
  type: CompetitorType,
  website: z.string().optional(),
  description: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  priceRange: z.string(),
  marketShare: z.string().optional(),
  targetAudience: z.string(),
  yourAdvantage: z.string(),              // Why you're better
});

export type Wettbewerber = z.infer<typeof WettbewerberSchema>;

export const WettbewerbsanalyseSchema = z.object({
  // BA requires minimum 3 competitors
  competitors: z.array(WettbewerberSchema).min(3, 'BA erfordert mindestens 3 Wettbewerber'),
  competitiveLandscape: z.string(),       // Overview
  marketGaps: z.array(z.string()),        // Opportunities
  threats: z.array(z.string()),           // Competitive threats
});

export type Wettbewerbsanalyse = z.infer<typeof WettbewerbsanalyseSchema>;

export const PositionierungSchema = z.object({
  positionStatement: z.string(),          // One sentence position
  differentiators: z.array(z.string()),   // What makes you different
  pricePosition: z.enum(['premium', 'mid_range', 'budget', 'value']),
  brandValues: z.array(z.string()),
  competitiveAdvantages: z.array(z.string()),
});

export type Positionierung = z.infer<typeof PositionierungSchema>;

export const MarktValidationSchema = z.object({
  marketSizeQuantified: z.boolean(),
  marketSizeRealistic: z.boolean(),
  sourcesProvided: z.boolean(),
  minimumCompetitors: z.boolean(),        // At least 3
  positionClear: z.boolean(),
  differentiationClear: z.boolean(),
  blockers: z.array(z.string()),
  warnings: z.array(z.string()),
  readyForNextModule: z.boolean(),
});

export type MarktValidation = z.infer<typeof MarktValidationSchema>;

export const MarktMetadataSchema = z.object({
  completedAt: z.string().optional(),
  duration: z.number().optional(),
  currentPhase: MarktWettbewerbPhase.optional(),
  researchSources: z.array(z.string()).optional(),
});

export type MarktMetadata = z.infer<typeof MarktMetadataSchema>;

// ============================================================================
// Main Output Schema
// ============================================================================

export const MarktWettbewerbOutputSchema = z.object({
  marktanalyse: MarktanalyseSchema,
  zielmarkt: ZielmarktSchema,
  wettbewerbsanalyse: WettbewerbsanalyseSchema,
  positionierung: PositionierungSchema,
  validation: MarktValidationSchema,
  metadata: MarktMetadataSchema,
});

export type MarktWettbewerbOutput = z.infer<typeof MarktWettbewerbOutputSchema>;

export const PartialMarktWettbewerbOutputSchema = z.object({
  marktanalyse: MarktanalyseSchema.deepPartial().optional(),
  zielmarkt: ZielmarktSchema.deepPartial().optional(),
  wettbewerbsanalyse: WettbewerbsanalyseSchema.deepPartial().optional(),
  positionierung: PositionierungSchema.deepPartial().optional(),
  validation: MarktValidationSchema.partial().optional(),
  metadata: MarktMetadataSchema.partial().optional(),
});

export type PartialMarktWettbewerbOutput = z.infer<typeof PartialMarktWettbewerbOutputSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

export function createEmptyMarktWettbewerbOutput(): PartialMarktWettbewerbOutput {
  return {};
}

export function isMarktWettbewerbComplete(data: PartialMarktWettbewerbOutput): boolean {
  const hasMarket = Boolean(data.marktanalyse?.tam?.value && data.marktanalyse?.sam?.value);
  const hasCompetitors = Boolean(
    data.wettbewerbsanalyse?.competitors &&
    data.wettbewerbsanalyse.competitors.length >= 3
  );
  const hasPosition = Boolean(data.positionierung?.positionStatement);

  return hasMarket && hasCompetitors && hasPosition;
}
