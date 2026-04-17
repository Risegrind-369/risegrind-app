import { describe, it, expect } from "vitest";
import React from "react";

// Suppress React import warning in test files
React;
import {
  getHabitName,
  getMoodLabel,
  getRankLabel,
  getSideQuestTranslation,
  type Language,
} from "../lib/translations-helper";

describe("Localization - Translations Helper", () => {
  describe("Habit Translations", () => {
    it("should translate default habits (h1-h7) to all languages", () => {
      const habitIds = ["h1", "h2", "h3", "h4", "h5", "h6", "h7"];
      const languages: Language[] = ["en", "fr", "pt"];

      habitIds.forEach((habitId) => {
        languages.forEach((lang) => {
          const translation = getHabitName(habitId, lang);
          expect(translation).toBeTruthy();
          expect(translation).not.toBe(habitId); // Should not return the ID as fallback
        });
      });
    });

    it("should translate AI-generated habits (ai_h1-ai_h6) to all languages", () => {
      const aiHabitIds = ["ai_h1", "ai_h2", "ai_h3", "ai_h4", "ai_h5", "ai_h6"];
      const languages: Language[] = ["en", "fr", "pt"];

      aiHabitIds.forEach((habitId) => {
        languages.forEach((lang) => {
          const translation = getHabitName(habitId, lang);
          expect(translation).toBeTruthy();
          expect(translation).not.toBe(habitId); // Should not return the ID as fallback
        });
      });
    });

    it("should return habitId as fallback for unknown habits", () => {
      const unknownHabitId = "unknown_habit";
      const translation = getHabitName(unknownHabitId, "en");
      expect(translation).toBe(unknownHabitId);
    });

    it("should have different translations for different languages", () => {
      const enTranslation = getHabitName("h1", "en");
      const frTranslation = getHabitName("h1", "fr");
      const ptTranslation = getHabitName("h1", "pt");

      expect(enTranslation).not.toBe(frTranslation);
      expect(frTranslation).not.toBe(ptTranslation);
      expect(enTranslation).not.toBe(ptTranslation);
    });
  });

  describe("Mood Translations", () => {
    it("should translate all mood levels (1-5) to all languages", () => {
      const moodLevels = [1, 2, 3, 4, 5];
      const languages: Language[] = ["en", "fr", "pt"];

      moodLevels.forEach((level) => {
        languages.forEach((lang) => {
          const translation = getMoodLabel(level, lang);
          expect(translation).toBeTruthy();
          expect(translation).not.toBe("Unknown");
        });
      });
    });

    it("should return 'Unknown' for invalid mood levels", () => {
      const translation = getMoodLabel(99, "en");
      expect(translation).toBe("Unknown");
    });

    it("should have different translations for different languages", () => {
      const enTranslation = getMoodLabel(1, "en");
      const frTranslation = getMoodLabel(1, "fr");
      const ptTranslation = getMoodLabel(1, "pt");

      expect(enTranslation).not.toBe(frTranslation);
      expect(frTranslation).not.toBe(ptTranslation);
    });
  });

  describe("Rank Translations", () => {
    it("should translate all ranks to all languages", () => {
      const ranks = [
        "Early Riser",
        "Morning Warrior",
        "Grind Master",
        "Grind Legend",
      ];
      const languages: Language[] = ["en", "fr", "pt"];

      ranks.forEach((rank) => {
        languages.forEach((lang) => {
          const translation = getRankLabel(rank, lang);
          expect(translation).toBeTruthy();
        });
      });
    });

    it("should return rank as fallback for unknown ranks", () => {
      const unknownRank = "Unknown Rank";
      const translation = getRankLabel(unknownRank, "en");
      expect(translation).toBe(unknownRank);
    });

    it("should have different translations for different languages", () => {
      const enTranslation = getRankLabel("Early Riser", "en");
      const frTranslation = getRankLabel("Early Riser", "fr");
      const ptTranslation = getRankLabel("Early Riser", "pt");

      expect(enTranslation).not.toBe(frTranslation);
      expect(frTranslation).not.toBe(ptTranslation);
    });
  });

  describe("Side Quest Translations", () => {
    it("should translate all side quests to all languages", () => {
      const questIds = [
        "sq_no_social_7",
        "sq_sleep_7",
        "sq_gratitude_7",
        "sq_cold_shower_14",
        "sq_no_alcohol_30",
        "sq_journal_14",
        "sq_exercise_21",
        "sq_meditate_10",
      ];
      const languages: Language[] = ["en", "fr", "pt"];

      questIds.forEach((questId) => {
        languages.forEach((lang) => {
          const translation = getSideQuestTranslation(questId, lang);
          expect(translation).toBeTruthy();
          expect(translation?.title).toBeTruthy();
          expect(translation?.description).toBeTruthy();
        });
      });
    });

    it("should return null for unknown quests", () => {
      const translation = getSideQuestTranslation("unknown_quest", "en");
      expect(translation).toBeNull();
    });

    it("should have different translations for different languages", () => {
      const enTranslation = getSideQuestTranslation("sq_no_social_7", "en");
      const frTranslation = getSideQuestTranslation("sq_no_social_7", "fr");
      const ptTranslation = getSideQuestTranslation("sq_no_social_7", "pt");

      expect(enTranslation?.title).not.toBe(frTranslation?.title);
      expect(frTranslation?.title).not.toBe(ptTranslation?.title);
      expect(enTranslation?.description).not.toBe(
        frTranslation?.description
      );
    });

    it("should include title and description for each quest", () => {
      const translation = getSideQuestTranslation("sq_no_social_7", "en");
      expect(translation).toHaveProperty("title");
      expect(translation).toHaveProperty("description");
      expect(translation?.title).toBeTruthy();
      expect(translation?.description).toBeTruthy();
    });
  });

  describe("Consistency Checks", () => {
    it("should have consistent habit translations across languages", () => {
      const habitIds = [
        "h1",
        "h2",
        "h3",
        "h4",
        "h5",
        "h6",
        "h7",
        "ai_h1",
        "ai_h2",
        "ai_h3",
        "ai_h4",
        "ai_h5",
        "ai_h6",
      ];
      const languages: Language[] = ["en", "fr", "pt"];

      habitIds.forEach((habitId) => {
        const translations = languages.map((lang) =>
          getHabitName(habitId, lang)
        );
        // All translations should be non-empty and different from the ID
        translations.forEach((translation) => {
          expect(translation).toBeTruthy();
          expect(translation).not.toBe(habitId);
        });
      });
    });

    it("should not have empty translations for any language", () => {
      const languages: Language[] = ["en", "fr", "pt"];

      // Check habits
      ["h1", "h2", "h3", "h4", "h5", "h6", "h7"].forEach((habitId) => {
        languages.forEach((lang) => {
          expect(getHabitName(habitId, lang)).toBeTruthy();
        });
      });

      // Check moods
      [1, 2, 3, 4, 5].forEach((level) => {
        languages.forEach((lang) => {
          expect(getMoodLabel(level, lang)).toBeTruthy();
        });
      });

      // Check ranks
      [
        "Early Riser",
        "Morning Warrior",
        "Grind Master",
        "Grind Legend",
      ].forEach((rank) => {
        languages.forEach((lang) => {
          expect(getRankLabel(rank, lang)).toBeTruthy();
        });
      });
    });
  });
});
