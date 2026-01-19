/**
 * Unit Tests for Workshop and Coaching Atoms
 *
 * Tests Jotai atoms for workshop state management and coaching tracking.
 *
 * Note: These tests use createStore() from jotai for isolated atom testing.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { createStore } from 'jotai';
import {
  // Workshop atoms
  workshopStateAtom,
  moduleCompletionAtom,
  workshopProgressAtom,
  completedModulesCountAtom,
  totalModulesCountAtom,
  nextIncompleteModuleAtom,
  userProfileAtom,
  currentPhaseAtom,
  isSavingAtom,
  lastSavedAtom,

  // Factory functions
  createInitialWorkshopState,
  createInitialUserProfile,
} from '@/lib/state/workshop-atoms';

import {
  // Coaching atoms
  coachingStateAtom,
  stageAtom,
  growPhaseAtom,
  changeTalkAtom,
  identifiedBeliefsAtom,
  discoveredStrengthsAtom,
  sdtNeedsAtom,
  qualityMetricsAtom,
  exchangesSinceLastSummaryAtom,
} from '@/lib/state/coaching-atoms';

import { createInitialCoachingState } from '@/types/coaching';

// ============================================================================
// Workshop State Tests
// ============================================================================

describe('Workshop Atoms', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  describe('createInitialWorkshopState', () => {
    it('should create workshop state with correct structure', () => {
      const state = createInitialWorkshopState('test-id', 'user-123', 'Test Business');

      expect(state.id).toBe('test-id');
      expect(state.userId).toBe('user-123');
      expect(state.businessName).toBe('Test Business');
      expect(state.status).toBe('draft');
      expect(state.currentModule).toBe('gz-intake');
      expect(Object.keys(state.modules)).toHaveLength(10);
    });

    it('should initialize all modules as not_started', () => {
      const state = createInitialWorkshopState('test-id', 'user-123');

      Object.values(state.modules).forEach((module) => {
        expect(module.status).toBe('not_started');
      });
    });

    it('should set timestamps', () => {
      const before = new Date().toISOString();
      const state = createInitialWorkshopState('test-id', 'user-123');
      const after = new Date().toISOString();

      expect(state.createdAt >= before).toBe(true);
      expect(state.createdAt <= after).toBe(true);
      expect(state.updatedAt).toBe(state.createdAt);
    });
  });

  describe('createInitialUserProfile', () => {
    it('should create user profile with correct structure', () => {
      const profile = createInitialUserProfile('user-123', 'test@example.com', 'Test User');

      expect(profile.id).toBe('user-123');
      expect(profile.email).toBe('test@example.com');
      expect(profile.name).toBe('Test User');
      expect(profile.language).toBe('de');
      expect(profile.avatarUrl).toBeNull();
    });

    it('should handle undefined email', () => {
      const profile = createInitialUserProfile('user-123', undefined, 'Test User');

      expect(profile.email).toBeUndefined();
    });
  });

  describe('moduleCompletionAtom', () => {
    it('should have all modules set to false initially', () => {
      const completion = store.get(moduleCompletionAtom);

      expect(completion['gz-intake']).toBe(false);
      expect(completion['gz-geschaeftsmodell']).toBe(false);
      expect(completion['gz-zusammenfassung']).toBe(false);
      expect(Object.keys(completion)).toHaveLength(10);
    });

    it('should update individual module completion', () => {
      const initial = store.get(moduleCompletionAtom);
      store.set(moduleCompletionAtom, {
        ...initial,
        'gz-intake': true,
      });

      const updated = store.get(moduleCompletionAtom);
      expect(updated['gz-intake']).toBe(true);
      expect(updated['gz-geschaeftsmodell']).toBe(false);
    });
  });

  describe('workshopProgressAtom', () => {
    it('should return 0% when no modules are complete', () => {
      const progress = store.get(workshopProgressAtom);
      expect(progress).toBe(0);
    });

    it('should calculate correct percentage', () => {
      const initial = store.get(moduleCompletionAtom);
      store.set(moduleCompletionAtom, {
        ...initial,
        'gz-intake': true,
        'gz-geschaeftsmodell': true,
      });

      const progress = store.get(workshopProgressAtom);
      expect(progress).toBe(20); // 2/10 = 20%
    });

    it('should return 100% when all modules complete', () => {
      const allComplete: Record<string, boolean> = {};
      const initial = store.get(moduleCompletionAtom);
      Object.keys(initial).forEach((key) => {
        allComplete[key] = true;
      });
      store.set(moduleCompletionAtom, allComplete);

      const progress = store.get(workshopProgressAtom);
      expect(progress).toBe(100);
    });
  });

  describe('completedModulesCountAtom', () => {
    it('should return 0 when no modules complete', () => {
      const count = store.get(completedModulesCountAtom);
      expect(count).toBe(0);
    });

    it('should count completed modules', () => {
      const initial = store.get(moduleCompletionAtom);
      store.set(moduleCompletionAtom, {
        ...initial,
        'gz-intake': true,
        'gz-geschaeftsmodell': true,
        'gz-unternehmen': true,
      });

      const count = store.get(completedModulesCountAtom);
      expect(count).toBe(3);
    });
  });

  describe('totalModulesCountAtom', () => {
    it('should return 10 total modules', () => {
      const count = store.get(totalModulesCountAtom);
      expect(count).toBe(10);
    });
  });

  describe('nextIncompleteModuleAtom', () => {
    it('should return gz-intake when no modules complete', () => {
      const next = store.get(nextIncompleteModuleAtom);
      expect(next).toBe('gz-intake');
    });

    it('should return next incomplete module in order', () => {
      const initial = store.get(moduleCompletionAtom);
      store.set(moduleCompletionAtom, {
        ...initial,
        'gz-intake': true,
        'gz-geschaeftsmodell': true,
      });

      const next = store.get(nextIncompleteModuleAtom);
      expect(next).toBe('gz-unternehmen');
    });

    it('should return null when all modules complete', () => {
      const allComplete: Record<string, boolean> = {};
      const initial = store.get(moduleCompletionAtom);
      Object.keys(initial).forEach((key) => {
        allComplete[key] = true;
      });
      store.set(moduleCompletionAtom, allComplete);

      const next = store.get(nextIncompleteModuleAtom);
      expect(next).toBeNull();
    });
  });

  describe('UI State Atoms', () => {
    it('should track saving state', () => {
      expect(store.get(isSavingAtom)).toBe(false);

      store.set(isSavingAtom, true);
      expect(store.get(isSavingAtom)).toBe(true);
    });

    it('should track last saved timestamp', () => {
      expect(store.get(lastSavedAtom)).toBeNull();

      const now = new Date();
      store.set(lastSavedAtom, now);
      expect(store.get(lastSavedAtom)).toEqual(now);
    });

    it('should track current phase', () => {
      expect(store.get(currentPhaseAtom)).toBe('warmup');

      store.set(currentPhaseAtom, 'exploration');
      expect(store.get(currentPhaseAtom)).toBe('exploration');
    });
  });
});

// ============================================================================
// Coaching State Tests
// ============================================================================

describe('Coaching Atoms', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
    // Reset coaching state to initial
    store.set(coachingStateAtom, createInitialCoachingState());
  });

  describe('createInitialCoachingState', () => {
    it('should create coaching state with correct structure', () => {
      const state = createInitialCoachingState();

      expect(state.currentStage).toBe('contemplation');
      expect(state.currentGROWPhase).toBe('goal');
      expect(state.stageHistory).toEqual([]);
      expect(state.identifiedBeliefs).toEqual([]);
      expect(state.discoveredStrengths).toEqual([]);
    });

    it('should initialize change talk metrics', () => {
      const state = createInitialCoachingState();

      expect(state.changeTalkMetrics.changeTalkCount).toBe(0);
      expect(state.changeTalkMetrics.sustainTalkCount).toBe(0);
      expect(state.changeTalkMetrics.changeTalkRatio).toBe(0);
    });

    it('should initialize SDT needs', () => {
      const state = createInitialCoachingState();

      expect(state.sdtNeeds.autonomyInstances).toBe(0);
      expect(state.sdtNeeds.competenceInstances).toBe(0);
      expect(state.sdtNeeds.relatednessInstances).toBe(0);
    });

    it('should initialize quality metrics', () => {
      const state = createInitialCoachingState();

      expect(state.qualityMetrics.openQuestionCount).toBe(0);
      expect(state.qualityMetrics.closedQuestionCount).toBe(0);
      expect(state.qualityMetrics.adviceGivingCount).toBe(0);
    });
  });

  describe('stageAtom', () => {
    it('should return current stage', () => {
      const stage = store.get(stageAtom);
      expect(stage).toBe('contemplation');
    });

    it('should update stage and add to history', () => {
      store.set(stageAtom, 'preparation');

      const stage = store.get(stageAtom);
      expect(stage).toBe('preparation');

      const state = store.get(coachingStateAtom);
      expect(state.stageHistory).toHaveLength(1);
      expect(state.stageHistory[0]!.stage).toBe('preparation');
    });
  });

  describe('growPhaseAtom', () => {
    it('should return current GROW phase', () => {
      const phase = store.get(growPhaseAtom);
      expect(phase).toBe('goal');
    });

    it('should update GROW phase', () => {
      store.set(growPhaseAtom, 'reality');

      const phase = store.get(growPhaseAtom);
      expect(phase).toBe('reality');
    });
  });

  describe('changeTalkAtom', () => {
    it('should return change talk metrics', () => {
      const metrics = store.get(changeTalkAtom);

      expect(metrics.changeTalkCount).toBe(0);
      expect(metrics.sustainTalkCount).toBe(0);
      expect(metrics.changeTalkRatio).toBe(0);
    });

    it('should update metrics and recalculate ratio', () => {
      store.set(changeTalkAtom, {
        changeTalkCount: 3,
        sustainTalkCount: 1,
      });

      const metrics = store.get(changeTalkAtom);
      expect(metrics.changeTalkCount).toBe(3);
      expect(metrics.sustainTalkCount).toBe(1);
      expect(metrics.changeTalkRatio).toBe(0.75); // 3/(3+1)
    });
  });

  describe('identifiedBeliefsAtom', () => {
    it('should return empty array initially', () => {
      const beliefs = store.get(identifiedBeliefsAtom);
      expect(beliefs).toEqual([]);
    });
  });

  describe('discoveredStrengthsAtom', () => {
    it('should return empty array initially', () => {
      const strengths = store.get(discoveredStrengthsAtom);
      expect(strengths).toEqual([]);
    });

    it('should update strengths', () => {
      store.set(discoveredStrengthsAtom, ['Leadership', 'Creativity']);

      const strengths = store.get(discoveredStrengthsAtom);
      expect(strengths).toEqual(['Leadership', 'Creativity']);
    });
  });

  describe('sdtNeedsAtom', () => {
    it('should return SDT needs', () => {
      const needs = store.get(sdtNeedsAtom);

      expect(needs.autonomyInstances).toBe(0);
      expect(needs.competenceInstances).toBe(0);
      expect(needs.relatednessInstances).toBe(0);
    });

    it('should update SDT needs', () => {
      store.set(sdtNeedsAtom, {
        autonomyInstances: 5,
        competenceInstances: 3,
      });

      const needs = store.get(sdtNeedsAtom);
      expect(needs.autonomyInstances).toBe(5);
      expect(needs.competenceInstances).toBe(3);
    });
  });

  describe('qualityMetricsAtom', () => {
    it('should return quality metrics', () => {
      const metrics = store.get(qualityMetricsAtom);

      expect(metrics.openQuestionCount).toBe(0);
      expect(metrics.closedQuestionCount).toBe(0);
      expect(metrics.openQuestionRatio).toBe(0);
      expect(metrics.empathyMarkerCount).toBe(0);
      expect(metrics.adviceGivingCount).toBe(0);
    });
  });

  describe('exchangesSinceLastSummaryAtom', () => {
    it('should return 0 initially', () => {
      const exchanges = store.get(exchangesSinceLastSummaryAtom);
      expect(exchanges).toBe(0);
    });
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('State Integration', () => {
  let store: ReturnType<typeof createStore>;

  beforeEach(() => {
    store = createStore();
  });

  it('should maintain separate workshop and coaching state', () => {
    // Set workshop state
    const workshopState = createInitialWorkshopState('ws-1', 'user-1', 'My Business');
    store.set(workshopStateAtom, workshopState);

    // Set coaching state
    store.set(stageAtom, 'action');

    // Verify both states are independent
    const ws = store.get(workshopStateAtom);
    const stage = store.get(stageAtom);

    expect(ws?.businessName).toBe('My Business');
    expect(stage).toBe('action');
  });

  it('should track user profile separately from workshop', () => {
    const profile = createInitialUserProfile('user-1', 'test@example.com', 'Test User');
    store.set(userProfileAtom, profile);

    const workshopState = createInitialWorkshopState('ws-1', 'user-1');
    store.set(workshopStateAtom, workshopState);

    const storedProfile = store.get(userProfileAtom);
    const storedWorkshop = store.get(workshopStateAtom);

    expect(storedProfile?.id).toBe('user-1');
    expect(storedWorkshop?.userId).toBe('user-1');
    expect(storedProfile?.name).toBe('Test User');
  });
});
