import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  Animated,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp, MOOD_EMOJIS, MOOD_LABELS, type MoodLevel } from "@/lib/app-context";
import { ProgressRing } from "@/components/ui/progress-ring";
import { XPBar } from "@/components/ui/xp-bar";
import * as Haptics from "expo-haptics";

const GHOST_SLOGANS_EN = [
  "Go Ghost. Build Yourself. Change Everything.",
  "Disappear from the noise.",
  "Quiet discipline. Loud results.",
  "Lock in and rebuild in silence.",
  "The grind doesn't need an audience.",
];
const GHOST_SLOGANS_FR = [
  "Deviens fantôme. Construis-toi. Change tout.",
  "Disparaît du bruit.",
  "Discipline silencieuse. Résultats bruyants.",
  "Verrouille-toi et reconstruis en silence.",
  "Le grind n'a pas besoin d'audience.",
];
const GHOST_SLOGANS_PT = [
  "Vire fantasma. Construa-se. Mude tudo.",
  "Desapareça do barulho.",
  "Disciplina silenciosa. Resultados barulhentos.",
  "Foque e reconstrua em silêncio.",
  "O grind não precisa de audiência.",
];

function getGreeting(name: string, lang: string): string {
  const hour = new Date().getHours();
  if (lang === "fr") {
    if (hour < 12) return `Lève-toi, ${name}`;
    if (hour < 17) return `Concentre-toi, ${name}`;
    return `Reste discipliné, ${name}`;
  }
  if (lang === "pt") {
    if (hour < 12) return `Levanta, ${name}`;
    if (hour < 17) return `Foca, ${name}`;
    return `Mantém a disciplina, ${name}`;
  }
  if (hour < 12) return `Rise up, ${name}`;
  if (hour < 17) return `Lock in, ${name}`;
  return `Stay disciplined, ${name}`;
}

function getDaysWonThisYear(completions: any[], habits: any[]): number {
  if (!habits.length) return 0;
  const year = new Date().getFullYear();
  const dateMap: Record<string, Set<string>> = {};
  for (const c of completions) {
    if (c.date.startsWith(String(year))) {
      if (!dateMap[c.date]) dateMap[c.date] = new Set();
      dateMap[c.date].add(c.habitId);
    }
  }
  return Object.values(dateMap).filter((s) => s.size >= habits.length).length;
}

function formatDate(lang: string): string {
  const locale = lang === "fr" ? "fr-FR" : lang === "pt" ? "pt-BR" : "en-US";
  return new Date().toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export default function HomeScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const lang = i18n.language || "en";
  const slogans = lang === "fr" ? GHOST_SLOGANS_FR : lang === "pt" ? GHOST_SLOGANS_PT : GHOST_SLOGANS_EN;
  const { state, dispatch, todayCompletions, todayProgress, rank } = useApp();
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);
  const [sloganIndex] = useState(() => Math.floor(Math.random() * slogans.length));
  const sloganOpacity = useRef(new Animated.Value(0)).current;

  const todayStr = new Date().toISOString().split("T")[0];
  const hasMoodToday = !!state.todayMood;
  const daysWon = getDaysWonThisYear(state.completions, state.habits);

  useEffect(() => {
    Animated.timing(sloganOpacity, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleMoodSelect = (level: MoodLevel) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedMood(level);
  };

  const handleMoodSave = () => {
    if (!selectedMood) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    dispatch({
      type: "SET_MOOD",
      payload: {
        id: `mood_${Date.now()}`,
        date: todayStr,
        level: selectedMood,
        emoji: MOOD_EMOJIS[selectedMood],
        timestamp: Date.now(),
      },
    });
    dispatch({ type: "ADD_XP", payload: 5 });
    dispatch({ type: "UPDATE_STREAK" });
    setShowMoodPicker(false);
    setSelectedMood(null);
  };

  const recentEntries = state.journalEntries.slice(0, 2);

  return (
    <ScreenContainer containerClassName="bg-background">
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            {/* Settings Button (left) */}
            <Pressable
              onPress={() => router.push("/settings" as never)}
              style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
            >
              <Text style={styles.headerIcon}>⚙️</Text>
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text style={[styles.greeting, { color: colors.foreground }]}>
                {getGreeting(state.userName || "Ghost", lang)}
              </Text>
              <Text style={[styles.date, { color: colors.muted }]}>{formatDate(lang)}</Text>
            </View>
            <View style={[styles.streakBadge, { backgroundColor: "#F9731618" }]}>
              <Text style={styles.streakFire}>🔥</Text>
              <Text style={[styles.streakCount, { color: "#F97316" }]}>{state.streak}</Text>
            </View>
          </View>

          {/* Ghost Mode Slogan Banner */}
          <Animated.View
            style={[
              styles.sloganBanner,
              { backgroundColor: colors.foreground + "08", borderColor: colors.foreground + "14" },
              { opacity: sloganOpacity },
            ]}
          >
            <Text style={styles.ghostIcon}>👻</Text>
            <Text style={[styles.sloganText, { color: colors.foreground }]}>
              {slogans[sloganIndex]}
            </Text>
          </Animated.View>

          {/* Progress Ring + Stats */}
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.ringSection}>
              <ProgressRing
                progress={todayProgress}
                size={150}
                strokeWidth={14}
                color={colors.primary}
                label={t("home.progress")}
              >
                <Text style={[styles.ringPercent, { color: colors.foreground }]}>
                  {Math.round(todayProgress * 100)}%
                </Text>
                <Text style={[styles.ringLabel, { color: colors.muted }]}>
                  {todayCompletions.length}/{state.habits.length}
                </Text>
              </ProgressRing>

              <View style={styles.statsColumn}>
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.foreground }]}>{state.streak}</Text>
                  <Text style={[styles.statLabel, { color: colors.muted }]}>{t("home.streak")}</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: "#F97316" }]}>{daysWon}</Text>
                  <Text style={[styles.statLabel, { color: colors.muted }]}>{t("insights.daysWon")}</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, { color: colors.foreground }]}>
                    {state.xp.toLocaleString()}
                  </Text>
                  <Text style={[styles.statLabel, { color: colors.muted }]}>XP</Text>
                </View>
              </View>
            </View>

            <View style={styles.xpSection}>
              <XPBar xp={state.xp} />
            </View>
          </View>

          {/* Mood Banner or Mood Picker CTA */}
          {hasMoodToday ? (
            <Pressable
              onPress={() => setShowMoodPicker(true)}
              style={[styles.moodDone, { backgroundColor: colors.surface, borderColor: colors.border }]}
            >
              <Text style={styles.moodBannerEmoji}>{state.todayMood?.emoji}</Text>
              <View style={styles.moodBannerText}>
                <Text style={[styles.moodBannerTitle, { color: colors.foreground }]}>
                  {t("home.moodLogged")}
                </Text>
                <Text style={[styles.moodBannerSub, { color: colors.muted }]}>
                  {MOOD_LABELS[state.todayMood?.level || 3]}
                </Text>
              </View>
              <Text style={styles.moodBannerArrow}>→</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => setShowMoodPicker(true)}
              style={[styles.moodBanner, { backgroundColor: colors.accent + "15", borderColor: colors.accent + "30" }]}
            >
              <Text style={styles.moodBannerEmoji}>😊</Text>
              <View style={styles.moodBannerText}>
                <Text style={[styles.moodBannerTitle, { color: colors.foreground }]}>
                  {t("home.howAreYou")}
                </Text>
                <Text style={[styles.moodBannerSub, { color: colors.muted }]}>
                  {t("home.logMood")}
                </Text>
              </View>
              <Text style={styles.moodBannerArrow}>→</Text>
            </Pressable>
          )}

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
              {t("home.quickActions")}
            </Text>
            <View style={styles.actionGrid}>
              <Pressable
                onPress={() => router.push("/(tabs)/routine" as never)}
                style={({ pressed }) => [
                  styles.actionCard,
                  { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={styles.actionEmoji}>📋</Text>
                <Text style={[styles.actionLabel, { color: colors.foreground }]}>{t("home.routine")}</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push("/(tabs)/journal" as never)}
                style={({ pressed }) => [
                  styles.actionCard,
                  { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={styles.actionEmoji}>📝</Text>
                <Text style={[styles.actionLabel, { color: colors.foreground }]}>{t("home.journal")}</Text>
              </Pressable>
              <Pressable
                onPress={() => router.push("/(tabs)/intel" as never)}
                style={({ pressed }) => [
                  styles.actionCard,
                  { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={styles.actionEmoji}>📊</Text>
                <Text style={[styles.actionLabel, { color: colors.foreground }]}>{t("home.insights")}</Text>
              </Pressable>
            </View>
          </View>

          {/* Rank Card */}
          <View style={[styles.ghostBlock, { backgroundColor: colors.accent + "10", borderColor: colors.accent + "30" }]}>
            <View style={styles.rankRow}>
              <Text style={[styles.ghostBlockTitle, { color: colors.accent }]}>
                👑 {t("home.yourRank")}
              </Text>
              <Text style={[styles.rankText, { color: colors.accent }]}>{rank}</Text>
            </View>
            <Text style={[styles.ghostBlockBody, { color: colors.muted }]}>
              {t("home.rankDescription")}
            </Text>
          </View>

          {/* Recent Journal Entries */}
          {recentEntries.length > 0 && (
            <View style={styles.quickActions}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
                {t("home.recentEntries")}
              </Text>
              {recentEntries.map((entry) => (
                <Pressable
                  key={entry.id}
                  onPress={() => router.push("/(tabs)/journal" as never)}
                  style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
                >
                  <Text style={[styles.entryPreviewTitle, { color: colors.muted }]}>
                    {new Date(entry.createdAt).toLocaleDateString(lang === "fr" ? "fr-FR" : lang === "pt" ? "pt-BR" : "en-US")}
                  </Text>
                  <Text style={[styles.entryPreviewText, { color: colors.foreground }]} numberOfLines={2}>
                    {entry.content}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>

        {/* Connect Button (bottom-left) */}
        <Pressable
          onPress={() => router.push("/friends" as never)}
          style={({ pressed }) => [
            styles.connectButton,
            {
              backgroundColor: colors.accent,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={styles.connectButtonText}>👥</Text>
        </Pressable>

        {/* AI FAB (bottom-right, above Intel tab) */}
        <Pressable
          onPress={() => router.push("/ai-chat" as never)}
          style={({ pressed }) => [
            styles.aiFab,
            {
              backgroundColor: colors.accent,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={styles.aiFabText}>🎤</Text>
        </Pressable>
      </View>

      {/* Mood Picker Modal */}
      <Modal
        visible={showMoodPicker}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMoodPicker(false)}
      >
        <View style={[styles.moodModalContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.moodModalTitle, { color: colors.foreground }]}>
            {t("home.howAreYouFeeling")}
          </Text>

          <View style={styles.moodGrid}>
            {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => (
              <Pressable
                key={level}
                onPress={() => handleMoodSelect(level)}
                style={({ pressed }) => [
                  styles.moodOption,
                  {
                    borderColor: selectedMood === level ? colors.primary : colors.border,
                    backgroundColor: selectedMood === level ? colors.primary + "15" : colors.surface,
                    transform: [{ scale: pressed ? 0.92 : selectedMood === level ? 1.05 : 1 }],
                  },
                ]}
              >
                <Text style={styles.moodEmoji}>{MOOD_EMOJIS[level]}</Text>
                <Text style={[styles.moodLevelLabel, { color: colors.muted }]}>
                  {MOOD_LABELS[level]}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            onPress={handleMoodSave}
            disabled={!selectedMood}
            style={({ pressed }) => [
              styles.saveMoodButton,
              {
                backgroundColor: selectedMood ? colors.primary : colors.border,
                transform: [{ scale: pressed ? 0.97 : 1 }],
              },
            ]}
          >
            <Text style={[styles.saveMoodText, { color: selectedMood ? "#fff" : colors.muted }]}>
              {t("home.logState")}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setShowMoodPicker(false)}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 12 })}
          >
            <Text style={[styles.cancelText, { color: colors.muted }]}>{t("common.cancel")}</Text>
          </Pressable>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 120,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  headerIcon: {
    fontSize: 24,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  date: {
    fontSize: 14,
    fontWeight: "400",
    marginTop: 2,
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  streakFire: {
    fontSize: 18,
  },
  streakCount: {
    fontSize: 18,
    fontWeight: "800",
  },
  sloganBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  ghostIcon: { fontSize: 20 },
  sloganText: { flex: 1, fontSize: 13, fontWeight: "700", letterSpacing: 0.1, lineHeight: 18 },
  rankRow: { flexDirection: "row" },
  rankBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20 },
  rankText: { fontSize: 13, fontWeight: "700" },
  ghostBlock: { borderRadius: 16, padding: 18, borderWidth: 1, gap: 8 },
  ghostBlockTitle: { fontSize: 15, fontWeight: "800", letterSpacing: -0.2 },
  ghostBlockBody: { fontSize: 13, lineHeight: 20 },
  card: {
    borderRadius: 22,
    padding: 20,
    borderWidth: 1,
    gap: 14,
  },
  ringSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  ringPercent: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  ringLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  statsColumn: {
    flex: 1,
    gap: 10,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
  },
  statDivider: {
    height: 1,
    width: "80%",
    alignSelf: "center",
  },
  xpSection: {
    paddingTop: 4,
  },
  moodBanner: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  moodDone: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  moodBannerEmoji: {
    fontSize: 28,
  },
  moodBannerText: {
    flex: 1,
  },
  moodBannerTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  moodBannerSub: {
    fontSize: 13,
    marginTop: 2,
  },
  moodBannerArrow: {
    fontSize: 24,
    fontWeight: "300",
  },
  quickActions: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  actionGrid: {
    flexDirection: "row",
    gap: 10,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    gap: 6,
    alignItems: "center",
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  entryPreviewTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  entryPreviewText: {
    fontSize: 14,
    lineHeight: 20,
  },
  moodModalContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: "center",
    gap: 24,
  },
  moodModalTitle: {
    fontSize: 24,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  moodGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 8,
  },
  moodOption: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 2,
    padding: 12,
    alignItems: "center",
    gap: 6,
  },
  moodEmoji: {
    fontSize: 32,
  },
  moodLevelLabel: {
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },
  saveMoodButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  saveMoodText: {
    fontSize: 16,
    fontWeight: "700",
  },
  cancelText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  connectButton: {
    position: "absolute",
    bottom: 80,
    left: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  connectButtonText: {
    fontSize: 24,
  },
  aiFab: {
    position: "absolute",
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  aiFabText: {
    fontSize: 24,
  },
});
