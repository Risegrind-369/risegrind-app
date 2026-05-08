import { Stack } from "expo-router";

/**
 * Auth Layout
 * 
 * Exposes all auth-related screens (signup, signin, forgot-password, claim-account, etc.)
 * to Expo Router. This layout is registered in the root _layout.tsx Stack.
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="signin" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="claim-account" />
      <Stack.Screen name="signin-apple" />
    </Stack>
  );
}
