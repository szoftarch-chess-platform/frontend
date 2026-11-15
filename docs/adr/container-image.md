# FE-ADR-3: Container image with nginx

**Related:** NF-9, ADR-2, ADR-3, [FE-ADR-1](stack.md), [FE-ADR-2](gateway-access.md)

## Context

The gateway does not serve static files, so the frontend needs a container that serves the production build of the SPA.

## Decision

- The multi-stage `Dockerfile` builds the app with `node:26-alpine` and copies the build into `nginx/nginx-unprivileged:1.30-alpine`.
- nginx runs as the non-root user `nginx` and listens on port 8080. The `Dockerfile` names the user, although the base image already sets it.
- A path that is not a file gets `index.html`, so a page of the SPA also loads from a direct link.

## Rationale

- nginx is a small and widely used server for static files, and serving an SPA needs a single `try_files` line.
- The unprivileged image is maintained by the nginx project. A server that does not run as root can do less harm if it is compromised.
- With the user named in the `Dockerfile`, the image stays non-root even if the base image is replaced, and the tools that check the file can see it.
- 1.30 is the stable release line of nginx. The tag follows its patch releases, while the `stable` tag would move to the next release line on its own.
- The build stage uses the Node.js version that the developers use.

## Rejected alternatives

- **Official `nginx` image:** its master process runs as root.
- **Caddy:** its configuration is shorter, but it is less common than nginx.
- **`nginxinc/nginx-unprivileged`:** the earlier name of the same image, which is archived on Docker Hub.

## Consequences

- The image contains only nginx and the static files, without Node.js.
- The same image runs in every environment, because the app uses relative URLs.
- Moving to a new release line of nginx is a change of the tag in the `Dockerfile`.

## Sources

- Unprivileged nginx image: https://hub.docker.com/r/nginx/nginx-unprivileged
