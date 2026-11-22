# FE-ADR-5: Server state with TanStack Query and game state with Zustand

**Related:** F-1, F-2, F-6, NF-7, X-1, ADR-3, ADR-4, ADR-8, ADR-10, [FE-ADR-4](pages-and-routing.md), [FE-ADR-8](testing.md), [FE-ADR-9](fake-backends.md)

## Context

The app has two kinds of state. The REST API of the platform-service gives the signed-in user, the auth operations and the history of finished games. The game-service pushes the live game over Socket.IO with `gameStarted`, `moveMade` and `gameEnded`, and it answers the events of the client with acknowledgements. The live game changes from socket handlers outside React, it has to survive a change between the lobby and the game page, and the clocks change several times a second.

ADR-4 asks that the client refreshes the tokens once after a 401 and repeats the request. The contract `platform-service.openapi.yaml` adds that the tabs of a browser share the cookies, so the client sends one refresh at a time across all of its tabs.

## Decision

- **REST:** TanStack Query 5 on top of an own `apiFetch` function.
  - `apiFetch` sends the request, reads the ProblemDetails of an error, and on a 401 refreshes the tokens and repeats the request once.
  - The refresh runs under a Web Lock, so only one tab refreshes at a time. A request that waited for the lock repeats itself first, and it refreshes only if it gets 401 again.
  - The signed-in user is the query `['me']` of `GET /api/users/me`. The guards, the header and the game page read it from there.
  - The history uses the queries `['games', page]`, which keep the previous page while the next one loads, and `['game', id]`.
  - Registration and sign-in are mutations that write the returned user into `['me']`. Sign-out clears the whole cache.
  - Answers with a status from 400 to 499 are not retried.
- **Live game:** one Zustand store.
  - It holds the status of the user, which is idle, queued, playing or ended, the game, the clock with the time it arrived, the move that waits for its acknowledgement, and the result.
  - The socket handlers call the actions of the store directly, also outside React.
  - Components read the store with selectors, so a change of the clock renders only the clocks.
  - The changes of the state are pure functions, such as `applyMoveMade(state, event)`.
  - Sign-out resets the store.
- The same refresh function serves `apiFetch` and the reconnect of the socket after `connect_error`.

## Rationale

- TanStack Query gives the loading and error states, caching, deduplication and paging without own code in every page. Finished games never change, so a cached game opens at once.
- With the user as a query, no client store has to hold it, and clearing the cache on sign-out removes every data of the previous user.
- TanStack Query is made for data that the client asks for. Pushed events fit a client store better.
- Zustand can be changed from outside React without a provider, and its selectors render only the components whose part of the state changed. It needs little code for one store.
- Pure functions for the changes can be tested without a socket.
- The Web Locks API is supported by Chrome, Firefox and Edge, which NF-7 names, and it is the way that the identity providers send one refresh across tabs, as ADR-4 describes.

## Rejected alternatives

- **Plain `fetch` with own hooks:** no dependency, but the loading states, the order of the answers, the cache and its clearing would be written and tested by hand.
- **SWR:** similar to TanStack Query, with weaker support for mutations and paging.
- **RTK Query and Redux Toolkit:** well structured, but much setup for one store.
- **React Context with `useReducer`:** no dependency, but a socket handler outside React needs the dispatch passed in, and every consumer renders on every tick of the clock unless the context is split.
- **Jotai:** atoms fit many independent values better than one object that changes with every event.
- **A refresh queue inside one tab only:** two tabs could refresh at the same time and end the session.

## Consequences

- jsdom has no Web Locks API, so the tests replace it (FE-ADR-8).
- The game page must not depend on the order of the acknowledgement of `makeMove` and of `moveMade`, and `gameEnded` also puts back a move that waits for its acknowledgement.

## Open questions

- When the socket connects and disconnects, for example once after sign-in for the whole session, or only on the lobby and the game page.

## Sources

- TanStack Query: https://tanstack.com/query/latest
- Zustand: https://github.com/pmndrs/zustand
- MDN, Web Locks API: https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API
