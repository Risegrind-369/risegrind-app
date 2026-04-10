import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp, MOOD_EMOJIS, MOOD_LABELS, type MoodLevel } from "@/lib/app-context";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/lib/language-context";
import * as Haptics from "expo-haptics";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MOOD_COLORS: Record<MoodLevel, string> = {
  1: "#EF4444",
  2: "#F97316",
  3: "#EAB308",
  4: "#22C55E",
  5: "#3B82F6",
};

function MoodChart({ moodEntries }: { moodEntries: ReturnType<typeof useApp>["state"]["moodEntries"] }) {
  const colors = useColors();

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().split("T")[0];
    const entry = moodEntries.find((m) => m.date === dateStr);
    return {
      day: DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1],
      level: entry?.level ?? null,
      emoji: entry ? MOOD_EMOJIS[entry.level] : null,
    };
  });

  const maxHeight = 80;

  return (
    <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.cardTitle, { color: colors.foreground }]}>7-Day Mood Trend</Text>
      <View style={styles.chart}>
        {last7Days.map((day, i) => (
          <View key={i} style={styles.chartColumn}>
            <View style={styles.barContainer}>
              {day.level ? (
                <View
                  style={[
                    styles.bar,
                    {
                      height: (day.level / 5) * maxHeight,
                      backgroundColor: MOOD_COLORS[day.level as MoodLevel],
                    },
                  ]}
                />
              ) : (
                <View style={[styles.barEmpty, { backgroundColor: colors.border }]} />
              )}
            </View>
            <Text style={styles.dayEmoji}>{day.emoji ?? "·"}</Text>
            <Text style={[styles.dayLabel, { color: colors.muted }]}>{day.day}</Text>
          </View>
        ))}
      </View>
      <View style={styles.moodLegend}>
        {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => (
          <View key={level} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: MOOD_COLORS[level] }]} />
            <Text style={[styles.legendText, { color: colors.muted }]}>{MOOD_LABELS[level]}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function StreakCalendar({ completions }: { completions: ReturnType<typeof useApp>["state"]["completions"] }) {
  const colors = useColors();

  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    const dateStr = d.toISOString().split("T")[0];
    const hasActivity = completions.some((c) => c.date === dateStr);
    return { hasActivity };
  });

  return (
    <View style={[styles.calendarCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.cardTitle, { color: colors.foreground }]}>Activity Calendar</Text>
      <Text style={[styles.cardSub, { color: colors.muted }]}>Last 28 days</Text>
      <View style={styles.calendarGrid}>
        {days.map((day, i) => (
          <View
            key={i}
            style={[
              styles.calendarDay,
              {
                backgroundColor: day.hasActivity ? colors.primary : colors.border,
                opacity: day.hasActivity ? 1 : 0.3,
              },
            ]}
          />
        ))}
      </View>
    </View>
  );
}

export default function InsightsScreen() {
  const colors = useColors();
  const { state } = useApp();
  const { language } = useLanguage();
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generateMutation = trpc.ai.generateInsights.useMutation({
    onSuccess: (data) => {
      setAiInsight(data.insight);
      setSuggestions(data.suggestions);
    },
    onError: () => {
      // Fallback
      setAiInsight(generateLocalInsight(state.streak, state.xp));
      setSuggestions(generateLocalSuggestions());
    },
  });

  const handleGenerate = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const moodSummary = state.moodEntries
      .slice(-7)
      .map((m) => `${m.date}: ${MOOD_LABELS[m.level]}`)
      .join(", ");

    const journalSummary = state.journalEntries
      .slice(0, 3)
      .map((j) => j.content.slice(0, 100))
      .join(" | ");

    const habitRate = state.habits.length > 0
      ? Math.round((state.completions.length / (state.habits.length * Math.max(state.streak, 1))) * 100)
      : 0;

    generateMutation.mutate({
      streak: state.streak,
      xp: state.xp,
      habitRate,
      recentMoods: moodSummary,
      journalExcerpts: journalSummary,
      habitNames: state.habits.map((h) => h.name).join(", "),
      language: (language ?? "en") as "en" | "fr" | "pt",
    });
  };

  function generateLocalInsight(streak: number, xp: number): string {
    if (streak >= 7) return `You're on a ${streak}-day streak — incredible consistency! Your dedication to morning routines is building real momentum. Keep pushing forward.`;
    if (streak >= 3) return `${streak} days in a row! You're building a powerful habit. Consistency is the key to transformation, and you're proving you have what it takes.`;
    return `You've earned ${xp} XP so far — every habit completed is a step toward your best self. Your morning routine is becoming a cornerstone of your day.`;
  }

  function generateLocalSuggestions(): string[] {
    return [
      "Try adding a 5-minute breathing exercise after waking up",
      "Consider journaling immediately after your morning routine for maximum reflection",
      "Set a consistent wake-up time to strengthen your circadian rhythm",
    ];
  }

  const avgMood = state.moodEntries.length > 0
    ? state.moodEntries.slice(-7).reduce((sum, m) => sum + m.level, 0) / Math.min(state.moodEntries.slice(-7).length, 7)
    : 0;

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Ghost Intel</Text>
          <Text style={[styles.headerSub, { color: colors.muted }]}>Your data. Your edge.</Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{state.streak}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Day Streak</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {[...new Set(state.completions.map((c) => c.date))].length}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Days Won</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>⚡</Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{state.xp.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Total XP</Text>
          </View>
        </View>

        {/* Mood Chart */}
        <MoodChart moodEntries={state.moodEntries} />

        {/* Activity Calendar */}
        <StreakCalendar completions={state.completions} />

        {/* AI Weekly Review */}
        <View style={[styles.aiCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
          <View style={styles.aiHeader}>
            <Text style={[styles.aiTitle, { color: colors.foreground }]}>👻 Ghost Mode Intel</Text>
            <Pressable
              onPress={handleGenerate}
              disabled={generateMutation.isPending}
              style={({ pressed }) => [
                styles.generateButton,
                { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              {generateMutation.isPending ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.generateButtonText}>Analyze</Text>
              )}
            </Pressable>
          </View>

          {aiInsight ? (
            <Text style={[styles.aiInsightText, { color: colors.foreground }]}>{aiInsight}</Text>
          ) : (
            <Text style={[styles.aiPlaceholder, { color: colors.muted }]}>
              Tap "Analyze" to get your Ghost Mode debrief — built from your habits, mood, and journal entries.
            </Text>
          )}
        </View>

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <View style={[styles.suggestionsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>⚡ Ghost Directives</Text>
            {suggestions.map((s, i) => (
              <View key={i} style={styles.suggestionRow}>
                <View style={[styles.suggestionDot, { backgroundColor: colors.primary }]} />
                <Text style={[styles.suggestionText, { color: colors.foreground }]}>{s}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    gap: 4,
  },
  statEmoji: {
    fontSize: 22,
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  chartCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 16,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  cardSub: {
    fontSize: 13,
    marginTop: -8,
  },
  chart: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 110,
  },
  chartColumn: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  barContainer: {
    height: 80,
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: 28,
    borderRadius: 8,
    minHeight: 8,
  },
  barEmpty: {
    width: 28,
    height: 8,
    borderRadius: 4,
  },
  dayEmoji: {
    fontSize: 14,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  moodLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
  },
  calendarCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 12,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  calendarDay: {
    width: "12%",
    aspectRatio: 1,
    borderRadius: 4,
  },
  aiCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 12,
  },
  aiHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  aiTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  generateButton: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    minWidth: 80,
    alignItems: "center",
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  aiInsightText: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "400",
  },
  aiPlaceholder: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: "italic",
  },
  suggestionsCard: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 12,
  },
  suggestionRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  suggestionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 22,
  },
});
