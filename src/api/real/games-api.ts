import type { GamesApi } from '../games-api';
import type { GameDetails, GamePage } from '../types/platform';
import type { HttpClient } from './http-client';

export function createGamesApi(http: HttpClient): GamesApi {
  return {
    list: (page, pageSize) => {
      const query = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      return http.request<GamePage>(`/api/games?${query}`);
    },

    get: (gameId) =>
      http.request<GameDetails>(`/api/games/${encodeURIComponent(gameId)}`),
  };
}
