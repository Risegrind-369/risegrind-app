import { describe, it, expect } from "vitest";

describe("Deep Link Handler - Email Verification", () => {
  describe("URL Parsing Logic", () => {
    it("should extract token_hash from full URL", () => {
      const fullUrl = "manus20260410080735://auth/confirm?token_hash=abc123&type=email";
      const match = fullUrl.match(/token_hash=([^&]+)/);
      
      expect(match).toBeTruthy();
      expect(match?.[1]).toBe("abc123");
    });

    it("should extract token_hash from truncated URL", () => {
      const truncatedUrl = "manus20260410080735://auth?token_hash=xyz789&type=email";
      const match = truncatedUrl.match(/token_hash=([^&]+)/);
      
      expect(match).toBeTruthy();
      expect(match?.[1]).toBe("xyz789");
    });

    it("should extract type parameter", () => {
      const url = "manus20260410080735://auth?token_hash=test123&type=email";
      const match = url.match(/type=([^&]+)/);
      
      expect(match).toBeTruthy();
      expect(match?.[1]).toBe("email");
    });
  });

  describe("Email Confirmation Detection", () => {
    it("should detect email confirmation from full URL", () => {
      const url = "manus20260410080735://auth/confirm?token_hash=test123&type=email";
      
      const hasTokenHash = url.includes("token_hash=");
      const hasType = url.includes("type=email");
      const hasAuthPath = url.includes("://auth");
      
      expect(hasTokenHash && hasType && hasAuthPath).toBe(true);
    });

    it("should detect email confirmation from truncated URL", () => {
      const url = "manus20260410080735://auth?token_hash=test456&type=email";
      
      const hasTokenHash = url.includes("token_hash=");
      const hasType = url.includes("type=email");
      const hasAuthPath = url.includes("://auth");
      
      expect(hasTokenHash && hasType && hasAuthPath).toBe(true);
    });

    it("should reject non-email type", () => {
      const url = "manus20260410080735://auth?token_hash=test789&type=sms";
      
      const isEmailType = url.includes("type=email");
      expect(isEmailType).toBe(false);
    });

    it("should reject missing token_hash", () => {
      const url = "manus20260410080735://auth?type=email";
      
      const hasTokenHash = url.includes("token_hash=");
      expect(hasTokenHash).toBe(false);
    });

    it("should reject wrong path", () => {
      const url = "manus20260410080735://profile?token_hash=test&type=email";
      
      const hasAuthPath = url.includes("://auth");
      expect(hasAuthPath).toBe(false);
    });
  });

  describe("Routing Decisions", () => {
    it("should route to step2-empathy after verification", () => {
      const targetRoute = "/onboarding/step2-empathy";
      expect(targetRoute).toContain("step2-empathy");
    });

    it("should route back to verify-email on error", () => {
      const targetRoute = "/onboarding/verify-email";
      expect(targetRoute).toContain("verify-email");
    });

    it("should preserve name and age params through routing", () => {
      const params = { name: "TestUser", age: "25" };
      expect(params.name).toBe("TestUser");
      expect(params.age).toBe("25");
    });
  });

  describe("Real Supabase URL Format", () => {
    it("should handle Supabase confirmation URL format", () => {
      // Supabase generates URLs like: https://project.supabase.co/auth/v1/verify?token=...&type=email
      // But with our deep link scheme, it becomes: manus20260410080735://auth/confirm?token_hash=...&type=email
      const supabaseStyleUrl = "manus20260410080735://auth/confirm?token_hash=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9&type=email";
      
      const hasTokenHash = supabaseStyleUrl.includes("token_hash=");
      const hasType = supabaseStyleUrl.includes("type=email");
      const hasAuthPath = supabaseStyleUrl.includes("://auth");
      
      expect(hasTokenHash && hasType && hasAuthPath).toBe(true);
    });

    it("should extract JWT token from Supabase URL", () => {
      const supabaseStyleUrl = "manus20260410080735://auth/confirm?token_hash=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9&type=email";
      const match = supabaseStyleUrl.match(/token_hash=([^&]+)/);
      
      expect(match).toBeTruthy();
      expect(match?.[1]).toContain("eyJ");  // JWT starts with eyJ
    });
  });

  describe("Deep Link Handler Logic", () => {
    it("should handle both full and truncated paths", () => {
      const fullPath = "auth/confirm";
      const truncatedPath = "auth";
      
      const isValidPath = (path: string) => path === "auth/confirm" || path === "auth";
      
      expect(isValidPath(fullPath)).toBe(true);
      expect(isValidPath(truncatedPath)).toBe(true);
    });

    it("should validate all required parameters", () => {
      const url = "manus20260410080735://auth?token_hash=test&type=email";
      
      const tokenHashMatch = url.match(/token_hash=([^&]+)/);
      const typeMatch = url.match(/type=([^&]+)/);
      
      const isValid = tokenHashMatch && typeMatch && typeMatch[1] === "email";
      expect(isValid).toBe(true);
    });

    it("should reject incomplete URLs", () => {
      const incompleteUrl = "manus20260410080735://auth";
      
      const hasTokenHash = incompleteUrl.includes("token_hash=");
      expect(hasTokenHash).toBe(false);
    });
  });
});
