/**
 * Web stub for SuperwallProvider.
 * Superwall is a native-only SDK — this file is used on web to avoid
 * the native module import error in the Metro web bundler.
 */
import React from 'react';

export function SuperwallProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export async function showSuperwallPaywall(_placement: string): Promise<void> {
  console.log(`[Superwall Web Stub] Paywall skipped for placement: ${_placement}`);
}

export async function identifySuperwallUser(_userId: string): Promise<void> {
  // No-op on web
}

export async function resetSuperwallUser(): Promise<void> {
  // No-op on web
}
