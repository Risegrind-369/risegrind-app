/**
 * Onboarding Q6: Wake Time
 *
 * "What time do you usually wake up?"
 * Single-select from time range options.
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

const WAKE_TIMES = [
  { id: "4am", emoji: "🌑", labelKey: "onboarding.q6.before5", defaultLabel: "Before 5:00 AM", desc: "Elite Ghost Mode" },
  { id: "5am", emoji: "🌒", labelKey: "onboarding.q6.at5", defaultLabel: "5:00 – 6:00 AM", desc: "Early Riser" },
  { id: "6am", emoji: "🌅", labelKey: "onboarding.q6.at6", defaultLabel: "6:00 – 7:00 AM", desc: "Morning Warrior" },
  { id: "7am", emoji: "☀️", labelKey: "onboarding.q6.at7", defaultLabel: "7:00 – 8:00 AM", desc: "Steady Builder" },
  { id: "8am", emoji: "🌤️", labelKey: "onboarding.q6.after8", defaultLabel: "After 8:00 AM", desc: "Starting the Journey" },
];

export default function Q6WakeTimeScreen() {
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
  }>();

  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelected(id);
  };

  const handleContinue = () => {
    if (!selected) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // ISSUE 1+5: Save step and wake time to context
    dispatch({ type: "SET_ONBOARDING_STEP", payload: "q6-waketime" });
    dispatch({ type: "SET_ONBOARDING_ANSWERS", payload: { wakeTime: selected } });
    router.push({
      pathname: "/onboarding/q7-motivation",
      params: {
        ...params,
        wakeTime: selected,
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
          style={[styles.progressBar, { backgroundColor: colors.accent, width: "75%" }]}
        />

        {/* Step indicator */}
        <Animated.Text
          entering={FadeInDown.delay(100)}
          style={[styles.stepLabel, { color: colors.muted }]}
        >
          {t("onboarding.step", { defaultValue: "Step" })} 6 / 7
        </Animated.Text>

        {/* Question */}
        <Animated.Text
          entering={FadeInDown.delay(150)}
          style={[styles.question, { color: colors.foreground }]}
        >
          {t("onboarding.q6.question", { defaultValue: "What time do you wake up?" })}
        </Animated.Text>

        {/* Subtitle */}
        <Animated.Text
          entering={FadeInDown.delay(200)}
          style={[styles.subtitle, { color: colors.muted }]}
        >
          {t("onboarding.q6.subtitle", {
            defaultValue: "Your morning routine will be built around this time.",
          })}
        </Animated.Text>

        {/* Wake Time Options */}
        <Animated.View entering={FadeInDown.delay(250)} style={styles.optionsList}>
          {WAKE_TIMES.map((option) => {
            const isSelected = selected === option.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => handleSelect(option.id)}
                style={({ pressed }) => [
                  styles.optionCard,
                  {
                    backgroundColor: isSelected ? colors.accent + "15" : colors.surface,
                    borderColor: isSelected ? colors.accent : colors.border,
                    opacity: pressed ? 0.85 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
              >
                <Text style={styles.optionEmoji}>{option.emoji}</Text>
                <Animated.View style={styles.optionTextGroup}>
                  <Text style={[styles.optionLabel, { color: isSelected ? colors.accent : colors.foreground }]}>
                    {t(option.labelKey, { defaultValue: option.defaultLabel })}
                  </Text>
                  <Text style={[styles.optionDesc, { color: colors.muted }]}>
                    {option.desc}
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
  optionsList: {
    gap: 10,
    marginTop: 4,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1.5,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 14,
  },
  optionEmoji: {
    fontSize: 28,
    width: 36,
    textAlign: "center",
  },
  optionTextGroup: {
    flex: 1,
    gap: 2,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 20,
  },
  optionDesc: {
    fontSize: 12,
    fontWeight: "500",
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
    marginTop: 4,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
