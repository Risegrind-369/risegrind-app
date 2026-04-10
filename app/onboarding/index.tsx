/**
 * Ghost Mode Onboarding — 4-step journey
 *
 * Slide 1: The Vision      — Go Ghost. Disappear from the noise.
 * Slide 2: The Method      — Daily routine + AI Journal
 * Slide 3: The Results     — Animated growth chart (Cal AI style)
 * Slide 4: The CTA         — Ready to enter Ghost Mode? + trust badges
 *
 * Fully localized (EN / FR / PT-BR).
 */
import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Dimensions,
  FlatList,
  type ListRenderItem,
} from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Slide config ─────────────────────────────────────────────────────────────

const SLIDE_VISUALS = [
  { id: "1", emoji: "👻", accentColor: "#6366F1", tagColor: "#6366F1", particles: ["👁️", "🌑", "💨"] },
  { id: "2", emoji: "⚡", accentColor: "#F59E0B", tagColor: "#F59E0B", particles: ["📓", "🧠", "🎯"] },
  { id: "3", emoji: "📈", accentColor: "#EF4444", tagColor: "#EF4444", particles: ["💪", "🏆", "🔥"] },
  { id: "4", emoji: "🚀", accentColor: "#22C55E", tagColor: "#22C55E", particles: ["⚔️", "🌑", "✨"] },
];

type SlideKey = "slide1" | "slide2" | "slide3" | "slide4";
const SLIDE_KEYS: SlideKey[] = ["slide1", "slide2", "slide3", "slide4"];

// ─── Chart data ───────────────────────────────────────────────────────────────

const CHART_POINTS = [0.30, 0.35, 0.42, 0.50, 0.58, 0.68, 0.78, 0.86, 0.95];

// ─── Animated bar ─────────────────────────────────────────────────────────────

function AnimatedBar({
  value,
  delay,
  isActive,
  accentColor,
  isLast,
}: {
  value: number;
  delay: number;
  isActive: boolean;
  accentColor: string;
  isLast: boolean;
}) {
  const height = useSharedValue(0);
  const MAX_H = 110;

  useEffect(() => {
    if (isActive) {
      height.value = withDelay(
        300 + delay,
        withTiming(value * MAX_H, { duration: 550, easing: Easing.out(Easing.back(1.1)) })
      );
    } else {
      height.value = 0;
    }
  }, [isActive]);

  const animStyle = useAnimatedStyle(() => ({ height: height.value }));

  return (
    <View style={{ flex: 1, justifyContent: "flex-end", height: MAX_H }}>
      <Animated.View
        style={[
          animStyle,
          {
            width: "100%",
            borderRadius: isLast ? 5 : 3,
            backgroundColor: isLast ? accentColor : accentColor + "55",
          },
        ]}
      />
    </View>
  );
}

// ─── Growth chart ─────────────────────────────────────────────────────────────

function GrowthChart({ isActive, accentColor }: { isActive: boolean; accentColor: string }) {
  const { t } = useTranslation();

  return (
    <View style={styles.chartWrap}>
      {/* Y labels */}
      <View style={styles.chartYLabels}>
        <Text style={[styles.axisLabel, { color: accentColor }]}>95%</Text>
        <Text style={styles.axisLabel}>60%</Text>
        <Text style={styles.axisLabel}>30%</Text>
      </View>

      {/* Bars */}
      <View style={styles.chartBars}>
        {CHART_POINTS.map((v, i) => (
          <AnimatedBar
            key={i}
            value={v}
            delay={i * 110}
            isActive={isActive}
            accentColor={accentColor}
            isLast={i === CHART_POINTS.length - 1}
          />
        ))}
      </View>

      {/* X labels */}
      <View style={styles.chartXLabels}>
        <Text style={styles.axisLabel}>{t("onboarding.chart.day0")}</Text>
        <Text style={styles.axisLabel}>{t("onboarding.chart.day30")}</Text>
        <Text style={styles.axisLabel}>{t("onboarding.chart.day60")}</Text>
        <Text style={[styles.axisLabel, { color: accentColor, fontWeight: "700" }]}>
          {t("onboarding.chart.day90")}
        </Text>
      </View>

      {/* Annotation */}
      <View style={[styles.annotation, { borderColor: accentColor + "40", backgroundColor: accentColor + "12" }]}>
        <Text style={[styles.annotationText, { color: accentColor }]}>
          {t("onboarding.chart.annotation")}
        </Text>
      </View>
    </View>
  );
}

// ─── Trust badges ─────────────────────────────────────────────────────────────

function TrustBadges({ accentColor }: { accentColor: string }) {
  const { t } = useTranslation();
  const items = [
    { icon: "🔒", key: "trust.encrypted" },
    { icon: "📔", key: "trust.private" },
    { icon: "🤝", key: "trust.mentor" },
  ] as const;

  return (
    <View style={styles.trustRow}>
      {items.map((b) => (
        <View
          key={b.key}
          style={[styles.trustBadge, { borderColor: accentColor + "30", backgroundColor: accentColor + "10" }]}
        >
          <Text style={styles.trustIcon}>{b.icon}</Text>
          <Text style={styles.trustText}>{t(`onboarding.${b.key}`)}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Slide content ────────────────────────────────────────────────────────────

function SlideContent({
  slideKey,
  visual,
  isActive,
}: {
  slideKey: SlideKey;
  visual: (typeof SLIDE_VISUALS)[number];
  isActive: boolean;
}) {
  const { t } = useTranslation();
  const tag = t(`onboarding.${slideKey}.tag`);
  const title = t(`onboarding.${slideKey}.title`);
  const body = t(`onboarding.${slideKey}.body`);
  const isResultsSlide = slideKey === "slide3";
  const isCTASlide = slideKey === "slide4";

  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      {/* Floating particles */}
      {isActive &&
        visual.particles.map((p, i) => (
          <Animated.Text
            key={i}
            entering={FadeIn.delay(i * 150).duration(800)}
            style={[styles.particle, { left: 20 + i * 90 + (i % 2 === 0 ? 0 : 30), top: 60 + i * 40 }]}
          >
            {p}
          </Animated.Text>
        ))}

      {/* Emoji icon */}
      <Animated.View
        entering={isActive ? FadeInUp.delay(100).springify().damping(14) : undefined}
        style={[styles.emojiWrap, { backgroundColor: visual.accentColor + "18" }]}
      >
        <Text style={styles.mainEmoji}>{visual.emoji}</Text>
      </Animated.View>

      {/* Tag */}
      <Animated.View
        entering={isActive ? FadeInDown.delay(200).springify().damping(16) : undefined}
        style={[styles.tagWrap, { backgroundColor: visual.tagColor + "18" }]}
      >
        <Text style={[styles.tagText, { color: visual.tagColor }]}>{tag}</Text>
      </Animated.View>

      {/* Title */}
      <Animated.Text
        entering={isActive ? FadeInDown.delay(280).springify().damping(16) : undefined}
        style={styles.slideTitle}
      >
        {title}
      </Animated.Text>

      {/* Slide 3: animated growth chart */}
      {isResultsSlide ? (
        <Animated.View
          entering={isActive ? FadeInDown.delay(360).springify().damping(16) : undefined}
          style={{ width: "100%" }}
        >
          <GrowthChart isActive={isActive} accentColor={visual.accentColor} />
        </Animated.View>
      ) : (
        <Animated.Text
          entering={isActive ? FadeInDown.delay(360).springify().damping(16) : undefined}
          style={styles.slideBody}
        >
          {body}
        </Animated.Text>
      )}

      {/* Slide 4: trust badges */}
      {isCTASlide && (
        <Animated.View
          entering={isActive ? FadeInDown.delay(440).springify().damping(16) : undefined}
          style={{ width: "100%" }}
        >
          <TrustBadges accentColor={visual.accentColor} />
        </Animated.View>
      )}
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

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
        ) : (
          <View />
        )}
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
                backgroundColor:
                  i === activeIndex ? currentVisual.accentColor : "rgba(255,255,255,0.2)",
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
    paddingHorizontal: 28,
    gap: 16,
    position: "relative",
  },
  particle: { position: "absolute", fontSize: 22, opacity: 0.18 },
  emojiWrap: { width: 110, height: 110, borderRadius: 38, alignItems: "center", justifyContent: "center" },
  mainEmoji: { fontSize: 56 },
  tagWrap: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  tagText: { fontSize: 11, fontWeight: "800", letterSpacing: 1.5 },
  slideTitle: {
    fontSize: 30,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 40,
    color: "#FFFFFF",
  },
  slideBody: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 24,
    color: "rgba(255,255,255,0.65)",
  },
  // Chart
  chartWrap: { width: "100%", alignItems: "center", gap: 6 },
  chartYLabels: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 28,
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingRight: 4,
    zIndex: 1,
  },
  axisLabel: { fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: "600" },
  chartBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
    paddingLeft: 30,
    width: "100%",
    height: 110,
  },
  chartXLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    paddingLeft: 30,
    paddingTop: 4,
  },
  annotation: {
    marginTop: 8,
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
  },
  annotationText: { fontSize: 12, fontWeight: "700", textAlign: "center" },
  // Trust badges
  trustRow: { flexDirection: "row", gap: 8, justifyContent: "center", flexWrap: "wrap" },
  trustBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  trustIcon: { fontSize: 14 },
  trustText: { fontSize: 12, fontWeight: "600", color: "rgba(255,255,255,0.75)" },
  // Navigation
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    paddingVertical: 16,
  },
  dot: { height: 8, borderRadius: 4 },
  footer: { paddingHorizontal: 24, paddingBottom: 52 },
  ctaBtn: { height: 58, borderRadius: 18, alignItems: "center", justifyContent: "center" },
  ctaBtnText: { color: "#FFFFFF", fontSize: 17, fontWeight: "800", letterSpacing: 0.3 },
});
