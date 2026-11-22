import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { CurrentUser } from './api/types/platform';
import { App } from './App';
import { renderWithProviders } from './test/render';

const alice: CurrentUser = {
  id: '0193c2b4-7d3e-7c2a-9f1e-3b5a6c7d8e9f',
  userName: 'alice',
};

function heading(name: string) {
  return screen.findByRole('heading', { level: 1, name });
}

describe('the routes of a guest', () => {
  it.each(['/', '/history/0193c2bf-0a1b-7c2d-9e3f-4a5b6c7d8e9f'])(
    'redirect %s to the sign-in page',
    async (route) => {
      renderWithProviders(<App />, { route, user: null });
      expect(await heading('Sign in')).toBeInTheDocument();
    },
  );

  it('open the registration page without navigation', async () => {
    renderWithProviders(<App />, { route: '/register', user: null });
    expect(await heading('Register')).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });
});

describe('the routes of a signed-in user', () => {
  it.each([
    ['/', 'Start a game'],
    ['/game', 'Game'],
    ['/history', 'History'],
    ['/history/0193c2bf-0a1b-7c2d-9e3f-4a5b6c7d8e9f', 'Finished game'],
  ])('open %s', async (route, title) => {
    renderWithProviders(<App />, { route, user: alice });
    expect(await heading(title)).toBeInTheDocument();
  });

  it('redirect the sign-in page to the lobby', async () => {
    renderWithProviders(<App />, { route: '/login', user: alice });
    expect(await heading('Start a game')).toBeInTheDocument();
  });

  it('show the user name and the navigation', async () => {
    renderWithProviders(<App />, { route: '/', user: alice });
    await heading('Start a game');
    expect(screen.getByText('alice')).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: 'Main' }),
    ).toBeInTheDocument();
  });
});

describe('an unknown path', () => {
  it('shows the not found page', async () => {
    renderWithProviders(<App />, { route: '/nowhere', user: null });
    expect(await heading('Page not found')).toBeInTheDocument();
  });
});
