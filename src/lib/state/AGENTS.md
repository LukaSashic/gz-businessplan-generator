# State Management - AGENTS.md

> This file accumulates learnings about state management in the GZ project.
> Update this file whenever you discover important patterns or gotchas.

**Last Updated:** 2026-01-19

---

## Architecture: Jotai + IndexedDB

### Why This Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Reactive State | Jotai atoms | Lightweight, atomic updates |
| Persistence | IndexedDB | Offline-first, large data support |
| URL State | nuqs | Type-safe query params |
| Server State | RSC | Initial hydration |

---

## Jotai Patterns

### Basic Atom

```typescript
import { atom } from 'jotai';

export const currentModuleAtom = atom<ModuleId>('intake');
```

### Derived Atom (Read-Only)

```typescript
export const isFinanzplanungCompleteAtom = atom((get) => {
  const workshop = get(workshopAtom);
  return workshop?.modules.finanzplanung?.status === 'complete';
});
```

### Writable Derived Atom

```typescript
export const currentModuleAtom = atom(
  (get) => get(workshopAtom)?.currentModule ?? 'intake',
  (get, set, newModule: ModuleId) => {
    const workshop = get(workshopAtom);
    if (workshop) {
      set(workshopAtom, { ...workshop, currentModule: newModule });
    }
  }
);
```

---

## IndexedDB Persistence

### Setup with atomWithStorage

```typescript
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { get, set, del } from 'idb-keyval';

const idbStorage = createJSONStorage<Workshop>(() => ({
  getItem: async (key) => {
    const value = await get(key);
    return value ?? null;
  },
  setItem: async (key, value) => {
    await set(key, value);
  },
  removeItem: async (key) => {
    await del(key);
  },
}));

export const workshopAtom = atomWithStorage<Workshop | null>(
  'gz:workshop',
  null,
  idbStorage
);
```

### Key Naming Convention

```
gz:workshop              # Current workshop data
gz:workshop:{id}         # Specific workshop
gz:messages:{workshopId} # Chat messages
gz:settings              # User preferences
```

---

## Common Patterns

### Loading State

```typescript
const workshopLoadingAtom = atom(false);

const loadWorkshopAtom = atom(
  null,
  async (get, set, workshopId: string) => {
    set(workshopLoadingAtom, true);
    try {
      const data = await fetchWorkshop(workshopId);
      set(workshopAtom, data);
    } finally {
      set(workshopLoadingAtom, false);
    }
  }
);
```

### Optimistic Updates

```typescript
const updateModuleAtom = atom(
  null,
  async (get, set, update: ModuleUpdate) => {
    const previous = get(workshopAtom);

    // Optimistic update
    set(workshopAtom, applyUpdate(previous, update));

    try {
      await saveToServer(update);
    } catch (error) {
      // Rollback on error
      set(workshopAtom, previous);
      throw error;
    }
  }
);
```

---

## Auto-Save Pattern

### Debounced Save

```typescript
import { useAtomValue } from 'jotai';
import { useEffect, useRef } from 'react';

function useAutoSave() {
  const workshop = useAtomValue(workshopAtom);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!workshop) return;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Debounce save by 5 seconds
    timeoutRef.current = setTimeout(() => {
      saveToIndexedDB(workshop);
    }, 5000);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [workshop]);
}
```

---

## Gotchas

### 1. Hydration Mismatch

```typescript
// ✗ WRONG - Causes hydration mismatch
const [value] = useAtom(persistedAtom);
return <div>{value}</div>;

// ✓ CORRECT - Handle loading state
const [value] = useAtom(persistedAtom);
const [hydrated, setHydrated] = useState(false);

useEffect(() => setHydrated(true), []);

if (!hydrated) return <Skeleton />;
return <div>{value}</div>;
```

### 2. Atom Scope

```typescript
// Atoms are global by default
// Use Provider for scoped state

import { Provider } from 'jotai';

function WorkshopPage({ workshopId }) {
  return (
    <Provider>
      <WorkshopContent workshopId={workshopId} />
    </Provider>
  );
}
```

### 3. Async Atoms

```typescript
// Use loadable for async atoms to avoid suspense
import { loadable } from 'jotai/utils';

const asyncDataAtom = atom(async () => fetchData());
const loadableDataAtom = loadable(asyncDataAtom);

// In component
const data = useAtomValue(loadableDataAtom);
if (data.state === 'loading') return <Spinner />;
if (data.state === 'hasError') return <Error />;
return <Content data={data.data} />;
```

---

## Workshop State Structure

```typescript
interface Workshop {
  id: string;
  userId: string;
  title: string;
  currentModule: ModuleId;
  modules: {
    intake: IntakeData | null;
    geschaeftsmodell: GeschaeftsmodellData | null;
    // ... all 10 modules
  };
  createdAt: string;
  updatedAt: string;
}
```

---

## Learnings Log

### 2026-01-19: Initial Setup

- Established Jotai + IndexedDB pattern
- Created workshopAtom with persistence
- Documented hydration handling
