import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from '../App';
import { createBackend as createFakeBackend } from '../api/fake';
import { EXAMPLE_PASSWORD } from '../api/fake/examples';
import { renderWithProviders } from '../test/render';

async function openBotGameAsWhite() {
  // The user plays white, and the bot always takes its first legal move.
  vi.spyOn(Math, 'random').mockReturnValue(0.1);
  const backend = createFakeBackend({ delayMs: 0, moveDelayMs: 500 });
  await backend.auth.login({ userName: 'alice', password: EXAMPLE_PASSWORD });
  await backend.gameSocket.emitWithAck('startBotGame', {});
  renderWithProviders(<App />, { route: '/game', backend });
  await screen.findByRole('heading', {
    level: 1,
    name: 'Game against Stockfish bot',
  });
  return backend;
}

function square(name: string) {
  return document.querySelector(`#game-board-square-${name}`)!;
}

describe('the game page', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('makes a move with two clicks and waits for the computer', async () => {
    await openBotGameAsWhite();
    expect(await screen.findByText('Your move')).toBeInTheDocument();

    await userEvent.click(square('e2'));
    await userEvent.click(square('e4'));

    expect(
      await screen.findByText('The computer is thinking'),
    ).toBeInTheDocument();
    expect(await screen.findByText('Your move')).toBeInTheDocument();
  });

  it('resigns after the confirmation and goes back to the lobby', async () => {
    await openBotGameAsWhite();

    await userEvent.click(screen.getByRole('button', { name: 'Resign' }));
    const dialog = await screen.findByRole('alertdialog');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Resign' }),
    );

    expect(await screen.findByText('by resignation')).toBeInTheDocument();
    expect(screen.getByText('Lost')).toBeInTheDocument();
    await userEvent.click(
      screen.getByRole('button', { name: 'Back to lobby' }),
    );
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Start a game' }),
    ).toBeInTheDocument();
  });

  it('opens the replay of the game after the end', async () => {
    await openBotGameAsWhite();
    await userEvent.click(screen.getByRole('button', { name: 'Resign' }));
    const dialog = await screen.findByRole('alertdialog');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Resign' }),
    );

    await userEvent.click(
      await screen.findByRole('button', { name: 'Replay the game' }),
    );
    expect(await screen.findByText('Move 0 of 0')).toBeInTheDocument();
  });
});
