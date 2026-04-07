# Project Guidelines

## Project Structure

- This workspace is a Bun monorepo with two top-level packages: `client` and `server`.
- Use root scripts from `package.json` for most tasks:
  - `bun run dev` (runs both client and server)
  - `bun run build` (builds server then client)
  - `bun run start` (starts built server)
- Do not reintroduce an `apps/` wrapper directory unless explicitly requested.

## Architecture

- Frontend is in `client` (React + TypeScript + Vite).
- Backend is in `server` (Express + TypeScript on Bun runtime).
- Current backend routes are minimal:
  - `GET /`
  - `GET /api/health`
- Vite dev proxy forwards `/api/*` to `http://localhost:3001` (see `client/vite.config.ts`).

## Development Environment

- Default ports:
  - Client: `5173`
  - Server: `3001`
- Server reads `PORT` from environment and defaults to `3001`.
- Required server environment variables live in `server/.env`:
  - `DATABASE_URL` for Prisma application access
  - `ADMIN_DATABASE_URL` for database recreation/setup scripts
- If changing `PORT`, keep `client/vite.config.ts` proxy target in sync.
- Prefer Bun commands over npm/yarn/pnpm for this repository.

## Build And Validation

- Root-level preferred commands:
  - `bun run dev`
  - `bun run build`
  - `bun run start`
- Package-level commands when working in one area:
  - Client lint: `bun --cwd client run lint`
  - Server DB setup: `bun --cwd server run db:setup`
- There is currently no root test command; do not assume a test runner is configured.

## TypeScript And Modules

- Both packages use ES modules (`"type": "module"`).
- Keep TypeScript strictness enabled.
- Server builds with Bun target (`bun build ... --target bun`) and outputs to `server/dist`.
- Client builds with `tsc -b` + `vite build` and outputs to `client/dist`.

## Conventions For Changes

- Keep frontend changes in `client` and backend/API changes in `server`.
- Use the existing `/api` proxy pattern for frontend-to-backend calls during local dev.
- If adding major features (auth, Prisma, queue, email, AI workflows), align implementation with phased plan before inventing new structure.

## Documentation Policy

- Use Context7 MCP to fetch up-to-date documentation for libraries, frameworks, SDKs, APIs, CLI tools, and cloud services.
- Context7 workflow: run `resolve-library-id` first, then `get-library-docs` with the user's specific topic/question.

## References

- Product scope: `project-scope.md`
- Planned implementation phases: `implementation-plan.md`
- Technology choices: `tech-stack.md`
- Client proxy config: `client/vite.config.ts`
- Server entrypoint: `server/src/index.ts`
