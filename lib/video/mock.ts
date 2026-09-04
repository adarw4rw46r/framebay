import type { GenerateVideoInput, GenerateVideoResult, VideoProvider } from "./types";

const SAMPLE = "/fixtures/sample-short.mp4";

export class MockVideoProvider implements VideoProvider {
  readonly name = "mock";

  constructor(private delayMs = Number(process.env.MOCK_VIDEO_DELAY_MS ?? 800)) {}

  async generate(input: GenerateVideoInput): Promise<GenerateVideoResult> {
    await new Promise((r) => setTimeout(r, this.delayMs));
    if (process.env.MOCK_VIDEO_FAIL === "1") {
      throw new Error("Mock provider forced failure");
    }
    return {
      url: SAMPLE,
      provider: this.name,
      meta: {
        prompt: input.prompt,
        durationSec: input.durationSec,
        variantIndex: input.variantIndex ?? 0,
      },
    };
  }
}
