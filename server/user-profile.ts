/**
 * User Profile Helper Functions
 *
 * Handles saving and retrieving personalized onboarding answers
 * for AI mentor and routine generation.
 */

import { getDb } from "./db";
import { userProfiles } from "@/drizzle/schema";
import { eq } from "drizzle-orm";

export interface OnboardingAnswers {
  firstName?: string;
  age?: number;
  empathyAnswer?: string;
  goalAnswer?: string;
  mainGoals?: string[];
  biggestProblems?: string[];
  wakeTime?: string;
  motivationStyle?: string;
  language?: string;
}

/**
 * Save or update user profile with onboarding answers
 */
export async function saveUserProfile(userId: number, answers: OnboardingAnswers) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    // Check if profile exists
    const existing = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    const profileData = {
      firstName: answers.firstName,
      age: answers.age,
      empathyAnswer: answers.empathyAnswer,
      goalAnswer: answers.goalAnswer,
      mainGoals: answers.mainGoals ? JSON.stringify(answers.mainGoals) : null,
      biggestProblems: answers.biggestProblems ? JSON.stringify(answers.biggestProblems) : null,
      wakeTime: answers.wakeTime,
      motivationStyle: answers.motivationStyle,
      language: answers.language || "en",
    };

    if (existing.length > 0) {
      // Update existing profile
      await db.update(userProfiles).set(profileData).where(eq(userProfiles.userId, userId));
    } else {
      // Create new profile
      await db.insert(userProfiles).values({
        userId,
        ...profileData,
      });
    }

    return { success: true, message: "Profile saved successfully" };
  } catch (error) {
    console.error("Error saving user profile:", error);
    return { success: false, error: String(error) };
  }
}

/**
 * Get user profile with all personalization data
 */
export async function getUserProfile(userId: number) {
  try {
    const db = await getDb();
    if (!db) throw new Error("Database connection failed");
    const profile = await db
      .select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId))
      .limit(1);

    if (profile.length === 0) {
      return null;
    }

    const p = profile[0];
    return {
      id: p.id,
      userId: p.userId,
      firstName: p.firstName,
      age: p.age,
      empathyAnswer: p.empathyAnswer,
      goalAnswer: p.goalAnswer,
      mainGoals: p.mainGoals ? JSON.parse(p.mainGoals) : [],
      biggestProblems: p.biggestProblems ? JSON.parse(p.biggestProblems) : [],
      wakeTime: p.wakeTime,
      motivationStyle: p.motivationStyle,
      language: p.language,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    };
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

/**
 * Build personalized AI prompt context from user profile
 * Used to inject user's answers into AI mentor requests
 */
export function buildPersonalizationContext(profile: any): string {
  if (!profile) return "";

  const parts: string[] = [];

  if (profile.firstName) {
    parts.push(`User's name: ${profile.firstName}`);
  }

  if (profile.age) {
    parts.push(`User's age: ${profile.age}`);
  }

  if (profile.empathyAnswer) {
    parts.push(`Why they feel they're not good enough: "${profile.empathyAnswer}"`);
  }

  if (profile.goalAnswer) {
    parts.push(`Their goal/vision: "${profile.goalAnswer}"`);
  }

  if (profile.mainGoals && profile.mainGoals.length > 0) {
    parts.push(`Main goals: ${profile.mainGoals.join(", ")}`);
  }

  if (profile.biggestProblems && profile.biggestProblems.length > 0) {
    parts.push(`Biggest problems: ${profile.biggestProblems.join(", ")}`);
  }

  if (profile.wakeTime) {
    parts.push(`Preferred wake time: ${profile.wakeTime}`);
  }

  if (profile.motivationStyle) {
    parts.push(`Coaching style preference: ${profile.motivationStyle}`);
  }

  return parts.join("\n");
}
