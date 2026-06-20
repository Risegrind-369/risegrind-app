/**
 * Onboarding Index — Redirect to New Flow
 *
 * The old 4-slide carousel has been replaced with a new psychology-driven flow.
 * This screen redirects to Step 1 (name + age collection), or resumes at currentOnboardingStep if force-quit.
 */
import React from "react";
import { useRouter } from "expo-router";
import { useApp } from "@/lib/app-context";

export default function OnboardingScreen() {
  const router = useRouter();
  const { state } = useApp();

  React.useEffect(() => {
    // ISSUE 1+5: If user force-quit mid-onboarding, resume at the saved step
    const targetStep = state.currentOnboardingStep || "step1-name-age";
    console.log(`[ONBOARDING] Resuming at step: ${targetStep}`);
    router.replace(`/onboarding/${targetStep}` as never);
  }, [router, state.currentOnboardingStep]);

  return null;
}
