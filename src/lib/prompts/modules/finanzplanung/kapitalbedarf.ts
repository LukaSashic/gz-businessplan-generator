/**
 * Finanzplanung Teil A: Kapitalbedarf Prompt (GZ-601)
 *
 * Capital Requirements Planning Module with:
 * - CBC handling for "Ich bin kein Zahlenmensch" limiting belief
 * - Scaffold approach: Step-by-step guidance
 * - German EUR formatting and decimal.js calculations
 * - Integration with Gründungszuschuss scenarios
 *
 * Features:
 * - Three components: Gründungskosten, Investitionen, Anlaufkosten
 * - CBC 5-step pattern for number anxiety
 * - €50k GZ test scenario support
 * - Industry-specific guidance based on business type
 *
 * Based on:
 * - gz-coaching-cbc.md (CBC for "Ich bin kein Zahlenmensch")
 * - gz-system-coaching-core.md (GROW model)
 * - German GZ requirements and BA compliance
 */

import type {
  Kapitalbedarf,
} from '@/types/modules/finanzplanung';

// ============================================================================
// Types
// ============================================================================

export interface KapitalbedarfPromptOptions {
  /** Current business idea from previous modules */
  businessIdea?: {
    problem: string;
    solution: string;
    businessType: string;
  };

  /** Organization data from Organisation module */
  organisation?: {
    teamSize: number;
    needsOffice: boolean;
    equipmentNeeds: string[];
  };

  /** Legal form from Rechtsform module */
  rechtsform?: {
    legalForm: string;
    needsNotary: boolean;
    registrationFees: number;
  };

  /** User's confidence level with numbers */
  numberConfidence?: 'high' | 'medium' | 'low' | 'anxiety';

  /** Existing partial data */
  existingData?: Partial<Kapitalbedarf>;
}

// ============================================================================
// Number Anxiety Detection Patterns
// ============================================================================

export const NUMBER_ANXIETY_PATTERNS = {
  zahlenmensch: [
    /bin kein zahlenmensch/i,
    /kann nicht rechnen/i,
    /mathe.*schwer/i,
    /zahlen.*schwierig/i,
    /bin kein.*zahlen/i,
    /rechnen.*nicht.*gut/i,
  ],

  overwhelm: [
    /zu kompliziert/i,
    /verstehe.*nicht/i,
    /zu viel.*aufeinmal/i,
    /überfordert/i,
    /keine ahnung.*kosten/i,
  ],

  perfectionism: [
    /muss.*genau.*stimmen/i,
    /alle.*zahlen.*richtig/i,
    /fehler.*schlimm/i,
    /präzise.*planen/i,
  ],

  procrastination: [
    /später.*machen/i,
    /erstmal.*schauen/i,
    /grobe.*schätzung/i,
    /ungefähr.*reicht/i,
  ],
};

export function detectNumberAnxiety(message: string): 'anxiety' | 'overwhelm' | 'perfectionism' | 'procrastination' | null {
  const text = message.toLowerCase();

  if (NUMBER_ANXIETY_PATTERNS.zahlenmensch.some(p => p.test(text))) return 'anxiety';
  if (NUMBER_ANXIETY_PATTERNS.overwhelm.some(p => p.test(text))) return 'overwhelm';
  if (NUMBER_ANXIETY_PATTERNS.perfectionism.some(p => p.test(text))) return 'perfectionism';
  if (NUMBER_ANXIETY_PATTERNS.procrastination.some(p => p.test(text))) return 'procrastination';

  return null;
}

// ============================================================================
// CBC Responses for Number Anxiety
// ============================================================================

export const NUMBER_ANXIETY_CBC_RESPONSES = {
  anxiety: {
    identify: "Ich höre, dass Sie sich als 'kein Zahlenmensch' sehen. Das ist ein häufiger Gedanke bei Gründern.",
    evidence: "Haben Sie schon mal ein Budget für einen Urlaub oder eine größere Anschaffung geplant? Oder Ihren Handyvertrag verglichen?",
    challenge: "Stimmt es wirklich, dass Sie GAR NICHT mit Zahlen umgehen können? Oder ist es eher so, dass Businesspläne neu für Sie sind?",
    reframe: "Es geht nicht darum, ein Mathe-Genie zu sein. Es geht darum, Ihre Geschäftsidee in Zahlen zu übersetzen. Das können Sie lernen.",
    action: "Lassen Sie uns zusammen, Schritt für Schritt, Ihren Kapitalbedarf durchgehen. Ich helfe Ihnen dabei."
  },

  overwhelm: {
    identify: "Die Finanzplanung wirkt überwältigend auf Sie. Das verstehe ich gut - es ist viel auf einmal.",
    evidence: "Welche Teile der Finanzplanung bereiten Ihnen am meisten Kopfzerbrechen?",
    challenge: "Was wäre, wenn wir es nicht alle auf einmal machen müssten, sondern einen Bereich nach dem anderen angehen?",
    reframe: "Jeder Kapitalbedarf besteht nur aus drei Teilen: Was kostet die Gründung? Was brauchen Sie an Ausstattung? Wie viel Reserve für den Start?",
    action: "Wir machen das zusammen, Punkt für Punkt. Fangen wir mit dem einfachsten Teil an - den Gründungskosten."
  },

  perfectionism: {
    identify: "Sie möchten, dass alle Zahlen perfekt stimmen. Das zeigt, dass Ihnen Ihr Business wichtig ist.",
    evidence: "Wie genau müssen die Zahlen denn für den ersten Entwurf sein? Was ist 'gut genug' für jetzt?",
    challenge: "Was passiert, wenn eine Zahl um 10% daneben liegt? Wird Ihr Businessplan dann wertlos?",
    reframe: "Ein Businessplan ist ein Plan, kein Vertrag. Er hilft Ihnen, die Größenordnungen zu verstehen und zu durchdenken.",
    action: "Lassen Sie uns mit groben, aber realistischen Schätzungen starten. Verfeinern können wir später immer noch."
  },

  procrastination: {
    identify: "Sie schieben die Zahlenarbeit gerne auf. Das machen viele - Zahlen fühlen sich endgültig an.",
    evidence: "Was befürchten Sie, was passiert, wenn Sie sich jetzt konkret festlegen?",
    challenge: "Wird das Verschieben das Problem lösen? Oder wird es größer, je länger Sie warten?",
    reframe: "Diese Zahlen sind nicht in Stein gemeißelt. Sie helfen Ihnen, Ihr Business besser zu verstehen.",
    action: "Wir machen jetzt einen ersten Durchlauf - schnell und pragmatisch. Das nimmt den Druck raus."
  }
};

// ============================================================================
// Scaffolding Questions by Component
// ============================================================================

export const KAPITALBEDARF_QUESTIONS = {
  gruendungskosten: {
    intro: [
      "Lassen Sie uns mit den Gründungskosten starten - das sind einmalige Kosten für die offizielle Gründung.",
      "Was für eine Rechtsform haben Sie gewählt? Das bestimmt die meisten Gründungskosten.",
    ],

    components: [
      "Notar und Handelsregister - bei GmbH ca. €800-1.500, bei UG günstiger. Wie ist das bei Ihnen?",
      "Brauchen Sie Beratung für die Gründung? Steuerberater, Anwalt? Rechnen Sie mit €500-2.000.",
      "Erstes Marketing - Logo, Website-Basis, Visitenkarten? Budget ca. €1.000-3.000.",
      "Sonstige Gründungskosten - Gewerbeanmeldung, Kammern, Versicherungen? Ca. €500-1.000.",
    ],

    reality_check: [
      "Bei Ihrer Rechtsform {rechtsform} sind die typischen Gründungskosten €{betrag}. Passt das zu Ihrer Einschätzung?",
      "Haben Sie schon konkrete Angebote für Notar/Steuerberater? Oder schätzen wir realistisch?",
    ],
  },

  investitionen: {
    intro: [
      "Jetzt zu den Investitionen - was brauchen Sie an Ausstattung, um arbeiten zu können?",
      "Denken Sie dabei an: Büroausstattung, Technik, Fahrzeuge, Maschinen, Software.",
    ],

    categories: [
      "Büroausstattung - Schreibtisch, Stuhl, Schränke. Neu oder gebraucht? Budget?",
      "IT-Ausstattung - Laptop, Bildschirm, Drucker, Software. Was haben Sie, was brauchen Sie?",
      "Fahrzeuge - brauchen Sie ein Auto/Transporter für Ihr Business? Kauf oder Leasing?",
      "Branchenspezifische Ausstattung - bei Ihrem Business '{businessType}', was ist speziell nötig?",
      "Software/Lizenzen - welche Tools, Programme, Abos brauchen Sie unbedingt?",
    ],

    prioritization: [
      "Was davon brauchen Sie vom ersten Tag an? Was kann auch später kommen?",
      "Wo können Sie sparen, ohne dass die Qualität Ihrer Arbeit leidet?",
      "Gibt es Alternativen - mieten statt kaufen, gebraucht statt neu?",
    ],
  },

  anlaufkosten: {
    intro: [
      "Zum Schluss die Anlaufkosten - Ihr finanzielles Polster für die ersten Monate.",
      "Wie viele Monate soll Sie das Geld überbrücken, bis die Einnahmen fließen?",
    ],

    components: [
      "Laufende Betriebskosten - Miete, Versicherung, Marketing. Pro Monat ca. €{betrag}?",
      "Ihr Lebensunterhalt - was brauchen Sie privat zum Leben? €{privatentnahme} pro Monat?",
      "Sicherheitsreserve - für unvorhergesehene Ausgaben. Wie risikofreudig sind Sie?",
    ],

    realism_check: [
      "Bei €{monatlich} monatlichen Kosten für {monate} Monate sind das €{summe}. Realistisch?",
      "Was ist Ihr Plan, wenn das Geld nach {monate} Monaten noch nicht reicht?",
      "Haben Sie weitere Finanzierungsquellen als Backup?",
    ],
  },
};

// ============================================================================
// Industry-Specific Guidance
// ============================================================================

export const INDUSTRY_SPECIFIC_GUIDANCE = {
  beratung: {
    gruendungskosten: "Als Berater reicht oft eine UG - günstige Gründung.",
    investitionen: "Laptop, gute Software, Home-Office Setup reicht meist.",
    anlaufkosten: "Rechnen Sie mit 6-12 Monaten bis zu regelmäßigen Aufträgen.",
  },

  ecommerce: {
    gruendungskosten: "Online-Shop Setup, Rechtssicherheit wichtig.",
    investitionen: "Warenlager, Verpackungsmaterial, Shop-Software.",
    anlaufkosten: "Marketing-Budget für Traffic, 3-6 Monate Warenvorlauf.",
  },

  handwerk: {
    gruendungskosten: "Meisterprüfung, Kammern, evtl. höhere Beträge.",
    investitionen: "Werkzeug, Fahrzeug, evtl. Werkstatt - höherer Bedarf.",
    anlaufkosten: "Erste Aufträge dauern, Material-Vorfinanzierung.",
  },

  restaurant: {
    gruendungskosten: "Gewerbegenehmigung, Gesundheitsamt, GEMA.",
    investitionen: "Küchenausstattung, Gastraum, Erstausstattung - sehr hoch.",
    anlaufkosten: "Personal von Tag 1, hohe Vorlaufkosten, 6-12 Monate.",
  },

  default: {
    gruendungskosten: "Rechtsform-abhängig, meist €1.000-3.000.",
    investitionen: "Arbeitsplatz-Ausstattung, branchenspezifische Tools.",
    anlaufkosten: "3-6 Monate Überbrückung bis zu stabilen Einnahmen.",
  },
};

// ============================================================================
// Main Prompt Builder
// ============================================================================

export function buildKapitalbedarfPrompt(
  options: KapitalbedarfPromptOptions = {},
  userMessage: string,
  _conversationHistory: Array<{role: string; content: string}>
): string {
  const {
    businessIdea,
    organisation,
    rechtsform,
    numberConfidence = 'medium',
    existingData = {},
  } = options;

  // Detect number anxiety
  const anxiety = detectNumberAnxiety(userMessage);

  // Note: Could integrate limiting belief detection here if needed

  // Industry-specific guidance
  const businessType = businessIdea?.businessType || 'default';
  const industryGuide = INDUSTRY_SPECIFIC_GUIDANCE[businessType as keyof typeof INDUSTRY_SPECIFIC_GUIDANCE] ||
                        INDUSTRY_SPECIFIC_GUIDANCE.default;

  const prompt = `# Finanzplanung Teil A: Kapitalbedarf

## Coaching-Kontext

Du führst durch die **Kapitalbedarfsplanung** - den ersten und wichtigsten Teil der Finanzplanung.

**Ziel:** Ermittlung des Gesamtkapitalbedarfs in drei Komponenten:
1. **Gründungskosten** (einmalig): Notar, Beratung, Marketing, etc.
2. **Investitionen** (Anschaffungen): Ausstattung, IT, Fahrzeuge, etc.
3. **Anlaufkosten** (Überbrückung): Lebensunterhalt + Betrieb für erste Monate

**Nutzer-Profil:**
- Geschäftsidee: ${businessIdea?.problem || 'Nicht spezifiziert'} → ${businessIdea?.solution || 'Nicht spezifiziert'}
- Branche: ${businessType}
- Zahlenkompetenz: ${numberConfidence}
- Rechtsform: ${rechtsform?.legalForm || 'Noch nicht festgelegt'}
- Teamgröße: ${organisation?.teamSize || 1}

${anxiety ? `**⚠️ Zahlen-Angst erkannt:** ${anxiety}` : ''}

## CBC Integration für "Ich bin kein Zahlenmensch"

${anxiety ? generateCBCIntervention(anxiety) : ''}

## Coaching-Prinzipien

1. **Scaffold-Ansatz** - "Wir machen das zusammen, Schritt für Schritt"
2. **Konkrete Zahlen** - Keine Schätzungen ohne Begründung
3. **Branchenwissen nutzen** - ${industryGuide.gruendungskosten}
4. **Realismus fördern** - Weder zu optimistisch noch zu pessimistisch
5. **Sicherheit schaffen** - Ausreichende Reserven einplanen

## Strukturierung

### Phase 1: Gründungskosten (€1.000-5.000)
${generateGruendungskostenGuidance(rechtsform)}

### Phase 2: Investitionen (€5.000-50.000+)
${generateInvestitionenGuidance(businessType, industryGuide)}

### Phase 3: Anlaufkosten (€15.000-30.000)
${generateAnlaufkostenGuidance(organisation)}

## Test-Szenario Integration
**Standard GZ-Szenario (€50.000):**
- Gründungskosten: €15.000
- Anlaufkosten: €25.000
- Reserve: €10.000
- **Gesamt: €50.000**

Prüfe die Nutzer-Zahlen gegen diese Benchmark.

## Ausgabe-Format

Du MUSST in diesem exakten JSON-Format antworten:

\`\`\`json
{
  "response": "Deine empathische, strukturierte Coaching-Antwort hier",
  "moduleData": {
    "kapitalbedarf": {
      // Aktualisierte Kapitalbedarf-Daten basierend auf Gespräch
      "gruendungskosten": {
        "notar": 0,
        "handelsregister": 0,
        "beratung": 0,
        "marketing": 0,
        "sonstige": 0,
        "summe": 0
      },
      "investitionen": [],
      "investitionenSumme": 0,
      "anlaufkosten": {
        "monate": 6,
        "monatlicheKosten": 0,
        "reserve": 0,
        "summe": 0
      },
      "gesamtkapitalbedarf": 0
    }
  },
  "coachingNotes": {
    "anxiety": "${anxiety || 'none'}",
    "cbcStep": "${anxiety ? 'IDENTIFY' : 'none'}",
    "nextSteps": ["Konkrete nächste Schritte"],
    "warnings": ["Erkannte Risiken oder unrealistische Zahlen"],
    "progress": "% der Kapitalbedarf-Planung abgeschlossen"
  }
}
\`\`\`

## Aktuelle Situation

**Bestehende Daten:**
${JSON.stringify(existingData, null, 2)}

**Nutzer-Nachricht:**
"${userMessage}"

**Aufgabe:** Führe das Gespräch strukturiert und empathisch. Nutze konkrete Zahlen und Beispiele. Bei Zahlen-Angst: CBC anwenden. Bei unrealistischen Zahlen: sanft hinterfragen.`;

  return prompt;
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateCBCIntervention(anxiety: string): string {
  const response = NUMBER_ANXIETY_CBC_RESPONSES[anxiety as keyof typeof NUMBER_ANXIETY_CBC_RESPONSES];

  return `
### CBC 5-Schritt Intervention

**IDENTIFY:** ${response.identify}
**EVIDENCE:** ${response.evidence}
**CHALLENGE:** ${response.challenge}
**REFRAME:** ${response.reframe}
**ACTION:** ${response.action}

Verwende diese Struktur in deiner Antwort.`;
}

function generateGruendungskostenGuidance(rechtsform?: { legalForm: string; needsNotary: boolean; registrationFees: number }): string {
  if (!rechtsform) {
    return "- Notar/Handelsregister: €500-1.500 (abhängig von Rechtsform)\n- Beratungskosten: €500-2.000\n- Erstes Marketing: €1.000-3.000\n- Sonstige: €500-1.000";
  }

  const { legalForm, registrationFees } = rechtsform;

  return `- Notar/Handelsregister: €${registrationFees} (${legalForm})
- Beratungskosten: €500-2.000 (Steuerberater, evtl. Anwalt)
- Erstes Marketing: €1.000-3.000 (Logo, Website, Visitenkarten)
- Sonstige: €500-1.000 (Gewerbe, Kammer, Versicherungen)`;
}

function generateInvestitionenGuidance(businessType: string, industryGuide: any): string {
  return `**${businessType.toUpperCase()}:** ${industryGuide.investitionen}

**Kategorien durchgehen:**
- Büroausstattung (€2.000-8.000)
- IT-Ausstattung (€3.000-10.000)
- Fahrzeuge (€0-25.000+)
- Branchenspezifisch (variabel)
- Software/Lizenzen (€500-2.000/Jahr)`;
}

function generateAnlaufkostenGuidance(organisation?: { teamSize: number }): string {
  const team = organisation?.teamSize || 1;
  const multiplier = team === 1 ? 1 : team * 0.8; // Team efficiency

  return `**Für ${team} Person(en):**
- Laufende Betriebskosten: €500-2.000/Monat
- Lebensunterhalt: €2.500-4.000/Monat × ${multiplier}
- Pufferzeit: 3-12 Monate (typisch: 6 Monate)
- Sicherheitsreserve: 20-30% on top

**Faustregel:** 6 Monate × (Betrieb + Leben) × 1.25 Sicherheit`;
}

export default {
  buildKapitalbedarfPrompt,
  detectNumberAnxiety,
  NUMBER_ANXIETY_CBC_RESPONSES,
  KAPITALBEDARF_QUESTIONS,
};