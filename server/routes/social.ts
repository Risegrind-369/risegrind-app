import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { accountabilityPartners, mentorGroups, groupMembers, leaderboardEntries, sharedInsights, communityChallenges, challengeParticipants, userProfiles } from '../../drizzle/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

const router = Router();

/**
 * ACCOUNTABILITY PARTNER MATCHING
 */

// Find matching partners based on goals and habits
router.post('/partners/find-matches', async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    // Get user's profile and goals
    const userProfile = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
    
    if (!userProfile.length) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const userGoals = userProfile[0].mainGoals ? JSON.parse(userProfile[0].mainGoals) : [];

    // Find other users with similar goals
    const potentialMatches = await db.select().from(userProfiles).where(
      sql`JSON_CONTAINS(${userProfiles.mainGoals}, JSON_ARRAY(${userGoals[0]}))`
    );

    // Calculate match scores
    const matches = potentialMatches.map((profile: any) => {
      const profileGoals = profile.mainGoals ? JSON.parse(profile.mainGoals) : [];
      const commonGoals = userGoals.filter((g: string) => profileGoals.includes(g));
      const matchScore = Math.round((commonGoals.length / Math.max(userGoals.length, profileGoals.length)) * 100);
      
      return {
        userId: profile.userId,
        matchScore,
        commonGoals,
        motivationStyle: profile.motivationStyle
      };
    }).filter((m: any) => m.userId !== userId).sort((a: any, b: any) => b.matchScore - a.matchScore);

    res.json(matches.slice(0, 10)); // Return top 10 matches
  } catch (error) {
    console.error('Error finding matches:', error);
    res.status(500).json({ error: 'Failed to find matches' });
  }
});

// Send partnership request
router.post('/partners/request', async (req: Request, res: Response) => {
  try {
    const { userId, partnerId, commonGoals } = req.body;
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    const partnership = await db.insert(accountabilityPartners).values({
      userId,
      partnerId,
      status: 'pending',
      matchScore: 75, // TODO: Calculate from match algorithm
      commonGoals: JSON.stringify(commonGoals)
    });

    res.json({ success: true, partnershipId: partnership[0] });
  } catch (error) {
    console.error('Error creating partnership:', error);
    res.status(500).json({ error: 'Failed to create partnership' });
  }
});

// Accept partnership request
router.post('/partners/:id/accept', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    await db.update(accountabilityPartners).set({ status: 'accepted', startDate: new Date() }).where(eq(accountabilityPartners.id, parseInt(id)));

    res.json({ success: true });
  } catch (error) {
    console.error('Error accepting partnership:', error);
    res.status(500).json({ error: 'Failed to accept partnership' });
  }
});

// Get user's accountability partners
router.get('/partners/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    const partners = await db.select().from(accountabilityPartners).where(
      and(
        eq(accountabilityPartners.userId, parseInt(userId)),
        eq(accountabilityPartners.status, 'accepted')
      )
    );

    res.json(partners);
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({ error: 'Failed to fetch partners' });
  }
});

/**
 * MENTOR GROUPS
 */

// Create a new mentor group
router.post('/groups/create', async (req: Request, res: Response) => {
  try {
    const { name, description, creatorId, habitFocus, visibility } = req.body;
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    const group = await db.insert(mentorGroups).values({
      name,
      description,
      creatorId,
      habitFocus,
      visibility: visibility || 'public',
      memberCount: 1
    });

    // Add creator as admin
    const groupId = (group as any).insertId || group[0];
    await db.insert(groupMembers).values({
      groupId: groupId,
      userId: creatorId,
      role: 'admin'
    });

    res.json({ success: true, groupId: group[0] });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Failed to create group' });
  }
});

// Get public groups
router.get('/groups/public', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });
    const groups = await db.select().from(mentorGroups).where(eq(mentorGroups.visibility, 'public')).limit(20);
    res.json(groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Failed to fetch groups' });
  }
});

// Join a group
router.post('/groups/:groupId/join', async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.body;
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    await db.insert(groupMembers).values({
      groupId: parseInt(groupId),
      userId,
      role: 'member'
    });

    // Increment member count
    await db.update(mentorGroups).set({
      memberCount: sql`memberCount + 1`
    }).where(eq(mentorGroups.id, parseInt(groupId)));

    res.json({ success: true });
  } catch (error) {
    console.error('Error joining group:', error);
    res.status(500).json({ error: 'Failed to join group' });
  }
});

/**
 * LEADERBOARDS
 */

// Get group leaderboard (consistency-based)
router.get('/leaderboard/group/:groupId', async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    const leaderboard = await db.select().from(leaderboardEntries)
      .where(eq(leaderboardEntries.groupId, parseInt(groupId)))
      .orderBy(desc(leaderboardEntries.consistencyScore))
      .limit(100);

    res.json(leaderboard);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Update leaderboard entry
router.post('/leaderboard/update', async (req: Request, res: Response) => {
  try {
    const { userId, groupId, completedHabits, totalHabits, currentStreak, longestStreak } = req.body;
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    const consistencyScore = totalHabits > 0 ? Math.round((completedHabits / totalHabits) * 100) : 0;

    const existing = await db.select().from(leaderboardEntries).where(
      and(
        eq(leaderboardEntries.userId, userId),
        eq(leaderboardEntries.groupId, groupId)
      )
    );

    if (existing.length > 0) {
      await db.update(leaderboardEntries).set({
        consistencyScore,
        currentStreak,
        longestStreak,
        completedHabits,
        totalHabits
      }).where(eq(leaderboardEntries.id, existing[0].id));
    } else {
      await db.insert(leaderboardEntries).values({
        userId,
        groupId,
        consistencyScore,
        currentStreak,
        longestStreak,
        completedHabits,
        totalHabits
      });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating leaderboard:', error);
    res.status(500).json({ error: 'Failed to update leaderboard' });
  }
});

/**
 * SHARED INSIGHTS
 */

// Post a shared insight
router.post('/insights/share', async (req: Request, res: Response) => {
  try {
    const { userId, groupId, insight, habitId, visibility } = req.body;
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    const result = await db.insert(sharedInsights).values({
      userId,
      groupId,
      insight,
      habitId,
      visibility: visibility || 'group'
    });

    res.json({ success: true, insightId: result[0] });
  } catch (error) {
    console.error('Error sharing insight:', error);
    res.status(500).json({ error: 'Failed to share insight' });
  }
});

// Get group insights
router.get('/insights/group/:groupId', async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    const insights = await db.select().from(sharedInsights)
      .where(eq(sharedInsights.groupId, parseInt(groupId)))
      .orderBy(desc(sharedInsights.likes))
      .limit(50);

    res.json(insights);
  } catch (error) {
    console.error('Error fetching insights:', error);
    res.status(500).json({ error: 'Failed to fetch insights' });
  }
});

// Like an insight
router.post('/insights/:id/like', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    await db.update(sharedInsights).set({
      likes: sql`likes + 1`
    }).where(eq(sharedInsights.id, parseInt(id)));

    res.json({ success: true });
  } catch (error) {
    console.error('Error liking insight:', error);
    res.status(500).json({ error: 'Failed to like insight' });
  }
});

/**
 * COMMUNITY CHALLENGES
 */

// Create a community challenge
router.post('/challenges/create', async (req: Request, res: Response) => {
  try {
    const { name, description, groupId, habitId, duration, startDate, reward } = req.body;
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);

    const challenge = await db.insert(communityChallenges).values({
      name,
      description,
      groupId,
      habitId,
      duration,
      startDate: new Date(startDate),
      endDate,
      reward
    });

    res.json({ success: true, challengeId: challenge[0] });
  } catch (error) {
    console.error('Error creating challenge:', error);
    res.status(500).json({ error: 'Failed to create challenge' });
  }
});

// Get active challenges for group
router.get('/challenges/group/:groupId/active', async (req: Request, res: Response) => {
  try {
    const { groupId } = req.params;
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });
    const today = new Date();

    const challenges = await db.select().from(communityChallenges).where(
      and(
        eq(communityChallenges.groupId, parseInt(groupId)),
        sql`endDate >= ${today}`
      )
    );

    res.json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Failed to fetch challenges' });
  }
});

// Join a challenge
router.post('/challenges/:challengeId/join', async (req: Request, res: Response) => {
  try {
    const { challengeId } = req.params;
    const { userId } = req.body;
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    await db.insert(challengeParticipants).values({
      challengeId: parseInt(challengeId),
      userId,
      status: 'active'
    });

    // Increment participant count
    await db.update(communityChallenges).set({
      participantCount: sql`participantCount + 1`
    }).where(eq(communityChallenges.id, parseInt(challengeId)));

    res.json({ success: true });
  } catch (error) {
    console.error('Error joining challenge:', error);
    res.status(500).json({ error: 'Failed to join challenge' });
  }
});

// Update challenge progress
router.post('/challenges/:challengeId/progress', async (req: Request, res: Response) => {
  try {
    const { challengeId } = req.params;
    const { userId, completionRate } = req.body;
    const db = await getDb();
    if (!db) return res.status(500).json({ error: 'Database not available' });

    const existing = await db.select().from(challengeParticipants).where(
      and(
        eq(challengeParticipants.challengeId, parseInt(challengeId)),
        eq(challengeParticipants.userId, userId)
      )
    );

    if (existing.length > 0) {
      await db.update(challengeParticipants).set({
        completionRate,
        status: completionRate === 100 ? 'completed' : 'active'
      }).where(eq(challengeParticipants.id, existing[0].id));
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating progress:', error);
    res.status(500).json({ error: 'Failed to update progress' });
  }
});

export default router;
