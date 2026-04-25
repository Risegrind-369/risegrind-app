import { View, Text } from 'react-native';
import { useColors } from '@/hooks/use-colors';

export interface SleepQualityBadgeProps {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  duration: number; // hours
  date?: string;
}

export function SleepQualityBadge({
  quality,
  duration,
  date,
}: SleepQualityBadgeProps) {
  const colors = useColors();

  const getQualityColor = () => {
    switch (quality) {
      case 'excellent':
        return colors.success;
      case 'good':
        return '#4ECDC4';
      case 'fair':
        return colors.warning;
      case 'poor':
        return colors.error;
    }
  };

  const getQualityIcon = () => {
    switch (quality) {
      case 'excellent':
        return '😴';
      case 'good':
        return '😊';
      case 'fair':
        return '😐';
      case 'poor':
        return '😩';
    }
  };

  const getQualityLabel = () => {
    return quality.charAt(0).toUpperCase() + quality.slice(1);
  };

  return (
    <View
      className="rounded-lg p-4 flex-row items-center justify-between"
      style={{ backgroundColor: getQualityColor() + '15', borderColor: getQualityColor(), borderWidth: 1 }}
    >
      <View className="flex-1">
        <Text className="text-sm text-muted mb-1">Sleep Quality</Text>
        <View className="flex-row items-baseline gap-2">
          <Text className="text-2xl font-bold text-foreground">
            {duration}h
          </Text>
          <View
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: getQualityColor() + '30' }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: getQualityColor() }}
            >
              {getQualityLabel()}
            </Text>
          </View>
        </View>
        {date && (
          <Text className="text-xs text-muted mt-1">{date}</Text>
        )}
      </View>
      <Text className="text-4xl">{getQualityIcon()}</Text>
    </View>
  );
}
