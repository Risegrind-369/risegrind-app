/**
 * Paywall Modal Component
 *
 * Displays subscription options with RevenueCat integration.
 * Handles purchases, trial starts, and restore purchases.
 * Hard-wall mode: no back button when trial expired and no active subscription.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Linking from 'expo-linking';
import Purchases, { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useApp } from '@/lib/app-context';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import { useRevenueCat } from '@/lib/revenuecat-provider';
import { useRef, useState } from 'react';

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  onBack?: () => void;
  onLogout?: () => void;
  source: 'onboarding' | 'mentor_limit' | 'trial_expired';
  allowTrial?: boolean;
  showBackButton?: boolean;
}

type PlanType = 'weekly' | 'annual' | 'lifetime';

interface Plan {
  id: PlanType;
  name: string;
  price: string;
  period: string;
  badge?: string;
  description?: string;
  productId: string;
}

const PLANS: Record<PlanType, Plan> = {
  weekly: {
    id: 'weekly',
    name: 'Weekly',
    price: '$9.99',
    period: '/week',
    description: '3-day free trial',
    productId: 'com.risegrind.weekly',
  },
  annual: {
    id: 'annual',
    name: 'Annual',
    price: '$59.99',
    period: '/year',
    badge: 'BEST VALUE',
    description: '7-day free trial • Just $1.15/week',
    productId: 'com.risegrind.annual',
  },
  lifetime: {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$129.99',
    period: 'one-time',
    productId: 'risegrind.lifetime',
  },
};

function PaywallModal({ visible, onClose, onBack, onLogout, source, allowTrial = true, showBackButton = false }: PaywallModalProps) {
  const router = useRouter();
  const { dispatch } = useApp();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { isTrialActive, isPremium } = useRevenueCat();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [packagesError, setPackagesError] = useState<string | null>(null);
  
  // Hard-wall logic: if trial expired AND user has no active subscription, hide back button
  // This applies regardless of where paywall is triggered from (onboarding, mentor_limit, etc.)
  const shouldHardWall = !isTrialActive && !isPremium;
  const effectiveShowBackButton = showBackButton && !shouldHardWall;
  
  // Dev-only paywall bypass (3-tap gesture on Annual plan)
  const annualTapCountRef = useRef(0);
  const annualTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDevEnabled = process.env.EXPO_PUBLIC_DEBUG_BYPASS === 'true';

  // Fetch available packages from RevenueCat with retry logic
  useState(() => {
    if (!visible) return;

    const fetchPackages = async (retryCount = 0) => {
      const MAX_RETRIES = 2;
      const RETRY_DELAY_MS = 2000;
      try {
        setPackagesLoading(true);
        setPackagesError(null);
        const offerings = await Purchases.getOfferings();
        const currentOffering = offerings.current;

        if (!currentOffering) {
          console.warn('[Paywall] No current offering available');
          setPackagesError('No offerings available');
          setPackages([]);
          return;
        }

        const availablePackages = currentOffering.availablePackages;
        console.log('[Paywall] Available packages:', availablePackages.map(p => p.product.identifier));
        setPackages(availablePackages);
        setPackagesError(null);
      } catch (err: any) {
        console.error(`[Paywall] Error fetching packages (attempt ${retryCount + 1}):`, err);
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => fetchPackages(retryCount + 1), RETRY_DELAY_MS);
        } else {
          setPackagesError('Failed to load subscription options');
          setPackages([]);
        }
      } finally {
        setPackagesLoading(false);
      }
    };

    fetchPackages();
  }, [visible]);

  const handleAnnualTap = () => {
    if (!isDevEnabled) return;

    annualTapCountRef.current += 1;

    // Reset counter if more than 3 seconds between taps
    if (annualTapTimerRef.current) {
      clearTimeout(annualTapTimerRef.current);
    }

    annualTapTimerRef.current = setTimeout(() => {
      annualTapCountRef.current = 0;
    }, 3000);

    if (annualTapCountRef.current === 3) {
      annualTapCountRef.current = 0;
      if (annualTapTimerRef.current) clearTimeout(annualTapTimerRef.current);

      // Grant temporary pro access
      (async () => {
        try {
          await AsyncStorage.setItem('debug_pro_override', 'true');
          Alert.alert('🔓 Debug Mode', 'Pro access granted for testing. Restart the app to apply.');
          dispatch({ type: 'SET_PREMIUM', payload: true });
          onClose();  // onClose() handles navigation
        } catch (err) {
          console.error('[Paywall] Debug bypass error:', err);
        }
      })();
    }
  };

  const handlePlanSelect = (plan: PlanType) => {
    setSelectedPlan(plan);
  };

  const handleStartTrial = async () => {
    // Debounce: prevent double-tap
    if (loading || packagesLoading || packages.length === 0) {
      console.log('[Paywall] Purchase already in progress or packages not ready, ignoring tap');
      return;
    }

    setLoading(true);
    try {
      const plan = PLANS[selectedPlan];
      console.log('[Paywall] Starting purchase for plan:', plan.id);

      const selectedPackage = packages.find((pkg) => {
        // Match both old and new product ID formats
        const pkgId = pkg.product.identifier;
        console.log('[Paywall] Checking package:', pkgId, 'against plan productId:', plan.productId);
        return pkgId === plan.productId ||
               pkgId === plan.productId.replace('com.', '') ||
               pkgId === 'com.' + plan.productId;
      });

      if (!selectedPackage) {
        console.error('[Paywall] Selected package not found for plan:', plan.id);
        Alert.alert('Error', 'Selected plan not available. Please try again.');
        setLoading(false);
        return;
      }

      console.log('[Paywall] Calling Purchases.purchasePackage for:', selectedPackage.product.identifier);
      const purchaseResult = await Purchases.purchasePackage(selectedPackage);

      console.log('[Paywall] Purchase result received:', {
        hasProEntitlement: !!purchaseResult?.customerInfo?.entitlements?.active?.['pro'],
        hasPremiumEntitlement: !!purchaseResult?.customerInfo?.entitlements?.active?.['premium'],
        activeEntitlements: Object.keys(purchaseResult?.customerInfo?.entitlements?.active || {}),
      });

      if (purchaseResult?.customerInfo?.entitlements?.active?.['pro'] || purchaseResult?.customerInfo?.entitlements?.active?.['premium']) {
        // Purchase successful
        console.log('[Paywall] Purchase confirmed, calling onClose()');
        dispatch({ type: 'SET_PREMIUM', payload: true });

        try {
          onClose();  // onClose() handles navigation
          console.log('[Paywall] onClose() completed successfully');
        } catch (closeError) {
          console.error('[Paywall] ERROR in onClose():', closeError);
          throw closeError;
        }
      } else {
        console.warn('[Paywall] Purchase result does not contain active entitlement');
        Alert.alert('Error', 'Purchase was not confirmed. Please try again.');
      }
    } catch (error: any) {
      if (error.userCancelled) {
        console.log('[Paywall] User cancelled purchase');
        // User cancelled purchase, do nothing
        return;
      }
      console.error('[Paywall] Purchase error:', error);
      Alert.alert('Error', 'Purchase failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    setLoading(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (customerInfo?.entitlements?.active?.['pro']) {
        dispatch({ type: 'SET_PREMIUM', payload: true });
        onClose();  // onClose() handles navigation
      } else {
        Alert.alert('No Purchases Found', 'No active subscriptions found.');
      }
    } catch (error) {
      console.error('[Paywall] Restore purchases error:', error);
      Alert.alert('Error', 'Failed to restore purchases. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    // If onBack callback provided (from step8-paywall), use it to go back
    if (onBack) {
      onBack();
      return;
    }

    // Otherwise, call onClose() which handles navigation based on source
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <ScreenContainer
        className="bg-background"
        containerClassName="bg-background"
        edges={['top', 'left', 'right', 'bottom']}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Back Button - always available during loading/error, or when not subject to hard-wall */}
          {/* Hard-wall: only hides back button once packages load successfully AND trial expired AND no premium */}
          {(effectiveShowBackButton || packagesLoading || packagesError) && (
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, paddingTop: insets.top + 12 }]}
              className="px-6 py-3"
            >
              <Text className="text-accent font-semibold">← Back</Text>
            </Pressable>
          )}

          {/* Loading State */}
          {packagesLoading && (
            <View className="flex-1 items-center justify-center">
              <ActivityIndicator size="large" color={colors.accent} />
              <Text className="mt-4 text-sm text-muted">Loading subscription options...</Text>
            </View>
          )}

          {/* Error State */}
          {packagesError && (
            <View className="flex-1 items-center justify-center p-6">
              <Text className="text-center text-sm text-error mb-4">{packagesError}</Text>
              <Pressable
                onPress={() => setPackagesLoading(true)}
                className="px-6 py-3 bg-primary rounded-lg"
              >
                <Text className="text-background font-semibold">Retry</Text>
              </Pressable>
            </View>
          )}

          {/* Content */}
          {!packagesLoading && !packagesError && (
            <>
              {/* Header */}
              <View className="px-6 py-8 items-center">
                <Text className="text-3xl font-bold text-foreground mb-2">Unlock Premium</Text>
                <Text className="text-base text-muted text-center">
                  Get unlimited mentors, advanced analytics, and more.
                </Text>
              </View>

              {/* Plans */}
              <View className="px-6 gap-4 mb-8">
                {Object.values(PLANS).map((plan) => (
                  <Pressable
                    key={plan.id}
                    onPress={() => handlePlanSelect(plan.id as PlanType)}
                    onLongPress={() => handleAnnualTap()}
                    style={({ pressed }) => [
                      {
                        opacity: pressed ? 0.7 : 1,
                        borderColor: selectedPlan === plan.id ? colors.primary : colors.border,
                        borderWidth: 2,
                        borderRadius: 12,
                        padding: 16,
                        backgroundColor: selectedPlan === plan.id ? colors.surface : 'transparent',
                      },
                    ]}
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1">
                        <Text className="text-lg font-bold text-foreground">{plan.name}</Text>
                        {plan.description && (
                          <Text className="text-xs text-muted mt-1">{plan.description}</Text>
                        )}
                      </View>
                      <View className="items-end">
                        <Text className="text-xl font-bold text-primary">{plan.price}</Text>
                        <Text className="text-xs text-muted">{plan.period}</Text>
                      </View>
                    </View>
                    {plan.badge && (
                      <View className="mt-3 bg-primary px-3 py-1 rounded-full self-start">
                        <Text className="text-xs font-bold text-background">{plan.badge}</Text>
                      </View>
                    )}
                  </Pressable>
                ))}
              </View>

              {/* CTA Button */}
              <View className="px-6 gap-3 mb-8">
                <Pressable
                  onPress={handleStartTrial}
                  disabled={loading}
                  style={({ pressed }) => [
                    {
                      opacity: loading ? 0.5 : pressed ? 0.9 : 1,
                      backgroundColor: colors.primary,
                      paddingVertical: 16,
                      borderRadius: 12,
                      alignItems: 'center',
                    },
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color={colors.background} />
                  ) : (
                    <Text className="text-lg font-bold text-background">
                      {allowTrial ? 'Start Free Trial' : 'Subscribe Now'}
                    </Text>
                  )}
                </Pressable>

                <Pressable
                  onPress={handleRestorePurchases}
                  disabled={loading}
                  style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                >
                  <Text className="text-center text-sm text-primary font-semibold">
                    Restore Purchase
                  </Text>
                </Pressable>
              </View>

              {/* Footer */}
              <View className="px-6 py-4 items-center gap-2">
                <Text className="text-xs text-muted text-center">
                  By subscribing, you agree to our
                </Text>
                <View className="flex-row gap-2 justify-center">
                  <Pressable
                    onPress={() => {
                      Linking.openURL('https://risegrind-app.lovable.app/terms').catch(() => {
                        Alert.alert('Error', 'Could not open Terms of Service');
                      });
                    }}
                  >
                    <Text className="text-xs text-primary underline">Terms</Text>
                  </Pressable>
                  <Text className="text-xs text-border">·</Text>
                  <Pressable
                    onPress={() => {
                      Linking.openURL('https://risegrind-app.lovable.app/privacy').catch(() => {
                        Alert.alert('Error', 'Could not open Privacy Policy');
                      });
                    }}
                  >
                    <Text className="text-xs text-primary underline">Privacy</Text>
                  </Pressable>
                </View>
              </View>
            </>
          )}
        </ScrollView>

        {/* Logout Button - visible only in hard-wall mode (trial expired, no subscription) */}
        {shouldHardWall && onLogout && (
          <View className="px-6 py-4 border-t" style={{ borderTopColor: colors.border }}>
            <Pressable
              onPress={onLogout}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <Text
                className="text-center text-sm font-medium"
                style={{ color: colors.muted, textDecorationLine: 'underline' }}
              >
                Log out
              </Text>
            </Pressable>
          </View>
        )}
      </ScreenContainer>
    </Modal>
  );
}

export default PaywallModal;
