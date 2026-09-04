import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-10">
      <header className="mb-16 flex items-center justify-between">
        <div className="text-lg font-bold tracking-tight">
          Framebay <span className="text-accent">Shorts</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="btn btn-ghost">
            Dev login
          </Link>
          <Link href="/app" className="btn btn-primary">
            Open studio
          </Link>
        </div>
      </header>

      <section className="grid gap-10 md:grid-cols-2 md:items-center">
        <div>
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-muted">Free-first MVP</p>
          <h1 className="mb-4 text-4xl font-semibold leading-tight md:text-5xl">
            AI Creator Shorts studio for vertical hooks.
          </h1>
          <p className="mb-8 text-muted">
            Build 9:16 projects → shots → generations (1–3 variants). Daily free quota of 20 gens
            (5s = 1 gen), refunded on failure. Mock provider works out of the box.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/app/projects/new" className="btn btn-primary">
              New project
            </Link>
            <Link href="/app/settings" className="btn btn-ghost">
              Settings & quota
            </Link>
          </div>
        </div>
        <div className="card p-6">
          <div className="mb-4 aspect-[9/16] max-h-[420px] overflow-hidden rounded-xl border border-border bg-black">
            <video
              className="h-full w-full object-cover"
              src="/fixtures/sample-short.mp4"
              muted
              loop
              autoPlay
              playsInline
            />
          </div>
          <ul className="space-y-2 text-sm text-muted">
            <li>• Templates: talking hook, product spin, cinematic B-roll</li>
            <li>• Camera presets: static, push-in, orbit, pan</li>
            <li>• Providers: mock (default), free API, fal stub</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
