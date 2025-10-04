# Project Guidelines

These rules apply to **all agents** working on the project. Follow them strictly to maintain consistency, security, and quality.

---

## Tech Stack (PERN)  
- **Postgres** → Primary relational database (hosted externally, connected via `.env` connection string).  
- **Express.js** → Backend framework for building REST APIs.  
- **React.js** → Frontend framework for UI.  
- **Node.js** → Runtime environment for backend.  
- **MongoDB** (via Mongoose) → For flexible/non-relational data (progress, events).  
- **TailwindCSS** → Utility-first CSS framework for styling.  
- **Prisma ORM** → For managing relational schemas in Postgres.  
- **Mongoose** → ODM for MongoDB collections.  
- **Winston + Morgan** → Logging.  
- **Jest + React Testing Library** → Testing framework.  
- **Swagger (OpenAPI)** → API documentation.  

---

### 1. Code & Project Structure  
- Follow **feature-based folder structure** (no dumping everything into `/utils`).  
- Always separate **frontend, backend, shared** code.  
- Mirror slices: every `client/src/features/<feature>` must have a matching `server/src/modules/<feature>` (same name, docs, and routes).  
- House cross-cutting adapters (email, storage, external APIs) under `server/src/integrations` and inject them into features.  
- Keep documentation updated in `/docs` after each feature; add a short README inside each feature/module describing owned UI and APIs.  
- Every new feature = new folder under `/modules` (backend) or `/features` (frontend).  

### 2. Languages & Standards  
- **Language:** JavaScript (Node.js for backend, React for frontend).  
- Use **ES Modules** (`import/export`) consistently.  
- Enforce linting & formatting via **ESLint + Prettier**.  
- Write **JSDoc** comments for all functions and APIs.  

### 3. Security  
- Always hash passwords with **bcrypt**.  
- Never log sensitive data (tokens, passwords, emails).  
- Use **JWT** for authentication.  
- Use **RBAC** middleware for role-based access.  
- Configure **CORS** to allow only trusted origins (multiple via `.env`).  
- All file uploads (profile pics, videos) must go to **MinIO via presigned URLs**.  

### 4. API & Logging  
- Every API must be documented in **Swagger (OpenAPI)**.  
- Log all requests/responses with **Winston + Morgan**.  
- Use structured JSON logs only.  
- Export shared request/response shapes from `shared/types` and reference them in controller/service JSDoc.  
- Error handling via central middleware (`/middlewares/errorHandler.js`).  

### 5. Database & Models  
- **Postgres**: Primary database, hosted externally. Connection is via a **connection string in `.env`**. Use **Prisma ORM** for relational data (courses, enrollments). Prisma schema lives in `server/prisma/schema.prisma`; run `npm run prisma:migrate` when altering it.  
- **MongoDB**: Use **Mongoose** for flexible data (progress tracking, events).  
- Every schema change must update `/docs/server/models.md` and the relevant entries in `shared/types`.  

### 6. Frontend Guidelines  
- Use **TailwindCSS** for styling.  
- Routes managed in `routes.js`, not hardcoded.  
- No inline CSS — always use Tailwind utility classes or extracted components.  
- Components must be **reusable and small**.  

### 7. Git & Workflow  
- Branch naming: `feature/<name>`, `fix/<name>`, `chore/<name>`.  
- Pull Requests must include:  
  - What changed  
  - Why it changed  
  - Screenshots (if UI)  
- At least **1 code review approval** before merge.  
- Never commit `.env` files.  

### 8. Environment & Config  
- All config values must come from `.env` (never hardcoded).  
- `.env.example` must be updated whenever a new variable is introduced.  
- Separate configs for **dev, staging, prod**.  

### 9. Testing  
- Every new API must have at least a **basic integration test**.  
- Use **Jest** for backend, **React Testing Library** for frontend.  
- Critical flows (auth, payments, uploads) must be tested end-to-end.  

### 10. Documentation & Communication  
- Update relevant `/docs` files whenever a feature is built (mirror updates in both `docs/client` and `docs/server`).  
- Update `CHANGELOG.md`, `API-SPECS.md`, `DB-SCHEMA.md`, `ROUTES.md`, `PAGES.md` and `COMPONENTS.md` for every release.  
- If unclear, ask questions in **issues/discussions**, not in code comments.  
