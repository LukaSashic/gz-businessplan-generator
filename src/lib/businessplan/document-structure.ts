/**
 * Business Plan Document Structure
 *
 * Transforms JSON data into actual business plan text
 * Shows real content preview, not just data structure
 */

import type { PartialIntakeOutput, PersonalityLevel } from '@/types/modules/intake';
import type { PartialGeschaeftsmodellOutput } from '@/types/modules/geschaeftsmodell';
import {
  formatDeliveryFormat,
  formatPricingModel,
  formatUSPCategory,
} from '@/types/modules/geschaeftsmodell';
import {
  DIMENSION_LABELS_DE,
  getBusinessRelevance,
  getPersonalityArchetype
} from '@/lib/workshop/personality-assessment';

export interface BusinessPlanSection {
  id: string;
  number: string; // "1", "1.1", "1.1.1"
  title: string;
  status: 'complete' | 'in-progress' | 'pending';
  content: string | null; // Markdown text
  module: number; // Which module generates this
  required: boolean;
  wordCount?: number;
}

export interface BusinessPlanDocument {
  metadata: {
    version: string;
    lastUpdated: string;
    completeness: number; // 0-100%
    readyForExport: boolean;
  };
  sections: BusinessPlanSection[];
}

/**
 * Business plan structure template
 */
export const BUSINESSPLAN_STRUCTURE: Omit<BusinessPlanSection, 'status' | 'content'>[] = [
  { id: 'executive-summary', number: '1', title: 'Zusammenfassung', module: 10, required: true },
  { id: 'founder-profile', number: '2', title: 'Gründerperson', module: 1, required: true },
  { id: 'founder-profile-background', number: '2.1', title: 'Beruflicher Werdegang', module: 1, required: true },
  { id: 'founder-profile-qualifications', number: '2.2', title: 'Qualifikationen und Zertifikate', module: 1, required: true },
  { id: 'founder-profile-motivation', number: '2.3', title: 'Motivation zur Selbstständigkeit', module: 1, required: true },
  { id: 'founder-profile-personality', number: '2.4', title: 'Unternehmerisches Profil', module: 1, required: true },
  { id: 'business-idea', number: '3', title: 'Geschäftsidee', module: 2, required: true },
  { id: 'business-idea-description', number: '3.1', title: 'Angebotsbeschreibung', module: 2, required: true },
  { id: 'business-idea-problem', number: '3.2', title: 'Kundenproblem und Lösung', module: 2, required: true },
  { id: 'business-idea-usp', number: '3.3', title: 'Alleinstellungsmerkmale', module: 2, required: true },
  { id: 'target-market', number: '4', title: 'Zielgruppe und Markt', module: 4, required: true },
  { id: 'target-market-segments', number: '4.1', title: 'Zielgruppendefinition', module: 2, required: true },
  { id: 'target-market-size', number: '4.2', title: 'Marktgröße und Potenzial', module: 4, required: true },
  { id: 'competition', number: '4.3', title: 'Wettbewerbsanalyse', module: 4, required: true },
  { id: 'business-model', number: '5', title: 'Geschäftsmodell', module: 2, required: true },
  { id: 'business-model-revenue', number: '5.1', title: 'Erlösmodell und Preisgestaltung', module: 2, required: true },
  { id: 'business-model-operations', number: '5.2', title: 'Leistungserstellung', module: 3, required: true },
  { id: 'marketing-strategy', number: '6', title: 'Marketing und Vertrieb', module: 5, required: true },
  { id: 'marketing-strategy-channels', number: '6.1', title: 'Marketingkanäle', module: 5, required: true },
  { id: 'marketing-strategy-acquisition', number: '6.2', title: 'Kundengewinnung', module: 5, required: true },
  { id: 'organization', number: '7', title: 'Unternehmensorganisation', module: 3, required: true },
  { id: 'organization-legal', number: '7.1', title: 'Rechtsform', module: 3, required: true },
  { id: 'organization-location', number: '7.2', title: 'Standort', module: 3, required: false },
  { id: 'finance', number: '8', title: 'Finanzplanung', module: 6, required: true },
  { id: 'finance-startup-costs', number: '8.1', title: 'Startkapital und Investitionen', module: 6, required: true },
  { id: 'finance-revenue-forecast', number: '8.2', title: 'Umsatz- und Rentabilitätsvorschau', module: 6, required: true },
  { id: 'finance-liquidity', number: '8.3', title: 'Liquiditätsplanung', module: 6, required: true },
  { id: 'swot', number: '9', title: 'SWOT-Analyse', module: 7, required: true },
  { id: 'milestones', number: '10', title: 'Meilensteine', module: 8, required: true },
  { id: 'kpi', number: '11', title: 'Erfolgskennzahlen (KPIs)', module: 9, required: true },
  { id: 'appendix', number: '12', title: 'Anhang', module: 10, required: false }
];

/**
 * Score label mapping
 */
const SCORE_LABELS: Record<PersonalityLevel, string> = {
  high: 'Hoch',
  medium: 'Mittel',
  low: 'Entwicklungsfeld'
};

/**
 * Section content generators
 */
type ContentGenerator = (data: PartialIntakeOutput) => string | null;

const CONTENT_GENERATORS: Record<string, ContentGenerator> = {
  'founder-profile': (data) => {
    if (!data.founder) return null;
    return `# Gründerperson

Diese Sektion beschreibt die Person hinter der Gründung - Qualifikationen, Erfahrungen und unternehmerisches Profil.`;
  },

  'founder-profile-background': (data) => {
    if (!data.founder?.experience) return null;

    const { experience, qualifications } = data.founder;
    const roles = experience.relevantRoles?.length > 0
      ? experience.relevantRoles.map(role => `- ${role}`).join('\n')
      : '- Keine angegeben';

    const certs = qualifications?.certifications;
    const certifications = certs && certs.length > 0
      ? certs.map(cert => `- ${cert}`).join('\n')
      : '';

    let content = `## Beruflicher Werdegang

Mit **${experience.yearsInIndustry} Jahren Berufserfahrung** in der Branche bringe ich fundierte Praxiskenntnisse mit.

### Relevante Positionen
${roles}`;

    if (qualifications?.education) {
      content += `\n\n### Ausbildung
${qualifications.education}`;
    }

    if (certifications) {
      content += `\n\n### Zusatzqualifikationen
${certifications}`;
    }

    if (experience.previousFounder && experience.previousFoundingExperience) {
      content += `\n\n### Gründungserfahrung
${experience.previousFoundingExperience}`;
    }

    return content;
  },

  'founder-profile-qualifications': (data) => {
    if (!data.founder?.qualifications) return null;

    const { qualifications } = data.founder;
    const skills = qualifications.specialSkills?.length > 0
      ? qualifications.specialSkills.map(skill => `- ${skill}`).join('\n')
      : '- Keine speziellen Fähigkeiten angegeben';

    return `## Qualifikationen und Zertifikate

### Ausbildung
${qualifications.education || 'Nicht angegeben'}

### Besondere Fähigkeiten
${skills}`;
  },

  'founder-profile-motivation': (data) => {
    if (!data.founder?.motivation) return null;

    const { push, pull } = data.founder.motivation;

    const pushFactors = push?.length > 0
      ? push.map(factor => `- ${factor}`).join('\n')
      : '- Keine Push-Faktoren angegeben';

    const pullFactors = pull?.length > 0
      ? pull.map(factor => `- ${factor}`).join('\n')
      : '- Keine Pull-Faktoren angegeben';

    return `## Motivation zur Selbstständigkeit

Meine Entscheidung zur Selbstständigkeit ist durch folgende Faktoren motiviert:

### Vom Angestelltenverhältnis weg (Push-Faktoren)
${pushFactors}

### Zur Selbstständigkeit hin (Pull-Faktoren)
${pullFactors}

Diese Kombination aus intrinsischer Motivation und klaren Zielen zeigt, dass die Gründung gut durchdacht und nachhaltig angelegt ist.`;
  },

  'founder-profile-personality': (data) => {
    if (!data.personality) return null;

    const archetype = data.personality.innovativeness
      ? getPersonalityArchetype({
          innovativeness: data.personality.innovativeness || 'medium',
          riskTaking: data.personality.riskTaking || 'medium',
          achievement: data.personality.achievement || 'medium',
          proactiveness: data.personality.proactiveness || 'medium',
          locusOfControl: data.personality.locusOfControl || 'medium',
          selfEfficacy: data.personality.selfEfficacy || 'medium',
          autonomy: data.personality.autonomy || 'medium'
        })
      : 'Gründerpersönlichkeit';

    let content = `## Unternehmerisches Profil

**Typ: ${archetype}**

${data.personality.narrative || 'Das unternehmerische Profil wird im Laufe des Workshops erstellt.'}

### Detailbewertung

| Dimension | Ausprägung | Bedeutung für mein Business |
|-----------|------------|----------------------------|`;

    const dimensions: Array<{ key: keyof typeof DIMENSION_LABELS_DE; value?: PersonalityLevel }> = [
      { key: 'innovativeness', value: data.personality.innovativeness },
      { key: 'riskTaking', value: data.personality.riskTaking },
      { key: 'achievement', value: data.personality.achievement },
      { key: 'proactiveness', value: data.personality.proactiveness },
      { key: 'locusOfControl', value: data.personality.locusOfControl },
      { key: 'selfEfficacy', value: data.personality.selfEfficacy },
      { key: 'autonomy', value: data.personality.autonomy }
    ];

    for (const dim of dimensions) {
      if (dim.value) {
        const label = DIMENSION_LABELS_DE[dim.key];
        const scoreLabel = SCORE_LABELS[dim.value];
        const relevance = getBusinessRelevance(dim.key, dim.value);
        content += `\n| ${label} | ${scoreLabel} | ${relevance} |`;
      }
    }

    return content;
  },

  'business-idea-description': (data) => {
    if (!data.businessIdea) return null;

    return `## Angebotsbeschreibung

${data.businessIdea.elevator_pitch}

### Leistungsumfang
${data.businessIdea.solution || 'Wird im Modul Geschäftsmodell detailliert.'}

### Zielgruppe
${data.businessIdea.targetAudience || 'Wird im Modul Geschäftsmodell detailliert.'}`;
  },

  'business-idea-problem': (data) => {
    if (!data.businessIdea?.problem) return null;

    return `## Kundenproblem und Lösung

### Das Problem
${data.businessIdea.problem}

### Meine Lösung
${data.businessIdea.solution || 'Wird im nächsten Schritt definiert.'}

Diese Lösung adressiert direkt die Schmerzpunkte der Zielgruppe und schafft echten Mehrwert, für den Kunden bereit sind zu zahlen.`;
  },

  'business-idea-usp': (data) => {
    if (!data.businessIdea?.uniqueValue) return null;

    return `## Alleinstellungsmerkmale

Was unterscheidet mein Angebot vom Wettbewerb:

${data.businessIdea.uniqueValue}

Dieses Alleinstellungsmerkmal ist:
- **Verteidigbar:** Schwer für Wettbewerber zu kopieren
- **Relevant:** Löst echte Kundenprobleme
- **Kommunizierbar:** Klar und verständlich für Kunden`;
  },

  'target-market-segments': (data) => {
    if (!data.businessIdea?.targetAudience) return null;

    return `## Zielgruppendefinition

### Primäre Zielgruppe
${data.businessIdea.targetAudience}

*Detaillierte Personas werden in Modul 2 (Geschäftsmodell) entwickelt.*`;
  },

  'finance-startup-costs': (data) => {
    if (!data.resources?.financial) return null;

    const { financial } = data.resources;

    return `## Startkapital und Investitionen

### Verfügbare Mittel
- **Eigenkapital:** ${financial.availableCapital?.toLocaleString('de-DE') || '0'} €
- **Erwarteter Gründungszuschuss:** ${financial.expectedGZ?.toLocaleString('de-DE') || '0'} €
${financial.otherIncome ? `- **Sonstiges Einkommen:** ${financial.otherIncome.toLocaleString('de-DE')} €` : ''}

### Laufende Verpflichtungen
- **Monatliche Fixkosten:** ${financial.monthlyObligations?.toLocaleString('de-DE') || '0'} €

*Die detaillierte Finanzplanung erfolgt in Modul 6.*`;
  }
};

/**
 * Section content generators for Geschaeftsmodell (Module 02)
 */
type GeschaeftsmodellContentGenerator = (data: PartialGeschaeftsmodellOutput) => string | null;

const GESCHAEFTSMODELL_CONTENT_GENERATORS: Record<string, GeschaeftsmodellContentGenerator> = {
  'business-idea-description': (data) => {
    if (!data.offering) return null;

    let content = `## Angebotsbeschreibung

${data.offering.mainOffering || 'Angebot wird noch definiert...'}`;

    if (data.offering.oneSentencePitch) {
      content += `

> "${data.offering.oneSentencePitch}"`;
    }

    if (data.offering.deliveryFormat || data.offering.pricingModel) {
      content += `

### Leistungsformat`;
      if (data.offering.deliveryFormat) {
        content += `
- **Format:** ${formatDeliveryFormat(data.offering.deliveryFormat)}`;
      }
      if (data.offering.pricingModel) {
        content += `
- **Preismodell:** ${formatPricingModel(data.offering.pricingModel)}`;
      }
    }

    if (data.offering.scope?.included && data.offering.scope.included.length > 0) {
      content += `

### Leistungsumfang
${data.offering.scope.included.map(item => `- ${item}`).join('\n')}`;
    }

    if (data.offering.scope?.excluded && data.offering.scope.excluded.length > 0) {
      content += `

### Nicht im Leistungsumfang
${data.offering.scope.excluded.map(item => `- ${item}`).join('\n')}`;
    }

    return content;
  },

  'business-idea-problem': (data) => {
    if (!data.valueProposition) return null;

    let content = `## Kundenproblem und Lösung`;

    if (data.valueProposition.customerPains && data.valueProposition.customerPains.length > 0) {
      content += `

### Das Problem
${data.valueProposition.customerPains.map(pain => `- ${pain}`).join('\n')}`;
    }

    if (data.valueProposition.painRelievers && data.valueProposition.painRelievers.length > 0) {
      content += `

### Meine Lösung
${data.valueProposition.painRelievers.map(reliever => `- ${reliever}`).join('\n')}`;
    }

    if (data.valueProposition.valueStatement) {
      content += `

### Wertversprechen
${data.valueProposition.valueStatement}`;
    }

    return content;
  },

  'business-idea-usp': (data) => {
    if (!data.usp?.statement) return null;

    let content = `## Alleinstellungsmerkmale (USP)

**${data.usp.statement}**`;

    if (data.usp.category) {
      content += `

**Kategorie:** ${formatUSPCategory(data.usp.category)}`;
    }

    if (data.usp.proof) {
      content += `

### Beweis/Nachweis
${data.usp.proof}`;
    }

    if (data.usp.measurement) {
      content += `

### Messbarkeit für Kunden
${data.usp.measurement}`;
    }

    if (data.usp.uspTest) {
      const tests = [];
      if (data.usp.uspTest.isUnique) tests.push('✓ Einzigartig');
      if (data.usp.uspTest.isRelevant) tests.push('✓ Relevant');
      if (data.usp.uspTest.isProvable) tests.push('✓ Belegbar');
      if (data.usp.uspTest.isUnderstandable) tests.push('✓ Verständlich');
      if (data.usp.uspTest.isOneSentence) tests.push('✓ Ein Satz');

      if (tests.length > 0) {
        content += `

### USP-Test
${tests.join(' | ')}`;
      }
    }

    return content;
  },

  'target-market-segments': (data) => {
    if (!data.targetAudience?.primaryPersona) return null;
    const persona = data.targetAudience.primaryPersona;

    let content = `## Zielgruppendefinition

### Primäre Zielgruppe: ${persona.name || 'Wird definiert...'}`;

    if (persona.demographics) {
      content += `

**Demografische Merkmale:**`;
      if (persona.demographics.occupation) {
        content += `
- Beruf: ${persona.demographics.occupation}`;
      }
      if (persona.demographics.location) {
        content += `
- Standort: ${persona.demographics.location}`;
      }
      if (persona.demographics.ageRange) {
        content += `
- Altersgruppe: ${persona.demographics.ageRange}`;
      }
    }

    if (persona.firmographics) {
      content += `

**Firmografische Merkmale (B2B):**`;
      if (persona.firmographics.industry) {
        content += `
- Branche: ${persona.firmographics.industry}`;
      }
      if (persona.firmographics.companySize) {
        content += `
- Unternehmensgröße: ${persona.firmographics.companySize}`;
      }
      if (persona.firmographics.position) {
        content += `
- Entscheiderposition: ${persona.firmographics.position}`;
      }
    }

    if (persona.psychographics?.challenges && persona.psychographics.challenges.length > 0) {
      content += `

**Herausforderungen:**
${persona.psychographics.challenges.map(c => `- ${c}`).join('\n')}`;
    }

    if (persona.buyingTrigger) {
      content += `

**Kaufauslöser:**
${persona.buyingTrigger}`;
    }

    return content;
  },

  'target-market-size': (data) => {
    if (!data.targetAudience?.marketSize) return null;
    const market = data.targetAudience.marketSize;

    let content = `## Marktgröße und Potenzial`;

    if (market.totalAddressableMarket !== undefined) {
      content += `

### Gesamtmarkt (TAM)
**${market.totalAddressableMarket.toLocaleString('de-DE')}** potenzielle Kunden`;
      if (market.tamSource) {
        content += `
*Quelle: ${market.tamSource}*`;
      }
    }

    if (market.serviceableMarket !== undefined) {
      content += `

### Erreichbarer Markt (SAM)
**${market.serviceableMarket.toLocaleString('de-DE')}** realistische Zielkunden`;
      if (market.samCalculation) {
        content += `
*Berechnung: ${market.samCalculation}*`;
      }
    }

    if (market.targetFirstYear !== undefined) {
      content += `

### Ziel erstes Jahr
**${market.targetFirstYear}** Kunden`;
      if (market.reasoning) {
        content += `
*Begründung: ${market.reasoning}*`;
      }
    }

    return content;
  },

  'competition': (data) => {
    const competitors = data.competitiveAnalysis?.directCompetitors;
    if (!competitors || competitors.length === 0) return null;
    const analysis = data.competitiveAnalysis;

    let content = `## Wettbewerbsanalyse

### Direkte Wettbewerber (${competitors.length})

| Wettbewerber | Angebot | Preislage | Stärke | Schwäche | Mein Vorteil |
|-------------|---------|-----------|--------|----------|--------------|`;

    for (const competitor of competitors) {
      content += `
| ${competitor.name || '-'} | ${competitor.offering || '-'} | ${competitor.pricePoint || '-'} | ${competitor.strength || '-'} | ${competitor.weakness || '-'} | ${competitor.yourAdvantage || '-'} |`;
    }

    if (analysis?.competitiveAdvantages && analysis.competitiveAdvantages.length > 0) {
      content += `

### Meine Wettbewerbsvorteile
${analysis.competitiveAdvantages.map(a => `- ${a}`).join('\n')}`;
    }

    if (analysis?.marketGaps && analysis.marketGaps.length > 0) {
      content += `

### Identifizierte Marktlücken
${analysis.marketGaps.map(g => `- ${g}`).join('\n')}`;
    }

    return content;
  },

  'business-model-revenue': (data) => {
    if (!data.offering?.pricingModel) return null;

    let content = `## Erlösmodell und Preisgestaltung

### Preismodell
**${formatPricingModel(data.offering.pricingModel)}**`;

    if (data.offering.deliveryFormat) {
      content += `

### Leistungsformat
**${formatDeliveryFormat(data.offering.deliveryFormat)}**`;
    }

    if (data.valueProposition?.gainCreators && data.valueProposition.gainCreators.length > 0) {
      content += `

### Mehrwert für Kunden
${data.valueProposition.gainCreators.map(g => `- ${g}`).join('\n')}`;
    }

    return content;
  }
};

/**
 * Combined workshop data from multiple modules
 */
export interface CombinedWorkshopData {
  intake?: PartialIntakeOutput | null;
  geschaeftsmodell?: PartialGeschaeftsmodellOutput | null;
}

/**
 * Determine section status based on module and data
 */
function determineSectionStatus(
  moduleNumber: number,
  currentModule: number
): 'complete' | 'in-progress' | 'pending' {
  if (moduleNumber < currentModule) {
    return 'complete';
  } else if (moduleNumber === currentModule) {
    return 'in-progress';
  } else {
    return 'pending';
  }
}

/**
 * Generate document preview from workshop data (intake only - legacy)
 */
export function generateDocumentPreview(
  workshopData: PartialIntakeOutput | null,
  currentModule: number = 1
): BusinessPlanDocument {
  return generateCombinedDocumentPreview({ intake: workshopData }, currentModule);
}

/**
 * Generate document preview from combined workshop data (all modules)
 */
export function generateCombinedDocumentPreview(
  data: CombinedWorkshopData,
  currentModule: number = 1
): BusinessPlanDocument {
  const sections = BUSINESSPLAN_STRUCTURE.map(template => {
    let content: string | null = null;

    // Try intake content generator first
    const intakeGenerator = CONTENT_GENERATORS[template.id];
    if (data.intake && intakeGenerator) {
      content = intakeGenerator(data.intake);
    }

    // If no intake content, try geschaeftsmodell content generator
    // Geschaeftsmodell can also override some intake sections (like business-idea-*)
    const geschaeftsmodellGenerator = GESCHAEFTSMODELL_CONTENT_GENERATORS[template.id];
    if (data.geschaeftsmodell && geschaeftsmodellGenerator) {
      const geschaeftsmodellContent = geschaeftsmodellGenerator(data.geschaeftsmodell);
      // Prefer geschaeftsmodell content if available (it's more detailed)
      if (geschaeftsmodellContent) {
        content = geschaeftsmodellContent;
      }
    }

    const section: BusinessPlanSection = {
      ...template,
      status: determineSectionStatus(template.module, currentModule),
      content
    };

    if (content) {
      section.wordCount = content.split(/\s+/).filter(w => w.length > 0).length;
    }

    return section;
  });

  // Filter out non-required sections based on business type
  const filteredSections = sections.filter(section => {
    if (!section.required) {
      // Only include location section if location-dependent
      if (section.id === 'organization-location') {
        return data.intake?.businessType?.isLocationDependent === true;
      }
    }
    return true;
  });

  const completeSections = filteredSections.filter(s => s.status === 'complete' && s.content).length;
  const totalRequiredSections = filteredSections.filter(s => s.required).length;
  const completeness = totalRequiredSections > 0
    ? Math.round((completeSections / totalRequiredSections) * 100)
    : 0;

  return {
    metadata: {
      version: '1.0',
      lastUpdated: new Date().toISOString(),
      completeness,
      readyForExport: completeness >= 90
    },
    sections: filteredSections
  };
}

/**
 * Generate a simple text summary of current progress
 */
export function generateProgressSummary(
  workshopData: PartialIntakeOutput | null,
  currentModule: number = 1
): string {
  const document = generateDocumentPreview(workshopData, currentModule);

  const completeSections = document.sections.filter(s => s.status === 'complete').length;
  const inProgressSections = document.sections.filter(s => s.status === 'in-progress').length;
  const totalWords = document.sections.reduce((sum, s) => sum + (s.wordCount || 0), 0);

  return `Businessplan-Fortschritt: ${document.metadata.completeness}%
Abschnitte: ${completeSections} fertig, ${inProgressSections} in Arbeit
Wörter: ${totalWords.toLocaleString('de-DE')}
Status: ${document.metadata.readyForExport ? 'Export möglich' : 'Noch in Bearbeitung'}`;
}
