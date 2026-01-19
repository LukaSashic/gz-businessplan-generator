/**
 * Coaching Quality Metrics Tracker
 *
 * Tracks coaching quality metrics including SDT fulfillment,
 * question quality, empathy markers, change talk ratio, and anti-patterns.
 *
 * GZ-205: Coaching quality metrics tracker
 */

// ============================================================================
// Types
// ============================================================================

export interface CoachingMetrics {
  // SDT Metrics (targets)
  autonomyInstances: number;      // target ≥5 per module
  competenceInstances: number;    // target ≥3 per module
  relatednessInstances: number;   // target ≥2 per module

  // Question Quality
  openQuestionCount: number;
  closedQuestionCount: number;
  openQuestionRatio: number;      // target ≥70% (0.7)

  // Empathy
  empathyMarkerCount: number;     // target ≥3 per module

  // MI Change Talk
  changeTalkCount: number;
  sustainTalkCount: number;
  changeTalkRatio: number;        // target > 1.0 (more change than sustain)

  // Anti-patterns (lower is better)
  adviceGivingCount: number;      // target 0
  leadingQuestionCount: number;   // target 0

  // Reflective summaries
  reflectiveSummaryCount: number; // target ≥1 per 7 exchanges
}

export interface MetricUpdate {
  metric: keyof CoachingMetrics;
  increment?: number;
  value?: number;
}

export interface QualityScoreBreakdown {
  sdtScore: number;           // 0-30
  questionScore: number;      // 0-25
  empathyScore: number;       // 0-20
  changeTalkScore: number;    // 0-15
  antiPatternPenalty: number; // negative
  totalScore: number;         // 0-100
}

// ============================================================================
// Detection Patterns (German)
// ============================================================================

// Open question starters (German)
const OPEN_QUESTION_STARTERS = [
  'was ',
  'wie ',
  'welche',
  'wann ',
  'warum ',
  'woher ',
  'wofür ',
  'wozu ',
  'weshalb ',
  'wieso ',
  'woran ',
  'worauf ',
  'womit ',
  'wovon ',
];

// Closed question starters (German)
const CLOSED_QUESTION_STARTERS = [
  'hast du',
  'bist du',
  'kannst du',
  'willst du',
  'möchtest du',
  'wirst du',
  'hattest du',
  'warst du',
  'konntest du',
  'wolltest du',
  'ist das',
  'war das',
  'gibt es',
  'gab es',
  'hättest du',
  'würdest du',
];

// Empathy markers (German)
const EMPATHY_MARKERS = [
  'verstehe',
  'nachvollziehbar',
  'verständlich',
  'normal',
  'geht vielen so',
  'völlig normal',
  'kann ich verstehen',
  'das klingt',
  'ich höre',
  'das ist nachvollziehbar',
  'verständlicherweise',
  'natürlich',
  'das macht sinn',
  'ich kann mir vorstellen',
];

// Advice-giving patterns (German) - ANTI-PATTERN
const ADVICE_GIVING_PATTERNS = [
  'du solltest',
  'du musst',
  'am besten',
  'ich empfehle',
  'mach lieber',
  'du könntest besser',
  'versuch mal',
  'probier doch',
  'an deiner stelle würde ich',
  'mein rat',
  'mein tipp',
  'du brauchst',
];

// Leading question patterns (German) - ANTI-PATTERN
const LEADING_QUESTION_PATTERNS = [
  'findest du nicht auch',
  'meinst du nicht',
  'denkst du nicht',
  'ist es nicht so',
  'wäre es nicht besser',
  'solltest du nicht',
  'hast du schon mal daran gedacht',
  'wäre es nicht sinnvoll',
];

// Autonomy support patterns (German)
const AUTONOMY_SUPPORT_PATTERNS = [
  'du entscheidest',
  'deine wahl',
  'was möchtest du',
  'wie siehst du das',
  'was denkst du',
  'es liegt bei dir',
  'du hast die wahl',
  'ganz wie du möchtest',
  'was ist dir wichtig',
  'was wäre für dich',
  'wie würdest du',
  'was passt für dich',
];

// Competence building patterns (German)
const COMPETENCE_BUILDING_PATTERNS = [
  'du kannst',
  'du hast bereits',
  'deine erfahrung',
  'du weißt',
  'du hast gezeigt',
  'das zeigt',
  'du bist fähig',
  'du hast bewiesen',
  'deine fähigkeit',
  'deine stärke',
  'du hast schon',
  'das hast du gut gemacht',
];

// Relatedness patterns (German)
const RELATEDNESS_PATTERNS = [
  'gemeinsam',
  'zusammen',
  'wir',
  'lass uns',
  'ich begleite',
  'ich bin hier',
  'an deiner seite',
  'nicht allein',
  'ich unterstütze',
  'wir schaffen das',
];

// Change talk indicators (German)
const CHANGE_TALK_INDICATORS = [
  'ich will',
  'ich möchte',
  'ich werde',
  'ich kann',
  'ich muss',
  'ich brauche',
  'ich bin bereit',
  'ich habe beschlossen',
  'ich habe vor',
  'ich plane',
  'ich wünsche',
];

// Sustain talk indicators (German)
const SUSTAIN_TALK_INDICATORS = [
  'kann nicht',
  'unmöglich',
  'zu schwer',
  'nicht bereit',
  'vielleicht später',
  'ich weiß nicht',
  'bin mir nicht sicher',
  'habe angst',
  'zu riskant',
  'keine zeit',
  'kein geld',
  'schaffe ich nicht',
];

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Create initial coaching metrics with all values at zero
 */
export function createInitialMetrics(): CoachingMetrics {
  return {
    autonomyInstances: 0,
    competenceInstances: 0,
    relatednessInstances: 0,
    openQuestionCount: 0,
    closedQuestionCount: 0,
    openQuestionRatio: 0,
    empathyMarkerCount: 0,
    changeTalkCount: 0,
    sustainTalkCount: 0,
    changeTalkRatio: 0,
    adviceGivingCount: 0,
    leadingQuestionCount: 0,
    reflectiveSummaryCount: 0,
  };
}

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Count how many patterns match in text
 */
function countPatterns(text: string, patterns: string[]): number {
  const lowerText = text.toLowerCase();
  return patterns.filter(pattern => lowerText.includes(pattern.toLowerCase())).length;
}

/**
 * Check if a sentence is an open question
 */
function isOpenQuestion(sentence: string): boolean {
  const lowerSentence = sentence.toLowerCase().trim();
  if (!lowerSentence.includes('?')) return false;
  return OPEN_QUESTION_STARTERS.some(starter => lowerSentence.startsWith(starter));
}

/**
 * Check if a sentence is a closed question
 */
function isClosedQuestion(sentence: string): boolean {
  const lowerSentence = sentence.toLowerCase().trim();
  if (!lowerSentence.includes('?')) return false;
  return CLOSED_QUESTION_STARTERS.some(starter => lowerSentence.startsWith(starter));
}

/**
 * Extract questions from text
 */
function extractQuestions(text: string): string[] {
  // Split by ? and keep only parts that are questions
  const parts = text.split('?');
  return parts
    .slice(0, -1) // Remove last part (after last ?)
    .map(part => {
      // Get the last sentence before the ?
      const sentences = part.split(/[.!]/);
      const lastSentence = sentences[sentences.length - 1];
      return (lastSentence?.trim() ?? '') + '?';
    })
    .filter(q => q.length > 1);
}

// ============================================================================
// Main Analysis Function
// ============================================================================

/**
 * Analyze a message and return metric updates
 */
export function analyzeMessage(
  message: string,
  role: 'user' | 'assistant'
): MetricUpdate[] {
  const updates: MetricUpdate[] = [];

  if (role === 'assistant') {
    // Analyze assistant messages for coaching quality

    // Check for open/closed questions
    const questions = extractQuestions(message);
    for (const question of questions) {
      if (isOpenQuestion(question)) {
        updates.push({ metric: 'openQuestionCount', increment: 1 });
      } else if (isClosedQuestion(question)) {
        updates.push({ metric: 'closedQuestionCount', increment: 1 });
      }
    }

    // Check for empathy markers
    const empathyCount = countPatterns(message, EMPATHY_MARKERS);
    if (empathyCount > 0) {
      updates.push({ metric: 'empathyMarkerCount', increment: empathyCount });
    }

    // Check for autonomy support
    const autonomyCount = countPatterns(message, AUTONOMY_SUPPORT_PATTERNS);
    if (autonomyCount > 0) {
      updates.push({ metric: 'autonomyInstances', increment: autonomyCount });
    }

    // Check for competence building
    const competenceCount = countPatterns(message, COMPETENCE_BUILDING_PATTERNS);
    if (competenceCount > 0) {
      updates.push({ metric: 'competenceInstances', increment: competenceCount });
    }

    // Check for relatedness
    const relatednessCount = countPatterns(message, RELATEDNESS_PATTERNS);
    if (relatednessCount > 0) {
      updates.push({ metric: 'relatednessInstances', increment: relatednessCount });
    }

    // Check for anti-patterns
    const adviceCount = countPatterns(message, ADVICE_GIVING_PATTERNS);
    if (adviceCount > 0) {
      updates.push({ metric: 'adviceGivingCount', increment: adviceCount });
    }

    const leadingCount = countPatterns(message, LEADING_QUESTION_PATTERNS);
    if (leadingCount > 0) {
      updates.push({ metric: 'leadingQuestionCount', increment: leadingCount });
    }
  } else {
    // Analyze user messages for change/sustain talk

    // Check for change talk
    const changeTalkCount = countPatterns(message, CHANGE_TALK_INDICATORS);
    if (changeTalkCount > 0) {
      updates.push({ metric: 'changeTalkCount', increment: changeTalkCount });
    }

    // Check for sustain talk
    const sustainTalkCount = countPatterns(message, SUSTAIN_TALK_INDICATORS);
    if (sustainTalkCount > 0) {
      updates.push({ metric: 'sustainTalkCount', increment: sustainTalkCount });
    }
  }

  return updates;
}

/**
 * Apply metric updates to existing metrics
 */
export function applyUpdates(
  metrics: CoachingMetrics,
  updates: MetricUpdate[]
): CoachingMetrics {
  const newMetrics = { ...metrics };

  for (const update of updates) {
    if (update.increment !== undefined) {
      (newMetrics[update.metric] as number) += update.increment;
    } else if (update.value !== undefined) {
      (newMetrics[update.metric] as number) = update.value;
    }
  }

  // Recalculate ratios
  const totalQuestions = newMetrics.openQuestionCount + newMetrics.closedQuestionCount;
  newMetrics.openQuestionRatio = totalQuestions > 0
    ? newMetrics.openQuestionCount / totalQuestions
    : 0;

  const totalTalk = newMetrics.changeTalkCount + newMetrics.sustainTalkCount;
  newMetrics.changeTalkRatio = totalTalk > 0
    ? newMetrics.changeTalkCount / newMetrics.sustainTalkCount || 0
    : 0;

  return newMetrics;
}

// ============================================================================
// Scoring Functions
// ============================================================================

/**
 * Calculate coaching quality score (0-100)
 */
export function calculateCoachingScore(metrics: CoachingMetrics): number {
  const breakdown = calculateScoreBreakdown(metrics);
  return Math.max(0, Math.min(100, Math.round(breakdown.totalScore)));
}

/**
 * Calculate detailed score breakdown
 */
export function calculateScoreBreakdown(metrics: CoachingMetrics): QualityScoreBreakdown {
  // SDT Score (30 points max)
  // Autonomy: 5 points per instance, max 15 (target ≥5)
  const autonomyScore = Math.min(15, (metrics.autonomyInstances / 5) * 15);
  // Competence: 5 points per instance, max 10 (target ≥3)
  const competenceScore = Math.min(10, (metrics.competenceInstances / 3) * 10);
  // Relatedness: 2.5 points per instance, max 5 (target ≥2)
  const relatednessScore = Math.min(5, (metrics.relatednessInstances / 2) * 5);
  const sdtScore = autonomyScore + competenceScore + relatednessScore;

  // Question Quality Score (25 points max)
  // Open question ratio target: ≥70%
  const questionScore = Math.min(25, (metrics.openQuestionRatio / 0.7) * 25);

  // Empathy Score (20 points max)
  // Target: ≥3 empathy markers
  const empathyScore = Math.min(20, (metrics.empathyMarkerCount / 3) * 20);

  // Change Talk Score (15 points max)
  // Target: change talk ratio > 1.0
  let changeTalkScore = 0;
  if (metrics.changeTalkCount > 0) {
    const ratio = metrics.sustainTalkCount > 0
      ? metrics.changeTalkCount / metrics.sustainTalkCount
      : metrics.changeTalkCount; // If no sustain talk, just use change talk count
    changeTalkScore = Math.min(15, ratio * 7.5); // ratio of 2 = max score
  }

  // Anti-pattern Penalty (-10 points each)
  const antiPatternPenalty = (metrics.adviceGivingCount + metrics.leadingQuestionCount) * -10;

  const totalScore = sdtScore + questionScore + empathyScore + changeTalkScore + antiPatternPenalty;

  return {
    sdtScore: Math.round(sdtScore * 10) / 10,
    questionScore: Math.round(questionScore * 10) / 10,
    empathyScore: Math.round(empathyScore * 10) / 10,
    changeTalkScore: Math.round(changeTalkScore * 10) / 10,
    antiPatternPenalty,
    totalScore: Math.max(0, totalScore),
  };
}

// ============================================================================
// Warning Functions
// ============================================================================

export type QualityWarning = {
  type: 'autonomy' | 'empathy' | 'advice' | 'questions' | 'leading' | 'competence' | 'relatedness';
  message: string;
  severity: 'warning' | 'critical';
};

/**
 * Get quality warnings for red flags
 */
export function getQualityWarnings(metrics: CoachingMetrics): string[] {
  const warnings: string[] = [];

  if (metrics.autonomyInstances < 2) {
    warnings.push('Zu wenig Autonomie-Unterstützung');
  }

  if (metrics.empathyMarkerCount === 0) {
    warnings.push('Keine Empathie-Marker erkannt');
  }

  if (metrics.adviceGivingCount > 2) {
    warnings.push('Zu viele Ratschläge gegeben');
  }

  if (metrics.openQuestionRatio < 0.5 &&
      (metrics.openQuestionCount + metrics.closedQuestionCount) > 0) {
    warnings.push('Zu wenige offene Fragen');
  }

  if (metrics.leadingQuestionCount > 0) {
    warnings.push('Leitende Fragen erkannt');
  }

  if (metrics.competenceInstances < 1) {
    warnings.push('Keine Kompetenz-Unterstützung');
  }

  return warnings;
}

/**
 * Get detailed quality warnings with severity
 */
export function getDetailedWarnings(metrics: CoachingMetrics): QualityWarning[] {
  const warnings: QualityWarning[] = [];

  if (metrics.autonomyInstances < 2) {
    warnings.push({
      type: 'autonomy',
      message: 'Zu wenig Autonomie-Unterstützung',
      severity: metrics.autonomyInstances === 0 ? 'critical' : 'warning',
    });
  }

  if (metrics.empathyMarkerCount === 0) {
    warnings.push({
      type: 'empathy',
      message: 'Keine Empathie-Marker erkannt',
      severity: 'critical',
    });
  }

  if (metrics.adviceGivingCount > 2) {
    warnings.push({
      type: 'advice',
      message: 'Zu viele Ratschläge gegeben',
      severity: metrics.adviceGivingCount > 5 ? 'critical' : 'warning',
    });
  }

  if (metrics.openQuestionRatio < 0.5 &&
      (metrics.openQuestionCount + metrics.closedQuestionCount) > 0) {
    warnings.push({
      type: 'questions',
      message: 'Zu wenige offene Fragen',
      severity: metrics.openQuestionRatio < 0.3 ? 'critical' : 'warning',
    });
  }

  if (metrics.leadingQuestionCount > 0) {
    warnings.push({
      type: 'leading',
      message: 'Leitende Fragen erkannt',
      severity: metrics.leadingQuestionCount > 2 ? 'critical' : 'warning',
    });
  }

  if (metrics.competenceInstances < 1) {
    warnings.push({
      type: 'competence',
      message: 'Keine Kompetenz-Unterstützung',
      severity: 'warning',
    });
  }

  if (metrics.relatednessInstances < 1) {
    warnings.push({
      type: 'relatedness',
      message: 'Keine Verbundenheits-Signale',
      severity: 'warning',
    });
  }

  return warnings;
}

// ============================================================================
// Threshold Constants
// ============================================================================

export const QUALITY_THRESHOLDS = {
  autonomy: { target: 5, minimum: 2 },
  competence: { target: 3, minimum: 1 },
  relatedness: { target: 2, minimum: 1 },
  openQuestionRatio: { target: 0.7, minimum: 0.5 },
  empathyMarkers: { target: 3, minimum: 1 },
  changeTalkRatio: { target: 1.5, minimum: 1.0 },
  adviceGiving: { target: 0, maximum: 2 },
  leadingQuestions: { target: 0, maximum: 1 },
  overallScore: { target: 75, minimum: 50 },
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if metrics meet minimum quality standards
 */
export function meetsMinimumQuality(metrics: CoachingMetrics): boolean {
  const score = calculateCoachingScore(metrics);
  return score >= QUALITY_THRESHOLDS.overallScore.minimum;
}

/**
 * Check if metrics meet target quality standards
 */
export function meetsTargetQuality(metrics: CoachingMetrics): boolean {
  const score = calculateCoachingScore(metrics);
  return score >= QUALITY_THRESHOLDS.overallScore.target;
}

/**
 * Get a human-readable quality assessment
 */
export function getQualityAssessment(metrics: CoachingMetrics): {
  level: 'excellent' | 'good' | 'acceptable' | 'needs_improvement' | 'poor';
  score: number;
  summary: string;
} {
  const score = calculateCoachingScore(metrics);

  if (score >= 90) {
    return {
      level: 'excellent',
      score,
      summary: 'Ausgezeichnete Coaching-Qualität',
    };
  } else if (score >= 75) {
    return {
      level: 'good',
      score,
      summary: 'Gute Coaching-Qualität',
    };
  } else if (score >= 60) {
    return {
      level: 'acceptable',
      score,
      summary: 'Akzeptable Coaching-Qualität',
    };
  } else if (score >= 40) {
    return {
      level: 'needs_improvement',
      score,
      summary: 'Coaching-Qualität verbesserungswürdig',
    };
  } else {
    return {
      level: 'poor',
      score,
      summary: 'Coaching-Qualität unzureichend',
    };
  }
}

/**
 * Get pattern lists for testing/debugging
 */
export function getPatterns() {
  return {
    openQuestionStarters: OPEN_QUESTION_STARTERS,
    closedQuestionStarters: CLOSED_QUESTION_STARTERS,
    empathyMarkers: EMPATHY_MARKERS,
    adviceGivingPatterns: ADVICE_GIVING_PATTERNS,
    leadingQuestionPatterns: LEADING_QUESTION_PATTERNS,
    autonomySupportPatterns: AUTONOMY_SUPPORT_PATTERNS,
    competenceBuildingPatterns: COMPETENCE_BUILDING_PATTERNS,
    relatednessPatterns: RELATEDNESS_PATTERNS,
    changeTalkIndicators: CHANGE_TALK_INDICATORS,
    sustainTalkIndicators: SUSTAIN_TALK_INDICATORS,
  };
}
