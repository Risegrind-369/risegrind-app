import React from "react";
import { StyleSheet, View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";

interface TabBadgeProps {
  /**
   * Number of unread items. If 0, badge is hidden.
   */
  count?: number;
  /**
   * Position of the badge relative to the tab icon.
   * "top-right" | "top-left" | "bottom-right" | "bottom-left"
   */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  /**
   * Whether this badge's tab is currently active.
   * Triggers pulse animation when true.
   */
  isActive?: boolean;
}

/**
 * iOS-style notification badge for tab bar tabs.
 * Shows unread count with smooth animations and pulse effect when tab is active.
 */
export function TabBadge({
  count = 0,
  position = "top-right",
  isActive = false,
}: TabBadgeProps) {
  const colors = useColors();

  // Shared value for badge scale animation
  const scale = useSharedValue(count > 0 ? 1 : 0);
  // Shared value for pulse animation when tab is active
  const pulseScale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withSpring(count > 0 ? 1 : 0, {
      damping: 10,
      mass: 1,
      overshootClamping: false,
    });
  }, [count, scale]);

  // Trigger pulse animation when tab becomes active
  React.useEffect(() => {
    if (isActive && count > 0) {
      pulseScale.value = withSpring(1.2, {
        damping: 6,
        mass: 0.8,
        overshootClamping: false,
      });
      // Reset back to normal size
      setTimeout(() => {
        pulseScale.value = withSpring(1, {
          damping: 10,
          mass: 1,
        });
      }, 300);
    }
  }, [isActive, count, pulseScale]);

  // Animated style for badge with pulse effect
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value * pulseScale.value }],
    opacity: scale.value,
  }));

  // If no count, don't render
  if (count === 0) {
    return null;
  }

  // Determine badge position
  const positionStyles = getPositionStyles(position);

  // Format count: show number up to 99, then "99+"
  const displayCount = count > 99 ? "99+" : count.toString();
  const isBigNumber = displayCount.length > 1;

  // Add subtle glow effect when active
  const glowOpacity = isActive && count > 0 ? 0.6 : 0;

  return (
    <Animated.View
      style={[
        styles.badgeContainer,
        positionStyles,
        animatedStyle,
        {
          width: isBigNumber ? 28 : 22,
          height: isBigNumber ? 28 : 22,
        },
      ]}
    >
      {/* Glow effect when badge is active */}
      {isActive && count > 0 && (
        <View
          style={[
            styles.badgeGlow,
            {
              borderColor: colors.error || "#EF4444",
              opacity: glowOpacity,
            },
          ]}
        />
      )}
      <View
        style={[
          styles.badge,
          {
            backgroundColor: colors.error || "#EF4444",
            borderColor: colors.background || "#ffffff",
          },
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            {
              fontSize: isBigNumber ? 10 : 12,
              color: "#ffffff",
            },
          ]}
        >
          {displayCount}
        </Text>
      </View>
    </Animated.View>
  );
}

/**
 * Get position styles based on position prop
 */
function getPositionStyles(position: string) {
  switch (position) {
    case "top-left":
      return { top: -4, left: -4 };
    case "top-right":
      return { top: -4, right: -4 };
    case "bottom-left":
      return { bottom: -4, left: -4 };
    case "bottom-right":
      return { bottom: -4, right: -4 };
    default:
      return { top: -4, right: -4 };
  }
}

const styles = StyleSheet.create({
  badgeContainer: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },

  badge: {
    width: "100%",
    height: "100%",
    borderRadius: 999,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  badgeGlow: {
    position: "absolute",
    width: "140%",
    height: "140%",
    borderRadius: 999,
    borderWidth: 2,
    shadowColor: "#EF4444",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },

  badgeText: {
    fontWeight: "700",
    textAlign: "center",
    includeFontPadding: false,
  },
});
