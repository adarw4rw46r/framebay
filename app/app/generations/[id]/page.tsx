import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { GenerationPoller } from "./poller";

type Props = { params: Promise<{ id: string }> };

export default async function GenerationPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  const { id } = await params;

  const generation = await prisma.generation.findFirst({
    where: { id, userId: session.user.id },
    include: {
      shot: { include: { project: true } },
    },
  });
  if (!generation) notFound();

  let resultUrls: string[] = [];
  try {
    resultUrls = JSON.parse(generation.resultUrls) as string[];
  } catch {
    resultUrls = [];
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link
          href={`/app/projects/${generation.shot.projectId}`}
          className="text-sm text-muted hover:text-foreground"
        >
          ← Back to {generation.shot.project.title}
        </Link>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Generation</h1>
        <p className="text-sm text-muted">
          {generation.provider} · cost {generation.costGens} gen(s) · {generation.variantCount}{" "}
          variant(s)
        </p>
      </div>

      <GenerationPoller
        id={generation.id}
        initialStatus={generation.status}
        initialUrls={resultUrls}
        initialError={generation.error}
      />

      <div className="card space-y-2 p-5 text-sm">
        <div className="text-xs font-medium uppercase tracking-wider text-muted">Prompt</div>
        <p className="leading-relaxed text-zinc-200">{generation.prompt}</p>
      </div>
    </div>
  );
}
