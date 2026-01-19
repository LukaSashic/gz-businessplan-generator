/**
 * Module 03: Unternehmen (Company) Types
 *
 * Covers legal form, organization structure, location, and founding team.
 */

import { z } from 'zod';

// ============================================================================
// Enums
// ============================================================================

export const LegalForm = z.enum([
  'einzelunternehmen',     // Sole proprietorship
  'gbr',                   // Gesellschaft bürgerlichen Rechts
  'gmbh',                  // GmbH
  'ug',                    // UG (haftungsbeschränkt)
  'kg',                    // Kommanditgesellschaft
  'ohg',                   // Offene Handelsgesellschaft
  'freiberufler',          // Freelancer
  'gmbh_co_kg',            // GmbH & Co. KG
]);

export type LegalForm = z.infer<typeof LegalForm>;

export const UnternehmenPhase = z.enum([
  'rechtsform',      // Phase 1: Legal form selection
  'gruendungsteam',  // Phase 2: Founding team
  'standort',        // Phase 3: Location
  'organisation',    // Phase 4: Organization structure
  'completed',
]);

export type UnternehmenPhase = z.infer<typeof UnternehmenPhase>;

// ============================================================================
// Sub-Schemas
// ============================================================================

export const RechtsformSchema = z.object({
  form: LegalForm,
  reasoning: z.string(),                    // Why this form was chosen
  capitalRequired: z.number().optional(),   // Stammkapital if applicable
  liabilityType: z.string(),                // Haftung explanation
  taxImplications: z.string(),              // Steuerliche Aspekte
  meisterpflicht: z.boolean().optional(),   // Handwerk requirement
  permits: z.array(z.string()).optional(),  // Required permits/licenses
});

export type Rechtsform = z.infer<typeof RechtsformSchema>;

export const TeamMemberSchema = z.object({
  role: z.string(),                 // Position/Role
  name: z.string().optional(),      // DSGVO: only if user provides
  responsibilities: z.array(z.string()),
  qualifications: z.array(z.string()),
  sharePercentage: z.number().min(0).max(100).optional(),
  workingHours: z.number().optional(),
});

export type TeamMember = z.infer<typeof TeamMemberSchema>;

export const GruendungsteamSchema = z.object({
  founders: z.array(TeamMemberSchema).min(1),
  totalFounders: z.number().min(1),
  decisionMaking: z.string(),       // How decisions are made
  conflictResolution: z.string(),   // How conflicts are resolved
});

export type Gruendungsteam = z.infer<typeof GruendungsteamSchema>;

export const StandortSchema = z.object({
  type: z.enum(['home_office', 'rented', 'owned', 'coworking', 'mobile', 'virtual']),
  address: z.string().optional(),   // Only city/region, not full address
  reasoning: z.string(),            // Why this location
  costs: z.number().optional(),     // Monthly costs
  requirements: z.array(z.string()), // What's needed (equipment, etc.)
});

export type Standort = z.infer<typeof StandortSchema>;

export const OrganisationSchema = z.object({
  plannedEmployees: z.object({
    year1: z.number().min(0),
    year2: z.number().min(0),
    year3: z.number().min(0),
  }),
  outsourcingPlanned: z.array(z.string()), // What will be outsourced
  keyPartners: z.array(z.string()),        // Strategic partners
  advisors: z.array(z.string()).optional(), // Mentors, advisors
});

export type Organisation = z.infer<typeof OrganisationSchema>;

export const UnternehmenValidationSchema = z.object({
  legalFormAppropriate: z.boolean(),
  teamCapable: z.boolean(),
  locationSuitable: z.boolean(),
  organisationRealistic: z.boolean(),
  blockers: z.array(z.string()),
  warnings: z.array(z.string()),
  readyForNextModule: z.boolean(),
});

export type UnternehmenValidation = z.infer<typeof UnternehmenValidationSchema>;

export const UnternehmenMetadataSchema = z.object({
  completedAt: z.string().optional(),
  duration: z.number().optional(),
  currentPhase: UnternehmenPhase.optional(),
});

export type UnternehmenMetadata = z.infer<typeof UnternehmenMetadataSchema>;

// ============================================================================
// Main Output Schema
// ============================================================================

export const UnternehmenOutputSchema = z.object({
  rechtsform: RechtsformSchema,
  gruendungsteam: GruendungsteamSchema,
  standort: StandortSchema,
  organisation: OrganisationSchema,
  validation: UnternehmenValidationSchema,
  metadata: UnternehmenMetadataSchema,
});

export type UnternehmenOutput = z.infer<typeof UnternehmenOutputSchema>;

export const PartialUnternehmenOutputSchema = z.object({
  rechtsform: RechtsformSchema.deepPartial().optional(),
  gruendungsteam: GruendungsteamSchema.deepPartial().optional(),
  standort: StandortSchema.deepPartial().optional(),
  organisation: OrganisationSchema.deepPartial().optional(),
  validation: UnternehmenValidationSchema.partial().optional(),
  metadata: UnternehmenMetadataSchema.partial().optional(),
});

export type PartialUnternehmenOutput = z.infer<typeof PartialUnternehmenOutputSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

export function createEmptyUnternehmenOutput(): PartialUnternehmenOutput {
  return {};
}

export function isUnternehmenComplete(data: PartialUnternehmenOutput): boolean {
  return Boolean(
    data.rechtsform?.form &&
    data.gruendungsteam?.founders?.length &&
    data.standort?.type &&
    data.organisation?.plannedEmployees
  );
}
