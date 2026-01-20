/**
 * Integration Tests for Module 8: SWOT Analysis Prompt and Flow (GZ-701)
 *
 * Tests the complete SWOT module functionality including:
 * - Balanced assessment coaching (not only positives OR negatives)
 * - Cross-reference validation with previous modules
 * - Socratic questioning for over-optimistic users
 * - Appreciative Inquiry for over-pessimistic users
 * - Four quadrants: Strengths, Weaknesses, Opportunities, Threats
 * - Strategic implications through TOWS matrix
 */

import { describe, it, expect } from 'vitest';
import {
  // Main prompt building
  buildSWOTPrompt,

  // Module configuration
  SWOT_MODULE_CONFIG,
  SWOT_PHASE_PATTERNS,
  SWOT_QUESTIONS,
  BALANCE_INTERVENTIONS,

  // Coaching responses
  COACHING_RESPONSES,

  // Confidence detection
  detectSWOTConfidence,

  // Cross-module references
  CROSS_MODULE_REFERENCES,
} from '@/lib/prompts/modules/swot';

import {
  // Types
  SWOTPhase,
  SWOTCategory,
  BalanceLevel,
  ConsistencyLevel,
  PartialSWOTOutput,
  SWOTOutput,
  SWOTItem,

  // Helper functions
  createEmptySWOTOutput,
  isSWOTComplete,
  assessSWOTBalance,
  getBalanceIntervention,
  calculateSWOTCompletion,
  mergeSWOTData,

  // Phase info
  SWOTPhaseInfo,
} from '@/types/modules/swot';

// ============================================================================
// Test Fixtures
// ============================================================================

const createBasicSWOTItem = (content: string): SWOTItem => ({
  content,
  source: 'user_input',
  confidence: 'medium',
  priority: 'medium',
});

const createBalancedSWOTOutput = (): PartialSWOTOutput => ({
  staerken: {
    items: [
      createBasicSWOTItem('Langjährige IT-Erfahrung'),
      createBasicSWOTItem('Starkes Netzwerk in der Branche'),
      createBasicSWOTItem('Gute Kommunikationsfähigkeiten'),
    ],
    completeness: 90,
    coachingNotes: ['Stärken wurden realistisch eingeschätzt'],
  },
  schwaechen: {
    items: [
      createBasicSWOTItem('Wenig Verkaufserfahrung'),
      createBasicSWOTItem('Begrenzte finanzielle Mittel'),
    ],
    completeness: 80,
    coachingNotes: ['Schwächen ehrlich benannt'],
  },
  chancen: {
    items: [
      createBasicSWOTItem('Wachsender Digitalisierungsbedarf'),
      createBasicSWOTItem('Förderprogramme verfügbar'),
    ],
    completeness: 75,
    coachingNotes: ['Chancen realistisch bewertet'],
  },
  risiken: {
    items: [
      createBasicSWOTItem('Starke Konkurrenz am Markt'),
      createBasicSWOTItem('Wirtschaftliche Unsicherheit'),
    ],
    completeness: 70,
    coachingNotes: ['Risiken angemessen berücksichtigt'],
  },
});

const createOverOptimisticSWOTOutput = (): PartialSWOTOutput => ({
  staerken: {
    items: [
      createBasicSWOTItem('Ich bin der beste in meinem Bereich'),
      createBasicSWOTItem('Unschlagbare Expertise'),
      createBasicSWOTItem('Perfekte Lösung für alles'),
      createBasicSWOTItem('Grenzenlose Energie'),
      createBasicSWOTItem('100% Erfolgsgarantie'),
    ],
    completeness: 100,
    coachingNotes: [],
  },
  schwaechen: {
    items: [
      createBasicSWOTItem('Vielleicht zu perfektionistisch'),
    ],
    completeness: 20,
    coachingNotes: [],
  },
  chancen: {
    items: [
      createBasicSWOTItem('Milliardenmarkt wartet nur auf mich'),
      createBasicSWOTItem('Alle wollen meine Lösung'),
      createBasicSWOTItem('Garantierter Erfolg'),
    ],
    completeness: 90,
    coachingNotes: [],
  },
  risiken: {
    items: [],
    completeness: 0,
    coachingNotes: [],
  },
});

const createOverPessimisticSWOTOutput = (): PartialSWOTOutput => ({
  staerken: {
    items: [
      createBasicSWOTItem('Bin pünktlich'),
    ],
    completeness: 30,
    coachingNotes: [],
  },
  schwaechen: {
    items: [
      createBasicSWOTItem('Kann nichts richtig'),
      createBasicSWOTItem('Zu wenig Erfahrung'),
      createBasicSWOTItem('Kein Talent für Business'),
      createBasicSWOTItem('Schlechte Finanzlage'),
      createBasicSWOTItem('Keine Kontakte'),
    ],
    completeness: 100,
    coachingNotes: [],
  },
  chancen: {
    items: [],
    completeness: 0,
    coachingNotes: [],
  },
  risiken: {
    items: [
      createBasicSWOTItem('Alles wird schiefgehen'),
      createBasicSWOTItem('Markt ist gesättigt'),
      createBasicSWOTItem('Konkurrenz ist übermächtig'),
      createBasicSWOTItem('Wirtschaftskrise kommt'),
    ],
    completeness: 95,
    coachingNotes: [],
  },
});

const createPreviousModulesData = () => ({
  gruenderperson: {
    qualifications: ['ITIL', 'Scrum Master'],
    strengths: ['Kommunikation', 'Organisation'],
    experience: '10 Jahre IT-Beratung',
  },
  geschaeftsidee: {
    problem: 'KMUs fehlt IT-Know-how',
    solution: 'Pragmatische IT-Beratung',
    usp: 'Verständliche Sprache, faire Preise',
    targetAudience: 'KMUs 10-50 MA',
  },
  marketing: {
    mainChannel: 'LinkedIn und Networking',
    customerRelationships: 'Langfristige Partnerschaften',
  },
  finanzplanung: {
    breakEven: 'Monat 8',
    keyRisk: 'Liquidität in den ersten 6 Monaten',
  },
});

// ============================================================================
// Module Configuration Tests
// ============================================================================

describe('SWOT Module Configuration', () => {
  describe('SWOT_MODULE_CONFIG', () => {
    it('should have correct module structure', () => {
      expect(SWOT_MODULE_CONFIG.moduleId).toBe('swot');
      expect(SWOT_MODULE_CONFIG.title).toBe('SWOT-Analyse');
      expect(SWOT_MODULE_CONFIG.estimatedDuration).toBe(45);
      expect(SWOT_MODULE_CONFIG.phases.length).toBe(7);
    });

    it('should include all SWOT phases', () => {
      expect(SWOT_MODULE_CONFIG.phases).toContain('staerken');
      expect(SWOT_MODULE_CONFIG.phases).toContain('schwaechen');
      expect(SWOT_MODULE_CONFIG.phases).toContain('chancen');
      expect(SWOT_MODULE_CONFIG.phases).toContain('risiken');
      expect(SWOT_MODULE_CONFIG.phases).toContain('strategien');
      expect(SWOT_MODULE_CONFIG.phases).toContain('validierung');
    });

    it('should have balanced assessment as primary approach', () => {
      expect(SWOT_MODULE_CONFIG.coachingApproach.primary).toBe('Balanced_Assessment');
      expect(SWOT_MODULE_CONFIG.coachingApproach.secondary).toBe('Cross_Reference');
      expect(SWOT_MODULE_CONFIG.coachingApproach.tertiary).toBe('Socratic');
    });

    it('should focus on key areas', () => {
      expect(SWOT_MODULE_CONFIG.coachingApproach.focusAreas).toContain('realistic_assessment');
      expect(SWOT_MODULE_CONFIG.coachingApproach.focusAreas).toContain('balance_maintenance');
      expect(SWOT_MODULE_CONFIG.coachingApproach.focusAreas).toContain('cross_module_consistency');
    });
  });

  describe('SWOT_PHASE_PATTERNS', () => {
    it('should have patterns for all quadrants', () => {
      expect(SWOT_PHASE_PATTERNS.staerken).toBeDefined();
      expect(SWOT_PHASE_PATTERNS.schwaechen).toBeDefined();
      expect(SWOT_PHASE_PATTERNS.chancen).toBeDefined();
      expect(SWOT_PHASE_PATTERNS.risiken).toBeDefined();
    });

    it('should have triggers for each phase', () => {
      Object.values(SWOT_PHASE_PATTERNS).forEach(phase => {
        expect(phase.triggers.length).toBeGreaterThan(0);
        expect(phase.indicators.length).toBeGreaterThan(0);
      });
    });

    it('should include realistic trigger patterns for strengths', () => {
      const triggers = SWOT_PHASE_PATTERNS.staerken.triggers;
      expect(triggers.some(t => t.test('Was kann ich gut'))).toBe(true);
      expect(triggers.some(t => t.test('Meine Stärken sind'))).toBe(true);
    });

    it('should include challenging patterns for weaknesses', () => {
      const triggers = SWOT_PHASE_PATTERNS.schwaechen.triggers;
      expect(triggers.some(t => t.test('Schwächen analysieren'))).toBe(true);
      expect(triggers.some(t => t.test('Verbesserung bedarf'))).toBe(true);
    });
  });
});

// ============================================================================
// Balance Assessment Tests
// ============================================================================

describe('Balance Assessment and Interventions', () => {
  describe('assessSWOTBalance', () => {
    it('should detect balanced SWOT analysis', () => {
      const balancedOutput = createBalancedSWOTOutput();
      const balance = assessSWOTBalance(balancedOutput);
      expect(balance).toBe('balanced');
    });

    it('should detect over-optimistic analysis', () => {
      const overOptimisticOutput = createOverOptimisticSWOTOutput();
      const balance = assessSWOTBalance(overOptimisticOutput);
      expect(balance).toBe('over_optimistic');
    });

    it('should detect over-pessimistic analysis', () => {
      const overPessimisticOutput = createOverPessimisticSWOTOutput();
      const balance = assessSWOTBalance(overPessimisticOutput);
      expect(balance).toBe('over_pessimistic');
    });

    it('should detect insufficient data', () => {
      const emptyOutput = createEmptySWOTOutput();
      const balance = assessSWOTBalance(emptyOutput);
      expect(balance).toBe('insufficient_data');
    });
  });

  describe('getBalanceIntervention', () => {
    it('should provide Socratic questions for over-optimistic users', () => {
      const interventions = getBalanceIntervention('over_optimistic');
      expect(interventions.length).toBeGreaterThan(0);
      expect(interventions.some(i => i.includes('schiefgehen'))).toBe(true);
      expect(interventions.some(i => i.includes('Schwächen'))).toBe(true);
    });

    it('should provide Appreciative Inquiry for over-pessimistic users', () => {
      const interventions = getBalanceIntervention('over_pessimistic');
      expect(interventions.length).toBeGreaterThan(0);
      expect(interventions.some(i => i.includes('Erfolge'))).toBe(true);
      expect(interventions.some(i => i.includes('Stärken'))).toBe(true);
    });

    it('should provide structure guidance for insufficient data', () => {
      const interventions = getBalanceIntervention('insufficient_data');
      expect(interventions.length).toBeGreaterThan(0);
      expect(interventions.some(i => i.includes('systematisch'))).toBe(true);
    });

    it('should provide positive reinforcement for balanced analysis', () => {
      const interventions = getBalanceIntervention('balanced');
      expect(interventions.length).toBeGreaterThan(0);
      expect(interventions.some(i => i.includes('ausgewogen'))).toBe(true);
    });
  });

  describe('BALANCE_INTERVENTIONS', () => {
    it('should have Socratic questions for over-optimistic users', () => {
      const interventions = BALANCE_INTERVENTIONS.over_optimistic;
      expect(interventions.socratic_questions.length).toBeGreaterThan(3);
      expect(interventions.reality_checks.length).toBeGreaterThan(2);

      // Should include challenging questions
      expect(interventions.socratic_questions.some(q =>
        q.includes('schiefgehen') || q.includes('Schwächen')
      )).toBe(true);
    });

    it('should have Appreciative Inquiry for over-pessimistic users', () => {
      const interventions = BALANCE_INTERVENTIONS.over_pessimistic;
      expect(interventions.appreciative_questions.length).toBeGreaterThan(3);
      expect(interventions.strength_anchoring.length).toBeGreaterThan(2);

      // Should include strength-focused questions
      expect(interventions.appreciative_questions.some(q =>
        q.includes('Erfolge') || q.includes('Stärken')
      )).toBe(true);
    });

    it('should have structure prompts for insufficient data', () => {
      const interventions = BALANCE_INTERVENTIONS.insufficient_data;
      expect(interventions.structure_prompts.length).toBeGreaterThan(1);

      expect(interventions.structure_prompts.some(p =>
        p.includes('systematisch') || p.includes('vier')
      )).toBe(true);
    });
  });
});

// ============================================================================
// Cross-Module Reference Tests
// ============================================================================

describe('Cross-Module Reference Functionality', () => {
  describe('CROSS_MODULE_REFERENCES', () => {
    it('should have references for all SWOT quadrants', () => {
      expect(CROSS_MODULE_REFERENCES.staerken).toBeDefined();
      expect(CROSS_MODULE_REFERENCES.schwaechen).toBeDefined();
      expect(CROSS_MODULE_REFERENCES.chancen).toBeDefined();
      expect(CROSS_MODULE_REFERENCES.risiken).toBeDefined();
    });

    it('should reference previous modules for strengths', () => {
      const strengthsRefs = CROSS_MODULE_REFERENCES.staerken;
      expect(strengthsRefs.gruenderperson).toBeDefined();
      expect(strengthsRefs.geschaeftsidee).toBeDefined();
      expect(strengthsRefs.marketing).toBeDefined();

      expect(strengthsRefs.gruenderperson.length).toBeGreaterThan(0);
      expect(strengthsRefs.geschaeftsidee.length).toBeGreaterThan(0);
    });

    it('should reference relevant modules for weaknesses', () => {
      const weaknessesRefs = CROSS_MODULE_REFERENCES.schwaechen;
      expect(weaknessesRefs.organisation).toBeDefined();
      expect(weaknessesRefs.finanzplanung).toBeDefined();
      expect(weaknessesRefs.marketing).toBeDefined();
    });

    it('should reference market analysis for opportunities and threats', () => {
      const opportunitiesRefs = CROSS_MODULE_REFERENCES.chancen;
      const threatsRefs = CROSS_MODULE_REFERENCES.risiken;

      expect(opportunitiesRefs.markt_wettbewerb).toBeDefined();
      expect(threatsRefs.markt_wettbewerb).toBeDefined();
      expect(threatsRefs.finanzplanung).toBeDefined();
    });

    it('should include specific cross-reference questions', () => {
      const strengthsQuestions = CROSS_MODULE_REFERENCES.staerken.gruenderperson;
      expect(strengthsQuestions.some(q => q.includes('Kernkompetenz'))).toBe(true);

      const weaknessQuestions = CROSS_MODULE_REFERENCES.schwaechen.finanzplanung;
      expect(weaknessQuestions.some(q => q.includes('kritischer Punkt'))).toBe(true);
    });
  });
});

// ============================================================================
// Confidence Detection Tests
// ============================================================================

describe('Confidence Level Detection', () => {
  describe('detectSWOTConfidence', () => {
    it('should detect high confidence patterns', () => {
      const highConfidenceMessage = 'Ich bin mir sicher, dass das definitiv meine größte Stärke ist.';
      expect(detectSWOTConfidence(highConfidenceMessage)).toBe('high');
    });

    it('should detect low confidence patterns', () => {
      const lowConfidenceMessage = 'Ich bin unsicher, vielleicht ist das eine Schwäche, weiß nicht genau.';
      expect(detectSWOTConfidence(lowConfidenceMessage)).toBe('low');
    });

    it('should detect defensive patterns as low confidence', () => {
      const defensiveMessage = 'Das ist eigentlich gar nicht so wichtig, spielt keine große Rolle.';
      expect(detectSWOTConfidence(defensiveMessage)).toBe('low');
    });

    it('should default to medium confidence', () => {
      const neutralMessage = 'Das könnte eine Stärke sein, denke ich.';
      expect(detectSWOTConfidence(neutralMessage)).toBe('medium');
    });

    it('should handle empty messages', () => {
      expect(detectSWOTConfidence('')).toBe('medium');
    });
  });
});

// ============================================================================
// Question Clusters Tests
// ============================================================================

describe('SWOT Question Clusters', () => {
  describe('strengths questions', () => {
    it('should have personal strengths questions', () => {
      const questions = SWOT_QUESTIONS.staerken.personal_strengths;
      expect(questions.length).toBeGreaterThan(3);
      expect(questions.some(q => q.includes('außergewöhnlich'))).toBe(true);
      expect(questions.some(q => q.includes('positive Rückmeldungen'))).toBe(true);
    });

    it('should have business strengths questions', () => {
      const questions = SWOT_QUESTIONS.staerken.business_strengths;
      expect(questions.length).toBeGreaterThan(3);
      expect(questions.some(q => q.includes('Unternehmen'))).toBe(true);
      expect(questions.some(q => q.includes('Konkurrenz'))).toBe(true);
    });

    it('should have competitive advantage questions', () => {
      const questions = SWOT_QUESTIONS.staerken.competitive_advantages;
      expect(questions.length).toBeGreaterThan(3);
      expect(questions.some(q => q.includes('kopieren'))).toBe(true);
      expect(questions.some(q => q.includes('Vorsprung'))).toBe(true);
    });
  });

  describe('weaknesses questions', () => {
    it('should have skill gaps questions', () => {
      const questions = SWOT_QUESTIONS.schwaechen.skill_gaps;
      expect(questions.length).toBeGreaterThan(3);
      expect(questions.some(q => q.includes('unsicher'))).toBe(true);
      expect(questions.some(q => q.includes('entwickeln'))).toBe(true);
    });

    it('should have resource limitation questions', () => {
      const questions = SWOT_QUESTIONS.schwaechen.resource_limitations;
      expect(questions.length).toBeGreaterThan(3);
      expect(questions.some(q => q.includes('Ressourcen'))).toBe(true);
      expect(questions.some(q => q.includes('Grenzen'))).toBe(true);
    });

    it('should have organizational challenge questions', () => {
      const questions = SWOT_QUESTIONS.schwaechen.organizational_challenges;
      expect(questions.length).toBeGreaterThan(3);
      expect(questions.some(q => q.includes('Prozesse'))).toBe(true);
    });
  });

  describe('opportunities questions', () => {
    it('should cover market opportunities', () => {
      const questions = SWOT_QUESTIONS.chancen.market_opportunities;
      expect(questions.length).toBeGreaterThan(3);
      expect(questions.some(q => q.includes('Markttrends'))).toBe(true);
      expect(questions.some(q => q.includes('Potenzial'))).toBe(true);
    });

    it('should cover growth potential', () => {
      const questions = SWOT_QUESTIONS.chancen.growth_potential;
      expect(questions.length).toBeGreaterThan(3);
      expect(questions.some(q => q.includes('wachsen'))).toBe(true);
      expect(questions.some(q => q.includes('Märkte'))).toBe(true);
    });

    it('should cover external support', () => {
      const questions = SWOT_QUESTIONS.chancen.external_support;
      expect(questions.length).toBeGreaterThan(3);
      expect(questions.some(q => q.includes('Förder'))).toBe(true);
      expect(questions.some(q => q.includes('Partner'))).toBe(true);
    });
  });

  describe('threats questions', () => {
    it('should cover competitive threats', () => {
      const questions = SWOT_QUESTIONS.risiken.competitive_threats;
      expect(questions.length).toBeGreaterThan(3);
      expect(questions.some(q => q.includes('Konkurrenten'))).toBe(true);
      expect(questions.some(q => q.includes('überholt'))).toBe(true);
    });

    it('should cover market risks', () => {
      const questions = SWOT_QUESTIONS.risiken.market_risks;
      expect(questions.length).toBeGreaterThan(3);
      expect(questions.some(q => q.includes('Marktveränderungen'))).toBe(true);
      expect(questions.some(q => q.includes('Rezession'))).toBe(true);
    });

    it('should cover operational risks', () => {
      const questions = SWOT_QUESTIONS.risiken.operational_risks;
      expect(questions.length).toBeGreaterThan(3);
      expect(questions.some(q => q.includes('Schlüsselpersonen'))).toBe(true);
      expect(questions.some(q => q.includes('Ausfälle'))).toBe(true);
    });
  });
});

// ============================================================================
// Helper Functions Tests
// ============================================================================

describe('Helper Functions', () => {
  describe('createEmptySWOTOutput', () => {
    it('should create valid empty SWOT structure', () => {
      const empty = createEmptySWOTOutput();

      expect(empty.staerken).toBeDefined();
      expect(empty.schwaechen).toBeDefined();
      expect(empty.chancen).toBeDefined();
      expect(empty.risiken).toBeDefined();

      expect(empty.staerken?.items).toEqual([]);
      expect(empty.schwaechen?.items).toEqual([]);
      expect(empty.chancen?.items).toEqual([]);
      expect(empty.risiken?.items).toEqual([]);
    });
  });

  describe('isSWOTComplete', () => {
    it('should return true for complete SWOT', () => {
      const completeOutput = createBalancedSWOTOutput();
      expect(isSWOTComplete(completeOutput)).toBe(true);
    });

    it('should return false for incomplete SWOT', () => {
      const incompleteOutput = createEmptySWOTOutput();
      expect(isSWOTComplete(incompleteOutput)).toBe(false);
    });

    it('should require minimum items per quadrant', () => {
      const partialOutput: PartialSWOTOutput = {
        staerken: { items: [createBasicSWOTItem('Test')], completeness: 30, coachingNotes: [] },
        schwaechen: { items: [], completeness: 0, coachingNotes: [] },
        chancen: { items: [], completeness: 0, coachingNotes: [] },
        risiken: { items: [], completeness: 0, coachingNotes: [] },
      };

      expect(isSWOTComplete(partialOutput)).toBe(false);
    });
  });

  describe('calculateSWOTCompletion', () => {
    it('should calculate 0% for empty SWOT', () => {
      const empty = createEmptySWOTOutput();
      expect(calculateSWOTCompletion(empty)).toBe(0);
    });

    it('should calculate partial completion', () => {
      const partial: PartialSWOTOutput = {
        staerken: { items: [createBasicSWOTItem('Test 1'), createBasicSWOTItem('Test 2')], completeness: 60, coachingNotes: [] },
        schwaechen: { items: [createBasicSWOTItem('Test 3')], completeness: 40, coachingNotes: [] },
        chancen: { items: [], completeness: 0, coachingNotes: [] },
        risiken: { items: [], completeness: 0, coachingNotes: [] },
      };

      const completion = calculateSWOTCompletion(partial);
      expect(completion).toBeGreaterThan(0);
      expect(completion).toBeLessThan(100);
    });

    it('should calculate high completion for full SWOT', () => {
      const balanced = createBalancedSWOTOutput();
      const completion = calculateSWOTCompletion(balanced);
      expect(completion).toBeGreaterThan(70);
    });
  });

  describe('mergeSWOTData', () => {
    it('should merge SWOT data without duplicates', () => {
      const existing: PartialSWOTOutput = {
        staerken: {
          items: [createBasicSWOTItem('Existing strength')],
          completeness: 50,
          coachingNotes: ['Note 1'],
        },
      };

      const update: PartialSWOTOutput = {
        staerken: {
          items: [createBasicSWOTItem('New strength')],
          completeness: 75,
          coachingNotes: ['Note 2'],
        },
        schwaechen: {
          items: [createBasicSWOTItem('New weakness')],
          completeness: 40,
          coachingNotes: ['Note 3'],
        },
      };

      const merged = mergeSWOTData(existing, update);

      expect(merged.staerken?.items?.length).toBe(2);
      expect(merged.staerken?.completeness).toBe(75);
      expect(merged.staerken?.coachingNotes?.length).toBe(2);
      expect(merged.schwaechen?.items?.length).toBe(1);
    });

    it('should not duplicate identical items', () => {
      const item = createBasicSWOTItem('Same content');

      const existing: PartialSWOTOutput = {
        staerken: { items: [item], completeness: 50, coachingNotes: [] },
      };

      const update: PartialSWOTOutput = {
        staerken: { items: [item], completeness: 75, coachingNotes: [] },
      };

      const merged = mergeSWOTData(existing, update);
      expect(merged.staerken?.items?.length).toBe(1);
    });
  });
});

// ============================================================================
// Prompt Building Tests
// ============================================================================

describe('buildSWOTPrompt', () => {
  describe('basic prompt generation', () => {
    it('should build complete SWOT prompt', () => {
      const prompt = buildSWOTPrompt(
        'staerken',
        createEmptySWOTOutput(),
        'Meine größte Stärke ist meine Erfahrung.',
        []
      );

      expect(prompt).toContain('SWOT-Analyse');
      expect(prompt).toContain('Stärken');
      expect(prompt).toContain('Balance-Assessment');
      expect(prompt).toContain('JSON-Format');
    });

    it('should include coaching principles', () => {
      const prompt = buildSWOTPrompt(
        'schwaechen',
        createEmptySWOTOutput(),
        'Ich habe wohl einige Schwächen.',
        []
      );

      expect(prompt).toContain('Balance wahren');
      expect(prompt).toContain('Evidenz einfordern');
      expect(prompt).toContain('Strategische Relevanz');
      expect(prompt).toContain('Cross-Validierung');
    });

    it('should include phase-specific questions', () => {
      const prompt = buildSWOTPrompt(
        'chancen',
        createEmptySWOTOutput(),
        'Welche Chancen sehe ich?',
        []
      );

      expect(prompt).toContain('CHANCEN');
      expect(prompt).toContain('Markttrends');
      expect(prompt).toContain('Potenzial');
    });

    it('should include phase-specific questions for threats', () => {
      const prompt = buildSWOTPrompt(
        'risiken',
        createEmptySWOTOutput(),
        'Was könnte schiefgehen?',
        []
      );

      expect(prompt).toContain('RISIKEN');
      expect(prompt).toContain('schiefgehen');
      expect(prompt).toContain('Geschäftsmodell');
    });
  });

  describe('balance-specific prompts', () => {
    it('should include balance intervention for over-optimistic analysis', () => {
      const overOptimisticOutput = createOverOptimisticSWOTOutput();
      const prompt = buildSWOTPrompt(
        'schwaechen',
        overOptimisticOutput,
        'Ich bin der Beste!',
        []
      );

      expect(prompt).toContain('over_optimistic');
      expect(prompt).toContain('Balance-Intervention erforderlich');
      expect(prompt).toContain('schiefgehen');
    });

    it('should include appreciation for over-pessimistic analysis', () => {
      const overPessimisticOutput = createOverPessimisticSWOTOutput();
      const prompt = buildSWOTPrompt(
        'staerken',
        overPessimisticOutput,
        'Ich kann nichts...',
        []
      );

      expect(prompt).toContain('over_pessimistic');
      expect(prompt).toContain('Erfolge');
      expect(prompt).toContain('Stärken würdigen');
    });

    it('should recognize balanced analysis', () => {
      const balancedOutput = createBalancedSWOTOutput();
      const prompt = buildSWOTPrompt(
        'validierung',
        balancedOutput,
        'Das ist eine realistische Einschätzung.',
        []
      );

      expect(prompt).toContain('balanced');
      expect(prompt).toContain('Gute Balance erreicht');
    });

    it('should provide structure for insufficient data', () => {
      const emptyOutput = createEmptySWOTOutput();
      const prompt = buildSWOTPrompt(
        'intro',
        emptyOutput,
        'Ich weiß nicht, wo ich anfangen soll.',
        []
      );

      expect(prompt).toContain('insufficient_data');
      expect(prompt).toContain('systematisch');
    });
  });

  describe('cross-module integration', () => {
    it('should include cross-module references when previous data available', () => {
      const previousData = createPreviousModulesData();
      const prompt = buildSWOTPrompt(
        'staerken',
        createEmptySWOTOutput(),
        'Was sind meine Stärken?',
        [],
        previousData
      );

      expect(prompt).toContain('Konsistenz-Prüfungen');
      expect(prompt).toContain('GRUENDERPERSON');
      expect(prompt).toContain('Kernkompetenz');
    });

    it('should not break without previous module data', () => {
      const prompt = buildSWOTPrompt(
        'staerken',
        createEmptySWOTOutput(),
        'Was sind meine Stärken?',
        []
      );

      expect(prompt).toContain('SWOT-Analyse');
      expect(prompt).not.toContain('undefined');
      expect(prompt).not.toContain('null');
    });

    it('should reference appropriate modules per quadrant', () => {
      const previousData = createPreviousModulesData();

      // Strengths should reference gruenderperson and geschaeftsidee
      const strengthsPrompt = buildSWOTPrompt(
        'staerken',
        createEmptySWOTOutput(),
        'Test',
        [],
        previousData
      );
      expect(strengthsPrompt).toContain('GRUENDERPERSON');
      expect(strengthsPrompt).toContain('GESCHAEFTSIDEE');

      // Weaknesses should reference organisation and finanzplanung
      const weaknessesPrompt = buildSWOTPrompt(
        'schwaechen',
        createEmptySWOTOutput(),
        'Test',
        [],
        previousData
      );
      expect(weaknessesPrompt).toContain('ORGANISATION') ||
      expect(weaknessesPrompt).toContain('FINANZPLANUNG');
    });
  });
});

// ============================================================================
// Phase Info Tests
// ============================================================================

describe('SWOTPhaseInfo', () => {
  it('should have info for all phases', () => {
    expect(SWOTPhaseInfo.intro).toBeDefined();
    expect(SWOTPhaseInfo.staerken).toBeDefined();
    expect(SWOTPhaseInfo.schwaechen).toBeDefined();
    expect(SWOTPhaseInfo.chancen).toBeDefined();
    expect(SWOTPhaseInfo.risiken).toBeDefined();
    expect(SWOTPhaseInfo.strategien).toBeDefined();
    expect(SWOTPhaseInfo.validierung).toBeDefined();
    expect(SWOTPhaseInfo.completed).toBeDefined();
  });

  it('should have appropriate duration for each phase', () => {
    expect(SWOTPhaseInfo.intro.duration).toBe(5);
    expect(SWOTPhaseInfo.staerken.duration).toBe(10);
    expect(SWOTPhaseInfo.schwaechen.duration).toBe(10);
    expect(SWOTPhaseInfo.chancen.duration).toBe(10);
    expect(SWOTPhaseInfo.risiken.duration).toBe(10);
    expect(SWOTPhaseInfo.strategien.duration).toBe(10);
    expect(SWOTPhaseInfo.validierung.duration).toBe(5);
    expect(SWOTPhaseInfo.completed.duration).toBe(0);
  });

  it('should have appropriate coaching depth', () => {
    expect(SWOTPhaseInfo.intro.coachingDepth).toBe('shallow');
    expect(SWOTPhaseInfo.staerken.coachingDepth).toBe('medium');
    expect(SWOTPhaseInfo.schwaechen.coachingDepth).toBe('medium');
    expect(SWOTPhaseInfo.chancen.coachingDepth).toBe('medium');
    expect(SWOTPhaseInfo.risiken.coachingDepth).toBe('medium');
    expect(SWOTPhaseInfo.strategien.coachingDepth).toBe('medium');
    expect(SWOTPhaseInfo.validierung.coachingDepth).toBe('shallow');
    expect(SWOTPhaseInfo.completed.coachingDepth).toBe('shallow');
  });

  it('should have question clusters for each phase', () => {
    Object.values(SWOTPhaseInfo).forEach(phaseInfo => {
      if (phaseInfo.duration > 0) {
        expect(phaseInfo.questionClusters.length).toBeGreaterThan(0);
      }
    });
  });
});

// ============================================================================
// Integration Scenario Tests
// ============================================================================

describe('SWOT Module Integration Scenarios', () => {
  it('should handle complete balanced SWOT workflow', () => {
    // 1. Start with intro phase
    let currentOutput = createEmptySWOTOutput();
    let balance = assessSWOTBalance(currentOutput);
    expect(balance).toBe('insufficient_data');

    // 2. Add strengths - balanced
    currentOutput.staerken = {
      items: [
        createBasicSWOTItem('Starke IT-Expertise'),
        createBasicSWOTItem('Gutes Netzwerk'),
        createBasicSWOTItem('Kommunikationsstärke'),
      ],
      completeness: 90,
      coachingNotes: [],
    };

    // 3. Add weaknesses - balanced
    currentOutput.schwaechen = {
      items: [
        createBasicSWOTItem('Wenig Verkaufserfahrung'),
        createBasicSWOTItem('Begrenzte Startkapital'),
      ],
      completeness: 80,
      coachingNotes: [],
    };

    // 4. Add opportunities
    currentOutput.chancen = {
      items: [
        createBasicSWOTItem('Digitalisierungstrend'),
        createBasicSWOTItem('Remote-Work Boom'),
      ],
      completeness: 75,
      coachingNotes: [],
    };

    // 5. Add threats
    currentOutput.risiken = {
      items: [
        createBasicSWOTItem('Starke Konkurrenz'),
        createBasicSWOTItem('Wirtschaftliche Unsicherheit'),
      ],
      completeness: 70,
      coachingNotes: [],
    };

    // 6. Verify final balance
    balance = assessSWOTBalance(currentOutput);
    expect(balance).toBe('balanced');

    // 7. Verify completion
    expect(isSWOTComplete(currentOutput)).toBe(true);

    // 8. Verify completion percentage
    const completion = calculateSWOTCompletion(currentOutput);
    expect(completion).toBeGreaterThan(70);
  });

  it('should correct over-optimistic analysis through coaching', () => {
    // 1. Start with over-optimistic SWOT
    let currentOutput = createOverOptimisticSWOTOutput();
    let balance = assessSWOTBalance(currentOutput);
    expect(balance).toBe('over_optimistic');

    // 2. Get intervention
    const interventions = getBalanceIntervention(balance);
    expect(interventions.some(i => i.includes('schiefgehen'))).toBe(true);

    // 3. Build corrective prompt
    const prompt = buildSWOTPrompt(
      'schwaechen',
      currentOutput,
      'Ich bin perfekt, habe keine Schwächen!',
      []
    );
    expect(prompt).toContain('Balance-Intervention erforderlich');
    expect(prompt).toContain('Socratic Questioning');

    // 4. Simulate coaching correction - add realistic weaknesses
    currentOutput.schwaechen = {
      items: [
        createBasicSWOTItem('Wenig Vertriebserfahrung'),
        createBasicSWOTItem('Begrenztes Startbudget'),
        createBasicSWOTItem('Neuer Markt - wenig Erfahrung'),
      ],
      completeness: 80,
      coachingNotes: ['Durch Socratic Questions realistischere Schwächen identifiziert'],
    };

    // 5. Add realistic threats
    currentOutput.risiken = {
      items: [
        createBasicSWOTItem('Etablierte Konkurrenz mit großen Budgets'),
        createBasicSWOTItem('Konjunkturabhängigkeit der Zielkunden'),
      ],
      completeness: 70,
      coachingNotes: ['Realistische Risiken durch gezieltes Nachfragen entwickelt'],
    };

    // 6. Verify improved balance
    balance = assessSWOTBalance(currentOutput);
    expect(balance).toBe('balanced');
  });

  it('should support over-pessimistic user through Appreciative Inquiry', () => {
    // 1. Start with over-pessimistic SWOT
    let currentOutput = createOverPessimisticSWOTOutput();
    let balance = assessSWOTBalance(currentOutput);
    expect(balance).toBe('over_pessimistic');

    // 2. Get AI intervention
    const interventions = getBalanceIntervention(balance);
    expect(interventions.some(i => i.includes('Erfolge'))).toBe(true);

    // 3. Build supportive prompt
    const prompt = buildSWOTPrompt(
      'staerken',
      currentOutput,
      'Ich kann eigentlich nichts...',
      []
    );
    expect(prompt).toContain('Appreciative Inquiry');
    expect(prompt).toContain('Stärken würdigen');

    // 4. Simulate AI-based strength discovery
    currentOutput.staerken = {
      items: [
        createBasicSWOTItem('10 Jahre Berufserfahrung erfolgreich gemeistert'),
        createBasicSWOTItem('Vertrauensvolle Kundenbeziehungen aufgebaut'),
        createBasicSWOTItem('Komplexe Projekte erfolgreich geleitet'),
        createBasicSWOTItem('Team motiviert und entwickelt'),
      ],
      completeness: 95,
      coachingNotes: ['Durch Appreciative Inquiry verborgene Stärken entdeckt'],
    };

    // 5. Add realistic opportunities
    currentOutput.chancen = {
      items: [
        createBasicSWOTItem('Netzwerk aus 10 Jahren kann genutzt werden'),
        createBasicSWOTItem('Markt für erfahrene Berater wächst'),
        createBasicSWOTItem('Referenzen als Vertrauensbasis vorhanden'),
      ],
      completeness: 85,
      coachingNotes: ['Chancen basierend auf entdeckten Stärken entwickelt'],
    };

    // 6. Verify improved balance
    balance = assessSWOTBalance(currentOutput);
    expect(balance).toBe('balanced');
  });

  it('should maintain cross-module consistency', () => {
    const previousData = createPreviousModulesData();
    const currentOutput = createEmptySWOTOutput();

    // 1. Build prompt with cross-module data for strengths
    const strengthsPrompt = buildSWOTPrompt(
      'staerken',
      currentOutput,
      'Was sind meine Stärken?',
      [],
      previousData
    );

    // Should reference previous modules
    expect(strengthsPrompt).toContain('Konsistenz-Prüfungen');
    expect(strengthsPrompt).toContain('ITIL');
    expect(strengthsPrompt).toContain('Kommunikation');

    // 2. Build prompt for weaknesses with financial reference
    const weaknessesPrompt = buildSWOTPrompt(
      'schwaechen',
      currentOutput,
      'Wo bin ich schwach?',
      [],
      previousData
    );

    // Should reference financial planning challenges
    expect(weaknessesPrompt).toContain('Liquidität');

    // 3. Build prompt for opportunities with market data
    const opportunitiesPrompt = buildSWOTPrompt(
      'chancen',
      currentOutput,
      'Welche Chancen gibt es?',
      [],
      previousData
    );

    // Should consider market size and customer segments
    expect(opportunitiesPrompt).toContain('KMUs') ||
    expect(opportunitiesPrompt).toContain('Marktgröße');

    // 4. Verify all prompts maintain consistency
    [strengthsPrompt, weaknessesPrompt, opportunitiesPrompt].forEach(prompt => {
      expect(prompt).toContain('Cross-Validierung');
      expect(prompt).toContain('Konsistenz');
      expect(prompt).not.toContain('undefined');
    });
  });

  it('should progress from incomplete to complete SWOT analysis', () => {
    // 1. Start empty
    let currentOutput = createEmptySWOTOutput();
    expect(calculateSWOTCompletion(currentOutput)).toBe(0);
    expect(isSWOTComplete(currentOutput)).toBe(false);

    // 2. Add some strengths
    currentOutput.staerken = {
      items: [
        createBasicSWOTItem('Erste Stärke'),
        createBasicSWOTItem('Zweite Stärke'),
      ],
      completeness: 60,
      coachingNotes: [],
    };

    let completion = calculateSWOTCompletion(currentOutput);
    expect(completion).toBeGreaterThan(0);
    expect(completion).toBeLessThan(50);
    expect(isSWOTComplete(currentOutput)).toBe(false);

    // 3. Add weaknesses
    currentOutput.schwaechen = {
      items: [
        createBasicSWOTItem('Erste Schwäche'),
        createBasicSWOTItem('Zweite Schwäche'),
      ],
      completeness: 80,
      coachingNotes: [],
    };

    completion = calculateSWOTCompletion(currentOutput);
    expect(completion).toBeGreaterThan(20);
    expect(completion).toBeLessThan(70);

    // 4. Add opportunities and threats
    currentOutput.chancen = {
      items: [
        createBasicSWOTItem('Erste Chance'),
        createBasicSWOTItem('Zweite Chance'),
      ],
      completeness: 75,
      coachingNotes: [],
    };

    currentOutput.risiken = {
      items: [
        createBasicSWOTItem('Erstes Risiko'),
        createBasicSWOTItem('Zweites Risiko'),
      ],
      completeness: 70,
      coachingNotes: [],
    };

    // 5. Verify completion
    completion = calculateSWOTCompletion(currentOutput);
    expect(completion).toBeGreaterThan(70);
    expect(isSWOTComplete(currentOutput)).toBe(true);

    // 6. Add one more strength for balance
    currentOutput.staerken?.items?.push(createBasicSWOTItem('Dritte Stärke'));
    if (currentOutput.staerken) {
      currentOutput.staerken.completeness = 90;
    }

    completion = calculateSWOTCompletion(currentOutput);
    expect(completion).toBeGreaterThan(80);

    const balance = assessSWOTBalance(currentOutput);
    expect(balance).toBe('balanced');
  });
});