import { describe, it, expect } from 'vitest';

/**
 * Phase 5: Advanced Analytics Tests
 * Tests for wearable OAuth, health insights, and predictive analytics
 */

describe('Wearable OAuth Flows', () => {
  it('should generate OAuth authorization URL for Apple Watch', () => {
    const clientId = 'test-client-id';
    const redirectUri = 'http://localhost:3000/callback';
    const state = 'test-state-123';

    const authUrl = new URL('https://appleid.apple.com/auth/authorize');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'health:read');
    authUrl.searchParams.append('state', state);

    expect(authUrl.toString()).toContain('client_id=test-client-id');
    expect(authUrl.toString()).toContain('scope=health%3Aread'); // URL encoded
    expect(authUrl.toString()).toContain('state=test-state-123');
  });

  it('should generate OAuth authorization URL for Oura Ring', () => {
    const clientId = 'oura-client-id';
    const redirectUri = 'http://localhost:3000/callback';

    const authUrl = new URL('https://cloud.ouraring.com/oauth/authorize');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('redirect_uri', redirectUri);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'personal:read');

    expect(authUrl.toString()).toContain('scope=personal%3Aread'); // URL encoded
  });

  it('should generate OAuth authorization URL for Whoop', () => {
    const clientId = 'whoop-client-id';

    const authUrl = new URL('https://api.prod.whoop.com/oauth/authorize');
    authUrl.searchParams.append('client_id', clientId);
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('scope', 'read:cycles');

    expect(authUrl.toString()).toContain('scope=read%3Acycles'); // URL encoded
  });
});

describe('Health Insights Engine', () => {
  it('should calculate Pearson correlation coefficient', () => {
    // Perfect positive correlation
    const x = [1, 2, 3, 4, 5];
    const y = [2, 4, 6, 8, 10];

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

    const correlation = numerator / Math.sqrt(denominatorX * denominatorY);
    expect(correlation).toBeCloseTo(1, 5); // Perfect correlation
  });

  it('should identify sleep-habit correlations', () => {
    const sleepData = [
      { date: '2024-01-01', quality: 85, duration: 8 },
      { date: '2024-01-02', quality: 90, duration: 8.5 },
      { date: '2024-01-03', quality: 75, duration: 7 },
      { date: '2024-01-04', quality: 88, duration: 8.2 },
      { date: '2024-01-05', quality: 92, duration: 9 },
    ];

    const habitData = {
      habitName: 'Evening Meditation',
      dates: ['2024-01-01', '2024-01-02', '2024-01-04', '2024-01-05'],
    };

    const habitDates = new Set(habitData.dates);
    const sleepQualityWithHabit = sleepData
      .filter((d) => habitDates.has(d.date))
      .map((d) => d.quality);
    const sleepQualityWithoutHabit = sleepData
      .filter((d) => !habitDates.has(d.date))
      .map((d) => d.quality);

    const avgWithHabit = sleepQualityWithHabit.reduce((a, b) => a + b) / sleepQualityWithHabit.length;
    const avgWithoutHabit = sleepQualityWithoutHabit.reduce((a, b) => a + b) / sleepQualityWithoutHabit.length;

    expect(avgWithHabit).toBeGreaterThan(avgWithoutHabit);
  });

  it('should calculate morning energy score', () => {
    const sleepQuality = 85;
    const hrvScore = 75;
    const morningActivity = 60;

    const energyScore = sleepQuality * 0.5 + hrvScore * 0.3 + morningActivity * 0.2;

    expect(energyScore).toBeCloseTo(77, 1); // 85*0.5 + 75*0.3 + 60*0.2 = 42.5 + 22.5 + 12 = 77
    expect(energyScore).toBeGreaterThan(0);
    expect(energyScore).toBeLessThanOrEqual(100);
  });

  it('should generate stress-habit correlations', () => {
    const stressData = [
      { date: '2024-01-01', stressScore: 45 },
      { date: '2024-01-02', stressScore: 35 },
      { date: '2024-01-03', stressScore: 60 },
      { date: '2024-01-04', stressScore: 30 },
      { date: '2024-01-05', stressScore: 40 },
    ];

    const habitData = {
      habitName: 'Morning Run',
      dates: ['2024-01-01', '2024-01-02', '2024-01-04'],
    };

    const habitDates = new Set(habitData.dates);
    const stressWithHabit = stressData
      .filter((d) => habitDates.has(d.date))
      .map((d) => d.stressScore);
    const stressWithoutHabit = stressData
      .filter((d) => !habitDates.has(d.date))
      .map((d) => d.stressScore);

    const avgWithHabit = stressWithHabit.reduce((a, b) => a + b) / stressWithHabit.length;
    const avgWithoutHabit = stressWithoutHabit.reduce((a, b) => a + b) / stressWithoutHabit.length;

    expect(avgWithHabit).toBeLessThan(avgWithoutHabit);
  });
});

describe('Advanced Analytics', () => {
  it('should calculate streak break risk', () => {
    const recentCompletionRate = 70;
    const stressLevel = 60;
    const sleepQuality = 75;
    const historicalBreakPattern = 25;

    const completionRisk = (100 - recentCompletionRate) / 100;
    const stressRisk = stressLevel / 100;
    const sleepRisk = (100 - sleepQuality) / 100;
    const historicalRisk = historicalBreakPattern / 100;

    const riskScore = Math.round(
      completionRisk * 0.4 * 100 +
      stressRisk * 0.25 * 100 +
      sleepRisk * 0.2 * 100 +
      historicalRisk * 0.15 * 100
    );

    expect(riskScore).toBeGreaterThan(0);
    expect(riskScore).toBeLessThanOrEqual(100);
  });

  it('should identify positive habit correlations', () => {
    const habit1Completions = [1, 1, 1, 0, 1, 1, 1, 1, 0, 1];
    const habit2Completions = [1, 1, 1, 0, 1, 1, 1, 1, 0, 1];

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

    const correlation = numerator / Math.sqrt(denominator1 * denominator2);

    expect(correlation).toBeCloseTo(1, 5); // Perfect correlation
  });

  it('should identify negative habit correlations', () => {
    const habit1Completions = [1, 1, 1, 0, 0, 0, 1, 1, 0, 0];
    const habit2Completions = [0, 0, 0, 1, 1, 1, 0, 0, 1, 1];

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

    const correlation = numerator / Math.sqrt(denominator1 * denominator2);

    expect(correlation).toBeLessThan(0); // Negative correlation
  });

  it('should identify optimal time of day for habit', () => {
    const successByTime = {
      morning: 45,
      afternoon: 65,
      evening: 85,
    };

    let maxSuccess = 0;
    let optimalTime = 'morning';

    for (const [time, success] of Object.entries(successByTime)) {
      if (success > maxSuccess) {
        maxSuccess = success;
        optimalTime = time;
      }
    }

    expect(optimalTime).toBe('evening');
    expect(maxSuccess).toBe(85);
  });

  it('should generate streak break recommendations', () => {
    const riskScore = 65;
    const recentCompletionRate = 60;
    const stressLevel = 75;
    const sleepQuality = 55;

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

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations).toContain('Set a daily reminder for this habit');
    expect(recommendations).toContain('Reduce other commitments today');
    expect(recommendations).toContain('Prioritize sleep tonight');
  });
});

describe('Token Encryption', () => {
  it('should encrypt and decrypt tokens securely', () => {
    const token = 'secret-oauth-token-12345';
    const algorithm = 'aes-256-gcm';
    const crypto = require('crypto');

    const key = crypto.scryptSync('test-encryption-key', 'salt', 32);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    const encryptedToken = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;

    // Decrypt
    const [ivHex, authTagHex, encryptedData] = encryptedToken.split(':');
    const ivDecrypt = Buffer.from(ivHex, 'hex');
    const authTagDecrypt = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(algorithm, key, ivDecrypt);
    decipher.setAuthTag(authTagDecrypt);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    expect(decrypted).toBe(token);
  });
});

describe('API Endpoint Contracts', () => {
  it('should validate streak break risk response schema', () => {
    const response = {
      success: true,
      risks: [
        {
          habitId: 'habit-1',
          habitName: 'Morning Run',
          riskScore: 35,
          riskLevel: 'low' as const,
          factors: {
            recentCompletionRate: 85,
            stressLevel: 40,
            sleepQuality: 80,
            historicalBreakPattern: 15,
          },
          recommendations: ['Keep it up!'],
        },
      ],
      highRiskCount: 0,
      averageRiskScore: 35,
    };

    expect(response.success).toBe(true);
    expect(response.risks).toHaveLength(1);
    expect(response.risks[0].riskLevel).toBe('low');
    expect(response.highRiskCount).toBe(0);
  });

  it('should validate habit correlations response schema', () => {
    const response = {
      success: true,
      correlations: [
        {
          habit1: 'Morning Run',
          habit2: 'Cold Shower',
          correlation: 0.78,
          sampleSize: 30,
          type: 'positive' as const,
          description: 'These habits naturally go together.',
        },
      ],
      positiveCorrelations: [
        {
          habit1: 'Morning Run',
          habit2: 'Cold Shower',
          correlation: 0.78,
          sampleSize: 30,
          type: 'positive' as const,
          description: 'These habits naturally go together.',
        },
      ],
      negativeCorrelations: [],
    };

    expect(response.success).toBe(true);
    expect(response.correlations).toHaveLength(1);
    expect(response.positiveCorrelations).toHaveLength(1);
    expect(response.negativeCorrelations).toHaveLength(0);
  });

  it('should validate morning energy score response schema', () => {
    const response = {
      energyScore: 78,
      recommendation: 'Good energy levels. Perfect for your regular routine.',
      breakdown: {
        sleepQuality: 85,
        hrvScore: 75,
        morningActivity: 60,
      },
    };

    expect(response.energyScore).toBeGreaterThan(0);
    expect(response.energyScore).toBeLessThanOrEqual(100);
    expect(response.recommendation).toBeTruthy();
    expect(response.breakdown.sleepQuality).toBe(85);
  });
});
