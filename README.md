# Framebay Shorts

Free-first AI Creator Shorts studio (MVP).

9:16 projects → shots → generations (1–3 variants) with a daily free generation quota.

## Stack

- Next.js App Router + TypeScript + Tailwind
- Prisma + PostgreSQL (Neon / local Docker)
- Auth.js (credentials / dev login)
- Video providers: **mock** (default), **free** API, **fal** stub
- Package manager: `pnpm`

## Quick start

```bash
pnpm install
cp .env.example .env
docker compose up -d   # or set DATABASE_URL to a Neon Postgres URL
pnpm prisma db push
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Dev login

Default credentials (auto-seeded on first login):

- Email: `dev@framebay.local`
- Password: `framebay`

Override with `DEV_USER_EMAIL` / `DEV_USER_PASSWORD`.

## Free-first product notes

- Daily free quota: **20 gens/day**
- Cost: **5 seconds = 1 gen** (ceil); variants multiply cost
- Failed generations **refund** quota
- `VIDEO_PROVIDER=mock` (default) delays then returns `/fixtures/sample-short.mp4`
- `VIDEO_PROVIDER=free` uses `FREE_VIDEO_API_URL` + optional `FREE_VIDEO_API_KEY`
- `VIDEO_PROVIDER=fal` is a stub (throws until wired)

## Pages

| Route | Purpose |
|-------|---------|
| `/` | Landing |
| `/login` | Dev credentials login |
| `/app` | Projects dashboard |
| `/app/projects/new` | Create project + template |
| `/app/projects/[id]` | Studio (shots / preview / generate) |
| `/app/generations/[id]` | Generation detail + poll |
| `/app/settings` | Quota + provider info |

## Templates & presets

Templates: `talking_hook`, `product_spin`, `cinematic_broll`

Camera presets (prompt suffixes): `static`, `push_in`, `orbit`, `pan`

## APIs

- `GET/POST /api/projects`
- `GET/PATCH/DELETE /api/projects/[id]`
- `POST /api/projects/[id]/shots`
- `PATCH/DELETE /api/shots/[id]`
- `POST /api/assets/upload` (local `public/uploads`; ephemeral on serverless)
- `POST /api/generate`
- `GET /api/generations/[id]`
- `GET /api/quota`

## Tests

```bash
pnpm test
```

Covers quota costing and mock provider success path.

## Roadmap (out of scope for this MVP)

- Stripe billing / paid tiers
- Teams & collaboration
- Canvas timeline editor
- Lipsync
- Origin deployment pipeline
- Full fal.ai wiring

## Deploy

See [docs/DEPLOY.md](docs/DEPLOY.md) for Neon + Vercel production steps.

## Env

See `.env.example`. Important keys: `DATABASE_URL` (Postgres), `AUTH_SECRET`, `AUTH_URL`, `VIDEO_PROVIDER`.
