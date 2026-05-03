/**
 * Seed Data Utility
 * 
 * Generates 14 days of realistic habit completion and mood data
 * for demo/screenshot purposes. Shows a full month of activity
 * to make the Intel chart look active and credible.
 */

import { MoodEntry, HabitCompletion, MoodLevel } from "./app-context";

export function generateFakeMoodData(days: number = 14): MoodEntry[] {
  const entries: MoodEntry[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Generate realistic mood progression (slight upward trend)
    const baseMood = 3 + Math.floor(i / 7); // Gradually improves over 2 weeks
    const variance = Math.random() * 1.5 - 0.75; // ±0.75 variance
    const mood = Math.max(1, Math.min(5, Math.round(baseMood + variance))) as MoodLevel;

    entries.push({
      id: `mood_${dateStr}`,
      date: dateStr,
      level: mood,
      emoji: getMoodEmoji(mood),
      timestamp: date.getTime(),
    });
  }

  return entries;
}

export function generateFakeCompletions(
  habitIds: string[],
  days: number = 14
): HabitCompletion[] {
  const completions: HabitCompletion[] = [];
  const now = new Date();

  if (habitIds.length === 0) {
    // Fallback: create 5 default habits if none provided
    habitIds = ["h1", "h2", "h3", "h4", "h5"];
  }

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    // Simulate realistic completion patterns
    // Early days: 60-80% completion
    // Later days: 80-100% completion (user getting more consistent)
    const completionRate = i < 7 ? 0.6 + Math.random() * 0.2 : 0.75 + Math.random() * 0.25;

    habitIds.forEach((habitId) => {
      if (Math.random() < completionRate) {
        completions.push({
          habitId,
          date: dateStr,
          completedAt: date.getTime() + Math.random() * 3600000, // Random time during day
        });
      }
    });
  }

  return completions;
}

function getMoodEmoji(level: MoodLevel): string {
  const emojis: Record<MoodLevel, string> = {
    1: "😢",
    2: "😕",
    3: "😐",
    4: "😊",
    5: "😄",
  };
  return emojis[level];
}

/**
 * Seed the app state with 14 days of fake data
 * Call this once during onboarding or from a debug screen
 */
export function seedAppState(habitIds: string[] = []): {
  moodEntries: MoodEntry[];
  completions: HabitCompletion[];
} {
  return {
    moodEntries: generateFakeMoodData(14),
    completions: generateFakeCompletions(habitIds, 14),
  };
}
