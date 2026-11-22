import { describe, expect, it } from 'vitest';
import { ApiError } from '../api-error';
import { EXAMPLE_PASSWORD } from './examples';
import { createBackend } from './index';

async function signedIn(userName: 'alice' | 'bob') {
  const backend = createBackend({ delayMs: 0 });
  await backend.auth.login({ userName, password: EXAMPLE_PASSWORD });
  return backend;
}

async function failure(promise: Promise<unknown>): Promise<ApiError> {
  const error = await promise.catch((e: unknown) => e);
  expect(error).toBeInstanceOf(ApiError);
  return error as ApiError;
}

const pvpGameId = '0193c2bf-0a1b-7c2d-9e3f-4a5b6c7d8e9f';
const botGameId = '0193c2cf-3c4d-7e5f-8a6b-7c8d9e0f1a2b';

describe('the fake games api', () => {
  it('lists the games of the user, the newest first, without their moves', async () => {
    const { games } = await signedIn('alice');
    const page = await games.list(1, 20);

    expect(page).toMatchObject({ page: 1, pageSize: 20, totalCount: 2 });
    expect(page.items.map((game) => game.id)).toEqual([botGameId, pvpGameId]);
    expect(page.items[0]).not.toHaveProperty('moves');
    expect(page.items[0]).not.toHaveProperty('timeControl');
  });

  it('lists only the games in which the user played', async () => {
    const { games } = await signedIn('bob');
    const page = await games.list(1, 20);
    expect(page.items.map((game) => game.id)).toEqual([pvpGameId]);
    expect(page.totalCount).toBe(1);
  });

  it('splits the games into pages', async () => {
    const { games } = await signedIn('alice');
    const first = await games.list(1, 1);
    const second = await games.list(2, 1);
    const third = await games.list(3, 1);

    expect(first.items.map((g) => g.id)).toEqual([botGameId]);
    expect(second.items.map((g) => g.id)).toEqual([pvpGameId]);
    expect(third.items).toEqual([]);
    expect(third.totalCount).toBe(2);
  });

  it('returns a game with its moves', async () => {
    const { games } = await signedIn('alice');
    const game = await games.get(pvpGameId);
    expect(game.moves).toEqual([
      'e2e4',
      'e7e5',
      'd1h5',
      'b8c6',
      'f1c4',
      'g8f6',
      'h5f7',
    ]);
    expect(game.timeControl).toEqual({ initialMs: 600000 });
  });

  it('answers 404 for an unknown game', async () => {
    const { games } = await signedIn('alice');
    expect(
      (await failure(games.get('0193c2bf-0000-7000-8000-000000000000'))).status,
    ).toBe(404);
  });

  it('answers 404 for a game of another user', async () => {
    const { games } = await signedIn('bob');
    expect((await failure(games.get(botGameId))).status).toBe(404);
  });

  it('answers 401 without a body to a guest, as the gateway does', async () => {
    const { games } = createBackend({ delayMs: 0 });
    const error = await failure(games.list(1, 20));
    expect(error.status).toBe(401);
    expect(error.problem).toBeUndefined();
  });
});
