# Booking Management System

An internal operational tool for staff to manage customer bookings for available services.

Staff can create bookings, view all bookings, update a booking's status as it progresses, and browse the list of available services (read-only).

## Tech stack

| Layer     | Technology                                              |
| --------- | ------------------------------------------------------- |
| Frontend  | Next.js (App Router, TypeScript)                        |
| Backend   | NestJS (TypeScript)                                     |
| Database  | PostgreSQL                                              |
| ORM       | Prisma                                                  |
| API style | REST                                                    |

## Repository structure

```
booking-management-system/
├── backend/          # NestJS REST API (port 3001)
├── frontend/         # Next.js application (port 3000)
├── docker-compose.yml
├── .github/workflows/ci.yml
└── README.md
```

Each folder is independently runnable with its own `package.json` and `.env`.

---

## Prerequisites

- Node.js 22+ and npm
- PostgreSQL 14+ running locally (or use Docker, see below)

---

## Quick start with Docker (optional)

With Docker installed, run the whole stack:

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001/api
- PostgreSQL runs on localhost:5432

The backend container runs `prisma migrate deploy` before starting. To seed sample services:

```bash
docker compose exec backend npx prisma db seed
```

---

## Backend setup (local)

```bash
cd backend
npm install
```

> `npm install` runs a `postinstall` hook that generates the Prisma client.

1. Copy the environment file and adjust the database URL:

   ```bash
   cp .env.example .env
   ```

2. Create the database and run the migration:

   ```bash
   createdb booking_management   # or: psql -U postgres -c "CREATE DATABASE booking_management;"
   npm run db:migrate            # runs: prisma migrate dev
   ```

3. Seed sample services (5 rows):

   ```bash
   npm run db:seed               # runs: prisma db seed
   ```

4. Start the API:

   ```bash
   npm run start:dev             # http://localhost:3001/api
   ```

Run tests with `npm test` (23 unit tests covering the booking service and DTO validation).

### Backend environment variables (`.env`)

| Variable      | Example                                                           | Description                |
| ------------- | ----------------------------------------------------------------- | -------------------------- |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/booking_management` | PostgreSQL connection URL |
| `PORT`        | `3001`                                                            | API port                  |

### Backend scripts

| Script           | Description                                  |
| ---------------- | -------------------------------------------- |
| `npm run start:dev` | Start in watch mode                       |
| `npm run build`  | Compile to `dist/`                           |
| `npm run start:prod` | Run the compiled app                   |
| `npm test`       | Run unit tests                               |
| `npm run lint`   | Run ESLint                                  |
| `npm run db:migrate` | Apply the Prisma migration             |
| `npm run db:seed` | Seed sample services                       |

---

## Frontend setup (local)

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev                  # http://localhost:3000
```

### Frontend environment variables (`.env.local`)

| Variable              | Example                        | Description              |
| --------------------- | ------------------------------ | ------------------------ |
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api`    | Base URL of the backend API |

If `NEXT_PUBLIC_API_URL` is not set, the frontend falls back to `http://localhost:3001/api`.

---

## API

All endpoints are under `/api` (configured in `backend/src/main.ts`).

| Method | Path                      | Description                    | Body                                                  |
| ------ | ------------------------- | ------------------------------ | ----------------------------------------------------- |
| POST   | `/api/bookings`           | Create a booking               | `{ customerName, customerEmail, serviceId, startTime, endTime }` |
| GET    | `/api/bookings`           | List bookings (joined service) | —                                                     |
| GET    | `/api/bookings/:id`       | Get a single booking           | —                                                     |
| PATCH  | `/api/bookings/:id/status` | Update booking status          | `{ status: "CONFIRMED" }`                             |
| GET    | `/api/services`           | List available services        | —                                                     |

Timestamps use ISO-8601 strings (`2026-08-20T10:00:00.000Z`). Booking status is one of `PENDING`, `CONFIRMED`, `COMPLETED`, `CANCELLED`.

### Allowed status transitions

```
PENDING   → CONFIRMED, CANCELLED
CONFIRMED → COMPLETED, CANCELLED
COMPLETED → (none)
CANCELLED → (none)
```

Invalid transitions and invalid input return a `400` with a clear JSON error message; missing bookings/services return `404`.

## Frontend pages

- `/` — landing page with links to each section
- `/bookings` — table of all bookings with service name, schedule, status badge, and a per-row status update dropdown (updates the UI immediately, no full page reload)
- `/bookings/new` — create-booking form with service dropdown, date/time pickers, and client-side validation
- `/services` — read-only table of available services (name, duration)

## Database schema

`backend/prisma/schema.prisma`

- **Service** — `id`, `name`, `duration` (minutes)
- **Booking** — `id`, `customerName`, `customerEmail`, `serviceId` (FK → Service), `startTime`, `endTime`, `status` (enum), `createdAt`, `updatedAt`

One `Service` has many `Bookings`. Migration files are in `backend/prisma/migrations/`.

## Development workflow

- `main` is always in a working state.
- Features are developed on `feat/<short-description>` branches and merged into `main` via pull requests.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`).

