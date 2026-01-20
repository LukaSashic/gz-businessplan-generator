/**
 * Module 06: Rechtsform (Legal Form) Types (GZ-503)
 *
 * Legal form selection and regulatory compliance with:
 * - Legal form exploration (GmbH, UG, Einzelunternehmen, etc.)
 * - Handwerk/Meisterpflicht checks for craft businesses
 * - Required permits and licensing requirements
 * - GROW model decision support for legal choices
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const RechtsformPhase = z.enum([
  'intro',             // Introduction with GROW Goal
  'rechtsform_arten',  // Phase 1: Legal form types exploration
  'handwerk_check',    // Phase 2: Handwerk/Meisterpflicht verification
  'genehmigungen',     // Phase 3: Permits and licenses
  'validierung',       // Phase 4: Validation and final choice
  'completed',
]);

export type RechtsformPhase = z.infer<typeof RechtsformPhase>;

export const LegalFormType = z.enum([
  'einzelunternehmen',     // Einzelunternehmen (Sole Proprietorship)
  'gbr',                   // Gesellschaft bürgerlichen Rechts (Civil Partnership)
  'ohg',                   // Offene Handelsgesellschaft (General Partnership)
  'kg',                    // Kommanditgesellschaft (Limited Partnership)
  'ug',                    // Unternehmergesellschaft (Mini-GmbH)
  'gmbh',                  // Gesellschaft mit beschränkter Haftung (Limited Liability)
  'ag',                    // Aktiengesellschaft (Corporation)
  'eg',                    // Eingetragene Genossenschaft (Cooperative)
  'freelancer',            // Freiberufler (Professional freelancer)
]);

export type LegalFormType = z.infer<typeof LegalFormType>;

export const HandwerkStatus = z.enum([
  'not_handwerk',          // Nicht Handwerk
  'handwerk_meisterfrei',  // Handwerk meisterfrei (Anlage B1)
  'handwerk_meisterpflichtig', // Handwerk meisterpflichtig (Anlage A)
  'handwerksaehnlich',     // Handwerksähnliches Gewerbe (Anlage B2)
]);

export type HandwerkStatus = z.infer<typeof HandwerkStatus>;

export const MeisterStatus = z.enum([
  'not_applicable',        // Nicht zutreffend
  'meisterbrief_vorhanden', // Meisterbrief vorhanden
  'meisterbrief_geplant',  // Meisterbrief geplant
  'ausnahmebewilligung',   // Ausnahmebewilligung nach § 7-9 HwO
  'geselle_6_jahre',       // Geselle mit 6 Jahren Berufserfahrung
]);

export type MeisterStatus = z.infer<typeof MeisterStatus>;

export const PermitType = z.enum([
  'gewerbeanmeldung',      // Gewerbeanmeldung
  'handwerksrolle',        // Eintragung Handwerksrolle
  'handelskammer',         // IHK-Mitgliedschaft
  'handwerkskammer',       // HWK-Mitgliedschaft
  'berufsgenossenschaft',  // Berufsgenossenschaft
  'finanzamt',             // Steuerliche Erfassung
  'gastronomie',           // Gaststättenerlaubnis
  'transport',             // Transportlizenz
  'gesundheit',            // Gesundheitszeugnis
  'datenschutz',           // DSGVO-Beauftragter
  'versicherung',          // Berufshaftpflicht
]);

export type PermitType = z.infer<typeof PermitType>;

export const ComplexityLevel = z.enum([
  'simple',                // Einfach (Einzelunternehmen)
  'medium',                // Mittel (GbR, UG)
  'complex',               // Komplex (GmbH, AG)
]);

export type ComplexityLevel = z.infer<typeof ComplexityLevel>;

// ============================================================================
// Sub-Schemas
// ============================================================================

export const LegalFormOptionSchema = z.object({
  formType: LegalFormType,
  name: z.string(),                         // Deutscher Name
  description: z.string(),                  // Beschreibung
  complexity: ComplexityLevel,
  minCapital: z.number(),                   // Mindestkapital in EUR
  liability: z.enum(['unlimited', 'limited', 'mixed']), // Haftung
  taxation: z.array(z.string()),            // Besteuerungsarten
  advantages: z.array(z.string()),          // Vorteile
  disadvantages: z.array(z.string()),       // Nachteile
  suitableFor: z.array(z.string()),         // Geeignet für
  registrationSteps: z.array(z.string()),   // Anmeldeschritte
  estimatedCosts: z.object({                // Geschätzte Kosten
    registration: z.number(),
    annual: z.number(),
    optional: z.number().optional(),
  }),
  timeToEstablish: z.string(),              // Gründungsdauer
});

export type LegalFormOption = z.infer<typeof LegalFormOptionSchema>;

export const HandwerkCheckSchema = z.object({
  businessActivity: z.string(),             // Geschäftstätigkeit
  handwerkStatus: HandwerkStatus,
  handwerkCode: z.string().optional(),      // Handwerkscode (wenn zutreffend)
  meisterStatus: MeisterStatus,
  meisterDetails: z.string().optional(),    // Details zum Meisterbrief
  ausnahmeGruende: z.array(z.string()).optional(), // Gründe für Ausnahme
  handwerksrolleRequired: z.boolean(),      // Eintragung Handwerksrolle erforderlich
  restrictions: z.array(z.string()).optional(), // Einschränkungen
  nextSteps: z.array(z.string()),           // Nächste Schritte
});

export type HandwerkCheck = z.infer<typeof HandwerkCheckSchema>;

export const PermitRequirementSchema = z.object({
  permitType: PermitType,
  name: z.string(),                         // Name der Genehmigung
  description: z.string(),                  // Beschreibung
  isRequired: z.boolean(),                  // Pflicht oder optional
  authority: z.string(),                    // Zuständige Behörde
  costs: z.number().optional(),             // Kosten
  processingTime: z.string(),               // Bearbeitungszeit
  requirements: z.array(z.string()),        // Voraussetzungen
  documents: z.array(z.string()),           // Benötigte Dokumente
  deadlines: z.array(z.string()).optional(), // Fristen
  renewalPeriod: z.string().optional(),     // Verlängerungsintervall
});

export type PermitRequirement = z.infer<typeof PermitRequirementSchema>;

export const RechtsformDecisionSchema = z.object({
  chosenForm: LegalFormType,
  reasoning: z.string(),                    // Begründung der Wahl
  alternatives: z.array(LegalFormType),     // Alternativen erwogen
  decisionFactors: z.array(z.string()),     // Entscheidungsfaktoren
  riskAssessment: z.string(),               // Risikobewertung
  futureConsiderations: z.string(),         // Zukunftsperspektive
  implementationPlan: z.string(),           // Umsetzungsplan
  professionalAdvice: z.boolean(),          // Professionelle Beratung empfohlen
});

export type RechtsformDecision = z.infer<typeof RechtsformDecisionSchema>;

export const RechtsformValidationSchema = z.object({
  legalFormChosen: z.boolean(),             // Rechtsform gewählt
  handwerkChecked: z.boolean(),             // Handwerk-Status geprüft
  permitsIdentified: z.boolean(),           // Genehmigungen identifiziert
  costsCalculated: z.boolean(),             // Kosten berechnet
  timelineEstablished: z.boolean(),         // Zeitplan erstellt
  advisorRecommended: z.boolean(),          // Berater empfohlen
  blockers: z.array(z.string()),
  warnings: z.array(z.string()),
  readyForNextModule: z.boolean(),
});

export type RechtsformValidation = z.infer<typeof RechtsformValidationSchema>;

export const RechtsformMetadataSchema = z.object({
  completedAt: z.string().optional(),
  duration: z.number().optional(),
  currentPhase: RechtsformPhase.optional(),
  growDecisions: z.array(z.string()).optional(), // GROW-basierte Entscheidungen
  coachingDepth: z.enum(['shallow', 'medium', 'deep']).optional(),
  conversationTurns: z.number().optional(),
});

export type RechtsformMetadata = z.infer<typeof RechtsformMetadataSchema>;

// ============================================================================
// Main Output Schema
// ============================================================================

export const RechtsformOutputSchema = z.object({
  legalFormOptions: z.array(LegalFormOptionSchema),
  handwerkCheck: HandwerkCheckSchema.optional(),
  permits: z.array(PermitRequirementSchema),
  decision: RechtsformDecisionSchema.optional(),
  validation: RechtsformValidationSchema,
  metadata: RechtsformMetadataSchema,
});

export type RechtsformOutput = z.infer<typeof RechtsformOutputSchema>;

export const PartialRechtsformOutputSchema = z.object({
  legalFormOptions: z.array(LegalFormOptionSchema).optional(),
  handwerkCheck: HandwerkCheckSchema.deepPartial().optional(),
  permits: z.array(PermitRequirementSchema).optional(),
  decision: RechtsformDecisionSchema.deepPartial().optional(),
  validation: RechtsformValidationSchema.partial().optional(),
  metadata: RechtsformMetadataSchema.partial().optional(),
});

export type PartialRechtsformOutput = z.infer<typeof PartialRechtsformOutputSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

export function createEmptyRechtsformOutput(): PartialRechtsformOutput {
  return {};
}

export function isRechtsformComplete(data: PartialRechtsformOutput): boolean {
  const hasLegalForms = Boolean(
    data.legalFormOptions &&
    data.legalFormOptions.length > 0
  );

  const hasHandwerkCheck = Boolean(
    data.handwerkCheck?.businessActivity &&
    data.handwerkCheck.handwerkStatus
  );

  const hasPermits = Boolean(
    data.permits &&
    data.permits.length > 0
  );

  const hasDecision = Boolean(
    data.decision?.chosenForm &&
    data.decision.reasoning
  );

  return hasLegalForms && hasHandwerkCheck && hasPermits && hasDecision;
}

/**
 * Merge partial updates into existing data
 */
export function mergeRechtsformData(
  existing: PartialRechtsformOutput,
  update: PartialRechtsformOutput
): PartialRechtsformOutput {
  return {
    legalFormOptions: update.legalFormOptions || existing.legalFormOptions,
    handwerkCheck: existing.handwerkCheck || update.handwerkCheck
      ? { ...existing.handwerkCheck, ...update.handwerkCheck }
      : undefined,
    permits: update.permits || existing.permits,
    decision: existing.decision || update.decision
      ? { ...existing.decision, ...update.decision }
      : undefined,
    validation: existing.validation || update.validation
      ? { ...existing.validation, ...update.validation }
      : undefined,
    metadata: { ...existing.metadata, ...update.metadata },
  };
}

/**
 * Calculate module completion percentage
 */
export function calculateRechtsformCompletion(data: PartialRechtsformOutput): number {
  let score = 0;
  const maxScore = 100;

  // Legal form options explored (25 points)
  const legalFormCount = data.legalFormOptions?.length || 0;
  score += Math.min(legalFormCount * 5, 25); // Up to 5 options = 25 points

  // Handwerk check completed (20 points)
  if (data.handwerkCheck?.businessActivity) score += 10;
  if (data.handwerkCheck?.handwerkStatus) score += 10;

  // Permits identified (25 points)
  const permitCount = data.permits?.length || 0;
  score += Math.min(permitCount * 5, 25); // Up to 5 permits = 25 points

  // Decision made (30 points)
  if (data.decision?.chosenForm) score += 15;
  if (data.decision?.reasoning) score += 10;
  if (data.decision?.implementationPlan) score += 5;

  return Math.min(Math.round((score / maxScore) * 100), 100);
}

// ============================================================================
// GROW Model Decision Support
// ============================================================================

export const GROWDecisionSchema = z.object({
  /** GOAL: What legal structure goal is being discussed */
  goal: z.string().optional(),
  /** REALITY: Current business situation and constraints */
  reality: z.string().optional(),
  /** OPTIONS: Available legal form options */
  options: z.array(z.string()).optional(),
  /** WILL: What legal form will be chosen */
  will: z.string().optional(),
  /** Decision area (legal form, permits, timeline) */
  decisionArea: z.enum(['legal_form', 'handwerk', 'permits', 'timeline']).optional(),
});

export type GROWDecision = z.infer<typeof GROWDecisionSchema>;

// ============================================================================
// Phase Info
// ============================================================================

export const RechtsformPhaseInfo: Record<RechtsformPhase, {
  label: string;
  duration: number;
  questionClusters: string[];
  coachingDepth: 'shallow' | 'medium' | 'deep';
}> = {
  intro: {
    label: 'Einführung',
    duration: 5,
    questionClusters: ['goal_setting'],
    coachingDepth: 'shallow',
  },
  rechtsform_arten: {
    label: 'Rechtsform-Arten',
    duration: 15,
    questionClusters: ['legal_forms', 'liability', 'taxation'],
    coachingDepth: 'medium',
  },
  handwerk_check: {
    label: 'Handwerk-Prüfung',
    duration: 10,
    questionClusters: ['handwerk_status', 'meister_requirements'],
    coachingDepth: 'medium',
  },
  genehmigungen: {
    label: 'Genehmigungen',
    duration: 10,
    questionClusters: ['permits', 'authorities', 'timelines'],
    coachingDepth: 'medium',
  },
  validierung: {
    label: 'Validierung',
    duration: 5,
    questionClusters: ['validation', 'final_decision'],
    coachingDepth: 'shallow',
  },
  completed: {
    label: 'Abgeschlossen',
    duration: 0,
    questionClusters: [],
    coachingDepth: 'shallow',
  },
};

// ============================================================================
// Legal Form Templates (German specific)
// ============================================================================

export const GERMAN_LEGAL_FORMS: Record<LegalFormType, LegalFormOption> = {
  einzelunternehmen: {
    formType: 'einzelunternehmen',
    name: 'Einzelunternehmen',
    description: 'Einfachste Rechtsform für Einzelgründer ohne Mindestkapital',
    complexity: 'simple',
    minCapital: 0,
    liability: 'unlimited',
    taxation: ['Einkommensteuer', 'Gewerbesteuer'],
    advantages: [
      'Einfache Gründung',
      'Geringer Verwaltungsaufwand',
      'Keine Mindestkapitalanforderung',
      'Vollständige Entscheidungsfreiheit'
    ],
    disadvantages: [
      'Unbeschränkte persönliche Haftung',
      'Schwierige Kapitalbeschaffung',
      'Geschäft ist personengebunden'
    ],
    suitableFor: [
      'Kleinbetriebe',
      'Freiberufler',
      'Dienstleistungsunternehmen',
      'Einzelhandel'
    ],
    registrationSteps: [
      'Gewerbeanmeldung beim Gewerbeamt',
      'Steuerliche Erfassung beim Finanzamt',
      'ggf. IHK-Anmeldung',
      'ggf. Handwerkskammer-Eintrag'
    ],
    estimatedCosts: {
      registration: 50,
      annual: 200,
    },
    timeToEstablish: '1-2 Wochen',
  },
  gbr: {
    formType: 'gbr',
    name: 'Gesellschaft bürgerlichen Rechts (GbR)',
    description: 'Personengesellschaft für mehrere Gründer ohne Handelsgewerbe',
    complexity: 'simple',
    minCapital: 0,
    liability: 'unlimited',
    taxation: ['Einkommensteuer der Gesellschafter', 'Gewerbesteuer'],
    advantages: [
      'Einfache Gründung',
      'Flexible Gewinnverteilung',
      'Gemeinsame Haftung',
      'Geringe Formalitäten'
    ],
    disadvantages: [
      'Unbeschränkte persönliche Haftung aller Gesellschafter',
      'Kein Handelsgewerbe möglich',
      'Kündigungsrecht der Gesellschafter'
    ],
    suitableFor: [
      'Freiberufler-Partnerschaften',
      'Kleine Dienstleistungsunternehmen',
      'Gemeinschaftsprojekte'
    ],
    registrationSteps: [
      'Gesellschaftsvertrag aufsetzen',
      'Gewerbeanmeldung (falls erforderlich)',
      'Steuerliche Erfassung',
      'ggf. Kammer-Anmeldungen'
    ],
    estimatedCosts: {
      registration: 100,
      annual: 300,
    },
    timeToEstablish: '2-3 Wochen',
  },
  ug: {
    formType: 'ug',
    name: 'Unternehmergesellschaft (UG)',
    description: 'Kleine GmbH mit reduziertem Mindestkapital',
    complexity: 'medium',
    minCapital: 1,
    liability: 'limited',
    taxation: ['Körperschaftssteuer', 'Gewerbesteuer', 'Lohnsteuer'],
    advantages: [
      'Haftungsbeschränkung',
      'Geringes Mindestkapital',
      'Flexibilität',
      'Aufbau zu GmbH möglich'
    ],
    disadvantages: [
      'Thesaurierungspflicht bis €25.000',
      'Höhere Verwaltungskosten',
      'Geringere Kreditwürdigkeit',
      'Notarielle Beurkundung erforderlich'
    ],
    suitableFor: [
      'Startups',
      'Wachstumsorientierte Unternehmen',
      'Technologieunternehmen'
    ],
    registrationSteps: [
      'Gesellschaftsvertrag notariell beurkunden',
      'Geschäftskonto eröffnen',
      'Handelsregister-Anmeldung',
      'Gewerbeanmeldung',
      'Steuerliche Erfassung'
    ],
    estimatedCosts: {
      registration: 800,
      annual: 2000,
    },
    timeToEstablish: '3-4 Wochen',
  },
  gmbh: {
    formType: 'gmbh',
    name: 'Gesellschaft mit beschränkter Haftung (GmbH)',
    description: 'Kapitalgesellschaft mit beschränkter Haftung und Mindestkapital',
    complexity: 'complex',
    minCapital: 25000,
    liability: 'limited',
    taxation: ['Körperschaftssteuer', 'Gewerbesteuer', 'Lohnsteuer'],
    advantages: [
      'Haftungsbeschränkung auf Stammkapital',
      'Hohe Kreditwürdigkeit',
      'Steuerliche Vorteile',
      'Gesellschafter-Wechsel möglich'
    ],
    disadvantages: [
      'Hohes Mindestkapital erforderlich',
      'Hohe Gründungskosten',
      'Umfangreiche Buchführungspflicht',
      'Doppelbesteuerung möglich'
    ],
    suitableFor: [
      'Größere Unternehmen',
      'Kapitalintensive Geschäfte',
      'Internationale Geschäfte',
      'Investoren-Beteiligung'
    ],
    registrationSteps: [
      'Gesellschaftsvertrag notariell beurkunden',
      'Stammkapital einzahlen',
      'Handelsregister-Anmeldung',
      'Gewerbeanmeldung',
      'Steuerliche Erfassung',
      'IHK-Anmeldung'
    ],
    estimatedCosts: {
      registration: 1500,
      annual: 3500,
    },
    timeToEstablish: '4-6 Wochen',
  },
  freelancer: {
    formType: 'freelancer',
    name: 'Freiberufler',
    description: 'Selbstständige Ausübung einer freiberuflichen Tätigkeit',
    complexity: 'simple',
    minCapital: 0,
    liability: 'unlimited',
    taxation: ['Einkommensteuer', 'keine Gewerbesteuer'],
    advantages: [
      'Keine Gewerbesteuer',
      'Einfache Gründung',
      'Keine IHK-Beiträge',
      'Freie Zeiteinteilung'
    ],
    disadvantages: [
      'Unbeschränkte persönliche Haftung',
      'Begrenzte Tätigkeitsbereiche',
      'Scheinselbstständigkeit-Risiko'
    ],
    suitableFor: [
      'Beratung',
      'IT-Dienstleistungen',
      'Kreative Tätigkeiten',
      'Heilberufe'
    ],
    registrationSteps: [
      'Fragebogen zur steuerlichen Erfassung',
      'ggf. Berufskammer-Anmeldung',
      'Krankenversicherung klären',
      'Rentenversicherung prüfen'
    ],
    estimatedCosts: {
      registration: 0,
      annual: 150,
    },
    timeToEstablish: '1-2 Wochen',
  },
  ohg: {
    formType: 'ohg',
    name: 'Offene Handelsgesellschaft (OHG)',
    description: 'Personenhandelsgesellschaft für Handelsbetriebe',
    complexity: 'medium',
    minCapital: 0,
    liability: 'unlimited',
    taxation: ['Einkommensteuer der Gesellschafter', 'Gewerbesteuer'],
    advantages: [
      'Handelsgewerbe möglich',
      'Kaufmannseigenschaft',
      'Flexible Geschäftsführung',
      'Kreditwürdigkeit'
    ],
    disadvantages: [
      'Unbeschränkte Haftung aller Gesellschafter',
      'Komplexere Buchführung',
      'Handelsregister-Eintragung pflicht'
    ],
    suitableFor: [
      'Handelsbetriebe',
      'Produzierendes Gewerbe',
      'Mehrere gleichberechtigte Partner'
    ],
    registrationSteps: [
      'Gesellschaftsvertrag aufsetzen',
      'Handelsregister-Anmeldung',
      'Gewerbeanmeldung',
      'Steuerliche Erfassung',
      'IHK-Anmeldung'
    ],
    estimatedCosts: {
      registration: 400,
      annual: 800,
    },
    timeToEstablish: '3-4 Wochen',
  },
  kg: {
    formType: 'kg',
    name: 'Kommanditgesellschaft (KG)',
    description: 'Personenhandelsgesellschaft mit Komplementär und Kommanditist',
    complexity: 'complex',
    minCapital: 0,
    liability: 'mixed',
    taxation: ['Einkommensteuer der Gesellschafter', 'Gewerbesteuer'],
    advantages: [
      'Beschränkte Haftung für Kommanditisten',
      'Kapitalbeschaffung erleichtert',
      'Steuerliche Transparenz'
    ],
    disadvantages: [
      'Komplexe Struktur',
      'Komplementär haftet unbeschränkt',
      'Aufwendige Verwaltung'
    ],
    suitableFor: [
      'Familienunternehmen',
      'Kapitalintensive Projekte',
      'Investoren-Beteiligung'
    ],
    registrationSteps: [
      'Gesellschaftsvertrag notariell beurkunden',
      'Kommanditeinlagen festlegen',
      'Handelsregister-Anmeldung',
      'Gewerbeanmeldung',
      'Steuerliche Erfassung'
    ],
    estimatedCosts: {
      registration: 600,
      annual: 1200,
    },
    timeToEstablish: '4-5 Wochen',
  },
  ag: {
    formType: 'ag',
    name: 'Aktiengesellschaft (AG)',
    description: 'Kapitalgesellschaft für große Unternehmen mit Aktienausgabe',
    complexity: 'complex',
    minCapital: 50000,
    liability: 'limited',
    taxation: ['Körperschaftssteuer', 'Gewerbesteuer', 'Kapitalertragsteuer'],
    advantages: [
      'Haftungsbeschränkung',
      'Kapitalbeschaffung über Börse',
      'Anonyme Beteiligung möglich',
      'Hohe Reputation'
    ],
    disadvantages: [
      'Sehr hohes Mindestkapital',
      'Aufwendige Gründung und Verwaltung',
      'Strenge Publizitätspflichten',
      'Hohe Kosten'
    ],
    suitableFor: [
      'Großunternehmen',
      'Börsengang geplant',
      'Internationale Expansion'
    ],
    registrationSteps: [
      'Gründungsversammlung',
      'Satzung notariell beurkunden',
      'Aufsichtsrat bestellen',
      'Grundkapital einzahlen',
      'Handelsregister-Anmeldung'
    ],
    estimatedCosts: {
      registration: 5000,
      annual: 15000,
    },
    timeToEstablish: '8-12 Wochen',
  },
  eg: {
    formType: 'eg',
    name: 'Eingetragene Genossenschaft (eG)',
    description: 'Gesellschaftsform für Gemeinschaftsunternehmen',
    complexity: 'complex',
    minCapital: 0,
    liability: 'limited',
    taxation: ['Körperschaftssteuer', 'Gewerbesteuer'],
    advantages: [
      'Haftungsbeschränkung',
      'Demokratische Struktur',
      'Förderauftrag',
      'Variable Mitgliederzahl'
    ],
    disadvantages: [
      'Komplexe Gründung',
      'Prüfungsverband erforderlich',
      'Mindestens 3 Mitglieder',
      'Genossenschaftsregister-Eintrag'
    ],
    suitableFor: [
      'Gemeinschaftsprojekte',
      'Soziale Unternehmen',
      'Landwirtschaft',
      'Energiegenossenschaften'
    ],
    registrationSteps: [
      'Satzung erstellen',
      'Gründungsversammlung',
      'Prüfungsverband beitreten',
      'Genossenschaftsregister-Anmeldung',
      'Gewerbeanmeldung'
    ],
    estimatedCosts: {
      registration: 800,
      annual: 1500,
    },
    timeToEstablish: '6-8 Wochen',
  },
};