import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getQuota } from "@/lib/quota";
import { TEMPLATES } from "@/lib/templates";
import { redirect } from "next/navigation";
import { QuotaPill } from "@/components/quota-pill";

const TEMPLATE_ACCENTS: Record<string, string> = {
  talking_hook: "from-violet-600/50 via-fuchsia-700/20 to-zinc-950",
  product_spin: "from-cyan-600/40 via-violet-700/20 to-zinc-950",
  cinematic_broll: "from-amber-700/40 via-fuchsia-800/20 to-zinc-950",
};

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [projects, quota] = await Promise.all([
    prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { shots: true } },
        shots: {
          take: 1,
          orderBy: { order: "asc" },
          include: {
            generations: {
              where: { status: "succeeded" },
              take: 1,
              orderBy: { createdAt: "desc" },
            },
          },
        },
      },
    }),
    getQuota(session.user.id),
  ]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.18em] text-muted">Studio</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Projects</h1>
          <p className="mt-1 text-sm text-muted">Your 9:16 shorts workspace</p>
        </div>
        <div className="flex items-center gap-3">
          <QuotaPill remaining={quota.remaining} limit={quota.limit} />
          <Link href="/app/projects/new" className="btn btn-primary">
            New project
          </Link>
        </div>
      </div>

      {projects.length === 0 ? (
        <div className="panel flex min-h-[320px] flex-col items-center justify-center gap-4 px-6 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-violet-500/20 to-fuchsia-500/10 text-2xl">
            ✦
          </div>
          <div>
            <h2 className="mb-1 text-lg font-medium">Generate your first short</h2>
            <p className="max-w-sm text-sm text-muted">
              Pick a template vibe, add shots, and run a mock generation to feel the studio flow.
            </p>
          </div>
          <Link href="/app/projects/new" className="btn btn-primary">
            Create project
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => {
            const meta = TEMPLATES[p.template as keyof typeof TEMPLATES];
            const accent = TEMPLATE_ACCENTS[p.template] ?? "from-violet-600/40 to-zinc-950";
            let thumb: string | null = null;
            const gen = p.shots[0]?.generations[0];
            if (gen) {
              try {
                const urls = JSON.parse(gen.resultUrls) as string[];
                thumb = urls[0] ?? null;
              } catch {
                thumb = null;
              }
            }

            return (
              <Link
                key={p.id}
                href={`/app/projects/${p.id}`}
                className="group card overflow-hidden transition hover:border-accent/40 hover:shadow-[0_0_40px_-18px_rgba(168,85,247,0.45)]"
              >
                <div className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${accent}`}>
                  {thumb ? (
                    <video
                      src={thumb}
                      muted
                      playsInline
                      className="h-full w-full object-cover opacity-90 transition group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-full items-end justify-between p-4">
                      <span className="rounded-full border border-white/10 bg-black/35 px-2.5 py-1 text-[10px] uppercase tracking-wider text-zinc-200 backdrop-blur">
                        {p.aspectRatio}
                      </span>
                      <span className="text-2xl opacity-40">▶</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted">
                    {meta?.name ?? p.template}
                  </div>
                  <h2 className="mb-1 truncate text-lg font-medium group-hover:text-violet-200">
                    {p.title}
                  </h2>
                  <p className="text-sm text-muted">
                    {p._count.shots} shot{p._count.shots === 1 ? "" : "s"}
                    <span className="text-zinc-600"> · </span>
                    updated {p.updatedAt.toLocaleDateString()}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
