/**
 * Finanzplanung Teil G: Liquidität Prompt (GZ-603)
 *
 * Liquidity Analysis Module with:
 * - CBC handling for cash flow anxiety and payment timing fears
 * - Critical liquidity validation (negative cash = BA blocker)
 * - German B2B payment terms coaching and risk management
 * - Integration with all previous financial planning modules
 *
 * Features:
 * - Monthly cash flow modeling with exact timing
 * - CBC 5-step pattern for cash flow anxiety and buffer resistance
 * - German payment reality coaching (30-60 day delays)
 * - Safety buffer calculations and recommendations
 * - CRITICAL: Negative liquidity detection and prevention
 *
 * Based on:
 * - gz-coaching-cbc.md (CBC for anxiety and avoidance patterns)
 * - gz-system-coaching-core.md (GROW model and supportive questioning)
 * - German B2B payment practices and insolvency law
 */

import type {
  Liquiditaet,
  Kapitalbedarf,
  Finanzierung,
  Privatentnahme,
  Umsatzplanung,
  Kostenplanung,
} from '@/types/modules/finanzplanung';

// ============================================================================
// Types
// ============================================================================

export interface LiquiditaetPromptOptions {
  /** Current business idea from previous modules */
  businessIdea?: {
    problem: string;
    solution: string;
    businessType: string;
    industry: string;
    customerType: 'B2B' | 'B2C' | 'mixed';
  };

  /** All previous financial planning data */
  kapitalbedarf?: Kapitalbedarf;
  finanzierung?: Finanzierung;
  privatentnahme?: Privatentnahme;
  umsatzplanung?: Umsatzplanung;
  kostenplanung?: Kostenplanung;

  /** Liquidity calculation results */
  liquidityAnalysis?: {
    minimumLiquiditaet: number;
    minimumMonat: number;
    hatNegativeLiquiditaet: boolean;
    recommendedReserve: number;
    actualReserve: number;
  };

  /** User's attitude towards cash flow */
  cashFlowMindset?: 'anxious' | 'optimistic' | 'realistic' | 'denial';

  /** Existing partial data */
  existingData?: Partial<Liquiditaet>;

  /** Industry for payment terms */
  industry?: string;
}

// ============================================================================
// Cash Flow Anxiety Detection Patterns
// ============================================================================

export const CASH_FLOW_ANXIETY_PATTERNS = {
  immediate_payment: [
    /kunden.*zahlen.*sofort/i,
    /payment.*bei.*lieferung/i,
    /keine.*zahlungsverzögerung/i,
    /bar.*zahlung.*nur/i,
    /vorkasse.*immer/i,
    /30.*tage.*zu.*lang/i,
  ],

  buffer_resistance: [
    /puffer.*unnötig/i,
    /reserve.*verschwendung/i,
    /liquidität.*übertrieben/i,
    /cash.*bringt.*keine.*zinsen/i,
    /geld.*soll.*arbeiten/i,
    /sicherheit.*kostet.*nur/i,
  ],

  payment_delay_denial: [
    /zahlungsausfälle.*kommen.*nicht.*vor/i,
    /meine.*kunden.*zahlen.*pünktlich/i,
    /deutsche.*unternehmen.*zahlen.*immer/i,
    /factoring.*unnötig/i,
    /inkasso.*brauche.*ich.*nicht/i,
  ],

  seasonal_ignorance: [
    /umsatz.*gleich.*das.*ganze.*jahr/i,
    /keine.*saisonalität/i,
    /weihnachten.*egal/i,
    /sommer.*pause.*gibt.*es.*nicht/i,
    /jeden.*monat.*gleich.*viel/i,
  ],

  crisis_denial: [
    /wirtschaftskrise.*betrifft.*mich.*nicht/i,
    /mein.*business.*ist.*krisensicher/i,
    /notfallplan.*übertrieben/i,
    /was.*soll.*schon.*passieren/i,
    /läuft.*alles.*nach.*plan/i,
  ],

  negative_liquidity_panic: [
    /minus.*bedeutet.*pleite/i,
    /negativer.*cash.*flow.*katastrophe/i,
    /ein.*monat.*im.*minus.*und.*aus/i,
    /ba.*wird.*das.*nie.*akzeptieren/i,
    /game.*over.*bei.*negativem.*cash/i,
  ],
};

export function detectCashFlowAnxiety(message: string): 'immediate_payment' | 'buffer_resistance' | 'payment_delay_denial' | 'seasonal_ignorance' | 'crisis_denial' | 'negative_liquidity_panic' | null {
  const text = message.toLowerCase();

  if (CASH_FLOW_ANXIETY_PATTERNS.immediate_payment.some(p => p.test(text))) return 'immediate_payment';
  if (CASH_FLOW_ANXIETY_PATTERNS.buffer_resistance.some(p => p.test(text))) return 'buffer_resistance';
  if (CASH_FLOW_ANXIETY_PATTERNS.payment_delay_denial.some(p => p.test(text))) return 'payment_delay_denial';
  if (CASH_FLOW_ANXIETY_PATTERNS.seasonal_ignorance.some(p => p.test(text))) return 'seasonal_ignorance';
  if (CASH_FLOW_ANXIETY_PATTERNS.crisis_denial.some(p => p.test(text))) return 'crisis_denial';
  if (CASH_FLOW_ANXIETY_PATTERNS.negative_liquidity_panic.some(p => p.test(text))) return 'negative_liquidity_panic';

  return null;
}

// ============================================================================
// CBC Responses for Cash Flow Anxiety
// ============================================================================

export const CASH_FLOW_ANXIETY_CBC_RESPONSES = {
  immediate_payment: {
    identify: "Sie planen mit sofortiger Zahlung durch alle Kunden. Das ist zwar wünschenswert, aber in der deutschen B2B-Realität selten.",
    evidence: "Schauen Sie sich Ihre eigenen Rechnungen an: Zahlen Sie Handwerker, Steuerberater oder Software-Anbieter sofort? Welche Zahlungsziele sind normal?",
    challenge: "Was passiert mit Ihrem Plan, wenn 80% Ihrer B2B-Kunden das übliche 30-45 Tage Zahlungsziel nutzen?",
    reframe: "Zahlungsverzögerungen sind nicht böswillig, sondern Standard-Geschäftspraxis. Gute Planung berücksichtigt diese Realität von Anfang an.",
    action: "Rechnen wir mit 45 Tagen Zahlungsziel für B2B und 7 Tagen für B2C. Das ist realistisch und macht Ihren Plan bei der BA glaubwürdig.",
  },

  buffer_resistance: {
    identify: "Sie sehen Liquiditätsreserven als Verschwendung oder ineffizient. Diese Haltung kann existenzbedrohend werden.",
    evidence: "Was kostet Sie ein 3-Monats-Puffer wirklich? Und was würde Sie ein Liquiditätsengpass kosten - Kunden, Ruf, Nerven?",
    challenge: "Was wäre, wenn Sie den Puffer nie brauchen? Ist das nicht besser als ihn zu brauchen und nicht zu haben?",
    reframe: "Liquiditätsreserven sind Versicherung gegen das Unvorhersehbare. Wie eine Haftpflichtversicherung - niemand hofft sie zu brauchen.",
    action: "Kalkulieren wir 3 Monate Betriebskosten als Mindestpuffer. Das sind etwa €X,XXX - weniger als die meisten für ein Auto ausgeben.",
  },

  payment_delay_denial: {
    identify: "Sie vertrauen darauf, dass alle Kunden pünktlich zahlen. Diese Naivität kann schnell teuer werden.",
    evidence: "Kennen Sie die Zahlungsmoral in Ihrer Branche? Wissen Sie, dass selbst solvente Unternehmen oft 60+ Tage brauchen?",
    challenge: "Was passiert, wenn nur ein Großkunde 90 Tage statt 30 Tage braucht? Können Sie das abfedern?",
    reframe: "Verspätete Zahlung ist Alltag, nicht Ausnahme. Professionelle Unternehmen kalkulieren das ein und haben Lösungen parat.",
    action: "Planen wir mit 10% Zahlungsausfall-Risiko und Factoring/Kreditlinie als Backup. So machen es etablierte Unternehmen auch.",
  },

  seasonal_ignorance: {
    identify: "Sie ignorieren saisonale Schwankungen in Ihrem Cash Flow. Das kann zu unerwarteten Engpässen führen.",
    evidence: "Welche Monate sind in Ihrer Branche typischerweise schwächer? Juli/August? Dezember/Januar? Gibt es Budget-Zyklen?",
    challenge: "Was wäre, wenn Ihre schwächsten 2 Monate 40% weniger Umsatz bringen? Reicht Ihr Cash dann noch?",
    reframe: "Saisonalität ist planbar und damit beherrschbar. Wer sie ignoriert, wird überrascht. Wer sie einplant, ist vorbereitet.",
    action: "Analysieren wir typische Saisonmuster Ihrer Branche und bauen 20-30% Schwankung in die Liquiditätsplanung ein.",
  },

  crisis_denial: {
    identify: "Sie planen nur für den Idealfall ohne Risiken oder Krisen. Diese Haltung kann bei Problemen fatal werden.",
    evidence: "Denken Sie an Corona, Inflation, Energiekrise - welche unvorhersehbaren Ereignisse gab es in den letzten Jahren?",
    challenge: "Was wäre, wenn Ihr Umsatz 6 Monate lang 30% unter Plan liegt? Können Sie das überstehen?",
    reframe: "Krisenszenarien zu durchdenken ist nicht pessimistisch, sondern professionell. Die BA schätzt realistische Risikobewertung.",
    action: "Entwickeln wir einen Notfallplan: Welche Kosten können Sie schnell senken? Wo bekommen Sie zusätzliches Cash?",
  },

  negative_liquidity_panic: {
    identify: "Sie geraten in Panik bei der Vorstellung negativer Liquidität. Diese Angst kann zu übervorsichtigen oder unrealistischen Plänen führen.",
    evidence: "Wissen Sie, dass viele erfolgreiche Unternehmen zeitweise negative Cash Flows hatten? Amazon jahrelang, Tesla auch.",
    challenge: "Was ist der Unterschied zwischen vorübergehendem negativen Cash Flow und echter Insolvenz?",
    reframe: "Negative Liquidität ist kritisch, aber nicht immer tödlich. Entscheidend ist: Ist es kurzfristig und geplant oder dauerhaft und unkontrolliert?",
    action: "Falls negative Monate unvermeidbar sind: Zeigen wir der BA eine Kreditlinie oder zusätzliches Eigenkapital als Lösung.",
  },
};

// ============================================================================
// German Payment Terms and Risk Factors
// ============================================================================

export const GERMAN_PAYMENT_REALITY = {
  B2B: {
    typical_terms: "30-45 Tage Zahlungsziel",
    actual_payment: "45-60 Tage durchschnittlich",
    late_payment_risk: "20-30% zahlen verspätet",
    default_risk: "2-5% Zahlungsausfall",
    seasonal_impact: "Q1: +10%, Q2/Q3: normal, Q4: -20% wegen Budgetzyklen",
  },

  B2C: {
    typical_terms: "Sofort bis 14 Tage",
    actual_payment: "7-14 Tage durchschnittlich",
    late_payment_risk: "10-15% zahlen verspätet",
    default_risk: "1-3% Zahlungsausfall",
    seasonal_impact: "Stark abhängig von Branche (Einzelhandel vs. Services)",
  },

  industry_specifics: {
    handwerk: "Oft Anzahlung möglich, Restzahlung bei Abnahme, aber auch Gewährleistung",
    beratung: "Projektabschluss oft verzögert, Stundenabrechnung einfacher zu fakturieren",
    ecommerce: "Sofortige Zahlung, aber Retouren und Chargebacks als Risiko",
    software: "Recurring Revenue planbar, aber Churn-Rate berücksichtigen",
    restaurant: "Sofortzahlung, aber saisonale Schwankungen extrem",
  },
};

// ============================================================================
// Main Prompt Function
// ============================================================================

export function generateLiquiditaetPrompt(options: LiquiditaetPromptOptions): string {
  const {
    businessIdea,
    kapitalbedarf,
    finanzierung,
    privatentnahme,
    umsatzplanung,
    kostenplanung,
    liquidityAnalysis,
    cashFlowMindset = 'realistic',
    existingData,
    industry = 'default',
  } = options;

  const customerType = businessIdea?.customerType || 'B2B';
  const paymentReality = GERMAN_PAYMENT_REALITY[customerType];

  // Calculate monthly costs for context
  const monthlyFixedCosts = kostenplanung?.fixkostenSummeMonatlich || 0;
  const monthlyPrivateWithdrawals = privatentnahme?.monatlichePrivatentnahme || 0;
  const totalMonthlyCosts = monthlyFixedCosts + monthlyPrivateWithdrawals;
  const recommendedBuffer = totalMonthlyCosts * 3;

  return `# Finanzplanung Teil G: Liquidität & Cash Flow Management

Als Cash Flow Spezialist begleite ich Sie beim kritischsten Teil der Finanzplanung: der Liquiditätssicherung. Ein einziger Monat mit negativem Cash Flow kann zur Insolvenz führen - aber mit der richtigen Planung ist das vermeidbar.

## 🚨 KRITISCHER HINWEIS: Liquidität = Überlebensfähigkeit

**Negative Liquidität = BA-Blocker**
Die BA wird **jeden Plan ablehnen**, der auch nur einen Monat negativen Cash Flow zeigt. Warum? Weil das rechtlich als Insolvenz-Risiko gilt.

## Ihre bisherige Finanzplanung

**Startkapital:**
- Kapitalbedarf: ${kapitalbedarf?.gesamtkapitalbedarf ? `€${kapitalbedarf.gesamtkapitalbedarf.toLocaleString('de-DE')}` : '[Noch nicht berechnet]'}
- Verfügbare Finanzierung: ${finanzierung?.gesamtfinanzierung ? `€${finanzierung.gesamtfinanzierung.toLocaleString('de-DE')}` : '[Noch nicht berechnet]'}
- Finanzierungslücke: ${finanzierung?.finanzierungsluecke ? `€${Math.abs(finanzierung.finanzierungsluecke).toLocaleString('de-DE')} ${finanzierung.finanzierungsluecke > 0 ? '(Fehlbetrag)' : '(Überschuss)'}` : '[Noch nicht berechnet]'}

**Laufende Kosten:**
- Fixkosten pro Monat: ${kostenplanung?.fixkostenSummeMonatlich ? `€${kostenplanung.fixkostenSummeMonatlich.toLocaleString('de-DE')}` : '[Noch nicht geplant]'}
- Private Entnahmen: ${privatentnahme?.monatlichePrivatentnahme ? `€${privatentnahme.monatlichePrivatentnahme.toLocaleString('de-DE')}` : '[Noch nicht geplant]'}
- **Gesamt pro Monat: €${totalMonthlyCosts.toLocaleString('de-DE')}**

**Umsatzplanung:**
- Jahr 1 Gesamt: ${umsatzplanung?.umsatzJahr1Summe ? `€${umsatzplanung.umsatzJahr1Summe.toLocaleString('de-DE')}` : '[Noch nicht geplant]'}
- Monatlich (Ø): ${umsatzplanung?.umsatzJahr1Summe ? `€${(umsatzplanung.umsatzJahr1Summe / 12).toLocaleString('de-DE')}` : '[Noch nicht geplant]'}

## Liquiditäts-Analyse Ergebnisse

${liquidityAnalysis ? `
**Berechnete Liquidität:**
- Niedrigster Cash-Stand: €${liquidityAnalysis.minimumLiquiditaet.toLocaleString('de-DE')} (Monat ${liquidityAnalysis.minimumMonat})
- Empfohlener Puffer: €${liquidityAnalysis.recommendedReserve.toLocaleString('de-DE')}
- Aktueller Puffer: €${Math.max(0, liquidityAnalysis.actualReserve).toLocaleString('de-DE')}

${liquidityAnalysis.hatNegativeLiquiditaet ? `
🚨 **ALARM: NEGATIVE LIQUIDITÄT ERKANNT**
Ihr Plan zeigt negative Liquidität in mindestens einem Monat. Das ist ein **absoluter BA-Blocker** und muss **sofort korrigiert** werden.

**Sofortmaßnahmen erforderlich:**
1. Zusätzliche Finanzierung beschaffen
2. Kosten reduzieren
3. Zahlungsziele mit Kunden verkürzen
4. Zahlungsziele mit Lieferanten verlängern
` : `
✅ **Positive Liquidität:** Ihr Plan zeigt durchgehend positive Liquidität - das ist die Grundvoraussetzung für BA-Zustimmung.
`}
` : '[Liquiditäts-Analyse folgt in diesem Schritt]'}

## Deutsche ${customerType}-Zahlungsrealität

**Ihre Kunden sind ${customerType}:**
- Übliche Zahlungsziele: ${paymentReality.typical_terms}
- Tatsächliche Zahldauer: ${paymentReality.actual_payment}
- Verspätungsrisiko: ${paymentReality.late_payment_risk}
- Ausfallrisiko: ${paymentReality.default_risk}
- Saisonale Effekte: ${paymentReality.seasonal_impact}

${industry !== 'default' ? `
**Branchen-Besonderheiten (${industry}):**
${GERMAN_PAYMENT_REALITY.industry_specifics[industry as keyof typeof GERMAN_PAYMENT_REALITY.industry_specifics] || 'Keine spezifischen Besonderheiten bekannt'}
` : ''}

## Cash Flow Coaching-Ansatz

Ich erkenne, dass Liquiditätsplanung intensive Emotionen auslöst:
- **Zahlungsängste:** "Kunden zahlen nicht pünktlich"
- **Puffer-Widerstand:** "Cash bringt keine Zinsen"
- **Optimismus-Falle:** "Bei mir wird alles glatt laufen"
- **Panik-Modus:** "Ein Minus-Monat = Pleite"

Mein Ziel: **Realistische Sicherheit** ohne **Angst-Paralyse**. Sie sollen gut schlafen können, ohne übervorsichtig zu werden.

## Was wir in diesem Schritt erarbeiten

### 1. Monatliche Cash Flow Projektion
- **Einzahlungen:** Wann kommt das Geld **wirklich** rein? (inkl. Zahlungsverzögerungen)
- **Auszahlungen:** Wann gehen Kosten **tatsächlich** vom Konto ab?
- **Timing-Unterschiede:** Der Teufel steckt im Detail

### 2. Liquiditäts-Puffer Berechnung
- **Minimum-Reserve:** 3 Monate Betriebskosten (€${recommendedBuffer.toLocaleString('de-DE')})
- **Komfort-Reserve:** 6 Monate für extra Sicherheit
- **Risiko-Anpassung:** Je nach Branche und Kundenstamm

### 3. Zahlungskonditionen-Optimierung
- **Kunden:** Anzahlungen, kürzere Zahlungsziele, Skonto
- **Lieferanten:** Längere Zahlungsziele aushandeln
- **Tools:** Factoring, Kreditlinie, digitale Bezahlsysteme

### 4. Saison- und Krisenplanung
- **Schwache Monate:** Q1/Q4 Effekte, Urlaubszeiten, Feiertage
- **Notfallpläne:** Was tun bei 30% Umsatzeinbruch?
- **Liquiditäts-Quellen:** Wo gibt es schnell Cash?

### 5. BA-Compliance Sicherstellung
- **Zero-Tolerance:** Kein einziger Monat im Minus
- **Dokumentation:** Wie wir Annahmen begründen
- **Konservative Szenarien:** Besser zu vorsichtig als abgelehnt

## Empfohlener Liquiditäts-Puffer

Basierend auf Ihren monatlichen Kosten von €${totalMonthlyCosts.toLocaleString('de-DE')}:

- **Minimum (3 Monate):** €${recommendedBuffer.toLocaleString('de-DE')}
- **Komfortabel (6 Monate):** €${(recommendedBuffer * 2).toLocaleString('de-DE')}
- **Sehr sicher (12 Monate):** €${(recommendedBuffer * 4).toLocaleString('de-DE')}

## Häufige Cash Flow Denkfallen

🚨 **"Meine Kunden zahlen sofort"**
→ Deutsche B2B-Realität: 45-60 Tage sind normal

🚨 **"Liquiditätspuffer ist verschwendetes Geld"**
→ Insolvenz kostet mehr als entgangene Zinsen

🚨 **"Ein Minus-Monat = Game Over"**
→ Stimmt bei der BA. Aber bei Ihnen nicht, wenn Sie Kreditlinie haben

🚨 **"Krisenpläne sind Pessimismus"**
→ Professionelles Risikomanagement überzeugt die BA

---

**Liquiditäts-Check: Lassen Sie uns ehrlich sein!**

Bevor wir in die Details gehen, drei wichtige Fragen:

1. **Zahlungsverhalten:** Wenn Sie selbst B2B-Rechnungen bekommen - zahlen Sie sofort oder nutzen Sie das Zahlungsziel? (Seien Sie ehrlich!)

2. **Sicherheitsbedürfnis:** Welcher Liquiditätspuffer würde Ihnen persönlich helfen, nachts ruhig zu schlafen?

3. **Worst-Case-Szenario:** Was wäre, wenn 3 Monate lang nur 70% Ihres geplanten Umsatzes reinkommt - haben Sie einen Plan?

Ihre ehrlichen Antworten helfen mir, eine Liquiditätsplanung zu entwickeln, die sowohl **BA-konform** als auch **für Sie persönlich beruhigend** ist.`;
}

// ============================================================================
// Response Enhancement
// ============================================================================

export function enhanceResponseWithCBC(
  response: string,
  detectedAnxiety: string | null,
  userMessage: string
): string {
  if (!detectedAnxiety) return response;

  const cbcResponse = CASH_FLOW_ANXIETY_CBC_RESPONSES[detectedAnxiety as keyof typeof CASH_FLOW_ANXIETY_CBC_RESPONSES];
  if (!cbcResponse) return response;

  const cbcIntervention = `

## 💡 Coaching-Moment: ${getAnxietyTitle(detectedAnxiety)}

**Ich höre heraus:** ${cbcResponse.identify}

**Realitäts-Check:** ${cbcResponse.evidence}

**Was-wäre-wenn:** ${cbcResponse.challenge}

**Neue Betrachtung:** ${cbcResponse.reframe}

**Praktischer Schritt:** ${cbcResponse.action}

---

`;

  return cbcIntervention + response;
}

function getAnxietyTitle(anxiety: string): string {
  const titles = {
    immediate_payment: 'Sofortzahlung-Erwartung',
    buffer_resistance: 'Liquiditätspuffer-Widerstand',
    payment_delay_denial: 'Zahlungsverzögerung-Verleugnung',
    seasonal_ignorance: 'Saisonalität-Ignoranz',
    crisis_denial: 'Krisen-Verleugnung',
    negative_liquidity_panic: 'Negativ-Liquiditäts-Panik',
  };

  return titles[anxiety as keyof typeof titles] || 'Cash Flow Sorgen';
}

// ============================================================================
// Seasonal Patterns by Industry
// ============================================================================

export const GERMAN_SEASONAL_PATTERNS = {
  handwerk: {
    q1: 0.8, // Winter schwach
    q2: 1.2, // Frühling stark
    q3: 1.2, // Sommer stark
    q4: 0.8, // Herbst/Winter schwach
    description: "Baugewerbe: Witterungsbedingte Schwankungen, Urlaubszeit im Sommer beachten",
  },

  beratung: {
    q1: 1.1, // Neues Jahr, Budgets freigegeben
    q2: 0.9, // Urlaubszeit
    q3: 0.8, // Sommerurlaub
    q4: 1.2, // Jahresendgeschäft
    description: "Beratung: Q1 Budget-Freigabe, Q3 Sommerloch, Q4 Jahresend-Push",
  },

  ecommerce: {
    q1: 0.9, // Post-Weihnachten schwach
    q2: 1.0, // Normal
    q3: 1.0, // Normal
    q4: 1.1, // Black Friday/Weihnachten
    description: "E-Commerce: Q4 Weihnachtsgeschäft, Q1 Retour-Welle",
  },

  restaurant: {
    q1: 0.8, // Winter, nach Feiertagen
    q2: 1.1, // Frühling
    q3: 1.2, // Sommer, Tourismus
    q4: 0.9, // Herbst
    description: "Gastronomie: Sommer-Hochsaison, Winter-Flaute",
  },

  software: {
    q1: 1.1, // Budget-Jahr beginnt
    q2: 0.9, // Entscheidungen verzögern sich
    q3: 0.8, // Urlaubszeit
    q4: 1.2, // Budget muss verbraucht werden
    description: "Software: Budget-Zyklen dominieren, Q4 oft Jahresendgeschäft",
  },

  default: {
    q1: 1.0,
    q2: 1.0,
    q3: 0.9, // Allgemeines Sommerloch
    q4: 1.1, // Jahresendgeschäft
    description: "Allgemein: Leichtes Sommerloch, Jahresend-Push",
  },
};

export function getSeasonalPattern(industry: string = 'default') {
  return GERMAN_SEASONAL_PATTERNS[industry as keyof typeof GERMAN_SEASONAL_PATTERNS] ||
         GERMAN_SEASONAL_PATTERNS.default;
}

// ============================================================================
// Exports
// ============================================================================

export default {
  generateLiquiditaetPrompt,
  detectCashFlowAnxiety,
  enhanceResponseWithCBC,
  getSeasonalPattern,
  CASH_FLOW_ANXIETY_PATTERNS,
  CASH_FLOW_ANXIETY_CBC_RESPONSES,
  GERMAN_PAYMENT_REALITY,
  GERMAN_SEASONAL_PATTERNS,
};