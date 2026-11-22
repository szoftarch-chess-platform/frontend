import { describe, expect, it } from 'vitest';
import { system } from './index';

describe('the theme', () => {
  // Code outside Chakra, such as the board, reads these through their CSS variables, so a
  // renamed token would silently lose its color.
  it('defines the tokens of the board, the highlights and the clocks', () => {
    const tokens = [
      'board.light',
      'board.dark',
      'highlight.legalMove',
      'highlight.lastMove',
      'highlight.check',
      'highlight.selected',
      'clock.running',
      'clock.idle',
      'clock.low',
    ];
    for (const token of tokens) {
      expect(system.token(`colors.${token}`), token).toBeDefined();
    }
  });
});
