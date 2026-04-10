import React, { useState, useMemo } from "react";
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
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";

type FilterPeriod = "day" | "week" | "month" | "year";

const MOOD_COLORS: Record<MoodLevel, string> = {
  1: "#EF4444",
  2: "#F97316",
  3: "#EAB308",
  4: "#22C55E",
  5: "#3B82F6",
};

function FilterTabs({
  active,
  onChange,
}: {
  active: FilterPeriod;
  onChange: (p: FilterPeriod) => void;
}) {
  const colors = useColors();
  const { t } = useTranslation();
  const periods: FilterPeriod[] = ["day", "week", "month", "year"];

  return (
    <View style={[styles.filterRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {periods.map((p) => (
        <Pressable
          key={p}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onChange(p);
          }}
          style={[
            styles.filterTab,
            active === p && { backgroundColor: colors.primary },
          ]}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: active === p ? "#fff" : colors.muted },
            ]}
          >
            {t(`insights.filters.${p}`)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function CorrelationChart({
  period,
  moodEntries,
  completions,
  habits,
}: {
  period: FilterPeriod;
  moodEntries: ReturnType<typeof useApp>["state"]["moodEntries"];
  completions: ReturnType<typeof useApp>["state"]["completions"];
  habits: ReturnType<typeof useApp>["state"]["habits"];
}) {
  const colors = useColors();
  const { t } = useTranslation();

  const buckets = useMemo(() => {
    const now = new Date();
    const totalHabits = Math.max(habits.length, 1);

    if (period === "day") {
      // Last 7 individual days
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        const dateStr = d.toISOString().split("T")[0];
        const dayCompletions = completions.filter((c) => c.date === dateStr).length;
        const moodEntry = moodEntries.find((m) => m.date === dateStr);
        const dayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
        const dayIdx = d.getDay() === 0 ? 6 : d.getDay() - 1;
        return {
          label: dayLabels[dayIdx],
          habitsCount: dayCompletions,
          maxHabits: totalHabits,
          mood: moodEntry?.level ?? null,
        };
      });
    }

    if (period === "week") {
      // Last 8 weeks
      return Array.from({ length: 8 }, (_, i) => {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (7 * (7 - i)));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const weekDates: string[] = [];
        for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
          weekDates.push(d.toISOString().split("T")[0]);
        }
        const weekCompletions = completions.filter((c) => weekDates.includes(c.date)).length;
        const weekMoods = moodEntries.filter((m) => weekDates.includes(m.date));
        const avgMood = weekMoods.length > 0
          ? Math.round(weekMoods.reduce((s, m) => s + m.level, 0) / weekMoods.length) as MoodLevel
          : null;
        const weekLabel = `W${i + 1}`;
        return {
          label: weekLabel,
          habitsCount: weekCompletions,
          maxHabits: totalHabits * 7,
          mood: avgMood,
        };
      });
    }

    if (period === "month") {
      // Last 6 months
      return Array.from({ length: 6 }, (_, i) => {
        const monthDate = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
        const monthStr = monthDate.toISOString().slice(0, 7);
        const monthCompletions = completions.filter((c) => c.date.startsWith(monthStr)).length;
        const monthMoods = moodEntries.filter((m) => m.date.startsWith(monthStr));
        const avgMood = monthMoods.length > 0
          ? Math.round(monthMoods.reduce((s, m) => s + m.level, 0) / monthMoods.length) as MoodLevel
          : null;
        const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return {
          label: monthNames[monthDate.getMonth()],
          habitsCount: monthCompletions,
          maxHabits: totalHabits * daysInMonth,
          mood: avgMood,
        };
      });
    }

    // year: last 12 months (same as month but 12)
    return Array.from({ length: 12 }, (_, i) => {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
      const monthStr = monthDate.toISOString().slice(0, 7);
      const monthCompletions = completions.filter((c) => c.date.startsWith(monthStr)).length;
      const monthMoods = moodEntries.filter((m) => m.date.startsWith(monthStr));
      const avgMood = monthMoods.length > 0
        ? Math.round(monthMoods.reduce((s, m) => s + m.level, 0) / monthMoods.length) as MoodLevel
        : null;
      const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
      const monthNames = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
      return {
        label: monthNames[monthDate.getMonth()],
        habitsCount: monthCompletions,
        maxHabits: totalHabits * daysInMonth,
        mood: avgMood,
      };
    });
  }, [period, moodEntries, completions, habits]);

  const maxBarHeight = 100;
  const hasData = buckets.some((b) => b.habitsCount > 0);

  return (
    <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.cardTitle, { color: colors.foreground }]}>
        {t("insights.correlation.title")}
      </Text>
      <Text style={[styles.cardSub, { color: colors.muted }]}>
        {t("insights.correlation.subtitle")}
      </Text>

      {!hasData ? (
        <Text style={[styles.noDataText, { color: colors.muted }]}>
          {t("insights.correlation.noData")}
        </Text>
      ) : (
        <View style={styles.chart}>
          {buckets.map((bucket, i) => {
            const ratio = bucket.maxHabits > 0 ? bucket.habitsCount / bucket.maxHabits : 0;
            const barH = Math.max(ratio * maxBarHeight, bucket.habitsCount > 0 ? 4 : 0);
            const barColor = bucket.mood ? MOOD_COLORS[bucket.mood] : colors.border;
            return (
              <View key={i} style={styles.chartColumn}>
                <View style={[styles.barContainer, { height: maxBarHeight }]}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: barH,
                        backgroundColor: barColor,
                        opacity: bucket.habitsCount > 0 ? 1 : 0.2,
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.dayLabel, { color: colors.muted }]}>{bucket.label}</Text>
              </View>
            );
          })}
        </View>
      )}

      {/* Mood color legend */}
      <View style={styles.moodLegend}>
        {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => (
          <View key={level} style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: MOOD_COLORS[level] }]} />
            <Text style={[styles.legendText, { color: colors.muted }]}>
              {t(`insights.moods.${level}`)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function ActivityCalendar({
  completions,
}: {
  completions: ReturnType<typeof useApp>["state"]["completions"];
}) {
  const colors = useColors();
  const { t } = useTranslation();

  const days = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (27 - i));
    const dateStr = d.toISOString().split("T")[0];
    const hasActivity = completions.some((c) => c.date === dateStr);
    return { hasActivity };
  });

  return (
    <View style={[styles.calendarCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.cardTitle, { color: colors.foreground }]}>
        {t("insights.activityCalendar")}
      </Text>
      <Text style={[styles.cardSub, { color: colors.muted }]}>{t("insights.last28")}</Text>
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
  const { t } = useTranslation();
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [filterPeriod, setFilterPeriod] = useState<FilterPeriod>("week");

  const generateMutation = trpc.ai.generateInsights.useMutation({
    onSuccess: (data) => {
      setAiInsight(data.insight);
      setSuggestions(data.suggestions);
    },
    onError: () => {
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

    const habitRate =
      state.habits.length > 0
        ? Math.round(
            (state.completions.length /
              (state.habits.length * Math.max(state.streak, 1))) *
              100
          )
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
    if (streak >= 7)
      return `You're on a ${streak}-day streak — incredible consistency! Your dedication to morning routines is building real momentum.`;
    if (streak >= 3)
      return `${streak} days in a row! You're building a powerful habit. Consistency is the key to transformation.`;
    return `You've earned ${xp} XP so far — every habit completed is a step toward your best self.`;
  }

  function generateLocalSuggestions(): string[] {
    return [
      "Try adding a 5-minute breathing exercise after waking up",
      "Consider journaling immediately after your morning routine for maximum reflection",
      "Set a consistent wake-up time to strengthen your circadian rhythm",
    ];
  }

  const daysWon = [...new Set(state.completions.map((c) => c.date))].length;

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {t("insights.title")}
          </Text>
          <Text style={[styles.headerSub, { color: colors.muted }]}>
            {t("insights.subtitle")}
          </Text>
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{state.streak}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>{t("insights.currentStreak")}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{daysWon}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>{t("insights.daysWon")}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>⚡</Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{state.xp.toLocaleString()}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>{t("insights.totalXP")}</Text>
          </View>
        </View>

        {/* Filter Tabs */}
        <FilterTabs active={filterPeriod} onChange={setFilterPeriod} />

        {/* Correlation Chart */}
        <CorrelationChart
          period={filterPeriod}
          moodEntries={state.moodEntries}
          completions={state.completions}
          habits={state.habits}
        />

        {/* Activity Calendar */}
        <ActivityCalendar completions={state.completions} />

        {/* AI Review Card */}
        <View
          style={[
            styles.aiCard,
            { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" },
          ]}
        >
          <View style={styles.aiHeader}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.aiTitle, { color: colors.foreground }]}>
                👻 {t("insights.aiReview")}
              </Text>
              <Text style={[styles.aiSubtitle, { color: colors.muted }]}>
                {t("insights.aiSubtitle")}
              </Text>
            </View>
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
                <Text style={styles.generateButtonText}>{t("insights.analyze")}</Text>
              )}
            </Pressable>
          </View>

          {generateMutation.isPending ? (
            <Text style={[styles.aiPlaceholder, { color: colors.muted }]}>
              {t("insights.generating")}
            </Text>
          ) : aiInsight ? (
            <Text style={[styles.aiInsightText, { color: colors.foreground }]}>{aiInsight}</Text>
          ) : (
            <Text style={[styles.aiPlaceholder, { color: colors.muted }]}>
              {t("insights.noData")}
            </Text>
          )}
        </View>

        {/* Ghost Directives */}
        {suggestions.length > 0 && (
          <View
            style={[styles.suggestionsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
          >
            <Text style={[styles.cardTitle, { color: colors.foreground }]}>
              ⚡ {t("insights.ghostDirectives")}
            </Text>
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
  header: { gap: 4 },
  headerTitle: { fontSize: 28, fontWeight: "800", letterSpacing: -0.3 },
  headerSub: { fontSize: 14 },
  statsRow: { flexDirection: "row", gap: 10 },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    gap: 4,
  },
  statEmoji: { fontSize: 22 },
  statValue: { fontSize: 22, fontWeight: "800" },
  statLabel: { fontSize: 10, textAlign: "center" },
  filterRow: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
    padding: 4,
    gap: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  filterTabText: { fontSize: 12, fontWeight: "700" },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: "700" },
  cardSub: { fontSize: 12, marginTop: -8 },
  noDataText: { fontSize: 13, textAlign: "center", paddingVertical: 20 },
  chart: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    paddingTop: 8,
  },
  chartColumn: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  barContainer: {
    width: "100%",
    justifyContent: "flex-end",
    alignItems: "center",
  },
  bar: {
    width: "80%",
    borderRadius: 4,
    minHeight: 4,
  },
  dayEmoji: { fontSize: 14 },
  dayLabel: { fontSize: 9, textAlign: "center" },
  moodLegend: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 10 },
  calendarCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
  },
  calendarDay: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  aiCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  aiHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  aiTitle: { fontSize: 15, fontWeight: "700" },
  aiSubtitle: { fontSize: 12, marginTop: 2 },
  generateButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 80,
    alignItems: "center",
  },
  generateButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  aiInsightText: { fontSize: 14, lineHeight: 22 },
  aiPlaceholder: { fontSize: 13, lineHeight: 20, fontStyle: "italic" },
  suggestionsCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  suggestionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 7,
  },
  suggestionText: { flex: 1, fontSize: 13, lineHeight: 20 },
});
