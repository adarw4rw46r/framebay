import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: Request, ctx: Ctx) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id: projectId } = await ctx.params;
  const project = await prisma.project.findFirst({ where: { id: projectId, userId: user!.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json().catch(() => ({}));
  const count = await prisma.shot.count({ where: { projectId } });
  const shot = await prisma.shot.create({
    data: {
      projectId,
      order: body.order ?? count,
      title: String(body.title ?? `Shot ${count + 1}`).slice(0, 80),
      prompt: String(body.prompt ?? ""),
      durationSec: Math.min(30, Math.max(1, Number(body.durationSec ?? 5))),
      cameraPreset: String(body.cameraPreset ?? "static"),
    },
  });
  return NextResponse.json(shot, { status: 201 });
}
