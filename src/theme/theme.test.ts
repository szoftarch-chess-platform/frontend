import { describe, expect, it } from 'vitest';
import { system } from './index';

describe('the theme', () => {
  // The board and other code outside Chakra read these through their CSS variables, so a
  // renamed token would silently lose its color.
  it.each([
    ['colors.board.light', '--chakra-colors-board-light'],
    ['colors.board.dark', '--chakra-colors-board-dark'],
    ['colors.highlight.legalMove', '--chakra-colors-highlight-legal-move'],
    ['colors.highlight.lastMove', '--chakra-colors-highlight-last-move'],
    ['colors.highlight.check', '--chakra-colors-highlight-check'],
    ['colors.highlight.selected', '--chakra-colors-highlight-selected'],
    ['colors.clock.running', '--chakra-colors-clock-running'],
    ['colors.clock.idle', '--chakra-colors-clock-idle'],
    ['colors.clock.low', '--chakra-colors-clock-low'],
  ])('defines %s as %s', (token, cssVariable) => {
    expect(system.token(token)).toBe(`var(${cssVariable})`);
  });

  it.each([
    'solid',
    'contrast',
    'fg',
    'muted',
    'subtle',
    'emphasized',
    'focusRing',
  ])('defines the %s role of the brand palette', (role) => {
    expect(system.token(`colors.brand.${role}`)).toBeDefined();
  });

  it('returns nothing for an unknown token', () => {
    expect(system.token('colors.board.unknown')).toBeUndefined();
  });
});
