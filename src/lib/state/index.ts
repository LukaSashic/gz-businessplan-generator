/**
 * State Management Module
 *
 * Exports all Jotai atoms and persistence utilities for the GZ Businessplan Generator.
 *
 * Usage:
 * ```typescript
 * import { workshopStateAtom, coachingStateAtom, persistence } from '@/lib/state';
 * ```
 */

// ============================================================================
// Persistence Layer
// ============================================================================

export {
  persistence,
  createIndexedDBStorage,
  createHybridStorage,
  createWorkshopScopedStorage,
  syncToSupabase,
  migrateLocalStorageToIndexedDB,
  clearAllAtomData,
} from './persistence';

// ============================================================================
// Workshop Atoms
// ============================================================================

export {
  // Types
  type UserProfile,
  type ModuleProgress,
  type WorkshopState,

  // Core atoms
  workshopsAtom,
  currentWorkshopIdAtom,
  workshopStateAtom,
  currentWorkshopAtom,
  userProfileAtom,

  // Module atoms
  currentModuleAtom,
  moduleCompletionAtom,
  isModuleCompleteAtom,
  moduleProgressAtom,

  // Progress atoms
  workshopProgressAtom,
  completedModulesCountAtom,
  totalModulesCountAtom,
  nextIncompleteModuleAtom,

  // UI state atoms
  isSavingAtom,
  lastSavedAtom,
  saveErrorAtom,

  // Streaming atoms
  streamingModuleDataAtom,
  currentPhaseAtom,
  workshopDataFamily,
  streamingDataFamily,

  // Action atoms
  markModuleCompleteAtom,
  startModuleAtom,
  updateModuleDataAtom,
  resetWorkshopAtom,

  // Factory functions
  createInitialWorkshopState,
  createInitialUserProfile,
} from './workshop-atoms';

// ============================================================================
// Coaching Atoms
// ============================================================================

export {
  // Main coaching state
  coachingStateAtom,

  // TTM Stage atoms
  stageAtom,
  stageHistoryAtom,
  detectStageAtom,

  // GROW Phase atoms
  growPhaseAtom,
  growPhaseByModuleAtom,
  setGrowPhaseForModuleAtom,

  // MI Change Talk atoms
  changeTalkAtom,
  incrementChangeTalkAtom,
  incrementSustainTalkAtom,
  changeTalkRatioAtom,

  // CBC Limiting Beliefs atoms
  identifiedBeliefsAtom,
  addLimitingBeliefAtom,
  reframeBeliefAtom,
  unreframedBeliefsCountAtom,

  // AI Strengths Discovery atoms
  discoveredStrengthsAtom,
  addStrengthAtom,
  dreamVisionAtom,

  // SDT Needs atoms
  sdtNeedsAtom,
  incrementAutonomyAtom,
  incrementCompetenceAtom,
  incrementRelatednessAtom,

  // Emotion Tracking atoms
  lastEmotionAtom,
  emotionHistoryAtom,
  detectEmotionAtom,
  addressEmotionAtom,

  // Quality Metrics atoms
  qualityMetricsAtom,
  incrementOpenQuestionAtom,
  incrementClosedQuestionAtom,
  incrementEmpathyAtom,
  recordAdviceGivingAtom,

  // Exchange Tracking atoms
  exchangesSinceLastSummaryAtom,
  incrementExchangeAtom,
  resetExchangeCountAtom,

  // Reset and validation
  resetCoachingStateAtom,
  validateCoachingStateAtom,
} from './coaching-atoms';

// ============================================================================
// Base UI Atoms (from atoms.ts)
// ============================================================================

export {
  userPreferencesAtom,
  currentUserAtom,
  sidebarOpenAtom,
  isLoadingAtom,
  toastsAtom,
  addToastAtom,
  removeToastAtom,
  type Toast,
} from './atoms';

// ============================================================================
// Hooks (re-exported for convenience)
// ============================================================================

export * from './hooks';
