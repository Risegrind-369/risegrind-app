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
        <svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT} style={styles.svg}>
          {/* Grid lines */}
          <line x1="0" y1={GRAPH_HEIGHT * 0.25} x2={GRAPH_WIDTH} y2={GRAPH_HEIGHT * 0.25} stroke={colors.border} strokeWidth="1" opacity="0.3" />
          <line x1="0" y1={GRAPH_HEIGHT * 0.5} x2={GRAPH_WIDTH} y2={GRAPH_HEIGHT * 0.5} stroke={colors.border} strokeWidth="1" opacity="0.3" />
          <line x1="0" y1={GRAPH_HEIGHT * 0.75} x2={GRAPH_WIDTH} y2={GRAPH_HEIGHT * 0.75} stroke={colors.border} strokeWidth="1" opacity="0.3" />

          {/* Line */}
          <path d={pathD} stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />

          {/* End dot */}
          {points.length > 0 && (
            <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill={color} />
          )}
        </svg>
      </View>
      <Text style={[styles.graphLabel, { color: colors.foreground }]}>{label}</Text>
    </Animated.View>
  );
}

export default function Step5GraphsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/onboarding/step6-trial-reveal" as never);
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {t("onboarding.step5.title", { defaultValue: "Your Potential" })}
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {t("onboarding.step5.subtitle", {
                defaultValue: "See the difference 30 days can make.",
              })}
            </Text>
          </Animated.View>

          {/* Graphs */}
          <View style={styles.graphsRow}>
            <LineGraph
              points={flatLinePoints}
              color="#9CA3AF"
              label={t("onboarding.step5.without", { defaultValue: "Without\nRiseGrind" })}
              delay={200}
              colors={colors}
            />
            <LineGraph
              points={steepLinePoints}
              color={colors.accent}
              label={t("onboarding.step5.with", { defaultValue: "With\nRiseGrind" })}
              delay={400}
              colors={colors}
            />
          </View>

          {/* Annotation */}
          <Animated.View entering={FadeInDown.delay(600).duration(600)} style={styles.annotation}>
            <Text style={[styles.annotationText, { color: colors.muted }]}>
              {t("onboarding.step5.annotation", {
                defaultValue: "Most people stay here... You can be here in just 30 days.",
              })}
            </Text>
          </Animated.View>

          {/* Continue Button */}
          <Animated.View entering={FadeInDown.delay(700).duration(600)} style={styles.footer}>
            <Pressable
              onPress={handleContinue}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: colors.accent,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <Text style={styles.buttonText}>
                {t("onboarding.step5.continue", { defaultValue: "Let's Go" })}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 40,
    gap: 32,
  },
  header: {
    gap: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  graphsRow: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
  },
  graphContainer: {
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
    overflow: "visible",
  },
  graphLabel: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
    lineHeight: 18,
  },
  annotation: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "rgba(232, 168, 124, 0.1)",
  },
  annotationText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  footer: {
    gap: 16,
    marginTop: 16,
  },
  button: {
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
