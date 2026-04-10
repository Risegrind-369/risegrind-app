/**
 * Superwall Provider
 *
 * Integrates Superwall with RevenueCat using the PurchaseController pattern.
 *
 * IMPORTANT: @superwall/react-native-superwall is a NATIVE MODULE.
 * It requires a development build (EAS build) and will NOT work in:
 *   - Expo Go (storeClient execution environment)
 *   - Web browser
 *
 * To create a development build:
 *   npx eas build --profile development --platform ios
 *
 * HOW TO CONNECT:
 * 1. Set EXPO_PUBLIC_SUPERWALL_API_KEY_IOS in your .env file
 * 2. Set EXPO_PUBLIC_SUPERWALL_API_KEY_ANDROID in your .env file
 * 3. In Superwall dashboard, create placements that trigger paywalls
 * 4. Call showSuperwallPaywall('placement_name') anywhere in the app
 */
import React, { useEffect } from 'react';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { useRevenueCat } from './revenuecat-provider';

// ─── Environment Keys ────────────────────────────────────────────────────────
const SUPERWALL_API_KEY_IOS = process.env.EXPO_PUBLIC_SUPERWALL_API_KEY_IOS || '';
const SUPERWALL_API_KEY_ANDROID = process.env.EXPO_PUBLIC_SUPERWALL_API_KEY_ANDROID || '';

// ─── Guard: only run native SDK in dev/production builds, not Expo Go or web ─
const IS_NATIVE_BUILD =
  Platform.OS !== 'web' &&
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

// ─── Provider ─────────────────────────────────────────────────────────────────
export function SuperwallProvider({ children }: { children: React.ReactNode }) {
  const { isPremium, customerInfo } = useRevenueCat();

  useEffect(() => {
    if (!IS_NATIVE_BUILD) return;
    initializeSuperwall();
  }, []);

  useEffect(() => {
    if (!IS_NATIVE_BUILD) return;
    syncSubscriptionStatus();
  }, [isPremium, customerInfo]);

  const initializeSuperwall = async () => {
    const apiKey = Platform.OS === 'ios' ? SUPERWALL_API_KEY_IOS : SUPERWALL_API_KEY_ANDROID;

    if (!apiKey) {
      console.warn('[Superwall] API key not configured.');
      return;
    }

    try {
      const { default: Superwall } = await import('@superwall/react-native-superwall');
      const { default: Purchases, PURCHASES_ERROR_CODE } = await import('react-native-purchases');

      const purchaseController = {
        onPurchase: async (params: { productId: string }) => {
          try {
            const products = await Purchases.getProducts([params.productId]);
            const product = products[0];
            if (!product) return { type: 'failed', error: `Product not found: ${params.productId}` };
            const { customerInfo } = await Purchases.purchaseStoreProduct(product);
            const hasEntitlement = Object.keys(customerInfo.entitlements.active).length > 0;
            return hasEntitlement ? { type: 'purchased' } : { type: 'failed', error: 'No active entitlement' };
          } catch (error: any) {
            if (error?.userCancelled || error?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR) {
              return { type: 'cancelled' };
            }
            return { type: 'failed', error: error?.message ?? 'Purchase failed' };
          }
        },
        onPurchaseRestore: async () => {
          try {
            await Purchases.restorePurchases();
            return { type: 'restored' };
          } catch (error: any) {
            return { type: 'failed', error: error?.message ?? 'Restore failed' };
          }
        },
      };

      await (Superwall as any).configure({ apiKey, purchaseController });
      await syncSubscriptionStatus();
      await (Superwall as any).setUserAttributes({ isPremium: isPremium ? 'true' : 'false' });
      console.log('[Superwall] Initialized successfully');
    } catch (error) {
      console.error('[Superwall] Failed to initialize:', error);
    }
  };

  const syncSubscriptionStatus = async () => {
    if (!IS_NATIVE_BUILD) return;
    try {
      const { default: Purchases } = await import('react-native-purchases');
      const { default: Superwall } = await import('@superwall/react-native-superwall');
      const info = await Purchases.getCustomerInfo();
      const entitlementIds = Object.keys(info.entitlements.active);
      await (Superwall as any).setSubscriptionStatus(
        entitlementIds.length === 0
          ? { status: 'INACTIVE' }
          : { status: 'ACTIVE', entitlements: entitlementIds.map((id) => ({ id, type: 'SERVICE_LEVEL' })) }
      );
    } catch (error) {
      console.error('[Superwall] Failed to sync subscription status:', error);
    }
  };

  return <>{children}</>;
}

// ─── Utility: Show a Superwall Paywall ────────────────────────────────────────
export async function showSuperwallPaywall(placement: string): Promise<void> {
  if (!IS_NATIVE_BUILD) {
    console.log(`[Superwall] Skipping paywall in Expo Go/web for placement: ${placement}`);
    return;
  }
  try {
    const { default: Superwall } = await import('@superwall/react-native-superwall');
    await (Superwall as any).registerEvent(placement);
  } catch (error) {
    console.error(`[Superwall] Failed to show paywall for placement "${placement}":`, error);
  }
}

export async function identifySuperwallUser(userId: string): Promise<void> {
  if (!IS_NATIVE_BUILD) return;
  try {
    const { default: Superwall } = await import('@superwall/react-native-superwall');
    await (Superwall as any).identify(userId);
  } catch (error) {
    console.error('[Superwall] Failed to identify user:', error);
  }
}

export async function resetSuperwallUser(): Promise<void> {
  if (!IS_NATIVE_BUILD) return;
  try {
    const { default: Superwall } = await import('@superwall/react-native-superwall');
    await (Superwall as any).reset();
  } catch (error) {
    console.error('[Superwall] Failed to reset user:', error);
  }
}
