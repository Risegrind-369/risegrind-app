/**
 * Onboarding Step 5: Cal AI-Style Animated Comparison Graphs
 *
 * Shows two side-by-side line graphs with:
 * - Smooth bezier curves (not straight lines)
 * - X-axis labels (3 Days, 7 Days, 30 Days)
 * - Y-axis labels (0%, 50%, 100%)
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
import { Svg, Line, Path, Circle, Text as SvgText } from "react-native-svg";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRAPH_WIDTH = (SCREEN_WIDTH - 48 - 16) / 2; // Two graphs with gap
const GRAPH_HEIGHT = 200;
const PADDING = 40; // Space for axis labels
const INNER_WIDTH = GRAPH_WIDTH - PADDING;
const INNER_HEIGHT = GRAPH_HEIGHT - PADDING;
const DATA_POINTS = 3; // 3 Days, 7 Days, 30 Days

// Generate flat line (without app) - stays relatively flat
const flatLinePoints = Array.from({ length: DATA_POINTS }, (_, i) => ({
  x: (i / (DATA_POINTS - 1)) * INNER_WIDTH,
  y: INNER_HEIGHT * 0.65, // Stays around 65% height
  label: i === 0 ? "3D" : i === 1 ? "7D" : "30D",
}));

// Generate steep line (with app) - shows improvement
const steepLinePoints = Array.from({ length: DATA_POINTS }, (_, i) => {
  const progress = i / (DATA_POINTS - 1);
  const y = INNER_HEIGHT * (1 - progress * 0.7); // Goes from 100% to 30%
  return {
    x: progress * INNER_WIDTH,
    y,
    label: i === 0 ? "3D" : i === 1 ? "7D" : "30D",
  };
});

/**
 * Generate smooth bezier curve from points
 * Creates smooth curves instead of straight lines
 */
function generateSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length < 2) return "";

  let path = `M ${points[0].x} ${points[0].y}`;

  for (let i = 1; i < points.length; i++) {
    const curr = points[i];
    const prev = points[i - 1];

    // Calculate control points for smooth bezier curve
    const cp1x = prev.x + (curr.x - prev.x) / 3;
    const cp1y = prev.y;
    const cp2x = prev.x + (curr.x - prev.x) * (2 / 3);
    const cp2y = curr.y;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
  }

  return path;
}

function LineGraph({
  points,
  color,
  label,
  delay,
  colors,
}: {
  points: { x: number; y: number; label: string }[];
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

  // Generate smooth bezier path
  const pathD = generateSmoothPath(points);

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).duration(600)}
      style={[styles.graphContainer, animatedStyle]}
    >
      <View style={[styles.graph, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT} style={styles.svg}>
          {/* Y-axis labels (0%, 50%, 100%) */}
          <SvgText
            x="5"
            y={INNER_HEIGHT + 15}
            fontSize="10"
            fill={colors.muted}
            textAnchor="start"
          >
            0%
          </SvgText>
          <SvgText
            x="5"
            y={INNER_HEIGHT / 2 + 15}
            fontSize="10"
            fill={colors.muted}
            textAnchor="start"
          >
            50%
          </SvgText>
          <SvgText
            x="5"
            y={15}
            fontSize="10"
            fill={colors.muted}
            textAnchor="start"
          >
            100%
          </SvgText>

          {/* Y-axis */}
          <Line
            x1={PADDING - 10}
            y1="0"
            x2={PADDING - 10}
            y2={INNER_HEIGHT}
            stroke={colors.border}
            strokeWidth="1"
            opacity="0.5"
          />

          {/* X-axis */}
          <Line
            x1={PADDING - 10}
            y1={INNER_HEIGHT}
            x2={GRAPH_WIDTH}
            y2={INNER_HEIGHT}
            stroke={colors.border}
            strokeWidth="1"
            opacity="0.5"
          />

          {/* Horizontal grid lines */}
          <Line
            x1={PADDING - 10}
            y1={INNER_HEIGHT * 0.25}
            x2={GRAPH_WIDTH}
            y2={INNER_HEIGHT * 0.25}
            stroke={colors.border}
            strokeWidth="1"
            opacity="0.2"
          />
          <Line
            x1={PADDING - 10}
            y1={INNER_HEIGHT * 0.5}
            x2={GRAPH_WIDTH}
            y2={INNER_HEIGHT * 0.5}
            stroke={colors.border}
            strokeWidth="1"
            opacity="0.2"
          />
          <Line
            x1={PADDING - 10}
            y1={INNER_HEIGHT * 0.75}
            x2={GRAPH_WIDTH}
            y2={INNER_HEIGHT * 0.75}
            stroke={colors.border}
            strokeWidth="1"
            opacity="0.2"
          />

          {/* Smooth curve path */}
          <Path
            d={pathD}
            stroke={color}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data point dots */}
          {points.map((p, i) => (
            <Circle
              key={i}
              cx={p.x + PADDING - 10}
              cy={p.y}
              r="3.5"
              fill={color}
            />
          ))}

          {/* X-axis labels (3D, 7D, 30D) */}
          {points.map((p, i) => (
            <SvgText
              key={`label-${i}`}
              x={p.x + PADDING - 10}
              y={INNER_HEIGHT + 20}
              fontSize="10"
              fill={colors.muted}
              textAnchor="middle"
            >
              {p.label}
            </SvgText>
          ))}
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
            <Text className="text-3xl font-bold text-foreground">{t("onboarding.graphs.title", { defaultValue: "Your Potential" })}</Text>
            <Text className="text-base text-muted text-center">{t("onboarding.graphs.subtitle", { defaultValue: "See what's possible in 30 days" })}</Text>
          </View>

          {/* Graphs */}
          <View style={styles.graphsContainer}>
            <LineGraph
              points={flatLinePoints}
              color={colors.muted}
              label={t("onboarding.graphs.without", { defaultValue: "Without RiseGrind" })}
              delay={0}
              colors={colors}
            />
            <LineGraph
              points={steepLinePoints}
              color={colors.accent}
              label={t("onboarding.graphs.with", { defaultValue: "With RiseGrind" })}
              delay={200}
              colors={colors}
            />
          </View>

          {/* Subtitle text */}
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {t("onboarding.graphs.description", { defaultValue: "Most people stay here... You can be here in just 30 days." })}
          </Text>

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
            <Text style={styles.buttonText}>{t("onboarding.graphs.next", { defaultValue: "Continue" })}</Text>
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
    padding: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  svg: {
    width: "100%",
    height: "100%",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginVertical: 8,
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
