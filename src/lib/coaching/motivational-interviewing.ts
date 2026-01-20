/**
 * Motivational Interviewing (MI) System (GZ-206)
 *
 * Implements evidence-based Motivational Interviewing techniques for detecting
 * and responding to change talk in German-speaking founders.
 *
 * Based on the DARN-CAT model:
 * - D: DESIRE - "Ich will...", "Ich möchte..."
 * - A: ABILITY - "Ich kann...", "Ich bin fähig..."
 * - R: REASON - "weil...", "damit...", "um zu..."
 * - N: NEED - "Ich muss...", "Ich brauche..."
 * - C: COMMITMENT - "Ich werde...", "Ich habe beschlossen..."
 * - A: ACTIVATION - "Ich bin bereit...", "Ich fange an..."
 * - T: TAKING_STEPS - "Ich habe schon...", "Gestern habe ich..."
 *
 * Four MI Principles:
 * 1. Express Empathy
 * 2. Develop Discrepancy
 * 3. Roll with Resistance
 * 4. Support Self-Efficacy
 */

// ============================================================================
// Types
// ============================================================================

/**
 * DARN-CAT model for categorizing change talk
 */
export type ChangeTalkType =
  | 'DESIRE' // "Ich will...", "Ich möchte..."
  | 'ABILITY' // "Ich kann...", "Ich bin fähig..."
  | 'REASON' // "weil...", "damit...", "um zu..."
  | 'NEED' // "Ich muss...", "Ich brauche..."
  | 'COMMITMENT' // "Ich werde...", "Ich habe beschlossen..."
  | 'ACTIVATION' // "Ich bin bereit...", "Ich fange an..."
  | 'TAKING_STEPS'; // "Ich habe schon...", "Gestern habe ich..."

/**
 * Strength indicator for detected change talk
 */
export type ChangeTalkStrength = 'weak' | 'medium' | 'strong';

/**
 * Result from change talk detection
 */
export interface ChangeTalkResult {
  /** The type of change talk detected */
  type: ChangeTalkType;
  /** Strength of the change talk signal */
  strength: ChangeTalkStrength;
  /** The phrase that triggered detection */
  trigger: string;
}

/**
 * Context for generating MI responses
 */
export interface MIContext {
  /** User's current state or situation */
  currentState?: string;
  /** User's desired state or goal */
  desiredState?: string;
  /** Previously identified user strengths */
  userStrengths?: string[];
  /** Previous change talk types in the conversation */
  previousChangeTalk?: ChangeTalkType[];
}

/**
 * Sustain talk detection result
 */
export interface SustainTalkResult {
  /** Whether sustain talk was detected */
  detected: boolean;
  /** The trigger phrase that matched */
  trigger?: string;
}

// ============================================================================
// Change Talk Trigger Phrases
// ============================================================================

/**
 * German trigger phrases for each DARN-CAT change talk type
 *
 * Structure: { type: { phrases: string[], strengthModifiers: { strong: string[], weak: string[] } } }
 */
const CHANGE_TALK_TRIGGERS: Record<
  ChangeTalkType,
  {
    phrases: string[];
    strongModifiers: string[];
    weakModifiers: string[];
  }
> = {
  DESIRE: {
    phrases: [
      'ich will',
      'ich möchte',
      'ich moechte',
      'ich wünsche',
      'ich wuensche',
      'ich hoffe',
      'ich träume',
      'ich traeume',
      'ich sehne mich',
      'mir ist wichtig',
      'ich strebe an',
      'mein ziel ist',
      'ich wünsche mir',
      'es wäre schön',
      'es waere schoen',
    ],
    strongModifiers: ['unbedingt', 'wirklich', 'sehr', 'auf jeden fall', 'dringend'],
    weakModifiers: ['vielleicht', 'eventuell', 'irgendwie', 'ein bisschen', 'eigentlich'],
  },
  ABILITY: {
    phrases: [
      'ich kann',
      'ich könnte',
      'ich koennte',
      'ich bin fähig',
      'ich bin faehig',
      'in der lage',
      'ich schaffe',
      'ich beherrsche',
      'ich verstehe',
      'ich weiß wie',
      'ich weiss wie',
      'ich habe die fähigkeit',
      'ich habe die faehigkeit',
      'es ist mir möglich',
      'es ist mir moeglich',
      'ich bin kompetent',
    ],
    strongModifiers: ['definitiv', 'sicher', 'absolut', 'ohne zweifel', 'problemlos'],
    weakModifiers: ['vielleicht', 'eventuell', 'möglicherweise', 'moeglicherweise', 'irgendwie'],
  },
  REASON: {
    phrases: [
      'weil',
      'damit',
      'um zu',
      'deshalb',
      'deswegen',
      'darum',
      'aus diesem grund',
      'der grund ist',
      'das würde bedeuten',
      'das wuerde bedeuten',
      'dadurch',
      'das bringt mir',
      'das ermöglicht',
      'das ermoeglicht',
      'denn',
    ],
    strongModifiers: ['vor allem', 'hauptsächlich', 'hauptsaechlich', 'besonders', 'gerade weil'],
    weakModifiers: ['unter anderem', 'auch', 'teilweise', 'manchmal'],
  },
  NEED: {
    phrases: [
      'ich muss',
      'ich brauche',
      'es ist notwendig',
      'es ist nötig',
      'es ist noetig',
      'ich sollte',
      'es ist erforderlich',
      'es ist wichtig dass',
      'ich habe keine wahl',
      'es geht nicht anders',
      'es muss sein',
      'ich bin gezwungen',
    ],
    strongModifiers: ['unbedingt', 'dringend', 'sofort', 'jetzt', 'auf jeden fall'],
    weakModifiers: ['eigentlich', 'irgendwann', 'vielleicht', 'eventuell'],
  },
  COMMITMENT: {
    phrases: [
      'ich werde',
      'ich habe beschlossen',
      'ich bin entschlossen',
      'ich habe mich entschieden',
      'ich verpflichte mich',
      'ich verspreche',
      'ich garantiere',
      'mein entschluss steht fest',
      'ich habe mir vorgenommen',
      'ab jetzt werde ich',
      'ich setze das um',
    ],
    strongModifiers: ['definitiv', 'auf jeden fall', 'garantiert', 'hundertprozentig', 'fest'],
    weakModifiers: ['wahrscheinlich', 'vermutlich', 'hoffentlich', 'mal sehen'],
  },
  ACTIVATION: {
    phrases: [
      'ich bin bereit',
      'ich fange an',
      'ich starte',
      'ich beginne',
      'los geht es',
      'los gehts',
      "los geht's",
      'ich mache mich daran',
      'jetzt ist der zeitpunkt',
      'ich bin soweit',
      'ich bin vorbereitet',
      'ich bin startklar',
      'es kann losgehen',
    ],
    strongModifiers: ['jetzt', 'sofort', 'heute', 'gleich', 'endlich'],
    weakModifiers: ['bald', 'demnächst', 'demnaechst', 'irgendwann', 'wenn es passt'],
  },
  TAKING_STEPS: {
    phrases: [
      'ich habe schon',
      'ich habe bereits',
      'gestern habe ich',
      'letzte woche habe ich',
      'ich habe angefangen',
      'ich habe begonnen',
      'der erste schritt war',
      'ich habe gemacht',
      'ich habe erledigt',
      'ich habe umgesetzt',
      'ich bin dabei',
      'ich arbeite daran',
      'ich habe gerade',
    ],
    strongModifiers: ['erfolgreich', 'komplett', 'vollständig', 'vollstaendig', 'wie geplant'],
    weakModifiers: ['ein wenig', 'ein bisschen', 'ansatzweise', 'teilweise'],
  },
};

/**
 * Sustain talk triggers - signals of resistance or status quo maintenance
 */
const SUSTAIN_TALK_TRIGGERS: string[] = [
  'kann nicht',
  'kann ich nicht',
  'unmöglich',
  'unmoeglich',
  'zu schwer',
  'zu schwierig',
  'nicht bereit',
  'vielleicht später',
  'vielleicht spaeter',
  'nicht jetzt',
  'noch nicht',
  'das geht nicht',
  'das funktioniert nicht',
  'ich schaffe das nicht',
  'das ist nichts für mich',
  'das ist nichts fuer mich',
  'ich will nicht',
  'ich mag nicht',
  'keine lust',
  'keine zeit',
  'zu kompliziert',
  'zu riskant',
  'zu teuer',
  'das macht keinen sinn',
  'bringt nichts',
  'warum sollte ich',
  'wozu',
  'egal',
  'ist mir egal',
  'interessiert mich nicht',
];

// ============================================================================
// MI Response Templates
// ============================================================================

/**
 * Response templates for amplifying each type of change talk
 */
const MI_RESPONSE_TEMPLATES: Record<ChangeTalkType, string[]> = {
  DESIRE: [
    'Das klingt wichtig für dich. Erzähl mir mehr darüber, was du dir wünschst.',
    'Du wünschst dir also {context}. Was würde sich dadurch für dich verändern?',
    'Ich höre, dass dir das am Herzen liegt. Was genau macht das für dich so bedeutsam?',
  ],
  ABILITY: [
    'Du hast also Erfahrung damit. Wann hast du das schon einmal geschafft?',
    'Es klingt so, als hättest du bereits Fähigkeiten in diesem Bereich. Erzähl mir mehr davon.',
    'Du weißt, wie es geht. Wie hast du dir diese Kompetenz angeeignet?',
  ],
  REASON: [
    'Das ist ein starker Grund. Gibt es noch weitere Gründe, die dich antreiben?',
    'Interessant, dass du das so begründest. Was ist der wichtigste Aspekt dabei für dich?',
    'Du hast gute Gründe gefunden. Welcher davon motiviert dich am meisten?',
  ],
  NEED: [
    'Du spürst also eine Dringlichkeit. Was würde passieren, wenn du nicht handelst?',
    'Es klingt, als sei das wirklich notwendig für dich. Was treibt diese Notwendigkeit an?',
    'Diese Notwendigkeit scheint klar. Was ist der nächste logische Schritt?',
  ],
  COMMITMENT: [
    'Das ist eine klare Entscheidung. Was hat dich dazu gebracht?',
    'Du hast dich entschlossen. Wie fühlt sich diese Klarheit an?',
    'Ein fester Entschluss. Was möchtest du als Erstes anpacken?',
  ],
  ACTIVATION: [
    'Du bist bereit loszulegen. Was ist der allererste Schritt, den du machen wirst?',
    'Die Startbereitschaft ist da. Was brauchst du noch, um den ersten Schritt zu gehen?',
    'Du spürst, dass jetzt der richtige Zeitpunkt ist. Was unterscheidet jetzt von vorher?',
  ],
  TAKING_STEPS: [
    'Das ist großartig! Du hast bereits angefangen. Wie war diese Erfahrung für dich?',
    'Du bist schon in Aktion. Was hast du dabei über dich gelernt?',
    'Der erste Schritt ist gemacht. Wie fühlst du dich damit?',
  ],
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Normalizes German text for comparison
 * - Lowercases
 * - Handles umlauts (both ä and ae variations)
 * - Removes extra whitespace
 */
function normalizeGermanText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

/**
 * Checks if a trigger phrase appears in the text
 * Handles German umlaut variations
 */
function phraseMatches(text: string, phrase: string): { matches: boolean; position: number } {
  const normalizedText = normalizeGermanText(text);
  const normalizedPhrase = normalizeGermanText(phrase);

  // Direct match
  let position = normalizedText.indexOf(normalizedPhrase);
  if (position >= 0) {
    return { matches: true, position };
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

  position = textVariant.indexOf(phraseVariant);
  if (position >= 0) {
    return { matches: true, position };
  }

  position = textVariant.indexOf(normalizedPhrase);
  if (position >= 0) {
    return { matches: true, position };
  }

  return { matches: false, position: -1 };
}

/**
 * Determines the strength of change talk based on modifiers present
 */
function determineStrength(
  text: string,
  strongModifiers: string[],
  weakModifiers: string[]
): ChangeTalkStrength {
  const normalizedText = normalizeGermanText(text);

  // Check for strong modifiers
  for (const modifier of strongModifiers) {
    if (phraseMatches(normalizedText, modifier).matches) {
      return 'strong';
    }
  }

  // Check for weak modifiers
  for (const modifier of weakModifiers) {
    if (phraseMatches(normalizedText, modifier).matches) {
      return 'weak';
    }
  }

  // Default to medium
  return 'medium';
}

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Detects change talk in a user message using the DARN-CAT model
 *
 * Analyzes the input text for signals indicating:
 * - DESIRE: Wanting something
 * - ABILITY: Capability to change
 * - REASON: Rationale for change
 * - NEED: Necessity for change
 * - COMMITMENT: Decision to change
 * - ACTIVATION: Readiness to change
 * - TAKING_STEPS: Already taking action
 *
 * @param message - The user's message to analyze
 * @returns ChangeTalkResult if change talk detected, null otherwise
 *
 * @example
 * ```typescript
 * const result = detectChangeTalk('Ich will unbedingt mein eigenes Business starten');
 * // Returns: { type: 'DESIRE', strength: 'strong', trigger: 'ich will' }
 *
 * const noMatch = detectChangeTalk('Hallo, wie geht es dir?');
 * // Returns: null
 * ```
 */
export function detectChangeTalk(message: string): ChangeTalkResult | null {
  if (!message || message.trim().length === 0) {
    return null;
  }

  const normalizedMessage = normalizeGermanText(message);

  // Priority order: TAKING_STEPS > COMMITMENT > ACTIVATION > NEED > REASON > ABILITY > DESIRE
  // This reflects the progression from preparatory to mobilizing change talk
  const typeOrder: ChangeTalkType[] = [
    'TAKING_STEPS',
    'COMMITMENT',
    'ACTIVATION',
    'NEED',
    'REASON',
    'ABILITY',
    'DESIRE',
  ];

  let bestMatch: ChangeTalkResult | null = null;
  let bestPosition = Infinity;

  for (const type of typeOrder) {
    const triggers = CHANGE_TALK_TRIGGERS[type];

    for (const phrase of triggers.phrases) {
      const { matches, position } = phraseMatches(normalizedMessage, phrase);

      if (matches && position < bestPosition) {
        const strength = determineStrength(
          normalizedMessage,
          triggers.strongModifiers,
          triggers.weakModifiers
        );

        bestMatch = {
          type,
          strength,
          trigger: phrase,
        };
        bestPosition = position;
      }
    }
  }

  return bestMatch;
}

/**
 * Detects sustain talk (resistance/status quo) in a user message
 *
 * Sustain talk signals include:
 * - "kann nicht" - inability
 * - "unmöglich" - impossibility
 * - "zu schwer" - difficulty
 * - "nicht bereit" - unreadiness
 * - "vielleicht später" - postponement
 *
 * @param message - The user's message to analyze
 * @returns true if sustain talk detected, false otherwise
 *
 * @example
 * ```typescript
 * detectSustainTalk('Das kann ich nicht machen');
 * // Returns: true
 *
 * detectSustainTalk('Ich bin bereit anzufangen');
 * // Returns: false
 * ```
 */
export function detectSustainTalk(message: string): boolean {
  if (!message || message.trim().length === 0) {
    return false;
  }

  const normalizedMessage = normalizeGermanText(message);

  for (const trigger of SUSTAIN_TALK_TRIGGERS) {
    if (phraseMatches(normalizedMessage, trigger).matches) {
      return true;
    }
  }

  return false;
}

/**
 * Detects sustain talk with details about the matched trigger
 *
 * @param message - The user's message to analyze
 * @returns SustainTalkResult with detection status and trigger
 */
export function detectSustainTalkWithDetails(message: string): SustainTalkResult {
  if (!message || message.trim().length === 0) {
    return { detected: false };
  }

  const normalizedMessage = normalizeGermanText(message);

  for (const trigger of SUSTAIN_TALK_TRIGGERS) {
    if (phraseMatches(normalizedMessage, trigger).matches) {
      return { detected: true, trigger };
    }
  }

  return { detected: false };
}

// ============================================================================
// MI Response Generation
// ============================================================================

/**
 * Generates an MI response to amplify detected change talk
 *
 * Follows MI spirit: collaboration, evocation, autonomy support
 *
 * @param changeTalkType - The type of change talk detected
 * @param context - Optional context for personalization
 * @returns A German MI response to amplify the change talk
 *
 * @example
 * ```typescript
 * const response = generateMIResponse('DESIRE');
 * // Returns: 'Das klingt wichtig für dich. Erzähl mir mehr darüber, was du dir wünschst.'
 *
 * const contextResponse = generateMIResponse('COMMITMENT', {
 *   desiredState: 'ein erfolgreiches Coaching-Business'
 * });
 * // Returns personalized response
 * ```
 */
export function generateMIResponse(changeTalkType: ChangeTalkType, context?: MIContext): string {
  const templates = MI_RESPONSE_TEMPLATES[changeTalkType];

  // Select a template based on context or use the first one
  let templateIndex = 0;

  // If we have previous change talk, vary the response
  if (context?.previousChangeTalk && context.previousChangeTalk.length > 0) {
    templateIndex = context.previousChangeTalk.length % templates.length;
  }

  let response = templates[templateIndex] ?? templates[0] ?? '';

  // Personalize with context if available
  if (context?.desiredState) {
    response = response.replace('{context}', context.desiredState);
  } else {
    response = response.replace('{context}', 'das');
  }

  return response;
}

// ============================================================================
// Four MI Principles
// ============================================================================

/**
 * Develops discrepancy between current state and desired state
 *
 * MI Principle 2: Help users see the gap between where they are and where they want to be
 *
 * @param currentState - User's current situation
 * @param desiredState - User's desired goal
 * @returns A German prompt to help user explore the discrepancy
 *
 * @example
 * ```typescript
 * const prompt = developDiscrepancy(
 *   'noch angestellt und unsicher',
 *   'ein eigenes erfolgreiches Business führen'
 * );
 * // Returns: 'Du beschreibst noch angestellt und unsicher. Gleichzeitig wünschst du dir ein eigenes erfolgreiches Business führen. Wie siehst du den Weg dorthin?'
 * ```
 */
export function developDiscrepancy(currentState: string, desiredState: string): string {
  return `Du beschreibst ${currentState}. Gleichzeitig wünschst du dir ${desiredState}. Wie siehst du den Weg dorthin?`;
}

/**
 * Rolls with resistance instead of confronting it
 *
 * MI Principle 3: Don't argue, reflect and redirect
 *
 * @param resistanceSignal - The resistance expressed by the user
 * @returns A German response that acknowledges resistance and redirects
 *
 * @example
 * ```typescript
 * const response = rollWithResistance('es ist zu riskant');
 * // Returns: 'Ich höre, dass es ist zu riskant. Das ist nachvollziehbar. Was müsste anders sein, damit du dich sicherer fühlst?'
 * ```
 */
export function rollWithResistance(resistanceSignal: string): string {
  return `Ich höre, dass ${resistanceSignal}. Das ist nachvollziehbar. Was müsste anders sein, damit du dich sicherer fühlst?`;
}

/**
 * Supports self-efficacy by anchoring to user's strengths
 *
 * MI Principle 4: Help users believe in their ability to change
 *
 * @param strength - A strength or past success of the user
 * @returns A German response that reinforces the strength
 *
 * @example
 * ```typescript
 * const response = supportSelfEfficacy('ein komplexes IT-Projekt erfolgreich geleitet hast');
 * // Returns: 'Du hast mir erzählt, dass du ein komplexes IT-Projekt erfolgreich geleitet hast. Das zeigt mir, dass du Durchhaltevermögen und Führungskompetenz hast.'
 * ```
 */
export function supportSelfEfficacy(strength: string): string {
  return `Du hast mir erzählt, dass du ${strength}. Das zeigt mir, dass du wichtige Stärken hast, auf die du bauen kannst.`;
}

/**
 * Generates a contextual self-efficacy response with inferred qualities
 *
 * @param strength - A strength or past success
 * @param quality - The quality this demonstrates
 * @returns A German response highlighting the quality
 */
export function supportSelfEfficacyWithQuality(strength: string, quality: string): string {
  return `Du hast mir erzählt, dass du ${strength}. Das zeigt mir, dass du ${quality} hast.`;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Gets all change talk types
 *
 * @returns Array of all ChangeTalkType values
 */
export function getAllChangeTalkTypes(): ChangeTalkType[] {
  return ['DESIRE', 'ABILITY', 'REASON', 'NEED', 'COMMITMENT', 'ACTIVATION', 'TAKING_STEPS'];
}

/**
 * Gets trigger phrases for a specific change talk type
 *
 * @param type - The change talk type
 * @returns Array of trigger phrases
 */
export function getTriggerPhrases(type: ChangeTalkType): string[] {
  return [...CHANGE_TALK_TRIGGERS[type].phrases];
}

/**
 * Gets all sustain talk triggers
 *
 * @returns Array of sustain talk trigger phrases
 */
export function getSustainTalkTriggers(): string[] {
  return [...SUSTAIN_TALK_TRIGGERS];
}

/**
 * Checks if a message has any change talk signals (quick check)
 *
 * @param message - Message to check
 * @returns true if any change talk detected
 */
export function hasChangeTalkSignal(message: string): boolean {
  return detectChangeTalk(message) !== null;
}

/**
 * Checks if a message has both change talk and sustain talk (ambivalence)
 *
 * @param message - Message to check
 * @returns true if both change talk and sustain talk detected
 */
export function detectAmbivalence(message: string): boolean {
  return hasChangeTalkSignal(message) && detectSustainTalk(message);
}

/**
 * Gets the DARN-CAT category for a change talk type
 *
 * DARN = Preparatory change talk (Desire, Ability, Reason, Need)
 * CAT = Mobilizing change talk (Commitment, Activation, Taking steps)
 *
 * @param type - The change talk type
 * @returns 'DARN' for preparatory, 'CAT' for mobilizing
 */
export function getChangeTalkCategory(type: ChangeTalkType): 'DARN' | 'CAT' {
  const mobilizing: ChangeTalkType[] = ['COMMITMENT', 'ACTIVATION', 'TAKING_STEPS'];
  return mobilizing.includes(type) ? 'CAT' : 'DARN';
}

/**
 * Gets German labels for change talk types
 *
 * @param type - The change talk type
 * @returns German description of the type
 */
export function getChangeTalkLabel(type: ChangeTalkType): string {
  const labels: Record<ChangeTalkType, string> = {
    DESIRE: 'Wunsch',
    ABILITY: 'Fähigkeit',
    REASON: 'Grund',
    NEED: 'Notwendigkeit',
    COMMITMENT: 'Entschlossenheit',
    ACTIVATION: 'Aktivierung',
    TAKING_STEPS: 'Handlung',
  };
  return labels[type];
}
