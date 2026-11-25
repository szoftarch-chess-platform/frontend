# frontend documentation

- System documentation: the `docs/` folder of the infra repo
- Changes that the frontend asks of the other repos: [requests-to-other-repos.md](requests-to-other-repos.md)

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

- The texts that the users see for the error codes of the game-service, because the `message` of its acknowledgements is only for the logs, and for the errors of the REST API that name no field, such as a wrong password, too many attempts or an unexpected error. The sign-in and registration forms use provisional texts until the team decides.
- Whether the lobby shows how long the user has been waiting in the queue. A reload ends the waiting (ADR-10), so the tab that joined can count the time, but another tab of the user does not know when the waiting began. The team decides it together with the contract, as [requests-to-other-repos.md](requests-to-other-repos.md) describes.

## Next steps

- Play the lobby and the game page against the game-service of `dev` through the gateway, which implements the contract `game-service.asyncapi.yaml` now.
- Show the moves in SAN, which ADR-8 asks for now, in the replay, and decide whether the game page gets a move list. FE-ADR-4 still describes the list of the replay in UCI.
- Test the flows end to end with Playwright in Chrome, Firefox and Edge (FE-ADR-8, NF-7).
