import { Router, Request, Response } from 'express';
import { getDb } from '../db';

const router = Router();

/**
 * Health Insights Engine
 * Generates AI-powered recommendations based on sleep-habit correlations and stress patterns
 */

interface HealthInsight {
  id: string;
  userId: string;
  insightType: 'sleep_habit_correlation' | 'stress_habit_correlation' | 'energy_score' | 'streak_break_alert' | 'habit_correlation' | 'success_pattern';
  title: string;
  description: string;
  data: Record<string, any>;
  confidence: number;
  actionItems: string[];
  createdAt: Date;
  expiresAt: Date;
}

interface HabitCorrelation {
  habit1: string;
  habit2: string;
  correlationCoefficient: number;
  type: 'positive' | 'negative';
  description: string;
}

interface SuccessPattern {
  habitId: string;
  timeOfDay: string;
  successRate: number;
  sampleSize: number;
}

/**
 * Calculate Pearson correlation coefficient
 */
function calculatePearsonCorrelation(x: number[], y: number[]): number {
  if (x.length !== y.length || x.length === 0) return 0;

  const n = x.length;
  const meanX = x.reduce((a, b) => a + b) / n;
  const meanY = y.reduce((a, b) => a + b) / n;

  let numerator = 0;
  let denominatorX = 0;
  let denominatorY = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    denominatorX += diffX * diffX;
    denominatorY += diffY * diffY;
  }

  const denominator = Math.sqrt(denominatorX * denominatorY);
  return denominator === 0 ? 0 : numerator / denominator;
}

/**
 * Generate sleep-habit correlation insights
 */
function generateSleepHabitCorrelations(
  sleepData: { date: string; quality: number; duration: number }[],
  habitData: { habitName: string; dates: string[] }[]
): HealthInsight[] {
  const insights: HealthInsight[] = [];

  for (const habit of habitData) {
    const sleepQualityByDay = sleepData.map((d) => (habit.dates.includes(d.date) ? d.quality : 0));
    const durationByDay = sleepData.map((d) => (habit.dates.includes(d.date) ? d.duration : 0));

    const qualityCorr = calculatePearsonCorrelation(
      sleepData.map((_, i) => (habit.dates.includes(sleepData[i].date) ? 1 : 0)),
      sleepQualityByDay
    );

    const durationCorr = calculatePearsonCorrelation(
      sleepData.map((_, i) => (habit.dates.includes(sleepData[i].date) ? 1 : 0)),
      durationByDay
    );

    const avgCorr = (qualityCorr + durationCorr) / 2;

    if (Math.abs(avgCorr) > 0.5) {
      const isPositive = avgCorr > 0;
      const impact = Math.abs(avgCorr);
      const duration = isPositive
        ? Math.round(sleepData.reduce((sum, d) => sum + d.duration, 0) / sleepData.length * impact * 60)
        : Math.round(sleepData.reduce((sum, d) => sum + d.duration, 0) / sleepData.length * impact * -30);

      insights.push({
        id: `insight-${Date.now()}-${Math.random()}`,
        userId: '',
        insightType: 'sleep_habit_correlation',
        title: isPositive
          ? `${habit.habitName} improves your sleep`
          : `${habit.habitName} affects your sleep`,
        description: isPositive
          ? `When you do ${habit.habitName}, you sleep ${Math.abs(duration)} minutes ${duration > 0 ? 'more' : 'less'} on average. Keep it up!`
          : `${habit.habitName} correlates with ${Math.abs(duration)} minutes less sleep. Consider adjusting timing.`,
        data: {
          habit: habit.habitName,
          correlationCoefficient: avgCorr,
          qualityImpact: qualityCorr,
          durationImpact: durationCorr,
          estimatedMinutesImpact: duration,
        },
        confidence: Math.min(0.95, 0.5 + impact),
        actionItems: isPositive
          ? [`Continue ${habit.habitName} regularly`, 'Track sleep quality to confirm benefits']
          : [`Try doing ${habit.habitName} earlier in the day`, 'Monitor sleep impact over 2 weeks'],
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });
    }
  }

  return insights;
}

/**
 * Generate stress-habit correlations
 */
function generateStressHabitCorrelations(
  stressData: { date: string; stressScore: number }[],
  habitData: { habitName: string; dates: string[] }[]
): HealthInsight[] {
  const insights: HealthInsight[] = [];

  for (const habit of habitData) {
    const stressOnHabitDays = stressData
      .filter((d) => habit.dates.includes(d.date))
      .map((d) => d.stressScore);
    const stressOnNonHabitDays = stressData
      .filter((d) => !habit.dates.includes(d.date))
      .map((d) => d.stressScore);

    const avgStressWithHabit = stressOnHabitDays.reduce((a, b) => a + b, 0) / stressOnHabitDays.length || 50;
    const avgStressWithoutHabit = stressOnNonHabitDays.reduce((a, b) => a + b, 0) / stressOnNonHabitDays.length || 50;

    const stressReduction = avgStressWithoutHabit - avgStressWithHabit;
    const correlation = Math.abs(stressReduction) > 5 ? (stressReduction > 0 ? 0.7 : -0.7) : 0;

    if (Math.abs(correlation) > 0.5) {
      const isStressReducing = stressReduction > 0;

      insights.push({
        id: `insight-${Date.now()}-${Math.random()}`,
        userId: '',
        insightType: 'stress_habit_correlation',
        title: isStressReducing
          ? `${habit.habitName} reduces your stress`
          : `${habit.habitName} increases your stress`,
        description: isStressReducing
          ? `On days you do ${habit.habitName}, your stress is ${Math.round(stressReduction)} points lower. Great stress management!`
          : `On days you do ${habit.habitName}, your stress is ${Math.round(Math.abs(stressReduction))} points higher. Consider timing or approach.`,
        data: {
          habit: habit.habitName,
          stressReduction,
          avgStressWithHabit: Math.round(avgStressWithHabit),
          avgStressWithoutHabit: Math.round(avgStressWithoutHabit),
        },
        confidence: Math.min(0.95, 0.6 + Math.abs(correlation)),
        actionItems: isStressReducing
          ? [`Schedule ${habit.habitName} during high-stress days`, 'Use as stress relief technique']
          : [`Adjust timing of ${habit.habitName}`, 'Try different approach or environment'],
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }
  }

  return insights;
}

/**
 * Calculate morning energy score
 */
function calculateMorningEnergyScore(
  sleepQuality: number, // 0-100
  hrvScore: number, // 0-100
  morningActivity: number // 0-100
): number {
  const weights = {
    sleep: 0.5,
    hrv: 0.3,
    activity: 0.2,
  };

  const score = sleepQuality * weights.sleep + hrvScore * weights.hrv + morningActivity * weights.activity;
  return Math.round(score);
}

/**
 * Generate predictive streak break alerts
 */
function generateStreakBreakAlerts(
  habitCompletionRate: number, // 0-100
  historicalBreakRate: number, // 0-100
  stressLevel: number, // 0-100
  sleepQuality: number // 0-100
): HealthInsight | null {
  // Calculate streak break probability
  const completionFactor = (100 - habitCompletionRate) / 100;
  const stressFactor = stressLevel / 100 * 0.3;
  const sleepFactor = (100 - sleepQuality) / 100 * 0.2;

  const breakProbability = (completionFactor * 0.5 + stressFactor + sleepFactor) * 100;

  if (breakProbability > 40) {
    return {
      id: `insight-${Date.now()}-${Math.random()}`,
      userId: '',
      insightType: 'streak_break_alert',
      title: `Your streak is at risk`,
      description: `Based on recent patterns, there's a ${Math.round(breakProbability)}% chance you might break your streak. Now's a good time to focus!`,
      data: {
        breakProbability: Math.round(breakProbability),
        completionRate: Math.round(habitCompletionRate),
        stressLevel: Math.round(stressLevel),
        sleepQuality: Math.round(sleepQuality),
      },
      confidence: Math.min(0.95, 0.5 + breakProbability / 100),
      actionItems: [
        'Set a reminder for your habit',
        'Reduce other commitments today',
        'Do a quick 5-minute version if needed',
        'Reach out to accountability partner',
      ],
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    };
  }

  return null;
}

/**
 * POST /api/insights/generate
 * Generate health insights for user
 */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { userId, sleepData, habitData, stressData } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const insights: HealthInsight[] = [];

    // Generate sleep-habit correlations
    if (sleepData && habitData) {
      const sleepCorrelations = generateSleepHabitCorrelations(sleepData, habitData);
      insights.push(...sleepCorrelations);
    }

    // Generate stress-habit correlations
    if (stressData && habitData) {
      const stressCorrelations = generateStressHabitCorrelations(stressData, habitData);
      insights.push(...stressCorrelations);
    }

    // Generate streak break alerts
    if (req.body.habitCompletionRate !== undefined) {
      const alert = generateStreakBreakAlerts(
        req.body.habitCompletionRate,
        req.body.historicalBreakRate || 20,
        req.body.stressLevel || 50,
        req.body.sleepQuality || 70
      );
      if (alert) insights.push(alert);
    }

    res.json({
      success: true,
      insights,
      count: insights.length,
    });
  } catch (error: any) {
    console.error('Generate insights error:', error);
    res.status(500).json({ error: 'Failed to generate insights' });
  }
});

/**
 * GET /api/insights/health
 * Get all health insights for user
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // TODO: Query health_insights table
    const insights: HealthInsight[] = [];

    res.json({ insights });
  } catch (error: any) {
    console.error('Get insights error:', error);
    res.status(500).json({ error: 'Failed to get insights' });
  }
});

/**
 * GET /api/insights/health/:type
 * Get insights by type
 */
router.get('/health/:type', async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const validTypes = [
      'sleep_habit_correlation',
      'stress_habit_correlation',
      'energy_score',
      'streak_break_alert',
      'habit_correlation',
      'success_pattern',
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid insight type' });
    }

    // TODO: Query health_insights table by type
    const insights: HealthInsight[] = [];

    res.json({ insights });
  } catch (error: any) {
    console.error('Get insights by type error:', error);
    res.status(500).json({ error: 'Failed to get insights' });
  }
});

/**
 * GET /api/insights/correlations
 * Get habit correlation matrix
 */
router.get('/correlations', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // TODO: Query habit_correlations table
    const correlations: HabitCorrelation[] = [];

    res.json({ correlations });
  } catch (error: any) {
    console.error('Get correlations error:', error);
    res.status(500).json({ error: 'Failed to get correlations' });
  }
});

/**
 * GET /api/insights/patterns
 * Get success patterns by habit
 */
router.get('/patterns', async (req: Request, res: Response) => {
  try {
    const { userId, habitId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // TODO: Query success_patterns table
    const patterns: any[] = [];

    res.json({ patterns });
  } catch (error: any) {
    console.error('Get patterns error:', error);
    res.status(500).json({ error: 'Failed to get patterns' });
  }
});

/**
 * POST /api/insights/morning-energy
 * Calculate morning energy score
 */
router.post('/morning-energy', async (req: Request, res: Response) => {
  try {
    const { sleepQuality, hrvScore, morningActivity } = req.body;

    if (sleepQuality === undefined || hrvScore === undefined || morningActivity === undefined) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const energyScore = calculateMorningEnergyScore(sleepQuality, hrvScore, morningActivity);

    let recommendation = '';
    if (energyScore >= 80) {
      recommendation = 'You have high energy! Great time for challenging habits.';
    } else if (energyScore >= 60) {
      recommendation = 'Good energy levels. Perfect for your regular routine.';
    } else if (energyScore >= 40) {
      recommendation = 'Moderate energy. Consider lighter habits today.';
    } else {
      recommendation = 'Low energy. Focus on rest and easy wins today.';
    }

    res.json({
      energyScore,
      recommendation,
      breakdown: {
        sleepQuality,
        hrvScore,
        morningActivity,
      },
    });
  } catch (error: any) {
    console.error('Calculate morning energy error:', error);
    res.status(500).json({ error: 'Failed to calculate energy score' });
  }
});

export default router;
