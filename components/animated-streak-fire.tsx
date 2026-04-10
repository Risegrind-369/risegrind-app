'use client';
import 'react-native-reanimated';
import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';

interface AnimatedStreakFireProps {
  streak: number;
  isIncreasing?: boolean;
}

export function AnimatedStreakFire({
  streak,
  isIncreasing = false,
}: AnimatedStreakFireProps) {
  const scaleValue = useSharedValue(1);
  const rotateValue = useSharedValue(0);
  const opacityValue = useSharedValue(1);

  useEffect(() => {
    if (isIncreasing) {
      // Pop animation when streak increases
      scaleValue.value = withSequence(
        withSpring(1.3, { damping: 6, mass: 1 }),
        withSpring(1, { damping: 8, mass: 1 })
      );

      // Subtle rotation flicker
      rotateValue.value = withSequence(
        withTiming(-5, { duration: 100 }),
        withTiming(5, { duration: 100 }),
        withTiming(-3, { duration: 100 }),
        withTiming(0, { duration: 100 })
      );
    }
  }, [isIncreasing]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleValue.value },
      { rotate: `${rotateValue.value}deg` },
    ],
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.badge}>
        <Text style={styles.fire}>🔥</Text>
        <Text style={styles.count}>{streak}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9731620',
  },
  fire: {
    fontSize: 18,
  },
  count: {
    fontSize: 18,
    fontWeight: '800',
    color: '#F97316',
  },
});
