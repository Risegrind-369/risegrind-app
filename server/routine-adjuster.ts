/**
 * Routine Adjuster
 * Auto-adjusts morning routine difficulty based on Morning Energy Score
 * and user's health data (sleep, activity, etc.)
 */

import { getDb } from "./db";
import { getHealthDataRange, calculateMorningEnergyScore } from "./premium-features";

export interface AdjustedRoutine {
  habits: AdjustedHabit[];
  difficultyLevel: "very-light" | "light" | "normal" | "hard";
  energyScore: number;
  recommendation: string;
}

export interface AdjustedHabit {
  name: string;
  icon: string;
  durationMin: number;
  adjustedDurationMin: number;
  reason: string;
  isOptional: boolean; // If energy is low, some habits become optional
}

/**
 * Calculate routine adjustment based on morning energy score
 */
export function getRoutineDifficultyAdjustment(morningEnergyScore: number): {
  factor: number;
  level: "very-light" | "light" | "normal" | "hard";
} {
  if (morningEnergyScore < 20) {
    return { factor: 0.4, level: "very-light" }; // 40% of normal
  } else if (morningEnergyScore < 40) {
    return { factor: 0.6, level: "light" }; // 60% of normal
  } else if (morningEnergyScore < 60) {
    return { factor: 0.8, level: "light" }; // 80% of normal
  } else if (morningEnergyScore < 80) {
    return { factor: 1.0, level: "normal" }; // 100% of normal
  } else {
    return { factor: 1.3, level: "hard" }; // 130% of normal
  }
}

/**
 * Adjust routine habits based on energy level
 */
export function adjustRoutineHabits(
  originalHabits: any[],
  morningEnergyScore: number
): AdjustedRoutine {
  const { factor, level } = getRoutineDifficultyAdjustment(morningEnergyScore);

  const adjustedHabits: AdjustedHabit[] = originalHabits.map((habit) => {
    const adjustedDurationMin = Math.round(habit.durationMin * factor);

    let reason = "";
    let isOptional = false;

    if (morningEnergyScore < 30) {
      // Very low energy: make most habits optional
      isOptional = habit.durationMin > 10; // Only short habits are required
      reason = "Energy is low - this habit is optional today";
    } else if (morningEnergyScore < 50) {
      // Low energy: reduce duration, make some optional
      isOptional = habit.durationMin > 15;
      reason = "Energy is low - reduced duration for today";
    } else if (morningEnergyScore > 80) {
      // High energy: encourage more challenging habits
      reason = "Energy is high - challenge yourself today";
    } else {
      reason = "Normal energy - stick to your routine";
    }

    return {
      name: habit.name,
      icon: habit.icon,
      durationMin: habit.durationMin,
      adjustedDurationMin,
      reason,
      isOptional,
    };
  });

  // Generate recommendation based on energy level
  let recommendation = "";
  if (morningEnergyScore < 30) {
    recommendation =
      "Your energy is very low today. Focus on 1-2 essential habits and rest. You've got this!";
  } else if (morningEnergyScore < 50) {
    recommendation =
      "Your energy is lower than usual. Take it easy and prioritize your most important habits.";
  } else if (morningEnergyScore < 70) {
    recommendation = "You're at a good energy level. Stick to your routine and feel the momentum.";
  } else if (morningEnergyScore < 85) {
    recommendation =
      "You're feeling great! This is a perfect day to push yourself and add an extra challenge.";
  } else {
    recommendation =
      "Your energy is exceptional today! You're in peak condition - make the most of it!";
  }

  return {
    habits: adjustedHabits,
    difficultyLevel: level,
    energyScore: morningEnergyScore,
    recommendation,
  };
}

/**
 * Get 7-day energy trend for insights
 */
export async function get7DayEnergyTrend(userId: number) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 6);

  const data = await getHealthDataRange(userId, startDate, endDate);

  return data.map((day) => ({
    date: day.date,
    energyScore: day.morningEnergyScore || 50,
    sleepHours: day.sleepHours || 0,
    steps: day.steps || 0,
  }));
}

/**
 * Identify patterns in energy levels
 */
export function analyzeEnergyPatterns(energyTrend: any[]) {
  if (energyTrend.length === 0) return null;

  const avgEnergy =
    energyTrend.reduce((sum, day) => sum + day.energyScore, 0) / energyTrend.length;
  const avgSleep =
    energyTrend.reduce((sum, day) => sum + day.sleepHours, 0) / energyTrend.length;
  const avgSteps =
    energyTrend.reduce((sum, day) => sum + day.steps, 0) / energyTrend.length;

  // Find best and worst days
  const bestDay = energyTrend.reduce((best, day) =>
    day.energyScore > best.energyScore ? day : best
  );
  const worstDay = energyTrend.reduce((worst, day) =>
    day.energyScore < worst.energyScore ? day : worst
  );

  // Correlate sleep with energy
  const sleepEnergyCorrelation = calculateCorrelation(
    energyTrend.map((d) => d.sleepHours),
    energyTrend.map((d) => d.energyScore)
  );

  // Correlate activity with energy
  const activityEnergyCorrelation = calculateCorrelation(
    energyTrend.map((d) => d.steps),
    energyTrend.map((d) => d.energyScore)
  );

  return {
    avgEnergy: Math.round(avgEnergy),
    avgSleep: Math.round(avgSleep * 10) / 10,
    avgSteps: Math.round(avgSteps),
    bestDay,
    worstDay,
    sleepEnergyCorrelation: Math.round(sleepEnergyCorrelation * 100) / 100,
    activityEnergyCorrelation: Math.round(activityEnergyCorrelation * 100) / 100,
    insights: generateInsights(
      avgEnergy,
      avgSleep,
      avgSteps,
      sleepEnergyCorrelation,
      activityEnergyCorrelation
    ),
  };
}

/**
 * Calculate Pearson correlation coefficient
 */
function calculateCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const meanX = x.reduce((a, b) => a + b, 0) / n;
  const meanY = y.reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominatorX = 0;
  let denominatorY = 0;

  for (let i = 0; i < n; i++) {
    const dx = x[i] - meanX;
    const dy = y[i] - meanY;
    numerator += dx * dy;
    denominatorX += dx * dx;
    denominatorY += dy * dy;
  }

  const denominator = Math.sqrt(denominatorX * denominatorY);
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Generate personalized insights from energy patterns
 */
function generateInsights(
  avgEnergy: number,
  avgSleep: number,
  avgSteps: number,
  sleepCorr: number,
  activityCorr: number
): string[] {
  const insights: string[] = [];

  // Sleep insights
  if (avgSleep < 6) {
    insights.push("You're getting less sleep than recommended. Aim for 7-8 hours to boost energy.");
  } else if (avgSleep >= 7 && avgSleep <= 8) {
    insights.push("Your sleep is optimal! Keep up this routine.");
  } else if (avgSleep > 9) {
    insights.push("You're sleeping more than usual. This might indicate fatigue or stress.");
  }

  // Activity insights
  if (avgSteps < 5000) {
    insights.push("Increase your daily steps to improve energy and mood.");
  } else if (avgSteps >= 10000) {
    insights.push("Great activity level! Your steps are contributing to high energy.");
  }

  // Correlation insights
  if (sleepCorr > 0.5) {
    insights.push("Strong correlation: better sleep = higher energy. Prioritize sleep quality.");
  }

  if (activityCorr > 0.5) {
    insights.push("Strong correlation: more activity = higher energy. Keep moving!");
  }

  // Overall energy
  if (avgEnergy < 40) {
    insights.push("Your overall energy is low. Consider rest days and stress management.");
  } else if (avgEnergy > 75) {
    insights.push("Your energy levels are consistently high. You're crushing it!");
  }

  return insights;
}
