/**
 * Emotion Detection Module for MI-based Coaching
 *
 * SPEC REFERENCE: gz-coaching-mi.md (Motivational Interviewing)
 *
 * Detects emotional signals in German-language user messages to trigger
 * appropriate empathetic responses following MI principles.
 *
 * Emotions detected:
 * - uncertainty: User is unsure, lacks clarity
 * - ambivalence: User is torn between options
 * - anxiety: User expresses fear or worry
 * - frustration: User shows irritation or difficulty
 * - excitement: User shows enthusiasm
 * - confidence: User demonstrates certainty
 */

// ============================================================================
// Types
// ============================================================================

/**
 * Emotion types that can be detected in user messages
 */
export type Emotion =
  | 'uncertainty'
  | 'ambivalence'
  | 'anxiety'
  | 'frustration'
  | 'excitement'
  | 'confidence';

/**
 * Intensity level of detected emotion
 */
export type EmotionIntensity = 'low' | 'medium' | 'high';

/**
 * Result of emotion detection
 */
export interface EmotionDetectionResult {
  emotion: Emotion | null;
  intensity: EmotionIntensity | null;
  matchedSignals: string[];
  intensityMarkers: string[];
}

/**
 * Signal pattern for emotion detection
 */
interface EmotionSignal {
  pattern: RegExp;
  weight: number;
  signal: string;
}

// ============================================================================
// Detection Signals (German Language)
// ============================================================================

/**
 * Uncertainty signals - User is unsure or lacks clarity
 */
const UNCERTAINTY_SIGNALS: EmotionSignal[] = [
  { pattern: /\bweiß\s+nicht\b/i, weight: 3, signal: 'weiß nicht' },
  { pattern: /\bunsicher\b/i, weight: 3, signal: 'unsicher' },
  { pattern: /\bvielleicht\b/i, weight: 2, signal: 'vielleicht' },
  { pattern: /\bkeine\s+ahnung\b/i, weight: 3, signal: 'keine Ahnung' },
  { pattern: /\?{2,}/g, weight: 2, signal: 'multiple ?' },
  { pattern: /\bbin\s+mir\s+nicht\s+sicher\b/i, weight: 3, signal: 'bin mir nicht sicher' },
  { pattern: /\bwüsste\s+nicht\b/i, weight: 3, signal: 'wüsste nicht' },
  { pattern: /\bkann\s+sein\b/i, weight: 1, signal: 'kann sein' },
  { pattern: /\bmöglicherweise\b/i, weight: 2, signal: 'möglicherweise' },
  { pattern: /\beventuell\b/i, weight: 2, signal: 'eventuell' },
  { pattern: /\bunklar\b/i, weight: 2, signal: 'unklar' },
];

/**
 * Ambivalence signals - User is torn between options
 */
const AMBIVALENCE_SIGNALS: EmotionSignal[] = [
  { pattern: /\beinerseits\b/i, weight: 3, signal: 'einerseits' },
  { pattern: /\bandererseits\b/i, weight: 3, signal: 'andererseits' },
  { pattern: /\baber\b/i, weight: 1, signal: 'aber' },
  { pattern: /\bobwohl\b/i, weight: 2, signal: 'obwohl' },
  { pattern: /\bjedoch\b/i, weight: 2, signal: 'jedoch' },
  { pattern: /\bhin-?\s*und\s*her\b/i, weight: 3, signal: 'hin und her' },
  { pattern: /\bzwei\s+seelen\b/i, weight: 3, signal: 'zwei Seelen' },
  { pattern: /\bgespalten\b/i, weight: 3, signal: 'gespalten' },
  { pattern: /\bauf\s+der\s+einen\s+seite\b/i, weight: 3, signal: 'auf der einen Seite' },
  { pattern: /\bauf\s+der\s+anderen\s+seite\b/i, weight: 3, signal: 'auf der anderen Seite' },
  { pattern: /\bteil\s+von\s+mir\b/i, weight: 2, signal: 'Teil von mir' },
];

/**
 * Anxiety signals - User expresses fear or worry
 */
const ANXIETY_SIGNALS: EmotionSignal[] = [
  { pattern: /\bangst\b/i, weight: 3, signal: 'Angst' },
  { pattern: /\bsorge\b/i, weight: 3, signal: 'Sorge' },
  { pattern: /\bsorgen\b/i, weight: 3, signal: 'Sorgen' },
  { pattern: /\bbefürchte\b/i, weight: 3, signal: 'befürchte' },
  { pattern: /\bnervös\b/i, weight: 3, signal: 'nervös' },
  { pattern: /\brisiko\b/i, weight: 2, signal: 'Risiko' },
  { pattern: /\bscheitern\b/i, weight: 3, signal: 'scheitern' },
  { pattern: /\bfürchte\b/i, weight: 3, signal: 'fürchte' },
  { pattern: /\bbange\b/i, weight: 2, signal: 'bange' },
  { pattern: /\bunruhig\b/i, weight: 2, signal: 'unruhig' },
  { pattern: /\bmacht\s+mir\s+(angst|sorgen)\b/i, weight: 3, signal: 'macht mir Angst/Sorgen' },
  { pattern: /\bwas\s+ist,\s+wenn\b/i, weight: 2, signal: 'was ist wenn' },
  { pattern: /\bschlimmstenfalls\b/i, weight: 2, signal: 'schlimmstenfalls' },
  { pattern: /\bschief\s+gehen\b/i, weight: 3, signal: 'schief gehen' },
];

/**
 * Frustration signals - User shows irritation or difficulty
 */
const FRUSTRATION_SIGNALS: EmotionSignal[] = [
  { pattern: /\bfrustriert\b/i, weight: 3, signal: 'frustriert' },
  { pattern: /\bgenervt\b/i, weight: 3, signal: 'genervt' },
  { pattern: /\bschwierig\b/i, weight: 2, signal: 'schwierig' },
  { pattern: /\bkompliziert\b/i, weight: 2, signal: 'kompliziert' },
  { pattern: /\bverstehe\s+nicht\b/i, weight: 3, signal: 'verstehe nicht' },
  { pattern: /\bfrustrierend\b/i, weight: 3, signal: 'frustrierend' },
  { pattern: /\bnervig\b/i, weight: 3, signal: 'nervig' },
  { pattern: /(?:^|\W)ätzend(?:\W|$)/i, weight: 3, signal: 'ätzend' },
  { pattern: /\bgenug\b/i, weight: 1, signal: 'genug' },
  { pattern: /\bklappt\s+nicht\b/i, weight: 3, signal: 'klappt nicht' },
  { pattern: /\bfunktioniert\s+nicht\b/i, weight: 3, signal: 'funktioniert nicht' },
  { pattern: /\bstecke\s+fest\b/i, weight: 3, signal: 'stecke fest' },
  { pattern: /\bkomme\s+nicht\s+weiter\b/i, weight: 3, signal: 'komme nicht weiter' },
  { pattern: /\bmühsam\b/i, weight: 2, signal: 'mühsam' },
];

/**
 * Excitement signals - User shows enthusiasm
 */
const EXCITEMENT_SIGNALS: EmotionSignal[] = [
  { pattern: /\bfreue\s+mich\b/i, weight: 3, signal: 'freue mich' },
  { pattern: /\bbegeistert\b/i, weight: 3, signal: 'begeistert' },
  { pattern: /\bmotiviert\b/i, weight: 3, signal: 'motiviert' },
  { pattern: /\bkann\s+es\s+kaum\s+erwarten\b/i, weight: 3, signal: 'kann es kaum erwarten' },
  { pattern: /\btoll\b/i, weight: 2, signal: 'toll' },
  { pattern: /\bsuper\b/i, weight: 2, signal: 'super' },
  { pattern: /\bgenial\b/i, weight: 3, signal: 'genial' },
  { pattern: /\baufgeregt\b/i, weight: 2, signal: 'aufgeregt' },
  { pattern: /\bgespannt\b/i, weight: 2, signal: 'gespannt' },
  { pattern: /\bfantastisch\b/i, weight: 3, signal: 'fantastisch' },
  { pattern: /\bwunderbar\b/i, weight: 2, signal: 'wunderbar' },
  { pattern: /\bendlich\b/i, weight: 2, signal: 'endlich' },
  { pattern: /\blust\s+(auf|darauf)\b/i, weight: 2, signal: 'Lust auf' },
];

/**
 * Confidence signals - User demonstrates certainty
 */
const CONFIDENCE_SIGNALS: EmotionSignal[] = [
  { pattern: /\bsicher\b/i, weight: 2, signal: 'sicher' },
  { pattern: /(?:^|\W)überzeugt(?:\W|$)/i, weight: 3, signal: 'überzeugt' },
  { pattern: /\bweiß\s+genau\b/i, weight: 3, signal: 'weiß genau' },
  { pattern: /\bklar\b/i, weight: 2, signal: 'klar' },
  { pattern: /\bdefinitiv\b/i, weight: 3, signal: 'definitiv' },
  { pattern: /\bauf\s+jeden\s+fall\b/i, weight: 3, signal: 'auf jeden Fall' },
  { pattern: /\bganz\s+sicher\b/i, weight: 3, signal: 'ganz sicher' },
  { pattern: /\bkeine\s+frage\b/i, weight: 3, signal: 'keine Frage' },
  { pattern: /\bsteht\s+fest\b/i, weight: 3, signal: 'steht fest' },
  { pattern: /\bich\s+weiß\b(?!\s+nicht)/i, weight: 2, signal: 'ich weiß' },
  { pattern: /\bselbstverständlich\b/i, weight: 2, signal: 'selbstverständlich' },
];

/**
 * Map of emotion to signals
 */
const EMOTION_SIGNALS: Record<Emotion, EmotionSignal[]> = {
  uncertainty: UNCERTAINTY_SIGNALS,
  ambivalence: AMBIVALENCE_SIGNALS,
  anxiety: ANXIETY_SIGNALS,
  frustration: FRUSTRATION_SIGNALS,
  excitement: EXCITEMENT_SIGNALS,
  confidence: CONFIDENCE_SIGNALS,
};

// ============================================================================
// Intensity Markers
// ============================================================================

/**
 * Patterns that indicate higher emotional intensity
 */
const INTENSITY_MARKERS: { pattern: RegExp; marker: string; boost: number }[] = [
  { pattern: /!{2,}/g, marker: 'multiple !', boost: 1 },
  { pattern: /!(?!\?)/, marker: 'exclamation', boost: 0.5 },
  { pattern: /\?{2,}/g, marker: 'multiple ?', boost: 1 },
  { pattern: /[A-ZÄÖÜ]{3,}/g, marker: 'CAPS', boost: 1 },
  { pattern: /(\b\w+\b)(\s+\1){1,}/gi, marker: 'repetition', boost: 1 },
  { pattern: /\b(sehr|wirklich|echt|total|absolut|extrem|richtig)\b/gi, marker: 'intensifier', boost: 0.5 },
  { pattern: /\.\.\./g, marker: 'ellipsis', boost: 0.3 },
];

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Calculate emotion score based on matched signals
 */
function calculateEmotionScore(message: string, signals: EmotionSignal[]): { score: number; matches: string[] } {
  let score = 0;
  const matches: string[] = [];

  for (const { pattern, weight, signal } of signals) {
    const match = message.match(pattern);
    if (match) {
      score += weight;
      matches.push(signal);
    }
  }

  return { score, matches };
}

/**
 * Detect intensity markers in message
 */
function detectIntensityMarkers(message: string): { markers: string[]; totalBoost: number } {
  const markers: string[] = [];
  let totalBoost = 0;

  for (const { pattern, marker, boost } of INTENSITY_MARKERS) {
    if (pattern.test(message)) {
      markers.push(marker);
      totalBoost += boost;
    }
    // Reset lastIndex for global patterns
    pattern.lastIndex = 0;
  }

  return { markers, totalBoost };
}

/**
 * Determine intensity based on score and markers
 */
function determineIntensity(score: number, intensityBoost: number): EmotionIntensity {
  const adjustedScore = score + intensityBoost;

  if (adjustedScore >= 6) {
    return 'high';
  } else if (adjustedScore >= 3) {
    return 'medium';
  } else {
    return 'low';
  }
}

/**
 * Detect the primary emotion in a user message
 *
 * @param message - The user's message text (German language)
 * @returns The detected emotion or null if no clear emotion detected
 */
export function detectEmotion(message: string): Emotion | null {
  const result = detectEmotionWithDetails(message);
  return result.emotion;
}

/**
 * Detect emotion with full details including intensity and matched signals
 *
 * @param message - The user's message text (German language)
 * @returns Full detection result with emotion, intensity, and matched signals
 */
export function detectEmotionWithDetails(message: string): EmotionDetectionResult {
  if (!message || message.trim().length === 0) {
    return {
      emotion: null,
      intensity: null,
      matchedSignals: [],
      intensityMarkers: [],
    };
  }

  const normalizedMessage = message.toLowerCase().trim();

  // Calculate scores for each emotion
  const emotionScores: { emotion: Emotion; score: number; matches: string[] }[] = [];

  for (const [emotion, signals] of Object.entries(EMOTION_SIGNALS) as [Emotion, EmotionSignal[]][]) {
    const { score, matches } = calculateEmotionScore(normalizedMessage, signals);
    if (score > 0) {
      emotionScores.push({ emotion, score, matches });
    }
  }

  // No emotion detected
  if (emotionScores.length === 0) {
    return {
      emotion: null,
      intensity: null,
      matchedSignals: [],
      intensityMarkers: [],
    };
  }

  // Find the emotion with highest score
  emotionScores.sort((a, b) => b.score - a.score);
  const dominant = emotionScores[0]!;

  // Detect intensity markers
  const { markers, totalBoost } = detectIntensityMarkers(message);

  // Determine intensity
  const intensity = determineIntensity(dominant.score, totalBoost);

  return {
    emotion: dominant.emotion,
    intensity,
    matchedSignals: dominant.matches,
    intensityMarkers: markers,
  };
}

/**
 * Check if message contains any emotion signal
 *
 * @param message - The user's message text
 * @returns True if any emotion is detected
 */
export function hasEmotionSignal(message: string): boolean {
  return detectEmotion(message) !== null;
}

/**
 * Detect all emotions present in a message (not just the dominant one)
 *
 * @param message - The user's message text
 * @returns Array of detected emotions with their scores
 */
export function detectAllEmotions(message: string): { emotion: Emotion; score: number; matches: string[] }[] {
  if (!message || message.trim().length === 0) {
    return [];
  }

  const normalizedMessage = message.toLowerCase().trim();
  const results: { emotion: Emotion; score: number; matches: string[] }[] = [];

  for (const [emotion, signals] of Object.entries(EMOTION_SIGNALS) as [Emotion, EmotionSignal[]][]) {
    const { score, matches } = calculateEmotionScore(normalizedMessage, signals);
    if (score > 0) {
      results.push({ emotion, score, matches });
    }
  }

  return results.sort((a, b) => b.score - a.score);
}

/**
 * Get all emotion types for reference
 */
export function getAllEmotionTypes(): Emotion[] {
  return ['uncertainty', 'ambivalence', 'anxiety', 'frustration', 'excitement', 'confidence'];
}
