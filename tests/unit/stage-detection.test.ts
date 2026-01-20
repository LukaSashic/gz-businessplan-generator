/**
 * Unit Tests for TTM Stage Detection System (GZ-201)
 *
 * Tests the Transtheoretical Model stage detection functionality
 * including stage classification and coaching depth mapping.
 */

import { describe, it, expect } from 'vitest';
import {
  detectStage,
  getCoachingDepthForStage,
  Stage,
  STAGE_INDICATORS,
  STAGE_TO_DEPTH,
  getIndicatorsForStage,
  analyzeStageDetection,
  type Message,
  type CoachingDepth,
} from '@/lib/coaching/stage-detection';

// ============================================================================
// Stage Enum Tests
// ============================================================================

describe('Stage Enum', () => {
  it('should have all 5 TTM stages defined', () => {
    expect(Stage.PRECONTEMPLATION).toBe('PRECONTEMPLATION');
    expect(Stage.CONTEMPLATION).toBe('CONTEMPLATION');
    expect(Stage.PREPARATION).toBe('PREPARATION');
    expect(Stage.ACTION).toBe('ACTION');
    expect(Stage.MAINTENANCE).toBe('MAINTENANCE');
  });

  it('should have indicator patterns for all stages', () => {
    const stages = Object.values(Stage);
    stages.forEach((stage) => {
      expect(STAGE_INDICATORS[stage]).toBeDefined();
      expect(STAGE_INDICATORS[stage].length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// detectStage() Tests
// ============================================================================

describe('detectStage', () => {
  describe('PRECONTEMPLATION detection', () => {
    it('should detect "weiß nicht" as precontemplation', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich weiß nicht, ob ich das wirklich will.' },
      ];
      expect(detectStage(messages)).toBe(Stage.PRECONTEMPLATION);
    });

    it('should detect "unsicher" as precontemplation', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich bin noch sehr unsicher bei allem.' },
      ];
      expect(detectStage(messages)).toBe(Stage.PRECONTEMPLATION);
    });

    it('should detect "vielleicht" as precontemplation', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Vielleicht ist das nichts für mich.' },
      ];
      expect(detectStage(messages)).toBe(Stage.PRECONTEMPLATION);
    });

    it('should detect "keine Ahnung" as precontemplation', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich habe keine Ahnung, wie ich anfangen soll.' },
      ];
      expect(detectStage(messages)).toBe(Stage.PRECONTEMPLATION);
    });

    it('should detect "bin mir nicht sicher" as precontemplation', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich bin mir nicht sicher, ob das klappt.' },
      ];
      expect(detectStage(messages)).toBe(Stage.PRECONTEMPLATION);
    });
  });

  describe('CONTEMPLATION detection', () => {
    it('should detect "einerseits...andererseits" as contemplation', () => {
      const messages: Message[] = [
        {
          role: 'user',
          content: 'Einerseits will ich starten, andererseits habe ich Bedenken.',
        },
      ];
      expect(detectStage(messages)).toBe(Stage.CONTEMPLATION);
    });

    it('should detect "aber" indicating ambivalence as contemplation', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Die Idee ist gut, aber ich sehe Schwierigkeiten.' },
      ];
      expect(detectStage(messages)).toBe(Stage.CONTEMPLATION);
    });

    it('should detect "Angst" as contemplation', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich habe Angst vor dem finanziellen Risiko.' },
      ];
      expect(detectStage(messages)).toBe(Stage.CONTEMPLATION);
    });

    it('should detect "Risiko" as contemplation', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Das Risiko ist mir bewusst, ich denke darüber nach.' },
      ];
      expect(detectStage(messages)).toBe(Stage.CONTEMPLATION);
    });

    it('should detect "könnte" as contemplation', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Es könnte funktionieren, ich muss noch überlegen.' },
      ];
      expect(detectStage(messages)).toBe(Stage.CONTEMPLATION);
    });

    it('should detect "würde" as contemplation', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich würde gerne wissen, ob sich das lohnt.' },
      ];
      expect(detectStage(messages)).toBe(Stage.CONTEMPLATION);
    });
  });

  describe('PREPARATION detection', () => {
    it('should detect "ich plane" as preparation', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich plane, im März zu gründen.' },
      ];
      expect(detectStage(messages)).toBe(Stage.PREPARATION);
    });

    it('should detect "nächsten Monat" as preparation', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Nächsten Monat will ich das Gewerbe anmelden.' },
      ];
      expect(detectStage(messages)).toBe(Stage.PREPARATION);
    });

    it('should detect "konkret" as preparation', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich habe konkret vor, einen Laden zu eröffnen.' },
      ];
      expect(detectStage(messages)).toBe(Stage.PREPARATION);
    });

    it('should detect "erste Schritte" as preparation', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich unternehme erste Schritte zur Gründung.' },
      ];
      expect(detectStage(messages)).toBe(Stage.PREPARATION);
    });

    it('should detect "habe vor" as preparation', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich habe vor, nächste Woche den Businessplan fertig zu haben.' },
      ];
      expect(detectStage(messages)).toBe(Stage.PREPARATION);
    });
  });

  describe('ACTION detection', () => {
    it('should detect "ich habe schon" as action', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich habe schon meine ersten Kunden gewonnen.' },
      ];
      expect(detectStage(messages)).toBe(Stage.ACTION);
    });

    it('should detect "bin dabei" as action', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich bin dabei, meine Website zu bauen.' },
      ];
      expect(detectStage(messages)).toBe(Stage.ACTION);
    });

    it('should detect "läuft bereits" as action', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Das Geschäft läuft bereits seit zwei Wochen.' },
      ];
      expect(detectStage(messages)).toBe(Stage.ACTION);
    });

    it('should detect "mache gerade" as action', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich mache gerade die Buchhaltung für den ersten Monat.' },
      ];
      expect(detectStage(messages)).toBe(Stage.ACTION);
    });
  });

  describe('MAINTENANCE detection', () => {
    it('should detect "seit Monaten" as maintenance', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Seit Monaten läuft das Geschäft gut.' },
      ];
      expect(detectStage(messages)).toBe(Stage.MAINTENANCE);
    });

    it('should detect "routinemäßig" as maintenance', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich arbeite routinemäßig an meinen Prozessen.' },
      ];
      expect(detectStage(messages)).toBe(Stage.MAINTENANCE);
    });

    it('should detect "etabliert" as maintenance', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Mein Business ist jetzt gut etabliert.' },
      ];
      expect(detectStage(messages)).toBe(Stage.MAINTENANCE);
    });
  });

  describe('Edge cases', () => {
    it('should default to CONTEMPLATION for empty messages array', () => {
      const messages: Message[] = [];
      expect(detectStage(messages)).toBe(Stage.CONTEMPLATION);
    });

    it('should default to CONTEMPLATION for assistant-only messages', () => {
      const messages: Message[] = [
        { role: 'assistant', content: 'Wie kann ich Ihnen helfen?' },
        { role: 'assistant', content: 'Erzählen Sie mir mehr.' },
      ];
      expect(detectStage(messages)).toBe(Stage.CONTEMPLATION);
    });

    it('should default to CONTEMPLATION for empty user content', () => {
      const messages: Message[] = [{ role: 'user', content: '' }];
      expect(detectStage(messages)).toBe(Stage.CONTEMPLATION);
    });

    it('should default to CONTEMPLATION for no matching indicators', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Guten Tag, ich möchte einen Businessplan erstellen.' },
      ];
      expect(detectStage(messages)).toBe(Stage.CONTEMPLATION);
    });

    it('should handle mixed signals by selecting highest match count', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich plane konkret die ersten Schritte nächsten Monat.' },
        { role: 'user', content: 'Ich habe vor, bald anzufangen.' },
      ];
      // Multiple preparation indicators should win
      expect(detectStage(messages)).toBe(Stage.PREPARATION);
    });

    it('should analyze multiple user messages combined', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich plane' },
        { role: 'assistant', content: 'Was planen Sie?' },
        { role: 'user', content: 'Die ersten Schritte für nächsten Monat.' },
      ];
      expect(detectStage(messages)).toBe(Stage.PREPARATION);
    });

    it('should be case-insensitive', () => {
      const messages: Message[] = [
        { role: 'user', content: 'ICH PLANE KONKRET ZU STARTEN' },
      ];
      expect(detectStage(messages)).toBe(Stage.PREPARATION);
    });

    it('should handle German umlauts alternatives', () => {
      const messagesWithUmlaut: Message[] = [
        { role: 'user', content: 'Ich weiß nicht' },
      ];
      const messagesWithoutUmlaut: Message[] = [
        { role: 'user', content: 'Ich weiss nicht' },
      ];
      expect(detectStage(messagesWithUmlaut)).toBe(Stage.PRECONTEMPLATION);
      expect(detectStage(messagesWithoutUmlaut)).toBe(Stage.PRECONTEMPLATION);
    });
  });
});

// ============================================================================
// getCoachingDepthForStage() Tests
// ============================================================================

describe('getCoachingDepthForStage', () => {
  it('should return "shallow" for PRECONTEMPLATION (gentle exploration)', () => {
    expect(getCoachingDepthForStage(Stage.PRECONTEMPLATION)).toBe('shallow');
  });

  it('should return "medium" for CONTEMPLATION (develop discrepancy)', () => {
    expect(getCoachingDepthForStage(Stage.CONTEMPLATION)).toBe('medium');
  });

  it('should return "deep" for PREPARATION (concrete planning)', () => {
    expect(getCoachingDepthForStage(Stage.PREPARATION)).toBe('deep');
  });

  it('should return "medium" for ACTION (support and validate)', () => {
    expect(getCoachingDepthForStage(Stage.ACTION)).toBe('medium');
  });

  it('should return "shallow" for MAINTENANCE (reinforce)', () => {
    expect(getCoachingDepthForStage(Stage.MAINTENANCE)).toBe('shallow');
  });

  it('should have mapping defined for all stages', () => {
    const stages = Object.values(Stage);
    const validDepths: CoachingDepth[] = ['shallow', 'medium', 'deep'];

    stages.forEach((stage) => {
      const depth = getCoachingDepthForStage(stage);
      expect(validDepths).toContain(depth);
    });
  });

  it('should match STAGE_TO_DEPTH mapping exactly', () => {
    const stages = Object.values(Stage);

    stages.forEach((stage) => {
      expect(getCoachingDepthForStage(stage)).toBe(STAGE_TO_DEPTH[stage]);
    });
  });
});

// ============================================================================
// Utility Functions Tests
// ============================================================================

describe('getIndicatorsForStage', () => {
  it('should return indicators for PRECONTEMPLATION', () => {
    const indicators = getIndicatorsForStage(Stage.PRECONTEMPLATION);
    expect(indicators).toContain('weiß nicht');
    expect(indicators).toContain('unsicher');
    expect(indicators).toContain('vielleicht');
  });

  it('should return indicators for PREPARATION', () => {
    const indicators = getIndicatorsForStage(Stage.PREPARATION);
    expect(indicators).toContain('ich plane');
    expect(indicators).toContain('konkret');
  });

  it('should return a copy, not the original array', () => {
    const indicators1 = getIndicatorsForStage(Stage.PRECONTEMPLATION);
    const indicators2 = getIndicatorsForStage(Stage.PRECONTEMPLATION);
    expect(indicators1).not.toBe(indicators2);
    expect(indicators1).toEqual(indicators2);
  });
});

describe('analyzeStageDetection', () => {
  it('should return detailed analysis for detected stage', () => {
    const messages: Message[] = [
      { role: 'user', content: 'Ich plane konkret die ersten Schritte.' },
    ];

    const analysis = analyzeStageDetection(messages);

    expect(analysis.detectedStage).toBe(Stage.PREPARATION);
    expect(analysis.coachingDepth).toBe('deep');
    expect(analysis.userMessageCount).toBe(1);
    expect(analysis.matchDetails).toHaveLength(5);
  });

  it('should include match details for all stages', () => {
    const messages: Message[] = [
      { role: 'user', content: 'Test message' },
    ];

    const analysis = analyzeStageDetection(messages);

    const stageNames = analysis.matchDetails.map((m) => m.stage);
    expect(stageNames).toContain(Stage.PRECONTEMPLATION);
    expect(stageNames).toContain(Stage.CONTEMPLATION);
    expect(stageNames).toContain(Stage.PREPARATION);
    expect(stageNames).toContain(Stage.ACTION);
    expect(stageNames).toContain(Stage.MAINTENANCE);
  });

  it('should show matched indicators in details', () => {
    const messages: Message[] = [
      { role: 'user', content: 'Ich habe Angst vor dem Risiko.' },
    ];

    const analysis = analyzeStageDetection(messages);
    const contemplationMatch = analysis.matchDetails.find(
      (m) => m.stage === Stage.CONTEMPLATION
    );

    expect(contemplationMatch).toBeDefined();
    expect(contemplationMatch?.matchCount).toBeGreaterThan(0);
    expect(contemplationMatch?.indicators).toContain('angst');
    expect(contemplationMatch?.indicators).toContain('risiko');
  });

  it('should count user messages correctly', () => {
    const messages: Message[] = [
      { role: 'user', content: 'Message 1' },
      { role: 'assistant', content: 'Response 1' },
      { role: 'user', content: 'Message 2' },
      { role: 'assistant', content: 'Response 2' },
      { role: 'user', content: 'Message 3' },
    ];

    const analysis = analyzeStageDetection(messages);
    expect(analysis.userMessageCount).toBe(3);
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Stage Detection Integration', () => {
  it('should handle realistic conversation flow', () => {
    const conversationStart: Message[] = [
      { role: 'user', content: 'Hallo, ich überlege ob ich mich selbstständig machen soll.' },
      { role: 'assistant', content: 'Das klingt interessant! Erzählen Sie mir mehr.' },
      { role: 'user', content: 'Ich bin mir nicht sicher, ob das klappt.' },
    ];

    // Initially in precontemplation
    expect(detectStage(conversationStart)).toBe(Stage.PRECONTEMPLATION);

    const conversationProgress: Message[] = [
      ...conversationStart,
      { role: 'assistant', content: 'Was genau macht Sie unsicher?' },
      { role: 'user', content: 'Ich habe Angst vor dem Risiko, aber ich sehe auch Chancen.' },
    ];

    // Moving toward contemplation with more indicators
    expect(detectStage(conversationProgress)).toBe(Stage.CONTEMPLATION);
  });

  it('should provide consistent depth recommendations', () => {
    const testCases: { messages: Message[]; expectedDepth: CoachingDepth }[] = [
      {
        messages: [{ role: 'user', content: 'Ich weiß nicht, bin mir unsicher.' }],
        expectedDepth: 'shallow',
      },
      {
        messages: [{ role: 'user', content: 'Einerseits gut, andererseits Angst.' }],
        expectedDepth: 'medium',
      },
      {
        messages: [{ role: 'user', content: 'Ich plane konkret erste Schritte.' }],
        expectedDepth: 'deep',
      },
      {
        messages: [{ role: 'user', content: 'Ich bin dabei, mache gerade alles.' }],
        expectedDepth: 'medium',
      },
      {
        messages: [{ role: 'user', content: 'Seit Monaten etabliert.' }],
        expectedDepth: 'shallow',
      },
    ];

    testCases.forEach(({ messages, expectedDepth }) => {
      const stage = detectStage(messages);
      const depth = getCoachingDepthForStage(stage);
      expect(depth).toBe(expectedDepth);
    });
  });
});
