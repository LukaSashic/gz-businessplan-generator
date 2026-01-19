/**
 * Business Type Definitions
 *
 * 15 distinct business types for GZ Businessplan Generator
 * Each type has specific question variations, validation rules, and coaching focus
 *
 * Based on: docs/business-types.md
 */

import { z } from 'zod';

// ============================================================================
// Enums and Base Types
// ============================================================================

/**
 * The 15 business type identifiers
 */
export const DetailedBusinessTypeId = z.enum([
  'beratung',
  'agentur',
  'freiberufler',
  'gesundheit',
  'e-commerce',
  'einzelhandel',
  'hybrid-handel',
  'handwerk',
  'gewerbe',
  'mobile-dienste',
  'restaurant',
  'foodtruck',
  'catering',
  'saas',
  'it-dienstleistung',
]);

export type DetailedBusinessTypeId = z.infer<typeof DetailedBusinessTypeId>;

/**
 * Business category (higher-level grouping)
 */
export const BusinessCategory = z.enum([
  'service',
  'product',
  'gastro',
  'digital',
]);

export type BusinessCategory = z.infer<typeof BusinessCategory>;

/**
 * Target market
 */
export const TargetMarket = z.enum(['b2b', 'b2c', 'b2b_b2c']);

export type TargetMarket = z.infer<typeof TargetMarket>;

/**
 * Pricing model type
 */
export const PricingModel = z.enum([
  'hourly',
  'project',
  'retainer',
  'product_margin',
  'subscription',
  'session',
  'visit',
  'menu',
  'per_head',
  'hybrid',
]);

export type PricingModel = z.infer<typeof PricingModel>;

/**
 * Capital needs level
 */
export const CapitalNeedsLevel = z.enum([
  'very_low',    // €2,000-8,000
  'low',         // €5,000-15,000
  'medium',      // €15,000-50,000
  'medium_high', // €30,000-80,000
  'high',        // €50,000-150,000
  'very_high',   // €80,000-250,000
]);

export type CapitalNeedsLevel = z.infer<typeof CapitalNeedsLevel>;

/**
 * Location requirement
 */
export const LocationRequirement = z.enum([
  'home_office',
  'remote',
  'office',
  'practice',
  'retail',
  'workshop',
  'mobile',
  'warehouse',
  'kitchen',
  'high_traffic',
]);

export type LocationRequirement = z.infer<typeof LocationRequirement>;

/**
 * Coaching methodology type
 */
export const CoachingMethodology = z.enum([
  'cbc',       // Cognitive Behavioral Coaching
  'mi',        // Motivational Interviewing
  'grow',      // Goal-Reality-Options-Will
  'sdt',       // Self-Determination Theory
  'socratic',  // Socratic Questioning
  'ai',        // Appreciative Inquiry
]);

export type CoachingMethodology = z.infer<typeof CoachingMethodology>;

// ============================================================================
// Module-specific Question Variations
// ============================================================================

export interface ModuleQuestionVariation {
  moduleId: string;
  focusAreas: string[];
  additionalQuestions?: string[];
  skipQuestions?: string[];
}

// ============================================================================
// Validation Rules
// ============================================================================

export interface ValidationRule {
  field: string;
  rule: 'min' | 'max' | 'range' | 'percentage' | 'required' | 'conditional';
  value?: number;
  minValue?: number;
  maxValue?: number;
  condition?: string;
  errorMessage: string;
  warningMessage?: string;
}

// ============================================================================
// Financial Template
// ============================================================================

export interface FinancialTemplate {
  revenueModel: string;
  typicalMetrics: Record<string, { min: number; max: number; unit: string }>;
  costStructure: Record<string, { percentage?: number; fixed?: number; unit: string }>;
}

// ============================================================================
// Coaching Focus
// ============================================================================

export interface CoachingFocus {
  primaryBeliefs: string[];
  commonAnxieties: string[];
  challenges: string[];
  primaryMethodologies: CoachingMethodology[];
  secondaryMethodologies: CoachingMethodology[];
}

// ============================================================================
// Business Type Definition
// ============================================================================

export interface BusinessTypeDefinition {
  id: DetailedBusinessTypeId;
  name: string;
  nameEn: string;
  description: string;
  category: BusinessCategory;
  targetMarket: TargetMarket;
  pricingModels: PricingModel[];
  capitalNeeds: CapitalNeedsLevel;
  capitalRange: { min: number; max: number };
  locationRequirements: LocationRequirement[];
  questionVariations: ModuleQuestionVariation[];
  validationRules: ValidationRule[];
  financialTemplate: FinancialTemplate;
  coachingFocus: CoachingFocus;
  specialRequirements?: string[];
}

// ============================================================================
// Business Type Definitions
// ============================================================================

export const BUSINESS_TYPE_DEFINITIONS: Record<DetailedBusinessTypeId, BusinessTypeDefinition> = {
  // -------------------------------------------------------------------------
  // 1. Beratung (Consulting)
  // -------------------------------------------------------------------------
  beratung: {
    id: 'beratung',
    name: 'Beratung',
    nameEn: 'Consulting',
    description: 'B2B consulting services with hourly or project-based pricing',
    category: 'service',
    targetMarket: 'b2b',
    pricingModels: ['hourly', 'project'],
    capitalNeeds: 'low',
    capitalRange: { min: 5000, max: 15000 },
    locationRequirements: ['home_office', 'remote'],
    questionVariations: [
      {
        moduleId: 'gz-geschaeftsmodell',
        focusAreas: [
          'Spezialisierung vs. Generalist-Positionierung',
          'Expertise-Nachweis (Zertifikate, Track Record)',
        ],
      },
      {
        moduleId: 'gz-finanzplanung',
        focusAreas: [
          'Auslastungsrate (realistisch max. 60-70%)',
          'Akquisezeit zwischen Projekten',
          'Tagessatz-Berechnung',
        ],
      },
    ],
    validationRules: [
      {
        field: 'utilizationRate',
        rule: 'max',
        value: 0.7,
        errorMessage: 'Auslastungsrate über 70% ist unrealistisch für Berater',
        warningMessage: 'Eine Auslastung über 60% lässt wenig Zeit für Akquise',
      },
      {
        field: 'dailyRate',
        rule: 'min',
        value: 800,
        errorMessage: 'Ein Tagessatz unter 800€ gefährdet die Nachhaltigkeit',
      },
      {
        field: 'firstYearClients',
        rule: 'range',
        minValue: 3,
        maxValue: 8,
        errorMessage: 'Realistische Kundenanzahl im ersten Jahr: 3-8',
      },
    ],
    financialTemplate: {
      revenueModel: 'Tagessatz × Fakturierbare Tage',
      typicalMetrics: {
        dailyRate: { min: 800, max: 1500, unit: '€/Tag' },
        billableDaysPerMonth: { min: 12, max: 15, unit: 'Tage' },
        annualRevenueY1: { min: 100000, max: 180000, unit: '€' },
      },
      costStructure: {
        office: { fixed: 0, unit: '€/Monat' },
        marketing: { percentage: 5, unit: '% vom Umsatz' },
        tools: { fixed: 200, unit: '€/Monat' },
      },
    },
    coachingFocus: {
      primaryBeliefs: ['Der Markt ist gesättigt'],
      commonAnxieties: ['Woher kommen Kunden?'],
      challenges: ['Nischen-Differenzierung', 'Preisgestaltung'],
      primaryMethodologies: ['cbc', 'mi'],
      secondaryMethodologies: ['socratic'],
    },
  },

  // -------------------------------------------------------------------------
  // 2. Agentur (Agency)
  // -------------------------------------------------------------------------
  agentur: {
    id: 'agentur',
    name: 'Agentur',
    nameEn: 'Agency',
    description: 'B2B agency with team-based project and retainer work',
    category: 'service',
    targetMarket: 'b2b',
    pricingModels: ['project', 'retainer'],
    capitalNeeds: 'medium',
    capitalRange: { min: 20000, max: 50000 },
    locationRequirements: ['office'],
    questionVariations: [
      {
        moduleId: 'gz-unternehmen',
        focusAreas: [
          'Teamstruktur kritisch',
          'Rollen: Account, Creative, Tech',
        ],
      },
      {
        moduleId: 'gz-finanzplanung',
        focusAreas: [
          'Höhere Fixkosten (Büro, Team)',
          'Freelancer-Netzwerk-Kosten',
          'Projekt-Profitabilität variiert',
        ],
      },
    ],
    validationRules: [
      {
        field: 'teamSize',
        rule: 'min',
        value: 2,
        errorMessage: 'Für das Label "Agentur" werden mindestens 2 Personen erwartet',
      },
      {
        field: 'projectMargin',
        rule: 'range',
        minValue: 0.3,
        maxValue: 0.5,
        errorMessage: 'Projekt-Margen sollten zwischen 30-50% liegen',
      },
    ],
    financialTemplate: {
      revenueModel: 'Projektgebühren + Retainer',
      typicalMetrics: {
        avgProject: { min: 5000, max: 50000, unit: '€' },
        retainer: { min: 2000, max: 10000, unit: '€/Monat' },
      },
      costStructure: {
        team: { percentage: 50, unit: '% vom Umsatz' },
        office: { fixed: 1500, unit: '€/Monat' },
        freelancers: { percentage: 15, unit: '% vom Projektumsatz' },
      },
    },
    coachingFocus: {
      primaryBeliefs: ['Skalierung ist riskant'],
      commonAnxieties: ['Cashflow bei Projektverzögerungen'],
      challenges: ['Skalierung vs. Boutique-Entscheidung', 'Team-Management'],
      primaryMethodologies: ['grow', 'mi'],
      secondaryMethodologies: ['cbc'],
    },
  },

  // -------------------------------------------------------------------------
  // 3. Freiberufler (Freelancer)
  // -------------------------------------------------------------------------
  freiberufler: {
    id: 'freiberufler',
    name: 'Freiberufler',
    nameEn: 'Freelancer',
    description: 'Self-employed professional with hourly billing (§18 EStG)',
    category: 'service',
    targetMarket: 'b2b_b2c',
    pricingModels: ['hourly'],
    capitalNeeds: 'very_low',
    capitalRange: { min: 2000, max: 8000 },
    locationRequirements: ['home_office'],
    questionVariations: [
      {
        moduleId: 'gz-intake',
        focusAreas: [
          'Freiberufler-Status prüfen (§18 EStG)',
          'Kein Gewerbe nötig für: Schriftsteller, Künstler, Lehrer, Ingenieure, Berater',
        ],
      },
      {
        moduleId: 'gz-finanzplanung',
        focusAreas: [
          'Keine Gewerbesteuer',
          'Niedrigere Sozialabgaben möglich',
          'KSK-Berechtigung prüfen',
        ],
      },
    ],
    validationRules: [
      {
        field: 'freiberuflerStatus',
        rule: 'required',
        errorMessage: 'Freiberufler-Status muss bestätigt sein',
      },
      {
        field: 'weeklyHours',
        rule: 'max',
        value: 50,
        errorMessage: 'Maximale Wochenarbeitszeit: 40-50 Stunden',
      },
    ],
    financialTemplate: {
      revenueModel: 'Stundensatz × Stunden',
      typicalMetrics: {
        hourlyRate: { min: 50, max: 150, unit: '€/Stunde' },
        billableHoursPerWeek: { min: 20, max: 30, unit: 'Stunden' },
        annualRevenueY1: { min: 50000, max: 120000, unit: '€' },
      },
      costStructure: {
        office: { fixed: 0, unit: '€/Monat' },
        insurance: { fixed: 300, unit: '€/Monat' },
        tools: { fixed: 100, unit: '€/Monat' },
      },
    },
    coachingFocus: {
      primaryBeliefs: ['Ich bin kein Verkäufer'],
      commonAnxieties: ['Work-Life-Balance', 'Preisverhandlungen'],
      challenges: ['Rate Negotiation Confidence'],
      primaryMethodologies: ['mi', 'cbc'],
      secondaryMethodologies: ['sdt'],
    },
    specialRequirements: [
      'Freiberufler-Status nach §18 EStG prüfen',
      'Künstlersozialkasse-Berechtigung prüfen',
    ],
  },

  // -------------------------------------------------------------------------
  // 4. Gesundheit (Healthcare)
  // -------------------------------------------------------------------------
  gesundheit: {
    id: 'gesundheit',
    name: 'Gesundheit',
    nameEn: 'Healthcare',
    description: 'Healthcare services with practice location and certifications',
    category: 'service',
    targetMarket: 'b2c',
    pricingModels: ['session'],
    capitalNeeds: 'medium',
    capitalRange: { min: 15000, max: 40000 },
    locationRequirements: ['practice'],
    questionVariations: [
      {
        moduleId: 'gz-unternehmen',
        focusAreas: [
          'Heilpraktikergesetz-Compliance',
          'Erforderliche Zertifizierungen',
          'Versicherungsanforderungen',
        ],
      },
      {
        moduleId: 'gz-markt-wettbewerb',
        focusAreas: [
          'Lokale Wettbewerbsanalyse',
          'Überweisungsnetzwerk-Bedeutung',
        ],
      },
    ],
    validationRules: [
      {
        field: 'certifications',
        rule: 'required',
        errorMessage: 'Erforderliche Zertifizierungen müssen vorhanden sein',
      },
      {
        field: 'liabilityInsurance',
        rule: 'required',
        errorMessage: 'Berufshaftpflichtversicherung ist erforderlich',
      },
    ],
    financialTemplate: {
      revenueModel: 'Sitzungen × Preis',
      typicalMetrics: {
        sessionPrice: { min: 60, max: 150, unit: '€' },
        sessionsPerWeek: { min: 15, max: 25, unit: 'Sitzungen' },
      },
      costStructure: {
        practiceRent: { fixed: 1000, unit: '€/Monat' },
        insurance: { fixed: 200, unit: '€/Monat' },
        marketing: { percentage: 5, unit: '% vom Umsatz' },
      },
    },
    coachingFocus: {
      primaryBeliefs: ['Kann ich davon leben?'],
      commonAnxieties: ['Regulatorische Angst', 'Marketing-Ethik'],
      challenges: ['Regulatorische Compliance', 'Patientenakquise'],
      primaryMethodologies: ['sdt', 'mi'],
      secondaryMethodologies: ['cbc'],
    },
    specialRequirements: [
      'Heilpraktikererlaubnis oder Approbation',
      'Berufshaftpflichtversicherung',
      'Hygienekonzept',
    ],
  },

  // -------------------------------------------------------------------------
  // 5. E-Commerce (Online Shop)
  // -------------------------------------------------------------------------
  'e-commerce': {
    id: 'e-commerce',
    name: 'E-Commerce',
    nameEn: 'Online Shop',
    description: 'Online retail with inventory management and shipping',
    category: 'product',
    targetMarket: 'b2c',
    pricingModels: ['product_margin'],
    capitalNeeds: 'medium_high',
    capitalRange: { min: 20000, max: 80000 },
    locationRequirements: ['warehouse'],
    questionVariations: [
      {
        moduleId: 'gz-geschaeftsmodell',
        focusAreas: [
          'Produktbeschaffungsstrategie',
          'Dropshipping vs. Lagerhaltung',
          'Plattformwahl (eigener Shop vs. Marktplätze)',
        ],
      },
      {
        moduleId: 'gz-finanzplanung',
        focusAreas: [
          'Lagerinvestition',
          'Versandkosten',
          'Retourenquote (5-15%)',
          'Marketing/CAC kritisch',
        ],
      },
    ],
    validationRules: [
      {
        field: 'grossMargin',
        rule: 'min',
        value: 0.4,
        errorMessage: 'Bruttomarge unter 40% gefährdet die Rentabilität',
      },
      {
        field: 'returnRate',
        rule: 'max',
        value: 0.15,
        errorMessage: 'Retourenquote über 15% ist kritisch',
      },
      {
        field: 'marketingBudget',
        rule: 'range',
        minValue: 0.15,
        maxValue: 0.3,
        errorMessage: 'Marketingbudget sollte 15-30% vom Umsatz betragen',
      },
    ],
    financialTemplate: {
      revenueModel: 'Einheiten × Preis',
      typicalMetrics: {
        avgOrderValue: { min: 50, max: 150, unit: '€' },
        grossMargin: { min: 40, max: 60, unit: '%' },
        cac: { min: 15, max: 50, unit: '€' },
        returnRate: { min: 5, max: 15, unit: '%' },
      },
      costStructure: {
        inventory: { percentage: 45, unit: '% vom Umsatz' },
        shipping: { percentage: 8, unit: '% vom Umsatz' },
        marketing: { percentage: 20, unit: '% vom Umsatz' },
        platform: { percentage: 5, unit: '% vom Umsatz' },
      },
    },
    coachingFocus: {
      primaryBeliefs: ['Amazon-Konkurrenz ist übermächtig'],
      commonAnxieties: ['Lagerrisiko', 'Cashflow-Timing'],
      challenges: ['Differenzierung', 'Kundenakquisekosten'],
      primaryMethodologies: ['cbc', 'socratic'],
      secondaryMethodologies: ['mi'],
    },
  },

  // -------------------------------------------------------------------------
  // 6. Einzelhandel (Retail)
  // -------------------------------------------------------------------------
  einzelhandel: {
    id: 'einzelhandel',
    name: 'Einzelhandel',
    nameEn: 'Retail',
    description: 'Physical retail store with location-dependent business',
    category: 'product',
    targetMarket: 'b2c',
    pricingModels: ['product_margin'],
    capitalNeeds: 'high',
    capitalRange: { min: 50000, max: 150000 },
    locationRequirements: ['retail'],
    questionVariations: [
      {
        moduleId: 'gz-unternehmen',
        focusAreas: [
          'Standortanalyse essentiell',
          'Passantenfrequenz-Schätzung',
          'Mietvertragsverhandlung',
        ],
      },
      {
        moduleId: 'gz-finanzplanung',
        focusAreas: [
          'Hohe Fixkosten (Miete, Personal)',
          'Lagerumschlag',
          'Saisonalität',
        ],
      },
    ],
    validationRules: [
      {
        field: 'rentToRevenueRatio',
        rule: 'max',
        value: 0.1,
        errorMessage: 'Mietkosten sollten unter 10% vom Umsatz liegen',
      },
      {
        field: 'inventoryTurnover',
        rule: 'range',
        minValue: 4,
        maxValue: 12,
        errorMessage: 'Lagerumschlag sollte 4-12x pro Jahr betragen',
      },
    ],
    financialTemplate: {
      revenueModel: 'Tagesumsatz × Betriebstage',
      typicalMetrics: {
        avgTransaction: { min: 30, max: 100, unit: '€' },
        dailyCustomers: { min: 20, max: 100, unit: 'Kunden' },
      },
      costStructure: {
        rent: { fixed: 3000, unit: '€/Monat' },
        staff: { fixed: 3500, unit: '€/Person/Monat' },
        inventory: { percentage: 55, unit: '% vom Umsatz' },
      },
    },
    coachingFocus: {
      primaryBeliefs: ['Der Einzelhandel stirbt aus'],
      commonAnxieties: ['Standort-Angst', 'Online-Konkurrenz'],
      challenges: ['Standortwahl', 'Frequenzgenerierung'],
      primaryMethodologies: ['mi', 'cbc'],
      secondaryMethodologies: ['grow'],
    },
  },

  // -------------------------------------------------------------------------
  // 7. Hybrid-Handel (Omnichannel)
  // -------------------------------------------------------------------------
  'hybrid-handel': {
    id: 'hybrid-handel',
    name: 'Hybrid-Handel',
    nameEn: 'Omnichannel Retail',
    description: 'Combined online and offline retail with unified inventory',
    category: 'product',
    targetMarket: 'b2b_b2c',
    pricingModels: ['product_margin'],
    capitalNeeds: 'high',
    capitalRange: { min: 40000, max: 100000 },
    locationRequirements: ['retail', 'warehouse'],
    questionVariations: [
      {
        moduleId: 'gz-marketing',
        focusAreas: [
          'Kanalintegrationsstrategie',
          'Online-to-Offline, Offline-to-Online',
          'Lagersynchronisation',
        ],
      },
    ],
    validationRules: [
      {
        field: 'bothChannelsBudgeted',
        rule: 'required',
        errorMessage: 'Beide Kanäle müssen budgetiert sein',
      },
      {
        field: 'inventorySystemPlanned',
        rule: 'required',
        errorMessage: 'Einheitliches Lagersystem muss geplant sein',
      },
    ],
    financialTemplate: {
      revenueModel: 'Online-Umsatz + Offline-Umsatz',
      typicalMetrics: {
        onlineShare: { min: 30, max: 70, unit: '%' },
        offlineShare: { min: 30, max: 70, unit: '%' },
      },
      costStructure: {
        rent: { fixed: 2500, unit: '€/Monat' },
        onlineMarketing: { percentage: 15, unit: '% vom Online-Umsatz' },
        inventory: { percentage: 50, unit: '% vom Umsatz' },
        shipping: { percentage: 5, unit: '% vom Online-Umsatz' },
      },
    },
    coachingFocus: {
      primaryBeliefs: ['Das ist zu komplex für mich'],
      commonAnxieties: ['Ressourcenverteilung'],
      challenges: ['Komplexitätsmanagement', 'Kanalsynergien'],
      primaryMethodologies: ['grow'],
      secondaryMethodologies: ['mi', 'cbc'],
    },
  },

  // -------------------------------------------------------------------------
  // 8. Handwerk (Craft/Trade)
  // -------------------------------------------------------------------------
  handwerk: {
    id: 'handwerk',
    name: 'Handwerk',
    nameEn: 'Craft/Trade',
    description: 'Skilled trade with potential Meisterpflicht requirement',
    category: 'service',
    targetMarket: 'b2c',
    pricingModels: ['hourly', 'project'],
    capitalNeeds: 'medium',
    capitalRange: { min: 20000, max: 60000 },
    locationRequirements: ['workshop', 'mobile'],
    questionVariations: [
      {
        moduleId: 'gz-unternehmen',
        focusAreas: [
          'Meisterpflicht-Check: Erforderlich für 53 Gewerke',
          'Handwerkskammer-Registrierung',
          'Werkzeug-/Fahrzeuginvestition',
        ],
      },
      {
        moduleId: 'gz-finanzplanung',
        focusAreas: [
          'Fahrzeugkosten',
          'Werkzeugabschreibung',
          'Materialaufschlag',
        ],
      },
    ],
    validationRules: [
      {
        field: 'meisterbrief',
        rule: 'conditional',
        condition: 'requiresMeister',
        errorMessage: 'Meisterbrief erforderlich für dieses Gewerk',
      },
      {
        field: 'vehicleCosts',
        rule: 'required',
        errorMessage: 'Fahrzeugkosten müssen budgetiert sein',
      },
      {
        field: 'materialMarkup',
        rule: 'range',
        minValue: 0.15,
        maxValue: 0.3,
        errorMessage: 'Materialaufschlag sollte 15-30% betragen',
      },
    ],
    financialTemplate: {
      revenueModel: '(Stunden × Stundensatz) + Materialien',
      typicalMetrics: {
        hourlyRate: { min: 45, max: 85, unit: '€/Stunde' },
        materialMarkup: { min: 15, max: 30, unit: '%' },
      },
      costStructure: {
        vehicle: { fixed: 450, unit: '€/Monat' },
        tools: { fixed: 12500, unit: '€ Anfangsinvestition' },
        materials: { percentage: 35, unit: '% vom Auftragswert' },
      },
    },
    coachingFocus: {
      primaryBeliefs: ['Ich bin Handwerker, kein Unternehmer'],
      commonAnxieties: ['Papierkram-Angst', 'Preisgestaltung'],
      challenges: ['Pricing Confidence', 'Administrative Aufgaben'],
      primaryMethodologies: ['cbc', 'sdt'],
      secondaryMethodologies: ['mi'],
    },
    specialRequirements: [
      'Meisterpflicht für 53 Gewerke prüfen',
      'Handwerkskammer-Mitgliedschaft',
      'Betriebshaftpflichtversicherung',
    ],
  },

  // -------------------------------------------------------------------------
  // 9. Gewerbe (Licensed Trade)
  // -------------------------------------------------------------------------
  gewerbe: {
    id: 'gewerbe',
    name: 'Gewerbe',
    nameEn: 'Licensed Trade',
    description: 'Trade business with specific permit requirements',
    category: 'service',
    targetMarket: 'b2b_b2c',
    pricingModels: ['hourly', 'project', 'product_margin'],
    capitalNeeds: 'medium',
    capitalRange: { min: 15000, max: 50000 },
    locationRequirements: ['office', 'workshop'],
    questionVariations: [
      {
        moduleId: 'gz-unternehmen',
        focusAreas: [
          'Genehmigungsanforderungen prüfen',
          'Gewerbeamt-Anmeldung',
          'Branchenspezifische Vorschriften',
        ],
      },
    ],
    validationRules: [
      {
        field: 'permits',
        rule: 'required',
        errorMessage: 'Erforderliche Genehmigungen müssen identifiziert sein',
      },
      {
        field: 'complianceCosts',
        rule: 'required',
        errorMessage: 'Compliance-Kosten müssen budgetiert sein',
      },
    ],
    financialTemplate: {
      revenueModel: 'Variiert nach Branche',
      typicalMetrics: {},
      costStructure: {
        permits: { fixed: 500, unit: '€/Jahr' },
        insurance: { fixed: 200, unit: '€/Monat' },
      },
    },
    coachingFocus: {
      primaryBeliefs: ['Regulierung ist überwältigend'],
      commonAnxieties: ['Genehmigungszeitplan-Angst'],
      challenges: ['Regulatorische Navigation', 'Compliance'],
      primaryMethodologies: ['sdt', 'grow'],
      secondaryMethodologies: ['mi'],
    },
    specialRequirements: [
      'Gewerbeanmeldung',
      'Branchenspezifische Genehmigungen',
    ],
  },

  // -------------------------------------------------------------------------
  // 10. Mobile-Dienste (Mobile Services)
  // -------------------------------------------------------------------------
  'mobile-dienste': {
    id: 'mobile-dienste',
    name: 'Mobile-Dienste',
    nameEn: 'Mobile Services',
    description: 'Vehicle-based service business with route management',
    category: 'service',
    targetMarket: 'b2c',
    pricingModels: ['visit'],
    capitalNeeds: 'medium',
    capitalRange: { min: 15000, max: 40000 },
    locationRequirements: ['mobile'],
    questionVariations: [
      {
        moduleId: 'gz-finanzplanung',
        focusAreas: [
          'Fahrzeug als Hauptvermögenswert',
          'Kraftstoff-/Wartungskosten',
          'Routenoptimierung',
          'Geografisches Einzugsgebiet',
        ],
      },
    ],
    validationRules: [
      {
        field: 'vehicleCosts',
        rule: 'required',
        errorMessage: 'Fahrzeugkosten müssen realistisch sein',
      },
      {
        field: 'serviceRadius',
        rule: 'required',
        errorMessage: 'Einzugsgebiet muss definiert sein',
      },
      {
        field: 'dailyCapacity',
        rule: 'required',
        errorMessage: 'Tageskapazität muss berechnet sein',
      },
    ],
    financialTemplate: {
      revenueModel: 'Besuche × Preis',
      typicalMetrics: {
        pricePerVisit: { min: 50, max: 150, unit: '€' },
        visitsPerDay: { min: 4, max: 8, unit: 'Besuche' },
      },
      costStructure: {
        vehicle: { fixed: 600, unit: '€/Monat' },
        fuel: { fixed: 400, unit: '€/Monat' },
        maintenance: { fixed: 150, unit: '€/Monat' },
      },
    },
    coachingFocus: {
      primaryBeliefs: ['Routeneffizienz ist zu komplex'],
      commonAnxieties: ['Fahrzeugpanne-Notfallplan'],
      challenges: ['Routeneffizienz', 'Kundenplanung'],
      primaryMethodologies: ['grow'],
      secondaryMethodologies: ['mi', 'cbc'],
    },
  },

  // -------------------------------------------------------------------------
  // 11. Restaurant
  // -------------------------------------------------------------------------
  restaurant: {
    id: 'restaurant',
    name: 'Restaurant',
    nameEn: 'Restaurant',
    description: 'Full-service restaurant with high fixed costs',
    category: 'gastro',
    targetMarket: 'b2c',
    pricingModels: ['menu'],
    capitalNeeds: 'very_high',
    capitalRange: { min: 80000, max: 250000 },
    locationRequirements: ['high_traffic'],
    questionVariations: [
      {
        moduleId: 'gz-finanzplanung',
        focusAreas: [
          'Hohe Fixkosten',
          'Wareneinsatz: 25-35%',
          'Personalintensiv',
          'Saisonalität',
        ],
      },
    ],
    validationRules: [
      {
        field: 'foodCostRatio',
        rule: 'range',
        minValue: 0.25,
        maxValue: 0.35,
        errorMessage: 'Wareneinsatz sollte 25-35% betragen',
      },
      {
        field: 'staffCostRatio',
        rule: 'range',
        minValue: 0.3,
        maxValue: 0.4,
        errorMessage: 'Personalkosten sollten 30-40% betragen',
      },
      {
        field: 'rentToRevenueRatio',
        rule: 'max',
        value: 0.1,
        errorMessage: 'Miete sollte unter 10% vom Umsatz liegen',
      },
    ],
    financialTemplate: {
      revenueModel: 'Gedecke × Durchschnittlicher Bon',
      typicalMetrics: {
        avgTicket: { min: 20, max: 50, unit: '€' },
        coversPerDay: { min: 40, max: 100, unit: 'Gedecke' },
      },
      costStructure: {
        foodCost: { percentage: 30, unit: '% vom Umsatz' },
        staff: { percentage: 35, unit: '% vom Umsatz' },
        rent: { fixed: 5000, unit: '€/Monat' },
      },
    },
    coachingFocus: {
      primaryBeliefs: ['Gastronomie ist zum Scheitern verurteilt'],
      commonAnxieties: ['Finanzielle Realität', 'Work-Life-Balance'],
      challenges: ['Finanzielle Nachhaltigkeit', 'Personalmanagement'],
      primaryMethodologies: ['cbc', 'mi'],
      secondaryMethodologies: ['grow'],
    },
    specialRequirements: [
      'Gaststättenerlaubnis',
      'Hygienekonzept (HACCP)',
      'Belehrung nach Infektionsschutzgesetz',
    ],
  },

  // -------------------------------------------------------------------------
  // 12. FoodTruck
  // -------------------------------------------------------------------------
  foodtruck: {
    id: 'foodtruck',
    name: 'FoodTruck',
    nameEn: 'Food Truck',
    description: 'Mobile food business with location permits',
    category: 'gastro',
    targetMarket: 'b2c',
    pricingModels: ['menu'],
    capitalNeeds: 'medium',
    capitalRange: { min: 30000, max: 80000 },
    locationRequirements: ['mobile'],
    questionVariations: [
      {
        moduleId: 'gz-unternehmen',
        focusAreas: [
          'Standgenehmigungen',
          'Eventkalender-Planung',
          'Routen-/Standortstrategie',
        ],
      },
    ],
    validationRules: [
      {
        field: 'permitCosts',
        rule: 'required',
        errorMessage: 'Genehmigungskosten müssen budgetiert sein',
      },
      {
        field: 'seasonalVariation',
        rule: 'required',
        errorMessage: 'Saisonale Umsatzschwankungen müssen berücksichtigt sein',
      },
    ],
    financialTemplate: {
      revenueModel: 'Tagesumsatz × Betriebstage',
      typicalMetrics: {
        dailyRevenue: { min: 400, max: 1200, unit: '€' },
        operatingDays: { min: 15, max: 25, unit: 'Tage/Monat' },
      },
      costStructure: {
        truck: { fixed: 750, unit: '€/Monat' },
        permits: { fixed: 300, unit: '€/Monat' },
        foodCost: { percentage: 30, unit: '% vom Umsatz' },
      },
    },
    coachingFocus: {
      primaryBeliefs: ['Wetterabhängigkeit ist unbeherrschbar'],
      commonAnxieties: ['Genehmigungs-Bürokratie', 'Standort-Konkurrenz'],
      challenges: ['Standortakquise', 'Wetterabhängigkeit'],
      primaryMethodologies: ['mi', 'grow'],
      secondaryMethodologies: ['cbc'],
    },
    specialRequirements: [
      'Reisegewerbekarte',
      'Standgenehmigungen',
      'HACCP-Konzept',
    ],
  },

  // -------------------------------------------------------------------------
  // 13. Catering
  // -------------------------------------------------------------------------
  catering: {
    id: 'catering',
    name: 'Catering',
    nameEn: 'Catering',
    description: 'Event-based food service with variable staffing',
    category: 'gastro',
    targetMarket: 'b2b_b2c',
    pricingModels: ['per_head', 'project'],
    capitalNeeds: 'medium',
    capitalRange: { min: 25000, max: 60000 },
    locationRequirements: ['kitchen', 'mobile'],
    questionVariations: [
      {
        moduleId: 'gz-marketing',
        focusAreas: [
          'B2B-Networking',
          'Eventplaner-Beziehungen',
          'Saisonale Spitzenplanung',
        ],
      },
    ],
    validationRules: [
      {
        field: 'kitchenArrangement',
        rule: 'required',
        errorMessage: 'Küchenlösung (Miete/Eigentum) muss geklärt sein',
      },
      {
        field: 'transportLogistics',
        rule: 'required',
        errorMessage: 'Transportlogistik muss geplant sein',
      },
    ],
    financialTemplate: {
      revenueModel: 'Events × Durchschnittlicher Eventwert',
      typicalMetrics: {
        avgEventValue: { min: 2000, max: 15000, unit: '€' },
        eventsPerMonth: { min: 4, max: 12, unit: 'Events' },
      },
      costStructure: {
        foodCost: { percentage: 35, unit: '% vom Umsatz' },
        staff: { percentage: 25, unit: '% vom Umsatz (variabel)' },
        kitchen: { fixed: 1000, unit: '€/Monat' },
        transport: { fixed: 500, unit: '€/Monat' },
      },
    },
    coachingFocus: {
      primaryBeliefs: ['Feast or Famine Cashflow ist unbeherrschbar'],
      commonAnxieties: ['Event-Abhängigkeit', 'Skalierungsmanagement'],
      challenges: ['Cashflow-Management', 'Personal-Skalierung'],
      primaryMethodologies: ['grow', 'mi'],
      secondaryMethodologies: ['cbc'],
    },
    specialRequirements: [
      'Gewerbeanmeldung',
      'HACCP-Konzept',
      'Betriebshaftpflicht',
    ],
  },

  // -------------------------------------------------------------------------
  // 14. SaaS (Software as a Service)
  // -------------------------------------------------------------------------
  saas: {
    id: 'saas',
    name: 'SaaS',
    nameEn: 'Software as a Service',
    description: 'Subscription-based software with MRR focus',
    category: 'digital',
    targetMarket: 'b2b',
    pricingModels: ['subscription'],
    capitalNeeds: 'medium_high',
    capitalRange: { min: 30000, max: 100000 },
    locationRequirements: ['remote'],
    questionVariations: [
      {
        moduleId: 'gz-geschaeftsmodell',
        focusAreas: [
          'MRR/ARR-Fokus',
          'Churn kritisch',
          'Feature-Roadmap',
        ],
      },
      {
        moduleId: 'gz-finanzplanung',
        focusAreas: [
          'Entwicklungskosten',
          'Server/Infrastruktur',
          'Lange Verkaufszyklen',
          'CAC vs LTV Verhältnis',
        ],
      },
    ],
    validationRules: [
      {
        field: 'monthlyChurnRate',
        rule: 'max',
        value: 0.05,
        errorMessage: 'Monatliche Churn-Rate über 5% ist kritisch',
      },
      {
        field: 'cacLtvRatio',
        rule: 'max',
        value: 0.33,
        errorMessage: 'CAC:LTV Verhältnis sollte unter 1:3 liegen',
      },
    ],
    financialTemplate: {
      revenueModel: 'Kunden × MRR',
      typicalMetrics: {
        mrrPerCustomer: { min: 50, max: 500, unit: '€' },
        churnRate: { min: 3, max: 5, unit: '%/Monat' },
        cac: { min: 200, max: 2000, unit: '€' },
      },
      costStructure: {
        development: { fixed: 100000, unit: '€ Anfangsinvestition' },
        infrastructure: { percentage: 10, unit: '% vom MRR' },
        marketing: { percentage: 30, unit: '% vom ARR' },
        support: { percentage: 15, unit: '% vom ARR' },
      },
    },
    coachingFocus: {
      primaryBeliefs: ['Build it and they will come'],
      commonAnxieties: ['Funding-Druck', 'Technische Schulden'],
      challenges: ['Tech vs. Business Balance', 'Go-to-Market'],
      primaryMethodologies: ['socratic', 'cbc'],
      secondaryMethodologies: ['mi'],
    },
  },

  // -------------------------------------------------------------------------
  // 15. IT-Dienstleistung (IT Services)
  // -------------------------------------------------------------------------
  'it-dienstleistung': {
    id: 'it-dienstleistung',
    name: 'IT-Dienstleistung',
    nameEn: 'IT Services',
    description: 'B2B IT consulting with project and retainer work',
    category: 'digital',
    targetMarket: 'b2b',
    pricingModels: ['project', 'retainer'],
    capitalNeeds: 'low',
    capitalRange: { min: 10000, max: 30000 },
    locationRequirements: ['remote', 'office'],
    questionVariations: [
      {
        moduleId: 'gz-geschaeftsmodell',
        focusAreas: [
          'Spezialisierung wichtig',
          'Projekt vs. Managed Services',
          'Technologie-Stack-Fokus',
        ],
      },
    ],
    validationRules: [
      {
        field: 'projectCapacity',
        rule: 'required',
        errorMessage: 'Realistische Projektkapazität muss definiert sein',
      },
      {
        field: 'skillRateAlignment',
        rule: 'required',
        errorMessage: 'Skills müssen zum Stundensatz passen',
      },
    ],
    financialTemplate: {
      revenueModel: 'Projekte + Retainer',
      typicalMetrics: {
        avgProject: { min: 10000, max: 100000, unit: '€' },
        retainer: { min: 2000, max: 10000, unit: '€/Monat' },
      },
      costStructure: {
        tools: { fixed: 300, unit: '€/Monat' },
        training: { percentage: 5, unit: '% vom Umsatz' },
        subcontractors: { percentage: 20, unit: '% vom Projektumsatz' },
      },
    },
    coachingFocus: {
      primaryBeliefs: ['Ich bin Techniker, kein Verkäufer'],
      commonAnxieties: ['Scope Creep', 'Kundenabhängigkeit'],
      challenges: ['Vertrieb', 'Scope-Management'],
      primaryMethodologies: ['mi', 'cbc'],
      secondaryMethodologies: ['grow'],
    },
  },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get business type definition by ID
 */
export function getBusinessTypeDefinition(
  id: DetailedBusinessTypeId
): BusinessTypeDefinition {
  return BUSINESS_TYPE_DEFINITIONS[id];
}

/**
 * Get all business types for a category
 */
export function getBusinessTypesByCategory(
  category: BusinessCategory
): BusinessTypeDefinition[] {
  return Object.values(BUSINESS_TYPE_DEFINITIONS).filter(
    (bt) => bt.category === category
  );
}

/**
 * Get all business type IDs
 */
export function getAllBusinessTypeIds(): DetailedBusinessTypeId[] {
  return Object.keys(BUSINESS_TYPE_DEFINITIONS) as DetailedBusinessTypeId[];
}

/**
 * Check if a business type requires Meisterpflicht
 */
export function requiresMeisterpflicht(id: DetailedBusinessTypeId): boolean {
  return id === 'handwerk';
}

/**
 * Check if a business type is a Freiberufler type
 */
export function isFreiberuflerType(id: DetailedBusinessTypeId): boolean {
  return id === 'freiberufler';
}

/**
 * Get coaching methodologies for a business type
 */
export function getCoachingMethodologies(
  id: DetailedBusinessTypeId
): CoachingMethodology[] {
  const definition = BUSINESS_TYPE_DEFINITIONS[id];
  return [
    ...definition.coachingFocus.primaryMethodologies,
    ...definition.coachingFocus.secondaryMethodologies,
  ];
}
