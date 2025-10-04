# Rishi's Jar

Family gratitude and growth tracker with a PERN stack. The frontend (Vite + React) lives in `/client` and this update introduces the Express/Prisma backend under `/server`.

## Getting Started (Server)
1. Install dependencies:
   ```bash
   cd server
   npm install
   ```
2. Copy `.env.example` to `.env` and populate database + secrets.
3. Apply migrations (after configuring Prisma) from the `/server` directory:
   ```bash
   npm run prisma:migrate
   ```
4. Start the API:
   ```bash
   npm run dev
   ```
5. Access health check at `http://localhost:4000/health` and Swagger docs at `http://localhost:4000/docs`.

## Running with Docker
1. Copy `.env.example` to `.env` if you need to override any defaults. The compose setup will also fall back to `.env.example` directly when no `.env` file is present.
2. Build and start the containers:
   ```bash
   docker compose up --build
   ```
   The server container automatically runs `prisma migrate deploy` during startup, so your configured Postgres database receives the latest schema before the API begins accepting traffic.
3. The API will be available on `http://localhost:4000` and the frontend will be served on `http://localhost:5173` (port mappings can be adjusted via the environment variables in `.env.example`).

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
