import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api-error';
import { createAuthApi } from './auth-api';
import { createGamesApi } from './games-api';
import type { HttpClient } from './http-client';

function http(request: HttpClient['request']): HttpClient {
  return { request, refreshAfterUnauthorized: vi.fn() };
}

describe('the auth api', () => {
  it('returns null as the current user of a guest', async () => {
    const auth = createAuthApi(
      http(vi.fn().mockRejectedValue(new ApiError(401))),
    );
    await expect(auth.currentUser()).resolves.toBeNull();
  });

  it('lets other errors of the current user through', async () => {
    const auth = createAuthApi(
      http(vi.fn().mockRejectedValue(new ApiError(500))),
    );
    await expect(auth.currentUser()).rejects.toMatchObject({ status: 500 });
  });
});

describe('the games api', () => {
  it('escapes a game id that is not a plain UUID', async () => {
    const request = vi.fn().mockResolvedValue({});
    await createGamesApi(http(request)).get('../users/me');
    expect(request).toHaveBeenCalledWith('/api/games/..%2Fusers%2Fme');
  });
});
