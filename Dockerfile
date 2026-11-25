# Node builds the SPA, and nginx serves the static files of the build.

FROM --platform=$BUILDPLATFORM node:26-alpine AS build
WORKDIR /app

# The dependencies are installed in a separate layer, which only depends on the package files.
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# The image runs as a non-root user and listens on port 8080.
FROM nginx/nginx-unprivileged:1.30-alpine AS final
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

# The base image already sets this user. Naming it here keeps the image non-root if the base image changes.
USER nginx
EXPOSE 8080
