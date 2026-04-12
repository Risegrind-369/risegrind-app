import { Stack } from "expo-router";

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="language" options={{ animation: "fade" }} />
      <Stack.Screen name="index" />
      <Stack.Screen name="step1-name-age" />
      <Stack.Screen name="step2-empathy" />
      <Stack.Screen name="step3-goal" />
      <Stack.Screen name="step4-ai-message" />
      <Stack.Screen name="step5-graphs" />
      <Stack.Screen name="step6-trial-reveal" />
      <Stack.Screen name="paywall" />
      <Stack.Screen name="setup" />
    </Stack>
  );
}
