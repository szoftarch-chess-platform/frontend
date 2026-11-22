// Runs before every test file (vitest.config.ts). It adds the matchers of jest-dom and the
// browser interfaces that jsdom lacks (FE-ADR-8).
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import { installBrowserStandIns } from './browser-stand-ins';

installBrowserStandIns();

// The globals of Vitest are off, so React Testing Library cannot clean up on its own.
afterEach(() => {
  cleanup();
});
