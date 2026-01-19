/**
 * Types Barrel Export
 *
 * Central export point for all TypeScript types in the GZ Businessplan Generator.
 */

// ============================================================================
// Workshop Types
// ============================================================================

// Export workshop-session types except those that conflict with modules
export {
  BusinessType as WorkshopBusinessType, // Renamed to avoid conflict
  WorkshopStatus,
  ModuleStatus,
  ModuleProgressSchema,
  WorkshopSessionSchema,
  ValidationResultSchema,
  createWorkshopSession,
  getCompletedModulesCount,
  getWorkshopProgress,
  getNextModule,
  formatProgressDisplay,
} from './workshop-session';

export type {
  WorkshopSession,
  ModuleProgress,
  ValidationResult,
} from './workshop-session';

// ============================================================================
// Coaching Types
// ============================================================================

export * from './coaching';

// ============================================================================
// Chat Types
// ============================================================================

export * from './chat';

// ============================================================================
// Module Types
// ============================================================================

// Export all module types (includes ModuleDataMap, ModuleId, etc.)
export * from './modules';

// ============================================================================
// Database Types (Supabase)
// ============================================================================

export type { Database } from './supabase';
