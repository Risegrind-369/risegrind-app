import { ScrollView, Text, View, Pressable } from 'react-native';
import { useState } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { StreakRiskGauge } from '@/components/analytics/streak-risk-gauge';
import { HabitCorrelationCard } from '@/components/analytics/habit-correlation-card';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';

interface StreakRisk {
  habitId: string;
  habitName: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
}

interface HabitCorrelation {
  habit1: string;
  habit2: string;
  correlation: number;
  type: 'positive' | 'negative' | 'neutral';
  description: string;
}

export default function AnalyticsDashboard() {
  const colors = useColors();
  const [selectedTab, setSelectedTab] = useState<'risks' | 'correlations' | 'patterns'>('risks');

  // Mock data
  const streakRisks: StreakRisk[] = [
    {
      habitId: '1',
      habitName: 'Morning Run',
      riskScore: 25,
      riskLevel: 'low',
      recommendations: ['Keep it up!', 'You\'re doing great'],
    },
    {
      habitId: '2',
      habitName: 'Meditation',
      riskScore: 55,
      riskLevel: 'medium',
      recommendations: ['Set a reminder', 'Try a shorter session'],
    },
    {
      habitId: '3',
      habitName: 'Reading',
      riskScore: 72,
      riskLevel: 'high',
      recommendations: ['Reach out to accountability partner', 'Review why you started'],
    },
  ];

  const habitCorrelations: HabitCorrelation[] = [
    {
      habit1: 'Morning Run',
      habit2: 'Cold Shower',
      correlation: 0.78,
      type: 'positive',
      description: 'These habits naturally go together. Stack them for maximum impact!',
    },
    {
      habit1: 'Late Work',
      habit2: 'Meditation',
      correlation: -0.65,
      type: 'negative',
      description: 'These habits conflict. Try doing meditation before work instead.',
    },
    {
      habit1: 'Morning Run',
      habit2: 'Healthy Breakfast',
      correlation: 0.72,
      type: 'positive',
      description: 'Running boosts appetite for healthy food. Great combination!',
    },
  ];

  const successPatterns = [
    {
      habitName: 'Morning Run',
      optimalTime: 'morning',
      successRate: 92,
      successByTime: { morning: 92, afternoon: 45, evening: 30 },
    },
    {
      habitName: 'Meditation',
      optimalTime: 'evening',
      successRate: 78,
      successByTime: { morning: 65, afternoon: 55, evening: 78 },
    },
    {
      habitName: 'Reading',
      optimalTime: 'evening',
      successRate: 68,
      successByTime: { morning: 40, afternoon: 50, evening: 68 },
    },
  ];

  const handleTabPress = (tab: typeof selectedTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTab(tab);
  };

  const highRiskCount = streakRisks.filter((r) => r.riskLevel === 'high').length;
  const positiveCorrelations = habitCorrelations.filter((c) => c.type === 'positive');

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-3xl font-bold text-foreground">Analytics</Text>
            <Text className="text-sm text-muted mt-1">Insights & Patterns</Text>
          </View>
          <Text className="text-2xl">📊</Text>
        </View>

        {/* Quick Stats */}
        <View className="flex-row gap-3 mb-6">
          <View
            className="flex-1 rounded-lg p-3"
            style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
          >
            <Text className="text-2xl font-bold text-foreground">{streakRisks.length}</Text>
            <Text className="text-xs text-muted mt-1">Tracked Habits</Text>
          </View>
          <View
            className="flex-1 rounded-lg p-3"
            style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
          >
            <Text className="text-2xl font-bold text-success">{positiveCorrelations.length}</Text>
            <Text className="text-xs text-muted mt-1">Positive Pairs</Text>
          </View>
          <View
            className="flex-1 rounded-lg p-3"
            style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
          >
            <Text className="text-2xl font-bold text-error">{highRiskCount}</Text>
            <Text className="text-xs text-muted mt-1">At Risk</Text>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row gap-2 mb-4">
          {(['risks', 'correlations', 'patterns'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => handleTabPress(tab)}
              style={({ pressed }) => [
                {
                  flex: 1,
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: selectedTab === tab ? colors.primary : colors.surface,
                  borderColor: colors.border,
                  borderWidth: 1,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <Text
                className="text-xs font-semibold text-center"
                style={{ color: selectedTab === tab ? colors.background : colors.foreground }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* Streak Break Risks Tab */}
        {selectedTab === 'risks' && (
          <>
            <Text className="text-base font-semibold text-foreground mb-3">Streak Break Risk</Text>
            {streakRisks.map((risk) => (
              <StreakRiskGauge
                key={risk.habitId}
                riskScore={risk.riskScore}
                riskLevel={risk.riskLevel}
                habitName={risk.habitName}
              />
            ))}

            {/* Risk Breakdown */}
            <View
              className="rounded-lg p-4 mt-4"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
            >
              <Text className="text-base font-semibold text-foreground mb-3">Risk Factors</Text>
              <View className="gap-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-foreground">Recent Completion Rate</Text>
                  <Text className="text-sm font-semibold text-warning">68%</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-foreground">Stress Level</Text>
                  <Text className="text-sm font-semibold text-error">High</Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-foreground">Sleep Quality</Text>
                  <Text className="text-sm font-semibold text-success">Good</Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Habit Correlations Tab */}
        {selectedTab === 'correlations' && (
          <>
            <Text className="text-base font-semibold text-foreground mb-3">Habit Correlations</Text>
            {habitCorrelations.map((corr, index) => (
              <HabitCorrelationCard
                key={index}
                habit1={corr.habit1}
                habit2={corr.habit2}
                correlation={corr.correlation}
                type={corr.type}
                description={corr.description}
              />
            ))}

            {/* Stacking Recommendations */}
            <View
              className="rounded-lg p-4 mt-4"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
            >
              <Text className="text-base font-semibold text-foreground mb-3">Recommended Stacks</Text>
              <View className="gap-2">
                <View className="flex-row items-center gap-2">
                  <Text className="text-2xl">🔗</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">Morning Run + Cold Shower</Text>
                    <Text className="text-xs text-muted">Do back-to-back for 78% correlation boost</Text>
                  </View>
                </View>
                <View className="flex-row items-center gap-2">
                  <Text className="text-2xl">🔗</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">Morning Run + Healthy Breakfast</Text>
                    <Text className="text-xs text-muted">Natural follow-up with 72% correlation</Text>
                  </View>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Success Patterns Tab */}
        {selectedTab === 'patterns' && (
          <>
            <Text className="text-base font-semibold text-foreground mb-3">Success Patterns</Text>
            {successPatterns.map((pattern) => (
              <View
                key={pattern.habitName}
                className="rounded-lg p-4 mb-3"
                style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
              >
                {/* Habit Name */}
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="text-sm font-semibold text-foreground">{pattern.habitName}</Text>
                  <View
                    className="px-2 py-1 rounded-full"
                    style={{ backgroundColor: colors.success + '30' }}
                  >
                    <Text className="text-xs font-semibold" style={{ color: colors.success }}>
                      {pattern.successRate}%
                    </Text>
                  </View>
                </View>

                {/* Time of Day Breakdown */}
                <View className="gap-2">
                  {Object.entries(pattern.successByTime).map(([time, rate]) => (
                    <View key={time} className="flex-row items-center gap-2">
                      <Text className="text-xs text-muted w-16 capitalize">{time}</Text>
                      <View
                        className="h-2 flex-1 rounded-full"
                        style={{ backgroundColor: colors.border }}
                      >
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${rate}%`,
                            backgroundColor: rate > 70 ? colors.success : rate > 50 ? colors.warning : colors.error,
                          }}
                        />
                      </View>
                      <Text className="text-xs text-muted w-8 text-right">{rate}%</Text>
                    </View>
                  ))}
                </View>

                {/* Optimal Time */}
                <Text className="text-xs text-success mt-3">
                  ✓ Best time: {pattern.optimalTime.charAt(0).toUpperCase() + pattern.optimalTime.slice(1)}
                </Text>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
