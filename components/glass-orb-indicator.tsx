import React, { useEffect } from 'react';
import { View, Dimensions, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

interface GlassOrbIndicatorProps {
  activeTabIndex: number;
  tabCount: number;
  tabBarHeight: number;
  bottomInset: number;
}

/**
 * iOS 17-style glass orb indicator that hovers above the active tab.
 * Uses pure React Native styling (no native blur module required).
 * Smooth spring animation when switching tabs.
 */
export function GlassOrbIndicator({
  activeTabIndex,
  tabCount,
  tabBarHeight,
  bottomInset,
}: GlassOrbIndicatorProps) {
  const screenWidth = Dimensions.get('window').width;
  const tabWidth = screenWidth / tabCount;
  const orbSize = 60;
  const orbOffset = (tabWidth - orbSize) / 2;

  // Shared animated value for smooth X position
  const translateX = useSharedValue(activeTabIndex * tabWidth + orbOffset);

  // Update position when active tab changes
  useEffect(() => {
    const targetX = activeTabIndex * tabWidth + orbOffset;

    // Smooth spring animation for tab switching
    translateX.value = withSpring(targetX, {
      damping: 12,
      mass: 1,
      overshootClamping: false,
    });
  }, [activeTabIndex, tabWidth, orbOffset, translateX]);

  // Animated style for the glass orb
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  // Position above tab bar
  const bottom = tabBarHeight - orbSize / 2 - 8;

  return (
    <Animated.View
      style={[
        {
          position: 'absolute',
          bottom,
          left: 0,
          width: orbSize,
          height: orbSize,
          zIndex: 10,
        },
        animatedStyle,
      ]}
      pointerEvents="none"
    >
      {/* Outer glass layer with border */}
      <View
        style={{
          width: orbSize,
          height: orbSize,
          borderRadius: orbSize / 2,
          backgroundColor: 'rgba(255, 255, 255, 0.12)',
          borderWidth: 1.5,
          borderColor: 'rgba(255, 255, 255, 0.25)',
          overflow: 'hidden',
        }}
      >
        {/* Inner glow layer */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: orbSize / 2,
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderWidth: 1,
            borderColor: 'rgba(255, 255, 255, 0.15)',
          }}
        />

        {/* Subtle highlight gradient effect (top-left) */}
        <View
          style={{
            position: 'absolute',
            top: 4,
            left: 4,
            width: orbSize / 3,
            height: orbSize / 3,
            borderRadius: orbSize / 6,
            backgroundColor: 'rgba(255, 255, 255, 0.3)',
            opacity: 0.6,
          }}
        />
      </View>
    </Animated.View>
  );
}
