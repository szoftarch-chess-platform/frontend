import { describe, expect, it, vi } from 'vitest';
import type { GameSocket } from '../api/game-socket';
import type { GameState, Rejected, State } from '../api/types/game';
import {
  STATE_RETRY_MAX_MS,
  startGameConnection,
  stateRetryDelay,
} from './connection';
import { useGameStore } from './store';

const game = { gameId: 'g1' } as GameState;

function stubSocket(answers: (State | Rejected | Error)[]) {
  const handlers = new Map<string, () => void>();
  const socket = {
    connect: vi.fn(),
    disconnect: vi.fn(),
    emitWithAck: vi.fn(async () => {
      const answer = answers.shift();
      if (answer instanceof Error) {
        throw answer;
      }
      return answer;
    }),
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
    const stop = startGameConnection(socket, {
      onGameStarted() {},
      onGameEnded() {},
    });
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
    const stop = startGameConnection(socket, {
      onGameStarted() {},
      onGameEnded() {},
    });
    await emit('connect');

    stop();
    expect(socket.disconnect).toHaveBeenCalled();
    expect(useGameStore.getState()).toEqual({
      connection: 'connecting',
      status: 'idle',
    });
  });

  it('asks for the state again after a refusal and after a missing answer', async () => {
    vi.useFakeTimers();
    vi.spyOn(Math, 'random').mockReturnValue(1);
    const refused: Rejected = {
      ok: false,
      error: { code: 'internalError', message: 'The game-service failed.' },
    };
    const { socket, emit } = stubSocket([
      refused,
      new Error('operation has timed out'),
      { ok: true, queued: true },
    ]);
    const stop = startGameConnection(socket, {
      onGameStarted() {},
      onGameEnded() {},
    });

    void emit('connect');
    await vi.advanceTimersByTimeAsync(0);
    expect(useGameStore.getState().connection).toBe('connecting');

    await vi.advanceTimersByTimeAsync(1000);
    expect(socket.emitWithAck).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1999);
    expect(socket.emitWithAck).toHaveBeenCalledTimes(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(socket.emitWithAck).toHaveBeenCalledTimes(3);
    expect(useGameStore.getState().status).toBe('queued');
    stop();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('asks no more after a disconnect until the next connect', async () => {
    vi.useFakeTimers();
    const { socket, emit } = stubSocket([
      new Error('socket has been disconnected'),
      { ok: true, queued: false },
    ]);
    const stop = startGameConnection(socket, {
      onGameStarted() {},
      onGameEnded() {},
    });

    // The socket closes while getState waits for its answer.
    void emit('connect');
    void emit('disconnect');
    await vi.advanceTimersByTimeAsync(STATE_RETRY_MAX_MS);
    expect(socket.emitWithAck).toHaveBeenCalledTimes(1);

    void emit('connect');
    await vi.advanceTimersByTimeAsync(0);
    expect(socket.emitWithAck).toHaveBeenCalledTimes(2);
    expect(useGameStore.getState().connection).toBe('connected');
    stop();
    vi.useRealTimers();
  });

  it('doubles the limit of the delay up to 30 seconds', () => {
    const top = () => 1;
    expect(stateRetryDelay(0, top)).toBe(1000);
    expect(stateRetryDelay(1, top)).toBe(2000);
    expect(stateRetryDelay(4, top)).toBe(16000);
    expect(stateRetryDelay(5, top)).toBe(30000);
    expect(stateRetryDelay(40, top)).toBe(30000);
    expect(stateRetryDelay(3, () => 0.25)).toBe(2000);
  });
});
