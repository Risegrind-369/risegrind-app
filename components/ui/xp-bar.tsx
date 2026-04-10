import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import { getRank, getNextRankXP, RANK_THRESHOLDS } from "@/lib/app-context";

interface XPBarProps {
  xp: number;
}

export function XPBar({ xp }: XPBarProps) {
  const colors = useColors();
  const rank = getRank(xp);
  const nextXP = getNextRankXP(xp);

  // Find current rank threshold
  let currentRankXP = 0;
  for (const tier of RANK_THRESHOLDS) {
    if (xp >= tier.minXP) currentRankXP = tier.minXP;
  }

  const rangeSize = nextXP - currentRankXP;
  const progress = rangeSize > 0 ? Math.min((xp - currentRankXP) / rangeSize, 1) : 1;

  const animWidth = useSharedValue(0);

  useEffect(() => {
    animWidth.value = withTiming(progress, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${animWidth.value * 100}%`,
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.rank, { color: colors.primary }]}>{rank}</Text>
        <Text style={[styles.xpText, { color: colors.muted }]}>
          {xp.toLocaleString()} / {nextXP.toLocaleString()} XP
        </Text>
      </View>
      <View style={[styles.track, { backgroundColor: colors.border }]}>
        <Animated.View
          style={[
            styles.fill,
            barStyle,
            { backgroundColor: colors.primary },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rank: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  xpText: {
    fontSize: 12,
    fontWeight: "500",
  },
  track: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
});
