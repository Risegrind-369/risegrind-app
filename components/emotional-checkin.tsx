import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import Animated, { FadeIn, FadeOut, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface EmotionalCheckInProps {
  userId: string;
  onComplete?: (data: any) => void;
  visible: boolean;
  onClose: () => void;
}

export function EmotionalCheckIn({ userId, onComplete, visible, onClose }: EmotionalCheckInProps) {
  const colors = useColors();
  const [mood, setMood] = useState<number | null>(null);
  const [energy, setEnergy] = useState<number | null>(null);
  const [stress, setStress] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const moodOptions = [
    { value: 1, emoji: '😢', label: 'Very Bad' },
    { value: 2, emoji: '😕', label: 'Bad' },
    { value: 3, emoji: '😐', label: 'Okay' },
    { value: 4, emoji: '🙂', label: 'Good' },
    { value: 5, emoji: '😄', label: 'Great' }
  ];

  const handleMoodSelect = (value: number) => {
    setMood(value);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleSubmit = async () => {
    if (mood === null || energy === null) return;

    setLoading(true);
    try {
      const response = await fetch('/api/mentor/emotional-checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          mood,
          energy,
          stress: stress || null,
          notes: notes || null
        })
      });

      const data = await response.json();
      if (data.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onComplete?.(data);
        onClose();
      }
    } catch (error) {
      console.error('Failed to save check-in:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 items-center justify-center">
        <Animated.View
          entering={ZoomIn}
          exiting={FadeOut}
          className="w-11/12 bg-background rounded-3xl p-6 shadow-lg"
        >
          {/* Header */}
          <Text className="text-2xl font-bold text-foreground mb-2">How are you feeling?</Text>
          <Text className="text-sm text-muted mb-6">
            Your mentor uses this to understand your context better
          </Text>

          {/* Mood Selection */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground mb-3">Mood</Text>
            <View className="flex-row justify-between">
              {moodOptions.map(option => (
                <TouchableOpacity
                  key={option.value}
                  onPress={() => handleMoodSelect(option.value)}
                  className={cn(
                    'items-center p-3 rounded-2xl flex-1 mx-1',
                    mood === option.value ? 'bg-primary/20 border-2 border-primary' : 'bg-surface border border-border'
                  )}
                >
                  <Text className="text-3xl mb-1">{option.emoji}</Text>
                  <Text className="text-xs text-muted">{option.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Energy Level */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm font-semibold text-foreground">Energy Level</Text>
              <Text className="text-lg font-bold text-primary">{energy || '—'}/10</Text>
            </View>
            <View className="flex-row gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    setEnergy(i + 1);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={cn(
                    'flex-1 h-10 rounded-lg',
                    energy && energy > i ? 'bg-primary' : 'bg-surface border border-border'
                  )}
                />
              ))}
            </View>
          </View>

          {/* Stress Level */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-sm font-semibold text-foreground">Stress Level</Text>
              <Text className="text-lg font-bold text-error">{stress || '—'}/10</Text>
            </View>
            <View className="flex-row gap-1">
              {Array.from({ length: 10 }).map((_, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => {
                    setStress(i + 1);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  className={cn(
                    'flex-1 h-10 rounded-lg',
                    stress && stress > i ? 'bg-error' : 'bg-surface border border-border'
                  )}
                />
              ))}
            </View>
          </View>

          {/* Notes */}
          <View className="mb-6">
            <Text className="text-sm font-semibold text-foreground mb-2">Notes (Optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="What's on your mind?"
              placeholderTextColor={colors.muted}
              className="px-4 py-3 rounded-xl bg-surface border border-border text-foreground"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Action Buttons */}
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl bg-surface border border-border items-center"
            >
              <Text className="text-foreground font-semibold">Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={mood === null || energy === null || loading}
              className={cn(
                'flex-1 py-3 rounded-xl items-center justify-center',
                mood !== null && energy !== null ? 'bg-primary' : 'bg-border'
              )}
            >
              {loading ? (
                <ActivityIndicator color={colors.background} />
              ) : (
                <Text className="text-background font-semibold">Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
