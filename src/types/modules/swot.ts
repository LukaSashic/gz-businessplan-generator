/**
 * Module 8: SWOT Analysis Types (GZ-701)
 *
 * SWOT analysis module ensuring balanced strengths/weaknesses assessment:
 * - Four quadrants: Strengths, Weaknesses, Opportunities, Threats
 * - Coaching for balance (not only positives OR negatives)
 * - Cross-reference with previous modules for consistency
 * - Socratic prompts for over-optimistic users
 * - Appreciative Inquiry for over-pessimistic users
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const SWOTPhase = z.enum([
  'intro',            // Introduction with balance assessment
  'staerken',         // Phase 1: Strengths
  'schwaechen',       // Phase 2: Weaknesses
  'chancen',          // Phase 3: Opportunities
  'risiken',          // Phase 4: Threats
  'strategien',       // Phase 5: Strategic implications
  'validierung',      // Phase 6: Validation and consistency check
  'completed',
]);

export type SWOTPhase = z.infer<typeof SWOTPhase>;

export const SWOTQuadrant = z.enum([
  'strength',         // Stärke
  'weakness',         // Schwäche
  'opportunity',      // Chance
  'threat',           // Risiko
]);

export type SWOTQuadrant = z.infer<typeof SWOTQuadrant>;

export const SWOTItemPriority = z.enum(['high', 'medium', 'low']);
export type SWOTItemPriority = z.infer<typeof SWOTItemPriority>;

export const BalanceLevel = z.enum([
  'over_optimistic',    // Nur Positives, unrealistisch
  'over_pessimistic',   // Nur Negatives, entmutigt
  'balanced',           // Ausgewogene, realistische Einschätzung
  'insufficient_data',  // Zu wenig Information
]);

export type BalanceLevel = z.infer<typeof BalanceLevel>;

export const ConsistencyLevel = z.enum([
  'consistent',         // Konsistent mit vorherigen Modulen
  'minor_conflicts',    // Kleinere Widersprüche
  'major_conflicts',    // Große Widersprüche
  'insufficient_data',  // Zu wenig Information für Vergleich
]);

export type ConsistencyLevel = z.infer<typeof ConsistencyLevel>;

// ============================================================================
// Sub-Schemas
// ============================================================================

export const SWOTItemSchema = z.object({
  description: z.string(),
  priority: SWOTItemPriority,
  sourceModule: z.string().optional(),    // Which module identified this
  evidence: z.string().optional(),        // Supporting evidence
});

export type SWOTItem = z.infer<typeof SWOTItemSchema>;

export const StaerkenSchema = z.object({
  items: z.array(SWOTItemSchema).min(3, 'Mindestens 3 Stärken erforderlich'),
  keyStrength: z.string(),                // Most important strength
  howToLeverage: z.string(),              // How to use these strengths
});

export type Staerken = z.infer<typeof StaerkenSchema>;

export const SchwaechenSchema = z.object({
  items: z.array(SWOTItemSchema).min(2, 'Mindestens 2 Schwächen identifizieren'),
  keyWeakness: z.string(),                // Most critical weakness
  mitigationPlan: z.string(),             // How to address weaknesses
});

export type Schwaechen = z.infer<typeof SchwaechenSchema>;

export const ChancenSchema = z.object({
  items: z.array(SWOTItemSchema).min(2, 'Mindestens 2 Chancen identifizieren'),
  keyOpportunity: z.string(),             // Most promising opportunity
  howToCapture: z.string(),               // Plan to seize opportunities
});

export type Chancen = z.infer<typeof ChancenSchema>;

export const RisikenSchema = z.object({
  items: z.array(SWOTItemSchema).min(2, 'Mindestens 2 Risiken identifizieren'),
  keyThreat: z.string(),                  // Most critical threat
  mitigationPlan: z.string(),             // How to handle threats
  contingencyPlan: z.string().optional(), // Backup plan
});

export type Risiken = z.infer<typeof RisikenSchema>;

/**
 * TOWS Matrix - Strategic combinations
 */
export const TOWSStrategienSchema = z.object({
  // SO: Use strengths to capture opportunities
  soStrategies: z.array(z.object({
    strength: z.string(),
    opportunity: z.string(),
    strategy: z.string(),
  })),

  // WO: Overcome weaknesses using opportunities
  woStrategies: z.array(z.object({
    weakness: z.string(),
    opportunity: z.string(),
    strategy: z.string(),
  })),

  // ST: Use strengths to counter threats
  stStrategies: z.array(z.object({
    strength: z.string(),
    threat: z.string(),
    strategy: z.string(),
  })),

  // WT: Minimize weaknesses and avoid threats
  wtStrategies: z.array(z.object({
    weakness: z.string(),
    threat: z.string(),
    strategy: z.string(),
  })),
});

export type TOWSStrategien = z.infer<typeof TOWSStrategienSchema>;

export const SWOTBalanceAssessmentSchema = z.object({
  overallBalance: BalanceLevel,            // Gesamtbeurteilung der Balance
  strengthsCount: z.number(),              // Anzahl identifizierter Stärken
  weaknessesCount: z.number(),             // Anzahl identifizierter Schwächen
  opportunitiesCount: z.number(),          // Anzahl identifizierter Chancen
  threatsCount: z.number(),                // Anzahl identifizierter Risiken
  balanceScore: z.number().min(0).max(100), // Balance-Score (100 = perfekte Balance)
  coachingRecommendations: z.array(z.string()), // Coaching-Empfehlungen für bessere Balance
});

export type SWOTBalanceAssessment = z.infer<typeof SWOTBalanceAssessmentSchema>;

export const SWOTConsistencyCheckSchema = z.object({
  overallConsistency: ConsistencyLevel,    // Gesamtkonsistenz
  conflicts: z.array(z.object({           // Identifizierte Konflikte
    swotItem: z.string(),                 // Der SWOT-Punkt
    conflictingModule: z.string(),        // Das widersprüchliche Modul
    description: z.string(),              // Beschreibung des Konflikts
    severity: z.enum(['minor', 'major']), // Schwere des Konflikts
    suggestion: z.string(),               // Lösungsvorschlag
  })),
  moduleReferences: z.record(z.array(z.string())), // Verweise auf andere Module pro Quadrant
  validatedItems: z.array(z.string()),    // Validierte SWOT-Punkte
});

export type SWOTConsistencyCheck = z.infer<typeof SWOTConsistencyCheckSchema>;

export const SWOTValidationSchema = z.object({
  // Balance check
  isBalanced: z.boolean(),                // Not overly positive or negative
  minimumPerQuadrant: z.boolean(),        // At least 2 per quadrant

  // Quality checks
  strengthsActionable: z.boolean(),
  weaknessesAddressed: z.boolean(),
  opportunitiesRealistic: z.boolean(),
  threatsMitigated: z.boolean(),

  // Cross-reference
  consistentWithPreviousModules: z.boolean(),

  blockers: z.array(z.string()),
  warnings: z.array(z.string()),
  readyForNextModule: z.boolean(),
});

export type SWOTValidation = z.infer<typeof SWOTValidationSchema>;

export const SWOTMetadataSchema = z.object({
  completedAt: z.string().optional(),
  duration: z.number().optional(),
  currentPhase: SWOTPhase.optional(),
  balanceAssessments: z.array(SWOTBalanceAssessmentSchema).optional(), // Verlauf der Balance-Bewertungen
  coachingInterventions: z.array(z.string()).optional(), // Coaching-Interventionen für Balance
  conversationTurns: z.number().optional(),
});

export type SWOTMetadata = z.infer<typeof SWOTMetadataSchema>;

// ============================================================================
// Main Output Schema
// ============================================================================

export const SWOTOutputSchema = z.object({
  staerken: StaerkenSchema,
  schwaechen: SchwaechenSchema,
  chancen: ChancenSchema,
  risiken: RisikenSchema,
  strategien: TOWSStrategienSchema,
  balanceAssessment: SWOTBalanceAssessmentSchema,
  consistencyCheck: SWOTConsistencyCheckSchema,
  validation: SWOTValidationSchema,
  metadata: SWOTMetadataSchema,
});

export type SWOTOutput = z.infer<typeof SWOTOutputSchema>;

export const PartialSWOTOutputSchema = z.object({
  staerken: StaerkenSchema.deepPartial().optional(),
  schwaechen: SchwaechenSchema.deepPartial().optional(),
  chancen: ChancenSchema.deepPartial().optional(),
  risiken: RisikenSchema.deepPartial().optional(),
  strategien: TOWSStrategienSchema.deepPartial().optional(),
  balanceAssessment: SWOTBalanceAssessmentSchema.partial().optional(),
  consistencyCheck: SWOTConsistencyCheckSchema.partial().optional(),
  validation: SWOTValidationSchema.partial().optional(),
  metadata: SWOTMetadataSchema.partial().optional(),
});

export type PartialSWOTOutput = z.infer<typeof PartialSWOTOutputSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

export function createEmptySWOTOutput(): PartialSWOTOutput {
  return {};
}

export function isSWOTComplete(data: PartialSWOTOutput): boolean {
  const minStrengths = (data.staerken?.items?.length ?? 0) >= 3;
  const minWeaknesses = (data.schwaechen?.items?.length ?? 0) >= 2;
  const minOpportunities = (data.chancen?.items?.length ?? 0) >= 2;
  const minThreats = (data.risiken?.items?.length ?? 0) >= 2;

  return minStrengths && minWeaknesses && minOpportunities && minThreats;
}

/**
 * Check if SWOT is balanced (not overly positive/negative)
 */
export function isSWOTBalanced(data: PartialSWOTOutput): boolean {
  const positiveCount =
    (data.staerken?.items?.length ?? 0) +
    (data.chancen?.items?.length ?? 0);
  const negativeCount =
    (data.schwaechen?.items?.length ?? 0) +
    (data.risiken?.items?.length ?? 0);

  // Ratio should be between 0.5 and 2.0
  if (negativeCount === 0) return false;
  const ratio = positiveCount / negativeCount;
  return ratio >= 0.5 && ratio <= 2.0;
}

/**
 * Assess balance level of SWOT analysis
 */
export function assessSWOTBalance(data: PartialSWOTOutput): BalanceLevel {
  const strengthsCount = data.staerken?.items?.length || 0;
  const weaknessesCount = data.schwaechen?.items?.length || 0;
  const opportunitiesCount = data.chancen?.items?.length || 0;
  const threatsCount = data.risiken?.items?.length || 0;

  const totalCount = strengthsCount + weaknessesCount + opportunitiesCount + threatsCount;

  if (totalCount < 4) return 'insufficient_data';

  const positiveCount = strengthsCount + opportunitiesCount;
  const negativeCount = weaknessesCount + threatsCount;

  // Over-optimistic: >75% positive
  if (positiveCount / totalCount > 0.75) return 'over_optimistic';

  // Over-pessimistic: >75% negative
  if (negativeCount / totalCount > 0.75) return 'over_pessimistic';

  return 'balanced';
}

/**
 * Get coaching intervention based on balance level
 */
export function getBalanceIntervention(balanceLevel: BalanceLevel): string[] {
  switch (balanceLevel) {
    case 'over_optimistic':
      return [
        "Ihre Analyse ist sehr positiv - das zeigt Optimismus! Lassen Sie uns auch realistische Herausforderungen betrachten.",
        "Was könnte in den nächsten 12 Monaten schiefgehen?",
        "Welche Schwächen könnten Ihnen Probleme bereiten?",
        "Was würde Ihnen Sorgen machen, wenn Sie ehrlich sind?"
      ];
    case 'over_pessimistic':
      return [
        "Sie denken sehr kritisch - das zeigt, dass Sie Risiken ernst nehmen. Lassen Sie uns auch Ihre Stärken würdigen.",
        "Welche Erfolge haben Sie bisher erreicht?",
        "Was können Sie besser als andere?",
        "Welche positiven Entwicklungen sind möglich?"
      ];
    case 'insufficient_data':
      return [
        "Lassen Sie uns systematisch durch alle vier Bereiche gehen.",
        "Eine vollständige SWOT-Analyse hilft bei strategischen Entscheidungen."
      ];
    case 'balanced':
      return [
        "Ihre Analyse ist ausgewogen - das zeigt realistische Einschätzung!",
        "So erhalten Sie ein klares Bild für strategische Entscheidungen."
      ];
  }
}

/**
 * Calculate module completion percentage
 */
export function calculateSWOTCompletion(data: PartialSWOTOutput): number {
  let score = 0;
  const maxScore = 100;

  // Each quadrant worth 25 points
  const strengthsScore = Math.min((data.staerken?.items?.length || 0) * 8, 25);
  const weaknessesScore = Math.min((data.schwaechen?.items?.length || 0) * 12, 25);
  const opportunitiesScore = Math.min((data.chancen?.items?.length || 0) * 12, 25);
  const threatsScore = Math.min((data.risiken?.items?.length || 0) * 12, 25);

  score = strengthsScore + weaknessesScore + opportunitiesScore + threatsScore;

  return Math.min(Math.round((score / maxScore) * 100), 100);
}

/**
 * Merge partial updates into existing SWOT data
 */
export function mergeSWOTData(
  existing: PartialSWOTOutput,
  update: PartialSWOTOutput
): PartialSWOTOutput {
  return {
    staerken: existing.staerken || update.staerken
      ? { ...existing.staerken, ...update.staerken }
      : undefined,
    schwaechen: existing.schwaechen || update.schwaechen
      ? { ...existing.schwaechen, ...update.schwaechen }
      : undefined,
    chancen: existing.chancen || update.chancen
      ? { ...existing.chancen, ...update.chancen }
      : undefined,
    risiken: existing.risiken || update.risiken
      ? { ...existing.risiken, ...update.risiken }
      : undefined,
    strategien: existing.strategien || update.strategien
      ? { ...existing.strategien, ...update.strategien }
      : undefined,
    balanceAssessment: existing.balanceAssessment || update.balanceAssessment
      ? { ...existing.balanceAssessment, ...update.balanceAssessment }
      : undefined,
    consistencyCheck: existing.consistencyCheck || update.consistencyCheck
      ? { ...existing.consistencyCheck, ...update.consistencyCheck }
      : undefined,
    validation: existing.validation || update.validation
      ? { ...existing.validation, ...update.validation }
      : undefined,
    metadata: { ...existing.metadata, ...update.metadata },
  };
}

// ============================================================================
// Phase Info
// ============================================================================

export const SWOTPhaseInfo: Record<SWOTPhase, {
  label: string;
  duration: number;
  questionClusters: string[];
  coachingDepth: 'shallow' | 'medium' | 'deep';
}> = {
  intro: {
    label: 'Einführung SWOT',
    duration: 5,
    questionClusters: ['swot_overview', 'balance_check'],
    coachingDepth: 'shallow',
  },
  staerken: {
    label: 'Stärken',
    duration: 10,
    questionClusters: ['internal_strengths', 'competitive_advantages', 'past_successes'],
    coachingDepth: 'medium',
  },
  schwaechen: {
    label: 'Schwächen',
    duration: 10,
    questionClusters: ['internal_weaknesses', 'improvement_areas', 'skill_gaps'],
    coachingDepth: 'medium',
  },
  chancen: {
    label: 'Chancen',
    duration: 10,
    questionClusters: ['external_opportunities', 'market_trends', 'growth_potential'],
    coachingDepth: 'medium',
  },
  risiken: {
    label: 'Risiken',
    duration: 10,
    questionClusters: ['external_threats', 'competitive_risks', 'market_challenges'],
    coachingDepth: 'medium',
  },
  strategien: {
    label: 'Strategien',
    duration: 10,
    questionClusters: ['tows_combinations', 'strategic_options'],
    coachingDepth: 'medium',
  },
  validierung: {
    label: 'Validierung',
    duration: 5,
    questionClusters: ['consistency_check', 'balance_assessment'],
    coachingDepth: 'shallow',
  },
  completed: {
    label: 'Abgeschlossen',
    duration: 0,
    questionClusters: [],
    coachingDepth: 'shallow',
  },
};
