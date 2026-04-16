/**
 * Ghost Mirror Card
 * Weekly AI-generated future self visualization based on current progress
 */
import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, {
  FadeIn,
  ZoomIn,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";

interface GhostMirrorCardProps {
  visualization: string;
  streak: number;
  xp: number;
}

export function GhostMirrorCard({
  visualization,
  streak,
  xp,
}: GhostMirrorCardProps) {
  const colors = useColors();
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 1000 });
  }, [opacity]);

  return (
    <Animated.View
      entering={ZoomIn.springify()}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.primary,
          borderWidth: 2,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.primary }]}>
          👻 Ghost Mirror
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Your future self is watching
        </Text>
      </View>

      {/* Visualization */}
      <Animated.View style={[{ opacity }]}>
        <Text
          style={[styles.visualization, { color: colors.foreground }]}
        >
          {visualization}
        </Text>
      </Animated.View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.primary }]}>
            {streak}
          </Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>
            Day Streak
          </Text>
        </View>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.statItem}>
          <Text style={[styles.statValue, { color: colors.success }]}>
            {xp}
          </Text>
          <Text style={[styles.statLabel, { color: colors.muted }]}>
            XP Earned
          </Text>
        </View>
      </View>

      {/* Motivational Footer */}
      <Text style={[styles.footer, { color: colors.muted }]}>
        "This is who you're becoming. Keep going."
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 16,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
  },
  visualization: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingVertical: 12,
  },
  statItem: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  divider: {
    width: 1,
    height: 30,
    marginHorizontal: 12,
  },
  footer: {
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 18,
  },
});
