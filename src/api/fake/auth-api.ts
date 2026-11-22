import {
  hasErrors,
  validateLogin,
  validateRegistration,
} from '../../auth/account-rules';
import { ApiError } from '../api-error';
import type { AuthApi } from '../auth-api';
import type {
  ConflictProblem,
  CurrentUser,
  FieldErrors,
  ValidationProblem,
} from '../types/platform';
import type { FakeRuntime, FakeUser } from './runtime';

export function createFakeAuthApi(runtime: FakeRuntime): AuthApi {
  return {
    register: (request) =>
      runtime.answer((state) => {
        const invalid = validateRegistration(request);
        if (hasErrors(invalid)) {
          throw validationError(invalid);
        }

        const taken: FieldErrors = {};
        if (state.users.some((u) => sameText(u.userName, request.userName))) {
          taken.userName = ['The user name is already taken.'];
        }
        if (state.users.some((u) => sameText(u.email, request.email))) {
          taken.email = ['The email address is already taken.'];
        }
        if (hasErrors(taken)) {
          const problem: ConflictProblem = {
            title: 'Conflict',
            status: 409,
            detail: Object.values(taken)[0][0],
            errors: taken,
          };
          throw new ApiError(409, problem);
        }

        const user: FakeUser = { id: crypto.randomUUID(), ...request };
        state.users.push(user);
        state.signedInUserId = user.id;
        return toCurrentUser(user);
      }),

    login: (request) =>
      runtime.answer((state) => {
        const invalid = validateLogin(request);
        if (hasErrors(invalid)) {
          throw validationError(invalid);
        }
        const user = state.users.find(
          (u) =>
            sameText(u.userName, request.userName) &&
            u.password === request.password,
        );
        if (!user) {
          throw new ApiError(401, {
            title: 'Unauthorized',
            status: 401,
            detail: 'The user name or the password is wrong.',
          });
        }
        state.signedInUserId = user.id;
        return toCurrentUser(user);
      }),

    logout: () =>
      runtime.answer((state) => {
        state.signedInUserId = undefined;
      }),

    currentUser: () =>
      runtime.answer((state) => {
        const user = state.users.find((u) => u.id === state.signedInUserId);
        return user ? toCurrentUser(user) : null;
      }),
  };
}

function toCurrentUser(user: FakeUser): CurrentUser {
  return { id: user.id, userName: user.userName };
}

function sameText(a: string, b: string): boolean {
  return a.toLowerCase() === b.toLowerCase();
}

function validationError(errors: FieldErrors): ApiError {
  const problem: ValidationProblem = {
    title: 'One or more validation errors occurred.',
    status: 400,
    errors,
  };
  return new ApiError(400, problem);
}
