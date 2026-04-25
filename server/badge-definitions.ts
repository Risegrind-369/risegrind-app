/**
 * Badge Definitions - 50+ Achievement Badges
 * Organized by category with rarity levels
 */

export interface BadgeDefinition {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  xpReward: number;
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  // Streak Badges (8)
  {
    id: 'streak-7',
    name: '7-Day Streak',
    description: 'Complete a 7-day streak on any habit',
    icon: '🔥',
    rarity: 'common',
    category: 'streak',
    xpReward: 50,
  },
  {
    id: 'streak-30',
    name: '30-Day Streak',
    description: 'Complete a 30-day streak on any habit',
    icon: '🔥',
    rarity: 'rare',
    category: 'streak',
    xpReward: 150,
  },
  {
    id: 'streak-100',
    name: '100-Day Streak',
    description: 'Complete a 100-day streak on any habit',
    icon: '🔥',
    rarity: 'epic',
    category: 'streak',
    xpReward: 500,
  },
  {
    id: 'streak-365',
    name: '365-Day Streak',
    description: 'Complete a full year streak on any habit',
    icon: '🔥',
    rarity: 'legendary',
    category: 'streak',
    xpReward: 2000,
  },
  {
    id: 'perfect-week',
    name: 'Perfect Week',
    description: 'Complete all habits for 7 consecutive days',
    icon: '✨',
    rarity: 'common',
    category: 'streak',
    xpReward: 75,
  },
  {
    id: 'perfect-month',
    name: 'Perfect Month',
    description: 'Complete all habits for 30 consecutive days',
    icon: '✨',
    rarity: 'rare',
    category: 'streak',
    xpReward: 250,
  },
  {
    id: 'perfect-year',
    name: 'Perfect Year',
    description: 'Complete all habits for 365 consecutive days',
    icon: '✨',
    rarity: 'epic',
    category: 'streak',
    xpReward: 1000,
  },
  {
    id: 'unbreakable',
    name: 'Unbreakable',
    description: 'Achieve a 500+ day streak on any habit',
    icon: '💎',
    rarity: 'legendary',
    category: 'streak',
    xpReward: 3000,
  },

  // Consistency Badges (8)
  {
    id: 'consistency-90',
    name: '90% Consistency',
    description: 'Maintain 90% consistency on a habit',
    icon: '📊',
    rarity: 'common',
    category: 'consistency',
    xpReward: 50,
  },
  {
    id: 'consistency-95',
    name: '95% Consistency',
    description: 'Maintain 95% consistency on a habit',
    icon: '📊',
    rarity: 'rare',
    category: 'consistency',
    xpReward: 150,
  },
  {
    id: 'consistency-99',
    name: '99% Consistency',
    description: 'Maintain 99% consistency on a habit',
    icon: '📊',
    rarity: 'epic',
    category: 'consistency',
    xpReward: 500,
  },
  {
    id: 'flawless',
    name: 'Flawless',
    description: 'Achieve 100% consistency for 30 consecutive days',
    icon: '👑',
    rarity: 'legendary',
    category: 'consistency',
    xpReward: 1500,
  },
  {
    id: 'early-bird',
    name: 'Early Bird',
    description: 'Complete 10 morning habits before 9 AM',
    icon: '🌅',
    rarity: 'common',
    category: 'consistency',
    xpReward: 50,
  },
  {
    id: 'night-owl',
    name: 'Night Owl',
    description: 'Complete 10 evening habits after 6 PM',
    icon: '🌙',
    rarity: 'common',
    category: 'consistency',
    xpReward: 50,
  },
  {
    id: 'all-day-warrior',
    name: 'All-Day Warrior',
    description: 'Complete habits at all times of day (morning, afternoon, evening)',
    icon: '⚔️',
    rarity: 'rare',
    category: 'consistency',
    xpReward: 200,
  },
  {
    id: 'time-master',
    name: 'Time Master',
    description: 'Identify and maintain optimal time pattern for 3+ habits',
    icon: '⏰',
    rarity: 'epic',
    category: 'consistency',
    xpReward: 400,
  },

  // Social Badges (8)
  {
    id: 'first-friend',
    name: 'First Friend',
    description: 'Add your first accountability partner',
    icon: '👥',
    rarity: 'common',
    category: 'social',
    xpReward: 25,
  },
  {
    id: 'squad-leader',
    name: 'Squad Leader',
    description: 'Have 5+ active accountability partners',
    icon: '👑',
    rarity: 'rare',
    category: 'social',
    xpReward: 150,
  },
  {
    id: 'group-founder',
    name: 'Group Founder',
    description: 'Create your first mentor group',
    icon: '🏛️',
    rarity: 'rare',
    category: 'social',
    xpReward: 100,
  },
  {
    id: 'community-champion',
    name: 'Community Champion',
    description: 'Have 10+ members in your mentor group',
    icon: '🏆',
    rarity: 'epic',
    category: 'social',
    xpReward: 300,
  },
  {
    id: 'leaderboard-top-10',
    name: 'Top 10',
    description: 'Reach top 10 on the consistency leaderboard',
    icon: '🥇',
    rarity: 'rare',
    category: 'social',
    xpReward: 200,
  },
  {
    id: 'leaderboard-top-3',
    name: 'Top 3',
    description: 'Reach top 3 on the consistency leaderboard',
    icon: '🥈',
    rarity: 'epic',
    category: 'social',
    xpReward: 400,
  },
  {
    id: 'leaderboard-1',
    name: 'Leaderboard Champion',
    description: 'Reach #1 on the consistency leaderboard',
    icon: '👑',
    rarity: 'legendary',
    category: 'social',
    xpReward: 1000,
  },
  {
    id: 'social-butterfly',
    name: 'Social Butterfly',
    description: 'Join 5+ mentor groups',
    icon: '🦋',
    rarity: 'common',
    category: 'social',
    xpReward: 50,
  },

  // Milestone Badges (8)
  {
    id: 'journal-100',
    name: '100 Entries',
    description: 'Write 100 journal entries',
    icon: '📔',
    rarity: 'common',
    category: 'milestone',
    xpReward: 100,
  },
  {
    id: 'journal-500',
    name: '500 Entries',
    description: 'Write 500 journal entries',
    icon: '📔',
    rarity: 'rare',
    category: 'milestone',
    xpReward: 300,
  },
  {
    id: 'journal-1000',
    name: '1000 Entries',
    description: 'Write 1000 journal entries',
    icon: '📔',
    rarity: 'epic',
    category: 'milestone',
    xpReward: 800,
  },
  {
    id: 'insight-seeker',
    name: 'Insight Seeker',
    description: 'Read 20 AI insights',
    icon: '💡',
    rarity: 'common',
    category: 'milestone',
    xpReward: 50,
  },
  {
    id: 'data-analyst',
    name: 'Data Analyst',
    description: 'View analytics 50 times',
    icon: '📈',
    rarity: 'rare',
    category: 'milestone',
    xpReward: 150,
  },
  {
    id: 'level-10',
    name: 'Level 10',
    description: 'Reach mentor level 10',
    icon: '🎯',
    rarity: 'common',
    category: 'milestone',
    xpReward: 100,
  },
  {
    id: 'level-25',
    name: 'Level 25',
    description: 'Reach mentor level 25',
    icon: '🎯',
    rarity: 'rare',
    category: 'milestone',
    xpReward: 300,
  },
  {
    id: 'level-50',
    name: 'Level 50',
    description: 'Reach mentor level 50 (max level)',
    icon: '👑',
    rarity: 'legendary',
    category: 'milestone',
    xpReward: 2000,
  },

  // Challenge Badges (10)
  {
    id: 'first-challenge',
    name: 'Challenge Starter',
    description: 'Complete your first challenge',
    icon: '🎪',
    rarity: 'common',
    category: 'challenge',
    xpReward: 50,
  },
  {
    id: 'challenge-master',
    name: 'Challenge Master',
    description: 'Complete 10 challenges',
    icon: '🎪',
    rarity: 'rare',
    category: 'challenge',
    xpReward: 250,
  },
  {
    id: 'speed-runner',
    name: 'Speed Runner',
    description: 'Complete a challenge in 1 week',
    icon: '⚡',
    rarity: 'epic',
    category: 'challenge',
    xpReward: 400,
  },
  {
    id: 'consistency-champion',
    name: 'Consistency Champion',
    description: 'Win a consistency challenge',
    icon: '🏆',
    rarity: 'rare',
    category: 'challenge',
    xpReward: 200,
  },
  {
    id: 'habit-stacker',
    name: 'Habit Stacker',
    description: 'Stack 3+ habits for 30 consecutive days',
    icon: '📚',
    rarity: 'epic',
    category: 'challenge',
    xpReward: 500,
  },
  {
    id: 'sleep-warrior',
    name: 'Sleep Warrior',
    description: 'Get 8+ hours of sleep for 30 consecutive days',
    icon: '😴',
    rarity: 'common',
    category: 'challenge',
    xpReward: 100,
  },
  {
    id: 'stress-buster',
    name: 'Stress Buster',
    description: 'Reduce stress level by 30%',
    icon: '🧘',
    rarity: 'rare',
    category: 'challenge',
    xpReward: 200,
  },
  {
    id: 'energy-optimizer',
    name: 'Energy Optimizer',
    description: 'Achieve 90+ energy score',
    icon: '⚡',
    rarity: 'epic',
    category: 'challenge',
    xpReward: 400,
  },
  {
    id: 'health-hero',
    name: 'Health Hero',
    description: 'Sync a wearable device',
    icon: '⌚',
    rarity: 'rare',
    category: 'challenge',
    xpReward: 150,
  },
  {
    id: 'data-collector',
    name: 'Data Collector',
    description: 'Collect 30 days of health data',
    icon: '📊',
    rarity: 'common',
    category: 'challenge',
    xpReward: 100,
  },

  // Gamification Badges (8)
  {
    id: 'first-xp',
    name: 'First Steps',
    description: 'Earn your first XP',
    icon: '✨',
    rarity: 'common',
    category: 'gamification',
    xpReward: 10,
  },
  {
    id: 'xp-1000',
    name: '1000 XP',
    description: 'Accumulate 1000 XP',
    icon: '⭐',
    rarity: 'common',
    category: 'gamification',
    xpReward: 50,
  },
  {
    id: 'xp-10000',
    name: '10000 XP',
    description: 'Accumulate 10000 XP',
    icon: '⭐',
    rarity: 'rare',
    category: 'gamification',
    xpReward: 200,
  },
  {
    id: 'xp-50000',
    name: '50000 XP',
    description: 'Accumulate 50000 XP',
    icon: '⭐',
    rarity: 'epic',
    category: 'gamification',
    xpReward: 800,
  },
  {
    id: 'xp-100000',
    name: '100000 XP',
    description: 'Accumulate 100000 XP',
    icon: '💫',
    rarity: 'legendary',
    category: 'gamification',
    xpReward: 2000,
  },
  {
    id: 'mentor-unlocked',
    name: 'Mentor Unlocked',
    description: 'Unlock a new mentor style',
    icon: '🎓',
    rarity: 'common',
    category: 'gamification',
    xpReward: 50,
  },
  {
    id: 'mastery-achieved',
    name: 'Mastery Achieved',
    description: 'Reach Master tier on any habit',
    icon: '🏅',
    rarity: 'rare',
    category: 'gamification',
    xpReward: 300,
  },
  {
    id: 'legendary-status',
    name: 'Legendary Status',
    description: 'Reach mentor level 50',
    icon: '👑',
    rarity: 'legendary',
    category: 'gamification',
    xpReward: 3000,
  },
];

/**
 * Get badge definition by ID
 */
export function getBadgeDefinition(badgeId: string): BadgeDefinition | undefined {
  return BADGE_DEFINITIONS.find((b) => b.id === badgeId);
}

/**
 * Get all badges by rarity
 */
export function getBadgesByRarity(rarity: 'common' | 'rare' | 'epic' | 'legendary'): BadgeDefinition[] {
  return BADGE_DEFINITIONS.filter((b) => b.rarity === rarity);
}

/**
 * Get all badges by category
 */
export function getBadgesByCategory(category: string): BadgeDefinition[] {
  return BADGE_DEFINITIONS.filter((b) => b.category === category);
}

/**
 * Get total badge count
 */
export function getTotalBadgeCount(): number {
  return BADGE_DEFINITIONS.length;
}
