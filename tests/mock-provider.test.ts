import { describe, expect, it } from "vitest";
import { MockVideoProvider } from "../lib/video/mock";

describe("MockVideoProvider", () => {
  it("returns the sample fixture after a short delay", async () => {
    const provider = new MockVideoProvider(10);
    const result = await provider.generate({
      prompt: "test hook",
      durationSec: 5,
      aspectRatio: "9:16",
      variantIndex: 0,
    });
    expect(provider.name).toBe("mock");
    expect(result.provider).toBe("mock");
    expect(result.url).toBe("/fixtures/sample-short.mp4");
  });
});
