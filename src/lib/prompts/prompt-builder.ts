/**
 * Greta System Prompt Builder
 *
 * Builds contextualized system prompts by combining the base Greta persona
 * with module-specific coaching methodology, user state, and conversation context.
 *
 * This integrates with the existing prompt-loader.ts system while providing
 * the persona-specific intelligence layer.
 */

import {
  GRETA_PERSONA,
  STAGE_ADAPTATIONS,
  EMOTION_ADAPTATIONS,
  MODULE_ADAPTATIONS,
  ADDRESS_TEMPLATES,
  getPersonaFocus,
  type AddressStyle,
} from './greta-persona';

import type {
  CoachingState,
  Stage,
  Emotion,
  ModuleId,
} from '@/types';

// ============================================================================
// Builder Configuration Types
// ============================================================================

/**
 * User profile information for persona customization
 */
export interface UserProfile {
  /** User's preferred address style (formal Sie vs informal Du) */
  addressStyle: AddressStyle;
  /** User's name for personalization */
  name?: string;
  /** Business type for context-specific adaptations */
  businessType?: string;
  /** Industry for relevant examples */
  industry?: string;
  /** Experience level for appropriate depth */
  experienceLevel?: 'beginner' | 'intermediate' | 'experienced';
  /** Detected personality traits for coaching adaptation */
  personalityTraits?: {
    innovativeness?: 'high' | 'medium' | 'low';
    riskTaking?: 'high' | 'medium' | 'low';
    autonomy?: 'high' | 'medium' | 'low';
  };
}

/**
 * Context for building system prompts
 */
export interface PromptContext {
  /** Current module being worked on */
  moduleId: ModuleId;
  /** Current coaching state with metrics and tracking */
  coachingState: CoachingState;
  /** User profile for personalization */
  userProfile: UserProfile;
  /** Phase within module (for phase-locked systems) */
  modulePhase?: string;
  /** Additional context data from previous modules */
  previousModuleData?: Record<string, any>;
  /** Conversation history length for adaptive responses */
  conversationLength?: number;
  /** Whether this is a continuation or fresh start */
  isResume?: boolean;
}

/**
 * Built system prompt components
 */
export interface SystemPromptComponents {
  /** Core persona introduction */
  personaIntroduction: string;
  /** Module-specific coaching instructions */
  moduleInstructions: string;
  /** Stage and emotion adaptations */
  adaptiveInstructions: string;
  /** SDT-focused guidance */
  sdtGuidance: string;
  /** Communication rules and patterns */
  communicationRules: string;
  /** Quality metrics and expectations */
  qualityExpectations: string;
  /** Address style templates */
  languageTemplates: string;
}

// ============================================================================
// Core Prompt Builder
// ============================================================================

/**
 * Build a complete system prompt for Greta based on context
 *
 * This is the main function that combines all persona elements into
 * a coherent system prompt for Claude.
 */
export function buildSystemPrompt(context: PromptContext): string {
  const components = buildPromptComponents(context);

  // Assemble the complete prompt in layered order
  const prompt = [
    components.personaIntroduction,
    components.moduleInstructions,
    components.adaptiveInstructions,
    components.sdtGuidance,
    components.communicationRules,
    components.qualityExpectations,
    components.languageTemplates,
  ].join('\n\n---\n\n');

  return prompt;
}

/**
 * Build individual prompt components for more granular control
 */
export function buildPromptComponents(context: PromptContext): SystemPromptComponents {
  const {
    moduleId,
    coachingState,
    userProfile,
    modulePhase,
    conversationLength = 0,
    isResume = false,
  } = context;

  const currentStage = coachingState.currentStage;
  const lastEmotion = coachingState.lastDetectedEmotion;
  const addressStyle = userProfile.addressStyle;

  // Get context-specific focus
  const personaFocus = getPersonaFocus(moduleId, currentStage, lastEmotion);

  return {
    personaIntroduction: buildPersonaIntroduction(userProfile, isResume),
    moduleInstructions: buildModuleInstructions(moduleId, modulePhase, userProfile),
    adaptiveInstructions: buildAdaptiveInstructions(currentStage, lastEmotion, coachingState),
    sdtGuidance: buildSDTGuidance(personaFocus.primaryFocus),
    communicationRules: buildCommunicationRules(addressStyle, conversationLength),
    qualityExpectations: buildQualityExpectations(coachingState),
    languageTemplates: buildLanguageTemplates(addressStyle, userProfile),
  };
}

// ============================================================================
// Component Builders
// ============================================================================

/**
 * Build the persona introduction
 */
function buildPersonaIntroduction(userProfile: UserProfile, isResume: boolean): string {
  const { addressStyle, name } = userProfile;
  const template = ADDRESS_TEMPLATES[addressStyle];
  const greeting = name ? `${template.greeting}, ${name}` : template.greeting;

  const resumeContext = isResume
    ? 'Wir setzen unser Gespräch fort. Ich erinnere mich an unsere bisherigen Fortschritte.'
    : 'Wir beginnen gemeinsam Ihren Businessplan für den Gründungszuschuss.';

  return `# ${GRETA_PERSONA.name} - ${GRETA_PERSONA.role}

${greeting}!

${resumeContext}

## Meine Rolle
${GRETA_PERSONA.background}

Ich bin hier, um ${addressStyle === 'Sie' ? 'Sie' : 'dich'} durch einen strukturierten Workshop zu führen, der auf wissenschaftlich bewährten Coaching-Methoden basiert.

## Meine Prinzipien
${GRETA_PERSONA.coreValues.map(value => `- ${value}`).join('\n')}

## Wie ich arbeite
- ${GRETA_PERSONA.communicationStyle.tone.join('\n- ')}

Ich unterstütze ${addressStyle === 'Sie' ? 'Ihren' : 'deinen'} Weg zur Selbständigkeit, ohne ${addressStyle === 'Sie' ? 'Ihnen' : 'dir'} die Entscheidungen abzunehmen.`;
}

/**
 * Build module-specific instructions
 */
function buildModuleInstructions(
  moduleId: ModuleId,
  modulePhase: string | undefined,
  userProfile: UserProfile
): string {
  const moduleAdaptation = MODULE_ADAPTATIONS[moduleId];
  const { addressStyle } = userProfile;

  let instructions = `# Modul: ${moduleId.replace('gz-', '').replace('-', ' ').toUpperCase()}

## Fokus dieses Moduls
${moduleAdaptation.focus}

## Schwierigkeitsgrad: ${moduleAdaptation.challengeLevel}
${getModuleChallengeGuidance(moduleAdaptation.challengeLevel, addressStyle)}

## Häufige Herausforderungen
${moduleAdaptation.specificChallenges.map(challenge => `- ${challenge}`).join('\n')}

## Primäre Methodik: ${moduleAdaptation.primaryMethodology}
${getMethodologyGuidance(moduleAdaptation.primaryMethodology)}`;

  if (modulePhase) {
    instructions += `\n\n## Aktuelle Phase: ${modulePhase}
Fokussiere dich NUR auf diese Phase. Verhindere Scope-Creep zu anderen Themen.`;
  }

  return instructions;
}

/**
 * Build adaptive instructions based on stage and emotion
 */
function buildAdaptiveInstructions(
  stage: Stage,
  emotion: Emotion | undefined,
  coachingState: CoachingState
): string {
  const stageAdaptation = STAGE_ADAPTATIONS[stage];

  let instructions = `# Adaptive Coaching

## TTM Stage: ${stage}
**Approach:** ${stageAdaptation.approach}
**Focus:** ${stageAdaptation.primaryFocus}
**Communication:** ${stageAdaptation.communicationAdjustment}`;

  if (emotion) {
    const emotionAdaptation = EMOTION_ADAPTATIONS[emotion];
    instructions += `\n\n## Detected Emotion: ${emotion}
**Empathy Response:** ${emotionAdaptation.empathyResponse}
**Adjustment:** ${emotionAdaptation.focusAdjustment}
**SDT Emphasis:** ${emotionAdaptation.sdtEmphasis}`;
  }

  // Add coaching quality context
  const score = calculateCoachingScore(coachingState);
  if (score < 75) {
    instructions += `\n\n## ⚠️ Coaching Quality Alert
Current score: ${score}/100. Increase:
- Open questions (current ratio: ${Math.round(coachingState.qualityMetrics.openQuestionRatio * 100)}%)
- Autonomy support (current: ${coachingState.sdtNeeds.autonomyInstances} instances)
- Empathy markers (current: ${coachingState.qualityMetrics.empathyMarkerCount})`;
  }

  return instructions;
}

/**
 * Build SDT-specific guidance
 */
function buildSDTGuidance(focus: keyof typeof GRETA_PERSONA.sdtPrinciples): string {
  const principles = GRETA_PERSONA.sdtPrinciples[focus];

  return `# Self-Determination Theory Focus: ${focus.toUpperCase()}

## ${focus === 'autonomy' ? 'Autonomie-Unterstützung' : focus === 'competence' ? 'Kompetenz-Aufbau' : 'Verbundenheit'}

${principles.map(principle => `- ${principle}`).join('\n')}

## Integration mit anderen SDT-Bereichen
${focus !== 'autonomy' ? '- Autonomie: Biete Wahlmöglichkeiten bei der Umsetzung' : ''}
${focus !== 'competence' ? '- Kompetenz: Erkenne spezifische Fortschritte' : ''}
${focus !== 'relatedness' ? '- Verbundenheit: Normalisiere Herausforderungen' : ''}`;
}

/**
 * Build communication rules
 */
function buildCommunicationRules(addressStyle: AddressStyle, conversationLength: number): string {
  const isLongConversation = conversationLength > 10;

  return `# Kommunikationsregeln (${addressStyle}-Form)

## Sprachregeln
${GRETA_PERSONA.communicationStyle.languageRules.map(rule => `- ${rule}`).join('\n')}

## Fragetechnik
${GRETA_PERSONA.communicationStyle.questioningStyle.map(style => `- ${style}`).join('\n')}

## Validierungsansatz
${GRETA_PERSONA.communicationStyle.validationApproach.map(approach => `- ${approach}`).join('\n')}

${isLongConversation ? `\n## 🔄 Reflective Summary Needed
Es gab bereits ${conversationLength} Austausche. Zeit für eine Zusammenfassung:
- Fakten: Was wurde besprochen?
- Emotionales: Wie hat sich der Nutzer gefühlt?
- Stärken: Was hat gut funktioniert?
- Bestätigung: "Stimmt das so? Fehlt etwas?"` : ''}

## ❌ NIEMALS verwenden:
${GRETA_PERSONA.forbiddenPatterns.map(pattern => `- "${pattern}"`).join('\n')}

## ✅ IMMER verwenden:
${GRETA_PERSONA.requiredPatterns.slice(0, 4).map(pattern => `- "${pattern}"`).join('\n')}`;
}

/**
 * Build quality expectations
 */
function buildQualityExpectations(coachingState: CoachingState): string {
  const metrics = coachingState.qualityMetrics;

  return `# Qualitätserwartungen

## Zielwerte (pro Modul)
- ≥70% offene Fragen (aktuell: ${Math.round(metrics.openQuestionRatio * 100)}%)
- ≥5 Autonomie-Instanzen (aktuell: ${coachingState.sdtNeeds.autonomyInstances})
- ≥3 Kompetenz-Validierungen (aktuell: ${coachingState.sdtNeeds.competenceInstances})
- ≥3 Empathie-Marker (aktuell: ${metrics.empathyMarkerCount})
- 0 Ratschläge (aktuell: ${metrics.adviceGivingCount})

## Automatische Qualitätsprüfung
Jede Antwort wird gegen diese Kriterien geprüft:
1. Enthält offene Fragen?
2. Unterstützt Nutzer-Autonomie?
3. Zeigt spezifische Validierung?
4. Nutzt keine verbotenen Muster?
5. Baut Kompetenz auf?

## Reflective Summary Trigger
${coachingState.exchangesSinceLastSummary >= 5 ?
  '⚠️ Generiere JETZT eine reflective Summary (≥5 Austausche)' :
  `Next summary in ${5 - coachingState.exchangesSinceLastSummary} exchanges`}`;
}

/**
 * Build language templates for consistent addressing
 */
function buildLanguageTemplates(addressStyle: AddressStyle, userProfile: UserProfile): string {
  const templates = ADDRESS_TEMPLATES[addressStyle];

  return `# Sprach-Templates (${addressStyle}-Form)

## Standard-Phrasen
- Begrüßung: "${templates.greeting}"
- Frage-Einleitung: "${templates.questionPrefix}..."
- Feedback: "${templates.feedback}..."
- Wahlmöglichkeiten: "${templates.choices}..."
- Validierung: "${templates.validation}..."
- Reflexion: "${templates.reflection}..."
- Partnerschaft: "${templates.partnership}..."
- Abschluss: "${templates.closing}"

${userProfile.name ? `## Personalisierung
Name: ${userProfile.name}
${userProfile.businessType ? `Geschäftstyp: ${userProfile.businessType}` : ''}
${userProfile.industry ? `Branche: ${userProfile.industry}` : ''}` : ''}

## Anpassung an Erfahrungslevel: ${userProfile.experienceLevel || 'unbekannt'}
${getExperienceLevelGuidance(userProfile.experienceLevel)}`;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get guidance based on module challenge level
 */
function getModuleChallengeGuidance(level: 'low' | 'medium' | 'high', addressStyle: AddressStyle): string {
  const pronoun = addressStyle === 'Sie' ? 'Sie' : 'du';

  switch (level) {
    case 'low':
      return `Entspannter Ansatz. Unterstütze ${pronoun} bei der Zusammenfassung und Reflexion.`;
    case 'medium':
      return `Ausgewogener Ansatz. Biete Struktur aber respektiere ${addressStyle === 'Sie' ? 'Ihre' : 'deine'} Entscheidungen.`;
    case 'high':
      return `Hohe Herausforderung. Sei besonders aufmerksam für Überforderung und biete mehr Unterstützung.`;
  }
}

/**
 * Get guidance for primary methodology
 */
function getMethodologyGuidance(methodology: string): string {
  switch (methodology) {
    case 'MI':
      return 'Motivational Interviewing: Elicit change talk, roll with resistance, build self-efficacy.';
    case 'CBC':
      return 'Cognitive Behavioral Coaching: Challenge limiting beliefs with evidence, reframe perspectives.';
    case 'SDT':
      return 'Self-Determination Theory: Support autonomy, build competence, foster relatedness.';
    case 'AI':
      return 'Appreciative Inquiry: Discover strengths, dream possibilities, design actions.';
    case 'GROW':
      return 'GROW Model: Goal → Reality → Options → Will (What will you do?).';
    default:
      return 'Mixed methodology: Adapt approach based on user needs.';
  }
}

/**
 * Get guidance based on user experience level
 */
function getExperienceLevelGuidance(level?: string): string {
  switch (level) {
    case 'beginner':
      return 'Mehr Erklärungen, kleinere Schritte, extra Ermutigung.';
    case 'intermediate':
      return 'Ausgewogene Unterstützung, moderates Tempo.';
    case 'experienced':
      return 'Weniger Grundlagen, höheres Tempo, vertraue auf Expertise.';
    default:
      return 'Passe dich an erkennbare Signale der Erfahrung an.';
  }
}

/**
 * Calculate coaching score (imported from coaching types)
 * This is a simplified version - the full version is in coaching.ts
 */
function calculateCoachingScore(state: CoachingState): number {
  const metrics = state.qualityMetrics;
  const sdt = state.sdtNeeds;

  let score = 0;
  score += Math.min(30, (metrics.openQuestionRatio / 0.7) * 30);
  score += Math.min(20, (sdt.autonomyInstances / 5) * 20);
  score += Math.min(15, (sdt.competenceInstances / 3) * 15);
  score += Math.min(15, (metrics.empathyMarkerCount / 3) * 15);
  score += Math.min(20, 20); // Baseline for other factors

  // Penalties
  score -= metrics.adviceGivingCount * 5;
  score -= metrics.leadingQuestionCount * 3;

  return Math.max(0, Math.min(100, Math.round(score)));
}

// ============================================================================
// Preset Builders for Common Scenarios
// ============================================================================

/**
 * Build system prompt for module start
 */
export function buildModuleStartPrompt(
  moduleId: ModuleId,
  userProfile: UserProfile,
  coachingState: CoachingState
): string {
  return buildSystemPrompt({
    moduleId,
    userProfile,
    coachingState,
    conversationLength: 0,
    isResume: false,
  });
}

/**
 * Build system prompt for conversation continuation
 */
export function buildContinuationPrompt(
  context: PromptContext,
  newEmotion?: Emotion
): string {
  const updatedCoachingState = newEmotion
    ? { ...context.coachingState, lastDetectedEmotion: newEmotion }
    : context.coachingState;

  return buildSystemPrompt({
    ...context,
    coachingState: updatedCoachingState,
    isResume: true,
  });
}

/**
 * Build system prompt with emphasis on specific SDT need
 */
export function buildSDTFocusedPrompt(
  context: PromptContext,
  sdtFocus: keyof typeof GRETA_PERSONA.sdtPrinciples
): string {
  const components = buildPromptComponents(context);

  // Enhance SDT guidance for the specific focus
  const enhancedSDTGuidance = `${components.sdtGuidance}

## 🎯 EXTRA FOCUS: ${sdtFocus.toUpperCase()}
${GRETA_PERSONA.sdtPrinciples[sdtFocus].map(principle => `- **${principle}**`).join('\n')}

In deiner nächsten Antwort, stelle sicher, dass du aktiv ${sdtFocus} unterstützt.`;

  return [
    components.personaIntroduction,
    components.moduleInstructions,
    components.adaptiveInstructions,
    enhancedSDTGuidance,
    components.communicationRules,
    components.qualityExpectations,
    components.languageTemplates,
  ].join('\n\n---\n\n');
}