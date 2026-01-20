/**
 * Red Flag Detection System
 *
 * Client-side pattern matching for entrepreneurial red flags
 * that require adaptive coaching responses.
 *
 * Based on coaching methodology from gz-coaching-cbc.md and gz-coaching-mi.md
 */

/**
 * Severity levels for detected red flags
 */
export type RedFlagSeverity = 'minor' | 'major' | 'critical';

/**
 * Red flag categories
 */
export type RedFlagType =
  | 'imposterSyndrome'
  | 'unrealisticExpectations'
  | 'insufficientCapital'
  | 'externalLocusOfControl'
  | 'financialAnxiety'
  | 'timeScarcity'
  | 'lackOfCommitment'
  | 'marketBlindness'
  | 'isolationTendency';

/**
 * A detected red flag with coaching context
 */
export interface RedFlag {
  type: RedFlagType;
  severity: RedFlagSeverity;
  trigger: string; // The text that triggered detection
  triggerContext?: string; // Surrounding context
  coachingHint: string; // How to address this in coaching
  detectedAt: number; // Timestamp
}

/**
 * Pattern configuration for red flag detection
 */
interface RedFlagPattern {
  type: RedFlagType;
  patterns: RegExp[];
  severity: RedFlagSeverity;
  coachingHint: string;
}

/**
 * Red flag detection patterns (German language)
 *
 * These patterns are designed to catch common psychological barriers
 * and unrealistic expectations that founders often express.
 */
const RED_FLAG_PATTERNS: RedFlagPattern[] = [
  // Imposter Syndrome
  {
    type: 'imposterSyndrome',
    patterns: [
      /härteste[rn]? kritiker/i,
      /nicht gut genug/i,
      /wer bin ich (schon|denn)/i,
      /andere (sind|können) (das )?besser/i,
      /ich kann das (eigentlich )?nicht/i,
      /ich (bin|fühle mich) (nicht )?qualifiziert/i,
      /ich habe (keine |nicht genug )?ahnung/i,
      /ich bin (nur|bloß) ein/i,
      /warum sollte jemand (bei mir|von mir)/i,
    ],
    severity: 'major',
    coachingHint:
      'Selbstzweifel erkannt. Nutze CBC: Welche Beweise gibt es für diese Überzeugung? ' +
      'Was würde ein Freund/Mentor dazu sagen? Fokus auf konkrete vergangene Erfolge.',
  },

  // Unrealistic Expectations
  {
    type: 'unrealisticExpectations',
    patterns: [
      /alle (kunden|leute|menschen) (werden|wollen)/i,
      /jede[rn]? (wird|will)/i,
      /sofort (ausgebucht|voll|reich)/i,
      /in (\d+ )?(woche|monat) (bin ich|werde ich|läuft es)/i,
      /kein(e)? konkurrenz/i,
      /niemand (macht|bietet) das/i,
      /100(\s)?prozent/i,
      /garantiert (erfolgreich|klappt)/i,
      /kann (gar )?nicht (schief|falsch)/i,
    ],
    severity: 'major',
    coachingHint:
      'Unrealistische Erwartungen erkannt. Sanft hinterfragen: ' +
      '"Was müsste passieren, damit X eintritt?" ' +
      '"Wie haben ähnliche Gründer das erreicht?" Konkrete Zahlen und Zeitrahmen erfragen.',
  },

  // Insufficient Capital
  {
    type: 'insufficientCapital',
    patterns: [
      /kaum (erspart|kapital|geld)/i,
      /kein eigenkapital/i,
      /null (euro|€|budget)/i,
      /alles (auf pump|geliehen|kredit)/i,
      /(letztes|alles) geld/i,
      /pleite (wenn|falls)/i,
      /kann mir (das )?nicht leisten/i,
    ],
    severity: 'critical',
    coachingHint:
      'Kapitalmangel erkannt. Wichtig: GZ-Betrag berechnen, realistische Anlaufphase planen, ' +
      'Nebeneinkommen-Optionen besprechen. NICHT urteilen, sondern Optionen aufzeigen.',
  },

  // External Locus of Control
  {
    type: 'externalLocusOfControl',
    patterns: [
      /pech gehabt/i,
      /außerhalb meiner kontrolle/i,
      /kann ich nichts (machen|tun|ändern)/i,
      /liegt nicht an mir/i,
      /(andere|die) (sind |haben )schuld/i,
      /das (schicksal|universum|leben)/i,
      /wenn (die wirtschaft|der markt|corona)/i,
      /ich (hatte|habe) (kein )?glück/i,
    ],
    severity: 'major',
    coachingHint:
      'Externe Kontrollüberzeugung erkannt. Fokus auf Eigenverantwortung: ' +
      '"Was könntest DU beim nächsten Mal anders machen?" ' +
      '"Welchen Teil dieser Situation kannst du beeinflussen?"',
  },

  // Financial Anxiety
  {
    type: 'financialAnxiety',
    patterns: [
      /angst vor (zahlen|finanzen|geld)/i,
      /zahlen (sind |liegen mir )nicht/i,
      /finanzen (überfordern|stressen)/i,
      /buchhaltung (hasse|mag nicht)/i,
      /mathe (war nie|konnte ich nie)/i,
      /rechnen (kann|konnte) ich nie/i,
      /finanz(en|ielle) (ängst|sorgen)/i,
    ],
    severity: 'minor',
    coachingHint:
      'Finanzielle Unsicherheit erkannt. Beruhigen: "Die Finanzplanung machen wir ' +
      'Schritt für Schritt zusammen. Du musst kein BWL-Studium haben." ' +
      'Einfache Tools und Vorlagen anbieten.',
  },

  // Time Scarcity
  {
    type: 'timeScarcity',
    patterns: [
      /keine zeit/i,
      /zu wenig zeit/i,
      /(zwischen|neben) (arbeit|job|beruf)/i,
      /nur (abends|wochenende|manchmal)/i,
      /familie (kommt|geht) vor/i,
      /zeit (ist |wird )knapp/i,
      /schaffe (das )?nicht/i,
    ],
    severity: 'minor',
    coachingHint:
      'Zeitmangel erkannt. Realistische Erwartungen setzen: ' +
      '"Mit 10h/Woche dauert der Aufbau länger - ist das okay für dich?" ' +
      'Priorisierung und Zeitmanagement-Strategien besprechen.',
  },

  // Lack of Commitment
  {
    type: 'lackOfCommitment',
    patterns: [
      /(mal |erstmal )?probieren/i,
      /schauen (ob|was)/i,
      /vielleicht (klappt|funktioniert)/i,
      /wenn (es |das )nicht (klappt|funktioniert)/i,
      /plan b/i,
      /nebenbei (laufen|machen)/i,
      /nicht (so )?ernst/i,
      /hobby (das |zum )?beruf/i,
    ],
    severity: 'minor',
    coachingHint:
      'Unentschlossenheit erkannt. Stage-Modell prüfen: Ist Gründung wirklich das Ziel? ' +
      '"Was müsste passieren, damit du sagst: Ja, ich mache das wirklich?"',
  },

  // Market Blindness
  {
    type: 'marketBlindness',
    patterns: [
      /brauche (keine |nicht )recherche/i,
      /ich (kenne|weiß) (den )?markt/i,
      /konkurrenz (ist |mir )egal/i,
      /meine idee ist einzigartig/i,
      /das gibt es (noch )?nicht/i,
      /alle (wollen|brauchen) das/i,
    ],
    severity: 'major',
    coachingHint:
      'Marktblindheit erkannt. Sanft konfrontieren: ' +
      '"Hast du schon mit potenziellen Kunden gesprochen?" ' +
      '"Wie lösen Menschen dieses Problem heute?" Marktvalidierung betonen.',
  },

  // Isolation Tendency
  {
    type: 'isolationTendency',
    patterns: [
      /alleine (machen|schaffen)/i,
      /brauche (niemand|keine hilfe)/i,
      /kenne (niemand|keinen) in/i,
      /kein(e)? kontakte/i,
      /netzwerk(en)? (liegt mir nicht|ist nicht mein)/i,
      /lieber alleine/i,
    ],
    severity: 'minor',
    coachingHint:
      'Isolationstendenz erkannt. Netzwerk-Wichtigkeit betonen: ' +
      '"Gründen ist ein Teamsport. Wer könnte dich unterstützen?" ' +
      'Mentoren, Gründerzentren, IHK-Angebote erwähnen.',
  },
];

/**
 * Detect red flags in a single text message
 */
export function detectRedFlags(text: string): RedFlag[] {
  const detected: RedFlag[] = [];
  const now = Date.now();

  for (const pattern of RED_FLAG_PATTERNS) {
    for (const regex of pattern.patterns) {
      const match = text.match(regex);
      if (match) {
        // Check if we already have this type from this text (avoid duplicates)
        if (!detected.some((d) => d.type === pattern.type)) {
          detected.push({
            type: pattern.type,
            severity: pattern.severity,
            trigger: match[0],
            triggerContext: extractContext(text, match.index || 0, 50),
            coachingHint: pattern.coachingHint,
            detectedAt: now,
          });

          console.log(
            `[RedFlagDetector] Detected: ${pattern.type} (${pattern.severity}) - "${match[0]}"`
          );
        }
        break; // Only need one match per pattern type per text
      }
    }
  }

  return detected;
}

/**
 * Extract surrounding context for a match
 */
function extractContext(text: string, matchIndex: number, contextLength: number): string {
  const start = Math.max(0, matchIndex - contextLength);
  const end = Math.min(text.length, matchIndex + contextLength);

  let context = text.slice(start, end);

  if (start > 0) context = '...' + context;
  if (end < text.length) context = context + '...';

  return context;
}

/**
 * Aggregate red flags from multiple messages
 * Deduplicates by type and keeps most recent
 */
export function aggregateRedFlags(
  messages: Array<{ role: string; content: string }>
): RedFlag[] {
  const allFlags: RedFlag[] = [];

  // Only analyze user messages
  for (const message of messages) {
    if (message.role === 'user') {
      const flags = detectRedFlags(message.content);
      allFlags.push(...flags);
    }
  }

  // Deduplicate by type, keeping most recent
  const flagMap = new Map<RedFlagType, RedFlag>();
  for (const flag of allFlags) {
    const existing = flagMap.get(flag.type);
    if (!existing || flag.detectedAt > existing.detectedAt) {
      flagMap.set(flag.type, flag);
    }
  }

  // Sort by severity (critical > major > minor) then by time
  return Array.from(flagMap.values()).sort((a, b) => {
    const severityOrder: Record<RedFlagSeverity, number> = {
      critical: 3,
      major: 2,
      minor: 1,
    };
    const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
    if (severityDiff !== 0) return severityDiff;
    return b.detectedAt - a.detectedAt;
  });
}

/**
 * Get human-readable label for red flag type (German)
 */
export function getRedFlagLabel(type: RedFlagType): string {
  const labels: Record<RedFlagType, string> = {
    imposterSyndrome: 'Selbstzweifel',
    unrealisticExpectations: 'Unrealistische Erwartungen',
    insufficientCapital: 'Kapitalmangel',
    externalLocusOfControl: 'Externe Kontrollüberzeugung',
    financialAnxiety: 'Finanzielle Unsicherheit',
    timeScarcity: 'Zeitmangel',
    lackOfCommitment: 'Unentschlossenheit',
    marketBlindness: 'Marktblindheit',
    isolationTendency: 'Isolationstendenz',
  };

  return labels[type] || type;
}

/**
 * Get color class for severity
 */
export function getRedFlagSeverityColor(severity: RedFlagSeverity): string {
  const colors: Record<RedFlagSeverity, string> = {
    minor: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    major: 'text-orange-600 bg-orange-50 border-orange-200',
    critical: 'text-red-600 bg-red-50 border-red-200',
  };

  return colors[severity];
}
