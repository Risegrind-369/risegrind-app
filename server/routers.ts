import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  ai: router({
    generateInsights: publicProcedure
      .input(
        z.object({
          streak: z.number(),
          xp: z.number(),
          habitRate: z.number(),
          recentMoods: z.string(),
          journalExcerpts: z.string(),
          habitNames: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const prompt = `You are a supportive wellness coach. Based on this user's data, provide a brief, encouraging weekly insight (2-3 sentences) and 3 specific routine suggestions.

User data:
- Streak: ${input.streak} days
- XP: ${input.xp}
- Habit completion rate: ${input.habitRate}%
- Recent moods (last 7 days): ${input.recentMoods || "No mood data yet"}
- Recent journal excerpts: ${input.journalExcerpts || "No journal entries yet"}
- Current habits: ${input.habitNames}

Respond ONLY with valid JSON in this exact format: {"insight": "...", "suggestions": ["...", "...", "..."]}`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system", content: "You are a wellness coach that responds only with valid JSON." },
              { role: "user", content: prompt },
            ],
          });

          const rawContent = response?.choices?.[0]?.message?.content ?? "";
          const text = typeof rawContent === "string" ? rawContent : "";
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
              insight: parsed.insight ?? "Keep up the great work on your morning routine!",
              suggestions: parsed.suggestions ?? [],
            };
          }
        } catch (e) {
          console.error("LLM error:", e);
        }

        // Fallback
        return {
          insight: `You've earned ${input.xp} XP and maintained a ${input.streak}-day streak. Your consistency is building powerful morning habits. Keep pushing forward!`,
          suggestions: [
            "Try adding a 5-minute breathing exercise after waking up",
            "Consider journaling immediately after your morning routine",
            "Set a consistent wake-up time to strengthen your circadian rhythm",
          ],
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
