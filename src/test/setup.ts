// Runs before every test file (vitest.config.ts). It adds the matchers of jest-dom and the
// browser interfaces that jsdom lacks (FE-ADR-8).
import '@testing-library/jest-dom/vitest';
import { cleanup, configure } from '@testing-library/react';
import { afterEach } from 'vitest';
import { installBrowserStandIns } from './browser-stand-ins';

installBrowserStandIns();

// The board renders slowly in jsdom when many test files run at once.
configure({ asyncUtilTimeout: 3000 });

// The globals of Vitest are off, so React Testing Library cannot clean up on its own.
afterEach(() => {
  cleanup();
});
