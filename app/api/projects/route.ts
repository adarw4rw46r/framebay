import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { TEMPLATES, type TemplateId } from "@/lib/templates";

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;
  const projects = await prisma.project.findMany({
    where: { userId: user!.id },
    orderBy: { updatedAt: "desc" },
    include: { _count: { select: { shots: true } } },
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const { user, error } = await requireUser();
  if (error) return error;
  const body = await req.json().catch(() => ({}));
  const title = String(body.title ?? "Untitled Short").slice(0, 120);
  const template = (Object.keys(TEMPLATES).includes(body.template)
    ? body.template
    : "talking_hook") as TemplateId;
  const defaultPrompt = TEMPLATES[template].defaultPrompt;

  const project = await prisma.project.create({
    data: {
      title,
      template,
      userId: user!.id,
      shots: {
        create: [
          {
            order: 0,
            title: "Hook",
            prompt: defaultPrompt,
            durationSec: 5,
            cameraPreset: "static",
          },
        ],
      },
    },
    include: { shots: true },
  });
  return NextResponse.json(project, { status: 201 });
}
