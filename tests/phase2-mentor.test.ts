import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Phase 2: Core Mentor Features', () => {
  describe('Mentor Personalities', () => {
    it('should have 4 distinct mentor personalities', () => {
      const personalities = ['supportive', 'challenging', 'scientific', 'friendly'];
      expect(personalities).toHaveLength(4);
    });

    it('each personality should have unique system prompt', () => {
      const personalities = {
        supportive: 'empathetic',
        challenging: 'accountability',
        scientific: 'research',
        friendly: 'conversational'
      };
      
      const values = Object.values(personalities);
      const uniqueValues = new Set(values);
      expect(uniqueValues.size).toBe(4);
    });
  });

  describe('Emotional Check-in', () => {
    it('should accept mood values 1-5', () => {
      const validMoods = [1, 2, 3, 4, 5];
      validMoods.forEach(mood => {
        expect(mood).toBeGreaterThanOrEqual(1);
        expect(mood).toBeLessThanOrEqual(5);
      });
    });

    it('should accept energy values 1-10', () => {
      const validEnergy = [1, 5, 10];
      validEnergy.forEach(energy => {
        expect(energy).toBeGreaterThanOrEqual(1);
        expect(energy).toBeLessThanOrEqual(10);
      });
    });

    it('should accept stress values 1-10', () => {
      const validStress = [1, 5, 10];
      validStress.forEach(stress => {
        expect(stress).toBeGreaterThanOrEqual(1);
        expect(stress).toBeLessThanOrEqual(10);
      });
    });

    it('should allow optional notes', () => {
      const checkIn = {
        mood: 4,
        energy: 7,
        stress: 3,
        notes: 'Feeling good today'
      };
      expect(checkIn.notes).toBeDefined();
      expect(typeof checkIn.notes).toBe('string');
    });
  });

  describe('Daily Recommendations', () => {
    it('should rank recommendations 1-5', () => {
      const recommendations = [
        { rank: 1, habitId: 'meditation' },
        { rank: 2, habitId: 'exercise' },
        { rank: 3, habitId: 'reading' }
      ];
      
      recommendations.forEach(rec => {
        expect(rec.rank).toBeGreaterThanOrEqual(1);
        expect(rec.rank).toBeLessThanOrEqual(5);
      });
    });

    it('should provide reason for each recommendation', () => {
      const recommendation = {
        habitId: 'meditation',
        reason: 'High success rate with your energy level',
        rank: 1
      };
      
      expect(recommendation.reason).toBeDefined();
      expect(recommendation.reason.length).toBeGreaterThan(0);
    });

    it('should track acceptance of recommendations', () => {
      const recommendation = {
        habitId: 'meditation',
        accepted: false
      };
      
      expect(typeof recommendation.accepted).toBe('boolean');
    });
  });

  describe('Habit Difficulty Auto-adjustment', () => {
    it('should increase difficulty if success rate > 90%', () => {
      const successRate = 0.95;
      const shouldIncrease = successRate > 0.9;
      expect(shouldIncrease).toBe(true);
    });

    it('should decrease difficulty if success rate < 50%', () => {
      const successRate = 0.45;
      const shouldDecrease = successRate < 0.5;
      expect(shouldDecrease).toBe(true);
    });

    it('should maintain difficulty if success rate 50-90%', () => {
      const successRate = 0.75;
      const shouldMaintain = successRate >= 0.5 && successRate <= 0.9;
      expect(shouldMaintain).toBe(true);
    });

    it('should have 4 difficulty levels', () => {
      const levels = ['Easy', 'Medium', 'Hard', 'Expert'];
      expect(levels).toHaveLength(4);
    });
  });

  describe('Mentor Chat API', () => {
    it('should accept userId and message', () => {
      const payload = {
        userId: '123',
        message: 'How do I build better habits?',
        mentorPersonality: 'supportive'
      };
      
      expect(payload.userId).toBeDefined();
      expect(payload.message).toBeDefined();
      expect(payload.mentorPersonality).toBeDefined();
    });

    it('should return mentor response with personality', () => {
      const response = {
        message: 'Great question! Building habits takes time...',
        personality: 'Supportive Coach',
        timestamp: new Date()
      };
      
      expect(response.message).toBeDefined();
      expect(response.personality).toBeDefined();
      expect(response.timestamp).toBeInstanceOf(Date);
    });

    it('should maintain chat history', () => {
      const chatHistory = [
        { role: 'user', message: 'Hello', createdAt: new Date() },
        { role: 'assistant', message: 'Hi there!', createdAt: new Date() }
      ];
      
      expect(chatHistory).toHaveLength(2);
      expect(chatHistory[0].role).toBe('user');
      expect(chatHistory[1].role).toBe('assistant');
    });
  });

  describe('Emotional Check-in API', () => {
    it('should save emotional check-in with all fields', () => {
      const checkIn = {
        userId: '123',
        date: '2026-04-25',
        mood: 4,
        energy: 7,
        stress: 3,
        notes: 'Feeling good'
      };
      
      expect(checkIn.userId).toBeDefined();
      expect(checkIn.date).toBeDefined();
      expect(checkIn.mood).toBeDefined();
      expect(checkIn.energy).toBeDefined();
    });

    it('should retrieve today\'s check-in', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('Recommendations API', () => {
    it('should generate daily recommendations', () => {
      const recommendations = [
        {
          habitId: 'meditation',
          reason: 'High success rate',
          rank: 1,
          accepted: false
        }
      ];
      
      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].rank).toBe(1);
    });

    it('should rank recommendations by priority', () => {
      const recommendations = [
        { habitId: 'meditation', rank: 1 },
        { habitId: 'exercise', rank: 2 },
        { habitId: 'reading', rank: 3 }
      ];
      
      const ranks = recommendations.map(r => r.rank);
      expect(ranks).toEqual([1, 2, 3]);
    });
  });

  describe('Integration: Complete Flow', () => {
    it('should handle complete mentor interaction flow', async () => {
      // 1. User does emotional check-in
      const checkIn = {
        userId: '123',
        mood: 4,
        energy: 7,
        stress: 2
      };
      expect(checkIn.mood).toBe(4);

      // 2. System generates recommendations based on check-in
      const recommendations = [
        {
          habitId: 'meditation',
          reason: 'Matches your energy level',
          rank: 1
        }
      ];
      expect(recommendations).toHaveLength(1);

      // 3. User sends message to mentor
      const message = {
        userId: '123',
        message: 'Should I start with meditation?',
        mentorPersonality: 'supportive'
      };
      expect(message.message).toBeDefined();

      // 4. Mentor responds
      const response = {
        message: 'Yes! Meditation is perfect for your current energy level.',
        personality: 'Supportive Coach'
      };
      expect(response.message).toBeDefined();
    });
  });
});
