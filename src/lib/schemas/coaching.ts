/**
 * Coaching Zod Schemas
 *
 * Validation schemas for coaching state, metrics, and API requests.
 * Re-exports from types/coaching.ts for convenient import.
 */

import { z } from 'zod';

// Re-export all schemas from types/coaching
export {
  Stage,
  CoachingDepth,
  GROWPhase,
  ChangeTalkType,
  ChangeTalkMetricsSchema,
  LimitingBeliefType,
  CBCStep,
  AIPhase,
  Emotion,
  SDTNeedsSchema,
  CoachingStateSchema,
} from '@/types/coaching';

// Also export types
export type {
  Stage as StageType,
  CoachingDepth as CoachingDepthType,
  GROWPhase as GROWPhaseType,
  ChangeTalkType as ChangeTalkTypeEnum,
  ChangeTalkMetrics,
  LimitingBeliefType as LimitingBeliefTypeEnum,
  CBCStep as CBCStepType,
  AIPhase as AIPhaseType,
  Emotion as EmotionType,
  SDTNeeds,
  CoachingState,
} from '@/types/coaching';

// ============================================================================
// API Request Schemas
// ============================================================================

/**
 * Schema for updating coaching state via API
 */
export const UpdateCoachingStateSchema = z.object({
  workshopId: z.string().uuid(),
  moduleId: z.string(),
  updates: z.object({
    currentStage: z.enum([
      'precontemplation',
      'contemplation',
      'preparation',
      'action',
      'maintenance',
    ]).optional(),
    currentGROWPhase: z.enum(['goal', 'reality', 'options', 'will']).optional(),
    changeTalkDetected: z.object({
      type: z.enum([
        'desire',
        'ability',
        'reason',
        'need',
        'commitment',
        'activation',
        'taking_steps',
      ]),
      count: z.number().min(1).default(1),
    }).optional(),
    sustainTalkDetected: z.boolean().optional(),
    emotionDetected: z.enum([
      'uncertainty',
      'ambivalence',
      'anxiety',
      'frustration',
      'excitement',
      'confidence',
      'overwhelm',
      'doubt',
    ]).optional(),
    limitingBeliefDetected: z.enum([
      'not_qualified',
      'not_salesperson',
      'market_saturated',
      'need_more_prep',
      'failure_is_end',
      'not_numbers_person',
      'too_old_young',
      'no_network',
    ]).optional(),
    strengthDiscovered: z.string().optional(),
    autonomySupported: z.boolean().optional(),
    competenceAcknowledged: z.boolean().optional(),
    relatednessBuilt: z.boolean().optional(),
    openQuestionAsked: z.boolean().optional(),
    closedQuestionAsked: z.boolean().optional(),
    empathyShown: z.boolean().optional(),
    reflectiveSummaryGiven: z.boolean().optional(),
    adviceGiven: z.boolean().optional(),
    leadingQuestionAsked: z.boolean().optional(),
  }),
});

export type UpdateCoachingStateInput = z.infer<typeof UpdateCoachingStateSchema>;

/**
 * Schema for getting coaching metrics
 */
export const GetCoachingMetricsSchema = z.object({
  workshopId: z.string().uuid(),
  moduleId: z.string().optional(),
});

export type GetCoachingMetricsInput = z.infer<typeof GetCoachingMetricsSchema>;

/**
 * Schema for coaching quality report request
 */
export const CoachingQualityReportSchema = z.object({
  workshopId: z.string().uuid(),
  includeRecommendations: z.boolean().default(true),
});

export type CoachingQualityReportInput = z.infer<typeof CoachingQualityReportSchema>;

// ============================================================================
// Message Analysis Schemas
// ============================================================================

/**
 * Schema for analyzing a user message
 */
export const AnalyzeMessageSchema = z.object({
  message: z.string().min(1),
  context: z.object({
    moduleId: z.string(),
    previousMessages: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })).optional(),
    currentCoachingState: z.record(z.unknown()).optional(),
  }).optional(),
});

export type AnalyzeMessageInput = z.infer<typeof AnalyzeMessageSchema>;

/**
 * Schema for message analysis result
 */
export const MessageAnalysisResultSchema = z.object({
  detectedStage: z.enum([
    'precontemplation',
    'contemplation',
    'preparation',
    'action',
    'maintenance',
  ]).optional(),
  detectedEmotions: z.array(z.enum([
    'uncertainty',
    'ambivalence',
    'anxiety',
    'frustration',
    'excitement',
    'confidence',
    'overwhelm',
    'doubt',
  ])),
  changeTalkInstances: z.array(z.object({
    type: z.enum([
      'desire',
      'ability',
      'reason',
      'need',
      'commitment',
      'activation',
      'taking_steps',
    ]),
    excerpt: z.string(),
  })),
  sustainTalkDetected: z.boolean(),
  limitingBeliefs: z.array(z.enum([
    'not_qualified',
    'not_salesperson',
    'market_saturated',
    'need_more_prep',
    'failure_is_end',
    'not_numbers_person',
    'too_old_young',
    'no_network',
  ])),
  recommendedApproach: z.string(),
  coachingDepth: z.enum(['shallow', 'medium', 'deep']),
});

export type MessageAnalysisResult = z.infer<typeof MessageAnalysisResultSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate coaching state update input
 */
export function validateCoachingStateUpdate(input: unknown): UpdateCoachingStateInput {
  return UpdateCoachingStateSchema.parse(input);
}

/**
 * Validate message analysis input
 */
export function validateAnalyzeMessage(input: unknown): AnalyzeMessageInput {
  return AnalyzeMessageSchema.parse(input);
}

/**
 * Safe parse with error details
 */
export function safeParseCoaching<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): { success: true; data: T } | { success: false; errors: z.ZodIssue[] } {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error.issues };
}
