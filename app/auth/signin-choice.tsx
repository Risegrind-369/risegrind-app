/**
 * Sign In Choice Screen
 *
 * Entry point for returning users. Offers:
 * - Email/Password sign-in
 * - Sign in with Apple
 * - Link to sign up for new users
 */
import { useState, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { retrieveAuthTokens } from "@/lib/supabase/auth";
import * as Haptics from "expo-haptics";

export default function SignInChoiceScreen() {
  const colors = useColors();
  const router = useRouter();

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
        console.error("[SignInChoice] Error checking session:", error);
      } finally {
        setIsCheckingSession(false);
      }
    };

    checkExistingSession();
  }, []);

  const handleEmailSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/auth/signin" as never);
  };

  const handleAppleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (Platform.OS !== "ios") {
      // On non-iOS, just go to email sign-in
      router.push("/auth/signin" as never);
      return;
    }
    router.push("/auth/signin-apple" as never);
  };

  const handleSignUp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/onboarding/step1-name-age" as never);
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
        <View className="flex-1 p-6 justify-center gap-8">
          {/* Header */}
          <View className="gap-3 mb-4">
            <Text
              className="text-4xl font-bold text-foreground text-center"
              style={{ color: colors.foreground }}
            >
              Welcome Back
            </Text>
            <Text
              className="text-base text-muted text-center"
              style={{ color: colors.muted }}
            >
              Sign in to continue your journey
            </Text>
          </View>

          {/* Sign In Options */}
          <View className="gap-4">
            {/* Email Sign In Button */}
            <Pressable
              onPress={handleEmailSignIn}
              style={({ pressed }) => [
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.8 : 1,
                  transform: [{ scale: pressed ? 0.98 : 1 }],
                },
              ]}
              className="py-4 rounded-lg items-center flex-row justify-center gap-2"
            >
              <Text className="text-xl">✉️</Text>
              <Text className="text-white font-semibold text-base">
                Sign In with Email
              </Text>
            </Pressable>

            {/* Apple Sign In Button (iOS only) */}
            {Platform.OS === "ios" && (
              <Pressable
                onPress={handleAppleSignIn}
                style={({ pressed }) => [
                  {
                    backgroundColor: "#000",
                    opacity: pressed ? 0.8 : 1,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  },
                ]}
                className="py-4 rounded-lg items-center flex-row justify-center gap-2"
              >
                <Text className="text-2xl">🍎</Text>
                <Text className="text-white font-semibold text-base">
                  Sign In with Apple
                </Text>
              </Pressable>
            )}
          </View>

          {/* Divider */}
          <View className="flex-row items-center gap-3">
            <View
              className="flex-1 h-px"
              style={{ backgroundColor: colors.border }}
            />
            <Text
              className="text-sm text-muted"
              style={{ color: colors.muted }}
            >
              New to RiseGrind?
            </Text>
            <View
              className="flex-1 h-px"
              style={{ backgroundColor: colors.border }}
            />
          </View>

          {/* Sign Up Button */}
          <Pressable
            onPress={handleSignUp}
            style={({ pressed }) => [
              {
                borderWidth: 1,
                borderColor: colors.border,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
            className="py-4 rounded-lg items-center"
          >
            <Text
              className="font-semibold text-base"
              style={{ color: colors.primary }}
            >
              Create an Account
            </Text>
          </Pressable>

          {/* Terms */}
          <Text
            className="text-xs text-muted text-center mt-4"
            style={{ color: colors.muted }}
          >
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
