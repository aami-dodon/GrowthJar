# Rishi's Jar

Family gratitude and growth tracker with a PERN stack. The frontend (Vite + React) lives in `/client` and this update introduces the Express/Prisma backend under `/server`.

## Getting Started (Server)
1. Install dependencies:
   ```bash
   cd server
   npm install
   ```
2. Copy `.env.example` to `.env` and populate database + secrets.
3. Apply migrations (after configuring Prisma):
   ```bash
   npx prisma migrate deploy
   ```
4. Start the API:
   ```bash
   npm run dev
   ```
5. Access health check at `http://localhost:4000/health` and Swagger docs at `http://localhost:4000/docs`.

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
