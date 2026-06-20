/**
 * Onboarding Step 4: AI Personalization Message
 *
 * Calls the server to generate a deeply personal message based on user answers.
 * Shows loading state, then displays the message with animation.
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown, FadeIn } from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useLanguage } from "@/lib/language-context";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

export default function Step4AIMessageScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { language } = useLanguage();
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

  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Call server to generate personalized message
  const generateMessage = trpc.onboarding.generatePersonalMessage.useMutation();

  useEffect(() => {
    const fetchMessage = async () => {
      try {
        const result = await generateMessage.mutateAsync({
          name: params.name || "Friend",
          age: params.age || "unknown",
          empathyAnswer: params.empathyAnswer || "",
          goalAnswer: params.goalAnswer || "",
          selectedGoals: params.selectedGoals || "",
          selectedProblems: params.selectedProblems || "",
          wakeTime: params.wakeTime || "6am",
          motivationStyle: params.motivationStyle || "tough_love",
          language: (language as "en" | "fr" | "pt") || "en",
        });
        setMessage(result.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch (e) {
        console.error("Failed to generate message:", e);
        setMessage(
          `I see you, ${params.name}. You're here because you know you can be more. With RiseGrind, you will be.`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchMessage();
  }, []);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleContinue = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to routine generation screen with all collected data
    router.push({
      pathname: "/onboarding/step4b-routine",
      params: {
        name: params.name || "",
        age: params.age || "",
        empathyAnswer: params.empathyAnswer || "",
        goalAnswer: params.goalAnswer || "",
        selectedGoals: params.selectedGoals || "",
        selectedProblems: params.selectedProblems || "",
        wakeTime: params.wakeTime || "6am",
        motivationStyle: params.motivationStyle || "tough_love",
      },
    } as never);
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          {/* Header */}
          <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              {t("onboarding.step4.title", { defaultValue: "Your Personal Message" })}
            </Text>
          </Animated.View>

          {/* Loading or Message */}
          {isLoading ? (
            <Animated.View entering={FadeIn.duration(400)} style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#E8A87C" />
              <Text style={[styles.loadingText, { color: colors.muted }]}>
                {t("onboarding.step4.generating", { defaultValue: "Analyzing your answers..." })}
              </Text>
            </Animated.View>
          ) : (
            <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.messageContainer}>
              <View
                style={[
                  styles.messageBox,
                  {
                    backgroundColor: colors.surface,
                    borderColor: "#E8A87C",
                  },
                ]}
              >
                <Text style={[styles.messageText, { color: colors.foreground }]}>
                  {message}
                </Text>
              </View>

              <Text style={[styles.subtitle, { color: colors.muted }]}>
                {t("onboarding.step4.subtitle", {
                  defaultValue: "This is your foundation. Let's show you what's possible.",
                })}
              </Text>
            </Animated.View>
          )}

          {/* Continue Button */}
          {!isLoading && (
            <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.footer}>
              <Pressable
                onPress={handleContinue}
                style={({ pressed }) => [
                  styles.button,
                  {
                    backgroundColor: "#E8A87C",
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                <Text style={styles.buttonText}>
                  {t("onboarding.step4.continue", { defaultValue: "See Your Potential" })}
                </Text>
              </Pressable>
            </Animated.View>
          )}
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
  loadingContainer: {
    alignItems: "center",
    gap: 16,
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 16,
  },
  messageContainer: {
    gap: 16,
  },
  messageBox: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 24,
    minHeight: 140,
    justifyContent: "center",
  },
  messageText: {
    fontSize: 18,
    fontWeight: "500",
    lineHeight: 28,
  },
  subtitle: {
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
