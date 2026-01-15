import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import type { Database } from '@/types/supabase';

type Workshop = Database['public']['Tables']['workshops']['Row'];

// List of all workshops
export const workshopsAtom = atom<Workshop[]>([]);

// Current active workshop ID
export const currentWorkshopIdAtom = atom<string | null>(null);

// Current active workshop (derived)
export const currentWorkshopAtom = atom((get) => {
  const workshopId = get(currentWorkshopIdAtom);
  const workshops = get(workshopsAtom);
  return workshops.find((w) => w.id === workshopId) || null;
});

// Workshop data by ID (atom family for efficient updates)
export const workshopDataFamily = atomFamily((workshopId: string) =>
  atom<Record<string, any>>({})
);

// Current module in workshop flow
export const currentModuleAtom = atom<string>('intake');

// Module completion status
export const moduleCompletionAtom = atom<Record<string, boolean>>({
  intake: false,
  geschaeftsmodell: false,
  unternehmen: false,
  'markt-wettbewerb': false,
  marketing: false,
  finanzplanung: false,
  swot: false,
  meilensteine: false,
  kpi: false,
  zusammenfassung: false,
});

// Workshop progress percentage (derived)
export const workshopProgressAtom = atom((get) => {
  const completion = get(moduleCompletionAtom);
  const completed = Object.values(completion).filter(Boolean).length;
  const total = Object.keys(completion).length;
  return Math.round((completed / total) * 100);
});

// Is workshop data saving
export const isSavingAtom = atom(false);

// Last saved timestamp
export const lastSavedAtom = atom<Date | null>(null);
