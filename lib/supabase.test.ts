import { describe, it, expect } from "vitest";

/**
 * Test Supabase credentials are valid
 * This validates that the environment variables are set correctly
 */
describe("Supabase Credentials", () => {
  it("should have EXPO_PUBLIC_SUPABASE_URL set", () => {
    const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
    expect(url).toBeDefined();
    expect(url).toMatch(/^https:\/\/.+\.supabase\.co\/?$/);
  });

  it("should have EXPO_PUBLIC_SUPABASE_ANON_KEY set", () => {
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    expect(key).toBeDefined();
    expect(key).toMatch(/^eyJ/); // JWT starts with eyJ
    expect(key?.split(".").length).toBe(3); // JWT has 3 parts
  });

  it("should have SUPABASE_SERVICE_ROLE_KEY set", () => {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    expect(key).toBeDefined();
    expect(key).toMatch(/^eyJ/); // JWT starts with eyJ
    expect(key?.split(".").length).toBe(3); // JWT has 3 parts
  });

  it("should decode anon key correctly", () => {
    const key = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
    if (!key) return;

    const parts = key.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());

    expect(payload.role).toBe("anon");
    expect(payload.iss).toBe("supabase");
  });

  it("should decode service role key correctly", () => {
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!key) return;

    const parts = key.split(".");
    const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());

    expect(payload.role).toBe("service_role");
    expect(payload.iss).toBe("supabase");
  });
});
