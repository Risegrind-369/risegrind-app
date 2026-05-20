/**
 * Onboarding Step 4b: AI Routine Generation
 *
 * After the personal message, the AI generates a personalized morning routine
 * and journal prompts based on all collected answers.
 * Shows a loading animation, then reveals the generated routine.
 */
import React, { useEffect, useRef, useState } from "react";
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/lib/language-context";
import Animated, {
  FadeInDown,
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";
import i18n from "@/lib/i18n";

export default function Step4bRoutineScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { language: userLanguage } = useLanguage();
  const { dispatch } = useApp();
  const params = useLocalSearchParams<{
    name?: string;
    age?: string;
    empathyAnswer?: string;
    goalAnswer?: string;
    selectedGoals?: string;
    selectedProblems?: string;
    wakeTime?: string;
    motivationStyle?: string;
  }>();

  const [phase, setPhase] = useState<"loading" | "reveal">("loading");
  const [routine, setRoutine] = useState<{
    habits: Array<{ name: string; icon: string; durationMin: number; reason: string }>;
    journalPrompts: string[];
    coachingTone: string;
    createdAt: number;
  } | null>(null);

  const generateRoutine = trpc.onboarding.generateRoutine.useMutation();

  // Pulsing glow animation during loading
  const glowOpacity = useSharedValue(0.4);
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  useEffect(() => {
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 900 }),
        withTiming(0.4, { duration: 900 })
      ),
      -1,
      false
    );

    // Trigger routine generation
    generateRoutine.mutate(
      {
        name: params.name || "Ghost",
        age: params.age || "20",
        selectedGoals: params.selectedGoals || "",
        selectedProblems: params.selectedProblems || "",
        wakeTime: params.wakeTime || "6am",
        motivationStyle: params.motivationStyle || "tough_love",
        empathyAnswer: params.empathyAnswer || "I want to be better",
        goalAnswer: params.goalAnswer || "Build discipline",
        language: (userLanguage || i18n.language?.slice(0, 2) as "en" | "fr" | "pt" || "en"),
      },
      {
        onSuccess: (data) => {
          setRoutine(data as typeof routine);
          setPhase("reveal");
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

          // Save to app context
          dispatch({ type: "SET_USER_PROFILE", payload: {
            goals: (params.selectedGoals || "").split(",").filter(Boolean),
            problems: (params.selectedProblems || "").split(",").filter(Boolean),
            wakeTime: params.wakeTime || "6am",
            motivationStyle: params.motivationStyle || "tough_love",
            empathyAnswer: params.empathyAnswer || "",
            goalAnswer: params.goalAnswer || "",
            age: params.age || "",
          }});
          dispatch({ type: "SET_GENERATED_ROUTINE", payload: data as typeof routine & { createdAt: number } });
        },
        onError: () => {
          // Use fallback and proceed
          const fallback = {
            habits: [
              { name: "Wake Up", icon: "⏰", durationMin: 0, reason: "Start with intention" },
              { name: "Hydrate", icon: "💧", durationMin: 2, reason: "Rehydrate after sleep" },
              { name: "Meditate", icon: "🧘", durationMin: 10, reason: "Clear your mind" },
              { name: "Exercise", icon: "💪", durationMin: 30, reason: "Build strength" },
              { name: "Journal", icon: "📓", durationMin: 10, reason: "Reflect and plan" },
            ],
            journalPrompts: [
              "What is the one thing I must accomplish today?",
              "What am I grateful for right now?",
              "What habit am I most proud of this week?",
              "What is holding me back and how do I overcome it?",
              "How will I show up differently today than yesterday?",
            ],
            coachingTone: "Direct, motivating, and focused on consistent daily action.",
            createdAt: Date.now(),
          };
          setRoutine(fallback);
          setPhase("reveal");
          dispatch({ type: "SET_USER_PROFILE", payload: {
            goals: (params.selectedGoals || "").split(",").filter(Boolean),
            problems: (params.selectedProblems || "").split(",").filter(Boolean),
            wakeTime: params.wakeTime || "6am",
            motivationStyle: params.motivationStyle || "tough_love",
            empathyAnswer: params.empathyAnswer || "",
            goalAnswer: params.goalAnswer || "",
            age: params.age || "",
          }});
          dispatch({ type: "SET_GENERATED_ROUTINE", payload: fallback });
        },
      }
    );
  }, []);

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push("/onboarding/step5-graphs" as never);
  };

  if (phase === "loading") {
    return (
      <ScreenContainer containerClassName="bg-background">
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.glowCircle, glowStyle, { borderColor: colors.accent }]}>
            <Text style={styles.ghostEmoji}>👻</Text>
          </Animated.View>
          <Animated.Text
            entering={FadeIn.delay(300)}
            style={[styles.loadingTitle, { color: colors.foreground }]}
          >
            {t("onboarding.routine.generating", { defaultValue: "Building your routine..." })}
          </Animated.Text>
          <Animated.Text
            entering={FadeIn.delay(600)}
            style={[styles.loadingSubtitle, { color: colors.muted }]}
          >
            {t("onboarding.routine.generatingSubtitle", {
              defaultValue: "The AI is analyzing your goals and obstacles to craft something personal.",
            })}
          </Animated.Text>
          <ActivityIndicator color={colors.accent} size="small" style={{ marginTop: 24 }} />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.delay(50)} style={styles.header}>
          <Text style={styles.headerEmoji}>✨</Text>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {t("onboarding.routine.title", { defaultValue: "Your Personalized Routine" })}
          </Text>
          <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
            {t("onboarding.routine.subtitle", {
              defaultValue: "Built specifically for you. You can customize it anytime.",
            })}
          </Text>
        </Animated.View>

        {/* Coaching Tone */}
        {routine?.coachingTone && (
          <Animated.View
            entering={FadeInDown.delay(100)}
            style={[styles.toneCard, { backgroundColor: colors.accent + "15", borderColor: colors.accent }]}
          >
            <Text style={[styles.toneLabel, { color: colors.accent }]}>
              🎯 {t("onboarding.routine.coachingStyle", { defaultValue: "Your AI Coach Style" })}
            </Text>
            <Text style={[styles.toneText, { color: colors.foreground }]}>
              {routine.coachingTone}
            </Text>
          </Animated.View>
        )}

        {/* Habits */}
        <Animated.View entering={FadeInDown.delay(150)}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            🌅 {t("onboarding.routine.morningHabits", { defaultValue: "Morning Habits" })}
          </Text>
          <View style={styles.habitsList}>
            {routine?.habits.map((habit, i) => (
              <Animated.View
                key={i}
                entering={FadeInDown.delay(200 + i * 60)}
                style={[styles.habitCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={styles.habitEmoji}>{habit.icon}</Text>
                <View style={styles.habitInfo}>
                  <Text style={[styles.habitName, { color: colors.foreground }]}>{habit.name}</Text>
                  <Text style={[styles.habitReason, { color: colors.muted }]}>{habit.reason}</Text>
                </View>
                {habit.durationMin > 0 && (
                  <Text style={[styles.habitDuration, { color: colors.accent }]}>
                    {habit.durationMin}m
                  </Text>
                )}
              </Animated.View>
            ))}
          </View>
        </Animated.View>

        {/* Journal Prompts Preview */}
        <Animated.View entering={FadeInDown.delay(500)}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            📓 {t("onboarding.routine.journalPrompts", { defaultValue: "Daily Journal Prompts" })}
          </Text>
          <View style={[styles.promptsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            {routine?.journalPrompts.slice(0, 3).map((prompt, i) => (
              <View key={i} style={styles.promptRow}>
                <Text style={[styles.promptDot, { color: colors.accent }]}>•</Text>
                <Text style={[styles.promptText, { color: colors.muted }]}>{prompt}</Text>
              </View>
            ))}
            {(routine?.journalPrompts.length ?? 0) > 3 && (
              <Text style={[styles.morePrompts, { color: colors.accent }]}>
                +{(routine?.journalPrompts.length ?? 0) - 3} {t("onboarding.routine.morePrompts", { defaultValue: "more prompts" })}
              </Text>
            )}
          </View>
        </Animated.View>

        {/* Continue Button */}
        <Animated.View entering={FadeInDown.delay(600)}>
          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.6}
          >
            <Text style={styles.buttonText}>
              {t("onboarding.routine.cta", { defaultValue: "This Looks Great →" })}
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 16,
  },
  glowCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  ghostEmoji: {
    fontSize: 48,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  loadingSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 48,
    gap: 20,
  },
  header: {
    alignItems: "center",
    gap: 8,
    paddingBottom: 4,
  },
  headerEmoji: {
    fontSize: 40,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  toneCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    gap: 6,
  },
  toneLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  toneText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  habitsList: {
    gap: 8,
  },
  habitCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 12,
  },
  habitEmoji: {
    fontSize: 22,
    width: 30,
    textAlign: "center",
  },
  habitInfo: {
    flex: 1,
    gap: 2,
  },
  habitName: {
    fontSize: 15,
    fontWeight: "700",
  },
  habitReason: {
    fontSize: 12,
    lineHeight: 16,
  },
  habitDuration: {
    fontSize: 13,
    fontWeight: "700",
  },
  promptsCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  promptRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  promptDot: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "800",
  },
  promptText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  morePrompts: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "right",
    marginTop: 4,
  },
  button: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
