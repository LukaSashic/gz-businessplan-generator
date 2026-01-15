'use client';

import { Provider } from 'jotai';
import { DevTools } from 'jotai-devtools';

export function JotaiProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider>
      {process.env.NODE_ENV === 'development' && <DevTools />}
      {children}
    </Provider>
  );
}
