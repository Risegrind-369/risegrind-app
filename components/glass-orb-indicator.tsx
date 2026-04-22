import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  Easing,
  withTiming,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useColors } from '@/hooks/use-colors';

interface GlassOrbIndicatorProps {
  /** Current active tab index (0 = Home, 1 = Quests, 2 = Journal, 3 = Profile, 4 = Settings) */
  activeTabIndex: number;
  /** Number of tabs */
  tabCount: number;
  /** Tab bar height (typically 56 + bottom inset) */
  tabBarHeight: number;
  /** Bottom inset for safe area */
  bottomInset: number;
}

/**
 * iOS 17-style frosted glass orb that hovers above the active tab.
 * 
 * Features:
 * - Smooth animation when switching tabs
 * - Frosted glass morphism effect with subtle blur
 * - Positioned above active tab
 * - Neutral white/gray appearance
 */
export function GlassOrbIndicator({
  activeTabIndex,
  tabCount,
  tabBarHeight,
  bottomInset,
}: GlassOrbIndicatorProps) {
  const colors = useColors();
  const screenWidth = Dimensions.get('window').width;
  
  // Each tab takes up equal width
  const tabWidth = screenWidth / tabCount;
  
  // Glass orb dimensions
  const orbSize = 60; // Slightly larger than typical tab icon
  const orbOffset = (tabWidth - orbSize) / 2; // Center within tab
  
  // Animated values
  const translateX = useSharedValue(activeTabIndex * tabWidth + orbOffset);
  const opacity = useSharedValue(1);

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
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        styles.container,
        {
          bottom: tabBarHeight - orbSize / 2 - 8, // Position above tab bar
          width: orbSize,
          height: orbSize,
        },
        animatedStyle,
      ]}
    >
      {/* Outer frosted glass layer */}
      <BlurView intensity={40} style={styles.blurContainer}>
        <View
          style={[
            styles.glassOrb,
            {
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              borderColor: 'rgba(255, 255, 255, 0.3)',
            },
          ]}
        />
      </BlurView>

      {/* Inner subtle glow layer */}
      <View
        style={[
          styles.glassOrb,
          {
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderColor: 'rgba(255, 255, 255, 0.15)',
            position: 'absolute',
            top: 2,
            left: 2,
            right: 2,
            bottom: 2,
          },
        ]}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    zIndex: 10,
  },
  blurContainer: {
    flex: 1,
    borderRadius: 999,
    overflow: 'hidden',
  },
  glassOrb: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
});
