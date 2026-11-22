import { describe, expect, it, vi } from 'vitest';
import { ApiError } from '../api-error';
import { createAuthApi } from './auth-api';
import { createGamesApi } from './games-api';
import type { HttpClient } from './http-client';

function httpReturning(result: unknown) {
  const request = vi.fn().mockResolvedValue(result);
  const http: HttpClient = {
    request,
    refreshAfterUnauthorized: vi.fn(),
  };
  return { http, request };
}

function httpFailing(error: unknown) {
  const http: HttpClient = {
    request: vi.fn().mockRejectedValue(error),
    refreshAfterUnauthorized: vi.fn(),
  };
  return http;
}

const alice = { id: '0193c2b4-7d3e-7c2a-9f1e-3b5a6c7d8e9f', userName: 'alice' };

describe('the auth api', () => {
  it('registers with a POST to /api/auth/register', async () => {
    const { http, request } = httpReturning(alice);
    const body = {
      userName: 'alice',
      email: 'alice@example.com',
      password: 'secret123',
    };
    await expect(createAuthApi(http).register(body)).resolves.toEqual(alice);
    expect(request).toHaveBeenCalledWith('/api/auth/register', {
      method: 'POST',
      body,
    });
  });

  it('signs in with a POST to /api/auth/login', async () => {
    const { http, request } = httpReturning(alice);
    const body = { userName: 'alice', password: 'secret123' };
    await createAuthApi(http).login(body);
    expect(request).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      body,
    });
  });

  it('signs out with a POST to /api/auth/logout', async () => {
    const { http, request } = httpReturning(undefined);
    await createAuthApi(http).logout();
    expect(request).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
    });
  });

  it('returns the signed-in user', async () => {
    const { http, request } = httpReturning(alice);
    await expect(createAuthApi(http).currentUser()).resolves.toEqual(alice);
    expect(request).toHaveBeenCalledWith('/api/users/me');
  });

  it('returns null for a guest', async () => {
    const http = httpFailing(new ApiError(401));
    await expect(createAuthApi(http).currentUser()).resolves.toBeNull();
  });

  it('lets other errors of the current user through', async () => {
    const http = httpFailing(new ApiError(500));
    await expect(createAuthApi(http).currentUser()).rejects.toMatchObject({
      status: 500,
    });
  });
});

describe('the games api', () => {
  it('asks for one page of the games', async () => {
    const { http, request } = httpReturning({ items: [] });
    await createGamesApi(http).list(2, 20);
    expect(request).toHaveBeenCalledWith('/api/games?page=2&pageSize=20');
  });

  it('asks for one game by its id', async () => {
    const { http, request } = httpReturning({});
    await createGamesApi(http).get('0193c2bf-0a1b-7c2d-9e3f-4a5b6c7d8e9f');
    expect(request).toHaveBeenCalledWith(
      '/api/games/0193c2bf-0a1b-7c2d-9e3f-4a5b6c7d8e9f',
    );
  });

  it('escapes an id that is not a plain UUID', async () => {
    const { http, request } = httpReturning({});
    await createGamesApi(http).get('../users/me');
    expect(request).toHaveBeenCalledWith('/api/games/..%2Fusers%2Fme');
  });
});
