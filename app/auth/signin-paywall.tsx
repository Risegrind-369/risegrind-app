/**
 * Sign In Paywall Screen
 *
 * Shown after successful sign-in if user has no active trial or subscription.
 * Hard-wall: no back button, no exit. Only options:
 * - Purchase a subscription
 * - Log out (small secondary option to switch accounts)
 */
import React, { useState } from "react";
import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import PaywallModal from "@/app/onboarding/paywall-modal";
import { signOut } from "@/lib/supabase/auth";
import * as Haptics from "expo-haptics";

export default function SignInPaywallScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const [showPaywall, setShowPaywall] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handlePaywallClose = () => {
    // User completed purchase - navigate to app
    router.replace("/(tabs)" as never);
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      await signOut();
      
      // Navigate back to auth choice screen
      router.replace("/auth" as never);
    } catch (error) {
      console.error("[SignInPaywall] Logout error:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <PaywallModal
        visible={showPaywall}
        onClose={handlePaywallClose}
        source="trial_expired"
        allowTrial={false}
        showBackButton={false}
      />
      
      {/* Hard-wall overlay: prevents dismissal, only shows logout option */}
      <ScreenContainer containerClassName="bg-background">
        <View className="flex-1 items-center justify-end p-6 pb-12">
          {/* Logout Button - Small, secondary, clearly not the main action */}
          <Pressable
            onPress={handleLogout}
            disabled={isLoggingOut}
            style={({ pressed }) => [
              {
                opacity: isLoggingOut ? 0.5 : pressed ? 0.7 : 1,
              },
            ]}
          >
            {isLoggingOut ? (
              <ActivityIndicator size="small" color={colors.muted} />
            ) : (
              <Text
                style={{
                  fontSize: 14,
                  color: colors.muted,
                  fontWeight: "500",
                  textDecorationLine: "underline",
                }}
              >
                {t("auth.logout", { defaultValue: "Log out" })}
              </Text>
            )}
          </Pressable>
        </View>
      </ScreenContainer>
    </>
  );
}
