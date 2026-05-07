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
        console.log("[Migration Detector] Starting migration detection...");
        
        // Check for old Manus session token
        const manuSessionToken = await SecureStore.getItemAsync("app_session_token");
        console.log("[Migration Detector] Old Manus session token:", manuSessionToken ? "EXISTS" : "NOT FOUND");

        if (!manuSessionToken) {
          // No old session, no migration needed
          console.log("[Migration Detector] Decision: No old session → no migration needed");
          setState({ needsMigration: false, isMigrating: false, error: null });
          return;
        }

        // Check for Supabase session
        console.log("[Migration Detector] Checking for Supabase session...");
        const {
          data: { session: supabaseSession },
        } = await supabase.auth.getSession();
        console.log("[Migration Detector] Supabase session:", supabaseSession ? "EXISTS" : "NOT FOUND");

        if (supabaseSession) {
          // Already has Supabase session, no migration needed
          console.log("[Migration Detector] Decision: Has Supabase session → no migration needed");
          setState({ needsMigration: false, isMigrating: false, error: null });
          return;
        }

        // Has old Manus session but no Supabase session → needs migration
        console.log("[Migration Detector] Decision: Old session exists, no Supabase session → NEEDS MIGRATION");
        setState({ needsMigration: true, isMigrating: false, error: null });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Migration detection failed";
        console.error("[Migration Detector] Error:", message);
        setState({ needsMigration: false, isMigrating: false, error: message });
      }
    };

    detectMigration();
  }, []);

  return state;
}
