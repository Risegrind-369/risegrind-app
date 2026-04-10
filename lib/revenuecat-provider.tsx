/**
 * RevenueCat Provider
 *
 * Initializes RevenueCat (react-native-purchases) and exposes subscription state
 * throughout the app via React Context.
 *
 * HOW TO CONNECT:
 * 1. Set EXPO_PUBLIC_RC_API_KEY_IOS in your .env file (get from RevenueCat dashboard)
 * 2. Set EXPO_PUBLIC_RC_API_KEY_ANDROID in your .env file (for Android builds)
 * 3. In RevenueCat dashboard, create an entitlement named "premium"
 * 4. Attach your subscription products to that entitlement
 *
 * On web/simulator, falls back to mock state so the app remains functional.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
} from 'react-native-purchases';

// ─── Environment Keys ────────────────────────────────────────────────────────
// Set these in your .env file:
//   EXPO_PUBLIC_RC_API_KEY_IOS=appl_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
//   EXPO_PUBLIC_RC_API_KEY_ANDROID=goog_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
const RC_API_KEY_IOS = process.env.EXPO_PUBLIC_RC_API_KEY_IOS || '';
const RC_API_KEY_ANDROID = process.env.EXPO_PUBLIC_RC_API_KEY_ANDROID || '';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface RevenueCatContextType {
  isLoading: boolean;
  isPremium: boolean;
  customerInfo: CustomerInfo | null;
  packages: any[] | null;
  offerings: any | null;
  error: string | null;
  restorePurchases: () => Promise<void>;
  purchasePackage: (pkg: any) => Promise<boolean>;
  checkEntitlement: () => Promise<boolean>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const RevenueCatContext = createContext<RevenueCatContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function RevenueCatProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<
    Omit<RevenueCatContextType, 'restorePurchases' | 'purchasePackage' | 'checkEntitlement'>
  >({
    isLoading: true,
    isPremium: false,
    customerInfo: null,
    packages: null,
    offerings: null,
    error: null,
  });

  useEffect(() => {
    initializeRevenueCat();
  }, []);

  const initializeRevenueCat = async () => {
    try {
      // Web: skip native SDK, grant premium for demo purposes
      if (Platform.OS === 'web') {
        setState((prev) => ({ ...prev, isLoading: false, isPremium: false }));
        return;
      }

      // Enable debug logging (remove in production)
      await Purchases.setLogLevel(LOG_LEVEL.DEBUG);

      // Select the correct API key for the platform
      const apiKey = Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID;

      if (!apiKey) {
        console.warn(
          '[RevenueCat] API key not configured. ' +
          'Set EXPO_PUBLIC_RC_API_KEY_IOS / EXPO_PUBLIC_RC_API_KEY_ANDROID in your .env file.'
        );
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'RevenueCat API key not configured',
        }));
        return;
      }

      // Initialize RevenueCat SDK
      // appUserID: undefined → RevenueCat generates an anonymous ID automatically.
      // To link to your own user system, pass your user's ID here after login.
      await Purchases.configure({
        apiKey,
        appUserID: undefined,
      });

      // Fetch initial customer info and offerings
      const [customerInfo, offerings] = await Promise.all([
        Purchases.getCustomerInfo(),
        Purchases.getOfferings(),
      ]);

      // Check the "premium" entitlement — must match exactly what you named it in RevenueCat
      const isPremium = !!customerInfo.entitlements.active['premium'];

      // Collect all packages from the current offering
      const allPackages: any[] = offerings.current?.availablePackages ?? [];

      setState({
        isLoading: false,
        isPremium,
        customerInfo,
        packages: allPackages,
        offerings,
        error: null,
      });

      // Listen for real-time subscription changes (e.g., renewal, cancellation)
      Purchases.addCustomerInfoUpdateListener((newCustomerInfo) => {
        const newIsPremium = !!newCustomerInfo.entitlements.active['premium'];
        setState((prev) => ({
          ...prev,
          isPremium: newIsPremium,
          customerInfo: newCustomerInfo,
        }));
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to initialize RevenueCat';
      console.error('[RevenueCat] Init error:', error);
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
    }
  };

  // ─── Restore Purchases ──────────────────────────────────────────────────────
  const restorePurchases = async () => {
    if (Platform.OS === 'web') return;
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isPremium = !!customerInfo.entitlements.active['premium'];
      setState((prev) => ({ ...prev, isPremium, customerInfo, error: null }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to restore purchases';
      setState((prev) => ({ ...prev, error: message }));
    }
  };

  // ─── Purchase a Package ─────────────────────────────────────────────────────
  const purchasePackage = async (pkg: any): Promise<boolean> => {
    if (Platform.OS === 'web') {
      setState((prev) => ({ ...prev, isPremium: true }));
      return true;
    }
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isPremium = !!customerInfo.entitlements.active['premium'];
      setState((prev) => ({ ...prev, isPremium, customerInfo, error: null }));
      return isPremium;
    } catch (error: any) {
      if (error?.userCancelled) return false;
      const message = error instanceof Error ? error.message : 'Purchase failed';
      setState((prev) => ({ ...prev, error: message }));
      return false;
    }
  };

  // ─── Check Entitlement ──────────────────────────────────────────────────────
  const checkEntitlement = async (): Promise<boolean> => {
    if (Platform.OS === 'web') return state.isPremium;
    try {
      const customerInfo = await Purchases.getCustomerInfo();
      return !!customerInfo.entitlements.active['premium'];
    } catch (error) {
      console.error('[RevenueCat] Failed to check entitlement:', error);
      return state.isPremium;
    }
  };

  return (
    <RevenueCatContext.Provider
      value={{ ...state, restorePurchases, purchasePackage, checkEntitlement }}
    >
      {children}
    </RevenueCatContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useRevenueCat() {
  const context = useContext(RevenueCatContext);
  if (!context) {
    throw new Error('useRevenueCat must be used within RevenueCatProvider');
  }
  return context;
}
