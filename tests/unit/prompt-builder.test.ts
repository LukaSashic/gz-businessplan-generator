/**
 * Unit Tests for Greta Persona and Prompt Builder
 *
 * Tests the persona definition, prompt building, and quality validation
 */

import { describe, it, expect } from 'vitest';
import {
  // Persona
  GRETA_PERSONA,
  STAGE_ADAPTATIONS,
  EMOTION_ADAPTATIONS,
  MODULE_ADAPTATIONS,
  ADDRESS_TEMPLATES,
  generateEmpathyResponse,
  getPersonaFocus,
  validatePersonaCompliance,
} from '@/lib/prompts/greta-persona';

import {
  // Prompt Builder
  buildSystemPrompt,
  buildPromptComponents,
  buildModuleStartPrompt,
  buildContinuationPrompt,
  buildSDTFocusedPrompt,
  type UserProfile,
  type PromptContext,
} from '@/lib/prompts/prompt-builder';

import { createInitialCoachingState } from '@/types/coaching';

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

const mockCoachingState = createInitialCoachingState();

const mockPromptContext: PromptContext = {
  moduleId: 'gz-intake',
  coachingState: mockCoachingState,
  userProfile: mockUserProfileDu,
  conversationLength: 0,
  isResume: false,
};

// ============================================================================
// Greta Persona Tests
// ============================================================================

describe('Greta Persona Definition', () => {
  it('should have all required persona fields', () => {
    expect(GRETA_PERSONA.name).toBe('Greta');
    expect(GRETA_PERSONA.role).toBeDefined();
    expect(GRETA_PERSONA.background).toBeDefined();
    expect(GRETA_PERSONA.coreValues).toBeDefined();
    expect(GRETA_PERSONA.communicationStyle).toBeDefined();
    expect(GRETA_PERSONA.forbiddenPatterns).toBeDefined();
    expect(GRETA_PERSONA.requiredPatterns).toBeDefined();
    expect(GRETA_PERSONA.sdtPrinciples).toBeDefined();
  });

  it('should have exactly 6 core values', () => {
    expect(GRETA_PERSONA.coreValues).toHaveLength(6);
    expect(GRETA_PERSONA.coreValues[0]).toContain('Ehrlichkeit');
    expect(GRETA_PERSONA.coreValues[1]).toContain('Autonomie');
  });

  it('should have documented forbidden patterns', () => {
    const forbiddenPatterns = GRETA_PERSONA.forbiddenPatterns;

    // Must contain the specific forbidden patterns from PRD
    expect(forbiddenPatterns).toContain('du solltest');
    expect(forbiddenPatterns).toContain('du musst');
    expect(forbiddenPatterns).toContain('am besten');
    expect(forbiddenPatterns).toContain('gut gemacht'); // Generic praise

    // Should have at least 8 forbidden patterns
    expect(forbiddenPatterns.length).toBeGreaterThanOrEqual(8);
  });

  it('should have documented required patterns', () => {
    const requiredPatterns = GRETA_PERSONA.requiredPatterns;

    // Must contain coaching patterns
    expect(requiredPatterns.some(p => p.includes('Was denkst du'))).toBe(true);
    expect(requiredPatterns.some(p => p.includes('Wie würdest du'))).toBe(true);
    expect(requiredPatterns.some(p => p.includes('Erzähl mir mehr'))).toBe(true);
    expect(requiredPatterns.some(p => p.includes('Das klingt'))).toBe(true); // Empathy

    // Should have at least 6 required patterns
    expect(requiredPatterns.length).toBeGreaterThanOrEqual(6);
  });

  it('should have complete SDT principles', () => {
    const sdt = GRETA_PERSONA.sdtPrinciples;

    expect(sdt.autonomy).toBeDefined();
    expect(sdt.competence).toBeDefined();
    expect(sdt.relatedness).toBeDefined();

    // Each principle should have multiple guidelines
    expect(sdt.autonomy.length).toBeGreaterThanOrEqual(4);
    expect(sdt.competence.length).toBeGreaterThanOrEqual(4);
    expect(sdt.relatedness.length).toBeGreaterThanOrEqual(4);
  });
});

describe('Stage Adaptations', () => {
  it('should have adaptations for all TTM stages', () => {
    const stages = ['precontemplation', 'contemplation', 'preparation', 'action', 'maintenance'];

    stages.forEach(stage => {
      const adaptation = STAGE_ADAPTATIONS[stage as keyof typeof STAGE_ADAPTATIONS];
      expect(adaptation).toBeDefined();
      expect(adaptation.approach).toBeDefined();
      expect(adaptation.primaryFocus).toBeDefined();
      expect(adaptation.communicationAdjustment).toBeDefined();
    });
  });

  it('should prioritize different SDT needs by stage', () => {
    expect(STAGE_ADAPTATIONS.precontemplation.primaryFocus).toBe('relatedness');
    expect(STAGE_ADAPTATIONS.contemplation.primaryFocus).toBe('autonomy');
    expect(STAGE_ADAPTATIONS.preparation.primaryFocus).toBe('competence');
    expect(STAGE_ADAPTATIONS.action.primaryFocus).toBe('competence');
    expect(STAGE_ADAPTATIONS.maintenance.primaryFocus).toBe('autonomy');
  });
});

describe('Emotion Adaptations', () => {
  const emotions = ['uncertainty', 'ambivalence', 'anxiety', 'frustration', 'excitement', 'confidence', 'overwhelm', 'doubt'];

  it('should have adaptations for all detectable emotions', () => {
    emotions.forEach(emotion => {
      const adaptation = EMOTION_ADAPTATIONS[emotion as keyof typeof EMOTION_ADAPTATIONS];
      expect(adaptation).toBeDefined();
      expect(adaptation.empathyResponse).toBeDefined();
      expect(adaptation.focusAdjustment).toBeDefined();
      expect(adaptation.sdtEmphasis).toBeDefined();
    });
  });

  it('should have German empathy responses', () => {
    emotions.forEach(emotion => {
      const adaptation = EMOTION_ADAPTATIONS[emotion as keyof typeof EMOTION_ADAPTATIONS];
      // Should be in German (at least some common German words or patterns)
      const germanPatterns = /\b(das|die|der|ist|bin|sind|du|ich|wir|bei|mit|für|über|klingt|zeigt|habe|haben)\b/i;
      expect(adaptation.empathyResponse).toMatch(germanPatterns);
      expect(adaptation.empathyResponse.length).toBeGreaterThan(10);
    });
  });
});

describe('Module Adaptations', () => {
  const modules = [
    'gz-intake', 'gz-geschaeftsmodell', 'gz-unternehmen', 'gz-markt-wettbewerb',
    'gz-marketing', 'gz-finanzplanung', 'gz-swot', 'gz-meilensteine', 'gz-kpi', 'gz-zusammenfassung'
  ];

  it('should have adaptations for all modules', () => {
    modules.forEach(moduleId => {
      const adaptation = MODULE_ADAPTATIONS[moduleId as keyof typeof MODULE_ADAPTATIONS];
      expect(adaptation).toBeDefined();
      expect(adaptation.focus).toBeDefined();
      expect(adaptation.challengeLevel).toBeDefined();
      expect(adaptation.primaryMethodology).toBeDefined();
      expect(adaptation.specificChallenges.length).toBeGreaterThan(0);
    });
  });

  it('should use appropriate methodologies for challenging modules', () => {
    // High challenge modules should use appropriate methodologies
    expect(MODULE_ADAPTATIONS['gz-geschaeftsmodell'].primaryMethodology).toBe('CBC');
    expect(MODULE_ADAPTATIONS['gz-finanzplanung'].primaryMethodology).toBe('CBC');
    expect(MODULE_ADAPTATIONS['gz-marketing'].primaryMethodology).toBe('MI');

    // Low challenge modules can use AI
    expect(MODULE_ADAPTATIONS['gz-intake'].primaryMethodology).toBe('AI');
    expect(MODULE_ADAPTATIONS['gz-zusammenfassung'].primaryMethodology).toBe('AI');
  });
});

// ============================================================================
// Address Style Tests
// ============================================================================

describe('Address Style Templates', () => {
  it('should have templates for both Sie and Du', () => {
    expect(ADDRESS_TEMPLATES.Sie).toBeDefined();
    expect(ADDRESS_TEMPLATES.Du).toBeDefined();
  });

  it('should have all required template fields', () => {
    const requiredFields = ['greeting', 'questionPrefix', 'feedback', 'choices', 'validation', 'reflection', 'partnership', 'closing'];

    requiredFields.forEach(field => {
      expect(ADDRESS_TEMPLATES.Sie[field as keyof typeof ADDRESS_TEMPLATES.Sie]).toBeDefined();
      expect(ADDRESS_TEMPLATES.Du[field as keyof typeof ADDRESS_TEMPLATES.Du]).toBeDefined();
    });
  });

  it('should use formal language for Sie template', () => {
    expect(ADDRESS_TEMPLATES.Sie.questionPrefix).toContain('Sie');
    expect(ADDRESS_TEMPLATES.Sie.feedback).toContain('Sie');
    expect(ADDRESS_TEMPLATES.Sie.partnership).toContain('Sie');
  });

  it('should use informal language for Du template', () => {
    expect(ADDRESS_TEMPLATES.Du.questionPrefix).toContain('du');
    expect(ADDRESS_TEMPLATES.Du.feedback).toContain('Du');
    expect(ADDRESS_TEMPLATES.Du.partnership).toContain('uns');
  });
});

// ============================================================================
// Utility Functions Tests
// ============================================================================

describe('generateEmpathyResponse', () => {
  it('should generate appropriate empathy response for uncertainty', () => {
    const response = generateEmpathyResponse('uncertainty', 'Du');
    expect(response).toContain('Unsicherheit');
    expect(response).toContain('normal');
    expect(response).toContain('du');
  });

  it('should generate appropriate empathy response for anxiety', () => {
    const response = generateEmpathyResponse('anxiety', 'Sie');
    expect(response).toContain('Angst');
    expect(response).toContain('wichtig');
    expect(response).not.toContain('du');
  });
});

describe('getPersonaFocus', () => {
  it('should prioritize emotion over stage for SDT focus', () => {
    const focus1 = getPersonaFocus('gz-intake', 'contemplation', 'anxiety');
    expect(focus1.primaryFocus).toBe('relatedness'); // From anxiety adaptation

    const focus2 = getPersonaFocus('gz-intake', 'contemplation'); // No emotion
    expect(focus2.primaryFocus).toBe('autonomy'); // From contemplation stage
  });

  it('should return module methodology correctly', () => {
    const focus = getPersonaFocus('gz-geschaeftsmodell', 'action');
    expect(focus.methodology).toBe('CBC');
  });
});

describe('validatePersonaCompliance', () => {
  it('should detect forbidden patterns', () => {
    const badResponse = 'Du solltest das am besten so machen. Gut gemacht!';
    const result = validatePersonaCompliance(badResponse);

    expect(result.isValid).toBe(false);
    expect(result.violations.length).toBeGreaterThan(0);
    expect(result.violations.some(v => v.includes('du solltest'))).toBe(true);
    expect(result.violations.some(v => v.includes('am besten'))).toBe(true);
    expect(result.violations.some(v => v.includes('gut gemacht'))).toBe(true);
  });

  it('should pass valid responses with required patterns', () => {
    const goodResponse = 'Was denkst du über diese Möglichkeit? Das klingt interessant.';
    const result = validatePersonaCompliance(goodResponse);

    expect(result.isValid).toBe(true);
    expect(result.violations).toHaveLength(0);
  });

  it('should suggest improvements for responses without required patterns', () => {
    const neutralResponse = 'Das ist eine Möglichkeit. Hier sind die Optionen.';
    const result = validatePersonaCompliance(neutralResponse);

    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.suggestions.some(s => s.includes('open questions'))).toBe(true);
  });
});

// ============================================================================
// Prompt Builder Tests
// ============================================================================

describe('buildSystemPrompt', () => {
  it('should build complete system prompt with all required sections', () => {
    const prompt = buildSystemPrompt(mockPromptContext);

    // Should contain persona introduction
    expect(prompt).toContain('Greta');
    expect(prompt).toContain('KI-Business-Coach');

    // Should contain module information
    expect(prompt).toContain('INTAKE');

    // Should contain communication rules
    expect(prompt).toContain('Kommunikationsregeln');
    expect(prompt).toContain('Du-Form'); // Since mockUserProfileDu uses 'Du'

    // Should contain SDT guidance
    expect(prompt).toContain('Self-Determination Theory');

    // Should contain quality expectations
    expect(prompt).toContain('Qualitätserwartungen');

    // Should contain language templates
    expect(prompt).toContain('Sprach-Templates');
  });

  it('should adapt for Sie vs Du addressing', () => {
    const contextSie: PromptContext = {
      ...mockPromptContext,
      userProfile: mockUserProfileSie,
    };

    const promptDu = buildSystemPrompt(mockPromptContext);
    const promptSie = buildSystemPrompt(contextSie);

    expect(promptDu).toContain('Du-Form');
    expect(promptDu).toContain('dich');

    expect(promptSie).toContain('Sie-Form');
    expect(promptSie).toContain('Sie');
    expect(promptSie).not.toContain('Du-Form');
  });

  it('should include user personalization when provided', () => {
    const prompt = buildSystemPrompt(mockPromptContext);

    expect(prompt).toContain('Max Mustermann');
    expect(prompt).toContain('IT');
    expect(prompt).toContain('intermediate');
  });

  it('should adapt to conversation length for reflective summaries', () => {
    const longConversationContext: PromptContext = {
      ...mockPromptContext,
      conversationLength: 15,
    };

    const prompt = buildSystemPrompt(longConversationContext);
    expect(prompt).toContain('Reflective Summary Needed');
    expect(prompt).toContain('15 Austausche');
  });
});

describe('buildPromptComponents', () => {
  it('should return all required components', () => {
    const components = buildPromptComponents(mockPromptContext);

    expect(components.personaIntroduction).toBeDefined();
    expect(components.moduleInstructions).toBeDefined();
    expect(components.adaptiveInstructions).toBeDefined();
    expect(components.sdtGuidance).toBeDefined();
    expect(components.communicationRules).toBeDefined();
    expect(components.qualityExpectations).toBeDefined();
    expect(components.languageTemplates).toBeDefined();
  });

  it('should include coaching state metrics in quality expectations', () => {
    const components = buildPromptComponents(mockPromptContext);

    expect(components.qualityExpectations).toContain('aktuell: 0'); // Initial coaching state has 0 values
    expect(components.qualityExpectations).toContain('%');
    expect(components.qualityExpectations).toContain('Zielwerte');
  });
});

describe('Preset Builders', () => {
  it('buildModuleStartPrompt should set isResume to false', () => {
    const prompt = buildModuleStartPrompt('gz-intake', mockUserProfileDu, mockCoachingState);

    expect(prompt).toContain('Wir beginnen gemeinsam');
    expect(prompt).not.toContain('setzen unser Gespräch fort');
  });

  it('buildContinuationPrompt should set isResume to true', () => {
    const prompt = buildContinuationPrompt(mockPromptContext);

    expect(prompt).toContain('setzen unser Gespräch fort');
  });

  it('buildContinuationPrompt should update emotion if provided', () => {
    const prompt = buildContinuationPrompt(mockPromptContext, 'anxiety');

    expect(prompt).toContain('anxiety');
    expect(prompt).toContain('Angst zeigt');
  });

  it('buildSDTFocusedPrompt should emphasize specific SDT need', () => {
    const prompt = buildSDTFocusedPrompt(mockPromptContext, 'autonomy');

    expect(prompt).toContain('EXTRA FOCUS: AUTONOMY');
    expect(prompt).toContain('Wahlmöglichkeiten');
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Prompt Builder Integration', () => {
  it('should handle different modules appropriately', () => {
    const financeContext: PromptContext = {
      ...mockPromptContext,
      moduleId: 'gz-finanzplanung',
    };

    const prompt = buildSystemPrompt(financeContext);

    expect(prompt).toContain('FINANZPLANUNG');
    expect(prompt).toContain('high'); // Challenge level
    expect(prompt).toContain('CBC'); // Primary methodology
    expect(prompt).toContain('Math phobia'); // Specific challenge
  });

  it('should adapt to detected emotions', () => {
    const contextWithEmotion: PromptContext = {
      ...mockPromptContext,
      coachingState: {
        ...mockCoachingState,
        lastDetectedEmotion: 'overwhelm',
      },
    };

    const prompt = buildSystemPrompt(contextWithEmotion);

    expect(prompt).toContain('overwhelm');
    expect(prompt).toContain('viel auf einmal');
    expect(prompt).toContain('competence'); // SDT emphasis for overwhelm
  });

  it('should show coaching quality alerts when score is low', () => {
    const lowQualityCoachingState = {
      ...mockCoachingState,
      qualityMetrics: {
        ...mockCoachingState.qualityMetrics,
        openQuestionRatio: 0.3, // Below target of 70%
        empathyMarkerCount: 0, // Below target of 3
      },
      sdtNeeds: {
        ...mockCoachingState.sdtNeeds,
        autonomyInstances: 1, // Below target of 5
      },
    };

    const contextWithLowQuality: PromptContext = {
      ...mockPromptContext,
      coachingState: lowQualityCoachingState,
    };

    const prompt = buildSystemPrompt(contextWithLowQuality);

    expect(prompt).toContain('Coaching Quality Alert');
    expect(prompt).toContain('30%'); // Current ratio
    expect(prompt).toContain('Increase');
  });
});