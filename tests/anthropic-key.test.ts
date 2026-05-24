import { describe, it, expect } from 'vitest';
import Anthropic from '@anthropic-ai/sdk';

describe('ANTHROPIC_API_KEY validation', () => {
  it('should successfully call Anthropic API with the provided key', async () => {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 10,
      messages: [{ role: 'user', content: 'Say "ok"' }],
    });
    expect(response.content[0].type).toBe('text');
    expect(response.usage.input_tokens).toBeGreaterThan(0);
  }, 30000);
});
