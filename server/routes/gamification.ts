import { Router, Request, Response } from 'express';
import { getDb } from '../db';

const router = Router();

/**
 * Gamification Routes
 * Mentor levels, habit mastery tiers, achievement badges
 */

interface MentorLevel {
  userId: string;
  currentLevel: number;
  totalXp: number;
  xpToNextLevel: number;
  mentorStyle: string;
  unlockedStyles: string[];
}

interface HabitMastery {
  habitId: string;
  habitName: string;
  tier: 'beginner' | 'consistent' | 'automatic' | 'master';
  streakDays: number;
  consistencyRate: number;
  totalCompletions: number;
  tierUnlockedAt: Date;
}

interface AchievementBadge {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: string;
  unlockedAt: Date;
}

/**
 * Calculate XP required for a specific level
 */
function calculateXpRequiredForLevel(level: number): number {
  return 100 * (level - 1) + 50 * Math.pow(level - 1, 2);
}

/**
 * Calculate current level from total XP
 */
function calculateLevelFromXp(totalXp: number): { level: number; xpToNextLevel: number } {
  let level = 1;
  let xpAccumulated = 0;

  for (let i = 1; i <= 50; i++) {
    const xpRequired = calculateXpRequiredForLevel(i);
    if (xpAccumulated + xpRequired > totalXp) {
      level = i;
      const xpToNext = xpAccumulated + xpRequired - totalXp;
      return { level, xpToNextLevel: xpToNext };
    }
    xpAccumulated += xpRequired;
  }

  return { level: 50, xpToNextLevel: 0 };
}

/**
 * Get unlocked mentor styles for a level
 */
function getUnlockedMentorStyles(level: number): string[] {
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
}

/**
 * Calculate habit mastery tier
 */
function calculateHabitMasteryTier(
  streakDays: number,
  consistencyRate: number,
  totalCompletions: number
): 'beginner' | 'consistent' | 'automatic' | 'master' {
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
}

/**
 * Get XP reward multiplier based on habit mastery tier
 */
function getXpMultiplier(tier: string): number {
  const multipliers: Record<string, number> = {
    beginner: 1.0,
    consistent: 1.1,
    automatic: 1.2,
    master: 1.5,
  };
  return multipliers[tier] || 1.0;
}

/**
 * XP Reward Sources
 */
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

/**
 * GET /api/gamification/mentor/level
 * Get current mentor level and XP
 */
router.get('/mentor/level', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // TODO: Query mentor_levels table
    // For now, return mock data
    const totalXp = 5500;
    const { level, xpToNextLevel } = calculateLevelFromXp(totalXp);
    const unlockedStyles = getUnlockedMentorStyles(level);

    const mentorLevel: MentorLevel = {
      userId: userId as string,
      currentLevel: level,
      totalXp,
      xpToNextLevel,
      mentorStyle: 'Strict Mentor',
      unlockedStyles,
    };

    res.json(mentorLevel);
  } catch (error: any) {
    console.error('Get mentor level error:', error);
    res.status(500).json({ error: 'Failed to get mentor level' });
  }
});

/**
 * POST /api/gamification/mentor/add-xp
 * Add XP to user
 */
router.post('/mentor/add-xp', async (req: Request, res: Response) => {
  try {
    const { userId, amount, reason, sourceId } = req.body;

    if (!userId || !amount || !reason) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // TODO: Insert into xp_transactions table
    // TODO: Update mentor_levels table
    // TODO: Check for level up
    // TODO: Check for mentor style unlock

    const newTotalXp = 5500 + amount;
    const { level, xpToNextLevel } = calculateLevelFromXp(newTotalXp);
    const unlockedStyles = getUnlockedMentorStyles(level);

    res.json({
      success: true,
      xpAdded: amount,
      newTotalXp,
      newLevel: level,
      xpToNextLevel,
      leveledUp: level > 5, // Mock level up check
      newUnlockedStyle: level === 5 ? 'Supportive Mentor' : null,
      unlockedStyles,
    });
  } catch (error: any) {
    console.error('Add XP error:', error);
    res.status(500).json({ error: 'Failed to add XP' });
  }
});

/**
 * GET /api/gamification/mentor/styles
 * Get unlocked mentor styles
 */
router.get('/mentor/styles', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // TODO: Query mentor_levels table
    const level = 5;
    const unlockedStyles = getUnlockedMentorStyles(level);

    res.json({ unlockedStyles });
  } catch (error: any) {
    console.error('Get mentor styles error:', error);
    res.status(500).json({ error: 'Failed to get mentor styles' });
  }
});

/**
 * POST /api/gamification/mentor/set-style
 * Set active mentor style
 */
router.post('/mentor/set-style', async (req: Request, res: Response) => {
  try {
    const { userId, style } = req.body;

    if (!userId || !style) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // TODO: Update mentor_levels table

    res.json({
      success: true,
      activeMentorStyle: style,
    });
  } catch (error: any) {
    console.error('Set mentor style error:', error);
    res.status(500).json({ error: 'Failed to set mentor style' });
  }
});

/**
 * GET /api/gamification/mastery/:habitId
 * Get habit mastery tier
 */
router.get('/mastery/:habitId', async (req: Request, res: Response) => {
  try {
    const { habitId } = req.params;
    const { userId } = req.query;

    if (!userId || !habitId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // TODO: Query habit_mastery table
    // Mock data
    const mastery: HabitMastery = {
      habitId,
      habitName: 'Morning Run',
      tier: 'consistent',
      streakDays: 15,
      consistencyRate: 0.75,
      totalCompletions: 25,
      tierUnlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    };

    res.json(mastery);
  } catch (error: any) {
    console.error('Get habit mastery error:', error);
    res.status(500).json({ error: 'Failed to get habit mastery' });
  }
});

/**
 * GET /api/gamification/mastery/all
 * Get all habit mastery tiers
 */
router.get('/mastery/all', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // TODO: Query habit_mastery table
    const masteries: HabitMastery[] = [
      {
        habitId: 'habit-1',
        habitName: 'Morning Run',
        tier: 'consistent',
        streakDays: 15,
        consistencyRate: 0.75,
        totalCompletions: 25,
        tierUnlockedAt: new Date(),
      },
      {
        habitId: 'habit-2',
        habitName: 'Meditation',
        tier: 'beginner',
        streakDays: 3,
        consistencyRate: 0.5,
        totalCompletions: 5,
        tierUnlockedAt: new Date(),
      },
    ];

    res.json({ masteries });
  } catch (error: any) {
    console.error('Get all habit masteries error:', error);
    res.status(500).json({ error: 'Failed to get habit masteries' });
  }
});

/**
 * GET /api/gamification/badges
 * Get user's unlocked badges
 */
router.get('/badges', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // TODO: Query achievement_badges table
    const badges: AchievementBadge[] = [
      {
        id: 'badge-1',
        name: '7-Day Streak',
        description: 'Completed a 7-day streak',
        icon: '🔥',
        rarity: 'common',
        category: 'streak',
        unlockedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'badge-2',
        name: 'First Friend',
        description: 'Added your first accountability partner',
        icon: '👥',
        rarity: 'common',
        category: 'social',
        unlockedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      },
    ];

    res.json({ badges, count: badges.length });
  } catch (error: any) {
    console.error('Get badges error:', error);
    res.status(500).json({ error: 'Failed to get badges' });
  }
});

/**
 * GET /api/gamification/badges/available
 * Get available badges to unlock
 */
router.get('/badges/available', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // TODO: Calculate available badges based on user progress
    const availableBadges = [
      {
        id: 'badge-3',
        name: '30-Day Streak',
        description: 'Complete a 30-day streak',
        icon: '🔥',
        rarity: 'rare',
        category: 'streak',
        progress: 15,
        total: 30,
      },
      {
        id: 'badge-4',
        name: 'Squad Leader',
        description: 'Have 5+ accountability partners',
        icon: '👑',
        rarity: 'rare',
        category: 'social',
        progress: 2,
        total: 5,
      },
    ];

    res.json({ availableBadges });
  } catch (error: any) {
    console.error('Get available badges error:', error);
    res.status(500).json({ error: 'Failed to get available badges' });
  }
});

/**
 * POST /api/gamification/badges/check-unlock
 * Check if badge should unlock
 */
router.post('/badges/check-unlock', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // TODO: Check all badge unlock conditions
    // TODO: Insert newly unlocked badges into achievement_badges table
    const newlyUnlockedBadges: AchievementBadge[] = [];

    res.json({
      success: true,
      newlyUnlockedBadges,
      count: newlyUnlockedBadges.length,
    });
  } catch (error: any) {
    console.error('Check badge unlock error:', error);
    res.status(500).json({ error: 'Failed to check badge unlock' });
  }
});

/**
 * GET /api/gamification/dashboard
 * Get gamification summary
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // TODO: Aggregate data from all gamification tables
    const dashboard = {
      mentorLevel: {
        currentLevel: 5,
        totalXp: 5500,
        xpToNextLevel: 600,
        mentorStyle: 'Strict Mentor',
      },
      badges: {
        total: 2,
        common: 2,
        rare: 0,
        epic: 0,
        legendary: 0,
      },
      masteryTiers: {
        beginner: 1,
        consistent: 1,
        automatic: 0,
        master: 0,
      },
      recentXpTransactions: [
        { reason: 'Habit Completion', amount: 10, timestamp: new Date() },
        { reason: 'Habit Completion', amount: 10, timestamp: new Date(Date.now() - 3600000) },
      ],
    };

    res.json(dashboard);
  } catch (error: any) {
    console.error('Get gamification dashboard error:', error);
    res.status(500).json({ error: 'Failed to get gamification dashboard' });
  }
});

/**
 * GET /api/gamification/leaderboard/levels
 * Get level leaderboard
 */
router.get('/leaderboard/levels', async (req: Request, res: Response) => {
  try {
    // TODO: Query mentor_levels table, order by level DESC, then totalXp DESC
    const leaderboard = [
      { rank: 1, userId: 'user-1', name: 'Alex', level: 25, totalXp: 15000 },
      { rank: 2, userId: 'user-2', name: 'Jordan', level: 22, totalXp: 12500 },
      { rank: 3, userId: 'user-3', name: 'Casey', level: 20, totalXp: 11000 },
    ];

    res.json({ leaderboard });
  } catch (error: any) {
    console.error('Get level leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get level leaderboard' });
  }
});

/**
 * GET /api/gamification/leaderboard/badges
 * Get badge count leaderboard
 */
router.get('/leaderboard/badges', async (req: Request, res: Response) => {
  try {
    // TODO: Query achievement_badges table, count by user_id
    const leaderboard = [
      { rank: 1, userId: 'user-1', name: 'Alex', badgeCount: 15 },
      { rank: 2, userId: 'user-2', name: 'Jordan', badgeCount: 12 },
      { rank: 3, userId: 'user-3', name: 'Casey', badgeCount: 10 },
    ];

    res.json({ leaderboard });
  } catch (error: any) {
    console.error('Get badge leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get badge leaderboard' });
  }
});

export function registerGamificationRoutes(app: any) {
  app.use('/api/gamification', router);
}

export default router;
