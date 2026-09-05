import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { user, error } = await requireUser(); if (error) return error;
  const { id } = await ctx.params;
  const project = await prisma.project.findFirst({ where: { id, userId: user!.id }, include: { scenes: { orderBy: { index: "asc" } }, elements: { orderBy: { createdAt: "asc" } }, shots: { orderBy: { order: "asc" }, include: { generations: { orderBy: { createdAt: "desc" }, take: 5 } } }, assets: { orderBy: { createdAt: "desc" } } } });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { user, error } = await requireUser(); if (error) return error;
  const { id } = await ctx.params; const body = await req.json().catch(() => ({}));
  const existing = await prisma.project.findFirst({ where: { id, userId: user!.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data: Record<string, string | undefined> = {};
  for (const key of ["title", "template", "genre", "era", "tempo", "briefTone", "briefDos", "briefDonts"]) if (body[key] !== undefined) data[key] = body[key] === null ? undefined : String(body[key]).slice(0, 2000);
  if (body.mode !== undefined) data.mode = body.mode === "shorts" ? "shorts" : "cinema";
  if (body.aspectRatio !== undefined && ["16:9", "2.39:1", "9:16"].includes(String(body.aspectRatio))) data.aspectRatio = String(body.aspectRatio);
  const project = await prisma.project.update({ where: { id }, data });
  return NextResponse.json(project);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { user, error } = await requireUser(); if (error) return error;
  const { id } = await ctx.params;
  const existing = await prisma.project.findFirst({ where: { id, userId: user!.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.project.delete({ where: { id } }); return NextResponse.json({ ok: true });
}
