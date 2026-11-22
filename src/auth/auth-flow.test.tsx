import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { ApiError } from '../api/api-error';
import { createBackend as createFakeBackend } from '../api/fake';
import { EXAMPLE_PASSWORD } from '../api/fake/examples';
import type { ValidationProblem } from '../api/types/platform';
import { createQueryClient } from '../app/query-client';
import { renderWithProviders } from '../test/render';
import { currentUserQueryKey } from './current-user';

function heading(name: string) {
  return screen.findByRole('heading', { level: 1, name });
}

async function fill(label: string, value: string) {
  await userEvent.type(screen.getByLabelText(label), value);
}

describe('on start', () => {
  it('opens the lobby for a user who is still signed in', async () => {
    const backend = createFakeBackend({ delayMs: 0 });
    await backend.auth.login({ userName: 'alice', password: EXAMPLE_PASSWORD });

    renderWithProviders(<App />, { route: '/', backend });
    expect(await heading('Start a game')).toBeInTheDocument();
  });

  it('offers a retry instead of the sign-in page when the user cannot be loaded', async () => {
    const backend = createFakeBackend({ delayMs: 0 });
    await backend.auth.login({ userName: 'alice', password: EXAMPLE_PASSWORD });
    vi.spyOn(backend.auth, 'currentUser').mockRejectedValueOnce(
      new ApiError(503),
    );
    const queryClient = createQueryClient();
    queryClient.setQueryDefaults(currentUserQueryKey, { retry: false });

    renderWithProviders(<App />, { route: '/', backend, queryClient });
    await userEvent.click(await screen.findByRole('button', { name: 'Retry' }));

    expect(await heading('Start a game')).toBeInTheDocument();
  });
});

describe('sign-in', () => {
  it('checks the fields before sending anything', async () => {
    const backend = createFakeBackend({ delayMs: 0 });
    const login = vi.spyOn(backend.auth, 'login');
    renderWithProviders(<App />, { route: '/login', backend });

    await userEvent.click(
      await screen.findByRole('button', { name: 'Sign in' }),
    );

    expect(screen.getByText('The user name is required.')).toBeInTheDocument();
    expect(screen.getByText('The password is required.')).toBeInTheDocument();
    expect(login).not.toHaveBeenCalled();
  });

  it('tells about a wrong password', async () => {
    renderWithProviders(<App />, { route: '/login' });
    await heading('Sign in');

    await fill('User name', 'alice');
    await fill('Password', 'wrong password');
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText('The user name or the password is wrong.'),
    ).toBeInTheDocument();
  });

  it('tells about too many attempts', async () => {
    const backend = createFakeBackend({ delayMs: 0 });
    vi.spyOn(backend.auth, 'login').mockRejectedValue(new ApiError(429));
    renderWithProviders(<App />, { route: '/login', backend });
    await heading('Sign in');

    await fill('User name', 'alice');
    await fill('Password', EXAMPLE_PASSWORD);
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText(
        'Too many attempts. Wait a moment and try again.',
      ),
    ).toBeInTheDocument();
  });

  it('opens the lobby after a successful sign-in', async () => {
    renderWithProviders(<App />, { route: '/login' });
    await heading('Sign in');

    await fill('User name', 'alice');
    await fill('Password', EXAMPLE_PASSWORD);
    await userEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await heading('Start a game')).toBeInTheDocument();
    expect(screen.getByText('alice')).toBeInTheDocument();
  });
});

describe('registration', () => {
  it('checks the rules of the fields before sending anything', async () => {
    const backend = createFakeBackend({ delayMs: 0 });
    const register = vi.spyOn(backend.auth, 'register');
    renderWithProviders(<App />, { route: '/register', backend });
    await heading('Register');

    await fill('User name', 'al');
    await fill('Email', 'alice');
    await fill('Password', 'short');
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(
      screen.getByText('The user name must be 3 to 20 characters long.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('The email address is not valid.'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('The password must be at least 8 characters long.'),
    ).toBeInTheDocument();
    expect(register).not.toHaveBeenCalled();
  });

  it('shows a taken user name under its field', async () => {
    renderWithProviders(<App />, { route: '/register' });
    await heading('Register');

    await fill('User name', 'Alice');
    await fill('Email', 'someone@example.com');
    await fill('Password', EXAMPLE_PASSWORD);
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(
      await screen.findByText('The user name is already taken.'),
    ).toBeInTheDocument();
  });

  it('shows a message when the server names no field of the form', async () => {
    const backend = createFakeBackend({ delayMs: 0 });
    const problem: ValidationProblem = {
      title: 'One or more validation errors occurred.',
      errors: { $: ['The JSON value could not be converted.'] },
    };
    vi.spyOn(backend.auth, 'register').mockRejectedValue(
      new ApiError(400, problem),
    );
    renderWithProviders(<App />, { route: '/register', backend });
    await heading('Register');

    await fill('User name', 'carol');
    await fill('Email', 'carol@example.com');
    await fill('Password', EXAMPLE_PASSWORD);
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(
      await screen.findByText('Something went wrong. Try again.'),
    ).toBeInTheDocument();
  });

  it('signs the new user in and opens the lobby', async () => {
    renderWithProviders(<App />, { route: '/register' });
    await heading('Register');

    await fill('User name', 'carol');
    await fill('Email', 'carol@example.com');
    await fill('Password', EXAMPLE_PASSWORD);
    await userEvent.click(screen.getByRole('button', { name: 'Register' }));

    expect(await heading('Start a game')).toBeInTheDocument();
    expect(screen.getByText('carol')).toBeInTheDocument();
  });
});

describe('sign-out', () => {
  it('signs out, forgets the data of the user and opens the sign-in page', async () => {
    const backend = createFakeBackend({ delayMs: 0 });
    await backend.auth.login({ userName: 'alice', password: EXAMPLE_PASSWORD });
    const { queryClient } = renderWithProviders(<App />, {
      route: '/',
      backend,
    });
    await heading('Start a game');
    queryClient.setQueryData(['games', 1], { items: [] });

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(await heading('Sign in')).toBeInTheDocument();
    expect(queryClient.getQueryData(currentUserQueryKey)).toBeNull();
    expect(queryClient.getQueryData(['games', 1])).toBeUndefined();
    await expect(backend.auth.currentUser()).resolves.toBeNull();
  });

  it('keeps the user signed in and says so when the sign-out fails', async () => {
    const backend = createFakeBackend({ delayMs: 0 });
    await backend.auth.login({ userName: 'alice', password: EXAMPLE_PASSWORD });
    vi.spyOn(backend.auth, 'logout').mockRejectedValue(new ApiError(503));
    renderWithProviders(<App />, { route: '/', backend });
    await heading('Start a game');

    await userEvent.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Sign-out failed. Try again.',
    );
    expect(
      screen.getByRole('heading', { level: 1, name: 'Start a game' }),
    ).toBeInTheDocument();
  });
});
