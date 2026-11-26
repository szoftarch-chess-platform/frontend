import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from '../App';
import { createBackend as createFakeBackend } from '../api/fake';
import { EXAMPLE_PASSWORD, exampleGames } from '../api/fake/examples';
import { renderWithProviders } from '../test/render';

async function openReplay(gameId: string) {
  const backend = createFakeBackend({ delayMs: 0 });
  await backend.auth.login({ userName: 'alice', password: EXAMPLE_PASSWORD });
  renderWithProviders(<App />, { route: `/history/${gameId}`, backend });
}

describe('the replay', () => {
  it('starts at the final position and steps through the moves', async () => {
    const game = exampleGames[1];
    const total = game.moves.length;
    await openReplay(game.id);

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Game against bob',
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(`Move ${total} of ${total}`)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Qxf7#' })).toHaveAttribute(
      'aria-current',
      'step',
    );

    await userEvent.click(screen.getByRole('button', { name: 'First move' }));
    expect(screen.getByText(`Move 0 of ${total}`)).toBeInTheDocument();
    await userEvent.keyboard('{ArrowRight}{ArrowRight}');
    expect(screen.getByText(`Move 2 of ${total}`)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'e4' }));
    expect(screen.getByText(`Move 1 of ${total}`)).toBeInTheDocument();
  });

  it('says so for a game that is not one of the user', async () => {
    await openReplay('0193c2bf-0000-7000-8000-000000000000');
    expect(
      await screen.findByText(
        'This game does not exist, or you did not play it.',
      ),
    ).toBeInTheDocument();
  });
});
