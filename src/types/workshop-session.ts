/**
 * Workshop Session Types
 *
 * Based on gz-orchestrator memory structure for tracking workshop progress
 */

import { z } from 'zod';
import type { GZModule } from '@/lib/prompts/prompt-loader';
import type { PartialIntakeOutput } from './modules/intake';
import type { PartialGeschaeftsmodellOutput } from './modules/geschaeftsmodell';

// ============================================================================
// Business Type (from orchestrator/references/module-definitions.md)
// ============================================================================

export const BusinessType = z.enum([
  'DIGITAL_SERVICE',   // Remote consulting, coaching, freelancing, SaaS
  'LOCAL_SERVICE',     // Hairdresser, craft, gastronomy, retail
  'HYBRID_SERVICE',    // Agency with office, local consulting
  'PRODUCT_DIGITAL',   // Software, apps, online courses
  'PRODUCT_PHYSICAL',  // E-commerce, manufacturing, trade
  'FRANCHISE',         // Franchise concepts
]);

export type BusinessType = z.infer<typeof BusinessType>;

// ============================================================================
// Workshop Status
// ============================================================================

export const WorkshopStatus = z.enum([
  'draft',       // Just created, not started
  'active',      // Currently in progress
  'paused',      // User took a break
  'review',      // In review/validation
  'completed',   // All modules done
]);

export type WorkshopStatus = z.infer<typeof WorkshopStatus>;

// ============================================================================
// Module Status
// ============================================================================

export const ModuleStatus = z.enum([
  'not_started',
  'in_progress',
  'completed',
  'skipped',
]);

export type ModuleStatus = z.infer<typeof ModuleStatus>;

// ============================================================================
// Module Progress
// ============================================================================

export const ModuleProgressSchema = z.object({
  status: ModuleStatus,
  startedAt: z.string().optional(),      // ISO timestamp
  completedAt: z.string().optional(),    // ISO timestamp
  skippedReason: z.string().optional(),  // Why was it skipped
  currentPhase: z.string().optional(),   // Current phase within module
  data: z.any().optional(),              // Module-specific output data
  validationResult: z.object({
    score: z.number().optional(),
    passed: z.boolean().optional(),
    issues: z.array(z.string()).optional(),
  }).optional(),
});

export type ModuleProgress = z.infer<typeof ModuleProgressSchema>;

// ============================================================================
// Workshop Session
// ============================================================================

export const WorkshopSessionSchema = z.object({
  // Identity
  id: z.string().uuid(),
  userId: z.string().uuid(),

  // Status
  status: WorkshopStatus,
  currentModule: z.string().optional(),    // Current active module

  // Business info (from intake)
  businessName: z.string().optional(),
  businessType: BusinessType.optional(),

  // Module progress tracking
  modules: z.record(z.string(), ModuleProgressSchema),

  // Timestamps
  createdAt: z.string(),
  updatedAt: z.string(),
  lastActivity: z.string(),

  // Session metadata
  totalDuration: z.number().optional(),    // Total minutes spent
  conversationTurns: z.number().optional(),
});

export type WorkshopSession = z.infer<typeof WorkshopSessionSchema>;

// ============================================================================
// Module Data Types (union of all module outputs)
// ============================================================================

export interface ModuleDataMap {
  'gz-intake': PartialIntakeOutput;
  'gz-geschaeftsmodell': PartialGeschaeftsmodellOutput;
  'gz-unternehmen': Record<string, unknown>;
  'gz-markt-wettbewerb': Record<string, unknown>;
  'gz-marketing': Record<string, unknown>;
  'gz-finanzplanung': Record<string, unknown>;
  'gz-swot': Record<string, unknown>;
  'gz-meilensteine': Record<string, unknown>;
  'gz-kpi': Record<string, unknown>;
  'gz-zusammenfassung': Record<string, unknown>;
}

// ============================================================================
// Validation Result
// ============================================================================

export const ValidationResultSchema = z.object({
  module: z.string(),
  timestamp: z.string(),

  // Scores
  completenessScore: z.number().min(0).max(10),
  consistencyScore: z.number().min(0).max(10),
  realismScore: z.number().min(0).max(10),
  documentationScore: z.number().min(0).max(10),
  totalScore: z.number().min(0).max(40),

  // Status
  passed: z.boolean(),

  // Issues
  criticalIssues: z.array(z.string()),    // Must fix before proceeding
  warnings: z.array(z.string()),          // Should fix
  suggestions: z.array(z.string()),       // Nice to have

  // Strengths
  strengths: z.array(z.string()),
});

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a new workshop session
 */
export function createWorkshopSession(
  id: string,
  userId: string,
  businessName?: string
): WorkshopSession {
  const now = new Date().toISOString();

  return {
    id,
    userId,
    status: 'draft',
    currentModule: 'gz-intake',
    businessName,
    modules: {
      'gz-intake': { status: 'not_started' },
      'gz-geschaeftsmodell': { status: 'not_started' },
      'gz-unternehmen': { status: 'not_started' },
      'gz-markt-wettbewerb': { status: 'not_started' },
      'gz-marketing': { status: 'not_started' },
      'gz-finanzplanung': { status: 'not_started' },
      'gz-swot': { status: 'not_started' },
      'gz-meilensteine': { status: 'not_started' },
      'gz-kpi': { status: 'not_started' },
      'gz-zusammenfassung': { status: 'not_started' },
    },
    createdAt: now,
    updatedAt: now,
    lastActivity: now,
  };
}

/**
 * Get completed modules count
 */
export function getCompletedModulesCount(session: WorkshopSession): number {
  return Object.values(session.modules).filter(
    (m) => m.status === 'completed'
  ).length;
}

/**
 * Get workshop progress percentage
 */
export function getWorkshopProgress(session: WorkshopSession): number {
  const total = Object.keys(session.modules).length;
  const completed = getCompletedModulesCount(session);
  return Math.round((completed / total) * 100);
}

/**
 * Get next module to work on
 */
export function getNextModule(session: WorkshopSession): GZModule | null {
  const moduleOrder: GZModule[] = [
    'gz-intake',
    'gz-geschaeftsmodell',
    'gz-unternehmen',
    'gz-markt-wettbewerb',
    'gz-marketing',
    'gz-finanzplanung',
    'gz-swot',
    'gz-meilensteine',
    'gz-kpi',
    'gz-zusammenfassung',
  ];

  for (const module of moduleOrder) {
    const progress = session.modules[module];
    if (progress?.status === 'not_started' || progress?.status === 'in_progress') {
      return module;
    }
  }

  return null; // All modules completed
}

/**
 * Format progress display (from gz-orchestrator)
 */
export function formatProgressDisplay(session: WorkshopSession): string {
  const moduleLabels: Record<string, string> = {
    'gz-intake': 'Intake & Assessment',
    'gz-geschaeftsmodell': 'Geschäftsmodell',
    'gz-unternehmen': 'Unternehmen',
    'gz-markt-wettbewerb': 'Markt & Wettbewerb',
    'gz-marketing': 'Marketingkonzept',
    'gz-finanzplanung': 'Finanzplanung',
    'gz-swot': 'SWOT-Analyse',
    'gz-meilensteine': 'Meilensteine',
    'gz-kpi': 'KPIs',
    'gz-zusammenfassung': 'Zusammenfassung',
  };

  const moduleOrder = Object.keys(moduleLabels);
  const lines: string[] = [
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '📊 WORKSHOP-FORTSCHRITT',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  ];

  for (const module of moduleOrder) {
    const progress = session.modules[module];
    const label = moduleLabels[module];
    const isCurrent = session.currentModule === module;

    let icon = '⬚';
    if (progress?.status === 'completed') icon = '✅';
    else if (progress?.status === 'in_progress') icon = '🔄';
    else if (progress?.status === 'skipped') icon = '⏭️';

    const currentMarker = isCurrent ? ' ← Aktuell' : '';
    lines.push(`${icon} ${label}${currentMarker}`);
  }

  const completed = getCompletedModulesCount(session);
  const total = moduleOrder.length;
  const percentage = getWorkshopProgress(session);

  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  lines.push(`Fortschritt: ${completed}/${total} Module (${percentage}%)`);
  lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  return lines.join('\n');
}
