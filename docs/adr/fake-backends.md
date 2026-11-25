# FE-ADR-9: Fakes of the own client modules and the fake mode

**Related:** ADR-2, ADR-4, ADR-7, ADR-10, [FE-ADR-2](gateway-access.md), [FE-ADR-5](state-management.md), [FE-ADR-8](testing.md), [FE-ADR-10](contract-types.md)

## Context

ADR-7 asks every consumer to replace its provider with a fake in its own repo, built from the examples of the contract, and `infra` runs no mock server. The frontend uses the REST API of the platform-service and the Socket.IO events of the game-service, and every event of the client gets an acknowledgement. The pages have to work in the browser and in the tests before the services implement the contracts, while the production build must use the real services.

## Decision

- The app reaches the services only through own interfaces in `src/api/`, which are `AuthApi`, `GamesApi` and `GameSocket`. The pages, the queries and the store depend only on these.
- Every interface has a real implementation, on the own HTTP client and on socket.io-client, and a fake one in `src/api/fake/`.
- The fakes keep their data in memory, start from the examples of the contracts, and follow the rules of the contracts. Registration answers 409 for a user name or an email address that is taken. The fake socket checks the moves with chess.js, answers with a random legal move of the bot, pairs the queue with a fake opponent, takes the user out of the queue when the connection closes, runs the clocks and ends the game as ADR-10 describes. The tests can make the fakes refuse the next event or answer later.
- The HTTP client and the real socket are not used in the fake mode, so they have tests of their own.
- The fake mode is the Vite mode `fake`, which `npm run dev:fake` starts. The committed `.env.fake` sets `VITE_FAKE_BACKEND`.
- One module chooses the implementation by this variable, and it imports the fakes dynamically, so the production build does not contain them.
- In the fake mode the dev server runs on `http://localhost:5173` without the certificate and the proxy of FE-ADR-2, so it does not need the infra repo.
- The app shows a badge in the fake mode.

## Rationale

- One technique serves both the REST API and Socket.IO, and an acknowledgement is just the return value of a function.
- The Socket.IO binding of Mock Service Worker does not support acknowledgements, so the socket would need an own fake anyway.
- A fake of a module needs no second program, as ADR-7 prefers.
- Vite replaces the variable at build time, so the production build drops the branch of the fakes.
- The fakes use no cookies, and the browsers treat `http://localhost` as a secure context, so the Web Locks API still works without HTTPS.

## Rejected alternatives

- **Mock Service Worker for the REST API:** the real HTTP client would run against the fakes, but a second technique next to the fake of the socket. It can still be added later without changing the pages.
- **A local fake server:** the most realistic, but a small backend of its own that ADR-7 avoids.
- **A switch at runtime, such as a query parameter:** the fakes would be part of the production build.
- **Fakes only in the tests:** no work in the browser before the services are ready.

## Consequences

- A change of a contract changes the fakes too.
- Whether the production build contains no fake code is checked once in `dist/`.

## Sources

- Vite env variables and modes: https://vite.dev/guide/env-and-mode
- Mock Service Worker, Socket.IO binding: https://github.com/mswjs/socket.io-binding
- MDN, secure contexts: https://developer.mozilla.org/en-US/docs/Web/Security/Secure_Contexts
