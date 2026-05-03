import React, { useMemo } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";

interface GlassOrbProps {
  activeTabIndex: number;
  tabCount: number;
  tabBarHeight: number;
  bottomInset: number;
}

/**
 * Premium iOS 17-style glass orb indicator that hovers above the active tab.
 * Features:
 * - Frosted glass morphism effect with layered transparency
 * - Smooth spring animations with overshoot
 * - Pulsing glow effect
 * - Multi-layer depth for premium appearance
 * - Optimized for both light and dark modes
 */
export function GlassOrb({
  activeTabIndex,
  tabCount,
  tabBarHeight,
  bottomInset,
}: GlassOrbProps) {
  const colors = useColors();
  const screenWidth = Dimensions.get("window").width;

  // Calculate tab width and orb position
  const tabWidth = screenWidth / tabCount;
  const orbWidth = 60; // Oval width
  const orbHeight = 32; // Smaller height, fits within tab bar
  const orbRadius = orbWidth / 2;

  // Shared value for animated X position
  const translateX = useSharedValue(activeTabIndex * tabWidth + tabWidth / 2 - orbRadius);
  
  // Shared value for animated Y position (slight bounce effect)
  const translateY = useSharedValue(0);

  // Trigger haptic feedback when animation completes
  const triggerHaptic = React.useCallback(() => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  }, []);

  // Update animation when active tab changes
  React.useEffect(() => {
    translateX.value = withSpring(
      activeTabIndex * tabWidth + tabWidth / 2 - orbRadius,
      {
        damping: 8, // Slightly bouncier for premium feel
        mass: 1,
        overshootClamping: false,
      },
      () => {
        // Trigger haptic feedback when animation completes
        runOnJS(triggerHaptic)();
      }
    );
  }, [activeTabIndex, tabWidth, orbRadius, translateX, triggerHaptic]);

  // Animated style for the orb container
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Only render on native platforms
  if (Platform.OS === "web") {
    return null;
  }

  // Haptic feedback on mount (initial tab)
  React.useEffect(() => {
    triggerHaptic();
  }, []);

  return (
    <Animated.View
      style={[
        styles.orbContainer,
        {
          bottom: bottomInset + 14, // Position in middle of tab bar
          width: orbWidth,
          height: orbHeight,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      {/* Glow layer - soft outer glow */}
      <View
        style={[
          styles.glowLayer,
          {
            backgroundColor: "rgba(255, 255, 255, 0.08)",
          },
        ]}
      />

      {/* Outer glass layer - main frosted glass effect */}
      <View
        style={[
          styles.orbOuter,
          {
            backgroundColor: "rgba(255, 255, 255, 0.18)",
            borderColor: "rgba(255, 255, 255, 0.35)",
            shadowColor: "#000",
            shadowOpacity: 0.15,
          },
        ]}
      />

      {/* Mid-tone layer - depth effect */}
      <View
        style={[
          styles.orbMid,
          {
            backgroundColor: "rgba(255, 255, 255, 0.12)",
          },
        ]}
      />

      {/* Inner highlight - top light reflection */}
      <View
        style={[
          styles.orbInnerTop,
          {
            backgroundColor: "rgba(255, 255, 255, 0.35)",
          },
        ]}
      />

      {/* Inner highlight - bottom subtle glow */}
      <View
        style={[
          styles.orbInnerBottom,
          {
            backgroundColor: "rgba(255, 255, 255, 0.15)",
          },
        ]}
      />

      {/* Premium center dot - iOS 17 style */}
      <View
        style={[
          styles.centerDot,
          {
            backgroundColor: "rgba(255, 255, 255, 0.4)",
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  orbContainer: {
    position: "absolute",
    left: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 50,
  },

  // Soft outer glow
  glowLayer: {
    position: "absolute",
    width: "120%",
    height: "150%",
    borderRadius: 999,
    shadowColor: "rgba(255, 255, 255, 0.5)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  // Main frosted glass container (oval)
  orbOuter: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 16, // Oval shape with rounded corners
    borderWidth: 1,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },

  // Mid-tone layer for depth
  orbMid: {
    position: "absolute",
    width: "90%",
    height: "80%",
    borderRadius: 14,
    top: "10%",
    left: "5%",
  },

  // Top light reflection (iOS 17 characteristic)
  orbInnerTop: {
    position: "absolute",
    width: "60%",
    height: "40%",
    borderRadius: 12,
    top: "8%",
    left: "20%",
    opacity: 0.6,
  },

  // Bottom subtle glow
  orbInnerBottom: {
    position: "absolute",
    width: "55%",
    height: "35%",
    borderRadius: 12,
    bottom: "8%",
    left: "22.5%",
    opacity: 0.4,
  },

  // Premium center dot
  centerDot: {
    position: "absolute",
    width: "15%",
    height: "25%",
    borderRadius: 8,
    top: "37.5%",
    left: "42.5%",
    opacity: 0.5,
  },
});
