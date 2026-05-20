import React, { useState } from "react";
import { View, Text, ScrollView, ActivityIndicator, Alert, Platform, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { signInWithApple } from "@/lib/supabase/auth";
import * as Haptics from "expo-haptics";

export default function SignInAppleScreen() {
  const colors = useColors();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const handleAppleSignIn = async () => {
    if (Platform.OS !== "ios") {
      Alert.alert(
        "iOS Only",
        "Sign in with Apple is only available on iOS devices."
      );
      return;
    }

    setIsLoading(true);
    try {
      await signInWithApple();

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Navigate to home screen
      router.back();
    } catch (error: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      let errorMessage = "Failed to sign in with Apple. Please try again.";
      if (
        error.message.includes("Apple Service ID not configured") ||
        error.message.includes("EXPO_PUBLIC_APPLE_SERVICE_ID")
      ) {
        errorMessage =
          "Apple Sign-In is not yet configured. Please try email/password login.";
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert("Sign In Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
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
              Sign In with Apple
            </Text>
            <Text
              className="text-base text-muted"
              style={{ color: colors.muted }}
            >
              Fast and secure sign-in using your Apple ID
            </Text>
          </View>

          {/* Info Box */}
          <View
            className="p-4 rounded-lg gap-3"
            style={{
              backgroundColor: colors.primary + "10",
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
            }}
          >
            <Text
              className="font-semibold text-base"
              style={{ color: colors.foreground }}
            >
              🔒 Privacy First
            </Text>
            <Text
              className="text-sm text-muted leading-relaxed"
              style={{ color: colors.muted }}
            >
              • Your real email stays private
              {"\n"}
              • We only see what you allow
              {"\n"}
              • Sign out anytime
            </Text>
          </View>

          {/* Apple Sign In Button */}
          <TouchableOpacity
            onPress={handleAppleSignIn}
            disabled={isLoading}
            activeOpacity={0.6}
            className="py-4 rounded-lg items-center flex-row justify-center gap-2 mt-6"
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text className="text-2xl">🍎</Text>
                <Text className="text-white font-semibold text-base">
                  Sign In with Apple
                </Text>
              </>
            )}
          </TouchableOpacity>

          {/* Alternative Methods */}
          <View className="gap-3 mt-4">
            <View className="flex-row items-center gap-3">
              <View
                className="flex-1 h-px"
                style={{ backgroundColor: colors.border }}
              />
              <Text
                className="text-sm text-muted"
                style={{ color: colors.muted }}
              >
                Or
              </Text>
              <View
                className="flex-1 h-px"
                style={{ backgroundColor: colors.border }}
              />
            </View>

            <TouchableOpacity
              onPress={() => router.back()}
              activeOpacity={0.6}
              className="py-4 rounded-lg items-center"
            >
              <Text
                className="font-semibold text-base"
                style={{ color: colors.primary }}
              >
                Use Email Instead
              </Text>
            </TouchableOpacity>
          </View>

          {/* Terms */}
          <Text
            className="text-xs text-muted text-center mt-6"
            style={{ color: colors.muted }}
          >
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
