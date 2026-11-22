import type { QueryClient } from '@tanstack/react-query';
import { render, type RenderResult } from '@testing-library/react';
import type { ReactElement } from 'react';
import { MemoryRouter } from 'react-router';
import type { Backend } from '../api/backend';
import { createBackend as createFakeBackend } from '../api/fake';
import type { CurrentUser } from '../api/types/platform';
import { AppProviders } from '../app/AppProviders';
import { createQueryClient } from '../app/query-client';
import { currentUserQueryKey } from '../auth/current-user';

type RenderOptions = {
  /** The URL that the memory router starts at. */
  route?: string;
  /** The signed-in user, or `null` for a guest. Leave it out to keep the query unanswered. */
  user?: CurrentUser | null;
  /** A query client of the test, for example to check what a component wrote into it. */
  queryClient?: QueryClient;
  /** The backend of the test. The tests use the fake one unless they pass another. */
  backend?: Backend;
};

/**
 * Renders a component inside the providers of the app and a memory router (FE-ADR-8), so a test
 * does not repeat the setup.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    route = '/',
    user,
    queryClient = createQueryClient(),
    backend = createFakeBackend({ delayMs: 0 }),
  }: RenderOptions = {},
): RenderResult & { queryClient: QueryClient; backend: Backend } {
  if (user !== undefined) {
    queryClient.setQueryData(currentUserQueryKey, user);
  }

  const result = render(
    <MemoryRouter initialEntries={[route]}>
      <AppProviders backend={backend} queryClient={queryClient}>
        {ui}
      </AppProviders>
    </MemoryRouter>,
  );
  return { ...result, queryClient, backend };
}
