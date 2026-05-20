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
import { useRouter, Link } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { signUpWithEmail } from "@/lib/supabase/auth";
import * as Haptics from "expo-haptics";

export default function SignUpScreen() {
  const colors = useColors();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignUp = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    try {
      await signUpWithEmail(email, password);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      Alert.alert(
        "Check Your Email",
        "We've sent a verification link to " + email + ". Please verify your email to complete signup.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      let errorMessage = "Failed to sign up. Please try again.";
      if (error.message.includes("already registered")) {
        errorMessage = "This email is already registered. Try logging in.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Sign Up Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignInLink = () => {
    router.back();
  };

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
              Create Account
            </Text>
            <Text
              className="text-base text-muted"
              style={{ color: colors.muted }}
            >
              Join RiseGrind and start building habits
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
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              editable={!isLoading}
              placeholderTextColor={colors.muted}
              style={{
                borderWidth: 1,
                borderColor: errors.email ? colors.error : colors.border,
                borderRadius: 8,
                padding: 12,
                color: colors.foreground,
                backgroundColor: colors.surface,
              }}
            />
            {errors.email && (
              <Text className="text-sm" style={{ color: colors.error }}>
                {errors.email}
              </Text>
            )}
          </View>

          {/* Password Input */}
          <View className="gap-2">
            <Text
              className="font-semibold text-foreground"
              style={{ color: colors.foreground }}
            >
              Password
            </Text>
            <TextInput
              placeholder="At least 8 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
              placeholderTextColor={colors.muted}
              style={{
                borderWidth: 1,
                borderColor: errors.password ? colors.error : colors.border,
                borderRadius: 8,
                padding: 12,
                color: colors.foreground,
                backgroundColor: colors.surface,
              }}
            />
            {errors.password && (
              <Text className="text-sm" style={{ color: colors.error }}>
                {errors.password}
              </Text>
            )}
          </View>

          {/* Confirm Password Input */}
          <View className="gap-2">
            <Text
              className="font-semibold text-foreground"
              style={{ color: colors.foreground }}
            >
              Confirm Password
            </Text>
            <TextInput
              placeholder="Repeat your password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!isLoading}
              placeholderTextColor={colors.muted}
              style={{
                borderWidth: 1,
                borderColor: errors.confirmPassword ? colors.error : colors.border,
                borderRadius: 8,
                padding: 12,
                color: colors.foreground,
                backgroundColor: colors.surface,
              }}
            />
            {errors.confirmPassword && (
              <Text className="text-sm" style={{ color: colors.error }}>
                {errors.confirmPassword}
              </Text>
            )}
          </View>

          {/* Sign Up Button */}
          <Pressable
            onPress={handleSignUp}
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
                Create Account
              </Text>
            )}
          </Pressable>

          {/* Sign In Link */}
          <View className="flex-row justify-center gap-1">
            <Text
              className="text-base text-muted"
              style={{ color: colors.muted }}
            >
              Already have an account?
            </Text>
            <Pressable onPress={handleSignInLink}>
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
