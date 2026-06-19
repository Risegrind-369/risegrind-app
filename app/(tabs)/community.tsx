import { View, Text } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useTranslation } from "react-i18next";

export default function CommunityScreen() {
  const colors = useColors();
  const { t } = useTranslation();

  return (
    <ScreenContainer className="flex-1 items-center justify-center px-6">
      <View className="items-center gap-8 max-w-xs">
        {/* Ghost Icon */}
        <Text className="text-8xl">👻</Text>
        
        {/* Title */}
        <Text className="text-4xl font-bold text-center" style={{ color: colors.foreground }}>
          Ghost Crew
        </Text>
        
        {/* Coming Soon Badge */}
        <View style={{ backgroundColor: colors.accent + "15", borderColor: colors.accent, borderWidth: 1, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 8 }}>
          <Text className="text-sm font-semibold text-center" style={{ color: colors.accent }}>
            Coming Soon
          </Text>
        </View>
        
        {/* Description */}
        <Text className="text-base text-center leading-relaxed" style={{ color: colors.muted }}>
          Challenge your friends, climb the leaderboard, and build in silence together.
        </Text>
        
        {/* Features Preview */}
        <View className="gap-3 w-full mt-4">
          <View className="flex-row items-center gap-3">
            <Text className="text-lg">🏆</Text>
            <Text style={{ color: colors.foreground }} className="text-sm font-semibold">Leaderboard Rankings</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Text className="text-lg">👥</Text>
            <Text style={{ color: colors.foreground }} className="text-sm font-semibold">Friend Challenges</Text>
          </View>
          <View className="flex-row items-center gap-3">
            <Text className="text-lg">🔥</Text>
            <Text style={{ color: colors.foreground }} className="text-sm font-semibold">Streak Competitions</Text>
          </View>
        </View>
        
        {/* Footer */}
        <Text className="text-xs text-center mt-6" style={{ color: colors.muted }}>
          Dropping in the next update. 🔒
        </Text>
      </View>
    </ScreenContainer>
  );
}
