import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "./client";
import { restoreSessionFromStorage, clearAuthTokens, storeAuthTokens } from "./auth";

type Session = any;
type User = any;

interface SupabaseAuthContextType {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  isSignedIn: boolean;
}

const SupabaseAuthContext = createContext<SupabaseAuthContextType | undefined>(undefined);

export function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        if (!supabase) {
          setIsLoading(false);
          return;
        }

        // Try to restore session from storage
        const restoredSession = await restoreSessionFromStorage();
        if (restoredSession) {
          setSession(restoredSession);
          setUser(restoredSession.user);
        }

        // Listen for auth state changes
        const {
          data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event: any, newSession: any) => {
          console.log(`[Auth] State change: ${event}`);

          if (newSession) {
            setSession(newSession);
            setUser(newSession.user);
            // Store tokens when session changes
            await storeAuthTokens(newSession.access_token, newSession.refresh_token);
          } else {
            setSession(null);
            setUser(null);
            // Clear tokens on sign out
            await clearAuthTokens();
          }
        });

        return () => {
          subscription?.unsubscribe();
        };
      } catch (error) {
        console.error("[Auth] Initialization error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const value: SupabaseAuthContextType = {
    session,
    user,
    isLoading,
    isSignedIn: !!user,
  };

  return (
    <SupabaseAuthContext.Provider value={value}>{children}</SupabaseAuthContext.Provider>
  );
}

/**
 * Hook to access Supabase auth context
 */
export function useSupabaseAuth() {
  const context = useContext(SupabaseAuthContext);
  if (!context) {
    throw new Error("useSupabaseAuth must be used within SupabaseAuthProvider");
  }
  return context;
}
