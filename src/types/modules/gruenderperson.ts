/**
 * Module 1: Gründerperson Types (GZ-401)
 *
 * TypeScript types for the Gründerperson module output.
 */

import { z } from 'zod';

// ============================================================================
// Enums and Constants
// ============================================================================

export const QualificationLevel = z.enum(['high', 'medium', 'low', 'none']);
export type QualificationLevel = z.infer<typeof QualificationLevel>;

export const MotivationType = z.enum(['intrinsic', 'extrinsic', 'mixed']);
export type MotivationType = z.infer<typeof MotivationType>;

// ============================================================================
// Sub-Schemas
// ============================================================================

export const BerufserfahrungSchema = z.object({
  /** Total years of professional experience */
  totalYears: z.number().min(0).max(50),
  /** Years in relevant industry */
  industryYears: z.number().min(0).max(50),
  /** Key roles/positions held */
  keyRoles: z.array(z.string()),
  /** Notable achievements in career */
  achievements: z.array(z.string()),
  /** Skills acquired from experience */
  acquiredSkills: z.array(z.string()),
});
export type Berufserfahrung = z.infer<typeof BerufserfahrungSchema>;

export const QualifikationSchema = z.object({
  /** Formal education level */
  education: z.string(),
  /** Professional certifications */
  certifications: z.array(z.string()),
  /** Relevant trainings/courses */
  trainings: z.array(z.string()),
  /** Self-taught skills */
  selfTaught: z.array(z.string()),
  /** Qualification level for the business */
  relevanceLevel: QualificationLevel,
  /** Reasoning for qualification assessment */
  reasoning: z.string(),
});
export type Qualifikation = z.infer<typeof QualifikationSchema>;

export const StaerkenProfilSchema = z.object({
  /** Core strengths from intake DISCOVER phase */
  fromIntake: z.array(z.string()),
  /** Newly discovered strengths in this module */
  newlyDiscovered: z.array(z.string()),
  /** Strengths validated by evidence */
  validated: z.array(z.string()),
  /** Strengths narrative for business plan */
  narrative: z.string(),
});
export type StaerkenProfil = z.infer<typeof StaerkenProfilSchema>;

export const FounderMotivationSchema = z.object({
  /** Primary motivation type */
  type: MotivationType,
  /** Push factors (away from current situation) */
  pushFactors: z.array(z.string()),
  /** Pull factors (towards entrepreneurship) */
  pullFactors: z.array(z.string()),
  /** Core "why" statement */
  whyStatement: z.string(),
  /** Long-term vision */
  vision: z.string(),
  /** Discrepancy development result (MI) */
  discrepancy: z.string().optional(),
});
export type FounderMotivation = z.infer<typeof FounderMotivationSchema>;

export const LimitingBeliefSchema = z.object({
  /** The limiting belief detected */
  belief: z.string(),
  /** Evidence against the belief */
  counterEvidence: z.array(z.string()),
  /** Reframed belief */
  reframe: z.string(),
  /** Action derived from reframing */
  action: z.string(),
});
export type LimitingBelief = z.infer<typeof LimitingBeliefSchema>;

export const GROWProgressSchema = z.object({
  /** GOAL: What qualifications matter most? */
  goal: z.string().optional(),
  /** REALITY: What do you have? */
  reality: z.string().optional(),
  /** OPTIONS: How to present qualifications? */
  options: z.array(z.string()).optional(),
  /** WILL: Confidence statement */
  will: z.string().optional(),
});
export type GROWProgress = z.infer<typeof GROWProgressSchema>;

// ============================================================================
// Main Output Schema
// ============================================================================

export const GruenderpersonOutputSchema = z.object({
  /** Professional background */
  berufserfahrung: BerufserfahrungSchema,
  /** Qualifications and certifications */
  qualifikation: QualifikationSchema,
  /** Strengths profile */
  staerkenProfil: StaerkenProfilSchema,
  /** Motivation analysis */
  motivation: FounderMotivationSchema,
  /** Processed limiting beliefs (from CBC) */
  processedBeliefs: z.array(LimitingBeliefSchema).optional(),
  /** GROW model progress */
  growProgress: GROWProgressSchema,
  /** Final confidence statement for business plan */
  confidenceStatement: z.string(),
  /** Module metadata */
  metadata: z.object({
    completedAt: z.string().optional(),
    duration: z.number().optional(),
    conversationTurns: z.number().optional(),
  }),
});

export type GruenderpersonOutput = z.infer<typeof GruenderpersonOutputSchema>;

// ============================================================================
// Partial Schema (for progressive updates)
// ============================================================================

export const PartialGruenderpersonOutputSchema = z.object({
  berufserfahrung: BerufserfahrungSchema.partial().optional(),
  qualifikation: QualifikationSchema.partial().optional(),
  staerkenProfil: StaerkenProfilSchema.partial().optional(),
  motivation: FounderMotivationSchema.partial().optional(),
  processedBeliefs: z.array(LimitingBeliefSchema.partial()).optional(),
  growProgress: GROWProgressSchema.optional(),
  confidenceStatement: z.string().optional(),
  metadata: z.object({
    completedAt: z.string().optional(),
    duration: z.number().optional(),
    conversationTurns: z.number().optional(),
  }).optional(),
});

export type PartialGruenderpersonOutput = z.infer<typeof PartialGruenderpersonOutputSchema>;

// ============================================================================
// Phase Tracking
// ============================================================================

export const GruenderpersonPhase = z.enum([
  'intro',           // Reference strengths from intake
  'berufserfahrung', // Explore professional background
  'qualifikation',   // Assess qualifications
  'staerken',        // Deepen strengths profile
  'motivation',      // Explore motivation with MI
  'cbc_processing',  // Process limiting beliefs with CBC
  'synthesis',       // Create confidence statement
  'completed',       // Module complete
]);

export type GruenderpersonPhase = z.infer<typeof GruenderpersonPhase>;

export const GruenderpersonPhaseInfo: Record<GruenderpersonPhase, { label: string; duration: number }> = {
  intro: { label: 'Einführung', duration: 3 },
  berufserfahrung: { label: 'Berufserfahrung', duration: 10 },
  qualifikation: { label: 'Qualifikation', duration: 10 },
  staerken: { label: 'Stärken', duration: 10 },
  motivation: { label: 'Motivation', duration: 10 },
  cbc_processing: { label: 'Überzeugungen', duration: 10 },
  synthesis: { label: 'Zusammenfassung', duration: 7 },
  completed: { label: 'Abgeschlossen', duration: 0 },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create empty partial output for initialization
 */
export function createEmptyGruenderpersonOutput(): PartialGruenderpersonOutput {
  return {};
}

/**
 * Merge partial updates into existing data
 */
export function mergeGruenderpersonData(
  existing: PartialGruenderpersonOutput,
  update: PartialGruenderpersonOutput
): PartialGruenderpersonOutput {
  return {
    berufserfahrung: { ...existing.berufserfahrung, ...update.berufserfahrung },
    qualifikation: { ...existing.qualifikation, ...update.qualifikation },
    staerkenProfil: { ...existing.staerkenProfil, ...update.staerkenProfil },
    motivation: { ...existing.motivation, ...update.motivation },
    processedBeliefs: [
      ...(existing.processedBeliefs || []),
      ...(update.processedBeliefs || []),
    ],
    growProgress: { ...existing.growProgress, ...update.growProgress },
    confidenceStatement: update.confidenceStatement || existing.confidenceStatement,
    metadata: { ...existing.metadata, ...update.metadata },
  };
}

/**
 * Check if module is complete enough for transition
 */
export function isGruenderpersonComplete(data: PartialGruenderpersonOutput): boolean {
  return Boolean(
    data.berufserfahrung?.totalYears !== undefined &&
    data.qualifikation?.education &&
    data.staerkenProfil?.narrative &&
    data.motivation?.whyStatement &&
    data.confidenceStatement
  );
}
