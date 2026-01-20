/**
 * Finanzplanung Teil C: Privatentnahme Prompt (GZ-601)
 *
 * Personal Withdrawal Planning Module with:
 * - Realistic living expense calculation
 * - Family situation integration
 * - CBC handling for lifestyle-related limiting beliefs
 * - Regional cost-of-living adjustments
 *
 * Features:
 * - Category-based expense breakdown
 * - CBC for lifestyle anxiety and perfectionism
 * - Regional benchmarking and reality checks
 * - Integration with GZ living allowance
 *
 * Based on:
 * - gz-coaching-cbc.md (CBC for lifestyle beliefs)
 * - German average living costs and regional variations
 * - GZ integration requirements
 */

import type {
  Privatentnahme,
} from '@/types/modules/finanzplanung';

// ============================================================================
// Types
// ============================================================================

export interface PrivatentnahmePromptOptions {
  /** User's personal situation */
  personalSituation?: {
    familyStatus: 'single' | 'partner' | 'family';
    children: number;
    location: string; // City for cost-of-living adjustment
    currentIncome: number;
    currentExpenses: number;
  };

  /** Current lifestyle */
  lifestyle?: {
    housing: 'own' | 'rent' | 'family';
    mobility: 'car' | 'public' | 'bike';
    diningOut: 'frequent' | 'moderate' | 'rare';
    hobbies: 'expensive' | 'moderate' | 'budget';
  };

  /** Financial goals */
  financialGoals?: {
    savingsRate: number; // % of income to save
    emergencyFund: number; // Months of expenses
    riskTolerance: 'conservative' | 'balanced' | 'aggressive';
  };

  /** Existing data */
  existingData?: Partial<Privatentnahme>;
}

// ============================================================================
// Lifestyle-Related Limiting Beliefs Detection
// ============================================================================

export const LIFESTYLE_BELIEF_PATTERNS = {
  minimalism_guilt: [
    /darf nicht.*wenig.*leben/i,
    /muss.*standard.*halten/i,
    /kann nicht.*verzichten/i,
    /was denken.*andere/i,
  ],

  luxury_entitlement: [
    /brauche.*das.*beste/i,
    /verdiene.*mehr/i,
    /andere.*haben.*auch/i,
    /ohne.*x.*geht.*nicht/i,
  ],

  perfectionist_budgeting: [
    /muss.*genau.*rechnen/i,
    /jeden.*cent.*planen/i,
    /ohne.*reserve.*geht.*nicht/i,
    /was.*wenn.*teurer/i,
  ],

  anxiety_scarcity: [
    /angst.*nicht.*reicht/i,
    /was.*wenn.*krank/i,
    /muss.*viel.*sparen/i,
    /sicherheit.*wichtiger/i,
  ],
};

export function detectLifestyleBelief(message: string): 'minimalism_guilt' | 'luxury_entitlement' | 'perfectionist_budgeting' | 'anxiety_scarcity' | null {
  const text = message.toLowerCase();

  if (LIFESTYLE_BELIEF_PATTERNS.minimalism_guilt.some(p => p.test(text))) return 'minimalism_guilt';
  if (LIFESTYLE_BELIEF_PATTERNS.luxury_entitlement.some(p => p.test(text))) return 'luxury_entitlement';
  if (LIFESTYLE_BELIEF_PATTERNS.perfectionist_budgeting.some(p => p.test(text))) return 'perfectionist_budgeting';
  if (LIFESTYLE_BELIEF_PATTERNS.anxiety_scarcity.some(p => p.test(text))) return 'anxiety_scarcity';

  return null;
}

// ============================================================================
// CBC Responses for Lifestyle Beliefs
// ============================================================================

export const LIFESTYLE_CBC_RESPONSES = {
  minimalism_guilt: {
    identify: "Sie haben das Gefühl, Sie dürften nicht weniger ausgeben oder müssten einen bestimmten Standard halten.",
    evidence: "Wer bestimmt denn, was ein angemessener Lebensstandard für Sie ist? Und warum ist deren Meinung wichtiger als Ihr Geschäftserfolg?",
    challenge: "Ist es wirklich so, dass andere Sie verurteilen würden? Oder bewundern manche sogar den Mut zur Gründung?",
    reframe: "Temporärer Verzicht für die Gründung ist eine Investition in Ihre Zukunft, kein Makel.",
    action: "Lassen Sie uns einen Lebensstandard planen, mit dem Sie sich wohl fühlen UND erfolgreich gründen können."
  },

  luxury_entitlement: {
    identify: "Sie sind gewohnt an einen bestimmten Standard und finden, Sie haben ein Recht darauf.",
    evidence: "Welche erfolgreichen Gründer kennen Sie, die von Anfang an luxuriös gelebt haben?",
    challenge: "Was ist wichtiger - der gewohnte Standard oder der Erfolg Ihres Business?",
    reframe: "Gründer investieren oft erst in ihr Business und belohnen sich später. Das ist kluge Prioritätensetzung.",
    action: "Lassen Sie uns schauen, wo Sie temporär kürzen können, ohne dass Ihre Lebensqualität wirklich leidet."
  },

  perfectionist_budgeting: {
    identify: "Sie möchten jeden Cent perfekt planen und alle Eventualitäten absichern.",
    evidence: "Wie genau waren Ihre bisherigen Budgets? Und was ist passiert, wenn Sie mal daneben lagen?",
    challenge: "Ist es realistisch, alle Eventualitäten vorherzusehen? Oder ist Flexibilität wichtiger als Perfektion?",
    reframe: "Ein guter Plan ist anpassungsfähig. Puffer ja, aber Perfektion blockiert oft den Start.",
    action: "Lassen Sie uns einen robusten, aber nicht überperfekten Plan erstellen, mit dem Sie starten können."
  },

  anxiety_scarcity: {
    identify: "Sie haben Angst, dass das Geld nicht reichen könnte und wollen deshalb sehr viel sparen.",
    evidence: "Was ist denn das Schlimmste, was passieren kann, wenn das Geld knapp wird? Und wie wahrscheinlich ist das wirklich?",
    challenge: "Ist es sinnvoller, aus Angst zu viel zurückzuhalten, oder kalkuliert zu investieren?",
    reframe: "Sicherheit ist wichtig, aber Überängstlichkeit kann den Geschäftserfolg blockieren.",
    action: "Lassen Sie uns eine realistische Reserve planen - sicher genug, um zu schlafen, nicht so viel, dass das Business leidet."
  }
};

// ============================================================================
// Regional Cost Benchmarks (Germany)
// ============================================================================

export const REGIONAL_COST_FACTORS = {
  // Metropolitan areas
  'München': 1.4,
  'Frankfurt': 1.35,
  'Stuttgart': 1.25,
  'Hamburg': 1.2,
  'Berlin': 1.15,
  'Köln': 1.15,
  'Düsseldorf': 1.2,

  // Mid-size cities
  'Hannover': 1.05,
  'Nürnberg': 1.05,
  'Bremen': 1.0,
  'Dresden': 0.9,
  'Leipzig': 0.9,

  // Smaller cities/rural
  'default': 0.95,
};

export const BASE_LIVING_COSTS = {
  single: {
    miete: 800,
    lebensmittel: 400,
    versicherungen: 300,
    mobilitaet: 250,
    kommunikation: 80,
    sonstigeAusgaben: 400,
    sparrate: 200,
  },

  partner: {
    miete: 1200,
    lebensmittel: 600,
    versicherungen: 450,
    mobilitaet: 350,
    kommunikation: 120,
    sonstigeAusgaben: 600,
    sparrate: 300,
  },

  family: {
    miete: 1500,
    lebensmittel: 800,
    versicherungen: 600,
    mobilitaet: 450,
    kommunikation: 150,
    sonstigeAusgaben: 800,
    sparrate: 200, // Lower due to higher expenses
  },
};

// ============================================================================
// Expense Categories with Guidance
// ============================================================================

export const EXPENSE_CATEGORIES = {
  miete: {
    name: "Miete/Wohnen",
    description: "Miete, Nebenkosten, Strom, Internet",
    typical: "30-40% des Nettoeinkommens",
    savingTips: ["Kleinere Wohnung", "WG", "Günstigere Lage", "Untermieter"],
    questions: [
      "Leben Sie zur Miete oder im Eigentum?",
      "Wie hoch sind Ihre monatlichen Wohnkosten?",
      "Könnten Sie temporär günstiger wohnen?",
      "Gibt es Untermieter-Möglichkeiten?",
    ],
  },

  lebensmittel: {
    name: "Lebensmittel",
    description: "Supermarkt, Restaurants, Getränke",
    typical: "€300-500 pro Person/Monat",
    savingTips: ["Selbst kochen", "Discounter", "Meal prep", "Weniger auswärts essen"],
    questions: [
      "Wie oft essen Sie auswärts?",
      "Kochen Sie gerne selbst?",
      "Wo kaufen Sie ein - Discounter oder Premium?",
      "Wie wichtig ist Ihnen Bio/Regional?",
    ],
  },

  versicherungen: {
    name: "Versicherungen",
    description: "KV, Haftpflicht, BU, evtl. Private KV",
    typical: "€200-400/Monat (PKV höher)",
    savingTips: ["Tarife vergleichen", "Selbstbehalt erhöhen", "Unnötige kündigen"],
    questions: [
      "Sind Sie gesetzlich oder privat versichert?",
      "Haben Sie eine Berufsunfähigkeitsversicherung?",
      "Welche weiteren Versicherungen haben Sie?",
      "Wann haben Sie zuletzt Tarife verglichen?",
    ],
  },

  mobilitaet: {
    name: "Mobilität",
    description: "Auto, ÖPNV, Taxi, Reisen",
    typical: "€200-500/Monat je nach Auto",
    savingTips: ["ÖPNV", "Carsharing", "Fahrrad", "Günstigeres Auto"],
    questions: [
      "Haben Sie ein Auto oder nutzen Sie ÖPNV?",
      "Wie wichtig ist das Auto für Ihr Business?",
      "Könnten Sie mit günstigerer Mobilität leben?",
      "Reisen Sie viel privat?",
    ],
  },

  kommunikation: {
    name: "Kommunikation",
    description: "Handy, Internet, Streaming, GEZ",
    typical: "€80-150/Monat",
    savingTips: ["Günstigere Tarife", "Bündeln", "Streaming reduzieren"],
    questions: [
      "Wie viele Streaming-Abos haben Sie?",
      "Brauchen Sie Premium-Handy-Tarif?",
      "Teilen Sie sich Abos mit Familie?",
    ],
  },

  sonstigeAusgaben: {
    name: "Sonstige Ausgaben",
    description: "Kleidung, Hobbys, Geschenke, Überraschungen",
    typical: "€300-600/Monat",
    savingTips: ["Weniger spontane Käufe", "Second-hand", "Günstigere Hobbys"],
    questions: [
      "Was sind Ihre teuersten Hobbys?",
      "Wie viel geben Sie für Kleidung aus?",
      "Haben Sie teure Gewohnheiten?",
      "Was macht Ihnen Freude, kostet aber wenig?",
    ],
  },

  sparrate: {
    name: "Sparen/Investieren",
    description: "Notgroschen, Rente, Investments",
    typical: "10-20% des Nettoeinkommens",
    savingTips: ["Automatisch sparen", "ETFs statt Einzelaktien", "Erst Business, dann Luxus-Sparen"],
    questions: [
      "Wie wichtig ist Ihnen Sparen?",
      "Haben Sie einen Notgroschen?",
      "Investieren Sie bereits?",
      "Wie viel wollen Sie mindestens sparen?",
    ],
  },
};

// ============================================================================
// Main Prompt Builder
// ============================================================================

export function buildPrivatentnahmePrompt(
  options: PrivatentnahmePromptOptions = {},
  userMessage: string,
  _conversationHistory: Array<{role: string; content: string}>
): string {
  const {
    personalSituation,
    financialGoals,
    existingData = {},
  } = options;

  // Detect lifestyle-related limiting beliefs
  const belief = detectLifestyleBelief(userMessage);

  // Calculate regional cost factor
  const location = personalSituation?.location || 'default';
  const costFactor = REGIONAL_COST_FACTORS[location as keyof typeof REGIONAL_COST_FACTORS] || REGIONAL_COST_FACTORS.default;

  // Get base costs for family situation
  const familyStatus = personalSituation?.familyStatus || 'single';
  const baseCosts = BASE_LIVING_COSTS[familyStatus];

  // Adjust for region
  const adjustedCosts = Object.fromEntries(
    Object.entries(baseCosts).map(([key, value]) => [
      key,
      Math.round(value * costFactor)
    ])
  );

  const totalBaseCosts = Object.values(adjustedCosts).reduce((sum, cost) => sum + cost, 0);

  const prompt = `# Finanzplanung Teil C: Privatentnahme

## Coaching-Kontext

Du führst durch die **Privatentnahme-Planung** - Ihr persönlicher Lebensunterhalt während der Gründung.

**Ziel:** Realistische Einschätzung Ihrer privaten Ausgaben für die Finanzplanung.

**Ihre Situation:**
- Familienstatus: ${familyStatus} ${personalSituation?.children ? `+ ${personalSituation.children} Kind(er)` : ''}
- Standort: ${location} (Kostenfaktor: ${costFactor})
- Aktuelles Einkommen: €${personalSituation?.currentIncome?.toLocaleString('de-DE') || 'Nicht angegeben'}
- Risikotoleranz: ${financialGoals?.riskTolerance || 'unbekannt'}

${belief ? `**⚠️ Lifestyle-Limiting-Belief erkannt:** ${belief}` : ''}

## CBC Integration für Lifestyle-Beliefs

${belief ? generateLifestyleCBCIntervention(belief) : ''}

## Regional-Benchmark für ${location}

**Orientierungswerte für ${familyStatus}:**
${Object.entries(adjustedCosts).map(([category, amount]) =>
  `- ${EXPENSE_CATEGORIES[category as keyof typeof EXPENSE_CATEGORIES]?.name}: €${amount.toLocaleString('de-DE')}`
).join('\n')}

**Gesamt: €${totalBaseCosts.toLocaleString('de-DE')}/Monat**

*Diese Werte sind Richtwerte. Ihre individuelle Situation kann abweichen.*

## Ausgaben-Kategorien Detail

${Object.entries(EXPENSE_CATEGORIES).map(([_, category]) => `
### ${category.name}
**Beschreibung:** ${category.description}
**Typischer Bereich:** ${category.typical}
**Sparmöglichkeiten:** ${category.savingTips.join(', ')}

**Reflexionsfragen:**
${category.questions.map(q => `- ${q}`).join('\n')}
`).join('\n')}

## Coaching-Prinzipien

1. **Ehrlichkeit vor Optimismus** - Realistische Zahlen sind wichtiger als optimistische
2. **Temporäre Anpassungen** - Gründungsphase ≠ langfristiger Standard
3. **Prioritäten setzen** - Was ist wirklich wichtig vs. Gewohnheit?
4. **Sicherheit vs. Flexibilität** - Puffer ja, aber nicht übertreiben
5. **Individuelle Lösung** - Nicht vergleichen, sondern passend machen

## Spezial-Themen

### GZ-Integration
Falls Sie Gründungszuschuss erhalten:
- Phase 1: €${personalSituation?.currentIncome ? Math.min(personalSituation.currentIncome, 3000) : '1.500-3.000'}/Monat (6 Monate)
- Phase 2: €300/Monat (9 Monate)
- **Achtung:** GZ ist Zuschuss zum Lebensunterhalt, deckt evtl. nicht alle Kosten!

### Steuer-Optimierung
- Privatentnahme ist **nicht** steuerlich absetzbar
- Aber: Private Krankenversicherung als Betriebsausgabe möglich
- Fahrtkosten privat/geschäftlich trennen

## Ausgabe-Format

Du MUSST in diesem exakten JSON-Format antworten:

\`\`\`json
{
  "response": "Deine empathische, strukturierte Coaching-Antwort hier",
  "moduleData": {
    "privatentnahme": {
      "miete": ${adjustedCosts.miete},
      "lebensmittel": ${adjustedCosts.lebensmittel},
      "versicherungen": ${adjustedCosts.versicherungen},
      "mobilitaet": ${adjustedCosts.mobilitaet},
      "kommunikation": ${adjustedCosts.kommunikation},
      "sonstigeAusgaben": ${adjustedCosts.sonstigeAusgaben},
      "sparrate": ${adjustedCosts.sparrate},
      "monatlichePrivatentnahme": ${totalBaseCosts},
      "jaehrlichePrivatentnahme": ${totalBaseCosts * 12}
    }
  },
  "coachingNotes": {
    "lifestyleBelief": "${belief || 'none'}",
    "costFactor": ${costFactor},
    "familyStatus": "${familyStatus}",
    "savingPotential": ["Erkannte Sparmöglichkeiten"],
    "riskAreas": ["Potenzielle Kostenfallen"],
    "benchmark": "vs. ${location} Durchschnitt"
  }
}
\`\`\`

## Aktuelle Situation

**Bestehende Daten:**
${JSON.stringify(existingData, null, 2)}

**Nutzer-Nachricht:**
"${userMessage}"

**Aufgabe:** Helfen Sie bei einer ehrlichen, realistischen Privatentnahme-Planung. Bei Lifestyle-Beliefs: CBC anwenden. Orientierung an Benchmarks, aber individuelle Anpassung.`;

  return prompt;
}

// ============================================================================
// Helper Functions
// ============================================================================

function generateLifestyleCBCIntervention(belief: string): string {
  const response = LIFESTYLE_CBC_RESPONSES[belief as keyof typeof LIFESTYLE_CBC_RESPONSES];

  return `
### CBC 5-Schritt Intervention für Lifestyle-Beliefs

**IDENTIFY:** ${response.identify}
**EVIDENCE:** ${response.evidence}
**CHALLENGE:** ${response.challenge}
**REFRAME:** ${response.reframe}
**ACTION:** ${response.action}

Verwende diese CBC-Struktur, um das Lifestyle-Limiting-Belief zu adressieren.`;
}

export function calculateRegionalCosts(
  familyStatus: 'single' | 'partner' | 'family',
  location: string,
  customFactors?: Record<string, number>
): Record<string, number> {
  const baseCosts = BASE_LIVING_COSTS[familyStatus];
  const costFactor = REGIONAL_COST_FACTORS[location as keyof typeof REGIONAL_COST_FACTORS] || REGIONAL_COST_FACTORS.default;

  return Object.fromEntries(
    Object.entries(baseCosts).map(([category, baseAmount]) => {
      const customFactor = customFactors?.[category] || 1;
      return [category, Math.round(baseAmount * costFactor * customFactor)];
    })
  );
}

export function validatePrivatentnahme(data: Partial<Privatentnahme>): {
  isRealistic: boolean;
  warnings: string[];
  suggestions: string[];
} {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  const total = data.monatlichePrivatentnahme || 0;

  // Check if total is reasonable
  if (total < 1500) {
    warnings.push("Sehr niedrige Privatentnahme - ist das langfristig haltbar?");
    suggestions.push("Prüfen Sie kritische Ausgaben wie Versicherungen und Reserve");
  }

  if (total > 5000) {
    warnings.push("Hohe Privatentnahme - kann das Business das tragen?");
    suggestions.push("Identifizieren Sie temporäre Einsparungsmöglichkeiten");
  }

  // Check individual categories
  if (data.miete && data.miete > total * 0.5) {
    warnings.push("Wohnkosten über 50% der Privatentnahme");
    suggestions.push("Günstigere Wohnalternativen prüfen");
  }

  if (data.sparrate && data.sparrate > total * 0.3) {
    warnings.push("Sehr hohe Sparrate während Gründungsphase");
    suggestions.push("Temporär weniger sparen, mehr in Business investieren?");
  }

  return {
    isRealistic: warnings.length === 0,
    warnings,
    suggestions,
  };
}

export default {
  buildPrivatentnahmePrompt,
  detectLifestyleBelief,
  LIFESTYLE_CBC_RESPONSES,
  REGIONAL_COST_FACTORS,
  BASE_LIVING_COSTS,
  calculateRegionalCosts,
  validatePrivatentnahme,
};