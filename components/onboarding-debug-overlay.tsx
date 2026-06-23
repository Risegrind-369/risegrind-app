/**
 * Onboarding Debug Overlay
 *
 * Displays current route segments and currentOnboardingStep in real time.
 * Shows in top-left corner of screen in red text.
 * TEMPORARY: Remove after debugging navigation issues.
 */
import React from "react";
import { View, Text } from "react-native";
import { useSegments } from "expo-router";
import { useApp } from "@/lib/app-context";

export function OnboardingDebugOverlay() {
  const segments = useSegments();
  const { state } = useApp();

  const segmentsStr = segments.join("/");
  const currentStep = state.currentOnboardingStep || "none";

  return (
    <View
      style={{
        position: "absolute",
        top: 12,
        left: 12,
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 4,
        zIndex: 9999,
        maxWidth: "90%",
      }}
    >
      <Text
        style={{
          color: "#ff3333",
          fontSize: 10,
          fontWeight: "600",
          fontFamily: "monospace",
        }}
      >
        route: {segmentsStr}
      </Text>
      <Text
        style={{
          color: "#ff3333",
          fontSize: 10,
          fontWeight: "600",
          fontFamily: "monospace",
        }}
      >
        step: {currentStep}
      </Text>
      <Text
        style={{
          color: "#ffff33",
          fontSize: 9,
          fontWeight: "500",
          fontFamily: "monospace",
          marginTop: 4,
        }}
      >
        isOnboarded: {state.isOnboarded ? "true" : "false"}
      </Text>
    </View>
  );
}
