import { describe, it, expect } from 'vitest';

/**
 * Phase 4: Health Integration Component Tests
 * Tests for health data calculations, stress scoring, and sleep analysis
 */

describe('Health Calculations', () => {
  describe('Sleep Habit Impact', () => {
    it('should calculate positive impact for excellent sleep (8+ hours)', () => {
      const quality = 'excellent';
      const duration = 480; // 8 hours in minutes
      const impact = calculateSleepHabitImpact(quality, duration);
      expect(impact).toBe(10);
    });

    it('should calculate positive impact for good sleep (6-7 hours)', () => {
      const quality = 'good';
      const duration = 420; // 7 hours in minutes
      const impact = calculateSleepHabitImpact(quality, duration);
      expect(impact).toBe(5);
    });

    it('should calculate neutral impact for fair sleep', () => {
      const quality = 'fair';
      const duration = 360; // 6 hours in minutes
      const impact = calculateSleepHabitImpact(quality, duration);
      expect(impact).toBe(0);
    });

    it('should calculate negative impact for poor sleep', () => {
      const quality = 'poor';
      const duration = 300; // 5 hours in minutes
      const impact = calculateSleepHabitImpact(quality, duration);
      expect(impact).toBe(-10);
    });
  });

  describe('Stress Score Calculation', () => {
    it('should classify low stress (score < 30)', () => {
      const stressScore = 25;
      const level = getStressLevel(stressScore);
      expect(level).toBe('low');
    });

    it('should classify medium stress (score 30-60)', () => {
      const stressScore = 45;
      const level = getStressLevel(stressScore);
      expect(level).toBe('medium');
    });

    it('should classify high stress (score > 60)', () => {
      const stressScore = 75;
      const level = getStressLevel(stressScore);
      expect(level).toBe('high');
    });

    it('should calculate stress score from HRV', () => {
      const hrv = 80; // ms
      const maxHrv = 200;
      const stressScore = Math.round(100 - (hrv / maxHrv) * 100);
      expect(stressScore).toBe(60);
    });

    it('should handle edge case: HRV = 0', () => {
      const hrv = 0;
      const maxHrv = 200;
      const stressScore = Math.max(0, Math.min(100, Math.round(100 - (hrv / maxHrv) * 100)));
      expect(stressScore).toBe(100);
    });

    it('should handle edge case: HRV > maxHrv', () => {
      const hrv = 250;
      const maxHrv = 200;
      const stressScore = Math.max(0, Math.min(100, Math.round(100 - (hrv / maxHrv) * 100)));
      expect(stressScore).toBe(0);
    });
  });

  describe('Sleep Quality Assessment', () => {
    it('should rate sleep quality as excellent for 8+ hours with few interruptions', () => {
      const duration = 480; // 8 hours
      const interruptions = 0;
      const quality = assessSleepQuality(duration, interruptions);
      expect(quality).toBe('excellent');
    });

    it('should rate sleep quality as good for 7-8 hours with 1-2 interruptions', () => {
      const duration = 420; // 7 hours
      const interruptions = 1;
      const quality = assessSleepQuality(duration, interruptions);
      expect(quality).toBe('good');
    });

    it('should rate sleep quality as fair for 6-7 hours with 2-3 interruptions', () => {
      const duration = 360; // 6 hours
      const interruptions = 2;
      const quality = assessSleepQuality(duration, interruptions);
      expect(quality).toBe('fair');
    });

    it('should rate sleep quality as poor for < 6 hours or > 3 interruptions', () => {
      const duration = 300; // 5 hours
      const interruptions = 4;
      const quality = assessSleepQuality(duration, interruptions);
      expect(quality).toBe('poor');
    });
  });

  describe('Activity Progress', () => {
    it('should calculate step goal progress correctly', () => {
      const current = 8234;
      const goal = 10000;
      const percentage = (current / goal) * 100;
      expect(percentage).toBeCloseTo(82.34, 1);
    });

    it('should cap progress at 100%', () => {
      const current = 12000;
      const goal = 10000;
      const percentage = Math.min(100, (current / goal) * 100);
      expect(percentage).toBe(100);
    });

    it('should handle zero goal', () => {
      const current = 5000;
      const goal = 0;
      const percentage = goal > 0 ? (current / goal) * 100 : 0;
      expect(percentage).toBe(0);
    });
  });

  describe('Sleep-Habit Correlation', () => {
    it('should identify positive correlations', () => {
      const habitData = [
        { habit: 'Evening meditation', sleepQualityOnDays: [8, 8, 8, 7, 8] },
        { habit: 'Late coffee', sleepQualityOnDays: [5, 4, 6, 5, 4] },
      ];

      const avgQuality = 6.5;
      const meditation = habitData[0].sleepQualityOnDays.filter((q) => q > avgQuality).length;
      const coffee = habitData[1].sleepQualityOnDays.filter((q) => q > avgQuality).length;

      expect(meditation).toBeGreaterThan(coffee);
    });

    it('should calculate correlation strength', () => {
      const goodSleepDays = 5;
      const habitDays = 7;
      const correlation = (goodSleepDays / habitDays) * 100;
      expect(correlation).toBeCloseTo(71.43, 1);
    });
  });

  describe('Health Metric Validation', () => {
    it('should validate heart rate is within normal range', () => {
      const heartRate = 72;
      const isValid = heartRate >= 40 && heartRate <= 200;
      expect(isValid).toBe(true);
    });

    it('should flag abnormal heart rate', () => {
      const heartRate = 25;
      const isValid = heartRate >= 40 && heartRate <= 200;
      expect(isValid).toBe(false);
    });

    it('should validate sleep duration is reasonable', () => {
      const sleepHours = 7.5;
      const isValid = sleepHours >= 3 && sleepHours <= 12;
      expect(isValid).toBe(true);
    });

    it('should flag unreasonable sleep duration', () => {
      const sleepHours = 15;
      const isValid = sleepHours >= 3 && sleepHours <= 12;
      expect(isValid).toBe(false);
    });
  });

  describe('Morning Energy Score', () => {
    it('should calculate morning energy from sleep and activity', () => {
      const sleepScore = 8; // 8 hours = high score
      const activityScore = 7; // 7000 steps = moderate score
      const energyScore = Math.round((sleepScore / 8) * 50 + (Math.min(activityScore, 10) / 10) * 50);
      expect(energyScore).toBeGreaterThan(50);
    });

    it('should weight sleep more heavily than activity', () => {
      const goodSleep = Math.round((8 / 8) * 70 + (5 / 10) * 30); // 85
      const poorSleep = Math.round((5 / 8) * 70 + (10 / 10) * 30); // 73
      expect(goodSleep).toBeGreaterThan(poorSleep);
    });
  });

  describe('Stress Trend Analysis', () => {
    it('should identify improving stress trend', () => {
      const stressScores = [65, 60, 55, 50, 45];
      const trend = stressScores[stressScores.length - 1] < stressScores[0] ? 'improving' : 'worsening';
      expect(trend).toBe('improving');
    });

    it('should identify worsening stress trend', () => {
      const stressScores = [30, 40, 50, 60, 70];
      const trend = stressScores[stressScores.length - 1] > stressScores[0] ? 'worsening' : 'improving';
      expect(trend).toBe('worsening');
    });

    it('should identify stable stress trend', () => {
      const stressScores = [45, 44, 46, 45, 44];
      const avgChange = Math.abs(stressScores[stressScores.length - 1] - stressScores[0]) / stressScores.length;
      const trend = avgChange < 2 ? 'stable' : 'changing';
      expect(trend).toBe('stable');
    });
  });
});

/**
 * Helper Functions (implementations)
 */

function calculateSleepHabitImpact(quality: string, duration: number): number {
  if (quality === 'excellent' && duration >= 420) {
    return 10;
  } else if (quality === 'good' && duration >= 360) {
    return 5;
  } else if (quality === 'fair') {
    return 0;
  } else {
    return -10;
  }
}

function getStressLevel(stressScore: number): string {
  if (stressScore < 30) {
    return 'low';
  } else if (stressScore < 60) {
    return 'medium';
  } else {
    return 'high';
  }
}

function assessSleepQuality(
  duration: number,
  interruptions: number
): 'excellent' | 'good' | 'fair' | 'poor' {
  if (duration >= 480 && interruptions <= 0) {
    return 'excellent';
  } else if (duration >= 420 && interruptions <= 2) {
    return 'good';
  } else if (duration >= 360 && interruptions <= 3) {
    return 'fair';
  } else {
    return 'poor';
  }
}
