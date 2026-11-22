// Types of the contract game-service.asyncapi.yaml 1.0.0 in the infra repo.
// Check this file when the info.version of the contract changes.
import type {
  Color,
  Fen,
  GameEndReason,
  GameResult,
  Open,
  Player,
  TimeControl,
  Timestamp,
  UciMove,
  Uuid,
  Variant,
} from './shared';

export type Empty = Record<string, never>;

export type MakeMove = {
  gameId: Uuid;
  move: UciMove;
};

export type Resign = {
  gameId: Uuid;
};

export type Accepted = {
  ok: true;
};

export type GameErrorCode = Open<
  | 'invalidPayload'
  | 'alreadyInQueue'
  | 'alreadyInGame'
  | 'notInQueue'
  | 'gameNotFound'
  | 'notYourTurn'
  | 'illegalMove'
  | 'internalError'
>;

export type Rejected = {
  ok: false;
  error: {
    code: GameErrorCode;
    message: string;
  };
};

export type Ack = Accepted | Rejected;

export type State = {
  ok: true;
  queued: boolean;
  game?: GameState;
};

export type Clock = {
  whiteMs?: number;
  blackMs?: number;
  running?: Color;
};

export type GameState = {
  gameId: Uuid;
  variant: Variant;
  white: Player;
  black: Player;
  timeControl: TimeControl;
  startedAt: Timestamp;
  moves: UciMove[];
  fen: Fen;
  clock: Clock;
};

export type GameStarted = {
  game: GameState;
};

export type MoveMade = {
  gameId: Uuid;
  move: UciMove;
  fen: Fen;
  clock: Clock;
};

export type GameEnded = {
  gameId: Uuid;
  result: GameResult;
  reason: GameEndReason;
  clock: Clock;
};

/** The events of the client, each with the acknowledgement that it gets. */
export type ClientEvents = {
  joinQueue: (payload: Empty, ack: (answer: Ack) => void) => void;
  leaveQueue: (payload: Empty, ack: (answer: Ack) => void) => void;
  startBotGame: (payload: Empty, ack: (answer: Ack) => void) => void;
  makeMove: (payload: MakeMove, ack: (answer: Ack) => void) => void;
  resign: (payload: Resign, ack: (answer: Ack) => void) => void;
  getState: (payload: Empty, ack: (answer: State | Rejected) => void) => void;
};

export type ServerEvents = {
  gameStarted: (event: GameStarted) => void;
  moveMade: (event: MoveMade) => void;
  gameEnded: (event: GameEnded) => void;
};
