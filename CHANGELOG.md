# Changelog

# [0.2.1] - 2024-06-08
### Changed
- Locked daily gratitude and better choice submissions to the signed-in family member on both the UI and API so moms, dads, and the configured child can only add their own slips.
- Simplified growth jar forms to show only the applicable entry tools for each role and clarified feedback messaging.

# [0.2.0] - 2024-06-07
### Added
- Authentication landing page with mom/dad/child specific sign-up flows, password reset, and email verification UX.
- Prisma `FamilyRole` enum and signup restrictions that ensure only the configured trio of addresses can create accounts.
- HTML email templates for verification, password reset, and invitations using a mobile-friendly design system.
- Database migration that adds the `FamilyRole` enum/column to the `User` table for deployments wired via `DATABASE_URL`.

### Changed
- Login responses now include `familyRole` metadata and the frontend shells the growth jar behind an authenticated layout with logout controls.

## [0.1.0] - 2024-05-04
### Added
- Initial Express + Prisma server scaffolding with JWT auth, RBAC, and audit logging.
- Family management APIs covering creation, invitations, and acceptance.
- Jar entry CRUD with weekly summaries, timeline feeds, and child better choice responses.
- Notifications endpoints for daily/weekly reminders and export endpoints for CSV/PDF downloads.
- Prisma schema, environment template, backend documentation, and Jest/Supertest smoke test for auth signup.
