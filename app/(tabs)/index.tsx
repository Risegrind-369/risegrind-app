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
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
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

          {/* Rank + XP */}
          <View style={styles.rankRow}>
            <View style={[styles.rankBadge, { backgroundColor: colors.primary + "18" }]}>
              <Text style={[styles.rankText, { color: colors.primary }]}>⚡ {rank}</Text>
            </View>
          </View>
          <View style={styles.xpSection}>
            <XPBar xp={state.xp} />
          </View>
        </View>

        {/* Mood Check-in */}
        {!hasMoodToday ? (
          <Pressable
            onPress={() => setShowMoodPicker(true)}
            style={({ pressed }) => [
              styles.moodBanner,
              {
                backgroundColor: colors.primary + "12",
                borderColor: colors.primary + "40",
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            <Text style={styles.moodBannerEmoji}>🧠</Text>
            <View style={styles.moodBannerText}>
              <Text style={[styles.moodBannerTitle, { color: colors.foreground }]}>
                {t("home.checkIn")}
              </Text>
              <Text style={[styles.moodBannerSub, { color: colors.muted }]}>
                {t("home.selfAwareness")}
              </Text>
            </View>
            <Text style={[styles.moodBannerArrow, { color: colors.muted }]}>›</Text>
          </Pressable>
        ) : (
          <View style={[styles.moodDone, { backgroundColor: colors.success + "12", borderColor: colors.success + "40" }]}>
            <Text style={styles.moodBannerEmoji}>{state.todayMood?.emoji}</Text>
            <View style={styles.moodBannerText}>
          <Text style={[styles.moodBannerTitle, { color: colors.foreground }]}>
              {t("home.mentalStateLogged")}
            </Text>
            <Text style={[styles.moodBannerSub, { color: colors.muted }]}>
              {MOOD_LABELS[state.todayMood?.level ?? 3]} · {t("home.keepGoing")}
            </Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("home.quickActions")}</Text>
          <View style={styles.actionGrid}>
            {[
              { emoji: "⚡", label: t("tabs.routine"), sub: `${todayCompletions.length}/${state.habits.length} ${t("home.done")}`, route: "/(tabs)/routine", accent: colors.primary },
              { emoji: "📓", label: t("tabs.journal"), sub: `${state.journalEntries.length} ${t("home.entries")}`, route: "/(tabs)/journal", accent: "#8B5CF6" },
              { emoji: "📊", label: t("tabs.intel"), sub: t("home.trackGrowth"), route: "/(tabs)/insights", accent: "#10B981" },
            ].map((action) => (
              <Pressable
                key={action.label}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  router.push(action.route as any);
                }}
                style={({ pressed }) => [
                  styles.actionCard,
                  {
                    backgroundColor: action.accent + "12",
                    borderColor: action.accent + "30",
                    borderWidth: 1,
                    transform: [{ scale: pressed ? 0.95 : 1 }],
                  },
                ]}
              >
                <Text style={styles.actionEmoji}>{action.emoji}</Text>
                <Text style={[styles.actionLabel, { color: colors.foreground }]}>{action.label}</Text>
                <Text style={[styles.actionSub, { color: colors.muted }]}>{action.sub}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Ghost Mode Motivational Block */}
        <View style={[styles.ghostBlock, { backgroundColor: colors.foreground + "06", borderColor: colors.foreground + "12" }]}>
          <Text style={[styles.ghostBlockTitle, { color: colors.foreground }]}>👻 {t("home.ghostModeActive")}</Text>
          <Text style={[styles.ghostBlockBody, { color: colors.muted }]}>
            {t("home.ghostModeBody")}
          </Text>
        </View>

        {/* Recent Journal Entries */}
        {recentEntries.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>{t("home.recentEntries")}</Text>
            {recentEntries.map((entry) => (
              <View
                key={entry.id}
                style={[styles.entryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
              >
                <Text style={[styles.entryDate, { color: colors.muted }]}>
                  {new Date(entry.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </Text>
                <Text
                  style={[styles.entryContent, { color: colors.foreground }]}
                  numberOfLines={2}
                >
                  {entry.content}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Mood Picker Modal */}
      <Modal
        visible={showMoodPicker}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>{t("home.mentalState")}</Text>
            <Text style={[styles.modalSub, { color: colors.muted }]}>{t("home.moodCheck")}</Text>

            <View style={styles.moodGrid}>
              {([1, 2, 3, 4, 5] as MoodLevel[]).map((level) => (
                <Pressable
                  key={level}
                  onPress={() => handleMoodSelect(level)}
                  style={({ pressed }) => [
                    styles.moodOption,
                    {
                      backgroundColor:
                        selectedMood === level ? colors.primary + "20" : colors.surface,
                      borderColor:
                        selectedMood === level ? colors.primary : colors.border,
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
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
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
  actionSub: {
    fontSize: 11,
    textAlign: "center",
  },
  recentSection: {
    gap: 10,
  },
  entryCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 4,
  },
  entryDate: {
    fontSize: 12,
    fontWeight: "600",
  },
  entryContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    gap: 12,
    alignItems: "center",
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  modalSub: {
    fontSize: 15,
    marginBottom: 8,
  },
  moodGrid: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 8,
  },
  moodOption: {
    alignItems: "center",
    justifyContent: "center",
    width: 58,
    height: 72,
    borderRadius: 16,
    borderWidth: 2,
    gap: 4,
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodLevelLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  saveMoodButton: {
    width: "100%",
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  saveMoodText: {
    fontSize: 17,
    fontWeight: "700",
  },
  cancelText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
