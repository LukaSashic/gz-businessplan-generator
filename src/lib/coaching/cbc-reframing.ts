/**
 * CBC Reframing System (GZ-207)
 *
 * Implements Cognitive Behavioral Coaching patterns for detecting
 * and addressing limiting beliefs in German-speaking founders.
 *
 * Based on evidence-based CBC methodology:
 * 1. IDENTIFY - What's the belief/assumption?
 * 2. EVIDENCE - What supports/challenges it?
 * 3. CHALLENGE - Is it 100% true?
 * 4. REFRAME - What's a more helpful perspective?
 * 5. ACTION - What changes based on new perspective?
 */

// ============================================================================
// Types
// ============================================================================

/**
 * The 5-step CBC pattern for cognitive restructuring
 */
export enum CBCStep {
  IDENTIFY = 'IDENTIFY',
  EVIDENCE = 'EVIDENCE',
  CHALLENGE = 'CHALLENGE',
  REFRAME = 'REFRAME',
  ACTION = 'ACTION',
}

/**
 * Categories of limiting beliefs commonly found in founders
 */
export enum BeliefCategory {
  /** "Ich bin kein..." - Self-capability doubts */
  CAPABILITY_DEFICIT = 'CAPABILITY_DEFICIT',
  /** "Der Markt ist..." - External blame */
  EXTERNAL_LOCUS = 'EXTERNAL_LOCUS',
  /** "Ich brauche erst..." - Prerequisite thinking */
  SEQUENTIAL_THINKING = 'SEQUENTIAL_THINKING',
  /** "Wenn X, ist alles verloren" - Worst-case focus */
  CATASTROPHIZING = 'CATASTROPHIZING',
}

/**
 * A specific limiting belief with its metadata
 */
export interface LimitingBelief {
  /** Unique identifier for the belief */
  id: string;
  /** Category of the limiting belief */
  category: BeliefCategory;
  /** German canonical phrase representing this belief */
  canonicalPhrase: string;
  /** Trigger phrases that indicate this belief (German) */
  triggerPhrases: string[];
  /** Example reframe statement */
  exampleReframe: string;
  /** Suggested evidence-gathering questions */
  evidenceQuestions: string[];
  /** Challenge questions to examine the belief */
  challengeQuestions: string[];
}

/**
 * Result from belief detection
 */
export interface BeliefDetectionResult {
  /** The detected limiting belief, or null if none found */
  belief: LimitingBelief | null;
  /** Confidence score 0-1 */
  confidence: number;
  /** Which trigger phrases matched */
  matchedPhrases: string[];
}

/**
 * A CBC response for a specific step
 */
export interface CBCResponse {
  /** The CBC step this response is for */
  step: CBCStep;
  /** The German response text */
  response: string;
  /** Follow-up question (if applicable) */
  followUpQuestion?: string;
  /** Suggested next step */
  nextStep: CBCStep | null;
}

// ============================================================================
// Limiting Belief Definitions
// ============================================================================

/**
 * The four core limiting beliefs from the PRD with extensive trigger phrases
 */
export const LIMITING_BELIEFS: Record<string, LimitingBelief> = {
  'nicht-verkaeufer': {
    id: 'nicht-verkaeufer',
    category: BeliefCategory.CAPABILITY_DEFICIT,
    canonicalPhrase: 'Ich bin kein Verkäufer',
    triggerPhrases: [
      'ich bin kein verkäufer',
      'ich bin kein verkaeufer',
      'ich kann nicht verkaufen',
      'verkaufen liegt mir nicht',
      'verkaufen ist nicht meine stärke',
      'verkaufen ist nicht meine staerke',
      'ich hasse verkaufen',
      'kaltakquise ist nichts für mich',
      'kaltakquise ist nichts fuer mich',
      'ich bin nicht gut im verkauf',
      'verkauf fällt mir schwer',
      'verkauf faellt mir schwer',
      'ich bin introvertiert',
      'akquise macht mir angst',
      'ich kann mich nicht selbst vermarkten',
    ],
    exampleReframe:
      'Vielleicht ist es nicht "Ich kann nicht verkaufen" sondern "Ich verkaufe anders als durch Kaltakquise".',
    evidenceQuestions: [
      'Hast du schon mal jemanden von einer Idee überzeugt?',
      'Wie hast du deinen letzten Chef oder Kollegen von einem Projekt überzeugt?',
      'Wann hat jemand auf deinen Rat gehört und gehandelt?',
    ],
    challengeQuestions: [
      'Was genau hast du gemacht, als du jemanden überzeugt hast?',
      'Ist das nicht auch eine Form von Verkaufen - nur anders?',
      'Muss Verkaufen wirklich Kaltakquise bedeuten?',
    ],
  },
  'markt-gesaettigt': {
    id: 'markt-gesaettigt',
    category: BeliefCategory.EXTERNAL_LOCUS,
    canonicalPhrase: 'Der Markt ist zu gesättigt',
    triggerPhrases: [
      'der markt ist zu gesättigt',
      'der markt ist zu gesaettigt',
      'markt ist gesättigt',
      'markt ist gesaettigt',
      'zu viele wettbewerber',
      'zu viel konkurrenz',
      'markt ist überfüllt',
      'markt ist ueberfuellt',
      'keine chance gegen die großen',
      'keine chance gegen die grossen',
      'da gibt es schon so viele',
      'der markt ist voll',
      'alles ist schon da',
      'zu späte markteintritt',
      'zu spaeter markteintritt',
      'das machen schon andere',
    ],
    exampleReframe:
      'Gesättigte Märkte bedeuten: Es gibt Nachfrage. Die Frage ist nicht "Komme ich rein?" sondern "Wie differenziere ich mich?"',
    evidenceQuestions: [
      'Wie viele Wettbewerber gibt es konkret in deinem Segment?',
      'Haben alle diese Wettbewerber Erfolg?',
      'Sind neue Anbieter in den letzten 2 Jahren hinzugekommen?',
    ],
    challengeQuestions: [
      'Von den Wettbewerbern - wie viele sind wirklich erfolgreich?',
      'Ist "gesättigt" oder "selektiv" die bessere Beschreibung?',
      'Was machen die erfolgreichen Anbieter anders als die anderen?',
    ],
  },
  'brauche-erst': {
    id: 'brauche-erst',
    category: BeliefCategory.SEQUENTIAL_THINKING,
    canonicalPhrase: 'Ich brauche erst X',
    triggerPhrases: [
      'ich brauche erst',
      'ich muss erst',
      'erst wenn ich',
      'bevor ich anfangen kann',
      'ich warte noch auf',
      'wenn ich erstmal',
      'sobald ich',
      'noch nicht bereit',
      'ich muss noch',
      'erst perfekt',
      'perfekte website',
      'erst das logo',
      'erst die zertifizierung',
      'erst mehr erfahrung',
      'erst mehr geld',
      'erst mehr kunden',
      'erstmal alles vorbereiten',
    ],
    exampleReframe:
      'Perfekt ist nicht gleich komplett. Perfekt bedeutet: Funktioniert für den aktuellen Zweck.',
    evidenceQuestions: [
      'Was genau muss diese Voraussetzung können?',
      'Wie lange würde es dauern, das komplett fertig zu haben?',
      'Was könntest du in dieser Zeit stattdessen tun?',
    ],
    challengeQuestions: [
      'Was ist der Unterschied zwischen "perfekt vorbereitet" und "gut genug zum Starten"?',
      'Welches Szenario bringt mehr Lerneffekt - warten oder starten?',
      'Was brauchst du wirklich als Minimum?',
    ],
  },
  'alles-verloren': {
    id: 'alles-verloren',
    category: BeliefCategory.CATASTROPHIZING,
    canonicalPhrase: 'Wenn ich scheitere ist alles verloren',
    triggerPhrases: [
      'wenn ich scheitere ist alles verloren',
      'alles verloren',
      'alles aufs spiel',
      'existenzielle angst',
      'alles riskieren',
      'ich verliere alles',
      'wenn es nicht klappt',
      'wenn ich versage',
      'totalschaden',
      'kompletter fehlschlag',
      'ruiniert',
      'ende meiner karriere',
      'nie wieder',
      'worst case',
      'schlimmsten fall',
      'katastrophe',
      'dann war alles umsonst',
      'dann stehe ich vor dem nichts',
    ],
    exampleReframe:
      'Worst Case Gründung: 6 Monate + €5k für eine Lernerfahrung. Worst Case NICHT Gründung: Lebenslanges "Was wäre wenn?"',
    evidenceQuestions: [
      'Was genau würdest du konkret verlieren?',
      'Wie viel Zeit und Geld steht wirklich auf dem Spiel?',
      'Was passiert mit deiner Reputation - bei wem genau?',
    ],
    challengeQuestions: [
      'Wenn du NICHT startest - was passiert dann?',
      'Wie fühlt sich "nie versucht haben" im Vergleich zu "versucht und gelernt" an?',
      'Welches Risiko ist langfristig größer?',
    ],
  },
};

/**
 * Array of all limiting beliefs for iteration
 */
export const ALL_LIMITING_BELIEFS: LimitingBelief[] = Object.values(LIMITING_BELIEFS);

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Normalizes German text for comparison
 * - Lowercases
 * - Handles umlauts (both ä and ae variations)
 * - Removes extra whitespace
 */
function normalizeGermanText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if a trigger phrase appears in the text
 * Handles German umlaut variations
 */
function phraseMatches(text: string, phrase: string): boolean {
  const normalizedText = normalizeGermanText(text);
  const normalizedPhrase = normalizeGermanText(phrase);

  // Direct match
  if (normalizedText.includes(normalizedPhrase)) {
    return true;
  }

  // Try umlaut variations
  const umlautVariations: Record<string, string> = {
    ä: 'ae',
    ö: 'oe',
    ü: 'ue',
    ß: 'ss',
  };

  let textVariant = normalizedText;
  let phraseVariant = normalizedPhrase;

  for (const [umlaut, replacement] of Object.entries(umlautVariations)) {
    textVariant = textVariant.split(umlaut).join(replacement);
    phraseVariant = phraseVariant.split(umlaut).join(replacement);
  }

  return textVariant.includes(phraseVariant) || textVariant.includes(normalizedPhrase);
}

/**
 * Detects a limiting belief in a user message
 *
 * Analyzes the input text for trigger phrases that indicate
 * one of the four core limiting beliefs.
 *
 * @param message - The user's message to analyze
 * @returns The detected LimitingBelief or null if none found
 *
 * @example
 * ```typescript
 * const belief = detectLimitingBelief('Ich bin kein guter Verkäufer');
 * // Returns: LIMITING_BELIEFS['nicht-verkaeufer']
 *
 * const noMatch = detectLimitingBelief('Mein Geschäft ist Coaching');
 * // Returns: null
 * ```
 */
export function detectLimitingBelief(message: string): LimitingBelief | null {
  const result = detectLimitingBeliefWithDetails(message);
  return result.belief;
}

/**
 * Detects a limiting belief with detailed match information
 *
 * @param message - The user's message to analyze
 * @returns Full detection result with confidence and matched phrases
 */
export function detectLimitingBeliefWithDetails(message: string): BeliefDetectionResult {
  if (!message || message.trim().length === 0) {
    return {
      belief: null,
      confidence: 0,
      matchedPhrases: [],
    };
  }

  let bestMatch: {
    belief: LimitingBelief;
    matchCount: number;
    matchedPhrases: string[];
  } | null = null;

  for (const belief of ALL_LIMITING_BELIEFS) {
    const matchedPhrases: string[] = [];

    for (const phrase of belief.triggerPhrases) {
      if (phraseMatches(message, phrase)) {
        matchedPhrases.push(phrase);
      }
    }

    if (matchedPhrases.length > 0) {
      if (!bestMatch || matchedPhrases.length > bestMatch.matchCount) {
        bestMatch = {
          belief,
          matchCount: matchedPhrases.length,
          matchedPhrases,
        };
      }
    }
  }

  if (!bestMatch) {
    return {
      belief: null,
      confidence: 0,
      matchedPhrases: [],
    };
  }

  // Calculate confidence based on number of matches
  // 1 match = 0.6, 2 matches = 0.75, 3+ matches = 0.9
  const confidence = Math.min(0.9, 0.45 + bestMatch.matchCount * 0.15);

  return {
    belief: bestMatch.belief,
    confidence,
    matchedPhrases: bestMatch.matchedPhrases,
  };
}

// ============================================================================
// CBC Response Generation
// ============================================================================

/**
 * Response templates for each belief category and CBC step
 */
const CBC_RESPONSES: Record<
  string,
  Record<CBCStep, { response: string; followUpQuestion?: string }>
> = {
  'nicht-verkaeufer': {
    [CBCStep.IDENTIFY]: {
      response:
        'Du sagst "Ich bin kein Verkäufer". Das ist eine interessante Aussage. Lass uns genauer hinschauen.',
      followUpQuestion: 'Woran machst du das fest? Was bedeutet "Verkäufer sein" für dich?',
    },
    [CBCStep.EVIDENCE]: {
      response:
        'Kaltakquise ist unangenehm - da stimme ich zu. Aber lass uns genauer schauen, was du schon kannst.',
      followUpQuestion:
        'Hast du schon mal jemanden von einer Idee überzeugt? Vielleicht einen Chef, Kollegen oder Freund?',
    },
    [CBCStep.CHALLENGE]: {
      response:
        'Das IST Verkaufen! Du hast jemanden überzeugt, Zeit und Aufmerksamkeit in deine Idee zu investieren. Das ist die Essenz von Verkauf.',
      followUpQuestion:
        'Was hast du dabei konkret gemacht? Wie bist du vorgegangen?',
    },
    [CBCStep.REFRAME]: {
      response:
        'Vielleicht ist es nicht "Ich kann nicht verkaufen" sondern "Ich verkaufe anders als durch Kaltakquise". Du überzeugst durch Expertise und authentische Kommunikation.',
      followUpQuestion:
        'Was wäre, wenn du deine Stärke - Ideen überzeugend präsentieren - für Kundengewinnung nutzt?',
    },
    [CBCStep.ACTION]: {
      response:
        'Lass uns einen konkreten nächsten Schritt planen, der zu deinem Stil passt.',
      followUpQuestion:
        'Wie könntest du diese Woche 5 Menschen von deiner Idee erzählen - OHNE Kaltakquise? Welche Wege fallen dir ein?',
    },
  },
  'markt-gesaettigt': {
    [CBCStep.IDENTIFY]: {
      response:
        'Du sagst "Der Markt ist zu gesättigt". Das höre ich oft. Lass uns das genauer untersuchen.',
      followUpQuestion: 'Was bedeutet "zu gesättigt" konkret für dein Business?',
    },
    [CBCStep.EVIDENCE]: {
      response: 'Lass uns Fakten sammeln statt annehmen.',
      followUpQuestion:
        'Wie viele Wettbewerber gibt es konkret? Haben die ALLE Erfolg? Sind neue Anbieter in den letzten 2 Jahren hinzugekommen?',
    },
    [CBCStep.CHALLENGE]: {
      response:
        'Interessant! Von vielen Wettbewerbern sind oft nur wenige wirklich erfolgreich. Das bedeutet: Der Markt erlaubt Neuzugänge, aber belohnt Differenzierung.',
      followUpQuestion:
        'Ist "zu gesättigt" oder "selektiv" vielleicht die bessere Beschreibung?',
    },
    [CBCStep.REFRAME]: {
      response:
        'Gesättigte Märkte bedeuten: Es gibt Nachfrage. Die Frage ist nicht "Komme ich rein?" sondern "Wie differenziere ich mich?"',
      followUpQuestion: 'Was machen die erfolgreichen Anbieter in deinem Markt richtig?',
    },
    [CBCStep.ACTION]: {
      response:
        'Lass uns deine Differenzierung konkret machen.',
      followUpQuestion:
        'Analysiere diese Woche 3 erfolgreiche Wettbewerber: Was ist ihr Unterscheidungsmerkmal? Wie kannst du dich ANDERS positionieren?',
    },
  },
  'brauche-erst': {
    [CBCStep.IDENTIFY]: {
      response:
        'Du sagst "Ich brauche erst...". Das ist ein sehr verbreitetes Muster. Lass uns genauer hinschauen.',
      followUpQuestion:
        'Was genau muss fertig sein? Welche Features oder Voraussetzungen siehst du als notwendig?',
    },
    [CBCStep.EVIDENCE]: {
      response: 'Lass uns rechnen, was das bedeutet.',
      followUpQuestion:
        'Wie lange würde es dauern, das komplett fertig zu haben? Was könntest du in dieser Zeit stattdessen tun?',
    },
    [CBCStep.CHALLENGE]: {
      response:
        'Vergleichen wir zwei Szenarien: Szenario 1: Erst alles perfekt, dann starten. Szenario 2: Basis fertig, parallel Kunden gewinnen und Feedback sammeln.',
      followUpQuestion: 'Welches Szenario gibt dir mehr Lerneffekt und bringt dich schneller voran?',
    },
    [CBCStep.REFRAME]: {
      response:
        'Perfekt ist nicht gleich komplett. Perfekt bedeutet: Funktioniert für den aktuellen Zweck.',
      followUpQuestion:
        'Was ist der konkrete Zweck gerade? Was brauchst du dafür wirklich als Minimum?',
    },
    [CBCStep.ACTION]: {
      response: 'Lass uns ein MVP definieren - Minimum Viable Product.',
      followUpQuestion:
        'Was sind die 3 absolut notwendigen Dinge für den Start? Alles andere kommt basierend auf Kundenfeedback.',
    },
  },
  'alles-verloren': {
    [CBCStep.IDENTIFY]: {
      response:
        'Du sprichst von "alles verloren" oder dem schlimmsten Fall. Das sind starke Worte. Lass uns das konkret machen.',
      followUpQuestion: 'Was genau würdest du verlieren? Lass uns eine Liste machen.',
    },
    [CBCStep.EVIDENCE]: {
      response: 'Ok, lass uns das durchrechnen.',
      followUpQuestion:
        'Konkret: Wie viel Zeit steht auf dem Spiel? Wie viel Geld? Bei wem genau würde deine Reputation leiden?',
    },
    [CBCStep.CHALLENGE]: {
      response:
        'Jetzt lass uns die Alternative betrachten: Wenn du NICHT startest - was passiert dann?',
      followUpQuestion:
        'Wie würdest du dich in 5 Jahren fühlen, wenn du es nie versucht hättest? Was ist das Risiko von "nie versucht"?',
    },
    [CBCStep.REFRAME]: {
      response:
        'Worst Case Gründung: Zeit und Geld für eine Lernerfahrung. Worst Case NICHT Gründung: Lebenslanges "Was wäre wenn?"',
      followUpQuestion: 'Welches Risiko ist langfristig größer für dich?',
    },
    [CBCStep.ACTION]: {
      response: 'Lass uns das Risiko minimieren statt es zu vermeiden.',
      followUpQuestion:
        'Wie könntest du klein starten? Nebenberuflich? Mit reduziertem Budget? Im kleinen Kreis testen?',
    },
  },
};

/**
 * Gets the next step in the CBC sequence
 */
function getNextStep(currentStep: CBCStep): CBCStep | null {
  const stepOrder: CBCStep[] = [
    CBCStep.IDENTIFY,
    CBCStep.EVIDENCE,
    CBCStep.CHALLENGE,
    CBCStep.REFRAME,
    CBCStep.ACTION,
  ];

  const currentIndex = stepOrder.indexOf(currentStep);
  if (currentIndex === -1 || currentIndex === stepOrder.length - 1) {
    return null;
  }

  const nextStep = stepOrder[currentIndex + 1];
  return nextStep ?? null;
}

/**
 * Generates a CBC response for a specific belief and step
 *
 * The 5-step CBC pattern guides users through cognitive restructuring:
 * 1. IDENTIFY - Surface the belief
 * 2. EVIDENCE - Gather facts
 * 3. CHALLENGE - Question the belief
 * 4. REFRAME - Offer new perspective
 * 5. ACTION - Define concrete next step
 *
 * @param belief - The limiting belief being addressed
 * @param step - The current CBC step
 * @returns A CBC response with the coaching text and follow-up question
 *
 * @example
 * ```typescript
 * const belief = detectLimitingBelief('Ich bin kein Verkäufer');
 * if (belief) {
 *   const response = generateCBCResponse(belief, CBCStep.IDENTIFY);
 *   console.log(response.response);
 *   // "Du sagst 'Ich bin kein Verkäufer'. Das ist eine interessante Aussage..."
 *   console.log(response.followUpQuestion);
 *   // "Woran machst du das fest? Was bedeutet 'Verkäufer sein' für dich?"
 * }
 * ```
 */
export function generateCBCResponse(belief: LimitingBelief, step: CBCStep): CBCResponse {
  const beliefResponses = CBC_RESPONSES[belief.id];

  if (!beliefResponses) {
    // Fallback for unknown beliefs - use generic CBC questions
    return generateGenericCBCResponse(belief, step);
  }

  const stepResponse = beliefResponses[step];
  const nextStep = getNextStep(step);

  return {
    step,
    response: stepResponse.response,
    followUpQuestion: stepResponse.followUpQuestion,
    nextStep,
  };
}

/**
 * Generates a generic CBC response when specific templates aren't available
 */
function generateGenericCBCResponse(belief: LimitingBelief, step: CBCStep): CBCResponse {
  const genericResponses: Record<CBCStep, { response: string; followUpQuestion: string }> = {
    [CBCStep.IDENTIFY]: {
      response: `Du hast gesagt: "${belief.canonicalPhrase}". Lass uns das genauer anschauen.`,
      followUpQuestion: 'Woran machst du das fest? Was lässt dich so denken?',
    },
    [CBCStep.EVIDENCE]: {
      response: 'Lass uns Fakten sammeln.',
      followUpQuestion: belief.evidenceQuestions[0] || 'Welche Erfahrungen sprechen dafür oder dagegen?',
    },
    [CBCStep.CHALLENGE]: {
      response: 'Interessant. Lass uns das hinterfragen.',
      followUpQuestion: belief.challengeQuestions[0] || 'Ist das wirklich 100% wahr? Gibt es Ausnahmen?',
    },
    [CBCStep.REFRAME]: {
      response: belief.exampleReframe,
      followUpQuestion: 'Wie fühlt sich diese alternative Sichtweise an?',
    },
    [CBCStep.ACTION]: {
      response: 'Lass uns einen konkreten nächsten Schritt planen.',
      followUpQuestion: 'Was wäre ein kleiner erster Schritt, den du diese Woche machen könntest?',
    },
  };

  const stepResponse = genericResponses[step];
  const nextStep = getNextStep(step);

  return {
    step,
    response: stepResponse.response,
    followUpQuestion: stepResponse.followUpQuestion,
    nextStep,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Gets all trigger phrases for a specific belief
 *
 * @param beliefId - The ID of the belief
 * @returns Array of trigger phrases
 */
export function getTriggerPhrases(beliefId: string): string[] {
  const belief = LIMITING_BELIEFS[beliefId];
  return belief ? [...belief.triggerPhrases] : [];
}

/**
 * Gets all beliefs in a specific category
 *
 * @param category - The belief category
 * @returns Array of limiting beliefs in that category
 */
export function getBeliefsByCategory(category: BeliefCategory): LimitingBelief[] {
  return ALL_LIMITING_BELIEFS.filter((belief) => belief.category === category);
}

/**
 * Gets the full CBC sequence for a belief
 *
 * Returns all 5 responses in order for walking through
 * the complete cognitive restructuring process.
 *
 * @param belief - The limiting belief
 * @returns Array of all 5 CBC responses
 */
export function getFullCBCSequence(belief: LimitingBelief): CBCResponse[] {
  const steps: CBCStep[] = [
    CBCStep.IDENTIFY,
    CBCStep.EVIDENCE,
    CBCStep.CHALLENGE,
    CBCStep.REFRAME,
    CBCStep.ACTION,
  ];

  return steps.map((step) => generateCBCResponse(belief, step));
}

/**
 * Checks if a message contains any limiting belief indicators
 *
 * Quick check without full detection - useful for filtering
 *
 * @param message - Message to check
 * @returns true if any limiting belief indicators are present
 */
export function hasLimitingBeliefIndicators(message: string): boolean {
  if (!message || message.trim().length === 0) {
    return false;
  }

  for (const belief of ALL_LIMITING_BELIEFS) {
    for (const phrase of belief.triggerPhrases) {
      if (phraseMatches(message, phrase)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Gets the CBC step order as an array
 *
 * @returns Array of CBC steps in sequence order
 */
export function getCBCStepOrder(): CBCStep[] {
  return [
    CBCStep.IDENTIFY,
    CBCStep.EVIDENCE,
    CBCStep.CHALLENGE,
    CBCStep.REFRAME,
    CBCStep.ACTION,
  ];
}
