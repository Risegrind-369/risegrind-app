/**
 * Onboarding Index — Redirect to New Flow
 *
 * The old 4-slide carousel has been replaced with a new psychology-driven flow.
 * This screen redirects to Step 1 (name + age collection), or resumes at currentOnboardingStep if force-quit.
 *
 * CRITICAL FIX: The redirect now runs EXACTLY ONCE on mount (cold launch only).
 * Previously, the dependency array [router, state.currentOnboardingStep] caused the redirect
 * to re-fire during forward navigation, yanking the user backward to a stale saved step.
 * Now uses empty dependency array [] + hasRedirected ref to ensure one-time execution.
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
    const targetStep = state.currentOnboardingStep || "step1-name-age";
    console.log(`[ONBOARDING] Resuming at step: ${targetStep}`);
    router.replace(`/onboarding/${targetStep}` as never);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
