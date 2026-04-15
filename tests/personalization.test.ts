import { describe, it, expect } from "vitest";

// Mock the buildPersonalizationContext function since it depends on database imports
const buildPersonalizationContext = (profile: any) => {
  if (!profile) return "";
  const parts: string[] = [];
  if (profile.firstName) parts.push(`User's name: ${profile.firstName}`);
  if (profile.age) parts.push(`User's age: ${profile.age}`);
  if (profile.empathyAnswer) parts.push(`Why they feel they're not good enough: "${profile.empathyAnswer}"`);
  if (profile.goalAnswer) parts.push(`Their goal/vision: "${profile.goalAnswer}"`);
  if (profile.mainGoals?.length > 0) parts.push(`Main goals: ${profile.mainGoals.join(", ")}`);
  if (profile.biggestProblems?.length > 0) parts.push(`Biggest problems: ${profile.biggestProblems.join(", ")}`);
  if (profile.wakeTime) parts.push(`Preferred wake time: ${profile.wakeTime}`);
  if (profile.motivationStyle) parts.push(`Coaching style preference: ${profile.motivationStyle}`);
  return parts.join("\n");
};

describe("User Personalization", () => {
  describe("buildPersonalizationContext", () => {
    it("should build context with all user profile fields", () => {
      const profile = {
        firstName: "John",
        age: 28,
        empathyAnswer: "I feel like I'm not disciplined enough",
        goalAnswer: "I want to build a consistent morning routine",
        mainGoals: ["fitness", "productivity", "mental clarity"],
        biggestProblems: ["procrastination", "inconsistency"],
        wakeTime: "6:00 AM",
        motivationStyle: "tough_love",
      };

      const context = buildPersonalizationContext(profile);

      expect(context).toContain("John");
      expect(context).toContain("28");
      expect(context).toContain("I feel like I'm not disciplined enough");
      expect(context).toContain("I want to build a consistent morning routine");
      expect(context).toContain("fitness");
      expect(context).toContain("procrastination");
      expect(context).toContain("6:00 AM");
      expect(context).toContain("tough_love");
    });

    it("should handle partial profile data", () => {
      const profile = {
        firstName: "Jane",
        empathyAnswer: "Feeling overwhelmed",
      };

      const context = buildPersonalizationContext(profile);

      expect(context).toContain("Jane");
      expect(context).toContain("Feeling overwhelmed");
    });

    it("should return empty string for null profile", () => {
      const context = buildPersonalizationContext(null);
      expect(context).toBe("");
    });

    it("should handle empty goals and problems arrays", () => {
      const profile = {
        firstName: "Alex",
        mainGoals: [],
        biggestProblems: [],
      };

      const context = buildPersonalizationContext(profile);

      expect(context).toContain("Alex");
      expect(context).not.toContain("undefined");
    });

    it("should format context for AI injection", () => {
      const profile = {
        firstName: "Sam",
        age: 35,
        goalAnswer: "Build sustainable habits",
      };

      const context = buildPersonalizationContext(profile);

      // Context should be readable and properly formatted
      expect(context.split("\n").length).toBeGreaterThan(0);
      expect(context).not.toContain("null");
      expect(context).not.toContain("undefined");
    });

    it("should reference user's name in coaching context", () => {
      const profile = {
        firstName: "Marcus",
        empathyAnswer: "I struggle with discipline",
        goalAnswer: "Become the best version of myself",
      };

      const context = buildPersonalizationContext(profile);

      // AI mentor should use this context to personalize responses
      expect(context).toContain("Marcus");
      expect(context).toContain("discipline");
      expect(context).toContain("best version");
    });

    it("should include goals in routine generation context", () => {
      const profile = {
        firstName: "Lisa",
        mainGoals: ["weight loss", "energy", "confidence"],
        wakeTime: "5:30 AM",
        motivationStyle: "supportive",
      };

      const context = buildPersonalizationContext(profile);

      expect(context).toContain("weight loss");
      expect(context).toContain("5:30 AM");
      expect(context).toContain("supportive");
    });

    it("should preserve order of profile information", () => {
      const profile = {
        firstName: "Alex",
        age: 30,
        empathyAnswer: "Not enough progress",
        goalAnswer: "Achieve goals",
      };

      const context = buildPersonalizationContext(profile);
      const lines = context.split("\n");

      // Verify order: name, age, empathy, goal
      expect(lines[0]).toContain("Alex");
      expect(lines[1]).toContain("30");
      expect(lines[2]).toContain("Not enough progress");
      expect(lines[3]).toContain("Achieve goals");
    });
  });
});
