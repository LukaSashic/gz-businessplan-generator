/**
 * Coaching State Atoms
 *
 * Jotai atoms for coaching state management.
 * Uses localStorage for persistence (sync) to avoid async complexity with derived atoms.
 *
 * GZ-103: Coaching state atoms
 */

import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import {
  type CoachingState,
  type Stage,
  type GROWPhase,
  type ChangeTalkMetrics,
  type LimitingBeliefType,
  type Emotion,
  type SDTNeeds,
  createInitialCoachingState,
  CoachingStateSchema,
} from '@/types/coaching';

// ============================================================================
// Main Coaching State Atom
// ============================================================================

/**
 * Complete coaching state (persisted to localStorage for sync access)
 * Uses localStorage instead of IndexedDB for simpler derived atom access
 */
export const coachingStateAtom = atomWithStorage<CoachingState>(
  'gz-coaching-state',
  createInitialCoachingState()
);

// ============================================================================
// TTM Stage Atoms
// ============================================================================

/**
 * Current TTM stage (derived from coaching state)
 */
export const stageAtom = atom(
  (get) => get(coachingStateAtom).currentStage,
  (get, set, newStage: Stage) => {
    const state = get(coachingStateAtom);
    const now = new Date().toISOString();

    set(coachingStateAtom, {
      ...state,
      currentStage: newStage,
      stageHistory: [
        ...state.stageHistory,
        {
          stage: newStage,
          detectedAt: now,
        },
      ],
      lastUpdatedAt: now,
    });
  }
);

/**
 * Stage history (derived, read-only)
 */
export const stageHistoryAtom = atom((get) => get(coachingStateAtom).stageHistory);

/**
 * Detect and update stage based on trigger text
 */
export const detectStageAtom = atom(
  null,
  (get, set, { stage, trigger }: { stage: Stage; trigger: string }) => {
    const state = get(coachingStateAtom);
    const now = new Date().toISOString();

    set(coachingStateAtom, {
      ...state,
      currentStage: stage,
      stageHistory: [
        ...state.stageHistory,
        {
          stage,
          detectedAt: now,
          trigger,
        },
      ],
      lastUpdatedAt: now,
    });
  }
);

// ============================================================================
// GROW Phase Atoms
// ============================================================================

/**
 * Current GROW phase (derived from coaching state)
 */
export const growPhaseAtom = atom(
  (get) => get(coachingStateAtom).currentGROWPhase,
  (get, set, newPhase: GROWPhase) => {
    const state = get(coachingStateAtom);
    set(coachingStateAtom, {
      ...state,
      currentGROWPhase: newPhase,
      lastUpdatedAt: new Date().toISOString(),
    });
  }
);

/**
 * GROW phase by module (derived)
 */
export const growPhaseByModuleAtom = atom((get) => get(coachingStateAtom).growPhaseByModule);

/**
 * Set GROW phase for a specific module
 */
export const setGrowPhaseForModuleAtom = atom(
  null,
  (get, set, { moduleId, phase }: { moduleId: string; phase: GROWPhase }) => {
    const state = get(coachingStateAtom);
    set(coachingStateAtom, {
      ...state,
      growPhaseByModule: {
        ...state.growPhaseByModule,
        [moduleId]: phase,
      },
      lastUpdatedAt: new Date().toISOString(),
    });
  }
);

// ============================================================================
// MI Change Talk Atoms
// ============================================================================

/**
 * Change talk metrics (derived from coaching state)
 */
export const changeTalkAtom = atom(
  (get) => get(coachingStateAtom).changeTalkMetrics,
  (get, set, newMetrics: Partial<ChangeTalkMetrics>) => {
    const state = get(coachingStateAtom);
    const updatedMetrics = {
      ...state.changeTalkMetrics,
      ...newMetrics,
    };

    // Recalculate ratio
    const total = updatedMetrics.changeTalkCount + updatedMetrics.sustainTalkCount;
    updatedMetrics.changeTalkRatio = total > 0 ? updatedMetrics.changeTalkCount / total : 0;

    set(coachingStateAtom, {
      ...state,
      changeTalkMetrics: updatedMetrics,
      lastUpdatedAt: new Date().toISOString(),
    });
  }
);

/**
 * Increment change talk count
 */
export const incrementChangeTalkAtom = atom(
  null,
  (get, set, type: ChangeTalkMetrics['lastChangeTalkType']) => {
    const state = get(coachingStateAtom);
    const metrics = state.changeTalkMetrics;

    const newCount = metrics.changeTalkCount + 1;
    const total = newCount + metrics.sustainTalkCount;

    set(coachingStateAtom, {
      ...state,
      changeTalkMetrics: {
        ...metrics,
        changeTalkCount: newCount,
        changeTalkRatio: total > 0 ? newCount / total : 0,
        lastChangeTalkType: type,
      },
      lastUpdatedAt: new Date().toISOString(),
    });
  }
);

/**
 * Increment sustain talk count
 */
export const incrementSustainTalkAtom = atom(null, (get, set) => {
  const state = get(coachingStateAtom);
  const metrics = state.changeTalkMetrics;

  const newSustainCount = metrics.sustainTalkCount + 1;
  const total = metrics.changeTalkCount + newSustainCount;

  set(coachingStateAtom, {
    ...state,
    changeTalkMetrics: {
      ...metrics,
      sustainTalkCount: newSustainCount,
      changeTalkRatio: total > 0 ? metrics.changeTalkCount / total : 0,
    },
    lastUpdatedAt: new Date().toISOString(),
  });
});

/**
 * Change talk ratio (derived, read-only)
 */
export const changeTalkRatioAtom = atom(
  (get) => get(coachingStateAtom).changeTalkMetrics.changeTalkRatio
);

// ============================================================================
// CBC Limiting Beliefs Atoms
// ============================================================================

/**
 * Identified beliefs (derived from coaching state)
 */
export const identifiedBeliefsAtom = atom((get) => get(coachingStateAtom).identifiedBeliefs);

/**
 * Add a limiting belief
 */
export const addLimitingBeliefAtom = atom(null, (get, set, belief: LimitingBeliefType) => {
  const state = get(coachingStateAtom);
  const now = new Date().toISOString();

  // Don't add duplicate beliefs
  if (state.identifiedBeliefs.some((b) => b.belief === belief)) {
    return;
  }

  set(coachingStateAtom, {
    ...state,
    identifiedBeliefs: [
      ...state.identifiedBeliefs,
      {
        belief,
        identifiedAt: now,
        reframed: false,
      },
    ],
    lastUpdatedAt: now,
  });
});

/**
 * Mark a belief as reframed
 */
export const reframeBeliefAtom = atom(null, (get, set, belief: LimitingBeliefType) => {
  const state = get(coachingStateAtom);
  const now = new Date().toISOString();

  const updatedBeliefs = state.identifiedBeliefs.map((b) =>
    b.belief === belief
      ? { ...b, reframed: true, reframedAt: now }
      : b
  );

  set(coachingStateAtom, {
    ...state,
    identifiedBeliefs: updatedBeliefs,
    lastUpdatedAt: now,
  });
});

/**
 * Unreframed beliefs count (derived)
 */
export const unreframedBeliefsCountAtom = atom(
  (get) => get(coachingStateAtom).identifiedBeliefs.filter((b) => !b.reframed).length
);

// ============================================================================
// AI Strengths Discovery Atoms
// ============================================================================

/**
 * Discovered strengths (derived from coaching state)
 */
export const discoveredStrengthsAtom = atom(
  (get) => get(coachingStateAtom).discoveredStrengths,
  (get, set, strengths: string[]) => {
    const state = get(coachingStateAtom);
    set(coachingStateAtom, {
      ...state,
      discoveredStrengths: strengths,
      lastUpdatedAt: new Date().toISOString(),
    });
  }
);

/**
 * Add a discovered strength
 */
export const addStrengthAtom = atom(null, (get, set, strength: string) => {
  const state = get(coachingStateAtom);

  // Don't add duplicates
  if (state.discoveredStrengths.includes(strength)) {
    return;
  }

  set(coachingStateAtom, {
    ...state,
    discoveredStrengths: [...state.discoveredStrengths, strength],
    lastUpdatedAt: new Date().toISOString(),
  });
});

/**
 * Dream vision (derived from coaching state)
 */
export const dreamVisionAtom = atom(
  (get) => get(coachingStateAtom).dreamVision,
  (get, set, vision: string) => {
    const state = get(coachingStateAtom);
    set(coachingStateAtom, {
      ...state,
      dreamVision: vision,
      lastUpdatedAt: new Date().toISOString(),
    });
  }
);

// ============================================================================
// SDT Needs Atoms
// ============================================================================

/**
 * SDT needs (derived from coaching state)
 */
export const sdtNeedsAtom = atom(
  (get) => get(coachingStateAtom).sdtNeeds,
  (get, set, needs: Partial<SDTNeeds>) => {
    const state = get(coachingStateAtom);
    set(coachingStateAtom, {
      ...state,
      sdtNeeds: {
        ...state.sdtNeeds,
        ...needs,
      },
      lastUpdatedAt: new Date().toISOString(),
    });
  }
);

/**
 * Increment autonomy instances
 */
export const incrementAutonomyAtom = atom(null, (get, set) => {
  const state = get(coachingStateAtom);
  set(coachingStateAtom, {
    ...state,
    sdtNeeds: {
      ...state.sdtNeeds,
      autonomyInstances: state.sdtNeeds.autonomyInstances + 1,
    },
    lastUpdatedAt: new Date().toISOString(),
  });
});

/**
 * Increment competence instances
 */
export const incrementCompetenceAtom = atom(null, (get, set) => {
  const state = get(coachingStateAtom);
  set(coachingStateAtom, {
    ...state,
    sdtNeeds: {
      ...state.sdtNeeds,
      competenceInstances: state.sdtNeeds.competenceInstances + 1,
    },
    lastUpdatedAt: new Date().toISOString(),
  });
});

/**
 * Increment relatedness instances
 */
export const incrementRelatednessAtom = atom(null, (get, set) => {
  const state = get(coachingStateAtom);
  set(coachingStateAtom, {
    ...state,
    sdtNeeds: {
      ...state.sdtNeeds,
      relatednessInstances: state.sdtNeeds.relatednessInstances + 1,
    },
    lastUpdatedAt: new Date().toISOString(),
  });
});

// ============================================================================
// Emotion Tracking Atoms
// ============================================================================

/**
 * Last detected emotion (derived from coaching state)
 */
export const lastEmotionAtom = atom((get) => get(coachingStateAtom).lastDetectedEmotion);

/**
 * Emotion history (derived from coaching state)
 */
export const emotionHistoryAtom = atom((get) => get(coachingStateAtom).emotionHistory);

/**
 * Detect and record an emotion
 */
export const detectEmotionAtom = atom(null, (get, set, emotion: Emotion) => {
  const state = get(coachingStateAtom);
  const now = new Date().toISOString();

  set(coachingStateAtom, {
    ...state,
    lastDetectedEmotion: emotion,
    emotionHistory: [
      ...state.emotionHistory,
      {
        emotion,
        detectedAt: now,
        addressed: false,
      },
    ],
    lastUpdatedAt: now,
  });
});

/**
 * Mark last emotion as addressed
 */
export const addressEmotionAtom = atom(null, (get, set) => {
  const state = get(coachingStateAtom);

  if (state.emotionHistory.length === 0) {
    return;
  }

  const lastIndex = state.emotionHistory.length - 1;

  const updatedHistory = state.emotionHistory.map((entry, index) =>
    index === lastIndex
      ? { emotion: entry.emotion, detectedAt: entry.detectedAt, addressed: true }
      : entry
  );

  set(coachingStateAtom, {
    ...state,
    emotionHistory: updatedHistory,
    lastUpdatedAt: new Date().toISOString(),
  });
});

// ============================================================================
// Quality Metrics Atoms
// ============================================================================

/**
 * Quality metrics (derived from coaching state)
 */
export const qualityMetricsAtom = atom((get) => get(coachingStateAtom).qualityMetrics);

/**
 * Increment open question count
 */
export const incrementOpenQuestionAtom = atom(null, (get, set) => {
  const state = get(coachingStateAtom);
  const metrics = state.qualityMetrics;

  const newOpenCount = metrics.openQuestionCount + 1;
  const totalQuestions = newOpenCount + metrics.closedQuestionCount;
  const newRatio = totalQuestions > 0 ? newOpenCount / totalQuestions : 0;

  set(coachingStateAtom, {
    ...state,
    qualityMetrics: {
      ...metrics,
      openQuestionCount: newOpenCount,
      openQuestionRatio: newRatio,
    },
    lastUpdatedAt: new Date().toISOString(),
  });
});

/**
 * Increment closed question count
 */
export const incrementClosedQuestionAtom = atom(null, (get, set) => {
  const state = get(coachingStateAtom);
  const metrics = state.qualityMetrics;

  const newClosedCount = metrics.closedQuestionCount + 1;
  const totalQuestions = metrics.openQuestionCount + newClosedCount;
  const newRatio = totalQuestions > 0 ? metrics.openQuestionCount / totalQuestions : 0;

  set(coachingStateAtom, {
    ...state,
    qualityMetrics: {
      ...metrics,
      closedQuestionCount: newClosedCount,
      openQuestionRatio: newRatio,
    },
    lastUpdatedAt: new Date().toISOString(),
  });
});

/**
 * Increment empathy marker count
 */
export const incrementEmpathyAtom = atom(null, (get, set) => {
  const state = get(coachingStateAtom);
  set(coachingStateAtom, {
    ...state,
    qualityMetrics: {
      ...state.qualityMetrics,
      empathyMarkerCount: state.qualityMetrics.empathyMarkerCount + 1,
    },
    lastUpdatedAt: new Date().toISOString(),
  });
});

/**
 * Record advice giving (anti-pattern)
 */
export const recordAdviceGivingAtom = atom(null, (get, set) => {
  const state = get(coachingStateAtom);
  set(coachingStateAtom, {
    ...state,
    qualityMetrics: {
      ...state.qualityMetrics,
      adviceGivingCount: state.qualityMetrics.adviceGivingCount + 1,
    },
    lastUpdatedAt: new Date().toISOString(),
  });
});

// ============================================================================
// Exchange Tracking Atoms
// ============================================================================

/**
 * Exchanges since last summary (derived from coaching state)
 */
export const exchangesSinceLastSummaryAtom = atom(
  (get) => get(coachingStateAtom).exchangesSinceLastSummary
);

/**
 * Increment exchange count
 */
export const incrementExchangeAtom = atom(null, (get, set) => {
  const state = get(coachingStateAtom);
  set(coachingStateAtom, {
    ...state,
    exchangesSinceLastSummary: state.exchangesSinceLastSummary + 1,
    lastUpdatedAt: new Date().toISOString(),
  });
});

/**
 * Reset exchange count (after summary)
 */
export const resetExchangeCountAtom = atom(null, (get, set) => {
  const state = get(coachingStateAtom);
  set(coachingStateAtom, {
    ...state,
    exchangesSinceLastSummary: 0,
    qualityMetrics: {
      ...state.qualityMetrics,
      reflectiveSummaryCount: state.qualityMetrics.reflectiveSummaryCount + 1,
    },
    lastUpdatedAt: new Date().toISOString(),
  });
});

// ============================================================================
// Reset Atom
// ============================================================================

/**
 * Reset coaching state to initial values
 */
export const resetCoachingStateAtom = atom(null, (_get, set) => {
  set(coachingStateAtom, createInitialCoachingState());
});

// ============================================================================
// Validation Atom
// ============================================================================

/**
 * Validate and parse coaching state with Zod
 */
export const validateCoachingStateAtom = atom((get) => {
  const state = get(coachingStateAtom);
  return CoachingStateSchema.safeParse(state);
});
