import { useState } from "react";
import { View, Linking, Pressable, Text } from "react-native";
import PaywallModal from "@/app/onboarding/paywall-modal";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useTranslation } from "react-i18next";

/**
 * Manage Subscription Screen
 * 
 * Displays the paywall modal as a full screen for users to manage their subscription.
 * - No trial copy (allowTrial={false})
 * - Shows back button to return to settings (showBackButton={true})
 */
export default function ManageSubscriptionScreen() {
  const colors = useColors();
  const [isVisible, setIsVisible] = useState(true);

  return (
    <ScreenContainer>
      <View className="flex-1">
        <PaywallModal
          visible={isVisible}
          onClose={() => setIsVisible(false)}
          source="onboarding"
          allowTrial={false}
          showBackButton={true}
        />
        
        {/* Deep-link to iOS Settings for subscription management */}
        <View className="absolute bottom-0 left-0 right-0 p-4">
          <Pressable
            onPress={() => Linking.openURL("https://apps.apple.com/account/subscriptions")}
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
