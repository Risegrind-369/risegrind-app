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
        // Check for old Manus session token
        const manuSessionToken = await SecureStore.getItemAsync("app_session_token");

        if (!manuSessionToken) {
          // No old session, no migration needed
          setState({ needsMigration: false, isMigrating: false, error: null });
          return;
        }

        // Check for Supabase session
        const {
          data: { session: supabaseSession },
        } = await supabase.auth.getSession();

        if (supabaseSession) {
          // Already has Supabase session, no migration needed
          setState({ needsMigration: false, isMigrating: false, error: null });
          return;
        }

        // Has old Manus session but no Supabase session → needs migration
        setState({ needsMigration: true, isMigrating: false, error: null });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Migration detection failed";
        setState({ needsMigration: false, isMigrating: false, error: message });
      }
    };

    detectMigration();
  }, []);

  return state;
}
