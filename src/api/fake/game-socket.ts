import type {
  Answer,
  ClientEvent,
  GameSocket,
  GameSocketEvents,
} from '../game-socket';
import type { Rejected, State } from '../types/game';
import type { FakeRuntime } from './runtime';

export function createFakeGameSocket(runtime: FakeRuntime): GameSocket {
  const handlers = new Map<string, Set<(...args: never[]) => void>>();
  let attempt = 0;
  let wanted = false;

  return {
    connect: () => {
      wanted = true;
      const current = ++attempt;
      void runtime
        .answer(() => undefined)
        .then(() => {
          if (wanted && current === attempt) {
            handlers.get('connect')?.forEach((handler) => handler());
          }
        });
    },

    disconnect: () => {
      wanted = false;
    },

    emitWithAck: <E extends ClientEvent>(event: E) =>
      runtime.answer(() => answer(event) as Answer<E>),

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

function answer(event: ClientEvent): State | Rejected {
  if (event === 'getState') {
    return { ok: true, queued: false };
  }
  return {
    ok: false,
    error: { code: 'internalError', message: `${event} is not faked yet.` },
  };
}
