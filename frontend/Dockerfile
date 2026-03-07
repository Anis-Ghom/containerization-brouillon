# COMMIT: Members 1 & 2 (frontend pair). Dockerfile contents SHARED between both.
# Your task: Frontend containerization. Both members contribute to this Dockerfile and to frontend/.dockerignore.
# BONUS: Multi-stage build — smaller final image.
# Pinned base image - no :latest
# --- Stage 1: install dependencies ---
FROM node:20.19-alpine3.20 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

# --- Stage 2: runtime (only app + deps, no build tools) ---
FROM node:20.19-alpine3.20
WORKDIR /app
RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY --chown=appuser:appgroup . .

USER appuser
EXPOSE 5173
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O- http://localhost:5173/ || exit 1
CMD ["npm", "run", "dev"]
