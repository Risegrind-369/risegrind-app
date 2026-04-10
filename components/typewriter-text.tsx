'use client';
import 'react-native-reanimated';
import React, { useEffect, useState } from 'react';
import { Text, type TextProps } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';

interface TypewriterTextProps extends TextProps {
  text: string;
  duration?: number;
  onComplete?: () => void;
}

export function TypewriterText({
  text,
  duration = 1500,
  onComplete,
  style,
  ...props
}: TypewriterTextProps) {
  const [displayedText, setDisplayedText] = useState('');
  const progressValue = useSharedValue(0);

  useEffect(() => {
    setDisplayedText('');
    progressValue.value = 0;

    progressValue.value = withTiming(1, {
      duration,
      easing: Easing.linear,
    });

    const charsPerMs = text.length / duration;
    let currentIndex = 0;

    const interval = setInterval(() => {
      currentIndex = Math.floor(progressValue.value * text.length);
      if (currentIndex > text.length) {
        currentIndex = text.length;
        clearInterval(interval);
        onComplete?.();
      }
      setDisplayedText(text.slice(0, currentIndex));
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [text, duration]);

  return (
    <Text style={style} {...props}>
      {displayedText}
      {displayedText.length < text.length && <Text style={{ opacity: 0.5 }}>▌</Text>}
    </Text>
  );
}
