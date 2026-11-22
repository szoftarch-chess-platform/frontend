# frontend documentation

- System documentation: the `docs/` folder of the infra repo

## ADRs

| ID | Title |
|---|---|
| [FE-ADR-1](adr/stack.md) | TypeScript and Vite |
| [FE-ADR-2](adr/gateway-access.md) | Relative URLs through the gateway |
| [FE-ADR-3](adr/container-image.md) | Container image with nginx |
| [FE-ADR-4](adr/pages-and-routing.md) | Pages and routing with React Router |
| [FE-ADR-5](adr/state-management.md) | Server state with TanStack Query and game state with Zustand |
| [FE-ADR-6](adr/chessboard.md) | react-chessboard for the board |
| [FE-ADR-7](adr/styling.md) | Chakra UI for the components and the themes |
| [FE-ADR-8](adr/testing.md) | Tests with Vitest and formatting with Prettier |
| [FE-ADR-9](adr/fake-backends.md) | Fakes of the own client modules and the fake mode |
| [FE-ADR-10](adr/contract-types.md) | Hand-written types of the contracts |

## Open questions

- The open question of [FE-ADR-5](adr/state-management.md) on when the socket connects.
- The open question of [FE-ADR-6](adr/chessboard.md) on the choice of piece for a promotion.
- Whether the game page shows the moves of the game, and in which form, because ADR-8 shows no SAN in the first version.
- The texts that the users see for the error codes of the game-service and for the errors of the REST API, because the `message` of the contracts is only for the logs.
- The format of the clocks, for example whether tenths of a second appear when the time runs low, and whether a clock that runs low is marked.

## Next steps

- Set up the libraries of FE-ADR-4 to FE-ADR-8, the theme, the pages with their guards, the fake mode of FE-ADR-9, the tests and the formatting, and update the README.
- Add the CI workflow of ADR-2, which lints, checks the format, tests and builds on every pull request and publishes the image for a version tag.
- Write the types of the contracts `platform-service.openapi.yaml`, `game-service.asyncapi.yaml` and `shared-schemas.yaml` (FE-ADR-10), and `apiFetch` with the refresh of FE-ADR-5.
- Fake the REST API and the Socket.IO protocol from the examples of the contracts (FE-ADR-9).
- Build registration and sign-in with the rules of ADR-4 checked in the forms, the field errors of the 400 and 409 answers, the signed-in user from `GET /api/users/me`, and sign-out that closes the Socket.IO connection.
- Build the connection to `/ws/game` with the refresh after `connect_error` and `getState` after every connect (ADR-4).
- Build the lobby with joining and leaving the queue and starting a game against the bot.
- Build the game page with the legal moves of chess.js highlighted (ADR-9), the moves sent with acknowledgements, the piece put back after a refusal, the clocks counted down locally (ADR-8), resignation, and the result with its reason (ADR-10).
- Build the history with paging, and a finished game replayed move by move with chess.js (F-6).
- Test the flows end to end with Playwright in Chrome, Firefox and Edge (FE-ADR-8, NF-7).
