## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────┐
│  React Frontend │────▶│  Express API     │────▶│  PostgreSQL    │
│  (Vite + TS)    │     │  (Node.js + TS)  │     │  (Docker dev)  │
│                 │     │  (Prisma + JWT)  │     │  (RDS prod)    │
│  S3 + CF prod   │     │  ECS Fargate     │     │                │
└─────────────────┘     └──────────────────┘     └────────────────┘
                                │
                                ▼
                         ┌──────────────────┐
                         │  S3 (Documents)  │
                         │  + Presigned URLs│
                         └──────────────────┘
```

- **Frontend** — React + TypeScript dashboard for HR staff and dispatchers
- **Backend** — Node.js + Express API handling business logic, auth, and RBAC
- **Database** — PostgreSQL storing drivers, dispatchers, vehicles, loads, telemetry, and analytics snapshots
- **Documents** — vehicle docs and maintenance receipts in S3, metadata in the DB (planned)
- **Telemetry** — an Android tablet app (separate repo) pings the API with GPS data (planned)

---

## Current Status

- **Auth & RBAC** — JWT login/register, `GET /auth/me`, and action-level permissions checked on every endpoint
- **Roles seeded** — admin, HR, dispatcher, driver, plus 19 action-level permissions
- **HR management** — create driver/dispatcher accounts and vehicles straight from the UI
- **Associations** — link a dispatcher to a driver, and attach as many vehicles as you want to a driver
- **Live endpoints** — `/drivers`, `/dispatchers`, `/vehicles` all served from the database
- **HR dashboard** — stat cards backed by real data: monthly active-driver/vehicle snapshots, weekly loads (dispatched/completed/cancelled), and a live active-load count
- **Stat snapshots** — a scheduled job quietly records the current month's driver/vehicle counts (daily upsert)
- **Dispatcher map** — Google Maps UI with fit-bounds + driver markers (shows a placeholder until an API key is added)

## To Do
- Loads (assignment) management page
- Driver status updates
- Vehicle documents + expiration tracking (Phase 2, S3 uploads)
- Google Maps API key activation
- Android telemetry app + live GPS ingestion (Phase 3)
- Production deployment (GitHub Actions CI/CD, S3 + CloudFront, ECS Fargate, RDS)
- Route-level code splitting to trim the initial bundle size

---

## Roles & Permissions

| Role | Responsibilities |
|---|---|
| **Admin** | Super user — can do everything, including managing staff accounts |
| **HR** | Runs the show for drivers/dispatchers, vehicle records, fleet documentation, maintenance |
| **Dispatcher** | On the ground ops — watches the map, updates driver status, handles scheduling/assignments |
| **Driver** | Vehicle operator using the Android telemetry app |

Permissions are action-level (`drivers.view`, `vehicles.create`, `users.manage`, …) and always enforced server-side via `requirePermission`. The frontend also hides views your role can't access, so nobody sees stuff they shouldn't.

---

## Database Entities

*Implemented:*

- **Users** — auth + role assignment (one table for everyone)
- **Drivers** — personal info, license, status (Available / En Route / In Progress / Offline), dispatcher assignment, last-known GPS position
- **Dispatchers** — dispatcher profiles; each dispatcher can oversee many drivers
- **Vehicles** — make, model, year, VIN, plate, operational status, and ownership (owner-operator vs leased) with an optional owner-driver link
- **Driver-Vehicle associations** — many-to-many; a driver can use several vehicles, and a leased/owner-operator vehicle can be driven by others
- **Assignments (Loads)** — driver-vehicle-dispatcher trips with lifecycle timestamps (dispatched/completed/cancelled)
- **Stat Snapshots** — monthly point-in-time counts of active drivers and total vehicles, powering the dashboard charts

*Planned:*

- **Vehicle Documents** — insurance, registration, permits; type, S3 key, issue/expiration date, status
- **GPS Locations** — timestamped coordinates from the Android telemetry
- **Calendar Events** — driver availability, vacations, blocked dates; subscribable via iCal
- **Maintenance Records** — service history per vehicle
- **Audit Logs** — tracking sensitive operations

---

## Implementation Roadmap

| Phase | Features | Status |
|---|---|---|
| **Phase 1** | User auth (RBAC), HR management, SQL schema, driver/dispatcher CRUD | **In progress** — auth/RBAC, seed, and driver/dispatcher/vehicle CRUD are done |
| **Phase 2** | Vehicle management (with documents + expiration tracking), S3 uploads | Pending |
| **Phase 3** | Android telemetry app + live GPS ingestion API | Pending |
| **Phase 4** | Dispatcher dashboard with Google Maps + live driver locations | **In progress** — map UI is built, needs API key + telemetry |
| **Phase 5** | Calendar scheduling, driver availability, iCal subscription | Pending |
| **Phase 6** | VIN lookup API integration | Pending |
| **Phase 7** | Route visualization, optional weather overlay (stretch goal) | Pending |

---

## Third-Party Integrations

- **Google Maps** — mapping, geolocation, route visualization (in use; API key pending)
- **VIN Lookup Service** — auto-fill vehicle specs from a VIN (planned)
- **Calendar (iCal/Google Calendar)** — driver schedule subscriptions (planned)
- **Amazon S3** — document storage with presigned URL upload/download (planned)

---

## Local Development

For the full walkthrough (environment files, Prisma client generation, migrations, troubleshooting), see [DEV_SETUP.md](./DEV_SETUP.md).

### Services

| Component |  | Port | Start |
|---|---|---|---|
| PostgreSQL | Docker container | 5432 | `docker compose up db` |
| Backend | `tsx watch` on host | 3001 | `npm run dev:backend` |
| Frontend | Vite on host (HMR) | 5173 | `npm run dev:frontend` |

### Prerequisites

- Node.js 22+
- Docker Desktop
- npm

### Setup

```sh
# Copy environment files (root, backend, frontend)
cp .env.example .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start database + install dependencies
docker compose up db -d
npm install          # root (concurrently)
cd backend && npm install && npx prisma generate
cd ../frontend && npm install

# Apply migrations + seed
npm run db:migrate
npm run db:seed

# Start everything (database + backend + frontend)
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api/*` to `http://localhost:3001`.

Every seeded user logs in with the password `password123`:

| Email | Role | Notes |
|---|---|---|
| `admin@overseer.dev` | Administrator | Can create staff accounts |
| `hr@overseer.dev` | HR | Drivers / vehicles / docs management |
| `dispatcher@overseer.dev` | Dispatcher | Map + live dispatch view |
| `driver1@overseer.dev` | Driver | Demo driver with a last-known location |
| `driver2@overseer.dev` | Driver | Demo driver with a last-known location |

### Notes

- **Docker only for PostgreSQL locally** — running the frontend in containers caused Vite HMR headaches
- **API versioned at `/api/v1/`** — the Android telemetry app consumes this API
- **Prisma ORM + migrations** — Prisma's migration workflow feels a lot like Laravel's (`prisma migrate dev` / seed) 
- **JWT bearer auth** — stateless, works for both the dashboard and the future Android client. 
- *Single-domain CloudFront routing in prod* — CloudFront serves the S3 frontend and routes `/api/*` to the ALB, killing CORS headaches
---

## Project Structure

```
overseer/
├── docker-compose.yml            # PostgreSQL only (local)
├── .env.example
├── .gitignore
├── DEV_SETUP.md                  # Local setup + troubleshooting guide
│
├── backend/
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma         # Models, enums, relations
│   │   ├── seed.ts               # Idempotent seed (roles, perms, demo data)
│   │   └── migrations/           # Versioned SQL migrations
│   └── src/
│       ├── index.ts              # Express app + router mounting
│       ├── prisma.ts             # PrismaClient (PrismaPg adapter)
│       ├── middleware/auth.ts    # authenticate + requirePermission
│       ├── jobs/statSnapshot.ts  # Daily monthly-snapshot recorder
│       └── routes/
│           ├── auth.ts           # login / register / me
│           ├── drivers.ts        # list + dispatcher/vehicle associations
│           ├── dispatchers.ts    # list
│           ├── vehicles.ts       # list + create
│           └── dashboard.ts      # stats (live + monthly + weekly series)
│
├── frontend/
│   ├── package.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx               # Routes + role gates
│       ├── theme/                # MUI theme + customizations
│       ├── context/AuthContext.tsx
│       ├── api/
│       │   ├── client.ts         # fetch wrapper + token storage
│       │   ├── auth.ts
│       │   ├── drivers.ts
│       │   ├── dispatchers.ts
│       │   ├── vehicles.ts
│       │   └── dashboard.ts
│       ├── components/
│       │   ├── DashboardLayout.tsx
│       │   ├── DriverList.tsx
│       │   ├── dashboard/        # Menu, header, sidebar, StatCard, data grid
│       │   ├── hr/               # Create/edit dialogs
│       │   └── maps/FleetMap.tsx # Google Maps wrapper
│       ├── pages/
│       │   ├── Login.tsx
│       │   ├── hr/               # Dashboard, Drivers, Dispatchers, Vehicles
│       │   └── dispatcher/Dashboard.tsx
│       └── internals/data/       # Data-grid column definitions
```

---

## ---- Production Deployment (AWS) ----> *Draft*    

| Service | Purpose | Details |
|---|---|---|
| **S3 + CloudFront** | Frontend hosting | Vite build synced to S3, CloudFront for CDN and SSL. Routes `/api/v1/*` to ALB. |
| **ECS Fargate + ECR** | Backend API | Multi-stage Docker image, ECS service behind ALB. |
| **RDS PostgreSQL** | Database | Managed database, not containerized. |
| **S3** | Document storage | Backend generates presigned URLs for upload/download. |
| **GitHub Actions** | CI/CD | On push to `main`: build frontend → S3, build Docker → ECR → update ECS. |

### Deployment Flow

1. Push to `main` triggers GitHub Actions
2. Frontend: `npm ci && npm run build` → `aws s3 sync dist/ s3://<bucket>` → CloudFront invalidation
3. Backend: Docker build → push to ECR → ECS rolling update

---

## Tech Stack

| Layer | Local | Production |
|---|---|---|
| Frontend | React 19, TypeScript, Vite, MUI, MUI X (DataGrid, Charts) | S3 + CloudFront |
| Backend | Express, TypeScript, Prisma 7, JWT, node-cron, tsx (watch) | ECS Fargate |
| Database | PostgreSQL 16 (Docker) | RDS PostgreSQL |
| APIs | cURL / Postman | HTTPS with SSL/TLS |
| CI/CD | — | GitHub Actions |
