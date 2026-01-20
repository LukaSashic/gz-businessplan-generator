/**
 * Module 8: SWOT Analysis Prompt System (GZ-701)
 *
 * SWOT analysis module ensuring balanced strengths/weaknesses assessment
 * with cross-module consistency checks and coaching for realistic planning.
 *
 * Coaching Approach:
 * - Balance assessment (not only positives OR negatives)
 * - Cross-reference validation with previous modules
 * - Socratic questioning for over-optimistic users
 * - Appreciative Inquiry for over-pessimistic users
 * - Strategic implications through TOWS matrix
 */

import {
  SWOTPhase,
  PartialSWOTOutput,
  calculateSWOTCompletion,
  assessSWOTBalance,
  getBalanceIntervention,
  SWOTPhaseInfo,
  BalanceLevel,
} from '@/types/modules/swot';

// ============================================================================
// Core Module Configuration
// ============================================================================

export const SWOT_MODULE_CONFIG = {
  moduleId: 'swot',
  title: 'SWOT-Analyse',
  description: 'Strategische Stärken-Schwächen-Chancen-Risiken Analyse',
  estimatedDuration: 45, // minutes
  phases: [
    'intro',
    'staerken',
    'schwaechen',
    'chancen',
    'risiken',
    'strategien',
    'validierung'
  ] as SWOTPhase[],

  coachingApproach: {
    primary: 'Balanced_Assessment', // Balance zwischen positiv und negativ
    secondary: 'Cross_Reference', // Konsistenz mit vorherigen Modulen
    tertiary: 'Socratic', // Hinterfragung unrealistischer Einschätzungen
    depth: 'medium' as const,
    focusAreas: [
      'realistic_assessment',
      'balance_maintenance',
      'cross_module_consistency',
      'strategic_thinking'
    ]
  }
};

// ============================================================================
// Phase Detection Patterns
// ============================================================================

export const SWOT_PHASE_PATTERNS = {
  intro: {
    triggers: [
      /swot.*analyse/i,
      /stärken.*schwächen/i,
      /chancen.*risiken/i,
      /strategische.*analyse/i,
      /potentiale.*bewerten/i
    ],
    indicators: [
      /wo stehe ich/i,
      /was kann ich/i,
      /welche möglichkeiten/i,
      /was sind.*risiken/i
    ]
  },

  staerken: {
    triggers: [
      /stärken.*identifizieren/i,
      /was.*gut/i,
      /kompetenzen/i,
      /fähigkeiten/i,
      /vorteile/i,
      /erfolge/i
    ],
    indicators: [
      /kann.*besonders/i,
      /bin.*stark/i,
      /erfolgreich.*bei/i,
      /überdurchschnittlich/i
    ]
  },

  schwaechen: {
    triggers: [
      /schwächen.*analysieren/i,
      /verbesserung.*bedarf/i,
      /defizite/i,
      /lücken/i,
      /probleme/i,
      /herausforderungen/i
    ],
    indicators: [
      /schwer.*fällt/i,
      /nicht.*gut/i,
      /mangel.*an/i,
      /müsste.*lernen/i
    ]
  },

  chancen: {
    triggers: [
      /chancen.*erkennen/i,
      /möglichkeiten/i,
      /potentiale/i,
      /trends/i,
      /wachstum/i,
      /entwicklung/i
    ],
    indicators: [
      /könnte.*profitieren/i,
      /markt.*entwickelt/i,
      /nachfrage.*steigt/i,
      /neue.*möglichkeiten/i
    ]
  },

  risiken: {
    triggers: [
      /risiken.*bewerten/i,
      /gefahren/i,
      /bedrohungen/i,
      /was.*schiefgehen/i,
      /probleme.*auftreten/i,
      /worst.*case/i
    ],
    indicators: [
      /sorge.*macht/i,
      /angst.*vor/i,
      /könnte.*problematisch/i,
      /gefahr.*besteht/i
    ]
  }
};

// ============================================================================
// Balance Assessment and Interventions
// ============================================================================

export const BALANCE_INTERVENTIONS = {
  over_optimistic: {
    socratic_questions: [
      "Das ist sehr positiv! Lassen Sie uns ehrlich schauen: Was könnte in den nächsten 12 Monaten wirklich schiefgehen?",
      "Bei all diesen Stärken - wo könnten Sie an Grenzen stoßen?",
      "Welche Schwächen könnten Ihnen Probleme bereiten, auch wenn Sie sie nicht gerne zugeben?",
      "Was würde Sie nachts wachhalten, wenn Sie ehrlich sind?",
      "Wenn ein enger Freund Sie nach Ihren größten Herausforderungen fragen würde - was würden Sie sagen?"
    ],
    reality_checks: [
      "Ich schätze Ihren Optimismus! Gleichzeitig ist es wichtig, auch potenzielle Stolpersteine zu sehen.",
      "Eine realistische SWOT-Analyse hilft dabei, Überraschungen zu vermeiden.",
      "Lassen Sie uns sicherstellen, dass wir alle Aspekte betrachten - das macht Ihren Plan stärker, nicht schwächer."
    ]
  },

  over_pessimistic: {
    appreciative_questions: [
      "Sie sehen die Herausforderungen sehr klar - das ist wichtig! Lassen Sie uns auch Ihre Erfolge würdigen: Was haben Sie bisher gut gemeistert?",
      "Bei aller berechtigten Vorsicht - welche Stärken haben Sie, die andere anerkennen?",
      "Wenn Sie zurückblicken: Welche Hindernisse haben Sie bereits erfolgreich überwunden?",
      "Was können Sie heute besser als vor einem Jahr?",
      "Welche positiven Rückmeldungen haben Sie in letzter Zeit erhalten?"
    ],
    strength_anchoring: [
      "Ihre kritische Sicht zeigt, dass Sie Risiken ernst nehmen - das ist eine wichtige Führungskompetenz.",
      "Es ist klug, Herausforderungen zu antizipieren. Lassen Sie uns nun auch Ihre Ressourcen mobilisieren.",
      "Realistische Planung bedeutet, sowohl Risiken als auch Chancen zu sehen."
    ]
  },

  insufficient_data: {
    structure_prompts: [
      "Lassen Sie uns systematisch durch alle vier Quadranten gehen - das gibt Ihnen ein vollständiges Bild.",
      "Eine ausgewogene SWOT-Analyse ist wie eine strategische Landkarte für Ihr Unternehmen.",
      "Nehmen wir uns Zeit für jeden Bereich - das Investment lohnt sich für Ihre strategischen Entscheidungen."
    ]
  }
};

// ============================================================================
// Cross-Module Reference Questions
// ============================================================================

export const CROSS_MODULE_REFERENCES = {
  staerken: {
    gruenderperson: [
      "Sie hatten im Gründerperson-Modul [X] als Ihre Kernkompetenz genannt. Wie spiegelt sich das in Ihren Stärken wider?",
      "Ihre beruflichen Erfahrungen - sind das strategische Stärken für Ihr Unternehmen?"
    ],
    geschaeftsidee: [
      "Ihr USP war [X] - ist das eine organisationale Stärke oder eher eine Produktstärke?",
      "Wie gut passt Ihr Lösungsansatz zu Ihren persönlichen Stärken?"
    ],
    marketing: [
      "Sie hatten [Marketing-Kanal] als Ihren Hauptkanal identifiziert. Haben Sie dort besondere Stärken?",
      "Ihre Kundenbeziehungen - sind das strategische Assets?"
    ]
  },

  schwaechen: {
    organisation: [
      "Bei der Organisation hatten Sie [X] als Herausforderung gesehen. Ist das eine fundamentale Schwäche?",
      "Ihre Kapazitätsplanung - wo sehen Sie die größten Engpässe?"
    ],
    finanzplanung: [
      "In der Finanzplanung war [X] ein kritischer Punkt. Ist das eine strukturelle Schwäche?",
      "Wo sind Sie am abhängigsten von externen Faktoren?"
    ],
    marketing: [
      "Sie waren unsicher bei [Marketing-Aspekt]. Wie kritisch ist das für Ihren Erfolg?"
    ]
  },

  chancen: {
    markt_wettbewerb: [
      "Sie hatten den Markt als [Marktgröße] beschrieben. Welche konkreten Chancen sehen Sie dort?",
      "Bei der Wettbewerbsanalyse - welche Lücken könnten Sie nutzen?"
    ],
    geschaeftsidee: [
      "Ihr Problem-Lösung-Fit - welche zusätzlichen Anwendungsbereiche sind möglich?",
      "Könnte sich Ihre Zielgruppe erweitern?"
    ]
  },

  risiken: {
    markt_wettbewerb: [
      "Sie hatten [Wettbewerber] als Hauptkonkurrenz identifiziert. Was ist das größte Risiko dort?",
      "Welche Marktveränderungen könnten Ihr Modell gefährden?"
    ],
    finanzplanung: [
      "Ihre Liquiditätsplanung - wo sind die kritischsten Punkte?",
      "Was passiert, wenn Ihre Umsatzprognose um 30% daneben liegt?"
    ]
  }
};

// ============================================================================
// Question Clusters by Quadrant
// ============================================================================

export const SWOT_QUESTIONS = {
  staerken: {
    personal_strengths: [
      "Was können Sie außergewöhnlich gut?",
      "Welche Fähigkeiten heben Sie von anderen ab?",
      "Wofür erhalten Sie regelmäßig positive Rückmeldungen?",
      "Bei welchen Aufgaben sind Sie in Ihrem Element?"
    ],
    business_strengths: [
      "Was wird Ihr Unternehmen besser machen als die Konkurrenz?",
      "Welche einzigartigen Ressourcen haben Sie?",
      "Wo haben Sie bereits bewiesen, dass Sie erfolgreich sind?",
      "Welche Beziehungen und Netzwerke sind wertvolle Assets?"
    ],
    competitive_advantages: [
      "Was können andere nicht so leicht kopieren?",
      "Wo haben Sie einen natürlichen Vorsprung?",
      "Welche Ihrer Fähigkeiten sind in Ihrem Markt selten?",
      "Was würden Ihre Kunden als Ihren größten Vorteil beschreiben?"
    ]
  },

  schwaechen: {
    skill_gaps: [
      "Bei welchen Aufgaben fühlen Sie sich unsicher?",
      "Welche Fähigkeiten müssten Sie noch entwickeln?",
      "Wo sind Sie auf andere angewiesen?",
      "Was fällt Ihnen schwerer als anderen?"
    ],
    resource_limitations: [
      "Welche Ressourcen fehlen Ihnen aktuell?",
      "Wo sind Ihre finanziellen Grenzen spürbar?",
      "Bei welchen Investitionen müssen Sie Kompromisse machen?",
      "Welche Kapazitäten sind begrenzt?"
    ],
    organizational_challenges: [
      "Welche internen Prozesse funktionieren noch nicht optimal?",
      "Wo fehlt Ihnen noch die Struktur?",
      "Bei welchen Entscheidungen sind Sie noch unsicher?",
      "Welche Systeme müssten Sie noch aufbauen?"
    ]
  },

  chancen: {
    market_opportunities: [
      "Welche Markttrends spielen Ihnen in die Karten?",
      "Wo sehen Sie ungenutztes Potenzial?",
      "Welche Kundenbedürfnisse werden noch schlecht erfüllt?",
      "Welche technologischen Entwicklungen helfen Ihnen?"
    ],
    growth_potential: [
      "Wo könnten Sie schnell wachsen?",
      "Welche neuen Märkte könnten Sie erschließen?",
      "Welche Partnerschaften könnten entstehen?",
      "Wo könnten Sie Ihre Lösung erweitern?"
    ],
    external_support: [
      "Welche Fördermöglichkeiten gibt es für Sie?",
      "Wo finden Sie strategische Partner?",
      "Welche Netzwerke könnten Sie nutzen?",
      "Welche rechtlichen Änderungen helfen Ihnen?"
    ]
  },

  risiken: {
    competitive_threats: [
      "Welche Konkurrenten könnten Ihnen gefährlich werden?",
      "Was passiert, wenn große Player in Ihren Markt einsteigen?",
      "Wo könnten Sie durch neue Technologien überholt werden?",
      "Welche Preiskämpfe drohen?"
    ],
    market_risks: [
      "Welche Marktveränderungen würden Ihnen schaden?",
      "Was passiert bei einer Rezession?",
      "Wo sind Sie von regulatorischen Änderungen betroffen?",
      "Welche Kundengewohnheiten könnten sich ändern?"
    ],
    operational_risks: [
      "Wo sind Sie von Schlüsselpersonen abhängig?",
      "Welche Ausfälle würden Sie hart treffen?",
      "Bei welchen Lieferanten sind Sie verwundbar?",
      "Welche internen Probleme könnten eskalieren?"
    ]
  }
};

// ============================================================================
// Confidence Level Detection
// ============================================================================

export const CONFIDENCE_PATTERNS = {
  high_confidence: [
    /bin mir sicher/i,
    /weiß genau/i,
    /definitiv/i,
    /auf jeden fall/i,
    /zweifellos/i,
    /absolut/i
  ],
  low_confidence: [
    /bin unsicher/i,
    /weiß nicht/i,
    /vielleicht/i,
    /könnte sein/i,
    /vermutlich/i,
    /schwer zu sagen/i
  ],
  defensive_patterns: [
    /eigentlich.*gar nicht/i,
    /ist.*nicht.*so wichtig/i,
    /spielt.*keine rolle/i,
    /macht.*nichts/i
  ]
};

export function detectSWOTConfidence(message: string): 'high' | 'medium' | 'low' {
  const text = message.toLowerCase();

  const highScore = CONFIDENCE_PATTERNS.high_confidence.filter(pattern =>
    pattern.test(text)
  ).length;

  const lowScore = CONFIDENCE_PATTERNS.low_confidence.filter(pattern =>
    pattern.test(text)
  ).length + CONFIDENCE_PATTERNS.defensive_patterns.filter(pattern =>
    pattern.test(text)
  ).length;

  if (highScore > lowScore) return 'high';
  if (lowScore > highScore) return 'low';
  return 'medium';
}

// ============================================================================
// Coaching Response Templates
// ============================================================================

export const COACHING_RESPONSES = {
  staerken: {
    validation: [
      "Das ist eine wichtige Stärke! Können Sie das mit einem konkreten Beispiel belegen?",
      "Sehr gut. Wie können Sie diese Stärke strategisch nutzen?",
      "Das klingt wie ein echter Wettbewerbsvorteil. Wie schwer ist das für andere zu kopieren?"
    ],
    deeper_exploration: [
      "Was genau macht Sie bei [Stärke] so gut?",
      "Woher wissen Sie, dass das wirklich eine Stärke ist?",
      "Wie könnten Sie diese Stärke noch weiter ausbauen?"
    ]
  },

  schwaechen: {
    normalization: [
      "Es ist klug, diese Herausforderung zu erkennen. Das zeigt strategisches Denken.",
      "Jeder erfolgreiche Unternehmer hat Bereiche, die er noch entwickeln muss.",
      "Ehrlichkeit bei Schwächen ist der erste Schritt zur Verbesserung."
    ],
    solution_focus: [
      "Wie könnten Sie mit dieser Schwäche umgehen?",
      "Welche Optionen haben Sie, um das zu kompensieren?",
      "Ist das etwas, was Sie lernen können, oder sollten Sie es delegieren?"
    ]
  },

  chancen: {
    reality_check: [
      "Das ist eine interessante Chance! Wie realistisch ist es, dass Sie sie nutzen können?",
      "Was müsste passieren, damit Sie diese Chance greifen können?",
      "Welche Voraussetzungen bringen Sie mit, um das zu schaffen?"
    ],
    prioritization: [
      "Von allen Chancen - welche ist die vielversprechendste?",
      "Welche Chancen passen am besten zu Ihren Stärken?",
      "Wo würde eine kleine Investition große Wirkung erzielen?"
    ]
  },

  risiken: {
    mitigation_focus: [
      "Ein wichtiges Risiko. Wie könnten Sie sich dagegen absichern?",
      "Was wäre Ihr Plan B, falls das eintritt?",
      "Welche Frühwarnsignale könnten Sie beobachten?"
    ],
    perspective: [
      "Wie wahrscheinlich ist es, dass dieses Risiko wirklich eintritt?",
      "Wäre das ein existenzielles Problem oder nur ein Rückschlag?",
      "Haben andere in Ihrer Branche ähnliche Risiken gemeistert?"
    ]
  }
};

// ============================================================================
// Main Module Function
// ============================================================================

export function buildSWOTPrompt(
  currentPhase: SWOTPhase,
  existingData: PartialSWOTOutput,
  userMessage: string,
  conversationHistory: Array<{role: string, content: string}>,
  previousModulesData?: any
): string {
  const phaseInfo = SWOTPhaseInfo[currentPhase];
  const completion = calculateSWOTCompletion(existingData);
  const balance = assessSWOTBalance(existingData);
  const confidence = detectSWOTConfidence(userMessage);
  const balanceIntervention = getBalanceIntervention(balance);

  const prompt = `# Module 8: SWOT-Analyse - ${phaseInfo.label}

## Coaching Kontext
Du führst durch die **SWOT-Analyse** mit Fokus auf ausgewogene, realistische Bewertung und strategische Relevanz.

**Aktuelle Phase:** ${phaseInfo.label} (${currentPhase})
**Coaching-Tiefe:** ${phaseInfo.coachingDepth}
**Fortschritt:** ${completion}% abgeschlossen
**Balance-Level:** ${balance}
**Nutzer-Vertrauen:** ${confidence}

## Balance-Assessment & Interventionen

**Aktueller Balance-Status:** ${balance}

${balance !== 'balanced' ? `
**🎯 Balance-Intervention erforderlich:**
${balanceIntervention.map(intervention => `- ${intervention}`).join('\n')}
` : `
**✅ Gute Balance erreicht!** Weiter so mit realistischer Einschätzung.
`}

## Cross-Module Konsistenz-Check

${previousModulesData ? generateCrossModulePrompts(currentPhase, previousModulesData) : ''}

## Coaching-Prinzipien für SWOT

1. **Balance wahren** - Weder reine Schwarzmalerei noch unrealistischer Optimismus
2. **Evidenz einfordern** - Konkrete Beispiele für jede Einschätzung
3. **Strategische Relevanz** - Nur was wirklich geschäftsrelevant ist
4. **Cross-Validierung** - Konsistenz mit vorherigen Modulen prüfen
5. **Handlungsorientierung** - Nicht nur analysieren, sondern Schlüsse ziehen

## Phase-spezifische Leitfragen

### ${currentPhase.toUpperCase()}
${getPhaseQuestions(currentPhase)}

## Ausgabe-Format

Du MUSST in diesem exakten JSON-Format antworten:

\`\`\`json
{
  "response": "Deine empathische, ausgewogene Coaching-Antwort hier",
  "moduleData": {
    "${currentPhase}": {
      // Aktualisierte Daten für diese Phase
    },
    "balanceAssessment": {
      "overallBalance": "${balance}",
      "coachingRecommendations": ["Empfehlungen basierend auf Balance"]
    }
  },
  "coachingNotes": {
    "phase": "${currentPhase}",
    "balance": "${balance}",
    "interventions": ["Angewendete Coaching-Interventionen"],
    "crossModuleChecks": ["Konsistenz-Prüfungen mit vorherigen Modulen"],
    "nextSteps": ["Nächste Schritte für ausgewogene SWOT"]
  }
}
\`\`\`

## Aktuelle Situation

**Bestehende SWOT-Daten:**
${JSON.stringify(existingData, null, 2)}

**Nutzer-Nachricht:**
"${userMessage}"

${balance !== 'balanced' ? `

## ⚠️ Balance-Korrektur erforderlich

**Erkanntes Problem:** ${balance}
**Coaching-Strategie:** ${getBalanceStrategy(balance)}

Nutze die entsprechenden Fragen und Techniken, um die Balance zu verbessern.
` : ''}

Führe das SWOT-Coaching strukturiert und ausgewogen durch. Achte besonders auf realistische Einschätzungen und strategische Relevanz.`;

  return prompt;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getPhaseQuestions(phase: SWOTPhase): string {
  switch (phase) {
    case 'intro':
      return `
- "Haben Sie schon einmal eine SWOT-Analyse gemacht?"
- "Was erwarten Sie sich von dieser strategischen Bestandsaufnahme?"
- "Neigen Sie eher zu optimistischer oder kritischer Selbsteinschätzung?"`;

    case 'staerken':
      return `
- "Was können Sie außergewöhnlich gut?"
- "Welche Erfolge sind Sie besonders stolz darauf?"
- "Was würden Ihre besten Kunden als Ihre größte Stärke beschreiben?"
- "Wo haben Sie einen natürlichen Vorsprung vor der Konkurrenz?"`;

    case 'schwaechen':
      return `
- "Bei welchen Aufgaben stoßen Sie an Ihre Grenzen?"
- "Was müssten Sie noch lernen oder entwickeln?"
- "Wo sind Sie verletzbar oder abhängig von anderen?"
- "Welche Ihrer Einschätzungen könnten sich als zu optimistisch erweisen?"`;

    case 'chancen':
      return `
- "Welche Markttrends spielen Ihnen in die Karten?"
- "Wo sehen Sie ungenutztes Potenzial in Ihrem Umfeld?"
- "Welche neuen Möglichkeiten eröffnen sich durch aktuelle Entwicklungen?"
- "Wo könnten Sie von Ihren Stärken noch besser profitieren?"`;

    case 'risiken':
      return `
- "Was könnte in den nächsten 12 Monaten schiefgehen?"
- "Welche Entwicklungen würden Ihr Geschäftsmodell gefährden?"
- "Wo sind Sie am verwundbarsten?"
- "Was wäre Ihr größter Albtraum als Unternehmer?"`;

    case 'strategien':
      return `
- "Wie können Sie Ihre Stärken nutzen, um Chancen zu ergreifen?"
- "Wie kompensieren Sie Schwächen durch Chancen?"
- "Wie setzen Sie Ihre Stärken gegen Bedrohungen ein?"
- "Wie minimieren Sie Schwächen und vermeiden Risiken?"`;

    case 'validierung':
      return `
- "Ist Ihre SWOT-Analyse ausgewogen und realistisch?"
- "Sind alle Punkte strategisch relevant?"
- "Passt die Analyse zu Ihren vorherigen Modulen?"`;

    default:
      return "Allgemeine SWOT-Betrachtung";
  }
}

function generateCrossModulePrompts(phase: SWOTPhase, previousData: any): string {
  if (!previousData) return '';

  const quadrant = phase as keyof typeof CROSS_MODULE_REFERENCES;
  const references = CROSS_MODULE_REFERENCES[quadrant];

  if (!references) return '';

  let prompts = '**Konsistenz-Prüfungen:**\n';

  Object.entries(references).forEach(([module, questions]) => {
    if (previousData[module]) {
      prompts += `\n**${module.toUpperCase()}:**\n`;
      questions.forEach(question => {
        prompts += `- ${question}\n`;
      });
    }
  });

  return prompts;
}

function getBalanceStrategy(balance: BalanceLevel): string {
  switch (balance) {
    case 'over_optimistic':
      return 'Socratic Questioning - Realistische Herausforderungen explorieren';
    case 'over_pessimistic':
      return 'Appreciative Inquiry - Stärken und Erfolge würdigen';
    case 'insufficient_data':
      return 'Strukturierte Exploration - Systematisch durch alle Quadranten';
    case 'balanced':
      return 'Vertiefung - Strategische Implikationen entwickeln';
  }
}

export default {
  buildSWOTPrompt,
  SWOT_MODULE_CONFIG,
  SWOT_PHASE_PATTERNS,
  SWOT_QUESTIONS,
  BALANCE_INTERVENTIONS,
  detectSWOTConfidence
};