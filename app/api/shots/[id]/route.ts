/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };
async function ownedShot(id: string, userId: string) { return prisma.shot.findFirst({ where: { id, project: { userId } } }); }
export async function PATCH(req: Request, ctx: Ctx) {
  const { user, error } = await requireUser(); if (error) return error; const { id } = await ctx.params;
  const existing = await ownedShot(id, user!.id); if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => ({})); const data: any = {};
  for (const key of ["title", "prompt", "actionLine", "dialogue", "cameraBody", "lens", "move", "locationId", "cameraPreset"]) if (body[key] !== undefined) data[key] = body[key] === null ? null : String(body[key]);
  if (body.characterIds !== undefined) data.characterIds = typeof body.characterIds === "string" ? body.characterIds : JSON.stringify(body.characterIds);
  if (body.sceneId !== undefined) { const scene = body.sceneId ? await prisma.scene.findFirst({ where: { id: String(body.sceneId), projectId: existing.projectId } }) : null; data.sceneId = scene?.id ?? null; }
  if (body.durationSec !== undefined) data.durationSec = Math.min(30, Math.max(1, Number(body.durationSec)));
  if (body.order !== undefined) data.order = Number(body.order);
  return NextResponse.json(await prisma.shot.update({ where: { id }, data }));
}
export async function DELETE(_req: Request, ctx: Ctx) {
  const { user, error } = await requireUser(); if (error) return error; const { id } = await ctx.params;
  if (!await ownedShot(id, user!.id)) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.shot.delete({ where: { id } }); return NextResponse.json({ ok: true });
}
