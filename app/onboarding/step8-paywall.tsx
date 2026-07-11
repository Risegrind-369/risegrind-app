/**
 * Onboarding Step 8: Paywall (Final Step)
 *
 * Redirects to the paywall modal after all onboarding questions and permission requests.
 * Also used as hard-wall paywall when user has no active entitlement (e.g., after sign-in).
 */
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { useApp } from "@/lib/app-context";
import PaywallModal from "./paywall-modal";
import { View, Alert } from "react-native";
import { completeLogout } from "@/lib/supabase/auth";
import * as Haptics from "expo-haptics";


export default function Step8PaywallScreen() {
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
      await completeLogout(dispatch);
      // Navigate back to auth choice screen
      router.replace("/auth" as never);
    } catch (error) {
      console.error("[Step8Paywall] Logout error:", error);
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
        source="onboarding"
        showBackButton={true}
      />
    </View>
  );
}
