'use client';
import 'react-native-reanimated';
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';
import { ParticleEffect } from './animations/particle-effect';
import * as Haptics from 'expo-haptics';

interface AnimatedHabitCheckboxProps {
  isCompleted: boolean;
  onToggle: () => void;
  onDelete: () => void;
  habit: {
    id: string;
    name: string;
    icon: string;
    durationMin: number;
  };
}

export function AnimatedHabitCheckbox({
  isCompleted,
  onToggle,
  onDelete,
  habit,
}: AnimatedHabitCheckboxProps) {
  const colors = useColors();
  const [showParticles, setShowParticles] = useState(false);
  const checkProgress = useSharedValue(isCompleted ? 1 : 0);
  const scaleValue = useSharedValue(1);
  const opacityValue = useSharedValue(isCompleted ? 0.5 : 1);

  React.useEffect(() => {
    checkProgress.value = withSpring(isCompleted ? 1 : 0, {
      damping: 8,
      mass: 1,
      overshootClamping: false,
    });
    opacityValue.value = withTiming(isCompleted ? 0.5 : 1, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  }, [isCompleted]);

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    scaleValue.value = withSpring(0.92, {
      damping: 8,
      mass: 1,
      overshootClamping: false,
    });
    setTimeout(() => {
      scaleValue.value = withSpring(1, {
        damping: 8,
        mass: 1,
        overshootClamping: false,
      });
    }, 50);

    if (!isCompleted) {
      setShowParticles(true);
    }
    onToggle();
  };

  const checkboxAnimatedStyle = useAnimatedStyle(() => {
    const checkScale = interpolate(
      checkProgress.value,
      [0, 1],
      [0.3, 1],
      Extrapolate.CLAMP
    );
    return {
      transform: [{ scale: checkScale }],
      opacity: checkProgress.value,
    };
  });

  const rowAnimatedStyle = useAnimatedStyle(() => ({
    opacity: opacityValue.value,
    transform: [{ scale: scaleValue.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.habitRow,
        {
          backgroundColor: isCompleted ? colors.success + '12' : colors.surface,
          borderColor: isCompleted ? colors.success + '40' : colors.border,
        },
        rowAnimatedStyle,
      ]}
    >
      <Pressable
        onPress={handleToggle}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          onDelete();
        }}
        style={({ pressed }) => ({
          opacity: pressed ? 0.8 : 1,
        })}
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: isCompleted ? colors.success : 'transparent',
              borderColor: isCompleted ? colors.success : colors.border,
            },
          ]}
        >
          {isCompleted && (
            <Animated.Text
              style={[
                styles.checkmark,
                checkboxAnimatedStyle,
              ]}
            >
              ✓
            </Animated.Text>
          )}
        </View>
      </Pressable>

      <Text style={styles.habitIcon}>{habit.icon}</Text>

      <View style={styles.habitInfo}>
        <Text
          style={[
            styles.habitName,
            {
              color: isCompleted ? colors.muted : colors.foreground,
              textDecorationLine: isCompleted ? 'line-through' : 'none',
            },
          ]}
        >
          {habit.name}
        </Text>
        {habit.durationMin > 0 && (
          <Text style={[styles.habitDuration, { color: colors.muted }]}>
            {habit.durationMin} min
          </Text>
        )}
      </View>

      {isCompleted && (
        <Animated.View
          style={[
            styles.xpBadge,
            { backgroundColor: colors.success + '20' },
            checkboxAnimatedStyle,
          ]}
        >
          <Text style={[styles.xpBadgeText, { color: colors.success }]}>
            +10 XP
          </Text>
        </Animated.View>
      )}

      {showParticles && (
        <ParticleEffect
          trigger={showParticles}
          color={colors.success}
          onComplete={() => setShowParticles(false)}
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  habitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
    position: 'relative',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  habitIcon: {
    fontSize: 22,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 22,
  },
  habitDuration: {
    fontSize: 12,
    marginTop: 1,
  },
  xpBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  xpBadgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
