import { describe, expect, it } from 'vitest';
import type { GameState } from '../api/types/game';
import {
  applyGameEnded,
  applyMoveMade,
  applyQueueJoined,
  applyState,
  type GameStore,
} from './store';

const game = {
  gameId: 'g1',
  fen: 'start',
  moves: [],
  clock: { whiteMs: 1000, running: 'white' },
} as unknown as GameState;

const playing: GameStore = {
  connection: 'connected',
  status: 'playing',
  game,
  clockAt: 0,
  pendingMove: 'e2e4',
};

describe('the game store', () => {
  it('takes the position of moveMade and forgets the waiting move', () => {
    const next = applyMoveMade(
      playing,
      { gameId: 'g1', move: 'e2e4', fen: 'after', clock: { blackMs: 900 } },
      50,
    );
    expect(next).toMatchObject({ pendingMove: undefined, clockAt: 50 });
    expect(next.game).toMatchObject({ fen: 'after', moves: ['e2e4'] });
  });

  it('puts a waiting move back when the game ends, and ignores other games', () => {
    const ended = applyGameEnded(
      playing,
      { gameId: 'g1', result: 'blackWon', reason: 'timeout', clock: {} },
      50,
    );
    expect(ended).toMatchObject({ status: 'ended', pendingMove: undefined });
    expect(ended.game?.fen).toBe('start');

    const other = { gameId: 'g2', move: 'e2e4', fen: 'x', clock: {} };
    expect(applyMoveMade(playing, other, 50)).toBe(playing);
  });

  it('keeps the result after a reconnect that finds no game', () => {
    const ended: GameStore = {
      ...playing,
      status: 'ended',
      connection: 'lost',
    };
    expect(applyState(ended, { ok: true, queued: false }, 50)).toMatchObject({
      status: 'ended',
      connection: 'connected',
      game,
    });
    expect(
      applyState(ended, { ok: true, queued: false, game }, 50).status,
    ).toBe('playing');
  });

  it('joins the queue from a result, but keeps a game that already started', () => {
    const ended: GameStore = { ...playing, status: 'ended' };
    expect(applyQueueJoined(ended)).toEqual({
      connection: 'connected',
      status: 'queued',
    });
    expect(applyQueueJoined(playing)).toBe(playing);
  });
});
