import type { GenerateVideoInput, GenerateVideoResult, VideoProvider } from "./types";

/**
 * FalVideoProvider — stub for fal.ai integration.
 * Set VIDEO_PROVIDER=fal and FAL_KEY when ready.
 */
export class FalVideoProvider implements VideoProvider {
  readonly name = "fal";

  async generate(_input: GenerateVideoInput): Promise<GenerateVideoResult> {
    void _input;
    throw new Error(
      "FalVideoProvider is a stub. Set VIDEO_PROVIDER=mock (default) or free for now. Wire FAL_KEY + fal client later.",
    );
  }
}
