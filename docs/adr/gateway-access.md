# FE-ADR-2: Relative URLs through the gateway

**Related:** ADR-3, ADR-4

## Decision

- The frontend uses relative URLs such as `/api/...` and `/ws/...`, so no build configuration per environment is needed.
- During development the Vite dev server proxies `/api` and `/ws` to the gateway. The address of the gateway comes from `GATEWAY_URL` in `.env`, which only the dev server reads and which is not baked into the build.
