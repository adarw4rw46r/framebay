import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export async function POST(req: Request) {
  const { user, error } = await requireUser();
  if (error) return error;

  const form = await req.formData();
  const file = form.get("file");
  const projectId = form.get("projectId");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "file required" }, { status: 400 });
  }

  if (projectId) {
    const project = await prisma.project.findFirst({
      where: { id: String(projectId), userId: user!.id },
    });
    if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 100);
  const filename = `${Date.now()}-${safeName}`;
  const dir = path.join(process.cwd(), "public", "uploads", user!.id);
  await mkdir(dir, { recursive: true });
  const diskPath = path.join(dir, filename);
  await writeFile(diskPath, bytes);

  const publicPath = `/uploads/${user!.id}/${filename}`;
  const asset = await prisma.asset.create({
    data: {
      userId: user!.id,
      projectId: projectId ? String(projectId) : null,
      filename: safeName,
      mimeType: file.type || "application/octet-stream",
      path: publicPath,
      size: bytes.length,
    },
  });

  return NextResponse.json(asset, { status: 201 });
}
