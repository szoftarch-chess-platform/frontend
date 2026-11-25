# Requests to the other repos

Changes in the other repos that the frontend needs or would benefit from, grouped by the repo that makes the change. Checked against the `dev` branches on 2026-11-24.

Each request says why the frontend needs it, what to change, and which frontend code the change lets us remove. **Needed** marks a bug or a gap that users notice, **team** marks a decision of the team, and **better** marks an improvement that the frontend works around today.

## game-service

### Time of joining the queue (team)

- **Why:** the lobby only shows a spinner while searching, which is an open question in [README.md](README.md). The user leaves the queue when the last connection closes (ADR-10), so a reload ends the waiting, and the tab that joined can count the waiting time from the acknowledgement of `joinQueue`. Another tab of the user learns of the waiting only from `getState`, which does not say when it began.
- **Change:** add the time waited so far, such as `waitedMs`, to the `State` of `getState` in `game-service.asyncapi.yaml`, and send it from the game-service. A duration fits ADR-8, which lets the clients count from the moment a message arrives, so that the clocks of the machines need not agree. A timestamp of the server would need them to agree.
- **Frontend code this removes:** nothing. It allows the same waiting time in every tab.

### Queue events to every connection of the user (better)

- **Why:** when the user joins or leaves the queue in one tab, the other tabs do not know it. They show the searching state only after a reconnect, or after an action of theirs is refused with `alreadyInQueue`, `alreadyInGame` or `notInQueue`. The frontend treats these refusals as "another tab acted first" and asks `getState` to catch up.
- **Change:** add `queueJoined` and `queueLeft` events to the contract, and send them to the room `user:<userId>`.
- **Frontend code this removes:** the catch-up after those refusals, `otherTabCodes` in `src/game/lobby-actions.ts`. The refusals become rare, and they can show a plain error.

### Temporary and permanent failures (better)

- **Why:** the game-service answers an event that failed with `internalError`, which could be a failure that passes, such as a lost connection to Redis, or one that does not. The frontend asks `getState` again without end, with a delay that grows up to 30 seconds, and it shows one general message for the other events.
- **Change:** add a code such as `serviceUnavailable` to `Rejected` in the contract, or a `retryAfterMs` field, and send it when a retry can succeed. gRPC separates its retryable `UNAVAILABLE` from `INTERNAL` the same way.
- **Frontend code this removes:** the endless retry of `getState` in `src/game/connection.ts` after a failure that does not pass, which can show an error instead.

### The state on every connect (better)

- **Why:** after every connect the frontend asks `getState` and retries it until it gets an answer. The banner "Connecting to the game server…" stays until then.
- **Change:** send the state as an event right after the handshake, defined in the contract. The `getState` call can stay for the cases when the client wants to check.
- **Frontend code this removes:** `askState` on every connect in `src/game/connection.ts`. Its retry stays for an event that does not come, for example while Redis is down.

### The reason of a refused handshake (better)

- **Why:** after `connect_error` the frontend does not know whether the token expired or the server is down, so it refreshes the token at every failed connect.
- **Change:** the gateway refuses the HTTP upgrade of a handshake without a valid token, and the WHATWG WebSockets Standard does not let a browser tell a script why a connection failed. So a reason such as `{ code: 'unauthorized' }` can only come from the game-service, as the `data` of `connect_error` after the gateway has let the handshake through. ADR-3 and ADR-4 let the gateway stop such a handshake before it reaches the game-service, so this needs a change of those ADRs.
- **Frontend code this removes:** the guessing in the `connect_error` handler of `src/api/real/game-socket.ts`, with its `connects` counter and `refresh` state. The client refreshes only when the reason says so. The expiry of the access token under the platform-service removes the same code another way.

## platform-service

### Expiry of the access token (better)

- **Why:** the frontend learns that the access token expired only from a 401 or a refused handshake. While a refresh keeps failing, for example while the gateway or the platform-service is down, every retry of Socket.IO also sends a refresh, about one every 5 seconds per tab. These reach no running platform-service.
- **Change:** return the lifetime of the access token, such as `accessTokenExpiresInMs`, in the answers of login, register and refresh, in `platform-service.openapi.yaml` and in the platform-service. A duration fits `expires_in` of OAuth 2.0 in RFC 6749 and the clocks of ADR-8. The refresh answers 204 without a body now, so a body there is an incompatible change of the contract by ADR-7. ADR-4 decides that the frontend refreshes after a 401 or a failed connect, so it changes too. The frontend would refresh before the expiry, and after a failed connect only when the token has expired.
- **Frontend code this removes:** the `connect_error` handler of `src/api/real/game-socket.ts`, with its `connects` counter and `refresh` state, which a timer before the expiry replaces. The tabs share the cookies, so they have to share the new expiry too, or every tab refreshes before it. The refresh after a 401 in `src/api/real/http-client.ts` stays as a fallback.

### A signal that a finished game is stored (better)

- **Why:** a finished game reaches the history through RabbitMQ. The outbox of the game-service sends its events every 1.5 seconds, so a game is usually stored within about 2 seconds after `gameEnded`, and later while RabbitMQ or the platform-service is down. The frontend refetches the finished games right at `gameEnded`, which is usually too early to find the new game, and the lobby refetches its recent games on every visit. The replay retries a 404 every second for 5 seconds, but only when the user comes from the button "Replay the game" of the game page, which passes `justEnded` in the state of the navigation, and 5 seconds is a guess. The history list shows only stored games, so a game opened from it is always found.
- **Change:** tell the client when the game is stored, for example with an event of the game-service after the platform-service has stored it. It needs a new event path in ADR-6 and the contracts. The platform-service would publish the event, which ADR-6 makes reliable only with an outbox, and the game-service would consume it.
- **Frontend code this removes:** the `justEnded` state and the 404 retry of `src/pages/GameReplayPage.tsx`. The game page offers the replay once the game is stored, and the signal refreshes the recent games and the history.

### Statistics and filters of the history (team)

- **Why:** the history page should show at its top how many games the user won, lost and drew, how many ended by resignation, and how many were against the bot or against a person, and let the user filter the list by these. `GET /api/games` only takes `page` and `pageSize`, so the frontend sees one page at a time. The platform-service keeps every game (PS-ADR-13), so counting in the client would mean downloading the whole history, which grows without a limit. The specification does not ask for statistics or filters, since F-6 only asks for viewing the past games, so the team decides first.
- **Change:** in `platform-service.openapi.yaml` and in the platform-service, with the rules of ADR-8 for the names and the enums:
  - Optional filters of `GET /api/games`, which combine with AND. `outcome` is `won`, `lost`, `draw` or `aborted` from the side of the signed-in user, `opponent` is `user` or `bot` by the kind of the other player, and `reason` is a `GameEndReason`, such as `resignation`. `totalCount` counts the games that match, so the pages stay right.
  - A new `GET /api/games/stats` that counts every game of the user by outcome, by reason and by the kind of the opponent, in one answer.
  - PS-ADR-13 describes the filters and the counts. Both fit the query of the games of a user, which already finds them by `white_user_id` or `black_user_id`, and the counts are one grouped query.
  - The contract is in the infra repo, so the change starts there with a new version of the contract (ADR-7). The gateway needs no change, because its route for `/api` already sends every path under it to the platform-service with the token required.
- **Frontend code this removes:** nothing. It allows a summary in the band of `src/pages/HistoryPage.tsx` and filters that live in the URL next to `page`, such as `/history?outcome=won&opponent=bot`. The frontend side changes FE-ADR-4 and FE-ADR-5.

## What the other repos should know

These are decisions of the frontend (FE-ADR-5) that affect the load or the behavior of the other services. They need no change.

- Every signed-in tab keeps a connection to the game-service on every page, not only on the lobby and the game page, so a user who waits in the queue does not miss `gameStarted` (NF-6).
- Every event waits at most 10 seconds for its acknowledgement.
- While the game-service keeps refusing `getState` or does not answer it, every connected tab asks it again, after the first few tries with a random delay of up to 30 seconds.
- While a refresh keeps failing, every retry of Socket.IO sends a refresh again, about one every 5 seconds per tab.
