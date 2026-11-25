import type { Backend, BackendOptions } from '../backend';
import { createAuthApi } from './auth-api';
import { createGameSocket } from './game-socket';
import { createGamesApi } from './games-api';
import { createHttpClient } from './http-client';

/** The backend that reaches the services through the gateway. */
export function createBackend({
  onSessionExpired,
}: BackendOptions = {}): Backend {
  const http = createHttpClient({ onSessionExpired });
  return {
    kind: 'real',
    auth: createAuthApi(http),
    games: createGamesApi(http),
    gameSocket: createGameSocket(http.refreshAfterUnauthorized),
  };
}
