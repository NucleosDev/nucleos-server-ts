# Nucleos Backend

Full-stack productivity platform backend built with TypeScript, Express, PostgreSQL, and Redis.

## Architecture

Domain-Driven Design (DDD) with CQRS pattern:

```
src/
├── api/              # HTTP layer (controllers, routes, middlewares, socket)
├── application/      # Use cases (commands = writes, queries = reads, DTOs)
├── domain/           # Business logic (entities, value-objects, services, repository interfaces)
├── infrastructure/   # Adapters (DB repositories, Redis cache, email, jobs)
├── config/           # Environment, DI, database config
├── shared/           # Logger, utilities, event dispatcher
└── jobs/             # Background workers (cron, Bull queues)
```

## Commands

```bash
npm run dev          # Dev server on port 7000 (tsx watch)
npm run build        # TypeScript compile → dist/
npm start            # Production server (node dist/api/server.js)
npm test             # Jest tests
npm run migrate      # Run SQL migrations
npm run seed         # Seed database
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values. At minimum you need:

| Variable | Description |
|---|---|
| `DATABASE_URL` | Postgres connection string (Render/Supabase) — individual `SUPABASE_*` vars are optional if this is set |
| `SUPABASE_HOST` | DB host |
| `SUPABASE_DATABASE` | DB name |
| `SUPABASE_USERNAME` | DB user |
| `SUPABASE_PASSWORD` | DB password |
| `JWT_KEY` | Secret ≥ 32 chars |
| `JWT_ISSUER` | API URL e.g. `https://your-api.onrender.com` |
| `JWT_AUDIENCE` | Frontend URL e.g. `https://nucleos-ui.vercel.app` |
| `CORS_ORIGINS` | Comma-separated allowed origins |
| `REDIS_URL` | Redis connection string (optional, falls back to in-memory) |

## Production Deployment (Render)

The `render.yaml` configures the Render service automatically:
- **Build command**: `npm ci && npm run build`
- **Start command**: `npm start` (runs compiled JS, NOT `tsx`)
- **Health check**: `GET /health`

Set env vars in the Render dashboard or via `render.yaml` sync.

## Caching Strategy

All read queries use Redis with in-memory fallback. Cache keys are centralized in `CacheKeys` (redis.service.ts). Default TTL is 5 minutes (SHORT=60s, DEFAULT=300s, LONG=1800s).

**Invalidated on mutation:**
- `habitos:bloco:{id}` — on habito create/update/delete/register
- `blocos:nucleo:{id}` — on bloco create/update/delete
- `nucleos:user:{id}` — on nucleo create/update/delete
- `tarefas:bloco:{id}` — on tarefa create/complete/delete
- `listas:bloco:{id}` — on lista create/update/delete

## Database

PostgreSQL hosted on Supabase. Schema is in `src/infrastructure/persistence/migrations/Schema__atual.sql` (51 tables).

Migrations are plain SQL files — run with `npm run migrate`.

## Domain Modules

| Module | Description |
|---|---|
| **Auth** | Login, register, JWT, Google OAuth |
| **Nucleos** | Top-level projects (1+ per user) |
| **Blocos** | Nested building blocks inside nucleos (tasks, habits, lists, etc.) |
| **Tarefas** | Tasks with priority, due dates, soft-delete |
| **Habitos** | Habits with streak tracking |
| **Listas** | Generic / shopping / financial lists |
| **Colecoes** | Custom data collections with typed fields |
| **Calendario** | Calendar events |
| **Timers** | Pomodoro / work session timers |
| **Gamificacao** | XP, levels, streaks, achievements, leaderboards |
| **AI / Insights** | AI-generated productivity insights (Anthropic SDK) |
| **Notifications** | In-app and email notifications |

## Testing

```bash
npm test                           # All tests
npm test -- --watch                # Watch mode
npm test -- --coverage             # Coverage report
```

Tests are in `src/__test__/`. They run against real domain logic (no mocks for business rules). Database calls are NOT tested (no integration tests yet).

## Docker

```bash
# Development (includes Redis)
docker compose up

# Production
docker compose -f docker-compose.prod.yml up
```

The dev compose starts both the API (port 7000) and Redis (port 6379).

## Key Design Decisions

- **NodeNext modules**: all internal imports use `.js` extension even for `.ts` source files (TypeScript requirement for ESM). Jest config overrides this to CommonJS.
- **No TypeDI decorators in use**: handlers are instantiated manually in route files.
- **Redis is optional**: all cache operations fall back to an in-memory Map when Redis is unavailable (development or if REDIS_URL is not set).
- **`DATABASE_URL` parsing**: `env.ts` parses `DATABASE_URL` first and injects individual `SUPABASE_*` vars, so both Render-style single connection strings and Supabase-style individual vars work.
