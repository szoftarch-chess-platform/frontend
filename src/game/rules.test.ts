import { describe, expect, it } from 'vitest';
import { checkedKing, moveKind, positionAfter, replayOf } from './rules';

const promotionFen = '8/4P3/8/8/8/8/8/k6K w - - 0 1';

describe('the rules of the board', () => {
  it('tells a promotion from a plain and an illegal move', () => {
    expect(moveKind(promotionFen, 'e7', 'e8')).toBe('promotion');
    expect(moveKind(promotionFen, 'h1', 'g1')).toBe('move');
    expect(moveKind(promotionFen, 'h1', 'h3')).toBe('illegal');
  });

  it('shows a waiting promotion with its piece, and ignores a move that does not fit', () => {
    expect(positionAfter(promotionFen, 'e7e8n')).toMatch(/^4N3\//);
    expect(positionAfter(promotionFen, 'e2e4')).toBe(promotionFen);
  });

  it('replays a game into its positions and its moves in SAN', () => {
    const { positions, san } = replayOf([
      'e2e4',
      'd7d5',
      'e4d5',
      'g8f6',
      'f1b5',
      'c7c6',
      'g1f3',
      'c6b5',
      'e1g1',
    ]);
    expect(san).toEqual([
      'e4',
      'd5',
      'exd5',
      'Nf6',
      'Bb5+',
      'c6',
      'Nf3',
      'cxb5',
      'O-O',
    ]);
    expect(positions).toHaveLength(10);
    expect(replayOf([])).toEqual({ positions: [positions[0]], san: [] });
  });

  it('finds the king in check', () => {
    expect(checkedKing('4k3/8/8/8/8/8/8/4RK2 b - - 0 1')).toBe('e8');
    expect(checkedKing(promotionFen)).toBeUndefined();
  });
});
