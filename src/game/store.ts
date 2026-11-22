import { create } from 'zustand';
import type { GameState, State } from '../api/types/game';

export type GameStore = {
  connection: 'connecting' | 'connected' | 'lost';
  status: 'idle' | 'queued' | 'playing';
  game?: GameState;
};

export const initialGameStore: GameStore = {
  connection: 'connecting',
  status: 'idle',
};

/** The live game of the signed-in user, which the socket handlers change. */
export const useGameStore = create<GameStore>()(() => initialGameStore);

export function applyState(store: GameStore, state: State): GameStore {
  return {
    ...store,
    connection: 'connected',
    status: state.game ? 'playing' : state.queued ? 'queued' : 'idle',
    game: state.game,
  };
}

export function applyGameStarted(store: GameStore, game: GameState): GameStore {
  return { ...store, status: 'playing', game };
}

export function applyQueueJoined(store: GameStore): GameStore {
  return store.status === 'idle' ? { ...store, status: 'queued' } : store;
}

export function applyQueueLeft(store: GameStore): GameStore {
  return store.status === 'queued' ? { ...store, status: 'idle' } : store;
}
