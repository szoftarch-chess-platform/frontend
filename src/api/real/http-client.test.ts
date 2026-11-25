import { describe, expect, it, vi } from 'vitest';
import { InMemoryLockManager } from '../../test/browser-stand-ins';
import { ApiError, SessionExpiredError } from '../api-error';
import { createHttpClient } from './http-client';

type Handler = (init: RequestInit) => Response | Promise<Response>;

/**
 * A fetch that answers from a list of handlers for each path, one after the other, and records
 * the paths of the calls.
 */
function scriptedFetch(script: Record<string, Handler[]>) {
  const calls: string[] = [];
  const fetchImpl = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const path = String(input);
      calls.push(path);
      const handler = script[path]?.shift();
      if (!handler) {
        throw new Error(`No answer scripted for ${path}`);
      }
      return handler(init ?? {});
    },
  );
  return { fetchImpl: fetchImpl as unknown as typeof fetch, calls };
}

const json =
  (status: number, body: unknown, type = 'application/json') =>
  () =>
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': type },
    });
const empty = (status: number) => () => new Response(null, { status });

const me = { id: '0193c2b4-7d3e-7c2a-9f1e-3b5a6c7d8e9f', userName: 'alice' };

function client(script: Record<string, Handler[]>, onSessionExpired = vi.fn()) {
  const { fetchImpl, calls } = scriptedFetch(script);
  const locks = new InMemoryLockManager() as unknown as LockManager;
  const http = createHttpClient({ fetch: fetchImpl, locks, onSessionExpired });
  return { http, calls, fetchImpl, locks, onSessionExpired };
}

describe('the http client', () => {
  it('returns the JSON body and treats null like a missing field', async () => {
    const { http } = client({
      '/api/users/me': [json(200, { ...me, extra: null })],
    });
    const user = await http.request<Record<string, unknown>>('/api/users/me');
    expect(user).toEqual(me);
    expect('extra' in user).toBe(false);
  });

  it('sends the cookies and asks for JSON', async () => {
    const { http, fetchImpl } = client({ '/api/users/me': [json(200, me)] });
    await http.request('/api/users/me');
    expect(fetchImpl).toHaveBeenCalledWith(
      '/api/users/me',
      expect.objectContaining({
        method: 'GET',
        credentials: 'same-origin',
        headers: { Accept: 'application/json' },
      }),
    );
  });

  it('sends a body as JSON', async () => {
    const { http, fetchImpl } = client({ '/api/auth/login': [json(200, me)] });
    await http.request('/api/auth/login', {
      method: 'POST',
      body: { userName: 'alice', password: 'secret123' },
    });
    expect(fetchImpl).toHaveBeenCalledWith(
      '/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: '{"userName":"alice","password":"secret123"}',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }),
    );
  });

  it('returns undefined for an answer without a body', async () => {
    const { http } = client({ '/api/auth/logout': [empty(204)] });
    await expect(
      http.request('/api/auth/logout', { method: 'POST' }),
    ).resolves.toBeUndefined();
  });

  describe('errors', () => {
    it('throws the ProblemDetails of a 400 with its field errors', async () => {
      const problem = {
        title: 'One or more validation errors occurred.',
        status: 400,
        errors: {
          password: ['The password must be at least 8 characters long.'],
        },
        traceId: 'trace',
      };
      const { http } = client({
        '/api/auth/register': [json(400, problem, 'application/problem+json')],
      });

      const error = await http
        .request('/api/auth/register', { method: 'POST', body: {} })
        .catch((e: unknown) => e);

      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(400);
      expect((error as ApiError).problem).toEqual(problem);
      expect((error as ApiError).fieldErrors).toEqual(problem.errors);
    });

    it('throws the field errors of a 409', async () => {
      const { http } = client({
        '/api/auth/register': [
          json(
            409,
            {
              title: 'Conflict',
              status: 409,
              detail: 'The user name is already taken.',
              errors: { userName: ['The user name is already taken.'] },
            },
            'application/problem+json',
          ),
        ],
      });
      const error = (await http
        .request('/api/auth/register', { method: 'POST', body: {} })
        .catch((e: unknown) => e)) as ApiError;
      expect(error.status).toBe(409);
      expect(error.message).toBe('The user name is already taken.');
      expect(error.fieldErrors).toEqual({
        userName: ['The user name is already taken.'],
      });
    });

    it('throws an error without details for a body that is not JSON', async () => {
      const { http } = client({
        '/api/games': [
          () => new Response('<html>Bad gateway</html>', { status: 502 }),
        ],
      });
      const error = (await http
        .request('/api/games')
        .catch((e: unknown) => e)) as ApiError;
      expect(error.status).toBe(502);
      expect(error.problem).toBeUndefined();
      expect(error.fieldErrors).toEqual({});
    });

    it('lets a network error through', async () => {
      const { http } = client({
        '/api/games': [
          () => {
            throw new TypeError('Failed to fetch');
          },
        ],
      });
      await expect(http.request('/api/games')).rejects.toThrow(TypeError);
    });
  });

  describe('the refresh after a 401', () => {
    it('refreshes the tokens and repeats the request', async () => {
      const { http, calls } = client({
        '/api/users/me': [empty(401), json(200, me)],
        '/api/auth/refresh': [empty(204)],
      });
      await expect(http.request('/api/users/me')).resolves.toEqual(me);
      expect(calls).toEqual([
        '/api/users/me',
        '/api/auth/refresh',
        '/api/users/me',
      ]);
    });

    it('ends the session when the refresh is refused', async () => {
      const { http, calls, onSessionExpired } = client({
        '/api/users/me': [empty(401)],
        '/api/auth/refresh': [empty(401)],
      });
      await expect(http.request('/api/users/me')).rejects.toBeInstanceOf(
        SessionExpiredError,
      );
      expect(onSessionExpired).toHaveBeenCalledOnce();
      expect(calls).toEqual(['/api/users/me', '/api/auth/refresh']);
    });

    it('does not end the session when the refresh fails for another reason', async () => {
      const { http, onSessionExpired } = client({
        '/api/users/me': [empty(401)],
        '/api/auth/refresh': [json(500, { title: 'Error', status: 500 })],
      });
      const error = (await http
        .request('/api/users/me')
        .catch((e: unknown) => e)) as ApiError;
      expect(error).not.toBeInstanceOf(SessionExpiredError);
      expect(error.status).toBe(500);
      expect(onSessionExpired).not.toHaveBeenCalled();
    });

    it('does not refresh for a 401 of an auth endpoint', async () => {
      const { http, calls } = client({
        '/api/auth/login': [
          json(
            401,
            { title: 'Unauthorized', status: 401 },
            'application/problem+json',
          ),
        ],
      });
      const error = (await http
        .request('/api/auth/login', { method: 'POST', body: {} })
        .catch((e: unknown) => e)) as ApiError;
      expect(error.status).toBe(401);
      expect(error.problem?.title).toBe('Unauthorized');
      expect(calls).toEqual(['/api/auth/login']);
    });

    it('refreshes only once when several requests get 401 at the same time', async () => {
      const { http, calls } = client({
        '/api/users/me': [empty(401), json(200, me)],
        '/api/games': [empty(401), json(200, { items: [] })],
        '/api/auth/refresh': [empty(204)],
      });

      await Promise.all([
        http.request('/api/users/me'),
        http.request('/api/games'),
      ]);

      expect(calls.filter((path) => path === '/api/auth/refresh')).toHaveLength(
        1,
      );
    });

    it('repeats a request without refreshing when another tab has just refreshed', async () => {
      const { http, calls, locks } = client({
        '/api/users/me': [empty(401), json(200, me)],
      });

      // Another tab holds the lock while it refreshes.
      let finishOtherRefresh!: () => void;
      const otherTab = locks.request(
        'chess-platform-token-refresh',
        () => new Promise<void>((resolve) => (finishOtherRefresh = resolve)),
      );

      const result = http.request('/api/users/me');
      await vi.waitFor(() => expect(calls).toHaveLength(1));
      finishOtherRefresh();
      await otherTab;

      await expect(result).resolves.toEqual(me);
      expect(calls).toEqual(['/api/users/me', '/api/users/me']);
    });

    it('refreshes on its own when the request still gets 401 after waiting', async () => {
      const { http, calls, locks } = client({
        '/api/users/me': [empty(401), empty(401), json(200, me)],
        '/api/auth/refresh': [empty(204)],
      });

      let finishOtherRefresh!: () => void;
      const otherTab = locks.request(
        'chess-platform-token-refresh',
        () => new Promise<void>((resolve) => (finishOtherRefresh = resolve)),
      );

      const result = http.request('/api/users/me');
      await vi.waitFor(() => expect(calls).toHaveLength(1));
      finishOtherRefresh();
      await otherTab;

      await expect(result).resolves.toEqual(me);
      expect(calls).toEqual([
        '/api/users/me',
        '/api/users/me',
        '/api/auth/refresh',
        '/api/users/me',
      ]);
    });

    it('gives up after its own refresh when the request still gets 401', async () => {
      const { http, calls } = client({
        '/api/users/me': [empty(401), empty(401)],
        '/api/auth/refresh': [empty(204)],
      });
      const error = (await http
        .request('/api/users/me')
        .catch((e: unknown) => e)) as ApiError;
      expect(error.status).toBe(401);
      expect(calls).toEqual([
        '/api/users/me',
        '/api/auth/refresh',
        '/api/users/me',
      ]);
    });
  });

  describe('refreshAfterUnauthorized', () => {
    it('refreshes when no other refresh runs', async () => {
      const { http, calls } = client({ '/api/auth/refresh': [empty(204)] });
      await expect(http.refreshAfterUnauthorized()).resolves.toBe('refreshed');
      expect(calls).toEqual(['/api/auth/refresh']);
    });
  });
});
