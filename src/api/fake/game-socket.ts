import { Chess } from 'chess.js';
import type {
  Answer,
  ClientEvent,
  GameSocket,
  GameSocketEvents,
  Payload,
} from '../game-socket';
import type { Ack, Clock, GameState, Rejected, State } from '../types/game';
import type {
  Color,
  GameEndReason,
  GameResult,
  Player,
  UserPlayer,
} from '../types/shared';
import type { FakeRuntime, FakeState } from './runtime';

const STARTING_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
const INITIAL_MS = 600000;

/**
 * Plays the game-service of ADR-10 in memory. The signed-in user plays against the bot or a fake
 * opponent, who both answer with a random legal move.
 */
export function createFakeGameSocket(runtime: FakeRuntime): GameSocket {
  const handlers = new Map<string, Set<(...args: never[]) => void>>();
  let attempt = 0;
  let wanted = false;
  let opponentTimer: ReturnType<typeof setTimeout> | undefined;
  // For each game: the user who plays it here, when its clock last changed, and the timer that
  // ends it on time.
  const humans = new Map<string, string>();
  const lastChange = new Map<string, number>();
  const timeouts = new Map<string, ReturnType<typeof setTimeout>>();

  function emit(event: string, ...args: unknown[]) {
    handlers
      .get(event)
      ?.forEach((handler) =>
        (handler as (...args: unknown[]) => void)(...args),
      );
  }

  function startGame(state: FakeState, me: UserPlayer, opponent: Player) {
    const [white, black] =
      Math.random() < 0.5 ? [me, opponent] : [opponent, me];
    const game: GameState = {
      gameId: crypto.randomUUID(),
      variant: 'standard',
      white,
      black,
      timeControl: { initialMs: INITIAL_MS },
      startedAt: new Date().toISOString(),
      moves: [],
      fen: STARTING_FEN,
      clock: {
        ...(white.kind === 'user' && { whiteMs: INITIAL_MS }),
        ...(black.kind === 'user' && { blackMs: INITIAL_MS }),
        ...(white.kind === 'user' && { running: 'white' as const }),
      },
    };
    state.games.push(game);
    humans.set(game.gameId, me.userId);
    lastChange.set(game.gameId, Date.now());
    emit('gameStarted', { game: structuredClone(game) });
    afterTurn(state, game);
  }

  function findOpponent(state: FakeState, me: UserPlayer) {
    clearTimeout(opponentTimer);
    opponentTimer = setTimeout(() => {
      if (!state.queue.includes(me.userId)) {
        return;
      }
      const other = state.users.find(
        (user) =>
          user.id !== me.userId &&
          !state.games.some((game) => playsIn(game, user.id)),
      );
      if (!other) {
        return;
      }
      state.queue = state.queue.filter((id) => id !== me.userId);
      startGame(state, me, {
        kind: 'user',
        userId: other.id,
        name: other.userName,
      });
    }, runtime.opponentDelayMs);
  }

  /** The clock of a game as it is now, with the time since the last change taken off. */
  function currentClock(game: GameState): Clock {
    const clock = { ...game.clock };
    const elapsed = Date.now() - (lastChange.get(game.gameId) ?? Date.now());
    if (clock.running === 'white' && clock.whiteMs !== undefined) {
      clock.whiteMs = Math.max(0, clock.whiteMs - elapsed);
    }
    if (clock.running === 'black' && clock.blackMs !== undefined) {
      clock.blackMs = Math.max(0, clock.blackMs - elapsed);
    }
    return clock;
  }

  function play(state: FakeState, game: GameState, move: string): boolean {
    const chess = replay(game);
    try {
      chess.move(toMove(move));
    } catch {
      return false;
    }
    const next = colorOfTurn(chess);
    game.clock = currentClock(game);
    game.clock.running = game[next].kind === 'user' ? next : undefined;
    game.fen = chess.fen();
    game.moves.push(move);
    lastChange.set(game.gameId, Date.now());
    emit('moveMade', {
      gameId: game.gameId,
      move,
      fen: game.fen,
      clock: structuredClone(game.clock),
    });

    const end = endOf(chess);
    if (end) {
      finish(state, game, end.result, end.reason);
    } else {
      afterTurn(state, game);
    }
    return true;
  }

  /** Starts the timer of the running clock, and the answer of the side that the fake plays. */
  function afterTurn(state: FakeState, game: GameState) {
    clearTimeout(timeouts.get(game.gameId));
    const running = game.clock.running;
    const left = running && game.clock[`${running}Ms`];
    if (running && left !== undefined) {
      timeouts.set(
        game.gameId,
        setTimeout(() => endOnTime(state, game, running), left),
      );
    }

    const turn = colorOfTurn(replay(game));
    const player = game[turn];
    if (player.kind === 'user' && player.userId === humans.get(game.gameId)) {
      return;
    }
    setTimeout(() => {
      const chess = replay(game);
      if (!state.games.includes(game) || colorOfTurn(chess) !== turn) {
        return;
      }
      const moves = chess.moves({ verbose: true });
      const choice = moves[Math.floor(Math.random() * moves.length)];
      play(state, game, choice.from + choice.to + (choice.promotion ?? ''));
    }, runtime.moveDelayMs);
  }

  function endOnTime(state: FakeState, game: GameState, loser: Color) {
    if (!state.games.includes(game)) {
      return;
    }
    game.clock = { ...currentClock(game), [`${loser}Ms`]: 0 };
    const winner = other(loser);
    const result: GameResult = canMate(replay(game), winner)
      ? `${winner}Won`
      : 'draw';
    finish(state, game, result, 'timeout');
  }

  function finish(
    state: FakeState,
    game: GameState,
    result: GameResult,
    reason: GameEndReason,
  ) {
    clearTimeout(timeouts.get(game.gameId));
    game.clock = currentClock(game);
    delete game.clock.running;
    humans.delete(game.gameId);
    lastChange.delete(game.gameId);
    timeouts.delete(game.gameId);
    state.games = state.games.filter((g) => g !== game);
    state.finished.push({
      id: game.gameId,
      variant: game.variant,
      white: game.white,
      black: game.black,
      result,
      reason,
      startedAt: game.startedAt,
      endedAt: new Date().toISOString(),
      timeControl: game.timeControl,
      moves: [...game.moves],
    });
    emit('gameEnded', {
      gameId: game.gameId,
      result,
      reason,
      clock: structuredClone(game.clock),
    });
  }

  function handle(
    state: FakeState,
    event: ClientEvent,
    payload: Payload<ClientEvent>,
  ): State | Ack {
    const user = state.users.find((u) => u.id === state.signedInUserId);
    if (!user) {
      return rejected('internalError', 'No user is signed in.');
    }
    const me: UserPlayer = {
      kind: 'user',
      userId: user.id,
      name: user.userName,
    };
    const queued = state.queue.includes(me.userId);
    const game = state.games.find((g) => playsIn(g, me.userId));

    switch (event) {
      case 'getState':
        return {
          ok: true,
          queued,
          game: game && { ...game, clock: currentClock(game) },
        };
      case 'joinQueue':
      case 'startBotGame':
        if (queued) {
          return rejected('alreadyInQueue');
        }
        if (game) {
          return rejected('alreadyInGame');
        }
        if (event === 'joinQueue') {
          state.queue.push(me.userId);
          findOpponent(state, me);
        } else {
          startGame(state, me, { kind: 'bot', name: 'Stockfish bot' });
        }
        return { ok: true };
      case 'leaveQueue':
        if (!queued) {
          return rejected('notInQueue');
        }
        state.queue = state.queue.filter((id) => id !== me.userId);
        clearTimeout(opponentTimer);
        return { ok: true };
      case 'makeMove': {
        const { gameId, move } = payload as Payload<'makeMove'>;
        if (!game || game.gameId !== gameId) {
          return rejected('gameNotFound');
        }
        if (colorOfTurn(replay(game)) !== colorIn(game, me.userId)) {
          return rejected('notYourTurn');
        }
        return play(state, game, move) ? { ok: true } : rejected('illegalMove');
      }
      case 'resign': {
        const { gameId } = payload as Payload<'resign'>;
        if (!game || game.gameId !== gameId) {
          return rejected('gameNotFound');
        }
        const winner = other(colorIn(game, me.userId));
        finish(state, game, `${winner}Won`, 'resignation');
        return { ok: true };
      }
    }
  }

  return {
    connect: () => {
      wanted = true;
      const current = ++attempt;
      void runtime
        .answer(() => undefined)
        .then(() => {
          if (wanted && current === attempt) {
            emit('connect');
          }
        });
    },

    disconnect: () => {
      wanted = false;
    },

    emitWithAck: <E extends ClientEvent>(event: E, payload: Payload<E>) =>
      runtime.answer((state) => handle(state, event, payload) as Answer<E>),

    on: <E extends keyof GameSocketEvents>(
      event: E,
      handler: GameSocketEvents[E],
    ) => {
      const set = handlers.get(event) ?? new Set();
      set.add(handler);
      handlers.set(event, set);
      return () => {
        set.delete(handler);
      };
    },
  };
}

/** The game from its start, so that chess.js knows the repetitions. */
function replay(game: GameState): Chess {
  const chess = new Chess();
  game.moves.forEach((move) => chess.move(toMove(move)));
  return chess;
}

function toMove(move: string) {
  return {
    from: move.slice(0, 2),
    to: move.slice(2, 4),
    promotion: move.slice(4) || undefined,
  };
}

function endOf(
  chess: Chess,
): { result: GameResult; reason: GameEndReason } | undefined {
  if (chess.isCheckmate()) {
    return { result: `${other(colorOfTurn(chess))}Won`, reason: 'checkmate' };
  }
  const draws: [boolean, GameEndReason][] = [
    [chess.isStalemate(), 'stalemate'],
    [chess.isThreefoldRepetition(), 'threefoldRepetition'],
    [chess.isInsufficientMaterial(), 'insufficientMaterial'],
    [chess.isDrawByFiftyMoves(), 'fiftyMoveRule'],
  ];
  const draw = draws.find(([ended]) => ended);
  return draw && { result: 'draw', reason: draw[1] };
}

/** Whether a color has more than the king, or the king with a single bishop or knight. */
function canMate(chess: Chess, color: Color): boolean {
  const pieces = chess
    .board()
    .flat()
    .filter((piece) => piece && piece.color === color[0] && piece.type !== 'k');
  return !(
    pieces.length === 0 ||
    (pieces.length === 1 && ['b', 'n'].includes(pieces[0]!.type))
  );
}

function colorOfTurn(chess: Chess): Color {
  return chess.turn() === 'w' ? 'white' : 'black';
}

function colorIn(game: GameState, userId: string): Color {
  const { white } = game;
  return white.kind === 'user' && white.userId === userId ? 'white' : 'black';
}

function other(color: Color): Color {
  return color === 'white' ? 'black' : 'white';
}

function playsIn(game: GameState, userId: string): boolean {
  return [game.white, game.black].some(
    (player) => player.kind === 'user' && player.userId === userId,
  );
}

function rejected(code: string, message = `Refused with ${code}.`): Rejected {
  return { ok: false, error: { code, message } };
}
