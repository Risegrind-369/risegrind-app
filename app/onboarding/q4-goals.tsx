/**
 * Onboarding Q4: Main Goals (multi-select)
 *
 * "What do you want to achieve with RiseGrind?"
 * User selects 1-3 goals from a visual grid.
 */
import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

const GOALS = [
  { id: "discipline", emoji: "🧠", labelKey: "onboarding.goals.discipline", defaultLabel: "Build Discipline" },
  { id: "fitness", emoji: "💪", labelKey: "onboarding.goals.fitness", defaultLabel: "Get Fit" },
  { id: "career", emoji: "🚀", labelKey: "onboarding.goals.career", defaultLabel: "Advance Career" },
  { id: "mental_health", emoji: "🧘", labelKey: "onboarding.goals.mentalHealth", defaultLabel: "Mental Health" },
  { id: "finances", emoji: "💰", labelKey: "onboarding.goals.finances", defaultLabel: "Financial Growth" },
  { id: "relationships", emoji: "❤️", labelKey: "onboarding.goals.relationships", defaultLabel: "Better Relationships" },
  { id: "focus", emoji: "🎯", labelKey: "onboarding.goals.focus", defaultLabel: "Improve Focus" },
  { id: "confidence", emoji: "⚡", labelKey: "onboarding.goals.confidence", defaultLabel: "Build Confidence" },
];

export default function Q4GoalsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    name?: string;
    age?: string;
    empathyAnswer?: string;
    goalAnswer?: string;
  }>();

  const [selected, setSelected] = useState<string[]>([]);

  const toggleGoal = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((g) => g !== id)
        : prev.length < 3
        ? [...prev, id]
        : prev
    );
  };

  const isValid = selected.length >= 1;

  const handleContinue = () => {
    if (!isValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/onboarding/q5-problems",
      params: {
        ...params,
        selectedGoals: selected.join(","),
      },
    } as never);
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress Bar */}
        <Animated.View
          entering={FadeInDown.delay(50)}
          style={[styles.progressBar, { backgroundColor: colors.accent, width: "55%" }]}
        />

        {/* Step indicator */}
        <Animated.Text
          entering={FadeInDown.delay(100)}
          style={[styles.stepLabel, { color: colors.muted }]}
        >
          {t("onboarding.step", { defaultValue: "Step" })} 4 / 7
        </Animated.Text>

        {/* Question */}
        <Animated.Text
          entering={FadeInDown.delay(150)}
          style={[styles.question, { color: colors.foreground }]}
        >
          {t("onboarding.q4.question", { defaultValue: "What do you want to achieve?" })}
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(200)}
          style={[styles.subtitle, { color: colors.muted }]}
        >
          {t("onboarding.q4.subtitle", { defaultValue: "Pick up to 3 goals. Be honest with yourself." })}
        </Animated.Text>

        {/* Goals Grid */}
        <Animated.View entering={FadeInDown.delay(250)} style={styles.grid}>
          {GOALS.map((goal, i) => {
            const isSelected = selected.includes(goal.id);
            return (
              <TouchableOpacity
                key={goal.id}
                onPress={() => toggleGoal(goal.id)}
                activeOpacity={0.6}
              >
                <Text style={styles.goalEmoji}>{goal.emoji}</Text>
                <Text
                  style={[
                    styles.goalLabel,
                    { color: isSelected ? colors.accent : colors.foreground },
                  ]}
                >
                  {t(goal.labelKey, { defaultValue: goal.defaultLabel })}
                </Text>
                {isSelected && (
                  <View style={[styles.checkDot, { backgroundColor: colors.accent }]} />
                )}
              </TouchableOpacity>
            );
          })}
        </Animated.View>

        {/* Selection count */}
        <Animated.Text
          entering={FadeInDown.delay(300)}
          style={[styles.selectionCount, { color: colors.muted }]}
        >
          {selected.length}/3 {t("onboarding.q4.selected", { defaultValue: "selected" })}
        </Animated.Text>

        {/* Continue Button */}
        <Animated.View entering={FadeInDown.delay(350)}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!isValid}
            activeOpacity={0.6}
          >
            <Text style={[styles.buttonText, { opacity: isValid ? 1 : 0.5 }]}>
              {t("common.continue", { defaultValue: "Continue" })}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 16,
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
    marginBottom: 4,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  question: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: -4,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 4,
  },
  goalCard: {
    width: "47%",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 6,
    position: "relative",
  },
  goalEmoji: {
    fontSize: 26,
  },
  goalLabel: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 18,
  },
  checkDot: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  selectionCount: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
  button: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
