import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRevenueCat } from "@/lib/revenuecat-provider";
import { useApp } from "@/lib/app-context";
import * as Haptics from "expo-haptics";

type PlanType = "monthly" | "yearly";

const FEATURES = [
  { icon: "🔥", text: "Unlimited habit tracking & streaks" },
  { icon: "🧠", text: "AI-powered mood analysis & insights" },
  { icon: "📖", text: "Unlimited journal entries with AI prompts" },
  { icon: "🏆", text: "Full gamification — XP, ranks & achievements" },
  { icon: "📊", text: "Weekly AI review & routine suggestions" },
  { icon: "🔔", text: "Smart morning reminders" },
];

export default function PaywallScreen() {
  const colors = useColors();
  const router = useRouter();
  const { offerings, purchasePackage, restorePurchases } = useRevenueCat();
  const { dispatch } = useApp();
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("yearly");
  const [isLoading, setIsLoading] = useState(false);

  const handlePurchase = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsLoading(true);
    try {
      // Try to get the actual package from RevenueCat offerings
      let pkg: unknown = null;
      if (offerings && typeof offerings === "object") {
        const off = offerings as { current?: { availablePackages?: unknown[] } };
        const packages = off.current?.availablePackages ?? [];
        pkg = packages.find((p: unknown) => {
          const pack = p as { packageType?: string };
          return selectedPlan === "yearly"
            ? pack.packageType === "ANNUAL"
            : pack.packageType === "MONTHLY";
        }) ?? packages[0] ?? null;
      }

      if (pkg) {
        const success = await purchasePackage(pkg);
        if (success) {
          dispatch({ type: "SET_PREMIUM", payload: true });
          router.push("/onboarding/setup" as never);
          return;
        }
      } else {
        // No RevenueCat configured yet — proceed as premium for demo/web
        dispatch({ type: "SET_PREMIUM", payload: true });
        router.push("/onboarding/setup" as never);
        return;
      }
    } catch (e: unknown) {
      const err = e as { userCancelled?: boolean; message?: string };
      if (!err?.userCancelled) {
        Alert.alert("Purchase Failed", err?.message ?? "Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestore = async () => {
    setIsLoading(true);
    try {
      await restorePurchases();
      Alert.alert("Restored", "Your purchases have been restored.");
    } catch {
      Alert.alert("Error", "Could not restore purchases.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.badge}>✨ FULL ACCESS</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>
            Start Your{"\n"}Morning Journey
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Try everything free for 3 days.{"\n"}No restrictions, cancel anytime.
          </Text>
        </View>

        {/* Features */}
        <View style={[styles.featuresCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {FEATURES.map((f, i) => (
            <View key={i} style={styles.featureRow}>
              <Text style={styles.featureIcon}>{f.icon}</Text>
              <Text style={[styles.featureText, { color: colors.foreground }]}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Plan Selector */}
        <View style={styles.plans}>
          <Pressable
            onPress={() => {
              setSelectedPlan("yearly");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => [
              styles.planCard,
              {
                backgroundColor: selectedPlan === "yearly" ? colors.primary + "15" : colors.surface,
                borderColor: selectedPlan === "yearly" ? colors.primary : colors.border,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <View style={styles.planBadgeRow}>
              <View style={[styles.planBadge, { backgroundColor: colors.warning }]}>
                <Text style={styles.planBadgeText}>BEST VALUE</Text>
              </View>
              {selectedPlan === "yearly" && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <Text style={[styles.planName, { color: colors.foreground }]}>Yearly</Text>
            <Text style={[styles.planPrice, { color: colors.primary }]}>$39.99/year</Text>
            <Text style={[styles.planNote, { color: colors.muted }]}>Just $3.33/month · Save 33%</Text>
          </Pressable>

          <Pressable
            onPress={() => {
              setSelectedPlan("monthly");
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={({ pressed }) => [
              styles.planCard,
              {
                backgroundColor: selectedPlan === "monthly" ? colors.primary + "15" : colors.surface,
                borderColor: selectedPlan === "monthly" ? colors.primary : colors.border,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <View style={styles.planBadgeRow}>
              {selectedPlan === "monthly" && (
                <Text style={styles.checkmark}>✓</Text>
              )}
            </View>
            <Text style={[styles.planName, { color: colors.foreground }]}>Monthly</Text>
            <Text style={[styles.planPrice, { color: colors.primary }]}>$4.99/month</Text>
            <Text style={[styles.planNote, { color: colors.muted }]}>Flexible, cancel anytime</Text>
          </Pressable>
        </View>

        {/* CTA */}
        <View style={styles.ctaSection}>
          <Pressable
            onPress={handlePurchase}
            disabled={isLoading}
            style={({ pressed }) => [
              styles.ctaButton,
              {
                backgroundColor: colors.primary,
                transform: [{ scale: pressed ? 0.97 : 1 }],
                opacity: isLoading ? 0.7 : 1,
              },
            ]}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.ctaText}>Try 3 Days Free</Text>
                <Text style={styles.ctaSubText}>
                  Then {selectedPlan === "yearly" ? "$39.99/year" : "$4.99/month"} · Cancel anytime
                </Text>
              </>
            )}
          </Pressable>

          <Text style={[styles.legalText, { color: colors.muted }]}>
            Payment will be charged to your Apple ID account at the confirmation of purchase.
            Subscription automatically renews unless it is cancelled at least 24 hours before the end of the current period.
            You can manage your subscriptions in Settings.
          </Text>

          <Pressable onPress={handleRestore} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
            <Text style={[styles.restoreText, { color: colors.primary }]}>Restore Purchases</Text>
          </Pressable>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 48,
    gap: 24,
  },
  header: {
    alignItems: "center",
    gap: 12,
  },
  badge: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1.5,
    color: "#F97316",
    backgroundColor: "#F9731620",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: "hidden",
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 44,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  featuresCard: {
    borderRadius: 20,
    padding: 20,
    gap: 14,
    borderWidth: 1,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  featureIcon: {
    fontSize: 20,
    width: 28,
  },
  featureText: {
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
    lineHeight: 22,
  },
  plans: {
    flexDirection: "row",
    gap: 12,
  },
  planCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    gap: 4,
  },
  planBadgeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 22,
    marginBottom: 4,
  },
  planBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  planBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  },
  checkmark: {
    fontSize: 16,
    color: "#3B82F6",
    fontWeight: "700",
  },
  planName: {
    fontSize: 16,
    fontWeight: "700",
  },
  planPrice: {
    fontSize: 18,
    fontWeight: "800",
  },
  planNote: {
    fontSize: 12,
    lineHeight: 18,
  },
  ctaSection: {
    gap: 16,
    alignItems: "center",
  },
  ctaButton: {
    width: "100%",
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  ctaText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
  ctaSubText: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "500",
  },
  legalText: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 16,
  },
  restoreText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
