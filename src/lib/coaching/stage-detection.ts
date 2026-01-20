/**
 * TTM Stage Detection System (GZ-201)
 *
 * Implements the Transtheoretical Model (TTM) stage detection
 * that analyzes user language to classify readiness for change.
 *
 * Based on Prochaska & DiClemente's research on behavioral change stages.
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Message format for stage detection
 */
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * TTM Stages of Change
 *
 * - PRECONTEMPLATION: Not considering change, unaware of need
 * - CONTEMPLATION: Aware but ambivalent, weighing pros/cons
 * - PREPARATION: Planning to act soon, gathering resources
 * - ACTION: Actively implementing changes
 * - MAINTENANCE: Sustaining changes, preventing relapse
 */
export enum Stage {
  PRECONTEMPLATION = 'PRECONTEMPLATION',
  CONTEMPLATION = 'CONTEMPLATION',
  PREPARATION = 'PREPARATION',
  ACTION = 'ACTION',
  MAINTENANCE = 'MAINTENANCE',
}

/**
 * Coaching depth levels based on stage
 */
export type CoachingDepth = 'shallow' | 'medium' | 'deep';

// ============================================================================
// Language Indicators (German)
// ============================================================================

/**
 * German language indicators for each TTM stage
 *
 * These patterns are designed to detect readiness signals
 * in German-speaking Grundungszuschuss applicants.
 */
export const STAGE_INDICATORS: Record<Stage, string[]> = {
  [Stage.PRECONTEMPLATION]: [
    'weiß nicht',
    'weiss nicht',
    'unsicher',
    'vielleicht',
    'keine ahnung',
    'bin mir nicht sicher',
  ],
  [Stage.CONTEMPLATION]: [
    'einerseits',
    'andererseits',
    'aber',
    'angst',
    'risiko',
    'könnte',
    'koennte',
    'würde',
    'wuerde',
  ],
  [Stage.PREPARATION]: [
    'ich plane',
    'nächsten monat',
    'naechsten monat',
    'konkret',
    'erste schritte',
    'habe vor',
  ],
  [Stage.ACTION]: [
    'ich habe schon',
    'bin dabei',
    'läuft bereits',
    'laeuft bereits',
    'mache gerade',
  ],
  [Stage.MAINTENANCE]: [
    'seit monaten',
    'routinemäßig',
    'routinemaessig',
    'etabliert',
  ],
};

/**
 * Mapping from stage to coaching depth
 *
 * Based on acceptance criteria:
 * - PRECONTEMPLATION: 'shallow' (gentle exploration)
 * - CONTEMPLATION: 'medium' (develop discrepancy)
 * - PREPARATION: 'deep' (concrete planning)
 * - ACTION: 'medium' (support and validate)
 * - MAINTENANCE: 'shallow' (reinforce)
 */
export const STAGE_TO_DEPTH: Record<Stage, CoachingDepth> = {
  [Stage.PRECONTEMPLATION]: 'shallow',
  [Stage.CONTEMPLATION]: 'medium',
  [Stage.PREPARATION]: 'deep',
  [Stage.ACTION]: 'medium',
  [Stage.MAINTENANCE]: 'shallow',
};

// ============================================================================
// Stage Detection
// ============================================================================

/**
 * Result of stage indicator matching
 */
interface StageMatch {
  stage: Stage;
  matchCount: number;
  indicators: string[];
}

/**
 * Counts indicator matches for a given stage in the provided text
 */
function countIndicatorMatches(text: string, stage: Stage): StageMatch {
  const indicators = STAGE_INDICATORS[stage];
  const matchedIndicators: string[] = [];
  let matchCount = 0;

  for (const indicator of indicators) {
    // Check if indicator appears in text (case-insensitive)
    if (text.includes(indicator)) {
      matchCount++;
      matchedIndicators.push(indicator);
    }
  }

  return {
    stage,
    matchCount,
    indicators: matchedIndicators,
  };
}

/**
 * Extracts user messages from a message array
 */
function extractUserMessages(messages: Message[]): string[] {
  return messages
    .filter((msg) => msg.role === 'user')
    .map((msg) => msg.content);
}

/**
 * Combines multiple text strings into a single lowercase string for analysis
 */
function combineTexts(texts: string[]): string {
  return texts.join(' ').toLowerCase();
}

/**
 * Detects the TTM stage from a list of messages
 *
 * Analyzes user messages for language patterns that indicate
 * their readiness stage according to the Transtheoretical Model.
 *
 * Detection algorithm:
 * 1. Extract all user messages
 * 2. Combine into single lowercase text for analysis
 * 3. Count indicator matches for each stage
 * 4. Return stage with highest match count
 * 5. Default to CONTEMPLATION if no matches or tie
 *
 * @param messages - Array of chat messages to analyze
 * @returns The detected TTM stage
 *
 * @example
 * ```typescript
 * const messages: Message[] = [
 *   { role: 'user', content: 'Ich plane mein Unternehmen nächsten Monat zu starten' },
 *   { role: 'assistant', content: 'Das klingt gut!' },
 * ];
 *
 * const stage = detectStage(messages);
 * // Returns: Stage.PREPARATION
 * ```
 */
export function detectStage(messages: Message[]): Stage {
  // Handle empty messages - default to CONTEMPLATION
  if (messages.length === 0) {
    return Stage.CONTEMPLATION;
  }

  // Extract only user messages for analysis
  const userMessages = extractUserMessages(messages);

  // If no user messages, default to CONTEMPLATION
  if (userMessages.length === 0) {
    return Stage.CONTEMPLATION;
  }

  // Combine all user text for analysis
  const combinedText = combineTexts(userMessages);

  // If combined text is empty, default to CONTEMPLATION
  if (combinedText.trim().length === 0) {
    return Stage.CONTEMPLATION;
  }

  // Count matches for each stage
  const matches: StageMatch[] = [
    countIndicatorMatches(combinedText, Stage.PRECONTEMPLATION),
    countIndicatorMatches(combinedText, Stage.CONTEMPLATION),
    countIndicatorMatches(combinedText, Stage.PREPARATION),
    countIndicatorMatches(combinedText, Stage.ACTION),
    countIndicatorMatches(combinedText, Stage.MAINTENANCE),
  ];

  // Find stage with highest match count
  // We know matches always has 5 elements, so reduce is safe here
  const maxMatch = matches.reduce((best, current) =>
    current.matchCount > best.matchCount ? current : best
  );

  // If no matches found, default to CONTEMPLATION
  if (maxMatch.matchCount === 0) {
    return Stage.CONTEMPLATION;
  }

  return maxMatch.stage;
}

// ============================================================================
// Coaching Depth
// ============================================================================

/**
 * Gets the appropriate coaching depth for a TTM stage
 *
 * Coaching depth determines how intensively the AI coach
 * should engage with the user:
 *
 * - 'shallow': Gentle exploration, reinforcement, simple questions
 * - 'medium': Moderate depth, develop discrepancy, validation
 * - 'deep': Intensive engagement, concrete planning, detailed exploration
 *
 * @param stage - The TTM stage to get depth for
 * @returns The coaching depth for that stage
 *
 * @example
 * ```typescript
 * const depth = getCoachingDepthForStage(Stage.PREPARATION);
 * // Returns: 'deep'
 * ```
 */
export function getCoachingDepthForStage(stage: Stage): CoachingDepth {
  return STAGE_TO_DEPTH[stage];
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Gets all indicator patterns for a specific stage
 *
 * Useful for debugging or displaying what patterns
 * the system is looking for.
 *
 * @param stage - The stage to get indicators for
 * @returns Array of indicator strings
 */
export function getIndicatorsForStage(stage: Stage): string[] {
  return [...STAGE_INDICATORS[stage]];
}

/**
 * Analyzes messages and returns detailed detection results
 *
 * Provides insights into which indicators were matched
 * for each stage. Useful for debugging and observability.
 *
 * @param messages - Messages to analyze
 * @returns Object with detected stage and match details
 */
export function analyzeStageDetection(messages: Message[]): {
  detectedStage: Stage;
  coachingDepth: CoachingDepth;
  matchDetails: StageMatch[];
  userMessageCount: number;
} {
  const userMessages = extractUserMessages(messages);
  const combinedText = combineTexts(userMessages);

  const matchDetails: StageMatch[] = [
    countIndicatorMatches(combinedText, Stage.PRECONTEMPLATION),
    countIndicatorMatches(combinedText, Stage.CONTEMPLATION),
    countIndicatorMatches(combinedText, Stage.PREPARATION),
    countIndicatorMatches(combinedText, Stage.ACTION),
    countIndicatorMatches(combinedText, Stage.MAINTENANCE),
  ];

  const detectedStage = detectStage(messages);
  const coachingDepth = getCoachingDepthForStage(detectedStage);

  return {
    detectedStage,
    coachingDepth,
    matchDetails,
    userMessageCount: userMessages.length,
  };
}
