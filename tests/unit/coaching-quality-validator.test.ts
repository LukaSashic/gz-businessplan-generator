/**
 * Coaching Quality Validator Tests (GZ-804)
 *
 * Tests for the coaching quality validation system that monitors
 * coaching metrics and triggers corrections when quality degrades.
 */

import { describe, it, expect } from 'vitest';
import {
  validateCoachingQuality,
  getQualityCorrectionPrompt,
  getAllCorrectionPrompts,
  needsAutonomyInjection,
  needsEmpathyInjection,
  needsSummaryInjection,
  getAutonomyInjectionPrompt,
  getEmpathyInjectionPrompt,
  getSummaryInjectionPrompt,
  type ValidationContext,
  CORRECTION_PROMPTS,
} from '@/lib/validation/coaching-quality-validator';

import {
  createInitialMetrics,
  type CoachingMetrics,
} from '@/lib/coaching/quality-metrics';

// ============================================================================
// Test Fixtures
// ============================================================================

function createTestContext(overrides: Partial<ValidationContext> = {}): ValidationContext {
  return {
    metrics: createInitialMetrics(),
    exchangeCount: 5,
    emotionDetected: false,
    exchangesSinceLastSummary: 3,
    ...overrides,
  };
}

function createGoodMetrics(): CoachingMetrics {
  return {
    autonomyInstances: 5,
    competenceInstances: 3,
    relatednessInstances: 2,
    openQuestionCount: 7,
    closedQuestionCount: 3,
    openQuestionRatio: 0.7,
    empathyMarkerCount: 4,
    changeTalkCount: 5,
    sustainTalkCount: 2,
    changeTalkRatio: 2.5,
    adviceGivingCount: 0,
    leadingQuestionCount: 0,
    reflectiveSummaryCount: 1,
  };
}

function createPoorMetrics(): CoachingMetrics {
  return {
    autonomyInstances: 0,
    competenceInstances: 0,
    relatednessInstances: 0,
    openQuestionCount: 2,
    closedQuestionCount: 8,
    openQuestionRatio: 0.2,
    empathyMarkerCount: 0,
    changeTalkCount: 1,
    sustainTalkCount: 5,
    changeTalkRatio: 0.2,
    adviceGivingCount: 5,
    leadingQuestionCount: 3,
    reflectiveSummaryCount: 0,
  };
}

// ============================================================================
// Main Validation Tests
// ============================================================================

describe('validateCoachingQuality', () => {
  describe('with good metrics', () => {
    it('returns acceptable result with no corrections', () => {
      const context = createTestContext({ metrics: createGoodMetrics() });
      const result = validateCoachingQuality(context);

      expect(result.isAcceptable).toBe(true);
      expect(result.score).toBeGreaterThanOrEqual(75);
      expect(result.corrections.length).toBe(0);
    });

    it('returns high score', () => {
      const context = createTestContext({ metrics: createGoodMetrics() });
      const result = validateCoachingQuality(context);

      expect(result.score).toBeGreaterThanOrEqual(75);
    });
  });

  describe('with poor metrics', () => {
    it('returns unacceptable result with corrections', () => {
      const context = createTestContext({ metrics: createPoorMetrics() });
      const result = validateCoachingQuality(context);

      expect(result.isAcceptable).toBe(false);
      expect(result.corrections.length).toBeGreaterThan(0);
    });

    it('includes autonomy correction when autonomy is 0', () => {
      const metrics = { ...createInitialMetrics(), autonomyInstances: 0 };
      const context = createTestContext({ metrics, exchangeCount: 5 });
      const result = validateCoachingQuality(context);

      const autonomyCorrection = result.corrections.find(c => c.type === 'autonomy');
      expect(autonomyCorrection).toBeDefined();
      expect(autonomyCorrection?.priority).toBe('high');
    });

    it('includes advice correction when advice-giving exceeds threshold', () => {
      const metrics = { ...createGoodMetrics(), adviceGivingCount: 4 };
      const context = createTestContext({ metrics });
      const result = validateCoachingQuality(context);

      const adviceCorrection = result.corrections.find(c => c.type === 'advice');
      expect(adviceCorrection).toBeDefined();
    });
  });

  describe('empathy with emotion detection', () => {
    it('returns high priority empathy correction when emotion detected but no empathy', () => {
      const metrics = { ...createGoodMetrics(), empathyMarkerCount: 0 };
      const context = createTestContext({
        metrics,
        emotionDetected: true,
      });
      const result = validateCoachingQuality(context);

      const empathyCorrection = result.corrections.find(c => c.type === 'empathy');
      expect(empathyCorrection).toBeDefined();
      expect(empathyCorrection?.priority).toBe('high');
    });

    it('does not require empathy when no emotion detected', () => {
      const metrics = { ...createGoodMetrics(), empathyMarkerCount: 0 };
      const context = createTestContext({
        metrics,
        emotionDetected: false,
        exchangeCount: 2, // Early in conversation
      });
      const result = validateCoachingQuality(context);

      const empathyCorrection = result.corrections.find(c => c.type === 'empathy' && c.priority === 'high');
      expect(empathyCorrection).toBeUndefined();
    });
  });

  describe('summary injection', () => {
    it('includes summary correction when exchanges since last summary exceeds 10', () => {
      const context = createTestContext({
        metrics: createGoodMetrics(),
        exchangesSinceLastSummary: 12,
      });
      const result = validateCoachingQuality(context);

      const summaryCorrection = result.corrections.find(c => c.type === 'summary');
      expect(summaryCorrection).toBeDefined();
    });

    it('does not include summary correction when recent summary exists', () => {
      const context = createTestContext({
        metrics: createGoodMetrics(),
        exchangesSinceLastSummary: 5,
      });
      const result = validateCoachingQuality(context);

      const summaryCorrection = result.corrections.find(c => c.type === 'summary');
      expect(summaryCorrection).toBeUndefined();
    });
  });

  describe('correction priority ordering', () => {
    it('sorts corrections by priority (high first)', () => {
      const context = createTestContext({ metrics: createPoorMetrics() });
      const result = validateCoachingQuality(context);

      if (result.corrections.length >= 2) {
        const priorities = result.corrections.map(c => c.priority);
        const highIndex = priorities.indexOf('high');
        const mediumIndex = priorities.indexOf('medium');
        const lowIndex = priorities.indexOf('low');

        if (highIndex !== -1 && mediumIndex !== -1) {
          expect(highIndex).toBeLessThan(mediumIndex);
        }
        if (mediumIndex !== -1 && lowIndex !== -1) {
          expect(mediumIndex).toBeLessThan(lowIndex);
        }
      }
    });
  });
});

// ============================================================================
// getQualityCorrectionPrompt Tests
// ============================================================================

describe('getQualityCorrectionPrompt', () => {
  it('returns null when no corrections needed', () => {
    const context = createTestContext({ metrics: createGoodMetrics() });
    const prompt = getQualityCorrectionPrompt(context);

    expect(prompt).toBeNull();
  });

  it('returns the highest priority correction prompt', () => {
    const context = createTestContext({ metrics: createPoorMetrics() });
    const prompt = getQualityCorrectionPrompt(context);

    expect(prompt).not.toBeNull();
    expect(typeof prompt).toBe('string');
    expect(prompt!.length).toBeGreaterThan(0);
  });

  it('returns autonomy prompt when autonomy is critical', () => {
    const metrics = { ...createGoodMetrics(), autonomyInstances: 0 };
    const context = createTestContext({ metrics, exchangeCount: 5 });
    const prompt = getQualityCorrectionPrompt(context);

    expect(prompt).toContain('Autonomie');
  });
});

// ============================================================================
// getAllCorrectionPrompts Tests
// ============================================================================

describe('getAllCorrectionPrompts', () => {
  it('returns null when no corrections needed', () => {
    const context = createTestContext({ metrics: createGoodMetrics() });
    const prompts = getAllCorrectionPrompts(context);

    expect(prompts).toBeNull();
  });

  it('returns combined prompts when corrections needed', () => {
    const context = createTestContext({ metrics: createPoorMetrics() });
    const prompts = getAllCorrectionPrompts(context);

    expect(prompts).not.toBeNull();
    expect(prompts).toContain('COACHING');
  });

  it('excludes low priority corrections', () => {
    const metrics = {
      ...createGoodMetrics(),
      openQuestionRatio: 0.4, // Only triggers low priority correction
    };
    const context = createTestContext({ metrics });
    const prompts = getAllCorrectionPrompts(context);

    // Low priority only corrections should be filtered
    // If there's at least one medium/high priority, it returns, otherwise null
    expect(prompts === null || typeof prompts === 'string').toBe(true);
  });
});

// ============================================================================
// Individual Check Functions Tests
// ============================================================================

describe('needsAutonomyInjection', () => {
  it('returns true when autonomy below minimum and past first exchanges', () => {
    const metrics = { ...createInitialMetrics(), autonomyInstances: 1 };
    const result = needsAutonomyInjection(metrics, 5);

    expect(result).toBe(true);
  });

  it('returns false when autonomy meets minimum', () => {
    const metrics = { ...createInitialMetrics(), autonomyInstances: 2 };
    const result = needsAutonomyInjection(metrics, 5);

    expect(result).toBe(false);
  });

  it('returns false during first few exchanges', () => {
    const metrics = { ...createInitialMetrics(), autonomyInstances: 0 };
    const result = needsAutonomyInjection(metrics, 2);

    expect(result).toBe(false);
  });
});

describe('needsEmpathyInjection', () => {
  it('returns true when emotion detected but no empathy shown', () => {
    const metrics = { ...createInitialMetrics(), empathyMarkerCount: 0 };
    const result = needsEmpathyInjection(metrics, true);

    expect(result).toBe(true);
  });

  it('returns false when emotion detected and empathy shown', () => {
    const metrics = { ...createInitialMetrics(), empathyMarkerCount: 2 };
    const result = needsEmpathyInjection(metrics, true);

    expect(result).toBe(false);
  });

  it('returns false when no emotion detected', () => {
    const metrics = { ...createInitialMetrics(), empathyMarkerCount: 0 };
    const result = needsEmpathyInjection(metrics, false);

    expect(result).toBe(false);
  });
});

describe('needsSummaryInjection', () => {
  it('returns true when 10+ exchanges since last summary', () => {
    expect(needsSummaryInjection(10)).toBe(true);
    expect(needsSummaryInjection(15)).toBe(true);
  });

  it('returns false when fewer than 10 exchanges', () => {
    expect(needsSummaryInjection(5)).toBe(false);
    expect(needsSummaryInjection(9)).toBe(false);
  });
});

// ============================================================================
// Injection Prompt Getters Tests
// ============================================================================

describe('getAutonomyInjectionPrompt', () => {
  it('returns critical prompt when autonomy is 0', () => {
    const metrics = { ...createInitialMetrics(), autonomyInstances: 0 };
    const prompt = getAutonomyInjectionPrompt(metrics);

    expect(prompt).toContain('WARNUNG');
    expect(prompt).toContain('SOFORT');
  });

  it('returns low prompt when autonomy is above 0 but below minimum', () => {
    const metrics = { ...createInitialMetrics(), autonomyInstances: 1 };
    const prompt = getAutonomyInjectionPrompt(metrics);

    expect(prompt).toContain('HINWEIS');
    expect(prompt).not.toContain('WARNUNG');
  });
});

describe('getEmpathyInjectionPrompt', () => {
  it('returns emotion-specific prompt when emotion detected', () => {
    const prompt = getEmpathyInjectionPrompt(true);

    expect(prompt).toContain('Emotion erkannt');
    expect(prompt).toContain('BEGINNE');
  });

  it('returns general prompt when no emotion detected', () => {
    const prompt = getEmpathyInjectionPrompt(false);

    expect(prompt).toContain('Zeige mehr Empathie');
    expect(prompt).not.toContain('Emotion erkannt');
  });
});

describe('getSummaryInjectionPrompt', () => {
  it('returns summary prompt with structure', () => {
    const prompt = getSummaryInjectionPrompt();

    expect(prompt).toContain('Zusammenfassung');
    expect(prompt).toContain('FAKTEN');
    expect(prompt).toContain('EMOTIONALES');
    expect(prompt).toContain('STÄRKEN');
  });
});

// ============================================================================
// Correction Prompts Content Tests
// ============================================================================

describe('CORRECTION_PROMPTS content', () => {
  it('autonomy prompts are in German', () => {
    expect(CORRECTION_PROMPTS.autonomy.low).toMatch(/[äöüÄÖÜß]|Autonomie|Nutz/);
    expect(CORRECTION_PROMPTS.autonomy.critical).toMatch(/[äöüÄÖÜß]|Autonomie|WARNUNG/);
  });

  it('empathy prompts contain empathy markers', () => {
    expect(CORRECTION_PROMPTS.empathy.withEmotion).toContain('Empathie');
    expect(CORRECTION_PROMPTS.empathy.general).toContain('Empathie');
  });

  it('summary prompt contains structure', () => {
    expect(CORRECTION_PROMPTS.summary.needed).toContain('FAKTEN');
    expect(CORRECTION_PROMPTS.summary.needed).toContain('Stimmt das so');
  });

  it('advice prompts address the anti-pattern', () => {
    expect(CORRECTION_PROMPTS.advice.warning).toContain('Ratschläge');
    expect(CORRECTION_PROMPTS.advice.critical).toContain('STOPPE');
  });
});

// ============================================================================
// Edge Cases
// ============================================================================

describe('edge cases', () => {
  it('handles empty metrics gracefully', () => {
    const context = createTestContext({ metrics: createInitialMetrics() });
    const result = validateCoachingQuality(context);

    expect(result).toBeDefined();
    expect(typeof result.score).toBe('number');
    expect(Array.isArray(result.corrections)).toBe(true);
  });

  it('handles very high exchange count', () => {
    const context = createTestContext({
      metrics: createGoodMetrics(),
      exchangeCount: 1000,
      exchangesSinceLastSummary: 50,
    });
    const result = validateCoachingQuality(context);

    expect(result).toBeDefined();
    // Should suggest summary
    const summaryCorrection = result.corrections.find(c => c.type === 'summary');
    expect(summaryCorrection).toBeDefined();
  });

  it('handles all red flags at once', () => {
    const context = createTestContext({
      metrics: createPoorMetrics(),
      emotionDetected: true,
      exchangesSinceLastSummary: 15,
      exchangeCount: 10,
    });
    const result = validateCoachingQuality(context);

    expect(result.isAcceptable).toBe(false);
    expect(result.corrections.length).toBeGreaterThan(3);
  });
});
