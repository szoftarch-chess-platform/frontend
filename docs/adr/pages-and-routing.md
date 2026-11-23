# FE-ADR-4: Pages and routing with React Router

**Related:** F-1, F-2, F-5, F-6, X-1, ADR-1, ADR-4, ADR-8, ADR-10, [FE-ADR-3](container-image.md), [FE-ADR-5](state-management.md)

## Context

The first version covers the core features and the chess clock (ADR-1). The router, the state and the fakes all depend on the pages that exist. ADR-10 lets a user play one game at a time, and `getState` of the game-service returns that game after every connect. nginx answers every path that is not a file with `index.html` (FE-ADR-3), so the SPA can use real URLs.

## Decision

- The first version has these pages:

| Route | Page | Access |
|---|---|---|
| `/login` | sign-in | guests only |
| `/register` | registration | guests only |
| `/` | lobby, with the queue, the game against the bot and the last three finished games | signed-in users |
| `/game` | the current live game | signed-in users |
| `/history` | the finished games of the user, one page at a time | signed-in users |
| `/history/:gameId` | a finished game, replayed move by move | signed-in users |

- `/game` has no id in its path, because a user has at most one game.
- The lobby and the game are separate pages. Every signed-in page opens `/game` when `gameStarted` arrives, and the lobby opens it when `getState` reports a game. `/game` opens the lobby when the user has no game.
- The game page shows no list of the moves in the first version. The board marks the last move.
- The clocks show `m:ss`, and seconds with tenths under 10 seconds, such as `9.4`. Under 30 seconds a clock turns red with the `clock.low` token. The running clock is highlighted and the waiting one is muted. The bot has no clock box, only the text "No clock". A clock at zero shows `0.0` until `gameEnded` arrives, because only the game-service ends a game on time.
- After `gameEnded` the user stays on `/game`, which shows the result, its reason and the final position with a button back to the lobby and a button that opens the replay of the game.
- The replay at `/history/:gameId` opens at the final position. The user steps through the game with buttons, the arrow keys and Home and End, and a list of the moves in UCI, numbered in pairs, opens the position after a move. Right after the end of a game the page asks again for a few seconds, because the game reaches the history through the message broker.
- A guest who opens a page for signed-in users goes to `/login`. A signed-in user who opens `/login` or `/register` goes to `/`. There is no landing page.
- The routing uses React Router 8 in its declarative library mode. The framework mode, its route modules and its loaders are not used.
- A guard is a wrapper component that renders `Navigate`. The number of the history page comes from the `page` query parameter, and the app reads it as an integer of at least 1, otherwise as 1.

## Rationale

- The id of the game would only repeat what `getState` already returns, and nobody else can open the game of a user.
- Separate pages for the lobby and the game are easier to build and to test, and a reload loses nothing, because `getState` restores the state.
- On the result page the user can still look at the final position.
- The replay is a page of its own, so it can be linked, it survives a reload, and the history opens the same page.
- ADR-8 allows UCI and rules out SAN for the first version, so the replay lists the moves in UCI.
- In the last seconds every tenth counts, as on the big chess sites, while tenths during the whole game would only distract. The game-service checks the clocks once a second, so `gameEnded` can come up to about a second after zero.
- ADR-8 shows no SAN in the first version, and few players read a list in UCI, so a list would add little to the board during a game.
- A game can start while the user is on another page, for example after a pairing in the queue or a game started in another tab, and its clock runs from the start.
- A guest can only register or sign in in the first version, so a landing page would show nothing else.
- React Router is the most widely used router of React, so the team knows it and finds the most examples. The app has six routes, and its declarative mode covers guards, a route parameter and a query parameter. The data loading belongs to TanStack Query (FE-ADR-5), so the loaders are not needed.

## Rejected alternatives

- **`/game/:gameId`:** a second way to address the one game of the user, with a page for an id that is not the current game.
- **One page that switches between the lobby and the game:** fewer routes, but one component with two jobs.
- **`m:ss` all the time:** simpler, but the last seconds look frozen between the ticks.
- **A list of the moves in UCI:** it follows ADR-8, but it is hard to read.
- **A list of the moves in SAN, derived with chess.js:** the most readable and frontend work only, but ADR-8 rules out SAN for the first version, so the team has to change ADR-8 first.
- **The replay on the game page or in a dialog:** no wait for the history, but it would be lost after a reload, and the history would need a replay of its own anyway.
- **Returning to the lobby automatically after the end:** the user could not look at the final position.
- **TanStack Router:** typed routes and search parameters, but less known, and for six routes its typing saves only the parsing of one number.
- **wouter:** small, but guards and query parameters are more manual, and its community is smaller.
- **Switching views without a router:** the back button, a reload and links to a past game would not work.

## Consequences

- A redirect from `/game` to the lobby must not happen while the result of an ended game is shown, even if the socket reconnects and `getState` reports no game.
- The parsing of the `page` parameter has a test, because React Router does not type it.

## Sources

- React Router modes: https://reactrouter.com/start/modes
