import type { GameSocket } from '../api/game-socket';
import {
  applyGameEnded,
  applyGameStarted,
  applyMoveMade,
  applyState,
  initialGameStore,
  useGameStore,
} from './store';

export const STATE_RETRY_MS = 2000;

type GameEvents = {
  onGameStarted: () => void;
  onGameEnded: () => void;
};

/** Connects the socket and keeps the store in step with it. Returns the function that stops it. */
export function startGameConnection(
  socket: GameSocket,
  { onGameStarted, onGameEnded }: GameEvents,
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
      useGameStore.setState((store) =>
        applyState(store, answer, performance.now()),
      );
    } else {
      retry = setTimeout(askState, STATE_RETRY_MS);
    }
  }

  const offConnect = socket.on('connect', () => {
    clearTimeout(retry);
    void askState();
  });
  const offGameStarted = socket.on('gameStarted', ({ game }) => {
    useGameStore.setState((store) =>
      applyGameStarted(store, game, performance.now()),
    );
    onGameStarted();
  });
  const offMoveMade = socket.on('moveMade', (event) => {
    useGameStore.setState((store) =>
      applyMoveMade(store, event, performance.now()),
    );
  });
  const offGameEnded = socket.on('gameEnded', (event) => {
    useGameStore.setState((store) =>
      applyGameEnded(store, event, performance.now()),
    );
    onGameEnded();
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
    offMoveMade();
    offGameEnded();
    offDisconnect();
    socket.disconnect();
    useGameStore.setState(initialGameStore, true);
  };
}
