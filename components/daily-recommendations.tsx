import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface Recommendation {
  id: string;
  habitId: string;
  habitName: string;
  reason: string;
  rank: number;
  accepted: boolean;
}

interface DailyRecommendationsProps {
  userId: string;
  onHabitSelect?: (habitId: string) => void;
}

export function DailyRecommendations({ userId, onHabitSelect }: DailyRecommendationsProps) {
  const colors = useColors();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, [userId]);

  const loadRecommendations = async () => {
    try {
      const response = await fetch(`/api/mentor/habit-recommendations/today?userId=${userId}`);
      const data = await response.json();
      setRecommendations(data.map((rec: any) => ({
        id: rec.id,
        habitId: rec.habitId,
        habitName: rec.habitId.replace(/-/g, ' ').toUpperCase(),
        reason: rec.reason,
        rank: rec.rank,
        accepted: rec.accepted
      })));
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = (habitId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onHabitSelect?.(habitId);
  };

  if (loading) {
    return (
      <View className="px-4 py-6 items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (recommendations.length === 0) {
    return (
      <View className="px-4 py-6 bg-surface rounded-2xl border border-border items-center">
        <Text className="text-lg font-semibold text-foreground mb-2">✨ No Recommendations Yet</Text>
        <Text className="text-sm text-muted text-center">
          Complete your emotional check-in to get personalized recommendations
        </Text>
      </View>
    );
  }

  return (
    <View>
      <View className="px-4 mb-4">
        <Text className="text-lg font-bold text-foreground">Recommended for You Today</Text>
        <Text className="text-sm text-muted">Based on your mood and energy level</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="px-4 pb-4">
        {recommendations.map((rec, idx) => (
          <Animated.View
            key={rec.id}
            entering={FadeInDown.delay(idx * 100)}
            className="mr-3"
          >
            <TouchableOpacity
              onPress={() => handleAccept(rec.habitId)}
              className="w-56 p-4 rounded-2xl bg-gradient-to-br border border-primary/30"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.primary
              }}
            >
              {/* Rank Badge */}
              <View className="absolute top-3 right-3 w-8 h-8 rounded-full bg-primary items-center justify-center">
                <Text className="text-background font-bold text-sm">#{rec.rank}</Text>
              </View>

              {/* Habit Name */}
              <Text className="text-lg font-bold text-foreground mb-2 pr-8">
                {rec.habitName}
              </Text>

              {/* Reason */}
              <View className="bg-background/50 px-3 py-2 rounded-lg mb-3">
                <Text className="text-xs text-muted">💡 Why recommended</Text>
                <Text className="text-sm text-foreground mt-1">{rec.reason}</Text>
              </View>

              {/* CTA */}
              <TouchableOpacity
                onPress={() => handleAccept(rec.habitId)}
                className="bg-primary py-2 rounded-lg items-center"
              >
                <Text className="text-background font-semibold">Start Now →</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </ScrollView>
    </View>
  );
}
