import { after, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { buildPrompt, type CameraPresetId } from "@/lib/templates";
import { assembleCinemaPrompt } from "@/lib/cinema/prompt";
import { consumeQuota, costForDuration, refundQuota } from "@/lib/quota";
import { getVideoProvider } from "@/lib/video";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { user, error } = await requireUser(); if (error) return error;
  const body = await req.json().catch(() => ({})); const shotId = String(body.shotId ?? ""); const variantCount = Math.min(3, Math.max(1, Number(body.variantCount ?? 1)));
  if (!shotId) return NextResponse.json({ error: "shotId required" }, { status: 400 });
  const shot = await prisma.shot.findFirst({ where: { id: shotId, project: { userId: user!.id } }, include: { project: { include: { elements: true } }, scene: true } });
  if (!shot) return NextResponse.json({ error: "Shot not found" }, { status: 404 });
  const cost = costForDuration(shot.durationSec) * variantCount;
  try { await consumeQuota(user!.id, cost); } catch (e) { const err = e as Error & { code?: string }; if (err.code === "QUOTA_EXCEEDED") return NextResponse.json({ error: err.message, code: "QUOTA_EXCEEDED" }, { status: 402 }); throw e; }
  const isCinema = shot.project.mode !== "shorts";
  const prompt = isCinema ? assembleCinemaPrompt({ project: shot.project, scene: shot.scene, shot, cast: shot.project.elements }) : buildPrompt(shot.prompt, shot.cameraPreset as CameraPresetId);
  const metadata = { mode: shot.project.mode, aspectRatio: shot.project.aspectRatio, genre: shot.project.genre, era: shot.project.era, tempo: shot.project.tempo, briefTone: shot.project.briefTone, scene: shot.scene?.title ?? null, actionLine: shot.actionLine, dialogue: shot.dialogue, cameraBody: shot.cameraBody, lens: shot.lens, move: shot.move, characterIds: shot.characterIds, locationId: shot.locationId };
  const provider = getVideoProvider();
  const generation = await prisma.generation.create({ data: { userId: user!.id, shotId: shot.id, status: "running", provider: provider.name, prompt, metadata: JSON.stringify(metadata), variantCount, costGens: cost, resultUrls: "[]" } });
  after(async () => { try { const urls: string[] = []; for (let i = 0; i < variantCount; i++) { const result = await provider.generate({ prompt, durationSec: shot.durationSec, aspectRatio: shot.project.aspectRatio, variantIndex: i }); urls.push(result.url); } await prisma.generation.update({ where: { id: generation.id }, data: { status: "succeeded", resultUrls: JSON.stringify(urls) } }); } catch (e) { const message = e instanceof Error ? e.message : "Generation failed"; await prisma.generation.update({ where: { id: generation.id }, data: { status: "failed", error: message } }); await refundQuota(user!.id, cost); } });
  return NextResponse.json(generation, { status: 202 });
}
