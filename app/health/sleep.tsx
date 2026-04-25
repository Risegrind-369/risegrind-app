import { ScrollView, Text, View, Pressable, TextInput } from 'react-native';
import { useState } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { HealthChart } from '@/components/health/health-chart';
import { SleepQualityBadge } from '@/components/health/sleep-quality-badge';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';

interface SleepRecord {
  date: string;
  duration: number;
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  deepSleep: number;
  remSleep: number;
  lightSleep: number;
  interruptions: number;
}

export default function SleepTrackingScreen() {
  const colors = useColors();
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([
    { date: 'Mon', duration: 7.5, quality: 'good', deepSleep: 1.5, remSleep: 2, lightSleep: 4, interruptions: 1 },
    { date: 'Tue', duration: 6.8, quality: 'fair', deepSleep: 1.2, remSleep: 1.8, lightSleep: 3.8, interruptions: 2 },
    { date: 'Wed', duration: 8.2, quality: 'excellent', deepSleep: 2, remSleep: 2.5, lightSleep: 3.7, interruptions: 0 },
    { date: 'Thu', duration: 7.1, quality: 'good', deepSleep: 1.4, remSleep: 2.1, lightSleep: 3.6, interruptions: 1 },
    { date: 'Fri', duration: 6.5, quality: 'fair', deepSleep: 1.1, remSleep: 1.7, lightSleep: 3.7, interruptions: 3 },
    { date: 'Sat', duration: 8.5, quality: 'excellent', deepSleep: 2.1, remSleep: 2.6, lightSleep: 3.8, interruptions: 0 },
    { date: 'Sun', duration: 7.8, quality: 'good', deepSleep: 1.6, remSleep: 2.3, lightSleep: 3.9, interruptions: 1 },
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [quality, setQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');

  const handleAddSleep = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      // TODO: Call /api/health/sleep/record to save sleep data
      // For now, just close the form
      setShowAddForm(false);
      setStartTime('');
      setEndTime('');
    } catch (error) {
      console.error('Error adding sleep record:', error);
    }
  };

  const chartData = sleepRecords.map((record) => ({
    date: record.date,
    value: record.duration,
    label: record.date,
  }));

  const averageSleep = (sleepRecords.reduce((sum, r) => sum + r.duration, 0) / sleepRecords.length).toFixed(1);
  const averageQuality = sleepRecords.filter((r) => r.quality === 'excellent' || r.quality === 'good').length / sleepRecords.length;

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-3xl font-bold text-foreground">Sleep</Text>
            <Text className="text-sm text-muted mt-1">Track your sleep quality</Text>
          </View>
          <Pressable
            onPress={() => setShowAddForm(!showAddForm)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
          >
            <Text className="text-2xl">{showAddForm ? '❌' : '➕'}</Text>
          </Pressable>
        </View>

        {/* Add Sleep Form */}
        {showAddForm && (
          <View
            className="rounded-lg p-4 mb-4"
            style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
          >
            <Text className="text-base font-semibold text-foreground mb-3">Log Sleep</Text>

            <View className="gap-3">
              <View>
                <Text className="text-sm text-muted mb-1">Start Time (HH:MM)</Text>
                <TextInput
                  placeholder="22:30"
                  value={startTime}
                  onChangeText={setStartTime}
                  className="bg-background border border-border rounded-lg p-3 text-foreground"
                  placeholderTextColor={colors.muted}
                />
              </View>

              <View>
                <Text className="text-sm text-muted mb-1">End Time (HH:MM)</Text>
                <TextInput
                  placeholder="06:30"
                  value={endTime}
                  onChangeText={setEndTime}
                  className="bg-background border border-border rounded-lg p-3 text-foreground"
                  placeholderTextColor={colors.muted}
                />
              </View>

              <View>
                <Text className="text-sm text-muted mb-2">Quality</Text>
                <View className="flex-row gap-2">
                  {(['poor', 'fair', 'good', 'excellent'] as const).map((q) => (
                    <Pressable
                      key={q}
                      onPress={() => setQuality(q)}
                      style={({ pressed }) => [
                        {
                          flex: 1,
                          paddingVertical: 8,
                          borderRadius: 8,
                          backgroundColor: quality === q ? colors.primary : colors.border,
                          opacity: pressed ? 0.7 : 1,
                        },
                      ]}
                    >
                      <Text
                        className="text-xs font-semibold text-center"
                        style={{ color: quality === q ? colors.background : colors.foreground }}
                      >
                        {q.charAt(0).toUpperCase() + q.slice(1)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <Pressable
                onPress={handleAddSleep}
                style={({ pressed }) => [
                  {
                    backgroundColor: colors.primary,
                    paddingVertical: 12,
                    borderRadius: 8,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text className="text-center text-white font-semibold">Save Sleep</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Latest Sleep */}
        {sleepRecords.length > 0 && (
          <View className="mb-4">
            <Text className="text-base font-semibold text-foreground mb-2">Last Night</Text>
            <SleepQualityBadge
              quality={sleepRecords[sleepRecords.length - 1].quality}
              duration={sleepRecords[sleepRecords.length - 1].duration}
              date={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            />
          </View>
        )}

        {/* Sleep Trend Chart */}
        <HealthChart
          title="Sleep Duration (7 days)"
          data={chartData}
          unit="hours"
          color={colors.primary}
          maxValue={10}
        />

        {/* Sleep Stats */}
        <View
          className="rounded-lg p-4 mb-4"
          style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
        >
          <Text className="text-base font-semibold text-foreground mb-3">Weekly Stats</Text>
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted">Average Sleep</Text>
              <Text className="text-sm font-semibold text-foreground">{averageSleep}h</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted">Good Quality Nights</Text>
              <Text className="text-sm font-semibold text-foreground">
                {Math.round(averageQuality * 100)}%
              </Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-muted">Average Deep Sleep</Text>
              <Text className="text-sm font-semibold text-foreground">
                {(sleepRecords.reduce((sum, r) => sum + r.deepSleep, 0) / sleepRecords.length).toFixed(1)}h
              </Text>
            </View>
          </View>
        </View>

        {/* Sleep Correlations */}
        <View
          className="rounded-lg p-4"
          style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
        >
          <Text className="text-base font-semibold text-foreground mb-3">Sleep Correlations</Text>
          <View className="gap-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-foreground">📈 Evening meditation</Text>
              <Text className="text-sm font-semibold text-success">+0.85</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-foreground">📈 No screens after 9 PM</Text>
              <Text className="text-sm font-semibold text-success">+0.78</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-foreground">📉 Late coffee</Text>
              <Text className="text-sm font-semibold text-error">-0.72</Text>
            </View>
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-foreground">📉 Heavy dinner</Text>
              <Text className="text-sm font-semibold text-error">-0.65</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
