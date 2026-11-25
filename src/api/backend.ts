import type { AuthApi } from './auth-api';
import type { GameSocket } from './game-socket';
import type { GamesApi } from './games-api';

/** Everything through which the app reaches the services. The pages see only this type. */
export type Backend = {
  readonly kind: 'real' | 'fake';
  readonly auth: AuthApi;
  readonly games: GamesApi;
  readonly gameSocket: GameSocket;
};

export type BackendOptions = {
  onSessionExpired?: () => void;
};
