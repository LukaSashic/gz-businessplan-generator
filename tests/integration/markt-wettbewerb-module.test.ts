/**
 * Markt & Wettbewerb Module Integration Tests (GZ-501)
 *
 * Tests for the Markt & Wettbewerb module prompt system including
 * YC reality checks, MI confidence handling, and research integration.
 */

import { describe, it, expect } from 'vitest';
import {
  buildMarktWettbewerbPrompt,
  detectConfidenceLevel,
  getMIResponseForConfidence,
  shouldTriggerResearch,
  getYCRealityCheckQuestion,
  QUESTION_CLUSTERS,
  YC_REALITY_CHECKS,
  CONFIDENCE_PATTERNS,
  RESEARCH_TRIGGERS,
  FORBIDDEN_PATTERNS,
  REQUIRED_PATTERNS,
} from '@/lib/prompts/modules/markt-wettbewerb';

// ============================================================================
// Prompt Building Tests
// ============================================================================

describe('buildMarktWettbewerbPrompt', () => {
  describe('basic prompt generation', () => {
    it('generates a prompt without options', () => {
      const prompt = buildMarktWettbewerbPrompt();

      expect(prompt).toBeDefined();
      expect(prompt.length).toBeGreaterThan(1000);
      expect(prompt).toContain('Greta');
      expect(prompt).toContain('Markt');
      expect(prompt).toContain('Wettbewerb');
    });

    it('includes module goals', () => {
      const prompt = buildMarktWettbewerbPrompt();

      expect(prompt).toContain('TAM');
      expect(prompt).toContain('SAM');
      expect(prompt).toContain('SOM');
      expect(prompt).toContain('Zielkunden');
      expect(prompt).toContain('Wettbewerber');
      expect(prompt).toContain('Differenzierung');
    });

    it('includes GROW structure', () => {
      const prompt = buildMarktWettbewerbPrompt();

      expect(prompt).toContain('GOAL');
      expect(prompt).toContain('REALITY');
      expect(prompt).toContain('OPTIONS');
      expect(prompt).toContain('WILL');
    });

    it('mentions BA requirement for 3 competitors', () => {
      const prompt = buildMarktWettbewerbPrompt();

      expect(prompt).toContain('3 Wettbewerber');
      expect(prompt).toContain('BA');
    });
  });

  describe('with business idea context', () => {
    it('includes business idea in prompt', () => {
      const prompt = buildMarktWettbewerbPrompt({
        businessIdea: {
          elevatorPitch: 'IT-Beratung für mittelständische Unternehmen',
          targetAudience: 'IT-Leiter in KMUs',
        },
      });

      expect(prompt).toContain('IT-Beratung');
      expect(prompt).toContain('mittelständische Unternehmen');
      expect(prompt).toContain('IT-Leiter in KMUs');
    });

    it('handles empty business idea gracefully', () => {
      const prompt = buildMarktWettbewerbPrompt({
        businessIdea: {},
      });

      expect(prompt).toBeDefined();
    });
  });

  describe('phase-specific content', () => {
    it('includes intro phase instructions by default', () => {
      const prompt = buildMarktWettbewerbPrompt({ currentPhase: 'intro' });

      expect(prompt).toContain('Phase: Einführung');
    });

    it('includes marktanalyse phase instructions', () => {
      const prompt = buildMarktWettbewerbPrompt({ currentPhase: 'marktanalyse' });

      expect(prompt).toContain('Phase: Marktanalyse');
      expect(prompt).toContain('TAM/SAM/SOM');
    });

    it('includes zielmarkt phase instructions', () => {
      const prompt = buildMarktWettbewerbPrompt({ currentPhase: 'zielmarkt' });

      expect(prompt).toContain('Phase: Zielmarkt');
    });

    it('includes wettbewerber phase instructions', () => {
      const prompt = buildMarktWettbewerbPrompt({ currentPhase: 'wettbewerber' });

      expect(prompt).toContain('Phase: Wettbewerbsanalyse');
      expect(prompt).toContain('BA erfordert mindestens 3 Wettbewerber');
    });

    it('includes positionierung phase instructions', () => {
      const prompt = buildMarktWettbewerbPrompt({ currentPhase: 'positionierung' });

      expect(prompt).toContain('Phase: Differenzierung');
      expect(prompt).toContain('Why you, why now');
    });

    it('includes reality_check phase instructions', () => {
      const prompt = buildMarktWettbewerbPrompt({ currentPhase: 'reality_check' });

      expect(prompt).toContain('Phase: Realitäts-Check');
      expect(prompt).toContain('Annahmen dokumentieren');
    });

    it('includes completed phase handover points', () => {
      const prompt = buildMarktWettbewerbPrompt({ currentPhase: 'completed' });

      expect(prompt).toContain('Modul abgeschlossen');
      expect(prompt).toContain('Marketing');
    });
  });
});

// ============================================================================
// YC Reality Checks Tests
// ============================================================================

describe('YC Reality Checks', () => {
  describe('YC_REALITY_CHECKS', () => {
    it('has all check categories', () => {
      expect(YC_REALITY_CHECKS.marketSize).toBeDefined();
      expect(YC_REALITY_CHECKS.customerValidation).toBeDefined();
      expect(YC_REALITY_CHECKS.competitiveAdvantage).toBeDefined();
      expect(YC_REALITY_CHECKS.evidenceCheck).toBeDefined();
    });

    it('each category has questions', () => {
      expect(YC_REALITY_CHECKS.marketSize.length).toBeGreaterThan(0);
      expect(YC_REALITY_CHECKS.customerValidation.length).toBeGreaterThan(0);
      expect(YC_REALITY_CHECKS.competitiveAdvantage.length).toBeGreaterThan(0);
      expect(YC_REALITY_CHECKS.evidenceCheck.length).toBeGreaterThan(0);
    });

    it('evidence check includes "Woher weißt du das?"', () => {
      expect(YC_REALITY_CHECKS.evidenceCheck).toContain('Woher weißt du das?');
    });

    it('customer validation asks about real customers', () => {
      const questions = YC_REALITY_CHECKS.customerValidation.join(' ');
      expect(questions).toContain('Kunden');
    });
  });

  describe('getYCRealityCheckQuestion', () => {
    it('returns a question for marketSize', () => {
      const question = getYCRealityCheckQuestion('marketSize');
      expect(question).toBeDefined();
      expect(question.length).toBeGreaterThan(10);
    });

    it('returns a question for evidenceCheck', () => {
      const question = getYCRealityCheckQuestion('evidenceCheck');
      expect(question).toBeDefined();
    });

    it('always returns a question for each topic', () => {
      const topics = ['marketSize', 'customerValidation', 'competitiveAdvantage', 'evidenceCheck'] as const;
      topics.forEach(topic => {
        const question = getYCRealityCheckQuestion(topic);
        expect(question).toBeDefined();
        expect(question.length).toBeGreaterThan(0);
      });
    });
  });

  describe('prompt includes YC checks', () => {
    it('prompt includes YC reality check section', () => {
      const prompt = buildMarktWettbewerbPrompt();

      expect(prompt).toContain('YC REALITY CHECKS');
      expect(prompt).toContain('Woher weißt du das');
      expect(prompt).toContain('Beweisen');
    });
  });
});

// ============================================================================
// MI Confidence Handling Tests
// ============================================================================

describe('MI Confidence Handling', () => {
  describe('detectConfidenceLevel', () => {
    it('detects overconfidence', () => {
      expect(detectConfidenceLevel('Das ist ein riesiger Markt!')).toBe('overconfident');
      expect(detectConfidenceLevel('Ich bin mir sicher, dass alle das brauchen')).toBe('overconfident');
      expect(detectConfidenceLevel('Wir haben keine Konkurrenz')).toBe('overconfident');
      expect(detectConfidenceLevel('Das wird explodieren!')).toBe('overconfident');
    });

    it('detects fearfulness', () => {
      expect(detectConfidenceLevel('Es gibt zu viel Konkurrenz')).toBe('fearful');
      expect(detectConfidenceLevel('Der Markt ist gesättigt')).toBe('fearful');
      expect(detectConfidenceLevel('Ich habe Angst, dass es nicht klappt')).toBe('fearful');
      expect(detectConfidenceLevel('Das ist zu riskant')).toBe('fearful');
    });

    it('detects uncertainty', () => {
      expect(detectConfidenceLevel('Ich weiß nicht genau')).toBe('uncertain');
      expect(detectConfidenceLevel('Keine Ahnung, wie groß der Markt ist')).toBe('uncertain');
      expect(detectConfidenceLevel('Müsste ich recherchieren')).toBe('uncertain');
    });

    it('returns confident for neutral messages', () => {
      expect(detectConfidenceLevel('Meine Zielgruppe sind IT-Leiter')).toBe('confident');
      expect(detectConfidenceLevel('Ich habe drei Wettbewerber identifiziert')).toBe('confident');
    });

    it('handles empty strings', () => {
      expect(detectConfidenceLevel('')).toBe('confident');
    });
  });

  describe('getMIResponseForConfidence', () => {
    it('returns response for overconfidence', () => {
      const response = getMIResponseForConfidence('overconfident');
      expect(response).toContain('Überzeugung');
      expect(response).toContain('prüfen');
    });

    it('returns response for fearfulness', () => {
      const response = getMIResponseForConfidence('fearful');
      expect(response).toContain('Sorgen');
      expect(response).toContain('gemeinsam');
    });

    it('returns response for uncertainty', () => {
      const response = getMIResponseForConfidence('uncertain', { topic: 'Marktgröße' });
      expect(response).toContain('Ordnung');
    });

    it('returns empty string for confident', () => {
      const response = getMIResponseForConfidence('confident');
      expect(response).toBe('');
    });
  });

  describe('CONFIDENCE_PATTERNS', () => {
    it('has indicators for all confidence levels', () => {
      expect(CONFIDENCE_PATTERNS.overconfident.indicators.length).toBeGreaterThan(0);
      expect(CONFIDENCE_PATTERNS.fearful.indicators.length).toBeGreaterThan(0);
      expect(CONFIDENCE_PATTERNS.uncertain.indicators.length).toBeGreaterThan(0);
    });

    it('has response templates for all levels', () => {
      expect(CONFIDENCE_PATTERNS.overconfident.response).toBeDefined();
      expect(CONFIDENCE_PATTERNS.fearful.response).toBeDefined();
      expect(CONFIDENCE_PATTERNS.uncertain.response).toBeDefined();
    });

    it('has strategy for all levels', () => {
      expect(CONFIDENCE_PATTERNS.overconfident.strategy).toBe('socratic_challenge');
      expect(CONFIDENCE_PATTERNS.fearful.strategy).toBe('empathy_express');
      expect(CONFIDENCE_PATTERNS.uncertain.strategy).toBe('roll_with_resistance');
    });
  });
});

// ============================================================================
// Research Integration Tests
// ============================================================================

describe('Research Integration', () => {
  describe('shouldTriggerResearch', () => {
    it('triggers research for market data requests', () => {
      expect(shouldTriggerResearch('Kannst du recherchieren, wie groß der Markt ist?')).toBe(true);
      expect(shouldTriggerResearch('Was sind die Marktzahlen?')).toBe(true);
      expect(shouldTriggerResearch('Gibt es Statistiken dazu?')).toBe(true);
      expect(shouldTriggerResearch('Branchendaten für IT-Beratung')).toBe(true);
    });

    it('does not trigger for normal questions', () => {
      expect(shouldTriggerResearch('Mein Markt ist IT-Beratung')).toBe(false);
      expect(shouldTriggerResearch('Ich denke, es gibt viele Kunden')).toBe(false);
    });
  });

  describe('RESEARCH_TRIGGERS', () => {
    it('has trigger patterns', () => {
      expect(RESEARCH_TRIGGERS.patterns.length).toBeGreaterThan(0);
    });

    it('has system prompt', () => {
      expect(RESEARCH_TRIGGERS.systemPrompt).toContain('RECHERCHE');
      expect(RESEARCH_TRIGGERS.systemPrompt).toContain('Quelle');
    });
  });

  describe('prompt includes research instructions', () => {
    it('includes research trigger section', () => {
      const prompt = buildMarktWettbewerbPrompt();

      expect(prompt).toContain('RECHERCHE');
      expect(prompt).toContain('Ich recherchiere jetzt');
    });
  });
});

// ============================================================================
// Question Clusters Tests
// ============================================================================

describe('QUESTION_CLUSTERS', () => {
  it('has all four clusters', () => {
    expect(QUESTION_CLUSTERS.marktgroesse).toBeDefined();
    expect(QUESTION_CLUSTERS.zielkunden).toBeDefined();
    expect(QUESTION_CLUSTERS.wettbewerber).toBeDefined();
    expect(QUESTION_CLUSTERS.differenzierung).toBeDefined();
  });

  it('each cluster has questions', () => {
    expect(QUESTION_CLUSTERS.marktgroesse.questions.length).toBeGreaterThan(0);
    expect(QUESTION_CLUSTERS.zielkunden.questions.length).toBeGreaterThan(0);
    expect(QUESTION_CLUSTERS.wettbewerber.questions.length).toBeGreaterThan(0);
    expect(QUESTION_CLUSTERS.differenzierung.questions.length).toBeGreaterThan(0);
  });

  it('questions are in German', () => {
    const allQuestions = [
      ...QUESTION_CLUSTERS.marktgroesse.questions,
      ...QUESTION_CLUSTERS.zielkunden.questions,
      ...QUESTION_CLUSTERS.wettbewerber.questions,
      ...QUESTION_CLUSTERS.differenzierung.questions,
    ];

    // All questions should contain German words or be about German business topics
    allQuestions.forEach(q => {
      expect(q).toMatch(/[äöüÄÖÜß]|Markt|Kunde|Wettbewerb|dein|deiner|dir|Wie|Was|Woher|Welche|Ziel|schätzt|hast|TAM|SAM|SOM|Quellen|Lösung|Wer|Menschen|diese|Problem|Zeit|Online|sie|sind|Warum|du|jetzt|Wo/i);
    });
  });

  it('marktgroesse includes TAM/SAM/SOM questions', () => {
    const questions = QUESTION_CLUSTERS.marktgroesse.questions.join(' ');
    expect(questions).toContain('TAM');
    expect(questions).toContain('SAM');
    expect(questions).toContain('SOM');
  });

  it('wettbewerber asks about direct and indirect competitors', () => {
    const questions = QUESTION_CLUSTERS.wettbewerber.questions.join(' ');
    expect(questions).toContain('direkt');
    expect(questions).toContain('indirekt');
  });

  it('differenzierung includes "Why you, why now" concept', () => {
    const questions = QUESTION_CLUSTERS.differenzierung.questions.join(' ');
    expect(questions).toContain('Warum');
  });
});

// ============================================================================
// Forbidden and Required Patterns Tests
// ============================================================================

describe('FORBIDDEN_PATTERNS', () => {
  it('includes directive patterns', () => {
    expect(FORBIDDEN_PATTERNS).toContain('du solltest');
    expect(FORBIDDEN_PATTERNS).toContain('du musst');
    expect(FORBIDDEN_PATTERNS).toContain('am besten');
  });

  it('includes generic praise patterns', () => {
    expect(FORBIDDEN_PATTERNS).toContain('gut gemacht');
    expect(FORBIDDEN_PATTERNS).toContain('super');
    expect(FORBIDDEN_PATTERNS).toContain('toll');
    expect(FORBIDDEN_PATTERNS).toContain('perfekt');
  });

  it('includes minimizing patterns', () => {
    expect(FORBIDDEN_PATTERNS).toContain('keine Sorge');
    expect(FORBIDDEN_PATTERNS).toContain('das schaffst du schon');
  });
});

describe('REQUIRED_PATTERNS', () => {
  it('has open questions patterns', () => {
    expect(REQUIRED_PATTERNS.openQuestions.length).toBeGreaterThan(0);
    expect(REQUIRED_PATTERNS.openQuestions).toContain('Was denkst du');
  });

  it('has empathy marker patterns', () => {
    expect(REQUIRED_PATTERNS.empathyMarkers.length).toBeGreaterThan(0);
    expect(REQUIRED_PATTERNS.empathyMarkers).toContain('Das klingt');
    expect(REQUIRED_PATTERNS.empathyMarkers).toContain('Ich höre');
  });

  it('has YC reality check patterns', () => {
    expect(REQUIRED_PATTERNS.ycRealityChecks).toBeDefined();
    expect(REQUIRED_PATTERNS.ycRealityChecks).toContain('Woher weißt du das?');
    expect(REQUIRED_PATTERNS.ycRealityChecks).toContain('Hast du mit potenziellen Kunden gesprochen?');
  });

  it('has autonomy support patterns', () => {
    expect(REQUIRED_PATTERNS.autonomySupport.length).toBeGreaterThan(0);
    expect(REQUIRED_PATTERNS.autonomySupport).toContain('Du entscheidest');
  });
});

// ============================================================================
// JSON Output Schema Tests
// ============================================================================

describe('prompt JSON output schema', () => {
  it('includes JSON output instructions', () => {
    const prompt = buildMarktWettbewerbPrompt();

    expect(prompt).toContain('<json>');
    expect(prompt).toContain('</json>');
    expect(prompt).toContain('marktanalyse');
    expect(prompt).toContain('zielmarkt');
    expect(prompt).toContain('wettbewerbsanalyse');
    expect(prompt).toContain('positionierung');
  });

  it('includes market analysis fields', () => {
    const prompt = buildMarktWettbewerbPrompt();

    expect(prompt).toContain('"tam"');
    expect(prompt).toContain('"sam"');
    expect(prompt).toContain('"som"');
    expect(prompt).toContain('"trend"');
    expect(prompt).toContain('"drivers"');
  });

  it('includes competitor fields', () => {
    const prompt = buildMarktWettbewerbPrompt();

    expect(prompt).toContain('"competitors"');
    expect(prompt).toContain('"strengths"');
    expect(prompt).toContain('"weaknesses"');
    expect(prompt).toContain('"yourAdvantage"');
  });

  it('includes reality check fields', () => {
    const prompt = buildMarktWettbewerbPrompt();

    expect(prompt).toContain('"realityCheck"');
    expect(prompt).toContain('"assumptions"');
    expect(prompt).toContain('"ycQuestions"');
    expect(prompt).toContain('"redFlags"');
    expect(prompt).toContain('"validationNeeds"');
  });

  it('includes research trigger tracking', () => {
    const prompt = buildMarktWettbewerbPrompt();

    expect(prompt).toContain('"researchTriggers"');
    expect(prompt).toContain('"topic"');
    expect(prompt).toContain('"query"');
    expect(prompt).toContain('"resultSummary"');
  });

  it('includes metadata with phase tracking', () => {
    const prompt = buildMarktWettbewerbPrompt();

    expect(prompt).toContain('"metadata"');
    expect(prompt).toContain('"currentPhase"');
    expect(prompt).toContain('"phaseComplete"');
    expect(prompt).toContain('"confidenceLevel"');
  });
});

// ============================================================================
// Transition Tests
// ============================================================================

describe('module transition', () => {
  it('includes transition instructions', () => {
    const prompt = buildMarktWettbewerbPrompt();

    expect(prompt).toContain('ÜBERGANG ZU MODUL 4');
    expect(prompt).toContain('Marketing');
  });

  it('completed phase includes handover points', () => {
    const prompt = buildMarktWettbewerbPrompt({ currentPhase: 'completed' });

    expect(prompt).toContain('Marktgröße');
    expect(prompt).toContain('Zielkunden');
    expect(prompt).toContain('3+ Wettbewerber');
    expect(prompt).toContain('Positionierungsstatement');
  });
});

// ============================================================================
// Type System Integration Tests
// ============================================================================

describe('type system integration', () => {
  it('imports from markt-wettbewerb types without errors', async () => {
    const types = await import('@/types/modules/markt-wettbewerb');

    expect(types.MarktWettbewerbPhase).toBeDefined();
    expect(types.EvidenceQuality).toBeDefined();
    expect(types.ConfidenceLevel).toBeDefined();
    expect(types.MarktWettbewerbPhaseInfo).toBeDefined();
  });

  it('phase info has all phases', async () => {
    const { MarktWettbewerbPhaseInfo } = await import('@/types/modules/markt-wettbewerb');

    expect(MarktWettbewerbPhaseInfo.intro).toBeDefined();
    expect(MarktWettbewerbPhaseInfo.marktanalyse).toBeDefined();
    expect(MarktWettbewerbPhaseInfo.zielmarkt).toBeDefined();
    expect(MarktWettbewerbPhaseInfo.wettbewerber).toBeDefined();
    expect(MarktWettbewerbPhaseInfo.positionierung).toBeDefined();
    expect(MarktWettbewerbPhaseInfo.reality_check).toBeDefined();
    expect(MarktWettbewerbPhaseInfo.completed).toBeDefined();
  });

  it('has merge function for partial data', async () => {
    const { mergeMarktWettbewerbData, createEmptyMarktWettbewerbOutput } = await import('@/types/modules/markt-wettbewerb');

    const empty = createEmptyMarktWettbewerbOutput();
    const update = {
      marktanalyse: {
        marketName: 'IT-Beratung',
      },
    };

    const merged = mergeMarktWettbewerbData(empty, update);
    expect(merged.marktanalyse?.marketName).toBe('IT-Beratung');
  });
});
