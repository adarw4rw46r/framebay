import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { TEMPLATES, type TemplateId } from "@/lib/templates";

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;
  const projects = await prisma.project.findMany({ where: { userId: user!.id }, orderBy: { updatedAt: "desc" }, include: { _count: { select: { shots: true } } } });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const { user, error } = await requireUser();
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  const title = String(body.title ?? "Untitled Film").slice(0, 120);
  const mode = body.mode === "shorts" ? "shorts" : "cinema";
  const aspectRatio = ["16:9", "2.39:1", "9:16"].includes(body.aspectRatio) ? body.aspectRatio : mode === "shorts" ? "9:16" : "16:9";
  const template = (Object.keys(TEMPLATES).includes(body.template) ? body.template : "cinematic_broll") as TemplateId;
  const paragraphs = String(body.script ?? "").split(/\n{2,}|\n/).map((p: string) => p.trim()).filter(Boolean).slice(0, 12);
  const shotTexts = paragraphs.length ? paragraphs : [TEMPLATES[template].defaultPrompt];
  const project = await prisma.project.create({
    data: {
      title, mode, aspectRatio, template,
      genre: body.genre ? String(body.genre).slice(0, 80) : undefined,
      shots: { create: shotTexts.map((text: string, index: number) => ({ order: index, title: `Shot ${index + 1}`, prompt: text, actionLine: text, durationSec: 5, cameraPreset: "static" })) },
      scenes: { create: shotTexts.map((_: string, index: number) => ({ index, title: `Scene ${index + 1}` })) },
      userId: user!.id,
    },
    include: { shots: true, scenes: true },
  });
  if (project.scenes.length) {
    await Promise.all(project.shots.map((shot, index) => prisma.shot.update({ where: { id: shot.id }, data: { sceneId: project.scenes[index]?.id ?? project.scenes[0].id } })));
  }
  return NextResponse.json(project, { status: 201 });
}
