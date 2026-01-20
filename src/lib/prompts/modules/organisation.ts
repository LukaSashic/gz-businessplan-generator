/**
 * Module 05: Organisation Prompt System (GZ-503)
 *
 * Organizational structure and team planning with GROW model decision support
 * for realistic capacity planning, partner identification, and outsourcing strategy.
 *
 * Coaching Approach:
 * - GROW model for organizational decisions (Goal → Reality → Options → Will)
 * - Light to medium coaching depth
 * - Structured progression through team → capacity → partnerships → outsourcing
 */

import {
  OrganisationPhase,
  PartialOrganisationOutput,
  calculateOrganisationCompletion,
  OrganisationPhaseInfo
} from '@/types/modules/organisation';

// ============================================================================
// Core Module Configuration
// ============================================================================

export const ORGANISATION_MODULE_CONFIG = {
  moduleId: 'organisation',
  title: 'Organisation',
  description: 'Organisationsstruktur und Teamplanung',
  estimatedDuration: 60, // minutes
  phases: [
    'intro',
    'team_struktur',
    'kapazitaeten',
    'partner',
    'validierung'
  ] as OrganisationPhase[],

  coachingApproach: {
    primary: 'GROW', // Goal-Reality-Options-Will model
    secondary: 'Socratic', // Question-based exploration
    depth: 'medium' as const,
    focusAreas: [
      'team_structure_clarity',
      'realistic_capacity_planning',
      'partnership_strategy',
      'outsourcing_decisions'
    ]
  }
};

// ============================================================================
// Phase Detection Patterns
// ============================================================================

export const ORGANISATION_PHASE_PATTERNS = {
  intro: {
    triggers: [
      /team.*struktur.*planen/i,
      /organisation.*aufbauen/i,
      /mitarbeiter.*brauchen/i,
      /kapazität.*planen/i,
      /partner.*finden/i
    ],
    indicators: [
      /wie.*organisier/i,
      /wer.*macht.*was/i,
      /team.*größe/i
    ]
  },

  team_struktur: {
    triggers: [
      /team.*zusammenstellen/i,
      /rollen.*definieren/i,
      /führungsstruktur/i,
      /organisationsstruktur/i,
      /wer.*verantwortlich/i
    ],
    indicators: [
      /mitarbeiter.*einstellen/i,
      /aufgaben.*verteilen/i,
      /hierarchie/i,
      /kommunikation.*strukturen/i
    ]
  },

  kapazitaeten: {
    triggers: [
      /kapazität.*planen/i,
      /arbeitszeit.*einteilen/i,
      /überlastung.*vermeiden/i,
      /wachstum.*planen/i,
      /engpässe.*identifizieren/i
    ],
    indicators: [
      /stunden.*woche/i,
      /aufgaben.*bewältigen/i,
      /skalieren/i,
      /work.*life.*balance/i
    ]
  },

  partner: {
    triggers: [
      /partner.*suchen/i,
      /kooperation.*eingehen/i,
      /auslagern.*überlegen/i,
      /dienstleister.*finden/i,
      /outsourcing.*planen/i
    ],
    indicators: [
      /extern.*vergeben/i,
      /zusammenarbeit/i,
      /lieferanten/i,
      /vertriebspartner/i
    ]
  }
};

// ============================================================================
// GROW Model Integration
// ============================================================================

export const GROW_QUESTIONS = {
  goal: {
    team_struktur: [
      "Was ist Ihr ideales Team für die ersten 12 Monate?",
      "Welche Rollen sind für Ihren Geschäftserfolg kritisch?",
      "Wie soll die Führungsstruktur aussehen?",
      "Was für eine Unternehmenskultur möchten Sie schaffen?"
    ],
    kapazitaeten: [
      "Welche Kapazität brauchen Sie für Ihre Geschäftsziele?",
      "Wie wollen Sie Wachstum nachhaltig gestalten?",
      "Was ist Ihr Ziel für Work-Life-Balance?",
      "Welche Qualitätsstandards wollen Sie halten?"
    ],
    partner: [
      "Welche Partnerschaften würden Ihr Geschäft stärken?",
      "Was möchten Sie intern behalten vs. auslagern?",
      "Welche strategischen Allianzen sind sinnvoll?",
      "Wie können Partner Ihnen beim Wachstum helfen?"
    ]
  },

  reality: {
    team_struktur: [
      "Welche Fähigkeiten bringen Sie selbst mit?",
      "Wen kennen Sie bereits, der mitarbeiten könnte?",
      "Wie viel Budget haben Sie für Personal?",
      "Welche Erfahrungen haben Sie mit Teamführung?"
    ],
    kapazitaeten: [
      "Wie viele Stunden arbeiten Sie aktuell pro Woche?",
      "Welche Aufgaben nehmen am meisten Zeit in Anspruch?",
      "Wo stoßen Sie heute schon an Grenzen?",
      "Welche Fähigkeiten fehlen Ihnen noch?"
    ],
    partner: [
      "Welche Netzwerke haben Sie bereits?",
      "Welche Aufgaben machen Ihnen wenig Spaß?",
      "Was können Sie besser als andere?",
      "Welche Bereiche sind nicht Ihre Kernkompetenz?"
    ]
  },

  options: {
    team_struktur: [
      "Könnten Sie mit Freelancern starten?",
      "Wäre eine Partnerschaft eine Alternative?",
      "Welche Rollen könnten Sie später hinzufügen?",
      "Macht eine flache oder hierarchische Struktur mehr Sinn?"
    ],
    kapazitaeten: [
      "Könnten Sie Prozesse automatisieren?",
      "Welche Aufgaben könnten Sie delegieren?",
      "Wäre Teilzeit für manche Rollen sinnvoll?",
      "Könnten Sie schrittweise wachsen?"
    ],
    partner: [
      "Welche Bereiche könnten Sie auslagern?",
      "Welche strategischen Partner gibt es in Ihrer Branche?",
      "Könnten Sie Kooperationen eingehen?",
      "Welche Dienstleister könnten Sie entlasten?"
    ]
  },

  will: {
    team_struktur: [
      "Wen werden Sie als ersten einstellen?",
      "Bis wann möchten Sie Ihr Kernteam haben?",
      "Wie werden Sie nach geeigneten Kandidaten suchen?",
      "Welche Führungsstruktur werden Sie umsetzen?"
    ],
    kapazitaeten: [
      "Welche konkreten Schritte werden Sie für die Kapazitätsplanung unternehmen?",
      "Bis wann wollen Sie Ihre ersten Engpässe identifiziert haben?",
      "Wie werden Sie Ihre Work-Life-Balance sicherstellen?",
      "Welchen Skalierungsplan werden Sie entwickeln?"
    ],
    partner: [
      "Welche Partnerschaften werden Sie als erstes angehen?",
      "Was werden Sie definitiv auslagern?",
      "Wen werden Sie als ersten Dienstleister kontaktieren?",
      "Bis wann wollen Sie Ihre Outsourcing-Strategie stehen haben?"
    ]
  }
};

// ============================================================================
// Question Clusters by Phase
// ============================================================================

export const ORGANISATION_QUESTIONS = {
  team_struktur: {
    roles_planning: [
      "Welche Kernrollen braucht Ihr Unternehmen in den ersten 12 Monaten?",
      "Welche Fähigkeiten sind für Ihren Geschäftserfolg kritisch?",
      "Möchten Sie Vollzeit-, Teilzeit- oder Freelancer einstellen?",
      "Wie stelle Sie sich die Aufgabenverteilung vor?"
    ],
    leadership: [
      "Wie soll die Führungsstruktur aussehen?",
      "Welchen Führungsstil möchten Sie leben?",
      "Wie werden Entscheidungen getroffen?",
      "Wie möchten Sie mit Ihrem Team kommunizieren?"
    ],
    culture: [
      "Was für eine Unternehmenskultur möchten Sie schaffen?",
      "Welche Werte sind Ihnen wichtig?",
      "Wie soll die Arbeitsatmosphäre sein?",
      "Wie werden Sie Motivation und Engagement fördern?"
    ]
  },

  kapazitaeten: {
    current_capacity: [
      "Wie viele Stunden arbeiten Sie aktuell pro Woche?",
      "Wie viele Projekte können Sie gleichzeitig bearbeiten?",
      "Welche Aufgaben nehmen am meisten Zeit in Anspruch?",
      "Wo stoßen Sie heute schon an Ihre Grenzen?"
    ],
    growth_planning: [
      "Wie wird sich Ihre Arbeitsbelastung in 3, 6, 12 Monaten entwickeln?",
      "Welche zusätzlichen Kapazitäten werden Sie benötigen?",
      "Wie möchten Sie Wachstum nachhaltig gestalten?",
      "Welche Qualitätsstandards möchten Sie dabei halten?"
    ],
    bottlenecks: [
      "Welche Engpässe sehen Sie bei Ihrem Wachstum?",
      "Was würde Sie bei der Skalierung am meisten bremsen?",
      "Welche Fähigkeiten oder Ressourcen fehlen?",
      "Wie können Sie diese Engpässe rechtzeitig angehen?"
    ],
    work_life_balance: [
      "Wie wichtig ist Ihnen Work-Life-Balance?",
      "Wie viele Stunden möchten Sie maximal arbeiten?",
      "Welche Zeit brauchen Sie für Familie und Hobbys?",
      "Wie werden Sie Überlastung vermeiden?"
    ]
  },

  partner: {
    partnerships: [
      "Welche strategischen Partnerschaften würden Ihr Geschäft stärken?",
      "Kennen Sie bereits potenzielle Partner in Ihrer Branche?",
      "Welche Art von Kooperationen wären für Sie interessant?",
      "Was könnten Sie Partnern im Gegenzug bieten?"
    ],
    outsourcing: [
      "Welche Aufgaben möchten Sie auf keinen Fall abgeben?",
      "Bei welchen Tätigkeiten wäre Outsourcing sinnvoll?",
      "Welche Bereiche sind nicht Ihre Kernkompetenz?",
      "Was sind Ihre Hauptbedenken beim Auslagern?"
    ],
    vendor_selection: [
      "Nach welchen Kriterien würden Sie Dienstleister auswählen?",
      "Wie wichtig sind Ihnen lokale vs. überregionale Anbieter?",
      "Welches Budget haben Sie für externe Dienstleister?",
      "Wie werden Sie die Qualität von Dienstleistern sicherstellen?"
    ]
  }
};

// ============================================================================
// Analysis Paralysis Detection & Intervention
// ============================================================================

export const ANALYSIS_PARALYSIS_PATTERNS = {
  team_overwhelm: [
    /zu viele.*optionen/i,
    /weiß nicht.*wen/i,
    /kann mich nicht.*entscheiden/i,
    /alle.*gleich.*gut/i
  ],
  capacity_anxiety: [
    /schaffe.*nicht/i,
    /zu wenig.*zeit/i,
    /überlastet/i,
    /unmöglich.*planen/i
  ],
  partner_uncertainty: [
    /vertraue.*niemandem/i,
    /will.*alles.*selbst/i,
    /schlechte.*erfahrungen/i,
    /zu riskant/i
  ]
};

export const PARALYSIS_INTERVENTIONS = {
  team_overwhelm: [
    "Lassen Sie uns mit der wichtigsten Rolle starten. Was ist die eine Position, die Ihr Geschäft am meisten voranbringen würde?",
    "Statt perfekte Kandidaten zu suchen: Welche Mindestanforderungen sind wirklich kritisch?",
    "Könnten Sie zunächst mit Freelancern testen, bevor Sie Festanstellungen vornehmen?"
  ],
  capacity_anxiety: [
    "Was ist der allerkleinste Schritt, den Sie für bessere Kapazitätsplanung unternehmen könnten?",
    "Welche eine Aufgabe könnten Sie diese Woche delegieren oder automatisieren?",
    "Lassen Sie uns realistisch planen: Was ist wirklich machbar?"
  ],
  partner_uncertainty: [
    "Was wäre ein kleiner, risikoarmer Test für eine Partnerschaft?",
    "Welche Bereiche sind so standardisiert, dass Outsourcing wenig Risiko bedeutet?",
    "Kennen Sie jemanden persönlich, dem Sie vertrauen würden?"
  ]
};

// ============================================================================
// Dynamic Coaching Responses
// ============================================================================

export const COACHING_RESPONSES = {
  team_structure: {
    clarity_building: [
      "Das ist eine wichtige Überlegung. Lassen Sie uns das strukturiert angehen.",
      "Ich höre, dass Ihnen die Teamzusammenstellung wichtig ist. Das zeigt gute Führungsqualitäten.",
      "Eine klare Rollenverteilung ist tatsächlich entscheidend für den Erfolg."
    ],
    reality_check: [
      "Wie realistisch ist dieser Plan mit Ihrem aktuellen Budget?",
      "Haben Sie schon mal ein Team geführt? Wie war diese Erfahrung?",
      "Welche Herausforderungen sehen Sie bei der Umsetzung?"
    ],
    options_exploration: [
      "Es gibt verschiedene Wege, ein Team aufzubauen. Welcher passt zu Ihrer Situation?",
      "Haben Sie über alternative Arbeitsmodelle nachgedacht - Remote, Teilzeit, Projekt-basiert?",
      "Was spricht für bzw. gegen Freelancer vs. Festanstellungen in Ihrem Fall?"
    ]
  },

  capacity_planning: {
    realistic_assessment: [
      "Es ist klug, dass Sie Kapazitätsplanung ernst nehmen. Viele Gründer unterschätzen das.",
      "Nachhaltiges Wachstum ist wichtiger als schnelles Wachstum. Sie sind auf dem richtigen Weg.",
      "Work-Life-Balance ist gerade am Anfang entscheidend für langfristigen Erfolg."
    ],
    growth_guidance: [
      "Lassen Sie uns schauen, wie Sie schrittweise wachsen können, ohne sich zu überlasten.",
      "Welche Warnsignale würden Ihnen zeigen, dass Sie an Ihre Grenzen kommen?",
      "Wie können Sie frühzeitig erkennen, wann Sie zusätzliche Hilfe brauchen?"
    ],
    bottleneck_identification: [
      "Sehr gut, dass Sie über Engpässe nachdenken. Das ist strategisches Denken.",
      "Lassen Sie uns die kritischen Punkte identifizieren, bevor sie zu Problemen werden.",
      "Was wäre Ihr Plan B, wenn ein wichtiger Engpass auftritt?"
    ]
  },

  partnerships: {
    strategic_thinking: [
      "Partnerschaften können ein echter Hebel sein. Klug, dass Sie daran denken.",
      "Eine gute Partnerschaft kann beiden Seiten helfen. Win-Win ist das Ziel.",
      "Vertrauen aufzubauen braucht Zeit. Starten Sie klein und bauen Sie aus."
    ],
    outsourcing_guidance: [
      "Outsourcing kann sehr befreiend sein, wenn es richtig gemacht wird.",
      "Es ist normal, Bedenken zu haben. Lassen Sie uns einen sicheren Weg finden.",
      "Was würde Ihnen das Outsourcing an Zeit und Energie für Kernaufgaben bringen?"
    ],
    risk_management: [
      "Risikomanagement zeigt, dass Sie unternehmerisch denken.",
      "Wie könnten Sie das Risiko minimieren und trotzdem die Vorteile nutzen?",
      "Was wäre der kleinste Test, den Sie machen könnten?"
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
    /klar/i,
    /selbstverständlich/i
  ],
  medium_confidence: [
    /denke schon/i,
    /wahrscheinlich/i,
    /vermutlich/i,
    /sollte funktionieren/i,
    /bin zuversichtlich/i
  ],
  low_confidence: [
    /bin unsicher/i,
    /weiß nicht/i,
    /vielleicht/i,
    /könnte sein/i,
    /hoffe/i,
    /schwierig zu sagen/i
  ],
  fear_patterns: [
    /angst/i,
    /sorge/i,
    /befürchte/i,
    /risiko/i,
    /gefährlich/i,
    /was wenn/i
  ]
};

export function detectOrganisationConfidence(message: string): 'high' | 'medium' | 'low' {
  const text = message.toLowerCase();

  const highScore = CONFIDENCE_PATTERNS.high_confidence.filter(pattern =>
    pattern.test(text)
  ).length;

  const lowScore = CONFIDENCE_PATTERNS.low_confidence.filter(pattern =>
    pattern.test(text)
  ).length + CONFIDENCE_PATTERNS.fear_patterns.filter(pattern =>
    pattern.test(text)
  ).length;

  const mediumScore = CONFIDENCE_PATTERNS.medium_confidence.filter(pattern =>
    pattern.test(text)
  ).length;

  if (highScore > lowScore && highScore > mediumScore) return 'high';
  if (lowScore > highScore) return 'low';
  return 'medium';
}

// ============================================================================
// Research Triggers
// ============================================================================

export const RESEARCH_TRIGGERS = {
  team_roles: [
    /welche rollen.*branche/i,
    /typische positionen/i,
    /standard.*team/i,
    /benchmark.*personal/i
  ],
  salary_research: [
    /gehalt.*üblich/i,
    /was verdient/i,
    /lohnkosten/i,
    /personalkosten.*berechnen/i
  ],
  legal_requirements: [
    /arbeitsrecht/i,
    /anstellung.*vorschriften/i,
    /sozialversicherung/i,
    /lohnbuchhaltung/i
  ],
  partnership_models: [
    /arten.*partnerschaft/i,
    /kooperations.*modelle/i,
    /joint venture/i,
    /strategische.*allianz/i
  ]
};

// ============================================================================
// Main Module Function
// ============================================================================

export function buildOrganisationPrompt(
  currentPhase: OrganisationPhase,
  existingData: PartialOrganisationOutput,
  userMessage: string,
  _conversationHistory: Array<{role: string, content: string}>
): string {
  const phaseInfo = OrganisationPhaseInfo[currentPhase];
  const completion = calculateOrganisationCompletion(existingData);
  const confidence = detectOrganisationConfidence(userMessage);

  // Detect analysis paralysis
  const hasParalysis = Object.entries(ANALYSIS_PARALYSIS_PATTERNS).find(([_type, patterns]) =>
    patterns.some(pattern => pattern.test(userMessage.toLowerCase()))
  );

  const prompt = `# Module 05: Organisation - ${phaseInfo.label}

## Coaching Kontext
Du führst durch das **Organisation-Modul** mit Fokus auf Teamstruktur, Kapazitätsplanung und Partnerschaften.

**Aktuelle Phase:** ${phaseInfo.label} (${currentPhase})
**Coaching-Tiefe:** ${phaseInfo.coachingDepth}
**Fortschritt:** ${completion}% abgeschlossen
**Nutzer-Vertrauen:** ${confidence}
${hasParalysis ? `**⚠️ Analysis Paralysis erkannt:** ${hasParalysis[0]}` : ''}

## GROW-Model Integration

### Phase: ${currentPhase}
**Ziel dieser Phase:** ${getPhaseGoal(currentPhase)}

**GROW-Fragen für diese Phase:**
${generateGROWQuestions(currentPhase)}

## Coaching-Prinzipien

1. **Realistische Planung fördern** - Keine übertriebenen Ambitionen
2. **Strukturierte Entscheidungen** - GROW-Model konsequent anwenden
3. **Ängste ernst nehmen** - Besonders bei Delegation und Partnerschaften
4. **Schrittweise Umsetzung** - Kleine Tests vor großen Commitments

## Ausgabe-Format

Du MUSST in diesem exakten JSON-Format antworten:

\`\`\`json
{
  "response": "Deine empathische, strukturierte Coaching-Antwort hier",
  "moduleData": {
    // Aktualisierte Daten basierend auf dem Gespräch
  },
  "coachingNotes": {
    "phase": "${currentPhase}",
    "confidence": "${confidence}",
    "nextSteps": ["Konkrete nächste Schritte"],
    "concerns": ["Erkannte Sorgen oder Blockaden"],
    "decisions": ["Mit GROW getroffene Entscheidungen"]
  }
}
\`\`\`

## Aktuelle Situation

**Bestehende Daten:**
${JSON.stringify(existingData, null, 2)}

**Nutzer-Nachricht:**
"${userMessage}"

${hasParalysis ? generateParalysisIntervention(hasParalysis[0]) : ''}

Führe das Coaching-Gespräch strukturiert mit dem GROW-Model. Sei empathisch, aber auch direkt bei unrealistischen Plänen.`;

  return prompt;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getPhaseGoal(phase: OrganisationPhase): string {
  const goals = {
    intro: 'Überblick über Organisationsbedürfnisse gewinnen',
    team_struktur: 'Klare Teamstruktur und Rollen definieren',
    kapazitaeten: 'Realistische Kapazitätsplanung entwickeln',
    partner: 'Partnerschaften und Outsourcing-Strategie planen',
    validierung: 'Organisation validieren und finalisieren',
    completed: 'Modul abgeschlossen'
  };
  return goals[phase] || 'Unbekannte Phase';
}

function generateGROWQuestions(phase: OrganisationPhase): string {
  if (phase === 'intro' || phase === 'validierung' || phase === 'completed') {
    return "Einführung - Allgemeine Orientierung";
  }

  const area = phase === 'team_struktur' ? 'team_struktur' :
               phase === 'kapazitaeten' ? 'kapazitaeten' : 'partner';

  const goalQuestions = GROW_QUESTIONS.goal[area as keyof typeof GROW_QUESTIONS.goal] || GROW_QUESTIONS.goal.team_struktur;
  const realityQuestions = GROW_QUESTIONS.reality[area as keyof typeof GROW_QUESTIONS.reality] || GROW_QUESTIONS.reality.team_struktur;

  return `**GOAL:** ${goalQuestions.slice(0, 2).join(' | ')}\n**REALITY:** ${realityQuestions.slice(0, 2).join(' | ')}`;
}

function generateParalysisIntervention(type: string): string {
  const interventions = PARALYSIS_INTERVENTIONS[type as keyof typeof PARALYSIS_INTERVENTIONS] ||
    ["Lassen Sie uns einen Schritt nach dem anderen machen."];

  return `
## ⚠️ Analysis Paralysis Intervention

**Erkannt:** ${type}
**Intervention:** ${interventions[0]}

Fokus auf konkrete, kleine nächste Schritte statt auf die perfekte Gesamtlösung.`;
}

export default {
  buildOrganisationPrompt,
  ORGANISATION_MODULE_CONFIG,
  ORGANISATION_PHASE_PATTERNS,
  GROW_QUESTIONS,
  detectOrganisationConfidence
};