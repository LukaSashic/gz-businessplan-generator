/**
 * Unit Tests for GROW Model Implementation
 *
 * Tests the GROW (Goal, Reality, Options, Will) conversation structure
 * with SDT integration and German language support.
 */

import { describe, it, expect } from 'vitest';
import {
  getGROWPromptForPhase,
  detectGROWPhase,
  getNextGROWPhase,
  isPhaseValidForModule,
  getModuleGROWPhases,
  generateGROWTransition,
  validateGROWCompleteness,
} from '@/lib/coaching/grow-model';

import type { GROWPhase, ModuleId } from '@/types';
import type { ChatMessage } from '@/types/chat';
import type { UserProfile } from '@/lib/prompts/prompt-builder';

// ============================================================================
// Test Data Setup
// ============================================================================

const mockUserProfileDu: UserProfile = {
  addressStyle: 'Du',
  name: 'Max Mustermann',
  businessType: 'beratung',
  industry: 'IT',
  experienceLevel: 'intermediate',
};

const mockUserProfileSie: UserProfile = {
  addressStyle: 'Sie',
  name: 'Dr. Müller',
  businessType: 'freiberufler',
  industry: 'Gesundheit',
  experienceLevel: 'experienced',
};

const createChatMessage = (content: string, role: 'user' | 'assistant' = 'user'): ChatMessage => ({
  role,
  content,
  timestamp: Date.now(),
});

// ============================================================================
// GROW Prompt Generation Tests
// ============================================================================

describe('getGROWPromptForPhase', () => {
  describe('Basic prompt generation', () => {
    it('should generate goal phase prompt in Du form', () => {
      const prompt = getGROWPromptForPhase('goal', 'gz-intake', mockUserProfileDu);

      expect(prompt).toContain('Was willst DU mit diesem Modul erreichen?');
      expect(prompt).toContain('du');
      expect(prompt).not.toContain('Sie');
    });

    it('should generate goal phase prompt in Sie form', () => {
      const prompt = getGROWPromptForPhase('goal', 'gz-intake', mockUserProfileSie);

      expect(prompt).toContain('Was willst Sie mit diesem Modul erreichen?');
      expect(prompt).toContain('Sie');
    });

    it('should include SDT enhancement for each phase', () => {
      const goalPrompt = getGROWPromptForPhase('goal', 'gz-intake', mockUserProfileDu);
      const realityPrompt = getGROWPromptForPhase('reality', 'gz-intake', mockUserProfileDu);
      const optionsPrompt = getGROWPromptForPhase('options', 'gz-intake', mockUserProfileDu);
      const willPrompt = getGROWPromptForPhase('will', 'gz-intake', mockUserProfileDu);

      // Goal phase should have autonomy focus
      expect(goalPrompt).toMatch(/wichtig|steuern|erfolg|selbst/i);

      // Reality phase should have competence focus
      expect(realityPrompt).toMatch(/fähigkeiten|kompetent|erfolgreich|kannst/i);

      // Options phase should have autonomy focus
      expect(optionsPrompt).toMatch(/richtig.*an|kontrolle|passt zu.*art/i);

      // Will phase should have competence focus
      expect(willPrompt).toMatch(/fortschritte|erfolgreich|fähigkeiten/i);
    });

    it('should include coaching quality reminders for goal and will phases', () => {
      const goalPrompt = getGROWPromptForPhase('goal', 'gz-intake', mockUserProfileDu);
      const willPrompt = getGROWPromptForPhase('will', 'gz-intake', mockUserProfileDu);
      const realityPrompt = getGROWPromptForPhase('reality', 'gz-intake', mockUserProfileDu);

      expect(goalPrompt).toContain('💡 Hinweis');
      expect(goalPrompt).toContain('offene Fragen');
      expect(willPrompt).toContain('💡 Hinweis');
      expect(realityPrompt).not.toContain('💡 Hinweis');
    });
  });

  describe('Module-specific context', () => {
    it('should add intake-specific context', () => {
      const prompt = getGROWPromptForPhase('goal', 'gz-intake', mockUserProfileDu);
      expect(prompt).toContain('erste wichtige Reflexion');
    });

    it('should add geschaeftsmodell-specific context', () => {
      const prompt = getGROWPromptForPhase('goal', 'gz-geschaeftsmodell', mockUserProfileDu);
      expect(prompt).toContain('Was bietest du wem an');
    });

    it('should add finanzplanung-specific context', () => {
      const prompt = getGROWPromptForPhase('goal', 'gz-finanzplanung', mockUserProfileDu);
      expect(prompt).toContain('Zahlen können Angst machen');
    });

    it('should handle modules without specific context', () => {
      const prompt = getGROWPromptForPhase('goal', 'gz-swot', mockUserProfileDu);
      expect(prompt).toContain('Was willst DU mit diesem Modul erreichen?');
      // Should not contain module-specific text but should still work
    });
  });

  describe('All GROW phases', () => {
    const phases: GROWPhase[] = ['goal', 'reality', 'options', 'will'];

    phases.forEach(phase => {
      it(`should generate valid prompt for ${phase} phase`, () => {
        const prompt = getGROWPromptForPhase(phase, 'gz-intake', mockUserProfileDu);

        expect(prompt).toBeDefined();
        expect(prompt.length).toBeGreaterThan(50);
        expect(prompt).toContain('?'); // Should have questions
      });
    });
  });
});

// ============================================================================
// GROW Phase Detection Tests
// ============================================================================

describe('detectGROWPhase', () => {
  it('should default to goal phase for empty messages', () => {
    const phase = detectGROWPhase([]);
    expect(phase).toBe('goal');
  });

  describe('Goal phase detection', () => {
    const goalMessages = [
      'Was ist mein Ziel mit diesem Modul?',
      'Ich möchte erreichen, dass...',
      'Mein Plan ist es zu schaffen...',
      'Das Ergebnis soll sein...',
      'Ich will hier ankommen bei...'
    ];

    goalMessages.forEach(content => {
      it(`should detect goal phase from: "${content}"`, () => {
        const messages = [createChatMessage(content)];
        const phase = detectGROWPhase(messages);
        expect(phase).toBe('goal');
      });
    });
  });

  describe('Reality phase detection', () => {
    const realityMessages = [
      'Aktuell habe ich schon...',
      'Meine derzeitige Situation ist...',
      'Ich kann bereits folgendes...',
      'Was ich momentan habe...',
      'Meine Erfahrung bisher...'
    ];

    realityMessages.forEach(content => {
      it(`should detect reality phase from: "${content}"`, () => {
        const messages = [createChatMessage(content)];
        const phase = detectGROWPhase(messages);
        expect(phase).toBe('reality');
      });
    });
  });

  describe('Options phase detection', () => {
    const optionsMessages = [
      'Welche Möglichkeiten gibt es?',
      'Ich könnte verschiedene Wege gehen...',
      'Eine Alternative wäre...',
      'Die Optionen, die ich sehe...',
      'Was wäre wenn ich...'
    ];

    optionsMessages.forEach(content => {
      it(`should detect options phase from: "${content}"`, () => {
        const messages = [createChatMessage(content)];
        const phase = detectGROWPhase(messages);
        expect(phase).toBe('options');
      });
    });
  });

  describe('Will phase detection', () => {
    const willMessages = [
      'Ich werde konkret anfangen mit...',
      'Mein nächster Schritt ist...',
      'Ich nehme mir vor zu...',
      'Ich plane definitiv...',
      'Ich verpflichte mich dazu...'
    ];

    willMessages.forEach(content => {
      it(`should detect will phase from: "${content}"`, () => {
        const messages = [createChatMessage(content)];
        const phase = detectGROWPhase(messages);
        expect(phase).toBe('will');
      });
    });
  });

  describe('Module-specific logic', () => {
    it('should prefer will phase for meilensteine module', () => {
      const messages = [
        createChatMessage('Ich werde bis März...'),
        createChatMessage('Mein konkreter Plan...')
      ];
      const phase = detectGROWPhase(messages, 'gz-meilensteine');
      expect(phase).toBe('will');
    });

    it('should prefer reality phase for zusammenfassung module', () => {
      const messages = [
        createChatMessage('Was ich erreicht habe...'),
        createChatMessage('Aktueller Stand ist...')
      ];
      const phase = detectGROWPhase(messages, 'gz-zusammenfassung');
      expect(phase).toBe('reality');
    });

    it('should default to first module phase for invalid detection', () => {
      const messages = [createChatMessage('unclear message')];
      const phase = detectGROWPhase(messages, 'gz-kpi'); // reality, options
      expect(['reality', 'options']).toContain(phase);
    });
  });

  describe('Conversation context analysis', () => {
    it('should analyze multiple messages for better context', () => {
      const messages = [
        createChatMessage('Was ich bisher erreicht habe...'),
        createChatMessage('Ich habe bereits folgende Erfahrungen...'),
        createChatMessage('Aktuell kann ich schon...')
      ];
      const phase = detectGROWPhase(messages);
      expect(phase).toBe('reality');
    });

    it('should weight recent messages more heavily', () => {
      const messages = [
        createChatMessage('Mein Ziel ist es...'), // Goal signal
        createChatMessage('Aber konkret werde ich...'), // Recent Will signal
        createChatMessage('Ich verpflichte mich zu...') // Strong Will signal
      ];
      const phase = detectGROWPhase(messages);
      expect(phase).toBe('will');
    });
  });
});

// ============================================================================
// GROW Phase Progression Tests
// ============================================================================

describe('getNextGROWPhase', () => {
  it('should return correct next phase in standard progression', () => {
    expect(getNextGROWPhase('goal')).toBe('reality');
    expect(getNextGROWPhase('reality')).toBe('options');
    expect(getNextGROWPhase('options')).toBe('will');
    expect(getNextGROWPhase('will')).toBeNull();
  });

  it('should handle module-specific progressions', () => {
    expect(getNextGROWPhase('goal', 'gz-meilensteine')).toBeNull(); // Only will phase
    expect(getNextGROWPhase('reality', 'gz-kpi')).toBe('options'); // reality, options
    expect(getNextGROWPhase('options', 'gz-kpi')).toBeNull();
  });

  it('should return null for invalid current phase', () => {
    expect(getNextGROWPhase('reality', 'gz-zusammenfassung')).toBeNull(); // Only reality
  });
});

describe('isPhaseValidForModule', () => {
  it('should validate phases for standard modules', () => {
    expect(isPhaseValidForModule('goal', 'gz-intake')).toBe(true);
    expect(isPhaseValidForModule('reality', 'gz-intake')).toBe(true);
    expect(isPhaseValidForModule('options', 'gz-intake')).toBe(true);
    expect(isPhaseValidForModule('will', 'gz-intake')).toBe(true);
  });

  it('should validate phases for specialized modules', () => {
    expect(isPhaseValidForModule('will', 'gz-meilensteine')).toBe(true);
    expect(isPhaseValidForModule('goal', 'gz-meilensteine')).toBe(false);

    expect(isPhaseValidForModule('reality', 'gz-zusammenfassung')).toBe(true);
    expect(isPhaseValidForModule('will', 'gz-zusammenfassung')).toBe(false);
  });
});

describe('getModuleGROWPhases', () => {
  it('should return all phases for standard modules', () => {
    const phases = getModuleGROWPhases('gz-intake');
    expect(phases).toEqual(['goal', 'reality', 'options', 'will']);
  });

  it('should return specific phases for specialized modules', () => {
    expect(getModuleGROWPhases('gz-meilensteine')).toEqual(['will']);
    expect(getModuleGROWPhases('gz-kpi')).toEqual(['reality', 'options']);
    expect(getModuleGROWPhases('gz-zusammenfassung')).toEqual(['reality']);
  });

  it('should default to standard progression for unknown modules', () => {
    const phases = getModuleGROWPhases('unknown-module' as ModuleId);
    expect(phases).toEqual(['goal', 'reality', 'options', 'will']);
  });
});

// ============================================================================
// GROW Transitions Tests
// ============================================================================

describe('generateGROWTransition', () => {
  it('should generate appropriate transition messages in Du form', () => {
    const transition1 = generateGROWTransition('goal', 'reality', 'Du');
    expect(transition1).toContain('du');
    expect(transition1).toContain('erreichen möchtest');
    expect(transition1).not.toContain('Sie');

    const transition2 = generateGROWTransition('reality', 'options', 'Du');
    expect(transition2).toContain('siehst du');
  });

  it('should generate appropriate transition messages in Sie form', () => {
    const transition1 = generateGROWTransition('goal', 'reality', 'Sie');
    expect(transition1).toContain('Sie');
    expect(transition1).toContain('möchten');
    expect(transition1).not.toContain('du');

    const transition2 = generateGROWTransition('options', 'will', 'Sie');
    expect(transition2).toContain('werden Sie');
  });

  it('should handle all common phase transitions', () => {
    const transitions = [
      ['goal', 'reality'],
      ['reality', 'options'],
      ['options', 'will'],
      ['reality', 'goal'],
      ['options', 'goal'],
      ['will', 'goal']
    ] as const;

    transitions.forEach(([from, to]) => {
      const message = generateGROWTransition(from, to);
      expect(message).toBeDefined();
      expect(message.length).toBeGreaterThan(10);
    });
  });

  it('should provide fallback for unknown transitions', () => {
    const message = generateGROWTransition('goal', 'goal'); // Same phase
    expect(message).toContain('goal zu goal');
  });
});

// ============================================================================
// GROW Validation Tests
// ============================================================================

describe('validateGROWCompleteness', () => {
  it('should validate complete GROW conversation', () => {
    const messages = [
      createChatMessage('Mein Ziel ist es...'), // goal
      createChatMessage('Aktuell habe ich...'), // reality
      createChatMessage('Ich könnte verschiedene Wege...'), // options
      createChatMessage('Ich werde konkret anfangen...') // will
    ];

    const result = validateGROWCompleteness(messages, 'gz-intake');

    expect(result.isComplete).toBe(true);
    expect(result.missingPhases).toHaveLength(0);
    expect(result.suggestions).toHaveLength(0);
  });

  it('should identify missing phases', () => {
    const messages = [
      createChatMessage('Mein Ziel ist es...'), // goal
      createChatMessage('Aktuell habe ich...') // reality
      // Missing options and will
    ];

    const result = validateGROWCompleteness(messages, 'gz-intake');

    expect(result.isComplete).toBe(false);
    expect(result.missingPhases).toContain('options');
    expect(result.missingPhases).toContain('will');
    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.suggestions.some(s => s.includes('Handlungsoptionen'))).toBe(true);
  });

  it('should provide specific suggestions for missing phases', () => {
    const messages = [
      createChatMessage('Unclear message')
    ];

    const result = validateGROWCompleteness(messages, 'gz-geschaeftsmodell');

    expect(result.suggestions).toContain('Frage nach dem konkreten Ziel für dieses Modul');
    expect(result.suggestions).toContain('Erkunde die aktuelle Situation und vorhandene Ressourcen');
    expect(result.suggestions).toContain('Diskutiere verschiedene Handlungsoptionen');
    expect(result.suggestions).toContain('Hole verbindliche Commitment für nächste Schritte');
  });

  it('should handle module-specific requirements', () => {
    const messages = [
      createChatMessage('Ich werde bis März...') // will
    ];

    const result = validateGROWCompleteness(messages, 'gz-meilensteine');

    expect(result.isComplete).toBe(true); // Only needs will phase
    expect(result.missingPhases).toHaveLength(0);
  });

  it('should handle partial conversations correctly', () => {
    const messages = [
      createChatMessage('Was ich erreichen will...'), // goal
      createChatMessage('Verschiedene Optionen wären...') // options
      // Missing reality
    ];

    const result = validateGROWCompleteness(messages, 'gz-kpi'); // needs reality, options

    // Should be complete since it has both required phases
    expect(result.isComplete).toBe(true);
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('GROW Model Integration', () => {
  it('should work end-to-end for a complete conversation flow', () => {
    const messages: ChatMessage[] = [];

    // Start with goal
    let currentPhase = detectGROWPhase(messages, 'gz-intake');
    expect(currentPhase).toBe('goal');

    const goalPrompt = getGROWPromptForPhase(currentPhase, 'gz-intake', mockUserProfileDu);
    expect(goalPrompt).toContain('Was willst DU');

    // User responds with goal
    messages.push(createChatMessage('Ich möchte mein Geschäftsmodell klar definieren'));

    // Detect next phase
    const nextPhase = getNextGROWPhase(currentPhase, 'gz-intake');
    expect(nextPhase).toBe('reality');

    // Generate transition
    const transition = generateGROWTransition(currentPhase, nextPhase!, 'Du');
    expect(transition).toContain('schauen wir uns an');

    // Continue conversation...
    messages.push(createChatMessage('Aktuell habe ich eine vage Idee...'));

    // Validate progression
    const validation = validateGROWCompleteness(messages, 'gz-intake');
    expect(validation.isComplete).toBe(false);
    expect(validation.missingPhases).toContain('options');
    expect(validation.missingPhases).toContain('will');
  });

  it('should adapt to different modules appropriately', () => {
    const modules: ModuleId[] = [
      'gz-intake',
      'gz-geschaeftsmodell',
      'gz-finanzplanung',
      'gz-meilensteine',
      'gz-zusammenfassung'
    ];

    modules.forEach(moduleId => {
      const phases = getModuleGROWPhases(moduleId);
      expect(phases.length).toBeGreaterThan(0);

      phases.forEach(phase => {
        expect(isPhaseValidForModule(phase, moduleId)).toBe(true);

        const prompt = getGROWPromptForPhase(phase, moduleId, mockUserProfileDu);
        expect(prompt).toBeDefined();
        expect(prompt.length).toBeGreaterThan(20);
      });
    });
  });

  it('should maintain consistency between detection and generation', () => {
    const testPhrases = [
      { text: 'Mein Ziel ist es zu erreichen...', expectedPhase: 'goal' },
      { text: 'Aktuell habe ich bereits...', expectedPhase: 'reality' },
      { text: 'Ich könnte verschiedene Wege...', expectedPhase: 'options' },
      { text: 'Ich werde konkret anfangen...', expectedPhase: 'will' }
    ] as const;

    testPhrases.forEach(({ text, expectedPhase }) => {
      const messages = [createChatMessage(text)];
      const detectedPhase = detectGROWPhase(messages);

      expect(detectedPhase).toBe(expectedPhase);

      // Should be able to generate appropriate prompt for detected phase
      const prompt = getGROWPromptForPhase(detectedPhase, 'gz-intake', mockUserProfileDu);
      expect(prompt).toBeDefined();
    });
  });
});