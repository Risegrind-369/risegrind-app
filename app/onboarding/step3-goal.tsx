/**
 * Onboarding Step 3: Future Goal Question
 *
 * "How do you want to become better using RiseGrind?"
 * Open text field with future-oriented tone.
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
  const isValid = answer.trim().length > 10;

  const handleContinue = () => {
    if (!isValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/onboarding/step4-ai-message",
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
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.container}>
            {/* Header */}
            <Animated.View entering={FadeInDown.delay(100).duration(600)} style={styles.header}>
              <Text style={[styles.title, { color: colors.foreground }]}>
                {t("onboarding.step3.title", {
                  defaultValue: "How do you want to become better using RiseGrind?",
                })}
              </Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                {t("onboarding.step3.subtitle", {
                  defaultValue: "Paint a picture of your future self.",
                })}
              </Text>
            </Animated.View>

            {/* Text Area */}
            <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: colors.surface,
                    borderColor: answer.length > 0 ? "#E8A87C" : colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder={t("onboarding.step3.placeholder", {
                  defaultValue: "I want to build...",
                })}
                placeholderTextColor={colors.muted}
                value={answer}
                onChangeText={setAnswer}
                multiline
                autoFocus
                maxLength={500}
              />
              <Text style={[styles.charCount, { color: colors.muted }]}>
                {answer.length}/500
              </Text>
            </Animated.View>

            {/* Continue Button */}
            <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.footer}>
              <Pressable
                onPress={handleContinue}
                disabled={!isValid}
                style={({ pressed }) => [
                  styles.button,
                  {
                    backgroundColor: isValid ? "#E8A87C" : colors.border,
                    transform: [{ scale: pressed && isValid ? 0.97 : 1 }],
                    opacity: isValid ? 1 : 0.5,
                  },
                ]}
              >
                <Text style={styles.buttonText}>
                  {t("onboarding.step3.continue", { defaultValue: "Continue" })}
                </Text>
              </Pressable>
            </Animated.View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  inputContainer: {
    gap: 8,
  },
  textArea: {
    minHeight: 140,
    borderRadius: 12,
    borderWidth: 2,
    padding: 16,
    fontSize: 16,
    lineHeight: 24,
    textAlignVertical: "top",
  },
  charCount: {
    fontSize: 12,
    textAlign: "right",
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
