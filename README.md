# frontend

Web frontend of the online chess platform, a React + TypeScript single-page app built with [Vite](https://vite.dev/).

The browser communicates only with the platform's API gateway (configured in the `infra` repo), never directly with the individual services.

> Status: minimal skeleton. The app currently only renders a placeholder page.

## Requirements

- Node.js 22+
- npm 10+

## Getting started

```bash
npm install
npm run dev
```

The app runs at http://localhost:5173.

During development, requests to `/api` and `/ws` are proxied to the API gateway. By default the gateway is expected at `http://localhost:8080`. To change it, copy `.env.example` to `.env` and set `GATEWAY_URL`.

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
