import { io, type Socket } from 'socket.io-client';
import type { GameSocket } from '../game-socket';
import type { ClientEvents, ServerEvents } from '../types/game';

/**
 * The browser does not see why a handshake failed, so a failed connect refreshes the tokens while
 * Socket.IO keeps retrying. After a successful refresh the next one waits until a connect succeeds.
 */
export function createGameSocket(
  refreshTokens: () => Promise<unknown>,
): GameSocket {
  const socket: Socket<ServerEvents, ClientEvents> = io({
    path: '/ws/game',
    transports: ['websocket'],
    autoConnect: false,
  });

  let connects = 0;
  let refresh: 'needed' | 'running' | 'done' = 'needed';
  socket.on('connect', () => {
    connects++;
    refresh = 'needed';
  });
  socket.on('connect_error', () => {
    if (refresh !== 'needed') {
      return;
    }
    refresh = 'running';
    const connectsAtStart = connects;
    const settle = (next: typeof refresh) => {
      if (connects === connectsAtStart) {
        refresh = next;
      }
    };
    refreshTokens().then(
      () => settle('done'),
      () => settle('needed'),
    );
  });
  socket.on('disconnect', (reason) => {
    if (reason === 'io server disconnect') {
      socket.connect();
    }
  });

  return {
    connect: () => {
      socket.connect();
    },
    disconnect: () => {
      socket.disconnect();
    },
    emitWithAck: async (event, payload) =>
      withoutNulls(
        await (socket.emitWithAck as (...args: unknown[]) => Promise<never>)(
          event,
          payload,
        ),
      ),
    on: (event, handler) => {
      const listener = (...args: unknown[]) =>
        (handler as (...args: unknown[]) => void)(...args.map(withoutNulls));
      socket.on(event, listener as never);
      return () => {
        socket.off(event, listener as never);
      };
    },
  };
}

function withoutNulls<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(withoutNulls) as T;
  }
  if (typeof value === 'object' && value !== null) {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, field]) => field !== null)
        .map(([key, field]) => [key, withoutNulls(field)]),
    ) as T;
  }
  return value;
}
