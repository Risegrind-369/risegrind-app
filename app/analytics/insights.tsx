import { ScrollView, Text, View, Pressable } from 'react-native';
import { useState } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';

interface HealthInsight {
  id: string;
  type: 'sleep_habit_correlation' | 'stress_habit_correlation' | 'energy_score' | 'streak_break_alert' | 'habit_correlation' | 'success_pattern';
  title: string;
  description: string;
  confidence: number;
  actionItems: string[];
  icon: string;
}

export default function InsightsScreen() {
  const colors = useColors();
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'sleep' | 'stress' | 'energy'>('all');
  const [archivedInsights, setArchivedInsights] = useState<Set<string>>(new Set());

  const insights: HealthInsight[] = [
    {
      id: '1',
      type: 'sleep_habit_correlation',
      title: 'Evening meditation improves your sleep',
      description: 'When you do evening meditation, you sleep 45 minutes more on average. Keep it up!',
      confidence: 0.85,
      actionItems: ['Continue meditation regularly', 'Track sleep quality to confirm benefits'],
      icon: '🧘',
    },
    {
      id: '2',
      type: 'stress_habit_correlation',
      title: 'Morning run reduces your stress',
      description: 'On days you run, your stress is 22 points lower. Great stress management!',
      confidence: 0.78,
      actionItems: ['Schedule runs during high-stress days', 'Use as stress relief technique'],
      icon: '🏃',
    },
    {
      id: '3',
      type: 'energy_score',
      title: 'Your morning energy is improving',
      description: 'Your 7-day average energy score is up 12 points. Your sleep and exercise habits are paying off!',
      confidence: 0.92,
      actionItems: ['Maintain current routine', 'Push for more challenging habits'],
      icon: '⚡',
    },
    {
      id: '4',
      type: 'streak_break_alert',
      title: 'Your reading streak is at risk',
      description: 'Based on recent patterns, there\'s a 55% chance you might break your streak. Now\'s a good time to focus!',
      confidence: 0.68,
      actionItems: ['Set a reminder', 'Do a quick 10-minute session', 'Reach out to accountability partner'],
      icon: '⚠️',
    },
    {
      id: '5',
      type: 'habit_correlation',
      title: 'Stack your morning routine',
      description: 'Morning run + cold shower have a 78% correlation. Doing them back-to-back boosts both!',
      confidence: 0.88,
      actionItems: ['Try stacking these habits', 'Track combined benefits'],
      icon: '🔗',
    },
    {
      id: '6',
      type: 'success_pattern',
      title: 'Your best time for meditation is evening',
      description: 'You complete meditation 78% of the time in the evening, vs 65% in the morning.',
      confidence: 0.81,
      actionItems: ['Schedule meditation for evening', 'Adjust morning routine if needed'],
      icon: '🎯',
    },
  ];

  const getConfidenceBadge = (confidence: number) => {
    if (confidence >= 0.8) return { label: 'High Confidence', color: colors.success };
    if (confidence >= 0.6) return { label: 'Medium Confidence', color: colors.warning };
    return { label: 'Low Confidence', color: colors.error };
  };

  const getFilteredInsights = () => {
    if (selectedFilter === 'all') return insights;
    if (selectedFilter === 'sleep') return insights.filter((i) => i.type.includes('sleep'));
    if (selectedFilter === 'stress') return insights.filter((i) => i.type.includes('stress'));
    if (selectedFilter === 'energy') return insights.filter((i) => i.type.includes('energy'));
    return insights;
  };

  const handleArchive = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setArchivedInsights((prev) => new Set([...prev, id]));
  };

  const filteredInsights = getFilteredInsights().filter((i) => !archivedInsights.has(i.id));

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-3xl font-bold text-foreground">Health Insights</Text>
            <Text className="text-sm text-muted mt-1">AI-powered recommendations</Text>
          </View>
          <Text className="text-2xl">💡</Text>
        </View>

        {/* Filter Tabs */}
        <View className="flex-row gap-2 mb-4">
          {(['all', 'sleep', 'stress', 'energy'] as const).map((filter) => (
            <Pressable
              key={filter}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                setSelectedFilter(filter);
              }}
              style={({ pressed }) => [
                {
                  paddingVertical: 8,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: selectedFilter === filter ? colors.primary : colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: selectedFilter === filter ? colors.background : colors.foreground }}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Insights List */}
        {filteredInsights.length > 0 ? (
          filteredInsights.map((insight) => {
            const confidenceBadge = getConfidenceBadge(insight.confidence);
            return (
              <View
                key={insight.id}
                className="rounded-lg p-4 mb-3"
                style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
              >
                {/* Header */}
                <View className="flex-row items-start justify-between mb-2">
                  <View className="flex-row items-start gap-3 flex-1">
                    <Text className="text-2xl">{insight.icon}</Text>
                    <View className="flex-1">
                      <Text className="text-sm font-semibold text-foreground">
                        {insight.title}
                      </Text>
                      <View
                        className="px-2 py-1 rounded-full mt-1"
                        style={{ backgroundColor: confidenceBadge.color + '30', alignSelf: 'flex-start' }}
                      >
                        <Text className="text-xs font-semibold" style={{ color: confidenceBadge.color }}>
                          {confidenceBadge.label}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <Pressable
                    onPress={() => handleArchive(insight.id)}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
                  >
                    <Text className="text-lg">✕</Text>
                  </Pressable>
                </View>

                {/* Description */}
                <Text className="text-sm text-muted mb-3">{insight.description}</Text>

                {/* Action Items */}
                <View className="bg-background rounded-lg p-3">
                  <Text className="text-xs font-semibold text-foreground mb-2">What you can do:</Text>
                  {insight.actionItems.map((action, index) => (
                    <View key={index} className="flex-row gap-2 mb-1">
                      <Text className="text-xs text-muted">•</Text>
                      <Text className="text-xs text-muted flex-1">{action}</Text>
                    </View>
                  ))}
                </View>

                {/* Confidence Score */}
                <View className="mt-3 pt-3" style={{ borderTopColor: colors.border, borderTopWidth: 1 }}>
                  <View className="flex-row items-center justify-between">
                    <Text className="text-xs text-muted">Confidence Score</Text>
                    <View className="flex-row items-center gap-2">
                      <View
                        className="h-1.5 rounded-full"
                        style={{
                          width: 60,
                          backgroundColor: colors.border,
                        }}
                      >
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${insight.confidence * 100}%`,
                            backgroundColor: confidenceBadge.color,
                          }}
                        />
                      </View>
                      <Text className="text-xs font-semibold text-foreground">
                        {Math.round(insight.confidence * 100)}%
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            );
          })
        ) : (
          <View className="items-center justify-center py-12">
            <Text className="text-2xl mb-2">📭</Text>
            <Text className="text-sm text-muted">No insights yet</Text>
            <Text className="text-xs text-muted mt-1">Keep tracking your habits to unlock insights</Text>
          </View>
        )}

        {/* How Insights Work */}
        <View
          className="rounded-lg p-4 mt-6"
          style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
        >
          <Text className="text-base font-semibold text-foreground mb-3">How Insights Work</Text>
          <View className="gap-2">
            <View className="flex-row gap-2">
              <Text className="text-lg">1️⃣</Text>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">Data Collection</Text>
                <Text className="text-xs text-muted">We track your habits, sleep, and stress levels</Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <Text className="text-lg">2️⃣</Text>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">Analysis</Text>
                <Text className="text-xs text-muted">Our AI identifies patterns and correlations</Text>
              </View>
            </View>
            <View className="flex-row gap-2">
              <Text className="text-lg">3️⃣</Text>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-foreground">Recommendations</Text>
                <Text className="text-xs text-muted">You get personalized, actionable advice</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
