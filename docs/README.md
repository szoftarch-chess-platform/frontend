# frontend documentation

- System documentation: the `docs/` folder of the infra repo

## ADRs

| ID | Title |
|---|---|
| [FE-ADR-1](adr/stack.md) | TypeScript and Vite |
| [FE-ADR-2](adr/gateway-access.md) | Relative URLs through the gateway |

## Open questions

**Tooling**

- Routing library, for example React Router.
- Server state and data fetching, for example TanStack Query or plain fetch.
- Client state, for example Zustand, Context or Redux Toolkit.
- Chessboard UI, for example react-chessboard, and whether to use chess.js for instant feedback on the client.
- Styling, for example Tailwind, CSS Modules or a component library.
- Testing, for example Vitest with React Testing Library, and formatting, for example Prettier.
- Whether to generate TypeScript types from the OpenAPI and AsyncAPI contracts in the infra repo.
- Developing locally with `npm run dev` or inside a Docker container.
- The image of the frontend, for example a multi-stage build where Node builds the app and nginx serves the static files.

**Scope**

- Which pages are in the first version, for example login and registration, lobby, game, profile and history, or analysis.

## Next steps

- Agree on the contracts of ADR-2 with the other repos.
- Answer the open questions above.
- Set up the folder structure, for example `src/api`, `src/features`, `src/pages` and `src/components`, and implement step by step, starting with login.
- Add the Dockerfile that ADR-2 requires.
