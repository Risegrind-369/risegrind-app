import { TouchableOpacity } from "react-native";
import { View, Text, Pressable } from 'react-native';
import { useColors } from '@/hooks/use-colors';

export interface HealthMetricCardProps {
  title: string;
  value: number | string;
  unit: string;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: number;
  status?: 'good' | 'fair' | 'poor';
  goal?: number;
  onPress?: () => void;
}

export function HealthMetricCard({
  title,
  value,
  unit,
  icon,
  trend,
  trendValue,
  status = 'good',
  goal,
  onPress,
}: HealthMetricCardProps) {
  const colors = useColors();

  const getStatusColor = () => {
    switch (status) {
      case 'good':
        return colors.success;
      case 'fair':
        return colors.warning;
      case 'poor':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return '📈';
      case 'down':
        return '📉';
      case 'stable':
        return '➡️';
      default:
        return null;
    }
  };

  const getProgressPercentage = () => {
    if (!goal || typeof value !== 'number') return 0;
    return Math.min(100, (value / goal) * 100);
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-sm text-muted mb-1">{title}</Text>
          <View className="flex-row items-baseline gap-1">
            <Text className="text-3xl font-bold text-foreground">
              {value}
            </Text>
            <Text className="text-sm text-muted">{unit}</Text>
          </View>
        </View>
        <View className="text-2xl">{icon}</View>
      </View>

      {/* Status Indicator */}
      {status && (
        <View className="mb-3">
          <View
            className="h-1 rounded-full overflow-hidden"
            style={{ backgroundColor: colors.border }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${getProgressPercentage()}%`,
                backgroundColor: getStatusColor(),
              }}
            />
          </View>
        </View>
      )}

      {/* Trend & Goal */}
      <View className="flex-row items-center justify-between">
        {trend && trendValue !== undefined && (
          <View className="flex-row items-center gap-1">
            <Text className="text-lg">{getTrendIcon()}</Text>
            <Text className="text-xs text-muted">
              {trendValue > 0 ? '+' : ''}{trendValue}%
            </Text>
          </View>
        )}
        {goal && (
          <Text className="text-xs text-muted">
            Goal: {goal} {unit}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
}
