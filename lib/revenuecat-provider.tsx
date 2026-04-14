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
 * 1. Set EXPO_PUBLIC_RC_API_KEY_IOS in your .env file (starts with 'appl_')
 * 2. Set EXPO_PUBLIC_RC_API_KEY_ANDROID in your .env file (starts with 'goog_')
 * 3. In RevenueCat dashboard, create an entitlement named "premium"
 * 4. Attach your subscription products (monthly + yearly + 3-day trial) to that entitlement
 */
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// ─── Environment Keys ────────────────────────────────────────────────────────
// iOS key starts with 'appl_', Android key starts with 'goog_'
const RC_API_KEY_IOS = process.env.EXPO_PUBLIC_RC_API_KEY_IOS ?? '';
const RC_API_KEY_ANDROID = process.env.EXPO_PUBLIC_RC_API_KEY_ANDROID ?? '';

// ─── Guard: only run native SDK in dev/production builds, not Expo Go or web ─
const IS_NATIVE_BUILD =
  Platform.OS !== 'web' &&
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface RevenueCatContextType {
  isLoading: boolean;
  isPremium: boolean;
  isTrialActive: boolean;
  customerInfo: any | null;
  packages: any[] | null;
  offerings: any | null;
  error: string | null;
  isNativeBuild: boolean;
  restorePurchases: () => Promise<void>;
  purchasePackage: (pkg: any) => Promise<boolean>;
  checkEntitlement: () => Promise<boolean>;
  getMonthlyPackage: () => any | null;
  getAnnualPackage: () => any | null;
}

// ─── Context ──────────────────────────────────────────────────────────────────
const RevenueCatContext = createContext<RevenueCatContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export function RevenueCatProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<
    Omit<RevenueCatContextType, 'restorePurchases' | 'purchasePackage' | 'checkEntitlement' | 'isNativeBuild' | 'getMonthlyPackage' | 'getAnnualPackage'>
  >({
    isLoading: IS_NATIVE_BUILD, // if native, start loading; otherwise skip
    isPremium: false,
    isTrialActive: false,
    customerInfo: null,
    packages: null,
    offerings: null,
    error: null,
  });

  // Prevent double-init in StrictMode
  const initialized = useRef(false);

  useEffect(() => {
    if (!IS_NATIVE_BUILD) {
      // In Expo Go or web: skip SDK, set loading = false immediately
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }
    if (initialized.current) return;
    initialized.current = true;
    initializeRevenueCat();
  }, []);

  const initializeRevenueCat = async () => {
    try {
      // Dynamically import to avoid bundler crash on web/Expo Go
      const { default: Purchases, LOG_LEVEL } = await import('react-native-purchases');

      // Enable verbose logging for debugging purchase flows
      await Purchases.setLogLevel(LOG_LEVEL.VERBOSE);

      // Select the correct API key based on platform
      const apiKey = Platform.OS === 'ios' ? RC_API_KEY_IOS : RC_API_KEY_ANDROID;

      if (!apiKey) {
        console.warn(
          '[RevenueCat] ⚠️  API key not configured.\n' +
          '  iOS:     Set EXPO_PUBLIC_RC_API_KEY_IOS (starts with "appl_")\n' +
          '  Android: Set EXPO_PUBLIC_RC_API_KEY_ANDROID (starts with "goog_")\n' +
          '  Get keys from: https://app.revenuecat.com → Project → API Keys'
        );
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: 'RevenueCat API key not configured',
        }));
        return;
      }

      console.log(`[RevenueCat] Initializing on ${Platform.OS} with key: ${apiKey.slice(0, 8)}...`);

      // Configure RevenueCat — appUserID: undefined lets RC auto-generate an anonymous ID
      await Purchases.configure({ apiKey, appUserID: undefined });

      console.log('[RevenueCat] ✅ Configured successfully');

      // Fetch customer info and offerings in parallel
      const [customerInfo, offerings] = await Promise.all([
        Purchases.getCustomerInfo(),
        Purchases.getOfferings(),
      ]);

      let isPremium = !!customerInfo.entitlements.active['premium'];
      let isTrialActive = isPremium &&
        customerInfo.entitlements.active['premium']?.periodType === 'TRIAL';
      
      // Check for local trial start time (set when user taps "Start Trial" in trial-reveal.tsx)
      if (!isPremium) {
        try {
          const AsyncStorage = await import('@react-native-async-storage/async-storage').then(m => m.default);
          const trialStartedAt = await AsyncStorage.getItem('trialStartedAt');
          if (trialStartedAt) {
            const startTime = parseInt(trialStartedAt, 10);
            const now = Date.now();
            const trialDurationMs = 3 * 24 * 60 * 60 * 1000; // 72 hours
            if (now - startTime < trialDurationMs) {
              console.log('[RevenueCat] ✅ Trial is active (local timer)');
              isPremium = true;
              isTrialActive = true;
            } else {
              console.log('[RevenueCat] ⏰ Trial has expired (local timer)');
              // Clear expired trial marker
              await AsyncStorage.removeItem('trialStartedAt');
            }
          }
        } catch (err) {
          console.warn('[RevenueCat] Error checking local trial:', err);
        }
      }
      
      const allPackages: any[] = offerings.current?.availablePackages ?? [];

      console.log(`[RevenueCat] isPremium=${isPremium}, isTrialActive=${isTrialActive}, packages=${allPackages.length}`);

      setState({
        isLoading: false,
        isPremium,
        isTrialActive,
        customerInfo,
        packages: allPackages,
        offerings,
        error: null,
      });

      // Real-time listener: updates state instantly after purchase, trial activation, or cancellation
      Purchases.addCustomerInfoUpdateListener(async (newCustomerInfo) => {
        let newIsPremium = !!newCustomerInfo.entitlements.active['premium'];
        let newIsTrialActive = newIsPremium &&
          newCustomerInfo.entitlements.active['premium']?.periodType === 'TRIAL';
        
        // Also check local trial timer
        if (!newIsPremium) {
          try {
            const AsyncStorage = await import('@react-native-async-storage/async-storage').then(m => m.default);
            const trialStartedAt = await AsyncStorage.getItem('trialStartedAt');
            if (trialStartedAt) {
              const startTime = parseInt(trialStartedAt, 10);
              const now = Date.now();
              const trialDurationMs = 3 * 24 * 60 * 60 * 1000; // 72 hours
              if (now - startTime < trialDurationMs) {
                newIsPremium = true;
                newIsTrialActive = true;
              }
            }
          } catch (err) {
            console.warn('[RevenueCat] Error checking local trial in listener:', err);
          }
        }
        
        console.log(`[RevenueCat] 🔄 CustomerInfo updated: isPremium=${newIsPremium}, isTrialActive=${newIsTrialActive}`);
        setState((prev) => ({
          ...prev,
          isPremium: newIsPremium,
          isTrialActive: newIsTrialActive,
          customerInfo: newCustomerInfo,
        }));
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to initialize RevenueCat';
      console.error('[RevenueCat] ❌ Init error:', error);
      setState((prev) => ({ ...prev, isLoading: false, error: message }));
    }
  };

  // ─── Restore Purchases ─────────────────────────────────────────────────────
  const restorePurchases = async () => {
    if (!IS_NATIVE_BUILD) return;
    try {
      const { default: Purchases } = await import('react-native-purchases');
      console.log('[RevenueCat] Restoring purchases...');
      const customerInfo = await Purchases.restorePurchases();
      const isPremium = !!customerInfo.entitlements.active['premium'];
      const isTrialActive = isPremium &&
        customerInfo.entitlements.active['premium']?.periodType === 'TRIAL';
      console.log(`[RevenueCat] Restore complete: isPremium=${isPremium}`);
      setState((prev) => ({ ...prev, isPremium, isTrialActive, customerInfo, error: null }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to restore purchases';
      console.error('[RevenueCat] Restore error:', error);
      setState((prev) => ({ ...prev, error: message }));
    }
  };

  // ─── Purchase Package ──────────────────────────────────────────────────────
  const purchasePackage = async (pkg: any): Promise<boolean> => {
    if (!IS_NATIVE_BUILD) {
      // Demo mode: simulate successful purchase in Expo Go / web
      console.log('[RevenueCat] Demo mode: simulating purchase');
      try {
        const AsyncStorage = await import('@react-native-async-storage/async-storage').then(m => m.default);
        // Also set trial start time for consistency
        await AsyncStorage.setItem('trialStartedAt', Date.now().toString());
      } catch (err) {
        console.warn('[RevenueCat] Error setting trial start time in demo mode:', err);
      }
      setState((prev) => ({ ...prev, isPremium: true, isTrialActive: true }));
      return true;
    }
    try {
      const { default: Purchases } = await import('react-native-purchases');
      console.log(`[RevenueCat] Purchasing package: ${pkg?.packageType}`);
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isPremium = !!customerInfo.entitlements.active['premium'];
      const isTrialActive = isPremium &&
        customerInfo.entitlements.active['premium']?.periodType === 'TRIAL';
      console.log(`[RevenueCat] ✅ Purchase complete: isPremium=${isPremium}, isTrialActive=${isTrialActive}`);
      setState((prev) => ({ ...prev, isPremium, isTrialActive, customerInfo, error: null }));
      return isPremium;
    } catch (error: any) {
      if (error?.userCancelled) {
        console.log('[RevenueCat] Purchase cancelled by user');
        return false;
      }
      const message = error instanceof Error ? error.message : 'Purchase failed';
      console.error('[RevenueCat] ❌ Purchase error:', error);
      setState((prev) => ({ ...prev, error: message }));
      return false;
    }
  };

  // ─── Check Entitlement (fresh fetch) ──────────────────────────────────
  const checkEntitlement = async (): Promise<boolean> => {
    if (!IS_NATIVE_BUILD) return state.isPremium;
    try {
      const { default: Purchases } = await import('react-native-purchases');
      const customerInfo = await Purchases.getCustomerInfo();
      let isPremium = !!customerInfo.entitlements.active['premium'];
      
      // Also check local trial timer
      if (!isPremium) {
        try {
          const AsyncStorage = await import('@react-native-async-storage/async-storage').then(m => m.default);
          const trialStartedAt = await AsyncStorage.getItem('trialStartedAt');
          if (trialStartedAt) {
            const startTime = parseInt(trialStartedAt, 10);
            const now = Date.now();
            const trialDurationMs = 3 * 24 * 60 * 60 * 1000; // 72 hours
            if (now - startTime < trialDurationMs) {
              isPremium = true;
            }
          }
        } catch (err) {
          console.warn('[RevenueCat] Error checking local trial in checkEntitlement:', err);
        }
      }
      
      return isPremium;
    } catch (error) {
      console.error('[RevenueCat] Failed to check entitlement:', error);
      return state.isPremium;
    }
  };

  // ─── Package Helpers ───────────────────────────────────────────────────────
  const getMonthlyPackage = (): any | null => {
    if (!state.packages) return null;
    return state.packages.find((p: any) => p.packageType === 'MONTHLY') ?? state.packages[0] ?? null;
  };

  const getAnnualPackage = (): any | null => {
    if (!state.packages) return null;
    return state.packages.find((p: any) => p.packageType === 'ANNUAL') ?? null;
  };

  return (
    <RevenueCatContext.Provider
      value={{
        ...state,
        isNativeBuild: IS_NATIVE_BUILD,
        restorePurchases,
        purchasePackage,
        checkEntitlement,
        getMonthlyPackage,
        getAnnualPackage,
      }}
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
