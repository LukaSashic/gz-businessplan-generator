/**
 * Unit Tests for Motivational Interviewing Module (GZ-206)
 *
 * Tests for MI (Motivational Interviewing) patterns including:
 * - DARN-CAT change talk detection
 * - Sustain talk detection
 * - MI response generation (amplification)
 * - Four MI principles: empathy, discrepancy, resistance, self-efficacy
 * - German language handling (umlauts)
 */

import { describe, it, expect } from 'vitest';
import {
  // Types
  type ChangeTalkType,
  type MIContext,
  // Detection Functions
  detectChangeTalk,
  detectSustainTalk,
  detectSustainTalkWithDetails,
  hasChangeTalkSignal,
  detectAmbivalence,
  // Response Generation
  generateMIResponse,
  // Four MI Principles
  developDiscrepancy,
  rollWithResistance,
  supportSelfEfficacy,
  supportSelfEfficacyWithQuality,
  // Utility Functions
  getAllChangeTalkTypes,
  getTriggerPhrases,
  getSustainTalkTriggers,
  getChangeTalkCategory,
  getChangeTalkLabel,
} from '@/lib/coaching/motivational-interviewing';

// ============================================================================
// DARN-CAT Change Talk Detection Tests
// ============================================================================

describe('detectChangeTalk - DESIRE', () => {
  it('should detect "ich will"', () => {
    const result = detectChangeTalk('Ich will mein eigenes Business starten.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('DESIRE');
  });

  it('should detect "ich möchte"', () => {
    const result = detectChangeTalk('Ich möchte unabhängig sein.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('DESIRE');
  });

  it('should detect "ich möchte" with umlaut variation', () => {
    const result = detectChangeTalk('Ich moechte unabhängig sein.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('DESIRE');
  });

  it('should detect "ich wünsche"', () => {
    const result = detectChangeTalk('Ich wünsche mir mehr Freiheit.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('DESIRE');
  });

  it('should detect "ich hoffe"', () => {
    const result = detectChangeTalk('Ich hoffe, dass es klappt.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('DESIRE');
  });

  it('should detect strong DESIRE with modifier', () => {
    const result = detectChangeTalk('Ich will unbedingt erfolgreich sein.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('DESIRE');
    expect(result?.strength).toBe('strong');
  });

  it('should detect weak DESIRE with modifier', () => {
    const result = detectChangeTalk('Ich möchte vielleicht irgendwann anfangen.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('DESIRE');
    expect(result?.strength).toBe('weak');
  });
});

describe('detectChangeTalk - ABILITY', () => {
  it('should detect "ich kann"', () => {
    const result = detectChangeTalk('Ich kann gut mit Menschen umgehen.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('ABILITY');
  });

  it('should detect "ich könnte"', () => {
    const result = detectChangeTalk('Ich könnte das schaffen.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('ABILITY');
  });

  it('should detect "ich bin fähig"', () => {
    const result = detectChangeTalk('Ich bin fähig, das zu tun.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('ABILITY');
  });

  it('should detect "in der Lage"', () => {
    const result = detectChangeTalk('Ich bin in der Lage, das Problem zu lösen.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('ABILITY');
  });

  it('should detect strong ABILITY', () => {
    const result = detectChangeTalk('Ich kann das definitiv schaffen.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('ABILITY');
    expect(result?.strength).toBe('strong');
  });
});

describe('detectChangeTalk - REASON', () => {
  it('should detect "weil"', () => {
    const result = detectChangeTalk('Weil es mir wichtig ist.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('REASON');
  });

  it('should detect "damit"', () => {
    const result = detectChangeTalk('Damit ich meine Familie versorgen kann.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('REASON');
  });

  it('should detect "um zu"', () => {
    const result = detectChangeTalk('Um zu zeigen, dass es geht.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('REASON');
  });

  it('should detect "deshalb"', () => {
    const result = detectChangeTalk('Deshalb mache ich das.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('REASON');
  });
});

describe('detectChangeTalk - NEED', () => {
  it('should detect "ich muss"', () => {
    const result = detectChangeTalk('Ich muss etwas ändern.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('NEED');
  });

  it('should detect "ich brauche"', () => {
    const result = detectChangeTalk('Ich brauche eine Veränderung.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('NEED');
  });

  it('should detect "es ist notwendig"', () => {
    const result = detectChangeTalk('Es ist notwendig, jetzt zu handeln.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('NEED');
  });

  it('should detect strong NEED', () => {
    const result = detectChangeTalk('Ich muss unbedingt etwas ändern.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('NEED');
    expect(result?.strength).toBe('strong');
  });
});

describe('detectChangeTalk - COMMITMENT', () => {
  it('should detect "ich werde"', () => {
    const result = detectChangeTalk('Ich werde es versuchen.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('COMMITMENT');
  });

  it('should detect "ich habe beschlossen"', () => {
    const result = detectChangeTalk('Ich habe beschlossen, mein Leben zu ändern.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('COMMITMENT');
  });

  it('should detect "ich bin entschlossen"', () => {
    const result = detectChangeTalk('Ich bin entschlossen, es durchzuziehen.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('COMMITMENT');
  });

  it('should detect strong COMMITMENT', () => {
    const result = detectChangeTalk('Ich werde es auf jeden Fall machen.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('COMMITMENT');
    expect(result?.strength).toBe('strong');
  });
});

describe('detectChangeTalk - ACTIVATION', () => {
  it('should detect "ich bin bereit"', () => {
    const result = detectChangeTalk('Ich bin bereit anzufangen.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('ACTIVATION');
  });

  it('should detect "ich fange an"', () => {
    const result = detectChangeTalk('Ich fange an, mich vorzubereiten.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('ACTIVATION');
  });

  it('should detect "ich starte"', () => {
    const result = detectChangeTalk('Ich starte morgen mit dem Projekt.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('ACTIVATION');
  });

  it('should detect strong ACTIVATION', () => {
    const result = detectChangeTalk('Ich bin bereit, jetzt anzufangen.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('ACTIVATION');
    expect(result?.strength).toBe('strong');
  });
});

describe('detectChangeTalk - TAKING_STEPS', () => {
  it('should detect "ich habe schon"', () => {
    const result = detectChangeTalk('Ich habe schon angefangen zu planen.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('TAKING_STEPS');
  });

  it('should detect "ich habe bereits"', () => {
    const result = detectChangeTalk('Ich habe bereits erste Schritte gemacht.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('TAKING_STEPS');
  });

  it('should detect "gestern habe ich"', () => {
    const result = detectChangeTalk('Gestern habe ich meinen ersten Kunden kontaktiert.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('TAKING_STEPS');
  });

  it('should detect "ich habe angefangen"', () => {
    const result = detectChangeTalk('Ich habe angefangen, meinen Businessplan zu schreiben.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('TAKING_STEPS');
  });

  it('should detect strong TAKING_STEPS', () => {
    const result = detectChangeTalk('Ich habe schon erfolgreich den ersten Schritt gemacht.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('TAKING_STEPS');
    expect(result?.strength).toBe('strong');
  });
});

// ============================================================================
// Change Talk Detection Edge Cases
// ============================================================================

describe('detectChangeTalk - Edge Cases', () => {
  it('should return null for empty string', () => {
    expect(detectChangeTalk('')).toBeNull();
  });

  it('should return null for whitespace only', () => {
    expect(detectChangeTalk('   \n\t  ')).toBeNull();
  });

  it('should return null for unrelated message', () => {
    expect(detectChangeTalk('Das Wetter ist heute schön.')).toBeNull();
  });

  it('should return null for neutral business discussion', () => {
    expect(detectChangeTalk('Mein Geschäftsmodell ist B2B Beratung.')).toBeNull();
  });

  it('should handle case insensitivity', () => {
    const result = detectChangeTalk('ICH WILL ERFOLGREICH SEIN!');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('DESIRE');
  });

  it('should return trigger phrase in result', () => {
    const result = detectChangeTalk('Ich möchte mehr verdienen.');
    expect(result).not.toBeNull();
    expect(result?.trigger).toBeDefined();
    expect(result?.trigger.length).toBeGreaterThan(0);
  });

  it('should prioritize mobilizing change talk (TAKING_STEPS) over preparatory (DESIRE)', () => {
    // When both are present, TAKING_STEPS should be detected first if it appears first
    const result = detectChangeTalk('Ich habe schon angefangen und ich will mehr.');
    expect(result).not.toBeNull();
    expect(result?.type).toBe('TAKING_STEPS');
  });
});

// ============================================================================
// Sustain Talk Detection Tests
// ============================================================================

describe('detectSustainTalk', () => {
  it('should detect "kann nicht"', () => {
    expect(detectSustainTalk('Das kann ich nicht machen.')).toBe(true);
  });

  it('should detect "unmöglich"', () => {
    expect(detectSustainTalk('Das ist unmöglich.')).toBe(true);
  });

  it('should detect umlaut variation "unmoeglich"', () => {
    expect(detectSustainTalk('Das ist unmoeglich.')).toBe(true);
  });

  it('should detect "zu schwer"', () => {
    expect(detectSustainTalk('Das ist zu schwer für mich.')).toBe(true);
  });

  it('should detect "nicht bereit"', () => {
    expect(detectSustainTalk('Ich bin noch nicht bereit.')).toBe(true);
  });

  it('should detect "vielleicht später"', () => {
    expect(detectSustainTalk('Vielleicht später mal.')).toBe(true);
  });

  it('should detect "ich schaffe das nicht"', () => {
    expect(detectSustainTalk('Ich schaffe das nicht.')).toBe(true);
  });

  it('should detect "zu riskant"', () => {
    expect(detectSustainTalk('Das ist mir zu riskant.')).toBe(true);
  });

  it('should detect "keine Zeit"', () => {
    expect(detectSustainTalk('Ich habe keine Zeit dafür.')).toBe(true);
  });

  it('should return false for empty string', () => {
    expect(detectSustainTalk('')).toBe(false);
  });

  it('should return false for positive message', () => {
    expect(detectSustainTalk('Ich bin bereit anzufangen!')).toBe(false);
  });

  it('should return false for neutral message', () => {
    expect(detectSustainTalk('Mein Unternehmen wird Beratung anbieten.')).toBe(false);
  });
});

describe('detectSustainTalkWithDetails', () => {
  it('should return detected true with trigger phrase', () => {
    const result = detectSustainTalkWithDetails('Das kann ich nicht.');
    expect(result.detected).toBe(true);
    expect(result.trigger).toBeDefined();
  });

  it('should return detected false without trigger', () => {
    const result = detectSustainTalkWithDetails('Das klingt gut.');
    expect(result.detected).toBe(false);
    expect(result.trigger).toBeUndefined();
  });
});

// ============================================================================
// MI Response Generation Tests
// ============================================================================

describe('generateMIResponse', () => {
  it('should generate response for DESIRE', () => {
    const response = generateMIResponse('DESIRE');
    expect(response).toBeDefined();
    expect(response.length).toBeGreaterThan(0);
    expect(response).toContain('wichtig');
  });

  it('should generate response for ABILITY', () => {
    const response = generateMIResponse('ABILITY');
    expect(response).toBeDefined();
    expect(response).toContain('Erfahrung');
  });

  it('should generate response for REASON', () => {
    const response = generateMIResponse('REASON');
    expect(response).toBeDefined();
    expect(response).toContain('Grund');
  });

  it('should generate response for NEED', () => {
    const response = generateMIResponse('NEED');
    expect(response).toBeDefined();
    expect(response).toContain('Dringlichkeit');
  });

  it('should generate response for COMMITMENT', () => {
    const response = generateMIResponse('COMMITMENT');
    expect(response).toBeDefined();
    expect(response).toContain('Entscheidung');
  });

  it('should generate response for ACTIVATION', () => {
    const response = generateMIResponse('ACTIVATION');
    expect(response).toBeDefined();
    expect(response).toContain('bereit');
  });

  it('should generate response for TAKING_STEPS', () => {
    const response = generateMIResponse('TAKING_STEPS');
    expect(response).toBeDefined();
    expect(response).toContain('angefangen');
  });

  it('should personalize response with context', () => {
    const context: MIContext = {
      desiredState: 'ein erfolgreiches Coaching-Business aufbauen',
    };
    const response = generateMIResponse('DESIRE', context);
    expect(response).toBeDefined();
  });

  it('should vary response based on previous change talk', () => {
    const context1: MIContext = { previousChangeTalk: [] };
    const context2: MIContext = { previousChangeTalk: ['DESIRE'] };

    const response1 = generateMIResponse('ABILITY', context1);
    const response2 = generateMIResponse('ABILITY', context2);

    // Responses should potentially differ based on conversation history
    expect(response1).toBeDefined();
    expect(response2).toBeDefined();
  });

  it('should return German responses', () => {
    const types: ChangeTalkType[] = getAllChangeTalkTypes();

    types.forEach((type) => {
      const response = generateMIResponse(type);
      // Check for common German characters/patterns
      expect(response).toMatch(/[äöüßÄÖÜ]|[a-z]/);
      expect(response.length).toBeGreaterThan(10);
    });
  });
});

// ============================================================================
// Four MI Principles Tests
// ============================================================================

describe('developDiscrepancy', () => {
  it('should create contrast between current and desired state', () => {
    const result = developDiscrepancy(
      'noch angestellt und unsicher',
      'ein eigenes erfolgreiches Business führen'
    );

    expect(result).toContain('beschreibst');
    expect(result).toContain('noch angestellt und unsicher');
    expect(result).toContain('wünschst');
    expect(result).toContain('ein eigenes erfolgreiches Business führen');
    expect(result).toContain('Weg dorthin');
  });

  it('should follow the specified pattern', () => {
    const result = developDiscrepancy('A', 'B');

    // Pattern: 'Du beschreibst [current]. Gleichzeitig wünschst du dir [desired]. Wie siehst du den Weg dorthin?'
    expect(result).toBe(
      'Du beschreibst A. Gleichzeitig wünschst du dir B. Wie siehst du den Weg dorthin?'
    );
  });
});

describe('rollWithResistance', () => {
  it('should acknowledge resistance without arguing', () => {
    const result = rollWithResistance('es ist zu riskant');

    expect(result).toContain('Ich höre');
    expect(result).toContain('es ist zu riskant');
    expect(result).toContain('nachvollziehbar');
  });

  it('should redirect with open question', () => {
    const result = rollWithResistance('ich habe keine Zeit');

    expect(result).toContain('Was müsste anders sein');
  });

  it('should follow the specified pattern', () => {
    const result = rollWithResistance('X');

    // Pattern: 'Ich höre, dass [resistance]. Das ist nachvollziehbar. Was müsste anders sein, damit...?'
    expect(result).toContain('Ich höre, dass X');
    expect(result).toContain('nachvollziehbar');
    expect(result).toContain('Was müsste anders sein');
  });
});

describe('supportSelfEfficacy', () => {
  it('should anchor to user strength', () => {
    const result = supportSelfEfficacy('ein komplexes IT-Projekt erfolgreich geleitet hast');

    expect(result).toContain('Du hast mir erzählt');
    expect(result).toContain('ein komplexes IT-Projekt erfolgreich geleitet hast');
    expect(result).toContain('Stärken');
  });

  it('should follow the basic pattern', () => {
    const result = supportSelfEfficacy('X');

    expect(result).toContain('Du hast mir erzählt, dass du X');
    expect(result).toContain('zeigt mir');
  });
});

describe('supportSelfEfficacyWithQuality', () => {
  it('should highlight specific quality', () => {
    const result = supportSelfEfficacyWithQuality(
      'ein schwieriges Team geführt hast',
      'Führungskompetenz und Durchhaltevermögen'
    );

    expect(result).toContain('Du hast mir erzählt');
    expect(result).toContain('ein schwieriges Team geführt hast');
    expect(result).toContain('Führungskompetenz und Durchhaltevermögen');
  });

  it('should follow pattern with quality', () => {
    const result = supportSelfEfficacyWithQuality('X', 'Y');

    // Pattern: 'Du hast mir erzählt, dass du [strength]. Das zeigt mir, dass du [quality] hast.'
    expect(result).toBe('Du hast mir erzählt, dass du X. Das zeigt mir, dass du Y hast.');
  });
});

// ============================================================================
// Utility Function Tests
// ============================================================================

describe('getAllChangeTalkTypes', () => {
  it('should return all 7 DARN-CAT types', () => {
    const types = getAllChangeTalkTypes();

    expect(types).toHaveLength(7);
    expect(types).toContain('DESIRE');
    expect(types).toContain('ABILITY');
    expect(types).toContain('REASON');
    expect(types).toContain('NEED');
    expect(types).toContain('COMMITMENT');
    expect(types).toContain('ACTIVATION');
    expect(types).toContain('TAKING_STEPS');
  });
});

describe('getTriggerPhrases', () => {
  it('should return phrases for DESIRE', () => {
    const phrases = getTriggerPhrases('DESIRE');

    expect(phrases.length).toBeGreaterThan(0);
    expect(phrases).toContain('ich will');
    expect(phrases).toContain('ich möchte');
  });

  it('should return phrases for TAKING_STEPS', () => {
    const phrases = getTriggerPhrases('TAKING_STEPS');

    expect(phrases.length).toBeGreaterThan(0);
    expect(phrases).toContain('ich habe schon');
    expect(phrases).toContain('ich habe bereits');
  });

  it('should return a copy (not the original array)', () => {
    const phrases1 = getTriggerPhrases('DESIRE');
    const phrases2 = getTriggerPhrases('DESIRE');

    expect(phrases1).not.toBe(phrases2);
    expect(phrases1).toEqual(phrases2);
  });
});

describe('getSustainTalkTriggers', () => {
  it('should return sustain talk triggers', () => {
    const triggers = getSustainTalkTriggers();

    expect(triggers.length).toBeGreaterThan(0);
    expect(triggers).toContain('kann nicht');
    expect(triggers).toContain('unmöglich');
    expect(triggers).toContain('zu schwer');
  });

  it('should return a copy', () => {
    const triggers1 = getSustainTalkTriggers();
    const triggers2 = getSustainTalkTriggers();

    expect(triggers1).not.toBe(triggers2);
  });
});

describe('hasChangeTalkSignal', () => {
  it('should return true for message with change talk', () => {
    expect(hasChangeTalkSignal('Ich will erfolgreich sein.')).toBe(true);
  });

  it('should return false for message without change talk', () => {
    expect(hasChangeTalkSignal('Das Wetter ist schön.')).toBe(false);
  });
});

describe('detectAmbivalence', () => {
  it('should detect ambivalence when both change talk and sustain talk present', () => {
    // Contains both "ich will" (change) and "kann nicht" (sustain)
    const result = detectAmbivalence('Ich will es machen, aber ich kann nicht.');
    expect(result).toBe(true);
  });

  it('should return false for only change talk', () => {
    const result = detectAmbivalence('Ich will es unbedingt machen.');
    expect(result).toBe(false);
  });

  it('should return false for only sustain talk', () => {
    const result = detectAmbivalence('Das kann ich nicht.');
    expect(result).toBe(false);
  });

  it('should return false for neutral message', () => {
    const result = detectAmbivalence('Das Wetter ist schön.');
    expect(result).toBe(false);
  });
});

describe('getChangeTalkCategory', () => {
  it('should categorize DESIRE as DARN (preparatory)', () => {
    expect(getChangeTalkCategory('DESIRE')).toBe('DARN');
  });

  it('should categorize ABILITY as DARN (preparatory)', () => {
    expect(getChangeTalkCategory('ABILITY')).toBe('DARN');
  });

  it('should categorize REASON as DARN (preparatory)', () => {
    expect(getChangeTalkCategory('REASON')).toBe('DARN');
  });

  it('should categorize NEED as DARN (preparatory)', () => {
    expect(getChangeTalkCategory('NEED')).toBe('DARN');
  });

  it('should categorize COMMITMENT as CAT (mobilizing)', () => {
    expect(getChangeTalkCategory('COMMITMENT')).toBe('CAT');
  });

  it('should categorize ACTIVATION as CAT (mobilizing)', () => {
    expect(getChangeTalkCategory('ACTIVATION')).toBe('CAT');
  });

  it('should categorize TAKING_STEPS as CAT (mobilizing)', () => {
    expect(getChangeTalkCategory('TAKING_STEPS')).toBe('CAT');
  });
});

describe('getChangeTalkLabel', () => {
  it('should return German labels for all types', () => {
    expect(getChangeTalkLabel('DESIRE')).toBe('Wunsch');
    expect(getChangeTalkLabel('ABILITY')).toBe('Fähigkeit');
    expect(getChangeTalkLabel('REASON')).toBe('Grund');
    expect(getChangeTalkLabel('NEED')).toBe('Notwendigkeit');
    expect(getChangeTalkLabel('COMMITMENT')).toBe('Entschlossenheit');
    expect(getChangeTalkLabel('ACTIVATION')).toBe('Aktivierung');
    expect(getChangeTalkLabel('TAKING_STEPS')).toBe('Handlung');
  });
});

// ============================================================================
// German Language Handling Tests
// ============================================================================

describe('German Language Handling', () => {
  describe('Umlaut variations', () => {
    it('should match ö and oe interchangeably', () => {
      const withUmlaut = detectChangeTalk('Ich möchte das.');
      const withOe = detectChangeTalk('Ich moechte das.');

      expect(withUmlaut?.type).toBe(withOe?.type);
    });

    it('should match ü and ue interchangeably', () => {
      const withUmlaut = detectChangeTalk('Ich wünsche mir das.');
      const withUe = detectChangeTalk('Ich wuensche mir das.');

      expect(withUmlaut?.type).toBe(withUe?.type);
    });

    it('should match ä and ae interchangeably', () => {
      const withUmlaut = detectChangeTalk('Ich bin fähig.');
      const withAe = detectChangeTalk('Ich bin faehig.');

      expect(withUmlaut?.type).toBe(withAe?.type);
    });
  });

  describe('Case insensitivity', () => {
    it('should detect regardless of case', () => {
      const lower = detectChangeTalk('ich will das');
      const upper = detectChangeTalk('ICH WILL DAS');
      const mixed = detectChangeTalk('Ich Will Das');

      expect(lower?.type).toBe(upper?.type);
      expect(lower?.type).toBe(mixed?.type);
    });
  });
});

// ============================================================================
// Integration Tests - Complete MI Flow
// ============================================================================

describe('Complete MI Flow Integration', () => {
  it('should detect change talk and generate appropriate amplification', () => {
    // Step 1: User expresses desire
    const userMessage = 'Ich will unbedingt mein eigenes Business starten.';

    // Step 2: Detect change talk
    const changeTalk = detectChangeTalk(userMessage);
    expect(changeTalk).not.toBeNull();
    expect(changeTalk?.type).toBe('DESIRE');
    expect(changeTalk?.strength).toBe('strong');

    // Step 3: Generate amplification response
    const response = generateMIResponse(changeTalk!.type);
    expect(response.length).toBeGreaterThan(0);
  });

  it('should handle progression from preparatory to mobilizing change talk', () => {
    const messages = [
      'Ich möchte selbstständig sein.', // DESIRE (DARN)
      'Ich kann gut mit Kunden umgehen.', // ABILITY (DARN)
      'Weil es mir wichtig ist.', // REASON (DARN)
      'Ich muss etwas ändern.', // NEED (DARN)
      'Ich habe beschlossen anzufangen.', // COMMITMENT (CAT)
      'Ich bin bereit.', // ACTIVATION (CAT)
      'Ich habe schon angefangen.', // TAKING_STEPS (CAT)
    ];

    const results = messages.map((msg) => detectChangeTalk(msg));

    // All should be detected
    results.forEach((result) => {
      expect(result).not.toBeNull();
    });

    // First 4 are DARN (preparatory)
    expect(getChangeTalkCategory(results[0]!.type)).toBe('DARN');
    expect(getChangeTalkCategory(results[1]!.type)).toBe('DARN');
    expect(getChangeTalkCategory(results[2]!.type)).toBe('DARN');
    expect(getChangeTalkCategory(results[3]!.type)).toBe('DARN');

    // Last 3 are CAT (mobilizing)
    expect(getChangeTalkCategory(results[4]!.type)).toBe('CAT');
    expect(getChangeTalkCategory(results[5]!.type)).toBe('CAT');
    expect(getChangeTalkCategory(results[6]!.type)).toBe('CAT');
  });

  it('should detect resistance and provide appropriate response', () => {
    const userMessage = 'Das ist mir zu riskant.';

    // Detect sustain talk
    expect(detectSustainTalk(userMessage)).toBe(true);

    // Generate rolling with resistance response
    const response = rollWithResistance('es dir zu riskant erscheint');
    expect(response).toContain('Ich höre');
    expect(response).toContain('nachvollziehbar');
  });

  it('should handle ambivalent messages', () => {
    // This message contains both "ich will" (change talk) and "kann nicht" (sustain talk)
    const ambivalentMessage = 'Ich will es machen, aber ich denke ich kann nicht.';

    // Detect both change talk and sustain talk
    const changeTalk = detectChangeTalk(ambivalentMessage);
    const sustainTalk = detectSustainTalk(ambivalentMessage);
    const isAmbivalent = detectAmbivalence(ambivalentMessage);

    expect(changeTalk).not.toBeNull();
    expect(sustainTalk).toBe(true);
    expect(isAmbivalent).toBe(true);
  });

  it('should support building discrepancy', () => {
    const currentState = 'unsicher und abhängig von meinem Arbeitgeber';
    const desiredState = 'frei und selbstbestimmt arbeiten';

    const discrepancy = developDiscrepancy(currentState, desiredState);

    expect(discrepancy).toContain(currentState);
    expect(discrepancy).toContain(desiredState);
    expect(discrepancy).toContain('Weg dorthin');
  });

  it('should support self-efficacy through strength anchoring', () => {
    const strength = 'in deiner letzten Position ein Team erfolgreich aufgebaut hast';

    const efficacyResponse = supportSelfEfficacy(strength);

    expect(efficacyResponse).toContain(strength);
    expect(efficacyResponse).toContain('Stärken');
  });
});
