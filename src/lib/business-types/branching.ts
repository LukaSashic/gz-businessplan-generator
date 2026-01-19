/**
 * Business Type Branching Logic
 *
 * Functions for determining business type and getting type-specific questions
 *
 * Based on: docs/business-types.md
 */

import { z } from 'zod';
import type { ModuleId } from '@/types/modules';
import {
  DetailedBusinessTypeId,
  BUSINESS_TYPE_DEFINITIONS,
  type BusinessTypeDefinition,
  type ModuleQuestionVariation,
  type ValidationRule,
} from './definitions';

// ============================================================================
// Intake Answers Schema (for business type determination)
// ============================================================================

export const IntakeAnswersSchema = z.object({
  // Profession type
  isFreiberufler: z.boolean().optional(),
  freiberuflerProfession: z.string().optional(),

  // Trade requirements
  requiresMeister: z.boolean().optional(),
  meisterTrade: z.string().optional(),

  // Food/Gastro
  isFood: z.boolean().optional(),
  isMobile: z.boolean().optional(),
  isEvent: z.boolean().optional(),

  // Product vs Service
  sellsProducts: z.boolean().optional(),
  hasPhysicalStore: z.boolean().optional(),
  hasOnlineStore: z.boolean().optional(),

  // Digital
  isDigital: z.boolean().optional(),
  isSubscription: z.boolean().optional(),

  // Other service types
  isHealthcare: z.boolean().optional(),
  isMobileService: z.boolean().optional(),
  hasTeam: z.boolean().optional(),
  teamSize: z.number().optional(),
});

export type IntakeAnswers = z.infer<typeof IntakeAnswersSchema>;

// ============================================================================
// Business Type Determination
// ============================================================================

/**
 * Determine the business type based on intake answers
 *
 * Priority order:
 * 1. Regulated professions (Freiberufler, Handwerk)
 * 2. Gastronomy (Restaurant, FoodTruck, Catering)
 * 3. Product businesses (E-Commerce, Einzelhandel, Hybrid-Handel)
 * 4. Digital services (SaaS, IT-Dienstleistung)
 * 5. Other services (Gesundheit, Mobile-Dienste, Agentur, Beratung)
 */
export function determineBusinessType(
  answers: IntakeAnswers
): DetailedBusinessTypeId {
  // 1. Check for regulated professions first
  if (answers.isFreiberufler) {
    return 'freiberufler';
  }

  if (answers.requiresMeister) {
    return 'handwerk';
  }

  // 2. Check gastronomy
  if (answers.isFood) {
    if (answers.isMobile) {
      return 'foodtruck';
    }
    if (answers.isEvent) {
      return 'catering';
    }
    return 'restaurant';
  }

  // 3. Check product vs service
  if (answers.sellsProducts) {
    if (answers.hasPhysicalStore && answers.hasOnlineStore) {
      return 'hybrid-handel';
    }
    if (answers.hasPhysicalStore) {
      return 'einzelhandel';
    }
    return 'e-commerce';
  }

  // 4. Digital services
  if (answers.isDigital) {
    if (answers.isSubscription) {
      return 'saas';
    }
    return 'it-dienstleistung';
  }

  // 5. Other service types
  if (answers.isHealthcare) {
    return 'gesundheit';
  }

  if (answers.isMobileService) {
    return 'mobile-dienste';
  }

  if (answers.hasTeam && answers.teamSize && answers.teamSize >= 2) {
    return 'agentur';
  }

  // Default for B2B services
  return 'beratung';
}

// ============================================================================
// Question Branching
// ============================================================================

/**
 * Base questions that apply to all business types
 */
export interface ModuleQuestion {
  id: string;
  moduleId: ModuleId;
  question: string;
  questionDe: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'boolean' | 'textarea';
  required: boolean;
  options?: { value: string; label: string; labelDe: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  helpText?: string;
  helpTextDe?: string;
  dependsOn?: {
    questionId: string;
    value: unknown;
  };
}

/**
 * Get questions for a specific module and business type
 */
export function getQuestionsForType(
  moduleId: ModuleId,
  businessTypeId: DetailedBusinessTypeId
): ModuleQuestion[] {
  const definition = BUSINESS_TYPE_DEFINITIONS[businessTypeId];
  const baseQuestions = getBaseQuestionsForModule(moduleId);
  const variations = definition.questionVariations.find(
    (v) => v.moduleId === moduleId
  );

  if (!variations) {
    return baseQuestions;
  }

  // Add additional questions from variations
  const additionalQuestions = getAdditionalQuestions(
    moduleId,
    businessTypeId,
    variations
  );

  // Filter out skipped questions
  const skippedIds = new Set(variations.skipQuestions || []);
  const filteredQuestions = baseQuestions.filter(
    (q) => !skippedIds.has(q.id)
  );

  return [...filteredQuestions, ...additionalQuestions];
}

/**
 * Get focus areas for a specific module and business type
 */
export function getFocusAreasForType(
  moduleId: ModuleId,
  businessTypeId: DetailedBusinessTypeId
): string[] {
  const definition = BUSINESS_TYPE_DEFINITIONS[businessTypeId];
  const variations = definition.questionVariations.find(
    (v) => v.moduleId === moduleId
  );

  return variations?.focusAreas || [];
}

/**
 * Get validation rules for a specific business type
 */
export function getValidationRulesForType(
  businessTypeId: DetailedBusinessTypeId
): ValidationRule[] {
  const definition = BUSINESS_TYPE_DEFINITIONS[businessTypeId];
  return definition.validationRules;
}

/**
 * Get financial template for a specific business type
 */
export function getFinancialTemplateForType(
  businessTypeId: DetailedBusinessTypeId
): BusinessTypeDefinition['financialTemplate'] {
  const definition = BUSINESS_TYPE_DEFINITIONS[businessTypeId];
  return definition.financialTemplate;
}

// ============================================================================
// Module-Specific Base Questions
// ============================================================================

/**
 * Get base questions for a module (applies to all business types)
 */
function getBaseQuestionsForModule(moduleId: ModuleId): ModuleQuestion[] {
  switch (moduleId) {
    case 'gz-intake':
      return INTAKE_BASE_QUESTIONS;
    case 'gz-geschaeftsmodell':
      return GESCHAEFTSMODELL_BASE_QUESTIONS;
    case 'gz-unternehmen':
      return UNTERNEHMEN_BASE_QUESTIONS;
    case 'gz-markt-wettbewerb':
      return MARKT_BASE_QUESTIONS;
    case 'gz-marketing':
      return MARKETING_BASE_QUESTIONS;
    case 'gz-finanzplanung':
      return FINANZPLANUNG_BASE_QUESTIONS;
    case 'gz-swot':
      return SWOT_BASE_QUESTIONS;
    case 'gz-meilensteine':
      return MEILENSTEINE_BASE_QUESTIONS;
    case 'gz-kpi':
      return KPI_BASE_QUESTIONS;
    case 'gz-zusammenfassung':
      return ZUSAMMENFASSUNG_BASE_QUESTIONS;
    default:
      return [];
  }
}

/**
 * Get additional questions based on business type variations
 */
function getAdditionalQuestions(
  moduleId: ModuleId,
  businessTypeId: DetailedBusinessTypeId,
  _variations: ModuleQuestionVariation
): ModuleQuestion[] {
  // Business type specific additional questions
  const additionalQuestionsMap: Partial<
    Record<DetailedBusinessTypeId, Partial<Record<ModuleId, ModuleQuestion[]>>>
  > = {
    freiberufler: {
      'gz-intake': [
        {
          id: 'freiberufler-status',
          moduleId: 'gz-intake',
          question: 'Which freelance profession applies?',
          questionDe: 'Welcher freiberufliche Beruf trifft zu?',
          type: 'select',
          required: true,
          options: [
            { value: 'writer', label: 'Writer/Author', labelDe: 'Schriftsteller/Autor' },
            { value: 'artist', label: 'Artist', labelDe: 'Künstler' },
            { value: 'teacher', label: 'Teacher/Educator', labelDe: 'Lehrer/Dozent' },
            { value: 'engineer', label: 'Engineer', labelDe: 'Ingenieur' },
            { value: 'consultant', label: 'Consultant', labelDe: 'Berater' },
            { value: 'therapist', label: 'Therapist', labelDe: 'Therapeut' },
            { value: 'other', label: 'Other', labelDe: 'Sonstiges' },
          ],
          helpTextDe: 'Freiberufler nach §18 EStG benötigen keine Gewerbeanmeldung',
        },
        {
          id: 'ksk-eligible',
          moduleId: 'gz-intake',
          question: 'Are you eligible for Künstlersozialkasse?',
          questionDe: 'Sind Sie für die Künstlersozialkasse berechtigt?',
          type: 'boolean',
          required: false,
          helpTextDe: 'Die KSK übernimmt 50% der Sozialversicherungsbeiträge',
        },
      ],
      'gz-finanzplanung': [
        {
          id: 'no-gewerbesteuer',
          moduleId: 'gz-finanzplanung',
          question: 'Confirm: No Gewerbesteuer applicable',
          questionDe: 'Bestätigung: Keine Gewerbesteuer fällig',
          type: 'boolean',
          required: true,
          helpTextDe: 'Freiberufler zahlen keine Gewerbesteuer',
        },
      ],
    },
    handwerk: {
      'gz-unternehmen': [
        {
          id: 'meisterpflicht',
          moduleId: 'gz-unternehmen',
          question: 'Is Meisterpflicht required for your trade?',
          questionDe: 'Ist für Ihr Gewerk Meisterpflicht erforderlich?',
          type: 'boolean',
          required: true,
          helpTextDe: '53 Gewerke erfordern einen Meisterbrief',
        },
        {
          id: 'meisterbrief',
          moduleId: 'gz-unternehmen',
          question: 'Do you have the required Meisterbrief?',
          questionDe: 'Haben Sie den erforderlichen Meisterbrief?',
          type: 'boolean',
          required: false,
          dependsOn: { questionId: 'meisterpflicht', value: true },
        },
        {
          id: 'hwk-registration',
          moduleId: 'gz-unternehmen',
          question: 'Have you registered with Handwerkskammer?',
          questionDe: 'Sind Sie bei der Handwerkskammer registriert?',
          type: 'boolean',
          required: true,
        },
      ],
    },
    restaurant: {
      'gz-unternehmen': [
        {
          id: 'gaststaettenerlaubnis',
          moduleId: 'gz-unternehmen',
          question: 'Do you have a Gaststättenerlaubnis?',
          questionDe: 'Haben Sie eine Gaststättenerlaubnis?',
          type: 'boolean',
          required: true,
        },
        {
          id: 'haccp-concept',
          moduleId: 'gz-unternehmen',
          question: 'Is HACCP hygiene concept in place?',
          questionDe: 'Ist ein HACCP-Hygienekonzept vorhanden?',
          type: 'boolean',
          required: true,
        },
      ],
      'gz-finanzplanung': [
        {
          id: 'wareneinsatz-rate',
          moduleId: 'gz-finanzplanung',
          question: 'What is your planned food cost ratio?',
          questionDe: 'Wie hoch ist Ihr geplanter Wareneinsatz?',
          type: 'number',
          required: true,
          validation: { min: 20, max: 40 },
          helpTextDe: 'Typisch: 25-35% vom Umsatz',
        },
      ],
    },
    'e-commerce': {
      'gz-geschaeftsmodell': [
        {
          id: 'sourcing-strategy',
          moduleId: 'gz-geschaeftsmodell',
          question: 'What is your product sourcing strategy?',
          questionDe: 'Was ist Ihre Produktbeschaffungsstrategie?',
          type: 'select',
          required: true,
          options: [
            { value: 'own-production', label: 'Own production', labelDe: 'Eigenproduktion' },
            { value: 'wholesale', label: 'Wholesale', labelDe: 'Großhandel' },
            { value: 'dropshipping', label: 'Dropshipping', labelDe: 'Dropshipping' },
            { value: 'mixed', label: 'Mixed', labelDe: 'Gemischt' },
          ],
        },
        {
          id: 'platform-choice',
          moduleId: 'gz-geschaeftsmodell',
          question: 'Which sales platforms will you use?',
          questionDe: 'Welche Verkaufsplattformen werden Sie nutzen?',
          type: 'multiselect',
          required: true,
          options: [
            { value: 'own-shop', label: 'Own online shop', labelDe: 'Eigener Online-Shop' },
            { value: 'amazon', label: 'Amazon', labelDe: 'Amazon' },
            { value: 'ebay', label: 'eBay', labelDe: 'eBay' },
            { value: 'etsy', label: 'Etsy', labelDe: 'Etsy' },
            { value: 'other', label: 'Other marketplaces', labelDe: 'Andere Marktplätze' },
          ],
        },
      ],
    },
    saas: {
      'gz-geschaeftsmodell': [
        {
          id: 'mrr-target',
          moduleId: 'gz-geschaeftsmodell',
          question: 'What is your target MRR after 12 months?',
          questionDe: 'Was ist Ihr MRR-Ziel nach 12 Monaten?',
          type: 'number',
          required: true,
          validation: { min: 0 },
          helpTextDe: 'Monthly Recurring Revenue',
        },
        {
          id: 'churn-estimate',
          moduleId: 'gz-geschaeftsmodell',
          question: 'What monthly churn rate do you expect?',
          questionDe: 'Welche monatliche Churn-Rate erwarten Sie?',
          type: 'number',
          required: true,
          validation: { min: 0, max: 20 },
          helpTextDe: 'Typisch: 3-5% für B2B SaaS',
        },
      ],
      'gz-finanzplanung': [
        {
          id: 'development-cost',
          moduleId: 'gz-finanzplanung',
          question: 'What are your estimated development costs?',
          questionDe: 'Wie hoch sind Ihre geschätzten Entwicklungskosten?',
          type: 'number',
          required: true,
          validation: { min: 0 },
          helpTextDe: 'Inkl. MVP-Entwicklung und erste Iterationen',
        },
        {
          id: 'cac-estimate',
          moduleId: 'gz-finanzplanung',
          question: 'What is your estimated Customer Acquisition Cost?',
          questionDe: 'Wie hoch sind Ihre geschätzten Kundenakquisekosten?',
          type: 'number',
          required: true,
          validation: { min: 0 },
          helpTextDe: 'Typisch: €200-2.000 für B2B SaaS',
        },
      ],
    },
  };

  const typeQuestions = additionalQuestionsMap[businessTypeId];
  if (!typeQuestions) {
    return [];
  }

  return typeQuestions[moduleId] || [];
}

// ============================================================================
// Base Question Definitions
// ============================================================================

const INTAKE_BASE_QUESTIONS: ModuleQuestion[] = [
  {
    id: 'business-idea',
    moduleId: 'gz-intake',
    question: 'What is your business idea?',
    questionDe: 'Was ist Ihre Geschäftsidee?',
    type: 'textarea',
    required: true,
    helpTextDe: 'Beschreiben Sie Ihre Geschäftsidee in 2-3 Sätzen',
  },
  {
    id: 'target-customers',
    moduleId: 'gz-intake',
    question: 'Who are your target customers?',
    questionDe: 'Wer sind Ihre Zielkunden?',
    type: 'textarea',
    required: true,
  },
  {
    id: 'unique-value',
    moduleId: 'gz-intake',
    question: 'What makes your offering unique?',
    questionDe: 'Was macht Ihr Angebot einzigartig?',
    type: 'textarea',
    required: true,
  },
];

const GESCHAEFTSMODELL_BASE_QUESTIONS: ModuleQuestion[] = [
  {
    id: 'value-proposition',
    moduleId: 'gz-geschaeftsmodell',
    question: 'What is your core value proposition?',
    questionDe: 'Was ist Ihr Kernnutzenversprechen?',
    type: 'textarea',
    required: true,
  },
  {
    id: 'revenue-streams',
    moduleId: 'gz-geschaeftsmodell',
    question: 'What are your revenue streams?',
    questionDe: 'Was sind Ihre Einnahmequellen?',
    type: 'textarea',
    required: true,
  },
  {
    id: 'key-activities',
    moduleId: 'gz-geschaeftsmodell',
    question: 'What are your key activities?',
    questionDe: 'Was sind Ihre Schlüsselaktivitäten?',
    type: 'textarea',
    required: true,
  },
];

const UNTERNEHMEN_BASE_QUESTIONS: ModuleQuestion[] = [
  {
    id: 'legal-form',
    moduleId: 'gz-unternehmen',
    question: 'What legal form will you choose?',
    questionDe: 'Welche Rechtsform wählen Sie?',
    type: 'select',
    required: true,
    options: [
      { value: 'einzelunternehmen', label: 'Sole proprietorship', labelDe: 'Einzelunternehmen' },
      { value: 'gbr', label: 'GbR', labelDe: 'GbR' },
      { value: 'ug', label: 'UG (haftungsbeschränkt)', labelDe: 'UG (haftungsbeschränkt)' },
      { value: 'gmbh', label: 'GmbH', labelDe: 'GmbH' },
    ],
  },
  {
    id: 'location',
    moduleId: 'gz-unternehmen',
    question: 'Where will your business be located?',
    questionDe: 'Wo wird Ihr Unternehmen angesiedelt sein?',
    type: 'text',
    required: true,
  },
];

const MARKT_BASE_QUESTIONS: ModuleQuestion[] = [
  {
    id: 'market-size',
    moduleId: 'gz-markt-wettbewerb',
    question: 'What is your target market size?',
    questionDe: 'Wie groß ist Ihr Zielmarkt?',
    type: 'textarea',
    required: true,
  },
  {
    id: 'competitors',
    moduleId: 'gz-markt-wettbewerb',
    question: 'Who are your main competitors?',
    questionDe: 'Wer sind Ihre Hauptwettbewerber?',
    type: 'textarea',
    required: true,
    helpTextDe: 'Mindestens 3 Wettbewerber für BA-Compliance',
  },
];

const MARKETING_BASE_QUESTIONS: ModuleQuestion[] = [
  {
    id: 'marketing-channels',
    moduleId: 'gz-marketing',
    question: 'Which marketing channels will you use?',
    questionDe: 'Welche Marketingkanäle werden Sie nutzen?',
    type: 'multiselect',
    required: true,
    options: [
      { value: 'social-media', label: 'Social Media', labelDe: 'Social Media' },
      { value: 'seo', label: 'SEO/Content', labelDe: 'SEO/Content' },
      { value: 'paid-ads', label: 'Paid Advertising', labelDe: 'Bezahlte Werbung' },
      { value: 'networking', label: 'Networking', labelDe: 'Networking' },
      { value: 'referrals', label: 'Referrals', labelDe: 'Empfehlungen' },
    ],
  },
  {
    id: 'pricing-strategy',
    moduleId: 'gz-marketing',
    question: 'What is your pricing strategy?',
    questionDe: 'Was ist Ihre Preisstrategie?',
    type: 'select',
    required: true,
    options: [
      { value: 'premium', label: 'Premium', labelDe: 'Premium' },
      { value: 'competitive', label: 'Competitive', labelDe: 'Wettbewerbsorientiert' },
      { value: 'value', label: 'Value-based', labelDe: 'Wertbasiert' },
      { value: 'penetration', label: 'Penetration', labelDe: 'Penetration' },
    ],
  },
];

const FINANZPLANUNG_BASE_QUESTIONS: ModuleQuestion[] = [
  {
    id: 'startup-costs',
    moduleId: 'gz-finanzplanung',
    question: 'What are your estimated startup costs?',
    questionDe: 'Wie hoch sind Ihre geschätzten Gründungskosten?',
    type: 'number',
    required: true,
    validation: { min: 0 },
  },
  {
    id: 'monthly-revenue-y1',
    moduleId: 'gz-finanzplanung',
    question: 'What is your expected monthly revenue in Year 1?',
    questionDe: 'Welchen monatlichen Umsatz erwarten Sie im Jahr 1?',
    type: 'number',
    required: true,
    validation: { min: 0 },
  },
  {
    id: 'monthly-costs',
    moduleId: 'gz-finanzplanung',
    question: 'What are your estimated monthly fixed costs?',
    questionDe: 'Wie hoch sind Ihre geschätzten monatlichen Fixkosten?',
    type: 'number',
    required: true,
    validation: { min: 0 },
  },
];

const SWOT_BASE_QUESTIONS: ModuleQuestion[] = [
  {
    id: 'strengths',
    moduleId: 'gz-swot',
    question: 'What are your key strengths?',
    questionDe: 'Was sind Ihre Schlüsselstärken?',
    type: 'textarea',
    required: true,
  },
  {
    id: 'weaknesses',
    moduleId: 'gz-swot',
    question: 'What are your main weaknesses?',
    questionDe: 'Was sind Ihre Hauptschwächen?',
    type: 'textarea',
    required: true,
  },
  {
    id: 'opportunities',
    moduleId: 'gz-swot',
    question: 'What opportunities do you see?',
    questionDe: 'Welche Chancen sehen Sie?',
    type: 'textarea',
    required: true,
  },
  {
    id: 'threats',
    moduleId: 'gz-swot',
    question: 'What threats do you face?',
    questionDe: 'Welchen Risiken sind Sie ausgesetzt?',
    type: 'textarea',
    required: true,
  },
];

const MEILENSTEINE_BASE_QUESTIONS: ModuleQuestion[] = [
  {
    id: 'month-3-milestone',
    moduleId: 'gz-meilensteine',
    question: 'What is your 3-month milestone?',
    questionDe: 'Was ist Ihr 3-Monats-Meilenstein?',
    type: 'textarea',
    required: true,
  },
  {
    id: 'month-6-milestone',
    moduleId: 'gz-meilensteine',
    question: 'What is your 6-month milestone?',
    questionDe: 'Was ist Ihr 6-Monats-Meilenstein?',
    type: 'textarea',
    required: true,
  },
  {
    id: 'year-1-milestone',
    moduleId: 'gz-meilensteine',
    question: 'What is your 12-month milestone?',
    questionDe: 'Was ist Ihr 12-Monats-Meilenstein?',
    type: 'textarea',
    required: true,
  },
];

const KPI_BASE_QUESTIONS: ModuleQuestion[] = [
  {
    id: 'primary-kpi',
    moduleId: 'gz-kpi',
    question: 'What is your primary KPI?',
    questionDe: 'Was ist Ihr primärer KPI?',
    type: 'text',
    required: true,
  },
  {
    id: 'kpi-target-y1',
    moduleId: 'gz-kpi',
    question: 'What is your Year 1 target for this KPI?',
    questionDe: 'Was ist Ihr Jahr-1-Ziel für diesen KPI?',
    type: 'text',
    required: true,
  },
];

const ZUSAMMENFASSUNG_BASE_QUESTIONS: ModuleQuestion[] = [
  {
    id: 'executive-summary',
    moduleId: 'gz-zusammenfassung',
    question: 'Provide a brief executive summary',
    questionDe: 'Geben Sie eine kurze Zusammenfassung',
    type: 'textarea',
    required: true,
    helpTextDe: 'Max. 500 Wörter für BA-Compliance',
  },
];

// ModuleQuestion is already exported via the interface declaration above
