/**
 * Coaching Module - Evidence-Based Coaching Utilities
 *
 * Exports emotion detection and empathy pattern generation
 * following MI (Motivational Interviewing) principles.
 */

// Emotion Detection
export {
  type Emotion,
  type EmotionIntensity,
  type EmotionDetectionResult,
  detectEmotion,
  detectEmotionWithDetails,
  hasEmotionSignal,
  detectAllEmotions,
  getAllEmotionTypes,
} from './emotion-detection';

// Empathy Patterns
export {
  type EmpathyPattern,
  type EmotionEmpathyResult,
  generateEmpathyResponse,
  getEmotionLabel,
  getEmpathyPattern,
  getValidationStatement,
  getNormalizationStatement,
  getPivotQuestion,
  getAllEmpathyPatterns,
  getAllEmotionLabels,
  generateIntensityAwareResponse,
  getEmotionEmpathyResult,
} from './empathy-patterns';

// Reflective Summary
export {
  type Message,
  type UserProfile,
  type ReflectiveSummary,
  type FactExtractionResult,
  type FactCategory,
  type EmotionalThemeResult,
  shouldGenerateSummary,
  shouldGenerateSummaryOptimal,
  extractFactsFromMessages,
  extractFactsWithCategories,
  extractEmotionalThemes,
  extractEmotionalThemesWithDetails,
  extractStrengths,
  generateSummaryPrompt,
  generateReflectiveSummary,
  formatSummaryAsText,
  getSummaryTriggerConfig,
} from './reflective-summary';

// Stage Detection
export {
  type Message as StageMessage,
  Stage,
  type CoachingDepth,
  STAGE_INDICATORS,
  STAGE_TO_DEPTH,
  detectStage,
  getCoachingDepthForStage,
  getIndicatorsForStage,
  analyzeStageDetection,
} from './stage-detection';

// Appreciative Inquiry
export {
  AIPhase,
  type AIPromptContext,
  type DiscoverResult,
  type AISessionState,
  STRENGTH_INDICATORS,
  STRENGTH_CATEGORIES,
  getAIPromptForPhase,
  getPersonalizedAIPrompt,
  extractStrengths as extractAIStrengths,
  extractStrengthsWithAnalysis,
  getNextPhase as getNextAIPhase,
  getPreviousPhase as getPreviousAIPhase,
  getPhaseProgress,
  isFinalPhase,
  isFirstPhase,
  createAISession,
  advanceAISession,
  getPhaseNameGerman,
  getPhaseDescription,
  categorizeStrengths,
  getAllPhasePrompts,
} from './appreciative-inquiry';

// CBC Reframing
export {
  CBCStep,
  BeliefCategory,
  type LimitingBelief,
  type BeliefDetectionResult,
  type CBCResponse,
  LIMITING_BELIEFS,
  ALL_LIMITING_BELIEFS,
  detectLimitingBelief,
  detectLimitingBeliefWithDetails,
  generateCBCResponse,
  getFullCBCSequence,
  getTriggerPhrases as getCBCTriggerPhrases,
  getBeliefsByCategory,
  hasLimitingBeliefIndicators,
  getCBCStepOrder,
} from './cbc-reframing';

// Motivational Interviewing
export {
  type ChangeTalkType,
  type ChangeTalkStrength,
  type ChangeTalkResult,
  type MIContext,
  type SustainTalkResult,
  detectChangeTalk,
  detectSustainTalk,
  detectSustainTalkWithDetails,
  generateMIResponse,
  developDiscrepancy,
  rollWithResistance,
  supportSelfEfficacy,
  supportSelfEfficacyWithQuality,
  getAllChangeTalkTypes,
  getTriggerPhrases as getMITriggerPhrases,
  getSustainTalkTriggers,
  hasChangeTalkSignal,
  detectAmbivalence,
  getChangeTalkCategory,
  getChangeTalkLabel,
} from './motivational-interviewing';

// Quality Metrics
export {
  type CoachingMetrics,
  type MetricUpdate,
  type QualityScoreBreakdown,
  type QualityWarning,
  createInitialMetrics,
  analyzeMessage,
  applyUpdates,
  calculateCoachingScore,
  calculateScoreBreakdown,
  getQualityWarnings,
  getDetailedWarnings,
  meetsMinimumQuality,
  meetsTargetQuality,
  getQualityAssessment,
  getPatterns,
  QUALITY_THRESHOLDS,
} from './quality-metrics';

// GROW Model
export {
  getGROWPromptForPhase,
  detectGROWPhase,
  getNextGROWPhase,
  isPhaseValidForModule,
  getModuleGROWPhases,
  generateGROWTransition,
  validateGROWCompleteness,
} from './grow-model';
