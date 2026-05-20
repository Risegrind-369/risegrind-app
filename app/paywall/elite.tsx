import { TouchableOpacity } from "react-native";
import { ScrollView, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { useRevenueCat } from '@/lib/revenuecat-provider';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';

export default function ElitePaywall() {
  const router = useRouter();
  const colors = useColors();
  const { purchasePackage, offerings, isLoading, error, isPremium } = useRevenueCat();
  const [purchasing, setPurchasing] = useState(false);

  // Redirect if already premium
  useEffect(() => {
    if (isPremium) {
      router.replace('/(tabs)');
    }
  }, [isPremium]);

  const handlePurchase = async (packageId: string) => {
    try {
      setPurchasing(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      // Find package in offerings
      let selectedPackage = null;
      if (offerings) {
        for (const offering of Object.values(offerings.all)) {
          const off = offering as any;
          const pkg = off.packages.find((p: any) => p.identifier === packageId);
          if (pkg) {
            selectedPackage = pkg;
            break;
          }
        }
      }

      if (!selectedPackage) {
        throw new Error(`Package ${packageId} not found`);
      }

      const success = await purchasePackage(selectedPackage);
      if (success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        router.replace('/(tabs)');
      }
    } catch (err) {
      console.error('Purchase error:', err);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setPurchasing(false);
    }
  };

  if (isLoading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 gap-6">
          {/* Header */}
          <View className="items-center gap-2 mt-4">
            <View className="bg-primary rounded-full px-3 py-1 mb-2">
              <Text className="text-xs font-bold text-background">PREMIUM TIER</Text>
            </View>
            <Text className="text-4xl font-bold text-foreground">Unlock Elite</Text>
            <Text className="text-base text-muted text-center">
              Everything in Pro + social features + AI insights
            </Text>
          </View>

          {/* Features List */}
          <View className="gap-3 bg-surface rounded-2xl p-4">
            {/* Pro Features */}
            <Text className="text-xs font-semibold text-muted uppercase tracking-wider mt-2">
              Everything in Pro
            </Text>
            <FeatureRow icon="✓" title="Unlimited Habits" subtitle="Track as many habits as you want" />
            <FeatureRow icon="✓" title="Wearable Sync" subtitle="Connect Apple Health, Oura Ring, Whoop" />
            <FeatureRow icon="✓" title="Basic Analytics" subtitle="Consistency scores and trends" />

            {/* Elite-Only Features */}
            <Text className="text-xs font-semibold text-primary uppercase tracking-wider mt-4">
              Elite Exclusive
            </Text>
            <FeatureRow icon="👥" title="Unlimited Partners" subtitle="Connect with multiple accountability partners" />
            <FeatureRow icon="🏆" title="Mentor Groups" subtitle="Join or create mentor communities" />
            <FeatureRow icon="📊" title="Advanced Analytics" subtitle="HRV, sleep correlation, energy scores" />
            <FeatureRow icon="🤖" title="AI Health Insights" subtitle="Personalized recommendations & predictions" />
            <FeatureRow icon="⭐" title="All Mentor Styles" subtitle="Unlock all 9 AI mentor personalities" />
            <FeatureRow icon="🎯" title="Leaderboards" subtitle="Compete with friends and community" />
            <FeatureRow icon="⚡" title="Priority Support" subtitle="Get help faster from our team" />
          </View>

          {/* Pricing Options */}
          <View className="gap-3">
            {/* Monthly Option */}
            <TouchableOpacity
              onPress={() => handlePurchase('elite_monthly')}
              disabled={purchasing}
              activeOpacity={0.6}
            >
              <View className="bg-primary rounded-2xl p-4 gap-2">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-lg font-semibold text-background">Monthly</Text>
                    <Text className="text-sm text-background opacity-80">$19.99/month</Text>
                  </View>
                  {purchasing ? (
                    <ActivityIndicator color={colors.background} />
                  ) : (
                    <Text className="text-base font-semibold text-background">→</Text>
                  )}
                </View>
                <Text className="text-xs text-background opacity-70">
                  7-day free trial, then $19.99/month. Cancel anytime.
                </Text>
              </View>
            </TouchableOpacity>

            {/* Annual Option (Best Value) */}
            <TouchableOpacity
              onPress={() => handlePurchase('elite_annual')}
              disabled={purchasing}
              activeOpacity={0.6}
            >
              <View className="bg-surface rounded-2xl p-4 gap-2 border-2 border-primary">
                <View className="absolute top-2 right-4 bg-primary rounded-full px-2 py-1">
                  <Text className="text-xs font-semibold text-background">Best Value</Text>
                </View>
                <View className="flex-row justify-between items-center mt-2">
                  <View>
                    <Text className="text-lg font-semibold text-foreground">Annual</Text>
                    <Text className="text-sm text-muted">$159.99/year</Text>
                  </View>
                  {purchasing ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text className="text-base font-semibold text-primary">→</Text>
                  )}
                </View>
                <Text className="text-xs text-muted">
                  7-day free trial, then $159.99/year. Save 33% vs monthly.
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-error/10 rounded-lg p-3">
              <Text className="text-sm text-error">{error}</Text>
            </View>
          )}

          {/* Continue Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.6}
          >
            <Text className="text-center text-base text-primary font-semibold">
              Continue with Pro
            </Text>
          </TouchableOpacity>

          {/* Footer */}
          <View className="gap-1 mt-4">
            <Text className="text-xs text-muted text-center">
              Subscriptions auto-renew. Manage or cancel anytime in Settings.
            </Text>
            <Text className="text-xs text-muted text-center">
              By subscribing, you agree to our Terms of Service and Privacy Policy.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function FeatureRow({ icon, title, subtitle }: { icon: string; title: string; subtitle: string }) {
  const colors = useColors();
  return (
    <View className="flex-row gap-3 items-start">
      <Text className="text-lg mt-0.5">{icon}</Text>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">{title}</Text>
        <Text className="text-xs text-muted mt-0.5">{subtitle}</Text>
      </View>
    </View>
  );
}
