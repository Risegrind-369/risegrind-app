import { Stack } from "expo-router";
import { useThemeContext } from "@/lib/theme-provider";
import { useEffect } from "react";

export default function OnboardingLayout() {
  const { setColorScheme } = useThemeContext();

  // Force light theme for onboarding
  useEffect(() => {
    setColorScheme("light");
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      {/* Language selection */}
      <Stack.Screen name="language" options={{ animation: "fade" }} />
      {/* Entry redirect */}
      <Stack.Screen name="index" />
      {/* Step 1: Name + Age */}
      <Stack.Screen name="step1-name-age" />
      {/* Account Creation */}
      <Stack.Screen name="create-account" />
      {/* Email Verification */}
      <Stack.Screen name="verify-email" />
      {/* Step 2: Empathy question */}
      <Stack.Screen name="step2-empathy" />
      {/* Step 3: Future goal question */}
      <Stack.Screen name="step3-goal" />
      {/* Step 4: Main goals multi-select */}
      <Stack.Screen name="q4-goals" />
      {/* Step 5: Biggest problems multi-select */}
      <Stack.Screen name="q5-problems" />
      {/* Step 6: Wake time selection */}
      <Stack.Screen name="q6-waketime" />
      {/* Step 7: Motivation/coaching style */}
      <Stack.Screen name="q7-motivation" />
      {/* AI personal message */}
      <Stack.Screen name="step4-ai-message" />
      {/* AI routine generation reveal */}
      <Stack.Screen name="step4b-routine" />
      {/* Animated comparison graphs */}
      <Stack.Screen name="step5-graphs" />
      {/* Free trial reveal */}
      <Stack.Screen name="step6-trial-reveal" />
      {/* Trial reveal (new path) */}
      <Stack.Screen name="trial-reveal" />
      {/* Notification permissions */}
      <Stack.Screen name="step7-notifications" />
      {/* Final paywall before entering app */}
      <Stack.Screen name="step8-paywall" />
      {/* Paywall */}
      <Stack.Screen name="paywall" />
      {/* Setup (name confirmation) */}
      <Stack.Screen name="setup" />
    </Stack>
  );
}
