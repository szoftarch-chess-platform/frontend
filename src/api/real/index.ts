import type { Backend } from '../backend';

/** The backend that reaches the services through the gateway. */
export function createBackend(): Backend {
  return { kind: 'real' };
}
