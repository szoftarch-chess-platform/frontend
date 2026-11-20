# frontend documentation

- System documentation: the `docs/` folder of the infra repo

## ADRs

| ID | Title |
|---|---|
| [FE-ADR-1](adr/stack.md) | TypeScript and Vite |
| [FE-ADR-2](adr/gateway-access.md) | Relative URLs through the gateway |
| [FE-ADR-3](adr/container-image.md) | Container image with nginx |

## Open questions

**Tooling**

- Routing library, for example React Router.
- Server state and data fetching, for example TanStack Query or plain fetch.
- Client state, for example Zustand, Context or Redux Toolkit.
- Chessboard UI, for example react-chessboard. It has to highlight the squares of the legal moves that chess.js gives (ADR-9).
- Styling, for example Tailwind, CSS Modules or a component library.
- Testing, for example Vitest with React Testing Library, and formatting, for example Prettier.
- How the REST API and the Socket.IO protocol are faked in development and in tests (ADR-7), for example with Mock Service Worker or with fakes of the own client modules. The Socket.IO binding of Mock Service Worker does not support acknowledgements.
- Whether to generate TypeScript types from the OpenAPI and AsyncAPI contracts in the infra repo.
- Developing locally with `npm run dev` or inside a Docker container.

**Scope**

- The pages and the routes of the first version, for example sign-in, registration, lobby, game, history and a past game.

## Next steps

- Answer the open questions of the tooling that the first pages need.
- Fake the REST API and the Socket.IO protocol from the examples of the contracts `platform-service.openapi.yaml` and `game-service.asyncapi.yaml` of the infra repo, so the pages work before the services are ready (ADR-7).
- Build registration and sign-in with the rules of ADR-4 checked in the forms, the signed-in user from `GET /api/users/me`, one refresh after a 401 with the parallel requests waiting for it, and sign-out that closes the Socket.IO connection (ADR-4).
- Build the lobby with joining and leaving the queue and starting a game against the bot, and call `getState` after every connect.
- Build the game page with the legal moves of chess.js highlighted (ADR-9), the moves sent with acknowledgements, the piece put back after a refusal, the clocks counted down locally (ADR-8), resignation, and the result with its reason (ADR-10).
- Build the history with paging, and a past game replayed move by move with chess.js (F-6).
- Add the CI workflow of ADR-2.
