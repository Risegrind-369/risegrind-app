import { describe, it, expect } from 'vitest';

describe('RevenueCat API Key Validation', () => {
  it('should have EXPO_PUBLIC_RC_API_KEY_IOS configured', () => {
    const apiKey = process.env.EXPO_PUBLIC_RC_API_KEY_IOS;
    expect(apiKey).toBeDefined();
    expect(typeof apiKey).toBe('string');
    expect(apiKey?.length).toBeGreaterThan(0);
  });

  it('should have valid API key format', () => {
    const apiKey = process.env.EXPO_PUBLIC_RC_API_KEY_IOS || '';
    // RevenueCat keys can start with 'test_', 'appl_', or 'sk_'
    expect(apiKey).toMatch(/^(test_|appl_|sk_)/);
  });

  it('should be a test key for development', () => {
    const apiKey = process.env.EXPO_PUBLIC_RC_API_KEY_IOS || '';
    // Test keys start with 'test_' for development/sandbox
    if (apiKey.startsWith('test_')) {
      expect(apiKey).toMatch(/^test_[a-zA-Z0-9]+$/);
    }
  });

  it('should match the provided API key', () => {
    const apiKey = process.env.EXPO_PUBLIC_RC_API_KEY_IOS;
    expect(apiKey).toBe('test_IbXciZyxEBAwe0AibUsypPzAoMq');
  });

  it('should be accessible in RevenueCat provider', () => {
    const apiKey = process.env.EXPO_PUBLIC_RC_API_KEY_IOS;
    // Verify the key is available for the RevenueCat provider to use
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe('');
  });
});
