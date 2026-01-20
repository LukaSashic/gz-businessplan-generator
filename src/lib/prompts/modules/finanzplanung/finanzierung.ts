/**
 * Finanzplanung Teil B: Finanzierung Prompt (GZ-601)
 *
 * Financing Strategy Module with:
 * - CBC handling for "Ich brauche erst X" limiting belief
 * - Gründungszuschuss integration and eligibility
 * - Realistic financing mix and risk assessment
 * - Bank loan preparation and requirements
 *
 * Features:
 * - Multiple financing sources evaluation
 * - CBC for prerequisite thinking ("Ich brauche erst...")
 * - Eigenkapital vs Fremdkapital balance
 * - GZ-specific guidance and requirements
 *
 * Based on:
 * - gz-coaching-cbc.md (CBC for prerequisite thinking)
 * - German GZ eligibility and BA requirements
 * - Banking standards for startup financing
 */

import type {
  Finanzierung,
} from '@/types/modules/finanzplanung';

// ============================================================================
// Types
// ============================================================================

export interface FinanzierungPromptOptions {
  /** Capital requirements from previous step */
  kapitalbedarf?: {
    gesamtkapitalbedarf: number;
    gruendungskostenSumme: number;
    investitionenSumme: number;
    anlaufkostenSumme: number;
  };

  /** User's financial situation */
  userProfile?: {
    eigenkapital: number;
    monthlyIncome: number;
    creditScore?: 'excellent' | 'good' | 'fair' | 'poor';
    existingDebts: number;
    gzEligible: boolean;
  };

  /** Business context */
  businessContext?: {
    businessType: string;
    riskLevel: 'low' | 'medium' | 'high';
    assetsBacked: boolean; // Can provide collateral
  };

  /** Existing financing data */
  existingData?: Partial<Finanzierung>;
}

// ============================================================================
// Prerequisite Thinking Detection (CBC)
// ============================================================================

export const PREREQUISITE_PATTERNS = {
  capital_first: [
    /brauche erst.*eigenkapital/i,
    /muss erst.*sparen/i,
    /ohne.*geld.*geht.*nichts/i,
    /erst.*kapital.*dann/i,
  ],

  perfect_plan: [
    /muss erst.*businessplan/i,
    /brauche erst.*perfekten.*plan/i,
    /ohne.*vollständigen.*plan/i,
    /erst.*wenn.*plan.*fertig/i,
    /brauche erst.*alles.*klar/i,
    /ohne.*sicherheit/i,
    /erst.*wenn.*ich.*weiß/i,
  ],

  external_validation: [
    /brauche erst.*bestätigung/i,
    /bank.*muss.*erst/i,
    /jemand.*muss.*sagen/i,
    /ohne.*zusage/i,
  ],

  perfect_conditions: [
    /brauche erst.*perfekte.*zeit/i,
    /muss erst.*markt/i,
    /ohne.*garantie/i,
    /erst.*wenn.*sicher/i,
  ],
};

export function detectPrerequisiteThinking(message: string): 'capital_first' | 'perfect_plan' | 'external_validation' | 'perfect_conditions' | null {
  const text = message.toLowerCase();

  if (PREREQUISITE_PATTERNS.capital_first.some(p => p.test(text))) return 'capital_first';
  if (PREREQUISITE_PATTERNS.perfect_plan.some(p => p.test(text))) return 'perfect_plan';
  if (PREREQUISITE_PATTERNS.external_validation.some(p => p.test(text))) return 'external_validation';
  if (PREREQUISITE_PATTERNS.perfect_conditions.some(p => p.test(text))) return 'perfect_conditions';

  return null;
}

// ============================================================================
// CBC Responses for Prerequisite Thinking
// ============================================================================

export const PREREQUISITE_CBC_RESPONSES = {
  capital_first: {
    identify: "Sie denken, Sie brauchen erst mehr Eigenkapital, bevor Sie anfangen können.",
    evidence: "Wie viele erfolgreiche Unternehmen kennen Sie, die mit 100% Eigenkapital gestartet sind?",
    challenge: "Ist es wirklich unmöglich zu starten, oder brauchen Sie nur eine clevere Finanzierungsstrategie?",
    reframe: "Erfolgreiche Gründer nutzen oft mehrere Finanzierungsquellen. Eigenkapital ist nur eine davon.",
    action: "Lassen Sie uns schauen, welche Finanzierungsquellen für Sie verfügbar sind - auch mit wenig Eigenkapital."
  },

  perfect_plan: {
    identify: "Sie möchten erst den perfekten Businessplan haben, bevor Sie nach Finanzierung suchen.",
    evidence: "Wie perfekt war der erste Businessplan von Apple oder Google? Und haben sie trotzdem Finanzierung bekommen?",
    challenge: "Wird Ihr Plan jemals 100% perfekt sein? Oder ist 'gut genug' besser als 'perfekt aber nie fertig'?",
    reframe: "Finanzierungspartner wissen, dass Pläne sich ändern. Sie suchen realistische Gründer, nicht perfekte Propheten.",
    action: "Ihr Plan ist bereits gut genug, um Finanzierungsoptionen zu erkunden. Lassen Sie uns das tun."
  },

  external_validation: {
    identify: "Sie warten auf eine Bestätigung von außen - Bank, Berater oder anderen - dass Ihr Plan gut ist.",
    evidence: "Wer kann Ihr Business besser einschätzen - Sie, die die Idee leben, oder jemand, der sie 30 Minuten sieht?",
    challenge: "Macht es Sinn, Ihre Zukunft von der Meinung anderer abhängig zu machen?",
    reframe: "Finanzierungspartner suchen überzeugte Gründer, keine unsicheren. Ihre Überzeugung ist wichtiger als ihre.",
    action: "Lassen Sie uns Ihre Finanzierungsstrategie entwickeln - basierend auf Ihren Zielen, nicht auf anderen Meinungen."
  },

  perfect_conditions: {
    identify: "Sie warten auf die perfekten Marktbedingungen oder den perfekten Zeitpunkt zum Starten.",
    evidence: "Wann waren die Marktbedingungen jemals perfekt? Und wer bestimmt, was 'perfekt' ist?",
    challenge: "Gibt es den perfekten Zeitpunkt überhaupt? Oder ist der beste Zeitpunkt immer 'jetzt'?",
    reframe: "Erfolgreiche Gründer starten in unvollkommenen Zeiten und passen sich an. Das ist Unternehmertum.",
    action: "Lassen Sie uns eine Finanzierungsstrategie entwickeln, die auch bei unvollkommenen Bedingungen funktioniert."
  }
};

// ============================================================================
// Financing Source Evaluation
// ============================================================================

export const FINANCING_SOURCES = {
  eigenkapital: {
    name: "Eigenkapital",
    minAmount: 0,
    maxAmount: Infinity,
    interestRate: 0,
    requirements: ["Eigene Ersparnisse", "Keine Rückzahlungsverpflichtung"],
    pros: ["Keine Zinsen", "Vollständige Kontrolle", "Kein Rückzahlungsdruck"],
    cons: ["Begrenzte Höhe", "Persönliches Risiko", "Opportunity Cost"],
    typical: "10-30% des Kapitalbedarfs"
  },

  gruendungszuschuss: {
    name: "Gründungszuschuss",
    minAmount: 9000,  // 6 months × €1500
    maxAmount: 18000, // 6 months × €3000
    interestRate: 0,
    requirements: ["ALG I Bezug mind. 1 Tag vor Gründung", "Tragfähigkeitsbescheinigung", "Hauptberufliche Gründung"],
    pros: ["Geschenk, nicht Kredit", "Lebensunterhalt gesichert", "Sozialversicherung mit"],
    cons: ["Begrenzte Höhe", "Strenge Voraussetzungen", "Bindung ans Arbeitsamt"],
    typical: "€15.000-18.000 über 15 Monate"
  },

  bankkredit: {
    name: "Bankkredit",
    minAmount: 10000,
    maxAmount: 250000,
    interestRate: 4.5, // Current average
    requirements: ["Sicherheiten", "Business Plan", "Eigenkapital min. 15%", "Positive Bonität"],
    pros: ["Hohe Beträge möglich", "Etablierter Prozess", "Planbare Konditionen"],
    cons: ["Zinsen und Tilgung", "Sicherheiten nötig", "Persönliche Haftung"],
    typical: "40-60% des Kapitalbedarfs"
  },

  foerderkredit: {
    name: "KfW Förderkredit",
    minAmount: 1000,
    maxAmount: 125000,
    interestRate: 2.5, // KfW subsidized
    requirements: ["Hausbank als Partner", "Verwendungsnachweis", "Business Plan"],
    pros: ["Günstige Zinsen", "Tilgungsfreie Zeit", "Bis 125k ohne Sicherheiten"],
    cons: ["Hausbank nötig", "Bürokratie", "Verwendungsgebunden"],
    typical: "Ergänzung zu Bankkredit"
  },

  beteiligung: {
    name: "Beteiligung/Investor",
    minAmount: 25000,
    maxAmount: Infinity,
    interestRate: 0, // Equity, not debt
    requirements: ["Skalierbare Geschäftsidee", "Wachstumspotential", "Team"],
    pros: ["Know-how mit dabei", "Netzwerk", "Kein Rückzahlungsdruck"],
    cons: ["Kontrolle abgeben", "Hohe Rendite-Erwartung", "Komplexer Prozess"],
    typical: "Nur bei skalierbaren Modellen"
  }
};

// ============================================================================
// Financing Mix Strategies
// ============================================================================

export const FINANCING_STRATEGIES = {
  conservative: {
    name: "Sicherheitsstrategie",
    eigenkapitalQuote: 40,
    maxDebtRatio: 60,
    description: "Hoher Eigenanteil, geringe Verschuldung",
    suitable: ["Risiko-averse Gründer", "Stabile Geschäftsmodelle", "Genügend Eigenkapital vorhanden"]
  },

  balanced: {
    name: "Ausgewogene Mischung",
    eigenkapitalQuote: 25,
    maxDebtRatio: 75,
    description: "Gesunde Mischung aus Eigen- und Fremdkapital",
    suitable: ["Standard-Gründungen", "Mittleres Risiko", "GZ + Bankkredit Kombination"]
  },

  leveraged: {
    name: "Fremdkapital-Hebel",
    eigenkapitalQuote: 15,
    maxDebtRatio: 85,
    description: "Maximale Hebelwirkung durch Fremdkapital",
    suitable: ["Asset-intensive Geschäfte", "Erfahrene Gründer", "Schnelles Wachstum nötig"]
  },

  bootstrap: {
    name: "Selbstfinanzierung",
    eigenkapitalQuote: 100,
    maxDebtRatio: 0,
    description: "Nur mit eigenen Mitteln, organisches Wachstum",
    suitable: ["Service-Business", "Geringes Startkapital", "Sicherheit wichtiger als Tempo"]
  }
};

// ============================================================================
// Main Prompt Builder
// ============================================================================

export function buildFinanzierungPrompt(
  options: FinanzierungPromptOptions = {},
  userMessage: string,
  _conversationHistory: Array<{role: string; content: string}>
): string {
  const {
    kapitalbedarf,
    userProfile,
    businessContext,
    existingData = {},
  } = options;

  // Detect prerequisite thinking
  const prerequisite = detectPrerequisiteThinking(userMessage);

  // Calculate financing gap
  const totalNeed = kapitalbedarf?.gesamtkapitalbedarf || 50000;
  const availableEquity = userProfile?.eigenkapital || 10000;
  const gzAmount = userProfile?.gzEligible ? 18000 : 0;
  const financingGap = totalNeed - availableEquity - gzAmount;

  // Determine suitable strategy
  const eigenkapitalQuote = (availableEquity + gzAmount) / totalNeed * 100;
  let recommendedStrategy = 'balanced';

  if (eigenkapitalQuote >= 40) recommendedStrategy = 'conservative';
  else if (eigenkapitalQuote <= 15) recommendedStrategy = 'leveraged';
  else if (totalNeed <= 25000) recommendedStrategy = 'bootstrap';

  const strategy = FINANCING_STRATEGIES[recommendedStrategy as keyof typeof FINANCING_STRATEGIES];

  const prompt = `# Finanzplanung Teil B: Finanzierung

## Coaching-Kontext

Du führst durch die **Finanzierungsstrategie** - die Deckung des ermittelten Kapitalbedarfs.

**Situation:**
- Kapitalbedarf gesamt: €${totalNeed.toLocaleString('de-DE')}
- Verfügbares Eigenkapital: €${availableEquity.toLocaleString('de-DE')}
- Gründungszuschuss möglich: €${gzAmount.toLocaleString('de-DE')} ${userProfile?.gzEligible ? '✅' : '❌'}
- **Finanzierungslücke: €${financingGap.toLocaleString('de-DE')}**

**Nutzer-Profil:**
- Geschäftstyp: ${businessContext?.businessType || 'Nicht spezifiziert'}
- Risikoprofil: ${businessContext?.riskLevel || 'medium'}
- Bonität: ${userProfile?.creditScore || 'unknown'}
- Sicherheiten: ${businessContext?.assetsBacked ? 'Verfügbar' : 'Eingeschränkt'}

${prerequisite ? `**⚠️ Prerequisite Thinking erkannt:** ${prerequisite}` : ''}

## CBC Integration für "Ich brauche erst X"

${prerequisite ? generatePrerequisiteCBCIntervention(prerequisite) : ''}

## Empfohlene Strategie: ${strategy.name}

**Eigenkapitalquote:** ${strategy.eigenkapitalQuote}% (aktuell: ${eigenkapitalQuote.toFixed(1)}%)
**Max. Fremdkapital:** ${strategy.maxDebtRatio}%

**Beschreibung:** ${strategy.description}
**Passt zu:** ${strategy.suitable.join(', ')}

## Finanzierungsquellen-Analyse

### 1. Eigenkapital (€${availableEquity.toLocaleString('de-DE')})
${generateEigenkapitalGuidance(availableEquity, totalNeed)}

### 2. Gründungszuschuss (€${gzAmount.toLocaleString('de-DE')})
${generateGZGuidance(userProfile?.gzEligible, gzAmount)}

### 3. Bankkredit/KfW (€${Math.max(0, financingGap).toLocaleString('de-DE')})
${generateKreditGuidance(financingGap, userProfile, businessContext)}

### 4. Alternative Finanzierung
${generateAlternativeGuidance(businessContext, financingGap)}

## Coaching-Prinzipien

1. **Realistische Bewertung** - Nicht jede Finanzierung ist verfügbar
2. **Risiko-Management** - Überschuldung vermeiden
3. **Mehrgleisig fahren** - Nicht auf eine Quelle setzen
4. **Timing beachten** - GZ vor Gründung, Kredite nach Business Plan
5. **Sicherheiten schaffen** - Backup-Plan für Engpässe

## Kritische Prüfpunkte

${generateCriticalChecks(totalNeed, availableEquity, gzAmount, financingGap)}

## Ausgabe-Format

Du MUSST in diesem exakten JSON-Format antworten:

\`\`\`json
{
  "response": "Deine empathische, strukturierte Coaching-Antwort hier",
  "moduleData": {
    "finanzierung": {
      "quellen": [
        {
          "typ": "eigenkapital",
          "bezeichnung": "Eigene Ersparnisse",
          "betrag": ${availableEquity},
          "status": "gesichert"
        }
      ],
      "eigenkapitalQuote": ${eigenkapitalQuote.toFixed(1)},
      "fremdkapitalQuote": ${(100 - eigenkapitalQuote).toFixed(1)},
      "gesamtfinanzierung": ${availableEquity + gzAmount},
      "finanzierungsluecke": ${financingGap}
    }
  },
  "coachingNotes": {
    "prerequisiteThinking": "${prerequisite || 'none'}",
    "recommendedStrategy": "${recommendedStrategy}",
    "criticalIssues": ["Liste kritischer Punkte"],
    "nextSteps": ["Konkrete nächste Schritte"],
    "riskLevel": "${businessContext?.riskLevel || 'medium'}"
  }
}
\`\`\`

## Aktuelle Situation

**Bestehende Daten:**
${JSON.stringify(existingData, null, 2)}

**Nutzer-Nachricht:**
"${userMessage}"

**Aufgabe:** Entwickle eine realistische Finanzierungsstrategie. Bei Prerequisite Thinking: CBC anwenden. Achte auf Machbarkeit und Risiken.`;

  return prompt;
}

// ============================================================================
// Helper Functions
// ============================================================================

function generatePrerequisiteCBCIntervention(prerequisite: string): string {
  const response = PREREQUISITE_CBC_RESPONSES[prerequisite as keyof typeof PREREQUISITE_CBC_RESPONSES];

  return `
### CBC 5-Schritt Intervention für Prerequisite Thinking

**IDENTIFY:** ${response.identify}
**EVIDENCE:** ${response.evidence}
**CHALLENGE:** ${response.challenge}
**REFRAME:** ${response.reframe}
**ACTION:** ${response.action}

Verwende diese Struktur in deiner Antwort, um das Prerequisite Thinking zu durchbrechen.`;
}

function generateEigenkapitalGuidance(eigenkapital: number, totalNeed: number): string {
  const quote = (eigenkapital / totalNeed * 100);

  if (quote >= 30) {
    return `**Sehr gut!** Mit ${quote.toFixed(1)}% Eigenkapitalquote sind Sie in einer starken Position für weitere Finanzierung.`;
  } else if (quote >= 15) {
    return `**Solide Basis.** ${quote.toFixed(1)}% Eigenkapital ist bankentaugig. KfW möglich.`;
  } else if (quote >= 5) {
    return `**Knapp, aber möglich.** Bei ${quote.toFixed(1)}% EK sind Sicherheiten oder Bürgen nötig.`;
  } else {
    return `**Herausforderung.** Nur ${quote.toFixed(1)}% EK. Alternative Finanzierung oder Geschäftsmodell überdenken.`;
  }
}

function generateGZGuidance(eligible?: boolean, amount?: number): string {
  if (!eligible) {
    return "**Nicht verfügbar.** Kein ALG I Bezug oder andere Voraussetzungen nicht erfüllt.";
  }

  return `**Verfügbar!** €${amount?.toLocaleString('de-DE')} über 15 Monate.
- 6 Monate: €${((amount || 18000) * 6/15).toLocaleString('de-DE')}
- 9 Monate: €${((amount || 18000) * 9/15).toLocaleString('de-DE')}
- Voraussetzung: Tragfähigkeitsbescheinigung (BA)`;
}

function generateKreditGuidance(gap: number, userProfile?: any, businessContext?: any): string {
  if (gap <= 0) {
    return "**Kein Kredit nötig.** Eigenkapital + GZ decken den Bedarf.";
  }

  const creditScore = userProfile?.creditScore || 'good';
  const hasAssets = businessContext?.assetsBacked || false;

  if (creditScore === 'poor') {
    return `**Schwierig.** €${gap.toLocaleString('de-DE')} bei schlechter Bonität. Alternative: Bürgen, Business Angels.`;
  }

  if (!hasAssets && gap > 50000) {
    return `**Herausfordernd.** €${gap.toLocaleString('de-DE')} ohne Sicherheiten. KfW bis €125k, dann Business Angels.`;
  }

  return `**Machbar.** €${gap.toLocaleString('de-DE')} über Hausbank + KfW. Benötigt: Businessplan, Sicherheiten/Bürgschaft.`;
}

function generateAlternativeGuidance(businessContext?: any, gap?: number): string {
  const businessType = businessContext?.businessType || '';

  if (gap && gap > 100000) {
    return "- **Business Angels/VCs** für große Summen und Skalierung\n- **Crowdfunding** bei B2C-Produkten\n- **Förderprogramme** regional/EU";
  }

  if (businessType.includes('tech') || businessType.includes('software')) {
    return "- **Business Angels** für Tech-Startups\n- **Accelerator** mit Seed-Funding\n- **Revenue-Based Financing**";
  }

  return "- **Family & Friends** für kleinere Beträge\n- **Mikrokredite** für Kleinstgründungen\n- **Crowdfunding** für innovative Produkte";
}

function generateCriticalChecks(totalNeed: number, eigenkapital: number, gzAmount: number, gap: number): string {
  const checks = [];

  if ((eigenkapital + gzAmount) / totalNeed < 0.15) {
    checks.push("⚠️ **Eigenkapitalquote unter 15%** - Kreditwürdigkeit fraglich");
  }

  if (gap > eigenkapital * 4) {
    checks.push("⚠️ **Sehr hohe Verschuldung** - Risiko für Überschuldung");
  }

  if (gap > 125000) {
    checks.push("⚠️ **Über KfW-Grenze** - Sicherheiten zwingend nötig");
  }

  if (!checks.length) {
    checks.push("✅ **Finanzierung realistisch** - Gute Ausgangslage");
  }

  return checks.join('\n');
}

export default {
  buildFinanzierungPrompt,
  detectPrerequisiteThinking,
  PREREQUISITE_CBC_RESPONSES,
  FINANCING_SOURCES,
  FINANCING_STRATEGIES,
};