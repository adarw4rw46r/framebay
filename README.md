# Framebay Cinema Studio

Cinema-first AI video production workspace. Build a project brief, cast, scenes, and directed shots, then generate takes with the default free Pollinations provider.

## Quick start
Install dependencies, copy .env.example to .env, start PostgreSQL, run Prisma db push, then start the dev server.
Cinema Studio: create a production, paste optional script paragraphs into suggested shots, edit the brief, add characters and locations, then direct action, dialogue, camera, lens, movement, cast locks, and variants.
## Video providers

VIDEO_PROVIDER=pollinations is the production-friendly default. Without a key, Framebay requests a free still from image.pollinations.ai, then uses ffmpeg-static to turn it into a short MP4 with a subtle Ken Burns zoom.
The clip is written to public/uploads/gens/ when writable; on Vercel’s read-only filesystem it is returned as a compact data:video/mp4;base64 URL, which works directly with the existing video UI.

If POLLINATIONS_API_KEY is set, the same provider instead requests real wan-fast video from gen.pollinations.ai/video, capped at five seconds. Keyed video is optional; the free still-to-motion path requires no Pollinations key.

Other adapters remain available with VIDEO_PROVIDER=mock, free, or fal.
