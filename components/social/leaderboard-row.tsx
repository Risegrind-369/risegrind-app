import { TouchableOpacity } from "react-native";
import { View, Text, Pressable } from 'react-native';
import { useColors } from '@/hooks/use-colors';

export interface LeaderboardRowProps {
  rank: number;
  userName: string;
  consistencyScore: number;
  currentStreak: number;
  isCurrentUser?: boolean;
  rankChange?: number; // positive = up, negative = down
  onPress?: () => void;
}

export function LeaderboardRow({
  rank,
  userName,
  consistencyScore,
  currentStreak,
  isCurrentUser = false,
  rankChange,
  onPress,
}: LeaderboardRowProps) {
  const colors = useColors();

  const getRankMedal = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankChangeColor = () => {
    if (!rankChange) return colors.muted;
    if (rankChange > 0) return colors.success;
    if (rankChange < 0) return colors.error;
    return colors.muted;
  };

  const getRankChangeLabel = () => {
    if (!rankChange) return null;
    if (rankChange > 0) return `↑ ${rankChange}`;
    if (rankChange < 0) return `↓ ${Math.abs(rankChange)}`;
    return '→';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View className="flex-row items-center gap-3">
        {/* Rank Medal */}
        <View className="w-12 items-center">
          <Text className="text-lg font-bold text-foreground">
            {getRankMedal(rank)}
          </Text>
        </View>

        {/* User Info */}
        <View className="flex-1">
          <Text
            className={cn(
              'font-semibold mb-1',
              isCurrentUser ? 'text-primary' : 'text-foreground'
            )}
            numberOfLines={1}
          >
            {userName}
            {isCurrentUser && ' (You)'}
          </Text>
          <View className="flex-row items-center gap-2">
            <Text className="text-xs text-muted">
              🔥 {currentStreak}d streak
            </Text>
            <View
              className="h-1 w-1 rounded-full"
              style={{ backgroundColor: colors.muted }}
            />
            <Text className="text-xs text-muted">
              {consistencyScore}% consistency
            </Text>
          </View>
        </View>

        {/* Rank Change */}
        {rankChange !== undefined && (
          <View className="items-end">
            <Text
              className="text-sm font-semibold"
              style={{ color: getRankChangeColor() }}
            >
              {getRankChangeLabel()}
            </Text>
          </View>
        )}

        {/* Consistency Score Bar */}
        <View className="w-16 items-end">
          <View
            className="h-2 w-full rounded-full overflow-hidden mb-1"
            style={{ backgroundColor: colors.border }}
          >
            <View
              className="h-full rounded-full"
              style={{
                width: `${consistencyScore}%`,
                backgroundColor: colors.primary,
              }}
            />
          </View>
          <Text className="text-xs font-semibold text-foreground">
            {consistencyScore}%
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
