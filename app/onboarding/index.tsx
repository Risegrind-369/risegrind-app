/**
 * Onboarding Index — Redirect to New Flow
 *
 * The old 4-slide carousel has been replaced with a new psychology-driven flow.
 * This screen redirects to Step 1 (name + age collection).
 */
import React from "react";
import { useRouter } from "expo-router";

export default function OnboardingScreen() {
  const router = useRouter();

  React.useEffect(() => {
    router.replace("/onboarding/step1-name-age" as never);
  }, [router]);

  return null;
}
