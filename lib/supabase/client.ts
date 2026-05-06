// Gracefully handle missing @supabase/supabase-js
let createClient: any = null;
let AsyncStorage: any = null;

try {
  const supabaseModule = require("@supabase/supabase-js");
  createClient = supabaseModule.createClient;
} catch (e) {
  console.warn("[Supabase] @supabase/supabase-js not installed");
}

// Import AsyncStorage for React Native (Expo)
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch (e) {
  console.warn("[Supabase] @react-native-async-storage/async-storage not installed");
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase credentials. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY"
  );
}

/**
 * Supabase client for client-side operations
 * Used for authentication, real-time subscriptions, and public data access
 * 
 * IMPORTANT: Configured with AsyncStorage adapter for React Native/Expo
 * This ensures tokens are stored securely in device keychain, not web localStorage
 */
export const supabase = createClient && AsyncStorage
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
        storage: AsyncStorage, // Use React Native AsyncStorage instead of web localStorage
      },
    })
  : null;

/**
 * Get the current user session
 */
export async function getCurrentSession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return session;
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}
