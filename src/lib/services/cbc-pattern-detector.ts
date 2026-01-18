/**
 * CBC (Cognitive Behavioral Coaching) Pattern Detector
 *
 * SPEC REFERENCE: gz-coaching-cbc.md
 * SPEC REFERENCE: gz-module-02-geschaeftsmodell.md Lines 249-499
 *
 * Detects patterns that require CBC intervention:
 * - Vague offering statements ("guter Service", "professionell")
 * - Broad target audience ("alle", "jeder")
 * - Limiting beliefs ("ich bin kein", "kann nicht")
 * - Unrealistic assumptions
 *
 * Used primarily in Module 02 (Geschäftsmodell) to challenge vague
 * business model statements and help founders define concrete offerings.
 */

// ============================================================================
// Types
// ============================================================================

export type CBCPatternType =
  | 'vague_offering'
  | 'broad_target'
  | 'limiting_belief'
  | 'unrealistic_assumption'
  | 'provider_perspective';

export interface CBCPattern {
  type: CBCPatternType;
  triggers: RegExp[];
  severity: 'low' | 'medium' | 'high';
  name: string;
  description: string;
}

export interface CBCDetectionResult {
  detected: boolean;
  pattern: CBCPatternType | null;
  matchedText: string | null;
  severity: 'low' | 'medium' | 'high' | null;
  interventionPrompt: string | null;
  followUpQuestions: string[];
}

// ============================================================================
// Pattern Definitions
// SPEC REFERENCE: gz-coaching-cbc.md - 5-Step CBC Process
// ============================================================================

export const CBC_PATTERNS: CBCPattern[] = [
  {
    type: 'vague_offering',
    name: 'Vages Angebot',
    description: 'User beschreibt Angebot mit unspezifischen Qualitätsbegriffen',
    severity: 'high',
    triggers: [
      /\b(guter|gute|gutes)\s+(service|qualität|beratung|arbeit)/i,
      /\b(professionell|professionelle|professioneller|professionelles)/i,
      /\b(hochwertig|hochwertige|hochwertiger|hochwertiges)/i,
      /\b(qualität|qualitativ)/i,
      /\b(beste|bester|bestes)\s+(service|qualität|arbeit)/i,
      /\b(persönlich|persönliche|persönlicher)\s+(betreuung|service|beratung)/i,
      /\b(individuell|individuelle|individueller)\s+(lösungen|beratung|angebote)/i,
      /\b(flexibel|flexible|flexibler)/i,
      /\b(zuverlässig|zuverlässige|zuverlässiger)/i,
      /\bkompetent|kompetente|kompetenter/i,
      /\b(rundum-sorglos|all-inclusive|full-service)/i,
    ],
  },
  {
    type: 'broad_target',
    name: 'Breite Zielgruppe',
    description: 'User definiert Zielgruppe zu breit ("alle", "jeder")',
    severity: 'high',
    triggers: [
      /\b(alle|jeder|jede|jedes|jeden)\b/i,
      /\b(unternehmen|firmen|betriebe)\b(?!\s+(?:die|welche|mit))/i,
      /\b(menschen|leute|personen)\b(?!\s+(?:die|welche|mit))/i,
      /\b(kmu|mittelstand)\b(?!\s+(?:die|welche|mit|in))/i,
      /\b(eigentlich|grundsätzlich)\s+(jeder|alle)/i,
      /\bfür\s+(alle|jeden)\b/i,
      /\b(privat-?\s*und\s*geschäftskunden|b2b\s*und\s*b2c)/i,
    ],
  },
  {
    type: 'limiting_belief',
    name: 'Limitierende Überzeugung',
    description: 'User zeigt selbstlimitierende Gedanken',
    severity: 'medium',
    triggers: [
      /\b(ich\s+bin\s+kein|ich\s+bin\s+keine|ich\s+bin\s+keiner)/i,
      /\b(kann\s+ich\s+nicht|kann\s+nicht|schaffe\s+ich\s+nicht)/i,
      /\b(bin\s+nicht\s+gut\s+in|bin\s+schlecht\s+in)/i,
      /\b(das\s+liegt\s+mir\s+nicht)/i,
      /\b(das\s+schaffe\s+ich\s+(nicht|nie))/i,
      /\b(dafür\s+(bin\s+ich|fehlt\s+mir))/i,
      /\b(ich\s+habe\s+keine\s+(erfahrung|ahnung))/i,
      /\b(das\s+ist\s+nichts\s+für\s+mich)/i,
      /\b(zu\s+(kompliziert|schwierig|schwer)\s+für\s+mich)/i,
    ],
  },
  {
    type: 'unrealistic_assumption',
    name: 'Unrealistische Annahme',
    description: 'User macht Annahmen ohne Evidenz',
    severity: 'medium',
    triggers: [
      /\b(bestimmt|sicherlich|garantiert|auf\s+jeden\s+fall)/i,
      /\b(alle\s+wollen|jeder\s+braucht|jeder\s+will)/i,
      /\b(einfach|easy|kein\s+problem)/i,
      /\b(schnell\s+reich|viel\s+geld\s+verdienen)/i,
      /\b(klappt\s+schon|wird\s+schon|geht\s+schon)/i,
      /\b(gibt\s+es\s+(nicht|keine|keinen)\s+konkurrenz)/i,
      /\b(konkurrenzlos|einzigartig|einmalig)/i,
      /\b(niemand\s+(macht|bietet|hat))/i,
    ],
  },
  {
    type: 'provider_perspective',
    name: 'Anbieter-Perspektive',
    description: 'User beschreibt Wert aus eigener statt Kundenperspektive',
    severity: 'low',
    triggers: [
      /\b(ich\s+biete|ich\s+mache|ich\s+liefere)/i,
      /\b(wir\s+bieten|wir\s+machen|wir\s+liefern)/i,
      /\b(mein\s+angebot\s+ist|meine\s+dienstleistung\s+ist)/i,
      /\b(ich\s+kann\s+gut|ich\s+bin\s+gut\s+in)/i,
      /\b(das\s+macht\s+mich\s+besonders)/i,
    ],
  },
];

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Detect CBC patterns in user message
 * @param userMessage - The user's message text
 * @returns Detection result with matched pattern and intervention suggestions
 */
export function detectCBCPattern(userMessage: string): CBCDetectionResult {
  const normalizedMessage = userMessage.toLowerCase().trim();

  for (const pattern of CBC_PATTERNS) {
    for (const trigger of pattern.triggers) {
      const match = normalizedMessage.match(trigger);
      if (match) {
        return {
          detected: true,
          pattern: pattern.type,
          matchedText: match[0],
          severity: pattern.severity,
          interventionPrompt: generateInterventionPrompt(pattern.type, match[0]),
          followUpQuestions: generateFollowUpQuestions(pattern.type, match[0]),
        };
      }
    }
  }

  return {
    detected: false,
    pattern: null,
    matchedText: null,
    severity: null,
    interventionPrompt: null,
    followUpQuestions: [],
  };
}

/**
 * Check if message contains any CBC triggers
 * @param userMessage - The user's message text
 * @returns True if any CBC pattern is detected
 */
export function hasCBCTrigger(userMessage: string): boolean {
  return detectCBCPattern(userMessage).detected;
}

/**
 * Get all detected patterns (not just first match)
 * @param userMessage - The user's message text
 * @returns Array of all detected patterns
 */
export function detectAllCBCPatterns(userMessage: string): CBCDetectionResult[] {
  const normalizedMessage = userMessage.toLowerCase().trim();
  const results: CBCDetectionResult[] = [];

  for (const pattern of CBC_PATTERNS) {
    for (const trigger of pattern.triggers) {
      const match = normalizedMessage.match(trigger);
      if (match) {
        results.push({
          detected: true,
          pattern: pattern.type,
          matchedText: match[0],
          severity: pattern.severity,
          interventionPrompt: generateInterventionPrompt(pattern.type, match[0]),
          followUpQuestions: generateFollowUpQuestions(pattern.type, match[0]),
        });
        break; // Only one match per pattern type
      }
    }
  }

  return results;
}

// ============================================================================
// Intervention Generation
// SPEC REFERENCE: gz-coaching-cbc.md - 5-Step CBC Process
// ============================================================================

/**
 * Generate intervention prompt for CBC pattern
 * Uses 5-step CBC: Identify → Evidence → Challenge → Reframe → Action
 */
function generateInterventionPrompt(patternType: CBCPatternType, matchedText: string): string {
  switch (patternType) {
    case 'vague_offering':
      return `[CBC ACTIVATION: vague_offering]
Du sagst "${matchedText}" - das sagen viele Anbieter. Lass uns das konkretisieren.

Was genau meinst du mit "${matchedText}"? Kannst du ein konkretes Beispiel geben?

Mögliche Konkretisierungen:
A) Reaktionszeit - z.B. "Antwort innerhalb 2 Stunden"
B) Verfügbarkeit - z.B. "Erreichbar Mo-Fr 8-18 Uhr"
C) Garantie - z.B. "Geld zurück bei Unzufriedenheit"
D) Persönlich - z.B. "Immer gleicher Ansprechpartner"
E) Nachsorge - z.B. "Kostenloser Check-up nach 2 Wochen"

Welche dieser Optionen passt am besten zu deinem Angebot?`;

    case 'broad_target':
      return `[CBC ACTIVATION: broad_target]
"${matchedText}" ist ein großer Markt. Lass uns fokussieren.

Stell dir vor, du kannst in Jahr 1 nur 10 Kunden gewinnen.
Welche 10 würdest du wählen?

Denk an:
- Welche Branche?
- Welche Größe?
- Welches konkrete Problem haben sie?
- Warum ausgerechnet diese 10?`;

    case 'limiting_belief':
      return `[CBC ACTIVATION: limiting_belief]
Du sagst "${matchedText}". Woran machst du das fest?

Lass uns anders schauen:
- Hast du schon mal jemanden von einer Idee überzeugt?
- Im Job den Chef? Einen Kunden? Einen Freund?
- Was hast du da genau gemacht?`;

    case 'unrealistic_assumption':
      return `[CBC ACTIVATION: unrealistic_assumption]
Interessant, du sagst "${matchedText}". Woher weißt du das?

Lass uns das prüfen:
- Welche Daten oder Erfahrungen stützen diese Annahme?
- Was wäre, wenn es anders wäre?
- Wie könntest du das validieren, bevor du investierst?`;

    case 'provider_perspective':
      return `[CBC ACTIVATION: provider_perspective]
Ich höre, was DU bietest. Aber was bekommt der KUNDE?

Versuch es mal aus Kundenperspektive:
"Mit [deinem Angebot] kann [Zielgruppe] [konkretes Ergebnis] erreichen, ohne [Problem/Aufwand]."

Wie würde das bei dir klingen?`;

    default:
      return '';
  }
}

/**
 * Generate follow-up questions for CBC pattern
 * @param patternType - The type of CBC pattern detected
 * @param _matchedText - The text that triggered the pattern (reserved for future personalization)
 */
function generateFollowUpQuestions(patternType: CBCPatternType, _matchedText: string): string[] {
  switch (patternType) {
    case 'vague_offering':
      return [
        'Was genau ist an deinem Service besser als bei der Konkurrenz?',
        'Wenn ein Kunde nach einem Beispiel fragt - was zeigst du ihm?',
        'Woran kann der Kunde den Unterschied MESSEN?',
        'Kannst du das garantieren? Was passiert, wenn nicht?',
      ];

    case 'broad_target':
      return [
        'Von diesen 10 idealen Kunden - was haben sie gemeinsam?',
        'Wer wäre dein ERSTER zahlender Kunde? Name und Firma?',
        'Bei wem hast du die BESTE Chance zu gewinnen?',
        'Wen lehnst du aktiv AB?',
      ];

    case 'limiting_belief':
      return [
        'Was wäre, wenn das nur eine Überzeugung ist, keine Tatsache?',
        'Kennst du jemanden wie dich, der das geschafft hat?',
        'Was wäre der kleinste erste Schritt in diese Richtung?',
        'Was würdest du einem Freund mit dieser Überzeugung sagen?',
      ];

    case 'unrealistic_assumption':
      return [
        'Wie viele potenzielle Kunden hast du konkret gefragt?',
        'Was sagen die Daten zu ähnlichen Angeboten?',
        'Was ist der BESTE Fall, was der SCHLECHTESTE?',
        'Welcher Mitbewerber kommt dem am nächsten?',
      ];

    case 'provider_perspective':
      return [
        'Was ist das konkrete Ergebnis für den Kunden?',
        'Welches Problem löst du - aus Kundensicht?',
        'Warum sollte der Kunde JETZT kaufen?',
        'Was gewinnt der Kunde, das er vorher nicht hatte?',
      ];

    default:
      return [];
  }
}

// ============================================================================
// Pattern Information
// ============================================================================

/**
 * Get human-readable description of a CBC pattern
 */
export function getPatternInfo(patternType: CBCPatternType): {
  name: string;
  description: string;
  severity: string;
} {
  const pattern = CBC_PATTERNS.find(p => p.type === patternType);
  if (!pattern) {
    return {
      name: 'Unbekannt',
      description: 'Unbekanntes Pattern',
      severity: 'low',
    };
  }

  return {
    name: pattern.name,
    description: pattern.description,
    severity: pattern.severity,
  };
}

/**
 * Get all pattern types for reference
 */
export function getAllPatternTypes(): CBCPatternType[] {
  return CBC_PATTERNS.map(p => p.type);
}

// ============================================================================
// Integration Helpers
// ============================================================================

/**
 * Format CBC detection for logging/display
 */
export function formatCBCDetection(result: CBCDetectionResult): string {
  if (!result.detected) {
    return 'Keine CBC-Pattern erkannt';
  }

  const info = getPatternInfo(result.pattern!);
  return `CBC: ${info.name} (${info.severity}) - "${result.matchedText}"`;
}

/**
 * Determine if CBC intervention should be added to prompt
 * @param userMessage - The user's message
 * @param currentPhase - Current module phase
 * @returns True if CBC should be activated
 */
export function shouldActivateCBC(
  userMessage: string,
  currentPhase?: string
): boolean {
  // Always check for CBC patterns in geschaeftsmodell phases
  const cbcPhases = ['angebot', 'zielgruppe', 'wertversprechen', 'usp'];

  if (currentPhase && !cbcPhases.includes(currentPhase)) {
    return false;
  }

  return hasCBCTrigger(userMessage);
}
