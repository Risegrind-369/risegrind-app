/**
 * Onboarding Step: Create Account
 *
 * Positioned after name/age collection, before habit questions.
 * User creates a Supabase account (email + password) to secure their data.
 * Includes "Already have an account? Sign in" link.
 * Apple Sign-In button is code-ready for when Apple Dev account is approved.
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
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase/client";
import { storeAuthTokens } from "@/lib/supabase/auth";

export default function CreateAccountScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isValid =
    email.trim().length > 0 &&
    password.length >= 8 &&
    password === confirmPassword;

  const handleCreateAccount = async () => {
    if (!isValid) return;

    setError(null);
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // Sign up with Supabase
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setLoading(false);
        return;
      }

      if (!data.user) {
        setError("Failed to create account");
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setLoading(false);
        return;
      }

      // Store tokens
      if (data.session) {
        await storeAuthTokens(data.session.access_token, data.session.refresh_token);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Continue to email verification step
      router.push({
        pathname: "/onboarding/verify-email",
        params: { name: params.name, age: params.age, email: email.trim() },
      } as never);
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to sign-in screen
    router.push("/auth/signin" as never);
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.container}>
            {/* Back Button */}
            <Pressable onPress={handleBack} style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, marginBottom: 16 }]}>
              <Text style={{ fontSize: 24 }}>← Back</Text>
            </Pressable>

            {/* Header */}
            <Animated.View
              entering={FadeInDown.delay(100).duration(600)}
              style={styles.header}
            >
              <Text style={[styles.greeting, { color: colors.foreground }]}>
                {t("onboarding.createAccount.title", {
                  defaultValue: "Secure Your Data",
                })}
              </Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                {t("onboarding.createAccount.subtitle", {
                  defaultValue:
                    "Create an account to save your progress and keep your data safe.",
                })}
              </Text>
            </Animated.View>

            {/* Error message */}
            {error && (
              <Animated.View
                entering={FadeInDown.delay(150).duration(600)}
                style={[
                  styles.errorBox,
                  { backgroundColor: colors.error + "15", borderColor: colors.error },
                ]}
              >
                <Text style={[styles.errorText, { color: colors.error }]}>
                  {error}
                </Text>
              </Animated.View>
            )}

            {/* Email Input */}
            <Animated.View
              entering={FadeInDown.delay(200).duration(600)}
              style={styles.inputGroup}
            >
              <Text style={[styles.label, { color: colors.foreground }]}>
                {t("onboarding.createAccount.emailLabel", {
                  defaultValue: "Email",
                })}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.surface,
                    borderColor: email.length > 0 ? "#E8A87C" : colors.border,
                    color: colors.foreground,
                  },
                ]}
                placeholder="your@email.com"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                editable={!loading}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </Animated.View>

            {/* Password Input */}
            <Animated.View
              entering={FadeInDown.delay(300).duration(600)}
              style={styles.inputGroup}
            >
              <Text style={[styles.label, { color: colors.foreground }]}>
                {t("onboarding.createAccount.passwordLabel", {
                  defaultValue: "Password",
                })}
              </Text>
              <View style={[styles.inputWithToggle, { borderColor: password.length > 0 ? "#E8A87C" : colors.border, backgroundColor: colors.surface }]}>
                <TextInput
                  style={[
                    styles.inputField,
                    {
                      color: colors.foreground,
                    },
                  ]}
                  placeholder={t("onboarding.createAccount.passwordPlaceholder", {
                    defaultValue: "At least 8 characters",
                  })}
                  placeholderTextColor={colors.muted}
                  value={password}
                  onChangeText={setPassword}
                  editable={!loading}
                  secureTextEntry={!showPassword}
                />
                <Pressable
                  onPress={() => setShowPassword(!showPassword)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                >
                  <Text style={{ fontSize: 20 }}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
                </Pressable>
              </View>
            </Animated.View>

            {/* Confirm Password Input */}
            <Animated.View
              entering={FadeInDown.delay(400).duration(600)}
              style={styles.inputGroup}
            >
              <Text style={[styles.label, { color: colors.foreground }]}>
                {t("onboarding.createAccount.confirmPasswordLabel", {
                  defaultValue: "Confirm Password",
                })}
              </Text>
              <View style={[styles.inputWithToggle, { borderColor: confirmPassword.length > 0 ? "#E8A87C" : colors.border, backgroundColor: colors.surface }]}>
                <TextInput
                  style={[
                    styles.inputField,
                    {
                      color: colors.foreground,
                    },
                  ]}
                  placeholder={t("onboarding.createAccount.confirmPasswordPlaceholder", {
                    defaultValue: "Confirm your password",
                  })}
                  placeholderTextColor={colors.muted}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  editable={!loading}
                  secureTextEntry={!showConfirmPassword}
                />
                <Pressable
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
                >
                  <Text style={{ fontSize: 20 }}>{showConfirmPassword ? "👁️" : "👁️‍🗨️"}</Text>
                </Pressable>
              </View>
            </Animated.View>

            {/* Create Account Button */}
            <Animated.View
              entering={FadeInDown.delay(500).duration(600)}
              style={styles.buttonGroup}
            >
              <Pressable
                onPress={handleCreateAccount}
                disabled={!isValid || loading}
                style={[
                  styles.button,
                  {
                    backgroundColor: isValid && !loading ? "#0a7ea4" : colors.border,
                  },
                ]}
              >
                {loading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text style={[styles.buttonText, { color: colors.background }]}>
                    {t("onboarding.createAccount.createButton", {
                      defaultValue: "Create Account",
                    })}
                  </Text>
                )}
              </Pressable>
            </Animated.View>

            {/* Apple Sign-In Button (code-ready) */}
            {/* TODO: Enable when Apple Dev account is approved
            <Animated.View
              entering={FadeInDown.delay(550).duration(600)}
              style={styles.dividerGroup}
            >
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.muted }]}>or</Text>
              <View style={[styles.divider, { backgroundColor: colors.border }]} />
            </Animated.View>

            <Animated.View
              entering={FadeInDown.delay(600).duration(600)}
              style={styles.appleButtonGroup}
            >
              <Pressable
                onPress={handleAppleSignIn}
                disabled={loading}
                style={[styles.appleButton, { backgroundColor: colors.foreground }]}
              >
                <Text style={[styles.appleButtonText, { color: colors.background }]}>
                  Sign in with Apple
                </Text>
              </Pressable>
            </Animated.View>
            */}

            {/* Sign In Link */}
            <Animated.View
              entering={FadeInDown.delay(650).duration(600)}
              style={styles.signInLinkGroup}
            >
              <Text style={[styles.signInLinkText, { color: colors.muted }]}>
                {t("onboarding.createAccount.haveAccount", {
                  defaultValue: "Already have an account?",
                })}{" "}
              </Text>
              <Pressable onPress={handleSignIn} disabled={loading}>
                <Text
                  style={[
                    styles.signInLink,
                    { color: "#0a7ea4", opacity: loading ? 0.5 : 1 },
                  ]}
                >
                  {t("onboarding.createAccount.signInLink", {
                    defaultValue: "Sign in",
                  })}
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
    paddingVertical: 24,
  },
  container: {
    paddingHorizontal: 24,
    gap: 24,
  },
  header: {
    gap: 8,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 32,
    fontWeight: "700",
    lineHeight: 40,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  errorBox: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 14,
    fontWeight: "500",
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputWithToggle: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  inputField: {
    flex: 1,
    fontSize: 16,
  },
  buttonGroup: {
    marginTop: 8,
  },
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  dividerGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginVertical: 8,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 14,
  },
  appleButtonGroup: {
    marginBottom: 8,
  },
  appleButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  signInLinkGroup: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  signInLinkText: {
    fontSize: 14,
  },
  signInLink: {
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
});
