/**
 * Module 10: Zusammenfassung (Executive Summary) Types
 *
 * Auto-generated summary of the complete business plan.
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const ZusammenfassungPhase = z.enum([
  'review',           // Phase 1: Review all modules
  'synthesis',        // Phase 2: Synthesize key points
  'summary',          // Phase 3: Generate summary
  'completed',
]);

export type ZusammenfassungPhase = z.infer<typeof ZusammenfassungPhase>;

// ============================================================================
// Sub-Schemas
// ============================================================================

export const GruenderProfilSummarySchema = z.object({
  name: z.string().optional(),            // Only if user provided
  qualifikation: z.string(),              // Key qualifications
  erfahrung: z.string(),                  // Relevant experience
  motivation: z.string(),                 // Why starting this business
  staerken: z.array(z.string()),          // Key strengths
});

export type GruenderProfilSummary = z.infer<typeof GruenderProfilSummarySchema>;

export const GeschaeftsideeSummarySchema = z.object({
  elevatorPitch: z.string(),              // 2-3 sentences
  problem: z.string(),                    // Problem being solved
  loesung: z.string(),                    // Solution offered
  zielgruppe: z.string(),                 // Target audience
  usp: z.string(),                        // Unique selling proposition
});

export type GeschaeftsideeSummary = z.infer<typeof GeschaeftsideeSummarySchema>;

export const MarktSummarySchema = z.object({
  marktgroesse: z.string(),               // TAM/SAM numbers
  wettbewerbsvorteil: z.string(),         // Competitive advantage
  positionierung: z.string(),             // Market position
});

export type MarktSummary = z.infer<typeof MarktSummarySchema>;

export const FinanzSummarySchema = z.object({
  kapitalbedarf: z.number(),              // Total capital needed
  finanzierungsquellen: z.array(z.string()),
  umsatzJahr1: z.number(),
  umsatzJahr3: z.number(),
  breakEvenMonat: z.number().optional(),
  gewinnJahr3: z.number().optional(),
});

export type FinanzSummary = z.infer<typeof FinanzSummarySchema>;

export const StrategieSummarySchema = z.object({
  kernStrategie: z.string(),              // Core strategy
  wichtigsteMeilensteine: z.array(z.string()).max(5),
  erfolgsKPIs: z.array(z.string()).max(3),
  risiken: z.array(z.string()).max(3),
  massnahmen: z.array(z.string()).max(3), // Risk mitigation
});

export type StrategieSummary = z.infer<typeof StrategieSummarySchema>;

export const ExecutiveSummarySchema = z.object({
  // Opening statement
  openingStatement: z.string(),           // Hook/attention grabber

  // Core sections
  gruenderProfil: GruenderProfilSummarySchema,
  geschaeftsidee: GeschaeftsideeSummarySchema,
  markt: MarktSummarySchema,
  finanzen: FinanzSummarySchema,
  strategie: StrategieSummarySchema,

  // Closing
  callToAction: z.string(),               // What you're asking for
  closingStatement: z.string(),           // Strong finish
});

export type ExecutiveSummary = z.infer<typeof ExecutiveSummarySchema>;

export const WorkshopJourneySummarySchema = z.object({
  startDate: z.string(),
  completionDate: z.string(),
  totalDuration: z.number(),              // Hours
  modulesCompleted: z.number(),
  keyInsights: z.array(z.string()),       // What user learned
  growthAreas: z.array(z.string()),       // How user developed
  nextSteps: z.array(z.string()),         // Post-workshop actions
});

export type WorkshopJourneySummary = z.infer<typeof WorkshopJourneySummarySchema>;

export const ZusammenfassungValidationSchema = z.object({
  // Completeness
  allModulesComplete: z.boolean(),
  executiveSummaryComplete: z.boolean(),

  // Quality
  summaryCoherent: z.boolean(),
  keyPointsCovered: z.boolean(),
  readableLength: z.boolean(),            // Not too long

  // BA requirements
  baRequirementsMet: z.boolean(),

  blockers: z.array(z.string()),
  warnings: z.array(z.string()),
  readyForExport: z.boolean(),
});

export type ZusammenfassungValidation = z.infer<typeof ZusammenfassungValidationSchema>;

export const ZusammenfassungMetadataSchema = z.object({
  completedAt: z.string().optional(),
  duration: z.number().optional(),
  currentPhase: ZusammenfassungPhase.optional(),
  generatedAutomatically: z.boolean().default(true),
  userEdited: z.boolean().default(false),
});

export type ZusammenfassungMetadata = z.infer<typeof ZusammenfassungMetadataSchema>;

// ============================================================================
// Main Output Schema
// ============================================================================

export const ZusammenfassungOutputSchema = z.object({
  executiveSummary: ExecutiveSummarySchema,
  workshopJourney: WorkshopJourneySummarySchema,
  validation: ZusammenfassungValidationSchema,
  metadata: ZusammenfassungMetadataSchema,
});

export type ZusammenfassungOutput = z.infer<typeof ZusammenfassungOutputSchema>;

export const PartialZusammenfassungOutputSchema = z.object({
  executiveSummary: ExecutiveSummarySchema.deepPartial().optional(),
  workshopJourney: WorkshopJourneySummarySchema.deepPartial().optional(),
  validation: ZusammenfassungValidationSchema.partial().optional(),
  metadata: ZusammenfassungMetadataSchema.partial().optional(),
});

export type PartialZusammenfassungOutput = z.infer<typeof PartialZusammenfassungOutputSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

export function createEmptyZusammenfassungOutput(): PartialZusammenfassungOutput {
  return {};
}

export function isZusammenfassungComplete(data: PartialZusammenfassungOutput): boolean {
  return Boolean(
    data.executiveSummary?.openingStatement &&
    data.executiveSummary?.geschaeftsidee?.elevatorPitch &&
    data.executiveSummary?.finanzen?.kapitalbedarf &&
    data.executiveSummary?.closingStatement
  );
}

/**
 * Generate word count for executive summary
 */
export function getExecutiveSummaryWordCount(data: PartialZusammenfassungOutput): number {
  if (!data.executiveSummary) return 0;

  const textParts: string[] = [];

  // Gather all text content
  if (data.executiveSummary.openingStatement) textParts.push(data.executiveSummary.openingStatement);
  if (data.executiveSummary.closingStatement) textParts.push(data.executiveSummary.closingStatement);
  if (data.executiveSummary.callToAction) textParts.push(data.executiveSummary.callToAction);

  const gruender = data.executiveSummary.gruenderProfil;
  if (gruender?.qualifikation) textParts.push(gruender.qualifikation);
  if (gruender?.erfahrung) textParts.push(gruender.erfahrung);
  if (gruender?.motivation) textParts.push(gruender.motivation);

  const idee = data.executiveSummary.geschaeftsidee;
  if (idee?.elevatorPitch) textParts.push(idee.elevatorPitch);
  if (idee?.problem) textParts.push(idee.problem);
  if (idee?.loesung) textParts.push(idee.loesung);
  if (idee?.usp) textParts.push(idee.usp);

  const markt = data.executiveSummary.markt;
  if (markt?.marktgroesse) textParts.push(markt.marktgroesse);
  if (markt?.wettbewerbsvorteil) textParts.push(markt.wettbewerbsvorteil);
  if (markt?.positionierung) textParts.push(markt.positionierung);

  const strategie = data.executiveSummary.strategie;
  if (strategie?.kernStrategie) textParts.push(strategie.kernStrategie);

  // Count words
  const fullText = textParts.join(' ');
  return fullText.split(/\s+/).filter((w) => w.length > 0).length;
}

/**
 * Check if summary is within readable length (500-1500 words)
 */
export function isSummaryReadableLength(data: PartialZusammenfassungOutput): boolean {
  const wordCount = getExecutiveSummaryWordCount(data);
  return wordCount >= 500 && wordCount <= 1500;
}
