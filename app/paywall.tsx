/**
 * Root-Level Paywall Screen
 *
 * Displays paywall modal for users without active entitlement.
 * Located at root level (outside onboarding) to bypass OnboardingGuard routing logic.
 * Used by EntitlementGuard as hard-wall paywall.
 */
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useApp } from "@/lib/app-context";
import PaywallModal from "./onboarding/paywall-modal";
import { View, Alert } from "react-native";
import { signOut } from "@/lib/supabase/auth";
import * as Haptics from "expo-haptics";


export default function PaywallScreen() {
  const router = useRouter();
  const { dispatch } = useApp();
  const [showPaywall, setShowPaywall] = useState(true);

  const handlePaywallClose = () => {
    dispatch({ type: "SET_ONBOARDED", payload: { userName: "" } });
  };

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.back();
  };

  const handleLogout = async () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await signOut();
      // Navigate back to auth choice screen
      router.replace("/auth" as never);
    } catch (error) {
      console.error("[Paywall] Logout error:", error);
      Alert.alert("Error", "Failed to log out. Please try again.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <PaywallModal
        visible={showPaywall}
        onClose={handlePaywallClose}
        onBack={handleBack}
        onLogout={handleLogout}
        source="paywall"
        showBackButton={false}
      />
    </View>
  );
}
