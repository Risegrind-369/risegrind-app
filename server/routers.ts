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

    chat: publicProcedure
      .input(
        z.object({
          message: z.string(),
          history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).optional().default([]),
          streak: z.number().optional().default(0),
          xp: z.number().optional().default(0),
          habitRate: z.number().optional().default(0),
          stepsToday: z.number().nullable().optional(),
          sleepLastNight: z.number().nullable().optional(),
          language: z.enum(["en", "fr", "pt"]).optional().default("en"),
        })
      )
      .mutation(async ({ input }) => {
        const langInstruction = input.language === "fr"
          ? "R\u00e9ponds UNIQUEMENT en fran\u00e7ais. Tu es un mentor Ghost Mode \u2014 direct, motivant, sans fioritures."
          : input.language === "pt"
          ? "Responda APENAS em portugu\u00eas brasileiro. Voc\u00ea \u00e9 um mentor Ghost Mode \u2014 direto, motivador, sem rodeios."
          : "Respond ONLY in English. You are a Ghost Mode mentor \u2014 direct, motivating, no fluff.";

        const contextParts = [
          `Streak: ${input.streak} days`,
          `XP: ${input.xp}`,
          `Habit completion: ${input.habitRate}%`,
          input.stepsToday != null ? `Steps today: ${input.stepsToday.toLocaleString()}` : null,
          input.sleepLastNight != null ? `Sleep last night: ${input.sleepLastNight}h` : null,
        ].filter(Boolean);

        const systemPrompt = `You are a Ghost Mode AI mentor \u2014 a sharp, no-nonsense discipline coach. ${langInstruction}\n\nUser context: ${contextParts.join(" | ")}\n\nRules:\n- Be concise (2-4 sentences max per response)\n- Use the user's data when relevant\n- When asked for charts/reports, respond with a text-based visual using ASCII or emoji bars\n- Never be preachy. Be like a coach who respects the athlete's time.\n- Ghost Mode tone: calm confidence, zero fluff, maximum signal`;

        try {
          const messages = [
            { role: "system" as const, content: systemPrompt },
            ...input.history.map((h) => ({ role: h.role as "user" | "assistant", content: h.content })),
            { role: "user" as const, content: input.message },
          ];
          const response = await invokeLLM({ messages });
          const content = response?.choices?.[0]?.message?.content ?? "";
          return { reply: typeof content === "string" ? content : "Keep going. You're on the right path." };
        } catch (e) {
          console.error("AI chat error:", e);
          return { reply: input.language === "fr" ? "Connexion au mentor impossible. R\u00e9essaie." : input.language === "pt" ? "N\u00e3o foi poss\u00edvel conectar ao mentor. Tente novamente." : "Couldn't reach the mentor. Try again." };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
