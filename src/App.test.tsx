import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import type { CurrentUser } from './api/types/platform';
import { App } from './App';
import { currentUserQueryKey } from './auth/current-user';
import { renderWithProviders } from './test/render';

const alice: CurrentUser = {
  id: '0193c2b4-7d3e-7c2a-9f1e-3b5a6c7d8e9f',
  userName: 'alice',
};

function heading(name: string) {
  return screen.findByRole('heading', { level: 1, name });
}

describe('the routes of a guest', () => {
  it.each([
    '/',
    '/game',
    '/history',
    '/history/0193c2bf-0a1b-7c2d-9e3f-4a5b6c7d8e9f',
  ])('redirect %s to the sign-in page', async (route) => {
    renderWithProviders(<App />, { route, user: null });
    expect(await heading('Sign in')).toBeInTheDocument();
  });

  it('opens the registration page', async () => {
    renderWithProviders(<App />, { route: '/register', user: null });
    expect(await heading('Register')).toBeInTheDocument();
  });

  it('shows no navigation', async () => {
    renderWithProviders(<App />, { route: '/login', user: null });
    await heading('Sign in');
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});

describe('the routes of a signed-in user', () => {
  it.each([
    ['/', 'Lobby'],
    ['/game', 'Game'],
    ['/history', 'History'],
    ['/history/0193c2bf-0a1b-7c2d-9e3f-4a5b6c7d8e9f', 'Finished game'],
  ])('open %s', async (route, title) => {
    renderWithProviders(<App />, { route, user: alice });
    expect(await heading(title)).toBeInTheDocument();
  });

  it.each(['/login', '/register'])(
    'redirect %s to the lobby',
    async (route) => {
      renderWithProviders(<App />, { route, user: alice });
      expect(await heading('Lobby')).toBeInTheDocument();
    },
  );

  it('shows the user name and the navigation', async () => {
    renderWithProviders(<App />, { route: '/', user: alice });
    await heading('Lobby');
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Main' }),
    ).toBeInTheDocument();
  });

  it('reads the page number of the history', async () => {
    renderWithProviders(<App />, { route: '/history?page=3', user: alice });
    await heading('History');
    expect(screen.getByText('Page 3')).toBeInTheDocument();
  });

  it('shows the id of a finished game', async () => {
    const gameId = '0193c2bf-0a1b-7c2d-9e3f-4a5b6c7d8e9f';
    renderWithProviders(<App />, { route: `/history/${gameId}`, user: alice });
    await heading('Finished game');
    expect(screen.getByText(gameId)).toBeInTheDocument();
  });
});

describe('an unknown path', () => {
  it('shows the not found page', async () => {
    renderWithProviders(<App />, { route: '/nowhere', user: null });
    expect(await heading('Page not found')).toBeInTheDocument();
  });
});

describe('the temporary sign-in and sign-out', () => {
  it('signs in as the demo user and opens the lobby', async () => {
    const { queryClient } = renderWithProviders(<App />, {
      route: '/login',
      user: null,
    });

    await userEvent.click(
      await screen.findByRole('button', { name: 'Sign in as alice' }),
    );

    expect(await heading('Lobby')).toBeInTheDocument();
    expect(queryClient.getQueryData(currentUserQueryKey)).toMatchObject({
      userName: 'alice',
    });
  });

  it('signs out, clears the other cached data and opens the sign-in page', async () => {
    const { queryClient } = renderWithProviders(<App />, {
      route: '/history',
      user: alice,
    });
    queryClient.setQueryData(['games', 1], { items: [] });

    await userEvent.click(
      await screen.findByRole('button', { name: 'Sign out' }),
    );

    expect(await heading('Sign in')).toBeInTheDocument();
    expect(queryClient.getQueryData(currentUserQueryKey)).toBeNull();
    expect(queryClient.getQueryData(['games', 1])).toBeUndefined();
  });
});
