import { getDb } from '../db';
import { aiUsageLogs } from '../../drizzle/schema';

const COSTS: Record<string, { input: number; output: number }> = {
  'claude-haiku-4-5-20251001': { input: 0.000001, output: 0.000005 },
  'claude-sonnet-4-6': { input: 0.000003, output: 0.000015 },
};

export async function logAiUsage(
  userId: string,
  feature: string,
  model: string,
  inputTokens: number,
  outputTokens: number
): Promise<void> {
  const cost = COSTS[model] ?? { input: 0, output: 0 };
  const estimatedCostUsd = (
    inputTokens * cost.input + outputTokens * cost.output
  ).toFixed(6);

  const db = await getDb();
  if (!db) {
    console.warn('[ai-logger] Database unavailable — skipping usage log');
    return;
  }

  await db.insert(aiUsageLogs).values({
    userId,
    feature,
    model,
    inputTokens,
    outputTokens,
    estimatedCostUsd,
  }).catch((err) => console.error('[ai-logger] Failed to log AI usage:', err));
}
