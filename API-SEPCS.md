# API Specifications

## Auth
- `POST /api/auth/signup` — Register the mom, dad, or child account (requires matching `familyRole` and configured email configured via `CHILD_NAME` and its companion email variables), triggers email verification.
- `POST /api/auth/login` — Exchange credentials for JWT after email verification.
- `POST /api/auth/verify-email` — Validate verification token.
- `POST /api/auth/request-password-reset` — Issue password reset token.
- `POST /api/auth/reset-password` — Complete password reset with valid token.

## Families
- `POST /api/families` — Parents create a family and attach themselves.
- `POST /api/families/invite` — Parents invite another member via email token.
- `POST /api/families/accept-invite` — Accept invitation and join the family.
- `GET /api/families/:id` — Fetch family roster and metadata.

## Jar Entries
- `POST /api/jar-entries` — Create good thing, gratitude, or better choice entry.
- `GET /api/jar-entries` — List entries with optional type filter.
- `GET /api/jar-entries/:id` — Fetch a single entry.
- `PUT /api/jar-entries/:id` — Parent-only update of an entry.
- `DELETE /api/jar-entries/:id` — Parent-only deletion.
- `GET /api/jar-entries/summary/data` — Weekly or cumulative counts by type.
- `GET /api/jar-entries/timeline/data` — Chronological list for visualization.
- `POST /api/jar-entries/:id/respond` — Child response to a better choice entry.

## Notifications
- `POST /api/notifications/send` — Parent-triggered reminder event.
- `GET /api/notifications` — History of notifications per family.

## Notification Preferences
- `GET /api/notification-preferences` — Fetch the current family notification settings with defaults applied.
- `PUT /api/notification-preferences` — Update the family notification preferences (entry alerts, reminders, reflection time).

## Exports
- `GET /api/exports/csv` — Download entries as CSV.
- `GET /api/exports/pdf` — Download entries as PDF.

## Audit Logs
- `GET /api/audit-logs` — System-only access via `X-System-Token` header.

## Utilities
- `GET /health` — Server health status.
- `GET /docs` — Swagger UI with endpoint documentation.
