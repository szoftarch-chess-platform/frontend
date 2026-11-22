import type { Backend } from '../backend';

/** Answers in the browser from the examples of the contracts, without the services. */
export function createBackend(): Backend {
  return { kind: 'fake' };
}
