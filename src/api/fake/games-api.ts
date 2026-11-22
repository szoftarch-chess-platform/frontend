import { ApiError } from '../api-error';
import type { GamesApi } from '../games-api';
import type { GameDetails, GameSummary } from '../types/platform';
import { exampleGames as games } from './examples';
import type { FakeRuntime, FakeState } from './runtime';

export function createFakeGamesApi(runtime: FakeRuntime): GamesApi {
  return {
    list: (page, pageSize) =>
      runtime.answer((state) => {
        const userId = signedInUserId(state);
        const own = games
          .filter((game) => playedBy(game, userId))
          .sort(newestFirst);
        const start = (page - 1) * pageSize;
        return {
          items: own.slice(start, start + pageSize).map(toSummary),
          page,
          pageSize,
          totalCount: own.length,
        };
      }),

    get: (gameId) =>
      runtime.answer((state) => {
        const userId = signedInUserId(state);
        const game = games.find((g) => g.id === gameId);
        if (!game || !playedBy(game, userId)) {
          throw new ApiError(404, {
            title: 'Not Found',
            status: 404,
            detail: 'The game does not exist.',
          });
        }
        return game;
      }),
  };
}

/** A guest gets the 401 of the gateway, which has no body. */
function signedInUserId(state: FakeState): string {
  if (!state.users.some((user) => user.id === state.signedInUserId)) {
    throw new ApiError(401);
  }
  return state.signedInUserId!;
}

function playedBy(game: GameDetails, userId: string): boolean {
  return [game.white, game.black].some(
    (player) => player.kind === 'user' && player.userId === userId,
  );
}

/** Newest end first, and the higher id first for games that ended at the same time. */
function newestFirst(a: GameDetails, b: GameDetails): number {
  return b.endedAt.localeCompare(a.endedAt) || b.id.localeCompare(a.id);
}

function toSummary(game: GameDetails): GameSummary {
  const { id, variant, white, black, result, reason, startedAt, endedAt } =
    game;
  return { id, variant, white, black, result, reason, startedAt, endedAt };
}
