# Notification Preferences Module

This module manages the persisted notification settings for a family. It exposes
REST handlers that allow authenticated family members to read and update their
preferences, including entry alerts, reminder toggles, and the preferred
reflection time used by scheduled nudges.

## Owned Responsibilities
- Validating incoming payloads for the notification preference endpoints.
- Persisting per-family preferences in Prisma and returning normalized values
  with sensible defaults when no record exists yet.
- Recording audit logs when preferences change so updates remain traceable.

## Exposed Routes
- `GET /api/notification-preferences` — Return the effective settings for the
  signed-in family member, falling back to defaults when unset.
- `PUT /api/notification-preferences` — Update the family’s notification
  preferences.
