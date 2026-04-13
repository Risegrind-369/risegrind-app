/**
 * AnimatedStreakFire
 *
 * Duolingo-style streak counter:
 *   - A circular progress ring that fills every 7 streak days
 *   - A realistic flickering flame emoji in the center
 *   - On `isIncreasing`: pop scale + heavy haptic + success notification
 *
 * Usage:
 *   <AnimatedStreakFire streak={state.streak} isIncreasing={justCompletedStreak} />
 */

import React, { useEffect } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import * as Haptics from "expo-haptics";

interface AnimatedStreakFireProps {
  /** Current streak count */
  streak: number;
  /** Set to true for one render cycle when a streak day is just completed */
  isIncreasing?: boolean;
  /** Size of the component in dp (default 80) */
  size?: number;
}

const RING_COLOR = "#D97706";
const RING_BG = "rgba(217,119,6,0.15)";

// Wrap Circle so we can animate strokeDashoffset
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function AnimatedStreakFire({
  streak,
  isIncreasing = false,
  size = 80,
}: AnimatedStreakFireProps) {
  const strokeWidth = 5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;

  // Progress: each 7 streaks = one full ring cycle
  const progress = Math.min((streak % 7) / 7, 1);

  // --- Shared values ---
  const containerScale = useSharedValue(1);
  const flameScale = useSharedValue(1);
  const flameRotation = useSharedValue(0);
  const dashOffset = useSharedValue(circumference * (1 - progress));

  // Animate ring fill whenever streak changes
  useEffect(() => {
    dashOffset.value = withTiming(circumference * (1 - progress), {
      duration: 900,
      easing: Easing.out(Easing.quad),
    });
  }, [streak]);

  // Continuous subtle flame flicker (runs forever)
  useEffect(() => {
    flameScale.value = withRepeat(
      withSequence(
        withTiming(1.08, { duration: 300, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.94, { duration: 250, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.05, { duration: 200, easing: Easing.inOut(Easing.sin) }),
        withTiming(1.0, { duration: 280, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
    flameRotation.value = withRepeat(
      withSequence(
        withTiming(-6, { duration: 350 }),
        withTiming(6, { duration: 350 }),
        withTiming(-4, { duration: 300 }),
        withTiming(4, { duration: 300 }),
        withTiming(0, { duration: 250 }),
      ),
      -1,
      false,
    );
    return () => {
      cancelAnimation(flameScale);
      cancelAnimation(flameRotation);
    };
  }, []);

  // Pop animation + haptics when streak day is completed
  useEffect(() => {
    if (!isIncreasing) return;

    // Haptics (native only)
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      setTimeout(() => {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }, 300);
    }

    // Pop: scale up → slight undershoot → settle
    containerScale.value = withSequence(
      withTiming(1.35, { duration: 220, easing: Easing.out(Easing.back(2)) }),
      withTiming(0.92, { duration: 140 }),
      withTiming(1.0, { duration: 200, easing: Easing.out(Easing.quad) }),
    );
  }, [isIncreasing]);

  // Animated props for the SVG progress circle
  const animatedCircleProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
  }));

  const flameStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: flameScale.value },
      { rotate: `${flameRotation.value}deg` },
    ],
  }));

  const flameFontSize = size * 0.38;
  const countFontSize = size * 0.22;
  const cx = size / 2;
  const cy = size / 2;

  return (
    <Animated.View
      style={[{ width: size, height: size, alignItems: "center", justifyContent: "center" }, containerStyle]}
    >
      {/* SVG ring */}
      <Svg
        width={size}
        height={size}
        style={StyleSheet.absoluteFill}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background track */}
        <Circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={RING_BG}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Animated progress arc — starts from top (rotation -90) */}
        <AnimatedCircle
          cx={cx}
          cy={cy}
          r={radius}
          stroke={RING_COLOR}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedCircleProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${cx}, ${cy}`}
        />
      </Svg>

      {/* Flame + count */}
      <View style={styles.inner}>
        <Animated.Text style={[{ fontSize: flameFontSize }, flameStyle]}>
          🔥
        </Animated.Text>
        <Text
          style={[
            styles.count,
            { fontSize: countFontSize, color: RING_COLOR },
          ]}
        >
          {streak}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  inner: {
    alignItems: "center",
    justifyContent: "center",
  },
  count: {
    fontWeight: "900",
    letterSpacing: -0.5,
    marginTop: -4,
  },
});
