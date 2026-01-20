/**
 * Module 2: Geschäftsidee Types (GZ-402)
 *
 * TypeScript types for the Geschäftsidee module output with Socratic questioning depth levels.
 */

import { z } from 'zod';

// ============================================================================
// Enums and Constants
// ============================================================================

/**
 * Socratic questioning depth levels from PRD
 */
export const SocraticDepth = z.enum(['L1', 'L2', 'L3', 'L4', 'L5']);
export type SocraticDepth = z.infer<typeof SocraticDepth>;

/**
 * Socratic depth level descriptions
 */
export const SocraticDepthInfo: Record<SocraticDepth, { label: string; description: string; example: string }> = {
  L1: {
    label: 'Surface',
    description: 'What - basic facts',
    example: 'Was ist das Problem genau?'
  },
  L2: {
    label: 'Justification',
    description: 'Why - reasoning and justification',
    example: 'Warum ist das ein Problem?'
  },
  L3: {
    label: 'Assumption',
    description: 'What if - assumptions and hypotheses',
    example: 'Was wäre, wenn dieses Problem nicht existierte?'
  },
  L4: {
    label: 'Evidence',
    description: 'How do you know - evidence and validation',
    example: 'Woher weißt du, dass das wirklich so ist?'
  },
  L5: {
    label: 'Alternative',
    description: 'What else - alternative perspectives',
    example: 'Welche anderen Erklärungen könnte es geben?'
  },
};

/**
 * Business problem category
 */
export const ProblemCategory = z.enum([
  'inefficiency',     // Prozesse sind ineffizient
  'cost',            // Zu teuer
  'time',            // Zeitverschwendung
  'frustration',     // Frustrierung
  'quality',         // Qualitätsprobleme
  'accessibility',   // Nicht zugänglich
  'complexity',      // Zu kompliziert
  'communication',   // Kommunikationsprobleme
  'other'           // Andere Kategorie
]);
export type ProblemCategory = z.infer<typeof ProblemCategory>;

/**
 * Solution approach type
 */
export const SolutionApproach = z.enum([
  'digital_solution',    // Software/App/Platform
  'service_solution',    // Dienstleistung
  'product_solution',    // Physisches Produkt
  'process_solution',    // Prozessoptimierung
  'consulting_solution', // Beratung
  'hybrid_solution'      // Kombination
]);
export type SolutionApproach = z.infer<typeof SolutionApproach>;

/**
 * Target audience size estimate
 */
export const AudienceSize = z.enum(['small', 'medium', 'large', 'very_large', 'unknown']);
export type AudienceSize = z.infer<typeof AudienceSize>;

// ============================================================================
// Sub-Schemas
// ============================================================================

/**
 * Problem analysis with Socratic depth
 */
export const ProblemAnalysisSchema = z.object({
  /** L1: What - problem description */
  description: z.string(),
  /** L2: Why - why this is a problem */
  reasoning: z.string(),
  /** L3: What if - assumptions about the problem */
  assumptions: z.array(z.string()),
  /** L4: How do you know - evidence that problem exists */
  evidence: z.array(z.string()),
  /** L5: What else - alternative problem framings */
  alternatives: z.array(z.string()),
  /** Problem category for BA compliance */
  category: ProblemCategory,
  /** Pain intensity (1-10) */
  painLevel: z.number().min(1).max(10),
  /** Who experiences this problem most acutely */
  primarySufferers: z.array(z.string()),
});
export type ProblemAnalysis = z.infer<typeof ProblemAnalysisSchema>;

/**
 * Solution analysis with depth levels
 */
export const SolutionAnalysisSchema = z.object({
  /** L1: What - solution description */
  description: z.string(),
  /** L2: Why - why this solution works */
  reasoning: z.string(),
  /** Solution approach type */
  approach: SolutionApproach,
  /** Key features/components */
  features: z.array(z.string()),
  /** Implementation feasibility (1-10) */
  feasibility: z.number().min(1).max(10),
  /** Resource requirements */
  resourceRequirements: z.array(z.string()),
});
export type SolutionAnalysis = z.infer<typeof SolutionAnalysisSchema>;

/**
 * Target audience analysis with depth
 */
export const TargetAudienceSchema = z.object({
  /** L2: Who - primary target group description */
  primaryGroup: z.string(),
  /** L3: What if - secondary/adjacent groups */
  secondaryGroups: z.array(z.string()),
  /** L4: How do you know - evidence of needs */
  needsEvidence: z.array(z.string()),
  /** L4: Market size estimation */
  sizeEstimate: AudienceSize,
  /** L4: Geographic scope */
  geographicScope: z.string(),
  /** L4: Demographic details */
  demographics: z.object({
    ageRange: z.string().optional(),
    income: z.string().optional(),
    profession: z.string().optional(),
    other: z.string().optional(),
  }).optional(),
  /** L4: Psychographic details */
  psychographics: z.object({
    values: z.array(z.string()).optional(),
    lifestyle: z.string().optional(),
    painPoints: z.array(z.string()).optional(),
  }).optional(),
});
export type TargetAudience = z.infer<typeof TargetAudienceSchema>;

/**
 * USP analysis with depth levels
 */
export const USPAnalysisSchema = z.object({
  /** L3: What if - unique value proposition */
  proposition: z.string(),
  /** L3: Assumptions about competitive advantage */
  assumptions: z.array(z.string()),
  /** L4: Evidence of differentiation */
  differentiationEvidence: z.array(z.string()),
  /** L4: Competitive analysis */
  competitors: z.array(z.object({
    name: z.string(),
    weakness: z.string(),
    strength: z.string(),
  })),
  /** L5: Alternative positioning options */
  alternativePositions: z.array(z.string()),
  /** Why this founder, why now */
  whyFounderWhyNow: z.string(),
});
export type USPAnalysis = z.infer<typeof USPAnalysisSchema>;

/**
 * YC-style reality checks
 */
export const YCRealityCheckSchema = z.object({
  /** YC question results */
  ycQuestions: z.object({
    /** Wer hat das Problem WIRKLICH? */
    realProblemOwner: z.string().optional(),
    /** Wie oft tritt das Problem auf? */
    problemFrequency: z.string().optional(),
    /** Wie viel würden sie für eine Lösung zahlen? */
    willingnessTopay: z.string().optional(),
    /** Was machen sie heute stattdessen? */
    currentAlternatives: z.string().optional(),
  }),
  /** Reality check flags */
  redFlags: z.array(z.string()).optional(),
  /** Validation requirements identified */
  validationNeeds: z.array(z.string()).optional(),
});
export type YCRealityCheck = z.infer<typeof YCRealityCheckSchema>;

/**
 * GROW model progress tracking
 */
export const GeschaeftsideeGROWSchema = z.object({
  /** GOAL: What aspects of the idea need clarity? */
  goal: z.string().optional(),
  /** REALITY: Current state of idea development */
  reality: z.string().optional(),
  /** OPTIONS: Different approaches to develop/validate idea */
  options: z.array(z.string()).optional(),
  /** WILL: Commitment to specific next steps */
  will: z.string().optional(),
});
export type GeschaeftsideeGROW = z.infer<typeof GeschaeftsideeGROWSchema>;

// ============================================================================
// Main Output Schema
// ============================================================================

export const GeschaeftsideeOutputSchema = z.object({
  /** Problem analysis with Socratic depth */
  problem: ProblemAnalysisSchema,
  /** Solution analysis */
  solution: SolutionAnalysisSchema,
  /** Target audience analysis */
  targetAudience: TargetAudienceSchema,
  /** USP analysis */
  usp: USPAnalysisSchema,
  /** YC reality checks */
  realityCheck: YCRealityCheckSchema,
  /** GROW model progress */
  growProgress: GeschaeftsideeGROWSchema,
  /** Elevator pitch (refined) */
  elevatorPitch: z.string(),
  /** Problem-solution fit score (1-10) */
  problemSolutionFit: z.number().min(1).max(10),
  /** Module metadata */
  metadata: z.object({
    maxDepthReached: SocraticDepth,
    questionClusters: z.object({
      problemDepth: SocraticDepth,
      solutionDepth: SocraticDepth,
      audienceDepth: SocraticDepth,
      uspDepth: SocraticDepth,
    }),
    completedAt: z.string().optional(),
    duration: z.number().optional(),
    conversationTurns: z.number().optional(),
  }),
});

export type GeschaeftsideeOutput = z.infer<typeof GeschaeftsideeOutputSchema>;

// ============================================================================
// Partial Schema (for progressive updates)
// ============================================================================

export const PartialGeschaeftsideeOutputSchema = z.object({
  problem: ProblemAnalysisSchema.partial().optional(),
  solution: SolutionAnalysisSchema.partial().optional(),
  targetAudience: TargetAudienceSchema.partial().optional(),
  usp: USPAnalysisSchema.partial().optional(),
  realityCheck: YCRealityCheckSchema.partial().optional(),
  growProgress: GeschaeftsideeGROWSchema.optional(),
  elevatorPitch: z.string().optional(),
  problemSolutionFit: z.number().min(1).max(10).optional(),
  metadata: z.object({
    maxDepthReached: SocraticDepth.optional(),
    questionClusters: z.object({
      problemDepth: SocraticDepth.optional(),
      solutionDepth: SocraticDepth.optional(),
      audienceDepth: SocraticDepth.optional(),
      uspDepth: SocraticDepth.optional(),
    }).optional(),
    completedAt: z.string().optional(),
    duration: z.number().optional(),
    conversationTurns: z.number().optional(),
  }).optional(),
});

export type PartialGeschaeftsideeOutput = z.infer<typeof PartialGeschaeftsideeOutputSchema>;

// ============================================================================
// Phase Tracking
// ============================================================================

export const GeschaeftsideePhase = z.enum([
  'intro',                // Introduction with GROW Goal
  'problem_exploration',  // Problem deep-dive (L1-L3)
  'solution_development', // Solution analysis (L1-L2)
  'audience_discovery',   // Target audience (L2-L4)
  'usp_development',      // USP analysis (L3-L5)
  'reality_check',        // YC-style reality checks
  'synthesis',           // Integration and problem-solution fit
  'completed',           // Module complete
]);

export type GeschaeftsideePhase = z.infer<typeof GeschaeftsideePhase>;

export const GeschaeftsideePhaseInfo: Record<GeschaeftsideePhase, {
  label: string;
  duration: number;
  targetDepth: SocraticDepth;
  clusters: string[];
}> = {
  intro: {
    label: 'Einführung',
    duration: 3,
    targetDepth: 'L1',
    clusters: ['goal_setting']
  },
  problem_exploration: {
    label: 'Problem-Analyse',
    duration: 15,
    targetDepth: 'L3',
    clusters: ['problem_what', 'problem_why', 'problem_assumptions']
  },
  solution_development: {
    label: 'Lösungs-Entwicklung',
    duration: 10,
    targetDepth: 'L2',
    clusters: ['solution_what', 'solution_why']
  },
  audience_discovery: {
    label: 'Zielgruppen-Erkundung',
    duration: 15,
    targetDepth: 'L4',
    clusters: ['audience_who', 'audience_why', 'audience_evidence', 'audience_assumptions']
  },
  usp_development: {
    label: 'USP-Entwicklung',
    duration: 15,
    targetDepth: 'L5',
    clusters: ['usp_assumptions', 'usp_evidence', 'usp_alternatives', 'competitive_analysis']
  },
  reality_check: {
    label: 'Realitäts-Check',
    duration: 10,
    targetDepth: 'L4',
    clusters: ['yc_questions', 'validation_needs']
  },
  synthesis: {
    label: 'Synthese',
    duration: 7,
    targetDepth: 'L2',
    clusters: ['integration', 'problem_solution_fit']
  },
  completed: {
    label: 'Abgeschlossen',
    duration: 0,
    targetDepth: 'L1',
    clusters: []
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create empty partial output for initialization
 */
export function createEmptyGeschaeftsideeOutput(): PartialGeschaeftsideeOutput {
  return {
    metadata: {
      questionClusters: {
        problemDepth: 'L1',
        solutionDepth: 'L1',
        audienceDepth: 'L1',
        uspDepth: 'L1',
      },
    },
  };
}

/**
 * Merge partial updates into existing data
 */
export function mergeGeschaeftsideeData(
  existing: PartialGeschaeftsideeOutput,
  update: PartialGeschaeftsideeOutput
): PartialGeschaeftsideeOutput {
  return {
    problem: { ...existing.problem, ...update.problem },
    solution: { ...existing.solution, ...update.solution },
    targetAudience: { ...existing.targetAudience, ...update.targetAudience },
    usp: { ...existing.usp, ...update.usp },
    realityCheck: { ...existing.realityCheck, ...update.realityCheck },
    growProgress: { ...existing.growProgress, ...update.growProgress },
    elevatorPitch: update.elevatorPitch || existing.elevatorPitch,
    problemSolutionFit: update.problemSolutionFit || existing.problemSolutionFit,
    metadata: {
      ...existing.metadata,
      ...update.metadata,
      questionClusters: {
        ...existing.metadata?.questionClusters,
        ...update.metadata?.questionClusters,
      },
    },
  };
}

/**
 * Check if module is complete enough for transition
 */
export function isGeschaeftsideeComplete(data: PartialGeschaeftsideeOutput): boolean {
  return Boolean(
    data.problem?.description &&
    data.solution?.description &&
    data.targetAudience?.primaryGroup &&
    data.usp?.proposition &&
    data.elevatorPitch &&
    data.problemSolutionFit
  );
}

/**
 * Get next suggested Socratic depth for a cluster
 */
export function getNextSocraticDepth(currentDepth: SocraticDepth): SocraticDepth | null {
  const depths: SocraticDepth[] = ['L1', 'L2', 'L3', 'L4', 'L5'];
  const currentIndex = depths.indexOf(currentDepth);
  return currentIndex < depths.length - 1 ? (depths[currentIndex + 1] ?? null) : null;
}

/**
 * Check if Socratic exploration should continue
 */
export function shouldContinueSocraticExploration(
  _cluster: 'problem' | 'solution' | 'audience' | 'usp',
  currentDepth: SocraticDepth,
  targetDepth: SocraticDepth
): boolean {
  const depths: SocraticDepth[] = ['L1', 'L2', 'L3', 'L4', 'L5'];
  const currentIndex = depths.indexOf(currentDepth);
  const targetIndex = depths.indexOf(targetDepth);
  return currentIndex < targetIndex;
}