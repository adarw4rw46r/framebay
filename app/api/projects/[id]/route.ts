import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await ctx.params;
  const project = await prisma.project.findFirst({
    where: { id, userId: user!.id },
    include: {
      shots: {
        orderBy: { order: "asc" },
        include: {
          generations: { orderBy: { createdAt: "desc" }, take: 5 },
        },
      },
      assets: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(project);
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({}));
  const existing = await prisma.project.findFirst({ where: { id, userId: user!.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const project = await prisma.project.update({
    where: { id },
    data: {
      title: body.title !== undefined ? String(body.title).slice(0, 120) : undefined,
      template: body.template !== undefined ? String(body.template) : undefined,
    },
  });
  return NextResponse.json(project);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await ctx.params;
  const existing = await prisma.project.findFirst({ where: { id, userId: user!.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
