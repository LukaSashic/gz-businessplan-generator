/**
 * Coaching Types for GZ Businessplan Generator
 *
 * Based on evidence-based coaching methodologies:
 * - SDT (Self-Determination Theory): Autonomy, Competence, Relatedness
 * - TTM (Transtheoretical Model): Stage-based change
 * - MI (Motivational Interviewing): Change talk detection
 * - CBC (Cognitive Behavioral Coaching): Limiting beliefs
 * - GROW Model: Goal, Reality, Options, Will
 * - Appreciative Inquiry: 4D cycle
 */

import { z } from 'zod';

// ============================================================================
// TTM (Transtheoretical Model) Stages
// ============================================================================

/**
 * Readiness stages from Prochaska & DiClemente's TTM
 * Determines coaching depth and approach
 */
export const Stage = z.enum([
  'precontemplation', // Not considering change, unaware of need
  'contemplation',    // Aware but ambivalent, weighing pros/cons
  'preparation',      // Planning to act soon, gathering resources
  'action',           // Actively implementing changes
  'maintenance',      // Sustaining changes, preventing relapse
]);

export type Stage = z.infer<typeof Stage>;

/**
 * Stage detection indicators - language patterns per stage
 */
export const StageIndicators: Record<Stage, string[]> = {
  precontemplation: [
    'weiß nicht',
    'unsicher',
    'vielleicht',
    'keine Ahnung',
    'muss ich drüber nachdenken',
    'bin mir nicht sicher',
  ],
  contemplation: [
    'einerseits',
    'andererseits',
    'aber',
    'Angst',
    'Risiko',
    'was wenn',
    'nicht sicher ob',
    'könnte klappen',
  ],
  preparation: [
    'ich plane',
    'nächsten Monat',
    'konkret',
    'erste Schritte',
    'habe vor',
    'will anfangen',
    'bereite vor',
  ],
  action: [
    'ich habe schon',
    'bin dabei',
    'läuft bereits',
    'mache gerade',
    'arbeite dran',
    'habe begonnen',
  ],
  maintenance: [
    'seit Monaten',
    'etabliert',
    'routiniert',
    'läuft gut',
    'bewährt sich',
  ],
};

/**
 * Coaching depth based on stage
 */
export const CoachingDepth = z.enum(['shallow', 'medium', 'deep']);
export type CoachingDepth = z.infer<typeof CoachingDepth>;

export const StageToDepth: Record<Stage, CoachingDepth> = {
  precontemplation: 'deep',    // Needs extensive exploration
  contemplation: 'deep',       // Needs ambivalence resolution
  preparation: 'medium',       // Focus on concrete planning
  action: 'shallow',           // Support and validation
  maintenance: 'shallow',      // Reinforcement only
};

// ============================================================================
// GROW Model Phases
// ============================================================================

/**
 * GROW conversation structure phases
 */
export const GROWPhase = z.enum([
  'goal',     // What do you want to achieve?
  'reality',  // Where are you now?
  'options',  // What could you do?
  'will',     // What will you do?
]);

export type GROWPhase = z.infer<typeof GROWPhase>;

/**
 * GROW phase prompts in German
 */
export const GROWPrompts: Record<GROWPhase, string> = {
  goal: 'Was willst DU mit diesem Modul erreichen?',
  reality: 'Wo stehst du aktuell? Was hast du bereits?',
  options: 'Welche Möglichkeiten siehst du?',
  will: 'Was nimmst du dir konkret vor?',
};

// ============================================================================
// Motivational Interviewing (MI) Types
// ============================================================================

/**
 * Change talk types from MI (DARN-CAT)
 */
export const ChangeTalkType = z.enum([
  'desire',     // "Ich will...", "Ich möchte..."
  'ability',    // "Ich kann...", "Ich bin fähig..."
  'reason',     // "Weil...", "Denn..."
  'need',       // "Ich muss...", "Ich brauche..."
  'commitment', // "Ich werde...", "Ich verspreche..."
  'activation', // "Ich bin bereit...", "Ich fange an..."
  'taking_steps', // "Ich habe schon...", "Letzte Woche habe ich..."
]);

export type ChangeTalkType = z.infer<typeof ChangeTalkType>;

/**
 * Change talk detection indicators
 */
export const ChangeTalkIndicators: Record<ChangeTalkType, string[]> = {
  desire: ['will', 'möchte', 'wünsche', 'hoffe', 'träume'],
  ability: ['kann', 'fähig', 'schaffe', 'könnte', 'in der Lage'],
  reason: ['weil', 'denn', 'darum', 'deshalb', 'aus dem Grund'],
  need: ['muss', 'brauche', 'sollte', 'notwendig', 'wichtig'],
  commitment: ['werde', 'verspreche', 'garantiere', 'definitiv'],
  activation: ['bereit', 'fange an', 'starte', 'beginne'],
  taking_steps: ['habe schon', 'letzte Woche', 'gestern', 'bereits'],
};

/**
 * Sustain talk - resistance to change
 */
export const SustainTalkIndicators: string[] = [
  'kann nicht',
  'geht nicht',
  'zu schwer',
  'keine Zeit',
  'kein Geld',
  'unmöglich',
  'unrealistisch',
  'funktioniert nicht',
  'bei mir nicht',
];

/**
 * Change talk metrics for tracking conversation quality
 */
export const ChangeTalkMetricsSchema = z.object({
  changeTalkCount: z.number().default(0),
  sustainTalkCount: z.number().default(0),
  changeTalkRatio: z.number().min(0).max(1).default(0), // change / (change + sustain)
  lastChangeTalkType: ChangeTalkType.optional(),
  commitmentStrength: z.number().min(0).max(10).default(0),
});

export type ChangeTalkMetrics = z.infer<typeof ChangeTalkMetricsSchema>;

// ============================================================================
// CBC (Cognitive Behavioral Coaching) Types
// ============================================================================

/**
 * Common limiting beliefs for founders
 */
export const LimitingBeliefType = z.enum([
  'not_qualified',     // "Ich bin nicht qualifiziert"
  'not_salesperson',   // "Ich bin kein Verkäufer"
  'market_saturated',  // "Der Markt ist zu gesättigt"
  'need_more_prep',    // "Ich brauche erst noch X"
  'failure_is_end',    // "Wenn ich scheitere, ist alles verloren"
  'not_numbers_person', // "Ich bin kein Zahlenmensch"
  'too_old_young',     // "Ich bin zu alt/jung dafür"
  'no_network',        // "Ich habe keine Kontakte"
]);

export type LimitingBeliefType = z.infer<typeof LimitingBeliefType>;

/**
 * Limiting belief detection patterns
 */
export const LimitingBeliefPatterns: Record<LimitingBeliefType, string[]> = {
  not_qualified: ['nicht qualifiziert', 'fehlt Erfahrung', 'nicht genug', 'wer bin ich'],
  not_salesperson: ['kein Verkäufer', 'kann nicht verkaufen', 'hasse Verkauf', 'zu aufdringlich'],
  market_saturated: ['zu viel Konkurrenz', 'Markt gesättigt', 'gibt es schon', 'zu spät'],
  need_more_prep: ['erst noch', 'brauche vorher', 'wenn ich dann', 'noch nicht bereit'],
  failure_is_end: ['wenn ich scheitere', 'alles verloren', 'nie wieder', 'Absturz'],
  not_numbers_person: ['kein Zahlenmensch', 'Mathe schlecht', 'Finanzen nicht', 'Buchhaltung'],
  too_old_young: ['zu alt', 'zu jung', 'mein Alter', 'Generation'],
  no_network: ['keine Kontakte', 'kenne niemanden', 'alleine', 'kein Netzwerk'],
};

/**
 * CBC reframing steps
 */
export const CBCStep = z.enum([
  'identify',    // Identify the belief
  'evidence',    // Gather evidence for/against
  'challenge',   // Challenge the belief gently
  'reframe',     // Offer alternative perspective
  'action',      // Commit to action despite belief
]);

export type CBCStep = z.infer<typeof CBCStep>;

// ============================================================================
// Appreciative Inquiry (AI) Types
// ============================================================================

/**
 * 4D cycle phases from Appreciative Inquiry
 */
export const AIPhase = z.enum([
  'discover',  // What's working? What strengths exist?
  'dream',     // What could be? Ideal future?
  'design',    // What should be? Path to dream?
  'destiny',   // What will be? First steps?
]);

export type AIPhase = z.infer<typeof AIPhase>;

/**
 * AI phase prompts in German
 */
export const AIPrompts: Record<AIPhase, string> = {
  discover: 'Erzähl mir von einem beruflichen Erfolg, auf den du stolz bist. Was hast du da gut gemacht?',
  dream: 'Wenn dein Business in 3 Jahren genau so läuft, wie du es dir wünschst - wie sieht dein Alltag aus?',
  design: 'Von deinen Stärken zu deinem Traum - welche Schritte brauchst du?',
  destiny: 'Was ist der erste Schritt, den du diese Woche machst?',
};

// ============================================================================
// Emotion Detection Types
// ============================================================================

/**
 * Detectable emotions in user messages
 */
export const Emotion = z.enum([
  'uncertainty',   // Unsicherheit
  'ambivalence',   // Zwiespalt
  'anxiety',       // Angst
  'frustration',   // Frustration
  'excitement',    // Begeisterung
  'confidence',    // Zuversicht
  'overwhelm',     // Überforderung
  'doubt',         // Zweifel
]);

export type Emotion = z.infer<typeof Emotion>;

/**
 * Emotion detection patterns
 */
export const EmotionIndicators: Record<Emotion, string[]> = {
  uncertainty: ['weiß nicht', 'unsicher', 'vielleicht', 'keine Ahnung'],
  ambivalence: ['einerseits', 'andererseits', 'hin und her', 'teils teils'],
  anxiety: ['Angst', 'Sorge', 'befürchte', 'was wenn', 'schlimmsten Fall'],
  frustration: ['frustriert', 'genervt', 'ärgert mich', 'schon wieder'],
  excitement: ['freue mich', 'begeistert', 'gespannt', 'kann nicht warten'],
  confidence: ['sicher', 'überzeugt', 'klar', 'kein Problem'],
  overwhelm: ['zu viel', 'überfordert', 'schaffe das nicht', 'wo anfangen'],
  doubt: ['ob das klappt', 'funktioniert das', 'glaube nicht', 'skeptisch'],
};

// ============================================================================
// Coaching State (Main State Object)
// ============================================================================

/**
 * SDT needs tracking
 */
export const SDTNeedsSchema = z.object({
  autonomyInstances: z.number().default(0),    // Times user choice was supported
  competenceInstances: z.number().default(0),  // Times mastery was acknowledged
  relatednessInstances: z.number().default(0), // Times connection was made
});

export type SDTNeeds = z.infer<typeof SDTNeedsSchema>;

/**
 * Complete coaching state for tracking throughout workshop
 */
export const CoachingStateSchema = z.object({
  // Stage tracking (TTM)
  currentStage: Stage.default('contemplation'),
  stageHistory: z.array(z.object({
    stage: Stage,
    detectedAt: z.string(), // ISO timestamp
    trigger: z.string().optional(), // What indicated the stage
  })).default([]),

  // GROW phase tracking
  currentGROWPhase: GROWPhase.default('goal'),
  growPhaseByModule: z.record(z.string(), GROWPhase).default({}),

  // MI metrics
  changeTalkMetrics: ChangeTalkMetricsSchema.default({
    changeTalkCount: 0,
    sustainTalkCount: 0,
    changeTalkRatio: 0,
    commitmentStrength: 0,
  }),

  // CBC tracking
  identifiedBeliefs: z.array(z.object({
    belief: LimitingBeliefType,
    identifiedAt: z.string(),
    reframed: z.boolean().default(false),
    reframedAt: z.string().optional(),
  })).default([]),

  // AI strengths discovery
  discoveredStrengths: z.array(z.string()).default([]),
  dreamVision: z.string().optional(),

  // SDT needs
  sdtNeeds: SDTNeedsSchema.default({
    autonomyInstances: 0,
    competenceInstances: 0,
    relatednessInstances: 0,
  }),

  // Emotion tracking
  lastDetectedEmotion: Emotion.optional(),
  emotionHistory: z.array(z.object({
    emotion: Emotion,
    detectedAt: z.string(),
    addressed: z.boolean().default(false),
  })).default([]),

  // Conversation quality metrics
  qualityMetrics: z.object({
    openQuestionCount: z.number().default(0),
    closedQuestionCount: z.number().default(0),
    openQuestionRatio: z.number().min(0).max(1).default(0), // Target: ≥70%
    empathyMarkerCount: z.number().default(0),
    reflectiveSummaryCount: z.number().default(0),
    adviceGivingCount: z.number().default(0), // Anti-pattern: should be 0
    leadingQuestionCount: z.number().default(0), // Anti-pattern: should be 0
  }).default({
    openQuestionCount: 0,
    closedQuestionCount: 0,
    openQuestionRatio: 0,
    empathyMarkerCount: 0,
    reflectiveSummaryCount: 0,
    adviceGivingCount: 0,
    leadingQuestionCount: 0,
  }),

  // Exchange tracking for reflective summaries
  exchangesSinceLastSummary: z.number().default(0),

  // Timestamps
  sessionStartedAt: z.string().optional(),
  lastUpdatedAt: z.string().optional(),
});

export type CoachingState = z.infer<typeof CoachingStateSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create initial coaching state
 */
export function createInitialCoachingState(): CoachingState {
  const now = new Date().toISOString();
  return {
    currentStage: 'contemplation',
    stageHistory: [],
    currentGROWPhase: 'goal',
    growPhaseByModule: {},
    changeTalkMetrics: {
      changeTalkCount: 0,
      sustainTalkCount: 0,
      changeTalkRatio: 0,
      commitmentStrength: 0,
    },
    identifiedBeliefs: [],
    discoveredStrengths: [],
    sdtNeeds: {
      autonomyInstances: 0,
      competenceInstances: 0,
      relatednessInstances: 0,
    },
    emotionHistory: [],
    qualityMetrics: {
      openQuestionCount: 0,
      closedQuestionCount: 0,
      openQuestionRatio: 0,
      empathyMarkerCount: 0,
      reflectiveSummaryCount: 0,
      adviceGivingCount: 0,
      leadingQuestionCount: 0,
    },
    exchangesSinceLastSummary: 0,
    sessionStartedAt: now,
    lastUpdatedAt: now,
  };
}

/**
 * Calculate coaching quality score (0-100)
 */
export function calculateCoachingScore(state: CoachingState): number {
  const metrics = state.qualityMetrics;
  const sdt = state.sdtNeeds;

  let score = 0;

  // Open question ratio (30 points, target ≥70%)
  score += Math.min(30, (metrics.openQuestionRatio / 0.7) * 30);

  // SDT autonomy instances (20 points, target ≥5)
  score += Math.min(20, (sdt.autonomyInstances / 5) * 20);

  // SDT competence instances (15 points, target ≥3)
  score += Math.min(15, (sdt.competenceInstances / 3) * 15);

  // Empathy markers (15 points, target ≥3)
  score += Math.min(15, (metrics.empathyMarkerCount / 3) * 15);

  // Change talk ratio (10 points, target ≥0.6)
  score += Math.min(10, (state.changeTalkMetrics.changeTalkRatio / 0.6) * 10);

  // Reflective summaries (5 points, target ≥1 per 7 exchanges)
  const expectedSummaries = Math.floor(state.exchangesSinceLastSummary / 7);
  if (expectedSummaries > 0) {
    score += Math.min(5, (metrics.reflectiveSummaryCount / expectedSummaries) * 5);
  } else {
    score += 5; // No summaries needed yet
  }

  // Penalties for anti-patterns
  score -= metrics.adviceGivingCount * 5; // -5 per advice-giving instance
  score -= metrics.leadingQuestionCount * 3; // -3 per leading question

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Get coaching quality warnings
 */
export function getCoachingWarnings(state: CoachingState): string[] {
  const warnings: string[] = [];
  const metrics = state.qualityMetrics;
  const sdt = state.sdtNeeds;

  if (sdt.autonomyInstances < 2) {
    warnings.push('Zu wenig Autonomie-Unterstützung (< 2 Instanzen)');
  }

  if (metrics.empathyMarkerCount === 0 && state.emotionHistory.length > 0) {
    warnings.push('Emotion erkannt aber keine Empathie-Marker');
  }

  if (metrics.adviceGivingCount > 0) {
    warnings.push(`${metrics.adviceGivingCount}x Ratschläge gegeben (sollte 0 sein)`);
  }

  if (metrics.openQuestionRatio < 0.5) {
    warnings.push('Zu wenig offene Fragen (< 50%)');
  }

  if (state.exchangesSinceLastSummary > 10) {
    warnings.push('Mehr als 10 Austausche ohne reflektive Zusammenfassung');
  }

  return warnings;
}

/**
 * Determine if a reflective summary should be generated
 */
export function shouldGenerateSummary(exchangeCount: number): boolean {
  // Generate summary every 5-7 exchanges
  return exchangeCount >= 5 && exchangeCount <= 7;
}

/**
 * Get coaching depth for current stage
 */
export function getCoachingDepthForStage(stage: Stage): CoachingDepth {
  return StageToDepth[stage];
}
