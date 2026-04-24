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
}

/**
 * iOS-style notification badge for tab bar tabs.
 * Shows unread count with smooth animations.
 */
export function TabBadge({
  count = 0,
  position = "top-right",
}: TabBadgeProps) {
  const colors = useColors();

  // Shared value for badge scale animation
  const scale = useSharedValue(count > 0 ? 1 : 0);

  React.useEffect(() => {
    scale.value = withSpring(count > 0 ? 1 : 0, {
      damping: 10,
      mass: 1,
      overshootClamping: false,
    });
  }, [count, scale]);

  // Animated style for badge
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
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

  badgeText: {
    fontWeight: "700",
    textAlign: "center",
    includeFontPadding: false,
  },
});
