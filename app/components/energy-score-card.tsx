/**
 * Morning Energy Score Card
 * Displays user's energy level (0-100) based on sleep, activity, and health data
 */

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-colors";
import Animated, { FadeIn } from "react-native-reanimated";

interface EnergyScoreCardProps {
  score: number; // 0-100
  sleepHours?: number;
  steps?: number;
  recommendation?: string;
  compact?: boolean;
}

export function EnergyScoreCard({
  score,
  sleepHours,
  steps,
  recommendation,
  compact = false,
}: EnergyScoreCardProps) {
  const colors = useColors();

  // Determine color based on score
  const getScoreColor = (s: number) => {
    if (s < 30) return "#EF4444"; // Red - very low
    if (s < 50) return "#F59E0B"; // Amber - low
    if (s < 70) return "#FBBF24"; // Yellow - medium
    if (s < 85) return "#84CC16"; // Lime - high
    return "#22C55E"; // Green - very high
  };

  const scoreColor = getScoreColor(score);

  // Determine emoji based on score
  const getScoreEmoji = (s: number) => {
    if (s < 30) return "😴";
    if (s < 50) return "😐";
    if (s < 70) return "🙂";
    if (s < 85) return "😊";
    return "🚀";
  };

  const scoreEmoji = getScoreEmoji(score);

  if (compact) {
    return (
      <Animated.View
        entering={FadeIn}
        style={[
          styles.compactContainer,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <View style={styles.compactContent}>
          <Text style={styles.compactEmoji}>{scoreEmoji}</Text>
          <View style={styles.compactInfo}>
            <Text style={[styles.compactLabel, { color: colors.muted }]}>
              Energy Score
            </Text>
            <Text style={[styles.compactScore, { color: scoreColor }]}>
              {Math.round(score)}
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      entering={FadeIn}
      style={[
        styles.container,
        { backgroundColor: colors.surface, borderColor: colors.border },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.foreground }]}>
          Morning Energy Score
        </Text>
        <Text style={styles.emoji}>{scoreEmoji}</Text>
      </View>

      {/* Score Display */}
      <View style={styles.scoreDisplay}>
        <View style={styles.scoreCircle}>
          <Text style={[styles.scoreNumber, { color: scoreColor }]}>
            {Math.round(score)}
          </Text>
          <Text style={[styles.scoreLabel, { color: colors.muted }]}>/100</Text>
        </View>

        {/* Score Bar */}
        <View style={styles.scoreBarContainer}>
          <View
            style={[
              styles.scoreBar,
              { backgroundColor: colors.border },
            ]}
          >
            <Animated.View
              style={[
                styles.scoreBarFill,
                {
                  backgroundColor: scoreColor,
                  width: `${score}%`,
                },
              ]}
            />
          </View>
          <View style={styles.scoreLabels}>
            <Text style={[styles.scoreBarLabel, { color: colors.muted }]}>
              Low
            </Text>
            <Text style={[styles.scoreBarLabel, { color: colors.muted }]}>
              High
            </Text>
          </View>
        </View>
      </View>

      {/* Health Metrics */}
      {(sleepHours !== undefined || steps !== undefined) && (
        <View style={styles.metrics}>
          {sleepHours !== undefined && (
            <View style={styles.metric}>
              <Text style={[styles.metricLabel, { color: colors.muted }]}>
                Sleep
              </Text>
              <Text style={[styles.metricValue, { color: colors.foreground }]}>
                {sleepHours}h
              </Text>
            </View>
          )}
          {steps !== undefined && (
            <View style={styles.metric}>
              <Text style={[styles.metricLabel, { color: colors.muted }]}>
                Steps
              </Text>
              <Text style={[styles.metricValue, { color: colors.foreground }]}>
                {(steps / 1000).toFixed(1)}k
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Recommendation */}
      {recommendation && (
        <View style={styles.recommendation}>
          <Text style={[styles.recommendationText, { color: colors.muted }]}>
            {recommendation}
          </Text>
        </View>
      )}

      {/* Status Message */}
      <View
        style={[
          styles.statusMessage,
          { backgroundColor: `${scoreColor}15` },
        ]}
      >
        <Text style={[styles.statusText, { color: scoreColor }]}>
          {score < 30 && "Take it easy today - rest is important"}
          {score >= 30 && score < 50 && "You're running on moderate energy"}
          {score >= 50 && score < 70 && "You're feeling good - time to shine"}
          {score >= 70 && score < 85 && "You're in great form today"}
          {score >= 85 && "Peak energy! You're unstoppable today"}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  emoji: {
    fontSize: 28,
  },
  scoreDisplay: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 16,
  },
  scoreCircle: {
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNumber: {
    fontSize: 40,
    fontWeight: "700",
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  scoreBarContainer: {
    flex: 1,
  },
  scoreBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  scoreBarFill: {
    height: "100%",
    borderRadius: 4,
  },
  scoreLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scoreBarLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  metrics: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  metric: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  recommendation: {
    marginBottom: 12,
  },
  recommendationText: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: "italic",
  },
  statusMessage: {
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
  },
  compactContainer: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  compactContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  compactEmoji: {
    fontSize: 24,
  },
  compactInfo: {
    flex: 1,
  },
  compactLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
  },
  compactScore: {
    fontSize: 18,
    fontWeight: "700",
  },
});
