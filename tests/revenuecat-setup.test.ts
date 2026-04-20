import { describe, it, expect } from "vitest";

describe("RevenueCat Setup", () => {
  it("should have EXPO_PUBLIC_RC_SDK_KEY environment variable set", () => {
    const sdkKey = process.env.EXPO_PUBLIC_RC_SDK_KEY;
    expect(sdkKey).toBeDefined();
    expect(sdkKey).toBeTruthy();
  });

  it("should have valid SDK key format (test_* prefix)", () => {
    const sdkKey = process.env.EXPO_PUBLIC_RC_SDK_KEY;
    expect(sdkKey).toMatch(/^test_[a-zA-Z0-9]+$/);
  });

  it("should have SDK key with sufficient length", () => {
    const sdkKey = process.env.EXPO_PUBLIC_RC_SDK_KEY;
    expect(sdkKey!.length).toBeGreaterThan(20);
  });

  it("should match the provided test key", () => {
    const sdkKey = process.env.EXPO_PUBLIC_RC_SDK_KEY;
    expect(sdkKey).toBe("test_fPLEXDsXJkmpdJbobXUsyWlKiSo");
  });
});
