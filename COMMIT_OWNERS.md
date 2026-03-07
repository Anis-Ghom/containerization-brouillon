# Who commits what

**Ownership (exact):**
- **Members 1 & 2 (frontend pair):** Frontend (all files) + Nginx. **Dockerfile and .dockerignore contents are shared between both** — both members contribute to `frontend/Dockerfile` and `frontend/.dockerignore`.
- **Member 3 only:** API1 (all api1/ files).
- **Member 4 only:** API2 (all api2/ files).
- **All 4 members:** Must contribute to **ci.yaml**, **docker-compose.yaml**, and **README.md** (each maintains their section; all 4 review and can edit).

---

## Members 1 & 2 — Frontend + Nginx (shared between both)

| File | Who | Comment in file |
|------|-----|-----------------|
| `frontend/index.html` | Members 1 & 2 | COMMIT: Members 1 & 2 (frontend pair) |
| `frontend/src/main.jsx` | Members 1 & 2 | idem |
| `frontend/src/App.jsx` | Members 1 & 2 | idem |
| `frontend/src/index.css` | Members 1 & 2 | idem |
| `frontend/vite.config.js` | Members 1 & 2 | idem |
| `frontend/package.json` | Members 1 & 2 | _commit in JSON |
| **`frontend/Dockerfile`** | **Members 1 & 2 — contents SHARED between both** | idem |
| **`frontend/.dockerignore`** | **Members 1 & 2 — contents SHARED between both** | idem |
| `nginx/nginx.conf` | Members 1 & 2 | COMMIT: Members 1 & 2 (frontend pair, nginx) |
| `docker-compose.yaml` | All 4 contribute | Members 1 & 2 maintain nginx + frontend blocks |
| `ci.yaml` | All 4 contribute | Members 1 & 2 maintain frontend steps |
| `README.md` | All 4 contribute | Members 1 & 2 maintain frontend + nginx sections |

---

## Member 3 only — API1

| File | Who | Comment in file |
|------|-----|-----------------|
| `api1/src/index.js` | Member 3 | COMMIT: Member 3 only |
| `api1/src/openapi.js` | Member 3 | idem |
| `api1/package.json` | Member 3 | _commit in JSON |
| `api1/Dockerfile` | Member 3 | idem |
| `api1/.dockerignore` | Member 3 | idem |
| `docker-compose.yaml` | All 4 contribute | Member 3 maintains api1 + db1 blocks |
| `ci.yaml` | All 4 contribute | Member 3 maintains api1 steps |
| `README.md` | All 4 contribute | Member 3 maintains API1 section |

---

## Member 4 only — API2

| File | Who | Comment in file |
|------|-----|-----------------|
| `api2/src/index.js` | Member 4 | COMMIT: Member 4 only |
| `api2/src/openapi.js` | Member 4 | idem |
| `api2/package.json` | Member 4 | _commit in JSON |
| `api2/Dockerfile` | Member 4 | idem |
| `api2/.dockerignore` | Member 4 | idem |
| `docker-compose.yaml` | All 4 contribute | Member 4 maintains api2 + db2 + redis blocks |
| `ci.yaml` | All 4 contribute | Member 4 maintains api2 steps |
| `README.md` | All 4 contribute | Member 4 maintains API2 + Redis sections |

---

## All 4 members — ci.yaml, docker-compose.yaml, README.md

| File | Rule |
|------|------|
| **.gitea/workflows/ci.yaml** | **All 4 must contribute and review.** Members 1&2 maintain frontend steps, Member 3 api1 steps, Member 4 api2 steps; all 4 can edit any section. |
| **docker-compose.yaml** | **All 4 must contribute and review.** Members 1&2 maintain nginx+frontend, Member 3 api1+db1, Member 4 api2+db2+redis; all 4 review volumes and networks. |
| **README.md** | **All 4 must contribute and review.** Each maintains their area; all 4 review overview, architecture, install, demo. |

---

**Summary:** 2 members for frontend + nginx (Dockerfile and .dockerignore shared). 1 member for API1. 1 member for API2. All 4 contribute to ci.yaml, docker-compose.yaml, and README.md.
