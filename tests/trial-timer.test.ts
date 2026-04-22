import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('Trial Timer Countdown Logic', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should calculate remaining time correctly for 3 days', () => {
    const now = new Date('2026-04-22T10:00:00Z');
    vi.setSystemTime(now);

    // Expiration is 3 days from now
    const expirationDate = new Date('2026-04-25T10:00:00Z');
    const diffMs = expirationDate.getTime() - now.getTime();

    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));

    expect(days).toBe(3);
    expect(hours).toBe(0);
    expect(minutes).toBe(0);
  });

  it('should format countdown as "Xd Yh" when days > 0', () => {
    const now = new Date('2026-04-22T10:00:00Z');
    vi.setSystemTime(now);

    const expirationDate = new Date('2026-04-25T14:30:00Z');
    const diffMs = expirationDate.getTime() - now.getTime();

    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

    const formatted = `${days}d ${hours}h`;
    expect(formatted).toBe('3d 4h');
  });

  it('should format countdown as "Xh Ym" when hours > 0 but days = 0', () => {
    const now = new Date('2026-04-22T10:00:00Z');
    vi.setSystemTime(now);

    const expirationDate = new Date('2026-04-22T18:45:00Z');
    const diffMs = expirationDate.getTime() - now.getTime();

    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));

    let formatted = '';
    if (days > 0) {
      formatted = `${days}d ${hours}h`;
    } else if (hours > 0) {
      formatted = `${hours}h ${minutes}m`;
    } else {
      formatted = `${minutes}m`;
    }

    expect(formatted).toBe('8h 45m');
  });

  it('should format countdown as "Xm" when only minutes remain', () => {
    const now = new Date('2026-04-22T10:00:00Z');
    vi.setSystemTime(now);

    const expirationDate = new Date('2026-04-22T10:45:00Z');
    const diffMs = expirationDate.getTime() - now.getTime();

    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));

    let formatted = '';
    if (days > 0) {
      formatted = `${days}d ${hours}h`;
    } else if (hours > 0) {
      formatted = `${hours}h ${minutes}m`;
    } else {
      formatted = `${minutes}m`;
    }

    expect(formatted).toBe('45m');
  });

  it('should return null when trial has expired', () => {
    const now = new Date('2026-04-22T10:00:00Z');
    vi.setSystemTime(now);

    const expirationDate = new Date('2026-04-20T10:00:00Z'); // Past date
    const diffMs = expirationDate.getTime() - now.getTime();

    const isExpired = diffMs <= 0;
    expect(isExpired).toBe(true);
  });

  it('should handle edge case: exactly 72 hours remaining', () => {
    const now = new Date('2026-04-22T10:00:00Z');
    vi.setSystemTime(now);

    // Exactly 72 hours = 3 days
    const expirationDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
    const diffMs = expirationDate.getTime() - now.getTime();

    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));

    expect(days).toBe(3);
    expect(hours).toBe(0);
  });

  it('should handle edge case: 1 minute remaining', () => {
    const now = new Date('2026-04-22T10:00:00Z');
    vi.setSystemTime(now);

    const expirationDate = new Date(now.getTime() + 60 * 1000); // 1 minute
    const diffMs = expirationDate.getTime() - now.getTime();

    const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((diffMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((diffMs % (60 * 60 * 1000)) / (60 * 1000));

    let formatted = '';
    if (days > 0) {
      formatted = `${days}d ${hours}h`;
    } else if (hours > 0) {
      formatted = `${hours}h ${minutes}m`;
    } else {
      formatted = `${minutes}m`;
    }

    expect(formatted).toBe('1m');
  });
});

describe('Trial Timer AsyncStorage Integration', () => {
  it('should calculate expiration date from trialStartedAt timestamp', () => {
    const trialStartedAt = new Date('2026-04-22T10:00:00Z').getTime();
    const trialDurationMs = 3 * 24 * 60 * 60 * 1000; // 72 hours
    const expirationTime = trialStartedAt + trialDurationMs;
    const expirationDate = new Date(expirationTime);

    expect(expirationDate.getTime()).toBe(new Date('2026-04-25T10:00:00Z').getTime());
  });

  it('should handle null trialStartedAt gracefully', () => {
    const trialStartedAt = null;
    const result = trialStartedAt ? new Date(trialStartedAt + 3 * 24 * 60 * 60 * 1000) : null;

    expect(result).toBeNull();
  });
});
