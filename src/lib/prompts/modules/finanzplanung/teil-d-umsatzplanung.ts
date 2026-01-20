/**
 * Finanzplanung Teil D: Umsatzplanung Prompt (GZ-602)
 *
 * Revenue Planning Module with:
 * - CBC handling for revenue optimism and unrealistic projections
 * - Multi-stream revenue modeling approach
 * - German market realism and industry benchmarking
 * - Integration with existing business model data
 *
 * Features:
 * - Revenue stream identification and quantification
 * - CBC 5-step pattern for revenue optimism bias
 * - Growth rate validation against industry norms
 * - Monthly breakdown for Year 1 cash flow planning
 *
 * Based on:
 * - gz-coaching-cbc.md (CBC for revenue fantasy and hockey stick growth)
 * - gz-system-coaching-core.md (GROW model)
 * - German market conditions and BA compliance
 */

import type {
  Umsatzplanung,
} from '@/types/modules/finanzplanung';

// ============================================================================
// Types
// ============================================================================

export interface UmsatzplanungPromptOptions {
  /** Current business idea from previous modules */
  businessIdea?: {
    problem: string;
    solution: string;
    businessType: string;
    targetMarket: string;
  };

  /** Geschäftsmodell data */
  geschaeftsmodell?: {
    valueProposition: string;
    revenueStreams: string[];
    pricingModel: string;
  };

  /** Marketing data */
  marketing?: {
    customerAcquisitionStrategy: string;
    marketingChannels: string[];
    customerLifetimeValue?: number;
    acquisitionCost?: number;
  };

  /** User's confidence level with revenue forecasting */
  forecastConfidence?: 'high' | 'medium' | 'low' | 'optimistic';

  /** Existing partial data */
  existingData?: Partial<Umsatzplanung>;
}

// ============================================================================
// Revenue Optimism Detection Patterns
// ============================================================================

export const REVENUE_OPTIMISM_PATTERNS = {
  hockey_stick: [
    /verdoppeln.*jahr/i,
    /explodier.*umsatz/i,
    /exponentiell.*wachstum/i,
    /hockey.*stick/i,
    /exponential.*growth/i,
    /viral.*gehen/i,
  ],

  no_competition: [
    /konkurrenz.*keine/i,
    /einzig.*anbieter/i,
    /monopol/i,
    /niemand.*macht.*das/i,
    /nur.*wir.*können/i,
  ],

  perfect_pricing: [
    /preis.*premium/i,
    /kund.*zahlt.*alles/i,
    /geld.*keine.*rolle/i,
    /preissensitiv.*nicht/i,
    /luxury.*preise/i,
  ],

  viral_growth: [
    /viral.*gehen/i,
    /mund.*propaganda/i,
    /selbst.*verkauft/i,
    /empfehlungen.*automatisch/i,
    /wächst.*von.*allein/i,
  ],

  market_size_fantasy: [
    /riesen.*markt/i,
    /billion.*market/i,
    /nur.*1.*prozent/i,
    /markt.*riesig/i,
    /alle.*kaufen/i,
  ],

  first_mover: [
    /erste.*am.*markt/i,
    /first.*mover/i,
    /noch.*niemand.*da/i,
    /pionier/i,
  ],
};

export function detectRevenueOptimism(message: string): 'hockey_stick' | 'no_competition' | 'perfect_pricing' | 'viral_growth' | 'market_size_fantasy' | 'first_mover' | null {
  const text = message.toLowerCase();

  if (REVENUE_OPTIMISM_PATTERNS.hockey_stick.some(p => p.test(text))) return 'hockey_stick';
  if (REVENUE_OPTIMISM_PATTERNS.no_competition.some(p => p.test(text))) return 'no_competition';
  if (REVENUE_OPTIMISM_PATTERNS.perfect_pricing.some(p => p.test(text))) return 'perfect_pricing';
  if (REVENUE_OPTIMISM_PATTERNS.viral_growth.some(p => p.test(text))) return 'viral_growth';
  if (REVENUE_OPTIMISM_PATTERNS.market_size_fantasy.some(p => p.test(text))) return 'market_size_fantasy';
  if (REVENUE_OPTIMISM_PATTERNS.first_mover.some(p => p.test(text))) return 'first_mover';

  return null;
}

// ============================================================================
// CBC Responses for Revenue Optimism
// ============================================================================

export const REVENUE_OPTIMISM_CBC_RESPONSES = {
  hockey_stick: {
    identify: "Ich höre eine sehr steile Wachstumskurve heraus. 200% Wachstum in Jahr 2 - das ist ein ambitioniertes Ziel.",
    evidence: "Welche Daten oder Erfahrungen stützen diese Wachstumsrate? Kennen Sie Unternehmen in Ihrer Branche mit ähnlichem Wachstum?",
    challenge: "Was müsste alles perfekt laufen, damit sich Ihr Umsatz verdoppelt? Wie realistisch ist das?",
    reframe: "Nachhaltiges Wachstum baut starke Unternehmen auf. Auch 50% Wachstum wäre ein großer Erfolg.",
    action: "Lassen Sie uns realistische Monatsschritte entwickeln und dann schauen, wo das hinführt.",
  },

  no_competition: {
    identify: "Sie sehen sich als einziger Anbieter am Markt. Das kann ein Vorteil sein - oder ein Warnsignal.",
    evidence: "Haben Sie wirklich keine Konkurrenten? Wie lösen Menschen das Problem heute, wenn es keinen Anbieter gibt?",
    challenge: "Wenn der Markt so groß und profitabel ist, warum ist noch niemand da? Was übersehen Sie möglicherweise?",
    reframe: "Märkte ohne Konkurrenz sind selten. Meist gibt es indirekte Konkurrenten oder alternative Lösungen.",
    action: "Recherchieren wir gemeinsam nach direkten und indirekten Wettbewerbern und deren Preisen.",
  },

  perfect_pricing: {
    identify: "Sie gehen von einer sehr komfortablen Preisgestaltung aus. Kunden zahlen Premium-Preise gerne.",
    evidence: "Haben Sie schon mal Kunden gefragt, was sie bereit wären zu zahlen? Gibt es Kaufbereitschaftsstudien?",
    challenge: "Was passiert, wenn ein günstigerer Anbieter kommt? Wie preissensitiv ist Ihr Markt wirklich?",
    reframe: "Auch Premium-Kunden vergleichen Preise. Value-based Pricing braucht klaren Nutzennachweis.",
    action: "Definieren wir drei Preisstufen: konservativ, wahrscheinlich, optimistisch. Dann rechnen wir mit allen.",
  },

  viral_growth: {
    identify: "Sie setzen stark auf Mundpropaganda und virales Wachstum. Das kann funktionieren, ist aber unvorhersagbar.",
    evidence: "Welche Produkte kennen Sie, die wirklich viral gegangen sind? Was war der Auslöser?",
    challenge: "Was ist Ihr Plan B, wenn die Weiterempfehlungen nicht so stark ausfallen wie erhofft?",
    reframe: "Organisches Wachstum ist wertvoll, aber schwer planbar. Parallel brauchen Sie kontrollierbares Marketing.",
    action: "Bauen wir ein Basisszenario mit bezahltem Marketing und ein Bonusszenario mit viralen Effekten.",
  },

  market_size_fantasy: {
    identify: "Sie sprechen von einem riesigen Markt. 'Wenn wir nur 1% erreichen...' - das hört man oft von Gründern.",
    evidence: "Wie haben Sie die Marktgröße berechnet? Welche Datenquellen haben Sie verwendet?",
    challenge: "1% von einem großen Markt ist immer noch sehr viel. Wie erreichen Sie diese 1% konkret?",
    reframe: "TAM, SAM, SOM - der relevante Markt ist meist viel kleiner als der theoretische Gesamtmarkt.",
    action: "Definieren wir Ihren erreichbaren Markt: geografisch, demografisch, psychografisch eingegrenzt.",
  },

  first_mover: {
    identify: "Sie sehen sich als Pionier in einem neuen Markt. Das ist spannend, aber auch riskant.",
    evidence: "Wie sicher sind Sie, dass der Markt bereit für Ihre Lösung ist? Gibt es schon Nachfrage?",
    challenge: "First-Mover-Advantage ist selten dauerhaft. Wie verteidigen Sie Ihre Position?",
    reframe: "Märkte müssen oft erst entwickelt werden. Das kostet Zeit und Geld - einkalkulieren?",
    action: "Planen wir konservativ für Marktentwicklungszeit und schauen dann, was möglich ist.",
  },
};

// ============================================================================
// Revenue Stream Scaffolding Questions
// ============================================================================

export const UMSATZPLANUNG_QUESTIONS = {
  stream_identification: {
    intro: [
      "Lassen Sie uns Ihre Einnahmequellen systematisch durchgehen. Womit verdienen Sie Geld?",
      "Jeder Euro Umsatz kommt von irgendwo her. Welche Produkte oder Services verkaufen Sie?",
    ],

    primary_streams: [
      "Hauptprodukt/Service - Was ist Ihr Kern-Angebot? Preis pro Einheit?",
      "Zusatzleistungen - Welche Add-Ons oder Extras können Sie verkaufen?",
      "Abonnements - Gibt es wiederkehrende Einnahmen? Monatlich, jährlich?",
      "Provisionen - Verdienen Sie an Vermittlungen oder Partnerschaften?",
    ],

    pricing_validation: [
      "Wie haben Sie diese Preise ermittelt? Marktforschung, Wettbewerb, Kostenkalkulation?",
      "Haben Sie schon mal Kunden gefragt, was sie zahlen würden?",
      "Welche Preisspanne ist für Ihre Zielgruppe noch akzeptabel?",
    ],
  },

  quantity_planning: {
    intro: [
      "Jetzt zu den Mengen - wie viel können und wollen Sie verkaufen?",
      "Fangen wir mit dem ersten Jahr an: Monat für Monat realistische Mengen.",
    ],

    monthly_breakdown: [
      "Monat 1-3: Wie lange dauert es, bis die ersten Kunden kommen?",
      "Monat 4-6: Wann läuft der Verkauf richtig an?",
      "Monat 7-9: Wie entwickelt sich das Geschäft im Jahresverlauf?",
      "Monat 10-12: Gibt es Saisonalität in Ihrer Branche?",
    ],

    capacity_check: [
      "Wie viele Kunden können Sie gleichzeitig bedienen?",
      "Wo sind Ihre Kapazitätsgrenzen? Personal, Zeit, Ausstattung?",
      "Ab welchem Punkt müssten Sie erweitern oder Personal einstellen?",
    ],

    growth_validation: [
      "Jahr 2: Um wie viel wollen Sie wachsen? Warum ist das realistisch?",
      "Jahr 3: Wo sehen Sie Ihr Business in drei Jahren?",
      "Was müsste passieren, damit dieses Wachstum eintritt?",
    ],
  },

  market_reality: {
    intro: [
      "Lassen Sie uns Ihre Zahlen gegen die Marktreaktität prüfen.",
      "Auch die beste Idee trifft auf echte Marktbedingungen und Konkurrenz.",
    ],

    competition_check: [
      "Wer macht heute etwas ähnliches? Auch indirekte Konkurrenten?",
      "Was kosten vergleichbare Lösungen? Premium, Standard, Budget?",
      "Warum sollten Kunden zu Ihnen wechseln oder Sie neu wählen?",
    ],

    customer_acquisition: [
      "Wie kommen die Kunden zu Ihnen? Online, Empfehlung, Kaltakquise?",
      "Wie lange dauert es von Erstkontakt bis zum Kaufabschluss?",
      "Was kostet Sie die Kundengewinnung? Zeit und Geld?",
    ],

    market_penetration: [
      "Wie groß ist Ihr erreichbarer Markt? Nicht der theoretische, der praktische.",
      "Welchen Anteil davon können Sie realistisch erreichen?",
      "Wächst der Markt oder schrumpft er? Trends beachtet?",
    ],
  },
};

// ============================================================================
// Industry-Specific Revenue Guidance
// ============================================================================

export const INDUSTRY_REVENUE_GUIDANCE = {
  beratung: {
    pricing: "Stundensätze €80-200 je nach Seniorität und Spezialisierung",
    capacity: "Max. 1.400-1.600 verrechenbare Stunden/Jahr (70-80% Auslastung)",
    growth: "Wachstum durch höhere Stundensätze und Spezialisierung, nicht nur mehr Stunden",
    seasonality: "Q1 gut (Strategieplanung), Sommer ruhiger, Q4 Budgetplanung",
    tips: "Paketpreise statt Stundensätze, Retainer für planbare Einnahmen",
  },

  ecommerce: {
    pricing: "Durchschnittswarenkorb €35-75, Conversion 1-3%",
    capacity: "Skalierbar durch Automatisierung und Lager-Management",
    growth: "50-100% Jahr 1-2 möglich, dann Stabilisierung bei 20-30%",
    seasonality: "Q4 (Black Friday, Weihnachten) oft 30-40% vom Jahresumsatz",
    tips: "Abo-Modelle für wiederkehrende Einnahmen, Upselling/Cross-selling",
  },

  handwerk: {
    pricing: "Stundensätze €50-120, Materialaufschlag 15-30%",
    capacity: "Begrenzt durch Arbeitszeit und Fachkräfte",
    growth: "Moderat 20-30% durch Preise und Effizienz",
    seasonality: "Wetterabhängig, Sommer meist stärker",
    tips: "Wartungsverträge, Wintergeschäft entwickeln",
  },

  restaurant: {
    pricing: "Durchschnittsbon €15-35, Tische-Umdrehung 1,5-3x täglich",
    capacity: "Begrenzt durch Sitzplätze und Öffnungszeiten",
    growth: "Schwierig skalierbar, Fokus auf Effizienz und Preisoptimierung",
    seasonality: "Stark wetterabhängig, Feiertage wichtig",
    tips: "Delivery/Takeaway, Events, Catering als zusätzliche Streams",
  },

  software: {
    pricing: "SaaS: €10-500/Monat je nach Zielgruppe, Freemium möglich",
    capacity: "Hochgradig skalierbar ab MVP",
    growth: "100-300% möglich bei Product-Market-Fit",
    seasonality: "B2B: Q4 Budget-Freeze, Q1 stark",
    tips: "Recurring Revenue fokussieren, Churn minimieren",
  },

  default: {
    pricing: "Marktpreise analysieren, Value-based Pricing anstreben",
    capacity: "Realistische Kapazitätsgrenzen früh identifizieren",
    growth: "30-50% in ersten Jahren, dann Stabilisierung",
    seasonality: "Branchenspezifisch recherchieren",
    tips: "Multiple Revenue Streams für Risikostreuung",
  },
};

// ============================================================================
// Main Prompt Builder
// ============================================================================

export function buildUmsatzplanungPrompt(
  options: UmsatzplanungPromptOptions = {},
  userMessage: string,
  _conversationHistory: Array<{role: string; content: string}>
): string {
  const {
    businessIdea,
    geschaeftsmodell,
    marketing,
    forecastConfidence = 'medium',
    existingData = {},
  } = options;

  // Detect revenue optimism
  const optimismType = detectRevenueOptimism(userMessage);

  // Industry-specific guidance
  const businessType = businessIdea?.businessType || 'default';
  const industryGuide = INDUSTRY_REVENUE_GUIDANCE[businessType as keyof typeof INDUSTRY_REVENUE_GUIDANCE] ||
                        INDUSTRY_REVENUE_GUIDANCE.default;

  const prompt = `# Finanzplanung Teil D: Umsatzplanung

## Coaching-Kontext

Du führst durch die **Umsatzplanung** - das Herzstück jeder Finanzplanung.

**Ziel:** Realistische Umsatzprognosen für 3 Jahre entwickeln:
1. **Revenue Streams** identifizieren und quantifizieren
2. **Monatliche Planung** für Jahr 1 (Cash Flow)
3. **Wachstumsprognosen** für Jahre 2-3 mit Validierung
4. **Marktreaktität** und Wettbewerbsfähigkeit prüfen

**Nutzer-Profil:**
- Geschäftsidee: ${businessIdea?.problem || 'Nicht spezifiziert'} → ${businessIdea?.solution || 'Nicht spezifiziert'}
- Branche: ${businessType}
- Zielmarkt: ${businessIdea?.targetMarket || 'Noch nicht definiert'}
- Prognose-Konfidenz: ${forecastConfidence}
- Revenue Streams: ${geschaeftsmodell?.revenueStreams?.join(', ') || 'Noch nicht definiert'}

${optimismType ? `**⚠️ Umsatz-Optimismus erkannt:** ${optimismType}` : ''}

## CBC Integration für Revenue-Optimismus

${optimismType ? generateCBCIntervention(optimismType) : ''}

## Coaching-Prinzipien

1. **Bottom-Up-Ansatz** - "Jeder Euro kommt von irgendwo her"
2. **Marktreaktität** - Wettbewerb und Kundensicht einbeziehen
3. **Konservative Schätzungen** - Lieber positiv überrascht werden
4. **Monatliche Granularität** - Jahr 1 Monat für Monat planen
5. **Kapazitätsgrenzen** - Realistische Wachstumslimits beachten

## Branchenwissen

**${businessType.toUpperCase()}:**
- **Pricing:** ${industryGuide.pricing}
- **Kapazität:** ${industryGuide.capacity}
- **Wachstum:** ${industryGuide.growth}
- **Saisonalität:** ${industryGuide.seasonality}
- **Tipps:** ${industryGuide.tips}

## Strukturierung

### Phase 1: Revenue Stream Mapping
${generateRevenueStreamGuidance(geschaeftsmodell)}

### Phase 2: Quantifizierung & Pricing
${generatePricingGuidance(businessType, industryGuide)}

### Phase 3: Mengenplanung
${generateVolumeGuidance(businessType)}

### Phase 4: Wachstums-Validierung
${generateGrowthGuidance(businessType, optimismType)}

## Validierung gegen Benchmarks

**Branchenübliche Wachstumsraten:**
- Jahr 1 → Jahr 2: ${industryGuide.growth?.split(' ')[0] || '30%'}
- Jahr 2 → Jahr 3: Stabilisierung bei 15-25%
- **WARNUNG:** >100% Wachstum nur bei Software/Tech realistisch

**Realitäts-Checks:**
- Marktgröße vs. geplanter Marktanteil
- Kapazitätsgrenzen vs. Wachstumsziele
- Wettbewerbssituation vs. Preisvorstellungen
- Kundenakquise-Geschwindigkeit vs. Umsatzramping

## Ausgabe-Format

Du MUSST in diesem exakten JSON-Format antworten:

\`\`\`json
{
  "response": "Deine empathische, strukturierte Coaching-Antwort hier",
  "moduleData": {
    "umsatzplanung": {
      "umsatzstroeme": [
        {
          "name": "Stream Name",
          "typ": "produkt|dienstleistung|abo|provision|sonstige",
          "einheit": "Stunde|Stück|Monat|Projekt",
          "preis": 0,
          "mengeJahr1": [0,0,0,0,0,0,0,0,0,0,0,0],
          "mengeJahr2": 0,
          "mengeJahr3": 0
        }
      ],
      "umsatzJahr1": [0,0,0,0,0,0,0,0,0,0,0,0],
      "umsatzJahr1Summe": 0,
      "umsatzJahr2": 0,
      "umsatzJahr3": 0,
      "wachstumsrateJahr2": 0,
      "wachstumsrateJahr3": 0,
      "annahmen": ["Wichtige Annahmen für die Prognose"]
    }
  },
  "coachingNotes": {
    "optimism": "${optimismType || 'none'}",
    "cbcStep": "${optimismType ? 'IDENTIFY' : 'none'}",
    "nextSteps": ["Konkrete nächste Schritte"],
    "warnings": ["Erkannte Risiken oder unrealistische Annahmen"],
    "progress": "% der Umsatzplanung abgeschlossen"
  }
}
\`\`\`

## Aktuelle Situation

**Bestehende Daten:**
${JSON.stringify(existingData, null, 2)}

**Nutzer-Nachricht:**
"${userMessage}"

**Aufgabe:** Führe das Revenue-Planning strukturiert durch. Bei Optimismus: CBC anwenden. Bei unrealistischen Zahlen: sanft hinterfragen und Marktreaktität einbringen. Fokussiere auf konkrete, nachvollziehbare Umsatzquellen.`;

  return prompt;
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateCBCIntervention(optimismType: string): string {
  const response = REVENUE_OPTIMISM_CBC_RESPONSES[optimismType as keyof typeof REVENUE_OPTIMISM_CBC_RESPONSES];

  return `
### CBC 5-Schritt Intervention

**IDENTIFY:** ${response.identify}
**EVIDENCE:** ${response.evidence}
**CHALLENGE:** ${response.challenge}
**REFRAME:** ${response.reframe}
**ACTION:** ${response.action}

Verwende diese Struktur in deiner Antwort.`;
}

function generateRevenueStreamGuidance(geschaeftsmodell?: { revenueStreams: string[]; pricingModel: string }): string {
  if (!geschaeftsmodell?.revenueStreams) {
    return `**Revenue Streams identifizieren:**
- Hauptprodukt/Service (Primary Revenue)
- Add-Ons/Zusatzleistungen (Secondary Revenue)
- Wiederkehrende Einnahmen (Recurring Revenue)
- Einmalige Extras (One-time Revenue)`;
  }

  return `**Basierend auf Ihrem Geschäftsmodell:**
${geschaeftsmodell.revenueStreams.map(stream => `- ${stream}`).join('\n')}

**Pricing Model:** ${geschaeftsmodell.pricingModel}

**Zu quantifizieren:** Preis × Menge pro Stream`;
}

function generatePricingGuidance(businessType: string, industryGuide: any): string {
  return `**PRICING für ${businessType.toUpperCase()}:**
${industryGuide.pricing}

**Preisfindung:**
- Wettbewerbsanalyse durchführen
- Value-based Pricing anstreben
- 3 Preisstufen testen: konservativ/realistisch/optimistisch
- Kundeninterviews zu Zahlungsbereitschaft`;
}

function generateVolumeGuidance(businessType: string): string {
  return `**MENGENPLANUNG:**
- Monat 1-3: Anlaufphase (niedrige Volumina)
- Monat 4-8: Wachstumsphase (progressive Steigerung)
- Monat 9-12: Etablierungsphase (stabilere Mengen)

**${businessType.toUpperCase()}-spezifische Faktoren beachten:**
- Kapazitätsgrenzen
- Saisonalität
- Kundenakquise-Geschwindigkeit
- Marktreaktions-Zeit`;
}

function generateGrowthGuidance(businessType: string, optimismType: string | null): string {
  let warnung = '';
  if (optimismType === 'hockey_stick') {
    warnung = '\n⚠️ **ACHTUNG:** Exponentielles Wachstum ist sehr selten. Planen Sie konservativ.';
  }

  return `**WACHSTUMS-VALIDIERUNG:**
- Jahr 1 → Jahr 2: Realistische Steigerung basierend auf Markt/Kapazität
- Jahr 2 → Jahr 3: Oft Verlangsamung durch Sättigungseffekte
- Branche ${businessType}: Typische Wachstumsraten beachten

**Was muss für Ihr geplantes Wachstum eintreten?**
- Marktanteil-Steigerung: Wie?
- Kapazitäts-Ausbau: Wann und wie viel?
- Marketing-Erfolg: Messbare Annahmen?${warnung}`;
}

export default {
  buildUmsatzplanungPrompt,
  detectRevenueOptimism,
  REVENUE_OPTIMISM_CBC_RESPONSES,
  UMSATZPLANUNG_QUESTIONS,
};