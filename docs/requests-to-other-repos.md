# Requests to the other repos

Changes in the other repos that the frontend needs or would benefit from, grouped by the repo that makes the change. Checked against the `dev` branches on 2026-11-23.

Each request says why the frontend needs it, what to change, and which frontend code the change lets us remove. **Needed** marks a bug or a gap that users notice, **team** marks a decision of the team, and **better** marks an improvement that the frontend works around today.

## infra

### Order of `gameStarted` and the acknowledgement of `joinQueue` (better)

- **Why:** when the game-service pairs a user at once, it sends `gameStarted` before the acknowledgement of `joinQueue`. The contract does not say which comes first, so the frontend has to handle both orders, and an acknowledgement that arrives late must not turn a started game back into waiting.
- **Change:** say the order in `game-service.asyncapi.yaml`, for example that the acknowledgement always comes before `gameStarted`.
- **Frontend code this removes:** nothing. Handling both orders stays good practice for events that arrive asynchronously, but the documented order makes the behavior predictable.

### SAN in the move list (team)

- **Why:** the game page shows no move list, and the replay shows the moves in UCI (`1. e2e4 e7e5`), which is hard to read. A list in SAN (`1. e4 e5 2. Nf3`) is frontend work only, because chess.js derives it from the UCI moves, but ADR-8 says that the team does not show SAN in the first version.
- **Change:** allow SAN in the user interface in ADR-8. The contracts stay in UCI.
- **Frontend code this removes:** nothing. It replaces the UCI list of `src/pages/GameReplayPage.tsx` and allows a move list on the game page.

## game-service

### The clock of `getState` (needed)

- **Why:** `getState` returns the clock as it was stored at the last move, without the time that has passed since then. After a reload or a reconnect the running clock shows too much time until the next `moveMade`. The frontend does not work around it, because it cannot know when the clock was stored.
- **Change:** in `getState` subtract `now − lastMoveTimestamp` from the running side before returning the game (`src/game/game.service.ts`, `getState`).
- **Frontend code this removes:** nothing, the frontend shows the server's value as it is.

### Closing a connection without identity headers (needed)

- **Why:** the game-service calls `client.disconnect(true)` when the identity headers are missing (`src/game/game.gateway.ts`, `handleConnection`). The client sees it as `io server disconnect`, which Socket.IO does not reconnect after, so the frontend connects again itself. That reconnect is there only for this case, because a stopping game-service closes the connections without telling the client, which the client sees as `transport close` and reconnects after on its own. If the headers stay missing, the two loop without any delay. It only happens without the gateway, for example in a test setup.
- **Change:** refuse such a handshake in a Socket.IO middleware with `next(new Error(...))`. The client then gets `connect_error`, refreshes its token and retries with the growing delay of Socket.IO.
- **Frontend code this removes:** the `disconnect` handler that calls `socket.connect()` in `src/api/real/game-socket.ts`. A server that closes a connection on purpose then keeps it closed, as Socket.IO intends.

### Leaving the queue on sign-out (team)

- **Why:** the game-service keeps a user in the queue after the user's connection closes. A user who signs out or closes the tab while searching can still be paired, and the opponent then waits up to 10 minutes for the absent player's clock.
- **Change:** remove the user from the queue when the last connection of the user closes, in `handleDisconnect`. ADR-10 in infra has to say it, because it says nothing about leaving the queue by disconnecting. The frontend alone can only send `leaveQueue` before its own sign-out, which does not cover closing the tab.
- **Frontend code this removes:** nothing. The fake game service keeps queued users after a sign-out to behave like the real one, and it changes with it.

### Time of joining the queue (team)

- **Why:** the lobby only shows a spinner while searching, which is an open question in [README.md](README.md). A count of the waiting time in the client would start again after a reload.
- **Change:** add `queuedAt` to the `State` of `getState` in `game-service.asyncapi.yaml` and send it from the game-service.
- **Frontend code this removes:** nothing. It allows a waiting time in the lobby.

### Queue events to every connection of the user (better)

- **Why:** when the user joins or leaves the queue in one tab, the other tabs do not know it. They show the searching state only after a reconnect, or after an action of theirs is refused with `alreadyInQueue`, `alreadyInGame` or `notInQueue`. The frontend treats these refusals as "another tab acted first" and asks `getState` to catch up.
- **Change:** add `queueJoined` and `queueLeft` events to the contract, and send them to the room `user:<userId>`.
- **Frontend code this removes:** the catch-up after those refusals, `otherTabCodes` in `src/game/lobby-actions.ts`. The refusals become rare, and they can show a plain error.

### Temporary and permanent failures (better)

- **Why:** a refused `getState` or move with `internalError` could be a failure that passes, or one that does not. The frontend asks `getState` again every 2 seconds without end, which may be too often or useless.
- **Change:** add a code such as `serviceUnavailable`, or a `retryAfterMs` field to `Rejected` in the contract, and send it when a retry can succeed.
- **Frontend code this removes:** the fixed retry of `STATE_RETRY_MS` in `src/game/connection.ts`. The client retries only what can succeed, after the delay that the server asks for, and shows an error for the rest.

### The state on every connect (better)

- **Why:** after every connect the frontend asks `getState` and retries it until it gets an answer. The banner "Connecting to the game server…" stays until then.
- **Change:** send the state as an event right after the handshake, defined in the contract. The `getState` call can stay for the cases when the client wants to check.
- **Frontend code this removes:** `askState` on every connect and its retry in `src/game/connection.ts`.

### The reason of a refused handshake (better)

- **Why:** after `connect_error` the frontend does not know whether the token expired or the server is down, so it refreshes the token at every failed connect.
- **Change:** pass a reason such as `{ code: 'unauthorized' }` with the refused handshake. ADR-3 and ADR-4 let the gateway stop a handshake without a valid token before it reaches the game-service, so the gateway would have to pass the reason on too, which needs a change of those ADRs.
- **Frontend code this removes:** the guessing in the `connect_error` handler of `src/api/real/game-socket.ts`, with its `connects` counter and `refresh` state. The client refreshes only when the reason says so. The expiry of the access token under the platform-service removes the same code another way.

## platform-service

### Expiry of the access token (better)

- **Why:** the frontend learns that the access token expired only from a 401 or a refused handshake. While the gateway is down, every retry of Socket.IO also sends a refresh, about one every 5 seconds per tab.
- **Change:** return the expiry, such as `accessTokenExpiresAt`, in the answers of login, register and refresh, in `platform-service.openapi.yaml` and in the platform-service. The frontend would refresh before the expiry, and after a failed connect only when the token has expired.
- **Frontend code this removes:** the `connect_error` handler of `src/api/real/game-socket.ts`, with its `connects` counter and `refresh` state, which a timer before the expiry replaces. The refresh after a 401 in `src/api/real/http-client.ts` stays as a fallback.

### A signal that a finished game is stored (better)

- **Why:** a finished game reaches the history through RabbitMQ, so it may be missing for a moment after `gameEnded`. The lobby refetches the recent games on every visit. The replay retries a 404 every second for 5 seconds, but only when the user comes from the button "Replay the game" of the game page, which passes `justEnded` in the state of the navigation. A user who opens the game from the history list right after the end still sees "not found", and 5 seconds is a guess.
- **Change:** tell the client when the game is stored, for example with an event of the game-service after the platform-service has stored it. It needs a new event path in ADR-6 and the contracts.
- **Frontend code this removes:** the `justEnded` state and the 404 retry of `src/pages/GameReplayPage.tsx`. The game page offers the replay once the game is stored, and the signal refreshes the recent games and the history.

## What the other repos should know

These are decisions of the frontend (FE-ADR-5) that affect the load or the behavior of the other services. They need no change.

- Every signed-in tab keeps a connection to the game-service on every page, not only on the lobby and the game page, so a user who waits in the queue does not miss `gameStarted` (NF-6).
- While the game-service keeps refusing `getState`, every connected tab asks it again every 2 seconds.
- While the gateway is down, every retry of Socket.IO sends a refresh to the platform-service, about one every 5 seconds per tab.
- The client connects again after the game-service closes a connection with `socket.disconnect()`, so the game-service must not close one for a reason that a new connect does not fix.
