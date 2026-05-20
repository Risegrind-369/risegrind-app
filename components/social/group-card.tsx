import { TouchableOpacity } from "react-native";
import { View, Text, Pressable } from 'react-native';
import { useColors } from '@/hooks/use-colors';

export interface GroupCardProps {
  id: number;
  name: string;
  description?: string;
  habitFocus?: string;
  memberCount: number;
  visibility: 'public' | 'private';
  isMember?: boolean;
  onPress?: () => void;
  onJoin?: () => void;
}

export function GroupCard({
  id,
  name,
  description,
  habitFocus,
  memberCount,
  visibility,
  isMember = false,
  onPress,
  onJoin,
}: GroupCardProps) {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text
            className="text-lg font-semibold text-foreground mb-1"
            numberOfLines={1}
          >
            {name}
          </Text>
          {habitFocus && (
            <Text className="text-sm text-muted mb-1">{habitFocus}</Text>
          )}
        </View>
        <View
          className="px-2 py-1 rounded-full"
          style={{ backgroundColor: colors.primary + '20' }}
        >
          <Text className="text-xs font-semibold text-primary">
            {visibility === 'public' ? '🌍' : '🔒'}
          </Text>
        </View>
      </View>

      {/* Description */}
      {description && (
        <Text
          className="text-sm text-muted mb-3 leading-5"
          numberOfLines={2}
        >
          {description}
        </Text>
      )}

      {/* Member Count */}
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm text-muted">
          👥 {memberCount} member{memberCount !== 1 ? 's' : ''}
        </Text>
        {isMember && (
          <View
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: colors.success + '20' }}
          >
            <Text className="text-xs font-semibold text-success">
              Member
            </Text>
          </View>
        )}
      </View>

      {/* Join Button */}
      {!isMember && onJoin && (
        <TouchableOpacity
          onPress={onJoin}
          activeOpacity={0.6}
        >
          <Text className="text-center font-semibold text-white text-sm">
            Join Group
          </Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
}
