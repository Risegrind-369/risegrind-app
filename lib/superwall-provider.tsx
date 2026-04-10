/**
 * Superwall Provider
 *
 * Integrates Superwall with RevenueCat using the PurchaseController pattern.
 * Superwall handles paywall presentation; RevenueCat handles the actual purchase.
 *
 * HOW TO CONNECT:
 * 1. Set EXPO_PUBLIC_SUPERWALL_API_KEY_IOS in your .env file (get from Superwall dashboard)
 * 2. Set EXPO_PUBLIC_SUPERWALL_API_KEY_ANDROID in your .env file (for Android builds)
 * 3. In Superwall dashboard, create "placements" (events) that trigger paywalls
 * 4. Call showSuperwallPaywall('your_placement_name') anywhere in the app
 *
 * Architecture:
 * - RevenueCat is configured FIRST (in RevenueCatProvider)
 * - Superwall is configured with a PurchaseController that delegates to RevenueCat
 * - When a paywall purchase is triggered, Superwall calls our controller → RevenueCat processes it
 * - RevenueCat's subscription status is synced back to Superwall after every change
 *
 * NOTE: This uses the legacy @superwall/react-native-superwall package.
 * For new projects on Expo SDK 53+, consider migrating to expo-superwall.
 */
'use client';
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import Superwall from '@superwall/react-native-superwall';
import Purchases, { PURCHASES_ERROR_CODE } from 'react-native-purchases';
import { useRevenueCat } from './revenuecat-provider';

// ─── Environment Keys ────────────────────────────────────────────────────────
// Set these in your .env file:
//   EXPO_PUBLIC_SUPERWALL_API_KEY_IOS=sup_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//   EXPO_PUBLIC_SUPERWALL_API_KEY_ANDROID=sup_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
const SUPERWALL_API_KEY_IOS = process.env.EXPO_PUBLIC_SUPERWALL_API_KEY_IOS || '';
const SUPERWALL_API_KEY_ANDROID = process.env.EXPO_PUBLIC_SUPERWALL_API_KEY_ANDROID || '';

// ─── Provider ─────────────────────────────────────────────────────────────────
interface SuperwallProviderProps {
  children: React.ReactNode;
}

export function SuperwallProvider({ children }: SuperwallProviderProps) {
  const { isPremium, customerInfo } = useRevenueCat();

  useEffect(() => {
    initializeSuperwall();
  }, []);

  // Sync subscription status to Superwall whenever RevenueCat state changes
  useEffect(() => {
    if (Platform.OS === 'web') return;
    syncSubscriptionStatus();
  }, [isPremium, customerInfo]);

  const initializeSuperwall = async () => {
    if (Platform.OS === 'web') {
      console.log('[Superwall] Skipping initialization on web platform');
      return;
    }

    const apiKey = Platform.OS === 'ios' ? SUPERWALL_API_KEY_IOS : SUPERWALL_API_KEY_ANDROID;

    if (!apiKey) {
      console.warn(
        '[Superwall] API key not configured. ' +
        'Set EXPO_PUBLIC_SUPERWALL_API_KEY_IOS / EXPO_PUBLIC_SUPERWALL_API_KEY_ANDROID in your .env file.'
      );
      return;
    }

    try {
      // ── Step 1: Configure Superwall with a PurchaseController ──────────────
      // The PurchaseController intercepts purchase events from Superwall paywalls
      // and routes them through RevenueCat.
      const purchaseController = createRevenueCatPurchaseController();

      await (Superwall as any).configure({
        apiKey,
        purchaseController,
      });

      // ── Step 2: Sync initial subscription status ────────────────────────────
      await syncSubscriptionStatus();

      // ── Step 3: Set user attributes ─────────────────────────────────────────
      await (Superwall as any).setUserAttributes({
        isPremium: isPremium ? 'true' : 'false',
      });

      console.log('[Superwall] Initialized successfully');
    } catch (error) {
      console.error('[Superwall] Failed to initialize:', error);
    }
  };

  /**
   * Syncs the current RevenueCat subscription status to Superwall.
   * Superwall uses this to decide whether to show a paywall or grant access.
   */
  const syncSubscriptionStatus = async () => {
    if (Platform.OS === 'web') return;
    try {
      const info = await Purchases.getCustomerInfo();
      const entitlementIds = Object.keys(info.entitlements.active);

      // Tell Superwall whether the user is subscribed
      await (Superwall as any).setSubscriptionStatus(
        entitlementIds.length === 0
          ? { status: 'INACTIVE' }
          : {
              status: 'ACTIVE',
              entitlements: entitlementIds.map((id) => ({ id, type: 'SERVICE_LEVEL' })),
            }
      );
    } catch (error) {
      console.error('[Superwall] Failed to sync subscription status:', error);
    }
  };

  return <>{children}</>;
}

// ─── RevenueCat Purchase Controller ──────────────────────────────────────────
/**
 * Creates a PurchaseController object that Superwall calls when a user
 * taps "Subscribe" on a Superwall-managed paywall.
 *
 * Flow:
 *   User taps CTA on Superwall paywall
 *   → Superwall calls onPurchase({ productId })
 *   → We fetch the product from RevenueCat and purchase it
 *   → RevenueCat processes the transaction
 *   → We return the result to Superwall
 */
function createRevenueCatPurchaseController() {
  return {
    /**
     * Called by Superwall when the user initiates a purchase.
     * Must return { type: 'purchased' | 'cancelled' | 'failed', error?: string }
     */
    onPurchase: async (params: { productId: string }) => {
      try {
        // Fetch the product from RevenueCat by product ID
        const products = await Purchases.getProducts([params.productId]);
        const product = products[0];

        if (!product) {
          return { type: 'failed', error: `Product not found: ${params.productId}` };
        }

        // Attempt the purchase via RevenueCat
        const { customerInfo } = await Purchases.purchaseStoreProduct(product);
        const hasEntitlement = Object.keys(customerInfo.entitlements.active).length > 0;

        if (hasEntitlement) {
          return { type: 'purchased' };
        } else {
          return { type: 'failed', error: 'No active entitlement after purchase' };
        }
      } catch (error: any) {
        if (
          error?.userCancelled ||
          error?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
        ) {
          return { type: 'cancelled' };
        }
        return { type: 'failed', error: error?.message ?? 'Purchase failed' };
      }
    },

    /**
     * Called by Superwall when the user taps "Restore Purchases".
     * Must return { type: 'restored' | 'failed', error?: string }
     */
    onPurchaseRestore: async () => {
      try {
        await Purchases.restorePurchases();
        return { type: 'restored' };
      } catch (error: any) {
        return { type: 'failed', error: error?.message ?? 'Restore failed' };
      }
    },
  };
}

// ─── Utility Functions ────────────────────────────────────────────────────────

/**
 * Show a Superwall paywall for a given placement/event name.
 *
 * Usage:
 *   showSuperwallPaywall('premium_feature_tapped')
 *   showSuperwallPaywall('onboarding_paywall')
 *
 * The placement name must match exactly what you configured in the Superwall dashboard.
 * If no paywall is configured for this placement, nothing happens.
 */
export async function showSuperwallPaywall(placement: string): Promise<void> {
  if (Platform.OS === 'web') {
    console.log(`[Superwall] Skipping paywall on web for placement: ${placement}`);
    return;
  }
  try {
    await (Superwall as any).registerEvent(placement);
  } catch (error) {
    console.error(`[Superwall] Failed to show paywall for placement "${placement}":`, error);
  }
}

/**
 * Identify a user in Superwall (call this after login).
 * This links Superwall analytics to your user ID.
 */
export async function identifySuperwallUser(userId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await (Superwall as any).identify(userId);
  } catch (error) {
    console.error('[Superwall] Failed to identify user:', error);
  }
}

/**
 * Reset Superwall user (call this on logout).
 */
export async function resetSuperwallUser(): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await (Superwall as any).reset();
  } catch (error) {
    console.error('[Superwall] Failed to reset user:', error);
  }
}
