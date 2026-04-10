import React, { useRef, useState, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  FlatList,
  type ListRenderItem,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTranslation } from "react-i18next";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const SLIDE_VISUALS = [
  { id: "1", emoji: "👻", accentColor: "#6366F1", tagColor: "#6366F1", particles: ["👁️", "🌑", "💨"] },
  { id: "2", emoji: "⚡", accentColor: "#F59E0B", tagColor: "#F59E0B", particles: ["📓", "🧠", "🎯"] },
  { id: "3", emoji: "🔥", accentColor: "#EF4444", tagColor: "#EF4444", particles: ["💪", "📈", "🏆"] },
  { id: "4", emoji: "🚀", accentColor: "#22C55E", tagColor: "#22C55E", particles: ["⚔️", "🌑", "✨"] },
];

type SlideKey = "slide1" | "slide2" | "slide3" | "slide4";
const SLIDE_KEYS: SlideKey[] = ["slide1", "slide2", "slide3", "slide4"];

function SlideContent({ slideKey, visual, isActive }: {
  slideKey: SlideKey;
  visual: typeof SLIDE_VISUALS[0];
  isActive: boolean;
}) {
  const { t } = useTranslation();
  const tag = t(`onboarding.${slideKey}.tag`);
  const title = t(`onboarding.${slideKey}.title`);
  const body = t(`onboarding.${slideKey}.body`);

  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      {isActive && visual.particles.map((p, i) => (
        <Animated.Text
          key={i}
          entering={FadeIn.delay(i * 150).duration(800)}
          style={[styles.particle, { left: 20 + i * 90 + (i % 2 === 0 ? 0 : 30), top: 60 + i * 40 }]}
        >
          {p}
        </Animated.Text>
      ))}
      <Animated.View
        entering={isActive ? FadeInDown.delay(100).springify().damping(14) : undefined}
        style={[styles.emojiWrap, { backgroundColor: visual.accentColor + "18" }]}
      >
        <Text style={styles.mainEmoji}>{visual.emoji}</Text>
      </Animated.View>
      <Animated.View
        entering={isActive ? FadeInDown.delay(200).springify().damping(16) : undefined}
        style={[styles.tagWrap, { backgroundColor: visual.tagColor + "18" }]}
      >
        <Text style={[styles.tagText, { color: visual.tagColor }]}>{tag}</Text>
      </Animated.View>
      <Animated.Text
        entering={isActive ? FadeInDown.delay(280).springify().damping(16) : undefined}
        style={styles.slideTitle}
      >
        {title}
      </Animated.Text>
      <Animated.Text
        entering={isActive ? FadeInDown.delay(360).springify().damping(16) : undefined}
        style={styles.slideBody}
      >
        {body}
      </Animated.Text>
    </View>
  );
}

export default function OnboardingScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const isLast = activeIndex === SLIDE_KEYS.length - 1;
  const currentVisual = SLIDE_VISUALS[activeIndex];

  const handleNext = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (activeIndex < SLIDE_KEYS.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      router.push("/onboarding/paywall" as never);
    }
  }, [activeIndex, router]);

  const handleSkip = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/onboarding/paywall" as never);
  }, [router]);

  const renderSlide: ListRenderItem<SlideKey> = ({ item, index }) => (
    <SlideContent slideKey={item} visual={SLIDE_VISUALS[index]} isActive={index === activeIndex} />
  );

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        {!isLast ? (
          <Pressable onPress={handleSkip} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}>
            <Text style={styles.skipText}>{t("onboarding.skip")}</Text>
          </Pressable>
        ) : <View />}
      </View>
      <FlatList
        ref={flatListRef}
        data={SLIDE_KEYS}
        renderItem={renderSlide}
        keyExtractor={(item) => item}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          setActiveIndex(index);
        }}
        style={styles.flatList}
      />
      <View style={styles.dotsRow}>
        {SLIDE_KEYS.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === activeIndex ? currentVisual.accentColor : "rgba(255,255,255,0.2)",
                width: i === activeIndex ? 28 : 8,
              },
            ]}
          />
        ))}
      </View>
      <View style={styles.footer}>
        <Pressable
          onPress={handleNext}
          style={({ pressed }) => [
            styles.ctaBtn,
            {
              backgroundColor: currentVisual.accentColor,
              transform: [{ scale: pressed ? 0.97 : 1 }],
              opacity: pressed ? 0.9 : 1,
            },
          ]}
        >
          <Text style={styles.ctaBtnText}>
            {isLast ? t("onboarding.getStarted") : t("onboarding.continue")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#0D0D0F" },
  header: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 8,
  },
  skipText: { color: "rgba(255,255,255,0.45)", fontSize: 16, fontWeight: "500" },
  flatList: { flex: 1 },
  slide: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 36,
    gap: 20,
    position: "relative",
  },
  particle: { position: "absolute", fontSize: 22, opacity: 0.18 },
  emojiWrap: { width: 130, height: 130, borderRadius: 44, alignItems: "center", justifyContent: "center" },
  mainEmoji: { fontSize: 64 },
  tagWrap: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  tagText: { fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  slideTitle: { fontSize: 32, fontWeight: "800", textAlign: "center", letterSpacing: -0.5, lineHeight: 42, color: "#FFFFFF" },
  slideBody: { fontSize: 16, textAlign: "center", lineHeight: 26, fontWeight: "400", color: "rgba(255,255,255,0.65)" },
  dotsRow: { flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 6, paddingVertical: 20 },
  dot: { height: 8, borderRadius: 4 },
  footer: { paddingHorizontal: 24, paddingBottom: 52 },
  ctaBtn: { height: 58, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  ctaBtnText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800", letterSpacing: 0.3 },
});
