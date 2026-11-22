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

- The open question of [FE-ADR-6](adr/chessboard.md) on the choice of piece for a promotion.
- Whether the game page shows the moves of the game, and in which form, because ADR-8 shows no SAN in the first version.
- The texts that the users see for the error codes of the game-service, because the `message` of its acknowledgements is only for the logs, and for the errors of the REST API that name no field, such as a wrong password, too many attempts or an unexpected error. The sign-in and registration forms use provisional texts until the team decides.
- Whether the lobby shows how long the user has been waiting in the queue. The contract `game-service.asyncapi.yaml` sends no time of joining, so a count of the client would start again after a reload. The team decides it together with the contract.
- The format of the clocks, for example whether tenths of a second appear when the time runs low, and whether a clock that runs low is marked.

## Next steps

- Build the game page, with the `ended` status of FE-ADR-5 in the store, so that a reconnect on the result does not lead back to the lobby or a running game, and fake the moves of the player and of the bot, including the first move of a bot that plays white, the clocks and the end of the game, with the legal moves of chess.js highlighted (ADR-9), the moves sent with acknowledgements, the piece put back after a refusal, the clocks counted down locally (ADR-8), resignation, and the result with its reason (ADR-10), refresh the recent games of the lobby after the end, and add the colors of the highlights and the clocks to the theme as semantic tokens next to the squares of the board (FE-ADR-6, FE-ADR-7).
- Build the history with paging, and a finished game replayed move by move with chess.js (F-6).
- Test the flows end to end with Playwright in Chrome, Firefox and Edge (FE-ADR-8, NF-7).
