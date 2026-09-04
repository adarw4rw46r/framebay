import type { GenerateVideoInput, GenerateVideoResult, VideoProvider } from "./types";

/**
 * FreeVideoProvider — calls a configurable free video API.
 * Set FREE_VIDEO_API_URL and FREE_VIDEO_API_KEY.
 * Expected response JSON: { url: string } or { video_url: string }
 */
export class FreeVideoProvider implements VideoProvider {
  readonly name = "free";

  async generate(input: GenerateVideoInput): Promise<GenerateVideoResult> {
    const base = process.env.FREE_VIDEO_API_URL;
    const key = process.env.FREE_VIDEO_API_KEY;
    if (!base) {
      throw new Error("FREE_VIDEO_API_URL is not configured");
    }

    const res = await fetch(base, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(key ? { Authorization: `Bearer ${key}` } : {}),
      },
      body: JSON.stringify({
        prompt: input.prompt,
        duration: input.durationSec,
        aspect_ratio: input.aspectRatio ?? "9:16",
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Free video API failed (${res.status}): ${text.slice(0, 200)}`);
    }

    const data = (await res.json()) as { url?: string; video_url?: string };
    const url = data.url ?? data.video_url;
    if (!url) throw new Error("Free video API returned no url");

    return { url, provider: this.name, meta: { raw: data } };
  }
}
