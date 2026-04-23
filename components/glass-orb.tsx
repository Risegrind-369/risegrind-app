import React, { useMemo } from "react";
import { Dimensions, Platform, StyleSheet, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";

interface GlassOrbProps {
  activeTabIndex: number;
  tabCount: number;
  tabBarHeight: number;
  bottomInset: number;
}

/**
 * iOS 17-style glass orb indicator that hovers above the active tab.
 * Uses pure React Native styling with Reanimated animations.
 * No native dependencies required.
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
  const orbSize = 70; // Slightly larger than tab icon
  const orbRadius = orbSize / 2;

  // Shared value for animated X position
  const translateX = useSharedValue(activeTabIndex * tabWidth + tabWidth / 2 - orbRadius);

  // Update animation when active tab changes
  React.useEffect(() => {
    translateX.value = withSpring(
      activeTabIndex * tabWidth + tabWidth / 2 - orbRadius,
      {
        damping: 10,
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
          bottom: bottomInset + tabBarHeight - orbSize / 2 - 8,
          width: orbSize,
          height: orbSize,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      {/* Outer glass layer with subtle shadow */}
      <View
        style={[
          styles.orbOuter,
          {
            backgroundColor: "rgba(255, 255, 255, 0.15)",
            borderColor: "rgba(255, 255, 255, 0.3)",
          },
        ]}
      />

      {/* Inner highlight gradient effect */}
      <View
        style={[
          styles.orbInner,
          {
            backgroundColor: "rgba(255, 255, 255, 0.25)",
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
  orbOuter: {
    width: "100%",
    height: "100%",
    borderRadius: 35,
    borderWidth: 1.5,
    shadowColor: "rgba(255, 255, 255, 0.4)",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  orbInner: {
    position: "absolute",
    width: "60%",
    height: "40%",
    borderRadius: 20,
    top: "15%",
    left: "20%",
    opacity: 0.6,
  },
});
