/**
 * RevenueCat Provider
 *
 * Initializes RevenueCat (react-native-purchases) and exposes subscription state
 * throughout the app via React Context.
 *
 * IMPORTANT: react-native-purchases is a NATIVE MODULE.
 * It requires a development build (EAS build) and will NOT work in:
 *   - Expo Go (storeClient execution environment)
 *   - Web browser
 *
 * To create a development build:
 *   npx eas build --profile development --platform ios
 *
 * HOW TO CONNECT:
 * 1. Set EXPO_PUBLIC_RC_API_KEY_IOS in your .env file (get from RevenueCat dashboard)
 * 2. Set EXPO_PUBLIC_RC_API_KEY_ANDROID in your .env file (for Android builds)
 * 3. In RevenueCat dashboard, create an entitlement named "premium"
 * 4. Attach your subscription products to that entitlement
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// ─── Environment Keys ────────────────────────────────────────────────────────
const RC_API_KEY_IOS = process.env.EXPO_PUBLIC_RC_API_KEY_IOS || '';
const RC_API_KEY_ANDROID = process.env.EXPO_PUBLIC_RC_API_KEY_ANDROID || '';

// ─── Guard: only run native SDK in dev/production builds, not Expo Go or web ─
const IS_NATIVE_BUILD =
  Platform.OS !== 'web' &&
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface RevenueCatContextType {
  isLoading: boolean;
  isPremium: boolean;
  customerInfo: any | null;
  packages: any[] | null;
  offerings: any | null;
  error: string | null;
  isNativeBuild: boolean;
  restorePurchases: () => Promise<void>;
  purchasePackage: (pkg: any) => Promise<boolean>;
  checkEntitlement: () => Promise<boolean>;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const RevenueCatContext = createContext<RevenueCatContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function RevenueCatProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<
    Omit<RevenueCatContextType, 'restorePurchases' | 'purchasePackage' | 'checkEntitlement' | 'isNativeBuild'>
  >({
    isLoading: !IS_NATIVE_BUILD, // if not native, skip loading immediately
    isPremium: false,
    customerInfo: null,
    packages: null,
    offerings: null,
    error: null,
  });

  useEffect(() => {
    if (!IS_NATIVE_BUILD) {
      // In Expo Go or web: skip SDK, set loading = false
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }
    initializeRevenueCat();
  }, []);

  const initializeRevenueCat = async () => {
    try {
      // Dynamically import to avoid bundler crash on web/Expo Go
      const { default: Purchases, LOG_LEVEL } = await import('react-native-purchases');

      await Purchases.setLogLevel(LOG_LEVEL.DEBUG);

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

      await Purchases.configure({ apiKey, appUserID: undefined });

      const [customerInfo, offerings] = await Promise.all([
        Purchases.getCustomerInfo(),
        Purchases.getOfferings(),
      ]);

      const isPremium = !!customerInfo.entitlements.active['premium'];
      const allPackages: any[] = offerings.current?.availablePackages ?? [];

      setState({
        isLoading: false,
        isPremium,
        customerInfo,
        packages: allPackages,
        offerings,
        error: null,
      });

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

  const restorePurchases = async () => {
    if (!IS_NATIVE_BUILD) return;
    try {
      const { default: Purchases } = await import('react-native-purchases');
      const customerInfo = await Purchases.restorePurchases();
      const isPremium = !!customerInfo.entitlements.active['premium'];
      setState((prev) => ({ ...prev, isPremium, customerInfo, error: null }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to restore purchases';
      setState((prev) => ({ ...prev, error: message }));
    }
  };

  const purchasePackage = async (pkg: any): Promise<boolean> => {
    if (!IS_NATIVE_BUILD) {
      // Demo mode: simulate purchase in Expo Go
      setState((prev) => ({ ...prev, isPremium: true }));
      return true;
    }
    try {
      const { default: Purchases } = await import('react-native-purchases');
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

  const checkEntitlement = async (): Promise<boolean> => {
    if (!IS_NATIVE_BUILD) return state.isPremium;
    try {
      const { default: Purchases } = await import('react-native-purchases');
      const customerInfo = await Purchases.getCustomerInfo();
      return !!customerInfo.entitlements.active['premium'];
    } catch (error) {
      console.error('[RevenueCat] Failed to check entitlement:', error);
      return state.isPremium;
    }
  };

  return (
    <RevenueCatContext.Provider
      value={{ ...state, isNativeBuild: IS_NATIVE_BUILD, restorePurchases, purchasePackage, checkEntitlement }}
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
