import { View, Text } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useTranslation } from "react-i18next";

export default function CommunityScreen() {
  const colors = useColors();
  const { t } = useTranslation();

  return (
    <ScreenContainer className="flex-1 items-center justify-center px-6">
      <View className="items-center gap-6">
        <Text className="text-6xl">👻</Text>
        
        <Text className="text-3xl font-bold text-center" style={{ color: colors.foreground }}>
          Ghost Crew
        </Text>
        
        <Text className="text-lg text-center" style={{ color: colors.muted }}>
          Coming Soon
        </Text>
        
        <Text className="text-base text-center leading-relaxed" style={{ color: colors.muted }}>
          Challenge your friends, climb the leaderboard, and build in silence together.
        </Text>
        
        <Text className="text-sm text-center mt-4" style={{ color: colors.muted }}>
          Dropping in the next update. 🔒
        </Text>
      </View>
    </ScreenContainer>
  );
}
