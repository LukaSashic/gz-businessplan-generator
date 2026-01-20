/**
 * Module 04: Markt & Wettbewerb (Market & Competition) Types (GZ-501)
 *
 * Market analysis, competitor research, and positioning with:
 * - YC reality check questions ("Woher weißt du das?")
 * - Research trigger integration ("Ich recherchiere jetzt...")
 * - MI handling for overconfidence and fear patterns
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const MarktWettbewerbPhase = z.enum([
  'intro',             // Introduction with GROW Goal
  'marktanalyse',      // Phase 1: Market analysis (TAM/SAM/SOM)
  'zielmarkt',         // Phase 2: Target market definition
  'wettbewerber',      // Phase 3: Competitor analysis
  'positionierung',    // Phase 4: Positioning
  'reality_check',     // Phase 5: YC-style validation
  'completed',
]);

export type MarktWettbewerbPhase = z.infer<typeof MarktWettbewerbPhase>;

export const MarketTrend = z.enum([
  'growing_fast', // >10% jährliches Wachstum
  'growing',      // 3-10% Wachstum
  'stable',       // Stabil (0-3%)
  'declining',    // Rückläufig
  'emerging',     // Entstehend/Neu
]);

export type MarketTrend = z.infer<typeof MarketTrend>;

export const CompetitorType = z.enum([
  'direct',      // Same product/service, same market
  'indirect',    // Different product, same need
  'substitute',  // Alternative solution
  'potential',   // Could enter market
]);

export type CompetitorType = z.infer<typeof CompetitorType>;

/**
 * Evidence quality for YC reality checks
 */
export const EvidenceQuality = z.enum([
  'validated',   // Durch Gespräche/Tests validiert
  'researched',  // Durch Recherche belegt
  'assumed',     // Annahme ohne Beleg
  'unknown',     // Unbekannt
]);

export type EvidenceQuality = z.infer<typeof EvidenceQuality>;

/**
 * Founder confidence level (for MI handling)
 */
export const ConfidenceLevel = z.enum([
  'overconfident',  // Zu optimistisch, braucht Realitäts-Check
  'confident',      // Angemessen zuversichtlich
  'uncertain',      // Unsicher, braucht Unterstützung
  'fearful',        // Ängstlich, braucht MI Empathie
]);

export type ConfidenceLevel = z.infer<typeof ConfidenceLevel>;

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

// ============================================================================
// YC Reality Check Schema (GZ-501)
// ============================================================================

/**
 * YC-style reality checks for market assumptions
 */
export const YCRealityCheckSchema = z.object({
  /** Key assumptions being tested */
  assumptions: z.array(z.object({
    assumption: z.string(),
    evidence: z.string().optional(),
    source: z.string().optional(),
    status: z.enum(['validated', 'partially_validated', 'unvalidated', 'invalidated']),
    nextStep: z.string().optional(),
  })).optional(),
  /** YC reality check questions answered */
  ycQuestions: z.object({
    /** Wer hat das Problem WIRKLICH? */
    realProblemOwner: z.string().optional(),
    /** Wie oft tritt das Problem auf? */
    problemFrequency: z.string().optional(),
    /** Wie viel würden sie für eine Lösung zahlen? */
    willingnessTopay: z.string().optional(),
    /** Was machen sie heute stattdessen? */
    currentAlternatives: z.string().optional(),
    /** Woher weißt du das? */
    evidenceSource: z.string().optional(),
  }).optional(),
  /** Red flags identified */
  redFlags: z.array(z.string()).optional(),
  /** Validation needs */
  validationNeeds: z.array(z.string()).optional(),
  /** Overall market confidence */
  marketConfidence: ConfidenceLevel.optional(),
});

export type YCRealityCheck = z.infer<typeof YCRealityCheckSchema>;

// ============================================================================
// Research Trigger Schema (GZ-501)
// ============================================================================

/**
 * Research trigger tracking for "Ich recherchiere jetzt..."
 */
export const ResearchTriggerSchema = z.object({
  /** Topic being researched */
  topic: z.string(),
  /** Research query/question */
  query: z.string(),
  /** Timestamp */
  timestamp: z.string().optional(),
  /** Results summary (if available) */
  resultSummary: z.string().optional(),
  /** Source URLs */
  sources: z.array(z.string()).optional(),
  /** Status */
  status: z.enum(['pending', 'completed', 'failed']).optional(),
});

export type ResearchTrigger = z.infer<typeof ResearchTriggerSchema>;

// ============================================================================
// GROW Model Progress (GZ-501)
// ============================================================================

/**
 * GROW model progress tracking for market module
 */
export const MarktGROWProgressSchema = z.object({
  /** GOAL: What do you want to understand about your market? */
  goal: z.string().optional(),
  /** REALITY: What do you currently know/assume? */
  reality: z.string().optional(),
  /** OPTIONS: What research/validation options exist? */
  options: z.array(z.string()).optional(),
  /** WILL: What will you do to validate? */
  will: z.string().optional(),
});

export type MarktGROWProgress = z.infer<typeof MarktGROWProgressSchema>;

// ============================================================================
// MI Confidence Handling (GZ-501)
// ============================================================================

/**
 * Tracks founder confidence patterns for MI handling
 */
export const ConfidencePatternSchema = z.object({
  /** Detected confidence level */
  level: ConfidenceLevel,
  /** Trigger phrase that indicated confidence level */
  trigger: z.string().optional(),
  /** MI response strategy used */
  responseStrategy: z.enum([
    'socratic_challenge',   // For overconfidence
    'reality_check',        // For overconfidence
    'empathy_express',      // For fear/uncertainty
    'self_efficacy',        // For fear/uncertainty
    'roll_with_resistance', // For resistance
    'develop_discrepancy',  // For ambivalence
  ]).optional(),
  /** Outcome of intervention */
  outcome: z.string().optional(),
});

export type ConfidencePattern = z.infer<typeof ConfidencePatternSchema>;

// ============================================================================
// Phase Info (GZ-501)
// ============================================================================

export const MarktWettbewerbPhaseInfo: Record<MarktWettbewerbPhase, {
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
  marktanalyse: {
    label: 'Marktanalyse',
    duration: 20,
    questionClusters: ['tam_sam_som', 'market_trends', 'market_drivers'],
    coachingDepth: 'medium',
  },
  zielmarkt: {
    label: 'Zielmarkt',
    duration: 20,
    questionClusters: ['customer_segments', 'pain_points', 'buying_behavior'],
    coachingDepth: 'medium',
  },
  wettbewerber: {
    label: 'Wettbewerber',
    duration: 25,
    questionClusters: ['direct_competitors', 'indirect_competitors', 'competitive_factors'],
    coachingDepth: 'medium',
  },
  positionierung: {
    label: 'Positionierung',
    duration: 15,
    questionClusters: ['positioning', 'differentiators', 'competitive_advantages'],
    coachingDepth: 'medium',
  },
  reality_check: {
    label: 'Realitäts-Check',
    duration: 10,
    questionClusters: ['yc_questions', 'assumption_testing', 'validation_needs'],
    coachingDepth: 'deep',
  },
  completed: {
    label: 'Abgeschlossen',
    duration: 0,
    questionClusters: [],
    coachingDepth: 'shallow',
  },
};

// ============================================================================
// Extended Output Schema (GZ-501)
// ============================================================================

/**
 * Extended metadata including research and coaching info
 */
export const ExtendedMarktMetadataSchema = MarktMetadataSchema.extend({
  /** GROW model progress */
  growProgress: MarktGROWProgressSchema.optional(),
  /** YC reality check results */
  realityCheck: YCRealityCheckSchema.optional(),
  /** Research triggers executed */
  researchTriggers: z.array(ResearchTriggerSchema).optional(),
  /** Confidence patterns detected */
  confidencePatterns: z.array(ConfidencePatternSchema).optional(),
  /** Research count */
  researchCount: z.number().optional(),
  /** Conversation turns */
  conversationTurns: z.number().optional(),
});

export type ExtendedMarktMetadata = z.infer<typeof ExtendedMarktMetadataSchema>;

/**
 * Merge partial updates into existing data
 */
export function mergeMarktWettbewerbData(
  existing: PartialMarktWettbewerbOutput,
  update: PartialMarktWettbewerbOutput
): PartialMarktWettbewerbOutput {
  return {
    marktanalyse: existing.marktanalyse || update.marktanalyse
      ? { ...existing.marktanalyse, ...update.marktanalyse }
      : undefined,
    zielmarkt: existing.zielmarkt || update.zielmarkt
      ? { ...existing.zielmarkt, ...update.zielmarkt }
      : undefined,
    wettbewerbsanalyse: existing.wettbewerbsanalyse || update.wettbewerbsanalyse
      ? {
          ...existing.wettbewerbsanalyse,
          ...update.wettbewerbsanalyse,
          competitors: [
            ...(existing.wettbewerbsanalyse?.competitors || []),
            ...(update.wettbewerbsanalyse?.competitors || []).filter(
              (newComp) =>
                !(existing.wettbewerbsanalyse?.competitors || []).some(
                  (existingComp) => existingComp?.name === newComp?.name
                )
            ),
          ],
        }
      : undefined,
    positionierung: existing.positionierung || update.positionierung
      ? { ...existing.positionierung, ...update.positionierung }
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
export function calculateMarktWettbewerbCompletion(data: PartialMarktWettbewerbOutput): number {
  let score = 0;
  const maxScore = 100;

  // Market analysis (30 points)
  if (data.marktanalyse?.marketName) score += 5;
  if (data.marktanalyse?.tam?.value) score += 10;
  if (data.marktanalyse?.sam?.value) score += 8;
  if (data.marktanalyse?.som?.value) score += 7;

  // Target market (20 points)
  if (data.zielmarkt?.primarySegment) score += 10;
  const segmentCount = data.zielmarkt?.customerSegments?.length || 0;
  score += Math.min(segmentCount * 5, 10);

  // Competitors (30 points)
  const competitorCount = data.wettbewerbsanalyse?.competitors?.length || 0;
  score += Math.min(competitorCount * 8, 24); // 3 competitors = 24 points
  if (data.wettbewerbsanalyse?.marketGaps && data.wettbewerbsanalyse.marketGaps.length > 0) {
    score += 6;
  }

  // Positioning (20 points)
  if (data.positionierung?.positionStatement) score += 10;
  if (data.positionierung?.differentiators && data.positionierung.differentiators.length > 0) {
    score += 10;
  }

  return Math.min(Math.round((score / maxScore) * 100), 100);
}
