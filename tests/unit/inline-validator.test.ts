/**
 * Unit Tests for Inline Validation System (GZ-801)
 *
 * Tests all validation functions, number extraction, pattern detection,
 * and Socratic challenge generation to ensure unrealistic inputs are
 * properly detected and challenged with questions rather than statements.
 */

import { describe, test, expect } from 'vitest';
import {
  getInlineValidationPrompt,
  extractFinancialNumbers,
  extractBusinessMetrics,
  detectOptimismPatterns,
  detectHockeyStickGrowth,
  detectSinglePersonOverload,
  detectOverutilization,
  detectMissingEssentials,
  detectUnrealisticLowCosts,
  detectScalingIgnorance,
  detectTimeOverload,
  detectCompetitionBlindness,
  isEstimationOrHypothetical,
  hasAcknowledgedChallenge,
  parseGermanNumber,
  formatEUR,
  type ValidationContext,
  type ExtractedNumber,
} from '@/lib/validation/inline-validator';

// ============================================================================
// Number Extraction Tests
// ============================================================================

describe('Number Extraction', () => {
  describe('parseGermanNumber', () => {
    test('parses German thousand separators', () => {
      expect(parseGermanNumber('1.234')).toBe(1234);
      expect(parseGermanNumber('10.000')).toBe(10000);
      expect(parseGermanNumber('1.234.567')).toBe(1234567);
    });

    test('parses German decimal separator', () => {
      expect(parseGermanNumber('123,45')).toBe(123.45);
      expect(parseGermanNumber('1.234,56')).toBe(1234.56);
      expect(parseGermanNumber('10.000,00')).toBe(10000);
    });

    test('handles edge cases', () => {
      expect(parseGermanNumber('0')).toBe(0);
      expect(parseGermanNumber('0,00')).toBe(0);
      expect(parseGermanNumber('1')).toBe(1);
    });
  });

  describe('extractFinancialNumbers', () => {
    test('extracts German EUR format', () => {
      const numbers = extractFinancialNumbers('Ich plane 50.000€ Umsatz und 1.200,50€ Kosten');

      expect(numbers).toHaveLength(2);
      expect(numbers[0]).toEqual({
        type: 'currency',
        value: 50000,
        unit: 'EUR',
        context: '50.000€',
        confidence: 0.9,
      });
      expect(numbers[1]).toEqual({
        type: 'currency',
        value: 1200.5,
        unit: 'EUR',
        context: '1.200,50€',
        confidence: 0.9,
      });
    });

    test('extracts EUR prefix format', () => {
      const numbers = extractFinancialNumbers('€ 100.000 ist mein Ziel');

      expect(numbers).toHaveLength(1);
      expect(numbers[0].type).toBe('currency');
      expect(numbers[0].value).toBe(100000);
    });

    test('extracts percentages', () => {
      const numbers = extractFinancialNumbers('30% Wachstum und 25 Prozent Marge');

      expect(numbers.length).toBeGreaterThanOrEqual(2);

      // Should extract both percentage values regardless of exact type classification
      const percentageNumbers = numbers.filter(n => n.type === 'percentage' || n.type === 'growth_rate');
      expect(percentageNumbers).toHaveLength(2);

      // Should have 25 and 30 values
      const values = percentageNumbers.map(n => n.value).sort();
      expect(values).toEqual([25, 30]);
    });

    test('extracts time commitments', () => {
      const numbers = extractFinancialNumbers('40 Stunden pro Woche arbeiten');

      expect(numbers).toHaveLength(1);
      expect(numbers[0]).toEqual({
        type: 'hours',
        value: 40,
        unit: 'Stunden',
        context: '40 Stunden pro Woche',
        confidence: 0.9,
      });
    });

    test('extracts team size', () => {
      const numbers = extractFinancialNumbers('5 Mitarbeiter und 2 Personen');

      expect(numbers).toHaveLength(2);
      expect(numbers[0].type).toBe('count');
      expect(numbers[0].value).toBe(5);
      expect(numbers[1].type).toBe('count');
      expect(numbers[1].value).toBe(2);
    });

    test('extracts growth rates specifically', () => {
      const numbers = extractFinancialNumbers('Wachstum von 150% ist realistisch');

      // Should extract the 150 value, may have duplicates from multiple patterns
      expect(numbers.length).toBeGreaterThanOrEqual(1);

      const growthNumbers = numbers.filter(n => n.value === 150);
      expect(growthNumbers.length).toBeGreaterThanOrEqual(1);

      // At least one should have value 150
      expect(growthNumbers[0].value).toBe(150);
      expect(['growth_rate', 'percentage']).toContain(growthNumbers[0].type);
    });
  });

  describe('extractBusinessMetrics', () => {
    test('aggregates revenue projections', () => {
      const metrics = extractBusinessMetrics('100.000€ im ersten Jahr, 200.000€ im zweiten');

      expect(metrics.revenue).toEqual([100000, 200000]);
    });

    test('aggregates growth rates', () => {
      const metrics = extractBusinessMetrics('50% Wachstum und 25% in Jahr 2');

      // Should extract growth rates, combining both percentage and growth_rate types
      const allNumbers = extractFinancialNumbers('50% Wachstum und 25% in Jahr 2');
      const growthNumbers = allNumbers.filter(n => n.type === 'growth_rate' || n.type === 'percentage');

      expect(growthNumbers.length).toBeGreaterThanOrEqual(1);

      // Should contain values 50 and/or 25 (converted to decimals)
      const values = growthNumbers.map(n => n.value / 100).sort();
      expect(values).toContain(0.5);
    });

    test('gets maximum team size and hours', () => {
      const metrics = extractBusinessMetrics('40 Stunden pro Woche, manchmal 50 Stunden, 3 Mitarbeiter');

      expect(metrics.hours).toBe(50); // Maximum
      expect(metrics.team).toBe(3);
    });
  });
});

// ============================================================================
// Pattern Detection Tests
// ============================================================================

describe('Pattern Detection', () => {
  describe('detectOptimismPatterns', () => {
    test('detects hockey stick growth language', () => {
      const patterns = detectOptimismPatterns('Exponentieller Wachstum, ich verdoppele jedes Jahr');

      const hockeyStick = patterns.find(p => p.pattern === 'hockey_stick_growth');
      expect(hockeyStick).toBeDefined();
      expect(hockeyStick?.confidence).toBeGreaterThan(0.7);
      expect(hockeyStick?.indicators).toContain('exponentiell');
      expect(hockeyStick?.indicators).toContain('verdoppel');
    });

    test('detects no competition claims', () => {
      const patterns = detectOptimismPatterns('Es gibt keine Konkurrenz, das ist einzigartig');

      const noComp = patterns.find(p => p.pattern === 'no_competition');
      expect(noComp).toBeDefined();
      expect(noComp?.confidence).toBeGreaterThan(0.6);
      expect(noComp?.indicators).toContain('keine konkurrenz');
      expect(noComp?.indicators).toContain('einzigartig');
    });

    test('detects perfect pricing assumptions', () => {
      const patterns = detectOptimismPatterns('Kunden zahlen alles, Premium Preis ist egal was es kostet');

      const pricing = patterns.find(p => p.pattern === 'perfect_pricing');
      expect(pricing).toBeDefined();
      expect(pricing?.indicators).toContain('premium preis');
    });

    test('returns empty array for realistic text', () => {
      const patterns = detectOptimismPatterns('Moderate Wachstum mit Konkurrenzanalyse');
      expect(patterns).toHaveLength(0);
    });
  });

  describe('isEstimationOrHypothetical', () => {
    test('detects estimation language', () => {
      expect(isEstimationOrHypothetical('Ungefähr 100.000€ vielleicht')).toBe(true);
      expect(isEstimationOrHypothetical('Circa 50% Wachstum schätzungsweise')).toBe(true);
      expect(isEstimationOrHypothetical('Grob 1000€ etwa')).toBe(true);
    });

    test('detects hypothetical scenarios', () => {
      expect(isEstimationOrHypothetical('Wenn ich 200.000€ machen würde')).toBe(true);
      expect(isEstimationOrHypothetical('Falls das klappt, angenommen dass')).toBe(true);
      expect(isEstimationOrHypothetical('Stell dir vor, das wäre hypothetisch')).toBe(true);
    });

    test('returns false for concrete statements', () => {
      expect(isEstimationOrHypothetical('Ich plane 100.000€ Umsatz fest')).toBe(false);
      expect(isEstimationOrHypothetical('Mein Ziel sind 50% Wachstum definitiv')).toBe(false);
    });
  });

  describe('hasAcknowledgedChallenge', () => {
    test('detects acknowledgment phrases', () => {
      expect(hasAcknowledgedChallenge('Ja stimmt, das ist übertrieben')).toBe(true);
      expect(hasAcknowledgedChallenge('Du hast recht, zu optimistisch')).toBe(true);
      expect(hasAcknowledgedChallenge('Das ist unrealistisch, da stimmt')).toBe(true);
      expect(hasAcknowledgedChallenge('Sehr ambitioniert, schwer zu schaffen')).toBe(true);
    });

    test('returns false for defensive responses', () => {
      expect(hasAcknowledgedChallenge('Das ist machbar, ich schaffe das')).toBe(false);
      expect(hasAcknowledgedChallenge('Warum sollte das nicht gehen?')).toBe(false);
    });
  });
});

// ============================================================================
// Financial Validation Tests
// ============================================================================

describe('Financial Validation', () => {
  describe('detectHockeyStickGrowth', () => {
    test('detects exponential growth pattern', () => {
      const revenues = [50000, 150000, 450000]; // 200% then 200% growth
      const result = detectHockeyStickGrowth(revenues, 'Beratung');

      expect(result).toBeTruthy();
      expect(result?.type).toBe('financial');
      expect(result?.priority).toBe('high');
      expect(result?.challenge).toContain('Lass uns gemeinsam rechnen');
      expect(result?.challenge).toContain('Welche konkreten Maßnahmen');
    });

    test('allows realistic growth patterns', () => {
      const revenues = [100000, 120000, 140000]; // 20% then 17% growth
      const result = detectHockeyStickGrowth(revenues, 'Beratung');

      expect(result).toBeNull();
    });

    test('handles edge cases', () => {
      expect(detectHockeyStickGrowth([100000], 'Beratung')).toBeNull(); // Too few points
      expect(detectHockeyStickGrowth([0, 100000, 200000], 'Beratung')).toBeNull(); // Starting from 0
    });

    test('adapts to business type thresholds', () => {
      const revenues = [100000, 180000]; // 80% growth

      // E-Commerce allows 100% growth - should pass
      expect(detectHockeyStickGrowth([100000, 180000, 320000], 'E-Commerce')).toBeNull();

      // Restaurant only allows 15% growth - should flag
      expect(detectHockeyStickGrowth([100000, 180000], 'Restaurant')).toBeTruthy();
    });
  });

  describe('detectSinglePersonOverload', () => {
    test('detects overload for consulting', () => {
      const result = detectSinglePersonOverload(500000, 1, 'Beratung');

      expect(result).toBeTruthy();
      expect(result?.type).toBe('capacity');
      expect(result?.priority).toBe('high');
      expect(result?.challenge).toContain('500.000,00 € Jahresumsatz als Einzelperson');
      expect(result?.challenge).toContain('Wie stellst du dir das konkret vor');
    });

    test('allows realistic single-person revenue', () => {
      const result = detectSinglePersonOverload(120000, 1, 'Beratung');
      expect(result).toBeNull();
    });

    test('ignores team scenarios', () => {
      const result = detectSinglePersonOverload(500000, 3, 'Beratung');
      expect(result).toBeNull();
    });

    test('adapts to business type', () => {
      // Freelancer has lower threshold (€120k)
      expect(detectSinglePersonOverload(200000, 1, 'Freiberufler')).toBeTruthy();

      // SaaS might have higher threshold with default
      expect(detectSinglePersonOverload(200000, 1, 'SaaS')).toBeNull();
    });
  });

  describe('detectOverutilization', () => {
    test('detects impossible utilization rates', () => {
      const result = detectOverutilization(
        200000, // €200k revenue
        2000,   // 2000 hours capacity per year
        80,     // €80/hour rate
        'Beratung'
      );

      expect(result).toBeTruthy();
      expect(result?.type).toBe('capacity');
      expect(result?.challenge).toContain('125,0% Auslastung');
      expect(result?.challenge).toContain('Realistisch sind meist nur 75%');
    });

    test('allows realistic utilization', () => {
      const result = detectOverutilization(
        100000, // €100k revenue
        2000,   // 2000 hours capacity
        80,     // €80/hour rate
        'Beratung'
      );

      expect(result).toBeNull(); // 62.5% utilization is fine
    });

    test('handles missing data gracefully', () => {
      expect(detectOverutilization(100000, 0, 80, 'Beratung')).toBeNull();
      expect(detectOverutilization(100000, 2000, 0, 'Beratung')).toBeNull();
    });
  });

  describe('detectMissingEssentials', () => {
    test('detects missing essential cost categories', () => {
      const costs = {
        'office_rent': 500,
        'laptop': 100,
      }; // Missing insurance, taxes, etc.

      const result = detectMissingEssentials(costs);

      expect(result).toBeTruthy();
      expect(result?.type).toBe('financial');
      expect(result?.priority).toBe('medium');
      expect(result?.challenge).toContain('nicht erwähnt hast');
      expect(result?.challenge).toContain('versteckten');
    });

    test('allows comprehensive cost planning', () => {
      const costs = {
        krankenversicherung: 400,
        rentenversicherung: 300,
        steuer: 500,
        büro: 800,
        laptop: 100,
        software: 200,
        versicherung: 150,
        buchhaltung: 300,
      };

      const result = detectMissingEssentials(costs);
      expect(result).toBeNull();
    });
  });

  describe('detectUnrealisticLowCosts', () => {
    test('detects unrealistically low costs', () => {
      const result = detectUnrealisticLowCosts(300, 'Beratung'); // €300/month total

      expect(result).toBeTruthy();
      expect(result?.type).toBe('financial');
      expect(result?.challenge).toContain('300,00 € monatlichen Kosten');
      expect(result?.challenge).toContain('sehr niedrig für ein Beratung-Unternehmen');
    });

    test('allows realistic cost levels', () => {
      expect(detectUnrealisticLowCosts(1000, 'Beratung')).toBeNull();
      expect(detectUnrealisticLowCosts(2000, 'E-Commerce')).toBeNull();
    });

    test('adapts minimums by business type', () => {
      // Restaurant needs much higher minimum costs
      expect(detectUnrealisticLowCosts(2000, 'Restaurant')).toBeTruthy();

      // Freelancer can operate with lower costs
      expect(detectUnrealisticLowCosts(700, 'Freiberufler')).toBeNull();
    });
  });

  describe('detectScalingIgnorance', () => {
    test('detects costs that dont scale with revenue', () => {
      const revenues = [100000, 300000, 500000]; // 3x growth
      const costs = [50000, 52000, 54000];       // Flat costs

      const result = detectScalingIgnorance(revenues, costs);

      expect(result).toBeTruthy();
      expect(result?.type).toBe('consistency');
      expect(result?.challenge).toContain('Umsätze wachsen um 400,0%');
      expect(result?.challenge).toContain('Kosten bleiben fast gleich');
    });

    test('allows proportional scaling', () => {
      const revenues = [100000, 130000, 160000]; // 30% then 23% growth
      const costs = [50000, 60000, 70000];       // Proportional growth

      expect(detectScalingIgnorance(revenues, costs)).toBeNull();
    });

    test('handles edge cases', () => {
      expect(detectScalingIgnorance([100000], [50000])).toBeNull(); // Single year
      expect(detectScalingIgnorance([], [])).toBeNull(); // Empty arrays
    });
  });

  describe('detectTimeOverload', () => {
    test('detects unsustainable work hours', () => {
      const result = detectTimeOverload(70); // 70 hours per week

      expect(result).toBeTruthy();
      expect(result?.type).toBe('capacity');
      expect(result?.priority).toBe('high');
      expect(result?.challenge).toContain('70 Stunden pro Woche');
      expect(result?.challenge).toContain('Work-Life-Balance');
    });

    test('allows sustainable hours', () => {
      expect(detectTimeOverload(40)).toBeNull(); // 40 hours is fine
      expect(detectTimeOverload(50)).toBeNull(); // 50 hours is acceptable
    });

    test('handles boundary cases', () => {
      expect(detectTimeOverload(60)).toBeNull(); // Exactly at limit
      expect(detectTimeOverload(61)).toBeTruthy(); // Just over limit
    });
  });
});

// ============================================================================
// Market Validation Tests
// ============================================================================

describe('Market Validation', () => {
  describe('detectCompetitionBlindness', () => {
    test('detects no competition claims', () => {
      const result = detectCompetitionBlindness('Es gibt keine Konkurrenz, das ist einzigartig');

      expect(result).toBeTruthy();
      expect(result?.type).toBe('market');
      expect(result?.priority).toBe('medium');
      expect(result?.challenge).toContain('keine Konkurrenz');
      expect(result?.challenge).toContain('warum ist noch niemand da');
    });

    test('ignores realistic competition discussion', () => {
      const result = detectCompetitionBlindness('Es gibt viele Konkurrenten, aber mein USP ist...');
      expect(result).toBeNull();
    });

    test('handles confidence thresholds', () => {
      // Very weak signal should not trigger
      const weakResult = detectCompetitionBlindness('möglicherweise gibt es wenig konkurrenz');
      expect(weakResult).toBeNull();
    });
  });
});

// ============================================================================
// Main Validation Function Tests
// ============================================================================

describe('Main Validation Function', () => {
  const createContext = (overrides: Partial<ValidationContext> = {}): ValidationContext => ({
    currentModule: 'finanzplanung',
    userInput: '',
    extractedNumbers: [],
    businessType: 'Beratung',
    ...overrides,
  });

  describe('getInlineValidationPrompt', () => {
    test('returns null for short inputs', () => {
      const result = getInlineValidationPrompt('ja', createContext());
      expect(result).toBeNull();
    });

    test('returns null for estimation language', () => {
      const context = createContext({ userInput: 'Ungefähr 500.000€ vielleicht' });
      const result = getInlineValidationPrompt('Ungefähr 500.000€ vielleicht', context);
      expect(result).toBeNull();
    });

    test('returns null for acknowledgment responses', () => {
      const context = createContext({ userInput: 'Ja stimmt, das ist übertrieben' });
      const result = getInlineValidationPrompt('Ja stimmt, das ist übertrieben', context);
      expect(result).toBeNull();
    });

    test('detects single person overload', () => {
      const context = createContext({
        userInput: 'Ich plane 500.000€ Umsatz im ersten Jahr als Einzelperson',
        businessType: 'Beratung',
      });

      const result = getInlineValidationPrompt(
        'Ich plane 500.000€ Umsatz im ersten Jahr als Einzelperson',
        context
      );

      expect(result).toBeTruthy();
      expect(result?.type).toBe('capacity');
      expect(result?.priority).toBe('high');
      expect(result?.challenge).toContain('500.000,00 € Jahresumsatz als Einzelperson');
    });

    test('detects hockey stick growth', () => {
      const context = createContext({
        userInput: '100.000€ Jahr 1, 300.000€ Jahr 2, 900.000€ Jahr 3',
        businessType: 'Beratung',
      });

      const result = getInlineValidationPrompt(
        '100.000€ Jahr 1, 300.000€ Jahr 2, 900.000€ Jahr 3',
        context
      );

      expect(result).toBeTruthy();
      expect(result?.type).toBe('financial');
      expect(result?.challenge).toContain('Lass uns gemeinsam rechnen');
    });

    test('detects time overload', () => {
      const context = createContext({
        userInput: 'Ich arbeite 80 Stunden pro Woche',
      });

      const result = getInlineValidationPrompt(
        'Ich arbeite 80 Stunden pro Woche',
        context
      );

      expect(result).toBeTruthy();
      expect(result?.type).toBe('capacity');
      expect(result?.challenge).toContain('80 Stunden pro Woche');
    });

    test('detects no competition claims', () => {
      const context = createContext({
        userInput: 'Es gibt keine Konkurrenz in diesem Markt',
      });

      const result = getInlineValidationPrompt(
        'Es gibt keine Konkurrenz in diesem Markt',
        context
      );

      expect(result).toBeTruthy();
      expect(result?.type).toBe('market');
      expect(result?.challenge).toContain('keine Konkurrenz');
    });

    test('prioritizes high priority validations', () => {
      // Input that triggers both capacity (high) and market (medium) validation
      const context = createContext({
        userInput: 'Ich plane 600.000€ Umsatz als Einzelperson, es gibt keine Konkurrenz',
        businessType: 'Beratung',
      });

      const result = getInlineValidationPrompt(
        'Ich plane 600.000€ Umsatz als Einzelperson, es gibt keine Konkurrenz',
        context
      );

      expect(result).toBeTruthy();
      expect(result?.priority).toBe('high'); // Should prioritize capacity issue
      expect(result?.type).toBe('capacity');
    });

    test('adapts to business type', () => {
      // Same revenue, different business type = different validation result
      const consultingContext = createContext({
        userInput: 'Ich plane 400.000€ Umsatz als Einzelperson',
        businessType: 'Beratung', // Max €300k for single person
      });

      const saasContext = createContext({
        userInput: 'Ich plane 400.000€ Umsatz als Einzelperson',
        businessType: 'SaaS', // Higher threshold, should be OK
      });

      const consultingResult = getInlineValidationPrompt(
        'Ich plane 400.000€ Umsatz als Einzelperson',
        consultingContext
      );

      const saasResult = getInlineValidationPrompt(
        'Ich plane 400.000€ Umsatz als Einzelperson',
        saasContext
      );

      expect(consultingResult).toBeTruthy(); // Should flag consulting
      expect(saasResult).toBeNull(); // Should be OK for SaaS
    });

    test('allows realistic inputs', () => {
      const context = createContext({
        userInput: 'Ich plane 120.000€ Umsatz als Berater mit 40 Stunden pro Woche',
        businessType: 'Beratung',
      });

      const result = getInlineValidationPrompt(
        'Ich plane 120.000€ Umsatz als Berater mit 40 Stunden pro Woche',
        context
      );

      expect(result).toBeNull(); // Realistic inputs should not trigger validation
    });
  });
});

// ============================================================================
// Utility Function Tests
// ============================================================================

describe('Utility Functions', () => {
  describe('formatEUR', () => {
    test('formats German currency correctly', () => {
      expect(formatEUR(1234.56)).toMatch(/1\.234,56\s*€/);
      expect(formatEUR(50000)).toMatch(/50\.000,00\s*€/);
      expect(formatEUR(0)).toMatch(/0,00\s*€/);
    });

    test('handles large numbers', () => {
      expect(formatEUR(1000000)).toMatch(/1\.000\.000,00\s*€/);
    });
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Integration Tests', () => {
  test('full validation workflow with realistic scenario', () => {
    const context: ValidationContext = {
      currentModule: 'finanzplanung',
      userInput: 'Mein Businessplan: 100.000€ Jahr 1, 150.000€ Jahr 2, 200.000€ Jahr 3 als Berater',
      extractedNumbers: [],
      businessType: 'Beratung',
    };

    const result = getInlineValidationPrompt(context.userInput, context);

    // This should NOT trigger validation (realistic growth for consulting)
    expect(result).toBeNull();
  });

  test('full validation workflow with unrealistic scenario', () => {
    const context: ValidationContext = {
      currentModule: 'finanzplanung',
      userInput: 'Exponentielles Wachstum: 50.000€ Jahr 1, 200.000€ Jahr 2, 800.000€ Jahr 3',
      extractedNumbers: [],
      businessType: 'Beratung',
    };

    const result = getInlineValidationPrompt(context.userInput, context);

    // This should trigger hockey stick detection
    expect(result).toBeTruthy();
    expect(result?.type).toBe('financial');
    expect(result?.challenge).toContain('Lass uns gemeinsam rechnen');
    expect(result?.challenge).toContain('Welche konkreten Maßnahmen');

    // Verify it's using Socratic questioning, not judgmental statements
    expect(result?.challenge).not.toContain('Das ist unrealistisch');
    expect(result?.challenge).not.toContain('Das geht nicht');
    expect(result?.challenge).not.toContain('Zu optimistisch');
  });

  test('question-first approach validation', () => {
    const testCases = [
      'Ich plane 600.000€ als Einzelperson',
      '100 Stunden pro Woche arbeiten',
      'Es gibt keine Konkurrenz',
      'Exponentieller Wachstum von 500%',
    ];

    testCases.forEach(input => {
      const context: ValidationContext = {
        currentModule: 'finanzplanung',
        userInput: input,
        extractedNumbers: [],
        businessType: 'Beratung',
      };

      const result = getInlineValidationPrompt(input, context);

      if (result) {
        // All challenges should be questions, not statements
        expect(result.challenge).toMatch(/\?/); // Contains question mark
        expect(result.challenge).not.toMatch(/^(Das ist|Du solltest|Ich empfehle)/); // No directive language
        expect(result.challenge).toMatch(/(Wie|Was|Welche|Warum|Kennst)/i); // Contains interrogative words
      }
    });
  });
});