'use client';
import 'react-native-reanimated';
import React from 'react';
import { View, type ViewProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';

interface AnimatedColorProps extends ViewProps {
  color: string;
  duration?: number;
  children: React.ReactNode;
}

export function AnimatedColor({
  color,
  duration = 300,
  children,
  style,
  ...props
}: AnimatedColorProps) {
  const colorValue = useSharedValue(0);
  const [prevColor, setPrevColor] = React.useState(color);

  React.useEffect(() => {
    if (color !== prevColor) {
      colorValue.value = 0;
      colorValue.value = withTiming(1, {
        duration,
        easing: Easing.out(Easing.cubic),
      });
      setPrevColor(color);
    }
  }, [color]);

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      colorValue.value,
      [0, 1],
      [prevColor, color]
    ),
  }));

  return (
    <Animated.View style={[animatedStyle, style]} {...props}>
      {children}
    </Animated.View>
  );
}
