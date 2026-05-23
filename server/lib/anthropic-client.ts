import Anthropic from '@anthropic-ai/sdk';

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const MODELS = {
  HAIKU: 'claude-haiku-4-5-20251001',
  SONNET: 'claude-sonnet-4-20250514',
} as const;

export const MAX_TOKENS = {
  WELCOME_MESSAGE: 200,
  ROUTINE_GENERATION: 800,
  JOURNAL_ANALYSIS: 400,
  WEEKLY_INSIGHTS: 600,
  MENTOR_CHAT: 500,
} as const;
