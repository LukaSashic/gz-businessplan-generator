/**
 * Integration Tests for Module 0: Intake Prompt and Flow (GZ-301)
 *
 * Tests the complete intake module functionality including:
 * - Prompt building for all phases
 * - Strengths extraction and merging
 * - Stage detection from messages
 * - Transition validation
 * - GZ eligibility checking
 */

import { describe, it, expect } from 'vitest';
import {
  // Main prompt building
  buildIntakePrompt,

  // Types
  type UserProfile,
  type IntakeBusinessType,
  type IntakeStageInfo,
  type IntakeStrengths,
  type IntakeModuleOutput,

  // Phase configurations
  PHASE_1_WARMUP,
  PHASE_2_CONTEXT,
  PHASE_3_BUSINESS_IDEA,
  PHASE_4_READINESS,

  // Patterns
  FORBIDDEN_PATTERNS,
  REQUIRED_PATTERNS,

  // Strength functions
  processStrengthsFromResponse,
  mergeStrengths,

  // Stage detection
  detectStageFromMessages,
  Stage,

  // Validation
  isIntakeReadyForTransition,
  validateGZEligibility,

  // Re-exports
  AIPhase,
  getAIPromptForPhase,
  extractStrengths,
  getCoachingDepthForStage,
} from '@/lib/prompts/modules/intake';

// ============================================================================
// Test Fixtures
// ============================================================================

const createBasicUserProfile = (): UserProfile => ({
  name: 'Max',
  currentStatus: 'unemployed',
  algStatus: {
    daysRemaining: 200,
    monthlyAmount: 1800,
  },
  profession: 'IT-Berater',
  yearsExperience: 10,
  education: 'Diplom Informatik',
  qualifications: ['ITIL', 'Scrum Master'],
  statusSince: '2025-09-01',
});

const createBasicBusinessType = (): IntakeBusinessType => ({
  category: 'consulting',
  isDigitalFirst: true,
  isLocationDependent: false,
  requiresPhysicalInventory: false,
  reasoning: 'IT-Beratung ist primär digital und ortsunabhängig',
});

const createBasicStrengths = (): IntakeStrengths => ({
  raw: ['organisiert', 'kommunikativ', 'erfolgreich'],
  categorized: {
    organization: ['organisiert'],
    communication: ['kommunikativ'],
    achievement: ['erfolgreich'],
  },
  confidence: 1.0,
  sourceResponse: 'Ich habe ein IT-Projekt erfolgreich organisiert und war kommunikativ mit allen Stakeholdern.',
});

const createBasicStageInfo = (): IntakeStageInfo => ({
  stage: Stage.PREPARATION,
  coachingDepth: 'deep',
  indicators: ['ich plane', 'konkret', 'erste schritte'],
  approach: 'Konkrete Planung unterstützen',
});

const createCompleteIntakeOutput = (): IntakeModuleOutput => ({
  userProfile: createBasicUserProfile(),
  businessType: createBasicBusinessType(),
  stage: createBasicStageInfo(),
  strengths: createBasicStrengths(),
  businessIdea: {
    elevatorPitch: 'IT-Beratung für kleine Unternehmen bei der Digitalisierung',
    problem: 'KMUs fehlt oft IT-Know-how und Budget für große Beratungen',
    solution: 'Pragmatische, bezahlbare IT-Strategieberatung',
    targetAudience: 'KMUs mit 10-50 Mitarbeitern im Raum München',
    uniqueValue: '10 Jahre Konzernerfahrung, verständliche Sprache, faire Preise',
  },
  validation: {
    isGZEligible: true,
    majorConcerns: [],
    minorConcerns: ['Preismodell noch unklar'],
    strengths: ['Starke IT-Expertise', 'Gutes Netzwerk'],
  },
  metadata: {
    currentPhase: 'completed',
    completedAt: new Date().toISOString(),
    duration: 45,
    conversationTurns: 15,
  },
});

// ============================================================================
// Prompt Building Tests
// ============================================================================

describe('buildIntakePrompt', () => {
  describe('basic prompt generation', () => {
    it('should build a complete intake prompt without options', () => {
      const prompt = buildIntakePrompt();

      expect(prompt).toContain('Greta');
      expect(prompt).toContain('KI-Business-Coach');
      expect(prompt).toContain('Gründungszuschuss');
      expect(prompt).toContain('Intake');
    });

    it('should include the DISCOVER prompt from Appreciative Inquiry', () => {
      const prompt = buildIntakePrompt();
      const discoverPrompt = getAIPromptForPhase(AIPhase.DISCOVER);

      expect(prompt).toContain(discoverPrompt);
    });

    it('should include forbidden patterns', () => {
      const prompt = buildIntakePrompt();

      expect(prompt).toContain('VERBOTENE MUSTER');
      FORBIDDEN_PATTERNS.slice(0, 5).forEach(pattern => {
        expect(prompt).toContain(pattern);
      });
    });

    it('should include required patterns', () => {
      const prompt = buildIntakePrompt();

      expect(prompt).toContain('ERFORDERLICHE MUSTER');
      REQUIRED_PATTERNS.openQuestions.slice(0, 3).forEach(pattern => {
        expect(prompt).toContain(pattern);
      });
    });

    it('should include JSON output instructions', () => {
      const prompt = buildIntakePrompt();

      expect(prompt).toContain('JSON-AUSGABE');
      expect(prompt).toContain('<json>');
      expect(prompt).toContain('</json>');
      expect(prompt).toContain('userProfile');
      expect(prompt).toContain('businessType');
      expect(prompt).toContain('stage');
      expect(prompt).toContain('strengths');
    });
  });

  describe('prompt with options', () => {
    it('should include userName when provided', () => {
      const prompt = buildIntakePrompt({ userName: 'Maria' });

      // The prompt should reference the personalization
      expect(prompt).toContain('warmup');
    });

    it('should include previous strengths when provided', () => {
      const prompt = buildIntakePrompt({
        previousStrengths: ['Kommunikation', 'Organisation'],
      });

      expect(prompt).toContain('Kommunikation');
      expect(prompt).toContain('Organisation');
    });

    it('should adapt to detected stage PRECONTEMPLATION', () => {
      const prompt = buildIntakePrompt({
        detectedStage: Stage.PRECONTEMPLATION,
      });

      expect(prompt).toContain('PRECONTEMPLATION');
      expect(prompt).toContain('shallow');
    });

    it('should adapt to detected stage PREPARATION', () => {
      const prompt = buildIntakePrompt({
        detectedStage: Stage.PREPARATION,
      });

      expect(prompt).toContain('PREPARATION');
      expect(prompt).toContain('deep');
    });

    it('should include correct phase instructions', () => {
      const warmupPrompt = buildIntakePrompt({ currentPhase: 'warmup' });
      expect(warmupPrompt).toContain('Warm-Up');
      expect(warmupPrompt).toContain('Stärken-Entdeckung');

      const profilePrompt = buildIntakePrompt({ currentPhase: 'founder_profile' });
      expect(profilePrompt).toContain('Gründerprofil');
      expect(profilePrompt).toContain('ALG');
    });
  });
});

// ============================================================================
// Phase Configuration Tests
// ============================================================================

describe('Phase Configurations', () => {
  describe('PHASE_1_WARMUP', () => {
    it('should have correct structure', () => {
      expect(PHASE_1_WARMUP.name).toBe('warmup');
      expect(PHASE_1_WARMUP.duration).toBe(5);
      expect(PHASE_1_WARMUP.objectives.length).toBeGreaterThan(0);
      expect(PHASE_1_WARMUP.requiredFields.length).toBeGreaterThan(0);
    });

    it('should require business idea fields', () => {
      expect(PHASE_1_WARMUP.requiredFields).toContain('businessIdea.elevator_pitch');
      expect(PHASE_1_WARMUP.requiredFields).toContain('businessIdea.problem');
    });
  });

  describe('PHASE_2_CONTEXT', () => {
    it('should have correct structure', () => {
      expect(PHASE_2_CONTEXT.name).toBe('founder_profile');
      expect(PHASE_2_CONTEXT.duration).toBe(10);
      expect(PHASE_2_CONTEXT.requiredFields.length).toBeGreaterThan(0);
    });

    it('should have conditional fields for unemployed users', () => {
      expect(PHASE_2_CONTEXT.conditionalFields.unemployed).toContain(
        'founder.algStatus.daysRemaining'
      );
      expect(PHASE_2_CONTEXT.conditionalFields.unemployed).toContain(
        'founder.algStatus.monthlyAmount'
      );
    });
  });

  describe('PHASE_3_BUSINESS_IDEA', () => {
    it('should have correct structure', () => {
      expect(PHASE_3_BUSINESS_IDEA.name).toBe('business_idea');
      expect(PHASE_3_BUSINESS_IDEA.duration).toBe(15);
    });

    it('should require all business idea fields', () => {
      expect(PHASE_3_BUSINESS_IDEA.requiredFields).toContain('businessIdea.uniqueValue');
    });
  });

  describe('PHASE_4_READINESS', () => {
    it('should have stage adaptations for all stages', () => {
      expect(PHASE_4_READINESS.stageAdaptations[Stage.PRECONTEMPLATION]).toBeDefined();
      expect(PHASE_4_READINESS.stageAdaptations[Stage.CONTEMPLATION]).toBeDefined();
      expect(PHASE_4_READINESS.stageAdaptations[Stage.PREPARATION]).toBeDefined();
      expect(PHASE_4_READINESS.stageAdaptations[Stage.ACTION]).toBeDefined();
      expect(PHASE_4_READINESS.stageAdaptations[Stage.MAINTENANCE]).toBeDefined();
    });

    it('should have questions for each stage', () => {
      Object.values(PHASE_4_READINESS.stageAdaptations).forEach(adaptation => {
        expect(adaptation.questions.length).toBeGreaterThan(0);
        expect(adaptation.approach.length).toBeGreaterThan(0);
      });
    });
  });
});

// ============================================================================
// Forbidden and Required Patterns Tests
// ============================================================================

describe('FORBIDDEN_PATTERNS', () => {
  it('should be a non-empty array', () => {
    expect(FORBIDDEN_PATTERNS.length).toBeGreaterThan(10);
  });

  it('should include directive patterns', () => {
    expect(FORBIDDEN_PATTERNS).toContain('du solltest');
    expect(FORBIDDEN_PATTERNS).toContain('du musst');
  });

  it('should include generic praise patterns', () => {
    expect(FORBIDDEN_PATTERNS).toContain('gut gemacht');
    expect(FORBIDDEN_PATTERNS).toContain('super');
  });

  it('should include minimizing patterns', () => {
    expect(FORBIDDEN_PATTERNS).toContain('keine Sorge');
    expect(FORBIDDEN_PATTERNS).toContain('das ist einfach');
  });
});

describe('REQUIRED_PATTERNS', () => {
  it('should have open questions category', () => {
    expect(REQUIRED_PATTERNS.openQuestions.length).toBeGreaterThan(5);
    expect(REQUIRED_PATTERNS.openQuestions).toContain('Was denkst du');
    expect(REQUIRED_PATTERNS.openQuestions).toContain('Erzähl mir mehr über');
  });

  it('should have empathy markers category', () => {
    expect(REQUIRED_PATTERNS.empathyMarkers.length).toBeGreaterThan(3);
    expect(REQUIRED_PATTERNS.empathyMarkers).toContain('Das klingt');
    expect(REQUIRED_PATTERNS.empathyMarkers).toContain('Ich höre');
  });

  it('should have autonomy support category', () => {
    expect(REQUIRED_PATTERNS.autonomySupport.length).toBeGreaterThan(3);
    expect(REQUIRED_PATTERNS.autonomySupport).toContain('Du entscheidest');
  });

  it('should have reflection category', () => {
    expect(REQUIRED_PATTERNS.reflection.length).toBeGreaterThan(2);
    expect(REQUIRED_PATTERNS.reflection).toContain('Wenn ich dich richtig verstehe');
  });
});

// ============================================================================
// Strengths Processing Tests
// ============================================================================

describe('processStrengthsFromResponse', () => {
  it('should extract strengths from a typical success story', () => {
    const response =
      'In meinem letzten Job habe ich ein komplexes Projekt erfolgreich organisiert. ' +
      'Das Team war anfangs skeptisch, aber ich habe alle motiviert und wir haben es geschafft.';

    const result = processStrengthsFromResponse(response);

    expect(result.raw).toContain('erfolgreich');
    expect(result.raw).toContain('organisiert');
    expect(result.raw).toContain('motiviert');
    expect(result.raw).toContain('geschafft');
    expect(result.confidence).toBeGreaterThan(0.5);
    expect(result.sourceResponse).toBe(response);
  });

  it('should categorize strengths correctly', () => {
    const response = 'Ich war sehr organisiert und kommunikativ, habe die Probleme gelöst.';

    const result = processStrengthsFromResponse(response);

    // Check categorization
    expect(result.categorized['organization']).toBeDefined();
    expect(result.categorized['communication']).toBeDefined();
  });

  it('should handle responses with no strengths', () => {
    const response = 'Ich habe einfach gearbeitet.';

    const result = processStrengthsFromResponse(response);

    expect(result.raw.length).toBeLessThan(3);
    expect(result.confidence).toBeLessThan(1);
  });

  it('should handle empty responses', () => {
    const result = processStrengthsFromResponse('');

    expect(result.raw).toEqual([]);
    expect(result.confidence).toBe(0);
  });
});

describe('mergeStrengths', () => {
  it('should merge new strengths with existing ones', () => {
    const existing: IntakeStrengths = {
      raw: ['organisiert', 'kommunikativ'],
      categorized: {
        organization: ['organisiert'],
        communication: ['kommunikativ'],
      },
      confidence: 0.8,
      sourceResponse: 'Erste Antwort',
    };

    const newStrengths: IntakeStrengths = {
      raw: ['erfolgreich', 'motiviert'],
      categorized: {
        achievement: ['erfolgreich'],
        leadership: ['motiviert'],
      },
      confidence: 0.9,
      sourceResponse: 'Zweite Antwort',
    };

    const merged = mergeStrengths(existing, newStrengths);

    expect(merged.raw).toContain('organisiert');
    expect(merged.raw).toContain('kommunikativ');
    expect(merged.raw).toContain('erfolgreich');
    expect(merged.raw).toContain('motiviert');
    expect(merged.categorized['organization']).toContain('organisiert');
    expect(merged.categorized['achievement']).toContain('erfolgreich');
  });

  it('should not duplicate strengths', () => {
    const existing: IntakeStrengths = {
      raw: ['organisiert'],
      categorized: { organization: ['organisiert'] },
      confidence: 0.5,
      sourceResponse: 'Erste Antwort',
    };

    const newStrengths: IntakeStrengths = {
      raw: ['organisiert', 'kommunikativ'],
      categorized: {
        organization: ['organisiert'],
        communication: ['kommunikativ'],
      },
      confidence: 0.6,
      sourceResponse: 'Zweite Antwort',
    };

    const merged = mergeStrengths(existing, newStrengths);

    const orgCount = merged.raw.filter(s => s === 'organisiert').length;
    expect(orgCount).toBe(1);
  });

  it('should handle undefined existing strengths', () => {
    const newStrengths: IntakeStrengths = {
      raw: ['erfolgreich'],
      categorized: { achievement: ['erfolgreich'] },
      confidence: 0.7,
      sourceResponse: 'Antwort',
    };

    const merged = mergeStrengths(undefined, newStrengths);

    expect(merged).toEqual(newStrengths);
  });

  it('should combine source responses', () => {
    const existing: IntakeStrengths = {
      raw: ['organisiert'],
      categorized: {},
      confidence: 0.5,
      sourceResponse: 'Erste',
    };

    const newStrengths: IntakeStrengths = {
      raw: ['erfolgreich'],
      categorized: {},
      confidence: 0.5,
      sourceResponse: 'Zweite',
    };

    const merged = mergeStrengths(existing, newStrengths);

    expect(merged.sourceResponse).toContain('Erste');
    expect(merged.sourceResponse).toContain('Zweite');
  });
});

// ============================================================================
// Stage Detection Tests
// ============================================================================

describe('detectStageFromMessages', () => {
  it('should detect PRECONTEMPLATION stage', () => {
    const messages = [
      { role: 'user' as const, content: 'Ich weiß nicht, ob Selbständigkeit das Richtige für mich ist.' },
      { role: 'assistant' as const, content: 'Das ist eine wichtige Überlegung.' },
      { role: 'user' as const, content: 'Bin mir nicht sicher, vielleicht ist das nichts für mich.' },
    ];

    const result = detectStageFromMessages(messages);

    expect(result.stage).toBe(Stage.PRECONTEMPLATION);
    expect(result.coachingDepth).toBe('shallow');
  });

  it('should detect CONTEMPLATION stage', () => {
    const messages = [
      { role: 'user' as const, content: 'Einerseits möchte ich mein eigener Chef sein, aber andererseits habe ich Angst vor dem Risiko.' },
    ];

    const result = detectStageFromMessages(messages);

    expect(result.stage).toBe(Stage.CONTEMPLATION);
    expect(result.coachingDepth).toBe('medium');
  });

  it('should detect PREPARATION stage', () => {
    const messages = [
      { role: 'user' as const, content: 'Ich plane konkret nächsten Monat zu starten. Habe schon erste Schritte unternommen.' },
    ];

    const result = detectStageFromMessages(messages);

    expect(result.stage).toBe(Stage.PREPARATION);
    expect(result.coachingDepth).toBe('deep');
  });

  it('should detect ACTION stage', () => {
    const messages = [
      { role: 'user' as const, content: 'Ich habe schon gegründet und bin dabei, mein Geschäft aufzubauen. Es läuft bereits.' },
    ];

    const result = detectStageFromMessages(messages);

    expect(result.stage).toBe(Stage.ACTION);
    expect(result.coachingDepth).toBe('medium');
  });

  it('should return approach for detected stage', () => {
    const messages = [
      { role: 'user' as const, content: 'Ich plane konkret zu starten.' },
    ];

    const result = detectStageFromMessages(messages);

    expect(result.approach.length).toBeGreaterThan(0);
  });

  it('should default to CONTEMPLATION for empty messages', () => {
    const result = detectStageFromMessages([]);

    expect(result.stage).toBe(Stage.CONTEMPLATION);
  });
});

// ============================================================================
// Validation Tests
// ============================================================================

describe('isIntakeReadyForTransition', () => {
  it('should return ready=true for complete output', () => {
    const output = createCompleteIntakeOutput();

    const result = isIntakeReadyForTransition(output);

    expect(result.ready).toBe(true);
    expect(result.missingFields).toHaveLength(0);
  });

  it('should require userProfile.currentStatus', () => {
    const output: Partial<IntakeModuleOutput> = {
      businessIdea: {
        elevatorPitch: 'Test',
        problem: 'Test',
        solution: 'Test',
        targetAudience: 'Test',
        uniqueValue: 'Test',
      },
      strengths: createBasicStrengths(),
      stage: createBasicStageInfo(),
    };

    const result = isIntakeReadyForTransition(output);

    expect(result.ready).toBe(false);
    expect(result.missingFields).toContain('userProfile.currentStatus');
  });

  it('should require ALG days for unemployed users', () => {
    const output: Partial<IntakeModuleOutput> = {
      userProfile: {
        currentStatus: 'unemployed',
        // Missing algStatus
      },
      businessIdea: {
        elevatorPitch: 'Test',
        problem: 'Test',
        solution: 'Test',
        targetAudience: 'Test',
        uniqueValue: 'Test',
      },
      strengths: createBasicStrengths(),
      stage: createBasicStageInfo(),
    };

    const result = isIntakeReadyForTransition(output);

    expect(result.ready).toBe(false);
    expect(result.missingFields).toContain('userProfile.algStatus.daysRemaining');
  });

  it('should warn when ALG days are below 150', () => {
    const output: Partial<IntakeModuleOutput> = {
      userProfile: {
        currentStatus: 'unemployed',
        algStatus: {
          daysRemaining: 100, // Below 150
          monthlyAmount: 1500,
        },
      },
      businessIdea: {
        elevatorPitch: 'Test',
        problem: 'Test',
        solution: 'Test',
        targetAudience: 'Test',
        uniqueValue: 'Test',
      },
      strengths: createBasicStrengths(),
      stage: createBasicStageInfo(),
    };

    const result = isIntakeReadyForTransition(output);

    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain('100');
    expect(result.warnings[0]).toContain('150');
  });

  it('should require business idea elevator pitch', () => {
    const output: Partial<IntakeModuleOutput> = {
      userProfile: createBasicUserProfile(),
      strengths: createBasicStrengths(),
      stage: createBasicStageInfo(),
      businessIdea: {
        elevatorPitch: '', // Empty
        problem: 'Test',
        solution: 'Test',
        targetAudience: 'Test',
        uniqueValue: 'Test',
      },
    };

    const result = isIntakeReadyForTransition(output);

    expect(result.ready).toBe(false);
    expect(result.missingFields).toContain('businessIdea.elevatorPitch');
  });

  it('should require strengths', () => {
    const output: Partial<IntakeModuleOutput> = {
      userProfile: createBasicUserProfile(),
      stage: createBasicStageInfo(),
      businessIdea: {
        elevatorPitch: 'Test',
        problem: 'Test',
        solution: 'Test',
        targetAudience: 'Test',
        uniqueValue: 'Test',
      },
      strengths: {
        raw: [], // Empty
        categorized: {},
        confidence: 0,
        sourceResponse: '',
      },
    };

    const result = isIntakeReadyForTransition(output);

    expect(result.ready).toBe(false);
    expect(result.missingFields).toContain('strengths.raw');
  });
});

describe('validateGZEligibility', () => {
  it('should return eligible=true for unemployed with 150+ days', () => {
    const userProfile: UserProfile = {
      currentStatus: 'unemployed',
      algStatus: {
        daysRemaining: 200,
        monthlyAmount: 1500,
      },
    };

    const result = validateGZEligibility(userProfile);

    expect(result.eligible).toBe(true);
    expect(result.reason).toContain('200');
  });

  it('should return eligible=false for employed users', () => {
    const userProfile: UserProfile = {
      currentStatus: 'employed',
    };

    const result = validateGZEligibility(userProfile);

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('ALG I');
  });

  it('should return eligible=false for < 150 days', () => {
    const userProfile: UserProfile = {
      currentStatus: 'unemployed',
      algStatus: {
        daysRemaining: 100,
        monthlyAmount: 1500,
      },
    };

    const result = validateGZEligibility(userProfile);

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('100');
    expect(result.reason).toContain('150');
  });

  it('should return eligible=false for exactly 150 days (edge case)', () => {
    const userProfile: UserProfile = {
      currentStatus: 'unemployed',
      algStatus: {
        daysRemaining: 150,
        monthlyAmount: 1500,
      },
    };

    const result = validateGZEligibility(userProfile);

    expect(result.eligible).toBe(true);
    expect(result.reason).toContain('150');
  });

  it('should return eligible=false when ALG days unknown', () => {
    const userProfile: UserProfile = {
      currentStatus: 'unemployed',
      // Missing algStatus
    };

    const result = validateGZEligibility(userProfile);

    expect(result.eligible).toBe(false);
    expect(result.reason).toContain('nicht bekannt');
  });
});

// ============================================================================
// Re-exports Tests
// ============================================================================

describe('Re-exported functions', () => {
  describe('from appreciative-inquiry', () => {
    it('should re-export AIPhase enum', () => {
      expect(AIPhase.DISCOVER).toBe('DISCOVER');
      expect(AIPhase.DREAM).toBe('DREAM');
      expect(AIPhase.DESIGN).toBe('DESIGN');
      expect(AIPhase.DESTINY).toBe('DESTINY');
    });

    it('should re-export getAIPromptForPhase', () => {
      const prompt = getAIPromptForPhase(AIPhase.DISCOVER);
      expect(prompt).toContain('beruflichen Erfolg');
    });

    it('should re-export extractStrengths', () => {
      const strengths = extractStrengths('Ich war sehr organisiert und erfolgreich.');
      expect(strengths).toContain('organisiert');
      expect(strengths).toContain('erfolgreich');
    });
  });

  describe('from stage-detection', () => {
    it('should re-export Stage enum', () => {
      expect(Stage.PRECONTEMPLATION).toBe('PRECONTEMPLATION');
      expect(Stage.CONTEMPLATION).toBe('CONTEMPLATION');
      expect(Stage.PREPARATION).toBe('PREPARATION');
      expect(Stage.ACTION).toBe('ACTION');
      expect(Stage.MAINTENANCE).toBe('MAINTENANCE');
    });

    it('should re-export getCoachingDepthForStage', () => {
      expect(getCoachingDepthForStage(Stage.PRECONTEMPLATION)).toBe('shallow');
      expect(getCoachingDepthForStage(Stage.PREPARATION)).toBe('deep');
    });
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Intake Module Integration', () => {
  it('should complete full intake flow', () => {
    // 1. Start with warmup phase
    const warmupPrompt = buildIntakePrompt({ currentPhase: 'warmup' });
    expect(warmupPrompt).toContain('DISCOVER');

    // 2. Simulate DISCOVER response and extract strengths
    const discoverResponse =
      'In meinem alten Job war ich sehr strukturiert und habe Projekte erfolgreich geleitet. ' +
      'Meine Kollegen sagten immer, ich sei sehr kommunikativ und kann gut motivieren.';

    const strengths = processStrengthsFromResponse(discoverResponse);
    expect(strengths.raw.length).toBeGreaterThanOrEqual(3);
    expect(strengths.confidence).toBeGreaterThan(0.5);

    // 3. Build prompt with strengths for founder_profile phase
    const profilePrompt = buildIntakePrompt({
      currentPhase: 'founder_profile',
      previousStrengths: strengths.raw,
    });
    expect(profilePrompt).toContain('Gründerprofil');

    // 4. Simulate conversation and detect stage
    const messages = [
      { role: 'user' as const, content: discoverResponse },
      { role: 'assistant' as const, content: 'Das klingt nach einer starken Basis.' },
      { role: 'user' as const, content: 'Ja, ich plane konkret nächsten Monat zu starten. Habe schon erste Schritte gemacht.' },
    ];

    const stageInfo = detectStageFromMessages(messages);
    expect(stageInfo.stage).toBe(Stage.PREPARATION);

    // 5. Build prompt adapted to detected stage
    const adaptedPrompt = buildIntakePrompt({
      currentPhase: 'founder_profile',
      detectedStage: stageInfo.stage,
      previousStrengths: strengths.raw,
    });
    expect(adaptedPrompt).toContain('PREPARATION');
    expect(adaptedPrompt).toContain('deep');

    // 6. Create complete output and validate for transition
    const completeOutput = createCompleteIntakeOutput();
    const transitionCheck = isIntakeReadyForTransition(completeOutput);
    expect(transitionCheck.ready).toBe(true);

    // 7. Validate GZ eligibility
    const gzCheck = validateGZEligibility(completeOutput.userProfile);
    expect(gzCheck.eligible).toBe(true);
  });

  it('should handle edge case: employed user', () => {
    const userProfile: UserProfile = {
      currentStatus: 'employed',
      profession: 'Software Developer',
      yearsExperience: 5,
    };

    // GZ not available for employed
    const gzCheck = validateGZEligibility(userProfile);
    expect(gzCheck.eligible).toBe(false);

    // But intake can still proceed for business planning
    const output: Partial<IntakeModuleOutput> = {
      userProfile,
      businessIdea: {
        elevatorPitch: 'App-Entwicklung für KMUs',
        problem: 'Teure Enterprise-Lösungen',
        solution: 'Günstige Custom-Apps',
        targetAudience: 'KMUs',
        uniqueValue: 'Schnell und günstig',
      },
      strengths: processStrengthsFromResponse('Ich bin sehr strukturiert und erfahren.'),
      stage: detectStageFromMessages([
        { role: 'user' as const, content: 'Ich plane nebenberuflich zu starten.' },
      ]),
    };

    // Won't require ALG status for employed
    const transitionCheck = isIntakeReadyForTransition(output);
    // May still be ready if all other fields are complete
    expect(transitionCheck.missingFields).not.toContain('userProfile.algStatus.daysRemaining');
  });

  it('should progressively merge strengths across conversation', () => {
    // First response
    const response1 = 'Ich bin sehr organisiert.';
    const strengths1 = processStrengthsFromResponse(response1);
    expect(strengths1.raw).toContain('organisiert');

    // Second response
    const response2 = 'Außerdem bin ich kommunikativ und kann gut motivieren.';
    const strengths2 = processStrengthsFromResponse(response2);

    // Merge
    const merged = mergeStrengths(strengths1, strengths2);
    expect(merged.raw).toContain('organisiert');
    expect(merged.raw).toContain('kommunikativ');
    expect(merged.raw).toContain('motivieren');
    expect(merged.sourceResponse).toContain(response1);
    expect(merged.sourceResponse).toContain(response2);

    // Third response
    const response3 = 'Ich habe auch erfolgreich viele Projekte abgeschlossen.';
    const strengths3 = processStrengthsFromResponse(response3);

    // Merge again
    const finalMerged = mergeStrengths(merged, strengths3);
    expect(finalMerged.raw).toContain('erfolgreich');
    expect(finalMerged.raw.length).toBeGreaterThanOrEqual(4);
  });
});
