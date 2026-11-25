import type { GameSocket } from '../api/game-socket';
import type { UciMove } from '../api/types/shared';
import { useGameStore } from './store';
import { syncState } from './sync';

// These refusals mean that the view of the client is old, so the state of the server is taken over.
const staleCodes = ['notYourTurn', 'illegalMove', 'gameNotFound'];

/**
 * Shows the move at once and sends it. `moveMade` or `gameEnded` replaces it later. Throws when
 * the game-service refuses it for a reason other than an old view.
 */
export async function sendMove(
  socket: GameSocket,
  move: UciMove,
): Promise<void> {
  const { game } = useGameStore.getState();
  if (!game) {
    return;
  }
  useGameStore.setState({ pendingMove: move });
  const putBack = () =>
    useGameStore.setState((store) =>
      store.pendingMove === move ? { pendingMove: undefined } : store,
    );

  let answer;
  try {
    answer = await socket.emitWithAck('makeMove', {
      gameId: game.gameId,
      move,
    });
  } catch (error) {
    putBack();
    throw error;
  }
  if (answer.ok) {
    return;
  }
  putBack();
  if (staleCodes.includes(answer.error.code) && (await syncState(socket))) {
    return;
  }
  throw new Error(answer.error.message);
}

/** Throws when the game-service refuses it for a reason other than an old view. */
export async function resign(socket: GameSocket): Promise<void> {
  const { game } = useGameStore.getState();
  if (!game) {
    return;
  }
  const answer = await socket.emitWithAck('resign', { gameId: game.gameId });
  if (answer.ok) {
    return;
  }
  if (staleCodes.includes(answer.error.code) && (await syncState(socket))) {
    return;
  }
  throw new Error(answer.error.message);
}
