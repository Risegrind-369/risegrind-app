import { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";
import { supabase } from "./supabase/client";

export interface MigrationState {
  needsMigration: boolean;
  isMigrating: boolean;
  error: string | null;
}

/**
 * Detects if user has old Manus OAuth session but no Supabase account yet.
 * Returns true if user should see the "claim account" screen.
 */
export function useMigrationDetector(): MigrationState {
  const [state, setState] = useState<MigrationState>({
    needsMigration: false,
    isMigrating: true,
    error: null,
  });

  useEffect(() => {
    const detectMigration = async () => {
      try {
        console.log("\n========== [MIGRATION DETECTOR] START ==========");
        
        // Check for old Manus session token
        const manuSessionToken = await SecureStore.getItemAsync("app_session_token");
        console.log("[MIGRATION] Step 1 - Check old Manus token:", manuSessionToken ? "✓ EXISTS" : "✗ NOT FOUND");
        if (manuSessionToken) {
          console.log("[MIGRATION] Token preview:", manuSessionToken.substring(0, 20) + "...");
        }

        if (!manuSessionToken) {
          console.log("[MIGRATION] Decision: No old session → NO MIGRATION NEEDED");
          console.log("========== [MIGRATION DETECTOR] END (no migration) ==========\n");
          setState({ needsMigration: false, isMigrating: false, error: null });
          return;
        }

        // Check for Supabase session
        console.log("[MIGRATION] Step 2 - Check Supabase session...");
        const {
          data: { session: supabaseSession },
        } = await supabase.auth.getSession();
        console.log("[MIGRATION] Supabase session:", supabaseSession ? "✓ EXISTS" : "✗ NOT FOUND");
        if (supabaseSession) {
          console.log("[MIGRATION] Supabase user ID:", supabaseSession.user?.id);
        }

        if (supabaseSession) {
          console.log("[MIGRATION] Decision: Has Supabase session → NO MIGRATION NEEDED");
          console.log("========== [MIGRATION DETECTOR] END (already migrated) ==========\n");
          setState({ needsMigration: false, isMigrating: false, error: null });
          return;
        }

        // Has old Manus session but no Supabase session → needs migration
        console.log("[MIGRATION] Step 3 - Final decision:");
        console.log("[MIGRATION] Old Manus session: ✓ EXISTS");
        console.log("[MIGRATION] Supabase session: ✗ NOT FOUND");
        console.log("[MIGRATION] ⚠️  MIGRATION REQUIRED - User must claim account");
        console.log("========== [MIGRATION DETECTOR] END (migration needed) ==========\n");
        setState({ needsMigration: true, isMigrating: false, error: null });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Migration detection failed";
        console.error("[MIGRATION] ❌ ERROR:", message);
        console.error("[MIGRATION] Stack:", err instanceof Error ? err.stack : "no stack");
        console.log("========== [MIGRATION DETECTOR] END (error) ==========\n");
        setState({ needsMigration: false, isMigrating: false, error: message });
      }
    };

    detectMigration();
  }, []);

  return state;
}
