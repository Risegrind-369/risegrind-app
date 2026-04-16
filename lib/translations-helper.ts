/**
 * Translations Helper
 * Provides language-aware translations for habits, moods, ranks, and side quests
 * This centralizes all hardcoded English strings that need to be localized
 */

export type Language = "en" | "fr" | "pt";

// ─── Default Habits ───────────────────────────────────────────────────────────

export const HABIT_TRANSLATIONS: Record<string, Record<Language, string>> = {
  h1: { en: "Wake Up Early", fr: "Se lever tôt", pt: "Acordar cedo" },
  h2: { en: "Hydrate", fr: "S'hydrater", pt: "Hidratar" },
  h3: { en: "Meditate", fr: "Méditer", pt: "Meditar" },
  h4: { en: "Exercise", fr: "Faire de l'exercice", pt: "Exercitar" },
  h5: { en: "Read", fr: "Lire", pt: "Ler" },
  h6: { en: "Cold Shower", fr: "Douche froide", pt: "Banho frio" },
  h7: { en: "Gratitude", fr: "Gratitude", pt: "Gratidão" },
};

export function getHabitName(habitId: string, language: Language): string {
  return HABIT_TRANSLATIONS[habitId]?.[language] || habitId;
}

// ─── Mood Labels ──────────────────────────────────────────────────────────────

export const MOOD_TRANSLATIONS: Record<number, Record<Language, string>> = {
  1: { en: "Rough", fr: "Difficile", pt: "Difícil" },
  2: { en: "Low", fr: "Bas", pt: "Baixo" },
  3: { en: "Okay", fr: "Correct", pt: "OK" },
  4: { en: "Good", fr: "Bon", pt: "Bom" },
  5: { en: "Amazing", fr: "Incroyable", pt: "Incrível" },
};

export function getMoodLabel(moodLevel: number, language: Language): string {
  return MOOD_TRANSLATIONS[moodLevel]?.[language] || "Unknown";
}

// ─── Ranks ────────────────────────────────────────────────────────────────────

export const RANK_TRANSLATIONS: Record<string, Record<Language, string>> = {
  "Early Riser": {
    en: "Early Riser",
    fr: "Lève-tôt",
    pt: "Madrugador",
  },
  "Morning Warrior": {
    en: "Morning Warrior",
    fr: "Guerrier du Matin",
    pt: "Guerreiro da Manhã",
  },
  "Grind Master": {
    en: "Grind Master",
    fr: "Maître du Grind",
    pt: "Mestre do Grind",
  },
  "Grind Legend": {
    en: "Grind Legend",
    fr: "Légende du Grind",
    pt: "Lenda do Grind",
  },
};

export function getRankLabel(rank: string, language: Language): string {
  return RANK_TRANSLATIONS[rank]?.[language] || rank;
}

// ─── Side Quests ──────────────────────────────────────────────────────────────

export const SIDE_QUEST_TRANSLATIONS: Record<
  string,
  Record<Language, { title: string; description: string }>
> = {
  sq_no_social_7: {
    en: {
      title: "Digital Blackout",
      description:
        "7 days no social media. Disappear from the feed. Reappear as someone different.",
    },
    fr: {
      title: "Blackout Numérique",
      description:
        "7 jours sans réseaux sociaux. Disparaître du fil. Réapparaître en tant que quelqu'un de différent.",
    },
    pt: {
      title: "Apagão Digital",
      description:
        "7 dias sem redes sociais. Desapareça do feed. Reapareça como alguém diferente.",
    },
  },
  sq_sleep_7: {
    en: {
      title: "Sleep Optimization Week",
      description:
        "Sleep before 10:30 PM every night for 7 days. Protect your recovery like your life depends on it.",
    },
    fr: {
      title: "Semaine d'Optimisation du Sommeil",
      description:
        "Dormez avant 22h30 chaque nuit pendant 7 jours. Protégez votre récupération comme si votre vie en dépendait.",
    },
    pt: {
      title: "Semana de Otimização do Sono",
      description:
        "Durma antes das 22h30 todas as noites por 7 dias. Proteja sua recuperação como se sua vida dependesse disso.",
    },
  },
  sq_gratitude_7: {
    en: {
      title: "Gratitude Deep Dive",
      description: "Write 3 things you're grateful for every day for 7 days. No repeats.",
    },
    fr: {
      title: "Plongée Profonde en Gratitude",
      description:
        "Écrivez 3 choses dont vous êtes reconnaissant chaque jour pendant 7 jours. Pas de répétitions.",
    },
    pt: {
      title: "Mergulho Profundo em Gratidão",
      description:
        "Escreva 3 coisas pelas quais você é grato todos os dias por 7 dias. Sem repetições.",
    },
  },
  sq_cold_shower_14: {
    en: {
      title: "Cold Ghost Protocol",
      description:
        "14 days of cold showers. Every morning. No excuses. The cold builds what comfort destroys.",
    },
    fr: {
      title: "Protocole Ghost Froid",
      description:
        "14 jours de douches froides. Chaque matin. Pas d'excuses. Le froid construit ce que le confort détruit.",
    },
    pt: {
      title: "Protocolo Ghost Frio",
      description:
        "14 dias de chuveiros frios. Toda manhã. Sem desculpas. O frio constrói o que o conforto destrói.",
    },
  },
  sq_no_alcohol_30: {
    en: {
      title: "30-Day Clarity Mission",
      description:
        "30 days alcohol-free. Clear mind. Sharp focus. Ghost Mode at full power.",
    },
    fr: {
      title: "Mission Clarté 30 Jours",
      description:
        "30 jours sans alcool. L'esprit clair. Concentration aiguisée. Mode Ghost à pleine puissance.",
    },
    pt: {
      title: "Missão de Clareza de 30 Dias",
      description:
        "30 dias sem álcool. Mente clara. Foco aguçado. Modo Ghost em potência total.",
    },
  },
  sq_journal_14: {
    en: {
      title: "14-Day Reflection Sprint",
      description:
        "Journal every day for 14 days. No skipping. Your thoughts deserve to be heard.",
    },
    fr: {
      title: "Sprint de Réflexion 14 Jours",
      description:
        "Journalisez chaque jour pendant 14 jours. Pas de saut. Vos pensées méritent d'être entendues.",
    },
    pt: {
      title: "Sprint de Reflexão de 14 Dias",
      description:
        "Escreva no diário todos os dias por 14 dias. Sem pular. Seus pensamentos merecem ser ouvidos.",
    },
  },
  sq_exercise_21: {
    en: {
      title: "21-Day Body Activation",
      description:
        "Exercise every single day for 21 days. Build the body that matches the mind.",
    },
    fr: {
      title: "Activation Corporelle 21 Jours",
      description:
        "Faites de l'exercice tous les jours pendant 21 jours. Construisez le corps qui correspond à l'esprit.",
    },
    pt: {
      title: "Ativação Corporal de 21 Dias",
      description:
        "Exercite-se todos os dias por 21 dias. Construa o corpo que combina com a mente.",
    },
  },
  sq_meditate_10: {
    en: {
      title: "10-Day Silence Protocol",
      description:
        "Meditate for at least 10 minutes every day for 10 days. Silence is your weapon.",
    },
    fr: {
      title: "Protocole Silence 10 Jours",
      description:
        "Méditez au moins 10 minutes chaque jour pendant 10 jours. Le silence est votre arme.",
    },
    pt: {
      title: "Protocolo de Silêncio de 10 Dias",
      description:
        "Medite por pelo menos 10 minutos todos os dias por 10 dias. O silêncio é sua arma.",
    },
  },
};

export function getSideQuestTranslation(
  questId: string,
  language: Language
): { title: string; description: string } | null {
  return SIDE_QUEST_TRANSLATIONS[questId]?.[language] || null;
}
