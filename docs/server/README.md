# Server Architecture Overview

The Node.js server is powered by Express and Prisma. Feature slices under `server/src/modules` mirror the client feature directories and provide controllers, services, validators, and module-specific README files.

## Key Components
- **Authentication**: JWT-based auth with email verification, password reset, and role-gated mom/dad/Rishi onboarding.
- **Families**: Family creation, invitations, and membership acceptance workflows.
- **Jar Entries**: CRUD APIs for good things, gratitude notes, better choices, and child responses.
- **Notifications**: Manual trigger plus history for daily/weekly reminders.
- **Exports**: CSV and PDF exports of jar entries.
- **Audit Logs**: System access protected endpoint for operational visibility.

All requests pass through helmet, compression, CORS, morgan+winston logging, and shared rate limiting.
