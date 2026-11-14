# frontend

Web frontend of the online chess platform. Its stack and its access to the gateway are decided in [FE-ADR-1](docs/adr/stack.md) and [FE-ADR-2](docs/adr/gateway-access.md).

> Status: minimal skeleton. The app currently only renders a placeholder page.

## Requirements

- Node.js 22+
- npm 10+

## Getting started

```bash
npm install
npm run dev
```

The app runs at http://localhost:5173. To use another gateway address than the one in `.env.example`, copy it to `.env` and change `GATEWAY_URL`.

## Scripts

| Command           | Description                                       |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Start the dev server with hot reload              |
| `npm run build`   | Type-check and build for production into `dist/`  |
| `npm run preview` | Serve the production build locally                |
| `npm run lint`    | Run ESLint                                        |

## File structure

```
frontend/
├── docs/                 # documentation of the frontend
├── src/
│   ├── main.tsx          # entry point, mounts the app into #root
│   └── App.tsx           # root component
├── public/               # static files served as-is (favicon)
├── index.html            # HTML shell the bundle is injected into
├── vite.config.ts        # Vite config and dev proxy to the API gateway
├── .env.example          # example environment variables for local development
├── eslint.config.js      # ESLint configuration
├── tsconfig.json         # TypeScript project references
├── tsconfig.app.json     # TypeScript settings for the app (src/)
├── tsconfig.node.json    # TypeScript settings for vite.config.ts
└── package.json          # dependencies and scripts
```

## Documentation

The decisions, open questions and next steps of the frontend are in [docs/](docs/README.md).
