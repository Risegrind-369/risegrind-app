import React, { useState, useEffect, useRef } from 'react';
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
  useEffect(() => {
    if (!visible) return;

    const fetchPackages = async (retryCount = 0) => {
      const MAX_RETRIES = 2;
      const RETRY_DELAY_MS = 2000;

      try {
        setPackagesLoading(true);
        setPackagesError(null);
        
        const offerings = await Purchases.getOfferings();
        if (offerings?.current?.availablePackages && offerings.current.availablePackages.length > 0) {
          setPackages(offerings.current.availablePackages);
          setPackagesLoading(false);
          return;
        }
        
        // No packages returned, retry if we haven't exceeded max retries
        if (retryCount < MAX_RETRIES) {
          console.warn(`[Paywall] No packages found, retrying (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
          return fetchPackages(retryCount + 1);
        }
        
        // All retries exhausted
        console.error('[Paywall] Failed to fetch packages after retries');
        setPackagesError('Unable to load subscription options. Check your connection and try again.');
        setPackagesLoading(false);
      } catch (error) {
        console.error('[Paywall] Error fetching packages:', error);
        
        // Retry on network error if we haven't exceeded max retries
        if (retryCount < MAX_RETRIES) {
          console.warn(`[Paywall] Network error, retrying (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
          return fetchPackages(retryCount + 1);
        }
        
        // All retries exhausted
        setPackagesError('Unable to load subscription options. Check your connection and try again.');
        setPackagesLoading(false);
      }
    };

    fetchPackages();
  }, [visible]);

  const handleAnnualPlanTap = async () => {
    // First, always select the Annual plan (normal behavior)
    handlePlanSelect('annual');
    
    // Then check for dev bypass (3-tap in 3 seconds)
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
      console.error('[Paywall] Restore error:', error);
      Alert.alert('Restore Failed', 'Please try again.');
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
    
    onClose();
    // If from onboarding, navigate to home; if from mentor limit, just close
    if (source === 'onboarding') {
      router.replace('/(tabs)');
    }
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

          {/* Error State with Retry */}
          {packagesError && !packagesLoading && (
            <View className="flex-1 items-center justify-center px-6 gap-4">
              <Text className="text-center text-base font-semibold text-error">{packagesError}</Text>
              <Pressable
                onPress={async () => {
                  setPackagesError(null);
                  setPackagesLoading(true);
                  // Retrigger fetch
                  const retryFetch = async (retryCount = 0) => {
                    const MAX_RETRIES = 2;
                    const RETRY_DELAY_MS = 2000;
                    try {
                      const offerings = await Purchases.getOfferings();
                      if (offerings?.current?.availablePackages && offerings.current.availablePackages.length > 0) {
                        setPackages(offerings.current.availablePackages);
                        setPackagesLoading(false);
                        return;
                      }
                      if (retryCount < MAX_RETRIES) {
                        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                        return retryFetch(retryCount + 1);
                      }
                      setPackagesError('Unable to load subscription options. Check your connection and try again.');
                      setPackagesLoading(false);
                    } catch (error) {
                      console.error('[Paywall] Error during retry:', error);
                      if (retryCount < MAX_RETRIES) {
                        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS));
                        return retryFetch(retryCount + 1);
                      }
                      setPackagesError('Unable to load subscription options. Check your connection and try again.');
                      setPackagesLoading(false);
                    }
                  };
                  retryFetch();
                }}
                className="rounded-lg bg-accent px-6 py-3"
              >
                <Text className="font-semibold text-background">Try Again</Text>
              </Pressable>
            </View>
          )}

          {/* Normal Content - only show when packages loaded successfully */}
          {!packagesLoading && !packagesError && (
            <>
          {/* Title with top padding */}
          <View className="px-6 py-8">
            <Text className="text-4xl font-bold text-foreground text-center leading-tight">
              Unlock Your Full Potential
            </Text>
          </View>

          {/* Removed timeline - direct paywall, no trial */}

          {/* Feature Checklist - 8 features */}
          <View className="px-6 py-6 bg-surface rounded-2xl mx-6 mb-8" style={{ borderColor: colors.border, borderWidth: 1 }}>
            <Text className="text-foreground font-bold text-lg mb-4">WHAT YOU GET:</Text>
            <View className="gap-3">
              {[
                { text: 'Unlimited AI mentor conversations', icon: '🔒' },
                { text: 'Claude-powered mentor (the most advanced AI)', icon: '🟠', isOrange: true },
                { text: 'XP system + level progression', icon: '⚡' },
                { text: 'Ghost Crew leaderboard', icon: '👻' },
                { text: 'Unlimited habit streaks', icon: '🔥' },
                { text: 'Weekly performance insights', icon: '📊' },
                { text: 'AI-powered journal analysis', icon: '📓' },
                { text: 'Side Quests + achievements', icon: '🏆' },
              ].map((feature, idx) => (
                <View key={idx} className="flex-row gap-3 items-flex-start">
                  <Text className="text-lg mt-0.5">{feature.icon}</Text>
                  <Text className={cn('text-base flex-1', feature.isOrange ? 'text-accent font-semibold' : 'text-foreground')}>
                    {feature.text}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Plan Selector */}
          <View className="px-6 py-6 gap-3">
            {Object.values(PLANS).map((plan) => (
              <Pressable
                key={plan.id}
                onPress={() => plan.id === 'annual' ? handleAnnualPlanTap() : handlePlanSelect(plan.id)}
                style={({ pressed }) => [
                  {
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                  <View
                  className={cn(
                    'p-4 rounded-xl border-2 flex-row items-center justify-between',
                    selectedPlan === plan.id
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-surface'
                  )}
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <View
                      className={cn(
                        'w-5 h-5 rounded-full border-2',
                        selectedPlan === plan.id
                          ? 'border-accent bg-accent'
                          : 'border-border'
                      )}
                    />
                    <View className="flex-1">
                      <Text className="text-foreground font-semibold">
                        {plan.name}
                      </Text>
                      {plan.description && allowTrial !== false && (
                        <Text className="text-xs text-muted">
                          {plan.description}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-foreground font-bold">{plan.price}</Text>
                    <Text className="text-xs text-muted">{plan.period}</Text>
                  </View>
                </View>
                {plan.badge && selectedPlan === plan.id && (
                  <View className="absolute top-2 right-2 bg-primary px-3 py-1 rounded-full">
                    <Text className="text-background text-xs font-bold">
                      {plan.badge}
                    </Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>

          {/* CTA Button */}
          <View className="px-6 py-6 gap-3">
            <Pressable
              onPress={handleStartTrial}
              disabled={loading}
              style={({ pressed }) => [
                {
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View className="bg-primary py-4 rounded-xl items-center justify-center">
                {loading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text className="text-background text-lg font-bold">
                    Start Subscription
                  </Text>
                )}
              </View>
            </Pressable>

            {/* Compliance Text */}
            <Text className="text-xs text-muted text-center leading-relaxed">
              $59.99/year or $9.99/week. Auto-renews unless cancelled 24 hours before period ends.
            </Text>

            {/* Links */}
            <View className="flex-row justify-center gap-4 pt-2">
              <Pressable onPress={handleRestorePurchases}>
                <Text className="text-xs text-primary underline">
                  Restore Purchases
                </Text>
              </Pressable>
              <Text className="text-xs text-border">·</Text>
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
