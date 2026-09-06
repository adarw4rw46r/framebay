import type { VideoProvider } from "./types";
import { MockVideoProvider } from "./mock";
import { FreeVideoProvider } from "./free";
import { FalVideoProvider } from "./fal";
import { PollinationsFreeProvider } from "./pollinations";

export type { VideoProvider, GenerateVideoInput, GenerateVideoResult } from "./types";
export { MockVideoProvider } from "./mock";
export { FreeVideoProvider } from "./free";
export { FalVideoProvider } from "./fal";
export { PollinationsFreeProvider } from "./pollinations";

export function getVideoProvider(): VideoProvider {
  const kind = (process.env.VIDEO_PROVIDER ?? "mock").toLowerCase();
  switch (kind) {
    case "pollinations":
      return new PollinationsFreeProvider();
    case "free":
      return new FreeVideoProvider();
    case "fal":
      return new FalVideoProvider();
    case "mock":
    default:
      return new MockVideoProvider();
  }
}
