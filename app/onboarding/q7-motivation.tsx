/**
 * Onboarding Q7: Motivation Style
 *
 * "How do you want to be coached by the AI?"
 * Single-select from 4 coaching styles.
 * After this, user proceeds to AI message + routine generation.
 */
import React, { useState } from "react";
import {
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
import { useApp } from "@/lib/app-context";
import * as Haptics from "expo-haptics";

const MOTIVATION_STYLES = [
  {
    id: "tough_love",
    emoji: "🔥",
    labelKey: "onboarding.q7.toughLove",
    defaultLabel: "Tough Love",
    descKey: "onboarding.q7.toughLoveDesc",
    defaultDesc: "No excuses. Push hard. Brutal honesty.",
  },
  {
    id: "gentle",
    emoji: "🌱",
    labelKey: "onboarding.q7.gentle",
    defaultLabel: "Gentle Encouragement",
    descKey: "onboarding.q7.gentleDesc",
    defaultDesc: "Supportive, kind, and patient coaching.",
  },
  {
    id: "data_driven",
    emoji: "📊",
    labelKey: "onboarding.q7.dataDriven",
    defaultLabel: "Data & Stats",
    descKey: "onboarding.q7.dataDrivenDesc",
    defaultDesc: "Track everything. Optimize with numbers.",
  },
  {
    id: "challenge",
    emoji: "🏆",
    labelKey: "onboarding.q7.challenge",
    defaultLabel: "Challenge Mode",
    descKey: "onboarding.q7.challengeDesc",
    defaultDesc: "Daily challenges and competitive goals.",
  },
];

export default function Q7MotivationScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { dispatch } = useApp();
  const params = useLocalSearchParams<{
    name?: string;
    age?: string;
    empathyAnswer?: string;
    goalAnswer?: string;
    selectedGoals?: string;
    selectedProblems?: string;
    wakeTime?: string;
  }>();

  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(id);
  };

  const handleContinue = () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // ISSUE 1+5: Save step and motivation style to context
    dispatch({ type: "SET_ONBOARDING_STEP", payload: "q7-motivation" });
    dispatch({ type: "SET_ONBOARDING_ANSWERS", payload: { motivationStyle: selected } });
    // Navigate to AI message screen with all collected data
    router.push({
      pathname: "/onboarding/step4-ai-message",
      params: {
        name: params.name || "",
        age: params.age || "",
        empathyAnswer: params.empathyAnswer || "",
        goalAnswer: params.goalAnswer || "",
        selectedGoals: params.selectedGoals || "",
        selectedProblems: params.selectedProblems || "",
        wakeTime: params.wakeTime || "6am",
        motivationStyle: selected,
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
          style={[styles.progressBar, { backgroundColor: colors.accent, width: "90%" }]}
        />

        {/* Step indicator */}
        <Animated.Text
          entering={FadeInDown.delay(100)}
          style={[styles.stepLabel, { color: colors.muted }]}
        >
          {t("onboarding.step", { defaultValue: "Step" })} 7 / 7
        </Animated.Text>

        {/* Question */}
        <Animated.Text
          entering={FadeInDown.delay(150)}
          style={[styles.question, { color: colors.foreground }]}
        >
          {t("onboarding.q7.question", { defaultValue: "How should the AI coach you?" })}
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(200)}
          style={[styles.subtitle, { color: colors.muted }]}
        >
          {t("onboarding.q7.subtitle", {
            defaultValue: "This shapes your AI mentor's tone in journals, insights, and daily coaching.",
          })}
        </Animated.Text>

        {/* Style Options */}
        <Animated.View entering={FadeInDown.delay(250)} style={styles.optionsList}>
          {MOTIVATION_STYLES.map((style) => {
            const isSelected = selected === style.id;
            return (
              <Pressable
                key={style.id}
                onPress={() => handleSelect(style.id)}
                style={({ pressed }) => [
                  styles.styleCard,
                  {
                    backgroundColor: isSelected ? colors.accent + "15" : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border,
                    opacity: pressed ? 0.85 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <Text style={styles.styleEmoji}>{style.emoji}</Text>
                <Animated.View style={styles.styleTextGroup}>
                  <Text style={[styles.styleLabel, { color: isSelected ? colors.accent : colors.foreground }]}>
                    {t(style.labelKey, { defaultValue: style.defaultLabel })}
                  </Text>
                  <Text style={[styles.styleDesc, { color: colors.muted }]}>
                    {t(style.descKey, { defaultValue: style.defaultDesc })}
                  </Text>
                </Animated.View>
                {isSelected && (
                  <Text style={[styles.checkmark, { color: colors.accent }]}>✓</Text>
                )}
              </Pressable>
            );
          })}
        </Animated.View>

        {/* Continue Button */}
        <Animated.View entering={FadeInDown.delay(350)}>
          <Pressable
            onPress={handleContinue}
            disabled={!selected}
            style={({ pressed }) => [
              styles.button,
              {
                backgroundColor: selected ? colors.accent : colors.muted + "30",
                transform: [{ scale: pressed && selected ? 0.97 : 1 }],
              },
            ]}
          >
            <Text style={[styles.buttonText, { opacity: selected ? 1 : 0.5 }]}>
              {t("onboarding.q7.cta", { defaultValue: "Build My Routine →" })}
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
  optionsList: {
    gap: 10,
    marginTop: 4,
  },
  styleCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 14,
  },
  styleEmoji: {
    fontSize: 28,
    width: 36,
    textAlign: "center",
  },
  styleTextGroup: {
    flex: 1,
    gap: 3,
  },
  styleLabel: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 20,
  },
  styleDesc: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: "800",
  },
  button: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
