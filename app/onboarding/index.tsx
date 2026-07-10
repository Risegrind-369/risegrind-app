/**
 * Onboarding Index — Redirect to New Flow
 *
 * The old 4-slide carousel has been replaced with a new psychology-driven flow.
 * This screen redirects to Step 1 (name + age collection), or resumes at the correct step if force-quit.
 *
 * CRITICAL FIX: Resume logic now detects which steps have been completed based on
 * state flags (generatedRoutine, userProfile, etc.) instead of relying on the stale
 * currentOnboardingStep value for steps 5-7.
 */
import React from "react";
import { useRouter } from "expo-router";
import { useApp } from "@/lib/app-context";

export default function OnboardingScreen() {
  const router = useRouter();
  const { state } = useApp();
  const hasRedirected = React.useRef(false);

  React.useEffect(() => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;

    // DEBUG: Log current state values
    console.log("[ONBOARDING INDEX] State at redirect:", {
      currentOnboardingStep: state.currentOnboardingStep,
      isOnboarded: state.isOnboarded,
      generatedRoutine: !!state.generatedRoutine,
      isLoading: state.isLoading,
    });

    // Resume based on what's been completed, not a saved step
    let targetStep = "step1-name-age";
    if (state.currentOnboardingStep) {
      targetStep = state.currentOnboardingStep;
    }

    // If routine was generated but currentOnboardingStep is still in early steps,
    // resume at step5 (post-routine) since steps 5-7 don't save currentOnboardingStep
    const earlySteps = [
      "step1-name-age",
      "step2-empathy",
      "step3-goal",
      "q4-goals",
      "q5-problems",
      "q6-waketime",
      "q7-motivation",
    ];
    if (state.generatedRoutine && earlySteps.includes(targetStep)) {
      targetStep = "step5-graphs";
    }

    console.log(`[ONBOARDING] Resuming at step: ${targetStep}`);
    router.replace(`/onboarding/${targetStep}` as never);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
