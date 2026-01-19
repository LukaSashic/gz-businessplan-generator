/**
 * GROW Model Conversation Structure
 *
 * Implements the GROW (Goal, Reality, Options, Will) coaching framework
 * for structuring module conversations with SDT integration.
 *
 * Based on: Whitmore, J. (2017). Coaching for Performance: The Principles and Practice of Coaching and Leadership
 */

import type {
  GROWPhase,
} from '@/types/coaching';
import { GROWPrompts } from '@/types/coaching';
import type { ModuleId } from '@/types';
import type { ChatMessage } from '@/types/chat';
import type { UserProfile } from '@/lib/prompts/prompt-builder';
import type { AddressStyle } from '@/lib/prompts/greta-persona';

// ============================================================================
// GROW Phase Detection Patterns
// ============================================================================

/**
 * Language patterns that indicate each GROW phase in German conversations
 */
const GROW_PHASE_INDICATORS: Record<GROWPhase, {
  keywords: string[];
  patterns: RegExp[];
  negativeKeywords: string[]; // Keywords that indicate NOT this phase
}> = {
  goal: {
    keywords: [
      'ziel', 'erreichen', 'schaffen', 'wollen', 'möchte', 'vorhaben',
      'anstreben', 'bezwecken', 'plan', 'vision', 'wunsch', 'absicht',
      'erfolg', 'ergebnis', 'outcome', 'result'
    ],
    patterns: [
      /was\s+(willst|möchtest|planst)\s+du/i,
      /welches?\s+ziel/i,
      /was\s+soll\s+erreicht/i,
      /wo\s+soll\s+es\s+hingehen/i,
      /was\s+ist\s+(dein|das)\s+ziel/i
    ],
    negativeKeywords: ['haben', 'bin', 'kann', 'mache', 'derzeit', 'aktuell']
  },

  reality: {
    keywords: [
      'aktuell', 'derzeit', 'momentan', 'jetzt', 'heute', 'bereits', 'schon',
      'haben', 'besitze', 'kann', 'bin', 'status', 'situation', 'stand',
      'erfahrung', 'qualifikation', 'ressource', 'gegenwart'
    ],
    patterns: [
      /wo\s+stehst\s+du/i,
      /was\s+hast\s+du\s+(bereits|schon)/i,
      /wie\s+ist\s+(deine|die)\s+situation/i,
      /was\s+kannst\s+du\s+(bereits|schon)/i,
      /was\s+bringst\s+du\s+mit/i
    ],
    negativeKeywords: ['will', 'möchte', 'könnte', 'würde', 'plane']
  },

  options: {
    keywords: [
      'möglichkeit', 'option', 'weg', 'methode', 'ansatz', 'lösung',
      'alternative', 'variante', 'könnte', 'würde', 'denkbar', 'möglich',
      'verschiedene', 'mehrere', 'auswahl', 'entscheidung'
    ],
    patterns: [
      /welche\s+möglichkeiten/i,
      /was\s+könntest\s+du/i,
      /welche\s+(wege|optionen|alternativen)/i,
      /wie\s+könntest\s+du/i,
      /was\s+wäre\s+wenn/i,
      /verschiedene\s+(ansätze|methoden)/i
    ],
    negativeKeywords: ['will', 'werde', 'mache', 'definitiv', 'sicher']
  },

  will: {
    keywords: [
      'werde', 'mache', 'tue', 'plane', 'entscheide', 'nehme', 'vor',
      'verpflichte', 'zusage', 'konkret', 'definitiv', 'sicher', 'fest',
      'schritt', 'aktion', 'handlung', 'umsetzung', 'anfangen', 'beginnen'
    ],
    patterns: [
      /was\s+(wirst|machst)\s+du/i,
      /was\s+nimmst\s+du\s+dir\s+vor/i,
      /welchen\s+schritt/i,
      /wann\s+(fängst|beginnst)\s+du\s+an/i,
      /wie\s+setzt\s+du\s+um/i,
      /was\s+ist\s+(dein|der)\s+(erste|nächste)\s+schritt/i
    ],
    negativeKeywords: ['könnte', 'würde', 'möglich', 'vielleicht', 'eventuell']
  }
};

/**
 * Default GROW phase progression for modules
 */
const DEFAULT_GROW_PROGRESSION: Record<ModuleId, GROWPhase[]> = {
  'gz-intake': ['goal', 'reality', 'options', 'will'],
  'gz-geschaeftsmodell': ['goal', 'reality', 'options', 'will'],
  'gz-unternehmen': ['goal', 'reality', 'options', 'will'],
  'gz-markt-wettbewerb': ['goal', 'reality', 'options', 'will'],
  'gz-marketing': ['goal', 'reality', 'options', 'will'],
  'gz-finanzplanung': ['goal', 'reality', 'options', 'will'],
  'gz-swot': ['goal', 'reality', 'options', 'will'],
  'gz-meilensteine': ['will'], // Focus on commitment
  'gz-kpi': ['reality', 'options'], // Focus on measurement
  'gz-zusammenfassung': ['reality'] // Focus on summary
};

// ============================================================================
// SDT Integration for GROW Phases
// ============================================================================

/**
 * SDT needs emphasis for each GROW phase
 */
const GROW_SDT_INTEGRATION: Record<GROWPhase, {
  primarySDTNeed: 'autonomy' | 'competence' | 'relatedness';
  promptEnhancements: {
    autonomy: string[];
    competence: string[];
    relatedness: string[];
  };
}> = {
  goal: {
    primarySDTNeed: 'autonomy',
    promptEnhancements: {
      autonomy: [
        'Was ist DIR wichtig bei diesem Thema?',
        'Welches Ergebnis würdest DU als Erfolg bezeichnen?',
        'Was möchtest DU hier selbst steuern?'
      ],
      competence: [
        'Wobei fühlst du dich bereits kompetent?',
        'Was kannst du schon gut, was hier hilft?'
      ],
      relatedness: [
        'Andere Gründer haben oft ähnliche Ziele - welche sprechen dich an?',
        'Wer könnte dich bei diesem Ziel unterstützen?'
      ]
    }
  },

  reality: {
    primarySDTNeed: 'competence',
    promptEnhancements: {
      autonomy: [
        'Was hast DU bereits selbst entschieden?',
        'Welche Bereiche kontrollierst DU schon?'
      ],
      competence: [
        'Welche Fähigkeiten hast du bereits entwickelt?',
        'Was hast du in ähnlichen Situationen schon erfolgreich gemacht?',
        'Worauf kannst du aufbauen?'
      ],
      relatedness: [
        'Viele sind an diesem Punkt unsicher - wie geht es dir damit?',
        'Was hast du von anderen gelernt, die ähnlich gestartet sind?'
      ]
    }
  },

  options: {
    primarySDTNeed: 'autonomy',
    promptEnhancements: {
      autonomy: [
        'Welche Option fühlst sich für DICH richtig an?',
        'Bei welchem Weg hättest du die meiste Kontrolle?',
        'Was passt zu deiner Art, Dinge anzugehen?'
      ],
      competence: [
        'Bei welcher Option könntest du deine Stärken am besten nutzen?',
        'Wo würdest du am schnellsten lernen und wachsen?'
      ],
      relatedness: [
        'Andere haben verschiedene Wege gewählt - welcher spricht dich an?',
        'Bei welcher Option könntest du Unterstützung bekommen?'
      ]
    }
  },

  will: {
    primarySDTNeed: 'competence',
    promptEnhancements: {
      autonomy: [
        'Was willst DU konkret tun?',
        'Welchen ersten Schritt wählst DU?',
        'Wann startest DU damit?'
      ],
      competence: [
        'Wie wirst du merken, dass du Fortschritte machst?',
        'Was wird dir zeigen, dass du erfolgreich warst?',
        'Welche Fähigkeiten wirst du dabei entwickeln?'
      ],
      relatedness: [
        'Wer soll von deinem Plan erfahren?',
        'Wie kann ich dich bei der Umsetzung unterstützen?'
      ]
    }
  }
};

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Generate GROW prompt for specific phase with SDT integration
 */
export function getGROWPromptForPhase(
  phase: GROWPhase,
  moduleId: ModuleId,
  userProfile: UserProfile
): string {
  const basePrompt = GROWPrompts[phase];
  const addressStyle = userProfile.addressStyle;
  // Note: userProfile.name available for future personalization (e.g., greeting by name)

  // Get SDT integration for this phase
  const sdtIntegration = GROW_SDT_INTEGRATION[phase];
  const primaryNeed = sdtIntegration.primarySDTNeed;

  // Build enhanced prompt
  let enhancedPrompt = basePrompt;

  // Add personalization based on address style
  if (addressStyle === 'Sie') {
    enhancedPrompt = enhancedPrompt.replace(/\bdu\b/g, 'Sie');
    enhancedPrompt = enhancedPrompt.replace(/\bDU\b/g, 'Sie');
    enhancedPrompt = enhancedPrompt.replace(/\bDu\b/g, 'Sie');
  }

  // Add SDT enhancement based on coaching state
  const enhancements = sdtIntegration.promptEnhancements[primaryNeed];
  let randomEnhancement = enhancements[Math.floor(Math.random() * enhancements.length)] || '';

  // Apply address style to enhancement
  if (addressStyle === 'Sie' && randomEnhancement) {
    // Handle verb conjugations first for proper grammar
    randomEnhancement = randomEnhancement.replace(/\bmöchtest DU\b/g, 'möchten Sie');
    randomEnhancement = randomEnhancement.replace(/\bwillst DU\b/g, 'wollen Sie');
    randomEnhancement = randomEnhancement.replace(/\bkannst DU\b/g, 'können Sie');

    // Then handle remaining pronouns
    randomEnhancement = randomEnhancement.replace(/\bdu\b/g, 'Sie');
    randomEnhancement = randomEnhancement.replace(/\bDu\b/g, 'Sie');
    randomEnhancement = randomEnhancement.replace(/\bDU\b/g, 'Sie');
    randomEnhancement = randomEnhancement.replace(/\bdich\b/g, 'Sie');
    randomEnhancement = randomEnhancement.replace(/\bdir\b/g, 'Ihnen');
    randomEnhancement = randomEnhancement.replace(/\bDIR\b/g, 'Ihnen');
    randomEnhancement = randomEnhancement.replace(/\bdeine\b/g, 'Ihre');
    randomEnhancement = randomEnhancement.replace(/\bdeiner\b/g, 'Ihrer');
    randomEnhancement = randomEnhancement.replace(/\bdeinen\b/g, 'Ihren');
    randomEnhancement = randomEnhancement.replace(/\bdeinem\b/g, 'Ihrem');
    randomEnhancement = randomEnhancement.replace(/\bdein\b/g, 'Ihr');
  }

  if (randomEnhancement) {
    enhancedPrompt += `\n\n${randomEnhancement}`;
  }

  // Add module-specific context
  let moduleContext = getModuleSpecificGROWContext(moduleId, phase);
  if (moduleContext) {
    // Apply address style to module context
    if (addressStyle === 'Sie') {
      moduleContext = moduleContext.replace(/\bdeine\b/g, 'Ihre');
      moduleContext = moduleContext.replace(/\bdeiner\b/g, 'Ihrer');
      moduleContext = moduleContext.replace(/\bdeinen\b/g, 'Ihren');
      moduleContext = moduleContext.replace(/\bdeinem\b/g, 'Ihrem');
      moduleContext = moduleContext.replace(/\bdein\b/g, 'Ihr');
    }
    enhancedPrompt += `\n\n${moduleContext}`;
  }

  // Add coaching quality reminder
  if (phase === 'goal' || phase === 'will') {
    enhancedPrompt += `\n\n💡 Hinweis: Nutze offene Fragen und unterstütze ${addressStyle === 'Sie' ? 'Ihre' : 'deine'} Autonomie bei der Antwort.`;
  }

  return enhancedPrompt;
}

/**
 * Detect current GROW phase from conversation messages
 */
export function detectGROWPhase(
  messages: ChatMessage[],
  currentModuleId?: ModuleId
): GROWPhase {
  if (!messages.length) {
    return 'goal'; // Start with goal phase
  }

  // Analyze last few messages for phase indicators
  const recentMessages = messages.slice(-6); // Look at last 6 messages
  const allText = recentMessages
    .map(m => m.content.toLowerCase())
    .join(' ');

  // Score each phase based on indicators
  const phaseScores: Record<GROWPhase, number> = {
    goal: 0,
    reality: 0,
    options: 0,
    will: 0
  };

  // Score based on keywords and patterns
  Object.entries(GROW_PHASE_INDICATORS).forEach(([phase, indicators]) => {
    const phaseName = phase as GROWPhase;

    // Keyword scoring
    indicators.keywords.forEach(keyword => {
      const count = (allText.match(new RegExp(keyword, 'g')) || []).length;
      phaseScores[phaseName] += count * 2;
    });

    // Pattern scoring (stronger signal)
    indicators.patterns.forEach(pattern => {
      const matches = allText.match(pattern);
      if (matches) {
        phaseScores[phaseName] += 5;
      }
    });

    // Negative keyword penalty
    indicators.negativeKeywords.forEach(keyword => {
      const count = (allText.match(new RegExp(keyword, 'g')) || []).length;
      phaseScores[phaseName] -= count * 1;
    });
  });

  // Get the phase with highest score
  const sortedPhases = Object.entries(phaseScores).sort(([,a], [,b]) => b - a);
  const detectedPhase = (sortedPhases[0]?.[0] ?? 'goal') as GROWPhase;

  // Apply module-specific logic
  if (currentModuleId) {
    const moduleProgression = DEFAULT_GROW_PROGRESSION[currentModuleId];

    // If detected phase is not in module progression, default to first phase
    if (moduleProgression && !moduleProgression.includes(detectedPhase)) {
      return moduleProgression[0] ?? 'goal';
    }

    // For milestone-focused modules, prefer Will phase
    if (currentModuleId === 'gz-meilensteine' && phaseScores.will > 0) {
      return 'will';
    }

    // For summary modules, prefer Reality phase
    if (currentModuleId === 'gz-zusammenfassung' && phaseScores.reality > 0) {
      return 'reality';
    }
  }

  return detectedPhase;
}

/**
 * Get next logical GROW phase in sequence
 */
export function getNextGROWPhase(
  currentPhase: GROWPhase,
  moduleId?: ModuleId
): GROWPhase | null {
  const standardProgression: GROWPhase[] = ['goal', 'reality', 'options', 'will'];

  if (moduleId) {
    const moduleProgression = DEFAULT_GROW_PROGRESSION[moduleId];
    if (moduleProgression) {
      const currentIndex = moduleProgression.indexOf(currentPhase);

      if (currentIndex >= 0 && currentIndex < moduleProgression.length - 1) {
        return moduleProgression[currentIndex + 1] ?? null;
      }
      return null; // End of module progression
    }
  }

  const currentIndex = standardProgression.indexOf(currentPhase);
  if (currentIndex >= 0 && currentIndex < standardProgression.length - 1) {
    return standardProgression[currentIndex + 1] ?? null;
  }

  return null; // End of standard progression
}

/**
 * Check if GROW phase is valid for module
 */
export function isPhaseValidForModule(phase: GROWPhase, moduleId: ModuleId): boolean {
  return DEFAULT_GROW_PROGRESSION[moduleId]?.includes(phase) ?? true;
}

/**
 * Get expected GROW phases for a module
 */
export function getModuleGROWPhases(moduleId: ModuleId): GROWPhase[] {
  return DEFAULT_GROW_PROGRESSION[moduleId] || ['goal', 'reality', 'options', 'will'];
}

// ============================================================================
// Module-Specific Context
// ============================================================================

/**
 * Get module and phase specific context enhancement
 */
function getModuleSpecificGROWContext(moduleId: ModuleId, phase: GROWPhase): string | null {
  const modulePhaseContext: Partial<Record<ModuleId, Partial<Record<GROWPhase, string>>>> = {
    'gz-intake': {
      goal: 'Bedenke: Dies ist deine erste wichtige Reflexion über deine Gründungsreise.',
      reality: 'Fokus auf: Aktuelle Situation, Motivation, und ersten Gedanken zur Geschäftsidee.',
      will: 'Wichtig: Commitment zur Fortsetzung und Bereitschaft für tiefere Module.'
    },

    'gz-geschaeftsmodell': {
      goal: 'Bedenke: Hier geht es um die Kernfrage: Was bietest du wem an?',
      reality: 'Fokus auf: Bestehende Ideen, Erfahrungen, erste Überlegungen.',
      options: 'Wichtig: Verschiedene Angebotsformen und Zielgruppen-Optionen erkunden.',
      will: 'Kritisch: Konkrete Entscheidung über Angebot und primäre Zielgruppe.'
    },

    'gz-finanzplanung': {
      goal: 'Bedenke: Zahlen können Angst machen - wir gehen das gemeinsam an.',
      reality: 'Fokus auf: Vorhandene Ersparnisse, Erfahrung mit Zahlen, Unsicherheiten.',
      options: 'Wichtig: Verschiedene Finanzierungsquellen und Szenarien erkunden.',
      will: 'Kritisch: Verbindliche Zahlen und realistische Finanzplanung.'
    },

    'gz-meilensteine': {
      will: 'Fokus: Konkrete Termine, messbare Ziele, verbindliche Commitments.'
    },

    'gz-zusammenfassung': {
      reality: 'Fokus: Reflexion der gesamten Reise, Fortschritte, und nächste Schritte.'
    }
  };

  return modulePhaseContext[moduleId]?.[phase] || null;
}

/**
 * Generate GROW transition message
 */
export function generateGROWTransition(
  fromPhase: GROWPhase,
  toPhase: GROWPhase,
  addressStyle: AddressStyle = 'Du'
): string {
  const transitions: Record<string, string> = {
    'goal-reality': `Gut! Jetzt wo klar ist, was ${addressStyle === 'Sie' ? 'Sie' : 'du'} erreichen ${addressStyle === 'Sie' ? 'möchten' : 'möchtest'}, schauen wir uns an, wo ${addressStyle === 'Sie' ? 'Sie' : 'du'} aktuell ${addressStyle === 'Sie' ? 'stehen' : 'stehst'}.`,
    'reality-options': `Verstehe. Basierend auf ${addressStyle === 'Sie' ? 'Ihrer' : 'deiner'} aktuellen Situation - welche Möglichkeiten ${addressStyle === 'Sie' ? 'sehen Sie' : 'siehst du'}?`,
    'options-will': `Interessante Optionen! Jetzt die wichtige Frage: Was ${addressStyle === 'Sie' ? 'werden Sie' : 'wirst du'} konkret tun?`,
    'reality-goal': `Basierend auf dem, was ${addressStyle === 'Sie' ? 'Sie haben' : 'du hast'} - was ${addressStyle === 'Sie' ? 'wollen Sie' : 'willst du'} erreichen?`,
    'options-goal': `${addressStyle === 'Sie' ? 'Ihre' : 'Deine'} Ideen zeigen viele Möglichkeiten. Was ist ${addressStyle === 'Sie' ? 'Ihr' : 'dein'} eigentliches Ziel?`,
    'will-goal': `${addressStyle === 'Sie' ? 'Sie haben' : 'Du hast'} konkrete Pläne. Aber nochmal zur Grundfrage: Was ${addressStyle === 'Sie' ? 'wollen Sie' : 'willst du'} wirklich erreichen?`
  };

  const key = `${fromPhase}-${toPhase}`;
  return transitions[key] || `Lass uns von ${fromPhase} zu ${toPhase} wechseln.`;
}

/**
 * Validate GROW conversation completeness
 */
export function validateGROWCompleteness(
  messages: ChatMessage[],
  moduleId: ModuleId
): {
  isComplete: boolean;
  missingPhases: GROWPhase[];
  suggestions: string[];
} {
  const requiredPhases = getModuleGROWPhases(moduleId);
  const detectedPhases = new Set<GROWPhase>();

  // Analyze all messages to find covered phases
  // A phase is only considered "covered" if there's substantial content indicating it
  messages.forEach(message => {
    const phase = detectGROWPhase([message], moduleId);
    const messageText = message.content.toLowerCase();

    // Only count as covered if message has meaningful content for that phase
    const hasMinimumContent = messageText.length > 10 &&
                            messageText !== 'unclear message' &&
                            !messageText.includes('unclear');

    if (hasMinimumContent) {
      detectedPhases.add(phase);
    }
  });

  const missingPhases = requiredPhases.filter(phase => !detectedPhases.has(phase));
  const isComplete = missingPhases.length === 0;

  const suggestions: string[] = [];
  if (!isComplete) {
    missingPhases.forEach(phase => {
      switch (phase) {
        case 'goal':
          suggestions.push('Frage nach dem konkreten Ziel für dieses Modul');
          break;
        case 'reality':
          suggestions.push('Erkunde die aktuelle Situation und vorhandene Ressourcen');
          break;
        case 'options':
          suggestions.push('Diskutiere verschiedene Handlungsoptionen');
          break;
        case 'will':
          suggestions.push('Hole verbindliche Commitment für nächste Schritte');
          break;
      }
    });
  }

  return {
    isComplete,
    missingPhases,
    suggestions
  };
}