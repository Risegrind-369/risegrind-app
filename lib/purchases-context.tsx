/**
 * RevenueCat Purchases Context
 *
 * Wraps react-native-purchases to provide subscription state throughout the app.
 * On web/simulator, falls back to mock state so the app remains functional.
 */
import React, { createContext, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

export interface PurchasesState {
  isPremium: boolean;
  isLoading: boolean;
  customerInfo: unknown | null;
  offerings: unknown | null;
}

interface PurchasesContextValue extends PurchasesState {
  checkEntitlement: () => Promise<boolean>;
  restorePurchases: () => Promise<void>;
  purchasePackage: (pkg: unknown) => Promise<boolean>;
}

const PurchasesContext = createContext<PurchasesContextValue | null>(null);

// RevenueCat API key — set via environment or placeholder
const RC_API_KEY_IOS = process.env.EXPO_PUBLIC_RC_API_KEY_IOS ?? "appl_REPLACE_WITH_YOUR_REVENUECAT_KEY";

export function PurchasesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PurchasesState>({
    isPremium: false,
    isLoading: true,
    customerInfo: null,
    offerings: null,
  });

  useEffect(() => {
    initRevenueCat();
  }, []);

  async function initRevenueCat() {
    if (Platform.OS === "web") {
      // Web: skip native SDK, grant premium for demo
      setState({ isPremium: true, isLoading: false, customerInfo: null, offerings: null });
      return;
    }

    try {
      const Purchases = (await import("react-native-purchases")).default;
      const LOG_LEVEL = (await import("react-native-purchases")).LOG_LEVEL;

      Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      await Purchases.configure({ apiKey: RC_API_KEY_IOS });

      const info = await Purchases.getCustomerInfo();
      const premium = info.entitlements.active["premium"] !== undefined;
      const offerings = await Purchases.getOfferings();

      setState({
        isPremium: premium,
        isLoading: false,
        customerInfo: info,
        offerings,
      });
    } catch (e) {
      console.warn("RevenueCat init failed:", e);
      setState((prev) => ({ ...prev, isLoading: false }));
    }
  }

  async function checkEntitlement(): Promise<boolean> {
    if (Platform.OS === "web") return true;
    try {
      const Purchases = (await import("react-native-purchases")).default;
      const info = await Purchases.getCustomerInfo();
      const premium = info.entitlements.active["premium"] !== undefined;
      setState((prev) => ({ ...prev, isPremium: premium, customerInfo: info }));
      return premium;
    } catch {
      return state.isPremium;
    }
  }

  async function restorePurchases(): Promise<void> {
    if (Platform.OS === "web") return;
    try {
      const Purchases = (await import("react-native-purchases")).default;
      const info = await Purchases.restorePurchases();
      const premium = info.entitlements.active["premium"] !== undefined;
      setState((prev) => ({ ...prev, isPremium: premium, customerInfo: info }));
    } catch (e) {
      console.warn("Restore failed:", e);
    }
  }

  async function purchasePackage(pkg: unknown): Promise<boolean> {
    if (Platform.OS === "web") {
      setState((prev) => ({ ...prev, isPremium: true }));
      return true;
    }
    try {
      const Purchases = (await import("react-native-purchases")).default;
      const { customerInfo } = await Purchases.purchasePackage(pkg as Parameters<typeof Purchases.purchasePackage>[0]);
      const premium = customerInfo.entitlements.active["premium"] !== undefined;
      setState((prev) => ({ ...prev, isPremium: premium, customerInfo }));
      return premium;
    } catch (e: unknown) {
      if ((e as { userCancelled?: boolean })?.userCancelled) return false;
      throw e;
    }
  }

  return (
    <PurchasesContext.Provider
      value={{ ...state, checkEntitlement, restorePurchases, purchasePackage }}
    >
      {children}
    </PurchasesContext.Provider>
  );
}

export function usePurchases() {
  const ctx = useContext(PurchasesContext);
  if (!ctx) throw new Error("usePurchases must be used within PurchasesProvider");
  return ctx;
}
