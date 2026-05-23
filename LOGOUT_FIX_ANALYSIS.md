# Fix 1: Logout Button — Analysis

## Current Logout Implementation (profile.tsx lines 338-374)

```typescript
// CURRENT LOGOUT BUTTON
onPress: async () => {
  console.log("[Profile] Confirmed — calling completeLogout");
  try {
    await completeLogout(dispatch, isLoggingOutRef);
    console.log("[Profile] completeLogout done — navigating to onboarding");
    router.replace("/onboarding/language" as never);  // ← NAVIGATION
  } catch (error) {
    console.error("[Profile] Logout error:", error);
    Alert.alert(...);
  }
}
```

## completeLogout Function (lib/supabase/auth.ts lines 174-241)

**What it does:**
1. Sets `isLoggingOutRef.current = true` (line 186)
2. Calls `supabase.auth.signOut()` (line 192)
3. Calls `clearAuthTokens()` (line 201) — clears SecureStore tokens
4. Calls `supabase.auth.setSession(null)` (line 206)
5. **CLEARS AsyncStorage:** `removeItem("@risegrind_state")` (line 214) — **THIS WIPES ALL USER DATA**
6. Dispatches `LOGOUT` action (line 223)

## Reset All Data Implementation (profile.tsx lines 81-96)

```typescript
const handleResetData = () => {
  Alert.alert(
    "Reset All Data",
    "This will permanently delete all your habits...",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reset",
        style: "destructive",
        onPress: () => {
          Alert.alert("OK", "Data reset would clear AsyncStorage in production.");
          // NOTE: This is a STUB — it doesn't actually do anything!
        },
      },
    ]
  );
};
```

## The Problem

**Current Logout DOES clear all user data** (line 214 in auth.ts: `removeItem("@risegrind_state")`).

But you said:
> "Logout button should do the same flow but ONLY clear auth state, not user data."

The logout currently:
- ✅ Clears auth tokens
- ✅ Clears Supabase session
- ✅ Dispatches LOGOUT reducer
- ✅ Navigates to `/onboarding/language`
- ❌ **ALSO WIPES ALL HABITS/XP/JOURNAL/MOODS** (the `@risegrind_state` AsyncStorage entry)

## The Fix

Modify `completeLogout()` to accept an optional parameter `preserveUserData: boolean`:
- When `true` (logout): skip the `removeItem("@risegrind_state")` call
- When `false` (reset): keep the current behavior

Then call it from logout with `preserveUserData: true`.

## Navigation Method

Both use `router.replace("/onboarding/language" as never)` — this is correct and consistent.

---

## Summary

| Step | Logout (Current) | Logout (Should Be) | Reset All Data |
|------|------------------|-------------------|-----------------|
| Show confirmation | ✅ | ✅ | ✅ (stub) |
| Sign out from Supabase | ✅ | ✅ | N/A |
| Clear auth tokens | ✅ | ✅ | N/A |
| Clear Supabase session | ✅ | ✅ | N/A |
| **Clear user data** | ❌ (currently does) | ❌ (should NOT) | ✅ (should do) |
| Dispatch LOGOUT | ✅ | ✅ | ✅ |
| Navigate to onboarding | ✅ | ✅ | ✅ |

