/**
 * Environment variable validation test for RevenueCat and Superwall keys.
 * These keys are optional (app works without them in dev/web mode),
 * so we just verify the env vars are defined (even if empty).
 */
import { describe, expect, it } from "vitest";

describe("RevenueCat and Superwall environment variables", () => {
  it("EXPO_PUBLIC_RC_API_KEY_IOS is defined in environment", () => {
    // The key may be empty string if not yet configured — that's acceptable
    expect(process.env.EXPO_PUBLIC_RC_API_KEY_IOS).toBeDefined();
  });

  it("EXPO_PUBLIC_RC_API_KEY_ANDROID is defined in environment", () => {
    expect(process.env.EXPO_PUBLIC_RC_API_KEY_ANDROID).toBeDefined();
  });

  it("EXPO_PUBLIC_SUPERWALL_API_KEY_IOS is defined in environment", () => {
    expect(process.env.EXPO_PUBLIC_SUPERWALL_API_KEY_IOS).toBeDefined();
  });

  it("EXPO_PUBLIC_SUPERWALL_API_KEY_ANDROID is defined in environment", () => {
    expect(process.env.EXPO_PUBLIC_SUPERWALL_API_KEY_ANDROID).toBeDefined();
  });
});
