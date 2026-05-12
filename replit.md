# Voyager — Invite-Only Urban Exploration Network

## Overview

**Voyager** is a full-stack invite-only urbex (urban exploration) community platform with a retro XFire-inspired aesthetic. Built as a pnpm workspace monorepo.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild
- **Frontend**: React + Vite + Tailwind CSS
- **Routing**: Wouter
- **Data fetching**: TanStack React Query
- **Maps**: react-leaflet (dark/satellite/terrain view toggle)

## Artifacts

| Artifact | Path | Port |
|---|---|---|
| `voyager` (frontend) | `/` | 19286 |
| `api-server` (backend) | `/api` | 8080 |

## Features

- **Invite-only access**: Admin generates invite codes; users register via code
- **Forum**: Categories, threads, posts, votes, search, location tagging
- **Discord-style Chat**: Real-time chat rooms with thread tags + location pins
- **Interactive Map**: Leaflet map with Dark / Satellite (ESRI) / Terrain toggle
- **Crews**: Group formation for exploration teams
- **Direct Messages**: Encrypted private messages between members
- **Admin Panel**: User management, invites, site settings, announcements
- **XFire retro cosmetics**: CRT scanlines, noise texture, glitch-text hover, neon glow pulse, corner-bracket card decorations
- **Trust levels**: Verified/Inner-Circle member tiers with visual badges
- **Geographic Sectors**: US state-based location browsing

## Default Credentials (seeded)

- **Admin**: `admin` / `ChangeMe!2026`
- **Invite code**: see seed output (run `pnpm --filter @workspace/scripts run seed`)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — seed initial data

## Environment Secrets Required

- `DATABASE_URL` — PostgreSQL connection string (auto-set by Replit)
- `SESSION_SECRET` — Express session secret

## Directory Structure

```
artifacts/
  voyager/         — React+Vite frontend (Voyager UI)
  api-server/      — Express 5 REST API
lib/
  db/              — Drizzle schema + migrations
  api-spec/        — OpenAPI spec (openapi.yaml) + Orval config
  api-client-react/ — Generated React Query hooks
  api-zod/         — Generated Zod validation schemas
scripts/
  seed.ts          — Database seeder
voyager-source/    — Original cloned source (reference only)
```
