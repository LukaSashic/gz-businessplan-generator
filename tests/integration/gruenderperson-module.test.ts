/**
 * Gründerperson Module Integration Tests (GZ-401)
 *
 * Tests for the Gründerperson module prompt system including
 * CBC handling, MI integration, and GROW structure.
 */

import { describe, it, expect } from 'vitest';
import {
  buildGruenderpersonPrompt,
  detectNotQualifiedBelief,
  getNotQualifiedCBCPrompt,
  QUESTION_CLUSTERS,
  NOT_QUALIFIED_BELIEF,
  FORBIDDEN_PATTERNS,
  REQUIRED_PATTERNS,
} from '@/lib/prompts/modules/gruenderperson';
import { CBCStep } from '@/lib/coaching/cbc-reframing';

// ============================================================================
// Prompt Building Tests
// ============================================================================

describe('buildGruenderpersonPrompt', () => {
  describe('basic prompt generation', () => {
    it('generates a prompt without options', () => {
      const prompt = buildGruenderpersonPrompt();

      expect(prompt).toBeDefined();
      expect(prompt.length).toBeGreaterThan(1000);
      expect(prompt).toContain('Greta');
      expect(prompt).toContain('Gründerperson');
    });

    it('includes module goals', () => {
      const prompt = buildGruenderpersonPrompt();

      expect(prompt).toContain('Berufserfahrung');
      expect(prompt).toContain('Qualifikation');
      expect(prompt).toContain('Stärken');
      expect(prompt).toContain('Motivation');
      expect(prompt).toContain('Confidence Statement');
    });

    it('includes GROW structure', () => {
      const prompt = buildGruenderpersonPrompt();

      expect(prompt).toContain('GOAL');
      expect(prompt).toContain('REALITY');
      expect(prompt).toContain('OPTIONS');
      expect(prompt).toContain('WILL');
    });
  });

  describe('with intake strengths', () => {
    it('references strengths from intake in opening', () => {
      const prompt = buildGruenderpersonPrompt({
        intakeStrengths: ['Führungsstärke', 'Kommunikation', 'Problemlösung'],
      });

      expect(prompt).toContain('Führungsstärke');
      expect(prompt).toContain('Kommunikation');
      expect(prompt).toContain('Problemlösung');
      expect(prompt).toContain('Im Intake hast du mir');
    });

    it('handles empty strengths array gracefully', () => {
      const prompt = buildGruenderpersonPrompt({
        intakeStrengths: [],
      });

      expect(prompt).toBeDefined();
      expect(prompt).not.toContain('Im Intake hast du mir');
    });
  });

  describe('with business idea', () => {
    it('includes business idea context', () => {
      const prompt = buildGruenderpersonPrompt({
        businessIdea: 'IT-Beratung für mittelständische Unternehmen',
      });

      expect(prompt).toContain('IT-Beratung');
      expect(prompt).toContain('mittelständische Unternehmen');
    });
  });

  describe('phase-specific content', () => {
    it('includes intro phase instructions by default', () => {
      const prompt = buildGruenderpersonPrompt({ currentPhase: 'intro' });

      expect(prompt).toContain('Phase: Einführung');
      expect(prompt).toContain('Stärken aus Intake referenzieren');
    });

    it('includes berufserfahrung phase instructions', () => {
      const prompt = buildGruenderpersonPrompt({ currentPhase: 'berufserfahrung' });

      expect(prompt).toContain('Phase: Berufserfahrung');
      expect(prompt).toContain('Beruflichen Werdegang verstehen');
    });

    it('includes qualifikation phase instructions', () => {
      const prompt = buildGruenderpersonPrompt({ currentPhase: 'qualifikation' });

      expect(prompt).toContain('Phase: Qualifikation');
      expect(prompt).toContain('Qualifikationen erfassen');
    });

    it('includes motivation phase instructions', () => {
      const prompt = buildGruenderpersonPrompt({ currentPhase: 'motivation' });

      expect(prompt).toContain('Phase: Motivation');
      expect(prompt).toContain('Intrinsische vs. extrinsische');
    });

    it('includes CBC phase instructions', () => {
      const prompt = buildGruenderpersonPrompt({
        currentPhase: 'cbc_processing',
        detectedBelief: 'Ich bin nicht qualifiziert',
      });

      expect(prompt).toContain('CBC');
      expect(prompt).toContain('Limiting Belief');
      expect(prompt).toContain('Ich bin nicht qualifiziert');
    });

    it('includes synthesis phase instructions', () => {
      const prompt = buildGruenderpersonPrompt({ currentPhase: 'synthesis' });

      expect(prompt).toContain('Phase: Synthese');
      expect(prompt).toContain('Confidence Statement');
    });
  });
});

// ============================================================================
// CBC Integration Tests
// ============================================================================

describe('CBC handling for "Ich bin nicht qualifiziert"', () => {
  describe('detectNotQualifiedBelief', () => {
    it('detects canonical phrase', () => {
      expect(detectNotQualifiedBelief('Ich bin nicht qualifiziert')).toBe(true);
    });

    it('detects case-insensitive', () => {
      expect(detectNotQualifiedBelief('ICH BIN NICHT QUALIFIZIERT')).toBe(true);
    });

    it('detects partial phrase', () => {
      expect(detectNotQualifiedBelief('Ich denke, mir fehlt die Qualifikation dafür')).toBe(true);
    });

    it('detects related phrases', () => {
      expect(detectNotQualifiedBelief('Andere sind besser qualifiziert als ich')).toBe(true);
      expect(detectNotQualifiedBelief('Mir fehlt die Erfahrung')).toBe(true);
      expect(detectNotQualifiedBelief('Ich kann das nicht')).toBe(true);
    });

    it('returns false for unrelated messages', () => {
      expect(detectNotQualifiedBelief('Mein Business ist Coaching')).toBe(false);
      expect(detectNotQualifiedBelief('Ich habe 10 Jahre Erfahrung')).toBe(false);
    });
  });

  describe('getNotQualifiedCBCPrompt', () => {
    it('returns identify step prompt', () => {
      const prompt = getNotQualifiedCBCPrompt(CBCStep.IDENTIFY);
      expect(prompt).toContain('qualifiziert');
      expect(prompt).toContain('Was genau meinst du damit');
    });

    it('returns evidence step prompt', () => {
      const prompt = getNotQualifiedCBCPrompt(CBCStep.EVIDENCE);
      expect(prompt).toContain('erreicht');
    });

    it('returns challenge step prompt', () => {
      const prompt = getNotQualifiedCBCPrompt(CBCStep.CHALLENGE);
      expect(prompt).toContain('Freund');
    });

    it('returns reframe step prompt', () => {
      const prompt = getNotQualifiedCBCPrompt(CBCStep.REFRAME);
      expect(prompt).toContain('anders formulieren');
    });

    it('returns action step prompt', () => {
      const prompt = getNotQualifiedCBCPrompt(CBCStep.ACTION);
      expect(prompt).toContain('kleiner Schritt');
    });
  });

  describe('NOT_QUALIFIED_BELIEF aliases', () => {
    it('includes all expected aliases', () => {
      expect(NOT_QUALIFIED_BELIEF.aliases).toContain('ich bin nicht qualifiziert');
      expect(NOT_QUALIFIED_BELIEF.aliases).toContain('mir fehlt die qualifikation');
      expect(NOT_QUALIFIED_BELIEF.aliases).toContain('ich kann das nicht');
      expect(NOT_QUALIFIED_BELIEF.aliases).toContain('mir fehlt die erfahrung');
    });

    it('has CBC steps for all 5 steps', () => {
      expect(NOT_QUALIFIED_BELIEF.cbcSteps.identify).toBeDefined();
      expect(NOT_QUALIFIED_BELIEF.cbcSteps.evidence).toBeDefined();
      expect(NOT_QUALIFIED_BELIEF.cbcSteps.challenge).toBeDefined();
      expect(NOT_QUALIFIED_BELIEF.cbcSteps.reframe).toBeDefined();
      expect(NOT_QUALIFIED_BELIEF.cbcSteps.action).toBeDefined();
    });
  });
});

// ============================================================================
// Question Clusters Tests
// ============================================================================

describe('QUESTION_CLUSTERS', () => {
  it('has all four clusters', () => {
    expect(QUESTION_CLUSTERS.berufserfahrung).toBeDefined();
    expect(QUESTION_CLUSTERS.qualifikation).toBeDefined();
    expect(QUESTION_CLUSTERS.staerken).toBeDefined();
    expect(QUESTION_CLUSTERS.motivation).toBeDefined();
  });

  it('each cluster has questions', () => {
    expect(QUESTION_CLUSTERS.berufserfahrung.questions.length).toBeGreaterThan(0);
    expect(QUESTION_CLUSTERS.qualifikation.questions.length).toBeGreaterThan(0);
    expect(QUESTION_CLUSTERS.staerken.questions.length).toBeGreaterThan(0);
    expect(QUESTION_CLUSTERS.motivation.questions.length).toBeGreaterThan(0);
  });

  it('questions are in German', () => {
    const allQuestions = [
      ...QUESTION_CLUSTERS.berufserfahrung.questions,
      ...QUESTION_CLUSTERS.qualifikation.questions,
      ...QUESTION_CLUSTERS.staerken.questions,
      ...QUESTION_CLUSTERS.motivation.questions,
    ];

    // Check for German content (umlauts or German words)
    allQuestions.forEach(q => {
      expect(q).toMatch(/[äöüÄÖÜß]|Erfahrung|Qualifikation|Stärken|Motivation|Beruf|dein|deiner|dir/);
    });
  });

  it('questions are open questions (start with W-words)', () => {
    const allQuestions = [
      ...QUESTION_CLUSTERS.berufserfahrung.questions,
      ...QUESTION_CLUSTERS.qualifikation.questions,
      ...QUESTION_CLUSTERS.staerken.questions,
      ...QUESTION_CLUSTERS.motivation.questions,
    ];

    // Most questions should start with open question words
    const openStarters = ['Was', 'Wie', 'Welche', 'Woran', 'Erzähl', 'Gab', 'Wenn'];
    const openQuestions = allQuestions.filter(q =>
      openStarters.some(starter => q.startsWith(starter))
    );

    expect(openQuestions.length / allQuestions.length).toBeGreaterThan(0.7);
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
    expect(REQUIRED_PATTERNS.openQuestions).toContain('Wie würdest du');
  });

  it('has empathy marker patterns', () => {
    expect(REQUIRED_PATTERNS.empathyMarkers.length).toBeGreaterThan(0);
    expect(REQUIRED_PATTERNS.empathyMarkers).toContain('Das klingt');
    expect(REQUIRED_PATTERNS.empathyMarkers).toContain('Ich höre');
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
    const prompt = buildGruenderpersonPrompt();

    expect(prompt).toContain('<json>');
    expect(prompt).toContain('</json>');
    expect(prompt).toContain('berufserfahrung');
    expect(prompt).toContain('qualifikation');
    expect(prompt).toContain('staerkenProfil');
    expect(prompt).toContain('motivation');
    expect(prompt).toContain('confidenceStatement');
    expect(prompt).toContain('metadata');
  });

  it('includes phase tracking in metadata', () => {
    const prompt = buildGruenderpersonPrompt();

    expect(prompt).toContain('currentPhase');
    expect(prompt).toContain('phaseComplete');
  });

  it('includes GROW progress tracking', () => {
    const prompt = buildGruenderpersonPrompt();

    expect(prompt).toContain('growProgress');
    expect(prompt).toContain('"goal"');
    expect(prompt).toContain('"reality"');
    expect(prompt).toContain('"options"');
    expect(prompt).toContain('"will"');
  });
});

// ============================================================================
// Transition Tests
// ============================================================================

describe('module transition', () => {
  it('includes transition instructions', () => {
    const prompt = buildGruenderpersonPrompt();

    expect(prompt).toContain('ÜBERGANG ZU MODUL 2');
    expect(prompt).toContain('Geschäftsidee');
  });

  it('completed phase includes handover points', () => {
    const prompt = buildGruenderpersonPrompt({ currentPhase: 'completed' });

    expect(prompt).toContain('Confidence Statement');
    expect(prompt).toContain('Stärken-Profil');
    expect(prompt).toContain('Qualifikations-Assessment');
  });
});

// ============================================================================
// MI Integration Tests
// ============================================================================

describe('MI integration', () => {
  it('includes MI discrepancy development', () => {
    const prompt = buildGruenderpersonPrompt();

    expect(prompt).toContain('Discrepancy');
    expect(prompt).toContain('aktueller Zustand');
    expect(prompt).toContain('gewünschter Zustand');
  });

  it('includes change talk handling', () => {
    const prompt = buildGruenderpersonPrompt();

    expect(prompt).toContain('Change Talk');
    expect(prompt).toContain('Verstärke');
    expect(prompt).toContain('Verankere');
  });

  it('includes sustain talk handling', () => {
    const prompt = buildGruenderpersonPrompt();

    expect(prompt).toContain('Sustain Talk');
    expect(prompt).toContain('Nicht widersprechen');
    expect(prompt).toContain('Normalisieren');
  });
});
