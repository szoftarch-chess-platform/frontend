import type { Backend } from '../backend';
import { createFakeAuthApi } from './auth-api';
import { createFakeGameSocket } from './game-socket';
import { createFakeGamesApi } from './games-api';
import { FakeRuntime, type FakeOptions } from './runtime';

/** Answers in the browser from the examples of the contracts, without the services. */
export function createBackend(options: FakeOptions = {}): Backend {
  const runtime = new FakeRuntime(options);
  return {
    kind: 'fake',
    auth: createFakeAuthApi(runtime),
    games: createFakeGamesApi(runtime),
    gameSocket: createFakeGameSocket(runtime),
  };
}
