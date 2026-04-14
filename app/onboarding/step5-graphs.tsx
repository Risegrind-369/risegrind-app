/**
 * Onboarding Step 5: Animated Comparison Graphs
 *
 * Shows two side-by-side line graphs:
 * - Left: "Without RiseGrind" (flat, gray line)
 * - Right: "With RiseGrind" (steep, orange line)
 *
 * Uses Reanimated for smooth animations.
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Dimensions,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  FadeInDown,
} from "react-native-reanimated";
import { Svg, Line, Path, Circle } from "react-native-svg";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRAPH_WIDTH = (SCREEN_WIDTH - 48 - 16) / 2; // Two graphs with gap
const GRAPH_HEIGHT = 180;
const DATA_POINTS = 9;

// Generate flat line (without app)
const flatLinePoints = Array.from({ length: DATA_POINTS }, (_, i) => ({
  x: (i / (DATA_POINTS - 1)) * GRAPH_WIDTH,
  y: GRAPH_HEIGHT * 0.7, // Stays flat at 70%
}));

// Generate steep line (with app)
const steepLinePoints = Array.from({ length: DATA_POINTS }, (_, i) => {
  const progress = i / (DATA_POINTS - 1);
  const y = GRAPH_HEIGHT * (1 - progress * 0.8); // Goes from 100% to 20%
  return { x: (progress) * GRAPH_WIDTH, y };
});

function LineGraph({
  points,
  color,
  label,
  delay,
  colors,
}: {
  points: { x: number; y: number }[];
  color: string;
  label: string;
  delay: number;
  colors: ReturnType<typeof useColors>;
}) {
  const pathLength = useSharedValue(0);

  useEffect(() => {
    pathLength.value = withTiming(1, {
      duration: 1200,
      easing: Easing.out(Easing.cubic),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pathLength.value,
  }));

  // Build SVG path
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(600)}
      style={[styles.graphContainer, animatedStyle]}
    >
      <View style={[styles.graph, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT} style={styles.svg}>
          {/* Grid lines */}
          <Line x1="0" y1={GRAPH_HEIGHT * 0.25} x2={GRAPH_WIDTH} y2={GRAPH_HEIGHT * 0.25} stroke={colors.border} strokeWidth="1" opacity="0.3" />
          <Line x1="0" y1={GRAPH_HEIGHT * 0.5} x2={GRAPH_WIDTH} y2={GRAPH_HEIGHT * 0.5} stroke={colors.border} strokeWidth="1" opacity="0.3" />
          <Line x1="0" y1={GRAPH_HEIGHT * 0.75} x2={GRAPH_WIDTH} y2={GRAPH_HEIGHT * 0.75} stroke={colors.border} strokeWidth="1" opacity="0.3" />

          {/* Line */}
          <Path d={pathD} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

          {/* End dot */}
          {points.length > 0 && (
            <Circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill={color} />
          )}
        </Svg>
      </View>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
    </Animated.View>
  );
}

export default function Step5Graphs() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useColors();

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-8 flex-1">
          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold text-foreground">{t("onboarding.graphs.title")}</Text>
            <Text className="text-base text-muted text-center">{t("onboarding.graphs.subtitle")}</Text>
          </View>

          {/* Graphs */}
          <View style={styles.graphsContainer}>
            <LineGraph
              points={flatLinePoints}
              color={colors.muted}
              label={t("onboarding.graphs.without")}
              delay={0}
              colors={colors}
            />
            <LineGraph
              points={steepLinePoints}
              color={colors.accent}
              label={t("onboarding.graphs.with")}
              delay={200}
              colors={colors}
            />
          </View>

          {/* CTA */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/onboarding/step6-trial-reveal");
            }}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.accent, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={styles.buttonText}>{t("onboarding.graphs.next")}</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  graphsContainer: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
  },
  graphContainer: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  graph: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    width: "100%",
    height: "100%",
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
