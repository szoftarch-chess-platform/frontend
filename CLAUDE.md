# Frontend – Chess Platform

React single-page app for the online chess platform. It is one repo of a microservice system; the sibling repos (`platform-service`, `game-service`, `engine-service`, `infra`) each have their own CLAUDE.md. Keep this file about the frontend only.

## Working rule

Build only what has been explicitly decided (see below). Do not add libraries, endpoints, or feature code based on assumptions. If something is listed under *Open questions*, ask first.

## Commands

- `npm run dev` – Vite dev server on http://localhost:5173, proxies `/api` and `/ws` to the gateway
- `npm run build` – type-check and production build into `dist/`
- `npm run lint` – ESLint
- `npm run preview` – serve the production build locally

## File structure

```
frontend/
├── src/
│   ├── main.tsx          # entry point, mounts <App /> into #root
│   └── App.tsx           # root component (placeholder for now)
├── public/               # static files copied as-is (favicon)
├── index.html            # HTML shell Vite injects the bundle into
├── vite.config.ts        # Vite config + dev proxy (/api, /ws -> gateway)
├── .env.example          # GATEWAY_URL for the dev proxy (copy to .env); not baked into builds
├── eslint.config.js      # ESLint (Vite template defaults)
├── tsconfig.json         # TS project references
├── tsconfig.app.json     # TS settings for src/
├── tsconfig.node.json    # TS settings for vite.config.ts
└── package.json          # React 19, Vite 6, TypeScript 5.8, ESLint 9
```

## Decisions made

- **Stack:** React + TypeScript, built with Vite.
- **Runs in Docker** (the platform as a whole). The frontend's Docker setup is not added yet; it comes when the platform is wired together in `infra/`.
- **API gateway (configured in `infra/`):** the browser talks only to the gateway, never directly to a service. The frontend uses relative URLs (`/api/...`, `/ws/...`), so no per-environment build config is needed.
- **Auth:** JWT tokens.
- **Requests:** REST.
- **Real-time:** moves from the opponent / engine arrive over a WebSocket.
- **Move legality:** checked by game-service (the server is the authority).
- **Move flow (game-service is the orchestrator):**
  1. Frontend sends `POST /games/{id}/moves` with the move (e.g. `e2e4`) through the gateway.
  2. Game-service loads the position, validates and saves the move, and answers `200/202` with the new FEN.
  3. Game-service asks engine-service for a reply move, validates and saves it.
  4. Game-service pushes it to the frontend over WebSocket (e.g. `opponent_moved e7e5`).

  → The frontend never calls engine-service directly. It sends moves with REST and only *receives* moves over the WebSocket.

## Open questions

**Backend contract (needs agreement with the other repos)**
- Exact REST endpoints and payloads (game create/get, move, auth login/register). Gateway path prefixes (`/api/...`?).
- Will there be an OpenAPI spec to generate TypeScript types from?
- `200` or `202` for the move response, and what exactly does it contain (FEN only? ply number? status?)
- WebSocket: plain WebSocket or STOMP/Socket.IO? Message format (JSON shape, event types like move / game over)? URL per game or one per user?
- WebSocket auth: browsers can't set an `Authorization` header on WebSockets. Token in query param, subprotocol, or first message?
- JWT: which service issues it, how it is stored on the client (memory vs localStorage vs cookie), lifetime, refresh tokens?
- Does the gateway serve the frontend container at `/`? How is the frontend added to docker-compose in `infra/`?

**Frontend tooling**
- Routing library (e.g. React Router)
- Server-state / data fetching (e.g. TanStack Query, or plain fetch)
- Client state (e.g. Zustand, Context, Redux Toolkit)
- Chessboard UI (e.g. react-chessboard) and whether to use chess.js for instant client-side feedback (server stays authoritative)
- Styling (Tailwind, CSS Modules, component library)
- Testing (Vitest + React Testing Library?) and formatting (Prettier?)
- Develop locally with `npm run dev` or inside a Docker container?
- Docker image for the frontend (when the time comes): e.g. multi-stage build (node build → nginx serving the static files).

**Scope**
- Which pages are in the first version (login/register, lobby, game, profile/history, analysis…)?
- Game modes: vs engine only at first, or player vs player too?

## Next steps

1. Agree the API/WebSocket contract with the backend repos (open questions above).
2. Decide the frontend tooling choices and the first-version page list.
3. Set up the folder structure (e.g. `src/api`, `src/features`, `src/pages`, `src/components`) and implement step by step, starting with login.
4. Later, when the platform is wired together: add a Dockerfile for the frontend, add it to docker-compose and the gateway routing in `infra/`.
