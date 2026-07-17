/**
 * Onboarding: AI Data Consent
 *
 * Apple Guideline 5.1.1(i)/5.1.2(i) compliance screen.
 * Discloses that user data (chat messages, habit progress, onboarding answers)
 * is sent to Anthropic's Claude API for personalization.
 *
 * This is a blocking step — no skip option. Appears once after language selection,
 * before name/age collection (which triggers data-sending API calls).
 *
 * One-time gate: AsyncStorage flag "@aiDataConsentAccepted" prevents re-showing.
 */
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";

const CONSENT_FLAG = "@aiDataConsentAccepted";
const PRIVACY_POLICY_URL = "https://risegrind-app.lovable.app/privacy";

export default function AiDataConsentScreen() {
  const colors = useColors();
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);

  // Check if consent was already given (resume logic)
  useEffect(() => {
    const checkConsent = async () => {
      try {
        const accepted = await AsyncStorage.getItem(CONSENT_FLAG);
        if (accepted === "true") {
          // Skip to next step
          router.replace("/onboarding/step1-name-age" as never);
        }
      } catch (err) {
        console.warn("[aiDataConsent] Failed to check consent flag:", err);
      }
    };
    checkConsent();
  }, [router]);

  const handleContinue = async () => {
    setIsAccepting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      // Persist consent flag
      await AsyncStorage.setItem(CONSENT_FLAG, "true");
      // Navigate to next step
      router.replace("/onboarding/step1-name-age" as never);
    } catch (err) {
      console.error("[aiDataConsent] Failed to save consent flag:", err);
      setIsAccepting(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handlePrivacyPolicy = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const canOpen = await Linking.canOpenURL(PRIVACY_POLICY_URL);
      if (canOpen) {
        await Linking.openURL(PRIVACY_POLICY_URL);
      } else {
        console.warn("[aiDataConsent] Cannot open privacy policy URL");
      }
    } catch (err) {
      console.error("[aiDataConsent] Failed to open privacy policy:", err);
    }
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <View style={styles.container}>
        {/* Scrollable content */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title */}
          <Animated.View entering={FadeInDown.delay(100).springify().damping(18)}>
            <Text style={[styles.title, { color: colors.foreground }]}>
              Your AI Mentor, Powered by Claude
            </Text>
          </Animated.View>

          {/* Body text */}
          <Animated.View entering={FadeInDown.delay(200).springify().damping(18)}>
            <Text style={[styles.body, { color: colors.foreground }]}>
              RiseGrind uses Claude, an AI service by Anthropic, to power your AI Mentor, personalized routines, and journal insights.
            </Text>

            <Text style={[styles.body, { color: colors.foreground, marginTop: 16 }]}>
              To do this, some of your data — including your chat messages, habit progress, and onboarding answers — is sent to Anthropic to generate your personalized experience. This data is used only to power these features and is handled according to Anthropic's privacy policy.
            </Text>

            <Text style={[styles.body, { color: colors.foreground, marginTop: 16 }]}>
              By continuing, you agree to this data sharing. You can read more in our Privacy Policy.
            </Text>
          </Animated.View>
        </ScrollView>

        {/* Footer: Privacy Policy link + Continue button */}
        <Animated.View
          entering={FadeInDown.delay(300).springify().damping(18)}
          style={[styles.footer, { borderTopColor: colors.border }]}
        >
          <Pressable
            onPress={handlePrivacyPolicy}
            disabled={isAccepting}
            style={({ pressed }) => [
              styles.privacyLink,
              pressed && { opacity: 0.7 },
              isAccepting && { opacity: 0.5 },
            ]}
          >
            <Text style={[styles.privacyLinkText, { color: colors.primary }]}>
              Privacy Policy
            </Text>
          </Pressable>

          <Pressable
            onPress={handleContinue}
            disabled={isAccepting}
            style={({ pressed }) => [
              styles.continueBtn,
              {
                backgroundColor: colors.primary,
                transform: [{ scale: pressed && !isAccepting ? 0.97 : 1 }],
                opacity: pressed && !isAccepting ? 0.9 : isAccepting ? 0.7 : 1,
              },
            ]}
          >
            {isAccepting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.continueBtnText}>Continue</Text>
            )}
          </Pressable>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    paddingBottom: 24,
    justifyContent: "space-between",
  },
  scrollContent: {
    gap: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  body: {
    fontSize: 15,
    lineHeight: 24,
    fontWeight: "400",
  },
  footer: {
    borderTopWidth: 1,
    paddingTop: 16,
    gap: 12,
  },
  privacyLink: {
    paddingVertical: 12,
    alignItems: "center",
  },
  privacyLinkText: {
    fontSize: 14,
    fontWeight: "600",
    textDecorationLine: "underline",
  },
  continueBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  continueBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
