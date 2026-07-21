/**
 * Onboarding Step 8: Paywall (Final Step)
 *
 * Redirects to the paywall modal after all onboarding questions and permission requests.
 * Also used as hard-wall paywall when user has no active entitlement (e.g., after sign-in).
 * 
 * Handles purchase/restore success with appropriate success screens before completing onboarding.
 */
import React, { useState } from "react";
import { useRouter } from "expo-router";
import { useApp } from "@/lib/app-context";
import PaywallModal from "./paywall-modal";
import { View, Alert, Text, Pressable, StyleSheet } from "react-native";
import { completeLogout } from "@/lib/supabase/auth";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn } from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

export default function Step8PaywallScreen() {
  const router = useRouter();
  const { dispatch } = useApp();
  const colors = useColors();
  const [showPaywall, setShowPaywall] = useState(true);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [successType, setSuccessType] = useState<'purchase' | 'restore' | null>(null);

  const handlePaywallSuccess = (type: 'purchase' | 'restore') => {
    setSuccessType(type);
    setShowSuccessScreen(true);
  };

  const handleSuccessScreenDismiss = () => {
    setShowSuccessScreen(false);
    setSuccessType(null);
    // Now proceed with onboarding completion
    dispatch({ type: "SET_ONBOARDED", payload: { userName: "" } });
  };

  const handlePaywallClose = () => {
    // Normal close (user tapped back) — no success screen, just complete onboarding
    dispatch({ type: "SET_ONBOARDED", payload: { userName: "" } });
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleLogout = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await completeLogout(dispatch);
      // Navigate back to auth choice screen
      router.replace("/auth" as never);
    } catch (error) {
      console.error("[Step8Paywall] Logout error:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  // Show success screen if purchase/restore succeeded
  if (showSuccessScreen && successType) {
    return (
      <ScreenContainer containerClassName="bg-background">
        <View style={styles.container}>
          {successType === 'purchase' ? (
            <Animated.View entering={FadeIn.duration(400)} style={styles.successContent}>
              {/* Checkmark Icon */}
              <Text style={styles.checkmark}>✓</Text>
              
              {/* Heading */}
              <Text style={[styles.heading, { color: colors.foreground }]}>
                Welcome to Premium
              </Text>
              
              {/* Description */}
              <Text style={[styles.description, { color: colors.muted }]}>
                You now have full access to Ghost Mentor, Ghost Journal, and more.
              </Text>
              
              {/* Continue Button */}
              <Pressable
                onPress={handleSuccessScreenDismiss}
                style={({ pressed }) => [
                  styles.button,
                  {
                    backgroundColor: colors.accent,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={[styles.buttonText, { color: colors.background }]}>
                  Continue
                </Text>
              </Pressable>
            </Animated.View>
          ) : (
            // Restore success — show alert and wait for user dismissal
            <View style={styles.container}>
              <Text style={[styles.heading, { color: colors.foreground }]}>
                Purchases Restored
              </Text>
              <Text style={[styles.description, { color: colors.muted }]}>
                Your subscription has been restored successfully.
              </Text>
              <Pressable
                onPress={handleSuccessScreenDismiss}
                style={({ pressed }) => [
                  styles.button,
                  {
                    backgroundColor: colors.accent,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={[styles.buttonText, { color: colors.background }]}>
                  OK
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScreenContainer>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <PaywallModal
        visible={showPaywall}
        onClose={handlePaywallClose}
        onSuccess={handlePaywallSuccess}
        onBack={handleBack}
        onLogout={handleLogout}
        source="onboarding"
        showBackButton={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  successContent: {
    alignItems: 'center',
    gap: 16,
  },
  checkmark: {
    fontSize: 64,
    fontWeight: '800',
    color: '#22C55E',
    marginBottom: 8,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
