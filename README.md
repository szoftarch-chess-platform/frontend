# frontend

Web frontend of the online chess platform. Its stack, its access to the gateway and its image are decided in [FE-ADR-1](docs/adr/stack.md), [FE-ADR-2](docs/adr/gateway-access.md) and [FE-ADR-3](docs/adr/container-image.md).

> Status: minimal skeleton. The app currently only renders a placeholder page.

## Requirements

- Node.js 26+
- npm 10+
- Docker for building the image
- The infra repo in the sibling folder, set up and running as its README describes

## Getting started

```bash
npm install
npm run dev
```

The app runs at https://localhost:5173. The dev server uses the certificate that `scripts/dev-setup.mjs` of the infra repo creates, and it proxies `/api` and `/ws` to the gateway. To use another gateway address than the one in `.env.example`, copy it to `.env` and change `GATEWAY_URL`.

## Scripts

| Command           | Description                                       |
| ----------------- | ------------------------------------------------- |
| `npm run dev`     | Start the dev server with hot reload              |
| `npm run build`   | Type-check and build for production into `dist/`  |
| `npm run preview` | Serve the production build locally                |
| `npm run lint`    | Run ESLint                                        |

## Docker

```bash
docker build -t frontend .
docker run --rm -p 8080:8080 frontend
```

The container serves the production build at http://localhost:8080. [FE-ADR-3](docs/adr/container-image.md) describes the image.

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
├── Dockerfile            # container image
├── nginx.conf            # nginx configuration of the image
├── .dockerignore         # files left out of the image build
├── eslint.config.js      # ESLint configuration
├── tsconfig.json         # TypeScript project references
├── tsconfig.app.json     # TypeScript settings for the app (src/)
├── tsconfig.node.json    # TypeScript settings for vite.config.ts
└── package.json          # dependencies and scripts
```

## Documentation

The decisions, open questions and next steps of the frontend are in [docs/](docs/README.md).
