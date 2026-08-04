# overseer

Fleet Location Dashboard & Telemetry System

---

## Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌────────────────┐
│  React Frontend │────▶│  Express API     │────▶│  PostgreSQL    │
│  (Vite + TS)    │     │  (Node.js + TS)  │     │  (Docker dev)  │
│                 │     │                  │     │  (RDS prod)    │
│  S3 + CF prod   │     │  ECS Fargate     │     │                │
└─────────────────┘     └──────────────────┘     └────────────────┘
                                │
                                ▼
                         ┌──────────────────┐
                         │  S3 (Documents)  │
                         │  + Presigned URLs│
                         └──────────────────┘
```

A three-tier web application for fleet management:

- **Frontend** — React + TypeScript dashboard for HR staff and dispatchers
- **Backend** — Node.js + Express API handling business logic, auth, and RBAC
- **Database** — PostgreSQL storing drivers, dispatchers, vehicles, schedules, maintenance records, documents, GPS telemetry, and audit logs
- **Documents** — Vehicle documents and maintenance receipts stored in S3 with metadata in the database
- **Telemetry** — Android tablet app (separate repo) periodically sends GPS data to the API

---

## Roles & Permissions

| Role | Responsibilities |
|---|---|
| **HR** | Admin privileges — manage driver/dispatcher accounts, vehicle records, fleet documentation (insurance, registration, permits), maintenance records |
| **Dispatcher** | Operational — monitor driver locations on map, update driver status, manage scheduling/vacations, assign trips |

---

## Database Entities

- **Users** — authentication and role assignment
- **Drivers** — personal info, status (Available / En Route / In Progress / Offline), dispatcher assignment
- **Dispatchers** — dispatcher profiles, linked to assigned drivers
- **Vehicles** — make, model, year, VIN, plate, status; linked to documents with expiration tracking
- **Vehicle Documents** — insurance, registration, permits, inspection reports; each has type, S3 key, issue/expiration date, status (active / expired / revoked)
- **Assignments** — driver-vehicle-trip associations
- **GPS Locations** — timestamped coordinates from Android telemetry
- **Calendar Events** — driver availability, vacations, blocked dates; subscribable via iCal
- **Maintenance Records** — service history per vehicle
- **Audit Logs** — sensitive operation tracking

---

## Implementation Roadmap

| Phase | Features |
|---|---|
| **Phase 1** | User auth (RBAC), HR management, SQL schema, driver/dispatcher CRUD |
| **Phase 2** | Vehicle management (with documents + expiration tracking), S3 uploads |
| **Phase 3** | Android telemetry app + live GPS ingestion API |
| **Phase 4** | Dispatcher dashboard with Google Maps + live driver locations |
| **Phase 5** | Calendar scheduling, driver availability, iCal subscription |
| **Phase 6** | VIN lookup API integration |
| **Phase 7** | Route visualization, optional weather overlay (stretch goal) |

---

## Third-Party Integrations

- **Google Maps** — mapping, geolocation, route visualization
- **VIN Lookup Service** — auto-populate vehicle specs from VIN
- **Calendar (iCal/Google Calendar)** — driver schedule subscriptions
- **Amazon S3** — document storage with presigned URL upload/download

---

## Non-Goals

Weather visualization is considered a stretch goal and is not required for the first production release.

---

## Local Development

### Services

| Component | How | Port | Start |
|---|---|---|---|
| PostgreSQL | Docker container | 5432 | `docker compose up db` |
| Backend | `tsx watch` on host | 3001 | `cd backend && npm run dev` |
| Frontend | Vite on host (HMR) | 5173 | `cd frontend && npm run dev` |

### Prerequisites

- Node.js 22+
- Docker Desktop
- npm

### Setup

```sh
cp .env.example .env

# Start database
docker compose up db -d

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Start backend (new terminal)
cd backend && npm run dev

# Start frontend (new terminal)
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173). Vite proxies `/api/*` to `http://localhost:3001`.

### Key Decisions

- **Docker only for PostgreSQL locally** — avoids Vite HMR issues that occur when running inside containers
- **API versioned at `/api/v1/`** — the Android telemetry app consumes the API, versioning prevents breaking mobile clients
- **Single-domain CloudFront routing in prod** — CloudFront serves the S3 frontend and routes `/api/*` to the ALB, eliminating CORS concerns
- **Material UI** — chosen for a clean, professional look with consistent theming

---

## Project Structure

```
overseer/
├── docker-compose.yml            # PostgreSQL only (local)
├── .env.example
├── .gitignore
│
├── backend/
│   ├── Dockerfile                # multi-stage for ECS
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts
│       ├── db.ts
│       ├── routes/
│       │   ├── auth.ts
│       │   ├── drivers.ts
│       │   ├── vehicles.ts
│       │   ├── telemetry.ts
│       │   └── documents.ts
│       └── middleware/
│           └── auth.ts
│
├── frontend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.app.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   ├── index.html
│   └── src/
│       ├── main.tsx
│       ├── App.tsx
│       ├── theme.ts
│       ├── vite-env.d.ts
│       ├── components/
│       │   └── Layout.tsx
│       ├── pages/
│       │   ├── Login.tsx
│       │   ├── hr/
│       │   │   ├── Dashboard.tsx
│       │   │   ├── Drivers.tsx
│       │   │   ├── Dispatchers.tsx
│       │   │   └── Vehicles.tsx
│       │   └── dispatcher/
│       │       ├── Dashboard.tsx
│       │       └── Map.tsx
│       ├── hooks/
│       └── api/
│           └── client.ts
│
└── .github/
    └── workflows/
        └── deploy.yml
```

---

## Production Deployment (AWS)

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
| Frontend | React 18, TypeScript, Vite, MUI | S3 + CloudFront |
| Backend | Express, TypeScript, tsx (watch) | ECS Fargate |
| Database | PostgreSQL 16 (Docker) | RDS PostgreSQL |
| APIs | Postman | HTTPS with SSL/TLS |
| CI/CD | — | GitHub Actions |
