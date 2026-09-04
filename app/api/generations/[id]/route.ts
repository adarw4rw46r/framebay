import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await ctx.params;
  const generation = await prisma.generation.findFirst({
    where: { id, userId: user!.id },
    include: {
      shot: {
        include: { project: { select: { id: true, title: true } } },
      },
    },
  });
  if (!generation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  let resultUrls: string[] = [];
  try {
    resultUrls = JSON.parse(generation.resultUrls) as string[];
  } catch {
    resultUrls = [];
  }

  return NextResponse.json({ ...generation, resultUrls });
}
