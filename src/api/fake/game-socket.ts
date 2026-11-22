import type {
  Answer,
  ClientEvent,
  GameSocket,
  GameSocketEvents,
} from '../game-socket';
import type { Ack, Clock, GameState, Rejected, State } from '../types/game';
import type { Player, UserPlayer } from '../types/shared';
import type { FakeRuntime, FakeState } from './runtime';

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const INITIAL_MS = 600000;

export function createFakeGameSocket(runtime: FakeRuntime): GameSocket {
  const handlers = new Map<string, Set<(...args: never[]) => void>>();
  let attempt = 0;
  let wanted = false;
  let opponentTimer: ReturnType<typeof setTimeout> | undefined;

  function emit(event: string, ...args: unknown[]) {
    handlers
      .get(event)
      ?.forEach((handler) =>
        (handler as (...args: unknown[]) => void)(...args),
      );
  }

  function startGame(state: FakeState, a: Player, b: Player) {
    const [white, black] = Math.random() < 0.5 ? [a, b] : [b, a];
    const game: GameState = {
      gameId: crypto.randomUUID(),
      variant: 'standard',
      white,
      black,
      timeControl: { initialMs: INITIAL_MS },
      startedAt: new Date().toISOString(),
      moves: [],
      fen: STARTING_FEN,
      clock: initialClock(white, black),
    };
    state.games.push(game);
    emit('gameStarted', { game: structuredClone(game) });
  }

  function findOpponent(state: FakeState, me: UserPlayer) {
    clearTimeout(opponentTimer);
    opponentTimer = setTimeout(() => {
      if (!state.queue.includes(me.userId)) {
        return;
      }
      const other = state.users.find(
        (user) =>
          user.id !== me.userId &&
          !state.games.some((game) => playsIn(game, user.id)),
      );
      if (!other) {
        return;
      }
      state.queue = state.queue.filter((id) => id !== me.userId);
      startGame(state, me, {
        kind: 'user',
        userId: other.id,
        name: other.userName,
      });
    }, runtime.opponentDelayMs);
  }

  function handle(state: FakeState, event: ClientEvent): State | Ack {
    const user = state.users.find((u) => u.id === state.signedInUserId);
    if (!user) {
      return rejected('internalError', 'No user is signed in.');
    }
    const me: UserPlayer = {
      kind: 'user',
      userId: user.id,
      name: user.userName,
    };
    const queued = state.queue.includes(me.userId);
    const game = state.games.find((g) => playsIn(g, me.userId));

    switch (event) {
      case 'getState':
        return { ok: true, queued, game };
      case 'joinQueue':
      case 'startBotGame':
        if (queued) {
          return rejected('alreadyInQueue');
        }
        if (game) {
          return rejected('alreadyInGame');
        }
        if (event === 'joinQueue') {
          state.queue.push(me.userId);
          findOpponent(state, me);
        } else {
          startGame(state, me, { kind: 'bot', name: 'Stockfish bot' });
        }
        return { ok: true };
      case 'leaveQueue':
        if (!queued) {
          return rejected('notInQueue');
        }
        state.queue = state.queue.filter((id) => id !== me.userId);
        clearTimeout(opponentTimer);
        return { ok: true };
      default:
        return rejected('internalError', `${event} is not faked yet.`);
    }
  }

  return {
    connect: () => {
      wanted = true;
      const current = ++attempt;
      void runtime
        .answer(() => undefined)
        .then(() => {
          if (wanted && current === attempt) {
            emit('connect');
          }
        });
    },

    disconnect: () => {
      wanted = false;
    },

    emitWithAck: <E extends ClientEvent>(event: E) =>
      runtime.answer((state) => handle(state, event) as Answer<E>),

    on: <E extends keyof GameSocketEvents>(
      event: E,
      handler: GameSocketEvents[E],
    ) => {
      const set = handlers.get(event) ?? new Set();
      set.add(handler);
      handlers.set(event, set);
      return () => {
        set.delete(handler);
      };
    },
  };
}

/** The bot has no clock, and white's clock runs unless the bot thinks. */
function initialClock(white: Player, black: Player): Clock {
  return {
    ...(white.kind === 'user' && { whiteMs: INITIAL_MS }),
    ...(black.kind === 'user' && { blackMs: INITIAL_MS }),
    ...(white.kind === 'user' && { running: 'white' as const }),
  };
}

function playsIn(game: GameState, userId: string): boolean {
  return [game.white, game.black].some(
    (player) => player.kind === 'user' && player.userId === userId,
  );
}

function rejected(code: string, message = `Refused with ${code}.`): Rejected {
  return { ok: false, error: { code, message } };
}
