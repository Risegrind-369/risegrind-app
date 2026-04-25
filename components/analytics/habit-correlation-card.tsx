import { View, Text } from 'react-native';
import { useColors } from '@/hooks/use-colors';

export interface HabitCorrelationCardProps {
  habit1: string;
  habit2: string;
  correlation: number; // -1 to 1
  type: 'positive' | 'negative' | 'neutral';
  description: string;
}

export function HabitCorrelationCard({
  habit1,
  habit2,
  correlation,
  type,
  description,
}: HabitCorrelationCardProps) {
  const colors = useColors();

  const getCorrelationIcon = () => {
    if (type === 'positive') return '🔗';
    if (type === 'negative') return '⚠️';
    return '➖';
  };

  const getCorrelationColor = () => {
    if (type === 'positive') return colors.success;
    if (type === 'negative') return colors.error;
    return colors.muted;
  };

  const correlationStrength = Math.abs(correlation);
  const strengthLabel = correlationStrength > 0.7 ? 'Strong' : correlationStrength > 0.4 ? 'Moderate' : 'Weak';

  return (
    <View
      className="rounded-lg p-4 mb-3"
      style={{ backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }}
    >
      {/* Header */}
      <View className="flex-row items-center gap-2 mb-2">
        <Text className="text-2xl">{getCorrelationIcon()}</Text>
        <View className="flex-1">
          <Text className="text-sm font-semibold text-foreground">
            {habit1} ↔ {habit2}
          </Text>
          <Text className="text-xs" style={{ color: getCorrelationColor() }}>
            {strengthLabel} {type} correlation
          </Text>
        </View>
      </View>

      {/* Description */}
      <Text className="text-sm text-muted mb-3">
        {description}
      </Text>

      {/* Correlation Strength Bar */}
      <View className="flex-row items-center gap-2">
        <View
          className="h-1 flex-1 rounded-full"
          style={{ backgroundColor: colors.border }}
        >
          <View
            className="h-full rounded-full"
            style={{
              width: `${correlationStrength * 100}%`,
              backgroundColor: getCorrelationColor(),
            }}
          />
        </View>
        <Text className="text-xs text-muted w-8">
          {(correlation * 100).toFixed(0)}%
        </Text>
      </View>
    </View>
  );
}
