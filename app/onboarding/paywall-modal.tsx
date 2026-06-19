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

interface PaywallModalProps {
  visible: boolean;
  onClose: () => void;
  source: 'onboarding' | 'mentor_limit';
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

function PaywallModal({ visible, onClose, source, allowTrial = true, showBackButton = false }: PaywallModalProps) {
  const router = useRouter();
  const { dispatch } = useApp();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);
  
  // Dev-only paywall bypass (3-tap gesture on Annual plan)
  const annualTapCountRef = useRef(0);
  const annualTapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isDevEnabled = process.env.EXPO_PUBLIC_DEBUG_BYPASS === 'true';

  // Fetch available packages from RevenueCat
  useEffect(() => {
    if (!visible) return;

    const fetchPackages = async () => {
      try {
        const offerings = await Purchases.getOfferings();
        if (offerings?.current?.availablePackages) {
          setPackages(offerings.current.availablePackages);
        }
      } catch (error) {
        console.error('[Paywall] Failed to fetch packages:', error);
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
          onClose();
          router.replace('/(tabs)');
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
    if (loading) return;

    setLoading(true);
    try {
      const plan = PLANS[selectedPlan];
      const selectedPackage = packages.find((pkg) => {
        // Match both old and new product ID formats
        const pkgId = pkg.product.identifier;
        return pkgId === plan.productId || 
               pkgId === plan.productId.replace('com.', '') ||
               pkgId === 'com.' + plan.productId;
      });

      if (!selectedPackage) {
        Alert.alert('Payment coming soon', 'Payment coming soon. Stay tuned 🔒');
        setLoading(false);
        return;
      }

      const purchaseResult = await Purchases.purchasePackage(selectedPackage);

      if (purchaseResult?.customerInfo?.entitlements?.active?.['pro'] || purchaseResult?.customerInfo?.entitlements?.active?.['premium']) {
        // Purchase successful
        dispatch({ type: 'SET_PREMIUM', payload: true });
        onClose();
        router.replace('/(tabs)');
      }
    } catch (error: any) {
      if (error.userCancelled) {
        // User cancelled purchase, do nothing
        return;
      }
      console.error('[Paywall] Purchase error:', error);
      Alert.alert('Payment coming soon', 'Payment coming soon. Stay tuned 🔒');
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
        onClose();
        router.replace('/(tabs)');
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
          {/* Back Button - only shown when showBackButton is true */}
          {showBackButton && (
            <Pressable
              onPress={handleClose}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1, paddingTop: insets.top + 12 }]}
              className="px-6 py-3"
            >
              <Text className="text-accent font-semibold">← Back</Text>
            </Pressable>
          )}

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
        </ScrollView>
      </ScreenContainer>
    </Modal>
  );
}

export default PaywallModal;
