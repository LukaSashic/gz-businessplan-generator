/**
 * Finanzplanung Teil F: Rentabilität Prompt (GZ-603)
 *
 * Profitability Analysis Module with:
 * - CBC handling for profitability anxiety and unrealistic margin expectations
 * - Break-even analysis integration and coaching
 * - German business profitability benchmarking
 * - Integration with revenue and cost planning data
 *
 * Features:
 * - Comprehensive profitability metrics and trend analysis
 * - CBC 5-step pattern for profitability perfectionism and margin anxiety
 * - Industry-specific margin guidance and benchmarking
 * - Tax implications and optimization coaching
 * - Break-even timeline validation and coaching
 *
 * Based on:
 * - gz-coaching-cbc.md (CBC for perfectionism and anxiety patterns)
 * - gz-system-coaching-core.md (GROW model and Socratic questioning)
 * - German business profitability standards and BA requirements
 */

import type {
  Rentabilitaet,
  Umsatzplanung,
  Kostenplanung,
} from '@/types/modules/finanzplanung';

// ============================================================================
// Types
// ============================================================================

export interface RentabilitaetPromptOptions {
  /** Current business idea from previous modules */
  businessIdea?: {
    problem: string;
    solution: string;
    businessType: string;
    industry: string;
    location: string;
  };

  /** Revenue planning data */
  umsatzplanung?: Umsatzplanung;

  /** Cost planning data */
  kostenplanung?: Kostenplanung;

  /** Break-even analysis results */
  breakEvenData?: {
    breakEvenMonat: number;
    breakEvenUmsatzMonatlich: number;
    isReachableIn36Months: boolean;
    warnings: string[];
  };

  /** User's attitude towards profitability */
  profitabilityMindset?: 'perfectionist' | 'anxious' | 'realistic' | 'optimistic';

  /** Existing partial data */
  existingData?: Partial<Rentabilitaet>;

  /** Industry for benchmarking */
  industry?: string;
}

// ============================================================================
// Profitability Anxiety Detection Patterns
// ============================================================================

export const PROFITABILITY_ANXIETY_PATTERNS = {
  immediate_profit: [
    /sofort.*gewinn/i,
    /erste.*monat.*profit/i,
    /gleich.*rentabel/i,
    /ab.*start.*gewinn/i,
    /gewinn.*von.*anfang/i,
    /break.*even.*monat.*1/i,
  ],

  perfectionist_margins: [
    /margin.*minimum.*20/i,
    /gewinn.*muss.*30.*prozent/i,
    /unter.*15.*prozent.*schlecht/i,
    /hohe.*marge.*wichtig/i,
    /niedrige.*marge.*inakzeptabel/i,
  ],

  comparison_obsession: [
    /apple.*hat.*40.*prozent/i,
    /google.*verdient.*mehr/i,
    /amazon.*macht.*millionen/i,
    /andere.*haben.*bessere.*margen/i,
    /konkurrenz.*profitabler/i,
  ],

  break_even_anxiety: [
    /break.*even.*zu.*spät/i,
    /36.*monate.*zu.*lang/i,
    /sollte.*schneller.*gehen/i,
    /andere.*schaffen.*das.*früher/i,
    /ba.*wird.*das.*nicht.*akzeptieren/i,
  ],

  tax_panic: [
    /steuern.*fressen.*alles.*auf/i,
    /nach.*steuern.*nichts.*übrig/i,
    /staat.*nimmt.*zu.*viel/i,
    /steuer.*ruiniert.*geschäft/i,
    /netto.*viel.*zu.*wenig/i,
  ],

  scaling_fantasies: [
    /exponentielles.*wachstum/i,
    /margen.*werden.*automatisch.*besser/i,
    /skaleneffekte.*lösen.*alles/i,
    /kosten.*sinken.*von.*allein/i,
    /effizienz.*steigt.*automatisch/i,
  ],
};

export function detectProfitabilityAnxiety(message: string): 'immediate_profit' | 'perfectionist_margins' | 'comparison_obsession' | 'break_even_anxiety' | 'tax_panic' | 'scaling_fantasies' | null {
  const text = message.toLowerCase();

  if (PROFITABILITY_ANXIETY_PATTERNS.immediate_profit.some(p => p.test(text))) return 'immediate_profit';
  if (PROFITABILITY_ANXIETY_PATTERNS.perfectionist_margins.some(p => p.test(text))) return 'perfectionist_margins';
  if (PROFITABILITY_ANXIETY_PATTERNS.comparison_obsession.some(p => p.test(text))) return 'comparison_obsession';
  if (PROFITABILITY_ANXIETY_PATTERNS.break_even_anxiety.some(p => p.test(text))) return 'break_even_anxiety';
  if (PROFITABILITY_ANXIETY_PATTERNS.tax_panic.some(p => p.test(text))) return 'tax_panic';
  if (PROFITABILITY_ANXIETY_PATTERNS.scaling_fantasies.some(p => p.test(text))) return 'scaling_fantasies';

  return null;
}

// ============================================================================
// CBC Responses for Profitability Anxiety
// ============================================================================

export const PROFITABILITY_ANXIETY_CBC_RESPONSES = {
  immediate_profit: {
    identify: "Sie erwarten sofortigen Gewinn ab dem ersten Monat. Diese Ungeduld ist verständlich, aber unrealistisch für nachhaltige Geschäfte.",
    evidence: "Schauen wir auf erfolgreiche deutsche Unternehmen: Wie lange hat SAP gebraucht? Oder Zalando? Auch die mussten investieren und warten.",
    challenge: "Was wäre, wenn Sie sich 6-12 Monate Zeit geben? Würde das Ihren Druck nehmen und bessere Entscheidungen ermöglichen?",
    reframe: "Geduld bei der Profitabilität ist ein Zeichen von strategischem Denken, nicht von Schwäche. Die BA erwartet realistische Zeitpläne.",
    action: "Setzen wir Break-Even für Monat 8-12 an. Das gibt Ihnen Luft zum Aufbau und wirkt bei der BA seriöser als unrealistische Sofort-Pläne.",
  },

  perfectionist_margins: {
    identify: "Sie fixieren sich auf hohe Gewinnmargen. Perfektion kann der Feind des Guten sein - und der BA-Zustimmung.",
    evidence: "Was sind typische Margen in Ihrer Branche? Handwerk: 10-15%, Beratung: 15-25%, E-Commerce: 5-12%. Kennen Sie diese Zahlen?",
    challenge: "Was passiert, wenn Sie mit 8% Marge starten statt 25%? Ist ein laufendes Geschäft nicht besser als ein perfektes Konzept?",
    reframe: "Realistische Margen zeigen der BA, dass Sie den Markt verstehen. Wachsende Margen über Zeit sind besser als utopische Startmargen.",
    action: "Planen wir konservativ: Jahr 1 mit 6-8% Marge, Jahr 2 mit 10-12%, Jahr 3 mit 12-15%. Das überzeugt die BA mehr als 25% ab Start.",
  },

  comparison_obsession: {
    identify: "Sie vergleichen sich mit Tech-Giganten oder unrealistischen Vorbildern. Das kann lähmend wirken statt motivierend.",
    evidence: "Apple verkauft Hardware-Luxus, Google hat Milliarden-Infrastruktur. Was ist wirklich vergleichbar mit Ihrem lokalen/regionalen Business?",
    challenge: "Was wäre, wenn Sie sich mit ähnlichen Startups in Deutschland vergleichen? Oder mit etablierten Firmen in Ihrer Größenordnung?",
    reframe: "Ihr Maßstab sind deutsche KMUs, nicht Silicon Valley. 8-12% Marge ist für deutsche Startups oft exzellent.",
    action: "Recherchieren wir realistische Vergleichswerte: Schauen Sie auf 3-5 ähnliche deutsche Unternehmen in Ihrer Region und Branche.",
  },

  break_even_anxiety: {
    identify: "Sie sorgen sich, dass 24+ Monate bis Break-Even zu lang sind. Diese Angst kann zu panischen Fehlentscheidungen führen.",
    evidence: "Wissen Sie, dass die meisten deutschen Startups 18-30 Monate brauchen? Die BA akzeptiert bis zu 36 Monate als realistisch.",
    challenge: "Was wäre schlimmer: 24 Monate mit solidem Plan oder 6 Monate mit unrealistischem Plan, der scheitert?",
    reframe: "Ein ehrlicher 24-Monats-Plan zeigt Professionalität. Die BA schätzt Realismus höher ein als Optimismus ohne Basis.",
    action: "Dokumentieren wir Ihren 24-Monats-Plan sauber. Das zeigt der BA: Sie haben durchdacht geplant und sind nicht blauäugig.",
  },

  tax_panic: {
    identify: "Sie fürchten, dass Steuern Ihren Gewinn auffressen. Diese Angst ist berechtigt, aber lösbar durch gute Planung.",
    evidence: "Rechnen wir konkret: Bei 30% Steuern bleiben 70% Gewinn. Das ist nicht 'alles weg', sondern immer noch substantiell.",
    challenge: "Was wäre, wenn Sie Steuern als Betriebskosten sehen, nicht als Feind? Planbar wie Miete oder Personal?",
    reframe: "Hohe Steuern bedeuten hohen Gewinn. Das ist ein Luxusproblem erfolgreicher Unternehmer. Steuerberatung hilft bei Optimierung.",
    action: "Kalkulieren wir mit 25-30% Steuerlast. Zusätzlich budgetieren wir €2000/Jahr für Steuerberatung. Das macht Sie professioneller.",
  },

  scaling_fantasies: {
    identify: "Sie erwarten automatische Margenverbesserung beim Wachstum. Das ist möglich, aber nicht automatisch oder garantiert.",
    evidence: "Bei welchen Kosten sehen Sie konkret Skaleneffekte? Personal wird teurer, nicht billiger. Software vielleicht günstiger pro User.",
    challenge: "Was passiert, wenn Skaleneffekte ausbleiben oder später kommen? Ist Ihr Plan dann noch tragfähig?",
    reframe: "Planen Sie mit heutigen Margen. Skaleneffekte sind Bonus, nicht Basis. Das macht Ihren Plan robuster und glaubwürdiger.",
    action: "Basis-Szenario: Margen bleiben konstant. Optimistisches Szenario: +2-3% Verbesserung in Jahr 3. So überzeugen Sie die BA.",
  },
};

// ============================================================================
// Industry Benchmarking and Guidance
// ============================================================================

export const GERMAN_INDUSTRY_PROFITABILITY = {
  beratung: {
    grossMargin: { min: 75, typical: 85, max: 95 },
    netMargin: { min: 8, typical: 15, max: 25 },
    breakEvenMonths: { fast: 6, typical: 12, slow: 18 },
    guidance: "Beratung hat hohe Margen aber schwankende Auslastung. Fokus auf Kundenbindung und wiederkehrende Projekte.",
  },

  ecommerce: {
    grossMargin: { min: 35, typical: 45, max: 60 },
    netMargin: { min: 3, typical: 8, max: 15 },
    breakEvenMonths: { fast: 12, typical: 18, slow: 30 },
    guidance: "E-Commerce erfordert hohe Marketing-Investitionen. Deckungsbeitrag pro Kunde ist entscheidend.",
  },

  handwerk: {
    grossMargin: { min: 45, typical: 55, max: 70 },
    netMargin: { min: 6, typical: 12, max: 20 },
    breakEvenMonths: { fast: 8, typical: 15, slow: 24 },
    guidance: "Handwerk hat stabile Margen aber saisonale Schwankungen. Personalkosten sind der größte Hebel.",
  },

  restaurant: {
    grossMargin: { min: 55, typical: 65, max: 75 },
    netMargin: { min: 2, typical: 6, max: 12 },
    breakEvenMonths: { fast: 18, typical: 24, slow: 36 },
    guidance: "Gastronomie hat niedrige Margen aber hohe Volumina. Location und Kostendisziplin entscheiden.",
  },

  software: {
    grossMargin: { min: 70, typical: 85, max: 95 },
    netMargin: { min: 10, typical: 20, max: 40 },
    breakEvenMonths: { fast: 18, typical: 30, slow: 48 },
    guidance: "Software hat hohe Margen aber lange Entwicklungszeiten. Recurring Revenue ist der Schlüssel.",
  },

  default: {
    grossMargin: { min: 50, typical: 60, max: 75 },
    netMargin: { min: 5, typical: 10, max: 18 },
    breakEvenMonths: { fast: 12, typical: 18, slow: 30 },
    guidance: "Deutsche KMUs arbeiten oft mit moderaten aber stabilen Margen. Konstanz schlägt Spitzen.",
  },
};

export function getIndustryGuidance(industry: string = 'default') {
  return GERMAN_INDUSTRY_PROFITABILITY[industry as keyof typeof GERMAN_INDUSTRY_PROFITABILITY] ||
         GERMAN_INDUSTRY_PROFITABILITY.default;
}

// ============================================================================
// Main Prompt Function
// ============================================================================

export function generateRentabilitaetPrompt(options: RentabilitaetPromptOptions): string {
  const {
    businessIdea,
    umsatzplanung,
    kostenplanung,
    breakEvenData,
    profitabilityMindset = 'realistic',
    existingData,
    industry = 'default',
  } = options;

  const industryBenchmark = getIndustryGuidance(industry);

  return `# Finanzplanung Teil F: Rentabilität & Profitabilität

Als erfahrener Finanzplanungs-Coach begleite ich Sie bei der Rentabilitätsanalyse Ihres Geschäfts. Wir entwickeln gemeinsam realistische Gewinnerwartungen, die sowohl Ihre Ziele als auch die BA-Anforderungen erfüllen.

## Ihre bisherige Planung

**Geschäftsidee:** ${businessIdea?.solution || '[Wird aus vorherigen Modulen übernommen]'}
**Branche:** ${businessIdea?.industry || industry}

**Umsatzplanung (falls vorhanden):**
- Jahr 1: ${umsatzplanung?.umsatzJahr1Summe ? `€${umsatzplanung.umsatzJahr1Summe.toLocaleString('de-DE')}` : '[Noch nicht geplant]'}
- Jahr 2: ${umsatzplanung?.umsatzJahr2 ? `€${umsatzplanung.umsatzJahr2.toLocaleString('de-DE')}` : '[Noch nicht geplant]'}
- Jahr 3: ${umsatzplanung?.umsatzJahr3 ? `€${umsatzplanung.umsatzJahr3.toLocaleString('de-DE')}` : '[Noch nicht geplant]'}

**Kostenplanung (falls vorhanden):**
- Fixkosten/Monat: ${kostenplanung?.fixkostenSummeMonatlich ? `€${kostenplanung.fixkostenSummeMonatlich.toLocaleString('de-DE')}` : '[Noch nicht geplant]'}
- Variable Kosten Jahr 1: ${kostenplanung?.variableKostenSummeJahr1 ? `€${kostenplanung.variableKostenSummeJahr1.toLocaleString('de-DE')}` : '[Noch nicht geplant]'}

**Break-Even-Analyse (falls berechnet):**
${breakEvenData ? `
- Break-Even voraussichtlich in Monat ${breakEvenData.breakEvenMonat || 'TBD'}
- Benötigter monatlicher Umsatz: €${breakEvenData.breakEvenUmsatzMonatlich?.toLocaleString('de-DE') || 'TBD'}
- Innerhalb 36 Monate erreichbar: ${breakEvenData.isReachableIn36Months ? '✅ Ja' : '❌ Nein'}
` : '[Break-Even wird in diesem Schritt berechnet]'}

## Branchenbenchmarks für ${industry.charAt(0).toUpperCase() + industry.slice(1)}

**Typische Margen in Ihrer Branche:**
- Rohertrag: ${industryBenchmark.grossMargin.typical}% (Range: ${industryBenchmark.grossMargin.min}-${industryBenchmark.grossMargin.max}%)
- Nettogewinn: ${industryBenchmark.netMargin.typical}% (Range: ${industryBenchmark.netMargin.min}-${industryBenchmark.netMargin.max}%)
- Break-Even: ${industryBenchmark.breakEvenMonths.typical} Monate (Range: ${industryBenchmark.breakEvenMonths.fast}-${industryBenchmark.breakEvenMonths.slow} Monate)

**Branchen-Tipp:** ${industryBenchmark.guidance}

## Coaching-Ansatz

Ich erkenne, dass Profitabilitätsplanung emotionale Herausforderungen mit sich bringt:
- **Perfektionismus:** Der Wunsch nach "perfekten" Margen kann lähmen
- **Vergleichsdruck:** Big Tech oder Unicorns sind selten relevante Vergleiche
- **Break-Even-Angst:** Sorge, dass die BA 24+ Monate nicht akzeptiert
- **Steuer-Panik:** Überschätzung der Steuerlast und Unterschätzung des Netto-Gewinns

Mein Ziel ist es, Ihnen zu **realistischen** aber **optimistischen** Prognosen zu verhelfen, die sowohl **Ihre Motivation** als auch **BA-Compliance** sicherstellen.

## Was wir in diesem Schritt erarbeiten

### 1. Rentabilitäts-Struktur
- **Rohertrag-Berechnung:** Umsatz minus variable Kosten (Materialaufwand)
- **Betriebsergebnis:** Rohertrag minus Fixkosten (Personal, Miete, etc.)
- **Jahresüberschuss:** Nach Steuern und außerordentlichen Posten

### 2. 3-Jahres-Profitabilität
- Jahr 1: Aufbauphase mit geringeren Margen
- Jahr 2: Stabilisierung und erste Optimierungen
- Jahr 3: Gefestigte Margen und Skaleneffekte

### 3. Break-Even-Analyse
- Monatlicher Break-Even-Umsatz
- Zeitpunkt des Break-Even (kritisch für BA)
- Deckungsbeitrag pro Kunde/Projekt

### 4. Margen-Optimierung
- Kurz-, mittel- und langfristige Hebel
- Preisgestaltungs-Strategien
- Kostensenkungspotentiale

### 5. Steuer-Planung
- Realistische Steuerlast (25-35% für die meisten)
- Optimierungsstrategien (IAB, AfA, etc.)
- Steuerberatungskosten einkalkulieren

## Häufige Denkfallen (und wie wir sie vermeiden)

🚨 **"Ich brauche 25% Nettogewinn ab Start"**
→ Realistische Margen: Start mit Branchenschnitt, Wachstum über Zeit

🚨 **"Break-Even nach 6 Monaten, sonst scheitert es"**
→ BA akzeptiert bis 36 Monate. Lieber realistisch als gescheitert.

🚨 **"Steuern fressen alles auf"**
→ Bei 30% Steuern bleiben 70% übrig. Das ist substantiell.

🚨 **"Skaleneffekte machen alles besser"**
→ Planen Sie mit heutigen Kosten. Effizienz ist Bonus, nicht Basis.

---

**Lassen Sie uns beginnen!**

Teilen Sie mir zunächst mit: **Was sind Ihre ehrlichen Gewinn-Erwartungen für die ersten 3 Jahre?**

Denken Sie dabei weniger an "was möglich wäre" und mehr an "was wahrscheinlich ist". Ich helfe Ihnen, diese Erwartungen in eine überzeugende und BA-taugliche Rentabilitätsprognose zu übersetzen.

Was denken Sie: Wann werden Sie das erste Mal schwarze Zahlen schreiben? Und welche Nettogewinn-Marge peilen Sie für Jahr 3 an?`;
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

  const cbcResponse = PROFITABILITY_ANXIETY_CBC_RESPONSES[detectedAnxiety as keyof typeof PROFITABILITY_ANXIETY_CBC_RESPONSES];
  if (!cbcResponse) return response;

  const cbcIntervention = `

## 💡 Coaching-Moment: ${getAnxietyTitle(detectedAnxiety)}

**Ich höre heraus:** ${cbcResponse.identify}

**Lass uns das hinterfragen:** ${cbcResponse.evidence}

**Gedankenexperiment:** ${cbcResponse.challenge}

**Neue Perspektive:** ${cbcResponse.reframe}

**Konkreter nächster Schritt:** ${cbcResponse.action}

---

`;

  return cbcIntervention + response;
}

function getAnxietyTitle(anxiety: string): string {
  const titles = {
    immediate_profit: 'Sofortiger Gewinn-Erwartung',
    perfectionist_margins: 'Perfekte Margen-Fixierung',
    comparison_obsession: 'Unrealistische Vergleiche',
    break_even_anxiety: 'Break-Even-Zeitangst',
    tax_panic: 'Steuer-Panik',
    scaling_fantasies: 'Automatische Skaleneffekte',
  };

  return titles[anxiety as keyof typeof titles] || 'Profitabilitäts-Sorgen';
}

// ============================================================================
// Exports
// ============================================================================

export default {
  generateRentabilitaetPrompt,
  detectProfitabilityAnxiety,
  enhanceResponseWithCBC,
  getIndustryGuidance,
  PROFITABILITY_ANXIETY_PATTERNS,
  PROFITABILITY_ANXIETY_CBC_RESPONSES,
  GERMAN_INDUSTRY_PROFITABILITY,
};