/**
 * Module 07: SWOT-Analyse Types
 *
 * Strengths, Weaknesses, Opportunities, Threats analysis.
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const SWOTPhase = z.enum([
  'staerken',         // Phase 1: Strengths
  'schwaechen',       // Phase 2: Weaknesses
  'chancen',          // Phase 3: Opportunities
  'risiken',          // Phase 4: Threats
  'strategien',       // Phase 5: Strategic implications
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
