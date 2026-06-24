/**
 * Onboarding Step 4c: Loading/Transition Screen
 *
 * Displays animated progress bar and cycling text while initializing AI mentor.
 * Automatically navigates to step5-graphs after 3 seconds.
 *
 * Features:
 * - Rotating spinner above progress bar
 * - Animated progress bar (0% → 100% over 3 seconds)
 * - Cycling text phrases that fade in/out every 600ms
 * - Automatic navigation after completion
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

const LOADING_PHRASES = [
  "Analyzing your goals...",
  "Building your routine...",
  "Personalizing your AI mentor...",
  "Calculating your potential...",
  "Almost ready...",
];

export default function Step4cLoadingScreen() {
  const colors = useColors();
  const router = useRouter();

  // Progress animation: 0 to 100 over 3000ms
  const progressValue = useSharedValue(0);

  // Spinner rotation
  const spinnerRotation = useSharedValue(0);

  // Text fade
  const textOpacity = useSharedValue(1);
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);

  // Start progress animation (0 → 100 over 3 seconds)
  useEffect(() => {
    progressValue.value = withTiming(100, {
      duration: 3000,
      easing: Easing.linear,
    });

    // Navigate after 3 seconds
    const timer = setTimeout(() => {
      router.replace("/onboarding/step5-graphs" as never);
    }, 3000);

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

  return (
    <ScreenContainer containerClassName="bg-background">
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Spinner */}
        <Animated.View
          style={[
            styles.spinner,
            spinnerAnimatedStyle,
            { borderColor: colors.primary },
          ]}
        />

        {/* Progress Bar Container */}
        <View
          style={[
            styles.progressContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Animated.View
            style={[
              styles.progressBar,
              progressBarAnimatedStyle,
              { backgroundColor: colors.primary },
            ]}
          />
        </View>

        {/* Cycling Text */}
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
    gap: 40,
  },
  spinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 4,
    borderTopColor: "transparent",
    borderRightColor: "transparent",
  },
  progressContainer: {
    width: 200,
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
    borderWidth: 1,
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 20,
  },
});
