/**
 * Unit Tests for CBC Reframing Module (GZ-207)
 *
 * Tests for Cognitive Behavioral Coaching patterns including:
 * - Limiting belief detection
 * - CBC 5-step response generation
 * - Trigger phrase matching
 * - German language handling (umlauts)
 */

import { describe, it, expect } from 'vitest';
import {
  // Types and Enums
  CBCStep,
  BeliefCategory,
  // Constants
  LIMITING_BELIEFS,
  ALL_LIMITING_BELIEFS,
  // Detection Functions
  detectLimitingBelief,
  detectLimitingBeliefWithDetails,
  hasLimitingBeliefIndicators,
  // Response Generation
  generateCBCResponse,
  getFullCBCSequence,
  // Utility Functions
  getTriggerPhrases,
  getBeliefsByCategory,
  getCBCStepOrder,
} from '@/lib/coaching/cbc-reframing';

// ============================================================================
// Limiting Belief Definitions Tests
// ============================================================================

describe('Limiting Belief Definitions', () => {
  const EXPECTED_BELIEF_IDS = [
    'nicht-verkaeufer',
    'markt-gesaettigt',
    'brauche-erst',
    'alles-verloren',
  ];

  it('should have exactly 4 core limiting beliefs defined', () => {
    expect(Object.keys(LIMITING_BELIEFS)).toHaveLength(4);
  });

  it('should have all expected belief IDs', () => {
    const definedIds = Object.keys(LIMITING_BELIEFS);
    expect(definedIds.sort()).toEqual(EXPECTED_BELIEF_IDS.sort());
  });

  describe.each(EXPECTED_BELIEF_IDS)('Belief: %s', (beliefId) => {
    it('should have required id field matching key', () => {
      const belief = LIMITING_BELIEFS[beliefId];
      expect(belief).toBeDefined();
      expect(belief!.id).toBe(beliefId);
    });

    it('should have a valid category', () => {
      const belief = LIMITING_BELIEFS[beliefId];
      expect(belief).toBeDefined();
      const validCategories = Object.values(BeliefCategory);
      expect(validCategories).toContain(belief!.category);
    });

    it('should have a canonical phrase in German', () => {
      const belief = LIMITING_BELIEFS[beliefId];
      expect(belief).toBeDefined();
      expect(belief!.canonicalPhrase).toBeDefined();
      expect(belief!.canonicalPhrase.length).toBeGreaterThan(0);
    });

    it('should have at least 5 trigger phrases for robust detection', () => {
      const belief = LIMITING_BELIEFS[beliefId];
      expect(belief).toBeDefined();
      expect(belief!.triggerPhrases.length).toBeGreaterThanOrEqual(5);
    });

    it('should have an example reframe', () => {
      const belief = LIMITING_BELIEFS[beliefId];
      expect(belief).toBeDefined();
      expect(belief!.exampleReframe).toBeDefined();
      expect(belief!.exampleReframe.length).toBeGreaterThan(0);
    });

    it('should have at least 2 evidence questions', () => {
      const belief = LIMITING_BELIEFS[beliefId];
      expect(belief).toBeDefined();
      expect(belief!.evidenceQuestions.length).toBeGreaterThanOrEqual(2);
    });

    it('should have at least 2 challenge questions', () => {
      const belief = LIMITING_BELIEFS[beliefId];
      expect(belief).toBeDefined();
      expect(belief!.challengeQuestions.length).toBeGreaterThanOrEqual(2);
    });
  });

  it('ALL_LIMITING_BELIEFS array should match LIMITING_BELIEFS object', () => {
    expect(ALL_LIMITING_BELIEFS).toHaveLength(Object.keys(LIMITING_BELIEFS).length);
    ALL_LIMITING_BELIEFS.forEach((belief) => {
      expect(LIMITING_BELIEFS[belief.id]).toBe(belief);
    });
  });
});

// ============================================================================
// Belief Category Tests
// ============================================================================

describe('Belief Categories', () => {
  it('should have "Ich bin kein Verkäufer" as CAPABILITY_DEFICIT', () => {
    expect(LIMITING_BELIEFS['nicht-verkaeufer']!.category).toBe(BeliefCategory.CAPABILITY_DEFICIT);
  });

  it('should have "Der Markt ist zu gesättigt" as EXTERNAL_LOCUS', () => {
    expect(LIMITING_BELIEFS['markt-gesaettigt']!.category).toBe(BeliefCategory.EXTERNAL_LOCUS);
  });

  it('should have "Ich brauche erst X" as SEQUENTIAL_THINKING', () => {
    expect(LIMITING_BELIEFS['brauche-erst']!.category).toBe(BeliefCategory.SEQUENTIAL_THINKING);
  });

  it('should have "Wenn ich scheitere ist alles verloren" as CATASTROPHIZING', () => {
    expect(LIMITING_BELIEFS['alles-verloren']!.category).toBe(BeliefCategory.CATASTROPHIZING);
  });
});

// ============================================================================
// Detection Tests - "Ich bin kein Verkäufer"
// ============================================================================

describe('detectLimitingBelief - "Ich bin kein Verkäufer"', () => {
  const EXPECTED_BELIEF_ID = 'nicht-verkaeufer';

  it('should detect exact canonical phrase', () => {
    const belief = detectLimitingBelief('Ich bin kein Verkäufer');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect with umlaut variation (ae)', () => {
    const belief = detectLimitingBelief('Ich bin kein Verkaeufer');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect case insensitive', () => {
    const belief = detectLimitingBelief('ICH BIN KEIN VERKÄUFER');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect within longer message', () => {
    const belief = detectLimitingBelief(
      'Ich habe Angst vor der Akquise, weil ich bin kein Verkäufer und mag keine Kaltakquise.'
    );
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect "ich kann nicht verkaufen"', () => {
    const belief = detectLimitingBelief('Ich kann nicht verkaufen, das war nie meine Stärke.');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect "verkaufen liegt mir nicht"', () => {
    const belief = detectLimitingBelief('Verkaufen liegt mir nicht, ich bin eher der technische Typ.');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect "Kaltakquise ist nichts für mich"', () => {
    const belief = detectLimitingBelief('Kaltakquise ist nichts für mich.');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect introversion related statement', () => {
    const belief = detectLimitingBelief('Ich bin introvertiert und mag keine Kundengespräche.');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });
});

// ============================================================================
// Detection Tests - "Der Markt ist zu gesättigt"
// ============================================================================

describe('detectLimitingBelief - "Der Markt ist zu gesättigt"', () => {
  const EXPECTED_BELIEF_ID = 'markt-gesaettigt';

  it('should detect exact canonical phrase', () => {
    const belief = detectLimitingBelief('Der Markt ist zu gesättigt');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect with umlaut variation', () => {
    const belief = detectLimitingBelief('Der Markt ist zu gesaettigt');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect "zu viele Wettbewerber"', () => {
    const belief = detectLimitingBelief('Es gibt zu viele Wettbewerber in diesem Bereich.');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect "zu viel Konkurrenz"', () => {
    const belief = detectLimitingBelief('Da ist einfach zu viel Konkurrenz.');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect "keine Chance gegen die Großen"', () => {
    const belief = detectLimitingBelief('Ich habe keine Chance gegen die Großen in der Branche.');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect "das machen schon andere"', () => {
    const belief = detectLimitingBelief('Das machen schon andere, warum sollte ich noch anfangen?');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });
});

// ============================================================================
// Detection Tests - "Ich brauche erst X"
// ============================================================================

describe('detectLimitingBelief - "Ich brauche erst X"', () => {
  const EXPECTED_BELIEF_ID = 'brauche-erst';

  it('should detect "ich brauche erst"', () => {
    const belief = detectLimitingBelief('Ich brauche erst eine perfekte Website.');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect "ich muss erst"', () => {
    const belief = detectLimitingBelief('Ich muss erst meine Zertifizierung abschließen.');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect "bevor ich anfangen kann"', () => {
    const belief = detectLimitingBelief('Bevor ich anfangen kann, brauche ich mehr Erfahrung.');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect "noch nicht bereit"', () => {
    const belief = detectLimitingBelief('Ich bin noch nicht bereit für den Marktstart.');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect "erst perfekt"', () => {
    const belief = detectLimitingBelief('Das Produkt muss erst perfekt sein.');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect "perfekte Website"', () => {
    const belief = detectLimitingBelief('Ohne eine perfekte Website kann ich nicht starten.');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });
});

// ============================================================================
// Detection Tests - "Wenn ich scheitere ist alles verloren"
// ============================================================================

describe('detectLimitingBelief - "Wenn ich scheitere ist alles verloren"', () => {
  const EXPECTED_BELIEF_ID = 'alles-verloren';

  it('should detect canonical phrase', () => {
    const belief = detectLimitingBelief('Wenn ich scheitere ist alles verloren.');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect "alles verloren"', () => {
    const belief = detectLimitingBelief('Dann ist alles verloren, was ich aufgebaut habe.');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect "alles aufs Spiel"', () => {
    const belief = detectLimitingBelief('Ich setze alles aufs Spiel mit dieser Entscheidung.');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect "existenzielle Angst"', () => {
    const belief = detectLimitingBelief('Ich habe existenzielle Angst vor dem Scheitern.');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect "wenn es nicht klappt"', () => {
    const belief = detectLimitingBelief('Was passiert, wenn es nicht klappt?');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect "Worst Case"', () => {
    const belief = detectLimitingBelief('Im Worst Case bin ich komplett ruiniert.');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });

  it('should detect "Katastrophe"', () => {
    const belief = detectLimitingBelief('Das wäre eine Katastrophe für meine Familie.');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe(EXPECTED_BELIEF_ID);
  });
});

// ============================================================================
// Detection Edge Cases
// ============================================================================

describe('detectLimitingBelief - Edge Cases', () => {
  it('should return null for empty string', () => {
    const belief = detectLimitingBelief('');
    expect(belief).toBeNull();
  });

  it('should return null for whitespace only', () => {
    const belief = detectLimitingBelief('   \n\t  ');
    expect(belief).toBeNull();
  });

  it('should return null for unrelated message', () => {
    const belief = detectLimitingBelief('Ich freue mich auf den Start meines Unternehmens!');
    expect(belief).toBeNull();
  });

  it('should return null for neutral business discussion', () => {
    const belief = detectLimitingBelief('Mein Geschäftsmodell ist B2B Beratung für IT-Unternehmen.');
    expect(belief).toBeNull();
  });

  it('should handle mixed case and special characters', () => {
    const belief = detectLimitingBelief('ICH BRAUCHE ERST eine Website!!!');
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe('brauche-erst');
  });
});

// ============================================================================
// Detection With Details Tests
// ============================================================================

describe('detectLimitingBeliefWithDetails', () => {
  it('should return full detection result with confidence', () => {
    const result = detectLimitingBeliefWithDetails('Ich bin kein Verkäufer');

    expect(result.belief).not.toBeNull();
    expect(result.belief?.id).toBe('nicht-verkaeufer');
    expect(result.confidence).toBeGreaterThan(0);
    expect(result.matchedPhrases.length).toBeGreaterThan(0);
  });

  it('should have higher confidence with multiple matches', () => {
    const singleMatch = detectLimitingBeliefWithDetails('Ich bin kein Verkäufer');
    const multipleMatches = detectLimitingBeliefWithDetails(
      'Ich bin kein Verkäufer und ich kann nicht verkaufen. Kaltakquise ist nichts für mich.'
    );

    expect(multipleMatches.confidence).toBeGreaterThan(singleMatch.confidence);
  });

  it('should return matched phrases', () => {
    const result = detectLimitingBeliefWithDetails('Ich bin kein Verkäufer');

    expect(result.matchedPhrases).toContain('ich bin kein verkäufer');
  });

  it('should return zero confidence for no match', () => {
    const result = detectLimitingBeliefWithDetails('Mein Business ist Coaching.');

    expect(result.belief).toBeNull();
    expect(result.confidence).toBe(0);
    expect(result.matchedPhrases).toHaveLength(0);
  });
});

// ============================================================================
// CBC Response Generation Tests
// ============================================================================

describe('generateCBCResponse', () => {
  it('should generate response for IDENTIFY step', () => {
    const belief = LIMITING_BELIEFS['nicht-verkaeufer'];
    expect(belief).toBeDefined();
    const response = generateCBCResponse(belief!, CBCStep.IDENTIFY);

    expect(response.step).toBe(CBCStep.IDENTIFY);
    expect(response.response).toBeDefined();
    expect(response.response.length).toBeGreaterThan(0);
    expect(response.followUpQuestion).toBeDefined();
    expect(response.nextStep).toBe(CBCStep.EVIDENCE);
  });

  it('should generate response for EVIDENCE step', () => {
    const belief = LIMITING_BELIEFS['nicht-verkaeufer'];
    expect(belief).toBeDefined();
    const response = generateCBCResponse(belief!, CBCStep.EVIDENCE);

    expect(response.step).toBe(CBCStep.EVIDENCE);
    expect(response.response).toContain('Kaltakquise');
    expect(response.followUpQuestion).toContain('überzeugt');
    expect(response.nextStep).toBe(CBCStep.CHALLENGE);
  });

  it('should generate response for CHALLENGE step', () => {
    const belief = LIMITING_BELIEFS['nicht-verkaeufer'];
    expect(belief).toBeDefined();
    const response = generateCBCResponse(belief!, CBCStep.CHALLENGE);

    expect(response.step).toBe(CBCStep.CHALLENGE);
    expect(response.response).toContain('IST Verkaufen');
    expect(response.nextStep).toBe(CBCStep.REFRAME);
  });

  it('should generate response for REFRAME step', () => {
    const belief = LIMITING_BELIEFS['nicht-verkaeufer'];
    expect(belief).toBeDefined();
    const response = generateCBCResponse(belief!, CBCStep.REFRAME);

    expect(response.step).toBe(CBCStep.REFRAME);
    expect(response.response).toContain('anders als durch Kaltakquise');
    expect(response.nextStep).toBe(CBCStep.ACTION);
  });

  it('should generate response for ACTION step with null nextStep', () => {
    const belief = LIMITING_BELIEFS['nicht-verkaeufer'];
    expect(belief).toBeDefined();
    const response = generateCBCResponse(belief!, CBCStep.ACTION);

    expect(response.step).toBe(CBCStep.ACTION);
    expect(response.followUpQuestion).toContain('OHNE Kaltakquise');
    expect(response.nextStep).toBeNull();
  });

  describe('Example from PRD: "Ich bin kein Verkäufer" -> "Hast du schon mal..."', () => {
    it('should include the example reframe question from PRD', () => {
      const belief = LIMITING_BELIEFS['nicht-verkaeufer'];
      expect(belief).toBeDefined();
      const response = generateCBCResponse(belief!, CBCStep.EVIDENCE);

      // PRD says: 'Ich bin kein Verkäufer' → 'Hast du schon mal jemanden von einer Idee überzeugt?'
      expect(response.followUpQuestion).toContain('jemanden von einer Idee überzeugt');
    });
  });
});

// ============================================================================
// Full CBC Sequence Tests
// ============================================================================

describe('getFullCBCSequence', () => {
  it('should return all 5 steps in order', () => {
    const belief = LIMITING_BELIEFS['nicht-verkaeufer'];
    expect(belief).toBeDefined();
    const sequence = getFullCBCSequence(belief!);

    expect(sequence).toHaveLength(5);
    expect(sequence[0]!.step).toBe(CBCStep.IDENTIFY);
    expect(sequence[1]!.step).toBe(CBCStep.EVIDENCE);
    expect(sequence[2]!.step).toBe(CBCStep.CHALLENGE);
    expect(sequence[3]!.step).toBe(CBCStep.REFRAME);
    expect(sequence[4]!.step).toBe(CBCStep.ACTION);
  });

  it('should have linked nextStep values', () => {
    const belief = LIMITING_BELIEFS['markt-gesaettigt'];
    expect(belief).toBeDefined();
    const sequence = getFullCBCSequence(belief!);

    expect(sequence[0]!.nextStep).toBe(CBCStep.EVIDENCE);
    expect(sequence[1]!.nextStep).toBe(CBCStep.CHALLENGE);
    expect(sequence[2]!.nextStep).toBe(CBCStep.REFRAME);
    expect(sequence[3]!.nextStep).toBe(CBCStep.ACTION);
    expect(sequence[4]!.nextStep).toBeNull();
  });

  it('should generate responses for all 4 belief types', () => {
    Object.values(LIMITING_BELIEFS).forEach((belief) => {
      const sequence = getFullCBCSequence(belief);

      expect(sequence).toHaveLength(5);
      sequence.forEach((response) => {
        expect(response.response).toBeDefined();
        expect(response.response.length).toBeGreaterThan(0);
      });
    });
  });
});

// ============================================================================
// CBC Step Order Tests
// ============================================================================

describe('getCBCStepOrder', () => {
  it('should return the 5-step CBC pattern in correct order', () => {
    const steps = getCBCStepOrder();

    expect(steps).toEqual([
      CBCStep.IDENTIFY,
      CBCStep.EVIDENCE,
      CBCStep.CHALLENGE,
      CBCStep.REFRAME,
      CBCStep.ACTION,
    ]);
  });
});

// ============================================================================
// Utility Function Tests
// ============================================================================

describe('getTriggerPhrases', () => {
  it('should return trigger phrases for valid belief ID', () => {
    const phrases = getTriggerPhrases('nicht-verkaeufer');

    expect(phrases.length).toBeGreaterThan(0);
    expect(phrases).toContain('ich bin kein verkäufer');
  });

  it('should return empty array for invalid belief ID', () => {
    const phrases = getTriggerPhrases('invalid-belief');

    expect(phrases).toEqual([]);
  });

  it('should return a copy (not the original array)', () => {
    const phrases1 = getTriggerPhrases('nicht-verkaeufer');
    const phrases2 = getTriggerPhrases('nicht-verkaeufer');

    expect(phrases1).not.toBe(phrases2);
    expect(phrases1).toEqual(phrases2);
  });
});

describe('getBeliefsByCategory', () => {
  it('should return CAPABILITY_DEFICIT beliefs', () => {
    const beliefs = getBeliefsByCategory(BeliefCategory.CAPABILITY_DEFICIT);

    expect(beliefs.length).toBeGreaterThan(0);
    beliefs.forEach((belief) => {
      expect(belief.category).toBe(BeliefCategory.CAPABILITY_DEFICIT);
    });
  });

  it('should return EXTERNAL_LOCUS beliefs', () => {
    const beliefs = getBeliefsByCategory(BeliefCategory.EXTERNAL_LOCUS);

    expect(beliefs.length).toBeGreaterThan(0);
    expect(beliefs[0]!.id).toBe('markt-gesaettigt');
  });

  it('should return SEQUENTIAL_THINKING beliefs', () => {
    const beliefs = getBeliefsByCategory(BeliefCategory.SEQUENTIAL_THINKING);

    expect(beliefs.length).toBeGreaterThan(0);
    expect(beliefs[0]!.id).toBe('brauche-erst');
  });

  it('should return CATASTROPHIZING beliefs', () => {
    const beliefs = getBeliefsByCategory(BeliefCategory.CATASTROPHIZING);

    expect(beliefs.length).toBeGreaterThan(0);
    expect(beliefs[0]!.id).toBe('alles-verloren');
  });
});

describe('hasLimitingBeliefIndicators', () => {
  it('should return true when limiting belief detected', () => {
    expect(hasLimitingBeliefIndicators('Ich bin kein Verkäufer')).toBe(true);
  });

  it('should return false for empty string', () => {
    expect(hasLimitingBeliefIndicators('')).toBe(false);
  });

  it('should return false for unrelated message', () => {
    expect(hasLimitingBeliefIndicators('Guten Tag, ich freue mich!')).toBe(false);
  });

  it('should be a quick check matching any belief', () => {
    expect(hasLimitingBeliefIndicators('Der Markt ist zu gesättigt')).toBe(true);
    expect(hasLimitingBeliefIndicators('Ich brauche erst mehr Erfahrung')).toBe(true);
    expect(hasLimitingBeliefIndicators('Wenn ich scheitere ist alles verloren')).toBe(true);
  });
});

// ============================================================================
// Integration Tests - Complete Flow
// ============================================================================

describe('Complete CBC Flow Integration', () => {
  it('should detect belief and generate full coaching sequence', () => {
    // Step 1: User expresses limiting belief
    const userMessage = 'Ich bin kein Verkäufer und habe Angst vor Kundenakquise.';

    // Step 2: Detect the belief
    const belief = detectLimitingBelief(userMessage);
    expect(belief).not.toBeNull();
    expect(belief?.id).toBe('nicht-verkaeufer');

    // Step 3: Generate the full CBC sequence
    const sequence = getFullCBCSequence(belief!);
    expect(sequence).toHaveLength(5);

    // Step 4: Verify each step has meaningful content
    sequence.forEach((step, index) => {
      expect(step.response.length).toBeGreaterThan(20);
      if (index < 4) {
        expect(step.followUpQuestion).toBeDefined();
        expect(step.followUpQuestion!.length).toBeGreaterThan(10);
      }
    });
  });

  it('should handle market saturation belief flow', () => {
    const userMessage = 'Es gibt zu viele Wettbewerber, der Markt ist gesättigt.';

    const belief = detectLimitingBelief(userMessage);
    expect(belief?.category).toBe(BeliefCategory.EXTERNAL_LOCUS);

    const identifyResponse = generateCBCResponse(belief!, CBCStep.IDENTIFY);
    expect(identifyResponse.response).toContain('gesättigt');

    const reframeResponse = generateCBCResponse(belief!, CBCStep.REFRAME);
    expect(reframeResponse.response).toContain('differenziere');
  });

  it('should handle sequential thinking belief flow', () => {
    const userMessage = 'Ich muss erst meine Website fertig haben.';

    const belief = detectLimitingBelief(userMessage);
    expect(belief?.category).toBe(BeliefCategory.SEQUENTIAL_THINKING);

    const reframeResponse = generateCBCResponse(belief!, CBCStep.REFRAME);
    expect(reframeResponse.response).toContain('Perfekt');
  });

  it('should handle catastrophizing belief flow', () => {
    const userMessage = 'Was wenn alles schief geht und ich alles verloren habe?';

    const belief = detectLimitingBelief(userMessage);
    expect(belief?.category).toBe(BeliefCategory.CATASTROPHIZING);

    const challengeResponse = generateCBCResponse(belief!, CBCStep.CHALLENGE);
    expect(challengeResponse.followUpQuestion).toBeDefined();
  });
});

// ============================================================================
// German Language Handling Tests
// ============================================================================

describe('German Language Handling', () => {
  describe('Umlaut variations', () => {
    it('should match ä and ae interchangeably', () => {
      const withUmlaut = detectLimitingBelief('Verkäufer');
      const withAe = detectLimitingBelief('Verkaeufer');

      // Both should detect or both should not detect
      expect(!!withUmlaut).toBe(!!withAe);
    });

    it('should match ö and oe interchangeably', () => {
      // Test with a phrase containing ö
      const phrase1 = detectLimitingBelief('Der Markt ist überfüllt');
      const phrase2 = detectLimitingBelief('Der Markt ist ueberfuellt');

      expect(!!phrase1).toBe(!!phrase2);
    });

    it('should match ü and ue interchangeably', () => {
      const phrase1 = detectLimitingBelief('Kaltakquise ist nichts für mich');
      const phrase2 = detectLimitingBelief('Kaltakquise ist nichts fuer mich');

      expect(phrase1?.id).toBe(phrase2?.id);
    });
  });

  describe('Case insensitivity', () => {
    it('should detect regardless of case', () => {
      const lower = detectLimitingBelief('ich bin kein verkäufer');
      const upper = detectLimitingBelief('ICH BIN KEIN VERKÄUFER');
      const mixed = detectLimitingBelief('Ich Bin Kein Verkäufer');

      expect(lower?.id).toBe(upper?.id);
      expect(lower?.id).toBe(mixed?.id);
    });
  });
});
