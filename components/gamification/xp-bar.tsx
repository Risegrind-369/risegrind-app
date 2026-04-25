import { View, Text } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

interface XpBarProps {
  currentXp: number;
  xpToNextLevel: number;
  currentLevel: number;
  className?: string;
}

export function XpBar({ currentXp, xpToNextLevel, currentLevel, className }: XpBarProps) {
  const colors = useColors();
  const totalXpForLevel = currentXp + xpToNextLevel;
  const progressPercent = (currentXp / totalXpForLevel) * 100;

  return (
    <View className={cn('gap-2', className)}>
      {/* Level header */}
      <View className="flex-row justify-between items-center">
        <Text className="text-sm font-semibold text-foreground">
          Level {currentLevel}
        </Text>
        <Text className="text-xs text-muted">
          {currentXp} / {totalXpForLevel} XP
        </Text>
      </View>

      {/* Progress bar */}
      <View
        className="h-2 bg-surface rounded-full overflow-hidden border border-border"
        style={{ backgroundColor: colors.surface }}
      >
        <View
          className="h-full bg-primary rounded-full"
          style={{
            width: `${progressPercent}%`,
            backgroundColor: colors.primary,
          }}
        />
      </View>

      {/* Next level info */}
      <Text className="text-xs text-muted">
        {xpToNextLevel} XP to Level {currentLevel + 1}
      </Text>
    </View>
  );
}
