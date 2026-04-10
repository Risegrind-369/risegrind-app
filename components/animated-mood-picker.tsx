'use client';
import 'react-native-reanimated';
import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Modal,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
  interpolateColor,
} from 'react-native-reanimated';
import { useColors } from '@/hooks/use-colors';
import { MOOD_EMOJIS, MOOD_LABELS, type MoodLevel } from '@/lib/app-context';
import * as Haptics from 'expo-haptics';

const MOOD_COLORS: Record<MoodLevel, string> = {
  1: '#EF4444',
  2: '#F97316',
  3: '#EAB308',
  4: '#22C55E',
  5: '#3B82F6',
};

interface AnimatedMoodPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (level: MoodLevel) => void;
  selectedMood: MoodLevel | null;
}

function MoodOption({
  level,
  isSelected,
  onPress,
}: {
  level: MoodLevel;
  isSelected: boolean;
  onPress: () => void;
}) {
  const colors = useColors();
  const scaleValue = useSharedValue(isSelected ? 1.1 : 1);
  const colorValue = useSharedValue(isSelected ? 1 : 0);

  React.useEffect(() => {
    scaleValue.value = withSpring(isSelected ? 1.1 : 1, {
      damping: 8,
      mass: 1,
      overshootClamping: false,
    });
    colorValue.value = withTiming(isSelected ? 1 : 0, {
      duration: 300,
      easing: Easing.out(Easing.cubic),
    });
  }, [isSelected]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
    backgroundColor: interpolateColor(
      colorValue.value,
      [0, 1],
      [colors.surface, MOOD_COLORS[level] + '20']
    ),
  }));

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.moodOption,
          {
            borderColor: isSelected ? MOOD_COLORS[level] : colors.border,
          },
          animatedStyle,
        ]}
      >
        <Text style={styles.moodEmoji}>{MOOD_EMOJIS[level]}</Text>
        <Text
          style={[
            styles.moodLevelLabel,
            { color: isSelected ? MOOD_COLORS[level] : colors.muted },
          ]}
        >
          {MOOD_LABELS[level]}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

export function AnimatedMoodPicker({
  visible,
  onClose,
  onSelect,
  selectedMood,
}: AnimatedMoodPickerProps) {
  const colors = useColors();
  const [tempSelected, setTempSelected] = useState<MoodLevel | null>(selectedMood);

  const handleSave = () => {
    if (tempSelected) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSelect(tempSelected);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalSheet,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
          <Text style={[styles.modalTitle, { color: colors.foreground }]}>
            How are you feeling?
          </Text>
          <Text style={[styles.modalSub, { color: colors.muted }]}>
            Select your mood for today
          </Text>

          <View style={styles.moodGrid}>
            {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => (
              <MoodOption
                key={level}
                level={level}
                isSelected={tempSelected === level}
                onPress={() => setTempSelected(level)}
              />
            ))}
          </View>

          <Pressable
            onPress={handleSave}
            disabled={!tempSelected}
            style={({ pressed }) => [
              styles.saveMoodButton,
              {
                backgroundColor: tempSelected ? colors.primary : colors.border,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <Text
              style={[
                styles.saveMoodText,
                { color: tempSelected ? '#fff' : colors.muted },
              ]}
            >
              Save Mood
            </Text>
          </Pressable>

          <Pressable
            onPress={onClose}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 12 })}
          >
            <Text style={[styles.cancelText, { color: colors.muted }]}>Cancel</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
    alignItems: 'center',
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalSub: {
    fontSize: 15,
    marginBottom: 8,
  },
  moodGrid: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 8,
  },
  moodOption: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 58,
    height: 72,
    borderRadius: 16,
    borderWidth: 2,
    gap: 4,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLevelLabel: {
    fontSize: 10,
    fontWeight: '600',
  },
  saveMoodButton: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  saveMoodText: {
    fontSize: 17,
    fontWeight: '700',
  },
  cancelText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
