import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { spawn } from "node:child_process";
import { tmpdir } from "node:os";
import path from "node:path";
import ffmpegPath from "ffmpeg-static";
import type { GenerateVideoInput, GenerateVideoResult, VideoProvider } from "./types";

const STILL_BASE_URL = "https://image.pollinations.ai/prompt";
const VIDEO_BASE_URL = "https://gen.pollinations.ai/video";
const FPS = 24;
const VERCEL_MOTION_FPS = 12;
const VERCEL_MOTION_DURATION_SEC = 2;
const FETCH_TIMEOUT_MS = 25_000;
const FFMPEG_TIMEOUT_MS = 25_000;

export { FETCH_TIMEOUT_MS, FFMPEG_TIMEOUT_MS, VERCEL_MOTION_DURATION_SEC, VERCEL_MOTION_FPS };

type Dimensions = { width: number; height: number };

export function dimensionsForAspect(aspectRatio?: string): Dimensions {
  switch (aspectRatio) {
    case "9:16": return { width: 768, height: 1280 };
    case "2.39":
    case "2.39:1": return { width: 1280, height: 536 };
    case "16:9":
    default: return { width: 1280, height: 720 };
  }
}

export function buildStillUrl(prompt: string, aspectRatio?: string): string {
  const { width, height } = dimensionsForAspect(aspectRatio);
  return `${STILL_BASE_URL}/${encodeURIComponent(prompt)}?width=${width}&height=${height}&model=flux&nologo=true`;
}

export function buildRealVideoUrl(prompt: string, durationSec: number, aspectRatio?: string): string {
  const duration = Math.min(5, Math.max(1, durationSec));
  const ratio = aspectRatio === "2.39" ? "2.39:1" : aspectRatio ?? "9:16";
  return `${VIDEO_BASE_URL}/${encodeURIComponent(prompt)}?model=wan-fast&duration=${duration}&aspectRatio=${encodeURIComponent(ratio)}`;
}

function renderDimensions(aspectRatio?: string, maxDimension = 480): Dimensions {
  const source = dimensionsForAspect(aspectRatio);
  const scale = maxDimension / Math.max(source.width, source.height);
  return {
    width: Math.max(2, Math.round((source.width * scale) / 2) * 2),
    height: Math.max(2, Math.round((source.height * scale) / 2) * 2),
  };
}

function runFfmpeg(args: string[], timeoutMs = FFMPEG_TIMEOUT_MS): Promise<void> {
  if (!ffmpegPath) throw new Error("ffmpeg-static did not provide an executable");
  const executable = ffmpegPath;
  return new Promise((resolve, reject) => {
    const child = spawn(executable, args, { stdio: "pipe" });
    let stderr = "";
    let settled = false;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      callback();
    };
    const timer = setTimeout(() => {
      child.kill("SIGKILL");
      finish(() => reject(new Error(`ffmpeg timed out after ${timeoutMs}ms`)));
    }, timeoutMs);
    child.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString(); });
    child.once("error", (error) => finish(() => reject(error)));
    child.once("close", (code: number | null) => {
      if (code === 0) finish(resolve);
      else finish(() => reject(new Error(`ffmpeg failed (${code ?? "unknown"}): ${stderr.slice(-500)}`)));
    });
  });
}

async function stillToMp4(still: Uint8Array, input: GenerateVideoInput, workDir: string): Promise<Buffer> {
  const inputPath = path.join(workDir, "still.jpg");
  const outputPath = path.join(workDir, "clip.mp4");
  const isVercelFreeMotion = Boolean(process.env.VERCEL) && !process.env.POLLINATIONS_API_KEY;
  const duration = Math.min(isVercelFreeMotion ? VERCEL_MOTION_DURATION_SEC : 5, Math.max(1, input.durationSec));
  const fps = isVercelFreeMotion ? VERCEL_MOTION_FPS : FPS;
  const frames = Math.ceil(duration * fps);
  const { width, height } = renderDimensions(input.aspectRatio, isVercelFreeMotion ? 360 : 480);
  await writeFile(inputPath, still);
  await runFfmpeg([
    "-y", "-loop", "1", "-i", inputPath,
    "-vf", `zoompan=z='min(zoom+0.0015,1.12)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=${frames}:s=${width}x${height}:fps=${fps}`,
    "-frames:v", String(frames), "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "32", "-movflags", "+faststart", outputPath,
  ]);
  return readFile(outputPath);
}

async function persistVideo(video: Uint8Array): Promise<string> {
  const fileName = `${randomUUID()}.mp4`;
  const publicPath = path.join(process.cwd(), "public", "uploads", "gens", fileName);
  try {
    await mkdir(path.dirname(publicPath), { recursive: true });
    await writeFile(publicPath, video);
    return `/uploads/gens/${fileName}`;
  } catch (error) {
    if (!process.env.VERCEL) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Could not persist generated video: ${message}`);
    }
    return `data:video/mp4;base64,${Buffer.from(video).toString("base64")}`;
  }
}

async function fetchBytes(url: string, init?: RequestInit): Promise<Uint8Array> {
  let response: Response;
  try {
    response = await fetch(url, { ...init, signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
  } catch (error) {
    if (error instanceof DOMException && error.name === "TimeoutError") {
      throw new Error(`Pollinations request timed out after ${FETCH_TIMEOUT_MS}ms`);
    }
    throw error;
  }
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Pollinations request failed (${response.status}): ${text.slice(0, 200)}`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

export class PollinationsFreeProvider implements VideoProvider {
  readonly name = "pollinations";

  async generate(input: GenerateVideoInput): Promise<GenerateVideoResult> {
    const workDir = path.join(tmpdir(), `framebay-${randomUUID()}`);
    await mkdir(workDir, { recursive: true });
    try {
      let video: Uint8Array;
      const key = process.env.POLLINATIONS_API_KEY;
      if (key) {
        video = await fetchBytes(buildRealVideoUrl(input.prompt, input.durationSec, input.aspectRatio), {
          headers: { Authorization: `Bearer ${key}` },
        });
      } else {
        const still = await fetchBytes(buildStillUrl(input.prompt, input.aspectRatio));
        video = await stillToMp4(still, input, workDir);
      }
      return {
        url: await persistVideo(video),
        provider: this.name,
        meta: {
          mode: key ? "pollinations-video" : "pollinations-image-motion",
          durationSec: key ? Math.min(5, Math.max(1, input.durationSec)) : Math.min(process.env.VERCEL ? VERCEL_MOTION_DURATION_SEC : 5, Math.max(1, input.durationSec)),
          aspectRatio: input.aspectRatio ?? "9:16",
          variantIndex: input.variantIndex ?? 0,
        },
      };
    } finally {
      await rm(workDir, { recursive: true, force: true });
    }
  }
}
