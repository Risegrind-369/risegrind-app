import React, { useState } from "react";
import { View, Text, StyleSheet, Dimensions, Image, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  FadeIn,
  FadeInDown,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useLanguage } from "@/lib/language-context";
import { SUPPORTED_LANGUAGES, type SupportedLanguage } from "@/lib/i18n";
import { useTranslation } from "react-i18next";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

function LanguageCard({
  code,
  flag,
  nativeName,
  isSelected,
  onSelect,
  delay,
}: {
  code: SupportedLanguage;
  flag: string;
  nativeName: string;
  isSelected: boolean;
  onSelect: () => void;
  delay: number;
}) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.96, { damping: 15 }, () => {
      scale.value = withSpring(1, { damping: 15 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelect();
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(delay).springify().damping(18)}
      style={animStyle}
    >
      <TouchableOpacity
        onPress={handlePress}
        style={[
          styles.langCard,
          {
            backgroundColor: isSelected ? colors.primary + "12" : colors.surface,
            borderColor: isSelected ? colors.primary : colors.border,
            borderWidth: isSelected ? 2 : 1,
          },
        ]}
      >
        <Text style={styles.flag}>{flag}</Text>
        <Text
          style={[
            styles.langName,
            {
              color: isSelected ? colors.primary : colors.foreground,
              fontWeight: isSelected ? "700" : "500",
            },
          ]}
        >
          {nativeName}
        </Text>
        {isSelected && (
          <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function LanguageScreen() {
  const colors = useColors();
  const router = useRouter();
  const { setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<SupportedLanguage>("en");

  const handleContinue = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await setLanguage(selected);
    router.replace("/onboarding" as never);
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <View style={styles.container}>
        {/* App icon */}
        <Animated.View entering={FadeIn.delay(100).duration(600)} style={styles.iconWrap}>
          <Image
            source={require("../../assets/images/icon.png")}
            style={styles.appIcon}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Title */}
        <Animated.View entering={FadeInDown.delay(200).springify().damping(18)} style={styles.titleWrap}>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {t("langScreen.title")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {t("langScreen.subtitle")}
          </Text>
        </Animated.View>

        {/* Language cards */}
        <View style={styles.cardsWrap}>
          {SUPPORTED_LANGUAGES.map((lang, index) => (
            <LanguageCard
              key={lang.code}
              code={lang.code}
              flag={lang.flag}
              nativeName={lang.nativeName}
              isSelected={selected === lang.code}
              onSelect={() => setSelected(lang.code)}
              delay={300 + index * 80}
            />
          ))}
        </View>

        {/* Continue button */}
        <Animated.View
          entering={FadeInDown.delay(600).springify().damping(18)}
          style={styles.footer}
        >
          <TouchableOpacity
            onPress={handleContinue}
            activeOpacity={0.6}
          >
            <Text style={styles.continueBtnText}>{t("langScreen.continue")}</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
    paddingBottom: 48,
    justifyContent: "center",
    gap: 32,
  },
  iconWrap: {
    alignItems: "center",
  },
  appIcon: {
    width: 80,
    height: 80,
    borderRadius: 18,
  },
  titleWrap: {
    alignItems: "center",
    gap: 10,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 38,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    fontWeight: "400",
  },
  cardsWrap: {
    gap: 12,
  },
  langCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 16,
  },
  flag: {
    fontSize: 32,
  },
  langName: {
    fontSize: 18,
    flex: 1,
    letterSpacing: -0.2,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "800",
  },
  footer: {
    marginTop: 8,
  },
  continueBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  continueBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
});
