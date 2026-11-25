// Types of the contract shared-schemas.yaml in the infra repo. The file has no version of its
// own, so check it together with the contracts that use it.

/**
 * The known values of an enum, while any other string is accepted too, because a newer service
 * may send a value that this client does not know yet. The UI shows a general text for it.
 */
export type Open<Known extends string> = Known | (string & {});

export type Uuid = string;

export type Timestamp = string;

/** A position in Forsyth-Edwards Notation with all six fields. */
export type Fen = string;

/** A move in UCI notation, such as `e2e4`, `e7e8q` or `e1g1`. */
export type UciMove = string;

export type Color = 'white' | 'black';

export type Variant = Open<'standard'>;

export type UserPlayer = {
  kind: 'user';
  userId: Uuid;
  name: string;
};

export type BotPlayer = {
  kind: 'bot';
  name: string;
};

export type Player = UserPlayer | BotPlayer;

export type GameResult = Open<'whiteWon' | 'blackWon' | 'draw' | 'aborted'>;

export type GameEndReason = Open<
  | 'checkmate'
  | 'resignation'
  | 'timeout'
  | 'stalemate'
  | 'threefoldRepetition'
  | 'fiftyMoveRule'
  | 'insufficientMaterial'
  | 'engineFailure'
>;

export type TimeControl = {
  /** The time of each user for the whole game. */
  initialMs: number;
};

/** An error response of RFC 9457. */
export type ProblemDetails = {
  type?: string;
  title?: string;
  status?: number;
  detail?: string;
  instance?: string;
};
