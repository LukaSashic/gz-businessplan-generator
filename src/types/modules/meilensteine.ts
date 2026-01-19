/**
 * Module 08: Meilensteine (Milestones) Types
 *
 * Business milestones and action plan for the first 3 years.
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const MeilensteinePhase = z.enum([
  'vorbereitung',     // Phase 1: Pre-launch milestones
  'gruendung',        // Phase 2: Launch milestones
  'jahr1',            // Phase 3: Year 1 milestones
  'jahr2_3',          // Phase 4: Years 2-3 milestones
  'completed',
]);

export type MeilensteinePhase = z.infer<typeof MeilensteinePhase>;

export const MilestoneCategory = z.enum([
  'legal',            // Rechtliche Schritte
  'product',          // Produkt/Dienstleistung
  'sales',            // Vertrieb/Akquise
  'marketing',        // Marketing
  'finance',          // Finanzen
  'team',             // Team/Personal
  'operations',       // Betrieb
  'growth',           // Wachstum
]);

export type MilestoneCategory = z.infer<typeof MilestoneCategory>;

export const MilestoneStatus = z.enum([
  'planned',          // Geplant
  'in_progress',      // In Bearbeitung
  'completed',        // Abgeschlossen
  'delayed',          // Verzögert
  'cancelled',        // Abgebrochen
]);

export type MilestoneStatus = z.infer<typeof MilestoneStatus>;

export const MilestonePriority = z.enum(['critical', 'high', 'medium', 'low']);
export type MilestonePriority = z.infer<typeof MilestonePriority>;

// ============================================================================
// Sub-Schemas
// ============================================================================

export const MilestoneSchema = z.object({
  title: z.string(),
  description: z.string(),
  category: MilestoneCategory,
  priority: MilestonePriority,
  targetDate: z.string(),                 // ISO date
  status: MilestoneStatus.default('planned'),
  dependencies: z.array(z.string()).optional(), // IDs of dependent milestones
  successCriteria: z.array(z.string()),   // How to know it's done
  resources: z.array(z.string()).optional(), // What's needed
  estimatedCost: z.number().optional(),   // EUR
  linkedToFinanzplanung: z.boolean().default(false),
});

export type Milestone = z.infer<typeof MilestoneSchema>;

export const VorbereitungSchema = z.object({
  milestones: z.array(MilestoneSchema),
  startDate: z.string(),                  // When prep begins
  launchDate: z.string(),                 // Target launch date
  criticalPath: z.array(z.string()),      // Must-do items in order
});

export type Vorbereitung = z.infer<typeof VorbereitungSchema>;

export const GruendungSchema = z.object({
  milestones: z.array(MilestoneSchema),
  firstCustomerTarget: z.string(),        // Date for first customer
  breakEvenTarget: z.string().optional(), // From Finanzplanung
  keyRisks: z.array(z.string()),
});

export type Gruendung = z.infer<typeof GruendungSchema>;

export const Jahr1Schema = z.object({
  milestones: z.array(MilestoneSchema),
  quarterlyGoals: z.array(z.object({
    quarter: z.enum(['Q1', 'Q2', 'Q3', 'Q4']),
    goals: z.array(z.string()),
    revenueTarget: z.number().optional(),
  })),
});

export type Jahr1 = z.infer<typeof Jahr1Schema>;

export const Jahr2_3Schema = z.object({
  milestones: z.array(MilestoneSchema),
  yearlyGoals: z.array(z.object({
    year: z.enum(['Jahr 2', 'Jahr 3']),
    goals: z.array(z.string()),
    revenueTarget: z.number().optional(),
  })),
  exitStrategy: z.string().optional(),    // Long-term vision
});

export type Jahr2_3 = z.infer<typeof Jahr2_3Schema>;

export const MeilensteineValidationSchema = z.object({
  // Completeness
  hasPreLaunchMilestones: z.boolean(),
  hasLaunchMilestones: z.boolean(),
  hasYear1Milestones: z.boolean(),
  hasLongTermMilestones: z.boolean(),

  // Quality
  milestonesSpecific: z.boolean(),        // SMART: Specific
  milestonesMeasurable: z.boolean(),      // SMART: Measurable
  milestonesAchievable: z.boolean(),      // SMART: Achievable
  milestonesRelevant: z.boolean(),        // SMART: Relevant
  milestonesTimeBound: z.boolean(),       // SMART: Time-bound

  // Alignment
  alignedWithFinanzplanung: z.boolean(),
  realisticTimeline: z.boolean(),

  blockers: z.array(z.string()),
  warnings: z.array(z.string()),
  readyForNextModule: z.boolean(),
});

export type MeilensteineValidation = z.infer<typeof MeilensteineValidationSchema>;

export const MeilensteineMetadataSchema = z.object({
  completedAt: z.string().optional(),
  duration: z.number().optional(),
  currentPhase: MeilensteinePhase.optional(),
  totalMilestones: z.number().optional(),
});

export type MeilensteineMetadata = z.infer<typeof MeilensteineMetadataSchema>;

// ============================================================================
// Main Output Schema
// ============================================================================

export const MeilensteineOutputSchema = z.object({
  vorbereitung: VorbereitungSchema,
  gruendung: GruendungSchema,
  jahr1: Jahr1Schema,
  jahr2_3: Jahr2_3Schema,
  validation: MeilensteineValidationSchema,
  metadata: MeilensteineMetadataSchema,
});

export type MeilensteineOutput = z.infer<typeof MeilensteineOutputSchema>;

export const PartialMeilensteineOutputSchema = z.object({
  vorbereitung: VorbereitungSchema.deepPartial().optional(),
  gruendung: GruendungSchema.deepPartial().optional(),
  jahr1: Jahr1Schema.deepPartial().optional(),
  jahr2_3: Jahr2_3Schema.deepPartial().optional(),
  validation: MeilensteineValidationSchema.partial().optional(),
  metadata: MeilensteineMetadataSchema.partial().optional(),
});

export type PartialMeilensteineOutput = z.infer<typeof PartialMeilensteineOutputSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

export function createEmptyMeilensteineOutput(): PartialMeilensteineOutput {
  return {};
}

export function isMeilensteineComplete(data: PartialMeilensteineOutput): boolean {
  const hasVorbereitung = (data.vorbereitung?.milestones?.length ?? 0) > 0;
  const hasGruendung = (data.gruendung?.milestones?.length ?? 0) > 0;
  const hasJahr1 = (data.jahr1?.milestones?.length ?? 0) > 0;

  return hasVorbereitung && hasGruendung && hasJahr1;
}

/**
 * Get all milestones flattened and sorted by date
 */
export function getAllMilestonesSorted(data: PartialMeilensteineOutput): Milestone[] {
  const all: Milestone[] = [
    ...(data.vorbereitung?.milestones ?? []),
    ...(data.gruendung?.milestones ?? []),
    ...(data.jahr1?.milestones ?? []),
    ...(data.jahr2_3?.milestones ?? []),
  ].filter((m): m is Milestone => m !== undefined);

  return all.sort((a, b) => {
    const dateA = new Date(a.targetDate ?? '').getTime();
    const dateB = new Date(b.targetDate ?? '').getTime();
    return dateA - dateB;
  });
}

/**
 * Count milestones by status
 */
export function getMilestoneStatusCounts(
  data: PartialMeilensteineOutput
): Record<MilestoneStatus, number> {
  const all = getAllMilestonesSorted(data);
  const counts: Record<MilestoneStatus, number> = {
    planned: 0,
    in_progress: 0,
    completed: 0,
    delayed: 0,
    cancelled: 0,
  };

  for (const m of all) {
    const status = m.status ?? 'planned';
    counts[status]++;
  }

  return counts;
}
