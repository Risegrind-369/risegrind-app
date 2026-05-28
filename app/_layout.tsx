/**
 * Root Layout
 *
 * Provider hierarchy (outermost → innermost):
 *   ThemeProvider
 *   SafeAreaProvider
 *   trpc.Provider + QueryClientProvider
 *   RevenueCatProvider  ← initializes react-native-purchases
 *   SuperwallProvider   ← initializes Superwall with RevenueCat PurchaseController
 *   AppProvider         ← app state (onboarding, habits, etc.)
 *   PaywallTriggerProvider ← shows time-based paywall modal
 *   OnboardingGuard     ← redirects to onboarding if not completed
 */
import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { Platform } from "react-native";
import "@/lib/_core/nativewind-pressable";
import { ThemeProvider } from "@/lib/theme-provider";
import { AppProvider, useApp } from "@/lib/app-context";
import { SyncLoadingScreen } from "@/components/sync-loading-screen";
import { LanguageProvider, useLanguage } from "@/lib/language-context";
import "@/lib/i18n"; // Initialize i18next
import { RevenueCatProvider } from "@/lib/revenuecat-provider";
import { SuperwallProvider } from "@/lib/superwall-provider";
import { PaywallTriggerProvider } from "@/lib/paywall-trigger";
import { HealthProvider } from "@/lib/health-provider";
import { DebugOverlay } from "@/components/debug-overlay";
import {
  SafeAreaFrameContext,
  SafeAreaInsetsContext,
  SafeAreaProvider,
  initialWindowMetrics,
} from "react-native-safe-area-context";
import type { EdgeInsets, Metrics, Rect } from "react-native-safe-area-context";

import { trpc, createTRPCClient } from "@/lib/trpc";
import { initManusRuntime, subscribeSafeAreaInsets } from "@/lib/_core/manus-runtime";
import { useSessionRestoration } from "@/lib/use-session-restoration";
import * as Linking from "expo-linking";
import { supabase } from "@/lib/supabase/client";
import { SupabaseAuthProvider } from "@/lib/supabase/auth-context";

const DEFAULT_WEB_INSETS: EdgeInsets = { top: 0, right: 0, bottom: 0, left: 0 };
const DEFAULT_WEB_FRAME: Rect = { x: 0, y: 0, width: 0, height: 0 };

// ─── Stable module-level constant for SafeAreaProvider initialMetrics ─────────
// MUST be computed once outside the component so it never changes reference,
// preventing SafeAreaProvider from treating every render as a new "initial" value.
const STABLE_INITIAL_METRICS = initialWindowMetrics ?? {
  insets: DEFAULT_WEB_INSETS,
  frame: DEFAULT_WEB_FRAME,
};

export const unstable_settings = {
  anchor: "(tabs)",
};

function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const { state, isSyncing, syncError, retrySync } = useApp();
  const { language, isLanguageLoaded } = useLanguage();
  const segments = useSegments();
  const router = useRouter();

  // Guard against repeated navigation: only allow one redirect per "decision cycle".
  // router.replace() causes Expo Router to update segments, which re-runs the effect;
  // without this lock the effect fires again before the route has settled, creating
  // an infinite loop of replace() calls.
  const isNavigating = useRef(false);

  // Stringify segments to get a stable primitive dependency.
  const segmentsKey = segments.join("/");

  useEffect(() => {
    console.log("\n========== [ONBOARDING GUARD] EFFECT RUNNING ==========");
    console.log("[GUARD] Current state:", {
      isLoading: state.isLoading,
      isLanguageLoaded,
      isOnboarded: state.isOnboarded,
      segments: segments.join("/"),
    });

    if (state.isLoading || !isLanguageLoaded) {
      console.log("[GUARD] Waiting for state/language to load");
      console.log("========== [ONBOARDING GUARD] EFFECT END (waiting) ==========\n");
      return;
    }
    if (isNavigating.current) {
      console.log("[GUARD] Navigation already in progress");
      console.log("========== [ONBOARDING GUARD] EFFECT END (navigating) ==========\n");
      return;
    }

    const inOnboarding = (segments[0] as string) === "onboarding";
    console.log("[LOGOUT] GUARD CHECK: isOnboarded =", state.isOnboarded, "inOnboarding =", inOnboarding);

    // Simple routing logic:
    // 1. If no language selected and not in onboarding → show language selection
    // 2. If not onboarded and not in onboarding → show onboarding
    // 3. If onboarded and in onboarding → go to home
    // 4. Otherwise stay where you are

    if (!language && !inOnboarding) {
      console.log("[LOGOUT] GUARD DECISION: No language → redirecting to language selection");
      isNavigating.current = true;
      router.replace("/onboarding/language" as never);
      setTimeout(() => { isNavigating.current = false; }, 500);
      console.log("========== [ONBOARDING GUARD] EFFECT END (language redirect) ==========\n");
      return;
    }

    if (!state.isOnboarded && !inOnboarding) {
      console.log("[LOGOUT] GUARD DECISION: Not onboarded → starting onboarding flow");
      isNavigating.current = true;
      router.replace(language ? "/onboarding" : "/onboarding/language" as never);
      setTimeout(() => { isNavigating.current = false; }, 500);
      console.log("========== [ONBOARDING GUARD] EFFECT END (onboarding redirect) ==========\n");
    } else if (state.isOnboarded && inOnboarding) {
      console.log("[LOGOUT] GUARD DECISION: isOnboarded=true AND inOnboarding=true → redirecting to home (THIS IS THE BUG!)");
      isNavigating.current = true;
      router.replace("/(tabs)" as never);
      setTimeout(() => { isNavigating.current = false; }, 500);
      console.log("========== [ONBOARDING GUARD] EFFECT END (home redirect) ==========\n");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isOnboarded, state.isLoading, segmentsKey, language, isLanguageLoaded]);

  if (isSyncing || syncError) {
    return <SyncLoadingScreen error={syncError} onRetry={retrySync} />;
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const router = useRouter();
  
  // Restore session on app launch (check stored tokens, refresh if needed)
  useSessionRestoration();

  // Handle deep links for email verification
  useEffect(() => {
    const handleDeepLink = async ({ url }: { url: string }) => {
      console.log("[DeepLink] Received URL:", url);

      const parsed = Linking.parse(url);
      const { path, queryParams } = parsed;

      console.log("[DeepLink] Parsed path:", path, "queryParams:", queryParams);

      // Extract token_hash from URL string directly (fallback for truncated URLs)
      let tokenHash: string | undefined = queryParams ? (queryParams.token_hash as string) : undefined;
      let emailType: string | undefined = queryParams ? (queryParams.type as string) : undefined;

      // If token not in queryParams, try to extract from full URL string
      if (!tokenHash && url.includes("token_hash=")) {
        const match = url.match(/token_hash=([^&]+)/);
        if (match) {
          tokenHash = match[1];
          console.log("[DeepLink] Extracted token_hash from URL string:", tokenHash);
        }
      }

      if (!emailType && url.includes("type=")) {
        const match = url.match(/type=([^&]+)/);
        if (match) {
          emailType = match[1];
          console.log("[DeepLink] Extracted type from URL string:", emailType);
        }
      }

      // Handle email confirmation: manus20260410080735://auth/confirm?token_hash=...
      // Also handle truncated version: manus20260410080735://auth?token_hash=...
      const isEmailConfirmation =
        (path === "auth/confirm" || path === "auth") &&
        tokenHash &&
        emailType === "email";

      if (isEmailConfirmation) {
        try {
          console.log("[DeepLink] Email confirmation detected");

          const { error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: "email",
          });

          if (error) {
            console.error("[DeepLink] Email verification failed:", error);
            // Route back to verify-email with error
            router.replace({
              pathname: "/onboarding/verify-email",
              params: { email: "" },
            } as never);
          } else {
            console.log("[DeepLink] Email verified successfully");
            // Route to next onboarding step
            setTimeout(() => {
              router.replace({
                pathname: "/onboarding/step2-empathy",
                params: { name: "", age: "" },
              } as never);
            }, 500);
          }
        } catch (err) {
          console.error("[DeepLink] Error handling email confirmation:", err);
        }
      }
    };

    const subscription = Linking.addEventListener("url", handleDeepLink);

    const getInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url != null) {
        console.log("[DeepLink] Initial URL on app launch:", url);
        handleDeepLink({ url });
      }
    };

    getInitialURL();

    return () => {
      subscription.remove();
    };
  }, []);

  // On web we override the SafeArea contexts with values from the parent iframe.
  // Start from the stable module-level metrics so SafeAreaProvider never gets
  // a new initialMetrics reference.
  const [insets, setInsets] = useState<EdgeInsets>(STABLE_INITIAL_METRICS.insets);
  const [frame, setFrame] = useState<Rect>(STABLE_INITIAL_METRICS.frame);

  // Keep the last-applied insets/frame so we can skip no-op state updates.
  const lastInsets = useRef(insets);
  const lastFrame = useRef(frame);

  // Initialize Manus runtime for cookie injection from parent container
  useEffect(() => {
    initManusRuntime();
  }, []);

  const handleSafeAreaUpdate = useCallback((metrics: Metrics) => {
    const { insets: newInsets, frame: newFrame } = metrics;
    // Only update state when values actually changed to prevent render loops.
    const insetsChanged =
      newInsets.top !== lastInsets.current.top ||
      newInsets.bottom !== lastInsets.current.bottom ||
      newInsets.left !== lastInsets.current.left ||
      newInsets.right !== lastInsets.current.right;
    const frameChanged =
      newFrame.width !== lastFrame.current.width ||
      newFrame.height !== lastFrame.current.height;

    if (insetsChanged) {
      lastInsets.current = newInsets;
      setInsets(newInsets);
    }
    if (frameChanged) {
      lastFrame.current = newFrame;
      setFrame(newFrame);
    }
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web") return;
    const unsubscribe = subscribeSafeAreaInsets(handleSafeAreaUpdate);
    return () => unsubscribe();
  }, [handleSafeAreaUpdate]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );
  const [trpcClient] = useState(() => createTRPCClient());

  const content = (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <LanguageProvider>
            <SupabaseAuthProvider>
          {/* RevenueCat MUST be initialized before Superwall */}
          <RevenueCatProvider>
            {/* Superwall uses RevenueCat as its PurchaseController */}
            <SuperwallProvider>
              <AppProvider>
                <HealthProvider>
                {/* Shows time-based paywall after 1-2 days of usage */}
                <PaywallTriggerProvider>
                  <OnboardingGuard>
                    <DebugOverlay />
                    <Stack screenOptions={{ headerShown: false }}>
                      <Stack.Screen name="(tabs)" />
                      <Stack.Screen name="onboarding" options={{ animation: "fade" }} />
                      <Stack.Screen name="auth" options={{ animation: "slide_from_right" }} />
                      <Stack.Screen name="ai-chat" options={{ animation: "slide_from_bottom", presentation: "modal" }} />
                      <Stack.Screen name="notifications" options={{ animation: "slide_from_right" }} />
                      <Stack.Screen name="oauth/callback" />
                    </Stack>
                    <StatusBar style="auto" />
                  </OnboardingGuard>
                </PaywallTriggerProvider>
                </HealthProvider>
              </AppProvider>
            </SuperwallProvider>
          </RevenueCatProvider>
            </SupabaseAuthProvider>
          </LanguageProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </GestureHandlerRootView>
  );

  const shouldOverrideSafeArea = Platform.OS === "web";

  if (shouldOverrideSafeArea) {
    return (
      <ThemeProvider>
        {/*
          Pass the stable module-level constant as initialMetrics so
          SafeAreaProvider never sees a new object reference and never
          triggers an internal state update on re-render.
        */}
        <SafeAreaProvider initialMetrics={STABLE_INITIAL_METRICS}>
          <SafeAreaFrameContext.Provider value={frame}>
            <SafeAreaInsetsContext.Provider value={insets}>
              {content}
            </SafeAreaInsetsContext.Provider>
          </SafeAreaFrameContext.Provider>
        </SafeAreaProvider>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <SafeAreaProvider initialMetrics={STABLE_INITIAL_METRICS}>{content}</SafeAreaProvider>
    </ThemeProvider>
  );
}
