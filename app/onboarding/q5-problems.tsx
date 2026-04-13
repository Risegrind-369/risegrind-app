/**
 * Onboarding Q5: Biggest Problems (multi-select)
 *
 * "What's holding you back right now?"
 * User selects up to 3 problems from a visual grid.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

const PROBLEMS = [
  { id: "procrastination", emoji: "⏳", labelKey: "onboarding.problems.procrastination", defaultLabel: "Procrastination" },
  { id: "no_routine", emoji: "🌀", labelKey: "onboarding.problems.noRoutine", defaultLabel: "No Routine" },
  { id: "low_energy", emoji: "🔋", labelKey: "onboarding.problems.lowEnergy", defaultLabel: "Low Energy" },
  { id: "lack_focus", emoji: "🌫️", labelKey: "onboarding.problems.lackFocus", defaultLabel: "Lack of Focus" },
  { id: "bad_habits", emoji: "🚫", labelKey: "onboarding.problems.badHabits", defaultLabel: "Bad Habits" },
  { id: "stress", emoji: "😤", labelKey: "onboarding.problems.stress", defaultLabel: "Stress & Anxiety" },
  { id: "no_motivation", emoji: "😶", labelKey: "onboarding.problems.noMotivation", defaultLabel: "No Motivation" },
  { id: "phone_addiction", emoji: "📱", labelKey: "onboarding.problems.phoneAddiction", defaultLabel: "Phone Addiction" },
];

export default function Q5ProblemsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    name?: string;
    age?: string;
    empathyAnswer?: string;
    goalAnswer?: string;
    selectedGoals?: string;
  }>();

  const [selected, setSelected] = useState<string[]>([]);

  const toggleProblem = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((p) => p !== id)
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
      pathname: "/onboarding/q6-waketime",
      params: {
        ...params,
        selectedProblems: selected.join(","),
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
          style={[styles.progressBar, { backgroundColor: colors.accent, width: "65%" }]}
        />

        {/* Step indicator */}
        <Animated.Text
          entering={FadeInDown.delay(100)}
          style={[styles.stepLabel, { color: colors.muted }]}
        >
          {t("onboarding.step", { defaultValue: "Step" })} 5 / 7
        </Animated.Text>

        {/* Question */}
        <Animated.Text
          entering={FadeInDown.delay(150)}
          style={[styles.question, { color: colors.foreground }]}
        >
          {t("onboarding.q5.question", { defaultValue: "What's holding you back?" })}
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(200)}
          style={[styles.subtitle, { color: colors.muted }]}
        >
          {t("onboarding.q5.subtitle", {
            defaultValue: "Be honest. The AI will use this to build your routine around your real obstacles.",
          })}
        </Animated.Text>

        {/* Problems Grid */}
        <Animated.View entering={FadeInDown.delay(250)} style={styles.grid}>
          {PROBLEMS.map((problem) => {
            const isSelected = selected.includes(problem.id);
            return (
              <Pressable
                key={problem.id}
                onPress={() => toggleProblem(problem.id)}
                style={({ pressed }) => [
                  styles.problemCard,
                  {
                    backgroundColor: isSelected ? "#EF444420" : colors.surface,
                    borderColor: isSelected ? "#EF4444" : colors.border,
                    opacity: pressed ? 0.85 : 1,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <Text style={styles.problemEmoji}>{problem.emoji}</Text>
                <Text
                  style={[
                    styles.problemLabel,
                    { color: isSelected ? "#EF4444" : colors.foreground },
                  ]}
                >
                  {t(problem.labelKey, { defaultValue: problem.defaultLabel })}
                </Text>
                {isSelected && (
                  <View style={[styles.checkDot, { backgroundColor: "#EF4444" }]} />
                )}
              </Pressable>
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
          <Pressable
            onPress={handleContinue}
            disabled={!isValid}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: isValid ? colors.accent : colors.muted + "30",
                transform: [{ scale: pressed && isValid ? 0.97 : 1 }],
              },
            ]}
          >
            <Text style={[styles.buttonText, { opacity: isValid ? 1 : 0.5 }]}>
              {t("common.continue", { defaultValue: "Continue" })}
            </Text>
          </Pressable>
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
  problemCard: {
    width: "47%",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 16,
    paddingHorizontal: 14,
    gap: 6,
    position: "relative",
  },
  problemEmoji: {
    fontSize: 26,
  },
  problemLabel: {
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
