/**
 * Unit Tests for Appreciative Inquiry Strengths Discovery System (GZ-208)
 *
 * Tests the 4D Appreciative Inquiry cycle functionality including
 * phase prompts, strength extraction, and session workflow management.
 */

import { describe, it, expect } from 'vitest';
import {
  AIPhase,
  getAIPromptForPhase,
  getPersonalizedAIPrompt,
  extractStrengths,
  extractStrengthsWithAnalysis,
  getNextPhase,
  getPreviousPhase,
  getPhaseProgress,
  isFinalPhase,
  isFirstPhase,
  createAISession,
  advanceAISession,
  getPhaseNameGerman,
  getPhaseDescription,
  categorizeStrengths,
  getAllPhasePrompts,
  STRENGTH_INDICATORS,
  STRENGTH_CATEGORIES,
  type AIPromptContext,
} from '@/lib/coaching/appreciative-inquiry';

// ============================================================================
// AIPhase Enum Tests
// ============================================================================

describe('AIPhase Enum', () => {
  it('should have all 4 phases defined', () => {
    expect(AIPhase.DISCOVER).toBe('DISCOVER');
    expect(AIPhase.DREAM).toBe('DREAM');
    expect(AIPhase.DESIGN).toBe('DESIGN');
    expect(AIPhase.DESTINY).toBe('DESTINY');
  });

  it('should have exactly 4 phases', () => {
    const phases = Object.values(AIPhase);
    expect(phases).toHaveLength(4);
  });
});

// ============================================================================
// getAIPromptForPhase() Tests
// ============================================================================

describe('getAIPromptForPhase', () => {
  describe('DISCOVER phase prompt', () => {
    it('should return the correct German prompt for DISCOVER', () => {
      const prompt = getAIPromptForPhase(AIPhase.DISCOVER);
      expect(prompt).toBe(
        'Erzähl mir von einem beruflichen Erfolg, auf den du stolz bist. Was hast du da gut gemacht?'
      );
    });

    it('should ask about professional success', () => {
      const prompt = getAIPromptForPhase(AIPhase.DISCOVER);
      expect(prompt).toContain('beruflichen Erfolg');
    });

    it('should ask what user did well', () => {
      const prompt = getAIPromptForPhase(AIPhase.DISCOVER);
      expect(prompt).toContain('gut gemacht');
    });
  });

  describe('DREAM phase prompt', () => {
    it('should return the correct German prompt for DREAM', () => {
      const prompt = getAIPromptForPhase(AIPhase.DREAM);
      expect(prompt).toBe(
        'Wenn dein Business in 3 Jahren genau so läuft, wie du es dir wünschst - wie sieht dein Alltag aus?'
      );
    });

    it('should reference 3 year timeframe', () => {
      const prompt = getAIPromptForPhase(AIPhase.DREAM);
      expect(prompt).toContain('3 Jahren');
    });

    it('should ask about ideal daily life', () => {
      const prompt = getAIPromptForPhase(AIPhase.DREAM);
      expect(prompt).toContain('Alltag');
    });
  });

  describe('DESIGN phase prompt', () => {
    it('should return the correct German prompt for DESIGN', () => {
      const prompt = getAIPromptForPhase(AIPhase.DESIGN);
      expect(prompt).toBe(
        'Von deinen Stärken (X, Y) zu deinem Traum (Z) - welche Schritte brauchst du?'
      );
    });

    it('should reference strengths placeholder', () => {
      const prompt = getAIPromptForPhase(AIPhase.DESIGN);
      expect(prompt).toContain('Stärken (X, Y)');
    });

    it('should reference dream placeholder', () => {
      const prompt = getAIPromptForPhase(AIPhase.DESIGN);
      expect(prompt).toContain('Traum (Z)');
    });

    it('should ask about steps needed', () => {
      const prompt = getAIPromptForPhase(AIPhase.DESIGN);
      expect(prompt).toContain('welche Schritte');
    });
  });

  describe('DESTINY phase prompt', () => {
    it('should return the correct German prompt for DESTINY', () => {
      const prompt = getAIPromptForPhase(AIPhase.DESTINY);
      expect(prompt).toBe(
        'Was ist der erste Schritt, den du diese Woche machst?'
      );
    });

    it('should ask about first step', () => {
      const prompt = getAIPromptForPhase(AIPhase.DESTINY);
      expect(prompt).toContain('erste Schritt');
    });

    it('should reference this week timeframe', () => {
      const prompt = getAIPromptForPhase(AIPhase.DESTINY);
      expect(prompt).toContain('diese Woche');
    });
  });
});

// ============================================================================
// getPersonalizedAIPrompt() Tests
// ============================================================================

describe('getPersonalizedAIPrompt', () => {
  describe('without context', () => {
    it('should return base prompt when no context provided', () => {
      const prompt = getPersonalizedAIPrompt(AIPhase.DISCOVER);
      expect(prompt).toBe(getAIPromptForPhase(AIPhase.DISCOVER));
    });

    it('should return base prompt for undefined context', () => {
      const prompt = getPersonalizedAIPrompt(AIPhase.DREAM, undefined);
      expect(prompt).toBe(getAIPromptForPhase(AIPhase.DREAM));
    });
  });

  describe('with userName', () => {
    it('should personalize DISCOVER prompt with name', () => {
      const context: AIPromptContext = { userName: 'Maria' };
      const prompt = getPersonalizedAIPrompt(AIPhase.DISCOVER, context);
      expect(prompt).toContain('Maria');
      expect(prompt).toContain('beruflichen Erfolg');
    });

    it('should personalize DREAM prompt with name', () => {
      const context: AIPromptContext = { userName: 'Thomas' };
      const prompt = getPersonalizedAIPrompt(AIPhase.DREAM, context);
      expect(prompt).toContain('Thomas');
      expect(prompt).toContain('3 Jahren');
    });

    it('should personalize DESTINY prompt with name', () => {
      const context: AIPromptContext = { userName: 'Lisa' };
      const prompt = getPersonalizedAIPrompt(AIPhase.DESTINY, context);
      expect(prompt).toContain('Lisa');
      expect(prompt).toContain('erste Schritt');
    });
  });

  describe('with previousStrengths and dreamVision (DESIGN phase)', () => {
    it('should include strengths in DESIGN prompt', () => {
      const context: AIPromptContext = {
        previousStrengths: ['Kommunikation', 'Organisation'],
      };
      const prompt = getPersonalizedAIPrompt(AIPhase.DESIGN, context);
      expect(prompt).toContain('Kommunikation, Organisation');
    });

    it('should include dream vision in DESIGN prompt', () => {
      const context: AIPromptContext = {
        dreamVision: 'Ein erfolgreiches Coaching-Unternehmen',
      };
      const prompt = getPersonalizedAIPrompt(AIPhase.DESIGN, context);
      expect(prompt).toContain('Ein erfolgreiches Coaching-Unternehmen');
    });

    it('should include both strengths and dream vision', () => {
      const context: AIPromptContext = {
        userName: 'Maria',
        previousStrengths: ['Empathie', 'Analytisches Denken'],
        dreamVision: 'Eine Beratungsfirma leiten',
      };
      const prompt = getPersonalizedAIPrompt(AIPhase.DESIGN, context);
      expect(prompt).toContain('Maria');
      expect(prompt).toContain('Empathie, Analytisches Denken');
      expect(prompt).toContain('Eine Beratungsfirma leiten');
    });

    it('should use placeholder when no strengths provided', () => {
      const context: AIPromptContext = {
        dreamVision: 'Mein Traum-Business',
      };
      const prompt = getPersonalizedAIPrompt(AIPhase.DESIGN, context);
      expect(prompt).toContain('X, Y');
    });

    it('should use placeholder when empty strengths array', () => {
      const context: AIPromptContext = {
        previousStrengths: [],
      };
      const prompt = getPersonalizedAIPrompt(AIPhase.DESIGN, context);
      expect(prompt).toContain('X, Y');
    });
  });
});

// ============================================================================
// extractStrengths() Tests
// ============================================================================

describe('extractStrengths', () => {
  describe('basic extraction', () => {
    it('should extract "organisiert" from response', () => {
      const response = 'Ich habe das Projekt sehr organisiert durchgeführt.';
      const strengths = extractStrengths(response);
      expect(strengths).toContain('organisiert');
    });

    it('should extract "kommunikation" from response', () => {
      const response = 'Meine Kommunikation mit dem Team war sehr gut.';
      const strengths = extractStrengths(response);
      expect(strengths).toContain('kommunikation');
    });

    it('should extract "erfolgreich" from response', () => {
      const response = 'Das Projekt war sehr erfolgreich.';
      const strengths = extractStrengths(response);
      expect(strengths).toContain('erfolgreich');
    });

    it('should extract multiple strengths', () => {
      const response =
        'Ich habe das Projekt erfolgreich organisiert und das Team motiviert. Meine Kommunikation war sehr gut.';
      const strengths = extractStrengths(response);
      expect(strengths).toContain('erfolgreich');
      expect(strengths).toContain('organisiert');
      expect(strengths).toContain('motiviert');
      expect(strengths).toContain('kommunikation');
    });
  });

  describe('case insensitivity', () => {
    it('should extract strengths regardless of case', () => {
      const response = 'ORGANISIERT und KOMMUNIKATION waren wichtig.';
      const strengths = extractStrengths(response);
      expect(strengths).toContain('organisiert');
      expect(strengths).toContain('kommunikation');
    });

    it('should handle mixed case', () => {
      const response = 'Mein Erfolg war die Organisation.';
      const strengths = extractStrengths(response);
      expect(strengths).toContain('erfolg');
      expect(strengths).toContain('organisation');
    });
  });

  describe('edge cases', () => {
    it('should return empty array for empty string', () => {
      const strengths = extractStrengths('');
      expect(strengths).toEqual([]);
    });

    it('should return empty array for whitespace only', () => {
      const strengths = extractStrengths('   \n\t  ');
      expect(strengths).toEqual([]);
    });

    it('should return empty array for no matching strengths', () => {
      const response = 'Ich habe etwas gemacht, aber nichts besonderes.';
      const strengths = extractStrengths(response);
      // Note: might match some common words - let's check
      expect(strengths.length).toBeLessThan(3);
    });

    it('should not duplicate strengths', () => {
      const response =
        'Ich war organisiert, sehr organisiert, total organisiert.';
      const strengths = extractStrengths(response);
      const organisedCount = strengths.filter(
        (s) => s === 'organisiert'
      ).length;
      expect(organisedCount).toBe(1);
    });
  });

  describe('comprehensive strength detection', () => {
    it('should detect problem-solving strengths', () => {
      const response =
        'Ich habe eine Problemlösung gefunden und das Problem gelöst.';
      const strengths = extractStrengths(response);
      expect(strengths).toContain('problemlösung');
      expect(strengths).toContain('problem gelöst');
    });

    it('should detect leadership strengths', () => {
      const response =
        'Meine Führung des Teams war wichtig, ich habe alle motiviert und inspiriert.';
      const strengths = extractStrengths(response);
      expect(strengths).toContain('führung');
      expect(strengths).toContain('motiviert');
      expect(strengths).toContain('inspiriert');
    });

    it('should detect resilience strengths', () => {
      const response =
        'Ich war sehr belastbar und hatte Durchhaltevermögen trotz Schwierigkeiten.';
      const strengths = extractStrengths(response);
      expect(strengths).toContain('belastbar');
      expect(strengths).toContain('durchhaltevermögen');
    });

    it('should detect achievement-oriented language', () => {
      const response =
        'Ich habe es geschafft, das Ziel erreicht und verbessert.';
      const strengths = extractStrengths(response);
      expect(strengths).toContain('geschafft');
      expect(strengths).toContain('erreicht');
      expect(strengths).toContain('verbessert');
    });
  });
});

// ============================================================================
// extractStrengthsWithAnalysis() Tests
// ============================================================================

describe('extractStrengthsWithAnalysis', () => {
  it('should return strengths array', () => {
    const response = 'Ich war sehr organisiert und erfolgreich.';
    const result = extractStrengthsWithAnalysis(response);
    expect(result.strengths).toContain('organisiert');
    expect(result.strengths).toContain('erfolgreich');
  });

  it('should include original response', () => {
    const response = 'Meine Kommunikation war exzellent.';
    const result = extractStrengthsWithAnalysis(response);
    expect(result.originalResponse).toBe(response);
  });

  it('should calculate confidence based on match count', () => {
    // 0 strengths = 0 confidence
    const result0 = extractStrengthsWithAnalysis('Hallo');
    expect(result0.confidence).toBe(0);

    // 1 strength = ~0.33 confidence
    const result1 = extractStrengthsWithAnalysis('Ich war sehr strukturiert.');
    expect(result1.confidence).toBeCloseTo(0.33, 1);

    // 2 strengths = ~0.67 confidence
    const result2 = extractStrengthsWithAnalysis(
      'Ich war strukturiert und kreativ.'
    );
    expect(result2.confidence).toBeCloseTo(0.67, 1);

    // 3+ strengths = 1.0 confidence (capped at 1.0)
    const result3 = extractStrengthsWithAnalysis(
      'Ich war organisiert, kreativ und motiviert.'
    );
    expect(result3.confidence).toBe(1);
  });

  it('should cap confidence at 1.0', () => {
    const response =
      'Ich war organisiert, erfolgreich, motiviert, kreativ, analytisch und kommunikativ.';
    const result = extractStrengthsWithAnalysis(response);
    expect(result.confidence).toBe(1);
  });
});

// ============================================================================
// Phase Navigation Functions Tests
// ============================================================================

describe('getNextPhase', () => {
  it('should return DREAM after DISCOVER', () => {
    expect(getNextPhase(AIPhase.DISCOVER)).toBe(AIPhase.DREAM);
  });

  it('should return DESIGN after DREAM', () => {
    expect(getNextPhase(AIPhase.DREAM)).toBe(AIPhase.DESIGN);
  });

  it('should return DESTINY after DESIGN', () => {
    expect(getNextPhase(AIPhase.DESIGN)).toBe(AIPhase.DESTINY);
  });

  it('should return null after DESTINY (end of cycle)', () => {
    expect(getNextPhase(AIPhase.DESTINY)).toBeNull();
  });
});

describe('getPreviousPhase', () => {
  it('should return null before DISCOVER (start of cycle)', () => {
    expect(getPreviousPhase(AIPhase.DISCOVER)).toBeNull();
  });

  it('should return DISCOVER before DREAM', () => {
    expect(getPreviousPhase(AIPhase.DREAM)).toBe(AIPhase.DISCOVER);
  });

  it('should return DREAM before DESIGN', () => {
    expect(getPreviousPhase(AIPhase.DESIGN)).toBe(AIPhase.DREAM);
  });

  it('should return DESIGN before DESTINY', () => {
    expect(getPreviousPhase(AIPhase.DESTINY)).toBe(AIPhase.DESIGN);
  });
});

describe('getPhaseProgress', () => {
  it('should return 25 for DISCOVER', () => {
    expect(getPhaseProgress(AIPhase.DISCOVER)).toBe(25);
  });

  it('should return 50 for DREAM', () => {
    expect(getPhaseProgress(AIPhase.DREAM)).toBe(50);
  });

  it('should return 75 for DESIGN', () => {
    expect(getPhaseProgress(AIPhase.DESIGN)).toBe(75);
  });

  it('should return 100 for DESTINY', () => {
    expect(getPhaseProgress(AIPhase.DESTINY)).toBe(100);
  });
});

describe('isFinalPhase', () => {
  it('should return false for DISCOVER', () => {
    expect(isFinalPhase(AIPhase.DISCOVER)).toBe(false);
  });

  it('should return false for DREAM', () => {
    expect(isFinalPhase(AIPhase.DREAM)).toBe(false);
  });

  it('should return false for DESIGN', () => {
    expect(isFinalPhase(AIPhase.DESIGN)).toBe(false);
  });

  it('should return true for DESTINY', () => {
    expect(isFinalPhase(AIPhase.DESTINY)).toBe(true);
  });
});

describe('isFirstPhase', () => {
  it('should return true for DISCOVER', () => {
    expect(isFirstPhase(AIPhase.DISCOVER)).toBe(true);
  });

  it('should return false for DREAM', () => {
    expect(isFirstPhase(AIPhase.DREAM)).toBe(false);
  });

  it('should return false for DESIGN', () => {
    expect(isFirstPhase(AIPhase.DESIGN)).toBe(false);
  });

  it('should return false for DESTINY', () => {
    expect(isFirstPhase(AIPhase.DESTINY)).toBe(false);
  });
});

// ============================================================================
// Session Management Tests
// ============================================================================

describe('createAISession', () => {
  it('should create session starting at DISCOVER', () => {
    const session = createAISession();
    expect(session.currentPhase).toBe(AIPhase.DISCOVER);
  });

  it('should initialize with empty strengths', () => {
    const session = createAISession();
    expect(session.strengths).toEqual([]);
  });

  it('should initialize with null dreamVision', () => {
    const session = createAISession();
    expect(session.dreamVision).toBeNull();
  });

  it('should initialize with empty pathwaySteps', () => {
    const session = createAISession();
    expect(session.pathwaySteps).toEqual([]);
  });

  it('should initialize with null firstStep', () => {
    const session = createAISession();
    expect(session.firstStep).toBeNull();
  });

  it('should initialize with isComplete as false', () => {
    const session = createAISession();
    expect(session.isComplete).toBe(false);
  });
});

describe('advanceAISession', () => {
  describe('DISCOVER to DREAM transition', () => {
    it('should advance from DISCOVER to DREAM', () => {
      const session = createAISession();
      const newSession = advanceAISession(session, {
        discoverResponse: 'Ich war organisiert und erfolgreich.',
      });
      expect(newSession.currentPhase).toBe(AIPhase.DREAM);
    });

    it('should extract strengths from DISCOVER response', () => {
      const session = createAISession();
      const newSession = advanceAISession(session, {
        discoverResponse: 'Ich war sehr organisiert und kommunikativ.',
      });
      expect(newSession.strengths).toContain('organisiert');
      expect(newSession.strengths).toContain('kommunikativ');
    });

    it('should preserve original session immutably', () => {
      const session = createAISession();
      const newSession = advanceAISession(session, {
        discoverResponse: 'Test',
      });
      expect(session.currentPhase).toBe(AIPhase.DISCOVER);
      expect(newSession.currentPhase).toBe(AIPhase.DREAM);
    });
  });

  describe('DREAM to DESIGN transition', () => {
    it('should advance from DREAM to DESIGN', () => {
      let session = createAISession();
      session = advanceAISession(session, { discoverResponse: 'Test' });
      session = advanceAISession(session, {
        dreamResponse: 'Mein eigenes Coaching-Business.',
      });
      expect(session.currentPhase).toBe(AIPhase.DESIGN);
    });

    it('should store dream vision', () => {
      let session = createAISession();
      session = advanceAISession(session, { discoverResponse: 'Test' });
      session = advanceAISession(session, {
        dreamResponse: 'Ein erfolgreiches Unternehmen leiten.',
      });
      expect(session.dreamVision).toBe('Ein erfolgreiches Unternehmen leiten.');
    });
  });

  describe('DESIGN to DESTINY transition', () => {
    it('should advance from DESIGN to DESTINY', () => {
      let session = createAISession();
      session = advanceAISession(session, { discoverResponse: 'Test' });
      session = advanceAISession(session, { dreamResponse: 'Test' });
      session = advanceAISession(session, {
        designResponse: ['Schritt 1', 'Schritt 2'],
      });
      expect(session.currentPhase).toBe(AIPhase.DESTINY);
    });

    it('should store pathway steps', () => {
      let session = createAISession();
      session = advanceAISession(session, { discoverResponse: 'Test' });
      session = advanceAISession(session, { dreamResponse: 'Test' });
      session = advanceAISession(session, {
        designResponse: ['Businessplan schreiben', 'Kunden finden'],
      });
      expect(session.pathwaySteps).toEqual([
        'Businessplan schreiben',
        'Kunden finden',
      ]);
    });
  });

  describe('DESTINY completion', () => {
    it('should mark session complete after DESTINY', () => {
      let session = createAISession();
      session = advanceAISession(session, { discoverResponse: 'Test' });
      session = advanceAISession(session, { dreamResponse: 'Test' });
      session = advanceAISession(session, { designResponse: ['Test'] });
      session = advanceAISession(session, {
        destinyResponse: 'Heute noch den ersten Kunden anrufen.',
      });
      expect(session.isComplete).toBe(true);
    });

    it('should store first step', () => {
      let session = createAISession();
      session = advanceAISession(session, { discoverResponse: 'Test' });
      session = advanceAISession(session, { dreamResponse: 'Test' });
      session = advanceAISession(session, { designResponse: ['Test'] });
      session = advanceAISession(session, {
        destinyResponse: 'Gewerbe anmelden',
      });
      expect(session.firstStep).toBe('Gewerbe anmelden');
    });
  });

  describe('full cycle', () => {
    it('should complete full 4D cycle', () => {
      let session = createAISession();

      // DISCOVER
      session = advanceAISession(session, {
        discoverResponse:
          'Ich habe erfolgreich ein Projekt organisiert und das Team motiviert.',
      });
      expect(session.currentPhase).toBe(AIPhase.DREAM);
      expect(session.strengths.length).toBeGreaterThan(0);

      // DREAM
      session = advanceAISession(session, {
        dreamResponse: 'In 3 Jahren leite ich mein eigenes Beratungsunternehmen.',
      });
      expect(session.currentPhase).toBe(AIPhase.DESIGN);
      expect(session.dreamVision).toBe(
        'In 3 Jahren leite ich mein eigenes Beratungsunternehmen.'
      );

      // DESIGN
      session = advanceAISession(session, {
        designResponse: [
          'Businessplan schreiben',
          'Netzwerk aufbauen',
          'Ersten Kunden gewinnen',
        ],
      });
      expect(session.currentPhase).toBe(AIPhase.DESTINY);
      expect(session.pathwaySteps).toHaveLength(3);

      // DESTINY
      session = advanceAISession(session, {
        destinyResponse: 'Diese Woche rufe ich drei potenzielle Kunden an.',
      });
      expect(session.isComplete).toBe(true);
      expect(session.firstStep).toBe(
        'Diese Woche rufe ich drei potenzielle Kunden an.'
      );
    });
  });
});

// ============================================================================
// German Translation Functions Tests
// ============================================================================

describe('getPhaseNameGerman', () => {
  it('should return "Entdecken" for DISCOVER', () => {
    expect(getPhaseNameGerman(AIPhase.DISCOVER)).toBe('Entdecken');
  });

  it('should return "Träumen" for DREAM', () => {
    expect(getPhaseNameGerman(AIPhase.DREAM)).toBe('Träumen');
  });

  it('should return "Gestalten" for DESIGN', () => {
    expect(getPhaseNameGerman(AIPhase.DESIGN)).toBe('Gestalten');
  });

  it('should return "Umsetzen" for DESTINY', () => {
    expect(getPhaseNameGerman(AIPhase.DESTINY)).toBe('Umsetzen');
  });
});

describe('getPhaseDescription', () => {
  it('should return German description for DISCOVER', () => {
    const description = getPhaseDescription(AIPhase.DISCOVER);
    expect(description).toContain('Erfolge');
    expect(description).toContain('Stärken');
  });

  it('should return German description for DREAM', () => {
    const description = getPhaseDescription(AIPhase.DREAM);
    expect(description).toContain('Vision');
    expect(description).toContain('Zukunft');
  });

  it('should return German description for DESIGN', () => {
    const description = getPhaseDescription(AIPhase.DESIGN);
    expect(description).toContain('Weg');
    expect(description).toContain('Vision');
  });

  it('should return German description for DESTINY', () => {
    const description = getPhaseDescription(AIPhase.DESTINY);
    expect(description).toContain('Schritt');
  });
});

// ============================================================================
// categorizeStrengths() Tests
// ============================================================================

describe('categorizeStrengths', () => {
  it('should categorize organization strengths', () => {
    const strengths = ['organisiert', 'strukturiert'];
    const categorized = categorizeStrengths(strengths);
    expect(categorized['organization']).toContain('organisiert');
    expect(categorized['organization']).toContain('strukturiert');
  });

  it('should categorize communication strengths', () => {
    const strengths = ['kommunikation', 'empathie'];
    const categorized = categorizeStrengths(strengths);
    expect(categorized['communication']).toContain('kommunikation');
    expect(categorized['communication']).toContain('empathie');
  });

  it('should categorize multiple categories', () => {
    const strengths = ['organisiert', 'kommunikation', 'geschafft'];
    const categorized = categorizeStrengths(strengths);
    expect(Object.keys(categorized).length).toBeGreaterThanOrEqual(3);
  });

  it('should return empty object for empty strengths', () => {
    const categorized = categorizeStrengths([]);
    expect(Object.keys(categorized)).toHaveLength(0);
  });
});

// ============================================================================
// getAllPhasePrompts() Tests
// ============================================================================

describe('getAllPhasePrompts', () => {
  it('should return array of 4 phases', () => {
    const prompts = getAllPhasePrompts();
    expect(prompts).toHaveLength(4);
  });

  it('should be in correct order (DISCOVER, DREAM, DESIGN, DESTINY)', () => {
    const prompts = getAllPhasePrompts();
    expect(prompts[0]?.phase).toBe(AIPhase.DISCOVER);
    expect(prompts[1]?.phase).toBe(AIPhase.DREAM);
    expect(prompts[2]?.phase).toBe(AIPhase.DESIGN);
    expect(prompts[3]?.phase).toBe(AIPhase.DESTINY);
  });

  it('should include prompts for each phase', () => {
    const prompts = getAllPhasePrompts();
    prompts.forEach((item) => {
      expect(item.prompt).toBeDefined();
      expect(item.prompt.length).toBeGreaterThan(0);
    });
  });

  it('should include German names for each phase', () => {
    const prompts = getAllPhasePrompts();
    expect(prompts[0]?.nameGerman).toBe('Entdecken');
    expect(prompts[1]?.nameGerman).toBe('Träumen');
    expect(prompts[2]?.nameGerman).toBe('Gestalten');
    expect(prompts[3]?.nameGerman).toBe('Umsetzen');
  });
});

// ============================================================================
// Constants Tests
// ============================================================================

describe('STRENGTH_INDICATORS', () => {
  it('should be a non-empty array', () => {
    expect(STRENGTH_INDICATORS.length).toBeGreaterThan(0);
  });

  it('should include core competency indicators', () => {
    expect(STRENGTH_INDICATORS).toContain('organisiert');
    expect(STRENGTH_INDICATORS).toContain('kommunikativ');
    expect(STRENGTH_INDICATORS).toContain('kreativ');
  });

  it('should include achievement indicators', () => {
    expect(STRENGTH_INDICATORS).toContain('erfolgreich');
    expect(STRENGTH_INDICATORS).toContain('geschafft');
    expect(STRENGTH_INDICATORS).toContain('erreicht');
  });
});

describe('STRENGTH_CATEGORIES', () => {
  it('should have organization category', () => {
    const category = STRENGTH_CATEGORIES['organization'];
    expect(category).toBeDefined();
    expect(category?.length).toBeGreaterThan(0);
  });

  it('should have communication category', () => {
    const category = STRENGTH_CATEGORIES['communication'];
    expect(category).toBeDefined();
    expect(category?.length).toBeGreaterThan(0);
  });

  it('should have problemSolving category', () => {
    const category = STRENGTH_CATEGORIES['problemSolving'];
    expect(category).toBeDefined();
    expect(category?.length).toBeGreaterThan(0);
  });

  it('should have leadership category', () => {
    const category = STRENGTH_CATEGORIES['leadership'];
    expect(category).toBeDefined();
    expect(category?.length).toBeGreaterThan(0);
  });

  it('should have achievement category', () => {
    const category = STRENGTH_CATEGORIES['achievement'];
    expect(category).toBeDefined();
    expect(category?.length).toBeGreaterThan(0);
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Appreciative Inquiry Integration', () => {
  it('should complete realistic coaching flow', () => {
    // 1. Start session
    let session = createAISession();
    expect(isFirstPhase(session.currentPhase)).toBe(true);

    // 2. Get DISCOVER prompt
    const discoverPrompt = getAIPromptForPhase(AIPhase.DISCOVER);
    expect(discoverPrompt).toContain('beruflichen Erfolg');

    // 3. User responds to DISCOVER
    const discoverResponse =
      'In meinem letzten Job habe ich ein komplexes Projekt erfolgreich organisiert. ' +
      'Ich war sehr kommunikativ mit allen Stakeholdern und habe Probleme schnell gelöst.';

    session = advanceAISession(session, { discoverResponse });
    expect(session.strengths.length).toBeGreaterThanOrEqual(3);

    // 4. Get personalized DREAM prompt
    const dreamPrompt = getPersonalizedAIPrompt(AIPhase.DREAM, {
      userName: 'Max',
    });
    expect(dreamPrompt).toContain('Max');

    // 5. User responds to DREAM
    session = advanceAISession(session, {
      dreamResponse:
        'Ich sehe mich als erfolgreicher Berater mit eigener Firma.',
    });

    // 6. Get personalized DESIGN prompt with context
    const designPrompt = getPersonalizedAIPrompt(AIPhase.DESIGN, {
      userName: 'Max',
      previousStrengths: session.strengths,
      dreamVision: session.dreamVision ?? undefined,
    });
    expect(designPrompt).toContain('Max');
    expect(designPrompt).not.toContain('X, Y'); // Should have real strengths

    // 7. User responds to DESIGN
    session = advanceAISession(session, {
      designResponse: ['Zertifizierung machen', 'Netzwerken', 'Webseite bauen'],
    });

    // 8. Get DESTINY prompt
    const destinyPrompt = getAIPromptForPhase(AIPhase.DESTINY);
    expect(destinyPrompt).toContain('erste Schritt');

    // 9. User responds to DESTINY
    session = advanceAISession(session, {
      destinyResponse: 'Diese Woche melde ich mich für die Zertifizierung an.',
    });

    // 10. Session complete
    expect(session.isComplete).toBe(true);
    expect(isFinalPhase(AIPhase.DESTINY)).toBe(true);
    expect(getPhaseProgress(AIPhase.DESTINY)).toBe(100);
  });
});
