/**
 * Workshop State Atoms
 *
 * Jotai atoms for workshop state management with IndexedDB persistence.
 * All atoms are SSR-safe and handle hydration mismatch gracefully.
 *
 * GZ-103: Workshop state management with Jotai atoms
 */

import { atom } from 'jotai';
import { atomFamily, atomWithStorage } from 'jotai/utils';
import type { Database } from '@/types/supabase';
import type { ModuleId } from '@/types/modules';
import type { RedFlag } from '@/lib/services/red-flag-detector';

// ============================================================================
// Types
// ============================================================================

type Workshop = Database['public']['Tables']['workshops']['Row'];

export interface UserProfile {
  id: string;
  email: string | undefined;
  name: string | null;
  avatarUrl: string | null;
  language: 'de' | 'en';
  createdAt: string;
}

export interface ModuleProgress {
  status: 'not_started' | 'in_progress' | 'completed' | 'skipped';
  startedAt?: string;
  completedAt?: string;
  currentPhase?: string;
  phaseComplete?: boolean;
  data?: Record<string, unknown>;
}

export interface WorkshopState {
  id: string;
  userId: string;
  businessName?: string;
  businessType?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  currentModule: ModuleId;
  modules: Record<ModuleId, ModuleProgress>;
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// Core Workshop Atoms
// ============================================================================

/**
 * List of all workshops (from Supabase, cached locally)
 */
export const workshopsAtom = atom<Workshop[]>([]);

/**
 * Current active workshop ID
 */
export const currentWorkshopIdAtom = atomWithStorage<string | null>(
  'gz-current-workshop-id',
  null
);

/**
 * Current workshop state (persisted to localStorage for sync access)
 * Uses localStorage instead of IndexedDB for simpler derived atom access
 */
export const workshopStateAtom = atomWithStorage<WorkshopState | null>(
  'gz-workshop-state',
  null
);

/**
 * Current active workshop (derived from list and ID)
 * For backward compatibility with existing code
 */
export const currentWorkshopAtom = atom((get) => {
  const workshopId = get(currentWorkshopIdAtom);
  const workshops = get(workshopsAtom);
  return workshops.find((w) => w.id === workshopId) || null;
});

/**
 * User profile atom (persisted to localStorage for sync access)
 */
export const userProfileAtom = atomWithStorage<UserProfile | null>(
  'gz-user-profile',
  null
);

// ============================================================================
// Module State Atoms
// ============================================================================

/**
 * Current module in workshop flow
 */
export const currentModuleAtom = atom(
  (get) => {
    const state = get(workshopStateAtom);
    return state?.currentModule ?? 'gz-intake';
  },
  (get, set, newModule: ModuleId) => {
    const state = get(workshopStateAtom);
    if (state) {
      set(workshopStateAtom, {
        ...state,
        currentModule: newModule,
        updatedAt: new Date().toISOString(),
      });
    }
  }
);

/**
 * Module completion status (persisted to localStorage for sync access)
 */
export const moduleCompletionAtom = atomWithStorage<Record<string, boolean>>(
  'gz-module-completion',
  {
    'gz-intake': false,
    'gz-geschaeftsmodell': false,
    'gz-unternehmen': false,
    'gz-markt-wettbewerb': false,
    'gz-marketing': false,
    'gz-finanzplanung': false,
    'gz-swot': false,
    'gz-meilensteine': false,
    'gz-kpi': false,
    'gz-zusammenfassung': false,
  }
);

/**
 * Check if a specific module is complete (derived atom)
 */
export const isModuleCompleteAtom = atom((get) => {
  const completion = get(moduleCompletionAtom);
  return (moduleId: ModuleId): boolean => completion[moduleId] ?? false;
});

/**
 * Module progress atom (derived) - returns progress info for each module
 */
export const moduleProgressAtom = atom((get) => {
  const state = get(workshopStateAtom);
  const completion = get(moduleCompletionAtom);

  const getProgress = (moduleId: ModuleId): ModuleProgress => {
    if (state?.modules?.[moduleId]) {
      return state.modules[moduleId];
    }

    return {
      status: completion[moduleId] ? 'completed' : 'not_started',
    };
  };

  return getProgress;
});

// ============================================================================
// Workshop Progress Atoms (Derived)
// ============================================================================

/**
 * Workshop progress percentage (derived)
 */
export const workshopProgressAtom = atom((get) => {
  const completion = get(moduleCompletionAtom);
  const completed = Object.values(completion).filter(Boolean).length;
  const total = Object.keys(completion).length;
  return Math.round((completed / total) * 100);
});

/**
 * Completed modules count (derived)
 */
export const completedModulesCountAtom = atom((get) => {
  const completion = get(moduleCompletionAtom);
  return Object.values(completion).filter(Boolean).length;
});

/**
 * Total modules count (derived)
 */
export const totalModulesCountAtom = atom((get) => {
  const completion = get(moduleCompletionAtom);
  return Object.keys(completion).length;
});

/**
 * Next incomplete module (derived)
 */
export const nextIncompleteModuleAtom = atom((get) => {
  const completion = get(moduleCompletionAtom);
  const moduleOrder: ModuleId[] = [
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

  for (const moduleId of moduleOrder) {
    if (!completion[moduleId]) {
      return moduleId;
    }
  }

  return null; // All modules complete
});

// ============================================================================
// UI State Atoms
// ============================================================================

/**
 * Is workshop data saving
 */
export const isSavingAtom = atom(false);

/**
 * Last saved timestamp
 */
export const lastSavedAtom = atom<Date | null>(null);

/**
 * Save error state
 */
export const saveErrorAtom = atom<string | null>(null);

// ============================================================================
// Streaming Module Data (Real-time updates from chat)
// ============================================================================

/**
 * Current streaming module data (accumulated from JSON blocks)
 */
export const streamingModuleDataAtom = atom<Record<string, unknown> | null>(null);

/**
 * Current phase within active module
 */
export const currentPhaseAtom = atom<string>('warmup');

/**
 * Workshop data by ID (atom family for efficient updates)
 */
export const workshopDataFamily = atomFamily((_workshopId: string) =>
  atom<Record<string, unknown>>({})
);

/**
 * Atom family for per-workshop streaming data
 */
export const streamingDataFamily = atomFamily((_workshopId: string) =>
  atom<{
    moduleData: Record<string, unknown> | null;
    currentPhase: string;
    phaseComplete?: boolean;
    lastUpdated: number | null;
    redFlags?: RedFlag[];
  }>({
    moduleData: null,
    currentPhase: 'warmup',
    phaseComplete: false,
    lastUpdated: null,
    redFlags: [],
  })
);

// ============================================================================
// Action Atoms (Write-only atoms for state mutations)
// ============================================================================

/**
 * Mark module as complete
 */
export const markModuleCompleteAtom = atom(
  null,
  (get, set, moduleId: ModuleId) => {
    const completion = get(moduleCompletionAtom);
    set(moduleCompletionAtom, {
      ...completion,
      [moduleId]: true,
    });

    // Also update workshop state if available
    const state = get(workshopStateAtom);
    if (state) {
      const modules = { ...state.modules };
      modules[moduleId] = {
        ...modules[moduleId],
        status: 'completed',
        completedAt: new Date().toISOString(),
      };
      set(workshopStateAtom, {
        ...state,
        modules,
        updatedAt: new Date().toISOString(),
      });
    }
  }
);

/**
 * Start a module
 */
export const startModuleAtom = atom(null, (get, set, moduleId: ModuleId) => {
  const state = get(workshopStateAtom);
  if (state) {
    const modules = { ...state.modules };
    modules[moduleId] = {
      ...modules[moduleId],
      status: 'in_progress',
      startedAt: new Date().toISOString(),
    };
    set(workshopStateAtom, {
      ...state,
      currentModule: moduleId,
      modules,
      updatedAt: new Date().toISOString(),
    });
  }
  set(currentPhaseAtom, 'warmup');
});

/**
 * Update module data
 */
export const updateModuleDataAtom = atom(
  null,
  (get, set, { moduleId, data }: { moduleId: ModuleId; data: Record<string, unknown> }) => {
    const state = get(workshopStateAtom);
    if (state) {
      const modules = { ...state.modules };
      modules[moduleId] = {
        ...modules[moduleId],
        data: {
          ...modules[moduleId]?.data,
          ...data,
        },
      };
      set(workshopStateAtom, {
        ...state,
        modules,
        updatedAt: new Date().toISOString(),
      });
    }
  }
);

/**
 * Reset workshop state (for starting over)
 */
export const resetWorkshopAtom = atom(null, (_get, set) => {
  set(workshopStateAtom, null);
  set(currentWorkshopIdAtom, null);
  set(moduleCompletionAtom, {
    'gz-intake': false,
    'gz-geschaeftsmodell': false,
    'gz-unternehmen': false,
    'gz-markt-wettbewerb': false,
    'gz-marketing': false,
    'gz-finanzplanung': false,
    'gz-swot': false,
    'gz-meilensteine': false,
    'gz-kpi': false,
    'gz-zusammenfassung': false,
  });
  set(streamingModuleDataAtom, null);
  set(currentPhaseAtom, 'warmup');
});

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Create initial workshop state
 */
export function createInitialWorkshopState(
  id: string,
  userId: string,
  businessName?: string
): WorkshopState {
  const now = new Date().toISOString();
  const modules: Record<ModuleId, ModuleProgress> = {
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
  };

  return {
    id,
    userId,
    businessName,
    status: 'draft',
    currentModule: 'gz-intake',
    modules,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Create initial user profile
 */
export function createInitialUserProfile(
  id: string,
  email: string | undefined,
  name: string | null
): UserProfile {
  return {
    id,
    email,
    name,
    avatarUrl: null,
    language: 'de',
    createdAt: new Date().toISOString(),
  };
}
