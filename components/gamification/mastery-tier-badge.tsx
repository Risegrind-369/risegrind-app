import { View, Text } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

type MasteryTier = 'beginner' | 'consistent' | 'automatic' | 'master';

interface MasteryTierBadgeProps {
  tier: MasteryTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

const TIER_CONFIG: Record<MasteryTier, { icon: string; label: string; color: string }> = {
  beginner: { icon: '🟢', label: 'Beginner', color: 'text-green-500' },
  consistent: { icon: '🔵', label: 'Consistent', color: 'text-blue-500' },
  automatic: { icon: '🟣', label: 'Automatic', color: 'text-purple-500' },
  master: { icon: '🟡', label: 'Master', color: 'text-yellow-500' },
};

const SIZE_CONFIG = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
};

export function MasteryTierBadge({
  tier,
  size = 'md',
  showLabel = true,
  className,
}: MasteryTierBadgeProps) {
  const config = TIER_CONFIG[tier];

  return (
    <View className={cn('items-center gap-1', className)}>
      <Text className={SIZE_CONFIG[size]}>{config.icon}</Text>
      {showLabel && <Text className="text-xs font-semibold text-foreground">{config.label}</Text>}
    </View>
  );
}
