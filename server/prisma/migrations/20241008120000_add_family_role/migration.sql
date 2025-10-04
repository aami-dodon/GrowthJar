-- Prisma Migration: add FamilyRole enum and user column
-- Generated manually to align the database schema with the authentication constraints.

-- Create the FamilyRole enum type if it does not already exist.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'FamilyRole') THEN
    CREATE TYPE "FamilyRole" AS ENUM ('mom', 'dad', 'child');
  END IF;
END$$;

-- Add the new column to the Users table when missing.
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "familyRole" "FamilyRole";

-- Ensure we have a unique index to enforce only one record per family role.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = current_schema() AND indexname = 'User_familyRole_key'
  ) THEN
    CREATE UNIQUE INDEX "User_familyRole_key" ON "User"("familyRole");
  END IF;
END$$;
