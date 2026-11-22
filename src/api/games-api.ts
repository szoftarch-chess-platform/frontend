import type { GameDetails, GamePage } from './types/platform';
import type { Uuid } from './types/shared';

/** The finished games of the signed-in user. */
export type GamesApi = {
  list(page: number, pageSize: number): Promise<GamePage>;
  get(gameId: Uuid): Promise<GameDetails>;
};
