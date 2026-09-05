import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };
const text = (value: unknown, fallback = "") => value === null || value === undefined ? fallback : String(value);

export async function POST(req: Request, ctx: Ctx) {
  const { user, error } = await requireUser(); if (error) return error;
  const { id: projectId } = await ctx.params;
  const project = await prisma.project.findFirst({ where: { id: projectId, userId: user!.id } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json().catch(() => ({})); const count = await prisma.shot.count({ where: { projectId } });
  const scene = body.sceneId ? await prisma.scene.findFirst({ where: { id: String(body.sceneId), projectId } }) : null;
  const shot = await prisma.shot.create({ data: { projectId, sceneId: scene?.id, order: Number(body.order ?? count), title: text(body.title, `Shot ${count + 1}`).slice(0, 80), prompt: text(body.prompt), actionLine: body.actionLine !== undefined ? text(body.actionLine) : text(body.prompt), dialogue: body.dialogue !== undefined ? text(body.dialogue) : undefined, cameraBody: body.cameraBody !== undefined ? text(body.cameraBody) : undefined, lens: body.lens !== undefined ? text(body.lens) : undefined, move: body.move !== undefined ? text(body.move) : undefined, characterIds: typeof body.characterIds === "string" ? body.characterIds : JSON.stringify(body.characterIds ?? []), locationId: body.locationId ? text(body.locationId) : undefined, durationSec: Math.min(30, Math.max(1, Number(body.durationSec ?? 5))), cameraPreset: text(body.cameraPreset, "static") } });
  return NextResponse.json(shot, { status: 201 });
}
