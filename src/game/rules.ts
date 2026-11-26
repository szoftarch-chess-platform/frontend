import { Chess, type Square } from 'chess.js';
import type { Color, Fen, UciMove } from '../api/types/shared';

export function turnOf(fen: Fen): Color {
  return fen.split(' ')[1] === 'b' ? 'black' : 'white';
}

/** The position after a move, or the position itself when the move does not fit it. */
export function positionAfter(fen: Fen, move: UciMove | undefined): Fen {
  if (!move) {
    return fen;
  }
  try {
    const chess = new Chess(fen);
    chess.move(toMove(move));
    return chess.fen();
  } catch {
    return fen;
  }
}

export type Target = {
  square: string;
  capture: boolean;
};

export function legalTargets(fen: Fen, from: string): Target[] {
  return new Chess(fen)
    .moves({ square: from as Square, verbose: true })
    .map((move) => ({ square: move.to, capture: move.flags.includes('c') }));
}

export function moveKind(
  fen: Fen,
  from: string,
  to: string,
): 'illegal' | 'move' | 'promotion' {
  const move = new Chess(fen)
    .moves({ square: from as Square, verbose: true })
    .find((candidate) => candidate.to === to);
  if (!move) {
    return 'illegal';
  }
  return move.promotion ? 'promotion' : 'move';
}

/** The square of the king that is in check, if one is. */
export function checkedKing(fen: Fen): string | undefined {
  const chess = new Chess(fen);
  if (!chess.inCheck()) {
    return undefined;
  }
  return chess.findPiece({ type: 'k', color: chess.turn() })[0];
}

function toMove(move: UciMove) {
  return {
    from: move.slice(0, 2),
    to: move.slice(2, 4),
    promotion: move.slice(4) || undefined,
  };
}

/**
 * Replays a game from the start. `positions[n]` is the position after `n` moves, and `san[n]` is
 * move `n + 1` in SAN, such as `Nf3`, which players read more easily than UCI.
 */
export function replayOf(moves: UciMove[]): {
  positions: Fen[];
  san: string[];
} {
  const chess = new Chess();
  const positions = [chess.fen()];
  const san: string[] = [];
  for (const move of moves) {
    san.push(chess.move(toMove(move)).san);
    positions.push(chess.fen());
  }
  return { positions, san };
}
