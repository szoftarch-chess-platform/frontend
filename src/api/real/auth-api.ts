import { ApiError } from '../api-error';
import type { AuthApi } from '../auth-api';
import type { CurrentUser } from '../types/platform';
import type { HttpClient } from './http-client';

export function createAuthApi(http: HttpClient): AuthApi {
  return {
    register: (request) =>
      http.request<CurrentUser>('/api/auth/register', {
        method: 'POST',
        body: request,
      }),

    login: (request) =>
      http.request<CurrentUser>('/api/auth/login', {
        method: 'POST',
        body: request,
      }),

    logout: () => http.request<void>('/api/auth/logout', { method: 'POST' }),

    async currentUser() {
      try {
        return await http.request<CurrentUser>('/api/users/me');
      } catch (error) {
        // A guest, or a session that could not be renewed.
        if (error instanceof ApiError && error.status === 401) {
          return null;
        }
        throw error;
      }
    },
  };
}
