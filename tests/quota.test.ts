import { describe, expect, it } from "vitest";
import { costForDuration, DAILY_FREE_QUOTA, SECONDS_PER_GEN } from "../lib/quota";

describe("quota costing", () => {
  it("charges 1 gen per 5 seconds (ceil)", () => {
    expect(SECONDS_PER_GEN).toBe(5);
    expect(costForDuration(1)).toBe(1);
    expect(costForDuration(5)).toBe(1);
    expect(costForDuration(6)).toBe(2);
    expect(costForDuration(10)).toBe(2);
    expect(costForDuration(11)).toBe(3);
  });

  it("exposes daily free quota of 20", () => {
    expect(DAILY_FREE_QUOTA).toBe(20);
  });
});
