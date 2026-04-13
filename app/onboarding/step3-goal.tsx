/**
 * Onboarding Step 3: Future Goal Question
 *
 * "How do you want to become better using RiseGrind?"
 * Open text field with empathetic tone and bold instruction.
 */
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export default function Step3GoalScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    name?: string;
    age?: string;
    empathyAnswer?: string;
  }>();
  const [answer, setAnswer] = useState("");
  const isValid = answer.trim().length > 20; // At least 20 chars for meaningful response

  const handleContinue = () => {
    if (!isValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/onboarding/q4-goals",
      params: {
        name: params.name || "",
        age: params.age || "",
        empathyAnswer: params.empathyAnswer || "",
        goalAnswer: answer.trim(),
      },
    } as never);
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Progress Indicator */}
          <Animated.View
            entering={FadeInDown.delay(100)}
            style={[styles.progressBar, { backgroundColor: colors.accent, width: "75%" }]}
          />

          {/* Question */}
          <Animated.View entering={FadeInDown.delay(200)}>
            <Text style={[styles.question, { color: colors.foreground }]}>
              {t("onboarding.goalQuestion", {
                defaultValue: "How do you want to become better using RiseGrind?",
              })}
            </Text>
          </Animated.View>

          {/* Instruction with Bold */}
          <Animated.View entering={FadeInDown.delay(300)} style={styles.instructionContainer}>
            <Text style={[styles.instructionText, { color: colors.muted }]}>
              {t("onboarding.goalInstruction", {
                defaultValue:
                  "Write as much as possible and be super detailed so the AI can be 100% personalized to what you say.",
              })}
            </Text>
          </Animated.View>

          {/* Text Input */}
          <Animated.View entering={FadeInDown.delay(400)} style={{ flex: 1 }}>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: colors.foreground,
                  borderColor: answer.trim().length > 0 ? colors.accent : colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
              placeholder={t("onboarding.goalPlaceholder", {
                defaultValue: "Describe your vision for yourself...",
              })}
              placeholderTextColor={colors.muted}
              value={answer}
              onChangeText={setAnswer}
              multiline
              textAlignVertical="top"
              autoFocus
            />
            <Text style={[styles.charCount, { color: colors.muted }]}>
              {answer.trim().length} {t("onboarding.characters", { defaultValue: "characters" })}
            </Text>
          </Animated.View>

          {/* Continue Button */}
          <Animated.View entering={FadeInDown.delay(500)}>
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
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 20,
  },
  progressBar: {
    height: 3,
    borderRadius: 1.5,
  },
  question: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  instructionContainer: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#D97706",
  },
  instructionText: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 16,
    minHeight: 180,
  },
  charCount: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 8,
    textAlign: "right",
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 20,
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
