import { View, Text, ScrollView, Pressable } from 'react-native';
import { useColors } from '@/hooks/use-colors';

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface HealthChartProps {
  title: string;
  data: ChartDataPoint[];
  unit: string;
  color?: string;
  maxValue?: number;
  onDateRangeChange?: (range: '7d' | '30d' | '90d') => void;
}

export function HealthChart({
  title,
  data,
  unit,
  color,
  maxValue,
  onDateRangeChange,
}: HealthChartProps) {
  const colors = useColors();
  const chartColor = color || colors.primary;

  // Calculate max value if not provided
  const max = maxValue || Math.max(...data.map((d) => d.value), 1);
  const min = Math.min(...data.map((d) => d.value), 0);
  const range = max - min || 1;

  // Normalize data for chart display
  const normalizedData = data.map((d) => ({
    ...d,
    normalized: ((d.value - min) / range) * 100,
  }));

  const chartHeight = 120;
  const barWidth = Math.max(20, 240 / data.length);

  return (
    <View className="bg-surface rounded-lg p-4 mb-4">
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-base font-semibold text-foreground">
          {title}
        </Text>
        {onDateRangeChange && (
          <View className="flex-row gap-1">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <Pressable
                key={range}
                onPress={() => onDateRangeChange(range)}
                style={({ pressed }) => [
                  {
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 6,
                    backgroundColor: pressed ? colors.border : 'transparent',
                    opacity: pressed ? 0.7 : 1,
                  },
                ]}
              >
                <Text className="text-xs text-muted">{range}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </View>

      {/* Chart */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="mb-4"
      >
        <View
          className="flex-row items-end gap-1"
          style={{ height: chartHeight, paddingVertical: 8 }}
        >
          {normalizedData.map((point, index) => (
            <View
              key={index}
              className="items-center"
              style={{ width: barWidth }}
            >
              {/* Bar */}
              <View
                className="rounded-t-md w-full"
                style={{
                  height: (point.normalized / 100) * (chartHeight - 16),
                  backgroundColor: chartColor,
                  opacity: 0.8,
                  minHeight: 2,
                }}
              />
              {/* Label */}
              <Text className="text-xs text-muted mt-1">
                {point.label || point.date.slice(-2)}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Stats */}
      <View className="flex-row justify-around pt-3 border-t" style={{ borderColor: colors.border }}>
        <View className="items-center">
          <Text className="text-xs text-muted mb-1">Average</Text>
          <Text className="text-sm font-semibold text-foreground">
            {(data.reduce((sum, d) => sum + d.value, 0) / data.length).toFixed(1)} {unit}
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-xs text-muted mb-1">Highest</Text>
          <Text className="text-sm font-semibold text-foreground">
            {Math.max(...data.map((d) => d.value))} {unit}
          </Text>
        </View>
        <View className="items-center">
          <Text className="text-xs text-muted mb-1">Lowest</Text>
          <Text className="text-sm font-semibold text-foreground">
            {Math.min(...data.map((d) => d.value))} {unit}
          </Text>
        </View>
      </View>
    </View>
  );
}
