import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getQuota } from "@/lib/quota";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [projects, quota] = await Promise.all([
    prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: { _count: { select: { shots: true } } },
    }),
    getQuota(session.user.id),
  ]);

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Projects</h1>
          <p className="text-sm text-muted">
            Free quota: {quota.remaining}/{quota.limit} gens left today
          </p>
        </div>
        <Link href="/app/projects/new" className="btn btn-primary">
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="card p-10 text-center text-muted">
          No projects yet. Create a 9:16 short to get started.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/app/projects/${p.id}`} className="card p-5 hover:border-accent/50">
              <div className="mb-2 text-xs uppercase tracking-wider text-muted">{p.template}</div>
              <h2 className="mb-1 text-lg font-medium">{p.title}</h2>
              <p className="text-sm text-muted">
                {p._count.shots} shot{p._count.shots === 1 ? "" : "s"} · {p.aspectRatio}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
