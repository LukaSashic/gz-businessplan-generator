/**
 * Reflective Summary Generator Module
 *
 * SPEC REFERENCE: gz-coaching-mi.md (Motivational Interviewing)
 *
 * Generates reflective summaries every 5-7 exchanges covering:
 * - FAKTEN: Concrete information shared by the user
 * - EMOTIONALES: Emotional themes detected
 * - STÄRKEN: Strengths identified
 *
 * Always ends with a confirmation question to validate understanding.
 */

import { detectEmotion, detectAllEmotions, type Emotion } from './emotion-detection';

// ============================================================================
// Types
// ============================================================================

/**
 * Message format for chat (aligned with ChatMessage type)
 */
export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * User profile information for personalization
 */
export interface UserProfile {
  name?: string;
  businessType?: string;
  strengths?: string[];
}

/**
 * Structure of a reflective summary
 */
export interface ReflectiveSummary {
  /** FAKTEN - concrete information shared by the user */
  facts: string[];
  /** EMOTIONALES - emotional themes detected */
  emotional: string[];
  /** STÄRKEN - strengths identified */
  strengths: string[];
  /** Always ends with a confirmation question */
  confirmationQuestion: string;
}

/**
 * Result of fact extraction
 */
export interface FactExtractionResult {
  facts: string[];
  categories: FactCategory[];
}

/**
 * Categories of facts that can be extracted
 */
export type FactCategory =
  | 'business_idea'
  | 'experience'
  | 'target_audience'
  | 'location'
  | 'timeline'
  | 'financial'
  | 'personal'
  | 'qualification'
  | 'general';

/**
 * Result of emotional theme extraction
 */
export interface EmotionalThemeResult {
  themes: string[];
  detectedEmotions: Emotion[];
}

// ============================================================================
// Constants
// ============================================================================

/**
 * Default confirmation question (German)
 */
const DEFAULT_CONFIRMATION_QUESTION = 'Stimmt das so? Fehlt etwas Wichtiges?';

/**
 * Summary trigger range
 */
const SUMMARY_TRIGGER_MIN = 5;
const SUMMARY_TRIGGER_MAX = 7;
const SUMMARY_TRIGGER_OPTIMAL = 6;

/**
 * Patterns for extracting facts from German text
 */
const FACT_PATTERNS: { category: FactCategory; patterns: RegExp[] }[] = [
  {
    category: 'business_idea',
    patterns: [
      /(?:ich\s+(?:will|möchte|plane|biete|mache))\s+(.{10,100}?)(?:\.|,|$)/gi,
      /(?:mein(?:e)?\s+(?:geschäftsidee|idee|angebot|dienstleistung|produkt))\s+(?:ist|sind|umfasst)\s+(.{10,100}?)(?:\.|,|$)/gi,
      /(?:ich\s+(?:gründe|starte))\s+(.{5,80}?)(?:\.|,|$)/gi,
    ],
  },
  {
    category: 'experience',
    patterns: [
      /(?:ich\s+habe)\s+(\d+\s+jahre?\s+(?:erfahrung|in|als).{5,60}?)(?:\.|,|$)/gi,
      /(?:seit)\s+(\d+\s+jahren?\s+.{5,60}?)(?:\.|,|$)/gi,
      /(?:ich\s+(?:war|bin|arbeite))\s+(?:als|bei|in)\s+(.{5,60}?)(?:\.|,|$)/gi,
    ],
  },
  {
    category: 'target_audience',
    patterns: [
      /(?:meine\s+(?:zielgruppe|kunden|zielkunden))\s+(?:ist|sind)\s+(.{5,80}?)(?:\.|,|$)/gi,
      /(?:ich\s+(?:richte\s+mich\s+an|bediene|helfe))\s+(.{5,80}?)(?:\.|,|$)/gi,
    ],
  },
  {
    category: 'location',
    patterns: [
      /(?:in|aus|bei)\s+((?:berlin|münchen|hamburg|frankfurt|köln|düsseldorf|stuttgart|leipzig|dresden|bremen|hannover|nürnberg|essen|dortmund|bochum|wuppertal|bielefeld|bonn|münster|karlsruhe|mannheim|augsburg|wiesbaden|gelsenkirchen|mönchengladbach|braunschweig|chemnitz|kiel|aachen|halle|magdeburg|freiburg|krefeld|lübeck|oberhausen|erfurt|mainz|rostock|kassel|hagen|potsdam|saarbrücken|ludwigshafen|osnabrück|oldenburg|heidelberg|solingen|leverkusen|darmstadt|herne|paderborn|neuss|offenbach|würzburg|regensburg|ingolstadt|ulm|heilbronn|pforzheim|göttingen|recklinghausen|wolfsburg|bottrop|cottbus|remscheid|bremerhaven|jena|trier|erlangen|moers|salzgitter|siegen|hildesheim|gera|kaiserslautern|schwerin|gütersloh|witten|iserlohn|hanau|lünen|zwickau|ratingen|marl|bergisch gladbach|velbert|fürth|esslingen|hamm|konstanz|ludwigsburg|tübingen|villingen-schwenningen|gießen|minden|neumünster|dessau-roßlau|wilhelmshaven)\b)/gi,
      /(?:standort|sitz|region)\s+(?:ist|in|bei)\s+(.{5,40}?)(?:\.|,|$)/gi,
    ],
  },
  {
    category: 'timeline',
    patterns: [
      /(?:ab|bis|im|am|seit|vor)\s+((?:januar|februar|märz|april|mai|juni|juli|august|september|oktober|november|dezember)\s+\d{4})/gi,
      /(?:in)\s+(\d+\s+(?:wochen?|monaten?|jahren?))/gi,
      /(?:ab|bis|im)\s+((?:nächsten?|diesem|letzten?)\s+(?:monat|jahr|woche|quartal))/gi,
    ],
  },
  {
    category: 'financial',
    patterns: [
      /(\d+(?:[.,]\d+)?\s*(?:euro|€|eur))/gi,
      /(?:umsatz|einnahmen|ausgaben|kosten|budget|investition|kapital)\s+(?:von|beträgt|sind)\s+(.{5,40}?)(?:\.|,|$)/gi,
    ],
  },
  {
    category: 'qualification',
    patterns: [
      /(?:ich\s+habe)\s+(?:einen?|meine?)\s+((?:abschluss|diplom|master|bachelor|doktor|ausbildung|zertifikat|zertifizierung).{5,60}?)(?:\.|,|$)/gi,
      /(?:ich\s+bin)\s+((?:zertifiziert|qualifiziert|ausgebildet|studiert).{5,60}?)(?:\.|,|$)/gi,
    ],
  },
  {
    category: 'personal',
    patterns: [
      /(?:ich\s+bin)\s+(\d+\s+jahre?\s+alt)/gi,
      /(?:mein\s+name\s+ist|ich\s+(?:heiße|bin))\s+([A-ZÄÖÜ][a-zäöüß]+(?:\s+[A-ZÄÖÜ][a-zäöüß]+)?)/g,
    ],
  },
];

/**
 * German emotional theme labels
 */
const EMOTION_THEME_LABELS: Record<Emotion, string> = {
  uncertainty: 'Unsicherheit bezüglich der nächsten Schritte',
  ambivalence: 'Zwiespalt zwischen verschiedenen Optionen',
  anxiety: 'Sorgen und Bedenken',
  frustration: 'Frustration mit dem aktuellen Prozess',
  excitement: 'Begeisterung und Motivation',
  confidence: 'Zuversicht und Selbstvertrauen',
};

/**
 * Patterns for detecting strengths in German text
 */
const STRENGTH_PATTERNS: { pattern: RegExp; strengthLabel: string }[] = [
  { pattern: /(?:ich\s+(?:kann|bin\s+gut\s+in|beherrsche))\s+(.{5,40})/gi, strengthLabel: 'Kompetenz: {match}' },
  { pattern: /(?:meine\s+stärke|stärken)\s+(?:ist|sind|liegt?\s+(?:in|bei))\s+(?:der\s+)?(.{3,60})/gi, strengthLabel: 'Stärke: {match}' },
  { pattern: /(?:ich\s+habe)\s+(?:viel|große?|umfangreiche?)\s+(erfahrung.{5,40})/gi, strengthLabel: 'Erfahrung: {match}' },
  { pattern: /(?:erfolgreich|gut)\s+(?:abgeschlossen|gemeistert|umgesetzt)\s+(.{5,40})/gi, strengthLabel: 'Erfolg: {match}' },
  { pattern: /(?:ich\s+(?:liebe|genieße|mag))\s+(.{5,40})/gi, strengthLabel: 'Leidenschaft: {match}' },
];

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Determines if a reflective summary should be generated based on exchange count.
 * Triggers every 5-7 exchanges, optimally at 6.
 *
 * @param exchangeCount - Number of exchanges (user messages) since last summary
 * @returns True if a summary should be generated
 */
export function shouldGenerateSummary(exchangeCount: number): boolean {
  return exchangeCount >= SUMMARY_TRIGGER_MIN && exchangeCount <= SUMMARY_TRIGGER_MAX;
}

/**
 * Checks if summary should be generated at the optimal trigger point (6 exchanges).
 *
 * @param exchangeCount - Number of exchanges since last summary
 * @returns True if at optimal trigger point
 */
export function shouldGenerateSummaryOptimal(exchangeCount: number): boolean {
  return exchangeCount === SUMMARY_TRIGGER_OPTIMAL;
}

/**
 * Extracts concrete facts from user messages.
 *
 * @param messages - Array of chat messages
 * @returns Array of extracted facts as strings
 */
export function extractFactsFromMessages(messages: Message[]): string[] {
  const userMessages = messages.filter((m) => m.role === 'user');
  const facts = new Set<string>();

  for (const message of userMessages) {
    const content = message.content;

    for (const { patterns } of FACT_PATTERNS) {
      for (const pattern of patterns) {
        // Reset lastIndex for global patterns
        pattern.lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = pattern.exec(content)) !== null) {
          const fact = match[1]?.trim();
          if (fact && fact.length >= 5) {
            // Clean up the fact and capitalize first letter
            const cleanFact = fact
              .replace(/^[,.\s]+|[,.\s]+$/g, '')
              .trim();
            if (cleanFact.length >= 5) {
              const capitalizedFact = cleanFact.charAt(0).toUpperCase() + cleanFact.slice(1);
              facts.add(capitalizedFact);
            }
          }
        }
      }
    }
  }

  return Array.from(facts);
}

/**
 * Extracts facts with their categories.
 *
 * @param messages - Array of chat messages
 * @returns Object with facts and their categories
 */
export function extractFactsWithCategories(messages: Message[]): FactExtractionResult {
  const userMessages = messages.filter((m) => m.role === 'user');
  const factsWithCategories: { fact: string; category: FactCategory }[] = [];
  const seenFacts = new Set<string>();

  for (const message of userMessages) {
    const content = message.content;

    for (const { category, patterns } of FACT_PATTERNS) {
      for (const pattern of patterns) {
        // Reset lastIndex for global patterns
        pattern.lastIndex = 0;
        let match: RegExpExecArray | null;

        while ((match = pattern.exec(content)) !== null) {
          const fact = match[1]?.trim();
          if (fact && fact.length >= 5) {
            const cleanFact = fact
              .replace(/^[,.\s]+|[,.\s]+$/g, '')
              .trim();
            if (cleanFact.length >= 5 && !seenFacts.has(cleanFact.toLowerCase())) {
              seenFacts.add(cleanFact.toLowerCase());
              const capitalizedFact = cleanFact.charAt(0).toUpperCase() + cleanFact.slice(1);
              factsWithCategories.push({ fact: capitalizedFact, category });
            }
          }
        }
      }
    }
  }

  const categories = Array.from(new Set(factsWithCategories.map((f) => f.category)));
  const facts = factsWithCategories.map((f) => f.fact);

  return { facts, categories };
}

/**
 * Extracts emotional themes from user messages.
 *
 * @param messages - Array of chat messages
 * @returns Array of emotional themes in German
 */
export function extractEmotionalThemes(messages: Message[]): string[] {
  const userMessages = messages.filter((m) => m.role === 'user');
  const detectedEmotions = new Set<Emotion>();

  for (const message of userMessages) {
    const emotions = detectAllEmotions(message.content);
    for (const { emotion } of emotions) {
      detectedEmotions.add(emotion);
    }

    // Also check with single emotion detection for consistency
    const primaryEmotion = detectEmotion(message.content);
    if (primaryEmotion) {
      detectedEmotions.add(primaryEmotion);
    }
  }

  return Array.from(detectedEmotions).map((emotion) => EMOTION_THEME_LABELS[emotion]);
}

/**
 * Extracts emotional themes with detailed information.
 *
 * @param messages - Array of chat messages
 * @returns Object with themes and detected emotions
 */
export function extractEmotionalThemesWithDetails(messages: Message[]): EmotionalThemeResult {
  const userMessages = messages.filter((m) => m.role === 'user');
  const detectedEmotions = new Set<Emotion>();

  for (const message of userMessages) {
    const emotions = detectAllEmotions(message.content);
    for (const { emotion } of emotions) {
      detectedEmotions.add(emotion);
    }

    const primaryEmotion = detectEmotion(message.content);
    if (primaryEmotion) {
      detectedEmotions.add(primaryEmotion);
    }
  }

  const emotionArray = Array.from(detectedEmotions);
  const themes = emotionArray.map((emotion) => EMOTION_THEME_LABELS[emotion]);

  return { themes, detectedEmotions: emotionArray };
}

/**
 * Extracts strengths mentioned in user messages.
 *
 * @param messages - Array of chat messages
 * @param userProfile - Optional user profile with pre-identified strengths
 * @returns Array of identified strengths
 */
export function extractStrengths(messages: Message[], userProfile?: UserProfile): string[] {
  const strengths = new Set<string>();

  // Include strengths from user profile if available
  if (userProfile?.strengths) {
    for (const strength of userProfile.strengths) {
      strengths.add(strength);
    }
  }

  // Extract strengths from messages
  const userMessages = messages.filter((m) => m.role === 'user');

  for (const message of userMessages) {
    const content = message.content;

    for (const { pattern, strengthLabel } of STRENGTH_PATTERNS) {
      // Reset lastIndex for global patterns
      pattern.lastIndex = 0;
      let match: RegExpExecArray | null;

      while ((match = pattern.exec(content)) !== null) {
        const matchedText = match[1]?.trim();
        if (matchedText && matchedText.length >= 3) {
          const cleanMatch = matchedText.replace(/^[,.\s]+|[,.\s]+$/g, '').trim();
          if (cleanMatch.length >= 3) {
            const strength = strengthLabel.replace('{match}', cleanMatch);
            strengths.add(strength);
          }
        }
      }
    }
  }

  return Array.from(strengths);
}

/**
 * Generates the prompt for AI to create a reflective summary.
 *
 * @param messages - Array of chat messages
 * @param userProfile - User profile for personalization
 * @returns Prompt string for AI summary generation
 */
export function generateSummaryPrompt(messages: Message[], userProfile: UserProfile): string {
  const facts = extractFactsFromMessages(messages);
  const emotionalThemes = extractEmotionalThemes(messages);
  const strengths = extractStrengths(messages, userProfile);

  const userName = userProfile.name ? `${userProfile.name}` : 'der Nutzer';
  const businessContext = userProfile.businessType
    ? ` im Bereich "${userProfile.businessType}"`
    : '';

  const prompt = `Du bist Greta, eine empathische Business-Coach. Erstelle eine reflektive Zusammenfassung der bisherigen Konversation mit ${userName}${businessContext}.

## Extrahierte Informationen

### Fakten (was ${userName} geteilt hat):
${facts.length > 0 ? facts.map((f) => `- ${f}`).join('\n') : '- Noch keine konkreten Fakten geteilt'}

### Emotionale Themen (was du wahrgenommen hast):
${emotionalThemes.length > 0 ? emotionalThemes.map((e) => `- ${e}`).join('\n') : '- Keine deutlichen emotionalen Signale'}

### Stärken (die du erkannt hast):
${strengths.length > 0 ? strengths.map((s) => `- ${s}`).join('\n') : '- Noch keine Stärken identifiziert'}

## Anleitung

Formuliere eine warme, empathische Zusammenfassung im folgenden Format:

---
Lass mich kurz zusammenfassen, was ich bisher verstanden habe:

**Fakten:**
- [Fasse die wichtigsten Fakten zusammen]

**Was ich an Emotionen wahrgenommen habe:**
- [Beschreibe wahrgenommene emotionale Themen einfühlsam]

**Stärken, die ich erkannt habe:**
- [Liste identifizierte Stärken auf]

Stimmt das so? Fehlt etwas Wichtiges?
---

Halte die Zusammenfassung prägnant aber vollständig. Nutze eine warme, persönliche Sprache.`;

  return prompt;
}

/**
 * Generates a complete reflective summary object.
 *
 * @param messages - Array of chat messages
 * @param userProfile - User profile for personalization
 * @returns Complete ReflectiveSummary object
 */
export function generateReflectiveSummary(
  messages: Message[],
  userProfile?: UserProfile
): ReflectiveSummary {
  const profile = userProfile ?? {};

  return {
    facts: extractFactsFromMessages(messages),
    emotional: extractEmotionalThemes(messages),
    strengths: extractStrengths(messages, profile),
    confirmationQuestion: DEFAULT_CONFIRMATION_QUESTION,
  };
}

/**
 * Formats a reflective summary into German text.
 *
 * @param summary - ReflectiveSummary object
 * @returns Formatted German text
 */
export function formatSummaryAsText(summary: ReflectiveSummary): string {
  const factsSection = summary.facts.length > 0
    ? summary.facts.map((f) => `- ${f}`).join('\n')
    : '- Noch keine konkreten Fakten geteilt';

  const emotionalSection = summary.emotional.length > 0
    ? summary.emotional.map((e) => `- ${e}`).join('\n')
    : '- Keine deutlichen emotionalen Signale wahrgenommen';

  const strengthsSection = summary.strengths.length > 0
    ? summary.strengths.map((s) => `- ${s}`).join('\n')
    : '- Stärken werden im Laufe des Gesprächs sichtbar werden';

  return `Lass mich kurz zusammenfassen, was ich bisher verstanden habe:

**Fakten:**
${factsSection}

**Was ich an Emotionen wahrgenommen habe:**
${emotionalSection}

**Stärken, die ich erkannt habe:**
${strengthsSection}

${summary.confirmationQuestion}`;
}

/**
 * Gets the summary trigger configuration.
 *
 * @returns Object with trigger configuration values
 */
export function getSummaryTriggerConfig(): {
  min: number;
  max: number;
  optimal: number;
} {
  return {
    min: SUMMARY_TRIGGER_MIN,
    max: SUMMARY_TRIGGER_MAX,
    optimal: SUMMARY_TRIGGER_OPTIMAL,
  };
}
