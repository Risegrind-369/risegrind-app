import { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { retrieveAuthTokens, clearAuthTokens } from "./supabase/auth";
import { supabase } from "./supabase/client";

/**
 * Session Restoration Hook
 * 
 * On app launch:
 * 1. Check if stored session exists
 * 2. Try to refresh the session with Supabase
 * 3. If refresh fails, clear tokens and redirect to login
 * 4. If refresh succeeds, allow app to proceed
 * 
 * This ensures users stay logged in across app restarts,
 * but are redirected to login if their session has expired.
 */
export function useSessionRestoration() {
  const router = useRouter();
  const segments = useSegments();
  const hasRestoredSession = useRef(false);

  useEffect(() => {
    if (hasRestoredSession.current) return; // Only run once per app lifecycle
    if (!supabase) return; // Supabase not initialized

    const restoreSession = async () => {
      try {
        console.log("[SessionRestoration] Checking for stored session...");

        // Get stored tokens
        const { accessToken, refreshToken } = await retrieveAuthTokens();

        if (!accessToken || !refreshToken) {
          console.log("[SessionRestoration] No stored tokens found");
          hasRestoredSession.current = true;
          return;
        }

        console.log("[SessionRestoration] Stored tokens found, attempting refresh...");

        // Try to refresh the session
        const { data, error } = await supabase.auth.refreshSession({
          refresh_token: refreshToken,
        });

        if (error || !data.session) {
          console.error("[SessionRestoration] Session refresh failed:", error?.message);
          console.log("[SessionRestoration] Clearing invalid tokens and redirecting to login...");

          // Clear invalid tokens
          await clearAuthTokens();

          // Redirect to login if not already there
          const currentRoute = segments.join("/");
          if (!currentRoute.includes("auth")) {
            // TEMPORARY DEBUG: Show redirect reason on screen
            Alert.alert(
              '[DEBUG] Session Restoration Redirect',
              `Reason: Session refresh failed\nError: ${error?.message || 'Unknown error'}\nRedirecting to: /auth/signin`,
              [{ text: 'OK', onPress: () => router.replace("/auth/signin") }]
            );
            return;
          }

          hasRestoredSession.current = true;
          return;
        }

        console.log("[SessionRestoration] Session restored successfully");
        console.log("[SessionRestoration] User:", data.session.user?.email);

        hasRestoredSession.current = true;
      } catch (error) {
        console.error("[SessionRestoration] Error during session restoration:", error);
        hasRestoredSession.current = true;

        // On error, clear tokens and redirect to login
        try {
          await clearAuthTokens();
          const currentRoute = segments.join("/");
          if (!currentRoute.includes("auth")) {
            // TEMPORARY DEBUG: Show redirect reason on screen
            Alert.alert(
              '[DEBUG] Session Restoration Error',
              `Reason: Exception during session restoration\nError: ${error instanceof Error ? error.message : String(error)}\nRedirecting to: /auth/signin`,
              [{ text: 'OK', onPress: () => router.replace("/auth/signin") }]
            );
            return;
          }
        } catch (cleanupError) {
          console.error("[SessionRestoration] Cleanup error:", cleanupError);
        }
      }
    };

    restoreSession();
  }, [router, segments]);
}
