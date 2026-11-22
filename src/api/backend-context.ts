import { createContext, useContext } from 'react';
import type { Backend } from './backend';

/** Holds the backend of the app. `BackendProvider` fills it. */
export const BackendContext = createContext<Backend | null>(null);

/** The backend of the app. */
export function useBackend(): Backend {
  const backend = useContext(BackendContext);
  if (!backend) {
    throw new Error('useBackend must be used inside a BackendProvider.');
  }
  return backend;
}
