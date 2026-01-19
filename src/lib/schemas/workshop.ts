/**
 * Workshop Zod Schemas
 *
 * Validation schemas for workshop data, user profiles, and session state.
 * These are re-exported from types for convenient import in validation contexts.
 */

import { z } from 'zod';

// Re-export existing schemas from workshop-session
export {
  BusinessType,
  WorkshopStatus,
  ModuleStatus,
  ModuleProgressSchema,
  WorkshopSessionSchema,
  ValidationResultSchema,
} from '@/types/workshop-session';

// ============================================================================
// User Profile Schema
// ============================================================================

export const UserProfileSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().optional(),   // Only if provided
  displayName: z.string().optional(),     // Only if provided
  preferredLanguage: z.enum(['de', 'en']).default('de'),
  formalAddress: z.boolean().default(true), // Sie vs Du
  createdAt: z.string(),
  lastSeenAt: z.string(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// ============================================================================
// Workshop Creation Schema
// ============================================================================

export const CreateWorkshopSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  businessName: z.string().min(1).max(200).optional(),
});

export type CreateWorkshopInput = z.infer<typeof CreateWorkshopSchema>;

// ============================================================================
// Workshop Update Schema
// ============================================================================

export const UpdateWorkshopSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  businessName: z.string().min(1).max(200).optional(),
  currentModule: z.string().optional(),
  status: z.enum(['draft', 'active', 'paused', 'review', 'completed']).optional(),
});

export type UpdateWorkshopInput = z.infer<typeof UpdateWorkshopSchema>;

// ============================================================================
// Module Progress Update Schema
// ============================================================================

export const UpdateModuleProgressSchema = z.object({
  moduleId: z.string(),
  status: z.enum(['not_started', 'in_progress', 'completed', 'skipped']),
  currentPhase: z.string().optional(),
  data: z.record(z.unknown()).optional(),
  skippedReason: z.string().optional(),
});

export type UpdateModuleProgressInput = z.infer<typeof UpdateModuleProgressSchema>;

// ============================================================================
// API Request Schemas
// ============================================================================

export const GetWorkshopSchema = z.object({
  workshopId: z.string().uuid(),
});

export const ListWorkshopsSchema = z.object({
  limit: z.number().min(1).max(100).default(10),
  offset: z.number().min(0).default(0),
  status: z.enum(['draft', 'active', 'paused', 'review', 'completed']).optional(),
});

export const DeleteWorkshopSchema = z.object({
  workshopId: z.string().uuid(),
});

// ============================================================================
// Workshop Export Schema
// ============================================================================

export const ExportWorkshopSchema = z.object({
  workshopId: z.string().uuid(),
  format: z.enum(['docx', 'pdf']).default('docx'),
  includeAppendix: z.boolean().default(true),
  language: z.enum(['de', 'en']).default('de'),
});

export type ExportWorkshopInput = z.infer<typeof ExportWorkshopSchema>;

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate workshop creation input
 */
export function validateCreateWorkshop(input: unknown): CreateWorkshopInput {
  return CreateWorkshopSchema.parse(input);
}

/**
 * Validate workshop update input
 */
export function validateUpdateWorkshop(input: unknown): UpdateWorkshopInput {
  return UpdateWorkshopSchema.parse(input);
}

/**
 * Validate module progress update
 */
export function validateModuleProgressUpdate(input: unknown): UpdateModuleProgressInput {
  return UpdateModuleProgressSchema.parse(input);
}

/**
 * Safe parse with error details
 */
export function safeParseWorkshop<T>(
  schema: z.ZodSchema<T>,
  input: unknown
): { success: true; data: T } | { success: false; errors: z.ZodIssue[] } {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error.issues };
}
