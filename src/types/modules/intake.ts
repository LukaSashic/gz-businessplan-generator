/**
 * Module 01: Intake & Founder Assessment Types
 *
 * Based on gz-module-01-intake.md IntakeOutput schema
 */

import { z } from 'zod';

// ============================================================================
// Enums and Constants
// ============================================================================

export const CurrentStatus = z.enum(['employed', 'unemployed', 'other']);
export type CurrentStatus = z.infer<typeof CurrentStatus>;

export const PersonalityLevel = z.enum(['high', 'medium', 'low']);
export type PersonalityLevel = z.infer<typeof PersonalityLevel>;

export const BusinessCategory = z.enum([
  'consulting',
  'ecommerce',
  'local_service',
  'local_retail',
  'manufacturing',
  'hybrid',
]);
export type BusinessCategory = z.infer<typeof BusinessCategory>;

// ============================================================================
// Sub-Schemas
// ============================================================================

export const AlgStatusSchema = z.object({
  monthlyAmount: z.number().min(0).max(10000), // €1,200-3,000 typical range
  daysRemaining: z.number().min(0).max(730), // Must be ≥150 for GZ eligibility
});
export type AlgStatus = z.infer<typeof AlgStatusSchema>;

export const ExperienceSchema = z.object({
  yearsInIndustry: z.number().min(0).max(50),
  relevantRoles: z.array(z.string()),
  previousFounder: z.boolean(),
  previousFoundingExperience: z.string().optional(),
});
export type Experience = z.infer<typeof ExperienceSchema>;

export const QualificationsSchema = z.object({
  education: z.string(),
  certifications: z.array(z.string()),
  specialSkills: z.array(z.string()),
});
export type Qualifications = z.infer<typeof QualificationsSchema>;

export const MotivationSchema = z.object({
  push: z.array(z.string()), // e.g., "Arbeitslosigkeit", "Unzufriedenheit"
  pull: z.array(z.string()), // e.g., "Unabhängigkeit", "Idee verwirklichen"
});
export type Motivation = z.infer<typeof MotivationSchema>;

export const FounderSchema = z.object({
  name: z.string().optional(), // Used only in UI, NEVER sent to Claude (DSGVO)
  currentStatus: CurrentStatus,
  algStatus: AlgStatusSchema.optional(),
  experience: ExperienceSchema,
  qualifications: QualificationsSchema,
  motivation: MotivationSchema,
});
export type Founder = z.infer<typeof FounderSchema>;

export const BusinessIdeaSchema = z.object({
  elevator_pitch: z.string(), // 2-3 sentences
  problem: z.string(),
  solution: z.string(),
  targetAudience: z.string(),
  uniqueValue: z.string(), // Why this founder, why now
});
export type BusinessIdea = z.infer<typeof BusinessIdeaSchema>;

export const PersonalitySchema = z.object({
  // Howard's 7 entrepreneurial personality dimensions
  innovativeness: PersonalityLevel,
  riskTaking: PersonalityLevel,
  achievement: PersonalityLevel,
  proactiveness: PersonalityLevel,
  locusOfControl: PersonalityLevel,
  selfEfficacy: PersonalityLevel,
  autonomy: PersonalityLevel,
  narrative: z.string(), // User-facing profile summary
  redFlags: z.array(z.string()).optional(), // Potential issues for later modules
});
export type Personality = z.infer<typeof PersonalitySchema>;

export const BusinessTypeSchema = z.object({
  category: BusinessCategory,
  isLocationDependent: z.boolean(),
  requiresPhysicalInventory: z.boolean(),
  isDigitalFirst: z.boolean(),
  reasoning: z.string(), // Why classified this way
});
export type BusinessType = z.infer<typeof BusinessTypeSchema>;

export const FinancialResourcesSchema = z.object({
  availableCapital: z.number().min(0),
  expectedGZ: z.number().min(0), // ALG I amount × 6 + (300 × 6)
  otherIncome: z.number().optional(),
  monthlyObligations: z.number().min(0), // Miete, Familie, etc.
});
export type FinancialResources = z.infer<typeof FinancialResourcesSchema>;

export const TimeResourcesSchema = z.object({
  plannedStartDate: z.string(), // ISO date
  hoursPerWeek: z.number().min(0).max(168),
  isFullTime: z.boolean(),
});
export type TimeResources = z.infer<typeof TimeResourcesSchema>;

export const NetworkResourcesSchema = z.object({
  industryContacts: z.number().min(0).max(10), // 0-10 scale
  potentialFirstCustomers: z.array(z.string()),
  supporters: z.array(z.string()), // Familie, Partner, Mentoren
});
export type NetworkResources = z.infer<typeof NetworkResourcesSchema>;

export const InfrastructureResourcesSchema = z.object({
  hasWorkspace: z.boolean(),
  hasEquipment: z.boolean(),
  hasLegalClarity: z.boolean(),
});
export type InfrastructureResources = z.infer<typeof InfrastructureResourcesSchema>;

export const ResourcesSchema = z.object({
  financial: FinancialResourcesSchema,
  time: TimeResourcesSchema,
  network: NetworkResourcesSchema,
  infrastructure: InfrastructureResourcesSchema,
});
export type Resources = z.infer<typeof ResourcesSchema>;

export const ValidationSchema = z.object({
  isGZEligible: z.boolean(), // ALG days ≥ 150
  majorConcerns: z.array(z.string()), // Red flags that need addressing
  minorConcerns: z.array(z.string()), // Yellow flags to monitor
  strengths: z.array(z.string()), // What's going well
});
export type Validation = z.infer<typeof ValidationSchema>;

export const MetadataSchema = z.object({
  completedAt: z.string().optional(), // ISO timestamp
  duration: z.number().optional(), // Minutes spent
  conversationTurns: z.number().optional(),
});
export type Metadata = z.infer<typeof MetadataSchema>;

// ============================================================================
// Main IntakeOutput Schema
// ============================================================================

export const IntakeOutputSchema = z.object({
  founder: FounderSchema,
  businessIdea: BusinessIdeaSchema,
  personality: PersonalitySchema,
  businessType: BusinessTypeSchema,
  resources: ResourcesSchema,
  validation: ValidationSchema,
  metadata: MetadataSchema,
});

export type IntakeOutput = z.infer<typeof IntakeOutputSchema>;

// ============================================================================
// Partial Schema (for progressive updates during conversation)
// ============================================================================

export const PartialIntakeOutputSchema = z.object({
  founder: FounderSchema.partial().optional(),
  businessIdea: BusinessIdeaSchema.partial().optional(),
  personality: PersonalitySchema.partial().optional(),
  businessType: BusinessTypeSchema.partial().optional(),
  resources: ResourcesSchema.deepPartial().optional(),
  validation: ValidationSchema.partial().optional(),
  metadata: MetadataSchema.partial().optional(),
});

export type PartialIntakeOutput = z.infer<typeof PartialIntakeOutputSchema>;

// ============================================================================
// Conversation Phase Tracking
// ============================================================================

export const IntakePhase = z.enum([
  'warmup',           // Phase 1: Business idea high-level (5 min)
  'founder_profile',  // Phase 2: Experience, qualifications, motivation (10 min)
  'personality',      // Phase 3: Howard's 7 dimensions (20 min)
  'profile_gen',      // Phase 4: Synthesize findings (5 min)
  'resources',        // Phase 5: Financial, time, network (5 min)
  'business_type',    // Phase 6: Category determination (3 min)
  'validation',       // Phase 7: Eligibility check, concerns, strengths (2 min)
  'completed',        // Module complete
]);

export type IntakePhase = z.infer<typeof IntakePhase>;

export const IntakePhaseInfo: Record<IntakePhase, { label: string; duration: number }> = {
  warmup: { label: 'Warm-Up', duration: 5 },
  founder_profile: { label: 'Gründerprofil', duration: 10 },
  personality: { label: 'Unternehmerische Persönlichkeit', duration: 20 },
  profile_gen: { label: 'Profil-Erstellung', duration: 5 },
  resources: { label: 'Ressourcen', duration: 5 },
  business_type: { label: 'Geschäftstyp', duration: 3 },
  validation: { label: 'Validierung', duration: 2 },
  completed: { label: 'Abgeschlossen', duration: 0 },
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create an empty partial intake output for initialization
 */
export function createEmptyIntakeOutput(): PartialIntakeOutput {
  return {};
}

/**
 * Merge partial updates into existing intake data
 */
export function mergeIntakeData(
  existing: PartialIntakeOutput,
  update: PartialIntakeOutput
): PartialIntakeOutput {
  return {
    founder: { ...existing.founder, ...update.founder },
    businessIdea: { ...existing.businessIdea, ...update.businessIdea },
    personality: { ...existing.personality, ...update.personality },
    businessType: { ...existing.businessType, ...update.businessType },
    resources: {
      financial: { ...existing.resources?.financial, ...update.resources?.financial },
      time: { ...existing.resources?.time, ...update.resources?.time },
      network: { ...existing.resources?.network, ...update.resources?.network },
      infrastructure: { ...existing.resources?.infrastructure, ...update.resources?.infrastructure },
    },
    validation: { ...existing.validation, ...update.validation },
    metadata: { ...existing.metadata, ...update.metadata },
  };
}

/**
 * Check if intake data is complete enough to proceed to next module
 */
export function isIntakeComplete(data: PartialIntakeOutput): boolean {
  // Check required fields
  const hasFounder = Boolean(data.founder?.currentStatus && data.founder?.experience);
  const hasBusinessIdea = Boolean(data.businessIdea?.elevator_pitch && data.businessIdea?.problem);
  const hasPersonality = Boolean(data.personality?.narrative);
  const hasBusinessType = Boolean(data.businessType?.category);
  const hasValidation = typeof data.validation?.isGZEligible === 'boolean';

  return hasFounder && hasBusinessIdea && hasPersonality && hasBusinessType && hasValidation;
}

/**
 * Calculate GZ expected amount based on ALG status
 * Formula: ALG I monthly × 6 + (300 × 6)
 */
export function calculateExpectedGZ(algMonthlyAmount: number): number {
  const phase1 = algMonthlyAmount * 6; // Full ALG for 6 months
  const phase2 = 300 * 6; // €300 social security contribution for 6 months
  return phase1 + phase2;
}

/**
 * Check GZ eligibility based on ALG days remaining
 */
export function checkGZEligibility(algDaysRemaining: number): {
  isEligible: boolean;
  message: string;
} {
  if (algDaysRemaining >= 150) {
    return {
      isEligible: true,
      message: `Mit ${algDaysRemaining} Tagen ALG-Restanspruch bist du für den Gründungszuschuss berechtigt.`,
    };
  }

  return {
    isEligible: false,
    message: `Für den Gründungszuschuss brauchst du mindestens 150 Tage ALG I-Restanspruch. Du hast aktuell ${algDaysRemaining} Tage.`,
  };
}

// ============================================================================
// Phase Validators
// ============================================================================

/**
 * Validation result for a phase
 */
export interface PhaseValidationResult {
  isComplete: boolean;
  missingFields: string[];
  completedFields: string[];
}

/**
 * Required fields for each phase
 */
export const INTAKE_PHASE_REQUIRED_FIELDS: Record<IntakePhase, string[]> = {
  warmup: [
    'businessIdea.elevator_pitch',
    'businessIdea.problem',
    'businessIdea.solution',
    'businessIdea.targetAudience',
  ],
  founder_profile: [
    'founder.currentStatus',
    'founder.experience.yearsInIndustry',
    'founder.qualifications.education',
    'founder.motivation',
  ],
  personality: [
    'personality.innovativeness',
    'personality.riskTaking',
    'personality.achievement',
    'personality.proactiveness',
    'personality.locusOfControl',
    'personality.selfEfficacy',
    'personality.autonomy',
  ],
  profile_gen: [
    'personality.narrative',
  ],
  resources: [
    'resources.financial.availableCapital',
    'resources.time.hoursPerWeek',
    'resources.time.isFullTime',
    'resources.network.industryContacts',
  ],
  business_type: [
    'businessType.category',
    'businessType.isDigitalFirst',
    'businessType.isLocationDependent',
  ],
  validation: [
    'validation.isGZEligible',
    'validation.strengths',
  ],
  completed: [], // No additional requirements
};

/**
 * Get a nested value from an object using dot notation
 */
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }

  return current;
}

/**
 * Check if a value is considered "present" (not null, undefined, or empty)
 */
function isValuePresent(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string' && value.trim() === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;
  return true;
}

/**
 * Validate a specific intake phase
 */
export function validateIntakePhase(
  phase: IntakePhase,
  data: PartialIntakeOutput
): PhaseValidationResult {
  const requiredFields = INTAKE_PHASE_REQUIRED_FIELDS[phase];
  const missingFields: string[] = [];
  const completedFields: string[] = [];

  for (const field of requiredFields) {
    const value = getNestedValue(data as Record<string, unknown>, field);
    if (isValuePresent(value)) {
      completedFields.push(field);
    } else {
      missingFields.push(field);
    }
  }

  // Special case: founder_profile requires ALG data for unemployed users
  if (phase === 'founder_profile' && data.founder?.currentStatus === 'unemployed') {
    if (!isValuePresent(data.founder?.algStatus?.daysRemaining)) {
      if (!missingFields.includes('founder.algStatus.daysRemaining')) {
        missingFields.push('founder.algStatus.daysRemaining');
      }
    } else {
      if (!completedFields.includes('founder.algStatus.daysRemaining')) {
        completedFields.push('founder.algStatus.daysRemaining');
      }
    }

    if (!isValuePresent(data.founder?.algStatus?.monthlyAmount)) {
      if (!missingFields.includes('founder.algStatus.monthlyAmount')) {
        missingFields.push('founder.algStatus.monthlyAmount');
      }
    } else {
      if (!completedFields.includes('founder.algStatus.monthlyAmount')) {
        completedFields.push('founder.algStatus.monthlyAmount');
      }
    }
  }

  return {
    isComplete: missingFields.length === 0,
    missingFields,
    completedFields,
  };
}

/**
 * Phase validators - functions to check if each phase is complete
 */
export const PHASE_VALIDATORS: Record<
  IntakePhase,
  (data: PartialIntakeOutput) => PhaseValidationResult
> = {
  warmup: (data) => validateIntakePhase('warmup', data),
  founder_profile: (data) => validateIntakePhase('founder_profile', data),
  personality: (data) => validateIntakePhase('personality', data),
  profile_gen: (data) => validateIntakePhase('profile_gen', data),
  resources: (data) => validateIntakePhase('resources', data),
  business_type: (data) => validateIntakePhase('business_type', data),
  validation: (data) => validateIntakePhase('validation', data),
  completed: () => ({ isComplete: true, missingFields: [], completedFields: [] }),
};

/**
 * Get a human-readable label for a field path
 */
export function getFieldLabel(fieldPath: string): string {
  const labels: Record<string, string> = {
    'businessIdea.elevator_pitch': 'Elevator Pitch',
    'businessIdea.problem': 'Problem',
    'businessIdea.solution': 'Lösung',
    'businessIdea.targetAudience': 'Zielgruppe',
    'founder.currentStatus': 'Beruflicher Status',
    'founder.algStatus.daysRemaining': 'ALG I Resttage',
    'founder.algStatus.monthlyAmount': 'ALG I monatlich',
    'founder.experience.yearsInIndustry': 'Branchenerfahrung',
    'founder.qualifications.education': 'Ausbildung',
    'founder.motivation': 'Motivation',
    'personality.innovativeness': 'Innovationsfreude',
    'personality.riskTaking': 'Risikobereitschaft',
    'personality.achievement': 'Leistungsmotivation',
    'personality.proactiveness': 'Proaktivität',
    'personality.locusOfControl': 'Kontrollüberzeugung',
    'personality.selfEfficacy': 'Selbstwirksamkeit',
    'personality.autonomy': 'Autonomie',
    'personality.narrative': 'Profil-Zusammenfassung',
    'resources.financial.availableCapital': 'Eigenkapital',
    'resources.time.hoursPerWeek': 'Stunden pro Woche',
    'resources.time.isFullTime': 'Vollzeit/Teilzeit',
    'resources.network.industryContacts': 'Branchenkontakte',
    'businessType.category': 'Geschäftskategorie',
    'businessType.isDigitalFirst': 'Digital First',
    'businessType.isLocationDependent': 'Standortabhängig',
    'validation.isGZEligible': 'GZ-Berechtigung',
    'validation.strengths': 'Stärken',
  };

  return labels[fieldPath] || fieldPath;
}

/**
 * Validation result with blocking status
 */
export interface FounderProfileValidationResult {
  isComplete: boolean;
  isBlocked: boolean;
  blockReason?: string;
  missingFields: string[];
  warnings: string[];
}

/**
 * Validate founder profile phase with ALG blocking for unemployed users
 * Returns isBlocked: true if user is unemployed but hasn't provided exact ALG days
 */
export function validateFounderProfilePhase(
  data: PartialIntakeOutput
): FounderProfileValidationResult {
  const missingFields: string[] = [];
  const warnings: string[] = [];

  // Basic field checks
  if (!data.founder?.currentStatus) {
    missingFields.push('founder.currentStatus');
  }

  if (!data.founder?.experience?.yearsInIndustry) {
    missingFields.push('founder.experience.yearsInIndustry');
  }

  if (!data.founder?.qualifications?.education) {
    missingFields.push('founder.qualifications.education');
  }

  // Critical ALG check for unemployed users
  const isUnemployed = data.founder?.currentStatus === 'unemployed';

  if (isUnemployed) {
    const hasDaysRemaining = typeof data.founder?.algStatus?.daysRemaining === 'number';
    const hasMonthlyAmount = typeof data.founder?.algStatus?.monthlyAmount === 'number';

    if (!hasDaysRemaining) {
      return {
        isComplete: false,
        isBlocked: true,
        blockReason: 'Für arbeitslose Gründer ist die genaue Anzahl der ALG I-Resttage erforderlich. ' +
          'Bitte gib die exakte Zahl aus deinem Bescheid an.',
        missingFields: [...missingFields, 'founder.algStatus.daysRemaining'],
        warnings,
      };
    }

    if (!hasMonthlyAmount) {
      missingFields.push('founder.algStatus.monthlyAmount');
      warnings.push('ALG I monatlicher Betrag fehlt noch');
    }

    // Warn if days are below GZ minimum
    if (hasDaysRemaining && data.founder!.algStatus!.daysRemaining! < 150) {
      warnings.push(
        `Mit ${data.founder!.algStatus!.daysRemaining} Tagen ALG I-Restanspruch ` +
        `liegt der Anspruch unter dem GZ-Minimum von 150 Tagen.`
      );
    }
  }

  return {
    isComplete: missingFields.length === 0,
    isBlocked: false,
    missingFields,
    warnings,
  };
}

/**
 * Calculate overall intake progress (0-100)
 */
export function calculateIntakeProgress(data: PartialIntakeOutput): number {
  const allPhases: IntakePhase[] = [
    'warmup',
    'founder_profile',
    'personality',
    'profile_gen',
    'resources',
    'business_type',
    'validation',
  ];

  let totalFields = 0;
  let completedFields = 0;

  for (const phase of allPhases) {
    const validation = validateIntakePhase(phase, data);
    const requiredCount = INTAKE_PHASE_REQUIRED_FIELDS[phase].length;
    totalFields += requiredCount;
    completedFields += validation.completedFields.length;
  }

  if (totalFields === 0) return 0;
  return Math.round((completedFields / totalFields) * 100);
}
