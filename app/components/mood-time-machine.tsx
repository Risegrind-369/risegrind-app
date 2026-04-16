/**
 * Mood Time Machine
 * Interactive graph showing mood from 1/3/6 months ago for comparison
 */
import React, { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Animated, { FadeIn, SlideInUp } from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";

interface MoodSnapshot {
  date: string;
  moodLevel: number;
}

interface MoodTimeMachineProps {
  currentMood: number;
  moodHistory1Month: MoodSnapshot[];
  moodHistory3Months: MoodSnapshot[];
  moodHistory6Months: MoodSnapshot[];
}

export function MoodTimeMachine({
  currentMood,
  moodHistory1Month,
  moodHistory3Months,
  moodHistory6Months,
}: MoodTimeMachineProps) {
  const colors = useColors();
  const [selectedPeriod, setSelectedPeriod] = useState<"1m" | "3m" | "6m">("1m");

  const getMoodColor = (level: number) => {
    if (level <= 2) return colors.error;
    if (level <= 3) return colors.warning;
    return colors.success;
  };

  const getMoodLabel = (level: number) => {
    const labels = ["😢", "😕", "😐", "🙂", "😄"];
    return labels[Math.max(0, Math.min(4, level - 1))];
  };

  const getHistoryData = () => {
    switch (selectedPeriod) {
      case "1m":
        return moodHistory1Month;
      case "3m":
        return moodHistory3Months;
      case "6m":
        return moodHistory6Months;
      default:
        return [];
    }
  };

  const history = getHistoryData();
  const avgMood =
    history.length > 0
      ? Math.round((history.reduce((sum, s) => sum + s.moodLevel, 0) / history.length) * 10) / 10
      : 0;

  const getMoodTrend = () => {
    if (history.length < 2) return "stable";
    const firstHalf = history.slice(0, Math.floor(history.length / 2));
    const secondHalf = history.slice(Math.floor(history.length / 2));
    const firstAvg = firstHalf.reduce((sum, s) => sum + s.moodLevel, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, s) => sum + s.moodLevel, 0) / secondHalf.length;

    if (secondAvg > firstAvg + 0.5) return "improving";
    if (secondAvg < firstAvg - 0.5) return "declining";
    return "stable";
  };

  const trend = getMoodTrend();

  return (
    <Animated.View
      entering={SlideInUp.springify()}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.primary,
          borderWidth: 1,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.primary }]}>
          ⏰ Mood Time Machine
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          See how your mood has evolved
        </Text>
      </View>

      {/* Period Selector */}
      <View style={styles.periodSelector}>
        {(["1m", "3m", "6m"] as const).map((period) => (
          <Pressable
            key={period}
            onPress={() => setSelectedPeriod(period)}
            style={[
              styles.periodButton,
              {
                backgroundColor:
                  selectedPeriod === period ? colors.primary : colors.background,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.periodText,
                {
                  color:
                    selectedPeriod === period ? colors.background : colors.foreground,
                },
              ]}
            >
              {period === "1m" ? "1 Month" : period === "3m" ? "3 Months" : "6 Months"}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.muted }]}>
            Average Mood
          </Text>
          <Text style={[styles.statValue, { color: getMoodColor(avgMood) }]}>
            {getMoodLabel(Math.round(avgMood))} {avgMood.toFixed(1)}
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.stat}>
          <Text style={[styles.statLabel, { color: colors.muted }]}>
            Trend
          </Text>
          <Text
            style={[
              styles.statValue,
              {
                color:
                  trend === "improving"
                    ? colors.success
                    : trend === "declining"
                      ? colors.error
                      : colors.warning,
              },
            ]}
          >
            {trend === "improving" ? "📈" : trend === "declining" ? "📉" : "➡️"}{" "}
            {trend.charAt(0).toUpperCase() + trend.slice(1)}
          </Text>
        </View>
      </View>

      {/* Mini Chart */}
      <View style={styles.chartContainer}>
        {history.length > 0 ? (
          history.map((snapshot, idx) => (
            <View
              key={idx}
              style={[
                styles.bar,
                {
                  height: `${(snapshot.moodLevel / 5) * 100}%`,
                  backgroundColor: getMoodColor(snapshot.moodLevel),
                },
              ]}
            />
          ))
        ) : (
          <Text style={[styles.emptyText, { color: colors.muted }]}>
            No data yet
          </Text>
        )}
      </View>

      {/* Insight */}
      <Text style={[styles.insight, { color: colors.muted }]}>
        {trend === "improving"
          ? "Your mood is getting better! Keep up the good work. 💜"
          : trend === "declining"
            ? "Your mood is declining. Consider checking in with yourself."
            : "Your mood is stable. Stay consistent with your routine."}
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    gap: 12,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 12,
  },
  periodSelector: {
    flexDirection: "row",
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  periodText: {
    fontSize: 12,
    fontWeight: "600",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stat: {
    flex: 1,
    gap: 4,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  divider: {
    width: 1,
    height: 40,
  },
  chartContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    height: 80,
    gap: 2,
  },
  bar: {
    flex: 1,
    borderRadius: 4,
    minHeight: 4,
  },
  emptyText: {
    fontSize: 12,
    textAlign: "center",
    flex: 1,
  },
  insight: {
    fontSize: 12,
    lineHeight: 16,
    fontStyle: "italic",
  },
});
