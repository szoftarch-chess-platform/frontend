# FE-ADR-2: Relative URLs through the gateway

**Related:** ADR-2, ADR-3, ADR-4, ADR-6, [FE-ADR-9](fake-backends.md)

## Decision

- The frontend uses relative URLs such as `/api/...` and `/ws/...`, so no build configuration per environment is needed.
- The developers run the Vite dev server on the host with Node.js, not in a container.
- During development the Vite dev server proxies `/api` and `/ws` to the gateway. The address of the gateway comes from `GATEWAY_URL` in `.env`, which only the dev server reads and which is not baked into the build.
- The dev server runs on HTTPS at `https://localhost:5173`. It uses the `localhost` certificate of the gateway, and its proxy trusts the development certificate authority that signed it. It reads these files from the `secrets/tls` folder of the sibling infra repo.
- The proxy forwards the `Host` header of the browser unchanged.

## Rationale

- On the host the hot reload and the file watching are fast, and the proxy reaches the gateway at its published port. The other services are developed on the host the same way (ADR-6), and ADR-2 already requires Node.js on every machine.
- The cookies of the tokens are `Secure`, so the browser needs HTTPS on the dev server too.
- The certificate of the gateway is valid for `localhost` on any port, and the developers already trust its authority. So the dev server needs no certificate of its own, and the browser shows no warning.
- The gateway compares the `Origin` header of a WebSocket handshake with the `Host` header. Through the dev server both name `localhost:5173`, so the handshake passes only if the proxy keeps the `Host` header.

## Rejected alternatives

- **Dev server in a container:** no Node.js on the host, but file watching through a mounted folder is slow, especially on Windows, and the proxy would have to reach the gateway by its service name, which changes the `Host` header that the gateway compares.
- **Self-signed certificate from `@vitejs/plugin-basic-ssl`:** the dev server would not depend on the files of the infra repo, but the browser warns about such a certificate, and the proxy would have to skip the verification of the gateway certificate.

## Consequences

- `npm run dev` and `npm run preview` need the files that the setup script of the infra repo creates. If one is missing, the dev server stops with an error that names it. `npm run build` and the fake mode of FE-ADR-9 do not need them.
- The type definitions of Node.js are a development dependency, because `vite.config.ts` reads files. The app under `src/` does not see them.
