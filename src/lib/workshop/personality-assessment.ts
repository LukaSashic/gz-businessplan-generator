/**
 * Enhanced Personality Assessment with 3-Option Scenarios
 *
 * Presents business-specific scenarios with 3 concrete options (A, B, C)
 * Each option maps to high/medium/low score
 */

import type { PersonalityLevel, PartialIntakeOutput } from '@/types/modules/intake';

export type PersonalityDimension =
  | 'innovativeness'
  | 'riskTaking'
  | 'achievement'
  | 'proactiveness'
  | 'locusOfControl'
  | 'selfEfficacy'
  | 'autonomy';

export interface ScenarioOption {
  id: 'A' | 'B' | 'C';
  label: string;
  description: string;
  score: PersonalityLevel;
  followUp?: string; // Optional clarifying question
}

export interface PersonalityScenario {
  dimension: PersonalityDimension;
  question: string;
  context: string;
  options: [ScenarioOption, ScenarioOption, ScenarioOption];
}

export interface ScenarioResponse {
  dimension: PersonalityDimension;
  selectedOption: ScenarioOption;
  followUpAnswer?: string;
}

/**
 * German labels for personality dimensions
 */
export const DIMENSION_LABELS_DE: Record<PersonalityDimension, string> = {
  innovativeness: 'Innovationsfreude',
  riskTaking: 'Risikobereitschaft',
  achievement: 'Leistungsmotivation',
  proactiveness: 'Proaktivität',
  locusOfControl: 'Eigenverantwortung',
  selfEfficacy: 'Selbstwirksamkeit',
  autonomy: 'Autonomiestreben'
};

/**
 * Base scenario templates that can be customized with business context
 */
const SCENARIO_TEMPLATES: Record<PersonalityDimension, {
  questionTemplate: string;
  options: [
    { label: string; descriptionTemplate: string; score: PersonalityLevel; followUp?: string },
    { label: string; descriptionTemplate: string; score: PersonalityLevel; followUp?: string },
    { label: string; descriptionTemplate: string; score: PersonalityLevel; followUp?: string }
  ];
}> = {
  innovativeness: {
    questionTemplate: 'Ein Konkurrent in deiner Region bietet auch {solution} an, aber nutzt moderne Buchungs-Apps und hat eine schickere Website. Eine potenzielle Kundin fragt: "Warum sollte ich zu dir kommen?" Was machst du?',
    options: [
      {
        label: 'Mein Angebot anpassen',
        descriptionTemplate: 'Ich schaue mir an, was die anders machen und überlege, ob ich auch eine App nutzen sollte oder mein Angebot modernisieren kann',
        score: 'high',
        followUp: 'Was würdest du konkret übernehmen oder anders machen?'
      },
      {
        label: 'Meinen eigenen Stil betonen',
        descriptionTemplate: 'Ich erkläre, was mich besonders macht - meine persönliche Art, meine Erfahrung - ohne mein Konzept grundlegend zu ändern',
        score: 'medium'
      },
      {
        label: 'Mit Preis konkurrieren',
        descriptionTemplate: 'Ich biete einen besseren Preis an, damit die Kundin trotz fehlender App-Buchung zu mir kommt',
        score: 'low',
        followUp: 'Wie viel günstiger würdest du gehen?'
      }
    ]
  },

  riskTaking: {
    questionTemplate: 'Du hast die Chance auf einen Großkunden (z.B. regelmäßige Aufträge von einem größeren Unternehmen). Allerdings musst du erst 2-3 Monate investieren (Zeit, Material) ohne Garantie, dass es klappt. Wie gehst du vor?',
    options: [
      {
        label: 'Voll einsteigen',
        descriptionTemplate: 'Das ist eine riesige Chance! Ich investiere die 2-3 Monate, auch wenn es knapp wird. Risiko gehört dazu.',
        score: 'high'
      },
      {
        label: 'Verhandeln & testen',
        descriptionTemplate: 'Ich schlage einen Probezeitraum vor - so sehen beide Seiten, ob es passt. Danach entscheiden wir gemeinsam.',
        score: 'medium'
      },
      {
        label: 'Absagen',
        descriptionTemplate: '2-3 Monate ohne Einnahmen kann ich mir nicht leisten. Ich fokussiere mich lieber auf sichere Kunden.',
        score: 'low'
      }
    ]
  },

  achievement: {
    questionTemplate: 'Stell dir vor, dein Geschäft läuft seit 2 Jahren. Woran merkst du: "Ja, ich habe es geschafft - das war\'s wert!"?',
    options: [
      {
        label: 'Wachstum & Expansion',
        descriptionTemplate: 'Ich habe 50+ Stammkunden, einen vollen Terminkalender und überlege, jemanden einzustellen',
        score: 'high'
      },
      {
        label: 'Stabile Zufriedenheit',
        descriptionTemplate: 'Ich verdiene gut, habe 20-30 Stammkunden die mich weiterempfehlen, und kann mir meine Zeit frei einteilen',
        score: 'medium'
      },
      {
        label: 'Work-Life-Balance',
        descriptionTemplate: 'Ich muss nicht mehr Vollzeit arbeiten, habe genug zum Leben und kann mich um andere wichtige Dinge kümmern',
        score: 'low'
      }
    ]
  },

  proactiveness: {
    questionTemplate: 'Du hast gerade 5 feste Kunden. Wie gewinnst du die nächsten 10 Kunden?',
    options: [
      {
        label: 'Aktiv auf Akquise gehen',
        descriptionTemplate: 'Ich kontaktiere gezielt potenzielle Kunden, poste regelmäßig auf Social Media und gehe zu Networking-Events',
        score: 'high'
      },
      {
        label: 'Mix aus beidem',
        descriptionTemplate: 'Ich bitte meine 5 Kunden um Weiterempfehlung und mache parallel etwas Werbung (Flyer, Google Maps Eintrag)',
        score: 'medium'
      },
      {
        label: 'Auf Mundpropaganda setzen',
        descriptionTemplate: 'Wenn ich gute Arbeit mache, empfehlen mich die 5 Kunden automatisch weiter. Ich warte erstmal ab.',
        score: 'low'
      }
    ]
  },

  locusOfControl: {
    questionTemplate: 'Dein erster Monat läuft schlecht - nur 8 Kunden statt geplante 20. Deine Gewinnmarge ist viel niedriger als kalkuliert. Wie erklärst du dir das?',
    options: [
      {
        label: 'Eigene Fehler analysieren',
        descriptionTemplate: 'Ich habe vermutlich zu wenig Marketing gemacht oder meine Preise falsch kalkuliert. Ich schaue, was ICH ändern kann.',
        score: 'high'
      },
      {
        label: 'Mix aus beidem',
        descriptionTemplate: 'Der Markt ist vielleicht schwieriger als gedacht, ABER ich hätte auch früher mit Werbung starten können.',
        score: 'medium'
      },
      {
        label: 'Externe Faktoren',
        descriptionTemplate: 'Schlechtes Timing - vielleicht Ferienzeit, oder die Leute sind gerade knapp bei Kasse. Ich kann da wenig machen.',
        score: 'low'
      }
    ]
  },

  selfEfficacy: {
    questionTemplate: 'Ein Kunde fragt nach einer Leistung, die du zuletzt vor 3 Jahren gemacht hast. Er erwartet das Ergebnis in 2 Wochen. Wie reagierst du?',
    options: [
      {
        label: 'Zusage & lernen',
        descriptionTemplate: 'Ich sage zu und frische mein Wissen auf - YouTube, Kollegen fragen, üben. Ich schaffe das!',
        score: 'high'
      },
      {
        label: 'Vorsichtige Zusage',
        descriptionTemplate: 'Ich sage: "Ich mache das gerne, aber lass uns vorher ein Beratungsgespräch machen, damit das Ergebnis perfekt wird"',
        score: 'medium'
      },
      {
        label: 'Ehrliche Absage',
        descriptionTemplate: 'Ich sage ehrlich, dass das nicht meine Stärke ist und empfehle jemanden, der das besser kann',
        score: 'low'
      }
    ]
  },

  autonomy: {
    questionTemplate: 'Ein Berater sagt dir: "Dein Konzept ist zu nischig. Biete auch klassischere Leistungen an und denk über einen festen Standort nach." Er zeigt dir überzeugende Statistiken. Dein Herzensthema ist aber genau DEIN Konzept. Was machst du?',
    options: [
      {
        label: 'An Vision festhalten',
        descriptionTemplate: 'Ich bleibe bei meinem Konzept. Ich suche mir andere Berater oder Beispiele von erfolgreichen Gründern in meiner Nische. Es ist MEINE Firma.',
        score: 'high'
      },
      {
        label: 'Kompromiss suchen',
        descriptionTemplate: 'Ich prüfe seine Argumente, aber überlege einen Kompromiss: z.B. mein Kernkonzept MIT einem klassischen Zusatzangebot',
        score: 'medium'
      },
      {
        label: 'Rat befolgen',
        descriptionTemplate: 'Der Berater hat Erfahrung. Wenn die Statistiken das sagen, sollte ich meinen Plan überdenken.',
        score: 'low'
      }
    ]
  }
};

/**
 * Generate a personalized scenario based on business context
 */
export function generatePersonalityScenario(
  dimension: PersonalityDimension,
  businessIdea?: PartialIntakeOutput['businessIdea']
): PersonalityScenario {
  const template = SCENARIO_TEMPLATES[dimension];

  // Default context if no business idea provided
  const defaultSolution = 'deine Dienstleistung';
  const solution = businessIdea?.solution?.toLowerCase() || defaultSolution;
  const elevatorPitch = businessIdea?.elevator_pitch || 'Dein Geschäft';

  // Replace template placeholders with actual business context
  const question = template.questionTemplate
    .replace('{solution}', solution)
    .replace('{elevator_pitch}', elevatorPitch);

  const options: [ScenarioOption, ScenarioOption, ScenarioOption] = template.options.map((opt, index) => ({
    id: ['A', 'B', 'C'][index] as 'A' | 'B' | 'C',
    label: opt.label,
    description: opt.descriptionTemplate
      .replace('{solution}', solution),
    score: opt.score,
    followUp: opt.followUp
  })) as [ScenarioOption, ScenarioOption, ScenarioOption];

  return {
    dimension,
    question,
    context: elevatorPitch,
    options
  };
}

/**
 * Get all scenarios for personality assessment
 */
export function getAllPersonalityScenarios(
  businessIdea?: PartialIntakeOutput['businessIdea']
): PersonalityScenario[] {
  const dimensions: PersonalityDimension[] = [
    'innovativeness',
    'riskTaking',
    'achievement',
    'proactiveness',
    'locusOfControl',
    'selfEfficacy',
    'autonomy'
  ];

  return dimensions.map(dim => generatePersonalityScenario(dim, businessIdea));
}

/**
 * Score personality assessment from responses
 */
export function scorePersonalityAssessment(
  responses: ScenarioResponse[]
): Record<PersonalityDimension, PersonalityLevel> {
  const scores: Partial<Record<PersonalityDimension, PersonalityLevel>> = {};

  for (const response of responses) {
    scores[response.dimension] = response.selectedOption.score;
  }

  // Return with defaults for any missing dimensions
  return {
    innovativeness: scores.innovativeness || 'medium',
    riskTaking: scores.riskTaking || 'medium',
    achievement: scores.achievement || 'medium',
    proactiveness: scores.proactiveness || 'medium',
    locusOfControl: scores.locusOfControl || 'medium',
    selfEfficacy: scores.selfEfficacy || 'medium',
    autonomy: scores.autonomy || 'medium'
  };
}

/**
 * Get personality archetype based on scores
 */
export function getPersonalityArchetype(
  scores: Record<PersonalityDimension, PersonalityLevel>
): string {
  const { achievement, autonomy, riskTaking, proactiveness, innovativeness, locusOfControl, selfEfficacy } = scores;

  // High achievement + High autonomy = Driven achiever
  if (achievement === 'high' && autonomy === 'high') {
    return 'Selbstbestimmte Macherin';
  }

  // Low risk + High proactiveness = Careful planner
  if (riskTaking === 'low' && proactiveness === 'high') {
    return 'Vorsichtige Planerin';
  }

  // High achievement + Medium risk = Ambitious realist
  if (achievement === 'high' && riskTaking === 'medium') {
    return 'Ambitionierte Realistin';
  }

  // High innovativeness + High autonomy = Creative pioneer
  if (innovativeness === 'high' && autonomy === 'high') {
    return 'Kreative Pionierin';
  }

  // High self-efficacy + High locusOfControl = Confident leader
  if (selfEfficacy === 'high' && locusOfControl === 'high') {
    return 'Selbstbewusste Unternehmerin';
  }

  // High proactiveness + High achievement = Action-oriented achiever
  if (proactiveness === 'high' && achievement === 'high') {
    return 'Handlungsorientierte Leistungsträgerin';
  }

  // Default
  return 'Engagierte Gründerin';
}

/**
 * Get strength interpretation based on high scores
 */
function getStrengthInterpretation(strengths: string[]): string {
  if (strengths.includes('Leistungsmotivation') && strengths.includes('Proaktivität')) {
    return 'anpackst statt abwartest und hohe Ziele verfolgst';
  }
  if (strengths.includes('Eigenverantwortung') && strengths.includes('Autonomiestreben')) {
    return 'Verantwortung übernimmst und selbstbestimmt arbeiten willst';
  }
  if (strengths.includes('Innovationsfreude')) {
    return 'offen für neue Wege bist und dich vom Wettbewerb abheben willst';
  }
  if (strengths.includes('Selbstwirksamkeit')) {
    return 'an deine Fähigkeiten glaubst und neue Herausforderungen annimmst';
  }

  return 'die richtigen Voraussetzungen für erfolgreiches Unternehmertum mitbringst';
}

/**
 * Get reassurance for development areas (low scores)
 */
function getGapReassurance(gaps: string[]): string {
  if (gaps.includes('Risikobereitschaft')) {
    return 'vorsichtige Planung schützt dich vor Fehlentscheidungen und ist ein Zeichen von unternehmerischer Reife';
  }
  if (gaps.includes('Selbstwirksamkeit')) {
    return 'das wächst mit jedem Erfolg, den du als Selbstständige feierst - die ersten Kunden werden das ändern';
  }
  if (gaps.includes('Proaktivität')) {
    return 'qualitativ hochwertige Arbeit sorgt für natürliche Weiterempfehlungen - nicht jeder muss aggressiv verkaufen';
  }
  if (gaps.includes('Innovationsfreude')) {
    return 'bewährte Methoden haben ihre Berechtigung - nicht jedes Geschäft muss innovativ sein';
  }

  return 'niemand ist in allen Bereichen perfekt - erfolgreiche Unternehmer kennen ihre Stärken und arbeiten mit ihnen';
}

/**
 * Generate personality narrative from scores
 */
export function generatePersonalityNarrative(
  scores: Record<PersonalityDimension, PersonalityLevel>
): string {
  const archetype = getPersonalityArchetype(scores);

  // Identify strengths (high scores)
  const strengths = Object.entries(scores)
    .filter(([, value]) => value === 'high')
    .map(([key]) => DIMENSION_LABELS_DE[key as PersonalityDimension]);

  // Identify development areas (low scores)
  const gaps = Object.entries(scores)
    .filter(([, value]) => value === 'low')
    .map(([key]) => DIMENSION_LABELS_DE[key as PersonalityDimension]);

  let narrative = `Du bist eine **${archetype}**.`;

  if (strengths.length > 0) {
    narrative += `\n\nDeine unternehmerischen Stärken liegen in: **${strengths.join(', ')}**.`;
    narrative += ` Das zeigt, dass du ${getStrengthInterpretation(strengths)} - wichtige Eigenschaften für dein Geschäft.`;
  }

  if (gaps.length > 0) {
    narrative += `\n\nEntwicklungsfelder: ${gaps.join(', ')}.`;
    narrative += ` Das ist völlig normal - ${getGapReassurance(gaps)}.`;
  } else if (strengths.length < 7) {
    narrative += `\n\nDu zeigst ein ausgewogenes unternehmerisches Profil mit einer guten Mischung aus verschiedenen Kompetenzen.`;
  }

  // BA relevance
  narrative += `\n\n**Für die Bundesagentur:** Dieses Profil zeigt, dass du die unternehmerische Reife und Selbstreflexion für eine erfolgreiche Gründung mitbringst.`;

  return narrative;
}

/**
 * Get business relevance explanation for a dimension score
 */
export function getBusinessRelevance(
  dimension: PersonalityDimension,
  score: PersonalityLevel
): string {
  const relevanceMap: Record<PersonalityDimension, Record<PersonalityLevel, string>> = {
    innovativeness: {
      high: 'Wichtig für Differenzierung im Wettbewerb',
      medium: 'Ausgewogene Balance zwischen Bewährtem und Neuem',
      low: 'Fokus auf bewährte Qualität statt Experimente'
    },
    riskTaking: {
      high: 'Bereit für große Investitionen und schnelles Wachstum',
      medium: 'Kalkulierte Risiken, solide Absicherung',
      low: 'Vorsichtiger Aufbau minimiert Verlustrisiko'
    },
    achievement: {
      high: 'Starker Wachstumsdrang, hohe Ziele',
      medium: 'Realistische Ziele mit Raum für Steigerung',
      low: 'Work-Life-Balance im Vordergrund'
    },
    proactiveness: {
      high: 'Aktive Akquise, schnelle Marktdurchdringung',
      medium: 'Mix aus aktivem Marketing und Empfehlungen',
      low: 'Qualität spricht für sich, Mundpropaganda'
    },
    locusOfControl: {
      high: 'Übernimmt Verantwortung, lernt aus Fehlern',
      medium: 'Balanciert eigene und externe Faktoren',
      low: 'Fokus auf externe Einflüsse'
    },
    selfEfficacy: {
      high: 'Traut sich neue Herausforderungen zu',
      medium: 'Wächst mit Erfahrung',
      low: 'Bleibt im vertrauten Bereich'
    },
    autonomy: {
      high: 'Unabhängigkeit ist Hauptmotivation',
      medium: 'Offen für Rat, trifft eigene Entscheidungen',
      low: 'Schätzt externe Anleitung und Strukturen'
    }
  };

  return relevanceMap[dimension]?.[score] || '';
}
