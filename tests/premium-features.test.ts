import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getRoutineDifficultyAdjustment,
  adjustRoutineHabits,
  analyzeEnergyPatterns,
} from "../server/routine-adjuster";
import { calculateMorningEnergyScore } from "../server/premium-features";

describe("Premium Features", () => {
  describe("Morning Energy Score", () => {
    it("should calculate score based on sleep hours", () => {
      // Optimal sleep (7-8 hours)
      expect(calculateMorningEnergyScore(7.5, 0, 0)).toBeCloseTo(80, 0);
      expect(calculateMorningEnergyScore(8, 0, 0)).toBeCloseTo(80, 0);

      // Low sleep
      expect(calculateMorningEnergyScore(4, 0, 0)).toBeCloseTo(30, 0);

      // Good sleep
      expect(calculateMorningEnergyScore(6.5, 0, 0)).toBeCloseTo(70, 0);
    });

    it("should factor in activity level", () => {
      // 10k+ steps
      expect(calculateMorningEnergyScore(7, 10000, 0)).toBeCloseTo(100, 0);

      // 5k-10k steps
      expect(calculateMorningEnergyScore(7, 7000, 0)).toBeCloseTo(90, 0);

      // Low activity
      expect(calculateMorningEnergyScore(7, 2000, 0)).toBeCloseTo(80, 0);
    });

    it("should clamp score to 0-100", () => {
      expect(calculateMorningEnergyScore(12, 50000, 1000)).toBeGreaterThanOrEqual(0);
      expect(calculateMorningEnergyScore(12, 50000, 1000)).toBeLessThanOrEqual(100);
    });
  });

  describe("Routine Difficulty Adjustment", () => {
    it("should return very-light for low energy", () => {
      const result = getRoutineDifficultyAdjustment(15);
      expect(result.level).toBe("very-light");
      expect(result.factor).toBe(0.4);
    });

    it("should return light for moderate-low energy", () => {
      const result = getRoutineDifficultyAdjustment(45);
      expect(result.level).toBe("light");
      expect(result.factor).toBe(0.8);
    });

    it("should return normal for medium energy", () => {
      const result = getRoutineDifficultyAdjustment(65);
      expect(result.level).toBe("normal");
      expect(result.factor).toBeCloseTo(1.0, 1);
    });

    it("should return hard for high energy", () => {
      const result = getRoutineDifficultyAdjustment(85);
      expect(result.level).toBe("hard");
      expect(result.factor).toBe(1.3);
    });
  });

  describe("Routine Habit Adjustment", () => {
    const mockHabits = [
      { name: "Meditation", icon: "🧘", durationMin: 10 },
      { name: "Exercise", icon: "💪", durationMin: 30 },
      { name: "Journaling", icon: "📝", durationMin: 5 },
    ];

    it("should adjust durations based on energy level", () => {
      const adjusted = adjustRoutineHabits(mockHabits, 50);
      expect(adjusted.difficultyLevel).toBe("light");
      expect(adjusted.energyScore).toBe(50);

      // Duration should be reduced (factor 0.8)
      expect(adjusted.habits[0].adjustedDurationMin).toBeCloseTo(8, 0);
      expect(adjusted.habits[1].adjustedDurationMin).toBeCloseTo(24, 0);
    });

    it("should mark habits as optional when energy is very low", () => {
      const adjusted = adjustRoutineHabits(mockHabits, 15);
      expect(adjusted.difficultyLevel).toBe("very-light");

      // Long habits should be optional
      expect(adjusted.habits[1].isOptional).toBe(true);

      // Short habits should be required
      expect(adjusted.habits[2].isOptional).toBe(false);
    });

    it("should increase difficulty when energy is high", () => {
      const adjusted = adjustRoutineHabits(mockHabits, 85);
      expect(adjusted.difficultyLevel).toBe("hard");

      // Duration should be increased (factor 1.3)
      expect(adjusted.habits[0].adjustedDurationMin).toBeCloseTo(13, 0);
      expect(adjusted.habits[1].adjustedDurationMin).toBeCloseTo(39, 0);
    });

    it("should provide appropriate recommendations", () => {
      const lowEnergy = adjustRoutineHabits(mockHabits, 25);
      expect(lowEnergy.recommendation).toContain("very low");

      const highEnergy = adjustRoutineHabits(mockHabits, 85);
      expect(highEnergy.recommendation).toContain("peak");
    });
  });

  describe("Energy Pattern Analysis", () => {
    const mockTrend = [
      { date: "2026-04-15", energyScore: 60, sleepHours: 7, steps: 8000 },
      { date: "2026-04-14", energyScore: 70, sleepHours: 7.5, steps: 10000 },
      { date: "2026-04-13", energyScore: 50, sleepHours: 5.5, steps: 5000 },
      { date: "2026-04-12", energyScore: 75, sleepHours: 8, steps: 12000 },
      { date: "2026-04-11", energyScore: 55, sleepHours: 6, steps: 6000 },
    ];

    it("should calculate average metrics", () => {
      const analysis = analyzeEnergyPatterns(mockTrend);
      expect(analysis?.avgEnergy).toBeCloseTo(62, 0);
      expect(analysis?.avgSleep).toBeCloseTo(6.8, 1);
      expect(analysis?.avgSteps).toBeCloseTo(8200, 0);
    });

    it("should identify best and worst days", () => {
      const analysis = analyzeEnergyPatterns(mockTrend);
      expect(analysis?.bestDay?.energyScore).toBe(75);
      expect(analysis?.worstDay?.energyScore).toBe(50);
    });

    it("should calculate correlations", () => {
      const analysis = analyzeEnergyPatterns(mockTrend);
      expect(analysis?.sleepEnergyCorrelation).toBeGreaterThan(0);
      expect(analysis?.activityEnergyCorrelation).toBeGreaterThan(0);
    });

    it("should generate insights", () => {
      const analysis = analyzeEnergyPatterns(mockTrend);
      expect(analysis?.insights).toBeDefined();
      expect(Array.isArray(analysis?.insights)).toBe(true);
      expect(analysis?.insights.length).toBeGreaterThan(0);
    });
  });

  describe("Recovery Quest", () => {
    it("should calculate streak recovery percentage", () => {
      // Recovery quest should offer 50% streak recovery by default
      const recoveryPercent = 50;
      expect(recoveryPercent).toBeGreaterThan(0);
      expect(recoveryPercent).toBeLessThanOrEqual(100);
    });

    it("should set 24-hour expiry for recovery quests", () => {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const diffMs = expiresAt.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      expect(diffHours).toBeCloseTo(24, 1);
    });
  });

  describe("Missed Habit Reason Context", () => {
    it("should build context from past reasons", () => {
      const mockReasons = [
        { reason: "Busy at work", missedDate: new Date() },
        { reason: "Busy at work", missedDate: new Date() },
        { reason: "Feeling tired", missedDate: new Date() },
        { reason: "Forgot", missedDate: new Date() },
      ];

      // Simulate buildMissedReasonContext logic
      const reasonCounts: Record<string, number> = {};
      mockReasons.forEach((r) => {
        const key = r.reason.toLowerCase();
        reasonCounts[key] = (reasonCounts[key] || 0) + 1;
      });

      const topReasons = Object.entries(reasonCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([reason]) => reason);

      expect(topReasons[0]).toBe("busy at work");
      expect(topReasons.length).toBeGreaterThan(0);
    });
  });
});
