import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { sendPasswordResetEmail } from "@/lib/supabase/auth";
import * as Haptics from "expo-haptics";

export default function ForgotPasswordScreen() {
  const colors = useColors();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEmailSent, setIsEmailSent] = useState(false);

  const validateEmail = () => {
    if (!email.trim()) {
      setError("Email is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email format");
      return false;
    }
    setError("");
    return true;
  };

  const handleSendReset = async () => {
    if (!validateEmail()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    try {
      await sendPasswordResetEmail(email);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsEmailSent(true);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      let errorMessage = "Failed to send reset email. Please try again.";
      if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToSignIn = () => {
    router.back();
  };

  if (isEmailSent) {
    return (
      <ScreenContainer containerClassName="bg-background">
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="flex-1 p-6 justify-center gap-6">
            {/* Success Message */}
            <View className="gap-4 items-center">
              <Text
                className="text-5xl"
                style={{ color: colors.success }}
              >
                ✓
              </Text>
              <View className="gap-2 items-center">
                <Text
                  className="text-2xl font-bold text-foreground text-center"
                  style={{ color: colors.foreground }}
                >
                  Check Your Email
                </Text>
                <Text
                  className="text-base text-muted text-center leading-relaxed"
                  style={{ color: colors.muted }}
                >
                  We've sent a password reset link to {email}. Click the link in the email to set a new password.
                </Text>
              </View>
            </View>

            {/* Info Box */}
            <View
              className="p-4 rounded-lg gap-2"
              style={{
                backgroundColor: colors.primary + "10",
                borderLeftWidth: 4,
                borderLeftColor: colors.primary,
              }}
            >
              <Text
                className="font-semibold text-sm"
                style={{ color: colors.foreground }}
              >
                💡 Tip:
              </Text>
              <Text
                className="text-sm text-muted"
                style={{ color: colors.muted }}
              >
                The link expires in 24 hours. If you don't see the email, check your spam folder.
              </Text>
            </View>

            {/* Back Button */}
            <Pressable
              onPress={handleBackToSignIn}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
              className="py-4 rounded-lg items-center mt-6"
            >
              <Text className="text-white font-semibold text-base">
                Back to Sign In
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 p-6 justify-center gap-6">
          {/* Header */}
          <View className="gap-2 mb-4">
            <Text
              className="text-4xl font-bold text-foreground"
              style={{ color: colors.foreground }}
            >
              Reset Password
            </Text>
            <Text
              className="text-base text-muted"
              style={{ color: colors.muted }}
            >
              Enter your email to receive a password reset link
            </Text>
          </View>

          {/* Email Input */}
          <View className="gap-2">
            <Text
              className="font-semibold text-foreground"
              style={{ color: colors.foreground }}
            >
              Email
            </Text>
            <TextInput
              placeholder="you@example.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                setError("");
              }}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
              placeholderTextColor={colors.muted}
              style={{
                borderWidth: 1,
                borderColor: error ? colors.error : colors.border,
                borderRadius: 8,
                padding: 12,
                color: colors.foreground,
                backgroundColor: colors.surface,
              }}
            />
            {error && (
              <Text className="text-sm" style={{ color: colors.error }}>
                {error}
              </Text>
            )}
          </View>

          {/* Info Box */}
          <View
            className="p-4 rounded-lg gap-2"
            style={{
              backgroundColor: colors.primary + "10",
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
            }}
          >
            <Text
              className="font-semibold text-sm"
              style={{ color: colors.foreground }}
            >
              📧 How it works:
            </Text>
            <Text
              className="text-sm text-muted"
              style={{ color: colors.muted }}
            >
              1. We'll send you an email with a secure link
              {"\n"}
              2. Click the link to verify your identity
              {"\n"}
              3. Set your new password
              {"\n"}
              4. Sign in with your new password
            </Text>
          </View>

          {/* Send Reset Button */}
          <Pressable
            onPress={handleSendReset}
            disabled={isLoading}
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
            className="py-4 rounded-lg items-center mt-4"
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Send Reset Link
              </Text>
            )}
          </Pressable>

          {/* Back to Sign In */}
          <View className="flex-row justify-center gap-1">
            <Text
              className="text-base text-muted"
              style={{ color: colors.muted }}
            >
              Remember your password?
            </Text>
            <Pressable onPress={handleBackToSignIn}>
              <Text
                className="text-base font-semibold"
                style={{ color: colors.primary }}
              >
                Sign In
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
