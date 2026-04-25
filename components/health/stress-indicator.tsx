import { View, Text } from 'react-native';
import { useColors } from '@/hooks/use-colors';

export interface StressIndicatorProps {
  stressLevel: 'low' | 'medium' | 'high';
  stressScore: number; // 0-100
  hrvScore?: number;
  trend?: 'improving' | 'stable' | 'worsening';
}

export function StressIndicator({
  stressLevel,
  stressScore,
  hrvScore,
  trend,
}: StressIndicatorProps) {
  const colors = useColors();

  const getStressColor = () => {
    switch (stressLevel) {
      case 'low':
        return colors.success;
      case 'medium':
        return colors.warning;
      case 'high':
        return colors.error;
    }
  };

  const getStressIcon = () => {
    switch (stressLevel) {
      case 'low':
        return '😌';
      case 'medium':
        return '😟';
      case 'high':
        return '😰';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'improving':
        return '📈 Improving';
      case 'stable':
        return '➡️ Stable';
      case 'worsening':
        return '📉 Worsening';
      default:
        return null;
    }
  };

  return (
    <View
      className="rounded-lg p-4"
      style={{
        backgroundColor: getStressColor() + '15',
        borderColor: getStressColor(),
        borderWidth: 1,
      }}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text className="text-sm text-muted mb-1">Stress Level</Text>
          <Text
            className="text-2xl font-bold"
            style={{ color: getStressColor() }}
          >
            {stressLevel.charAt(0).toUpperCase() + stressLevel.slice(1)}
          </Text>
        </View>
        <Text className="text-4xl">{getStressIcon()}</Text>
      </View>

      {/* Stress Score Bar */}
      <View className="mb-3">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-xs text-muted">Stress Score</Text>
          <Text className="text-sm font-semibold text-foreground">
            {stressScore}/100
          </Text>
        </View>
        <View
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: colors.border }}
        >
          <View
            className="h-full rounded-full"
            style={{
              width: `${stressScore}%`,
              backgroundColor: getStressColor(),
            }}
          />
        </View>
      </View>

      {/* HRV Score */}
      {hrvScore !== undefined && (
        <View className="mb-3 pb-3 border-b" style={{ borderColor: colors.border }}>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-muted">HRV Score</Text>
            <Text className="text-sm font-semibold text-foreground">
              {hrvScore} ms
            </Text>
          </View>
        </View>
      )}

      {/* Trend */}
      {trend && (
        <View className="flex-row items-center gap-1">
          <Text className="text-xs text-muted">{getTrendIcon()}</Text>
        </View>
      )}
    </View>
  );
}
