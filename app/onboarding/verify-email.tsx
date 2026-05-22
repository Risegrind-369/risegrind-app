/**
 * Onboarding Step: Verify Email
 *
 * Positioned after account creation.
 * User must verify their email before proceeding to the rest of onboarding.
 * Includes:
 * - "Check your email" message
 * - "Resend email" button (rate-limited)
 * - Auto-check for email verification every 3 seconds
 */
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";

import { useRouter, useLocalSearchParams } from "expo-router";
import { useTranslation } from "react-i18next";
import Animated, { FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import * as Haptics from "expo-haptics";
import { supabase } from "@/lib/supabase/client";

export default function VerifyEmailScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const params = useLocalSearchParams();

  const [isVerified, setIsVerified] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [resendCountdown, setResendCountdown] = useState(0);

  const userEmail = (params.email as string) || "your email";

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  // Auto-check for email verification every 3 seconds
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const checkEmailVerification = async () => {
      try {
        setIsChecking(true);
        const { data } = await supabase.auth.getSession();

        if (data.session?.user?.email_confirmed_at) {
          setIsVerified(true);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          console.log("[VerifyEmail] Email verified! Proceeding to next step.");

          // After verification, continue to next onboarding step
          setTimeout(() => {
            router.push({
              pathname: "/onboarding/step2-empathy",
              params: { name: params.name, age: params.age },
            } as never);
          }, 1500);
        }
      } catch (error) {
        console.error("[VerifyEmail] Error checking verification:", error);
      } finally {
        setIsChecking(false);
      }
    };

    // Check immediately
    checkEmailVerification();

    // Then check every 3 seconds
    interval = setInterval(() => checkEmailVerification(), 3000);

    return () => clearInterval(interval);
  }, []);

  // Resend countdown timer
  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendCountdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [resendCountdown, canResend]);

  const handleResendEmail = async () => {
    if (!canResend || isResending) return;

    setIsResending(true);
    setCanResend(false);
    setResendCountdown(60); // 60 second cooldown

    try {
      // Resend confirmation email
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: userEmail,
      });

      if (error) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          t("onboarding.verifyEmail.resendError", { defaultValue: "Error" }),
          error.message
        );
        setCanResend(true);
        setResendCountdown(0);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        Alert.alert(
          t("onboarding.verifyEmail.resendSent", { defaultValue: "Email sent" }),
          t("onboarding.verifyEmail.resendSentMessage", {
            defaultValue: "Check your inbox for the verification link.",
          })
        );
      }
    } catch (error) {
      console.error("[VerifyEmail] Error resending email:", error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        t("onboarding.verifyEmail.error", { defaultValue: "Error" }),
        t("onboarding.verifyEmail.errorMessage", {
          defaultValue: "An error occurred. Please try again.",
        })
      );
      setCanResend(true);
      setResendCountdown(0);
    } finally {
      setIsResending(false);
    }
  };

  if (isVerified) {
    return (
      <ScreenContainer containerClassName="bg-background">
        <View className="flex-1 items-center justify-center p-6">
          <Animated.View
            entering={FadeInDown.duration(600)}
            className="items-center gap-4"
          >
            <Text className="text-6xl">✅</Text>
            <Text
              className="text-2xl font-bold text-foreground text-center"
              style={{ color: colors.foreground }}
            >
              {t("onboarding.verifyEmail.verified", {
                defaultValue: "Email Verified!",
              })}
            </Text>
            <Text
              className="text-base text-muted text-center"
              style={{ color: colors.muted }}
            >
              {t("onboarding.verifyEmail.verifiedMessage", {
                defaultValue: "Your email has been confirmed. Proceeding...",
              })}
            </Text>
          </Animated.View>
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
            <Text style={[styles.emoji, { fontSize: 48 }]}>📧</Text>
            <Text style={[styles.greeting, { color: colors.foreground }]}>
              {t("onboarding.verifyEmail.title", {
                defaultValue: "Check Your Email",
              })}
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {t("onboarding.verifyEmail.subtitle", {
                defaultValue:
                  "We sent a verification link to {{email}}. Click it to confirm your account.",
                interpolation: { escapeValue: false },
                email: userEmail,
              })}
            </Text>
          </Animated.View>

          {/* Status */}
          <Animated.View
            entering={FadeInDown.delay(200).duration(600)}
            style={[
              styles.statusBox,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <View style={styles.statusContent}>
              {isChecking ? (
                <>
                  <ActivityIndicator color={colors.primary} size="large" />
                  <Text style={[styles.statusText, { color: colors.muted }]}>
                    {t("onboarding.verifyEmail.checking", {
                      defaultValue: "Checking for verification...",
                    })}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.statusEmoji, { fontSize: 32 }]}>⏳</Text>
                  <Text style={[styles.statusText, { color: colors.muted }]}>
                    {t("onboarding.verifyEmail.waiting", {
                      defaultValue:
                        "Waiting for email verification. We'll check automatically.",
                    })}
                  </Text>
                </>
              )}
            </View>
          </Animated.View>

          {/* Resend Button */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(600)}
            style={styles.buttonGroup}
          >
            <Pressable
              onPress={handleResendEmail}
              disabled={!canResend || isResending}
              style={[
                styles.button,
                {
                  backgroundColor: canResend ? colors.primary : colors.border,
                },
              ]}
            >
              {isResending ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text style={[styles.buttonText, { color: colors.background }]}>
                  {canResend
                    ? t("onboarding.verifyEmail.resendButton", {
                        defaultValue: "Resend Email",
                      })
                    : t("onboarding.verifyEmail.resendCountdown", {
                        defaultValue: "Resend in {{seconds}}s",
                        seconds: resendCountdown,
                      })}
                </Text>
              )}
            </Pressable>
          </Animated.View>

          {/* Skip email verification button */}
          <Animated.View
            entering={FadeInDown.delay(400).duration(600)}
            style={styles.buttonGroup}
          >
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push({
                  pathname: "/onboarding/step2-empathy",
                  params: { name: params.name, age: params.age },
                } as never);
              }}
              style={[
                styles.button,
                { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
              ]}
            >
              <Text style={{ fontSize: 14, fontWeight: "500", color: colors.foreground }}>
                Skip for now
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Help Text */}
          <Animated.View
            entering={FadeInDown.delay(500).duration(600)}
            style={styles.helpText}
          >
            <Text style={[styles.helpLabel, { color: colors.muted }]}>
              {t("onboarding.verifyEmail.helpLabel", {
                defaultValue: "Didn't receive the email?",
              })}
            </Text>
            <Text style={[styles.helpContent, { color: colors.muted }]}>
              {t("onboarding.verifyEmail.helpContent", {
                defaultValue:
                  "Check your spam folder or use the Resend button above.",
              })}
            </Text>
          </Animated.View>
        </View>
      </ScrollView>
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
    gap: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  emoji: {
    marginBottom: 8,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
  },
  statusBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
  },
  statusContent: {
    alignItems: "center",
    gap: 12,
  },
  statusEmoji: {
    marginBottom: 4,
  },
  statusText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
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
  helpText: {
    gap: 8,
    marginTop: 16,
    paddingHorizontal: 12,
  },
  helpLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  helpContent: {
    fontSize: 13,
    lineHeight: 20,
  },
});
