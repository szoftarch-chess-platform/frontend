import { create } from 'zustand';
import type { GameEnded, GameState, MoveMade, State } from '../api/types/game';
import type { GameEndReason, GameResult, UciMove } from '../api/types/shared';

export type GameStore = {
  connection: 'connecting' | 'connected' | 'lost';
  status: 'idle' | 'queued' | 'playing' | 'ended';
  game?: GameState;
  clockAt?: number;
  pendingMove?: UciMove;
  end?: { result: GameResult; reason: GameEndReason };
};

export const initialGameStore: GameStore = {
  connection: 'connecting',
  status: 'idle',
};

/** The live game of the signed-in user, which the socket handlers change. */
export const useGameStore = create<GameStore>()(() => initialGameStore);

/** An ended game stays on the result until the user leaves it, even if the server knows no game. */
export function applyState(
  store: GameStore,
  state: State,
  now: number,
): GameStore {
  if (store.status === 'ended' && !state.game && !state.queued) {
    return { ...store, connection: 'connected' };
  }
  return {
    connection: 'connected',
    status: state.game ? 'playing' : state.queued ? 'queued' : 'idle',
    game: state.game,
    clockAt: now,
  };
}

export function applyGameStarted(
  store: GameStore,
  game: GameState,
  now: number,
): GameStore {
  return {
    connection: store.connection,
    status: 'playing',
    game,
    clockAt: now,
  };
}

export function applyMoveMade(
  store: GameStore,
  event: MoveMade,
  now: number,
): GameStore {
  if (store.game?.gameId !== event.gameId) {
    return store;
  }
  return {
    ...store,
    game: {
      ...store.game,
      fen: event.fen,
      moves: [...store.game.moves, event.move],
      clock: event.clock,
    },
    clockAt: now,
    pendingMove: undefined,
  };
}

/** A move that still waits goes back, because a game that ends on time brings no `moveMade`. */
export function applyGameEnded(
  store: GameStore,
  event: GameEnded,
  now: number,
): GameStore {
  if (store.game?.gameId !== event.gameId) {
    return store;
  }
  return {
    ...store,
    status: 'ended',
    game: { ...store.game, clock: event.clock },
    clockAt: now,
    pendingMove: undefined,
    end: { result: event.result, reason: event.reason },
  };
}

export function applyResultLeft(store: GameStore): GameStore {
  return store.status === 'ended'
    ? { connection: store.connection, status: 'idle' }
    : store;
}

/**
 * `gameStarted` can arrive before the acknowledgement of `joinQueue`, so a running game is kept.
 * The result of an ended game is left behind.
 */
export function applyQueueJoined(store: GameStore): GameStore {
  return store.status === 'idle' || store.status === 'ended'
    ? { connection: store.connection, status: 'queued' }
    : store;
}

export function applyQueueLeft(store: GameStore): GameStore {
  return store.status === 'queued' ? { ...store, status: 'idle' } : store;
}
