/**
 * Onboarding Step 8: Paywall (Final Step)
 *
 * Redirects to the paywall modal after all onboarding questions and permission requests.
 * Also used as hard-wall paywall when user has no active entitlement (e.g., after sign-in).
 */
import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useApp } from "@/lib/app-context";
import PaywallModal from "./paywall-modal";
import { View, Alert } from "react-native";
import { signOut } from "@/lib/supabase/auth";
import * as Haptics from "expo-haptics";

export default function Step8PaywallScreen() {
  const router = useRouter();
  const { dispatch } = useApp();
  const params = useLocalSearchParams();
  const [showPaywall, setShowPaywall] = useState(true);

  const handlePaywallClose = () => {
    // Mark onboarding as complete and navigate to home
    try {
      console.log('[Step8Paywall] handlePaywallClose called - ENTRY POINT');
      console.log('[Step8Paywall] About to dispatch SET_ONBOARDED');
      dispatch({ type: "SET_ONBOARDED", payload: { userName: "" } });
      console.log('[Step8Paywall] SET_ONBOARDED dispatched successfully');
      
      const routePath = "/(tabs)" as never;
      console.log('[Step8Paywall] Route path prepared:', routePath);
      console.log('[Step8Paywall] Calling router.replace NOW');
      router.replace(routePath);
      console.log('[Step8Paywall] router.replace returned - navigation should be in progress');
    } catch (error) {
      console.error('[Step8Paywall] CRITICAL ERROR in handlePaywallClose:', error);
      console.error('[Step8Paywall] Stack:', (error as any)?.stack);
      throw error;
    }
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
