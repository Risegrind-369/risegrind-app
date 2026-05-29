import { describe, it, expect } from "vitest";

/**
 * Validate RevenueCat SDK key by checking that it's properly formatted
 * and can be used to initialize the SDK.
 * 
 * Note: Full validation requires running on a device with the Purchases SDK.
 * This test validates the key format and that it's set in the environment.
 */
describe("RevenueCat SDK Key", () => {
  it("should have EXPO_PUBLIC_REVENUECAT_API_KEY set in environment", () => {
    const key = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
    expect(key).toBeDefined();
    expect(typeof key).toBe("string");
    expect(key?.length).toBeGreaterThan(0);
  });

  it("should have valid RevenueCat key format (starts with 'appl_')", () => {
    const key = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
    expect(key).toMatch(/^appl_/);
  });

  it("should match the expected key", () => {
    const key = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
    expect(key).toBe("appl_oXOoAnPmuCpWtyqxcSLjTEETLsP");
  });
});
