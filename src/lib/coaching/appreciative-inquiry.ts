/**
 * Appreciative Inquiry (AI) Strengths Discovery System (GZ-208)
 *
 * Implements the 4D Appreciative Inquiry cycle for strengths-based
 * coaching in the Grundungszuschuss business plan workshop.
 *
 * The 4D cycle:
 * - DISCOVER: Identify past successes and strengths
 * - DREAM: Envision ideal future state
 * - DESIGN: Plan pathway from strengths to vision
 * - DESTINY: Commit to concrete first steps
 *
 * Based on Cooperrider & Whitney's Appreciative Inquiry methodology.
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Appreciative Inquiry 4D Cycle Phases
 *
 * - DISCOVER: Explore past successes and identify strengths
 * - DREAM: Envision the ideal future state
 * - DESIGN: Create a pathway from current strengths to the dream
 * - DESTINY: Commit to specific actions and first steps
 */
export enum AIPhase {
  DISCOVER = 'DISCOVER',
  DREAM = 'DREAM',
  DESIGN = 'DESIGN',
  DESTINY = 'DESTINY',
}

/**
 * Context for generating personalized AI prompts
 */
export interface AIPromptContext {
  /** User's name for personalization */
  userName?: string;
  /** Previously identified strengths (from DISCOVER phase) */
  previousStrengths?: string[];
  /** User's dream/vision (from DREAM phase) */
  dreamVision?: string;
  /** Designed pathway steps (from DESIGN phase) */
  designedSteps?: string[];
}

/**
 * Result of the DISCOVER phase analysis
 */
export interface DiscoverResult {
  /** Extracted strengths from user response */
  strengths: string[];
  /** The original response text */
  originalResponse: string;
  /** Confidence score (0-1) based on number of matches */
  confidence: number;
}

/**
 * Complete state of an AI coaching session
 */
export interface AISessionState {
  /** Current phase in the 4D cycle */
  currentPhase: AIPhase;
  /** Identified strengths from DISCOVER */
  strengths: string[];
  /** Vision statement from DREAM */
  dreamVision: string | null;
  /** Pathway steps from DESIGN */
  pathwaySteps: string[];
  /** Committed first step from DESTINY */
  firstStep: string | null;
  /** Whether the full cycle is complete */
  isComplete: boolean;
}

// ============================================================================
// Strength Indicators (German)
// ============================================================================

/**
 * German words and phrases that indicate personal strengths
 *
 * These patterns are designed to identify strength-related words
 * in German-speaking users' responses about their past successes.
 */
export const STRENGTH_INDICATORS: ReadonlyArray<string> = [
  // Core competencies
  'organisiert',
  'organisation',
  'strukturiert',
  'strukturieren',
  'analytisch',
  'analyse',
  'kreativ',
  'kreativität',
  'kommunikativ',
  'kommunikation',
  'empathisch',
  'empathie',
  'durchsetzungsfähig',
  'durchsetzungsstark',
  'zuverlässig',
  'zuverlässigkeit',
  'verantwortungsbewusst',
  'verantwortung',
  'selbstständig',
  'selbständig',
  'eigeninitiative',
  'initiative',
  'flexibel',
  'flexibilität',
  'belastbar',
  'belastbarkeit',
  'teamfähig',
  'teamarbeit',
  'führungsstark',
  'führung',
  'leadership',

  // Problem-solving
  'problemlösung',
  'lösungsorientiert',
  'lösung gefunden',
  'problem gelöst',
  'herausforderung gemeistert',
  'schwierigkeit überwunden',

  // Technical skills
  'fachkompetenz',
  'fachwissen',
  'expertise',
  'spezialisiert',
  'qualifiziert',
  'kompetent',
  'erfahren',
  'erfahrung',

  // Interpersonal
  'überzeugt',
  'überzeugen',
  'motiviert',
  'motivieren',
  'begeistert',
  'inspiriert',
  'inspirieren',
  'netzwerk',
  'kontakte',
  'kundenbeziehung',
  'kundenkontakt',

  // Achievement indicators
  'geschafft',
  'erreicht',
  'erfolgreich',
  'erfolg',
  'gewonnen',
  'verbessert',
  'verbesserung',
  'gesteigert',
  'optimiert',
  'entwickelt',
  'aufgebaut',
  'umgesetzt',
  'implementiert',

  // Personal qualities
  'geduldig',
  'geduld',
  'ausdauer',
  'durchhaltevermögen',
  'hartnäckig',
  'zielstrebig',
  'fokussiert',
  'engagiert',
  'engagement',
  'leidenschaft',
  'leidenschaftlich',
  'begeisterung',
  'motivation',

  // Learning & growth
  'gelernt',
  'weiterentwickelt',
  'angeeignet',
  'verbessert',
  'fortgebildet',
  'qualifiziert',
] as const;

/**
 * Categories of strengths for better organization
 */
export const STRENGTH_CATEGORIES: Record<string, ReadonlyArray<string>> = {
  organization: [
    'organisiert',
    'organisation',
    'strukturiert',
    'strukturieren',
    'zuverlässig',
    'zuverlässigkeit',
  ],
  communication: [
    'kommunikativ',
    'kommunikation',
    'überzeugt',
    'überzeugen',
    'empathisch',
    'empathie',
  ],
  problemSolving: [
    'analytisch',
    'analyse',
    'problemlösung',
    'lösungsorientiert',
    'lösung gefunden',
    'problem gelöst',
  ],
  creativity: ['kreativ', 'kreativität', 'innovativ', 'innovation'],
  leadership: [
    'führungsstark',
    'führung',
    'leadership',
    'motiviert',
    'motivieren',
    'inspiriert',
    'inspirieren',
  ],
  resilience: [
    'belastbar',
    'belastbarkeit',
    'ausdauer',
    'durchhaltevermögen',
    'hartnäckig',
    'geduldig',
    'geduld',
  ],
  achievement: [
    'geschafft',
    'erreicht',
    'erfolgreich',
    'erfolg',
    'gewonnen',
    'verbessert',
    'gesteigert',
    'optimiert',
  ],
} as const;

// ============================================================================
// Phase Prompts (German)
// ============================================================================

/**
 * Base prompts for each AI phase in German
 *
 * These prompts are designed to guide users through the 4D cycle
 * with warmth and encouragement.
 */
const BASE_PROMPTS: Record<AIPhase, string> = {
  [AIPhase.DISCOVER]:
    'Erzähl mir von einem beruflichen Erfolg, auf den du stolz bist. Was hast du da gut gemacht?',
  [AIPhase.DREAM]:
    'Wenn dein Business in 3 Jahren genau so läuft, wie du es dir wünschst - wie sieht dein Alltag aus?',
  [AIPhase.DESIGN]:
    'Von deinen Stärken (X, Y) zu deinem Traum (Z) - welche Schritte brauchst du?',
  [AIPhase.DESTINY]: 'Was ist der erste Schritt, den du diese Woche machst?',
} as const;

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Gets the AI prompt for a specific phase
 *
 * Returns the German prompt text for the given Appreciative Inquiry phase.
 *
 * @param phase - The AI phase to get the prompt for
 * @returns The German prompt string for that phase
 *
 * @example
 * ```typescript
 * const prompt = getAIPromptForPhase(AIPhase.DISCOVER);
 * // Returns: 'Erzähl mir von einem beruflichen Erfolg, auf den du stolz bist. Was hast du da gut gemacht?'
 * ```
 */
export function getAIPromptForPhase(phase: AIPhase): string {
  return BASE_PROMPTS[phase];
}

/**
 * Gets a personalized AI prompt with context
 *
 * Generates a context-aware prompt that can include the user's name,
 * previously identified strengths, dream vision, etc.
 *
 * @param phase - The AI phase to get the prompt for
 * @param context - Optional context for personalization
 * @returns The personalized German prompt string
 *
 * @example
 * ```typescript
 * const prompt = getPersonalizedAIPrompt(AIPhase.DESIGN, {
 *   userName: 'Maria',
 *   previousStrengths: ['Kommunikation', 'Organisation'],
 *   dreamVision: 'Ein erfolgreiches Coaching-Unternehmen',
 * });
 * // Returns: 'Maria, von deinen Stärken (Kommunikation, Organisation) zu deinem Traum (Ein erfolgreiches Coaching-Unternehmen) - welche Schritte brauchst du?'
 * ```
 */
export function getPersonalizedAIPrompt(
  phase: AIPhase,
  context?: AIPromptContext
): string {
  const basePrompt = BASE_PROMPTS[phase];

  if (!context) {
    return basePrompt;
  }

  const { userName, previousStrengths, dreamVision } = context;

  switch (phase) {
    case AIPhase.DISCOVER: {
      if (userName) {
        return `${userName}, erzähl mir von einem beruflichen Erfolg, auf den du stolz bist. Was hast du da gut gemacht?`;
      }
      return basePrompt;
    }

    case AIPhase.DREAM: {
      const prefix = userName ? `${userName}, w` : 'W';
      return `${prefix}enn dein Business in 3 Jahren genau so läuft, wie du es dir wünschst - wie sieht dein Alltag aus?`;
    }

    case AIPhase.DESIGN: {
      const strengthsList =
        previousStrengths && previousStrengths.length > 0
          ? previousStrengths.join(', ')
          : 'X, Y';
      const dream = dreamVision || 'Z';
      const prefix = userName ? `${userName}, v` : 'V';
      return `${prefix}on deinen Stärken (${strengthsList}) zu deinem Traum (${dream}) - welche Schritte brauchst du?`;
    }

    case AIPhase.DESTINY: {
      if (userName) {
        return `${userName}, was ist der erste Schritt, den du diese Woche machst?`;
      }
      return basePrompt;
    }

    default:
      return basePrompt;
  }
}

/**
 * Extracts strengths from a user's DISCOVER phase response
 *
 * Parses the user's response for strength-related words and phrases,
 * using pattern matching against German strength indicators.
 *
 * @param discoverResponse - The user's response to the DISCOVER prompt
 * @returns Array of identified strength strings
 *
 * @example
 * ```typescript
 * const strengths = extractStrengths(
 *   'Ich habe das Projekt erfolgreich organisiert und das Team motiviert. Meine Kommunikation war sehr gut.'
 * );
 * // Returns: ['organisiert', 'erfolgreich', 'motiviert', 'kommunikation']
 * ```
 */
export function extractStrengths(discoverResponse: string): string[] {
  if (!discoverResponse || discoverResponse.trim().length === 0) {
    return [];
  }

  const normalizedText = discoverResponse.toLowerCase();
  const foundStrengths = new Set<string>();

  for (const indicator of STRENGTH_INDICATORS) {
    if (normalizedText.includes(indicator.toLowerCase())) {
      foundStrengths.add(indicator);
    }
  }

  return Array.from(foundStrengths);
}

/**
 * Extracts strengths with detailed analysis
 *
 * Provides additional context about the extraction including
 * confidence score based on number of matches.
 *
 * @param discoverResponse - The user's response to the DISCOVER prompt
 * @returns DiscoverResult with strengths, original response, and confidence
 *
 * @example
 * ```typescript
 * const result = extractStrengthsWithAnalysis(
 *   'Ich war sehr organisiert und habe das Projekt erfolgreich abgeschlossen.'
 * );
 * // Returns: {
 * //   strengths: ['organisiert', 'erfolgreich'],
 * //   originalResponse: '...',
 * //   confidence: 0.67
 * // }
 * ```
 */
export function extractStrengthsWithAnalysis(
  discoverResponse: string
): DiscoverResult {
  const strengths = extractStrengths(discoverResponse);

  // Confidence is based on number of matches (capped at 1.0)
  // 3+ strengths = high confidence, 1-2 = medium, 0 = low
  const confidence = Math.min(strengths.length / 3, 1);

  return {
    strengths,
    originalResponse: discoverResponse,
    confidence,
  };
}

// ============================================================================
// 4D Cycle Workflow Helpers
// ============================================================================

/**
 * Gets the next phase in the AI cycle
 *
 * @param currentPhase - The current phase
 * @returns The next phase, or null if cycle is complete
 *
 * @example
 * ```typescript
 * const next = getNextPhase(AIPhase.DISCOVER);
 * // Returns: AIPhase.DREAM
 * ```
 */
export function getNextPhase(currentPhase: AIPhase): AIPhase | null {
  const phaseOrder: AIPhase[] = [
    AIPhase.DISCOVER,
    AIPhase.DREAM,
    AIPhase.DESIGN,
    AIPhase.DESTINY,
  ];

  const currentIndex = phaseOrder.indexOf(currentPhase);

  if (currentIndex === -1 || currentIndex === phaseOrder.length - 1) {
    return null;
  }

  const nextPhase = phaseOrder[currentIndex + 1];
  return nextPhase ?? null;
}

/**
 * Gets the previous phase in the AI cycle
 *
 * @param currentPhase - The current phase
 * @returns The previous phase, or null if at start
 *
 * @example
 * ```typescript
 * const prev = getPreviousPhase(AIPhase.DREAM);
 * // Returns: AIPhase.DISCOVER
 * ```
 */
export function getPreviousPhase(currentPhase: AIPhase): AIPhase | null {
  const phaseOrder: AIPhase[] = [
    AIPhase.DISCOVER,
    AIPhase.DREAM,
    AIPhase.DESIGN,
    AIPhase.DESTINY,
  ];

  const currentIndex = phaseOrder.indexOf(currentPhase);

  if (currentIndex <= 0) {
    return null;
  }

  const prevPhase = phaseOrder[currentIndex - 1];
  return prevPhase ?? null;
}

/**
 * Gets the progress percentage through the AI cycle
 *
 * @param currentPhase - The current phase
 * @returns Progress percentage (0-100)
 *
 * @example
 * ```typescript
 * const progress = getPhaseProgress(AIPhase.DESIGN);
 * // Returns: 75
 * ```
 */
export function getPhaseProgress(currentPhase: AIPhase): number {
  const phaseProgress: Record<AIPhase, number> = {
    [AIPhase.DISCOVER]: 25,
    [AIPhase.DREAM]: 50,
    [AIPhase.DESIGN]: 75,
    [AIPhase.DESTINY]: 100,
  };

  return phaseProgress[currentPhase];
}

/**
 * Checks if a phase is the final phase
 *
 * @param phase - The phase to check
 * @returns True if this is the DESTINY phase
 */
export function isFinalPhase(phase: AIPhase): boolean {
  return phase === AIPhase.DESTINY;
}

/**
 * Checks if a phase is the first phase
 *
 * @param phase - The phase to check
 * @returns True if this is the DISCOVER phase
 */
export function isFirstPhase(phase: AIPhase): boolean {
  return phase === AIPhase.DISCOVER;
}

/**
 * Creates an initial AI session state
 *
 * @returns A fresh AISessionState starting at DISCOVER
 *
 * @example
 * ```typescript
 * const session = createAISession();
 * // Returns: {
 * //   currentPhase: AIPhase.DISCOVER,
 * //   strengths: [],
 * //   dreamVision: null,
 * //   pathwaySteps: [],
 * //   firstStep: null,
 * //   isComplete: false,
 * // }
 * ```
 */
export function createAISession(): AISessionState {
  return {
    currentPhase: AIPhase.DISCOVER,
    strengths: [],
    dreamVision: null,
    pathwaySteps: [],
    firstStep: null,
    isComplete: false,
  };
}

/**
 * Advances the AI session to the next phase
 *
 * Updates the session state with phase-specific data and moves to the next phase.
 *
 * @param session - Current session state
 * @param phaseData - Data from the completed phase
 * @returns Updated session state
 *
 * @example
 * ```typescript
 * let session = createAISession();
 * session = advanceAISession(session, {
 *   discoverResponse: 'Ich habe das Projekt erfolgreich organisiert.'
 * });
 * // session.currentPhase is now AIPhase.DREAM
 * // session.strengths contains extracted strengths
 * ```
 */
export function advanceAISession(
  session: AISessionState,
  phaseData: {
    discoverResponse?: string;
    dreamResponse?: string;
    designResponse?: string[];
    destinyResponse?: string;
  }
): AISessionState {
  const newSession = { ...session };

  switch (session.currentPhase) {
    case AIPhase.DISCOVER: {
      if (phaseData.discoverResponse) {
        newSession.strengths = extractStrengths(phaseData.discoverResponse);
      }
      newSession.currentPhase = AIPhase.DREAM;
      break;
    }

    case AIPhase.DREAM: {
      if (phaseData.dreamResponse) {
        newSession.dreamVision = phaseData.dreamResponse;
      }
      newSession.currentPhase = AIPhase.DESIGN;
      break;
    }

    case AIPhase.DESIGN: {
      if (phaseData.designResponse) {
        newSession.pathwaySteps = phaseData.designResponse;
      }
      newSession.currentPhase = AIPhase.DESTINY;
      break;
    }

    case AIPhase.DESTINY: {
      if (phaseData.destinyResponse) {
        newSession.firstStep = phaseData.destinyResponse;
      }
      newSession.isComplete = true;
      break;
    }
  }

  return newSession;
}

/**
 * Gets the phase name in German
 *
 * @param phase - The phase to get the name for
 * @returns German name for the phase
 *
 * @example
 * ```typescript
 * const name = getPhaseNameGerman(AIPhase.DISCOVER);
 * // Returns: 'Entdecken'
 * ```
 */
export function getPhaseNameGerman(phase: AIPhase): string {
  const names: Record<AIPhase, string> = {
    [AIPhase.DISCOVER]: 'Entdecken',
    [AIPhase.DREAM]: 'Träumen',
    [AIPhase.DESIGN]: 'Gestalten',
    [AIPhase.DESTINY]: 'Umsetzen',
  };

  return names[phase];
}

/**
 * Gets a description of what each phase focuses on (in German)
 *
 * @param phase - The phase to describe
 * @returns German description of the phase focus
 */
export function getPhaseDescription(phase: AIPhase): string {
  const descriptions: Record<AIPhase, string> = {
    [AIPhase.DISCOVER]:
      'Wir erkunden deine vergangenen Erfolge und identifizieren deine Stärken.',
    [AIPhase.DREAM]:
      'Wir entwickeln eine Vision für dein ideales Business in der Zukunft.',
    [AIPhase.DESIGN]:
      'Wir gestalten den Weg von deinen Stärken zu deiner Vision.',
    [AIPhase.DESTINY]:
      'Wir definieren den ersten konkreten Schritt auf deinem Weg.',
  };

  return descriptions[phase];
}

/**
 * Categorizes extracted strengths by category
 *
 * @param strengths - Array of strength strings
 * @returns Object mapping categories to strengths
 *
 * @example
 * ```typescript
 * const categorized = categorizeStrengths(['organisiert', 'kommunikation', 'erfolgreich']);
 * // Returns: {
 * //   organization: ['organisiert'],
 * //   communication: ['kommunikation'],
 * //   achievement: ['erfolgreich'],
 * // }
 * ```
 */
export function categorizeStrengths(
  strengths: string[]
): Record<string, string[]> {
  const categorized: Record<string, string[]> = {};

  for (const strength of strengths) {
    const normalizedStrength = strength.toLowerCase();

    for (const [category, indicators] of Object.entries(STRENGTH_CATEGORIES)) {
      if (
        indicators.some((ind) =>
          normalizedStrength.includes(ind.toLowerCase())
        )
      ) {
        if (!categorized[category]) {
          categorized[category] = [];
        }
        if (!categorized[category].includes(strength)) {
          categorized[category].push(strength);
        }
        break;
      }
    }
  }

  return categorized;
}

/**
 * Gets all phase prompts as an ordered array
 *
 * Useful for displaying the full 4D cycle overview.
 *
 * @returns Array of phase-prompt pairs in cycle order
 */
export function getAllPhasePrompts(): Array<{
  phase: AIPhase;
  prompt: string;
  nameGerman: string;
}> {
  return [
    {
      phase: AIPhase.DISCOVER,
      prompt: BASE_PROMPTS[AIPhase.DISCOVER],
      nameGerman: getPhaseNameGerman(AIPhase.DISCOVER),
    },
    {
      phase: AIPhase.DREAM,
      prompt: BASE_PROMPTS[AIPhase.DREAM],
      nameGerman: getPhaseNameGerman(AIPhase.DREAM),
    },
    {
      phase: AIPhase.DESIGN,
      prompt: BASE_PROMPTS[AIPhase.DESIGN],
      nameGerman: getPhaseNameGerman(AIPhase.DESIGN),
    },
    {
      phase: AIPhase.DESTINY,
      prompt: BASE_PROMPTS[AIPhase.DESTINY],
      nameGerman: getPhaseNameGerman(AIPhase.DESTINY),
    },
  ];
}
