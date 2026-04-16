/**
 * Chain Reaction Animation
 * Fire animation that lights up next habit when current one is completed
 */
import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";

interface ChainReactionAnimationProps {
  visible: boolean;
  habitIndex: number;
  totalHabits: number;
  onComplete?: () => void;
}

export function ChainReactionAnimation({
  visible,
  habitIndex,
  totalHabits,
  onComplete,
}: ChainReactionAnimationProps) {
  const colors = useColors();
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      scale.value = withSequence(
        withSpring(1.2, { damping: 6, mass: 0.8 }),
        withTiming(0.8, { duration: 300 })
      );

      opacity.value = withSequence(
        withTiming(1, { duration: 100 }),
        withTiming(0.6, { duration: 200 }),
        withTiming(0, { duration: 300 })
      );

      rotation.value = withTiming(360, { duration: 600 });

      setTimeout(() => {
        onComplete?.();
      }, 600);
    }
  }, [visible, scale, opacity, rotation, onComplete]);

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={[
        styles.container,
        {
          opacity,
          transform: [{ scale }],
        },
      ]}
    >
      {/* Fire Particles */}
      <View
        style={[
          styles.particle,
          {
            backgroundColor: colors.primary,
            opacity: 0.8,
            transform: [{ translateY: -20 }],
          },
        ]}
      />
      <View
        style={[
          styles.particle,
          {
            backgroundColor: colors.warning,
            opacity: 0.6,
            transform: [{ translateY: -40 }],
          },
        ]}
      />
      <View
        style={[
          styles.particle,
          {
            backgroundColor: colors.error,
            opacity: 0.4,
            transform: [{ translateY: -60 }],
          },
        ]}
      />

      {/* Center Glow */}
      <View
        style={[
          styles.glow,
          {
            backgroundColor: colors.primary,
            shadowColor: colors.primary,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  particle: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    shadowOpacity: 0.8,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  glow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    shadowOpacity: 0.9,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
});
