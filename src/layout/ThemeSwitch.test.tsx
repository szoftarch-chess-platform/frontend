import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import { renderWithProviders } from '../test/render';
import { savedTheme } from '../theme/theme-choice';
import { ThemeSwitch } from './ThemeSwitch';

afterEach(() => {
  delete document.documentElement.dataset.theme;
  localStorage.clear();
});

describe('the theme switch', () => {
  it('switches the theme and remembers it', async () => {
    renderWithProviders(<ThemeSwitch />);
    const brown = screen.getByRole('button', { name: 'Brown theme' });
    expect(brown).toHaveAttribute('aria-pressed', 'false');

    await userEvent.click(brown);

    expect(brown).toHaveAttribute('aria-pressed', 'true');
    expect(document.documentElement.dataset.theme).toBe('brown');
    expect(savedTheme()).toBe('brown');
  });

  it('falls back to green for an unknown saved theme', () => {
    localStorage.setItem('theme', 'purple');
    expect(savedTheme()).toBe('green');
  });
});
