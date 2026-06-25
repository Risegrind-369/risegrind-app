/**
 * Onboarding Step 4c: Loading/Transition Screen
 *
 * Displays animated progress bar and cycling text while initializing AI mentor.
 * Automatically navigates to step8-paywall after 6 seconds (ensures RevenueCat finishes loading).
 *
 * Features:
 * - Pulsing ghost emoji (RiseGrind branding)
 * - Elegant rotating arc spinner
 * - Animated progress bar with glow effect
 * - Cycling luxury text phrases that fade in/out
 * - Automatic navigation after completion
 * - Dark gradient background
 */
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  withRepeat,
  withSequence,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useRevenueCat } from "@/lib/revenuecat-provider";

const LOADING_PHRASES = [
  "Analyzing your goals...",
  "Crafting your AI mentor...",
  "Building your discipline path...",
  "Calculating your 30-day potential...",
  "Your Ghost Mode is almost ready...",
];

export default function Step4cLoadingScreen() {
  const colors = useColors();
  const router = useRouter();
  const { isLoading: rcLoading } = useRevenueCat();

  // Progress animation: 0 to 100 over 6000ms
  const progressValue = useSharedValue(0);

  // Spinner rotation
  const spinnerRotation = useSharedValue(0);

  // Ghost emoji pulse
  const ghostScale = useSharedValue(1);

  // Text fade
  const textOpacity = useSharedValue(1);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  // Start progress animation (0 → 100 over 6 seconds)
  useEffect(() => {
    progressValue.value = withTiming(100, {
      duration: 6000,
      easing: Easing.linear,
    });

    // Navigate after 6 seconds (ensures RevenueCat finishes loading)
    const timer = setTimeout(() => {
      router.replace("/onboarding/step8-paywall" as never);
    }, 6000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Start spinner rotation (continuous)
  useEffect(() => {
    spinnerRotation.value = withRepeat(
      withTiming(360, {
        duration: 2000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Ghost emoji pulse animation
  useEffect(() => {
    ghostScale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 1200 }),
        withTiming(0.95, { duration: 1200 })
      ),
      -1,
      true
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cycle through text phrases every 600ms
  useEffect(() => {
    const interval = setInterval(() => {
      // Fade out
      textOpacity.value = withSequence(
        withTiming(0, { duration: 150 }),
        withTiming(1, { duration: 150 })
      );

      // Move to next phrase
      setCurrentPhraseIndex((prev) => (prev + 1) % LOADING_PHRASES.length);
    }, 600);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animated styles
  const spinnerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${spinnerRotation.value}deg` }],
  }));

  const progressBarAnimatedStyle = useAnimatedStyle(() => {
    const width = interpolate(
      progressValue.value,
      [0, 100],
      [0, 100],
      Extrapolate.CLAMP
    );
    return {
      width: `${width}%`,
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
  }));

  const ghostAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ghostScale.value }],
  }));

  return (
    <ScreenContainer containerClassName="bg-background">
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            backgroundImage: `linear-gradient(180deg, ${colors.background} 0%, ${colors.surface} 100%)`,
          },
        ]}
      >
        {/* Ghost Emoji with Pulse */}
        <Animated.Text
          style={[styles.ghostEmoji, ghostAnimatedStyle]}
        >
          👻
        </Animated.Text>

        {/* Elegant Arc Spinner */}
        <Animated.View
          style={[
            styles.spinner,
            spinnerAnimatedStyle,
            { borderColor: colors.accent },
          ]}
        />

        {/* Progress Bar Container with Glow */}
        <View
          style={[
            styles.progressContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.accent,
              shadowColor: colors.accent,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.3,
              shadowRadius: 12,
              elevation: 8,
            },
          ]}
        >
          <Animated.View
            style={[
              styles.progressBar,
              progressBarAnimatedStyle,
              {
                backgroundColor: colors.accent,
                shadowColor: colors.accent,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.5,
                shadowRadius: 8,
                elevation: 6,
              },
            ]}
          />
        </View>

        {/* Luxury Loading Text */}
        <Animated.Text
          style={[
            styles.loadingText,
            textAnimatedStyle,
            { color: colors.foreground },
          ]}
        >
          {LOADING_PHRASES[currentPhraseIndex]}
        </Animated.Text>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 50,
    paddingHorizontal: 24,
  },
  ghostEmoji: {
    fontSize: 60,
    marginBottom: 20,
  },
  spinner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
  },
  progressContainer: {
    width: 280,
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
    borderWidth: 1,
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "300",
    letterSpacing: 1,
    textAlign: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },
});
