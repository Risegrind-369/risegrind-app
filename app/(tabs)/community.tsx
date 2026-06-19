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
        
        {/* Neutral State */}
        <Text className="text-base text-center leading-relaxed" style={{ color: colors.muted }}>
          Your Ghost Crew awaits.
        </Text>
      </View>
    </ScreenContainer>
  );
}
