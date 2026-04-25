import { ScrollView, Text, View, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { HealthMetricCard } from '@/components/health/health-metric-card';
import { SleepQualityBadge } from '@/components/health/sleep-quality-badge';
import { StressIndicator } from '@/components/health/stress-indicator';
import { ActivityProgressRing } from '@/components/health/activity-progress-ring';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';

interface HealthMetrics {
  steps: number;
  sleepHours: number;
  sleepQuality: 'excellent' | 'good' | 'fair' | 'poor';
  stressLevel: 'low' | 'medium' | 'high';
  stressScore: number;
  heartRate: number;
  activeEnergy: number;
}

export default function HealthDashboard() {
  const colors = useColors();
  const [metrics, setMetrics] = useState<HealthMetrics>({
    steps: 8234,
    sleepHours: 7.5,
    sleepQuality: 'good',
    stressLevel: 'low',
    stressScore: 28,
    heartRate: 68,
    activeEnergy: 450,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // TODO: Fetch health data from /api/health/data endpoints
    // For now, using mock data
  }, []);

  const handleRefresh = async () => {
    try {
      setLoading(true);
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // TODO: Call /api/health/sync to refresh health data
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));
      
      setLoading(false);
    } catch (error) {
      console.error('Error refreshing health data:', error);
      setLoading(false);
    }
  };

  const handleMetricPress = (metric: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // TODO: Navigate to detailed metric screen
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-3xl font-bold text-foreground">
              Health & Wellness
            </Text>
            <Text className="text-sm text-muted mt-1">
              Today's Overview
            </Text>
          </View>
          <Pressable
            onPress={handleRefresh}
            disabled={loading}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Text className="text-2xl">{loading ? '⏳' : '🔄'}</Text>
          </Pressable>
        </View>

        {/* Sleep Quality */}
        <View className="mb-4">
          <SleepQualityBadge
            quality={metrics.sleepQuality}
            duration={metrics.sleepHours}
            date="Last night"
          />
        </View>

        {/* Stress Level */}
        <View className="mb-4">
          <StressIndicator
            stressLevel={metrics.stressLevel}
            stressScore={metrics.stressScore}
            hrvScore={85}
            trend="improving"
          />
        </View>

        {/* Quick Stats */}
        <Text className="text-base font-semibold text-foreground mb-3">
          Today's Metrics
        </Text>

        {/* Steps */}
        <HealthMetricCard
          title="Steps"
          value={metrics.steps.toLocaleString()}
          unit="steps"
          icon="👟"
          goal={10000}
          status={metrics.steps >= 10000 ? 'good' : metrics.steps >= 7000 ? 'fair' : 'poor'}
          trend={metrics.steps > 7000 ? 'up' : 'stable'}
          trendValue={12}
          onPress={() => handleMetricPress('steps')}
        />

        {/* Heart Rate */}
        <HealthMetricCard
          title="Heart Rate"
          value={metrics.heartRate}
          unit="bpm"
          icon="❤️"
          status={metrics.heartRate >= 60 && metrics.heartRate <= 100 ? 'good' : 'fair'}
          onPress={() => handleMetricPress('heart_rate')}
        />

        {/* Active Energy */}
        <HealthMetricCard
          title="Active Energy"
          value={metrics.activeEnergy}
          unit="kcal"
          icon="🔥"
          goal={500}
          status={metrics.activeEnergy >= 400 ? 'good' : metrics.activeEnergy >= 250 ? 'fair' : 'poor'}
          onPress={() => handleMetricPress('active_energy')}
        />

        {/* Activity Progress Rings */}
        <Text className="text-base font-semibold text-foreground mb-3 mt-4">
          Activity Goals
        </Text>
        <View className="flex-row justify-around mb-6">
          <ActivityProgressRing
            label="Steps"
            current={metrics.steps}
            goal={10000}
            unit="steps"
            color={colors.primary}
            icon="👟"
          />
          <ActivityProgressRing
            label="Exercise"
            current={45}
            goal={60}
            unit="min"
            color={colors.success}
            icon="💪"
          />
          <ActivityProgressRing
            label="Stand"
            current={8}
            goal={12}
            unit="hours"
            color={colors.warning}
            icon="🧍"
          />
        </View>

        {/* Habit Impact */}
        <View
          className="rounded-lg p-4 mb-4"
          style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
        >
          <Text className="text-base font-semibold text-foreground mb-3">
            Habit Impact Today
          </Text>
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-foreground">✅ Morning run</Text>
              <Text className="text-sm font-semibold text-success">+10 XP</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-foreground">✅ 8h sleep</Text>
              <Text className="text-sm font-semibold text-success">+5 XP</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-foreground">❌ Late coffee</Text>
              <Text className="text-sm font-semibold text-error">-3 XP</Text>
            </View>
          </View>
        </View>

        {/* Recommendations */}
        <View
          className="rounded-lg p-4"
          style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
        >
          <Text className="text-base font-semibold text-foreground mb-3">
            Recommendations
          </Text>
          <View className="gap-2">
            <Text className="text-sm text-muted">
              💡 Your sleep quality is improving! Keep maintaining your evening routine.
            </Text>
            <Text className="text-sm text-muted">
              💡 You're 82% towards your daily step goal. A short walk would help!
            </Text>
            <Text className="text-sm text-muted">
              💡 Your stress levels are low. Great job managing your workload today!
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
