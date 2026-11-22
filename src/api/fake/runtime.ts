import type { GameState } from '../types/game';
import { exampleUsers } from './examples';

export type FakeUser = {
  id: string;
  userName: string;
  email: string;
  password: string;
};

export type FakeState = {
  users: FakeUser[];
  signedInUserId?: string;
  queue: string[];
  games: GameState[];
};

export type FakeOptions = {
  delayMs?: number;
  /** How long the queue waits before a fake opponent joins it. */
  opponentDelayMs?: number;
};

/** The in-memory state of the fakes. Every answer is a copy, as from a server. */
export class FakeRuntime {
  readonly state: FakeState = {
    users: exampleUsers.map((user) => ({ ...user })),
    queue: [],
    games: [],
  };
  readonly opponentDelayMs: number;
  private readonly delayMs: number;

  constructor({ delayMs = 300, opponentDelayMs = 3000 }: FakeOptions = {}) {
    this.delayMs = delayMs;
    this.opponentDelayMs = opponentDelayMs;
  }

  async answer<T>(handle: (state: FakeState) => T): Promise<T> {
    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }
    const result = handle(this.state);
    return result === undefined ? result : structuredClone(result);
  }
}
