import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { AppProviders } from './app/AppProviders';
import { createQueryClient } from './app/query-client';

describe('App', () => {
  it('renders the title inside the providers', () => {
    render(
      <AppProviders queryClient={createQueryClient()}>
        <App />
      </AppProviders>,
    );
    expect(
      screen.getByRole('heading', { name: 'Chess Platform' }),
    ).toBeInTheDocument();
  });
});
