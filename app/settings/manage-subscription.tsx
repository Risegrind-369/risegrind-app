import { useState } from "react";
import { View } from "react-native";
import PaywallModal from "@/app/onboarding/paywall-modal";
import { ScreenContainer } from "@/components/screen-container";

/**
 * Manage Subscription Screen
 * 
 * Displays the paywall modal as a full screen for users to manage their subscription.
 * - No trial copy (allowTrial={false})
 * - Shows back button to return to settings (showBackButton={true})
 */
export default function ManageSubscriptionScreen() {
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
      </View>
    </ScreenContainer>
  );
}
