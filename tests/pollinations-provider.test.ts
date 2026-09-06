import { describe, expect, it } from "vitest";
import { buildRealVideoUrl, buildStillUrl, dimensionsForAspect, FETCH_TIMEOUT_MS, FFMPEG_TIMEOUT_MS, VERCEL_MOTION_DURATION_SEC, VERCEL_MOTION_FPS } from "../lib/video/pollinations";

describe("PollinationsFreeProvider URL helpers", () => {
  it("maps supported aspects to free still dimensions", () => {
    expect(dimensionsForAspect("9:16")).toEqual({ width: 768, height: 1280 });
    expect(dimensionsForAspect("16:9")).toEqual({ width: 1280, height: 720 });
    expect(dimensionsForAspect("2.39:1")).toEqual({ width: 1280, height: 536 });
  });

  it("builds an encoded free still URL", () => {
    const url = buildStillUrl("A fox & a moon", "9:16");
    expect(url).toContain("https://image.pollinations.ai/prompt/A%20fox%20%26%20a%20moon");
    expect(url).toContain("width=768&height=1280&model=flux&nologo=true");
  });

  it("caps keyed real video duration at five seconds", () => {
    const url = buildRealVideoUrl("A cinematic shot", 12, "2.39:1");
    expect(url).toContain("model=wan-fast&duration=5");
    expect(url).toContain("aspectRatio=2.39%3A1");
  });

  it("uses bounded timeouts and lightweight Vercel motion defaults", () => {
    expect(FETCH_TIMEOUT_MS).toBe(25_000);
    expect(FFMPEG_TIMEOUT_MS).toBe(25_000);
    expect(VERCEL_MOTION_DURATION_SEC).toBe(2);
    expect(VERCEL_MOTION_FPS).toBe(12);
  });
});
