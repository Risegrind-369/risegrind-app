import React, { useMemo } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
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
  const orbSize = 75; // Premium size
  const orbRadius = orbSize / 2;

  // Shared value for animated X position
  const translateX = useSharedValue(activeTabIndex * tabWidth + tabWidth / 2 - orbRadius);

  // Update animation when active tab changes
  React.useEffect(() => {
    translateX.value = withSpring(
      activeTabIndex * tabWidth + tabWidth / 2 - orbRadius,
      {
        damping: 8, // Slightly bouncier for premium feel
        mass: 1,
        overshootClamping: false,
      }
    );
  }, [activeTabIndex, tabWidth, translateX]);

  // Animated style for the orb container
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Only render on native platforms
  if (Platform.OS === "web") {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.orbContainer,
        {
          bottom: bottomInset + tabBarHeight - orbSize / 2 - 12,
          width: orbSize,
          height: orbSize,
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
    width: "140%",
    height: "140%",
    borderRadius: 999,
    shadowColor: "rgba(255, 255, 255, 0.5)",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },

  // Main frosted glass container
  orbOuter: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 999,
    borderWidth: 1.5,
    overflow: "hidden",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
  },

  // Mid-tone layer for depth
  orbMid: {
    position: "absolute",
    width: "85%",
    height: "85%",
    borderRadius: 999,
    top: "7.5%",
    left: "7.5%",
  },

  // Top light reflection (iOS 17 characteristic)
  orbInnerTop: {
    position: "absolute",
    width: "55%",
    height: "35%",
    borderRadius: 999,
    top: "12%",
    left: "22.5%",
    opacity: 0.7,
  },

  // Bottom subtle glow
  orbInnerBottom: {
    position: "absolute",
    width: "50%",
    height: "30%",
    borderRadius: 999,
    bottom: "10%",
    left: "25%",
    opacity: 0.5,
  },

  // Premium center dot
  centerDot: {
    position: "absolute",
    width: "20%",
    height: "20%",
    borderRadius: 999,
    top: "40%",
    left: "40%",
    opacity: 0.6,
  },
});
