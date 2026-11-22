import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from '../App';
import { renderWithProviders } from '../test/render';

describe('the badge of the fake mode', () => {
  it('is shown in the header with the fake backend', async () => {
    renderWithProviders(<App />, { route: '/login', user: null });
    expect(await screen.findByText('FAKE BACKEND')).toBeInTheDocument();
  });

  it('is not shown with the real backend', async () => {
    renderWithProviders(<App />, {
      route: '/login',
      user: null,
      backend: { kind: 'real' },
    });
    await screen.findByRole('heading', { level: 1, name: 'Sign in' });
    expect(screen.queryByText('FAKE BACKEND')).not.toBeInTheDocument();
  });
});
