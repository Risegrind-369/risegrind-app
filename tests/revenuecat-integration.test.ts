import { describe, it, expect } from "vitest";

describe("RevenueCat Integration", () => {
  it("should have SDK API key configured", () => {
    const sdkKey = process.env.EXPO_PUBLIC_RC_SDK_KEY;
    expect(sdkKey).toBe("test_fPLEXDsXJkmpdJbobXUsyWlKiSo");
  });

  it("should have valid SDK key format", () => {
    const sdkKey = process.env.EXPO_PUBLIC_RC_SDK_KEY;
    expect(sdkKey).toMatch(/^test_[a-zA-Z0-9]+$/);
  });

  it("should have SDK key with sufficient length", () => {
    const sdkKey = process.env.EXPO_PUBLIC_RC_SDK_KEY;
    expect(sdkKey!.length).toBeGreaterThan(20);
  });
});
