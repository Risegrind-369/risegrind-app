import { TouchableOpacity } from "react-native";
import { ScrollView, Text, View, Pressable } from 'react-native';
import { useState } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { StressIndicator } from '@/components/health/stress-indicator';
import { HealthChart } from '@/components/health/health-chart';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';

interface StressRecord {
  date: string;
  stressScore: number;
  hrvScore: number;
  stressLevel: 'low' | 'medium' | 'high';
}

export default function StressTrackingScreen() {
  const colors = useColors();
  const [stressRecords, setStressRecords] = useState<StressRecord[]>([
    { date: 'Mon', stressScore: 35, hrvScore: 65, stressLevel: 'low' },
    { date: 'Tue', stressScore: 52, hrvScore: 48, stressLevel: 'medium' },
    { date: 'Wed', stressScore: 28, hrvScore: 72, stressLevel: 'low' },
    { date: 'Thu', stressScore: 45, hrvScore: 55, stressLevel: 'medium' },
    { date: 'Fri', stressScore: 62, hrvScore: 38, stressLevel: 'high' },
    { date: 'Sat', stressScore: 25, hrvScore: 78, stressLevel: 'low' },
    { date: 'Sun', stressScore: 32, hrvScore: 70, stressLevel: 'low' },
  ]);

  const [selectedTab, setSelectedTab] = useState<'overview' | 'triggers' | 'recommendations'>('overview');

  const currentStress = stressRecords[stressRecords.length - 1];
  const chartData = stressRecords.map((record) => ({
    date: record.date,
    value: record.stressScore,
    label: record.date,
  }));

  const handleTabPress = (tab: typeof selectedTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedTab(tab);
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-3xl font-bold text-foreground">Stress & HRV</Text>
            <Text className="text-sm text-muted mt-1">Monitor your stress levels</Text>
          </View>
          <Text className="text-2xl">😌</Text>
        </View>

        {/* Current Stress */}
        <View className="mb-4">
          <StressIndicator
            stressLevel={currentStress.stressLevel}
            stressScore={currentStress.stressScore}
            hrvScore={currentStress.hrvScore}
            trend="improving"
          />
        </View>

        {/* Tabs */}
        <View className="flex-row gap-2 mb-4">
          {(['overview', 'triggers', 'recommendations'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              onPress={() => handleTabPress(tab)}
              activeOpacity={0.6}
            >
              <Text
                className="text-xs font-semibold text-center"
                style={{ color: selectedTab === tab ? colors.background : colors.foreground }}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Overview Tab */}
        {selectedTab === 'overview' && (
          <>
            {/* Stress Trend Chart */}
            <HealthChart
              title="Stress Score (7 days)"
              data={chartData}
              unit="score"
              color={colors.error}
              maxValue={100}
            />

            {/* HRV Chart */}
            <HealthChart
              title="HRV Score (7 days)"
              data={stressRecords.map((record) => ({
                date: record.date,
                value: record.hrvScore,
                label: record.date,
              }))}
              unit="ms"
              color={colors.success}
              maxValue={100}
            />

            {/* Weekly Stats */}
            <View
              className="rounded-lg p-4"
              style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
            >
              <Text className="text-base font-semibold text-foreground mb-3">Weekly Stats</Text>
              <View className="gap-3">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted">Average Stress</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {Math.round(stressRecords.reduce((sum, r) => sum + r.stressScore, 0) / stressRecords.length)}
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted">Low Stress Days</Text>
                  <Text className="text-sm font-semibold text-success">
                    {stressRecords.filter((r) => r.stressLevel === 'low').length}/7
                  </Text>
                </View>
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted">Average HRV</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {Math.round(stressRecords.reduce((sum, r) => sum + r.hrvScore, 0) / stressRecords.length)} ms
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Triggers Tab */}
        {selectedTab === 'triggers' && (
          <View
            className="rounded-lg p-4"
            style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
          >
            <Text className="text-base font-semibold text-foreground mb-3">Stress Triggers</Text>
            <View className="gap-3">
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Work Meetings</Text>
                  <Text className="text-xs text-muted">High frequency, High impact</Text>
                </View>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: colors.error + '30' }}
                >
                  <Text className="text-xs font-semibold" style={{ color: colors.error }}>
                    High
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Skipped Morning Routine</Text>
                  <Text className="text-xs text-muted">Medium frequency, Medium impact</Text>
                </View>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: colors.warning + '30' }}
                >
                  <Text className="text-xs font-semibold" style={{ color: colors.warning }}>
                    Medium
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Late Night Work</Text>
                  <Text className="text-xs text-muted">Medium frequency, High impact</Text>
                </View>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: colors.error + '30' }}
                >
                  <Text className="text-xs font-semibold" style={{ color: colors.error }}>
                    High
                  </Text>
                </View>
              </View>

              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Caffeine After 3 PM</Text>
                  <Text className="text-xs text-muted">Low frequency, Medium impact</Text>
                </View>
                <View
                  className="px-3 py-1 rounded-full"
                  style={{ backgroundColor: colors.warning + '30' }}
                >
                  <Text className="text-xs font-semibold" style={{ color: colors.warning }}>
                    Medium
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Recommendations Tab */}
        {selectedTab === 'recommendations' && (
          <View
            className="rounded-lg p-4"
            style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
          >
            <Text className="text-base font-semibold text-foreground mb-3">Stress Management</Text>
            <View className="gap-3">
              <View className="flex-row gap-3">
                <Text className="text-2xl">🧘</Text>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Meditation</Text>
                  <Text className="text-xs text-muted">10 minutes daily</Text>
                  <Text className="text-xs text-muted mt-1">Reduces stress by 15-20%</Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <Text className="text-2xl">🏃</Text>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Exercise</Text>
                  <Text className="text-xs text-muted">30 minutes, 3-4 times weekly</Text>
                  <Text className="text-xs text-muted mt-1">Improves HRV and mood</Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <Text className="text-2xl">📝</Text>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Journaling</Text>
                  <Text className="text-xs text-muted">10 minutes before bed</Text>
                  <Text className="text-xs text-muted mt-1">Process emotions and stress</Text>
                </View>
              </View>

              <View className="flex-row gap-3">
                <Text className="text-2xl">🫁</Text>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">Deep Breathing</Text>
                  <Text className="text-xs text-muted">5 minutes, 2-3 times daily</Text>
                  <Text className="text-xs text-muted mt-1">Instant stress relief</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
