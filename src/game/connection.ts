import type { GameSocket } from '../api/game-socket';
import {
  applyGameStarted,
  applyState,
  initialGameStore,
  useGameStore,
} from './store';

export const STATE_RETRY_MS = 2000;

/** Connects the socket and keeps the store in step with it. Returns the function that stops it. */
export function startGameConnection(
  socket: GameSocket,
  onGameStarted: () => void,
): () => void {
  let stopped = false;
  let retry: ReturnType<typeof setTimeout> | undefined;

  async function askState() {
    let answer;
    try {
      answer = await socket.emitWithAck('getState', {});
    } catch {
      // The socket closed before the answer, and the next connect asks again.
      return;
    }
    if (stopped) {
      return;
    }
    if (answer.ok) {
      useGameStore.setState((store) => applyState(store, answer));
    } else {
      retry = setTimeout(askState, STATE_RETRY_MS);
    }
  }

  const offConnect = socket.on('connect', () => {
    clearTimeout(retry);
    void askState();
  });
  const offGameStarted = socket.on('gameStarted', ({ game }) => {
    useGameStore.setState((store) => applyGameStarted(store, game));
    onGameStarted();
  });
  const offDisconnect = socket.on('disconnect', () => {
    clearTimeout(retry);
    useGameStore.setState({ connection: 'lost' });
  });
  socket.connect();

  return () => {
    stopped = true;
    clearTimeout(retry);
    offConnect();
    offGameStarted();
    offDisconnect();
    socket.disconnect();
    useGameStore.setState(initialGameStore, true);
  };
}
