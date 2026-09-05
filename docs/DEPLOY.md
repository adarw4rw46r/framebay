# Production deploy

Use Postgres (Neon). SQLite is not supported on serverless.

Steps:
- Provision Neon Postgres and set DATABASE_URL
- Authenticate host CLI for the target platform
- Set AUTH_SECRET, AUTH_URL, VIDEO_PROVIDER=mock, DEV_USER_EMAIL, DEV_USER_PASSWORD
- Deploy; build runs prisma generate, db push, and next build

## Neon
- Free signup: https://console.neon.tech (GitHub, no card)
- Prefer the pooled connection string (host contains pooler)
- Claimable/agent DBs expire in ~72h unless claimed into a Neon account

## Vercel
- CLI: `npx vercel login` then `npx vercel link` then `npx vercel --prod`
- Or import https://github.com/adarw4rw46r/framebay in the Vercel dashboard
- Production AUTH_URL should match the public hostname (e.g. https://framebay.vercel.app)
