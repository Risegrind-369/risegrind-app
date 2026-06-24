/**
 * Onboarding Step 5: Cal AI-Style Single Comparison Graph
 *
 * Shows ONE large graph with both lines overlaid:
 * - Smooth bezier curves (not straight lines)
 * - X-axis labels (3 Days, 7 Days, 30 Days)
 * - Y-axis labels (0%, 50%, 100%)
 * - Gray flat line: "Without RiseGrind"
 * - Orange steep line: "With RiseGrind"
 *
 * Uses Reanimated for smooth animations.
 */
import React, { useEffect } from "react";
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
const GRAPH_WIDTH = SCREEN_WIDTH - 48; // Full width with padding
const GRAPH_HEIGHT = 240;
const PADDING = 45; // Space for axis labels
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

export default function Step5Graphs() {
  const router = useRouter();
  const { t } = useTranslation();
  const colors = useColors();

  const flatPathLength = useSharedValue(0);
  const steepPathLength = useSharedValue(0);

  // Animate graphs
  useEffect(() => {
    flatPathLength.value = withTiming(1, {
      duration: 1000,
      easing: Easing.out(Easing.cubic),
    });

    setTimeout(() => {
      steepPathLength.value = withTiming(1, {
        duration: 1200,
        easing: Easing.out(Easing.cubic),
      });
    }, 200);
  }, []);

  const flatAnimatedStyle = useAnimatedStyle(() => ({
    opacity: flatPathLength.value,
  }));

  const steepAnimatedStyle = useAnimatedStyle(() => ({
    opacity: steepPathLength.value,
  }));

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Generate smooth bezier paths
  const flatPathD = generateSmoothPath(flatLinePoints);
  const steepPathD = generateSmoothPath(steepLinePoints);

  return (
    <ScreenContainer className="p-6">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-8 flex-1">
          {/* Back Button */}
          <Pressable onPress={handleBack} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, marginBottom: 8 }]}>
            <Text style={{ fontSize: 24 }}>← Back</Text>
          </Pressable>

          {/* Header */}
          <View className="items-center gap-2">
            <Text className="text-3xl font-bold text-foreground">
              {t("onboarding.step5.title", { defaultValue: "Your Potential" })}
            </Text>
            <Text className="text-base text-muted text-center">
              {t("onboarding.step5.subtitle", { defaultValue: "See the difference 30 days can make." })}
            </Text>
          </View>

          {/* Single Mutual Graph */}
          <Animated.View
            entering={FadeInDown.delay(0).duration(600)}
            style={[styles.graphContainer, flatAnimatedStyle]}
          >
            <View style={[styles.graph, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT} style={styles.svg}>
                {/* Y-axis labels (0%, 50%, 100%) */}
                <SvgText
                  x="8"
                  y={INNER_HEIGHT + 20}
                  fontSize="11"
                  fill={colors.muted}
                  textAnchor="start"
                  fontWeight="500"
                >
                  0%
                </SvgText>
                <SvgText
                  x="8"
                  y={INNER_HEIGHT / 2 + 20}
                  fontSize="11"
                  fill={colors.muted}
                  textAnchor="start"
                  fontWeight="500"
                >
                  50%
                </SvgText>
                <SvgText
                  x="8"
                  y={20}
                  fontSize="11"
                  fill={colors.muted}
                  textAnchor="start"
                  fontWeight="500"
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
                  opacity="0.15"
                />
                <Line
                  x1={PADDING - 10}
                  y1={INNER_HEIGHT * 0.5}
                  x2={GRAPH_WIDTH}
                  y2={INNER_HEIGHT * 0.5}
                  stroke={colors.border}
                  strokeWidth="1"
                  opacity="0.15"
                />
                <Line
                  x1={PADDING - 10}
                  y1={INNER_HEIGHT * 0.75}
                  x2={GRAPH_WIDTH}
                  y2={INNER_HEIGHT * 0.75}
                  stroke={colors.border}
                  strokeWidth="1"
                  opacity="0.15"
                />

                {/* Flat line (without RiseGrind) */}
                <Animated.View style={flatAnimatedStyle}>
                  <Path
                    d={flatPathD}
                    stroke={colors.muted}
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.6"
                  />
                </Animated.View>

                {/* Steep line (with RiseGrind) */}
                <Animated.View style={steepAnimatedStyle}>
                  <Path
                    d={steepPathD}
                    stroke={colors.accent}
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </Animated.View>

                {/* Flat line data points */}
                {flatLinePoints.map((p, i) => (
                  <Circle
                    key={`flat-${i}`}
                    cx={p.x + PADDING - 10}
                    cy={p.y}
                    r="3"
                    fill={colors.muted}
                    opacity="0.6"
                  />
                ))}

                {/* Steep line data points */}
                {steepLinePoints.map((p, i) => (
                  <Circle
                    key={`steep-${i}`}
                    cx={p.x + PADDING - 10}
                    cy={p.y}
                    r="3.5"
                    fill={colors.accent}
                  />
                ))}

                {/* X-axis labels (3D, 7D, 30D) */}
                {flatLinePoints.map((p, i) => (
                  <SvgText
                    key={`label-${i}`}
                    x={p.x + PADDING - 10}
                    y={INNER_HEIGHT + 25}
                    fontSize="11"
                    fill={colors.muted}
                    textAnchor="middle"
                    fontWeight="500"
                  >
                    {p.label}
                  </SvgText>
                ))}
              </Svg>
            </View>
          </Animated.View>

          {/* Legend */}
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.muted }]} />
              <Text style={[styles.legendText, { color: colors.muted }]}>
                {t("onboarding.step5.without", { defaultValue: "Without RiseGrind" })}
              </Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.accent }]} />
              <Text style={[styles.legendText, { color: colors.foreground }]}>
                {t("onboarding.step5.with", { defaultValue: "With RiseGrind" })}
              </Text>
            </View>
          </View>

          {/* Description */}
          <Text style={[styles.description, { color: colors.muted }]}>
            {t("onboarding.step5.annotation", { defaultValue: "Most people stay here... You can be here in just 30 days." })}
          </Text>

          {/* CTA */}
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.replace("/onboarding/step7-notifications");
            }}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: colors.accent, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={styles.buttonText}>
              {t("onboarding.step5.continue", { defaultValue: "Let's Go" })}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  graphContainer: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    width: "100%",
  },
  graph: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 0,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  svg: {
    width: "100%",
    height: "100%",
  },
  legend: {
    flexDirection: "row",
    gap: 24,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    fontWeight: "500",
  },
  description: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    marginVertical: 8,
    lineHeight: 20,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
});
