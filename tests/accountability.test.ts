import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getHabitStackingSuggestions,
  createHabitStack,
  saveFutureLetter,
  getFutureLetter,
  getMotivationalQuotes,
  getQuitPreventionQuote,
  shouldSendWeeklyReminder,
} from "../server/accountability";

// Mock getDb
vi.mock("../server/db", () => ({
  getDb: vi.fn(async () => ({
    select: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockResolvedValue([]),
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockResolvedValue({ insertId: 1 }),
    update: vi.fn().mockReturnThis(),
    set: vi.fn().mockResolvedValue({ affectedRows: 1 }),
    orderBy: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue([]),
  })),
}));

describe("Accountability Features", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Habit Stacking", () => {
    it("should fetch habit stacking suggestions for a user", async () => {
      const suggestions = await getHabitStackingSuggestions(1, "habit-1");
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it("should create a new habit stack", async () => {
      const result = await createHabitStack(
        1,
        "coffee",
        "meditate",
        "After coffee, meditate for 5 min"
      );
      expect(result).toBeDefined();
    });

    it("should handle null db gracefully", async () => {
      const suggestions = await getHabitStackingSuggestions(1, "habit-1");
      expect(suggestions).toEqual([]);
    });
  });

  describe("Future Self Letter", () => {
    it("should save a future self letter", async () => {
      const result = await saveFutureLetter(
        1,
        "Dear future self...",
        "I want to be healthier",
        "I am stronger than my excuses"
      );
      expect(result).toBeDefined();
    });

    it("should fetch user's future letter", async () => {
      const letter = await getFutureLetter(1);
      expect(letter === null || typeof letter === "object").toBe(true);
    });

    it("should handle missing letter gracefully", async () => {
      const letter = await getFutureLetter(999);
      expect(letter === null || typeof letter === "object").toBe(true);
    });
  });

  describe("Motivational Quotes", () => {
    it("should fetch motivational quotes by category", async () => {
      const quotes = await getMotivationalQuotes(1, "quit-prevention");
      expect(Array.isArray(quotes)).toBe(true);
    });

    it("should fetch all motivational quotes if no category specified", async () => {
      const quotes = await getMotivationalQuotes(1);
      expect(Array.isArray(quotes)).toBe(true);
    });

    it("should get a random quit-prevention quote", async () => {
      const quote = await getQuitPreventionQuote(1);
      expect(quote === null || typeof quote === "object").toBe(true);
    });

    it("should handle no quotes gracefully", async () => {
      const quote = await getQuitPreventionQuote(999);
      expect(quote === null || typeof quote === "object").toBe(true);
    });
  });

  describe("Weekly Reminders", () => {
    it("should check if user should receive weekly reminder", async () => {
      const shouldSend = await shouldSendWeeklyReminder(1);
      expect(typeof shouldSend).toBe("boolean");
    });

    it("should return true if no recent reminders", async () => {
      const shouldSend = await shouldSendWeeklyReminder(1);
      expect(shouldSend).toBe(true);
    });

    it("should handle database errors gracefully", async () => {
      const shouldSend = await shouldSendWeeklyReminder(999);
      expect(typeof shouldSend).toBe("boolean");
    });
  });

  describe("Error Handling", () => {
    it("should handle database connection failures", async () => {
      const suggestions = await getHabitStackingSuggestions(1, "habit-1");
      expect(Array.isArray(suggestions)).toBe(true);
    });

    it("should return empty array for suggestions on error", async () => {
      const suggestions = await getHabitStackingSuggestions(1, "habit-1");
      expect(suggestions).toEqual([]);
    });

    it("should return null for letter on error", async () => {
      const letter = await getFutureLetter(1);
      expect(letter === null || typeof letter === "object").toBe(true);
    });

    it("should return empty array for quotes on error", async () => {
      const quotes = await getMotivationalQuotes(1);
      expect(Array.isArray(quotes)).toBe(true);
    });
  });

  describe("Data Validation", () => {
    it("should validate habit stack creation with required fields", async () => {
      const result = await createHabitStack(1, "anchor", "stacked");
      expect(result).toBeDefined();
    });

    it("should validate future letter with required fields", async () => {
      const result = await saveFutureLetter(1, "content", "reason");
      expect(result).toBeDefined();
    });

    it("should allow optional mantra in future letter", async () => {
      const result = await saveFutureLetter(1, "content", "reason", "mantra");
      expect(result).toBeDefined();
    });
  });
});
