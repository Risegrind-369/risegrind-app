import { useSupabaseAuth } from "./supabase/auth-context";

/**
 * Migration shim for useAuth() hook
 * Provides backward compatibility with the old Manus OAuth useAuth() interface
 * 
 * Returns the same shape as the old Manus OAuth version:
 * {
 *   user: User | null,
 *   isLoading: boolean,
 *   isSignedIn: boolean,
 *   session: Session | null
 * }
 */
export function useAuth() {
  const { user, isLoading, isSignedIn, session } = useSupabaseAuth();

  return {
    user: user
      ? {
          id: user.id,
          email: user.email,
          name: user.user_metadata?.name || user.email?.split("@")[0],
          avatar: user.user_metadata?.avatar_url,
          // Add any other fields from old Manus OAuth user object here
        }
      : null,
    isLoading,
    isSignedIn,
    session: session
      ? {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_at: session.expires_at,
          user: user,
        }
      : null,
  };
}

/**
 * Type definition for the return value of useAuth()
 * This is what downstream code expects
 */
export type UseAuthReturn = ReturnType<typeof useAuth>;
