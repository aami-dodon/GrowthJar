# Growth Jar

Growth Jar is a family-focused gratitude and personal development tracker built on a PERN stack. The platform helps family members capture daily reflections, celebrate collective wins, and visualize long-term growth through a secure, role-aware experience.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Setup](#setup)
  - [Environment Variables](#environment-variables)
  - [Backend](#backend)
  - [Frontend](#frontend)
  - [Docker](#docker)
- [Testing](#testing)
- [Documentation](#documentation)
- [Contributing](#contributing)
- [License](#license)

## Overview
Growth Jar separates the frontend and backend into dedicated workspaces. The React client delivers the Growth Jar experience while the Express API powers authentication, journaling workflows, and persistence. Authentication is role-based and supports predefined family members (mom, dad, and child) who must verify their email before gaining access.

## Features
- Role-based authentication with email verification for each family member.
- Daily gratitude entry creation, browsing, and reflection insights.
- Prisma-powered data persistence in Postgres with audited migrations.
- Centralized logging via Winston and Morgan for observability.
- Comprehensive API documentation exposed through Swagger UI.
- Docker Compose configuration for a one-command local development stack.

## Tech Stack
| Layer      | Technologies |
| ---------- | ------------ |
| Frontend   | React (Vite), Tailwind CSS |
| Backend    | Node.js, Express.js, Prisma ORM, Winston, Morgan |
| Database   | Postgres |
| Tooling    | Jest, React Testing Library, Docker, Docker Compose, Swagger (OpenAPI) |

## Project Structure
```
/
├── client/              # React application (Vite)
│   ├── public/
│   └── src/features     # Feature-aligned UI modules
├── server/              # Express + Prisma API
│   ├── prisma           # Prisma schema and migrations
│   └── src/modules      # Feature modules (controllers, services, validators)
├── docker-compose.yml   # Local development stack definition
├── API-SEPCS.md         # API reference and contracts
├── DB-SCHEMA.md         # Database schema documentation
└── CHANGELOG.md         # Release history
```

## Prerequisites
- Node.js 18+
- npm 9+
- Docker & Docker Compose (optional, for containerized workflows)
- Access to a Postgres instance (connection string supplied via environment variables)

## Setup
Clone the repository and install dependencies in both workspaces.

```bash
git clone <repo-url>
cd RishisJar
```

### Environment Variables
1. Copy the example environment files and update secrets:
   ```bash
   cp server/.env.example server/.env
   cp client/.env.example client/.env   # if present
   ```
2. Set authentication values such as `AUTH_MOM_EMAIL`, `AUTH_DAD_EMAIL`, `AUTH_CHILD_EMAIL`, and `CHILD_NAME` to match the intended family members.
3. Provide a Postgres connection string and any other service credentials referenced in the `.env` files.

### Backend
```bash
cd server
npm install
npm run prisma:migrate
npm run dev
```
- API available at `http://localhost:7500`.
- Health check at `http://localhost:7500/health`.
- Swagger UI at `http://localhost:7500/docs`.

### Frontend
```bash
cd client
npm install
npm run dev
```
- Vite dev server defaults to `http://localhost:5173`.
- Ensure `VITE_API_URL` (or equivalent) points to the running backend.

### Docker
```bash
docker compose up --build
```
- Uses values from `.env.example` with overrides from your local `.env` file.
- Backend and frontend containers are exposed on ports `7500` and `5173` respectively.
- Prisma migrations run automatically via `prisma migrate deploy` during container startup.

## Testing
Run unit and integration tests with npm scripts in each workspace.

```bash
cd server
npm test
```

For the client:
```bash
cd client
npm test
```

Additional tooling such as `npm run lint` and `npm run test:watch` can be executed if configured.

## Documentation
- API reference and contracts: [`API-SEPCS.md`](./API-SEPCS.md)
- Database schema details: [`DB-SCHEMA.md`](./DB-SCHEMA.md)
- Release notes and change log: [`CHANGELOG.md`](./CHANGELOG.md)
- Swagger UI served from the backend at `/docs`.

## Contributing
- Use feature-based branches (`feature/<name>`, `fix/<name>`, `chore/<name>`).
- Keep frontend and backend logic in their respective feature/module directories.
- Update related documentation (`/docs`, API specs, DB schema, etc.) when introducing changes.
- Run tests and linters before opening a pull request.
- Submit pull requests with a summary, rationale, and screenshots for UI updates. One approval is required before merging.

## License
This project is currently unlicensed. All rights reserved.
