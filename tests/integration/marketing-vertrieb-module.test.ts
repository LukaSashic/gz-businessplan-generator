/**
 * Integration Tests for Marketing & Vertrieb Module (GZ-502)
 *
 * Tests the complete marketing strategy and sales process module including:
 * - Basic prompt generation with business context integration
 * - Phase-specific instruction generation for all 6 workflow phases
 * - Sales resistance handling with CBC 5-step pattern
 * - MI customer relationship change talk detection and response
 * - Business type adaptation (B2B vs B2C)
 * - Research trigger detection and response generation
 * - Question cluster completeness in German
 * - JSON output schema validation
 * - Type system integration with MarketingVertriebPhase and SalesResistanceLevel enums
 * - CBC and MI integration verification
 */

import { describe, it, expect } from 'vitest';
import {
  buildMarketingVertriebPrompt,
  detectSalesResistance,
  detectCustomerRelationshipChangeTalk,
  getMIResponseForCustomerRelationship,
  shouldTriggerMarketingResearch,
  QUESTION_CLUSTERS,
  SALES_RESISTANCE_PATTERNS,
  BUSINESS_TYPE_ADAPTATIONS,
  FORBIDDEN_PATTERNS,
  REQUIRED_PATTERNS,
} from '@/lib/prompts/modules/marketing-vertrieb';

import {
  MarketingVertriebPhase,
  BusinessModel,
  SalesResistanceLevel,
  PartialMarketingVertriebOutputSchema,
  calculateMarketingVertriebCompletion,
  isMarketingVertriebComplete,
  type PartialMarketingVertriebOutput,
} from '@/types/modules/marketing-vertrieb';

import { detectLimitingBelief, CBCStep } from '@/lib/coaching/cbc-reframing';

// ============================================================================
// Test Data
// ============================================================================

const mockBusinessIdea = {
  problem: 'IT-Berater haben Schwierigkeiten bei der Kundenakquise',
  solution: 'Spezialisiertes Coaching für IT-Berater zur authentischen Kundengewinnung',
  targetAudience: 'Selbständige IT-Berater und kleine IT-Unternehmen',
  usp: 'Branchenspezifisches Know-how kombiniert mit Coaching-Expertise',
  elevatorPitch: 'Ich helfe IT-Beratern dabei, authentisch neue Kunden zu gewinnen, ohne aggressive Verkaufstaktiken zu verwenden.',
};

const mockMarketAnalysis = {
  primarySegment: 'Selbständige IT-Berater in Deutschland',
  marketSize: 50000,
  competitors: ['IT-Business-Coach Hamburg', 'TechSales Academy', 'Consultant Growth'],
  positionStatement: 'Für IT-Berater, die authentisch verkaufen wollen, ist mein Coaching das einzige, das Branchenwissen mit Verkaufspsychologie verbindet.',
};

const mockUserStrengths = [
  'Technisches Verständnis',
  'Analytisches Denken',
  'Kundenorientierung'
];

// ============================================================================
// Basic Prompt Generation Tests
// ============================================================================

describe('Marketing & Vertrieb Module - Basic Prompt Generation', () => {
  it('should generate basic prompt without options', () => {
    const prompt = buildMarketingVertriebPrompt();

    expect(prompt).toContain('Modul 4: Marketing & Vertrieb');
    expect(prompt).toContain('Greta');
    expect(prompt).toContain('Kundengewinnung');
    expect(prompt).toContain('GROW-STRUKTUR');
    expect(prompt).toContain('JSON-AUSGABE');
  });

  it('should integrate business idea context', () => {
    const prompt = buildMarketingVertriebPrompt({
      businessIdea: mockBusinessIdea,
    });

    expect(prompt).toContain(mockBusinessIdea.elevatorPitch);
    expect(prompt).toContain('IT-Berater');
    expect(prompt).toContain('authentisch');
  });

  it('should integrate market analysis context', () => {
    const prompt = buildMarketingVertriebPrompt({
      businessIdea: mockBusinessIdea,
      marketAnalysis: mockMarketAnalysis,
    });

    expect(prompt).toContain(mockMarketAnalysis.positionStatement);
    expect(prompt).toContain(mockMarketAnalysis.primarySegment);
  });

  it('should include user strengths when provided', () => {
    const prompt = buildMarketingVertriebPrompt({
      userStrengths: mockUserStrengths,
    });

    mockUserStrengths.forEach(strength => {
      expect(prompt).toContain(strength);
    });
  });
});

// ============================================================================
// Phase-Specific Instructions Tests
// ============================================================================

describe('Marketing & Vertrieb Module - Phase Instructions', () => {
  it('should generate intro phase instructions', () => {
    const prompt = buildMarketingVertriebPrompt({
      currentPhase: 'intro',
      businessIdea: mockBusinessIdea,
    });

    expect(prompt).toContain('Phase: Einführung');
    expect(prompt).toContain('GOAL-Frage');
    expect(prompt).toContain('REALITY-Frage');
    expect(prompt).toContain('Sales Resistance');
    expect(prompt).toContain('Wie gewinnst du heute Kunden?');
  });

  it('should generate kundenakquise phase instructions', () => {
    const prompt = buildMarketingVertriebPrompt({
      currentPhase: 'kundenakquise',
      businessModel: 'b2b',
    });

    expect(prompt).toContain('Phase: Kundenakquise-Strategie');
    expect(prompt).toContain('Customer Journey');
    expect(prompt).toContain('Acquisition Channels');
    expect(prompt).toContain('B2B');
    expect(QUESTION_CLUSTERS.kundenakquise.questions).toHaveLength(6);
  });

  it('should generate kanaele phase instructions', () => {
    const prompt = buildMarketingVertriebPrompt({
      currentPhase: 'kanaele',
      businessModel: 'b2c',
    });

    expect(prompt).toContain('Phase: Marketing-Kanäle');
    expect(prompt).toContain('Kanal-Bewertung');
    expect(prompt).toContain('Zielgruppen-Fit');
    expect(prompt).toContain('Authentizität');
    expect(prompt).toContain('Messbarkeit');
  });

  it('should generate preisgestaltung phase instructions', () => {
    const prompt = buildMarketingVertriebPrompt({
      currentPhase: 'preisgestaltung',
    });

    expect(prompt).toContain('Phase: Preisgestaltung');
    expect(prompt).toContain('Pricing-Strategie');
    expect(prompt).toContain('Value-based Pricing');
    expect(prompt).toContain('ROI für Kunden');
  });

  it('should generate verkaufsprozess phase instructions', () => {
    const prompt = buildMarketingVertriebPrompt({
      currentPhase: 'verkaufsprozess',
    });

    expect(prompt).toContain('Phase: Verkaufsprozess');
    expect(prompt).toContain('Sales Process Steps');
    expect(prompt).toContain('Objection Handling');
    expect(prompt).toContain('Authentischer Verkauf');
    expect(prompt).toContain('Beratung statt Überredung');
  });

  it('should generate sales resistance phase with CBC steps', () => {
    const prompt = buildMarketingVertriebPrompt({
      currentPhase: 'sales_resistance',
      salesResistanceLevel: 'strong',
      currentCBCStep: CBCStep.EVIDENCE,
    });

    expect(prompt).toContain('Phase: Sales Resistance Handling');
    expect(prompt).toContain('CBC Schritt: EVIDENCE');
    expect(prompt).toContain('Hast du schon mal jemanden von einer Idee überzeugt');
    expect(prompt).toContain('Aktueller CBC Schritt');
  });
});

// ============================================================================
// Sales Resistance Detection Tests
// ============================================================================

describe('Marketing & Vertrieb Module - Sales Resistance Detection', () => {
  it('should detect strong sales resistance', () => {
    const strongResistanceMessages = [
      'Ich bin kein Verkäufer und kann das nicht',
      'Verkaufen liegt mir nicht, ich hasse Kaltakquise',
      'Ich bin nicht gut im Verkauf, Marketing ist nicht mein Ding',
    ];

    strongResistanceMessages.forEach(message => {
      const level = detectSalesResistance(message);
      expect(level).toBe('strong');
    });
  });

  it('should detect moderate sales resistance', () => {
    const moderateResistanceMessages = [
      'Ich bin kein Verkäufer',
      'Kaltakquise ist nichts für mich',
      'Ich bin nicht gut im verkauf',
    ];

    moderateResistanceMessages.forEach(message => {
      const level = detectSalesResistance(message);
      expect(level).toBe('moderate');
    });
  });

  it('should detect mild sales resistance', () => {
    const mildResistanceMessages = [
      'Verkaufen ist schwer für mich',
      'Marketing ist schwer',
      'Ich bin nicht gut darin, Kunden zu überzeugen',
    ];

    mildResistanceMessages.forEach(message => {
      const level = detectSalesResistance(message);
      expect(level).toBe('mild');
    });
  });

  it('should detect no sales resistance', () => {
    const neutralMessages = [
      'Ich möchte meine Kunden besser verstehen',
      'Wie kann ich authentisch verkaufen?',
      'Marketing interessiert mich',
    ];

    neutralMessages.forEach(message => {
      const level = detectSalesResistance(message);
      expect(level).toBe('none');
    });
  });
});

// ============================================================================
// Customer Relationship MI Tests
// ============================================================================

describe('Marketing & Vertrieb Module - Customer Relationship MI', () => {
  it('should detect customer relationship change talk', () => {
    const changeTalkMessages = [
      'Ich will meinen Kunden wirklich helfen',
      'Beziehungen sind mir sehr wichtig',
      'Ich höre gerne zu und verstehe Menschen',
      'Menschen vertrauen mir normalerweise',
    ];

    changeTalkMessages.forEach(message => {
      const changeTalk = detectCustomerRelationshipChangeTalk(message);
      expect(changeTalk).not.toBeNull();
    });
  });

  it('should generate appropriate MI responses for customer focus', () => {
    const helpMessage = 'Ich will meinen Kunden helfen';
    const response = getMIResponseForCustomerRelationship('DESIRE', helpMessage);

    expect(response).toContain('helfen');
    expect(response).toContain('wichtig');
    expect(response).toContain('Kundenbeziehungen');
  });

  it('should generate appropriate MI responses for authenticity', () => {
    const authenticityMessage = 'Ich will ehrlich und authentisch sein';
    const response = getMIResponseForCustomerRelationship('DESIRE', authenticityMessage);

    expect(response).toContain('Authentizität');
    expect(response).toContain('Stärke');
  });

  it('should generate appropriate MI responses for listening', () => {
    const listeningMessage = 'Ich höre gerne zu';
    const response = getMIResponseForCustomerRelationship('ABILITY', listeningMessage);

    expect(response).toContain('Zuhören');
    expect(response).toContain('Superpower');
    expect(response).toContain('Verkauf');
  });
});

// ============================================================================
// Business Type Adaptation Tests
// ============================================================================

describe('Marketing & Vertrieb Module - Business Type Adaptations', () => {
  it('should provide B2B-specific guidance', () => {
    const prompt = buildMarketingVertriebPrompt({
      currentPhase: 'kundenakquise',
      businessModel: 'b2b',
    });

    expect(prompt).toContain('B2B');
    expect(prompt).toContain('Längere Verkaufszyklen');
    expect(prompt).toContain('Multiple Entscheidungsträger');
    expect(prompt).toContain('LinkedIn');
    expect(prompt).toContain('ROI');
  });

  it('should provide B2C-specific guidance', () => {
    const prompt = buildMarketingVertriebPrompt({
      currentPhase: 'kundenakquise',
      businessModel: 'b2c',
    });

    expect(prompt).toContain('B2C');
    expect(prompt).toContain('Kürzere Entscheidungszyklen');
    expect(prompt).toContain('Emotionale Komponenten');
    expect(prompt).toContain('Social Media');
    expect(prompt).toContain('Instagram');
  });

  it('should include business-specific questions', () => {
    const b2bAdaptation = BUSINESS_TYPE_ADAPTATIONS.b2b;
    const b2cAdaptation = BUSINESS_TYPE_ADAPTATIONS.b2c;

    expect(b2bAdaptation.questions).toHaveLength(4);
    expect(b2cAdaptation.questions).toHaveLength(4);

    expect(b2bAdaptation.questions[0]).toContain('Entscheidungsprozess');
    expect(b2cAdaptation.questions[0]).toContain('Emotionen');
  });
});

// ============================================================================
// Research Trigger Tests
// ============================================================================

describe('Marketing & Vertrieb Module - Research Triggers', () => {
  it('should trigger research for marketing channels', () => {
    const researchMessages = [
      'Welche Marketing Kanäle gibt es für meine Branche?',
      'Was kostet Werbung normalerweise?',
      'Wie machen andere das in meinem Bereich?',
      'Was sind branchenübliche Preise?',
    ];

    researchMessages.forEach(message => {
      const shouldResearch = shouldTriggerMarketingResearch(message);
      expect(shouldResearch).toBe(true);
    });
  });

  it('should not trigger research for regular questions', () => {
    const normalMessages = [
      'Wie definiere ich meine Zielgruppe?',
      'Was ist ein guter Verkaufsprozess?',
      'Wie überwinde ich meine Verkaufsangst?',
    ];

    normalMessages.forEach(message => {
      const shouldResearch = shouldTriggerMarketingResearch(message);
      expect(shouldResearch).toBe(false);
    });
  });
});

// ============================================================================
// Question Clusters Completeness Tests
// ============================================================================

describe('Marketing & Vertrieb Module - Question Clusters', () => {
  it('should have complete question clusters in German', () => {
    expect(QUESTION_CLUSTERS.kundenakquise.questions).toHaveLength(6);
    expect(QUESTION_CLUSTERS.kanaele.questions).toHaveLength(6);
    expect(QUESTION_CLUSTERS.preisgestaltung.questions).toHaveLength(6);
    expect(QUESTION_CLUSTERS.verkaufsprozess.questions).toHaveLength(6);
  });

  it('should have German questions with proper formatting', () => {
    Object.values(QUESTION_CLUSTERS).forEach(cluster => {
      cluster.questions.forEach(question => {
        expect(question).toMatch(/^[A-ZÄÖÜ]/); // Starts with capital letter
        expect(question).toMatch(/\?$/); // Ends with question mark
        expect(question.length).toBeGreaterThan(20); // Substantial questions
      });
    });
  });

  it('should cover all marketing areas in question clusters', () => {
    const prompt = buildMarketingVertriebPrompt();

    expect(prompt).toContain('Kundenakquise-Strategie');
    expect(prompt).toContain('Marketing-Kanäle');
    expect(prompt).toContain('Preisgestaltung');
    expect(prompt).toContain('Verkaufsprozess');
  });
});

// ============================================================================
// Forbidden and Required Patterns Tests
// ============================================================================

describe('Marketing & Vertrieb Module - Coaching Patterns', () => {
  it('should enforce forbidden patterns', () => {
    const prompt = buildMarketingVertriebPrompt();

    FORBIDDEN_PATTERNS.forEach(pattern => {
      expect(prompt).toContain(`- "${pattern}"`);
    });

    expect(prompt).toContain('NIEMALS verwenden');
    expect(prompt).toContain('Verkaufen ist einfach');
  });

  it('should include required patterns', () => {
    const prompt = buildMarketingVertriebPrompt();

    expect(prompt).toContain('Offene Fragen');
    expect(prompt).toContain('Empathie-Marker');
    expect(prompt).toContain('CBC-Marker');

    REQUIRED_PATTERNS.openQuestions.forEach(pattern => {
      expect(prompt).toContain(`- "${pattern}...?"`);
    });
  });

  it('should include sales-specific forbidden patterns', () => {
    const prompt = buildMarketingVertriebPrompt();

    expect(prompt).toContain('"Jeder kann verkaufen"');
    expect(prompt).toContain('"Verkaufen ist einfach"');
    expect(prompt).toContain('Besonders verboten');
  });
});

// ============================================================================
// JSON Schema Validation Tests
// ============================================================================

describe('Marketing & Vertrieb Module - JSON Output Schema', () => {
  it('should validate complete marketing output structure', () => {
    const completeOutput: PartialMarketingVertriebOutput = {
      kundenakquise: {
        targetCustomerProfile: 'Selbständige IT-Berater mit 2-10 Jahren Erfahrung',
        acquisitionChannels: [
          {
            name: 'LinkedIn Content Marketing',
            type: 'digital',
            suitability: 9,
            cost: 'low',
            timeToResults: 'medium_term',
            targetAudience: 'IT-Entscheider',
            implementation: 'Tägliche Posts über IT-Trends',
            kpis: ['Engagement Rate', 'Lead Generation'],
            budget: 500
          }
        ],
        primaryChannel: 'LinkedIn',
        secondaryChannels: ['Xing', 'Webinare'],
        customerJourney: {
          awareness: 'LinkedIn Content',
          consideration: 'Webinar Teilnahme',
          decision: 'Beratungsgespräch',
          retention: 'Newsletter'
        }
      },
      kanaele: {
        selectedChannels: [
          {
            name: 'LinkedIn',
            type: 'digital',
            suitability: 9,
            cost: 'low',
            timeToResults: 'medium_term',
            targetAudience: 'IT-Entscheider',
            implementation: 'Content Marketing',
            kpis: ['Reichweite', 'Leads'],
          }
        ],
        channelMix: 'Digital-first mit Events als Support',
        budget: {
          total: 2000,
          breakdown: { 'LinkedIn': 800, 'Webinare': 1200 }
        },
        timeline: 'Q1: LinkedIn, Q2: Webinare hinzufügen'
      },
      preisgestaltung: {
        strategy: 'value_based',
        basePrice: 1500,
        valueProposition: 'ROI von 300% durch bessere Kundengewinnung',
        competitorComparison: [
          {
            competitor: 'IT-Business-Coach Hamburg',
            theirPrice: 1200,
            yourAdvantage: 'Branchenspezifische Expertise'
          }
        ]
      },
      verkaufsprozess: {
        processType: 'consultative',
        salesSteps: [
          {
            step: 'Kennenlerngespräch',
            description: 'Bedarf und Situation verstehen',
            duration: '30 Minuten',
            tools: ['Zoom', 'Qualifying Questions'],
            successCriteria: 'Vertrauen aufgebaut'
          }
        ],
        customerTouchpoints: ['LinkedIn', 'E-Mail', 'Telefon'],
        objectionHandling: [
          {
            objection: 'Zu teuer',
            response: 'Lasst uns den ROI gemeinsam durchrechnen'
          }
        ]
      },
      metadata: {
        currentPhase: 'completed',
        businessModel: 'b2b',
        salesResistanceLevel: 'mild'
      }
    };

    const result = PartialMarketingVertriebOutputSchema.safeParse(completeOutput);
    expect(result.success).toBe(true);
  });

  it('should validate partial marketing output', () => {
    const partialOutput: PartialMarketingVertriebOutput = {
      kundenakquise: {
        targetCustomerProfile: 'IT-Berater',
      },
      metadata: {
        currentPhase: 'kundenakquise',
        businessModel: 'b2b',
      }
    };

    const result = PartialMarketingVertriebOutputSchema.safeParse(partialOutput);
    expect(result.success).toBe(true);
  });

  it('should reject invalid enum values', () => {
    const invalidOutput = {
      metadata: {
        currentPhase: 'invalid_phase',
        businessModel: 'invalid_model',
      }
    };

    const result = PartialMarketingVertriebOutputSchema.safeParse(invalidOutput);
    expect(result.success).toBe(false);
  });
});

// ============================================================================
// Type System Integration Tests
// ============================================================================

describe('Marketing & Vertrieb Module - Type System Integration', () => {
  it('should work with MarketingVertriebPhase enum', () => {
    const phases: MarketingVertriebPhase[] = ['intro', 'kundenakquise', 'kanaele', 'preisgestaltung', 'verkaufsprozess', 'sales_resistance', 'completed'];

    phases.forEach(phase => {
      const prompt = buildMarketingVertriebPrompt({ currentPhase: phase });
      expect(prompt).toContain('Modul 4');
      expect(prompt.length).toBeGreaterThan(1000);
    });
  });

  it('should work with BusinessModel enum', () => {
    const models: BusinessModel[] = ['b2b', 'b2c', 'b2b2c', 'marketplace'];

    models.forEach(model => {
      const prompt = buildMarketingVertriebPrompt({
        currentPhase: 'kundenakquise',
        businessModel: model
      });
      expect(prompt).toContain('GESCHÄFTSMODELL');
    });
  });

  it('should work with SalesResistanceLevel enum', () => {
    const levels: SalesResistanceLevel[] = ['none', 'mild', 'moderate', 'strong'];

    levels.forEach(level => {
      const resistance = detectSalesResistance(
        level === 'strong' ? 'Ich bin kein Verkäufer und kann das nicht' :
        level === 'moderate' ? 'Ich bin kein Verkäufer' :
        level === 'mild' ? 'Verkaufen ist schwer' :
        'Ich mag Kundenbeziehungen'
      );
      expect(resistance).toBe(level);
    });
  });
});

// ============================================================================
// CBC Integration Tests
// ============================================================================

describe('Marketing & Vertrieb Module - CBC Integration', () => {
  it('should detect "Ich bin kein Verkäufer" limiting belief', () => {
    const salesResistanceMessage = 'Ich bin kein Verkäufer und kann das nicht';

    const limitingBelief = detectLimitingBelief(salesResistanceMessage);
    expect(limitingBelief).not.toBeNull();
    expect(limitingBelief?.id).toBe('nicht-verkaeufer');
  });

  it('should provide CBC steps for sales resistance', () => {
    const prompt = buildMarketingVertriebPrompt({
      currentPhase: 'sales_resistance',
      salesResistanceLevel: 'strong',
      currentCBCStep: CBCStep.CHALLENGE,
    });

    expect(prompt).toContain('CBC Schritt: CHALLENGE');
    expect(prompt).toContain('authentisches Verkaufen');
    expect(prompt).toContain('DAS IST Verkaufen');
  });

  it('should include all CBC steps when no current step provided', () => {
    const prompt = buildMarketingVertriebPrompt({
      currentPhase: 'sales_resistance',
      salesResistanceLevel: 'strong',
    });

    expect(prompt).toContain('IDENTIFY');
    expect(prompt).toContain('EVIDENCE');
    expect(prompt).toContain('CHALLENGE');
    expect(prompt).toContain('REFRAME');
    expect(prompt).toContain('ACTION');
  });
});

// ============================================================================
// Completion and Validation Tests
// ============================================================================

describe('Marketing & Vertrieb Module - Completion Tracking', () => {
  it('should calculate completion percentage correctly', () => {
    const emptyOutput: PartialMarketingVertriebOutput = {};
    expect(calculateMarketingVertriebCompletion(emptyOutput)).toBe(0);

    const partialOutput: PartialMarketingVertriebOutput = {
      kundenakquise: {
        targetCustomerProfile: 'IT-Berater'
      },
      preisgestaltung: {
        basePrice: 1500,
        strategy: 'value_based'
      }
    };

    const completion = calculateMarketingVertriebCompletion(partialOutput);
    expect(completion).toBeGreaterThan(0);
    expect(completion).toBeLessThan(100);
  });

  it('should detect complete marketing module', () => {
    const completeOutput: PartialMarketingVertriebOutput = {
      kundenakquise: {
        targetCustomerProfile: 'IT-Berater'
      },
      kanaele: {
        selectedChannels: [
          { name: 'LinkedIn', type: 'digital', suitability: 9, cost: 'low', timeToResults: 'medium_term', targetAudience: 'IT', implementation: 'Content', kpis: ['Leads'] },
          { name: 'Webinare', type: 'event', suitability: 8, cost: 'medium', timeToResults: 'short_term', targetAudience: 'IT', implementation: 'Events', kpis: ['Attendees'] },
          { name: 'Empfehlungen', type: 'referral', suitability: 10, cost: 'low', timeToResults: 'long_term', targetAudience: 'IT', implementation: 'Network', kpis: ['Referrals'] }
        ]
      },
      preisgestaltung: {
        basePrice: 1500
      },
      verkaufsprozess: {
        salesSteps: [
          { step: 'Gespräch', description: 'Kennenlernen', duration: '30min', tools: ['Zoom'], successCriteria: 'Vertrauen' }
        ]
      }
    };

    expect(isMarketingVertriebComplete(completeOutput)).toBe(true);
  });

  it('should detect incomplete marketing module', () => {
    const incompleteOutput: PartialMarketingVertriebOutput = {
      kundenakquise: {
        targetCustomerProfile: 'IT-Berater'
      }
      // Missing channels, pricing, and sales process
    };

    expect(isMarketingVertriebComplete(incompleteOutput)).toBe(false);
  });
});

// ============================================================================
// End-to-End Integration Test
// ============================================================================

describe('Marketing & Vertrieb Module - End-to-End Integration', () => {
  it('should handle complete sales resistance scenario', () => {
    // Step 1: Detect sales resistance
    const resistanceMessage = 'Ich bin kein Verkäufer und kann das einfach nicht';
    const resistanceLevel = detectSalesResistance(resistanceMessage);
    expect(resistanceLevel).toBe('strong');

    // Step 2: Detect limiting belief
    const limitingBelief = detectLimitingBelief(resistanceMessage);
    expect(limitingBelief?.id).toBe('nicht-verkaeufer');

    // Step 3: Generate prompt with CBC handling
    const prompt = buildMarketingVertriebPrompt({
      currentPhase: 'sales_resistance',
      salesResistanceLevel: resistanceLevel,
      currentCBCStep: CBCStep.IDENTIFY,
      businessIdea: mockBusinessIdea,
    });

    expect(prompt).toContain('Sales Resistance Level strong detected');
    expect(prompt).toContain('CBC Schritt: IDENTIFY');
    expect(prompt).toContain('Was bedeutet das');

    // Verify CBC response structure
    expect(prompt).toContain(SALES_RESISTANCE_PATTERNS.cbcSteps[CBCStep.IDENTIFY].response);
    expect(prompt).toContain(SALES_RESISTANCE_PATTERNS.cbcSteps[CBCStep.IDENTIFY].followUpQuestion);
  });

  it('should handle customer relationship MI scenario', () => {
    // Step 1: Detect customer relationship change talk
    const changeTalkMessage = 'Ich will meinen Kunden wirklich helfen und Vertrauen aufbauen';
    const changeTalk = detectCustomerRelationshipChangeTalk(changeTalkMessage);
    expect(changeTalk).not.toBeNull();

    // Step 2: Generate MI response
    const miResponse = getMIResponseForCustomerRelationship('DESIRE', changeTalkMessage);
    expect(miResponse).toContain('helfen');
    expect(miResponse).toContain('wichtig');

    // Step 3: Generate prompt with MI integration
    const prompt = buildMarketingVertriebPrompt({
      currentPhase: 'verkaufsprozess',
      businessIdea: mockBusinessIdea,
    });

    expect(prompt).toContain('MI: CUSTOMER RELATIONSHIP FOKUS');
    expect(prompt).toContain('Change Talk für Kundenbeziehungen');
    expect(prompt).toContain('authentisches Verkaufen');
  });
});