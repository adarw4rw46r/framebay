import type { VideoProvider } from "./types";
import { MockVideoProvider } from "./mock";
import { FreeVideoProvider } from "./free";
import { FalVideoProvider } from "./fal";

export type { VideoProvider, GenerateVideoInput, GenerateVideoResult } from "./types";
export { MockVideoProvider } from "./mock";
export { FreeVideoProvider } from "./free";
export { FalVideoProvider } from "./fal";

export function getVideoProvider(): VideoProvider {
  const kind = (process.env.VIDEO_PROVIDER ?? "mock").toLowerCase();
  switch (kind) {
    case "free":
      return new FreeVideoProvider();
    case "fal":
      return new FalVideoProvider();
    case "mock":
    default:
      return new MockVideoProvider();
  }
}
