/**
 * Geschäftsidee Module Integration Tests (GZ-402)
 *
 * Tests for the Geschäftsidee module prompt system including
 * Socratic questioning depth levels, Clean Language principles,
 * and YC reality checks.
 */

import { describe, it, expect } from 'vitest';
import {
  buildGeschaeftsideePrompt,
  detectCurrentSocraticDepth,
  isClusterComplete,
  PROBLEM_CLUSTER,
  SOLUTION_CLUSTER,
  AUDIENCE_CLUSTER,
  USP_CLUSTER,
  YC_REALITY_CHECKS,
  FORBIDDEN_PATTERNS,
  REQUIRED_PATTERNS,
} from '@/lib/prompts/modules/geschaeftsidee';
import {
  SocraticDepthInfo,
  GeschaeftsideePhaseInfo,
  createEmptyGeschaeftsideeOutput,
  mergeGeschaeftsideeData,
  isGeschaeftsideeComplete,
  getNextSocraticDepth,
  shouldContinueSocraticExploration,
} from '@/types/modules/geschaeftsidee';

// ============================================================================
// Prompt Building Tests
// ============================================================================

describe('buildGeschaeftsideePrompt', () => {
  describe('basic prompt generation', () => {
    it('generates a prompt without options', () => {
      const prompt = buildGeschaeftsideePrompt();

      expect(prompt).toBeDefined();
      expect(prompt.length).toBeGreaterThan(2000);
      expect(prompt).toContain('Greta');
      expect(prompt).toContain('Geschäftsidee');
      expect(prompt).toContain('Socratic');
    });

    it('includes module goals', () => {
      const prompt = buildGeschaeftsideePrompt();

      expect(prompt).toContain('Problem');
      expect(prompt).toContain('Lösung');
      expect(prompt).toContain('Zielgruppe');
      expect(prompt).toContain('USP');
      expect(prompt).toContain('Reality Check');
    });

    it('includes Socratic depth levels', () => {
      const prompt = buildGeschaeftsideePrompt();

      expect(prompt).toContain('L1: Surface');
      expect(prompt).toContain('L2: Justification');
      expect(prompt).toContain('L3: Assumption');
      expect(prompt).toContain('L4: Evidence');
      expect(prompt).toContain('L5: Alternative');
    });

    it('includes GROW structure', () => {
      const prompt = buildGeschaeftsideePrompt();

      expect(prompt).toContain('GOAL');
      expect(prompt).toContain('REALITY');
      expect(prompt).toContain('OPTIONS');
      expect(prompt).toContain('WILL');
    });
  });

  describe('with business idea context', () => {
    it('includes business idea from previous modules', () => {
      const prompt = buildGeschaeftsideePrompt({
        businessIdea: 'AI-powered business plan generator',
      });

      expect(prompt).toContain('AI-powered');
      expect(prompt).toContain('business plan generator');
    });

    it('includes strengths reference from intake', () => {
      const prompt = buildGeschaeftsideePrompt({
        intakeStrengths: ['analytisch', 'kommunikativ', 'technisch'],
      });

      expect(prompt).toContain('analytisch');
      expect(prompt).toContain('kommunikativ');
      expect(prompt).toContain('technisch');
    });

    it('includes confidence statement reference', () => {
      const prompt = buildGeschaeftsideePrompt({
        confidenceStatement: 'Ich bin der Richtige für dieses Business, weil ich 10 Jahre IT-Erfahrung habe.',
      });

      expect(prompt).toContain('10 Jahre IT-Erfahrung');
    });
  });

  describe('phase-specific content', () => {
    it('includes intro phase instructions by default', () => {
      const prompt = buildGeschaeftsideePrompt({ currentPhase: 'intro' });

      expect(prompt).toContain('Phase: Einführung');
      expect(prompt).toContain('GROW GOAL');
    });

    it('includes problem exploration phase instructions', () => {
      const prompt = buildGeschaeftsideePrompt({
        currentPhase: 'problem_exploration',
        currentDepth: 'L2',
        currentCluster: 'problem',
      });

      expect(prompt).toContain('Problem-Analyse');
      expect(prompt).toContain('L2');
      expect(prompt).toContain('Warum');
    });

    it('includes solution development phase instructions', () => {
      const prompt = buildGeschaeftsideePrompt({ currentPhase: 'solution_development' });

      expect(prompt).toContain('Lösungs-Entwicklung');
    });

    it('includes audience discovery phase instructions', () => {
      const prompt = buildGeschaeftsideePrompt({ currentPhase: 'audience_discovery' });

      expect(prompt).toContain('Zielgruppen-Erkundung');
    });

    it('includes USP development phase instructions', () => {
      const prompt = buildGeschaeftsideePrompt({ currentPhase: 'usp_development' });

      expect(prompt).toContain('USP-Entwicklung');
      expect(prompt).toContain('komplexeste Phase');
    });

    it('includes reality check phase instructions', () => {
      const prompt = buildGeschaeftsideePrompt({ currentPhase: 'reality_check' });

      expect(prompt).toContain('Realitäts-Check');
      expect(prompt).toContain('YC-style');
    });

    it('includes synthesis phase instructions', () => {
      const prompt = buildGeschaeftsideePrompt({ currentPhase: 'synthesis' });

      expect(prompt).toContain('Synthese');
      expect(prompt).toContain('Problem-Solution Fit');
    });
  });
});

// ============================================================================
// Socratic Depth Level Tests
// ============================================================================

describe('Socratic questioning system', () => {
  describe('SocraticDepthInfo', () => {
    it('includes all 5 depth levels', () => {
      expect(SocraticDepthInfo.L1).toBeDefined();
      expect(SocraticDepthInfo.L2).toBeDefined();
      expect(SocraticDepthInfo.L3).toBeDefined();
      expect(SocraticDepthInfo.L4).toBeDefined();
      expect(SocraticDepthInfo.L5).toBeDefined();
    });

    it('has consistent structure for all levels', () => {
      Object.values(SocraticDepthInfo).forEach(level => {
        expect(level.label).toBeDefined();
        expect(level.description).toBeDefined();
        expect(level.example).toBeDefined();
      });
    });

    it('follows progression from surface to deep', () => {
      expect(SocraticDepthInfo.L1.label).toBe('Surface');
      expect(SocraticDepthInfo.L2.label).toBe('Justification');
      expect(SocraticDepthInfo.L3.label).toBe('Assumption');
      expect(SocraticDepthInfo.L4.label).toBe('Evidence');
      expect(SocraticDepthInfo.L5.label).toBe('Alternative');
    });
  });

  describe('getNextSocraticDepth', () => {
    it('progresses through levels correctly', () => {
      expect(getNextSocraticDepth('L1')).toBe('L2');
      expect(getNextSocraticDepth('L2')).toBe('L3');
      expect(getNextSocraticDepth('L3')).toBe('L4');
      expect(getNextSocraticDepth('L4')).toBe('L5');
      expect(getNextSocraticDepth('L5')).toBe(null);
    });
  });

  describe('shouldContinueSocraticExploration', () => {
    it('returns true when more depth is needed', () => {
      expect(shouldContinueSocraticExploration('problem', 'L1', 'L3')).toBe(true);
      expect(shouldContinueSocraticExploration('audience', 'L2', 'L4')).toBe(true);
    });

    it('returns false when target depth is reached', () => {
      expect(shouldContinueSocraticExploration('problem', 'L3', 'L3')).toBe(false);
      expect(shouldContinueSocraticExploration('solution', 'L2', 'L2')).toBe(false);
    });
  });

  describe('detectCurrentSocraticDepth', () => {
    it('detects L1 questions (What)', () => {
      const conversation = ['Was ist das Problem?', 'Beschreib mir die Situation.'];
      expect(detectCurrentSocraticDepth('problem', conversation)).toBe('L1');
    });

    it('detects L2 questions (Why)', () => {
      const conversation = ['Warum ist das problematisch?', 'Was sind die Gründe?'];
      expect(detectCurrentSocraticDepth('problem', conversation)).toBe('L2');
    });

    it('detects L3 questions (What if)', () => {
      const conversation = ['Was wäre, wenn das Problem nicht existierte?'];
      expect(detectCurrentSocraticDepth('problem', conversation)).toBe('L3');
    });

    it('detects L4 questions (Evidence)', () => {
      const conversation = ['Woher weißt du das?', 'Welche Belege hast du?'];
      expect(detectCurrentSocraticDepth('audience', conversation)).toBe('L4');
    });

    it('detects L5 questions (Alternatives)', () => {
      const conversation = ['Welche anderen Möglichkeiten gibt es?'];
      expect(detectCurrentSocraticDepth('usp', conversation)).toBe('L5');
    });
  });
});

// ============================================================================
// Question Clusters Tests
// ============================================================================

describe('question clusters', () => {
  describe('PROBLEM_CLUSTER', () => {
    it('has L1-L3 levels', () => {
      expect(PROBLEM_CLUSTER.L1).toBeDefined();
      expect(PROBLEM_CLUSTER.L2).toBeDefined();
      expect(PROBLEM_CLUSTER.L3).toBeDefined();
      expect(PROBLEM_CLUSTER.targetDepth).toBe('L3');
    });

    it('includes YC reality check questions', () => {
      expect(PROBLEM_CLUSTER.ycQuestions).toContain('Wer hat das Problem WIRKLICH?');
      expect(PROBLEM_CLUSTER.ycQuestions).toContain('Wie oft tritt es auf?');
    });

    it('L1 questions focus on "what"', () => {
      PROBLEM_CLUSTER.L1.questions.forEach(q => {
        expect(q).toMatch(/Was|Beschreib|Wie sieht|Wer oder was/i);
      });
    });

    it('L2 questions focus on "why"', () => {
      PROBLEM_CLUSTER.L2.questions.forEach(q => {
        expect(q).toMatch(/Warum|Was macht|Welche Auswirkungen/i);
      });
    });

    it('L3 questions focus on "what if"', () => {
      PROBLEM_CLUSTER.L3.questions.forEach(q => {
        expect(q).toMatch(/Was wäre|Angenommen|Was könnte|Wie könnte/i);
      });
    });
  });

  describe('SOLUTION_CLUSTER', () => {
    it('has L1-L2 levels (simpler than problem)', () => {
      expect(SOLUTION_CLUSTER.L1).toBeDefined();
      expect(SOLUTION_CLUSTER.L2).toBeDefined();
      expect(SOLUTION_CLUSTER.targetDepth).toBe('L2');
    });

    it('includes reality check questions', () => {
      expect(SOLUTION_CLUSTER.realityChecks).toContain('Ist das technisch machbar? Woher weißt du das?');
      expect(SOLUTION_CLUSTER.realityChecks).toContain('Welche Ressourcen brauchst du dafür?');
    });
  });

  describe('AUDIENCE_CLUSTER', () => {
    it('has L2-L4 levels', () => {
      expect(AUDIENCE_CLUSTER.L2).toBeDefined();
      expect(AUDIENCE_CLUSTER.L3).toBeDefined();
      expect(AUDIENCE_CLUSTER.L4).toBeDefined();
      expect(AUDIENCE_CLUSTER.targetDepth).toBe('L4');
    });

    it('L4 includes YC validation questions', () => {
      expect(AUDIENCE_CLUSTER.L4.ycQuestions).toContain('Kennst du 10 Menschen aus dieser Zielgruppe persönlich?');
      expect(AUDIENCE_CLUSTER.L4.ycQuestions).toContain('Würden sie Geld dafür ausgeben?');
    });
  });

  describe('USP_CLUSTER', () => {
    it('has L3-L5 levels (most complex)', () => {
      expect(USP_CLUSTER.L3).toBeDefined();
      expect(USP_CLUSTER.L4).toBeDefined();
      expect(USP_CLUSTER.L5).toBeDefined();
      expect(USP_CLUSTER.targetDepth).toBe('L5');
    });

    it('includes competitive analysis questions', () => {
      expect(USP_CLUSTER.L4.competitiveQuestions).toContain('Wer macht heute das Gleiche wie du?');
      expect(USP_CLUSTER.L4.competitiveQuestions).toContain('Was ist deren größte Schwäche?');
    });

    it('includes "why founder why now" questions', () => {
      expect(USP_CLUSTER.L5.whyFounderWhyNow).toContain('Warum bist gerade DU der Richtige für diese Lösung?');
      expect(USP_CLUSTER.L5.whyFounderWhyNow).toContain('Warum ist JETZT der richtige Zeitpunkt?');
    });
  });

  describe('isClusterComplete', () => {
    it('returns true when target depth is reached', () => {
      expect(isClusterComplete('problem', 'L3')).toBe(true);
      expect(isClusterComplete('solution', 'L2')).toBe(true);
      expect(isClusterComplete('audience', 'L4')).toBe(true);
      expect(isClusterComplete('usp', 'L5')).toBe(true);
    });

    it('returns false when target depth not reached', () => {
      expect(isClusterComplete('problem', 'L1')).toBe(false);
      expect(isClusterComplete('audience', 'L2')).toBe(false);
      expect(isClusterComplete('usp', 'L3')).toBe(false);
    });
  });
});

// ============================================================================
// YC Reality Checks Tests
// ============================================================================

describe('YC_REALITY_CHECKS', () => {
  it('has all four validation categories', () => {
    expect(YC_REALITY_CHECKS.problemValidation).toBeDefined();
    expect(YC_REALITY_CHECKS.solutionValidation).toBeDefined();
    expect(YC_REALITY_CHECKS.marketValidation).toBeDefined();
    expect(YC_REALITY_CHECKS.founderValidation).toBeDefined();
  });

  it('problem validation includes key YC questions', () => {
    expect(YC_REALITY_CHECKS.problemValidation).toContain('Wer hat das Problem WIRKLICH? Nicht hypothetisch.');
    expect(YC_REALITY_CHECKS.problemValidation).toContain('Wie oft tritt das Problem auf? Täglich? Monatlich?');
  });

  it('solution validation focuses on prototypes and feedback', () => {
    expect(YC_REALITY_CHECKS.solutionValidation).toContain('Hast du schon mal einen Prototyp gebaut?');
    expect(YC_REALITY_CHECKS.solutionValidation).toContain('Hat schon mal jemand deine Lösung ausprobiert?');
  });

  it('market validation emphasizes customer contact', () => {
    expect(YC_REALITY_CHECKS.marketValidation).toContain('Kennst du 10 potenzielle Kunden persönlich?');
    expect(YC_REALITY_CHECKS.marketValidation).toContain('Würden sie Geld dafür ausgeben?');
  });

  it('founder validation focuses on unique advantage', () => {
    expect(YC_REALITY_CHECKS.founderValidation).toContain('Was ist dein unfairer Vorteil?');
    expect(YC_REALITY_CHECKS.founderValidation).toContain('Warum bist DU der Richtige dafür?');
  });
});

// ============================================================================
// Clean Language Patterns Tests
// ============================================================================

describe('Clean Language principles', () => {
  describe('REQUIRED_PATTERNS.cleanLanguage', () => {
    it('uses user words exactly', () => {
      expect(REQUIRED_PATTERNS.cleanLanguage).toContain('Du sagst [user words]. Was genau meinst du mit [user word]?');
      expect(REQUIRED_PATTERNS.cleanLanguage).toContain('Du verwendest das Wort [user word]. Was bedeutet das für dich?');
    });

    it('avoids interpretation', () => {
      expect(REQUIRED_PATTERNS.cleanLanguage).toContain('Erzähl mir mehr über [user concept].');
      expect(REQUIRED_PATTERNS.cleanLanguage).toContain('Wenn du [user phrase] sagst, was ist das für dich?');
    });
  });

  describe('FORBIDDEN_PATTERNS for Clean Language', () => {
    it('forbids presuppositions', () => {
      expect(FORBIDDEN_PATTERNS).toContain('natürlich ist');
      expect(FORBIDDEN_PATTERNS).toContain('offensichtlich ist');
      expect(FORBIDDEN_PATTERNS).toContain('selbstverständlich');
      expect(FORBIDDEN_PATTERNS).toContain('logischerweise');
    });

    it('forbids leading questions', () => {
      expect(FORBIDDEN_PATTERNS).toContain('findest du nicht auch');
      expect(FORBIDDEN_PATTERNS).toContain('ist es nicht so, dass');
      expect(FORBIDDEN_PATTERNS).toContain('würdest du nicht sagen');
    });

    it('forbids assumptions', () => {
      expect(FORBIDDEN_PATTERNS).toContain('alle wissen');
      expect(FORBIDDEN_PATTERNS).toContain('jeder braucht');
      expect(FORBIDDEN_PATTERNS).toContain('niemand will');
    });
  });
});

// ============================================================================
// JSON Output Schema Tests
// ============================================================================

describe('prompt JSON output schema', () => {
  it('includes comprehensive JSON structure', () => {
    const prompt = buildGeschaeftsideePrompt();

    expect(prompt).toContain('<json>');
    expect(prompt).toContain('</json>');
    expect(prompt).toContain('"problem"');
    expect(prompt).toContain('"solution"');
    expect(prompt).toContain('"targetAudience"');
    expect(prompt).toContain('"usp"');
    expect(prompt).toContain('"realityCheck"');
  });

  it('includes metadata with depth tracking', () => {
    const prompt = buildGeschaeftsideePrompt();

    expect(prompt).toContain('"metadata"');
    expect(prompt).toContain('"maxDepthReached"');
    expect(prompt).toContain('"questionClusters"');
    expect(prompt).toContain('"problemDepth"');
    expect(prompt).toContain('"solutionDepth"');
    expect(prompt).toContain('"audienceDepth"');
    expect(prompt).toContain('"uspDepth"');
  });

  it('includes GROW progress tracking', () => {
    const prompt = buildGeschaeftsideePrompt();

    expect(prompt).toContain('"growProgress"');
    expect(prompt).toContain('"goal"');
    expect(prompt).toContain('"reality"');
    expect(prompt).toContain('"options"');
    expect(prompt).toContain('"will"');
  });

  it('includes problem-solution fit scoring', () => {
    const prompt = buildGeschaeftsideePrompt();

    expect(prompt).toContain('"problemSolutionFit"');
    expect(prompt).toContain('"elevatorPitch"');
  });
});

// ============================================================================
// Data Management Tests
// ============================================================================

describe('data management functions', () => {
  describe('createEmptyGeschaeftsideeOutput', () => {
    it('creates valid empty structure', () => {
      const empty = createEmptyGeschaeftsideeOutput();

      expect(empty).toBeDefined();
      expect(empty.metadata?.questionClusters).toBeDefined();
      expect(empty.metadata?.questionClusters?.problemDepth).toBe('L1');
      expect(empty.metadata?.questionClusters?.solutionDepth).toBe('L1');
    });
  });

  describe('mergeGeschaeftsideeData', () => {
    it('merges partial data correctly', () => {
      const existing = createEmptyGeschaeftsideeOutput();
      const update = {
        problem: { description: 'Inefficient processes' },
        elevatorPitch: 'AI solution for efficiency',
      };

      const merged = mergeGeschaeftsideeData(existing, update);

      expect(merged.problem?.description).toBe('Inefficient processes');
      expect(merged.elevatorPitch).toBe('AI solution for efficiency');
      expect(merged.metadata?.questionClusters?.problemDepth).toBe('L1');
    });

    it('preserves existing data when merging', () => {
      const existing = {
        problem: { description: 'Original problem', reasoning: 'Original reasoning' },
        metadata: { questionClusters: { problemDepth: 'L2' as const } },
      };
      const update = {
        problem: { description: 'Updated problem' },
      };

      const merged = mergeGeschaeftsideeData(existing, update);

      expect(merged.problem?.description).toBe('Updated problem');
      expect(merged.problem?.reasoning).toBe('Original reasoning');
      expect(merged.metadata?.questionClusters?.problemDepth).toBe('L2');
    });
  });

  describe('isGeschaeftsideeComplete', () => {
    it('returns false for incomplete data', () => {
      const incomplete = {
        problem: { description: 'Problem' },
        // Missing solution, targetAudience, etc.
      };

      expect(isGeschaeftsideeComplete(incomplete)).toBe(false);
    });

    it('returns true for complete data', () => {
      const complete = {
        problem: { description: 'AI automation problem' },
        solution: { description: 'Smart automation platform' },
        targetAudience: { primaryGroup: 'SMB owners' },
        usp: { proposition: 'Fastest implementation' },
        elevatorPitch: 'AI automation for SMBs',
        problemSolutionFit: 8,
      };

      expect(isGeschaeftsideeComplete(complete)).toBe(true);
    });
  });
});

// ============================================================================
// Phase Management Tests
// ============================================================================

describe('phase management', () => {
  describe('GeschaeftsideePhaseInfo', () => {
    it('includes all phases with metadata', () => {
      expect(GeschaeftsideePhaseInfo.intro).toBeDefined();
      expect(GeschaeftsideePhaseInfo.problem_exploration).toBeDefined();
      expect(GeschaeftsideePhaseInfo.solution_development).toBeDefined();
      expect(GeschaeftsideePhaseInfo.audience_discovery).toBeDefined();
      expect(GeschaeftsideePhaseInfo.usp_development).toBeDefined();
      expect(GeschaeftsideePhaseInfo.reality_check).toBeDefined();
      expect(GeschaeftsideePhaseInfo.synthesis).toBeDefined();
      expect(GeschaeftsideePhaseInfo.completed).toBeDefined();
    });

    it('has consistent structure for all phases', () => {
      Object.values(GeschaeftsideePhaseInfo).forEach(phase => {
        expect(phase.label).toBeDefined();
        expect(phase.duration).toBeTypeOf('number');
        expect(phase.targetDepth).toBeDefined();
        expect(Array.isArray(phase.clusters)).toBe(true);
      });
    });

    it('target depths increase through phases', () => {
      expect(GeschaeftsideePhaseInfo.problem_exploration.targetDepth).toBe('L3');
      expect(GeschaeftsideePhaseInfo.solution_development.targetDepth).toBe('L2');
      expect(GeschaeftsideePhaseInfo.audience_discovery.targetDepth).toBe('L4');
      expect(GeschaeftsideePhaseInfo.usp_development.targetDepth).toBe('L5');
    });
  });
});

// ============================================================================
// Transition Tests
// ============================================================================

describe('module transition', () => {
  it('includes transition instructions', () => {
    const prompt = buildGeschaeftsideePrompt();

    expect(prompt).toContain('ÜBERGANG ZU MODUL 3');
    expect(prompt).toContain('Markt und deine Wettbewerber');
  });

  it('completed phase includes handover requirements', () => {
    const prompt = buildGeschaeftsideePrompt({ currentPhase: 'completed' });

    expect(prompt).toContain('Problem (L1-L3)');
    expect(prompt).toContain('Solution (L1-L2)');
    expect(prompt).toContain('Audience (L2-L4)');
    expect(prompt).toContain('USP (L3-L5)');
  });
});

// ============================================================================
// Mock Conversation Tests
// ============================================================================

describe('mock conversation scenarios', () => {
  describe('problem exploration with Socratic depth', () => {
    it('progresses from L1 to L3 systematically', () => {
      // L1: What is the problem?
      const l1Conversation = ['Das Problem ist, dass kleine Unternehmen ihre Buchhaltung nicht digital haben.'];
      expect(detectCurrentSocraticDepth('problem', l1Conversation)).toBe('L1');

      // L2: Why is this a problem?
      const l2Conversation = [...l1Conversation, 'Warum ist das ein Problem für sie?', 'Es kostet zu viel Zeit und führt zu Fehlern.'];
      expect(detectCurrentSocraticDepth('problem', l2Conversation)).toBe('L2');

      // L3: What if this problem didn't exist?
      const l3Conversation = [...l2Conversation, 'Was wäre, wenn alle ihre Buchhaltung digital hätten?'];
      expect(detectCurrentSocraticDepth('problem', l3Conversation)).toBe('L3');
    });
  });

  describe('YC reality check integration', () => {
    it('includes hard questions about problem validation', () => {
      const prompt = buildGeschaeftsideePrompt({
        currentPhase: 'reality_check',
      });

      // Check that YC questions are included
      expect(prompt).toContain('Wer hat das Problem WIRKLICH?');
      expect(prompt).toContain('10 potenzielle Kunden');
      expect(prompt).toContain('Würden sie Geld dafür ausgeben?');
    });
  });

  describe('Clean Language conversation', () => {
    it('uses user words exactly in follow-ups', () => {
      const prompt = buildGeschaeftsideePrompt();

      // Check Clean Language patterns are present
      expect(prompt).toContain('Du sagst [user words]');
      expect(prompt).toContain('Was genau meinst du mit [user word]');
      expect(prompt).toContain('Erzähl mir mehr über [user concept]');
    });

    it('avoids presuppositions and leading questions', () => {
      const prompt = buildGeschaeftsideePrompt();

      // Verify forbidden patterns are documented
      expect(prompt).toContain('findest du nicht auch');
      expect(prompt).toContain('ist es nicht so, dass');
      expect(prompt).toContain('natürlich ist');
      expect(prompt).toContain('alle wissen');
    });
  });
});