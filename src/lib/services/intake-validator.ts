/**
 * Intake Validator Service
 *
 * Provides real-time validation for the intake module data.
 * Used by the preview panel to show validation status as data streams in.
 */

import { validateIntakeData, formatValidationResult } from '@/types/modules/validation';
import type { IntakeValidation } from '@/types/modules/validation';
import type { PartialIntakeOutput, IntakePhase } from '@/types/modules/intake';

// ============================================================================
// Validation Result Interface
// ============================================================================

export interface ValidationResult {
  validation: IntakeValidation;
  formatted: string;
  canProceed: boolean;
  nextPhase: IntakePhase | null;
  completedPhases: IntakePhase[];
}

// ============================================================================
// Phase Completion Checkers
// ============================================================================

const PHASE_REQUIREMENTS: Record<IntakePhase, (data: PartialIntakeOutput) => boolean> = {
  warmup: () => true, // Always complete (no data required)

  founder_profile: (data) =>
    Boolean(
      data.founder?.currentStatus &&
      data.founder?.algStatus?.daysRemaining !== undefined
    ),

  personality: (data) =>
    Boolean(
      data.personality?.narrative ||
      data.personality?.innovativeness
    ),

  profile_gen: (data) =>
    Boolean(
      data.founder?.experience?.yearsInIndustry !== undefined &&
      data.founder?.qualifications?.education
    ),

  resources: (data) =>
    Boolean(
      data.resources?.financial?.availableCapital !== undefined ||
      data.resources?.time?.plannedStartDate
    ),

  business_type: (data) =>
    Boolean(data.businessType?.category),

  validation: (data) =>
    Boolean(data.validation?.isGZEligible !== undefined),

  completed: (data) =>
    Boolean(
      data.founder?.currentStatus &&
      data.businessIdea?.elevator_pitch &&
      data.personality?.narrative &&
      data.businessType?.category &&
      data.resources?.financial &&
      data.validation?.isGZEligible !== undefined
    ),
};

const PHASE_ORDER: IntakePhase[] = [
  'warmup',
  'founder_profile',
  'personality',
  'profile_gen',
  'resources',
  'business_type',
  'validation',
  'completed',
];

// ============================================================================
// Validator Functions
// ============================================================================

/**
 * Validate intake data and return comprehensive result
 */
export function validateIntake(data: PartialIntakeOutput | null): ValidationResult {
  if (!data) {
    return {
      validation: createEmptyValidation(),
      formatted: '',
      canProceed: false,
      nextPhase: 'warmup',
      completedPhases: [],
    };
  }

  const validation = validateIntakeData(data);
  const formatted = formatValidationResult(validation);
  const completedPhases = getCompletedPhases(data);
  const nextPhase = getNextPhase(completedPhases);
  const canProceed = validation.overallStatus !== 'failed';

  return {
    validation,
    formatted,
    canProceed,
    nextPhase,
    completedPhases,
  };
}

/**
 * Get list of completed phases
 */
export function getCompletedPhases(data: PartialIntakeOutput): IntakePhase[] {
  return PHASE_ORDER.filter((phase) => PHASE_REQUIREMENTS[phase](data));
}

/**
 * Get the next incomplete phase
 */
export function getNextPhase(completedPhases: IntakePhase[]): IntakePhase | null {
  const completedSet = new Set(completedPhases);
  for (const phase of PHASE_ORDER) {
    if (!completedSet.has(phase)) {
      return phase;
    }
  }
  return null;
}

/**
 * Calculate completion percentage
 */
export function calculateCompletionPercentage(data: PartialIntakeOutput | null): number {
  if (!data) return 0;

  const sections = [
    Boolean(data.founder?.currentStatus),
    Boolean(data.businessIdea?.elevator_pitch),
    Boolean(data.personality?.narrative),
    Boolean(data.businessType?.category),
    Boolean(data.resources?.financial),
    Boolean(data.validation?.isGZEligible !== undefined),
  ];

  const completed = sections.filter(Boolean).length;
  return Math.round((completed / sections.length) * 100);
}

/**
 * Check if GZ eligibility is confirmed
 */
export function checkGZEligibility(algDays: number): {
  isEligible: boolean;
  message: string;
  urgency: 'none' | 'low' | 'medium' | 'high';
} {
  if (algDays >= 150) {
    if (algDays >= 300) {
      return {
        isEligible: true,
        message: `Mit ${algDays} Tagen ALG-Restanspruch haben Sie eine komfortable Zeitreserve.`,
        urgency: 'none',
      };
    }
    if (algDays >= 200) {
      return {
        isEligible: true,
        message: `Mit ${algDays} Tagen ALG-Restanspruch sind Sie berechtigt. Planen Sie zeitnah.`,
        urgency: 'low',
      };
    }
    return {
      isEligible: true,
      message: `Mit ${algDays} Tagen ALG-Restanspruch sind Sie berechtigt. Beginnen Sie bald mit dem Antrag.`,
      urgency: 'medium',
    };
  }

  return {
    isEligible: false,
    message: `Mit ${algDays} Tagen ALG-Restanspruch sind Sie leider nicht GZ-berechtigt (mind. 150 Tage erforderlich).`,
    urgency: 'high',
  };
}

/**
 * Create empty validation result
 */
function createEmptyValidation(): IntakeValidation {
  return {
    algDaysRemaining: 0,
    isGZEligible: false,
    founderProfileComplete: false,
    businessIdeaComplete: false,
    personalityAssessed: false,
    businessTypeClassified: false,
    resourcesDocumented: false,
    majorConcerns: [],
    minorConcerns: [],
    strengths: [],
    overallStatus: 'warning',
    blockingError: undefined,
  };
}

/**
 * Get validation summary for display
 */
export function getValidationSummary(result: ValidationResult): {
  status: 'success' | 'warning' | 'error';
  title: string;
  description: string;
} {
  const { validation, canProceed, completedPhases } = result;
  const progress = Math.round((completedPhases.length / PHASE_ORDER.length) * 100);

  if (validation.overallStatus === 'failed') {
    return {
      status: 'error',
      title: 'GZ-Berechtigung fehlt',
      description: validation.blockingError || 'Die GZ-Voraussetzungen sind nicht erfüllt.',
    };
  }

  if (validation.overallStatus === 'warning') {
    return {
      status: 'warning',
      title: `Intake ${progress}% abgeschlossen`,
      description: `${validation.majorConcerns.length} kritische Punkte zu beachten.`,
    };
  }

  if (completedPhases.includes('completed')) {
    return {
      status: 'success',
      title: 'Intake abgeschlossen',
      description: 'Alle erforderlichen Informationen erfasst. Bereit für das nächste Modul.',
    };
  }

  return {
    status: 'success',
    title: `Intake ${progress}% abgeschlossen`,
    description: canProceed
      ? 'Fortschritt ist gut. Weiter so!'
      : 'Bitte vervollständigen Sie die fehlenden Informationen.',
  };
}
