import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { createBackend as createFakeBackend } from '../api/fake';
import { EXAMPLE_PASSWORD } from '../api/fake/examples';
import { renderWithProviders } from '../test/render';

async function openLobby() {
  const backend = createFakeBackend({ delayMs: 0, opponentDelayMs: 60000 });
  await backend.auth.login({ userName: 'alice', password: EXAMPLE_PASSWORD });
  renderWithProviders(<App />, { route: '/', backend });
  return backend;
}

function button(name: string) {
  return screen.findByRole('button', { name });
}

describe('the lobby', () => {
  it('searches for an opponent until the user stops', async () => {
    await openLobby();

    await userEvent.click(await button('Find an opponent'));
    expect(
      await screen.findByText('Searching for an opponent…'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Start the game' }),
    ).toBeDisabled();

    await userEvent.click(await button('Stop searching'));
    expect(await button('Find an opponent')).toBeEnabled();
  });

  it('opens the game page when a game against the computer starts', async () => {
    await openLobby();
    await userEvent.click(await button('Start the game'));
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Game' }),
    ).toBeInTheDocument();
  });

  it('opens the game page for a game that is already running', async () => {
    const backend = createFakeBackend({ delayMs: 0 });
    await backend.auth.login({ userName: 'alice', password: EXAMPLE_PASSWORD });
    await backend.gameSocket.emitWithAck('startBotGame', {});

    renderWithProviders(<App />, { route: '/', backend });
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Game' }),
    ).toBeInTheDocument();
  });

  it('shows the recent games from the side of the user', async () => {
    await openLobby();
    expect(await screen.findByText('vs Stockfish bot')).toBeInTheDocument();
    expect(screen.getByText('Lost')).toBeInTheDocument();
    expect(screen.getByText('With black, by resignation')).toBeInTheDocument();
    expect(screen.getByText('Won')).toBeInTheDocument();
  });

  it('keeps the connection when the user changes the page', async () => {
    const backend = await openLobby();
    await vi.waitFor(async () =>
      expect(await button('Find an opponent')).toBeEnabled(),
    );
    const connect = vi.spyOn(backend.gameSocket, 'connect');
    const disconnect = vi.spyOn(backend.gameSocket, 'disconnect');

    await userEvent.click(await screen.findByRole('link', { name: 'History' }));
    await userEvent.click(screen.getByRole('link', { name: 'Lobby' }));
    await button('Find an opponent');

    expect(connect).not.toHaveBeenCalled();
    expect(disconnect).not.toHaveBeenCalled();
  });
});
