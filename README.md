# Microservices Demo — Products & Orders
<!--
  COMMIT: All 4 members. Every member must contribute to this file and review it.
  Your task:
    Members 1 & 2 (frontend pair): Frontend, Nginx, hot reload sections.
    Member 3 (API1 owner): API1 & Database 1 section.
    Member 4 (API2 owner): API2 & Database 2, Redis, bonus sections.
    All 4: Overview, architecture, installation, env table, demo; review and merge.
-->

A containerized web application built with a **microservices architecture** for the Containerization Technologies course. It demonstrates two isolated backends (Products and Orders), a single frontend, and strict **network isolation** between services.

## What problem does it solve?

The app is a minimal **Products & Orders** dashboard: you can manage products (API1) and create orders that reference product IDs (API2). Each backend has its own database; the frontend talks to both APIs. The project shows how to run and isolate multiple services with Docker and Docker Compose while keeping images small and secure.

## Technology stack

| Layer      | Technology                          |
|-----------|--------------------------------------|
| Frontend  | React 18, Vite 5                     |
| API1      | Node.js 20, Express 4, PostgreSQL 16, GraphQL, Swagger |
| API2      | Node.js 20, Express 4, PostgreSQL 16, Redis, Swagger |
| Proxy     | Nginx (reverse proxy)                |
| Container | Docker, Docker Compose (multi-stage builds) |
| CI/CD     | Gitea Actions (Trivy, build, push)   |

## Architecture

```
                         ┌─────────┐
                         │  Nginx  │  :80 (BONUS: reverse proxy)
                         │ (proxy) │
                         └────┬────┘
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
       ┌─────────────┐  ┌──────────┐  ┌──────────┐
       │   Frontend  │  │  API 1   │  │  API 2   │
       │ (Vite/React)│  │ Products │  │  Orders  │
       │   :5173     │  │  :8001   │  │  :8002   │
       └──────┬──────┘  └────┬─────┘  └────┬────┘
              │              │              │
              │              ▼              ▼
              │       ┌─────────┐   ┌─────────┬─────┐
              │       │   DB1   │   │   DB2   │Redis│
              │       │(Postgres)│   │(Postgres)│queue│
              │       └─────────┘   └─────────┴─────┘
              └──────────┬──────────────────┘
                         (frontend calls APIs)
```

**Network isolation**

- **Allowed:** Frontend → API1, Frontend → API2, API1 → DB1, API2 → DB2, API2 → Redis  
- **Forbidden:** API1 → DB2, API2 → DB1, host → any DB, DB1 ↔ DB2  

DB1, DB2 and Redis are not exposed to the host; frontend, APIs and Nginx are published.

## Bonus features

| Bonus | Implementation |
|-------|----------------|
| **Reverse proxy** (+0.5) | Nginx on port 80: `/` → frontend, `/api1/` → API1, `/api2/` → API2. Use `http://localhost` for single entry point. |
| **Load balancer** (+0.5) | Nginx upstream for api1/api2. For multiple replicas: `docker compose up --scale api1=2 --scale api2=2` (then use Nginx on port 80 only). |
| **Queue system** (+0.5) | Redis. API2 pushes order events to a list on `POST /orders`; `GET /orders/events` returns recent events. |
| **GraphQL** (+0.5) | API1 exposes `GET /graphql` (GraphiQL) and `POST /graphql` for querying products. |
| **Multi-stage builds** (+0.5) | All three app Dockerfiles use a builder stage; final image only has runtime and app. |
| **API documentation** (+0.5) | API1 and API2 serve Swagger UI at `/api-docs` (OpenAPI 3). |

## Installation

```bash
git clone <repository-url>
cd finalprojectperso
cp .env.example .env
docker compose up --build
```

- **Via Nginx (single entry):** http://localhost — frontend at `/`, API1 at `/api1/`, API2 at `/api2/`
- **Direct:** Frontend http://localhost:5173 · API1 http://localhost:8001 · API2 http://localhost:8002  
- **API docs:** http://localhost:8001/api-docs (API1), http://localhost:8002/api-docs (API2)  
- **GraphQL (API1):** http://localhost:8001/graphql  
- **Order events queue (API2):** http://localhost:8002/orders/events  

## Environment variables

| Variable            | Description                    | Default   |
|---------------------|--------------------------------|-----------|
| `API1_DB_PASSWORD`  | PostgreSQL password for API1  | `api1secret` |
| `API2_DB_PASSWORD`  | PostgreSQL password for API2  | `api2secret` |

For the frontend, API base URLs are set via `VITE_API1_URL` and `VITE_API2_URL` in `docker-compose.yaml` (default: `http://localhost:8001` and `http://localhost:8002`).

## Hot reload (frontend)

The frontend runs in dev mode with a **bind mount**: `./frontend/src` is mounted into the container. Edit files under `frontend/src/` and refresh the browser to see changes; **no container restart** is required.

## Data persistence

- **api1-db-data:** PostgreSQL data for the Products DB  
- **api2-db-data:** PostgreSQL data for the Orders DB  

Data survives `docker compose down` and `docker compose up`.

## Demo

1. Open http://localhost:5173  
2. **Products (API1):** Add a product (name + price); list appears from DB1  
3. **Orders (API2):** Create an order (product ID + quantity); list appears from DB2  

To **prove network isolation** during the presentation: show that DB1/DB2 have no published ports, and that each API only connects to its own DB (e.g. by inspecting `docker network` and connection logs).

## Repository structure

```
.
├── .gitea/workflows/ci.yaml
├── frontend/
├── api1/          # Products API (GraphQL, Swagger)
├── api2/          # Orders API (Redis queue, Swagger)
├── nginx/         # BONUS: reverse proxy config
├── docker-compose.yaml
├── .env.example
├── README.md
└── AUTHORS.md
```

## CI/CD (Gitea Actions)

- **Security:** Trivy scans all built images; pipeline fails on **MEDIUM**, **HIGH**, or **CRITICAL** vulnerabilities.  
- **Build & push:** On push to `main`/`master`, images are built and pushed to Docker Hub.  

Configure in Gitea:

- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

(Gitea may use `gitea` instead of `github` in workflow conditions; adjust `if` in `ci.yaml` if needed.)
