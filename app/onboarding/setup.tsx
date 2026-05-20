import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import * as Haptics from "expo-haptics";

export default function SetupScreen() {
  const colors = useColors();
  const router = useRouter();
  const { dispatch } = useApp();
  const [name, setName] = useState("");

  const handleContinue = () => {
    const trimmed = name.trim() || "Friend";
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    dispatch({ type: "SET_ONBOARDED", payload: { userName: trimmed } });
    dispatch({ type: "UPDATE_STREAK" });
    // Navigation handled by OnboardingGuard in _layout.tsx
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.emoji}>👋</Text>
            <Text style={[styles.title, { color: colors.foreground }]}>
              What should we{"\n"}call you?
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              We'll personalize your experience with your name.
            </Text>

            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: name.length > 0 ? colors.primary : colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="Your first name"
              placeholderTextColor={colors.muted}
              value={name}
              onChangeText={setName}
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              maxLength={30}
            />
          </View>

          <View style={styles.footer}>
            <Pressable
              onPress={handleContinue}
              style={({ pressed }) => [
                styles.button,
                {
                  backgroundColor: colors.primary,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <Text style={styles.buttonText}>Start My Journey 🚀</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  content: {
    alignItems: "center",
    gap: 20,
  },
  emoji: {
    fontSize: 64,
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 42,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  input: {
    width: "100%",
    height: 56,
    borderRadius: 14,
    borderWidth: 2,
    paddingHorizontal: 18,
    fontSize: 18,
    fontWeight: "500",
    marginTop: 8,
  },
  footer: {
    gap: 12,
  },
  button: {
    height: 56,
    borderRadius: 16,
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
