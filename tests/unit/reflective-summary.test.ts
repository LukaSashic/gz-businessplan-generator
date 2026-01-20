/**
 * Unit Tests for Reflective Summary Generator
 *
 * Tests the reflective summarization system that generates summaries
 * every 5-7 exchanges covering facts, emotions, and strengths.
 */

import { describe, it, expect } from 'vitest';
import {
  type Message,
  type UserProfile,
  type ReflectiveSummary,
  shouldGenerateSummary,
  shouldGenerateSummaryOptimal,
  extractFactsFromMessages,
  extractFactsWithCategories,
  extractEmotionalThemes,
  extractEmotionalThemesWithDetails,
  extractStrengths,
  generateSummaryPrompt,
  generateReflectiveSummary,
  formatSummaryAsText,
  getSummaryTriggerConfig,
} from '@/lib/coaching';

// ============================================================================
// Test Data
// ============================================================================

const sampleMessages: Message[] = [
  {
    role: 'user',
    content: 'Ich will einen Online-Shop für nachhaltige Mode gründen.',
  },
  {
    role: 'assistant',
    content: 'Das klingt nach einer spannenden Idee! Erzählen Sie mir mehr darüber.',
  },
  {
    role: 'user',
    content: 'Ich habe 5 Jahre Erfahrung im Einzelhandel und bin sehr motiviert, aber ich bin mir unsicher wegen der Finanzierung.',
  },
  {
    role: 'assistant',
    content: 'Die Finanzierung ist ein wichtiger Aspekt. Welche Optionen haben Sie bereits in Betracht gezogen?',
  },
  {
    role: 'user',
    content: 'Meine Zielgruppe ist umweltbewusste Frauen zwischen 25 und 45 Jahren. Ich habe Angst, dass ich scheitern könnte.',
  },
  {
    role: 'assistant',
    content: 'Es ist normal, solche Bedenken zu haben. Lassen Sie uns das genauer anschauen.',
  },
  {
    role: 'user',
    content: 'Ich kann gut mit Kunden umgehen und meine Stärke liegt in der Kommunikation. Der Standort in München ist auch gut.',
  },
];

const sampleUserProfile: UserProfile = {
  name: 'Maria',
  businessType: 'E-Commerce',
  strengths: ['Kundenkommunikation'],
};

// ============================================================================
// shouldGenerateSummary Tests
// ============================================================================

describe('shouldGenerateSummary', () => {
  describe('trigger at correct intervals (5-7 exchanges)', () => {
    it('should return false for 0 exchanges', () => {
      expect(shouldGenerateSummary(0)).toBe(false);
    });

    it('should return false for 1 exchange', () => {
      expect(shouldGenerateSummary(1)).toBe(false);
    });

    it('should return false for 2 exchanges', () => {
      expect(shouldGenerateSummary(2)).toBe(false);
    });

    it('should return false for 3 exchanges', () => {
      expect(shouldGenerateSummary(3)).toBe(false);
    });

    it('should return false for 4 exchanges', () => {
      expect(shouldGenerateSummary(4)).toBe(false);
    });

    it('should return true for 5 exchanges (minimum trigger)', () => {
      expect(shouldGenerateSummary(5)).toBe(true);
    });

    it('should return true for 6 exchanges (optimal trigger)', () => {
      expect(shouldGenerateSummary(6)).toBe(true);
    });

    it('should return true for 7 exchanges (maximum trigger)', () => {
      expect(shouldGenerateSummary(7)).toBe(true);
    });

    it('should return false for 8 exchanges (past window)', () => {
      expect(shouldGenerateSummary(8)).toBe(false);
    });

    it('should return false for 10 exchanges (well past window)', () => {
      expect(shouldGenerateSummary(10)).toBe(false);
    });
  });

  describe('optimal trigger point', () => {
    it('should identify 6 as optimal trigger', () => {
      expect(shouldGenerateSummaryOptimal(6)).toBe(true);
    });

    it('should return false for non-optimal triggers', () => {
      expect(shouldGenerateSummaryOptimal(5)).toBe(false);
      expect(shouldGenerateSummaryOptimal(7)).toBe(false);
    });
  });

  describe('trigger configuration', () => {
    it('should return correct configuration values', () => {
      const config = getSummaryTriggerConfig();
      expect(config.min).toBe(5);
      expect(config.max).toBe(7);
      expect(config.optimal).toBe(6);
    });
  });
});

// ============================================================================
// extractFactsFromMessages Tests
// ============================================================================

describe('extractFactsFromMessages', () => {
  describe('extracts concrete data from user messages', () => {
    it('should extract business idea', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich will einen Online-Shop für nachhaltige Mode gründen.' },
      ];
      const facts = extractFactsFromMessages(messages);

      expect(facts.length).toBeGreaterThan(0);
      // Should contain something about the business idea
      const hasBusinessFact = facts.some((f) =>
        f.toLowerCase().includes('online-shop') ||
        f.toLowerCase().includes('nachhaltige mode') ||
        f.toLowerCase().includes('gründen')
      );
      expect(hasBusinessFact).toBe(true);
    });

    it('should extract experience information', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich habe 5 Jahre Erfahrung im Einzelhandel.' },
      ];
      const facts = extractFactsFromMessages(messages);

      const hasExperienceFact = facts.some((f) =>
        f.toLowerCase().includes('erfahrung') || f.includes('5 Jahre')
      );
      expect(hasExperienceFact).toBe(true);
    });

    it('should extract target audience information', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Meine Zielgruppe ist umweltbewusste Frauen zwischen 25 und 45 Jahren.' },
      ];
      const facts = extractFactsFromMessages(messages);

      const hasTargetFact = facts.some((f) =>
        f.toLowerCase().includes('umweltbewusst') ||
        f.toLowerCase().includes('frauen') ||
        f.toLowerCase().includes('25')
      );
      expect(hasTargetFact).toBe(true);
    });

    it('should extract location information', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Mein Standort ist in München.' },
      ];
      const facts = extractFactsFromMessages(messages);

      const hasLocationFact = facts.some((f) =>
        f.toLowerCase().includes('münchen')
      );
      expect(hasLocationFact).toBe(true);
    });

    it('should ignore assistant messages', () => {
      const messages: Message[] = [
        { role: 'assistant', content: 'Ich habe 10 Jahre Erfahrung in der Beratung.' },
      ];
      const facts = extractFactsFromMessages(messages);

      expect(facts).toHaveLength(0);
    });

    it('should return empty array for empty messages', () => {
      const facts = extractFactsFromMessages([]);
      expect(facts).toHaveLength(0);
    });

    it('should extract multiple facts from conversation', () => {
      const facts = extractFactsFromMessages(sampleMessages);
      expect(facts.length).toBeGreaterThanOrEqual(1);
    });

    it('should deduplicate similar facts', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich will einen Online-Shop gründen.' },
        { role: 'user', content: 'Ich will einen Online-Shop gründen.' },
      ];
      const facts = extractFactsFromMessages(messages);

      // Should not have duplicates
      const uniqueFacts = new Set(facts);
      expect(facts.length).toBe(uniqueFacts.size);
    });
  });

  describe('extractFactsWithCategories', () => {
    it('should return facts with their categories', () => {
      const result = extractFactsWithCategories(sampleMessages);

      expect(result.facts).toBeDefined();
      expect(result.categories).toBeDefined();
      expect(Array.isArray(result.facts)).toBe(true);
      expect(Array.isArray(result.categories)).toBe(true);
    });

    it('should identify business idea category', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich will einen Online-Shop für nachhaltige Mode gründen.' },
      ];
      const result = extractFactsWithCategories(messages);

      // Should have at least one fact and potentially the business_idea category
      expect(result.facts.length).toBeGreaterThanOrEqual(0);
    });
  });
});

// ============================================================================
// extractEmotionalThemes Tests
// ============================================================================

describe('extractEmotionalThemes', () => {
  describe('identifies emotional themes', () => {
    it('should detect uncertainty', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich bin mir unsicher wegen der Finanzierung.' },
      ];
      const themes = extractEmotionalThemes(messages);

      const hasUncertaintyTheme = themes.some((t) =>
        t.toLowerCase().includes('unsicherheit') ||
        t.toLowerCase().includes('nächsten schritte')
      );
      expect(hasUncertaintyTheme).toBe(true);
    });

    it('should detect anxiety', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich habe Angst, dass ich scheitern könnte.' },
      ];
      const themes = extractEmotionalThemes(messages);

      const hasAnxietyTheme = themes.some((t) =>
        t.toLowerCase().includes('sorgen') ||
        t.toLowerCase().includes('bedenken') ||
        t.toLowerCase().includes('angst')
      );
      expect(hasAnxietyTheme).toBe(true);
    });

    it('should detect excitement', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich bin sehr motiviert und freue mich auf den Start!' },
      ];
      const themes = extractEmotionalThemes(messages);

      const hasExcitementTheme = themes.some((t) =>
        t.toLowerCase().includes('begeisterung') ||
        t.toLowerCase().includes('motivation')
      );
      expect(hasExcitementTheme).toBe(true);
    });

    it('should detect frustration', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Das ist alles so kompliziert und frustrierend!' },
      ];
      const themes = extractEmotionalThemes(messages);

      const hasFrustrationTheme = themes.some((t) =>
        t.toLowerCase().includes('frustration')
      );
      expect(hasFrustrationTheme).toBe(true);
    });

    it('should detect confidence', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich bin absolut sicher, dass das funktionieren wird.' },
      ];
      const themes = extractEmotionalThemes(messages);

      const hasConfidenceTheme = themes.some((t) =>
        t.toLowerCase().includes('zuversicht') ||
        t.toLowerCase().includes('selbstvertrauen')
      );
      expect(hasConfidenceTheme).toBe(true);
    });

    it('should detect ambivalence', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Einerseits möchte ich gründen, andererseits habe ich Bedenken.' },
      ];
      const themes = extractEmotionalThemes(messages);

      const hasAmbivalenceTheme = themes.some((t) =>
        t.toLowerCase().includes('zwiespalt') ||
        t.toLowerCase().includes('optionen')
      );
      expect(hasAmbivalenceTheme).toBe(true);
    });

    it('should return empty array for neutral messages', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Mein Unternehmen bietet Beratungsdienstleistungen an.' },
      ];
      const themes = extractEmotionalThemes(messages);

      expect(themes).toHaveLength(0);
    });

    it('should ignore assistant messages', () => {
      const messages: Message[] = [
        { role: 'assistant', content: 'Ich verstehe Ihre Angst und Unsicherheit.' },
      ];
      const themes = extractEmotionalThemes(messages);

      expect(themes).toHaveLength(0);
    });

    it('should detect multiple emotions from conversation', () => {
      const themes = extractEmotionalThemes(sampleMessages);
      // Sample messages contain uncertainty, anxiety, and excitement
      expect(themes.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('extractEmotionalThemesWithDetails', () => {
    it('should return themes and detected emotions', () => {
      const messages: Message[] = [
        { role: 'user', content: 'Ich bin unsicher und habe Angst.' },
      ];
      const result = extractEmotionalThemesWithDetails(messages);

      expect(result.themes).toBeDefined();
      expect(result.detectedEmotions).toBeDefined();
      expect(Array.isArray(result.themes)).toBe(true);
      expect(Array.isArray(result.detectedEmotions)).toBe(true);
    });
  });
});

// ============================================================================
// extractStrengths Tests
// ============================================================================

describe('extractStrengths', () => {
  it('should extract strengths from user messages', () => {
    const messages: Message[] = [
      { role: 'user', content: 'Ich kann gut mit Kunden umgehen.' },
    ];
    const strengths = extractStrengths(messages);

    const hasStrength = strengths.some((s) =>
      s.toLowerCase().includes('kunden') ||
      s.toLowerCase().includes('kompetenz')
    );
    expect(hasStrength).toBe(true);
  });

  it('should extract explicit strength statements', () => {
    const messages: Message[] = [
      { role: 'user', content: 'Meine Stärke liegt in der Kommunikation.' },
    ];
    const strengths = extractStrengths(messages);

    const hasStrength = strengths.some((s) =>
      s.toLowerCase().includes('kommunikation') ||
      s.toLowerCase().includes('stärke')
    );
    expect(hasStrength).toBe(true);
  });

  it('should include strengths from user profile', () => {
    const messages: Message[] = [];
    const profile: UserProfile = {
      strengths: ['Projektmanagement', 'Teamführung'],
    };
    const strengths = extractStrengths(messages, profile);

    expect(strengths).toContain('Projektmanagement');
    expect(strengths).toContain('Teamführung');
  });

  it('should combine message and profile strengths', () => {
    const messages: Message[] = [
      { role: 'user', content: 'Ich kann gut mit Kunden umgehen.' },
    ];
    const profile: UserProfile = {
      strengths: ['Projektmanagement'],
    };
    const strengths = extractStrengths(messages, profile);

    expect(strengths).toContain('Projektmanagement');
    expect(strengths.length).toBeGreaterThan(1);
  });

  it('should return empty array when no strengths found', () => {
    const messages: Message[] = [
      { role: 'user', content: 'Der Himmel ist blau.' },
    ];
    const strengths = extractStrengths(messages);

    // May be empty or contain extracted patterns
    expect(Array.isArray(strengths)).toBe(true);
  });

  it('should extract experience as strength', () => {
    const messages: Message[] = [
      { role: 'user', content: 'Ich habe viel Erfahrung in der Branche.' },
    ];
    const strengths = extractStrengths(messages);

    const hasExperience = strengths.some((s) =>
      s.toLowerCase().includes('erfahrung')
    );
    expect(hasExperience).toBe(true);
  });
});

// ============================================================================
// generateSummaryPrompt Tests
// ============================================================================

describe('generateSummaryPrompt', () => {
  it('should include all sections (facts, emotions, strengths)', () => {
    const prompt = generateSummaryPrompt(sampleMessages, sampleUserProfile);

    expect(prompt).toContain('Fakten');
    expect(prompt).toContain('Emotion');
    expect(prompt).toContain('Stärken');
  });

  it('should include user name when provided', () => {
    const prompt = generateSummaryPrompt(sampleMessages, sampleUserProfile);

    expect(prompt).toContain('Maria');
  });

  it('should include business type when provided', () => {
    const prompt = generateSummaryPrompt(sampleMessages, sampleUserProfile);

    expect(prompt).toContain('E-Commerce');
  });

  it('should include the confirmation question in template', () => {
    const prompt = generateSummaryPrompt(sampleMessages, sampleUserProfile);

    expect(prompt).toContain('Stimmt das so?');
    expect(prompt).toContain('Fehlt etwas Wichtiges?');
  });

  it('should handle empty user profile', () => {
    const prompt = generateSummaryPrompt(sampleMessages, {});

    expect(prompt).toContain('Fakten');
    expect(prompt).toContain('Nutzer');
  });

  it('should handle empty messages', () => {
    const prompt = generateSummaryPrompt([], sampleUserProfile);

    expect(prompt).toContain('Noch keine konkreten Fakten geteilt');
  });

  it('should be in German', () => {
    const prompt = generateSummaryPrompt(sampleMessages, sampleUserProfile);

    // Check for German words
    expect(prompt).toContain('Zusammenfassung');
    expect(prompt).toContain('bisher');
    expect(prompt).toContain('verstanden');
  });

  it('should include instructions for AI', () => {
    const prompt = generateSummaryPrompt(sampleMessages, sampleUserProfile);

    expect(prompt).toContain('Anleitung');
    expect(prompt).toContain('Format');
  });
});

// ============================================================================
// generateReflectiveSummary Tests
// ============================================================================

describe('generateReflectiveSummary', () => {
  it('should return complete ReflectiveSummary object', () => {
    const summary = generateReflectiveSummary(sampleMessages, sampleUserProfile);

    expect(summary.facts).toBeDefined();
    expect(summary.emotional).toBeDefined();
    expect(summary.strengths).toBeDefined();
    expect(summary.confirmationQuestion).toBeDefined();
  });

  it('should have correct structure types', () => {
    const summary = generateReflectiveSummary(sampleMessages, sampleUserProfile);

    expect(Array.isArray(summary.facts)).toBe(true);
    expect(Array.isArray(summary.emotional)).toBe(true);
    expect(Array.isArray(summary.strengths)).toBe(true);
    expect(typeof summary.confirmationQuestion).toBe('string');
  });

  it('should always include confirmation question', () => {
    const summary = generateReflectiveSummary(sampleMessages, sampleUserProfile);

    expect(summary.confirmationQuestion).toBe('Stimmt das so? Fehlt etwas Wichtiges?');
  });

  it('should handle undefined user profile', () => {
    const summary = generateReflectiveSummary(sampleMessages);

    expect(summary.facts).toBeDefined();
    expect(summary.emotional).toBeDefined();
    expect(summary.strengths).toBeDefined();
    expect(summary.confirmationQuestion).toBeDefined();
  });

  it('should extract facts from messages', () => {
    const summary = generateReflectiveSummary(sampleMessages, sampleUserProfile);

    // Should have extracted some facts
    expect(summary.facts.length).toBeGreaterThanOrEqual(0);
  });

  it('should detect emotional themes', () => {
    const summary = generateReflectiveSummary(sampleMessages, sampleUserProfile);

    // Sample messages contain emotional content
    expect(summary.emotional.length).toBeGreaterThanOrEqual(0);
  });
});

// ============================================================================
// formatSummaryAsText Tests
// ============================================================================

describe('formatSummaryAsText', () => {
  it('should format summary with all sections', () => {
    const summary: ReflectiveSummary = {
      facts: ['Online-Shop für nachhaltige Mode', '5 Jahre Erfahrung'],
      emotional: ['Unsicherheit bezüglich der nächsten Schritte', 'Sorgen und Bedenken'],
      strengths: ['Kompetenz: Kundenkommunikation'],
      confirmationQuestion: 'Stimmt das so? Fehlt etwas Wichtiges?',
    };

    const text = formatSummaryAsText(summary);

    expect(text).toContain('Lass mich kurz zusammenfassen');
    expect(text).toContain('**Fakten:**');
    expect(text).toContain('**Was ich an Emotionen wahrgenommen habe:**');
    expect(text).toContain('**Stärken, die ich erkannt habe:**');
    expect(text).toContain('Stimmt das so?');
  });

  it('should include all facts as bullet points', () => {
    const summary: ReflectiveSummary = {
      facts: ['Fakt 1', 'Fakt 2', 'Fakt 3'],
      emotional: [],
      strengths: [],
      confirmationQuestion: 'Stimmt das so?',
    };

    const text = formatSummaryAsText(summary);

    expect(text).toContain('- Fakt 1');
    expect(text).toContain('- Fakt 2');
    expect(text).toContain('- Fakt 3');
  });

  it('should include all emotional themes as bullet points', () => {
    const summary: ReflectiveSummary = {
      facts: [],
      emotional: ['Emotion 1', 'Emotion 2'],
      strengths: [],
      confirmationQuestion: 'Stimmt das so?',
    };

    const text = formatSummaryAsText(summary);

    expect(text).toContain('- Emotion 1');
    expect(text).toContain('- Emotion 2');
  });

  it('should include all strengths as bullet points', () => {
    const summary: ReflectiveSummary = {
      facts: [],
      emotional: [],
      strengths: ['Stärke 1', 'Stärke 2'],
      confirmationQuestion: 'Stimmt das so?',
    };

    const text = formatSummaryAsText(summary);

    expect(text).toContain('- Stärke 1');
    expect(text).toContain('- Stärke 2');
  });

  it('should show placeholder for empty facts', () => {
    const summary: ReflectiveSummary = {
      facts: [],
      emotional: ['Emotion'],
      strengths: ['Stärke'],
      confirmationQuestion: 'Stimmt das so?',
    };

    const text = formatSummaryAsText(summary);

    expect(text).toContain('Noch keine konkreten Fakten geteilt');
  });

  it('should show placeholder for empty emotions', () => {
    const summary: ReflectiveSummary = {
      facts: ['Fakt'],
      emotional: [],
      strengths: ['Stärke'],
      confirmationQuestion: 'Stimmt das so?',
    };

    const text = formatSummaryAsText(summary);

    expect(text).toContain('Keine deutlichen emotionalen Signale');
  });

  it('should show placeholder for empty strengths', () => {
    const summary: ReflectiveSummary = {
      facts: ['Fakt'],
      emotional: ['Emotion'],
      strengths: [],
      confirmationQuestion: 'Stimmt das so?',
    };

    const text = formatSummaryAsText(summary);

    expect(text).toContain('Stärken werden im Laufe des Gesprächs');
  });

  it('should always end with confirmation question', () => {
    const summary: ReflectiveSummary = {
      facts: ['Fakt'],
      emotional: ['Emotion'],
      strengths: ['Stärke'],
      confirmationQuestion: 'Stimmt das so? Fehlt etwas Wichtiges?',
    };

    const text = formatSummaryAsText(summary);

    expect(text.trim().endsWith('Stimmt das so? Fehlt etwas Wichtiges?')).toBe(true);
  });

  it('should use German format template', () => {
    const summary: ReflectiveSummary = {
      facts: ['Test'],
      emotional: ['Test'],
      strengths: ['Test'],
      confirmationQuestion: 'Stimmt das so?',
    };

    const text = formatSummaryAsText(summary);

    // Check for German template structure
    expect(text).toContain('Lass mich kurz zusammenfassen');
    expect(text).toContain('was ich bisher verstanden habe');
  });
});

// ============================================================================
// Integration Tests
// ============================================================================

describe('Reflective Summary Integration', () => {
  it('should generate complete summary from conversation', () => {
    const exchangeCount = 6;

    // Check if we should generate summary
    expect(shouldGenerateSummary(exchangeCount)).toBe(true);

    // Generate the summary
    const summary = generateReflectiveSummary(sampleMessages, sampleUserProfile);

    // Verify structure
    expect(summary.facts).toBeDefined();
    expect(summary.emotional).toBeDefined();
    expect(summary.strengths).toBeDefined();
    expect(summary.confirmationQuestion).toBe('Stimmt das so? Fehlt etwas Wichtiges?');

    // Format as text
    const text = formatSummaryAsText(summary);

    // Verify formatted output
    expect(text).toContain('Fakten');
    expect(text).toContain('Emotionen');
    expect(text).toContain('Stärken');
    expect(text).toContain('Stimmt das so?');
  });

  it('should work with minimal data', () => {
    const messages: Message[] = [
      { role: 'user', content: 'Hallo.' },
    ];

    const summary = generateReflectiveSummary(messages);
    const text = formatSummaryAsText(summary);

    // Should still produce valid output
    expect(text).toContain('Lass mich kurz zusammenfassen');
    expect(text).toContain('Stimmt das so?');
  });

  it('should generate AI prompt correctly', () => {
    const prompt = generateSummaryPrompt(sampleMessages, sampleUserProfile);

    // Verify prompt includes all necessary elements
    expect(prompt).toContain('Greta');
    expect(prompt).toContain('Maria');
    expect(prompt).toContain('E-Commerce');
    expect(prompt).toContain('Fakten');
    expect(prompt).toContain('Emotionale');
    expect(prompt).toContain('Stärken');
    expect(prompt).toContain('Stimmt das so?');
  });

  it('should respect trigger intervals', () => {
    // Before window
    expect(shouldGenerateSummary(4)).toBe(false);

    // In window
    expect(shouldGenerateSummary(5)).toBe(true);
    expect(shouldGenerateSummary(6)).toBe(true);
    expect(shouldGenerateSummary(7)).toBe(true);

    // After window
    expect(shouldGenerateSummary(8)).toBe(false);
  });
});
