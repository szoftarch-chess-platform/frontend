import { describe, expect, it } from 'vitest';
import { checkedKing, moveKind, positionAfter } from './rules';

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

  it('finds the king in check', () => {
    expect(checkedKing('4k3/8/8/8/8/8/8/4RK2 b - - 0 1')).toBe('e8');
    expect(checkedKing(promotionFen)).toBeUndefined();
  });
});
