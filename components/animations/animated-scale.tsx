'use client';
import 'react-native-reanimated';
import React from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
  type AnimatedStyle,
} from 'react-native-reanimated';

interface AnimatedScaleProps extends ViewProps {
  scale?: number;
  duration?: number;
  useSpring?: boolean;
  children: React.ReactNode;
  style?: AnimatedStyle<any>
}

export function AnimatedScale({
  scale = 1,
  duration = 300,
  useSpring: shouldUseSpring = false,
  children,
  style,
  ...props
}: AnimatedScaleProps) {
  const scaleValue = useSharedValue(1);

  React.useEffect(() => {
    if (shouldUseSpring) {
      scaleValue.value = withSpring(scale, {
        damping: 8,
        mass: 1,
        overshootClamping: false,
      });
    } else {
      scaleValue.value = withTiming(scale, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
    }
  }, [scale, duration, shouldUseSpring]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }] as any,
  }));

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
}
