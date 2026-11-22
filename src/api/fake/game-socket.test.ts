import { describe, expect, it, vi } from 'vitest';
import { EXAMPLE_PASSWORD } from './examples';
import { createBackend } from './index';

async function signedInSocket() {
  const backend = createBackend({ delayMs: 0, opponentDelayMs: 0 });
  await backend.auth.login({ userName: 'alice', password: EXAMPLE_PASSWORD });
  const gameStarted = vi.fn();
  backend.gameSocket.on('gameStarted', gameStarted);
  return { socket: backend.gameSocket, gameStarted };
}

async function opponentJoins() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe('the fake game socket', () => {
  it('pairs the queue with a fake opponent', async () => {
    const { socket, gameStarted } = await signedInSocket();

    await socket.emitWithAck('joinQueue', {});
    expect(await socket.emitWithAck('getState', {})).toEqual({
      ok: true,
      queued: true,
    });

    await opponentJoins();
    const { game } = gameStarted.mock.calls[0][0];
    expect([game.white.name, game.black.name].sort()).toEqual(['alice', 'bob']);
    expect(game.clock).toMatchObject({ whiteMs: 600000, blackMs: 600000 });
    expect(await socket.emitWithAck('getState', {})).toMatchObject({
      queued: false,
      game: { gameId: game.gameId },
    });
  });

  it('leaves the queue before the opponent comes', async () => {
    const { socket, gameStarted } = await signedInSocket();

    await socket.emitWithAck('joinQueue', {});
    expect(await socket.emitWithAck('leaveQueue', {})).toEqual({ ok: true });
    await opponentJoins();

    expect(gameStarted).not.toHaveBeenCalled();
    expect(await socket.emitWithAck('leaveQueue', {})).toMatchObject({
      error: { code: 'notInQueue' },
    });
  });

  it('starts a bot game at once and refuses a second one', async () => {
    const { socket, gameStarted } = await signedInSocket();

    expect(await socket.emitWithAck('startBotGame', {})).toEqual({ ok: true });
    const { game } = gameStarted.mock.calls[0][0];
    const botColor = game.white.kind === 'bot' ? 'white' : 'black';
    expect(game.clock).not.toHaveProperty(`${botColor}Ms`);

    for (const event of ['startBotGame', 'joinQueue'] as const) {
      expect(await socket.emitWithAck(event, {})).toMatchObject({
        error: { code: 'alreadyInGame' },
      });
    }
  });

  it('pairs only with a user who is free, and refuses without a user', async () => {
    const backend = createBackend({ delayMs: 0, opponentDelayMs: 0 });
    const { auth, gameSocket: socket } = backend;
    await auth.login({ userName: 'bob', password: EXAMPLE_PASSWORD });
    await socket.emitWithAck('startBotGame', {});
    await auth.login({ userName: 'alice', password: EXAMPLE_PASSWORD });

    await socket.emitWithAck('joinQueue', {});
    await opponentJoins();
    expect(await socket.emitWithAck('getState', {})).toEqual({
      ok: true,
      queued: true,
    });

    await auth.logout();
    expect(await socket.emitWithAck('getState', {})).toMatchObject({
      ok: false,
    });
  });
});
