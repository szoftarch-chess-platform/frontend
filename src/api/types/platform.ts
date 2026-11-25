// Types of the contract platform-service.openapi.yaml 2.1.0 in the infra repo.
// Check this file when the info.version of the contract changes.

import type {
  GameEndReason,
  GameResult,
  Player,
  ProblemDetails,
  TimeControl,
  Timestamp,
  UciMove,
  Uuid,
  Variant,
} from './shared';

export type RegisterRequest = {
  userName: string;
  email: string;
  password: string;
};

export type LoginRequest = {
  userName: string;
  password: string;
};

/** The signed-in user of `GET /api/users/me`, and the answer of registration and sign-in. */
export type CurrentUser = {
  id: Uuid;
  userName: string;
};

export type GameSummary = {
  id: Uuid;
  variant: Variant;
  white: Player;
  black: Player;
  result: GameResult;
  reason: GameEndReason;
  startedAt: Timestamp;
  endedAt: Timestamp;
};

/** A finished game with its moves, which the client replays to show the positions. */
export type GameDetails = GameSummary & {
  timeControl: TimeControl;
  /** Every move of the game in order. */
  moves: UciMove[];
};

/** One page of the finished games of the user, the newest first. */
export type GamePage = {
  items: GameSummary[];
  page: number;
  pageSize: number;
  totalCount: number;
};

/** The messages by the camelCase path of the field, such as `userName`. */
export type FieldErrors = Record<string, string[]>;

/** The ProblemDetails of the platform-service with the identifiers of the request. */
export type Problem = ProblemDetails & {
  traceId?: string;
  correlationId?: string;
};

/** A 400 answer for invalid fields. */
export type ValidationProblem = Problem & { errors: FieldErrors };

/** A 409 answer for a user name or an email address that is taken. */
export type ConflictProblem = Problem & { errors: FieldErrors };
