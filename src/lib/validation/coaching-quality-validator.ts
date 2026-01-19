/**
 * Coaching Quality Validator (GZ-804)
 *
 * Monitors coaching quality metrics and triggers corrections when quality degrades.
 * Implements automatic prompt injection to maintain coaching standards.
 *
 * Red flags:
 * - autonomy < 2/module
 * - empathy 0 when emotion detected
 * - advice-giving > 3
 *
 * Correction actions:
 * - Inject autonomy prompt when autonomy_instances < 2
 * - Inject empathy prompt when emotion detected but 0 empathy markers
 * - Force summary when > 10 exchanges without
 */

import {
  type CoachingMetrics,
  type QualityWarning,
  getDetailedWarnings,
  calculateCoachingScore,
  QUALITY_THRESHOLDS,
} from '@/lib/coaching/quality-metrics';

// ============================================================================
// Types
// ============================================================================

export interface CorrectionPrompt {
  type: 'autonomy' | 'empathy' | 'summary' | 'advice' | 'questions';
  prompt: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
}

export interface ValidationContext {
  /** Current coaching metrics */
  metrics: CoachingMetrics;
  /** Number of exchanges in current module */
  exchangeCount: number;
  /** Whether emotion was detected in recent user message */
  emotionDetected: boolean;
  /** Exchanges since last reflective summary */
  exchangesSinceLastSummary: number;
}

export interface ValidationResult {
  /** Whether quality is acceptable */
  isAcceptable: boolean;
  /** Overall quality score (0-100) */
  score: number;
  /** Warnings about quality issues */
  warnings: QualityWarning[];
  /** Correction prompts to inject */
  corrections: CorrectionPrompt[];
  /** Summary of issues */
  summary: string;
}

// ============================================================================
// Correction Prompts (German)
// ============================================================================

const CORRECTION_PROMPTS = {
  autonomy: {
    low: `COACHING-HINWEIS: Unterstütze die Autonomie des Nutzers stärker.
Nutze Formulierungen wie:
- "Du entscheidest, wie du das angehen möchtest"
- "Was passt für dich am besten?"
- "Wie siehst du das?"
- "Du kennst deine Situation am besten"`,

    critical: `COACHING-WARNUNG: Autonomie-Unterstützung fehlt komplett!
VERWENDE SOFORT in deiner nächsten Antwort:
- "Du entscheidest..." oder
- "Was ist dir dabei wichtig?" oder
- "Wie möchtest du vorgehen?"
Die Entscheidungen liegen beim Nutzer, nicht bei dir.`,
  },

  empathy: {
    withEmotion: `COACHING-HINWEIS: Emotion erkannt, aber keine Empathie gezeigt!
BEGINNE deine nächste Antwort mit einem Empathie-Marker:
- "Das klingt nach einer herausfordernden Situation..."
- "Ich höre, dass dich das beschäftigt..."
- "Das ist nachvollziehbar, dass du..."
- "Ich verstehe, dass das nicht einfach ist..."`,

    general: `COACHING-HINWEIS: Zeige mehr Empathie.
Nutze Formulierungen wie:
- "Das klingt..."
- "Ich verstehe..."
- "Das ist nachvollziehbar..."`,
  },

  summary: {
    needed: `COACHING-HINWEIS: Es ist Zeit für eine reflektierende Zusammenfassung.
Fasse in deiner nächsten Antwort zusammen:
1. FAKTEN: Was hat der Nutzer gesagt?
2. EMOTIONALES: Welche Gefühle hast du wahrgenommen?
3. STÄRKEN: Was zeigt sich als Stärke?

Schließe mit: "Stimmt das so? Fehlt etwas?"`,
  },

  advice: {
    warning: `COACHING-WARNUNG: Du gibst zu viele Ratschläge!
VERMEIDE Formulierungen wie:
- "Du solltest..."
- "Am besten..."
- "Ich empfehle..."

STATTDESSEN frage:
- "Was denkst du, wäre der nächste Schritt?"
- "Welche Möglichkeiten siehst du?"
- "Was würde für dich am besten funktionieren?"`,

    critical: `COACHING-FEHLER: Zu viele Ratschläge gegeben!
STOPPE sofort mit direktiven Aussagen.
FRAGE stattdessen offene Fragen.
Der Nutzer ist der Experte für sein Leben - du bist nur der Coach.`,
  },

  questions: {
    closedRatio: `COACHING-HINWEIS: Zu viele geschlossene Fragen.
Ersetze geschlossene Fragen (Ja/Nein) durch offene:
- STATT "Hast du Erfahrung?" → "Welche Erfahrungen hast du?"
- STATT "Willst du das?" → "Was möchtest du?"
- STATT "Ist das klar?" → "Was denkst du darüber?"`,
  },
} as const;

// ============================================================================
// Main Validation Function
// ============================================================================

/**
 * Validate coaching quality and generate correction prompts
 */
export function validateCoachingQuality(context: ValidationContext): ValidationResult {
  const { metrics, exchangeCount, emotionDetected, exchangesSinceLastSummary } = context;

  const warnings = getDetailedWarnings(metrics);
  const score = calculateCoachingScore(metrics);
  const corrections: CorrectionPrompt[] = [];

  // Check autonomy
  if (metrics.autonomyInstances < QUALITY_THRESHOLDS.autonomy.minimum) {
    corrections.push({
      type: 'autonomy',
      prompt: metrics.autonomyInstances === 0
        ? CORRECTION_PROMPTS.autonomy.critical
        : CORRECTION_PROMPTS.autonomy.low,
      priority: metrics.autonomyInstances === 0 ? 'high' : 'medium',
      reason: `Autonomie-Instanzen: ${metrics.autonomyInstances} (Minimum: ${QUALITY_THRESHOLDS.autonomy.minimum})`,
    });
  }

  // Check empathy when emotion detected
  if (emotionDetected && metrics.empathyMarkerCount === 0) {
    corrections.push({
      type: 'empathy',
      prompt: CORRECTION_PROMPTS.empathy.withEmotion,
      priority: 'high',
      reason: 'Emotion erkannt aber keine Empathie gezeigt',
    });
  } else if (metrics.empathyMarkerCount < QUALITY_THRESHOLDS.empathyMarkers.minimum && exchangeCount > 3) {
    corrections.push({
      type: 'empathy',
      prompt: CORRECTION_PROMPTS.empathy.general,
      priority: 'medium',
      reason: `Empathie-Marker: ${metrics.empathyMarkerCount} (Minimum: ${QUALITY_THRESHOLDS.empathyMarkers.minimum})`,
    });
  }

  // Check advice giving
  if (metrics.adviceGivingCount > QUALITY_THRESHOLDS.adviceGiving.maximum) {
    corrections.push({
      type: 'advice',
      prompt: metrics.adviceGivingCount > 5
        ? CORRECTION_PROMPTS.advice.critical
        : CORRECTION_PROMPTS.advice.warning,
      priority: metrics.adviceGivingCount > 5 ? 'high' : 'medium',
      reason: `Ratschläge gegeben: ${metrics.adviceGivingCount} (Maximum: ${QUALITY_THRESHOLDS.adviceGiving.maximum})`,
    });
  }

  // Check for summary need (every 7-10 exchanges)
  if (exchangesSinceLastSummary >= 10) {
    corrections.push({
      type: 'summary',
      prompt: CORRECTION_PROMPTS.summary.needed,
      priority: 'medium',
      reason: `${exchangesSinceLastSummary} Austausche seit letzter Zusammenfassung`,
    });
  }

  // Check question quality
  if (
    metrics.openQuestionRatio < QUALITY_THRESHOLDS.openQuestionRatio.minimum &&
    (metrics.openQuestionCount + metrics.closedQuestionCount) > 2
  ) {
    corrections.push({
      type: 'questions',
      prompt: CORRECTION_PROMPTS.questions.closedRatio,
      priority: 'low',
      reason: `Offene Fragen: ${Math.round(metrics.openQuestionRatio * 100)}% (Minimum: ${QUALITY_THRESHOLDS.openQuestionRatio.minimum * 100}%)`,
    });
  }

  // Sort corrections by priority
  corrections.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  // Generate summary
  const summary = generateValidationSummary(score, warnings, corrections);

  return {
    isAcceptable: score >= QUALITY_THRESHOLDS.overallScore.minimum && corrections.filter(c => c.priority === 'high').length === 0,
    score,
    warnings,
    corrections,
    summary,
  };
}

/**
 * Get the highest priority correction prompt (or null if none needed)
 */
export function getQualityCorrectionPrompt(context: ValidationContext): string | null {
  const result = validateCoachingQuality(context);

  if (result.corrections.length === 0) {
    return null;
  }

  // Return the highest priority correction
  const first = result.corrections[0];
  return first ? first.prompt : null;
}

/**
 * Get all correction prompts as a single injection string
 */
export function getAllCorrectionPrompts(context: ValidationContext): string | null {
  const result = validateCoachingQuality(context);

  if (result.corrections.length === 0) {
    return null;
  }

  // Only include high and medium priority corrections
  const relevantCorrections = result.corrections.filter(c => c.priority !== 'low');

  if (relevantCorrections.length === 0) {
    return null;
  }

  const correctionText = relevantCorrections
    .map(c => c.prompt)
    .join('\n\n---\n\n');

  return `\n\n=== COACHING QUALITY CORRECTION ===\n\n${correctionText}\n\n=== END CORRECTION ===`;
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateValidationSummary(
  score: number,
  warnings: QualityWarning[],
  corrections: CorrectionPrompt[]
): string {
  const parts: string[] = [];

  parts.push(`Coaching-Qualität: ${score}/100`);

  if (score >= 75) {
    parts.push('Status: Gut');
  } else if (score >= 50) {
    parts.push('Status: Akzeptabel, Verbesserungen empfohlen');
  } else {
    parts.push('Status: Unzureichend, Korrekturen erforderlich');
  }

  if (warnings.length > 0) {
    parts.push(`Warnungen: ${warnings.length}`);
  }

  if (corrections.length > 0) {
    const highPriority = corrections.filter(c => c.priority === 'high').length;
    if (highPriority > 0) {
      parts.push(`Kritische Korrekturen: ${highPriority}`);
    }
  }

  return parts.join(' | ');
}

// ============================================================================
// Specialized Validators
// ============================================================================

/**
 * Check if autonomy injection is needed
 */
export function needsAutonomyInjection(metrics: CoachingMetrics, exchangeCount: number): boolean {
  // Need injection if autonomy is below minimum and we're past the first few exchanges
  return (
    metrics.autonomyInstances < QUALITY_THRESHOLDS.autonomy.minimum &&
    exchangeCount >= 3
  );
}

/**
 * Check if empathy injection is needed
 */
export function needsEmpathyInjection(
  metrics: CoachingMetrics,
  emotionDetected: boolean
): boolean {
  // Critical: emotion detected but no empathy shown
  if (emotionDetected && metrics.empathyMarkerCount === 0) {
    return true;
  }

  return false;
}

/**
 * Check if summary injection is needed
 */
export function needsSummaryInjection(exchangesSinceLastSummary: number): boolean {
  return exchangesSinceLastSummary >= 10;
}

/**
 * Get autonomy injection prompt
 */
export function getAutonomyInjectionPrompt(metrics: CoachingMetrics): string {
  return metrics.autonomyInstances === 0
    ? CORRECTION_PROMPTS.autonomy.critical
    : CORRECTION_PROMPTS.autonomy.low;
}

/**
 * Get empathy injection prompt
 */
export function getEmpathyInjectionPrompt(emotionDetected: boolean): string {
  return emotionDetected
    ? CORRECTION_PROMPTS.empathy.withEmotion
    : CORRECTION_PROMPTS.empathy.general;
}

/**
 * Get summary injection prompt
 */
export function getSummaryInjectionPrompt(): string {
  return CORRECTION_PROMPTS.summary.needed;
}

// ============================================================================
// Exports
// ============================================================================

export { CORRECTION_PROMPTS, QUALITY_THRESHOLDS };
