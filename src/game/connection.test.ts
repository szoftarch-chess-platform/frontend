import { describe, expect, it, vi } from 'vitest';
import type { GameSocket } from '../api/game-socket';
import type { GameState, Rejected, State } from '../api/types/game';
import { STATE_RETRY_MS, startGameConnection } from './connection';
import { useGameStore } from './store';

const game = { gameId: 'g1' } as GameState;

function stubSocket(answers: (State | Rejected)[]) {
  const handlers = new Map<string, () => void>();
  const socket = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    emitWithAck: vi.fn(async () => answers.shift()),
    on: (event: string, handler: () => void) => {
      handlers.set(event, handler);
      return () => handlers.delete(event);
    },
  } as unknown as GameSocket;
  const emit = async (event: string) => {
    handlers.get(event)?.();
    await new Promise((resolve) => setTimeout(resolve, 0));
  };
  return { socket, emit };
}

describe('the game connection', () => {
  it('asks for the state after every connect and marks a lost connection', async () => {
    const { socket, emit } = stubSocket([
      { ok: true, queued: true },
      { ok: true, queued: false, game },
    ]);
    const stop = startGameConnection(socket);
    expect(socket.connect).toHaveBeenCalled();

    await emit('connect');
    expect(useGameStore.getState()).toMatchObject({
      connection: 'connected',
      status: 'queued',
    });

    await emit('disconnect');
    expect(useGameStore.getState().connection).toBe('lost');

    await emit('connect');
    expect(useGameStore.getState()).toMatchObject({
      connection: 'connected',
      status: 'playing',
      game,
    });
    stop();
  });

  it('disconnects and forgets the game when it stops', async () => {
    const { socket, emit } = stubSocket([{ ok: true, queued: false, game }]);
    const stop = startGameConnection(socket);
    await emit('connect');

    stop();
    expect(socket.disconnect).toHaveBeenCalled();
    expect(useGameStore.getState()).toEqual({
      connection: 'connecting',
      status: 'idle',
    });
  });

  it('asks for the state again after a refusal', async () => {
    vi.useFakeTimers();
    const refused: Rejected = {
      ok: false,
      error: { code: 'internalError', message: 'Redis is down.' },
    };
    const { socket, emit } = stubSocket([refused, { ok: true, queued: true }]);
    const stop = startGameConnection(socket);

    void emit('connect');
    await vi.advanceTimersByTimeAsync(0);
    expect(useGameStore.getState().connection).toBe('connecting');

    await vi.advanceTimersByTimeAsync(STATE_RETRY_MS);
    expect(socket.emitWithAck).toHaveBeenCalledTimes(2);
    expect(useGameStore.getState().status).toBe('queued');
    stop();
    vi.useRealTimers();
  });
});
