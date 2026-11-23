import type { GameSocket } from '../api/game-socket';
import { applyState, useGameStore } from './store';

/** Takes over the state of the server. Returns false when the game-service refuses to tell it. */
export async function syncState(socket: GameSocket): Promise<boolean> {
  const state = await socket.emitWithAck('getState', {});
  if (!state.ok) {
    return false;
  }
  useGameStore.setState((store) => applyState(store, state, performance.now()));
  return true;
}
