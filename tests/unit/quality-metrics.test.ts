/**
 * Tests for Coaching Quality Metrics Tracker
 *
 * GZ-205: Coaching quality metrics tracker
 */

import { describe, it, expect } from 'vitest';
import {
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
  type CoachingMetrics,
} from '@/lib/coaching/quality-metrics';

describe('Quality Metrics', () => {
  // ==========================================================================
  // Factory Function Tests
  // ==========================================================================

  describe('createInitialMetrics', () => {
    it('should create metrics with all zeros', () => {
      const metrics = createInitialMetrics();

      expect(metrics.autonomyInstances).toBe(0);
      expect(metrics.competenceInstances).toBe(0);
      expect(metrics.relatednessInstances).toBe(0);
      expect(metrics.openQuestionCount).toBe(0);
      expect(metrics.closedQuestionCount).toBe(0);
      expect(metrics.openQuestionRatio).toBe(0);
      expect(metrics.empathyMarkerCount).toBe(0);
      expect(metrics.changeTalkCount).toBe(0);
      expect(metrics.sustainTalkCount).toBe(0);
      expect(metrics.changeTalkRatio).toBe(0);
      expect(metrics.adviceGivingCount).toBe(0);
      expect(metrics.leadingQuestionCount).toBe(0);
      expect(metrics.reflectiveSummaryCount).toBe(0);
    });
  });

  // ==========================================================================
  // Open Question Detection Tests
  // ==========================================================================

  describe('analyzeMessage - Open Questions', () => {
    it('should detect "Was" questions as open', () => {
      const updates = analyzeMessage('Was möchtest du erreichen?', 'assistant');
      const openQ = updates.find(u => u.metric === 'openQuestionCount');
      expect(openQ).toBeDefined();
      expect(openQ?.increment).toBe(1);
    });

    it('should detect "Wie" questions as open', () => {
      const updates = analyzeMessage('Wie siehst du das?', 'assistant');
      const openQ = updates.find(u => u.metric === 'openQuestionCount');
      expect(openQ).toBeDefined();
    });

    it('should detect "Welche" questions as open', () => {
      const updates = analyzeMessage('Welche Optionen hast du?', 'assistant');
      const openQ = updates.find(u => u.metric === 'openQuestionCount');
      expect(openQ).toBeDefined();
    });

    it('should detect "Warum" questions as open', () => {
      const updates = analyzeMessage('Warum ist das wichtig für dich?', 'assistant');
      const openQ = updates.find(u => u.metric === 'openQuestionCount');
      expect(openQ).toBeDefined();
    });

    it('should detect "Woher" questions as open', () => {
      const updates = analyzeMessage('Woher kommt diese Überzeugung?', 'assistant');
      const openQ = updates.find(u => u.metric === 'openQuestionCount');
      expect(openQ).toBeDefined();
    });

    it('should detect multiple open questions', () => {
      const updates = analyzeMessage(
        'Was denkst du? Wie würdest du vorgehen?',
        'assistant'
      );
      const openQs = updates.filter(u => u.metric === 'openQuestionCount');
      expect(openQs.length).toBe(2);
    });
  });

  // ==========================================================================
  // Closed Question Detection Tests
  // ==========================================================================

  describe('analyzeMessage - Closed Questions', () => {
    it('should detect "Hast du" questions as closed', () => {
      const updates = analyzeMessage('Hast du das schon gemacht?', 'assistant');
      const closedQ = updates.find(u => u.metric === 'closedQuestionCount');
      expect(closedQ).toBeDefined();
    });

    it('should detect "Bist du" questions as closed', () => {
      const updates = analyzeMessage('Bist du bereit?', 'assistant');
      const closedQ = updates.find(u => u.metric === 'closedQuestionCount');
      expect(closedQ).toBeDefined();
    });

    it('should detect "Kannst du" questions as closed', () => {
      const updates = analyzeMessage('Kannst du das erklären?', 'assistant');
      const closedQ = updates.find(u => u.metric === 'closedQuestionCount');
      expect(closedQ).toBeDefined();
    });

    it('should detect "Willst du" questions as closed', () => {
      const updates = analyzeMessage('Willst du weitermachen?', 'assistant');
      const closedQ = updates.find(u => u.metric === 'closedQuestionCount');
      expect(closedQ).toBeDefined();
    });
  });

  // ==========================================================================
  // Empathy Marker Tests
  // ==========================================================================

  describe('analyzeMessage - Empathy Markers', () => {
    it('should detect "verstehe" as empathy marker', () => {
      const updates = analyzeMessage('Ich verstehe, das ist schwierig.', 'assistant');
      const empathy = updates.find(u => u.metric === 'empathyMarkerCount');
      expect(empathy).toBeDefined();
      expect(empathy?.increment).toBeGreaterThanOrEqual(1);
    });

    it('should detect "nachvollziehbar" as empathy marker', () => {
      const updates = analyzeMessage('Das ist nachvollziehbar.', 'assistant');
      const empathy = updates.find(u => u.metric === 'empathyMarkerCount');
      expect(empathy).toBeDefined();
    });

    it('should detect "geht vielen so" as empathy marker', () => {
      const updates = analyzeMessage('Das geht vielen so am Anfang.', 'assistant');
      const empathy = updates.find(u => u.metric === 'empathyMarkerCount');
      expect(empathy).toBeDefined();
    });

    it('should detect "völlig normal" as empathy marker', () => {
      const updates = analyzeMessage('Das ist völlig normal.', 'assistant');
      const empathy = updates.find(u => u.metric === 'empathyMarkerCount');
      expect(empathy).toBeDefined();
    });

    it('should count multiple empathy markers', () => {
      const updates = analyzeMessage(
        'Ich verstehe das. Das ist völlig normal und nachvollziehbar.',
        'assistant'
      );
      const empathy = updates.find(u => u.metric === 'empathyMarkerCount');
      expect(empathy).toBeDefined();
      expect(empathy?.increment).toBeGreaterThanOrEqual(2);
    });
  });

  // ==========================================================================
  // Autonomy Support Tests
  // ==========================================================================

  describe('analyzeMessage - Autonomy Support', () => {
    it('should detect "du entscheidest" as autonomy support', () => {
      const updates = analyzeMessage('Du entscheidest, wie es weitergeht.', 'assistant');
      const autonomy = updates.find(u => u.metric === 'autonomyInstances');
      expect(autonomy).toBeDefined();
    });

    it('should detect "deine Wahl" as autonomy support', () => {
      const updates = analyzeMessage('Das ist deine Wahl.', 'assistant');
      const autonomy = updates.find(u => u.metric === 'autonomyInstances');
      expect(autonomy).toBeDefined();
    });

    it('should detect "was möchtest du" as autonomy support', () => {
      const updates = analyzeMessage('Was möchtest du als nächstes tun?', 'assistant');
      const autonomy = updates.find(u => u.metric === 'autonomyInstances');
      expect(autonomy).toBeDefined();
    });

    it('should detect "wie siehst du das" as autonomy support', () => {
      const updates = analyzeMessage('Wie siehst du das?', 'assistant');
      const autonomy = updates.find(u => u.metric === 'autonomyInstances');
      expect(autonomy).toBeDefined();
    });
  });

  // ==========================================================================
  // Competence Building Tests
  // ==========================================================================

  describe('analyzeMessage - Competence Building', () => {
    it('should detect "du kannst" as competence building', () => {
      const updates = analyzeMessage('Du kannst das schaffen.', 'assistant');
      const competence = updates.find(u => u.metric === 'competenceInstances');
      expect(competence).toBeDefined();
    });

    it('should detect "du hast bereits" as competence building', () => {
      const updates = analyzeMessage('Du hast bereits viel erreicht.', 'assistant');
      const competence = updates.find(u => u.metric === 'competenceInstances');
      expect(competence).toBeDefined();
    });

    it('should detect "deine Erfahrung" as competence building', () => {
      const updates = analyzeMessage('Deine Erfahrung zeigt, dass du das kannst.', 'assistant');
      const competence = updates.find(u => u.metric === 'competenceInstances');
      expect(competence).toBeDefined();
    });

    it('should detect "das zeigt" as competence building', () => {
      const updates = analyzeMessage('Das zeigt, wie gut du das machst.', 'assistant');
      const competence = updates.find(u => u.metric === 'competenceInstances');
      expect(competence).toBeDefined();
    });
  });

  // ==========================================================================
  // Relatedness Tests
  // ==========================================================================

  describe('analyzeMessage - Relatedness', () => {
    it('should detect "gemeinsam" as relatedness', () => {
      const updates = analyzeMessage('Lass uns das gemeinsam anschauen.', 'assistant');
      const relatedness = updates.find(u => u.metric === 'relatednessInstances');
      expect(relatedness).toBeDefined();
    });

    it('should detect "wir" as relatedness', () => {
      const updates = analyzeMessage('Wir schaffen das zusammen.', 'assistant');
      const relatedness = updates.find(u => u.metric === 'relatednessInstances');
      expect(relatedness).toBeDefined();
    });

    it('should detect "ich begleite" as relatedness', () => {
      const updates = analyzeMessage('Ich begleite dich dabei.', 'assistant');
      const relatedness = updates.find(u => u.metric === 'relatednessInstances');
      expect(relatedness).toBeDefined();
    });
  });

  // ==========================================================================
  // Anti-Pattern Tests
  // ==========================================================================

  describe('analyzeMessage - Advice Giving (Anti-Pattern)', () => {
    it('should detect "du solltest" as advice giving', () => {
      const updates = analyzeMessage('Du solltest das anders machen.', 'assistant');
      const advice = updates.find(u => u.metric === 'adviceGivingCount');
      expect(advice).toBeDefined();
    });

    it('should detect "du musst" as advice giving', () => {
      const updates = analyzeMessage('Du musst das unbedingt tun.', 'assistant');
      const advice = updates.find(u => u.metric === 'adviceGivingCount');
      expect(advice).toBeDefined();
    });

    it('should detect "am besten" as advice giving', () => {
      const updates = analyzeMessage('Am besten machst du es so.', 'assistant');
      const advice = updates.find(u => u.metric === 'adviceGivingCount');
      expect(advice).toBeDefined();
    });

    it('should detect "ich empfehle" as advice giving', () => {
      const updates = analyzeMessage('Ich empfehle dir das zu tun.', 'assistant');
      const advice = updates.find(u => u.metric === 'adviceGivingCount');
      expect(advice).toBeDefined();
    });
  });

  describe('analyzeMessage - Leading Questions (Anti-Pattern)', () => {
    it('should detect "findest du nicht auch" as leading question', () => {
      const updates = analyzeMessage('Findest du nicht auch, dass das besser wäre?', 'assistant');
      const leading = updates.find(u => u.metric === 'leadingQuestionCount');
      expect(leading).toBeDefined();
    });

    it('should detect "wäre es nicht besser" as leading question', () => {
      const updates = analyzeMessage('Wäre es nicht besser, das zu ändern?', 'assistant');
      const leading = updates.find(u => u.metric === 'leadingQuestionCount');
      expect(leading).toBeDefined();
    });
  });

  // ==========================================================================
  // User Message Tests (Change Talk / Sustain Talk)
  // ==========================================================================

  describe('analyzeMessage - Change Talk (User)', () => {
    it('should detect "ich will" as change talk', () => {
      const updates = analyzeMessage('Ich will das unbedingt schaffen.', 'user');
      const changeTalk = updates.find(u => u.metric === 'changeTalkCount');
      expect(changeTalk).toBeDefined();
    });

    it('should detect "ich möchte" as change talk', () => {
      const updates = analyzeMessage('Ich möchte mein eigenes Business starten.', 'user');
      const changeTalk = updates.find(u => u.metric === 'changeTalkCount');
      expect(changeTalk).toBeDefined();
    });

    it('should detect "ich werde" as change talk', () => {
      const updates = analyzeMessage('Ich werde das durchziehen.', 'user');
      const changeTalk = updates.find(u => u.metric === 'changeTalkCount');
      expect(changeTalk).toBeDefined();
    });

    it('should detect "ich bin bereit" as change talk', () => {
      const updates = analyzeMessage('Ich bin bereit, den nächsten Schritt zu gehen.', 'user');
      const changeTalk = updates.find(u => u.metric === 'changeTalkCount');
      expect(changeTalk).toBeDefined();
    });

    it('should detect "ich habe beschlossen" as change talk', () => {
      const updates = analyzeMessage('Ich habe beschlossen, es zu wagen.', 'user');
      const changeTalk = updates.find(u => u.metric === 'changeTalkCount');
      expect(changeTalk).toBeDefined();
    });
  });

  describe('analyzeMessage - Sustain Talk (User)', () => {
    it('should detect "kann nicht" as sustain talk', () => {
      const updates = analyzeMessage('Ich kann nicht, es ist zu schwer.', 'user');
      const sustainTalk = updates.find(u => u.metric === 'sustainTalkCount');
      expect(sustainTalk).toBeDefined();
    });

    it('should detect "unmöglich" as sustain talk', () => {
      const updates = analyzeMessage('Das ist unmöglich für mich.', 'user');
      const sustainTalk = updates.find(u => u.metric === 'sustainTalkCount');
      expect(sustainTalk).toBeDefined();
    });

    it('should detect "zu schwer" as sustain talk', () => {
      const updates = analyzeMessage('Das ist zu schwer.', 'user');
      const sustainTalk = updates.find(u => u.metric === 'sustainTalkCount');
      expect(sustainTalk).toBeDefined();
    });

    it('should detect "nicht bereit" as sustain talk', () => {
      const updates = analyzeMessage('Ich bin nicht bereit dafür.', 'user');
      const sustainTalk = updates.find(u => u.metric === 'sustainTalkCount');
      expect(sustainTalk).toBeDefined();
    });

    it('should detect "habe Angst" as sustain talk', () => {
      const updates = analyzeMessage('Ich habe Angst zu scheitern.', 'user');
      const sustainTalk = updates.find(u => u.metric === 'sustainTalkCount');
      expect(sustainTalk).toBeDefined();
    });
  });

  // ==========================================================================
  // Apply Updates Tests
  // ==========================================================================

  describe('applyUpdates', () => {
    it('should apply increments correctly', () => {
      const metrics = createInitialMetrics();
      const updates = [
        { metric: 'openQuestionCount' as const, increment: 2 },
        { metric: 'empathyMarkerCount' as const, increment: 1 },
      ];

      const newMetrics = applyUpdates(metrics, updates);

      expect(newMetrics.openQuestionCount).toBe(2);
      expect(newMetrics.empathyMarkerCount).toBe(1);
    });

    it('should calculate openQuestionRatio correctly', () => {
      const metrics = createInitialMetrics();
      const updates = [
        { metric: 'openQuestionCount' as const, increment: 7 },
        { metric: 'closedQuestionCount' as const, increment: 3 },
      ];

      const newMetrics = applyUpdates(metrics, updates);

      expect(newMetrics.openQuestionRatio).toBe(0.7);
    });

    it('should not mutate original metrics', () => {
      const metrics = createInitialMetrics();
      const updates = [{ metric: 'autonomyInstances' as const, increment: 5 }];

      applyUpdates(metrics, updates);

      expect(metrics.autonomyInstances).toBe(0);
    });
  });

  // ==========================================================================
  // Scoring Tests
  // ==========================================================================

  describe('calculateCoachingScore', () => {
    it('should return 0 for empty metrics', () => {
      const metrics = createInitialMetrics();
      const score = calculateCoachingScore(metrics);
      expect(score).toBe(0);
    });

    it('should return high score for good metrics', () => {
      const metrics: CoachingMetrics = {
        autonomyInstances: 5,
        competenceInstances: 3,
        relatednessInstances: 2,
        openQuestionCount: 7,
        closedQuestionCount: 3,
        openQuestionRatio: 0.7,
        empathyMarkerCount: 3,
        changeTalkCount: 5,
        sustainTalkCount: 2,
        changeTalkRatio: 2.5,
        adviceGivingCount: 0,
        leadingQuestionCount: 0,
        reflectiveSummaryCount: 1,
      };

      const score = calculateCoachingScore(metrics);
      expect(score).toBeGreaterThanOrEqual(75);
    });

    it('should penalize anti-patterns', () => {
      const goodMetrics: CoachingMetrics = {
        autonomyInstances: 5,
        competenceInstances: 3,
        relatednessInstances: 2,
        openQuestionCount: 7,
        closedQuestionCount: 3,
        openQuestionRatio: 0.7,
        empathyMarkerCount: 3,
        changeTalkCount: 5,
        sustainTalkCount: 2,
        changeTalkRatio: 2.5,
        adviceGivingCount: 0,
        leadingQuestionCount: 0,
        reflectiveSummaryCount: 1,
      };

      const badMetrics: CoachingMetrics = {
        ...goodMetrics,
        adviceGivingCount: 3,
        leadingQuestionCount: 2,
      };

      const goodScore = calculateCoachingScore(goodMetrics);
      const badScore = calculateCoachingScore(badMetrics);

      expect(badScore).toBeLessThan(goodScore);
      expect(goodScore - badScore).toBeGreaterThanOrEqual(40); // 5 anti-patterns * ~10 penalty
    });

    it('should cap score at 100', () => {
      const excellentMetrics: CoachingMetrics = {
        autonomyInstances: 20,
        competenceInstances: 20,
        relatednessInstances: 20,
        openQuestionCount: 100,
        closedQuestionCount: 0,
        openQuestionRatio: 1.0,
        empathyMarkerCount: 20,
        changeTalkCount: 100,
        sustainTalkCount: 0,
        changeTalkRatio: 100,
        adviceGivingCount: 0,
        leadingQuestionCount: 0,
        reflectiveSummaryCount: 10,
      };

      const score = calculateCoachingScore(excellentMetrics);
      expect(score).toBeLessThanOrEqual(100);
    });

    it('should not go below 0', () => {
      const terribleMetrics: CoachingMetrics = {
        autonomyInstances: 0,
        competenceInstances: 0,
        relatednessInstances: 0,
        openQuestionCount: 0,
        closedQuestionCount: 10,
        openQuestionRatio: 0,
        empathyMarkerCount: 0,
        changeTalkCount: 0,
        sustainTalkCount: 10,
        changeTalkRatio: 0,
        adviceGivingCount: 20,
        leadingQuestionCount: 20,
        reflectiveSummaryCount: 0,
      };

      const score = calculateCoachingScore(terribleMetrics);
      expect(score).toBeGreaterThanOrEqual(0);
    });
  });

  describe('calculateScoreBreakdown', () => {
    it('should break down scores correctly', () => {
      const metrics: CoachingMetrics = {
        autonomyInstances: 5,
        competenceInstances: 3,
        relatednessInstances: 2,
        openQuestionCount: 7,
        closedQuestionCount: 3,
        openQuestionRatio: 0.7,
        empathyMarkerCount: 3,
        changeTalkCount: 4,
        sustainTalkCount: 2,
        changeTalkRatio: 2,
        adviceGivingCount: 1,
        leadingQuestionCount: 0,
        reflectiveSummaryCount: 1,
      };

      const breakdown = calculateScoreBreakdown(metrics);

      expect(breakdown.sdtScore).toBeGreaterThan(0);
      expect(breakdown.questionScore).toBeGreaterThan(0);
      expect(breakdown.empathyScore).toBeGreaterThan(0);
      expect(breakdown.changeTalkScore).toBeGreaterThan(0);
      expect(breakdown.antiPatternPenalty).toBe(-10);
      expect(breakdown.totalScore).toBe(
        breakdown.sdtScore +
        breakdown.questionScore +
        breakdown.empathyScore +
        breakdown.changeTalkScore +
        breakdown.antiPatternPenalty
      );
    });
  });

  // ==========================================================================
  // Warning Tests
  // ==========================================================================

  describe('getQualityWarnings', () => {
    it('should warn about low autonomy', () => {
      const metrics = createInitialMetrics();
      metrics.autonomyInstances = 1;

      const warnings = getQualityWarnings(metrics);

      expect(warnings).toContain('Zu wenig Autonomie-Unterstützung');
    });

    it('should warn about missing empathy', () => {
      const metrics = createInitialMetrics();

      const warnings = getQualityWarnings(metrics);

      expect(warnings).toContain('Keine Empathie-Marker erkannt');
    });

    it('should warn about too much advice giving', () => {
      const metrics = createInitialMetrics();
      metrics.adviceGivingCount = 5;

      const warnings = getQualityWarnings(metrics);

      expect(warnings).toContain('Zu viele Ratschläge gegeben');
    });

    it('should warn about low open question ratio', () => {
      const metrics = createInitialMetrics();
      metrics.openQuestionCount = 2;
      metrics.closedQuestionCount = 8;
      metrics.openQuestionRatio = 0.2;

      const warnings = getQualityWarnings(metrics);

      expect(warnings).toContain('Zu wenige offene Fragen');
    });

    it('should warn about leading questions', () => {
      const metrics = createInitialMetrics();
      metrics.leadingQuestionCount = 2;

      const warnings = getQualityWarnings(metrics);

      expect(warnings).toContain('Leitende Fragen erkannt');
    });

    it('should return no warnings for good metrics', () => {
      const metrics: CoachingMetrics = {
        autonomyInstances: 5,
        competenceInstances: 3,
        relatednessInstances: 2,
        openQuestionCount: 8,
        closedQuestionCount: 2,
        openQuestionRatio: 0.8,
        empathyMarkerCount: 5,
        changeTalkCount: 5,
        sustainTalkCount: 1,
        changeTalkRatio: 5,
        adviceGivingCount: 0,
        leadingQuestionCount: 0,
        reflectiveSummaryCount: 2,
      };

      const warnings = getQualityWarnings(metrics);

      expect(warnings.length).toBe(0);
    });
  });

  describe('getDetailedWarnings', () => {
    it('should return warnings with severity', () => {
      const metrics = createInitialMetrics();
      metrics.adviceGivingCount = 10;

      const warnings = getDetailedWarnings(metrics);
      const adviceWarning = warnings.find(w => w.type === 'advice');

      expect(adviceWarning).toBeDefined();
      expect(adviceWarning?.severity).toBe('critical');
    });

    it('should mark zero empathy as critical', () => {
      const metrics = createInitialMetrics();

      const warnings = getDetailedWarnings(metrics);
      const empathyWarning = warnings.find(w => w.type === 'empathy');

      expect(empathyWarning).toBeDefined();
      expect(empathyWarning?.severity).toBe('critical');
    });
  });

  // ==========================================================================
  // Quality Assessment Tests
  // ==========================================================================

  describe('meetsMinimumQuality', () => {
    it('should return false for poor metrics', () => {
      const metrics = createInitialMetrics();
      expect(meetsMinimumQuality(metrics)).toBe(false);
    });

    it('should return true for adequate metrics', () => {
      const metrics: CoachingMetrics = {
        autonomyInstances: 3,
        competenceInstances: 2,
        relatednessInstances: 1,
        openQuestionCount: 5,
        closedQuestionCount: 3,
        openQuestionRatio: 0.625,
        empathyMarkerCount: 2,
        changeTalkCount: 3,
        sustainTalkCount: 2,
        changeTalkRatio: 1.5,
        adviceGivingCount: 1,
        leadingQuestionCount: 0,
        reflectiveSummaryCount: 1,
      };

      expect(meetsMinimumQuality(metrics)).toBe(true);
    });
  });

  describe('meetsTargetQuality', () => {
    it('should return false for adequate but not excellent metrics', () => {
      const metrics: CoachingMetrics = {
        autonomyInstances: 3,
        competenceInstances: 2,
        relatednessInstances: 1,
        openQuestionCount: 5,
        closedQuestionCount: 3,
        openQuestionRatio: 0.625,
        empathyMarkerCount: 2,
        changeTalkCount: 3,
        sustainTalkCount: 2,
        changeTalkRatio: 1.5,
        adviceGivingCount: 1,
        leadingQuestionCount: 0,
        reflectiveSummaryCount: 1,
      };

      expect(meetsTargetQuality(metrics)).toBe(false);
    });

    it('should return true for excellent metrics', () => {
      const metrics: CoachingMetrics = {
        autonomyInstances: 5,
        competenceInstances: 3,
        relatednessInstances: 2,
        openQuestionCount: 8,
        closedQuestionCount: 2,
        openQuestionRatio: 0.8,
        empathyMarkerCount: 4,
        changeTalkCount: 6,
        sustainTalkCount: 2,
        changeTalkRatio: 3,
        adviceGivingCount: 0,
        leadingQuestionCount: 0,
        reflectiveSummaryCount: 2,
      };

      expect(meetsTargetQuality(metrics)).toBe(true);
    });
  });

  describe('getQualityAssessment', () => {
    it('should return "poor" for very low scores', () => {
      const metrics = createInitialMetrics();
      const assessment = getQualityAssessment(metrics);

      expect(assessment.level).toBe('poor');
      expect(assessment.score).toBeLessThan(40);
    });

    it('should return "excellent" for very high scores', () => {
      const metrics: CoachingMetrics = {
        autonomyInstances: 10,
        competenceInstances: 6,
        relatednessInstances: 4,
        openQuestionCount: 10,
        closedQuestionCount: 0,
        openQuestionRatio: 1.0,
        empathyMarkerCount: 6,
        changeTalkCount: 10,
        sustainTalkCount: 2,
        changeTalkRatio: 5,
        adviceGivingCount: 0,
        leadingQuestionCount: 0,
        reflectiveSummaryCount: 3,
      };

      const assessment = getQualityAssessment(metrics);

      expect(assessment.level).toBe('excellent');
      expect(assessment.score).toBeGreaterThanOrEqual(90);
    });

    it('should return German summary', () => {
      const metrics = createInitialMetrics();
      const assessment = getQualityAssessment(metrics);

      // Check that summary is in German
      expect(assessment.summary).toMatch(/Coaching-Qualität/);
    });
  });

  // ==========================================================================
  // Threshold Tests
  // ==========================================================================

  describe('QUALITY_THRESHOLDS', () => {
    it('should have correct autonomy thresholds', () => {
      expect(QUALITY_THRESHOLDS.autonomy.target).toBe(5);
      expect(QUALITY_THRESHOLDS.autonomy.minimum).toBe(2);
    });

    it('should have correct overall score thresholds', () => {
      expect(QUALITY_THRESHOLDS.overallScore.target).toBe(75);
      expect(QUALITY_THRESHOLDS.overallScore.minimum).toBe(50);
    });

    it('should have zero as target for anti-patterns', () => {
      expect(QUALITY_THRESHOLDS.adviceGiving.target).toBe(0);
      expect(QUALITY_THRESHOLDS.leadingQuestions.target).toBe(0);
    });
  });

  // ==========================================================================
  // Pattern Getter Tests
  // ==========================================================================

  describe('getPatterns', () => {
    it('should return all pattern lists', () => {
      const patterns = getPatterns();

      expect(patterns.openQuestionStarters).toBeDefined();
      expect(patterns.openQuestionStarters.length).toBeGreaterThan(0);
      expect(patterns.closedQuestionStarters).toBeDefined();
      expect(patterns.empathyMarkers).toBeDefined();
      expect(patterns.adviceGivingPatterns).toBeDefined();
      expect(patterns.leadingQuestionPatterns).toBeDefined();
      expect(patterns.autonomySupportPatterns).toBeDefined();
      expect(patterns.competenceBuildingPatterns).toBeDefined();
      expect(patterns.relatednessPatterns).toBeDefined();
      expect(patterns.changeTalkIndicators).toBeDefined();
      expect(patterns.sustainTalkIndicators).toBeDefined();
    });

    it('should have German patterns', () => {
      const patterns = getPatterns();

      // Check some patterns are in German
      expect(patterns.openQuestionStarters).toContain('was ');
      expect(patterns.empathyMarkers).toContain('verstehe');
      expect(patterns.adviceGivingPatterns).toContain('du solltest');
    });
  });

  // ==========================================================================
  // Integration Tests
  // ==========================================================================

  describe('Integration', () => {
    it('should track a full conversation flow', () => {
      let metrics = createInitialMetrics();

      // Assistant asks open question with empathy
      const assistantMsg1 = 'Ich verstehe deine Bedenken. Was möchtest du erreichen?';
      const updates1 = analyzeMessage(assistantMsg1, 'assistant');
      metrics = applyUpdates(metrics, updates1);

      expect(metrics.empathyMarkerCount).toBeGreaterThan(0);
      expect(metrics.openQuestionCount).toBeGreaterThan(0);
      expect(metrics.autonomyInstances).toBeGreaterThan(0);

      // User shows change talk
      const userMsg1 = 'Ich möchte mein eigenes Business starten. Ich will das wirklich.';
      const updates2 = analyzeMessage(userMsg1, 'user');
      metrics = applyUpdates(metrics, updates2);

      expect(metrics.changeTalkCount).toBeGreaterThan(0);

      // Assistant builds competence
      const assistantMsg2 = 'Du hast bereits viel Erfahrung. Wie siehst du das?';
      const updates3 = analyzeMessage(assistantMsg2, 'assistant');
      metrics = applyUpdates(metrics, updates3);

      expect(metrics.competenceInstances).toBeGreaterThan(0);

      // Check final score
      const score = calculateCoachingScore(metrics);
      expect(score).toBeGreaterThan(0);
    });

    it('should penalize bad coaching patterns', () => {
      let metrics = createInitialMetrics();

      // Assistant gives advice (anti-pattern)
      const badMsg = 'Du solltest das anders machen. Am besten machst du es so.';
      const updates = analyzeMessage(badMsg, 'assistant');
      metrics = applyUpdates(metrics, updates);

      expect(metrics.adviceGivingCount).toBeGreaterThan(0);

      const warnings = getQualityWarnings(metrics);
      expect(warnings.length).toBeGreaterThan(0);
    });
  });
});
