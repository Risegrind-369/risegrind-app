import { supabase } from "./client";
import * as SecureStore from "expo-secure-store";
import Purchases from "react-native-purchases";

const TOKEN_STORAGE_KEY = "supabase_auth_token";
const REFRESH_TOKEN_STORAGE_KEY = "supabase_refresh_token";

/**
 * Sign up with email and password
 * Sends verification email to user
 */
export async function signUpWithEmail(email: string, password: string) {
  if (!supabase) {
    throw new Error("Supabase not initialized");
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) {
    throw error;
  }
  // Log in to RevenueCat with the new user ID
  if (data.user?.id) {
    try {
      await Purchases.logIn(data.user.id);
      console.log("[Auth] RevenueCat logIn successful for new user:", data.user.id);
    } catch (err) {
      console.warn("[Auth] RevenueCat logIn failed:", err);
    }
  }
  return data;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(email: string, password: string) {
  if (!supabase) {
    throw new Error("Supabase not initialized");
  }
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    throw error;
  }
  // Store tokens securely
  if (data.session) {
    await storeAuthTokens(data.session.access_token, data.session.refresh_token);
  }
  // Log in to RevenueCat with the user ID
  if (data.user?.id) {
    try {
      await Purchases.logIn(data.user.id);
      console.log("[Auth] RevenueCat logIn successful for user:", data.user.id);
    } catch (err) {
      console.warn("[Auth] RevenueCat logIn failed:", err);
    }
  }
  return data;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string) {
  if (!supabase) {
    throw new Error("Supabase not initialized");
  }
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) {
    throw error;
  }
}

/**
 * Update password with reset token
 */
export async function updatePasswordWithToken(password: string) {
  if (!supabase) {
    throw new Error("Supabase not initialized");
  }
  const { data, error } = await supabase.auth.updateUser({
    password,
  });
  if (error) {
    throw error;
  }
  return data;
}

/**
 * Sign in with Apple
 * Requires Apple Service ID to be configured in Supabase
 */
export async function signInWithApple() {
  if (!supabase) {
    throw new Error("Supabase not initialized");
  }
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "apple",
    options: {
      redirectTo: "risegrind://auth/callback", // Custom scheme redirect
    },
  });
  if (error) {
    throw error;
  }
  return data;
}

/**
 * Store auth tokens securely in device keychain
 */
export async function storeAuthTokens(accessToken: string, refreshToken: string) {
  try {
    await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, accessToken);
    await SecureStore.setItemAsync(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  } catch (error) {
    console.error("[Auth] Failed to store tokens:", error);
  }
}

/**
 * Retrieve auth tokens from secure storage
 */
export async function retrieveAuthTokens() {
  try {
    const accessToken = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
    const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_STORAGE_KEY);
    return { accessToken, refreshToken };
  } catch (error) {
    console.error("[Auth] Failed to retrieve tokens:", error);
    return { accessToken: null, refreshToken: null };
  }
}

/**
 * Clear stored auth tokens
 */
export async function clearAuthTokens() {
  try {
    await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_STORAGE_KEY);
  } catch (error) {
    console.error("[Auth] Failed to clear tokens:", error);
  }
}

/**
 * Restore session from stored tokens
 */
export async function restoreSessionFromStorage() {
  if (!supabase) {
    throw new Error("Supabase not initialized");
  }
  const { accessToken, refreshToken } = await retrieveAuthTokens();
  if (!accessToken || !refreshToken) {
    return null;
  }
  try {
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (error) {
      console.warn("[Auth] Failed to restore session:", error);
      await clearAuthTokens();
      return null;
    }
    return data.session;
  } catch (error) {
    console.error("[Auth] Error restoring session:", error);
    await clearAuthTokens();
    return null;
  }
}

/**
 * Complete logout sequence:
 * 1. Sign out from Supabase
 * 2. Clear auth tokens from secure storage
 * 3. Clear Supabase session
 * 4. Clear AsyncStorage cache (optionally preserve user data)
 * 5. Dispatch LOGOUT action to reset in-memory state
 *
 * @param dispatch - Redux dispatch function
 * @param isLoggingOutRef - Mutable ref to block AsyncStorage reloads during logout
 * @param preserveUserData - If true, keep habits/XP/journal/moods in AsyncStorage (logout case)
 *                           If false, wipe all user data (reset all data case)
 */
export async function completeLogout(
  dispatch?: React.Dispatch<any>,
  isLoggingOutRef?: React.MutableRefObject<boolean>,
  preserveUserData: boolean = true
) {
  try {
    console.log("[LOGOUT] STEP 1: Starting logout — setting isLoggingOutRef.current = true FIRST");
    console.log("[LOGOUT] dispatch provided:", !!dispatch, "| isLoggingOutRef provided:", !!isLoggingOutRef);

    // BUG 4 FIX (Part 1 — revised): Set the mutable ref synchronously as the very first action.
    // This bypasses the closure problem: state.isLoggingOut captured at mount is always false,
    // but isLoggingOutRef.current is always the live value regardless of when the effect runs.
    if (isLoggingOutRef) {
      isLoggingOutRef.current = true;
      console.log("[LOGOUT] STEP 1b: isLoggingOutRef.current = true — AsyncStorage reload is now blocked");
    }

    // 1. Sign out from RevenueCat (must be before Supabase signOut)
    try {
      await Purchases.logOut();
      console.log("[LOGOUT] STEP 1c: RevenueCat logged out successfully");
    } catch (err) {
      console.warn("[Auth] RevenueCat logOut failed (non-fatal):", err);
    }

    // 2. Sign out from Supabase
    if (supabase) {
      try {
        // Check if session exists before signing out
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const { error } = await supabase.auth.signOut();
          if (error) {
            console.warn("[Auth] Supabase signOut error (non-fatal):", error);
          } else {
            console.log("[LOGOUT] STEP 2: Supabase signed out successfully");
          }
        } else {
          console.log("[LOGOUT] STEP 2: No active session to sign out (null session)");
        }
      } catch (signOutError) {
        console.warn("[Auth] Error during Supabase signOut (non-fatal):", signOutError);
        // Continue with logout even if signOut fails
      }
    }

    // 2. Clear stored tokens
    await clearAuthTokens();
    console.log("[LOGOUT] STEP 3: AsyncStorage cleared");

    // 3. Clear Supabase session
    if (supabase) {
      await supabase.auth.setSession(null);
      console.log("[Auth] Supabase session cleared");
    }

    // 4. Clear AsyncStorage (app state, user info, etc.)
    try {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      // Always clear user info (auth state)
      await AsyncStorage.removeItem("manus-runtime-user-info");
      // Clear @risegrind_synced flag so next login re-syncs from server
      await AsyncStorage.removeItem("@risegrind_synced");
      
      // Only clear ALL user data if NOT preserving it (i.e., reset all data case)
      if (!preserveUserData) {
        console.log("[Auth] Clearing ALL user data (habits, XP, journal, etc.) — reset all data");
        await AsyncStorage.removeItem("@risegrind_state");
      } else {
        // LOGOUT CASE: Preserve habits/XP/journal/moods but CLEAR isOnboarded.
        // This is critical: OnboardingGuard reads state.isOnboarded from AsyncStorage
        // on next app launch. If isOnboarded stays true, the guard redirects to Home
        // instead of onboarding, even though the user is logged out.
        console.log("[Auth] Logout: preserving user data but clearing isOnboarded from AsyncStorage");
        try {
          const raw = await AsyncStorage.getItem("@risegrind_state");
          if (raw) {
            const saved = JSON.parse(raw);
            // Clear auth-related fields, keep habits/XP/journal/moods
            saved.isOnboarded = false;
            saved.isLoggingOut = false;
            // Clear user identity fields that belong to the logged-out account
            saved.userName = "";
            saved.userProfile = null;
            saved.isPremium = false;
            await AsyncStorage.setItem("@risegrind_state", JSON.stringify(saved));
            console.log("[Auth] isOnboarded cleared in persisted state — OnboardingGuard will redirect to onboarding");
          }
        } catch (patchError) {
          console.warn("[Auth] Could not patch persisted state (non-fatal):", patchError);
          // If patching fails, remove the whole state so isOnboarded defaults to false
          await AsyncStorage.removeItem("@risegrind_state");
        }
      }
      console.log("[Auth] AsyncStorage cleared (preserveUserData=" + preserveUserData + ")");
    } catch (storageError) {
      console.warn("[Auth] Error clearing AsyncStorage (non-fatal):", storageError);
    }

    // 5. Dispatch LOGOUT action to reset in-memory state
    if (dispatch) {
      console.log("[LOGOUT] STEP 4: About to dispatch LOGOUT action");
      dispatch({ type: "LOGOUT" });
      console.log("[LOGOUT] STEP 5: Dispatched LOGOUT, isOnboarded should be false now");
    } else {
      console.warn("[LOGOUT] WARNING: dispatch parameter is undefined!");
    }

    console.log("[LOGOUT] Complete logout successful");
    return { success: true };
  } catch (error) {
    console.error("[Auth] Error during complete logout:", error);
    // Even if there's an error, try to clear tokens
    try {
      await clearAuthTokens();
    } catch (clearError) {
      console.error("[Auth] Failed to clear tokens during error recovery:", clearError);
    }
    throw error;
  }
}
