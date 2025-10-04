# Database Schema Summary

The relational schema is managed through Prisma. Core tables:

- **Users** — stores parent/child accounts with bcrypt hashed passwords, optional per-family role tags, and verification flags.
- **Families** — container for grouping users; parents create and manage.
- **JarEntries** — gratitude, good things, and better choices along with metadata.
- **Notifications** — audit trail of daily/weekly reminders.
- **AuditLogs** — immutable log of important actions.
- **EmailVerificationTokens** — hashed tokens for email verification flow.
- **PasswordResetTokens** — hashed tokens for password reset.
- **FamilyInvitations** — invitation tokens for onboarding new members.
- **FamilyRole enum** — restricts account creation to `mom`, `dad`, and `rishi` (one record each via a unique constraint).

See `server/prisma/schema.prisma` and `docs/server/models.md` for field-level details.
