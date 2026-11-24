import type { GameSocket } from '../api/game-socket';
import {
  applyGameEnded,
  applyGameStarted,
  applyMoveMade,
  applyState,
  initialGameStore,
  useGameStore,
} from './store';

// A getState that was refused or not answered is asked again after a delay that doubles from 1 second up to 30
// seconds. Each delay is a random share of its limit, so the tabs do not ask the game-service in step.
export const STATE_RETRY_BASE_MS = 1000;
export const STATE_RETRY_MAX_MS = 30000;

export function stateRetryDelay(
  attempt: number,
  random: () => number = Math.random,
): number {
  return (
    random() * Math.min(STATE_RETRY_MAX_MS, STATE_RETRY_BASE_MS * 2 ** attempt)
  );
}

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
  let connected = false;
  let attempt = 0;
  let retry: ReturnType<typeof setTimeout> | undefined;

  // After a disconnect the next connect asks again.
  function askLater() {
    if (!stopped && connected) {
      retry = setTimeout(askState, stateRetryDelay(attempt++));
    }
  }

  async function askState() {
    let answer;
    try {
      answer = await socket.emitWithAck('getState', {});
    } catch {
      // No answer came in time, or the socket closed before it.
      askLater();
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
      askLater();
    }
  }

  const offConnect = socket.on('connect', () => {
    connected = true;
    attempt = 0;
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
    connected = false;
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
