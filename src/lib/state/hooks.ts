'use client';

import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback } from 'react';
import {
  currentWorkshopAtom,
  currentWorkshopIdAtom,
  workshopsAtom,
  currentModuleAtom,
  moduleCompletionAtom,
  workshopProgressAtom,
  isSavingAtom,
  lastSavedAtom,
  workshopDataFamily,
} from './workshop-atoms';
import {
  addToastAtom,
  removeToastAtom,
  toastsAtom,
  userPreferencesAtom,
} from './atoms';
import { persistence } from './persistence';

// Hook for current workshop
export function useCurrentWorkshop() {
  const [workshopId, setWorkshopId] = useAtom(currentWorkshopIdAtom);
  const workshop = useAtomValue(currentWorkshopAtom);

  return {
    workshop,
    workshopId,
    setWorkshopId,
  };
}

// Hook for workshop list
export function useWorkshops() {
  const [workshops, setWorkshops] = useAtom(workshopsAtom);

  return {
    workshops,
    setWorkshops,
  };
}

// Hook for workshop data with auto-save
export function useWorkshopData(workshopId: string) {
  const [data, setData] = useAtom(workshopDataFamily(workshopId));
  const setIsSaving = useSetAtom(isSavingAtom);
  const setLastSaved = useSetAtom(lastSavedAtom);
  const addToast = useSetAtom(addToastAtom);

  const saveData = useCallback(
    async (newData: Record<string, any>) => {
      setIsSaving(true);
      try {
        // Update atom
        setData(newData);

        // Save to IndexedDB
        const success = await persistence.saveWorkshopData(workshopId, newData);

        if (success) {
          setLastSaved(new Date());
        } else {
          throw new Error('Failed to save to IndexedDB');
        }
      } catch (error) {
        console.error('Error saving workshop data:', error);
        addToast({
          type: 'error',
          message: 'Fehler beim Speichern',
        });
      } finally {
        setIsSaving(false);
      }
    },
    [workshopId, setData, setIsSaving, setLastSaved, addToast]
  );

  const loadData = useCallback(async () => {
    const saved = await persistence.loadWorkshopData(workshopId);
    if (saved) {
      setData(saved.data);
      setLastSaved(new Date(saved.timestamp));
    }
  }, [workshopId, setData, setLastSaved]);

  return {
    data,
    saveData,
    loadData,
  };
}

// Hook for module navigation
export function useModuleNavigation() {
  const [currentModule, setCurrentModule] = useAtom(currentModuleAtom);
  const [completion, setCompletion] = useAtom(moduleCompletionAtom);
  const progress = useAtomValue(workshopProgressAtom);

  const completeModule = useCallback(
    (moduleName: string) => {
      setCompletion((prev) => ({ ...prev, [moduleName]: true }));
    },
    [setCompletion]
  );

  return {
    currentModule,
    setCurrentModule,
    completion,
    completeModule,
    progress,
  };
}

// Hook for toast notifications
export function useToast() {
  const toasts = useAtomValue(toastsAtom);
  const addToast = useSetAtom(addToastAtom);
  const removeToast = useSetAtom(removeToastAtom);

  return {
    toasts,
    addToast,
    removeToast,
  };
}

// Hook for user preferences
export function usePreferences() {
  const [preferences, setPreferences] = useAtom(userPreferencesAtom);

  return {
    preferences,
    setPreferences,
  };
}

// Hook for saving state
export function useSavingState() {
  const isSaving = useAtomValue(isSavingAtom);
  const lastSaved = useAtomValue(lastSavedAtom);

  return {
    isSaving,
    lastSaved,
  };
}
