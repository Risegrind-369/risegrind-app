/**
 * RankUnlockAnimation
 *
 * Full-screen overlay that plays when the user unlocks a new rank.
 * Animation sequence:
 *   1. Backdrop fades in
 *   2. Badge scales from 0 → 1.15 (pop overshoot) → 1.0
 *   3. Glow ring pulses (opacity 0 → 0.8 → 0)
 *   4. Badge rotates ±15° then settles
 *   5. Text fades in from below
 *   6. Auto-dismisses after 3 s
 *
 * Haptics: Heavy impact on pop, Success notification on settle.
 */

import React, { useEffect, useRef } from "react";
import { Modal, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";

interface RankUnlockAnimationProps {
  visible: boolean;
  rankName: string;
  rankEmoji: string;
  onDismiss: () => void;
}

export function RankUnlockAnimation({
  visible,
  rankName,
  rankEmoji,
  onDismiss,
}: RankUnlockAnimationProps) {
  const { t } = useTranslation();

  // Shared values
  const backdropOpacity = useSharedValue(0);
  const badgeScale = useSharedValue(0);
  const badgeRotation = useSharedValue(0);
  const glowOpacity = useSharedValue(0);
  const glowScale = useSharedValue(0.8);
  const textTranslateY = useSharedValue(30);
  const textOpacity = useSharedValue(0);

  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!visible) return;

    // Trigger haptics
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setTimeout(() => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }, 400);

    // Backdrop
    backdropOpacity.value = withTiming(1, { duration: 250 });

    // Badge pop: 0 → 1.15 → 1.0
    badgeScale.value = withSequence(
      withTiming(1.15, { duration: 350, easing: Easing.out(Easing.back(2)) }),
      withTiming(1.0, { duration: 200, easing: Easing.inOut(Easing.quad) }),
    );

    // Badge rotation: 0 → -15 → 15 → 0
    badgeRotation.value = withDelay(
      100,
      withSequence(
        withTiming(-15, { duration: 120 }),
        withTiming(15, { duration: 120 }),
        withTiming(-8, { duration: 100 }),
        withTiming(8, { duration: 100 }),
        withTiming(0, { duration: 120 }),
      ),
    );

    // Glow ring pulse
    glowOpacity.value = withSequence(
      withTiming(0.7, { duration: 300 }),
      withTiming(0.4, { duration: 400 }),
      withTiming(0.7, { duration: 400 }),
      withTiming(0, { duration: 600 }),
    );
    glowScale.value = withSequence(
      withTiming(1.3, { duration: 700, easing: Easing.out(Easing.quad) }),
      withTiming(1.6, { duration: 600 }),
    );

    // Text slide up
    textTranslateY.value = withDelay(
      350,
      withTiming(0, { duration: 350, easing: Easing.out(Easing.quad) }),
    );
    textOpacity.value = withDelay(350, withTiming(1, { duration: 350 }));

    // Auto-dismiss after 3 s
    dismissTimer.current = setTimeout(() => {
      backdropOpacity.value = withTiming(0, { duration: 300 });
      badgeScale.value = withTiming(0.8, { duration: 300 });
      textOpacity.value = withTiming(0, { duration: 200 });
      setTimeout(onDismiss, 320);
    }, 3000);

    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: badgeScale.value },
      { rotate: `${badgeRotation.value}deg` },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
    transform: [{ scale: glowScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  if (!visible) return null;

  return (
    <Modal transparent animationType="none" visible={visible}>
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        {/* Glow ring */}
        <Animated.View style={[styles.glowRing, glowStyle]} />

        {/* Badge */}
        <Animated.View style={[styles.badge, badgeStyle]}>
          <Text style={styles.badgeEmoji}>{rankEmoji}</Text>
        </Animated.View>

        {/* Text */}
        <Animated.View style={[styles.textContainer, textStyle]}>
          <Text style={styles.unlockLabel}>
            {t("rankUnlock.label", { defaultValue: "RANK UNLOCKED" })}
          </Text>
          <Text style={styles.rankName}>{rankName}</Text>
          <Text style={styles.subtitle}>
            {t("rankUnlock.subtitle", {
              defaultValue: "Ghost Mode level up. Keep building in silence.",
            })}
          </Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.85)",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
  },
  glowRing: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#D97706",
    // Glow via shadow
    shadowColor: "#D97706",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 40,
    elevation: 20,
  },
  badge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1a1a1a",
    borderWidth: 3,
    borderColor: "#D97706",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#D97706",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 16,
  },
  badgeEmoji: {
    fontSize: 56,
  },
  textContainer: {
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 32,
  },
  unlockLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#D97706",
    letterSpacing: 3,
  },
  rankName: {
    fontSize: 32,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 20,
  },
});
