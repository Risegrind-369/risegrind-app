import { View, Text } from 'react-native';
import { useColors } from '@/hooks/use-colors';

export interface ActivityProgressRingProps {
  label: string;
  current: number;
  goal: number;
  unit: string;
  color?: string;
  icon: string;
}

export function ActivityProgressRing({
  label,
  current,
  goal,
  unit,
  color,
  icon,
}: ActivityProgressRingProps) {
  const colors = useColors();
  const percentage = Math.min(100, (current / goal) * 100);
  const ringColor = color || colors.primary;

  return (
    <View className="items-center">
      {/* Ring Container */}
      <View className="relative w-24 h-24 items-center justify-center mb-2">
        {/* Background Ring */}
        <View
          className="absolute w-24 h-24 rounded-full"
          style={{
            borderWidth: 4,
            borderColor: colors.border,
          }}
        />

        {/* Progress Ring */}
        <View
          className="absolute w-24 h-24 rounded-full"
          style={{
            borderWidth: 4,
            borderColor: ringColor,
            borderRightColor: colors.border,
            borderBottomColor: colors.border,
            transform: [{ rotate: `${(percentage / 100) * 360}deg` }],
          }}
        />

        {/* Center Content */}
        <View className="items-center">
          <Text className="text-2xl mb-1">{icon}</Text>
          <Text className="text-lg font-bold text-foreground">
            {percentage.toFixed(0)}%
          </Text>
        </View>
      </View>

      {/* Label */}
      <Text className="text-sm font-semibold text-foreground mb-1">
        {label}
      </Text>
      <Text className="text-xs text-muted">
        {current} / {goal} {unit}
      </Text>
    </View>
  );
}
