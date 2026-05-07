import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { transcribeAudio } from "./_core/voiceTranscription";
import { storagePut } from "./storage";
import { getSearchContextForEntry } from "./web-search";
import { accountRouter } from "./routes/account";
import { webhooksRouter } from "./routes/webhooks";
import { authMigrationRouter } from "./routes/auth-migration";

export const appRouter = router({
  system: systemRouter,
  account: accountRouter,
  webhooks: webhooksRouter,
  authMigration: authMigrationRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  onboarding: router({
    generatePersonalMessage: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          age: z.string().min(1),
          empathyAnswer: z.string().min(10),
          goalAnswer: z.string().min(10),
          selectedGoals: z.string().optional().default(""),
          selectedProblems: z.string().optional().default(""),
          wakeTime: z.string().optional().default("6am"),
          motivationStyle: z.string().optional().default("tough_love"),
          language: z.enum(["en", "fr", "pt"]).optional().default("en"),
        })
      )
      .mutation(async ({ input }) => {
        const langInstruction = input.language === "fr"
          ? "Réponds UNIQUEMENT en français. Sois empathique, direct, sans fioritures."
          : input.language === "pt"
          ? "Responda APENAS em português brasileiro. Seja empático, direto, sem rodeios."
          : "Respond ONLY in English. Be empathetic, direct, no fluff.";

        const systemPrompt = `You are a Ghost Mode AI mentor — deeply empathetic, insightful, and motivating. ${langInstruction}

Your task: Generate a short, deeply personal, caring message (2-3 sentences max) that speaks directly to this user based on their answers. Reference their specific feelings and aspirations. Make them feel seen and understood.

Rules:
- Be concise and powerful
- Reference specific things they shared
- End with a forward-looking, motivational statement
- Ghost Mode tone: calm confidence, maximum impact`;

        const goalsStr = input.selectedGoals ? `Goals: ${input.selectedGoals.replace(/,/g, ", ")}` : "";
        const problemsStr = input.selectedProblems ? `Obstacles: ${input.selectedProblems.replace(/,/g, ", ")}` : "";

        const userMessage = `User profile:
- Name: ${input.name}, Age: ${input.age}
- Wake time: ${input.wakeTime}
- Coaching style preference: ${input.motivationStyle}
${goalsStr}
${problemsStr}

Why they feel not good enough: "${input.empathyAnswer}"
Their goal with RiseGrind: "${input.goalAnswer}"

Generate a short, deeply personal message that acknowledges their feelings and inspires them.`;

        try {
          const response = await invokeLLM({
            messages: [
              { role: "system" as const, content: systemPrompt },
              { role: "user" as const, content: userMessage },
            ],
          });
          const content = response?.choices?.[0]?.message?.content ?? "";
          const localizedFallback = input.language === "fr"
            ? `Je te vois, ${input.name}. Tu es ici parce que tu sais que tu peux être plus. Avec RiseGrind, tu le seras.`
            : input.language === "pt"
            ? `Eu te vejo, ${input.name}. Você está aqui porque sabe que pode ser mais. Com o RiseGrind, você será.`
            : `I see you, ${input.name}. You're here because you know you can be more. With RiseGrind, you will be.`;
          return {
            message: typeof content === "string" && content.length > 0 ? content : localizedFallback,
          };
        } catch (e) {
          console.error("Onboarding AI error:", e);
          const localizedFallback2 = input.language === "fr"
            ? `Je te vois, ${input.name}. Tu es ici parce que tu sais que tu peux être plus. Avec RiseGrind, tu le seras.`
            : input.language === "pt"
            ? `Eu te vejo, ${input.name}. Você está aqui porque sabe que pode ser mais. Com o RiseGrind, você será.`
            : `I see you, ${input.name}. You're here because you know you can be more. With RiseGrind, you will be.`;
          return { message: localizedFallback2 };
        }
      }),

    generateRoutine: publicProcedure
      .input(
        z.object({
          name: z.string().min(1),
          age: z.string().min(1),
          selectedGoals: z.string(),
          selectedProblems: z.string(),
          wakeTime: z.string(),
          motivationStyle: z.string(),
          empathyAnswer: z.string(),
          goalAnswer: z.string(),
          language: z.enum(["en", "fr", "pt"]).optional().default("en"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const langInstruction = input.language === "fr"
          ? "Réponds UNIQUEMENT en français. Tous les noms d'habitudes et prompts doivent être en français."
          : input.language === "pt"
          ? "Responda APENAS em português brasileiro. Todos os nomes de hábitos e prompts devem ser em português."
          : "Respond ONLY in English.";

        const systemPrompt = `You are a Ghost Mode AI morning routine architect. ${langInstruction}

Your task: Based on the user's profile, generate a HIGHLY PERSONALIZED morning routine and journal prompts.

Return ONLY valid JSON in this exact format:
{
  "habits": [
    { "name": "Habit Name", "icon": "emoji", "durationMin": 10, "reason": "Why this habit for this specific user" }
  ],
  "journalPrompts": [
    "Personalized prompt 1",
    "Personalized prompt 2",
    "Personalized prompt 3",
    "Personalized prompt 4",
    "Personalized prompt 5"
  ],
  "coachingTone": "One sentence describing the AI's coaching approach for this user"
}

Rules:
- Generate exactly 5-7 habits tailored to their goals and problems
- Each habit must directly address their specific goals or obstacles
- Journal prompts must reference their personal goals and struggles
- Coaching tone must match their motivation style preference
- Wake time determines habit timing (e.g., if 4am, include extreme early-riser habits)
- Be specific, not generic — reference their actual goals and problems`;

        const userMessage = `User: ${input.name}, ${input.age} years old
Wake time: ${input.wakeTime}
Coaching style: ${input.motivationStyle}
Goals: ${input.selectedGoals.replace(/,/g, ", ")}
Obstacles: ${input.selectedProblems.replace(/,/g, ", ")}
In their own words — struggle: "${input.empathyAnswer}"
In their own words — goal: "${input.goalAnswer}"

Generate their personalized morning routine and journal prompts.`;

        const fallbackRoutine = {
          habits: [
            { name: "Wake Up", icon: "⏰", durationMin: 0, reason: "Start the day with intention" },
            { name: "Hydrate", icon: "💧", durationMin: 2, reason: "Rehydrate after sleep" },
            { name: "Meditate", icon: "🧘", durationMin: 10, reason: "Clear your mind" },
            { name: "Exercise", icon: "💪", durationMin: 30, reason: "Build physical strength" },
            { name: "Journal", icon: "📓", durationMin: 10, reason: "Reflect and plan" },
          ],
          journalPrompts: [
            "What is the one thing I must accomplish today?",
            "What am I grateful for right now?",
            "What habit am I most proud of this week?",
            "What is holding me back and how do I overcome it?",
            "How will I show up differently today than yesterday?",
          ],
          coachingTone: "Direct, motivating, and focused on consistent daily action.",
        };

        try {
          // Save user profile with onboarding answers
          if (ctx.user?.id) {
            try {
              const { saveUserProfile } = await import("./user-profile");
              await saveUserProfile(ctx.user.id, {
                firstName: input.name,
                age: parseInt(input.age, 10),
                empathyAnswer: input.empathyAnswer,
                goalAnswer: input.goalAnswer,
                mainGoals: input.selectedGoals.split(",").map(g => g.trim()),
                biggestProblems: input.selectedProblems.split(",").map(p => p.trim()),
                wakeTime: input.wakeTime,
                motivationStyle: input.motivationStyle,
                language: input.language,
              });
            } catch (err) {
              console.warn("[generateRoutine] Failed to save user profile:", err);
            }
          }

          const response = await invokeLLM({
            messages: [
              { role: "system" as const, content: systemPrompt },
              { role: "user" as const, content: userMessage },
            ],
          });
          const content = response?.choices?.[0]?.message?.content ?? "";
          if (typeof content === "string" && content.length > 0) {
            // Extract JSON from response (handle markdown code blocks)
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              return { ...parsed, createdAt: Date.now() };
            }
          }
          return { ...fallbackRoutine, createdAt: Date.now() };
        } catch (e) {
          console.error("Routine generation error:", e);
          return { ...fallbackRoutine, createdAt: Date.now() };
        }
      }),
  }),

  journal: router({
    analyzeEntry: publicProcedure
      .input(
        z.object({
          entryContent: z.string(),
          prompt: z.string().optional().default(""),
          moodLevel: z.number().optional(),
          streak: z.number().optional().default(0),
          recentEntries: z.array(z.string()).optional().default([]),
          language: z.enum(["en", "fr", "pt"]).optional().default("en"),
        })
      )
      .mutation(async ({ input }) => {
        const langInstruction = input.language === "fr"
          ? "Réponds UNIQUEMENT en français. Tu es un mentor Ghost Mode — direct, motivant, sans fioritures."
          : input.language === "pt"
          ? "Responda APENAS em português brasileiro. Você é um mentor Ghost Mode — direto, motivador, sem rodeios."
          : "Respond ONLY in English. You are a Ghost Mode mentor — direct, motivating, no fluff.";
        const moodMap: Record<number, string> = { 1: "very low", 2: "low", 3: "neutral", 4: "good", 5: "excellent" };
        const moodDesc = input.moodLevel ? (moodMap[input.moodLevel] ?? "unknown") : "not logged";
        const recentContext = input.recentEntries.length > 0
          ? `Recent journal context: ${input.recentEntries.slice(0, 3).join(" | ")}`
          : "No previous journal entries.";
        
        // Fetch web search context for health/habit-related topics
        let searchContext = "";
        try {
          searchContext = await getSearchContextForEntry(input.entryContent);
        } catch (err) {
          console.warn("[analyzeEntry] Web search failed, continuing without it:", err);
        }
        
        const systemPrompt = `You are a Ghost Mode AI mentor — an elite discipline coach who understands the human mind deeply. ${langInstruction}\n\nYour job:\n1. Acknowledge what they shared with empathy and precision\n2. Identify a key insight or pattern from their words\n3. Give ONE specific, actionable next step\n4. End with a powerful 1-sentence motivational push in Ghost Mode style\n\nRules:\n- Be concise: 3-5 sentences total\n- Be intelligent: reference specific things they wrote\n- Zero generic advice. Be specific to THEIR situation.\n- Ghost Mode tone: calm confidence, zero fluff, maximum signal\n- Never be preachy. Be like a coach who respects the athlete's time.\n- When discussing health or habits, cite reliable sources when available or indicate uncertainty.`;
        const userMessage = `My journal entry today:\n"${input.entryContent}"\n\nMy mood today: ${moodDesc}\nMy current streak: ${input.streak} days\n${recentContext}${searchContext}\n\nGive me your honest, sharp analysis and one clear action step.`;
        try {
          const response = await invokeLLM({
            messages: [
              { role: "system" as const, content: systemPrompt },
              { role: "user" as const, content: userMessage },
            ],
          });
          const content = response?.choices?.[0]?.message?.content ?? "";
          return { reply: typeof content === "string" && content.length > 0 ? content : null };
        } catch (e) {
          console.error("Journal AI error:", e);
          return { reply: null };
        }
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
        
        // Fetch web search context for habit-related topics
        let searchContext = "";
        try {
          const searchQuery = `${input.habitNames} ${input.recentMoods}`.slice(0, 200);
          searchContext = await getSearchContextForEntry(searchQuery);
        } catch (err) {
          console.warn("[generateInsights] Web search failed, continuing without it:", err);
        }
        
        const prompt = `You are a Ghost Mode discipline coach — direct, motivating, no fluff. ${langInstruction} Based on this user's data, give a sharp 2-3 sentence insight and 3 specific action items.

User data:
- Streak: ${input.streak} days
- XP: ${input.xp}
- Habit completion rate: ${input.habitRate}%
- Recent moods (last 7 days): ${input.recentMoods || "No mood data yet"}
- Recent journal excerpts: ${input.journalExcerpts || "No journal entries yet"}
- Current habits: ${input.habitNames}${searchContext}

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

        // Fallback — localized
        const fallbackInsight = input.language === "fr"
          ? `${input.streak} jours consécutifs. ${input.xp} XP gagnés. Tu n'es plus la même personne qu'au début. N'arrête pas maintenant.`
          : input.language === "pt"
          ? `${input.streak} dias seguidos. ${input.xp} XP ganhos. Você não é mais a mesma pessoa de quando começou. Não pare agora.`
          : `${input.streak} days straight. ${input.xp} XP earned. You're not the same person you were when you started. Don't stop now.`;
        const fallbackSuggestions = input.language === "fr"
          ? [
              "Ajoute un exercice de respiration de 5 minutes au réveil",
              "Écris dans ton journal juste après ta routine — capture l'élan",
              "Fixe une heure de réveil constante. Ton rythme circadien est ta base.",
            ]
          : input.language === "pt"
          ? [
              "Adicione um exercício de respiração de 5 minutos ao acordar",
              "Escreva no diário logo após sua rotina — capture o momentum",
              "Defina um horário de despertar consistente. Seu ritmo circadiano é sua base.",
            ]
          : [
              "Add a 5-minute breathing exercise right after waking up",
              "Journal immediately after your morning routine — capture the momentum",
              "Lock in a consistent wake-up time. Your circadian rhythm is your foundation.",
            ];
        return { insight: fallbackInsight, suggestions: fallbackSuggestions };
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
      .mutation(async ({ input, ctx }) => {
        const langInstruction = input.language === "fr"
          ? "Réponds UNIQUEMENT en français. Tu es un mentor Ghost Mode — direct, motivant, sans fioritures."
          : input.language === "pt"
          ? "Responda APENAS em português brasileiro. Você é um mentor Ghost Mode — direto, motivador, sem rodeios."
          : "Respond ONLY in English. You are a Ghost Mode mentor — direct, motivating, no fluff.";

        // Fetch user profile for personalization
        let personalizationContext = "";
        if (ctx.user?.id) {
          try {
            const { getUserProfile, buildPersonalizationContext } = await import("./user-profile");
            const profile = await getUserProfile(ctx.user.id);
            if (profile) {
              personalizationContext = buildPersonalizationContext(profile);
            }
          } catch (err) {
            console.warn("[chat] Failed to fetch user profile:", err);
          }
        }

        const contextParts = [
          `Streak: ${input.streak} days`,
          `XP: ${input.xp}`,
          `Habit completion: ${input.habitRate}%`,
          input.stepsToday != null ? `Steps today: ${input.stepsToday.toLocaleString()}` : null,
          input.sleepLastNight != null ? `Sleep last night: ${input.sleepLastNight}h` : null,
        ].filter(Boolean);
        
        // Fetch web search context for health/habit-related questions
        let searchContext = "";
        try {
          searchContext = await getSearchContextForEntry(input.message);
        } catch (err) {
          console.warn("[chat] Web search failed, continuing without it:", err);
        }

        const systemPrompt = `You are a Ghost Mode AI mentor — a sharp, no-nonsense discipline coach. ${langInstruction}\n\nUser Profile:\n${personalizationContext}\n\nCurrent Stats: ${contextParts.join(" | ")}\n\nRules:\n- Be concise (2-4 sentences max per response)\n- Reference their personal goals and challenges when relevant\n- Use their name naturally in conversation\n- When asked for charts/reports, respond with a text-based visual using ASCII or emoji bars\n- Never be preachy. Be like a coach who respects the athlete's time.\n- Ghost Mode tone: calm confidence, zero fluff, maximum signal\n- When discussing health or habits, cite reliable sources when available or indicate uncertainty.`;

        try {
          const messages = [
            { role: "system" as const, content: systemPrompt },
            ...input.history.map((h) => ({ role: h.role as "user" | "assistant", content: h.content })),
            { role: "user" as const, content: input.message + searchContext },
          ];
          const response = await invokeLLM({ messages });
          const content = response?.choices?.[0]?.message?.content ?? "";
          return { reply: typeof content === "string" ? content : "Keep going. You're on the right path." };
        } catch (e) {
          console.error("AI chat error:", e);
          return { reply: input.language === "fr" ? "Connexion au mentor impossible. Réessaie." : input.language === "pt" ? "Não foi possível conectar ao mentor. Tente novamente." : "Couldn't reach the mentor. Try again." };
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
