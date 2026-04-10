import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { transcribeAudio } from "./_core/voiceTranscription";
import { storagePut } from "./storage";

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

  voice: router({
    transcribe: publicProcedure
      .input(z.object({
        audioBase64: z.string(),
        mimeType: z.string().default("audio/m4a"),
        language: z.enum(["en", "fr", "pt"]).optional().default("en"),
      }))
      .mutation(async ({ input }) => {
        // Decode base64, upload to S3, then transcribe via Whisper
        const buffer = Buffer.from(input.audioBase64, "base64");
        const key = `voice/${Date.now()}.m4a`;
        const { url } = await storagePut(key, buffer, input.mimeType);
        // Map pt -> pt (Whisper supports pt natively)
        const whisperLang = input.language === "pt" ? "pt" : input.language;
        const result = await transcribeAudio({ audioUrl: url, language: whisperLang });
        if ("error" in result) throw new Error(result.error);
        return { text: result.text ?? "" };
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
          language: z.enum(["en", "fr", "pt"]).optional().default("en"),
        })
      )
      .mutation(async ({ input }) => {
        const langInstruction = input.language === "fr"
          ? "Respond in French (français). Keep the Ghost Mode tone — direct, no fluff."
          : input.language === "pt"
          ? "Respond in Brazilian Portuguese (português brasileiro). Keep the Ghost Mode tone — direct, no fluff."
          : "Respond in English. Keep the Ghost Mode tone — direct, no fluff.";
        const prompt = `You are a Ghost Mode discipline coach — direct, motivating, no fluff. ${langInstruction} Based on this user's data, give a sharp 2-3 sentence insight and 3 specific action items.

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
              { role: "system", content: `You are a Ghost Mode discipline coach that responds only with valid JSON. ${langInstruction}` },
              { role: "user", content: prompt },
            ],
          });

          const rawContent = response?.choices?.[0]?.message?.content ?? "";
          const text = typeof rawContent === "string" ? rawContent : "";
          const jsonMatch = text.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            return {
              insight: parsed.insight ?? "You're building in silence. Keep going.",
              suggestions: parsed.suggestions ?? [],
            };
          }
        } catch (e) {
          console.error("LLM error:", e);
        }

        // Fallback
        return {
          insight: `${input.streak} days straight. ${input.xp} XP earned. You're not the same person you were when you started. Don't stop now.`,
          suggestions: [
            "Add a 5-minute breathing exercise right after waking up",
            "Journal immediately after your morning routine — capture the momentum",
            "Lock in a consistent wake-up time. Your circadian rhythm is your foundation.",
          ],
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
