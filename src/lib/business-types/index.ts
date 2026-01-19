/**
 * Business Types Module
 *
 * Exports all business type definitions, branching logic, and helper functions
 */

// ============================================================================
// Definitions
// ============================================================================

export {
  // Zod schemas
  DetailedBusinessTypeId,
  BusinessCategory,
  TargetMarket,
  PricingModel,
  CapitalNeedsLevel,
  LocationRequirement,
  CoachingMethodology,

  // Types
  type BusinessTypeDefinition,
  type ModuleQuestionVariation,
  type ValidationRule,
  type FinancialTemplate,
  type CoachingFocus,

  // Data
  BUSINESS_TYPE_DEFINITIONS,

  // Helper functions
  getBusinessTypeDefinition,
  getBusinessTypesByCategory,
  getAllBusinessTypeIds,
  requiresMeisterpflicht,
  isFreiberuflerType,
  getCoachingMethodologies,
} from './definitions';

// ============================================================================
// Branching Logic
// ============================================================================

export {
  // Zod schemas
  IntakeAnswersSchema,

  // Types
  type IntakeAnswers,
  type ModuleQuestion,

  // Functions
  determineBusinessType,
  getQuestionsForType,
  getFocusAreasForType,
  getValidationRulesForType,
  getFinancialTemplateForType,
} from './branching';
