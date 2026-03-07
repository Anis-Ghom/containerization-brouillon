# COMMIT: Member 3 only. API1 owner.
# Your task: API1 containerization. You own all api1/ files and the api1+db1 block in docker-compose.
# BONUS: Multi-stage build — smaller final image (no npm cache in final stage).
# Pinned base image - no :latest
# --- Stage 1: install dependencies ---
FROM node:20.19-alpine3.20 AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev

# --- Stage 2: runtime ---
FROM node:20.19-alpine3.20
WORKDIR /app
RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup
COPY --from=deps /app/node_modules ./node_modules
COPY package*.json ./
COPY --chown=appuser:appgroup src ./src

USER appuser
EXPOSE 8001
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -q -O- http://localhost:8001/health || exit 1
CMD ["node", "src/index.js"]
