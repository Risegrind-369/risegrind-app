import { supabase } from "./client";
import * as SecureStore from "expo-secure-store";

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
 * Complete logout: sign out from Supabase + clear tokens + clear session
 * This is the authoritative logout function
 */
export async function completeLogout() {
  try {
    console.log("[Auth] Starting complete logout...");

    // 1. Sign out from Supabase
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn("[Auth] Supabase signOut error (non-fatal):", error);
      } else {
        console.log("[Auth] Supabase signOut successful");
      }
    }

    // 2. Clear stored tokens
    await clearAuthTokens();
    console.log("[Auth] Tokens cleared from secure storage");

    // 3. Clear Supabase session
    if (supabase) {
      await supabase.auth.setSession(null);
      console.log("[Auth] Supabase session cleared");
    }

    // 4. Clear AsyncStorage (app state, user info, etc.)
    try {
      const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
      await AsyncStorage.removeItem("manus-runtime-user-info");
      await AsyncStorage.removeItem("@risegrind_state");
      console.log("[Auth] AsyncStorage cleared");
    } catch (storageError) {
      console.warn("[Auth] Error clearing AsyncStorage (non-fatal):", storageError);
    }

    console.log("[Auth] Complete logout successful");
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
