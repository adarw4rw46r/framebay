import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };

async function ownedShot(shotId: string, userId: string) {
  return prisma.shot.findFirst({
    where: { id: shotId, project: { userId } },
  });
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await ctx.params;
  const existing = await ownedShot(id, user!.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => ({}));
  const shot = await prisma.shot.update({
    where: { id },
    data: {
      title: body.title !== undefined ? String(body.title).slice(0, 80) : undefined,
      prompt: body.prompt !== undefined ? String(body.prompt) : undefined,
      durationSec:
        body.durationSec !== undefined
          ? Math.min(30, Math.max(1, Number(body.durationSec)))
          : undefined,
      cameraPreset: body.cameraPreset !== undefined ? String(body.cameraPreset) : undefined,
      order: body.order !== undefined ? Number(body.order) : undefined,
    },
  });
  return NextResponse.json(shot);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await ctx.params;
  const existing = await ownedShot(id, user!.id);
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.shot.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
