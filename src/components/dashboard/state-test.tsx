'use client';

import { useToast, usePreferences, useSavingState } from '@/lib/state/hooks';
import { Button } from '@/components/ui/button';

export function StateTest() {
  const { addToast } = useToast();
  const { preferences, setPreferences } = usePreferences();
  const { isSaving, lastSaved } = useSavingState();

  return (
    <div className="rounded-lg border bg-white p-4">
      <h3 className="mb-4 font-semibold">Jotai State Test</h3>

      <div className="space-y-2">
        <Button
          onClick={() =>
            addToast({ type: 'success', message: 'State management works!' })
          }
        >
          Test Toast
        </Button>

        <p className="text-sm text-gray-600">
          Language: {preferences.language}
        </p>

        <p className="text-sm text-gray-600">Theme: {preferences.theme}</p>

        {lastSaved && (
          <p className="text-sm text-gray-600">
            Last saved: {lastSaved.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}
