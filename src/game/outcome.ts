import type {
  Color,
  GameEndReason,
  GameResult,
  Player,
  Uuid,
} from '../api/types/shared';

export type Outcome = 'won' | 'lost' | 'draw' | 'aborted' | 'unknown';

export const OUTCOME_TEXT: Record<Outcome, string> = {
  won: 'Won',
  lost: 'Lost',
  draw: 'Draw',
  aborted: 'Aborted',
  unknown: 'Finished',
};

/** The theme tokens `outcome.<token>.bg` and `outcome.<token>.fg` of each outcome. */
export const OUTCOME_TOKEN: Record<Outcome, 'won' | 'lost' | 'other'> = {
  won: 'won',
  lost: 'lost',
  draw: 'other',
  aborted: 'other',
  unknown: 'other',
};

const REASON_TEXT: Record<string, string> = {
  checkmate: 'by checkmate',
  resignation: 'by resignation',
  timeout: 'on time',
  stalemate: 'by stalemate',
  threefoldRepetition: 'by repetition',
  fiftyMoveRule: 'by the fifty-move rule',
  insufficientMaterial: 'by insufficient material',
  engineFailure: 'because the computer failed',
};

/** The reason as words, or an empty text for a reason that this client does not know. */
export function reasonText(reason: GameEndReason): string {
  return REASON_TEXT[reason] ?? '';
}

export function outcomeFor(result: GameResult, color: Color): Outcome {
  switch (result) {
    case 'whiteWon':
      return color === 'white' ? 'won' : 'lost';
    case 'blackWon':
      return color === 'black' ? 'won' : 'lost';
    case 'draw':
      return 'draw';
    case 'aborted':
      return 'aborted';
    default:
      return 'unknown';
  }
}

export function colorOf(
  game: { white: Player; black: Player },
  userId: Uuid,
): Color {
  const { white } = game;
  return white.kind === 'user' && white.userId === userId ? 'white' : 'black';
}
