import React, { useState, useEffect } from 'react';
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
    productId: 'risegrind.weekly',
  },
  annual: {
    id: 'annual',
    name: 'Annual',
    price: '$59.99',
    period: '/year',
    badge: 'BEST VALUE',
    description: 'Just $1.15/week',
    productId: 'risegrind.annual',
  },
  lifetime: {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$129.99',
    period: 'one-time',
    productId: 'risegrind.lifetime',
  },
};

export function PaywallModal({ visible, onClose, source }: PaywallModalProps) {
  const router = useRouter();
  const { dispatch } = useApp();
  const colors = useColors();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>('annual');
  const [loading, setLoading] = useState(false);
  const [packages, setPackages] = useState<PurchasesPackage[]>([]);

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

  const handlePlanSelect = (plan: PlanType) => {
    setSelectedPlan(plan);
  };

  const handleStartTrial = async () => {
    if (loading) return;

    setLoading(true);
    try {
      const plan = PLANS[selectedPlan];
      const selectedPackage = packages.find((pkg) =>
        pkg.product.identifier === plan.productId
      );

      if (!selectedPackage) {
        Alert.alert('Payment coming soon', 'Payment coming soon. Stay tuned 🔒');
        setLoading(false);
        return;
      }

      const purchaseResult = await Purchases.purchasePackage(selectedPackage);

      if (purchaseResult?.customerInfo?.entitlements?.active?.['pro']) {
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
        className="bg-black"
        containerClassName="bg-black"
        edges={['top', 'left', 'right', 'bottom']}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {/* No Close Button - users must select a plan */}

          {/* Title */}
          <View className="px-6 py-4">
            <Text className="text-4xl font-bold text-white text-center">
              Unlock Your Full Potential
            </Text>
          </View>

          {/* Removed timeline - direct paywall, no trial */}

          {/* Feature Checklist - 8 features */}
          <View className="px-6 py-6 bg-gray-900 rounded-2xl mx-6 mb-8">
            <Text className="text-white font-bold text-lg mb-4">WHAT YOU GET:</Text>
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
                  <Text className={cn('text-base flex-1', feature.isOrange ? 'text-orange-500 font-semibold' : 'text-white')}>
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
                onPress={() => handlePlanSelect(plan.id)}
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
                      ? 'border-purple-500 bg-purple-500/10'
                      : 'border-gray-700 bg-gray-900'
                  )}
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <View
                      className={cn(
                        'w-5 h-5 rounded-full border-2',
                        selectedPlan === plan.id
                          ? 'border-purple-500 bg-purple-500'
                          : 'border-gray-600'
                      )}
                    />
                    <View className="flex-1">
                      <Text className="text-white font-semibold">
                        {plan.name}
                      </Text>
                      {plan.description && (
                        <Text className="text-xs text-gray-400">
                          {plan.description}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View className="items-end">
                    <Text className="text-white font-bold">{plan.price}</Text>
                    <Text className="text-xs text-gray-400">{plan.period}</Text>
                  </View>
                </View>
                {plan.badge && selectedPlan === plan.id && (
                  <View className="absolute top-2 right-2 bg-purple-500 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold">
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
              <View className="bg-purple-500 py-4 rounded-xl items-center justify-center">
                {loading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white text-lg font-bold">
                    Start Subscription
                  </Text>
                )}
              </View>
            </Pressable>

            {/* Compliance Text */}
            <Text className="text-xs text-gray-500 text-center leading-relaxed">
              $59.99/year or $9.99/week. Auto-renews unless cancelled 24 hours before period ends.
            </Text>

            {/* Links */}
            <View className="flex-row justify-center gap-4 pt-2">
              <Pressable onPress={handleRestorePurchases}>
                <Text className="text-xs text-purple-400 underline">
                  Restore Purchases
                </Text>
              </Pressable>
              <Text className="text-xs text-gray-600">·</Text>
              <Pressable
                onPress={() => {
                  // Navigate to terms
                  console.log('Navigate to terms');
                }}
              >
                <Text className="text-xs text-purple-400 underline">Terms</Text>
              </Pressable>
              <Text className="text-xs text-gray-600">·</Text>
              <Pressable
                onPress={() => {
                  // Navigate to privacy
                  console.log('Navigate to privacy');
                }}
              >
                <Text className="text-xs text-purple-400 underline">Privacy</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </ScreenContainer>
    </Modal>
  );
}
