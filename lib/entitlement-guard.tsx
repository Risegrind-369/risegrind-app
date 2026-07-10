/**
 * Entitlement Guard
 *
 * App-level subscription enforcement. Ensures that:
 * - Unauthenticated users can see onboarding (no entitlement needed yet)
 * - Authenticated users WITH trial/premium can access the app
 * - Authenticated users WITHOUT entitlement are forced to the paywall
 * - Closing and reopening the app doesn't bypass the paywall
 * - Race condition during RevenueCat loading is handled conservatively (deny access)
 *
 * This guard wraps OnboardingGuard and runs AFTER auth state is restored.
 */
import { useEffect, useRef } from "react";
import { useRouter, useSegments } from "expo-router";
import { useRevenueCat } from "@/lib/revenuecat-provider";
import { useAuth } from "@/lib/use-auth-supabase";
import { debugLog } from "@/lib/debug-logger";

export function EntitlementGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  const { isPremium, isTrialActive, isLoading: rcLoading } = useRevenueCat();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Guard against repeated navigation
  const isNavigating = useRef(false);

  // Stringify segments to get a stable primitive dependency
  const segmentsKey = segments.join("/");

  useEffect(() => {
    console.log("\n========== [ENTITLEMENT GUARD] EFFECT RUNNING ==========");
    console.log("[ENTITLEMENT] Current state:", {
      isAuthenticated,
      authLoading,
      isPremium,
      isTrialActive,
      rcLoading,
      segments: segments.join("/"),
    });

    // Allow root-level paywall
    if ((segments[0] as string) === "paywall") {
      console.log("[ENTITLEMENT] Root-level paywall → allowing");
      console.log("========== [ENTITLEMENT GUARD] EFFECT END (paywall allowed) ==========\n");
      return;
    }

    // Allow auth routes (signin-choice, signin, signin-apple, forgot-password, etc.)
    // Users must be able to reach auth screens regardless of entitlement state
    const inAuth = (segments[0] as string) === "auth";
    if (inAuth) {
      console.log("[ENTITLEMENT] Auth route → allowing");
      console.log("========== [ENTITLEMENT GUARD] EFFECT END (auth allowed) ==========\n");
      return;
    }

    // Wait for auth to finish loading (required to know if user exists)
    if (authLoading) {
      console.log("[ENTITLEMENT] Waiting for auth to load");
      console.log("========== [ENTITLEMENT GUARD] EFFECT END (loading) ==========\n");
      return;
    }

    if (isNavigating.current) {
      console.log("[ENTITLEMENT] Navigation already in progress");
      console.log("========== [ENTITLEMENT GUARD] EFFECT END (navigating) ==========\n");
      return;
    }

    const inPaywall = (segments[0] as string) === "onboarding" && 
      ((segments[1] as string) === "step8-paywall" || 
       (segments[1] as string) === "paywall");
    const inLoadingScreen = (segments[0] as string) === "onboarding" && 
      (segments[1] as string) === "step4c-loading";
    const inOnboarding = (segments[0] as string) === "onboarding";
    const inAuth = (segments[0] as string) === "auth";

    // Logic:
    // 1. If not signed in → allow onboarding/auth screens (no entitlement check needed yet)
    // 2. If signed in + has entitlement → allow app access
    // 3. If signed in + NO entitlement → force to paywall (hard-wall, no dismiss)
    // 4. If already in paywall → stay there
    // 5. If signed in but RevenueCat still loading (uncertain state) → conservative: deny unless in safe zone

    if (!isAuthenticated) {
      // User not authenticated yet, allow onboarding/auth
      debugLog("ENTITLEMENT_GUARD_NOT_AUTHENTICATED", { segments: segments.join("/") });
      console.log("[ENTITLEMENT] Not authenticated → allowing onboarding/auth");
      console.log("========== [ENTITLEMENT GUARD] EFFECT END (not authenticated) ==========\n");
      return;
    }

    // User is authenticated. Now check RevenueCat state.
    // If RevenueCat is still loading, we're in an uncertain state.
    // Conservative approach: assume NO entitlement until we know for sure.
    if (rcLoading) {
      console.log("[ENTITLEMENT] Uncertain state: auth done, RevenueCat still loading", {
        isAuthenticated,
        rcLoading,
        inPaywall,
        inOnboarding,
      });

      // Safe zones during uncertain state: allow if in paywall, loading screen, or onboarding
      if (inPaywall || inLoadingScreen || inOnboarding) {
        debugLog("ENTITLEMENT_GUARD_UNCERTAIN_SAFE_ZONE", { segments: segments.join("/"), inPaywall, inLoadingScreen, inOnboarding });
        console.log("[ENTITLEMENT] Uncertain state but in safe zone (paywall/loading/onboarding) → allowing");
        console.log("========== [ENTITLEMENT GUARD] EFFECT END (uncertain, safe zone) ==========\n");
        return;
      }

      // Trying to access app during uncertain state → force to paywall (conservative)
      debugLog("ENTITLEMENT_GUARD_UNCERTAIN_FORCE_PAYWALL", { segments: segments.join("/"), inPaywall, inOnboarding });
      console.log("[ENTITLEMENT] Uncertain state, not in safe zone → forcing to paywall (conservative)");
      isNavigating.current = true;
      router.replace("/onboarding/step8-paywall" as never);
      setTimeout(() => { isNavigating.current = false; }, 500);
      console.log("========== [ENTITLEMENT GUARD] EFFECT END (uncertain, forcing to paywall) ==========\n");
      return;
    }

    // Now we have definitive entitlement info (RevenueCat loading complete)
    const hasEntitlement = isPremium || isTrialActive;

    if (hasEntitlement) {
      // User has active trial or premium subscription
      if (inPaywall) {
        debugLog("ENTITLEMENT_GUARD_HAS_ENTITLEMENT_LEAVING_PAYWALL", { segments: segments.join("/"), isPremium, isTrialActive });
        console.log("[ENTITLEMENT] Has entitlement but in paywall → redirecting to home");
        isNavigating.current = true;
        router.replace("/(tabs)" as never);
        setTimeout(() => { isNavigating.current = false; }, 500);
        console.log("========== [ENTITLEMENT GUARD] EFFECT END (has entitlement, leaving paywall) ==========\n");
      } else {
        debugLog("ENTITLEMENT_GUARD_HAS_ENTITLEMENT_ALLOW", { segments: segments.join("/"), isPremium, isTrialActive });
        console.log("[ENTITLEMENT] Has entitlement → allowing app access");
        console.log("========== [ENTITLEMENT GUARD] EFFECT END (has entitlement) ==========\n");
      }
      return;
    }

    // User is authenticated but has NO entitlement (definitive)
    if (inPaywall) {
      // Already in paywall, stay there
      debugLog("ENTITLEMENT_GUARD_NO_ENTITLEMENT_IN_PAYWALL", { segments: segments.join("/") });
      console.log("[ENTITLEMENT] No entitlement, already in paywall → staying");
      console.log("========== [ENTITLEMENT GUARD] EFFECT END (no entitlement, in paywall) ==========\n");
      return;
    }

    // If still in onboarding (but not paywall), allow passage to complete onboarding
    if (inOnboarding) {
      debugLog("ENTITLEMENT_GUARD_NO_ENTITLEMENT_IN_ONBOARDING", { segments: segments.join("/") });
      console.log("[ENTITLEMENT] No entitlement but in onboarding → allowing to continue");
      console.log("========== [ENTITLEMENT GUARD] EFFECT END (no entitlement, in onboarding) ==========\n");
      return;
    }

    // User is authenticated, NO entitlement (definitive), onboarding complete, NOT in paywall → FORCE TO PAYWALL
    debugLog("ENTITLEMENT_GUARD_NO_ENTITLEMENT_FORCE_PAYWALL", { segments: segments.join("/") });
    console.log("[ENTITLEMENT] No entitlement, onboarding complete → forcing to paywall (hard-wall)");
    isNavigating.current = true;
    router.replace("/onboarding/step8-paywall" as never);
    setTimeout(() => { isNavigating.current = false; }, 500);
    console.log("========== [ENTITLEMENT GUARD] EFFECT END (forcing to paywall) ==========\n");

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, isPremium, isTrialActive, rcLoading, segmentsKey]);

  return <>{children}</>;
}
