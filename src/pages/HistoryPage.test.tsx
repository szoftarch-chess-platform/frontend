import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from '../App';
import { createBackend as createFakeBackend } from '../api/fake';
import { EXAMPLE_PASSWORD, exampleGames } from '../api/fake/examples';
import type { GameSummary } from '../api/types/platform';
import { renderWithProviders } from '../test/render';
import { HISTORY_PAGE_SIZE } from './HistoryPage';

/**
 * Opens the history of alice with `count` games against opponents named Opponent 1, Opponent 2 and so on. The first
 * game keeps the id of an example game, so the fake backend can open its replay.
 */
async function openHistory(route: string, count: number) {
  const backend = createFakeBackend({ delayMs: 0 });
  await backend.auth.login({ userName: 'alice', password: EXAMPLE_PASSWORD });
  const template = exampleGames[1];
  const games: GameSummary[] = Array.from({ length: count }, (_, i) => ({
    ...template,
    id:
      i === 0
        ? template.id
        : `${template.id.slice(0, -4)}${String(i).padStart(4, '0')}`,
    black: { kind: 'bot', name: `Opponent ${i + 1}` },
  }));
  backend.games.list = async (page, pageSize) => ({
    items: games.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageSize,
    totalCount: count,
  });

  renderWithProviders(<App />, { route, backend });
}

/** The rows of the games on the page. */
function gameRows() {
  return screen.getAllByRole('listitem');
}

/** The link of the game against the opponent with this number. */
async function gameLink(opponent: number) {
  return (await screen.findByText(`Opponent ${opponent}`)).closest('a');
}

describe('the history', () => {
  it('lists the games of the user from the side of the user', async () => {
    await openHistory('/history', 1);
    expect(await gameLink(1)).toHaveAttribute(
      'href',
      expect.stringMatching(/^\/history\/0193c2bf-/),
    );
    expect(screen.getByText('Won')).toBeInTheDocument();
    expect(screen.getByText(/You played white/)).toBeInTheDocument();
    expect(screen.getByText(/by checkmate/)).toBeInTheDocument();
    expect(screen.getByText('1 finished game')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Next page' }),
    ).not.toBeInTheDocument();
  });

  it('pages through the games', async () => {
    const count = HISTORY_PAGE_SIZE * 2 + 5;
    await openHistory('/history', count);
    await gameLink(1);
    expect(gameRows()).toHaveLength(HISTORY_PAGE_SIZE);

    await userEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    expect(await gameLink(HISTORY_PAGE_SIZE * 2 + 1)).toBeInTheDocument();
    expect(gameRows()).toHaveLength(5);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();

    await userEvent.click(
      screen.getByRole('button', { name: 'Previous page' }),
    );
    expect(await gameLink(HISTORY_PAGE_SIZE + 1)).toBeInTheDocument();
  });

  it('opens the last page for a page past the end', async () => {
    await openHistory('/history?page=9', HISTORY_PAGE_SIZE + 1);
    expect(await gameLink(HISTORY_PAGE_SIZE + 1)).toBeInTheDocument();
    expect(gameRows()).toHaveLength(1);
  });

  it('offers a game when the user has no finished games', async () => {
    await openHistory('/history?page=2', 0);
    expect(
      await screen.findByRole('heading', { name: 'No finished games yet' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start a game' })).toHaveAttribute(
      'href',
      '/',
    );
  });

  it('opens the replay from a row', async () => {
    await openHistory('/history', 1);
    await userEvent.click((await gameLink(1))!);
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Game against bob',
      }),
    ).toBeInTheDocument();
  });
});
