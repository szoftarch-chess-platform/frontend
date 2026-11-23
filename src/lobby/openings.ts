import { Chess } from 'chess.js';
import type { UciMove } from '../api/types/shared';

/** A well-known opening by its name and its moves in SAN. */
export type Opening = { name: string; moves: string[] };

export const OPENINGS: Opening[] = [
  { name: 'Italian Game', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'] },
  { name: 'Ruy López', moves: ['e4', 'e5', 'Nf3', 'Nc6', 'Bb5'] },
  {
    name: 'Sicilian Defence, Najdorf Variation',
    moves: ['e4', 'c5', 'Nf3', 'd6', 'd4', 'cxd4', 'Nxd4', 'Nf6', 'Nc3', 'a6'],
  },
  { name: 'French Defence', moves: ['e4', 'e6', 'd4', 'd5'] },
  { name: 'Caro-Kann Defence', moves: ['e4', 'c6', 'd4', 'd5'] },
  { name: 'Scandinavian Defence', moves: ['e4', 'd5'] },
  { name: "Queen's Gambit Declined", moves: ['d4', 'd5', 'c4', 'e6'] },
  { name: 'Slav Defence', moves: ['d4', 'd5', 'c4', 'c6'] },
  {
    name: "King's Indian Defence",
    moves: ['d4', 'Nf6', 'c4', 'g6', 'Nc3', 'Bg7', 'e4', 'd6'],
  },
  {
    name: 'Nimzo-Indian Defence',
    moves: ['d4', 'Nf6', 'c4', 'e6', 'Nc3', 'Bb4'],
  },
  { name: 'London System', moves: ['d4', 'd5', 'Nf3', 'Nf6', 'Bf4'] },
  { name: 'English Opening', moves: ['c4', 'e5'] },
];

/** The position after the moves of an opening, with its last move for the highlight. */
export function positionOf(opening: Opening): {
  fen: string;
  lastMove: UciMove;
} {
  const chess = new Chess();
  let last = { from: '', to: '' };
  for (const move of opening.moves) {
    last = chess.move(move);
  }
  return { fen: chess.fen(), lastMove: `${last.from}${last.to}` };
}

export function randomOpening(): Opening {
  return OPENINGS[Math.floor(Math.random() * OPENINGS.length)];
}
