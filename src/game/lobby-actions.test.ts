import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameSocket } from '../api/game-socket';
import type { GameState } from '../api/types/game';
import { runLobbyAction } from './lobby-actions';
import { initialGameStore, useGameStore } from './store';

function socketAnswering(...answers: unknown[]) {
  return {
    emitWithAck: vi.fn(async () => answers.shift()),
  } as unknown as GameSocket;
}

const refused = (code: string) => ({ ok: false, error: { code, message: '' } });
const game = { gameId: 'g1' } as GameState;

describe('a lobby action', () => {
  beforeEach(() => {
    useGameStore.setState(initialGameStore, true);
  });

  it('keeps a game that started before the queue answered', async () => {
    useGameStore.setState({ status: 'playing', game });
    await runLobbyAction(socketAnswering({ ok: true }), 'joinQueue');
    expect(useGameStore.getState().status).toBe('playing');
  });

  it('takes over the state of the server when another tab acted first', async () => {
    const socket = socketAnswering(refused('alreadyInGame'), {
      ok: true,
      queued: false,
      game,
    });
    await runLobbyAction(socket, 'startBotGame');
    expect(socket.emitWithAck).toHaveBeenLastCalledWith('getState', {});
    expect(useGameStore.getState()).toMatchObject({ status: 'playing', game });
  });

  it('fails on any other refusal', async () => {
    await expect(
      runLobbyAction(socketAnswering(refused('internalError')), 'joinQueue'),
    ).rejects.toThrow();
  });
});
