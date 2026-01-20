/**
 * Empathy Response Patterns for MI-based Coaching
 *
 * SPEC REFERENCE: gz-coaching-mi.md (Motivational Interviewing)
 *
 * Generates empathetic responses following the MI pattern:
 * [Emotion Label] + [Validation] + [Normalization] + [Pivot]
 *
 * These responses are designed to:
 * - Acknowledge and validate the user's emotional state
 * - Normalize their experience (many founders feel this way)
 * - Pivot toward constructive next steps
 */

import { type Emotion } from './emotion-detection';

// ============================================================================
// Types
// ============================================================================

/**
 * Structure of an empathy response pattern
 */
export interface EmpathyPattern {
  emotion: Emotion;
  label: string;
  validation: string;
  normalization: string;
  pivot: string;
}

/**
 * German labels for each emotion type
 */
const EMOTION_LABELS: Record<Emotion, string> = {
  uncertainty: 'Unsicherheit',
  ambivalence: 'Zwiespalt',
  anxiety: 'Angst',
  frustration: 'Frustration',
  excitement: 'Begeisterung',
  confidence: 'Zuversicht',
};

// ============================================================================
// Empathy Response Patterns (German)
// Following MI Structure: Label + Validation + Normalization + Pivot
// ============================================================================

const EMPATHY_RESPONSES: Record<Emotion, EmpathyPattern> = {
  uncertainty: {
    emotion: 'uncertainty',
    label: 'Unsicherheit',
    validation: 'Es ist verständlich, dass du dir unsicher bist.',
    normalization: 'Bei einer so wichtigen Entscheidung geht es vielen so.',
    pivot: 'Lass uns gemeinsam schauen, was dir mehr Klarheit geben könnte.',
  },

  ambivalence: {
    emotion: 'ambivalence',
    label: 'Zwiespalt',
    validation: 'Ich höre, dass du hin- und hergerissen bist.',
    normalization: 'Das zeigt, dass du die Sache ernst nimmst.',
    pivot: 'Was spricht für dich am stärksten dafür, was dagegen?',
  },

  anxiety: {
    emotion: 'anxiety',
    label: 'Angst',
    validation: 'Angst ist eine völlig normale Reaktion bei so einer großen Entscheidung.',
    normalization: 'Die meisten Gründer fühlen das am Anfang.',
    pivot: 'Lass uns schauen, was diese Angst konkret auslöst.',
  },

  frustration: {
    emotion: 'frustration',
    label: 'Frustration',
    validation: 'Das klingt wirklich frustrierend.',
    normalization: 'Es ist okay, wenn sich manche Dinge schwierig anfühlen.',
    pivot: 'Was genau macht dir gerade am meisten zu schaffen?',
  },

  excitement: {
    emotion: 'excitement',
    label: 'Begeisterung',
    validation: 'Deine Begeisterung ist ansteckend!',
    normalization: 'Diese Energie ist wertvoll für dein Vorhaben.',
    pivot: 'Was begeistert dich am meisten daran?',
  },

  confidence: {
    emotion: 'confidence',
    label: 'Zuversicht',
    validation: 'Es freut mich, dass du dir so sicher bist.',
    normalization: 'Diese Überzeugung ist ein wichtiger Antrieb.',
    pivot: 'Woher kommt diese Überzeugung?',
  },
};

// ============================================================================
// Empathy Response Functions
// ============================================================================

/**
 * Generate a full empathy response for the detected emotion
 *
 * Following MI structure: [Validation] + [Normalization] + [Pivot]
 *
 * @param emotion - The detected emotion type
 * @returns The complete empathy response in German
 */
export function generateEmpathyResponse(emotion: Emotion): string {
  const pattern = EMPATHY_RESPONSES[emotion];

  // Combine: Validation + Normalization + Pivot
  return `${pattern.validation} ${pattern.normalization} ${pattern.pivot}`;
}

/**
 * Get the German label for an emotion type
 *
 * @param emotion - The emotion type
 * @returns German label for the emotion
 */
export function getEmotionLabel(emotion: Emotion): string {
  return EMOTION_LABELS[emotion];
}

/**
 * Get the full empathy pattern structure for an emotion
 *
 * @param emotion - The emotion type
 * @returns The complete empathy pattern with all components
 */
export function getEmpathyPattern(emotion: Emotion): EmpathyPattern {
  return EMPATHY_RESPONSES[emotion];
}

/**
 * Get just the validation component of the empathy response
 *
 * @param emotion - The emotion type
 * @returns Validation statement in German
 */
export function getValidationStatement(emotion: Emotion): string {
  return EMPATHY_RESPONSES[emotion].validation;
}

/**
 * Get just the normalization component of the empathy response
 *
 * @param emotion - The emotion type
 * @returns Normalization statement in German
 */
export function getNormalizationStatement(emotion: Emotion): string {
  return EMPATHY_RESPONSES[emotion].normalization;
}

/**
 * Get just the pivot question/statement
 *
 * @param emotion - The emotion type
 * @returns Pivot question in German
 */
export function getPivotQuestion(emotion: Emotion): string {
  return EMPATHY_RESPONSES[emotion].pivot;
}

/**
 * Get all empathy patterns for reference
 *
 * @returns All empathy patterns mapped by emotion
 */
export function getAllEmpathyPatterns(): Record<Emotion, EmpathyPattern> {
  return { ...EMPATHY_RESPONSES };
}

/**
 * Get all emotion labels for reference
 *
 * @returns All emotion labels mapped by emotion
 */
export function getAllEmotionLabels(): Record<Emotion, string> {
  return { ...EMOTION_LABELS };
}

// ============================================================================
// Intensity-Aware Responses
// ============================================================================

/**
 * Generate an intensity-aware empathy response
 *
 * Higher intensity emotions get stronger validation
 *
 * @param emotion - The detected emotion type
 * @param intensity - The intensity level (low, medium, high)
 * @returns Intensity-appropriate empathy response
 */
export function generateIntensityAwareResponse(
  emotion: Emotion,
  intensity: 'low' | 'medium' | 'high'
): string {
  const pattern = EMPATHY_RESPONSES[emotion];

  // Add intensity prefix for high intensity emotions
  if (intensity === 'high') {
    const intensityPrefix = getIntensityPrefix(emotion);
    return `${intensityPrefix} ${pattern.validation} ${pattern.normalization} ${pattern.pivot}`;
  }

  // Standard response for medium/low intensity
  return generateEmpathyResponse(emotion);
}

/**
 * Get intensity prefix for high-intensity emotions
 */
function getIntensityPrefix(emotion: Emotion): string {
  switch (emotion) {
    case 'uncertainty':
      return 'Ich spüre, dass dich das wirklich beschäftigt.';
    case 'ambivalence':
      return 'Ich kann hören, wie sehr dich das hin- und herreißt.';
    case 'anxiety':
      return 'Ich nehme diese Sorgen sehr ernst.';
    case 'frustration':
      return 'Ich verstehe, dass das gerade wirklich schwer für dich ist.';
    case 'excitement':
      return 'Was für eine tolle Energie!';
    case 'confidence':
      return 'Diese klare Entschlossenheit ist beeindruckend.';
    default:
      return '';
  }
}

// ============================================================================
// Combined Emotion + Empathy Helper
// ============================================================================

/**
 * Combined result of emotion detection and empathy generation
 */
export interface EmotionEmpathyResult {
  emotion: Emotion;
  label: string;
  empathyResponse: string;
  pattern: EmpathyPattern;
}

/**
 * Generate complete emotion + empathy result
 *
 * @param emotion - The detected emotion
 * @returns Combined emotion and empathy information
 */
export function getEmotionEmpathyResult(emotion: Emotion): EmotionEmpathyResult {
  return {
    emotion,
    label: getEmotionLabel(emotion),
    empathyResponse: generateEmpathyResponse(emotion),
    pattern: getEmpathyPattern(emotion),
  };
}
