/**
 * Finanzplanung Teil E: Kostenplanung Prompt (GZ-602)
 *
 * Cost Planning Module with:
 * - CBC handling for cost blindspots and wishful thinking
 * - Fixed vs variable cost structure modeling
 * - German business cost compliance and benchmarking
 * - Integration with Privatentnahme and Kapitalbedarf data
 *
 * Features:
 * - Comprehensive cost category coverage
 * - CBC 5-step pattern for cost blindness and underestimation
 * - Industry-specific cost structure guidance
 * - Fixed/variable cost separation for break-even analysis
 *
 * Based on:
 * - gz-coaching-cbc.md (CBC for cost denial and optimism bias)
 * - gz-system-coaching-core.md (GROW model)
 * - German business cost structures and compliance requirements
 */

import type {
  Kostenplanung,
} from '@/types/modules/finanzplanung';

// ============================================================================
// Types
// ============================================================================

export interface KostenplanungPromptOptions {
  /** Current business idea from previous modules */
  businessIdea?: {
    problem: string;
    solution: string;
    businessType: string;
    location: string;
  };

  /** Organization data */
  organisation?: {
    teamSize: number;
    needsOffice: boolean;
    equipmentNeeds: string[];
  };

  /** Revenue planning data */
  umsatzplanung?: {
    umsatzJahr1Summe: number;
    umsatzJahr2: number;
    umsatzJahr3: number;
  };

  /** Kapitalbedarf data for depreciation */
  kapitalbedarf?: {
    investitionen: Array<{ name: string; betrag: number; nutzungsdauer?: number }>;
  };

  /** Privatentnahme data for owner salary */
  privatentnahme?: {
    monatlichePrivatentnahme: number;
  };

  /** User's attitude towards costs */
  costAwareness?: 'high' | 'medium' | 'low' | 'denial';

  /** Existing partial data */
  existingData?: Partial<Kostenplanung>;
}

// ============================================================================
// Cost Blindness Detection Patterns
// ============================================================================

export const COST_BLINDNESS_PATTERNS = {
  obvious_only: [
    /kosten.*nur.*miete/i,
    /hauptkosten.*personal/i,
    /hauptsächlich.*miete/i,
    /sonst.*nichts.*großes/i,
    /kosten.*minimal/i,
  ],

  free_marketing: [
    /kostenlos.*marketing/i,
    /gratis.*werbung/i,
    /social.*media.*kostet.*nichts/i,
    /marketing.*umsonst/i,
    /keine.*werbekosten/i,
  ],

  hidden_taxes: [
    /steuer.*nicht.*viel/i,
    /abgaben.*minimal/i,
    /steuer.*später/i,
    /erstmal.*ohne.*steuern/i,
    /steuerberater.*unnötig/i,
  ],

  scaling_ignorance: [
    /kosten.*gleich.*bleiben/i,
    /fix.*für.*immer/i,
    /wächst.*ohne.*mehr.*kosten/i,
    /keine.*zusätzlichen.*kosten/i,
    /automatisch.*skaliert/i,
  ],

  perfection_assumption: [
    /läuft.*alles.*glatt/i,
    /keine.*probleme/i,
    /alles.*nach.*plan/i,
    /puffer.*unnötig/i,
    /reserve.*übertrieben/i,
  ],

  competitor_ignorance: [
    /konkurrenz.*billig/i,
    /preisdruck.*kein.*thema/i,
    /marketing.*wenig.*nötig/i,
    /kunden.*kommen.*allein/i,
  ],
};

export function detectCostBlindness(message: string): 'obvious_only' | 'free_marketing' | 'hidden_taxes' | 'scaling_ignorance' | 'perfection_assumption' | 'competitor_ignorance' | null {
  const text = message.toLowerCase();

  if (COST_BLINDNESS_PATTERNS.obvious_only.some(p => p.test(text))) return 'obvious_only';
  if (COST_BLINDNESS_PATTERNS.free_marketing.some(p => p.test(text))) return 'free_marketing';
  if (COST_BLINDNESS_PATTERNS.hidden_taxes.some(p => p.test(text))) return 'hidden_taxes';
  if (COST_BLINDNESS_PATTERNS.scaling_ignorance.some(p => p.test(text))) return 'scaling_ignorance';
  if (COST_BLINDNESS_PATTERNS.perfection_assumption.some(p => p.test(text))) return 'perfection_assumption';
  if (COST_BLINDNESS_PATTERNS.competitor_ignorance.some(p => p.test(text))) return 'competitor_ignorance';

  return null;
}

// ============================================================================
// CBC Responses for Cost Blindness
// ============================================================================

export const COST_BLINDNESS_CBC_RESPONSES = {
  obvious_only: {
    identify: "Sie konzentrieren sich auf die offensichtlichen Kosten. Das ist ein guter Anfang, aber oft sind die versteckten Kosten entscheidend.",
    evidence: "Welche Kosten fallen Ihnen spontan ein, die Sie noch nicht erwähnt haben? Versicherungen, Software, Marketing?",
    challenge: "Was wäre, wenn Sie alle kleinen Posten vergessen? Wird Ihr Business dann noch profitabel?",
    reframe: "Erfolgreiche Unternehmer denken in Kostenkategorien, nicht nur in großen Posten. Vollständigkeit ist wichtiger als Perfektion.",
    action: "Gehen wir systematisch durch alle Kostenkategorien - von Personal bis Steuern. Lieber einmal zu viel als zu wenig.",
  },

  free_marketing: {
    identify: "Sie planen mit kostenlosen Marketing-Kanälen. Das ist verlockend, aber meist nicht ausreichend für schnelles Wachstum.",
    evidence: "Wie viele erfolgreiche Unternehmen kennen Sie, die nur mit kostenlosen Marketing gewachsen sind? Wie lange hat das gedauert?",
    challenge: "Was passiert, wenn Social Media nicht funktioniert oder die Algorithmen ändern? Haben Sie einen Plan B?",
    reframe: "Auch 'kostenloses' Marketing kostet Zeit. Ihre Zeit hat einen Wert. Oft ist bezahltes Marketing effizienter.",
    action: "Planen wir sowohl organisches als auch bezahltes Marketing. Mindestens 5-15% vom Umsatz ist branchenüblich.",
  },

  hidden_taxes: {
    identify: "Sie scheinen Steuern und Abgaben zu unterschätzen. Das ist ein häufiger und teurer Fehler.",
    evidence: "Haben Sie schon mal ausgerechnet, was Sozialversicherung, Gewerbesteuer und Einkommensteuer zusammen sind?",
    challenge: "Bei €100.000 Gewinn zahlen Sie als Einzelunternehmer oft €35.000+ an Steuern und Abgaben. Ist das eingeplant?",
    reframe: "Steuern sind Betriebskosten wie alle anderen auch. Sie früh zu planen hilft, böse Überraschungen zu vermeiden.",
    action: "Rechnen wir mit 25-35% vom Gewinn für Steuern und Sozialabgaben. Lieber zu viel zurücklegen als zu wenig.",
  },

  scaling_ignorance: {
    identify: "Sie gehen davon aus, dass Kosten gleich bleiben, wenn das Business wächst. Das ist leider selten der Fall.",
    evidence: "Welche Kosten steigen, wenn Sie doppelt so viel Umsatz machen? Personal, Marketing, Miete, Logistik?",
    challenge: "Was passiert, wenn Sie plötzlich mehr Kundensupport, größere Lager oder mehr Personal brauchen?",
    reframe: "Skaleneffekte gibt es, aber oft erst ab einer gewissen Größe. Anfangs wachsen viele Kosten proportional mit.",
    action: "Unterscheiden wir zwischen fixen und variablen Kosten. Variable Kosten wachsen mit dem Umsatz.",
  },

  perfection_assumption: {
    identify: "Sie planen mit einem perfekten Szenario ohne Puffer oder unvorhergesehene Ausgaben.",
    evidence: "Was war das Unvorhersehbarste, das Ihnen in den letzten Jahren passiert ist? Finanziell oder geschäftlich?",
    challenge: "Was kostet es, wenn mal etwas schiefgeht? Defekte Technik, kranke Mitarbeiter, verlorene Kunden?",
    reframe: "Risiko-Management ist Teil der Kostenkalkulation. Puffer sind Versicherungen, nicht Verschwendung.",
    action: "Planen wir 10-20% Puffer für Unvorhergesehenes ein. Besser haben und nicht brauchen als umgekehrt.",
  },

  competitor_ignorance: {
    identify: "Sie scheinen davon auszugehen, dass Konkurrenz Ihre Kostenstruktur nicht beeinflussen wird.",
    evidence: "Was passiert, wenn ein Konkurrent billiger wird? Oder wenn Sie mehr Marketing brauchen, um sichtbar zu bleiben?",
    challenge: "Wie werden Sie reagieren, wenn der Preisdruck steigt? Können Sie Ihre Kosten senken oder müssen Sie die Qualität reduzieren?",
    reframe: "Wettbewerbsfähigkeit bedeutet auch kosteneffizient zu sein. Eine schlanke Kostenstruktur ist ein Wettbewerbsvorteil.",
    action: "Schauen wir, wo Sie Kosten optimieren können, ohne die Qualität zu gefährden. Effizienz von Anfang an.",
  },
};

// ============================================================================
// Cost Category Scaffolding Questions
// ============================================================================

export const KOSTENPLANUNG_QUESTIONS = {
  personal_costs: {
    intro: [
      "Fangen wir mit den Personalkosten an - oft der größte Kostenfaktor.",
      "Dazu gehört auch Ihr eigenes Gehalt, nicht nur Angestellte.",
    ],

    owner_salary: [
      "Unternehmerlohn - wie viel zahlen Sie sich selbst? Das ist ein Betriebskosten!",
      "Ihre Privatentnahme von €{privatentnahme}/Monat - ist das als Personalkosten eingeplant?",
      "Sozialabgaben für Sie selbst - Krankenversicherung, Rente. Wie viel monatlich?",
    ],

    employees: [
      "Mitarbeiter - wen brauchen Sie? Vollzeit, Teilzeit, Freelancer?",
      "Bruttolöhne plus Sozialabgaben (ca. 20% on top bei Angestellten)",
      "Wann stellen Sie wen ein? Monat 1 oder später?",
    ],

    external: [
      "Externe Dienstleister - Steuerberater, IT-Support, Reinigung?",
      "Honorare für Freelancer oder Subunternehmer?",
      "Weiterbildung für Sie und Ihr Team?",
    ],
  },

  operational_costs: {
    intro: [
      "Jetzt zu den laufenden Betriebskosten - was brauchen Sie zum Arbeiten?",
      "Diese Kosten fallen meist monatlich an, unabhängig vom Umsatz.",
    ],

    location: [
      "Büro/Werkstatt - Miete, Nebenkosten, Reinigung. Pro Monat?",
      "Home-Office-Anteil - wenn privat genutzt, welcher Anteil ist geschäftlich?",
      "Lager/Storage - brauchen Sie Platz für Waren oder Material?",
    ],

    insurance: [
      "Betriebshaftpflicht - in Ihrer Branche besonders wichtig?",
      "Rechtsschutz, Cyber-Versicherung, Produkthaftpflicht?",
      "Fahrzeug-Versicherung für Geschäftsfahrzeuge?",
    ],

    technology: [
      "Software-Abos - welche Tools brauchen Sie dauerhaft?",
      "Telefon, Internet, Handy - geschäftlicher Anteil?",
      "IT-Support, Cloud-Services, Backup-Lösungen?",
    ],
  },

  variable_costs: {
    intro: [
      "Variable Kosten ändern sich mit Ihrem Umsatz - mehr Umsatz = mehr Kosten.",
      "Diese sind oft prozentual vom Umsatz planbar.",
    ],

    material_goods: [
      "Wareneinkauf - bei €{umsatz} Umsatz wie viel % für Waren/Material?",
      "Verpackung, Versand, Logistik - prozentual vom Umsatz?",
      "Lagerkosten, Schwund, Retourenabwicklung?",
    ],

    marketing: [
      "Online-Marketing - Google Ads, Facebook, etc. Budget pro Monat?",
      "Offline-Marketing - Messen, Print, Events. Jahresbudget?",
      "Content-Erstellung, Design, Fotografie?",
      "Typisch: 5-15% vom Umsatz für Marketing",
    ],

    taxes: [
      "Gewerbesteuer - je nach Gemeinde 14-17% vom Gewinn",
      "Einkommensteuer - progressiv, ca. 25-35% bei mittleren Einkommen",
      "Sozialabgaben - Kranken-, Pflege-, Rentenversicherung",
      "Insgesamt ca. 25-40% vom Gewinn für alle Abgaben",
    ],
  },
};

// ============================================================================
// Industry-Specific Cost Guidance
// ============================================================================

export const INDUSTRY_COST_GUIDANCE = {
  beratung: {
    personal: "30-50% vom Umsatz - Hauptkostenfaktor bei Wissensarbeit",
    material: "Minimal 1-3% - meist nur Büromaterial und Software",
    marketing: "8-15% - Netzwerk-Events, Content-Marketing, LinkedIn",
    overhead: "15-25% - Home-Office kann Kosten niedrig halten",
    tips: "Home-Office nutzen, variable Kosten niedrig halten, in Reputation investieren",
    warnings: "Unternehmerlohn nicht vergessen, Sozialabgaben als Selbstständiger",
  },

  ecommerce: {
    personal: "15-30% - kann durch Automatisierung optimiert werden",
    material: "40-65% - Wareneinkauf ist Hauptkostentreiber",
    marketing: "10-25% - Online-Marketing essential für Traffic",
    overhead: "10-20% - Lager, Verpackung, Returns",
    tips: "Automatisierung investieren, Lagerumschlag optimieren, Performance Marketing",
    warnings: "Retourenkosten einplanen, Zahlungsausfälle puffern, Saisonalität beachten",
  },

  handwerk: {
    personal: "25-40% - Fachkräfte sind teuer und knapp",
    material: "30-50% - Materialpreise schwanken stark",
    marketing: "5-10% - meist lokales Marketing, Mundpropaganda",
    overhead: "15-25% - Fahrzeuge, Werkzeug, Versicherung",
    tips: "Materialpreise weiterreichen, Effizienz durch Planung, Wartungsverträge",
    warnings: "Wetterabhängigkeit puffern, Materialschwankungen einplanen",
  },

  restaurant: {
    personal: "30-45% - Service ist personalintensiv",
    material: "25-35% - Lebensmittelkosten (Food Cost)",
    marketing: "3-8% - meist lokale Werbung, Events",
    overhead: "25-35% - Miete, Energie, Wartung sehr hoch",
    tips: "Prime Location rechtfertigen, Speisekarte-Engineering, Effizienz",
    warnings: "Lebensmittelschwund, Saisonalität, hohe Fixkosten bei niedrigen Margen",
  },

  software: {
    personal: "60-80% - Entwickler sind teurer Hauptkostenfaktor",
    material: "1-5% - Cloud-Hosting, APIs, Tools",
    marketing: "15-30% - Customer Acquisition Cost oft hoch",
    overhead: "5-15% - meist niedrig bei remote Work",
    tips: "Remote-First, Cloud-native, Performance Marketing, Retention fokussieren",
    warnings: "Customer Acquisition Cost vs Lifetime Value, Churn-Rate beachten",
  },

  default: {
    personal: "25-40% - variiert stark je nach Automatisierungsgrad",
    material: "20-50% - abhängig vom Geschäftsmodell",
    marketing: "5-15% - je nach Wettbewerbsintensität",
    overhead: "15-25% - Büro, Versicherung, Verwaltung",
    tips: "Kostenstruktur regelmäßig überprüfen, Benchmarks nutzen",
    warnings: "Hidden Costs beachten, Skalierungseffekte realistisch einschätzen",
  },
};

// ============================================================================
// Main Prompt Builder
// ============================================================================

export function buildKostenplanungPrompt(
  options: KostenplanungPromptOptions = {},
  userMessage: string,
  _conversationHistory: Array<{role: string; content: string}>
): string {
  const {
    businessIdea,
    organisation,
    umsatzplanung,
    kapitalbedarf,
    privatentnahme,
    costAwareness = 'medium',
    existingData = {},
  } = options;

  // Detect cost blindness
  const blindnessType = detectCostBlindness(userMessage);

  // Industry-specific guidance
  const businessType = businessIdea?.businessType || 'default';
  const industryGuide = INDUSTRY_COST_GUIDANCE[businessType as keyof typeof INDUSTRY_COST_GUIDANCE] ||
                        INDUSTRY_COST_GUIDANCE.default;

  const prompt = `# Finanzplanung Teil E: Kostenplanung

## Coaching-Kontext

Du führst durch die **Kostenplanung** - die Basis für Break-Even und Profitabilität.

**Ziel:** Vollständige und realistische Kostenschätzung für 3 Jahre:
1. **Fixkosten** (unabhängig vom Umsatz)
2. **Variable Kosten** (steigen mit Umsatz)
3. **Versteckte Kosten** aufdecken und quantifizieren
4. **Kostenstruktur optimieren** für Wettbewerbsfähigkeit

**Nutzer-Profil:**
- Geschäftsidee: ${businessIdea?.problem || 'Nicht spezifiziert'} → ${businessIdea?.solution || 'Nicht spezifiziert'}
- Branche: ${businessType}
- Teamgröße: ${organisation?.teamSize || 1}
- Kostenbewusstsein: ${costAwareness}
- Geplanter Umsatz Jahr 1: ${umsatzplanung?.umsatzJahr1Summe ? `€${umsatzplanung.umsatzJahr1Summe.toLocaleString('de-DE')}` : 'Noch nicht geplant'}
- Privatentnahme: ${privatentnahme?.monatlichePrivatentnahme ? `€${privatentnahme.monatlichePrivatentnahme}/Monat` : 'Noch nicht geplant'}

${blindnessType ? `**⚠️ Kostenblindheit erkannt:** ${blindnessType}` : ''}

## CBC Integration für Kostenblindheit

${blindnessType ? generateCBCIntervention(blindnessType) : ''}

## Coaching-Prinzipien

1. **Vollständigkeit vor Perfektion** - Lieber alle Posten ungefähr als wenige genau
2. **Fix vs. Variabel** - Wichtig für Break-Even-Berechnung
3. **Versteckte Kosten aufdecken** - Steuern, Versicherungen, Buffer
4. **Branchenbenchmarks** - Realistische Kostenstrukturen
5. **Optimierung möglich** - Kosteneffizienz als Wettbewerbsvorteil

## Branchenwissen

**${businessType.toUpperCase()}:**
- **Personal:** ${industryGuide.personal}
- **Material:** ${industryGuide.material}
- **Marketing:** ${industryGuide.marketing}
- **Overhead:** ${industryGuide.overhead}
- **Tipps:** ${industryGuide.tips}
- **⚠️ Warnung:** ${industryGuide.warnings}

## Strukturierung

### Phase 1: Personalkosten (meist 25-45%)
${generatePersonalkostenGuidance(privatentnahme, organisation)}

### Phase 2: Laufende Betriebskosten (15-30%)
${generateBetriebskostenGuidance(businessType, organisation)}

### Phase 3: Variable Kosten (20-65%)
${generateVariableKostenGuidance(businessType, umsatzplanung)}

### Phase 4: Versteckte Kosten & Steuern (15-25%)
${generateVersteckteKostenGuidance(umsatzplanung)}

## Integration mit vorhandenen Daten

${kapitalbedarf ? generateDepreciationGuidance(kapitalbedarf) : ''}

**Break-Even-Check:**
Mit Umsatz von €${umsatzplanung?.umsatzJahr1Summe?.toLocaleString('de-DE') || 'X'} und Ihren Kosten:
- Deckungsbeitrag nach variablen Kosten?
- Können Sie die Fixkosten decken?
- Wann erreichen Sie Break-Even?

## Ausgabe-Format

Du MUSST in diesem exakten JSON-Format antworten:

\`\`\`json
{
  "response": "Deine empathische, strukturierte Coaching-Antwort hier",
  "moduleData": {
    "kostenplanung": {
      "fixkosten": [
        {
          "name": "Position Name",
          "kategorie": "personal|miete|versicherung|marketing|material|abschreibung|zinsen|steuern|sonstige",
          "fixOderVariabel": "fix",
          "betragMonatlich": 0,
          "betragJaehrlich": 0
        }
      ],
      "variableKosten": [
        {
          "name": "Position Name",
          "kategorie": "kategorie",
          "fixOderVariabel": "variabel",
          "betragMonatlich": 0,
          "betragJaehrlich": 0,
          "variablerAnteil": 0
        }
      ],
      "fixkostenSummeMonatlich": 0,
      "fixkostenSummeJaehrlich": 0,
      "variableKostenSummeJahr1": 0,
      "variableKostenSummeJahr2": 0,
      "variableKostenSummeJahr3": 0,
      "gesamtkostenJahr1": 0,
      "gesamtkostenJahr2": 0,
      "gesamtkostenJahr3": 0
    }
  },
  "coachingNotes": {
    "blindness": "${blindnessType || 'none'}",
    "cbcStep": "${blindnessType ? 'IDENTIFY' : 'none'}",
    "nextSteps": ["Konkrete nächste Schritte"],
    "warnings": ["Erkannte Kostenrisiken oder fehlende Posten"],
    "costEfficiency": "Bewertung der Kostenstruktur",
    "progress": "% der Kostenplanung abgeschlossen"
  }
}
\`\`\`

## Aktuelle Situation

**Bestehende Daten:**
${JSON.stringify(existingData, null, 2)}

**Nutzer-Nachricht:**
"${userMessage}"

**Aufgabe:** Führe die Kostenerstellung systematisch und vollständig durch. Bei Kostenblindheit: CBC anwenden. Bei unrealistischen Kosteneinschätzungen: Benchmarks und Realität aufzeigen. Fokus auf Vollständigkeit und Wettbewerbsfähigkeit.`;

  return prompt;
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateCBCIntervention(blindnessType: string): string {
  const response = COST_BLINDNESS_CBC_RESPONSES[blindnessType as keyof typeof COST_BLINDNESS_CBC_RESPONSES];

  return `
### CBC 5-Schritt Intervention

**IDENTIFY:** ${response.identify}
**EVIDENCE:** ${response.evidence}
**CHALLENGE:** ${response.challenge}
**REFRAME:** ${response.reframe}
**ACTION:** ${response.action}

Verwende diese Struktur in deiner Antwort.`;
}

function generatePersonalkostenGuidance(privatentnahme?: { monatlichePrivatentnahme: number }, organisation?: { teamSize: number }): string {
  const team = organisation?.teamSize || 1;
  const ownerSalary = privatentnahme?.monatlichePrivatentnahme || 0;

  return `**PERSONALKOSTEN (oft vergessen: Unternehmerlohn!):**
- Ihr Gehalt: ${ownerSalary ? `€${ownerSalary}/Monat bereits in Privatentnahme geplant` : 'Noch nicht definiert'}
- Sozialabgaben für Sie: KV, PV, RV als Selbstständiger
- Team (${team} Personen): Bruttolohn + 20% Arbeitgeberanteil
- Externe Dienstleister: Steuerberater, IT-Support, Freelancer`;
}

function generateBetriebskostenGuidance(businessType: string, organisation?: { needsOffice: boolean }): string {
  const needsOffice = organisation?.needsOffice ?? true;

  return `**LAUFENDE BETRIEBSKOSTEN (${businessType.toUpperCase()}):**
- Miete: ${needsOffice ? 'Büro/Werkstatt' : 'Home-Office-Anteil'} + Nebenkosten
- Versicherungen: Haftpflicht, Rechtsschutz, ${businessType === 'handwerk' ? 'Berufshaftpflicht' : 'Cyber-Versicherung'}
- Kommunikation: Telefon, Internet, Handy (geschäftlich)
- Software/Tools: ${businessType === 'software' ? 'Development-Tools, Cloud' : businessType === 'ecommerce' ? 'Shop-Software, Analytics' : 'Office, Buchhaltung'}`;
}

function generateVariableKostenGuidance(businessType: string, umsatzplanung?: { umsatzJahr1Summe: number }): string {
  const revenue = umsatzplanung?.umsatzJahr1Summe || 100000;

  return `**VARIABLE KOSTEN (wachsen mit Umsatz von €${revenue.toLocaleString('de-DE')}):**
- Material/Waren: ${businessType === 'ecommerce' ? '40-65%' : businessType === 'handwerk' ? '30-50%' : '1-10%'} vom Umsatz
- Marketing: ${businessType === 'software' ? '15-30%' : businessType === 'beratung' ? '8-15%' : '5-15%'} vom Umsatz
- Provision/Vertrieb: Falls Sie externe Verkäufer haben
- Zahlungsabwicklung: 1-3% bei Online-Payments`;
}

function generateVersteckteKostenGuidance(umsatzplanung?: { umsatzJahr1Summe: number }): string {
  const revenue = umsatzplanung?.umsatzJahr1Summe || 100000;
  const estimatedTax = Math.round(revenue * 0.15); // Conservative estimate

  return `**VERSTECKTE KOSTEN (oft unterschätzt!):**
- Steuern: ca. €${estimatedTax.toLocaleString('de-DE')} bei €${revenue.toLocaleString('de-DE')} Gewinn (15-35%)
- Unvorhergesehenes: 10-15% Puffer für Reparaturen, Ausfälle
- Weiterbildung: 1-3% für Ihre fachliche Entwicklung
- Buchhaltung/Steuerberatung: €200-1.000/Monat je nach Komplexität`;
}

function generateDepreciationGuidance(kapitalbedarf: { investitionen: Array<{ name: string; betrag: number; nutzungsdauer?: number }> }): string {
  const totalInvestments = kapitalbedarf.investitionen.reduce((sum, inv) => sum + inv.betrag, 0);
  const avgDepreciation = totalInvestments / 5; // 5 years average

  return `
**ABSCHREIBUNGEN (aus Kapitalbedarf):**
- Investitionen gesamt: €${totalInvestments.toLocaleString('de-DE')}
- Geschätzte jährliche Abschreibung: €${avgDepreciation.toLocaleString('de-DE')}
- Monatlich: €${(avgDepreciation/12).toLocaleString('de-DE')}

Diese Abschreibungen sind Fixkosten und reduzieren Ihre Steuerlast.`;
}

export default {
  buildKostenplanungPrompt,
  detectCostBlindness,
  COST_BLINDNESS_CBC_RESPONSES,
  KOSTENPLANUNG_QUESTIONS,
};