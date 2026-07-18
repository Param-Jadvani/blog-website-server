# syntax=docker/dockerfile:1

# Stage 1: build the TypeScript application.
# This stage contains development tools such as TypeScript, Jest, and Prettier.
# It is used only while the image is being built and is not shipped to Render.
FROM node:22-bookworm-slim AS builder
WORKDIR /app

# Install every dependency because `npm run build` needs development tools.
COPY package.json package-lock.json ./
RUN npm ci

# Source code is needed only to create the compiled `dist` folder.
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Stage 2: the small image that Render actually runs.
FROM node:22-bookworm-slim AS production
WORKDIR /app

ENV NODE_ENV=production

# Install only packages needed while the API is running.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Bring in only runtime files from the builder. Source files and tests are not
# needed at runtime. `docs` is included because the API serves openapi.yaml.
COPY --from=builder /app/dist ./dist
COPY docs ./docs

# Do not run the web server as root inside the container.
USER node
EXPOSE 3000

# Docker calls this endpoint to confirm the API process is alive.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 3000) + '/health/live').then(r => { if (!r.ok) process.exit(1) }).catch(() => process.exit(1))"

# Start the compiled production application.
CMD ["node", "dist/server.js"]
