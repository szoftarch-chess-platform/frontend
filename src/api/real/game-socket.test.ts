import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createGameSocket } from './game-socket';

type Handler = (...args: unknown[]) => void;

const socket = vi.hoisted(() => {
  const handlers = new Map<string, Handler>();
  return {
    handlers,
    on: (event: string, handler: Handler) => handlers.set(event, handler),
    off: () => undefined,
    connect: vi.fn(),
    emit: (event: string, ...args: unknown[]) => handlers.get(event)?.(...args),
  };
});

vi.mock('socket.io-client', () => ({ io: () => socket }));

async function settle() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('the game socket', () => {
  beforeEach(() => {
    socket.handlers.clear();
    socket.connect.mockClear();
  });

  it('refreshes once after failed connects until a connect succeeds', async () => {
    const refresh = vi.fn().mockResolvedValue('refreshed');
    createGameSocket(refresh);

    socket.emit('connect_error');
    socket.emit('connect_error');
    await settle();
    socket.emit('connect_error');
    expect(refresh).toHaveBeenCalledTimes(1);

    socket.emit('connect');
    socket.emit('connect_error');
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it('refreshes again after a refresh that failed', async () => {
    const refresh = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue('refreshed');
    createGameSocket(refresh);

    socket.emit('connect_error');
    await settle();
    socket.emit('connect_error');
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it('refreshes again when a refresh ends after a connect', async () => {
    let finish = () => {};
    const refresh = vi
      .fn()
      .mockReturnValueOnce(new Promise<void>((resolve) => (finish = resolve)))
      .mockResolvedValue('refreshed');
    createGameSocket(refresh);

    socket.emit('connect_error');
    socket.emit('connect');
    finish();
    await settle();
    socket.emit('connect_error');
    expect(refresh).toHaveBeenCalledTimes(2);
  });

  it('connects again when the server closes the connection', () => {
    createGameSocket(vi.fn());
    socket.emit('disconnect', 'transport close');
    expect(socket.connect).not.toHaveBeenCalled();
    socket.emit('disconnect', 'io server disconnect');
    expect(socket.connect).toHaveBeenCalled();
  });

  it('reads a null field of an event as missing', () => {
    const handler = vi.fn();
    createGameSocket(vi.fn()).on('moveMade', handler);
    socket.emit('moveMade', { move: 'e2e4', clock: { running: null } });
    expect(handler).toHaveBeenCalledWith({ move: 'e2e4', clock: {} });
  });
});
