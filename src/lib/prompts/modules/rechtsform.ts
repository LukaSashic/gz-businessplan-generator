/**
 * Module 06: Rechtsform Prompt System (GZ-503)
 *
 * Legal form selection and regulatory compliance with GROW model decision support
 * for legal structure choices, Handwerk/Meisterpflicht checks, and permit requirements.
 *
 * Coaching Approach:
 * - GROW model for legal form decisions (Goal → Reality → Options → Will)
 * - Light to medium coaching depth
 * - Structured progression through legal forms → Handwerk check → permits → validation
 * - German-specific legal requirements and business types
 */

import {
  RechtsformPhase,
  PartialRechtsformOutput,
  LegalFormType,
  HandwerkStatus,
  calculateRechtsformCompletion,
  RechtsformPhaseInfo,
  GERMAN_LEGAL_FORMS
} from '@/types/modules/rechtsform';

// ============================================================================
// Core Module Configuration
// ============================================================================

export const RECHTSFORM_MODULE_CONFIG = {
  moduleId: 'rechtsform',
  title: 'Rechtsform',
  description: 'Rechtsformwahl und rechtliche Compliance',
  estimatedDuration: 45, // minutes
  phases: [
    'intro',
    'rechtsform_arten',
    'handwerk_check',
    'genehmigungen',
    'validierung'
  ] as RechtsformPhase[],

  coachingApproach: {
    primary: 'GROW', // Goal-Reality-Options-Will model
    secondary: 'Options_Exploration', // Prevent analysis paralysis
    depth: 'light_to_medium' as const,
    focusAreas: [
      'legal_form_clarity',
      'handwerk_compliance',
      'permit_identification',
      'practical_implementation'
    ]
  }
};

// ============================================================================
// Phase Detection Patterns
// ============================================================================

export const RECHTSFORM_PHASE_PATTERNS = {
  intro: {
    triggers: [
      /rechtsform.*wählen/i,
      /unternehmen.*gründen/i,
      /legal.*struktur/i,
      /gesellschaft.*form/i,
      /wie.*anmelden/i
    ],
    indicators: [
      /welche.*rechtsform/i,
      /gmbh.*oder.*ug/i,
      /einzelunternehmen/i,
      /haftung.*begrenzen/i
    ]
  },

  rechtsform_arten: {
    triggers: [
      /gmbh.*ug.*unterschied/i,
      /einzelunternehmen.*vorteile/i,
      /welche.*form.*passt/i,
      /rechtsform.*vergleichen/i,
      /haftung.*beschränkt/i
    ],
    indicators: [
      /kapital.*mindest/i,
      /steuer.*belastung/i,
      /kosten.*gründung/i,
      /komplexität/i
    ]
  },

  handwerk_check: {
    triggers: [
      /handwerk.*betrieb/i,
      /meisterbrief.*brauche/i,
      /handwerkskammer/i,
      /meisterpflicht/i,
      /anlage.*a.*b/i
    ],
    indicators: [
      /ausnahmebewilligung/i,
      /geselle.*jahre/i,
      /handwerksrolle/i,
      /zulassungsfrei/i
    ]
  },

  genehmigungen: {
    triggers: [
      /genehmigung.*brauche/i,
      /anmelden.*wo/i,
      /behörde.*zuständig/i,
      /erlaubnis.*erforderlich/i,
      /gewerbeanmeldung/i
    ],
    indicators: [
      /ihk.*hwk/i,
      /finanzamt.*anmeldung/i,
      /berufsgenossenschaft/i,
      /gesundheitszeugnis/i
    ]
  }
};

// ============================================================================
// GROW Model Integration
// ============================================================================

export const GROW_QUESTIONS = {
  goal: {
    rechtsform_arten: [
      "Was ist Ihnen bei der Rechtsform am wichtigsten - niedrige Kosten, Haftungsbeschränkung oder Flexibilität?",
      "Planen Sie, Investoren aufzunehmen oder Kredite zu beantragen?",
      "Wie soll Ihr Unternehmen in 3-5 Jahren dastehen?",
      "Welches Image möchten Sie mit Ihrer Rechtsform vermitteln?"
    ],
    handwerk_check: [
      "Wissen Sie, ob Ihre Tätigkeit handwerkspflichtig ist?",
      "Welche Qualifikationen bringen Sie mit?",
      "Wie wichtig ist Ihnen die sofortige Geschäftsaufnahme?",
      "Planen Sie, Auszubildende einzustellen?"
    ],
    genehmigungen: [
      "Möchten Sie schnell starten oder gründlich vorbereitet sein?",
      "Welche behördlichen Hürden erwarten Sie?",
      "Haben Sie Budget für Beratung und Genehmigungen?",
      "Wie wichtig ist Ihnen Rechtssicherheit?"
    ]
  },

  reality: {
    rechtsform_arten: [
      "Wie viel Startkapital haben Sie zur Verfügung?",
      "Gründen Sie allein oder mit Partnern?",
      "Welche Branche und welcher Umsatz ist geplant?",
      "Haben Sie bereits Geschäftserfahrung?"
    ],
    handwerk_check: [
      "In welcher Branche sind Sie tätig?",
      "Welche Ausbildung und Berufserfahrung haben Sie?",
      "Haben Sie einen Meisterbrief oder gleichwertige Qualifikation?",
      "Kennen Sie die Vorschriften in Ihrer Branche?"
    ],
    genehmigungen: [
      "Welche Genehmigungen haben Sie bereits identifiziert?",
      "Wie gut kennen Sie die behördlichen Abläufe?",
      "Haben Sie Kontakte zu Beratern oder Behörden?",
      "Welche Erfahrungen haben Sie mit Bürokratie?"
    ]
  },

  options: {
    rechtsform_arten: [
      "Könnten Sie mit einem Einzelunternehmen starten und später wechseln?",
      "Wäre eine UG eine Alternative zur GmbH?",
      "Macht eine Partnerschaft (GbR) Sinn?",
      "Sollten Sie als Freiberufler starten?"
    ],
    handwerk_check: [
      "Könnten Sie eine Ausnahmebewilligung beantragen?",
      "Wäre ein Meisterkurs eine Option?",
      "Könnten Sie mit einem Meister kooperieren?",
      "Gibt es handwerksähnliche Alternativen?"
    ],
    genehmigungen: [
      "Welche Genehmigungen sind sofort erforderlich?",
      "Was können Sie später nachholen?",
      "Könnten Sie mit Beratern arbeiten?",
      "Gibt es Vereinfachungen für Kleinbetriebe?"
    ]
  },

  will: {
    rechtsform_arten: [
      "Für welche Rechtsform werden Sie sich entscheiden?",
      "Bis wann möchten Sie gegründet haben?",
      "Welche Schritte werden Sie als erstes angehen?",
      "Wen werden Sie für die Gründung beauftragen?"
    ],
    handwerk_check: [
      "Wie werden Sie den Handwerksstatus klären?",
      "Welche Qualifikationen werden Sie nachholen?",
      "Mit wem werden Sie kooperieren?",
      "Bis wann soll die Anmeldung erfolgen?"
    ],
    genehmigungen: [
      "Welche Genehmigungen werden Sie zuerst beantragen?",
      "Bei welchen Behörden werden Sie sich anmelden?",
      "Welche professionelle Hilfe werden Sie nutzen?",
      "Bis wann soll alles genehmigt sein?"
    ]
  }
};

// ============================================================================
// Question Clusters by Phase
// ============================================================================

export const RECHTSFORM_QUESTIONS = {
  rechtsform_arten: {
    form_comparison: [
      "Welche Rechtsformen kennen Sie bereits?",
      "Was ist Ihnen wichtiger - niedrige Kosten oder Haftungsbeschränkung?",
      "Planen Sie, mit Partnern zu gründen?",
      "Wie viel Startkapital haben Sie zur Verfügung?"
    ],
    liability_concerns: [
      "Welche geschäftlichen Risiken sehen Sie?",
      "Wie wichtig ist Ihnen die persönliche Haftungsbeschränkung?",
      "Haben Sie privates Vermögen zu schützen?",
      "Welche Versicherungen planen Sie?"
    ],
    tax_considerations: [
      "Wie wichtig sind steuerliche Aspekte bei der Entscheidung?",
      "Erwarten Sie hohe Gewinne, die Sie thesaurieren möchten?",
      "Haben Sie einen Steuerberater?",
      "Kennen Sie die Unterschiede bei der Besteuerung?"
    ],
    growth_planning: [
      "Planen Sie, Investoren aufzunehmen?",
      "Möchten Sie später an die Börse?",
      "Soll das Unternehmen verkaufbar sein?",
      "Planen Sie internationale Expansion?"
    ]
  },

  handwerk_check: {
    business_activity: [
      "Beschreiben Sie Ihre geplante Geschäftstätigkeit genau.",
      "In welcher Branche werden Sie hauptsächlich arbeiten?",
      "Welche konkreten Dienstleistungen bieten Sie an?",
      "Verkaufen Sie auch Waren oder nur Dienstleistungen?"
    ],
    qualifications: [
      "Welche berufliche Ausbildung haben Sie?",
      "Haben Sie einen Meisterbrief in Ihrem Bereich?",
      "Wie viele Jahre Berufserfahrung bringen Sie mit?",
      "Haben Sie Weiterbildungen oder Zertifikate?"
    ],
    handwerk_requirements: [
      "Wissen Sie, ob Ihre Tätigkeit in Anlage A der Handwerksordnung steht?",
      "Ist Ihnen bekannt, ob Sie meisterpflichtig sind?",
      "Haben Sie schon mal bei der Handwerkskammer nachgefragt?",
      "Kennen Sie die Ausnahmeregeln?"
    ]
  },

  genehmigungen: {
    required_permits: [
      "Welche Genehmigungen vermuten Sie, dass Sie brauchen?",
      "Arbeiten Sie mit Lebensmitteln, Gesundheit oder Sicherheit?",
      "Haben Sie bereits behördliche Kontakte aufgenommen?",
      "Welche Kammern sind für Sie zuständig?"
    ],
    authority_contacts: [
      "Bei welchen Behörden müssen Sie sich anmelden?",
      "Kennen Sie die zuständigen Ansprechpartner?",
      "Haben Sie schon mal mit dem Gewerbeamt gesprochen?",
      "Welche Erfahrungen haben Sie mit Behörden?"
    ],
    timeline_planning: [
      "Bis wann möchten Sie alle Genehmigungen haben?",
      "Welche Genehmigungen sind sofort erforderlich?",
      "Was können Sie parallel beantragen?",
      "Haben Sie Pufferzeiten eingeplant?"
    ]
  }
};

// ============================================================================
// Handwerk Detection Logic
// ============================================================================

export const HANDWERK_INDICATORS = {
  anlage_a: [ // Meisterpflichtige Handwerke
    /elektr/i, /install/i, /heizung/i, /sanitär/i, /maler/i, /tischler/i,
    /bäcker/i, /fleischer/i, /friseur/i, /optiker/i, /zahntechnik/i,
    /kfz/i, /auto/i, /dachdecker/i, /maurer/i
  ],
  anlage_b1: [ // Zulassungsfreie Handwerke
    /fliesenleger/i, /parkett/i, /rolladen/i, /textil/i, /modist/i,
    /kosmetik/i, /fußpflege/i, /masseur/i
  ],
  anlage_b2: [ // Handwerksähnliche Gewerbe
    /computer/i, /software/i, /werbe/i, /design/i, /fotograf/i,
    /dolmetscher/i, /nachhilfe/i
  ]
};

export function detectHandwerkStatus(businessDescription: string): HandwerkStatus {
  const text = businessDescription.toLowerCase();

  if (HANDWERK_INDICATORS.anlage_a.some(pattern => pattern.test(text))) {
    return 'handwerk_meisterpflichtig';
  }
  if (HANDWERK_INDICATORS.anlage_b1.some(pattern => pattern.test(text))) {
    return 'handwerk_meisterfrei';
  }
  if (HANDWERK_INDICATORS.anlage_b2.some(pattern => pattern.test(text))) {
    return 'handwerksaehnlich';
  }
  return 'not_handwerk';
}

// ============================================================================
// Analysis Paralysis Detection & Intervention
// ============================================================================

export const ANALYSIS_PARALYSIS_PATTERNS = {
  form_overwhelm: [
    /zu viele.*optionen/i,
    /kann mich nicht.*entscheiden/i,
    /alle.*vor.*nachteile/i,
    /perfekte.*lösung/i
  ],
  complexity_fear: [
    /zu kompliziert/i,
    /verstehe.*nicht/i,
    /überfordert/i,
    /zu viel.*bürokratie/i
  ],
  perfectionist_paralysis: [
    /muss.*perfekt/i,
    /alle.*risiken/i,
    /was.*wenn.*schief/i,
    /sicher.*gehen/i
  ]
};

export const PARALYSIS_INTERVENTIONS = {
  form_overwhelm: [
    "Lassen Sie uns mit dem einfachsten Start beginnen. Sie können die Rechtsform später noch ändern.",
    "Welche ist die eine Eigenschaft, die Ihnen am wichtigsten ist - niedrige Kosten, Haftungsschutz oder Einfachheit?",
    "Viele erfolgreiche Unternehmen haben klein angefangen. Perfekte Planung kann auch lähmen."
  ],
  complexity_fear: [
    "Das ist normal - Rechtsformen wirken komplex. Lassen Sie uns Schritt für Schritt vorgehen.",
    "Sie müssen nicht alles sofort verstehen. Ein guter Berater kann hier helfen.",
    "Welcher eine Aspekt bereitet Ihnen am meisten Kopfzerbrechen?"
  ],
  perfectionist_paralysis: [
    "Es gibt keine perfekte Rechtsform - nur die, die jetzt am besten passt.",
    "Was ist das schlimmste Szenario, wenn Sie sich 'falsch' entscheiden? Oft ist es weniger dramatisch als gedacht.",
    "Viele Entscheidungen sind reversibel. Starten ist wichtiger als perfekt planen."
  ]
};

// ============================================================================
// Legal Form Recommendation Logic
// ============================================================================

export function recommendLegalForm(
  budget: number,
  partners: boolean,
  riskLevel: 'low' | 'medium' | 'high',
  growthPlans: 'small' | 'medium' | 'large'
): LegalFormType[] {
  if (budget < 1000) {
    return partners ? ['gbr', 'einzelunternehmen'] : ['einzelunternehmen', 'freelancer'];
  }

  if (budget < 25000) {
    if (riskLevel === 'high' || growthPlans === 'large') {
      return ['ug', 'gmbh'];
    }
    return partners ? ['gbr', 'ug'] : ['einzelunternehmen', 'ug'];
  }

  if (growthPlans === 'large') {
    return ['gmbh', 'ug', 'ag'];
  }

  return ['gmbh', 'ug', 'einzelunternehmen'];
}

// ============================================================================
// Dynamic Coaching Responses
// ============================================================================

export const COACHING_RESPONSES = {
  legal_forms: {
    decision_support: [
      "Eine gute Rechtsformwahl ist wichtig, aber nicht unumkehrbar. Lassen Sie uns die beste Option für jetzt finden.",
      "Sie denken strategisch über die Rechtsform nach. Das zeigt unternehmerische Weitsicht.",
      "Jede Rechtsform hat Vor- und Nachteile. Wichtig ist, was zu Ihrer aktuellen Situation passt."
    ],
    complexity_reduction: [
      "Das klingt komplizierter als es ist. Lassen Sie uns die wichtigsten Punkte herausarbeiten.",
      "Sie sind nicht allein - die meisten Gründer haben ähnliche Fragen zur Rechtsform.",
      "Ein guter Steuerberater kann hier viel Klarheit schaffen. Das ist gut investiertes Geld."
    ]
  },

  handwerk: {
    requirements_clarification: [
      "Handwerksrecht kann verwirrend sein. Lassen Sie uns Ihren konkreten Fall klären.",
      "Es ist klug, dass Sie die Handwerkspflicht prüfen. Unwissenheit schützt vor Strafen nicht.",
      "Viele Tätigkeiten sind heute zulassungsfrei. Lassen Sie uns schauen, was für Sie gilt."
    ],
    meister_alternatives: [
      "Ein Meisterbrief ist nicht immer erforderlich. Es gibt verschiedene Wege zur Selbstständigkeit.",
      "Ausnahmebewilligungen sind häufiger möglich als viele denken.",
      "Kooperationen mit Meistern können eine praktische Lösung sein."
    ]
  },

  permits: {
    systematic_approach: [
      "Genehmigungen systematisch anzugehen ist smart. Das spart später Zeit und Nerven.",
      "Behördengänge sind lästig, aber machbar. Mit der richtigen Vorbereitung läuft es smooth.",
      "Sie zeigen Verantwortung, indem Sie alle nötigen Genehmigungen klären."
    ],
    timeline_management: [
      "Ein realistischer Zeitplan für Genehmigungen ist Gold wert.",
      "Manche Genehmigungen dauern länger - gut, dass Sie das einplanen.",
      "Parallel beantragen wo möglich. Das spart Wochen."
    ]
  }
};

// ============================================================================
// Confidence Level Detection
// ============================================================================

export const CONFIDENCE_PATTERNS = {
  high_confidence: [
    /weiß genau/i,
    /bin mir sicher/i,
    /definitiv/i,
    /klar/i,
    /selbstverständlich/i
  ],
  medium_confidence: [
    /denke schon/i,
    /wahrscheinlich/i,
    /sollte.*passen/i,
    /vermutlich/i
  ],
  low_confidence: [
    /weiß nicht/i,
    /unsicher/i,
    /kompliziert/i,
    /verwirrend/i,
    /überfordert/i
  ],
  fear_patterns: [
    /angst/i,
    /sorge/i,
    /befürchte/i,
    /risiko/i,
    /fehler/i,
    /falsch.*entscheiden/i
  ]
};

export function detectRechtsformConfidence(message: string): 'high' | 'medium' | 'low' {
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
// Main Module Function
// ============================================================================

export function buildRechtsformPrompt(
  currentPhase: RechtsformPhase,
  existingData: PartialRechtsformOutput,
  userMessage: string,
  _conversationHistory: Array<{role: string, content: string}>
): string {
  const phaseInfo = RechtsformPhaseInfo[currentPhase];
  const completion = calculateRechtsformCompletion(existingData);
  const confidence = detectRechtsformConfidence(userMessage);

  // Detect analysis paralysis
  const hasParalysis = Object.entries(ANALYSIS_PARALYSIS_PATTERNS).find(([_type, patterns]) =>
    patterns.some(pattern => pattern.test(userMessage.toLowerCase()))
  );

  // Detect potential Handwerk status
  const potentialHandwerk = detectHandwerkStatus(userMessage);

  const prompt = `# Module 06: Rechtsform - ${phaseInfo.label}

## Coaching Kontext
Du führst durch das **Rechtsform-Modul** mit Fokus auf Rechtsformwahl, Handwerksrecht und Genehmigungen.

**Aktuelle Phase:** ${phaseInfo.label} (${currentPhase})
**Coaching-Tiefe:** ${phaseInfo.coachingDepth}
**Fortschritt:** ${completion}% abgeschlossen
**Nutzer-Vertrauen:** ${confidence}
${potentialHandwerk !== 'not_handwerk' ? `**⚠️ Handwerk erkannt:** ${potentialHandwerk}` : ''}
${hasParalysis ? `**⚠️ Analysis Paralysis erkannt:** ${hasParalysis[0]}` : ''}

## GROW-Model Integration

### Phase: ${currentPhase}
**Ziel dieser Phase:** ${getPhaseGoal(currentPhase)}

**GROW-Fragen für diese Phase:**
${generateGROWQuestions(currentPhase)}

## Deutsche Rechtsform-Spezifika

### Verfügbare Rechtsformen:
${generateLegalFormsOverview()}

### Handwerksrecht-Prüfung:
- **Anlage A:** Meisterpflichtige Handwerke (Eintragung in Handwerksrolle)
- **Anlage B1:** Zulassungsfreie Handwerke
- **Anlage B2:** Handwerksähnliche Gewerbe
- **Freie Berufe:** Keine Gewerbeanmeldung

## Coaching-Prinzipien

1. **Praktikabilität vor Perfektion** - Start ist wichtiger als perfekte Wahl
2. **Compliance-Bewusstsein** - Rechtliche Anforderungen ernst nehmen
3. **Kosten-Nutzen-Denken** - Realistische Einschätzung der Gründungskosten
4. **Schritt-für-Schritt** - Nicht alle Probleme auf einmal lösen

## Ausgabe-Format

Du MUSST in diesem exakten JSON-Format antworten:

\`\`\`json
{
  "response": "Deine empathische, strukturierte Coaching-Antwort hier",
  "moduleData": {
    // Aktualisierte Rechtsform-Daten basierend auf dem Gespräch
  },
  "coachingNotes": {
    "phase": "${currentPhase}",
    "confidence": "${confidence}",
    "nextSteps": ["Konkrete nächste Schritte"],
    "concerns": ["Erkannte Sorgen oder Blockaden"],
    "decisions": ["Mit GROW getroffene Entscheidungen"],
    "handwerkStatus": "${potentialHandwerk}"
  }
}
\`\`\`

## Aktuelle Situation

**Bestehende Daten:**
${JSON.stringify(existingData, null, 2)}

**Nutzer-Nachricht:**
"${userMessage}"

${hasParalysis ? generateParalysisIntervention(hasParalysis[0]) : ''}

Führe das Coaching-Gespräch mit GROW-Model und deutschen Rechts-Spezifika. Sei präzise bei rechtlichen Fragen, empathisch bei Überforderung.`;

  return prompt;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getPhaseGoal(phase: RechtsformPhase): string {
  const goals = {
    intro: 'Überblick über Rechtsform-Anforderungen gewinnen',
    rechtsform_arten: 'Passende Rechtsform identifizieren und auswählen',
    handwerk_check: 'Handwerksstatus klären und Compliance sicherstellen',
    genehmigungen: 'Alle erforderlichen Genehmigungen identifizieren',
    validierung: 'Rechtsform-Entscheidung validieren und finalisieren',
    completed: 'Modul abgeschlossen'
  };
  return goals[phase] || 'Unbekannte Phase';
}

function generateGROWQuestions(phase: RechtsformPhase): string {
  if (phase === 'intro' || phase === 'validierung' || phase === 'completed') {
    return "Einführung - Allgemeine Orientierung";
  }

  const area = phase === 'rechtsform_arten' ? 'rechtsform_arten' :
               phase === 'handwerk_check' ? 'handwerk_check' : 'genehmigungen';

  const goalQuestions = GROW_QUESTIONS.goal[area as keyof typeof GROW_QUESTIONS.goal] || GROW_QUESTIONS.goal.rechtsform_arten;
  const realityQuestions = GROW_QUESTIONS.reality[area as keyof typeof GROW_QUESTIONS.reality] || GROW_QUESTIONS.reality.rechtsform_arten;

  return `**GOAL:** ${goalQuestions.slice(0, 2).join(' | ')}\n**REALITY:** ${realityQuestions.slice(0, 2).join(' | ')}`;
}

function generateLegalFormsOverview(): string {
  const commonForms: LegalFormType[] = ['einzelunternehmen', 'gbr', 'ug', 'gmbh', 'freelancer'];

  return commonForms.map(form => {
    const info = GERMAN_LEGAL_FORMS[form];
    return `**${info.name}:** ${info.description} (Mindestkapital: €${info.minCapital})`;
  }).join('\n');
}

function generateParalysisIntervention(type: string): string {
  const interventions = PARALYSIS_INTERVENTIONS[type as keyof typeof PARALYSIS_INTERVENTIONS] ||
    ["Lassen Sie uns einen Schritt nach dem anderen machen."];

  return `
## ⚠️ Analysis Paralysis Intervention

**Erkannt:** ${type}
**Intervention:** ${interventions[0]}

Fokus auf eine praktikable Lösung für jetzt, nicht die theoretisch perfekte für alle Szenarien.`;
}

export default {
  buildRechtsformPrompt,
  RECHTSFORM_MODULE_CONFIG,
  RECHTSFORM_PHASE_PATTERNS,
  GROW_QUESTIONS,
  detectRechtsformConfidence,
  detectHandwerkStatus,
  recommendLegalForm
};