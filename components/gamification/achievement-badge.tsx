import { View, Text, Pressable } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

type Rarity = 'common' | 'rare' | 'epic' | 'legendary';

interface AchievementBadgeProps {
  name: string;
  description: string;
  icon: string;
  rarity: Rarity;
  isUnlocked: boolean;
  unlockedAt?: Date;
  onPress?: () => void;
  className?: string;
}

const RARITY_CONFIG: Record<Rarity, { color: string; borderColor: string; label: string }> = {
  common: { color: 'bg-gray-400', borderColor: 'border-gray-400', label: 'Common' },
  rare: { color: 'bg-blue-400', borderColor: 'border-blue-400', label: 'Rare' },
  epic: { color: 'bg-purple-500', borderColor: 'border-purple-500', label: 'Epic' },
  legendary: { color: 'bg-yellow-500', borderColor: 'border-yellow-500', label: 'Legendary' },
};

export function AchievementBadge({
  name,
  description,
  icon,
  rarity,
  isUnlocked,
  unlockedAt,
  onPress,
  className,
}: AchievementBadgeProps) {
  const colors = useColors();
  const config = RARITY_CONFIG[rarity];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
          transform: [{ scale: pressed ? 0.95 : 1 }],
        },
      ]}
    >
      <View
        className={cn(
          'items-center gap-2 p-4 rounded-2xl border-2',
          isUnlocked ? config.borderColor : 'border-border',
          isUnlocked ? config.color : 'bg-surface',
          className
        )}
        style={{
          borderColor: isUnlocked ? colors.primary : colors.border,
          backgroundColor: isUnlocked ? `${colors.primary}20` : colors.surface,
        }}
      >
        {/* Badge icon */}
        <Text className={cn('text-4xl', !isUnlocked && 'opacity-30')}>{icon}</Text>

        {/* Badge name */}
        <Text className={cn('text-sm font-bold text-center', !isUnlocked && 'opacity-50')}>
          {name}
        </Text>

        {/* Rarity label */}
        <Text className={cn('text-xs font-semibold', !isUnlocked && 'opacity-50')}>
          {config.label}
        </Text>

        {/* Description */}
        <Text className={cn('text-xs text-center text-muted', !isUnlocked && 'opacity-50')}>
          {description}
        </Text>

        {/* Unlocked date */}
        {isUnlocked && unlockedAt && (
          <Text className="text-xs text-success mt-1">
            Unlocked {new Date(unlockedAt).toLocaleDateString()}
          </Text>
        )}
      </View>
    </Pressable>
  );
}
