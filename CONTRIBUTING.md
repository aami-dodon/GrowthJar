# Contributing to GrowthJar

Thank you for your interest in contributing to GrowthJar! We welcome contributions from the community and are committed to making the process as smooth as possible. Please take a moment to review the guidelines below before opening an issue or submitting a pull request.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Project Setup](#project-setup)
- [How to Contribute](#how-to-contribute)
  - [Reporting Bugs](#reporting-bugs)
  - [Suggesting Enhancements](#suggesting-enhancements)
  - [Submitting Changes](#submitting-changes)
- [Branching Strategy](#branching-strategy)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Documentation](#documentation)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Community Support](#community-support)

## Code of Conduct
By participating in this project you agree to abide by our [Code of Conduct](./CODE_OF_CONDUCT.md). Please report unacceptable behavior to `security@growthjar.io`.

## Project Setup
1. Fork the repository and clone your fork.
2. Install dependencies for both the server and client packages:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```
3. Copy `.env.example` to `.env` in both workspaces and provide the required configuration values.
4. Use `docker-compose` when you need local database services.

## How to Contribute

### Reporting Bugs
- Use the issue template provided and include environment details, steps to reproduce, expected behavior, and screenshots/logs when relevant.
- Do not disclose security vulnerabilities publicly. Follow the [security policy](./SECURITY.md).

### Suggesting Enhancements
- Before opening a new feature request, check for existing issues or discussions.
- Describe the problem you are trying to solve, not just the solution.
- Provide UI/UX mockups or API contracts if available.

### Submitting Changes
- Open an issue to discuss significant work before investing time in a solution.
- Ensure that your change is scoped to a single feature/fix.

## Branching Strategy
- Create branches from `main` using the following naming conventions:
  - `feature/<name>` for new features.
  - `fix/<name>` for bug fixes.
  - `chore/<name>` for maintenance tasks.
- Keep branches up to date with `main` and resolve conflicts before opening a pull request.

## Coding Standards
- Use JavaScript with ES Modules (`import`/`export`).
- Follow the feature-based folder structure (e.g., `client/src/features/<feature>` and `server/src/modules/<feature>`).
- Apply linting and formatting via ESLint and Prettier.
- Write JSDoc for all public functions, services, and API handlers.
- Keep shared types in `shared/types` aligned with server and client implementations.

## Testing
- Write unit and integration tests using Jest and React Testing Library.
- Ensure critical flows (auth, payments, uploads) have end-to-end coverage when modified.
- All tests must pass before submitting a pull request.

## Documentation
- Update `/docs` and related markdown files (`CHANGELOG.md`, `API-SPECS.md`, `DB-SCHEMA.md`, etc.) whenever behavior or APIs change.
- Provide README updates within new features/modules describing their purpose and usage.

## Commit Messages
- Use present tense and keep messages concise (e.g., `Add enrollment controller validation`).
- Reference related issues using `Fixes #123` where appropriate.
- Do not commit secrets or environment files.

## Pull Requests
- Describe what changed, why, and how it was tested.
- Include screenshots or screen recordings for UI changes.
- Request at least one reviewer and address all review feedback promptly.
- Ensure the PR title is descriptive and follows semantic conventions when possible.

## Community Support
If you need help or have questions, open a GitHub Discussion or join the community channel (link shared in the README). For sensitive topics (security or conduct), contact the maintainers at `security@growthjar.io`.

We appreciate your contributions and for helping make GrowthJar better for everyone!
