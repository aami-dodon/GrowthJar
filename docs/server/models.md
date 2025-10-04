# Data Models

## Users
- `id` (UUID, PK)
- `familyId` (UUID, FK -> Families.id, nullable)
- `role` (`parent` | `child`)
- `firstName` (string, required)
- `lastName` (string, optional)
- `email` (unique string)
- `passwordHash` (string)
- `emailVerified` (boolean)
- `createdAt` (timestamp, default now)
- `updatedAt` (timestamp, auto update)

## Families
- `id` (UUID, PK)
- `familyName` (string, optional)
- `createdAt` (timestamp)

## JarEntries
- `id` (UUID, PK)
- `familyId` (UUID, FK -> Families.id)
- `userId` (UUID, FK -> Users.id)
- `entryType` (`good_thing` | `gratitude` | `better_choice`)
- `content` (text)
- `metadata` (JSONB)
- `createdAt` (timestamp)

## Notifications
- `id` (UUID, PK)
- `familyId` (UUID, FK -> Families.id)
- `type` (`daily` | `weekly`)
- `sentAt` (timestamp)
- `createdAt` (timestamp)

## AuditLogs
- `id` (UUID, PK)
- `userId` (UUID, nullable FK -> Users.id)
- `action` (string)
- `details` (JSONB)
- `createdAt` (timestamp)

## EmailVerificationTokens
- `id` (UUID, PK)
- `tokenHash` (string, unique)
- `userId` (UUID, FK -> Users.id)
- `expiresAt` (timestamp)
- `createdAt` (timestamp)

## PasswordResetTokens
- `id` (UUID, PK)
- `tokenHash` (string, unique)
- `userId` (UUID, FK -> Users.id)
- `expiresAt` (timestamp)
- `createdAt` (timestamp)

## FamilyInvitations
- `id` (UUID, PK)
- `familyId` (UUID, FK -> Families.id)
- `email` (string)
- `role` (`parent` | `child`)
- `tokenHash` (string, unique)
- `expiresAt` (timestamp)
- `invitedById` (UUID, FK -> Users.id)
- `createdAt` (timestamp)
