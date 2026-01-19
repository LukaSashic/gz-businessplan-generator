/**
 * IndexedDB Persistence Layer for Workshop State
 *
 * Provides:
 * - Direct IndexedDB operations via idb-keyval
 * - Jotai atomWithStorage adapter for SSR-safe persistence
 * - Workshop data, chat messages, and coaching state storage
 */

import { get, set, del, entries } from 'idb-keyval';
import type { ChatMessage } from '@/types/chat';

// ============================================================================
// Constants
// ============================================================================

const DB_PREFIX = 'gz-workshop-';
const MESSAGES_PREFIX = 'gz-messages-';
const COACHING_PREFIX = 'gz-coaching-';
const ATOM_PREFIX = 'gz-atom-';

// ============================================================================
// Direct IndexedDB Operations
// ============================================================================

export const persistence = {
  // Save workshop data to IndexedDB
  async saveWorkshopData(workshopId: string, data: Record<string, unknown>) {
    try {
      await set(`${DB_PREFIX}${workshopId}`, {
        data,
        timestamp: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error saving to IndexedDB:', error);
      return false;
    }
  },

  // Load workshop data from IndexedDB
  async loadWorkshopData(workshopId: string): Promise<{
    data: Record<string, unknown>;
    timestamp: string;
  } | null> {
    try {
      const result = await get(`${DB_PREFIX}${workshopId}`);
      return result || null;
    } catch (error) {
      console.error('Error loading from IndexedDB:', error);
      return null;
    }
  },

  // Delete workshop data from IndexedDB
  async deleteWorkshopData(workshopId: string) {
    try {
      await del(`${DB_PREFIX}${workshopId}`);
      return true;
    } catch (error) {
      console.error('Error deleting from IndexedDB:', error);
      return false;
    }
  },

  // List all workshop IDs in IndexedDB
  async listWorkshops(): Promise<string[]> {
    try {
      const allEntries = await entries();
      return allEntries
        .filter(([key]) => String(key).startsWith(DB_PREFIX))
        .map(([key]) => String(key).replace(DB_PREFIX, ''));
    } catch (error) {
      console.error('Error listing workshops:', error);
      return [];
    }
  },

  // Clear all workshop data (for testing)
  async clearAll() {
    try {
      const workshopIds = await this.listWorkshops();
      await Promise.all(workshopIds.map((id) => this.deleteWorkshopData(id)));
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  },

  // Save chat messages to IndexedDB
  async saveChatMessages(workshopId: string, messages: ChatMessage[]) {
    try {
      await set(`${MESSAGES_PREFIX}${workshopId}`, {
        messages,
        timestamp: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error saving messages to IndexedDB:', error);
      return false;
    }
  },

  // Load chat messages from IndexedDB
  async loadChatMessages(workshopId: string): Promise<{
    messages: ChatMessage[];
    timestamp: string;
  } | null> {
    try {
      const result = await get(`${MESSAGES_PREFIX}${workshopId}`);
      return result || null;
    } catch (error) {
      console.error('Error loading messages from IndexedDB:', error);
      return null;
    }
  },

  // Delete chat messages from IndexedDB
  async deleteChatMessages(workshopId: string) {
    try {
      await del(`${MESSAGES_PREFIX}${workshopId}`);
      return true;
    } catch (error) {
      console.error('Error deleting messages from IndexedDB:', error);
      return false;
    }
  },

  // Save coaching state to IndexedDB
  async saveCoachingState(workshopId: string, state: unknown) {
    try {
      await set(`${COACHING_PREFIX}${workshopId}`, {
        state,
        timestamp: new Date().toISOString(),
      });
      return true;
    } catch (error) {
      console.error('Error saving coaching state to IndexedDB:', error);
      return false;
    }
  },

  // Load coaching state from IndexedDB
  async loadCoachingState(workshopId: string): Promise<{
    state: unknown;
    timestamp: string;
  } | null> {
    try {
      const result = await get(`${COACHING_PREFIX}${workshopId}`);
      return result || null;
    } catch (error) {
      console.error('Error loading coaching state from IndexedDB:', error);
      return null;
    }
  },
};

// ============================================================================
// Jotai atomWithStorage Adapter for IndexedDB
// ============================================================================

/**
 * Check if we're running on the server (SSR)
 */
function isServer(): boolean {
  return typeof window === 'undefined';
}

/**
 * IndexedDB storage adapter for Jotai's atomWithStorage
 *
 * Features:
 * - SSR-safe (returns initial value on server)
 * - Handles hydration mismatch gracefully
 * - Async read/write operations
 *
 * Usage:
 * ```typescript
 * const myAtom = atomWithStorage('my-key', initialValue, createIndexedDBStorage());
 * ```
 */
export function createIndexedDBStorage<T>() {
  return {
    getItem: async (key: string, initialValue: T): Promise<T> => {
      // Return initial value during SSR
      if (isServer()) {
        return initialValue;
      }

      try {
        const stored = await get(`${ATOM_PREFIX}${key}`);
        if (stored !== undefined) {
          return stored as T;
        }
        return initialValue;
      } catch (error) {
        console.error(`Error reading ${key} from IndexedDB:`, error);
        return initialValue;
      }
    },

    setItem: async (key: string, value: T): Promise<void> => {
      // No-op during SSR
      if (isServer()) {
        return;
      }

      try {
        await set(`${ATOM_PREFIX}${key}`, value);
      } catch (error) {
        console.error(`Error writing ${key} to IndexedDB:`, error);
      }
    },

    removeItem: async (key: string): Promise<void> => {
      // No-op during SSR
      if (isServer()) {
        return;
      }

      try {
        await del(`${ATOM_PREFIX}${key}`);
      } catch (error) {
        console.error(`Error removing ${key} from IndexedDB:`, error);
      }
    },

    // Subscribe to changes (not supported for IndexedDB, return no-op)
    subscribe: (
      _key: string,
      _callback: (value: T) => void,
      _initialValue: T
    ): (() => void) => {
      // IndexedDB doesn't support cross-tab synchronization natively
      // Return no-op unsubscribe function
      return () => {};
    },
  };
}

/**
 * Create an SSR-safe storage adapter that uses localStorage as fallback
 * when IndexedDB is not available (e.g., private browsing)
 */
export function createHybridStorage<T>() {
  const indexedDBStorage = createIndexedDBStorage<T>();

  return {
    getItem: async (key: string, initialValue: T): Promise<T> => {
      if (isServer()) {
        return initialValue;
      }

      try {
        // Try IndexedDB first
        const idbValue = await indexedDBStorage.getItem(key, initialValue);
        if (idbValue !== initialValue) {
          return idbValue;
        }

        // Fallback to localStorage
        const lsValue = localStorage.getItem(`${ATOM_PREFIX}${key}`);
        if (lsValue !== null) {
          return JSON.parse(lsValue) as T;
        }

        return initialValue;
      } catch {
        return initialValue;
      }
    },

    setItem: async (key: string, value: T): Promise<void> => {
      if (isServer()) {
        return;
      }

      try {
        // Write to IndexedDB
        await indexedDBStorage.setItem(key, value);

        // Also write to localStorage as backup
        localStorage.setItem(`${ATOM_PREFIX}${key}`, JSON.stringify(value));
      } catch (error) {
        console.error(`Error saving ${key}:`, error);
      }
    },

    removeItem: async (key: string): Promise<void> => {
      if (isServer()) {
        return;
      }

      try {
        await indexedDBStorage.removeItem(key);
        localStorage.removeItem(`${ATOM_PREFIX}${key}`);
      } catch (error) {
        console.error(`Error removing ${key}:`, error);
      }
    },

    subscribe: indexedDBStorage.subscribe,
  };
}

// ============================================================================
// Workshop-specific Storage Helpers
// ============================================================================

/**
 * Create storage adapter scoped to a specific workshop
 */
export function createWorkshopScopedStorage<T>(workshopId: string) {
  const baseStorage = createIndexedDBStorage<T>();

  return {
    getItem: (key: string, initialValue: T) =>
      baseStorage.getItem(`${workshopId}:${key}`, initialValue),

    setItem: (key: string, value: T) =>
      baseStorage.setItem(`${workshopId}:${key}`, value),

    removeItem: (key: string) =>
      baseStorage.removeItem(`${workshopId}:${key}`),

    subscribe: baseStorage.subscribe,
  };
}

/**
 * Sync atom value to Supabase (call after local save)
 * This is a utility for manual sync, not automatic
 */
export async function syncToSupabase(
  _workshopId: string,
  _key: string,
  _value: unknown
): Promise<boolean> {
  // TODO: Implement Supabase sync when needed
  // This would call the workshop API to persist to database
  return true;
}

// ============================================================================
// Migration Utilities
// ============================================================================

/**
 * Migrate data from localStorage to IndexedDB
 * Run once on app initialization
 */
export async function migrateLocalStorageToIndexedDB(): Promise<void> {
  if (isServer()) {
    return;
  }

  try {
    const keysToMigrate = Object.keys(localStorage).filter((key) =>
      key.startsWith(ATOM_PREFIX)
    );

    for (const key of keysToMigrate) {
      const value = localStorage.getItem(key);
      if (value) {
        const parsed = JSON.parse(value);
        await set(key, parsed);
        // Don't remove from localStorage - keep as backup
      }
    }

    console.log(`Migrated ${keysToMigrate.length} items to IndexedDB`);
  } catch (error) {
    console.error('Migration error:', error);
  }
}

/**
 * Clear all persisted atom data (for testing/reset)
 */
export async function clearAllAtomData(): Promise<void> {
  if (isServer()) {
    return;
  }

  try {
    const allEntries = await entries();
    const atomKeys = allEntries
      .filter(([key]) => String(key).startsWith(ATOM_PREFIX))
      .map(([key]) => String(key));

    for (const key of atomKeys) {
      await del(key);
    }

    // Also clear localStorage
    Object.keys(localStorage)
      .filter((key) => key.startsWith(ATOM_PREFIX))
      .forEach((key) => localStorage.removeItem(key));

    console.log(`Cleared ${atomKeys.length} atom items`);
  } catch (error) {
    console.error('Error clearing atom data:', error);
  }
}
