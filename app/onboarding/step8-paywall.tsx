/**
 * Onboarding Step 8: Paywall (Final Step)
 *
 * Redirects to the paywall modal after all onboarding questions and permission requests.
 */
import React, { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useApp } from "@/lib/app-context";
import { PaywallModal } from "./paywall-modal";
import { View } from "react-native";

export default function Step8PaywallScreen() {
  const router = useRouter();
  const { dispatch } = useApp();
  const params = useLocalSearchParams();
  const [showPaywall, setShowPaywall] = useState(true);

  const handlePaywallClose = () => {
    // Mark onboarding as complete and navigate to home
    dispatch({ type: "SET_ONBOARDED", payload: { userName: "" } });
    router.replace("/(tabs)" as never);
  };

  return (
    <View style={{ flex: 1 }}>
      <PaywallModal
        visible={showPaywall}
        onClose={handlePaywallClose}
        source="onboarding"
      />
    </View>
  );
}
