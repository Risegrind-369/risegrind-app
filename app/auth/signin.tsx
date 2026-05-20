/**
 * Sign In Screen
 *
 * Allows existing users to sign in with email and password.
 * Integrates with Supabase Auth.
 * Links to:
 * - Forgot password flow
 * - Sign up (onboarding account creation)
 */
import { useState, useEffect } from "react";
import { View, Text, TextInput, ScrollView, ActivityIndicator, Alert, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { signInWithEmail, retrieveAuthTokens } from "@/lib/supabase/auth";
import * as Haptics from "expo-haptics";

export default function SignInScreen() {
  const colors = useColors();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  // Check if user already has a valid session
  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const { accessToken } = await retrieveAuthTokens();
        if (accessToken) {
          // User already has a session, redirect to home
          router.replace("/(tabs)" as never);
        }
      } catch (error) {
        console.error("[SignIn] Error checking session:", error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkExistingSession();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignIn = async () => {
    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsLoading(true);
    try {
      await signInWithEmail(email, password);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to home screen (skip rest of onboarding since they're returning)
      router.replace("/(tabs)" as never);
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      let errorMessage = "Failed to sign in. Please try again.";
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "Please verify your email before signing in.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Sign In Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to forgot password screen
    router.push("/auth/forgot-password" as never);
  };

  const handleSignUpLink = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Navigate to onboarding account creation (not auth/signup)
    router.push("/onboarding/create-account" as never);
  };

  if (isCheckingSession) {
    return (
      <ScreenContainer containerClassName="bg-background">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
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
              Welcome Back
            </Text>
            <Text
              className="text-base text-muted"
              style={{ color: colors.muted }}
            >
              Sign in to continue your journey
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
            <View className="flex-row justify-between items-center">
              <Text
                className="font-semibold text-foreground"
                style={{ color: colors.foreground }}
              >
                Password
              </Text>
              <TouchableOpacity onPress={handleForgotPassword} disabled={isLoading}>
                <Text
                  className="text-sm font-semibold"
                  style={{ color: colors.primary, opacity: isLoading ? 0.5 : 1 }}
                >
                  Forgot?
                </Text>
              </TouchableOpacity>
            </View>
            <View style={{
              flexDirection: "row",
              alignItems: "center",
              borderWidth: 1,
              borderColor: errors.password ? colors.error : colors.border,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 12,
              backgroundColor: colors.surface,
              gap: 8,
            }}>
              <TextInput
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!isLoading}
                placeholderTextColor={colors.muted}
                style={{
                  flex: 1,
                  color: colors.foreground,
                  fontSize: 16,
                }}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                activeOpacity={0.6}
              >
                <Text style={{ fontSize: 20 }}>{showPassword ? "👁️" : "👁️‍🗨️"}</Text>
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text className="text-sm" style={{ color: colors.error }}>
                {errors.password}
              </Text>
            )}
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            onPress={handleSignIn}
            disabled={isLoading}
            activeOpacity={0.6}
            className="py-4 rounded-lg items-center mt-4"
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                Sign In
              </Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View className="flex-row justify-center gap-1">
            <Text
              className="text-base text-muted"
              style={{ color: colors.muted }}
            >
              Don't have an account?
            </Text>
            <TouchableOpacity onPress={handleSignUpLink} disabled={isLoading}>
              <Text
                className="text-base font-semibold"
                style={{ color: colors.primary, opacity: isLoading ? 0.5 : 1 }}
              >
                Sign Up
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
