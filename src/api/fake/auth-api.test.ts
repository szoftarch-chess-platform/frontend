import { describe, expect, it } from 'vitest';
import { ApiError } from '../api-error';
import { EXAMPLE_PASSWORD } from './examples';
import { createBackend } from './index';

function fakeBackend() {
  return createBackend({ delayMs: 0 });
}

async function failure(promise: Promise<unknown>): Promise<ApiError> {
  const error = await promise.catch((e: unknown) => e);
  expect(error).toBeInstanceOf(ApiError);
  return error as ApiError;
}

const newUser = {
  userName: 'carol',
  email: 'carol@example.com',
  password: 'correct horse battery',
};

describe('the fake auth api', () => {
  it('starts without a signed-in user', async () => {
    await expect(fakeBackend().auth.currentUser()).resolves.toBeNull();
  });

  it('signs in an example user', async () => {
    const { auth } = fakeBackend();
    const user = await auth.login({
      userName: 'alice',
      password: EXAMPLE_PASSWORD,
    });
    expect(user).toEqual({
      id: '0193c2b4-7d3e-7c2a-9f1e-3b5a6c7d8e9f',
      userName: 'alice',
    });
    await expect(auth.currentUser()).resolves.toEqual(user);
  });

  it('matches the user name regardless of case', async () => {
    const user = await fakeBackend().auth.login({
      userName: 'ALICE',
      password: EXAMPLE_PASSWORD,
    });
    expect(user.userName).toBe('alice');
  });

  it('refuses a wrong password with 401', async () => {
    const error = await failure(
      fakeBackend().auth.login({
        userName: 'alice',
        password: 'wrong password',
      }),
    );
    expect(error.status).toBe(401);
    expect(error.message).toBe('The user name or the password is wrong.');
  });

  it('refuses an unknown user with the same 401', async () => {
    const error = await failure(
      fakeBackend().auth.login({
        userName: 'nobody',
        password: EXAMPLE_PASSWORD,
      }),
    );
    expect(error.status).toBe(401);
  });

  it('refuses an empty sign-in with 400', async () => {
    const error = await failure(
      fakeBackend().auth.login({ userName: '', password: '' }),
    );
    expect(error.status).toBe(400);
    expect(Object.keys(error.fieldErrors).sort()).toEqual([
      'password',
      'userName',
    ]);
  });

  it('signs out', async () => {
    const { auth } = fakeBackend();
    await auth.login({ userName: 'alice', password: EXAMPLE_PASSWORD });
    await auth.logout();
    await expect(auth.currentUser()).resolves.toBeNull();
  });

  it('registers a new user, signs them in, and lets them sign in again', async () => {
    const { auth } = fakeBackend();
    const user = await auth.register(newUser);

    expect(user.userName).toBe('carol');
    await expect(auth.currentUser()).resolves.toEqual(user);

    await auth.logout();
    await expect(
      auth.login({ userName: 'carol', password: newUser.password }),
    ).resolves.toEqual(user);
  });

  it('refuses a taken user name with 409, regardless of case', async () => {
    const error = await failure(
      fakeBackend().auth.register({ ...newUser, userName: 'Alice' }),
    );
    expect(error.status).toBe(409);
    expect(error.fieldErrors).toEqual({
      userName: ['The user name is already taken.'],
    });
    expect(error.message).toBe('The user name is already taken.');
  });

  it('refuses a taken email address with 409, regardless of case', async () => {
    const error = await failure(
      fakeBackend().auth.register({ ...newUser, email: 'BOB@example.com' }),
    );
    expect(error.status).toBe(409);
    expect(error.fieldErrors).toEqual({
      email: ['The email address is already taken.'],
    });
  });

  it('names both fields when both are taken', async () => {
    const error = await failure(
      fakeBackend().auth.register({
        ...newUser,
        userName: 'bob',
        email: 'bob@example.com',
      }),
    );
    expect(Object.keys(error.fieldErrors).sort()).toEqual([
      'email',
      'userName',
    ]);
  });

  it('refuses invalid fields with 400 before checking for conflicts', async () => {
    const error = await failure(
      fakeBackend().auth.register({
        userName: 'al',
        email: 'alice',
        password: 'short',
      }),
    );
    expect(error.status).toBe(400);
    expect(Object.keys(error.fieldErrors).sort()).toEqual([
      'email',
      'password',
      'userName',
    ]);
  });

  it('does not sign in after a failed registration', async () => {
    const { auth } = fakeBackend();
    await auth
      .register({ ...newUser, userName: 'alice' })
      .catch(() => undefined);
    await expect(auth.currentUser()).resolves.toBeNull();
  });
});
