import { atom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

// User preferences (persisted to localStorage)
export const userPreferencesAtom = atomWithStorage('gz-user-preferences', {
  theme: 'light' as 'light' | 'dark',
  language: 'de' as 'de' | 'en',
  sidebarCollapsed: false,
});

// Current user session
export const currentUserAtom = atom<{
  id: string;
  email: string | undefined;
  name: string | null;
} | null>(null);

// UI state
export const sidebarOpenAtom = atom(true);
export const isLoadingAtom = atom(false);

// Toast notifications
export type Toast = {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
};

export const toastsAtom = atom<Toast[]>([]);

// Add toast action
export const addToastAtom = atom(null, (get, set, toast: Omit<Toast, 'id'>) => {
  const newToast = {
    ...toast,
    id: Math.random().toString(36).substr(2, 9),
  };
  set(toastsAtom, [...get(toastsAtom), newToast]);

  // Auto-remove after duration
  if (toast.duration !== 0) {
    setTimeout(() => {
      set(toastsAtom, (prev) => prev.filter((t) => t.id !== newToast.id));
    }, toast.duration || 5000);
  }
});

// Remove toast action
export const removeToastAtom = atom(null, (get, set, toastId: string) => {
  set(
    toastsAtom,
    get(toastsAtom).filter((t) => t.id !== toastId)
  );
});
