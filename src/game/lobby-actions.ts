import type { GameSocket } from '../api/game-socket';
import {
  applyQueueJoined,
  applyQueueLeft,
  type GameStore,
  useGameStore,
} from './store';
import { syncState } from './sync';

export type LobbyAction = 'joinQueue' | 'leaveQueue' | 'startBotGame';

const onAccepted: Record<LobbyAction, (store: GameStore) => GameStore> = {
  joinQueue: applyQueueJoined,
  leaveQueue: applyQueueLeft,
  // `gameStarted` brings the game.
  startBotGame: (store) => store,
};

// These refusals mean that another tab acted first, so the state of the server is taken over.
const otherTabCodes = ['alreadyInQueue', 'alreadyInGame', 'notInQueue'];

/** Sends an event of the lobby. Throws when the game-service refuses it for another reason. */
export async function runLobbyAction(
  socket: GameSocket,
  action: LobbyAction,
): Promise<void> {
  const answer = await socket.emitWithAck(action, {});
  if (answer.ok) {
    useGameStore.setState(onAccepted[action]);
    return;
  }
  if (otherTabCodes.includes(answer.error.code) && (await syncState(socket))) {
    return;
  }
  throw new Error(answer.error.message);
}
