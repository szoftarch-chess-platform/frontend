# frontend

Web frontend of the online chess platform. Its decisions are listed in [docs/](docs/README.md).

> Status: registration, sign-in and sign-out work. The lobby, the game and the history are placeholders.

## Requirements

- Node.js 26+ with npm 11+
- Docker for building the image
- For `npm run dev`, the infra repo in the sibling folder, set up and running as its README describes

## Getting started

```bash
npm install
```

To work without the services, start the fake mode:

```bash
npm run dev:fake
```

The app runs at http://localhost:5173 and answers every request in the browser. It needs neither the infra repo nor Docker, and the header shows a FAKE BACKEND badge. Sign in as `alice` or `bob` with the password `correct horse battery`, or register a new user. A reload starts the fake mode from the beginning.

To work against the services, start the infra compose first, then:

```bash
npm run dev
```

The app runs at https://localhost:5173. The dev server uses the certificate that `scripts/dev-setup.mjs` of the infra repo creates, and it proxies `/api` and `/ws` to the gateway. To use another gateway address than the one in `.env.example`, copy it to `.env` and change `GATEWAY_URL`.

## Scripts

| Command                | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `npm run dev`          | Start the dev server against the gateway, with hot reload |
| `npm run dev:fake`     | Start the dev server with the fake backend               |
| `npm run build`        | Type-check and build for production into `dist/`         |
| `npm run preview`      | Serve the production build locally                       |
| `npm run lint`         | Run ESLint                                               |
| `npm run format`       | Format the files with Prettier                           |
| `npm run format:check` | Check the format without changing files                  |
| `npm test`             | Run the tests once                                       |
| `npm run test:watch`   | Run the tests on every change                            |
| `npm run test:cov`     | Run the tests with a coverage report in `coverage/`      |
| `npm run theme:types`  | Generate the types of the theme tokens after a change of `src/theme/` |

## Tests

```bash
npm test
```

The tests run in Node.js with jsdom and need neither the services nor a browser. A test file sits next to the file that it tests and ends in `.test.ts` or `.test.tsx`. Shared helpers are in `src/test/`, such as `renderWithProviders`, which renders a component with the providers, a memory router and the fake backend.

## Docker

```bash
docker build -t frontend .
docker run --rm -p 8080:8080 frontend
```

The container serves the production build at http://localhost:8080. [FE-ADR-3](docs/adr/container-image.md) describes the image.

## CI

The workflow in `.github/workflows/frontend.yml` runs the lint, the format check, the tests and the build on every pull request and every push to `dev` and `main`, and it builds the image. A tag such as `v1.0.0` also publishes the image for amd64 and arm64 as `ghcr.io/szoftarch-chess-platform/frontend:1.0.0`.

## File structure

```
frontend/
├── .github/workflows/        # CI workflow
├── docs/                     # decisions, open questions and next steps
├── src/
│   ├── main.tsx              # entry point, loads the backend and mounts the app
│   ├── App.tsx               # the routes
│   ├── api/                  # the backend: its type, the real and the fake one, the types of the contracts
│   ├── app/                  # the providers and the query client
│   ├── auth/                 # the signed-in user
│   ├── layout/               # the header and the frame of the pages
│   ├── pages/                # one component for each page
│   ├── routing/              # the guards and the parsing of route parameters
│   ├── theme/                # the Chakra theme with its tokens
│   └── test/                 # setup and helpers of the tests
├── public/                   # static files served as-is (favicon)
├── index.html                # HTML shell the bundle is injected into
├── vite.config.ts            # Vite config, the dev proxy to the gateway and the fake mode
├── vitest.config.ts          # test config
├── .env.example              # example environment variables for `npm run dev`
├── .env.fake                 # settings of the fake mode
├── .prettierrc               # format settings
├── eslint.config.js          # ESLint configuration
├── Dockerfile                # container image
├── nginx.conf                # nginx configuration of the image
├── tsconfig*.json            # TypeScript settings
└── package.json              # dependencies and scripts
```
