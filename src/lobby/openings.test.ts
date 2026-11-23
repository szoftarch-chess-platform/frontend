import { describe, expect, it } from 'vitest';
import { OPENINGS, positionOf } from './openings';

describe('the openings of the hero board', () => {
  it.each(OPENINGS.map((opening) => [opening.name, opening]))(
    'plays %s with legal moves',
    (_, opening) => {
      expect(() => positionOf(opening)).not.toThrow();
    },
  );

  it('marks the last move of an opening', () => {
    expect(
      positionOf({
        name: 'Italian Game',
        moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'],
      }).lastMove,
    ).toBe('f1c4');
  });
});
