import { Router, Request, Response } from 'express';
import { getDb } from '../db';

const router = Router();

/**
 * Advanced Analytics Routes
 * Predictive streak break alerts, habit correlations, success patterns
 */

interface StreakBreakRisk {
  habitId: string;
  habitName: string;
  riskScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high';
  factors: {
    recentCompletionRate: number;
    stressLevel: number;
    sleepQuality: number;
    historicalBreakPattern: number;
  };
  recommendations: string[];
}

interface HabitCorrelationMatrix {
  habit1: string;
  habit2: string;
  correlation: number; // -1 to 1
  sampleSize: number;
  type: 'positive' | 'negative' | 'neutral';
  description: string;
}

interface SuccessPatternAnalysis {
  habitId: string;
  habitName: string;
  optimalTimeOfDay: string;
  successRateByTime: Record<string, number>;
  optimalEnvironment?: string;
  optimalSequence?: string[];
  overallSuccessRate: number;
}

/**
 * Calculate streak break risk using weighted factors
 */
function calculateStreakBreakRisk(
  recentCompletionRate: number, // 0-100
  stressLevel: number, // 0-100
  sleepQuality: number, // 0-100
  historicalBreakPattern: number // 0-100
): { riskScore: number; riskLevel: 'low' | 'medium' | 'high' } {
  const weights = {
    completionRate: 0.4,
    stress: 0.25,
    sleep: 0.2,
    historicalPattern: 0.15,
  };

  // Invert completion rate (lower completion = higher risk)
  const completionRisk = (100 - recentCompletionRate) / 100;
  const stressRisk = stressLevel / 100;
  const sleepRisk = (100 - sleepQuality) / 100;
  const historicalRisk = historicalBreakPattern / 100;

  const riskScore = Math.round(
    completionRisk * weights.completionRate * 100 +
    stressRisk * weights.stress * 100 +
    sleepRisk * weights.sleep * 100 +
    historicalRisk * weights.historicalPattern * 100
  );

  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (riskScore > 60) riskLevel = 'high';
  else if (riskScore > 35) riskLevel = 'medium';

  return { riskScore, riskLevel };
}

/**
 * Generate streak break recommendations
 */
function generateStreakBreakRecommendations(
  riskScore: number,
  recentCompletionRate: number,
  stressLevel: number,
  sleepQuality: number
): string[] {
  const recommendations: string[] = [];

  if (recentCompletionRate < 70) {
    recommendations.push('Set a daily reminder for this habit');
    recommendations.push('Try a shorter version of the habit');
  }

  if (stressLevel > 70) {
    recommendations.push('Reduce other commitments today');
    recommendations.push('Practice stress-relief techniques before the habit');
  }

  if (sleepQuality < 60) {
    recommendations.push('Prioritize sleep tonight');
    recommendations.push('Do the habit at a time when you have more energy');
  }

  if (riskScore > 60) {
    recommendations.push('Reach out to your accountability partner');
    recommendations.push('Review why you started this habit');
  }

  return recommendations.slice(0, 3);
}

/**
 * Analyze habit correlations using Pearson correlation
 */
function analyzeHabitCorrelations(
  habit1Completions: number[],
  habit2Completions: number[]
): { correlation: number; type: 'positive' | 'negative' | 'neutral' } {
  if (habit1Completions.length !== habit2Completions.length || habit1Completions.length < 7) {
    return { correlation: 0, type: 'neutral' };
  }

  const n = habit1Completions.length;
  const mean1 = habit1Completions.reduce((a, b) => a + b) / n;
  const mean2 = habit2Completions.reduce((a, b) => a + b) / n;

  let numerator = 0;
  let denominator1 = 0;
  let denominator2 = 0;

  for (let i = 0; i < n; i++) {
    const diff1 = habit1Completions[i] - mean1;
    const diff2 = habit2Completions[i] - mean2;
    numerator += diff1 * diff2;
    denominator1 += diff1 * diff1;
    denominator2 += diff2 * diff2;
  }

  const denominator = Math.sqrt(denominator1 * denominator2);
  const correlation = denominator === 0 ? 0 : numerator / denominator;

  let type: 'positive' | 'negative' | 'neutral' = 'neutral';
  if (correlation > 0.5) type = 'positive';
  else if (correlation < -0.5) type = 'negative';

  return { correlation, type };
}

/**
 * Identify optimal time of day for habit
 */
function identifyOptimalTimeOfDay(
  successByTime: Record<string, number>
): { optimalTime: string; successRate: number } {
  let maxSuccess = 0;
  let optimalTime = 'morning';

  for (const [time, success] of Object.entries(successByTime)) {
    if (success > maxSuccess) {
      maxSuccess = success;
      optimalTime = time;
    }
  }

  return { optimalTime, successRate: maxSuccess };
}

/**
 * POST /api/analytics/streak-break-risk
 * Calculate streak break probability for all habits
 */
router.post('/streak-break-risk', async (req: Request, res: Response) => {
  try {
    const {
      userId,
      habits,
      recentCompletionRates,
      stressLevel,
      sleepQuality,
      historicalBreakPatterns,
    } = req.body;

    if (!userId || !habits || !recentCompletionRates) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const risks: StreakBreakRisk[] = habits.map((habit: any, index: number) => {
      const { riskScore, riskLevel } = calculateStreakBreakRisk(
        recentCompletionRates[index] || 50,
        stressLevel || 50,
        sleepQuality || 70,
        historicalBreakPatterns?.[index] || 20
      );

      const recommendations = generateStreakBreakRecommendations(
        riskScore,
        recentCompletionRates[index] || 50,
        stressLevel || 50,
        sleepQuality || 70
      );

      return {
        habitId: habit.id,
        habitName: habit.name,
        riskScore,
        riskLevel,
        factors: {
          recentCompletionRate: recentCompletionRates[index] || 50,
          stressLevel: stressLevel || 50,
          sleepQuality: sleepQuality || 70,
          historicalBreakPattern: historicalBreakPatterns?.[index] || 20,
        },
        recommendations,
      };
    });

    const highRiskHabits = risks.filter((r) => r.riskLevel === 'high');

    res.json({
      success: true,
      risks,
      highRiskCount: highRiskHabits.length,
      averageRiskScore: Math.round(risks.reduce((sum, r) => sum + r.riskScore, 0) / risks.length),
    });
  } catch (error: any) {
    console.error('Calculate streak break risk error:', error);
    res.status(500).json({ error: 'Failed to calculate streak break risk' });
  }
});

/**
 * POST /api/analytics/habit-correlations
 * Analyze correlations between habits
 */
router.post('/habit-correlations', async (req: Request, res: Response) => {
  try {
    const { userId, habits, completionData } = req.body;

    if (!userId || !habits || !completionData) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const correlations: HabitCorrelationMatrix[] = [];

    // Analyze all pairs of habits
    for (let i = 0; i < habits.length; i++) {
      for (let j = i + 1; j < habits.length; j++) {
        const habit1 = habits[i];
        const habit2 = habits[j];

        const completions1 = completionData[habit1.id] || [];
        const completions2 = completionData[habit2.id] || [];

        const { correlation, type } = analyzeHabitCorrelations(completions1, completions2);

        if (Math.abs(correlation) > 0.3) {
          let description = '';
          if (type === 'positive') {
            description = `${habit1.name} and ${habit2.name} tend to happen together. Consider stacking them!`;
          } else if (type === 'negative') {
            description = `${habit1.name} and ${habit2.name} conflict. Try doing them at different times.`;
          }

          correlations.push({
            habit1: habit1.name,
            habit2: habit2.name,
            correlation,
            sampleSize: Math.min(completions1.length, completions2.length),
            type,
            description,
          });
        }
      }
    }

    // Sort by correlation strength
    correlations.sort((a, b) => Math.abs(b.correlation) - Math.abs(a.correlation));

    res.json({
      success: true,
      correlations,
      positiveCorrelations: correlations.filter((c) => c.type === 'positive'),
      negativeCorrelations: correlations.filter((c) => c.type === 'negative'),
    });
  } catch (error: any) {
    console.error('Analyze habit correlations error:', error);
    res.status(500).json({ error: 'Failed to analyze habit correlations' });
  }
});

/**
 * POST /api/analytics/success-patterns
 * Identify success patterns for habits
 */
router.post('/success-patterns', async (req: Request, res: Response) => {
  try {
    const { userId, habits, successByTimeOfDay, successByEnvironment } = req.body;

    if (!userId || !habits) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const patterns: SuccessPatternAnalysis[] = habits.map((habit: any) => {
      const timeData = successByTimeOfDay?.[habit.id] || {};
      const { optimalTime, successRate } = identifyOptimalTimeOfDay(timeData);

      const overallSuccessRate =
        Object.values(timeData).reduce((sum: number, rate: any) => sum + rate, 0) /
        Object.keys(timeData).length || 0;

      return {
        habitId: habit.id,
        habitName: habit.name,
        optimalTimeOfDay: optimalTime,
        successRateByTime: timeData,
        optimalEnvironment: successByEnvironment?.[habit.id]?.optimal || 'home',
        overallSuccessRate: Math.round(overallSuccessRate),
      };
    });

    res.json({
      success: true,
      patterns,
      topPatterns: patterns.sort((a, b) => b.overallSuccessRate - a.overallSuccessRate).slice(0, 3),
    });
  } catch (error: any) {
    console.error('Analyze success patterns error:', error);
    res.status(500).json({ error: 'Failed to analyze success patterns' });
  }
});

/**
 * GET /api/analytics/dashboard
 * Get comprehensive analytics dashboard data
 */
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // TODO: Aggregate data from all analytics endpoints
    const dashboard = {
      streakBreakRisks: [],
      habitCorrelations: [],
      successPatterns: [],
      recommendations: [],
    };

    res.json(dashboard);
  } catch (error: any) {
    console.error('Get analytics dashboard error:', error);
    res.status(500).json({ error: 'Failed to get analytics dashboard' });
  }
});

export default router;
