'use client';

import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useRef } from 'react';
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

// Hook for auto-saving workshop data
export function useAutoSave(workshopId: string, interval = 5000) {
  const { data, saveData, loadData } = useWorkshopData(workshopId);
  const { isSaving, lastSaved } = useSavingState();
  const addToast = useSetAtom(addToastAtom);

  // Track if data has changed since last save
  const previousDataRef = useRef<string>('');
  const hasLoadedRef = useRef(false);

  // Load data on mount
  useEffect(() => {
    if (!hasLoadedRef.current && workshopId) {
      loadData().then(() => {
        hasLoadedRef.current = true;
        // Initialize previous data after loading
        previousDataRef.current = JSON.stringify(data);
      });
    }
  }, [workshopId, loadData, data]);

  // Auto-save on interval when data changes
  useEffect(() => {
    if (!workshopId || !hasLoadedRef.current) return;

    const saveInterval = setInterval(() => {
      const currentDataString = JSON.stringify(data);

      // Only save if data has changed
      if (currentDataString !== previousDataRef.current && currentDataString !== '{}') {
        saveData(data).then(() => {
          previousDataRef.current = currentDataString;
        });
      }
    }, interval);

    return () => clearInterval(saveInterval);
  }, [workshopId, data, saveData, interval]);

  // Save on unmount if there are unsaved changes
  useEffect(() => {
    return () => {
      const currentDataString = JSON.stringify(data);
      if (currentDataString !== previousDataRef.current && currentDataString !== '{}') {
        persistence.saveWorkshopData(workshopId, data);
      }
    };
  }, [workshopId, data]);

  // Manual save function
  const save = useCallback(async () => {
    await saveData(data);
    previousDataRef.current = JSON.stringify(data);
    addToast({
      type: 'success',
      message: 'Gespeichert',
    });
  }, [data, saveData, addToast]);

  // Update data function (triggers auto-save on next interval)
  const updateData = useCallback(
    (moduleKey: string, moduleData: Record<string, any>) => {
      saveData({
        ...data,
        [moduleKey]: {
          ...(data[moduleKey] || {}),
          ...moduleData,
        },
      });
    },
    [data, saveData]
  );

  return {
    data,
    updateData,
    save,
    isSaving,
    lastSaved,
    hasUnsavedChanges: JSON.stringify(data) !== previousDataRef.current,
  };
}
