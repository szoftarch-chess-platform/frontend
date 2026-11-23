import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GameSocket } from '../api/game-socket';
import type { GameState } from '../api/types/game';
import { sendMove } from './game-actions';
import { initialGameStore, useGameStore } from './store';

const game = { gameId: 'g1', fen: 'start', moves: [] } as unknown as GameState;
const refused = (code: string) => ({ ok: false, error: { code, message: '' } });

function socketAnswering(...answers: unknown[]) {
  return {
    emitWithAck: vi.fn(async () => answers.shift()),
  } as unknown as GameSocket;
}

describe('sending a move', () => {
  beforeEach(() => {
    useGameStore.setState(
      { ...initialGameStore, status: 'playing', game },
      true,
    );
  });

  it('keeps the move shown until moveMade replaces it', async () => {
    await sendMove(socketAnswering({ ok: true }), 'e2e4');
    expect(useGameStore.getState().pendingMove).toBe('e2e4');
  });

  it('puts the move back and takes over the server state on an old view', async () => {
    const socket = socketAnswering(refused('notYourTurn'), {
      ok: true,
      queued: false,
      game,
    });
    await sendMove(socket, 'e2e4');
    expect(useGameStore.getState().pendingMove).toBeUndefined();
    expect(socket.emitWithAck).toHaveBeenLastCalledWith('getState', {});
  });

  it('puts the move back and fails on any other refusal', async () => {
    await expect(
      sendMove(socketAnswering(refused('internalError')), 'e2e4'),
    ).rejects.toThrow();
    expect(useGameStore.getState().pendingMove).toBeUndefined();
  });
});
