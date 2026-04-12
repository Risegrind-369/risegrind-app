/**
 * Onboarding Step 1: Name + Age
 *
 * Minimalist, empathetic introduction.
 * Collects first name and age to personalize the experience.
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
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";

export default function Step1NameAgeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const isValid = name.trim().length > 0 && age.trim().length > 0;

  const handleContinue = () => {
    if (!isValid) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Store in route params for the next step
    router.push({
      pathname: "/onboarding/step2-empathy",
      params: { name: name.trim(), age: age.trim() },
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
              <Text style={[styles.greeting, { color: colors.foreground }]}>
                {t("onboarding.step1.greeting", { defaultValue: "Welcome to Ghost Mode" })}
              </Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                {t("onboarding.step1.subtitle", {
                  defaultValue: "Let's start with the basics so we can personalize your journey.",
                })}
              </Text>
            </Animated.View>

            {/* Name Input */}
            <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>
                {t("onboarding.step1.nameLabel", { defaultValue: "First Name" })}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: name.length > 0 ? "#E8A87C" : colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder={t("onboarding.step1.namePlaceholder", { defaultValue: "e.g., Alex" })}
                placeholderTextColor={colors.muted}
                value={name}
                onChangeText={setName}
                autoFocus
                autoCapitalize="words"
                maxLength={30}
              />
            </Animated.View>

            {/* Age Input */}
            <Animated.View entering={FadeInDown.delay(300).duration(600)} style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.foreground }]}>
                {t("onboarding.step1.ageLabel", { defaultValue: "Age" })}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: age.length > 0 ? "#E8A87C" : colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder={t("onboarding.step1.agePlaceholder", { defaultValue: "e.g., 28" })}
                placeholderTextColor={colors.muted}
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
                maxLength={3}
              />
            </Animated.View>

            {/* Continue Button */}
            <Animated.View entering={FadeInDown.delay(400).duration(600)} style={styles.footer}>
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
                  {t("onboarding.step1.continue", { defaultValue: "Continue" })}
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
  greeting: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  input: {
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: "500",
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
