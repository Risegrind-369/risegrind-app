import { ScrollView, Text, View, Pressable, ActivityIndicator } from 'react-native';
import { useRevenueCat } from '@/lib/revenuecat-provider';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';

export default function ProPaywall() {
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
            <Text className="text-4xl font-bold text-foreground">Unlock Pro</Text>
            <Text className="text-base text-muted text-center">
              Unlimited habits, wearable sync, accountability partners
            </Text>
          </View>

          {/* Features List */}
          <View className="gap-3 bg-surface rounded-2xl p-4">
            <FeatureRow icon="✓" title="Unlimited Habits" subtitle="Track as many habits as you want" />
            <FeatureRow icon="✓" title="Wearable Sync" subtitle="Connect Apple Health, Oura Ring, Whoop" />
            <FeatureRow icon="✓" title="1 Accountability Partner" subtitle="Find and connect with a partner" />
            <FeatureRow icon="✓" title="Basic Analytics" subtitle="Consistency scores and trends" />
            <FeatureRow icon="✓" title="Mentor Styles" subtitle="Unlock 3 personalized mentor styles" />
            <FeatureRow icon="✓" title="7-Day Free Trial" subtitle="Try everything risk-free" />
          </View>

          {/* Pricing Options */}
          <View className="gap-3">
            {/* Monthly Option */}
            <Pressable
              onPress={() => handlePurchase('pro_monthly')}
              disabled={purchasing}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View className="bg-primary rounded-2xl p-4 gap-2">
                <View className="flex-row justify-between items-center">
                  <View>
                    <Text className="text-lg font-semibold text-background">Monthly</Text>
                    <Text className="text-sm text-background opacity-80">$9.99/month</Text>
                  </View>
                  {purchasing ? (
                    <ActivityIndicator color={colors.background} />
                  ) : (
                    <Text className="text-base font-semibold text-background">→</Text>
                  )}
                </View>
                <Text className="text-xs text-background opacity-70">
                  7-day free trial, then $9.99/month. Cancel anytime.
                </Text>
              </View>
            </Pressable>

            {/* Annual Option (Best Value) */}
            <Pressable
              onPress={() => handlePurchase('pro_annual')}
              disabled={purchasing}
              style={({ pressed }) => [
                {
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View className="bg-surface rounded-2xl p-4 gap-2 border-2 border-primary">
                <View className="absolute top-2 right-4 bg-primary rounded-full px-2 py-1">
                  <Text className="text-xs font-semibold text-background">Best Value</Text>
                </View>
                <View className="flex-row justify-between items-center mt-2">
                  <View>
                    <Text className="text-lg font-semibold text-foreground">Annual</Text>
                    <Text className="text-sm text-muted">$79.99/year</Text>
                  </View>
                  {purchasing ? (
                    <ActivityIndicator color={colors.primary} />
                  ) : (
                    <Text className="text-base font-semibold text-primary">→</Text>
                  )}
                </View>
                <Text className="text-xs text-muted">
                  7-day free trial, then $79.99/year. Save 33% vs monthly.
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Error Message */}
          {error && (
            <View className="bg-error/10 rounded-lg p-3">
              <Text className="text-sm text-error">{error}</Text>
            </View>
          )}

          {/* Continue Button */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text className="text-center text-base text-primary font-semibold">
              Continue with Free
            </Text>
          </Pressable>

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
      <View className="w-6 h-6 rounded-full bg-primary items-center justify-center mt-0.5">
        <Text className="text-sm font-bold text-background">{icon}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">{title}</Text>
        <Text className="text-xs text-muted mt-0.5">{subtitle}</Text>
      </View>
    </View>
  );
}
