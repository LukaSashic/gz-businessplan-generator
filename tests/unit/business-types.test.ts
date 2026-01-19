/**
 * Unit Tests for Business Types Module
 *
 * Tests business type definitions, branching logic, and helper functions
 */

import { describe, it, expect } from 'vitest';
import {
  // Definitions
  BUSINESS_TYPE_DEFINITIONS,
  DetailedBusinessTypeId,
  getBusinessTypeDefinition,
  getBusinessTypesByCategory,
  getAllBusinessTypeIds,
  requiresMeisterpflicht,
  isFreiberuflerType,
  getCoachingMethodologies,

  // Branching
  determineBusinessType,
  getQuestionsForType,
  getFocusAreasForType,
  getValidationRulesForType,
  getFinancialTemplateForType,
  type IntakeAnswers,
} from '@/lib/business-types';

// ============================================================================
// Business Type Definitions Tests
// ============================================================================

describe('Business Type Definitions', () => {
  const ALL_BUSINESS_TYPE_IDS: DetailedBusinessTypeId[] = [
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
  ];

  it('should have exactly 15 business types defined', () => {
    const definedTypes = Object.keys(BUSINESS_TYPE_DEFINITIONS);
    expect(definedTypes).toHaveLength(15);
  });

  it('should have all expected business type IDs', () => {
    const definedIds = Object.keys(BUSINESS_TYPE_DEFINITIONS) as DetailedBusinessTypeId[];
    expect(definedIds.sort()).toEqual(ALL_BUSINESS_TYPE_IDS.sort());
  });

  describe.each(ALL_BUSINESS_TYPE_IDS)('Business type: %s', (typeId) => {
    const definition = BUSINESS_TYPE_DEFINITIONS[typeId];

    it('should have required id field matching key', () => {
      expect(definition.id).toBe(typeId);
    });

    it('should have required name field', () => {
      expect(definition.name).toBeDefined();
      expect(definition.name.length).toBeGreaterThan(0);
    });

    it('should have required nameEn field', () => {
      expect(definition.nameEn).toBeDefined();
      expect(definition.nameEn.length).toBeGreaterThan(0);
    });

    it('should have required description field', () => {
      expect(definition.description).toBeDefined();
      expect(definition.description.length).toBeGreaterThan(0);
    });

    it('should have valid category', () => {
      expect(['service', 'product', 'gastro', 'digital']).toContain(definition.category);
    });

    it('should have valid target market', () => {
      expect(['b2b', 'b2c', 'b2b_b2c']).toContain(definition.targetMarket);
    });

    it('should have at least one pricing model', () => {
      expect(definition.pricingModels.length).toBeGreaterThan(0);
    });

    it('should have valid capital needs level', () => {
      expect(['very_low', 'low', 'medium', 'medium_high', 'high', 'very_high']).toContain(
        definition.capitalNeeds
      );
    });

    it('should have valid capital range with min <= max', () => {
      expect(definition.capitalRange.min).toBeLessThanOrEqual(definition.capitalRange.max);
      expect(definition.capitalRange.min).toBeGreaterThanOrEqual(0);
    });

    it('should have at least one location requirement', () => {
      expect(definition.locationRequirements.length).toBeGreaterThan(0);
    });

    it('should have financial template with revenue model', () => {
      expect(definition.financialTemplate).toBeDefined();
      expect(definition.financialTemplate.revenueModel).toBeDefined();
      expect(definition.financialTemplate.revenueModel.length).toBeGreaterThan(0);
    });

    it('should have coaching focus with methodologies', () => {
      expect(definition.coachingFocus).toBeDefined();
      expect(definition.coachingFocus.primaryMethodologies.length).toBeGreaterThan(0);
    });
  });
});

// ============================================================================
// Helper Functions Tests
// ============================================================================

describe('Helper Functions', () => {
  describe('getBusinessTypeDefinition', () => {
    it('should return correct definition for beratung', () => {
      const def = getBusinessTypeDefinition('beratung');
      expect(def.id).toBe('beratung');
      expect(def.name).toBe('Beratung');
      expect(def.category).toBe('service');
    });

    it('should return correct definition for restaurant', () => {
      const def = getBusinessTypeDefinition('restaurant');
      expect(def.id).toBe('restaurant');
      expect(def.category).toBe('gastro');
    });
  });

  describe('getBusinessTypesByCategory', () => {
    it('should return all service types', () => {
      const serviceTypes = getBusinessTypesByCategory('service');
      expect(serviceTypes.length).toBeGreaterThan(0);
      serviceTypes.forEach((type) => {
        expect(type.category).toBe('service');
      });
    });

    it('should return all gastro types', () => {
      const gastroTypes = getBusinessTypesByCategory('gastro');
      expect(gastroTypes).toHaveLength(3); // restaurant, foodtruck, catering
      gastroTypes.forEach((type) => {
        expect(type.category).toBe('gastro');
      });
    });

    it('should return all digital types', () => {
      const digitalTypes = getBusinessTypesByCategory('digital');
      expect(digitalTypes).toHaveLength(2); // saas, it-dienstleistung
    });

    it('should return all product types', () => {
      const productTypes = getBusinessTypesByCategory('product');
      expect(productTypes).toHaveLength(3); // e-commerce, einzelhandel, hybrid-handel
    });
  });

  describe('getAllBusinessTypeIds', () => {
    it('should return all 15 business type IDs', () => {
      const ids = getAllBusinessTypeIds();
      expect(ids).toHaveLength(15);
    });
  });

  describe('requiresMeisterpflicht', () => {
    it('should return true for handwerk', () => {
      expect(requiresMeisterpflicht('handwerk')).toBe(true);
    });

    it('should return false for other types', () => {
      expect(requiresMeisterpflicht('beratung')).toBe(false);
      expect(requiresMeisterpflicht('restaurant')).toBe(false);
      expect(requiresMeisterpflicht('saas')).toBe(false);
    });
  });

  describe('isFreiberuflerType', () => {
    it('should return true for freiberufler', () => {
      expect(isFreiberuflerType('freiberufler')).toBe(true);
    });

    it('should return false for other types', () => {
      expect(isFreiberuflerType('beratung')).toBe(false);
      expect(isFreiberuflerType('handwerk')).toBe(false);
    });
  });

  describe('getCoachingMethodologies', () => {
    it('should return methodologies for beratung', () => {
      const methodologies = getCoachingMethodologies('beratung');
      expect(methodologies).toContain('cbc');
      expect(methodologies).toContain('mi');
    });

    it('should return methodologies for saas', () => {
      const methodologies = getCoachingMethodologies('saas');
      expect(methodologies).toContain('socratic');
      expect(methodologies).toContain('cbc');
    });
  });
});

// ============================================================================
// Business Type Determination Tests
// ============================================================================

describe('Business Type Determination', () => {
  describe('determineBusinessType', () => {
    it('should return freiberufler when isFreiberufler is true', () => {
      const answers: IntakeAnswers = { isFreiberufler: true };
      expect(determineBusinessType(answers)).toBe('freiberufler');
    });

    it('should return handwerk when requiresMeister is true', () => {
      const answers: IntakeAnswers = { requiresMeister: true };
      expect(determineBusinessType(answers)).toBe('handwerk');
    });

    it('should return foodtruck for mobile food business', () => {
      const answers: IntakeAnswers = { isFood: true, isMobile: true };
      expect(determineBusinessType(answers)).toBe('foodtruck');
    });

    it('should return catering for event food business', () => {
      const answers: IntakeAnswers = { isFood: true, isEvent: true };
      expect(determineBusinessType(answers)).toBe('catering');
    });

    it('should return restaurant for non-mobile food business', () => {
      const answers: IntakeAnswers = { isFood: true };
      expect(determineBusinessType(answers)).toBe('restaurant');
    });

    it('should return hybrid-handel for omnichannel retail', () => {
      const answers: IntakeAnswers = {
        sellsProducts: true,
        hasPhysicalStore: true,
        hasOnlineStore: true,
      };
      expect(determineBusinessType(answers)).toBe('hybrid-handel');
    });

    it('should return einzelhandel for physical-only retail', () => {
      const answers: IntakeAnswers = {
        sellsProducts: true,
        hasPhysicalStore: true,
        hasOnlineStore: false,
      };
      expect(determineBusinessType(answers)).toBe('einzelhandel');
    });

    it('should return e-commerce for online-only retail', () => {
      const answers: IntakeAnswers = {
        sellsProducts: true,
        hasPhysicalStore: false,
        hasOnlineStore: true,
      };
      expect(determineBusinessType(answers)).toBe('e-commerce');
    });

    it('should return saas for digital subscription business', () => {
      const answers: IntakeAnswers = { isDigital: true, isSubscription: true };
      expect(determineBusinessType(answers)).toBe('saas');
    });

    it('should return it-dienstleistung for digital non-subscription', () => {
      const answers: IntakeAnswers = { isDigital: true, isSubscription: false };
      expect(determineBusinessType(answers)).toBe('it-dienstleistung');
    });

    it('should return gesundheit for healthcare business', () => {
      const answers: IntakeAnswers = { isHealthcare: true };
      expect(determineBusinessType(answers)).toBe('gesundheit');
    });

    it('should return mobile-dienste for mobile service', () => {
      const answers: IntakeAnswers = { isMobileService: true };
      expect(determineBusinessType(answers)).toBe('mobile-dienste');
    });

    it('should return agentur for team-based business', () => {
      const answers: IntakeAnswers = { hasTeam: true, teamSize: 3 };
      expect(determineBusinessType(answers)).toBe('agentur');
    });

    it('should return beratung as default', () => {
      const answers: IntakeAnswers = {};
      expect(determineBusinessType(answers)).toBe('beratung');
    });

    it('should prioritize freiberufler over other types', () => {
      const answers: IntakeAnswers = {
        isFreiberufler: true,
        isFood: true, // Would normally be restaurant
      };
      expect(determineBusinessType(answers)).toBe('freiberufler');
    });

    it('should prioritize handwerk over service types', () => {
      const answers: IntakeAnswers = {
        requiresMeister: true,
        hasTeam: true,
        teamSize: 3, // Would normally be agentur
      };
      expect(determineBusinessType(answers)).toBe('handwerk');
    });
  });
});

// ============================================================================
// Question Branching Tests
// ============================================================================

describe('Question Branching', () => {
  describe('getQuestionsForType', () => {
    it('should return base questions for intake module', () => {
      const questions = getQuestionsForType('gz-intake', 'beratung');
      expect(questions.length).toBeGreaterThan(0);
      expect(questions.some((q) => q.id === 'business-idea')).toBe(true);
    });

    it('should return additional questions for freiberufler intake', () => {
      const questions = getQuestionsForType('gz-intake', 'freiberufler');
      expect(questions.some((q) => q.id === 'freiberufler-status')).toBe(true);
      expect(questions.some((q) => q.id === 'ksk-eligible')).toBe(true);
    });

    it('should return additional questions for handwerk unternehmen', () => {
      const questions = getQuestionsForType('gz-unternehmen', 'handwerk');
      expect(questions.some((q) => q.id === 'meisterpflicht')).toBe(true);
      expect(questions.some((q) => q.id === 'hwk-registration')).toBe(true);
    });

    it('should return additional questions for e-commerce geschaeftsmodell', () => {
      const questions = getQuestionsForType('gz-geschaeftsmodell', 'e-commerce');
      expect(questions.some((q) => q.id === 'sourcing-strategy')).toBe(true);
      expect(questions.some((q) => q.id === 'platform-choice')).toBe(true);
    });

    it('should return additional questions for saas geschaeftsmodell', () => {
      const questions = getQuestionsForType('gz-geschaeftsmodell', 'saas');
      expect(questions.some((q) => q.id === 'mrr-target')).toBe(true);
      expect(questions.some((q) => q.id === 'churn-estimate')).toBe(true);
    });
  });

  describe('getFocusAreasForType', () => {
    it('should return focus areas for beratung geschaeftsmodell', () => {
      const focusAreas = getFocusAreasForType('gz-geschaeftsmodell', 'beratung');
      expect(focusAreas.length).toBeGreaterThan(0);
      expect(focusAreas.some((f) => f.includes('Spezialisierung'))).toBe(true);
    });

    it('should return empty array for modules without variations', () => {
      // SWOT typically has no type-specific variations
      const focusAreas = getFocusAreasForType('gz-swot', 'beratung');
      expect(focusAreas).toEqual([]);
    });
  });

  describe('getValidationRulesForType', () => {
    it('should return validation rules for beratung', () => {
      const rules = getValidationRulesForType('beratung');
      expect(rules.length).toBeGreaterThan(0);
      expect(rules.some((r) => r.field === 'utilizationRate')).toBe(true);
    });

    it('should return validation rules for restaurant', () => {
      const rules = getValidationRulesForType('restaurant');
      expect(rules.some((r) => r.field === 'foodCostRatio')).toBe(true);
      expect(rules.some((r) => r.field === 'staffCostRatio')).toBe(true);
    });
  });

  describe('getFinancialTemplateForType', () => {
    it('should return financial template for beratung', () => {
      const template = getFinancialTemplateForType('beratung');
      expect(template.revenueModel).toContain('Tagessatz');
      expect(template.typicalMetrics.dailyRate).toBeDefined();
    });

    it('should return financial template for saas', () => {
      const template = getFinancialTemplateForType('saas');
      expect(template.revenueModel).toContain('MRR');
      expect(template.typicalMetrics.mrrPerCustomer).toBeDefined();
    });
  });
});

// ============================================================================
// Validation Rules Tests
// ============================================================================

describe('Validation Rules', () => {
  it('all validation rules should have required fields', () => {
    const allTypes = getAllBusinessTypeIds();

    allTypes.forEach((typeId) => {
      const rules = getValidationRulesForType(typeId);

      rules.forEach((rule) => {
        expect(rule.field).toBeDefined();
        expect(rule.field.length).toBeGreaterThan(0);
        expect(rule.rule).toBeDefined();
        expect(['min', 'max', 'range', 'percentage', 'required', 'conditional']).toContain(
          rule.rule
        );
        expect(rule.errorMessage).toBeDefined();
        expect(rule.errorMessage.length).toBeGreaterThan(0);
      });
    });
  });

  it('range rules should have both min and max values', () => {
    const allTypes = getAllBusinessTypeIds();

    allTypes.forEach((typeId) => {
      const rules = getValidationRulesForType(typeId);

      rules
        .filter((r) => r.rule === 'range')
        .forEach((rule) => {
          expect(rule.minValue).toBeDefined();
          expect(rule.maxValue).toBeDefined();
          expect(rule.minValue).toBeLessThanOrEqual(rule.maxValue!);
        });
    });
  });
});

// ============================================================================
// Financial Templates Tests
// ============================================================================

describe('Financial Templates', () => {
  it('all business types should have valid financial templates', () => {
    const allTypes = getAllBusinessTypeIds();

    allTypes.forEach((typeId) => {
      const template = getFinancialTemplateForType(typeId);

      expect(template.revenueModel).toBeDefined();
      expect(template.revenueModel.length).toBeGreaterThan(0);
      expect(template.typicalMetrics).toBeDefined();
      expect(template.costStructure).toBeDefined();
    });
  });

  it('typical metrics should have min <= max', () => {
    const allTypes = getAllBusinessTypeIds();

    allTypes.forEach((typeId) => {
      const template = getFinancialTemplateForType(typeId);

      Object.entries(template.typicalMetrics).forEach(([_metricName, metric]) => {
        expect(metric.min).toBeLessThanOrEqual(metric.max);
        expect(metric.unit).toBeDefined();
        expect(metric.unit.length).toBeGreaterThan(0);
      });
    });
  });
});
