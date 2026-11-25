import type { ClientEvents, ServerEvents } from './types/game';

export type ClientEvent = keyof ClientEvents;

export type Payload<E extends ClientEvent> = Parameters<ClientEvents[E]>[0];

export type Answer<E extends ClientEvent> = Parameters<
  Parameters<ClientEvents[E]>[1]
>[0];

export type GameSocketEvents = ServerEvents & {
  connect: () => void;
  disconnect: () => void;
};

/** The Socket.IO connection to the live games of the game-service. */
export type GameSocket = {
  connect(): void;
  disconnect(): void;
  emitWithAck<E extends ClientEvent>(
    event: E,
    payload: Payload<E>,
  ): Promise<Answer<E>>;
  /** Returns a function that removes the handler. */
  on<E extends keyof GameSocketEvents>(
    event: E,
    handler: GameSocketEvents[E],
  ): () => void;
};
