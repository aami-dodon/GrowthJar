# Rishi's Jar

Family gratitude and growth tracker with a PERN stack. The frontend (Vite + React) lives in `/client` and this update introduces the Express/Prisma backend under `/server`. Authentication now gates the experience so only the configured mom, dad, and Rishi accounts can access the jar after verifying their emails.

## Getting Started (Server)
1. Install dependencies:
   ```bash
   cd server
   npm install
   ```
2. Copy `.env.example` to `.env` and populate database + secrets.

3. Apply migrations (after configuring Prisma) from the `/server` directory:
   - Set `AUTH_MOM_EMAIL`, `AUTH_DAD_EMAIL`, and `AUTH_RISHI_EMAIL` to the exact addresses that should be able to register.
3. Apply migrations (after configuring Prisma) to sync the `User` table with the new `FamilyRole` column:
   ```bash
   npm run prisma:migrate
   ```
4. Start the API:
   ```bash
   npm run dev
   ```
5. Access health check at `http://localhost:7500/health` and Swagger docs at `http://localhost:7500/docs`.

## Getting Started (Client)
```bash
cd client
npm install
npm run dev
```

The frontend launches with the authentication landing page. New sign-ups must verify their email before gaining access to the jar experience.

## Running with Docker
1. Copy `.env.example` to `.env` and update any secrets or database connection details you need. Docker Compose loads the defaults from `.env.example`, but every variable can be overridden by setting the same key in your local `.env` file before running the stack.
2. Build and start the containers:
   ```bash
   docker compose up --build
   ```
   The server container automatically runs `prisma migrate deploy` during startup, so your configured Postgres database receives the latest schema before the API begins accepting traffic.
3. The API will be available on `http://localhost:7500` and the frontend will be served on `http://localhost:5173` (port mappings can be adjusted via the environment variables in `.env.example`).

## Testing
```bash
cd server
npm test
```

## Folder Structure Highlights
- `server/src/config` — environment, logger, and Prisma configuration.
- `server/src/modules` — feature-aligned modules with controllers, services, validators, and README files.
- `server/src/middlewares` — shared Express middleware (auth, RBAC, error handling).
- `server/prisma` — Prisma schema and migrations.
- `docs/server` — backend documentation and data model reference.
