import { screen } from '@testing-library/react';
import { Route, Routes } from 'react-router';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/render';
import { RequireGuest, RequireSignedIn } from './guards';

describe('the guards before the user is known', () => {
  it('show a spinner instead of a page or a redirect', () => {
    renderWithProviders(
      <Routes>
        <Route element={<RequireSignedIn />}>
          <Route index element={<p>lobby</p>} />
        </Route>
        <Route element={<RequireGuest />}>
          <Route path="login" element={<p>sign in</p>} />
        </Route>
      </Routes>,
      { route: '/' },
    );

    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    expect(screen.queryByText('lobby')).not.toBeInTheDocument();
    expect(screen.queryByText('sign in')).not.toBeInTheDocument();
  });
});
