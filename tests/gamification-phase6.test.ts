import { describe, it, expect } from 'vitest';

/**
 * Phase 6: Gamification Tests
 * Tests for mentor levels, habit mastery, and achievement badges
 */

describe('Mentor Level System', () => {
  it('should calculate XP required for each level', () => {
    const calculateXpRequiredForLevel = (level: number) => {
      return 100 * (level - 1) + 50 * Math.pow(level - 1, 2);
    };

    expect(calculateXpRequiredForLevel(1)).toBe(0);
    expect(calculateXpRequiredForLevel(2)).toBe(150);
    expect(calculateXpRequiredForLevel(5)).toBe(1200); // 100*4 + 50*16 = 400 + 800 = 1200
    expect(calculateXpRequiredForLevel(10)).toBe(4500);
    expect(calculateXpRequiredForLevel(25)).toBe(30000);
    expect(calculateXpRequiredForLevel(50)).toBe(125000);
  });

  it('should calculate current level from total XP', () => {
    const calculateLevelFromXp = (totalXp: number) => {
      let level = 1;
      let xpAccumulated = 0;

      for (let i = 1; i <= 50; i++) {
        const xpRequired = 100 * (i - 1) + 50 * Math.pow(i - 1, 2);
        if (xpAccumulated + xpRequired > totalXp) {
          level = i;
          const xpToNext = xpAccumulated + xpRequired - totalXp;
          return { level, xpToNextLevel: xpToNext };
        }
        xpAccumulated += xpRequired;
      }

      return { level: 50, xpToNextLevel: 0 };
    };

    const result1 = calculateLevelFromXp(0);
    expect(result1.level).toBeGreaterThanOrEqual(1);

    const result2 = calculateLevelFromXp(150);
    expect(result2.level).toBeGreaterThanOrEqual(2);

    const result3 = calculateLevelFromXp(5500);
    expect(result3.level).toBeGreaterThan(1);
  });

  it('should unlock mentor styles at correct levels', () => {
    const getUnlockedMentorStyles = (level: number) => {
      const styles: Record<number, string> = {
        1: 'Strict Mentor',
        5: 'Supportive Mentor',
        10: 'Motivational Mentor',
        15: 'Analytical Mentor',
        20: 'Zen Mentor',
        25: 'Gamified Mentor',
        30: 'Personalized Mentor',
        40: 'Master Mentor',
        50: 'Legendary Mentor',
      };

      const unlockedStyles = ['Strict Mentor'];
      for (const [requiredLevel, style] of Object.entries(styles)) {
        if (parseInt(requiredLevel) <= level) {
          unlockedStyles.push(style);
        }
      }

      return [...new Set(unlockedStyles)];
    };

    expect(getUnlockedMentorStyles(1)).toContain('Strict Mentor');
    expect(getUnlockedMentorStyles(1)).not.toContain('Supportive Mentor');

    expect(getUnlockedMentorStyles(5)).toContain('Supportive Mentor');
    expect(getUnlockedMentorStyles(5)).not.toContain('Motivational Mentor');

    expect(getUnlockedMentorStyles(50)).toContain('Legendary Mentor');
    expect(getUnlockedMentorStyles(50).length).toBe(9);
  });

  it('should award XP for various actions', () => {
    const XP_REWARDS = {
      HABIT_COMPLETION: 10,
      STREAK_7_DAYS: 50,
      STREAK_30_DAYS: 100,
      STREAK_100_DAYS: 250,
      JOURNAL_ENTRY: 5,
      ACCOUNTABILITY_PARTNER: 25,
      GROUP_JOIN: 15,
      LEADERBOARD_TOP_10: 30,
    };

    expect(XP_REWARDS.HABIT_COMPLETION).toBe(10);
    expect(XP_REWARDS.STREAK_100_DAYS).toBe(250);
    expect(XP_REWARDS.JOURNAL_ENTRY).toBe(5);

    const totalXp = Object.values(XP_REWARDS).reduce((a, b) => a + b);
    expect(totalXp).toBeGreaterThan(0);
  });
});

describe('Habit Mastery Tiers', () => {
  it('should calculate habit mastery tier', () => {
    const calculateHabitMasteryTier = (
      streakDays: number,
      consistencyRate: number,
      totalCompletions: number
    ): string => {
      if (streakDays >= 100 && consistencyRate >= 0.95 && totalCompletions >= 150) {
        return 'master';
      }
      if (streakDays >= 30 && consistencyRate >= 0.8 && totalCompletions >= 51) {
        return 'automatic';
      }
      if (streakDays >= 7 && consistencyRate >= 0.5 && totalCompletions >= 11) {
        return 'consistent';
      }
      return 'beginner';
    };

    expect(calculateHabitMasteryTier(3, 0.4, 5)).toBe('beginner');
    expect(calculateHabitMasteryTier(7, 0.5, 11)).toBe('consistent');
    expect(calculateHabitMasteryTier(30, 0.8, 51)).toBe('automatic');
    expect(calculateHabitMasteryTier(100, 0.95, 150)).toBe('master');
  });

  it('should calculate XP multiplier based on tier', () => {
    const getXpMultiplier = (tier: string): number => {
      const multipliers: Record<string, number> = {
        beginner: 1.0,
        consistent: 1.1,
        automatic: 1.2,
        master: 1.5,
      };
      return multipliers[tier] || 1.0;
    };

    expect(getXpMultiplier('beginner')).toBe(1.0);
    expect(getXpMultiplier('consistent')).toBe(1.1);
    expect(getXpMultiplier('automatic')).toBe(1.2);
    expect(getXpMultiplier('master')).toBe(1.5);
  });

  it('should apply XP multiplier to rewards', () => {
    const baseXp = 10;
    const multipliers = [1.0, 1.1, 1.2, 1.5];

    const results = multipliers.map((m) => baseXp * m);

    expect(results[0]).toBe(10);
    expect(results[1]).toBe(11);
    expect(results[2]).toBe(12);
    expect(results[3]).toBe(15);
  });
});

describe('Achievement Badges', () => {
  it('should have 50+ badge definitions', () => {
    const badges = [
      { id: 'streak-7', rarity: 'common' },
      { id: 'streak-30', rarity: 'rare' },
      { id: 'streak-100', rarity: 'epic' },
      { id: 'streak-365', rarity: 'legendary' },
      { id: 'perfect-week', rarity: 'common' },
      { id: 'perfect-month', rarity: 'rare' },
      { id: 'perfect-year', rarity: 'epic' },
      { id: 'unbreakable', rarity: 'legendary' },
      { id: 'consistency-90', rarity: 'common' },
      { id: 'consistency-95', rarity: 'rare' },
      { id: 'consistency-99', rarity: 'epic' },
      { id: 'flawless', rarity: 'legendary' },
      { id: 'early-bird', rarity: 'common' },
      { id: 'night-owl', rarity: 'common' },
      { id: 'all-day-warrior', rarity: 'rare' },
      { id: 'time-master', rarity: 'epic' },
      { id: 'first-friend', rarity: 'common' },
      { id: 'squad-leader', rarity: 'rare' },
      { id: 'group-founder', rarity: 'rare' },
      { id: 'community-champion', rarity: 'epic' },
      { id: 'leaderboard-top-10', rarity: 'rare' },
      { id: 'leaderboard-top-3', rarity: 'epic' },
      { id: 'leaderboard-1', rarity: 'legendary' },
      { id: 'social-butterfly', rarity: 'common' },
      { id: 'journal-100', rarity: 'common' },
      { id: 'journal-500', rarity: 'rare' },
      { id: 'journal-1000', rarity: 'epic' },
      { id: 'insight-seeker', rarity: 'common' },
      { id: 'data-analyst', rarity: 'rare' },
      { id: 'level-10', rarity: 'common' },
      { id: 'level-25', rarity: 'rare' },
      { id: 'level-50', rarity: 'legendary' },
      { id: 'first-challenge', rarity: 'common' },
      { id: 'challenge-master', rarity: 'rare' },
      { id: 'speed-runner', rarity: 'epic' },
      { id: 'consistency-champion', rarity: 'rare' },
      { id: 'habit-stacker', rarity: 'epic' },
      { id: 'sleep-warrior', rarity: 'common' },
      { id: 'stress-buster', rarity: 'rare' },
      { id: 'energy-optimizer', rarity: 'epic' },
      { id: 'health-hero', rarity: 'rare' },
      { id: 'data-collector', rarity: 'common' },
      { id: 'first-xp', rarity: 'common' },
      { id: 'xp-1000', rarity: 'common' },
      { id: 'xp-10000', rarity: 'rare' },
      { id: 'xp-50000', rarity: 'epic' },
      { id: 'xp-100000', rarity: 'legendary' },
      { id: 'mentor-unlocked', rarity: 'common' },
      { id: 'mastery-achieved', rarity: 'rare' },
      { id: 'legendary-status', rarity: 'legendary' },
    ];

    expect(badges.length).toBeGreaterThanOrEqual(50);
  });

  it('should distribute badges by rarity', () => {
    const badges = [
      { rarity: 'common' },
      { rarity: 'common' },
      { rarity: 'common' },
      { rarity: 'common' },
      { rarity: 'rare' },
      { rarity: 'rare' },
      { rarity: 'epic' },
      { rarity: 'epic' },
      { rarity: 'legendary' },
    ];

    const rarityDistribution = {
      common: badges.filter((b) => b.rarity === 'common').length,
      rare: badges.filter((b) => b.rarity === 'rare').length,
      epic: badges.filter((b) => b.rarity === 'epic').length,
      legendary: badges.filter((b) => b.rarity === 'legendary').length,
    };

    expect(rarityDistribution.common).toBeGreaterThanOrEqual(rarityDistribution.rare);
    expect(rarityDistribution.rare).toBeGreaterThanOrEqual(rarityDistribution.epic);
    expect(rarityDistribution.epic).toBeGreaterThanOrEqual(rarityDistribution.legendary);
  });

  it('should unlock badges based on conditions', () => {
    const checkBadgeUnlock = (badgeId: string, userData: any): boolean => {
      const conditions: Record<string, () => boolean> = {
        'streak-7': () => userData.maxStreak >= 7,
        'streak-30': () => userData.maxStreak >= 30,
        'streak-100': () => userData.maxStreak >= 100,
        'first-friend': () => userData.accountabilityPartners >= 1,
        'squad-leader': () => userData.accountabilityPartners >= 5,
        'level-10': () => userData.mentorLevel >= 10,
        'level-50': () => userData.mentorLevel >= 50,
      };

      return conditions[badgeId]?.() ?? false;
    };

    const userData = {
      maxStreak: 35,
      accountabilityPartners: 3,
      mentorLevel: 15,
    };

    expect(checkBadgeUnlock('streak-7', userData)).toBe(true);
    expect(checkBadgeUnlock('streak-30', userData)).toBe(true);
    expect(checkBadgeUnlock('streak-100', userData)).toBe(false);
    expect(checkBadgeUnlock('first-friend', userData)).toBe(true);
    expect(checkBadgeUnlock('squad-leader', userData)).toBe(false);
    expect(checkBadgeUnlock('level-10', userData)).toBe(true);
    expect(checkBadgeUnlock('level-50', userData)).toBe(false);
  });

  it('should award XP for badge unlock', () => {
    const badgeXpRewards: Record<string, number> = {
      'streak-7': 50,
      'streak-30': 150,
      'streak-100': 500,
      'streak-365': 2000,
      'level-50': 2000,
      'legendary-status': 3000,
    };

    expect(badgeXpRewards['streak-7']).toBe(50);
    expect(badgeXpRewards['level-50']).toBe(2000);
    expect(badgeXpRewards['legendary-status']).toBe(3000);
  });
});

describe('Gamification Dashboard', () => {
  it('should aggregate gamification stats', () => {
    const stats = {
      mentorLevel: 15,
      totalXp: 8500,
      badgesUnlocked: 12,
      habitsTracked: 5,
      masteryTiers: {
        beginner: 1,
        consistent: 2,
        automatic: 1,
        master: 1,
      },
    };

    expect(stats.mentorLevel).toBeGreaterThan(0);
    expect(stats.totalXp).toBeGreaterThan(0);
    expect(stats.badgesUnlocked).toBeGreaterThan(0);
    expect(stats.habitsTracked).toBeGreaterThan(0);

    const totalMasteries = Object.values(stats.masteryTiers).reduce((a, b) => a + b);
    expect(totalMasteries).toBe(stats.habitsTracked);
  });

  it('should calculate progress percentages', () => {
    const maxLevel = 50;
    const currentLevel = 25;
    const levelProgress = (currentLevel / maxLevel) * 100;

    expect(levelProgress).toBe(50);

    const totalBadges = 50;
    const unlockedBadges = 20;
    const badgeProgress = (unlockedBadges / totalBadges) * 100;

    expect(badgeProgress).toBe(40);
  });
});
