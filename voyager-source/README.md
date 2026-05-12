# VoyagerFreeways

A retro Xfire-style invite-only gated community web app for urban explorers (urbex). Think old-school gaming community meets underground exploration culture.

## Architecture

**Monorepo (pnpm workspaces):**
- `artifacts/hidden-freeways` — React + Vite frontend (port 19571, preview path `/`)
- `artifacts/api-server` — Express 5 REST API (port 8080, path `/api`)
- `lib/db` — Drizzle ORM schema + PostgreSQL client
- `lib/api-spec` — OpenAPI 3.1 spec
- `lib/api-client-react` — Generated React Query hooks (Orval)
- `lib/api-zod` — Generated Zod schemas (Orval)
- `scripts` — Seed and utility scripts

## Key Technologies

- **Frontend:** React 19, Vite 7, Tailwind v4, shadcn/radix UI, wouter routing, @tanstack/react-query, leaflet/react-leaflet maps, framer-motion
- **Backend:** Express 5, express-session + connect-pg-simple, bcryptjs auth, pino logging
- **Database:** PostgreSQL (Replit managed), Drizzle ORM

## Features

- **Invite-only auth** — username/password login, invite code registration
- **Forum** — categories (with sub-categories), threads, posts, upvote/downvote voting
- **BBCode formatting** — Bold, italic, underline, strike, color, size, image embed, links, quotes, code blocks
- **Real-time-style chat rooms** — public rooms + trust-gated rooms, crew rooms
- **Crews** — private group chats, honor rank required (trust level 2+) to create
- **Direct Messages** — private 1-on-1 messaging
- **Location sharing** — interactive Leaflet maps, per US state (all 50 states)
- **Announcements** — admin-broadcasted site-wide banners
- **Admin panel** — user management, invite generation, categories/states/locations/threads control, guidelines editor, admin noticeboard
- **Admin Noticeboard** — internal admin-only bulletin board with pin support
- **Online presence** — lastSeenAt tracking, online users widget in sidebar + nav indicator
- **Reddit-style home sidebar** — online users list, active crews, activity feed
- **Trust/role system** — trust levels 0-5, roles: member/moderator/admin
- **Honor rank** — trust level 2+ unlocks crew creation
- **Activity feed** — recent threads and replies

## Seed Script

Run to populate all 50 US states, 8 categories (with sub-categories), site settings, chat rooms:

```bash
pnpm --filter @workspace/scripts run seed
# Add --fresh to wipe and reseed from scratch
pnpm --filter @workspace/scripts run seed --fresh
```

## Environment Variables

- `SESSION_SECRET` — Express session signing secret (set in Replit Secrets)
- `DATABASE_URL`, `PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`, `PGDATABASE` — auto-set by Replit DB
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — override seed defaults

## Default Admin Credentials

- **Username:** `admin`
- **Password:** `ChangeMe!2026`

Change immediately after first login via the admin panel.

## DB Schema Tables

- `users` — auth, roles, trust levels, lastSeenAt
- `invites` — invite codes (single/multi-use)
- `categories` — forum categories with parentId for sub-categories
- `states` — all 50 US states with map center/zoom
- `locations` — urbex sites linked to states
- `threads` — forum threads (pinned, locked, viewCount)
- `posts` — replies, supports BBCode body
- `announcements` — site-wide banners
- `votes` — upvote/downvote on threads and posts
- `chat_rooms` — lobby, field-talk, trusted-only rooms
- `room_messages` — chat messages
- `crews` — private crew groups (honor-gated creation)
- `crew_members` — crew membership
- `messages` — direct messages
- `site_settings` — key/value store for guidelines, rules, welcome message
- `admin_notices` — admin-only internal noticeboard

## API Routes (key ones)

- `GET /api/online` — online users (lastSeenAt within 5 min), auth required
- `GET/POST /api/admin/notices` — admin noticeboard CRUD
- `PATCH/DELETE /api/admin/notices/:id` — pin/unpin/delete notices
- `GET/PATCH /api/settings` — site settings (guidelines, rules, welcome)
- `PATCH /api/threads/:id` — author/admin thread edit
- `PATCH /api/crews/:id` — creator crew edit + meetup scheduling
- `POST /api/crews/:id/members` — add member to crew
