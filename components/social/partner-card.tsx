import { TouchableOpacity } from "react-native";
import { View, Text, Pressable } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';

export interface PartnerCardProps {
  userId: number;
  name?: string;
  matchScore: number;
  commonGoals: string[];
  motivationStyle?: string;
  status?: 'pending' | 'accepted' | 'rejected';
  onPress?: () => void;
  onAction?: (action: 'send' | 'cancel' | 'view' | 'remove') => void;
  actionLabel?: string;
}

export function PartnerCard({
  userId,
  name = 'User',
  matchScore,
  commonGoals,
  motivationStyle,
  status,
  onPress,
  onAction,
  actionLabel = 'Send Request',
}: PartnerCardProps) {
  const colors = useColors();

  const getStatusColor = () => {
    switch (status) {
      case 'pending':
        return colors.warning;
      case 'accepted':
        return colors.success;
      case 'rejected':
        return colors.error;
      default:
        return colors.primary;
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'accepted':
        return 'Accepted';
      case 'rejected':
        return 'Rejected';
      default:
        return null;
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View className="flex-row items-start justify-between mb-3">
        <View className="flex-1">
          <Text
            className="text-lg font-semibold text-foreground mb-1"
            numberOfLines={1}
          >
            {name}
          </Text>
          {motivationStyle && (
            <Text className="text-sm text-muted mb-2">{motivationStyle}</Text>
          )}
        </View>
        {status && (
          <View
            className="px-2 py-1 rounded-full ml-2"
            style={{ backgroundColor: getStatusColor() + '20' }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: getStatusColor() }}
            >
              {getStatusLabel()}
            </Text>
          </View>
        )}
      </View>

      {/* Match Score */}
      <View className="mb-3">
        <View className="flex-row items-center justify-between mb-1">
          <Text className="text-sm text-muted">Match Score</Text>
          <Text className="text-sm font-semibold text-primary">
            {matchScore}%
          </Text>
        </View>
        <View
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: colors.border }}
        >
          <View
            className="h-full rounded-full"
            style={{
              width: `${matchScore}%`,
              backgroundColor: colors.primary,
            }}
          />
        </View>
      </View>

      {/* Common Goals */}
      {commonGoals.length > 0 && (
        <View className="mb-3">
          <Text className="text-xs text-muted mb-1">Common Goals</Text>
          <View className="flex-row flex-wrap gap-1">
            {commonGoals.slice(0, 3).map((goal, idx) => (
              <View
                key={idx}
                className="px-2 py-1 rounded-full"
                style={{ backgroundColor: colors.primary + '20' }}
              >
                <Text className="text-xs text-primary font-medium">{goal}</Text>
              </View>
            ))}
            {commonGoals.length > 3 && (
              <View
                className="px-2 py-1 rounded-full"
                style={{ backgroundColor: colors.border }}
              >
                <Text className="text-xs text-muted font-medium">
                  +{commonGoals.length - 3}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Action Button */}
      {onAction && (
        <TouchableOpacity
          onPress={() => {
            if (status === 'pending') {
              onAction('cancel');
            } else if (status === 'accepted') {
              onAction('view');
            } else {
              onAction('send');
            }
          }}
          activeOpacity={0.6}
        >
          <Text className="text-center font-semibold text-white text-sm">
            {status === 'pending'
              ? 'Cancel Request'
              : status === 'accepted'
                ? 'View Profile'
                : actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
