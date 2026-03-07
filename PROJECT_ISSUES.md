# Final Project – 4 Team Issues (Containerization Technologies)

**Ownership (exact):**
- **Members 1 & 2:** Frontend + Nginx. **Dockerfile and .dockerignore contents are shared between both.**
- **Member 3:** API1 only (Products & Database 1).
- **Member 4:** API2 only (Orders & Database 2 & Redis).
- **All 4:** Must contribute to **ci.yaml**, **docker-compose.yaml**, and **README.md**.

---

## Issue 1 – Frontend + Nginx (pair)  
**Assignees: Member 1 and Member 2**

### Goal
Deliver the frontend and Nginx reverse proxy. **Both members share all frontend work.** The contents of **frontend/Dockerfile** and **frontend/.dockerignore** are **shared between both** — both contribute to them.

### Application tasks (shared between both)
- [ ] Implement the frontend under `frontend/` (entry point, styles, Vite config, App, API calls to API1 and API2).
- [ ] Add Nginx config in `nginx/nginx.conf` (reverse proxy: `/` → frontend, `/api1/` → API1, `/api2/` → API2).
- [ ] Add "Frontend", "Hot reload", and "Nginx" sections in README (both contribute; all 4 review README).

### Containerization tasks (shared between both)
- [ ] **frontend/Dockerfile**: Pinned base, non-root user, HEALTHCHECK, multi-stage if used. **Both members contribute to this file.**
- [ ] **frontend/.dockerignore**: Keep image small. **Both members contribute to this file.**
- [ ] In **docker-compose.yaml**: frontend service block and nginx service block (Members 1 & 2 maintain; **all 4 contribute and review** the file).
- [ ] In **ci.yaml**: frontend build, Trivy frontend, build-push frontend (Members 1 & 2 maintain; **all 4 contribute and review**).

### Deliverables
- All files under `frontend/` and `nginx/`. Both members commit; Dockerfile and .dockerignore are shared between both.
- Frontend and nginx blocks in docker-compose.yaml; frontend steps in ci.yaml; README sections (all 4 review).

---

## Issue 2 – API1 (Products) & Database 1  
**Assignee: Member 3 only**

### Goal
Implement API1 and Database 1 and their containerization. **Only Member 3** owns API1; Member 3 does not do frontend.

### Application tasks
- [ ] Implement API1 under `api1/src/` (REST, optional GraphQL/Swagger). Connects to DB1 only.
- [ ] Add "API1 & Database 1" section in README (Member 3 maintains; all 4 review README).

### Containerization tasks
- [ ] **api1/Dockerfile** and **api1/.dockerignore** (Member 3 only).
- [ ] In **docker-compose.yaml**: api1 and db1 service blocks (Member 3 maintains; **all 4 contribute and review**).
- [ ] In **ci.yaml**: api1 build, Trivy api1, build-push api1 (Member 3 maintains; **all 4 contribute and review**).

### Deliverables
- All files under `api1/`. api1 + db1 blocks in docker-compose.yaml; api1 steps in ci.yaml; README section (all 4 review).

---

## Issue 3 – API2 (Orders) & Database 2 & Redis  
**Assignee: Member 4 only**

### Goal
Implement API2, Database 2, and Redis queue and their containerization. **Only Member 4** owns API2; Member 4 does not do frontend or API1.

### Application tasks
- [ ] Implement API2 under `api2/src/` (REST, optional Swagger, Redis queue). Connects to DB2 and Redis only.
- [ ] Add "API2 & Database 2" and "Redis" sections in README (Member 4 maintains; all 4 review README).

### Containerization tasks
- [ ] **api2/Dockerfile** and **api2/.dockerignore** (Member 4 only).
- [ ] In **docker-compose.yaml**: api2, db2, redis service blocks (Member 4 maintains; **all 4 contribute and review**).
- [ ] In **ci.yaml**: api2 build, Trivy api2, build-push api2 (Member 4 maintains; **all 4 contribute and review**).

### Deliverables
- All files under `api2/`. api2 + db2 + redis blocks in docker-compose.yaml; api2 steps in ci.yaml; README sections (all 4 review).

---

## Shared: ci.yaml, docker-compose.yaml, README.md  
**All 4 members**

### Goal
**Every member must contribute** to these three files and review them. No single person "owns" the file; each maintains their service blocks/sections and all 4 review the whole file.

### Your task (all 4)
- [ ] **ci.yaml**: Contribute to trigger, env, jobs; maintain your service’s steps (1&2: frontend, 3: api1, 4: api2); review every section.
- [ ] **docker-compose.yaml**: Maintain your blocks (1&2: nginx+frontend, 3: api1+db1, 4: api2+db2+redis); contribute to volumes and networks; review every section.
- [ ] **README.md**: Maintain your sections; contribute to overview, architecture, install, demo; review the whole doc.

### Deliverables
- All 4 commit and review ci.yaml, docker-compose.yaml, and README.md.

---

## Summary

| Area | Who | Dockerfile / .dockerignore |
|------|-----|----------------------------|
| Frontend + Nginx | **Members 1 & 2** | **Shared between both** (both contribute) |
| API1 | **Member 3 only** | Member 3 |
| API2 | **Member 4 only** | Member 4 |
| ci.yaml, docker-compose.yaml, README.md | **All 4** | — |

Good luck.
