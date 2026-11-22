import { ApiError, SessionExpiredError } from '../api-error';
import type { Problem } from '../types/platform';

const REFRESH_PATH = '/api/auth/refresh';
const REFRESH_LOCK = 'chess-platform-token-refresh';

export type HttpClientOptions = {
  fetch?: typeof fetch;
  locks?: LockManager;
  onSessionExpired?: () => void;
};

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  signal?: AbortSignal;
};

export type HttpClient = {
  request<T>(path: string, options?: RequestOptions): Promise<T>;
  refreshAfterUnauthorized(): Promise<'refreshed' | 'waited'>;
};

/**
 * The client of the REST API through the gateway.
 */
export function createHttpClient({
  fetch: fetchImpl = (...args) => globalThis.fetch(...args),
  locks = navigator.locks,
  onSessionExpired,
}: HttpClientOptions = {}): HttpClient {
  function send(path: string, options: RequestOptions): Promise<Response> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (options.body !== undefined) {
      headers['Content-Type'] = 'application/json';
    }
    return fetchImpl(path, {
      method: options.method ?? 'GET',
      headers,
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
      credentials: 'same-origin',
      signal: options.signal,
    });
  }

  async function refreshTokens(): Promise<void> {
    const response = await fetchImpl(REFRESH_PATH, {
      method: 'POST',
      credentials: 'same-origin',
    });
    if (response.status === 401) {
      onSessionExpired?.();
      throw new SessionExpiredError();
    }
    if (!response.ok) {
      throw await toApiError(response);
    }
  }

  async function refreshAfterUnauthorized(): Promise<'refreshed' | 'waited'> {
    const outcome = await locks.request(
      REFRESH_LOCK,
      { ifAvailable: true },
      async (lock) => {
        if (!lock) {
          return 'busy' as const;
        }
        await refreshTokens();
        return 'refreshed' as const;
      },
    );
    if (outcome === 'refreshed') {
      return outcome;
    }
    await locks.request(REFRESH_LOCK, () => undefined);
    return 'waited';
  }

  async function request<T>(
    path: string,
    options: RequestOptions = {},
  ): Promise<T> {
    let response = await send(path, options);

    if (response.status === 401 && !path.startsWith('/api/auth/')) {
      const outcome = await refreshAfterUnauthorized();
      response = await send(path, options);

      if (response.status === 401 && outcome === 'waited') {
        await locks.request(REFRESH_LOCK, refreshTokens);
        response = await send(path, options);
      }
    }

    if (!response.ok) {
      throw await toApiError(response);
    }
    return (await readJson(response)) as T;
  }

  return { request, refreshAfterUnauthorized };
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (text === '') {
    return undefined;
  }
  return JSON.parse(text, (_key, value: unknown) =>
    value === null ? undefined : value,
  );
}

async function toApiError(response: Response): Promise<ApiError> {
  let problem: Problem | undefined;
  try {
    const body = await readJson(response);
    if (typeof body === 'object' && body !== null && !Array.isArray(body)) {
      problem = body as Problem;
    }
  } catch {
    // A body that is not JSON carries no details.
  }
  return new ApiError(response.status, problem);
}
