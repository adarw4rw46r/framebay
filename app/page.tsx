import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";
import { Logo } from "@/components/logo";

const FEATURES = [
  { title: "9:16 studio canvas", body: "Phone-frame preview, shot list, and filmstrip — built for vertical hooks." },
  { title: "Free-first quota", body: "20 gens/day. 5s = 1 credit. Failures refund automatically." },
  { title: "Mock → real providers", body: "Ship demos on mock, flip to free API or fal when you’re ready." },
];

const TEMPLATE_ACCENTS: Record<string, string> = {
  talking_hook: "from-violet-600/40 to-fuchsia-600/10",
  product_spin: "from-cyan-600/30 to-violet-600/10",
  cinematic_broll: "from-amber-600/25 to-fuchsia-700/10",
};

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute right-0 top-40 h-[360px] w-[360px] rounded-full bg-fuchsia-500/10 blur-[100px]" />
      </div>

      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Logo />
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/login" className="btn btn-ghost px-3 py-2 text-sm sm:px-4">
            Dev login
          </Link>
          <Link href="/app" className="btn btn-primary px-3 py-2 text-sm sm:px-4">
            Open studio
          </Link>
        </div>
      </header>

      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-16 pt-8 md:grid-cols-[1.1fr_0.9fr] md:items-center md:pb-24 md:pt-12">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-accent shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
            Creative AI studio
          </p>
          <h1 className="mb-5 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            Ship vertical shorts
            <span className="block bg-gradient-to-r from-violet-300 via-fuchsia-300 to-pink-300 bg-clip-text text-transparent">
              that feel directed.
            </span>
          </h1>
          <p className="mb-8 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Framebay is a Higgsfield-inspired shorts studio: templates, camera presets, multi-variant
            generations, and a cinematic dark canvas — not another CRUD admin.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/app/projects/new" className="btn btn-primary px-6 py-3">
              Start a short
            </Link>
            <Link href="/app" className="btn btn-ghost px-6 py-3">
              Browse projects
            </Link>
          </div>
          <ul className="mt-10 grid gap-3 sm:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f.title} className="rounded-2xl border border-border bg-white/[0.02] p-4">
                <div className="mb-1 text-sm font-semibold">{f.title}</div>
                <p className="text-xs leading-relaxed text-muted">{f.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[340px]">
          <div className="absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-b from-violet-500/20 to-transparent blur-2xl" />
          <div className="phone-frame aspect-[9/16] w-full glow-ring">
            <video
              className="h-full w-full object-cover"
              src="/fixtures/sample-short.mp4"
              muted
              loop
              autoPlay
              playsInline
            />
          </div>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="chip chip-active">mock provider</span>
            <span className="chip">1–3 variants</span>
            <span className="chip">quota refunds</span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Template vibes</h2>
            <p className="mt-1 text-sm text-muted">Start from a directed look, then remix the prompt.</p>
          </div>
          <Link href="/app/projects/new" className="hidden text-sm text-accent hover:underline sm:inline">
            Use a template →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {Object.values(TEMPLATES).map((t) => (
            <Link
              key={t.id}
              href="/app/projects/new"
              className="group card overflow-hidden transition hover:border-accent/40"
            >
              <div
                className={`aspect-[16/10] bg-gradient-to-br ${TEMPLATE_ACCENTS[t.id] ?? "from-violet-600/30 to-zinc-900"} p-4`}
              >
                <div className="flex h-full items-end">
                  <span className="rounded-full border border-white/10 bg-black/40 px-2.5 py-1 text-[10px] uppercase tracking-wider text-zinc-200 backdrop-blur">
                    9:16
                  </span>
                </div>
              </div>
              <div className="p-5">
                <h3 className="mb-1 text-lg font-medium group-hover:text-violet-200">{t.name}</h3>
                <p className="text-sm text-muted">{t.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
