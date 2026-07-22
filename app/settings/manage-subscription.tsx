import { useState } from "react";
import { View, Linking, Pressable, Text, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import PaywallModal from "@/app/onboarding/paywall-modal";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useTranslation } from "react-i18next";
import Animated, { FadeIn } from "react-native-reanimated";

/**
 * Manage Subscription Screen
 * 
 * Displays the paywall modal as a full screen for users to manage their subscription.
 * - No trial copy (allowTrial={false})
 * - Shows back button to return to settings (showBackButton={true})
 * - Handles purchase/restore success with appropriate confirmation screens
 */
export default function ManageSubscriptionScreen() {
  const router = useRouter();
  const colors = useColors();
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(true);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false);
  const [successType, setSuccessType] = useState<'purchase' | 'restore' | null>(null);

  const handlePaywallSuccess = (type: 'purchase' | 'restore') => {
    setSuccessType(type);
    setShowSuccessScreen(true);
  };

  const handleSuccessScreenDismiss = () => {
    setShowSuccessScreen(false);
    setSuccessType(null);
    // Navigate back to Settings after successful purchase/restore
    router.back();
  };

  const handlePaywallClose = () => {
    // Normal close (user tapped back) — just close the modal
    setIsVisible(false);
  };

  // Show success screen if purchase/restore succeeded
  if (showSuccessScreen && successType) {
    return (
      <ScreenContainer containerClassName="bg-background">
        <View style={styles.container}>
          {successType === 'purchase' ? (
            <Animated.View entering={FadeIn.duration(400)} style={styles.successContent}>
              {/* Checkmark Icon */}
              <Text style={styles.checkmark}>✓</Text>
              
              {/* Heading */}
              <Text style={[styles.heading, { color: colors.foreground }]}>
                Welcome to Premium
              </Text>
              
              {/* Description */}
              <Text style={[styles.description, { color: colors.muted }]}>
                You now have full access to Ghost Mentor, Ghost Journal, and more.
              </Text>
              
              {/* Continue Button */}
              <Pressable
                onPress={handleSuccessScreenDismiss}
                style={({ pressed }) => [
                  styles.button,
                  {
                    backgroundColor: colors.accent,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={[styles.buttonText, { color: colors.background }]}>
                  Continue
                </Text>
              </Pressable>
            </Animated.View>
          ) : (
            // Restore success — show confirmation and wait for user dismissal
            <View style={styles.container}>
              <Text style={[styles.heading, { color: colors.foreground }]}>
                Purchases Restored
              </Text>
              <Text style={[styles.description, { color: colors.muted }]}>
                Your subscription has been restored successfully.
              </Text>
              <Pressable
                onPress={handleSuccessScreenDismiss}
                style={({ pressed }) => [
                  styles.button,
                  {
                    backgroundColor: colors.accent,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={[styles.buttonText, { color: colors.background }]}>
                  OK
                </Text>
              </Pressable>
            </View>
          )}
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View className="flex-1">
        <PaywallModal
          visible={isVisible}
          onClose={handlePaywallClose}
          onSuccess={handlePaywallSuccess}
          source="onboarding"
          allowTrial={false}
          showBackButton={true}
        />
        
        {/* Deep-link to iOS Settings for subscription management */}
        <View className="absolute bottom-0 left-0 right-0 p-4">
          <Pressable
            onPress={() => Linking.openURL("https://apps.apple.com/account/subscriptions" )}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            className="p-3 rounded-lg border border-border bg-surface"
          >
            <Text className="text-center font-semibold text-accent" style={{ color: colors.accent }}>
              Manage in Settings
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    gap: 24,
  },
  successContent: {
    alignItems: 'center',
    gap: 16,
  },
  checkmark: {
    fontSize: 64,
    fontWeight: '800',
    color: '#22C55E',
    marginBottom: 8,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
