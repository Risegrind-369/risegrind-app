/**
 * WeeklySummaryModal
 *
 * Shows a beautiful pop-up every 7 days after the user's first active day.
 * Displays weekly completion %, streak summary, habits done, mood trend, and XP earned.
 * Uses orange glow accents and motivational Ghost Mode copy.
 */
import React, { useEffect, useRef } from "react";
import { View, Text, Modal, StyleSheet, ScrollView, Dimensions, TouchableOpacity } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withDelay,
  Easing,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/lib/language-context";
import { AppState, MoodEntry, HabitCompletion, Habit } from "@/lib/app-context";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const BAR_MAX_HEIGHT = 80;
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAYS_FR = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const DAYS_PT = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

interface WeeklySummaryModalProps {
  visible: boolean;
  onDismiss: () => void;
  state: AppState;
  weekXpEarned: number; // XP earned in the last 7 days
}

function getMoodColor(avg: number, accent: string, success: string, warning: string, error: string): string {
  if (avg >= 4) return success;
  if (avg >= 3) return accent;
  if (avg >= 2) return warning;
  return error;
}

export function WeeklySummaryModal({ visible, onDismiss, state, weekXpEarned }: WeeklySummaryModalProps) {
  const colors = useColors();
  const { t, i18n } = useTranslation();
  const { language: userLanguage } = useLanguage();
  const lang = (userLanguage || i18n.language || "en") as "en" | "fr" | "pt";

  // ─── Animation values ────────────────────────────────────────────────────────
  const containerScale = useSharedValue(0.8);
  const containerOpacity = useSharedValue(0);
  const barHeights = useRef(Array.from({ length: 7 }, () => useSharedValue(0))).current;

  // ─── Compute weekly stats ─────────────────────────────────────────────────────
  const today = new Date();
  const weekDates: string[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    weekDates.push(d.toISOString().split("T")[0]);
  }

  // Habits completed per day (percentage)
  const dailyCompletion: number[] = weekDates.map((date) => {
    if (!state.habits.length) return 0;
    const done = state.completions.filter((c) => c.date === date).length;
    return Math.min(100, Math.round((done / state.habits.length) * 100));
  });

  const totalCompletion = dailyCompletion.reduce((a, b) => a + b, 0);
  const avgCompletion = Math.round(totalCompletion / 7);

  // Mood trend this week
  const weekMoods = state.moodEntries.filter((m) => weekDates.includes(m.date));
  const avgMood = weekMoods.length
    ? weekMoods.reduce((a, m) => a + m.level, 0) / weekMoods.length
    : 0;

  // Total habits done this week
  const totalHabitsDone = state.completions.filter((c) => weekDates.includes(c.date)).length;

  // Mood emoji
  const moodEmoji = avgMood >= 4.5 ? "🔥" : avgMood >= 3.5 ? "😊" : avgMood >= 2.5 ? "😐" : avgMood >= 1.5 ? "😔" : "💪";

  // Motivational copy
  const getMotivationalCopy = () => {
    if (avgCompletion >= 80) {
      return lang === "fr"
        ? "Tu es en mode fantôme total. Personne ne te voit venir."
        : lang === "pt"
        ? "Você está no modo fantasma total. Ninguém está te vendo chegar."
        : "You're in full Ghost Mode. Nobody sees you coming.";
    } else if (avgCompletion >= 50) {
      return lang === "fr"
        ? "Bonne semaine. Continue à construire en silence."
        : lang === "pt"
        ? "Boa semana. Continue construindo em silêncio."
        : "Solid week. Keep building in silence.";
    } else {
      return lang === "fr"
        ? "Chaque jour compte. Recommence demain plus fort."
        : lang === "pt"
        ? "Cada dia conta. Recomece amanhã mais forte."
        : "Every day counts. Come back tomorrow stronger.";
    }
  };

  const dayLabels = lang === "fr" ? DAYS_FR : lang === "pt" ? DAYS_PT : DAYS;

  // ─── Animate on open ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      containerScale.value = withSpring(1, { damping: 14, stiffness: 120 });
      containerOpacity.value = withTiming(1, { duration: 300 });

      // Animate bars sequentially
      barHeights.forEach((bar, i) => {
        bar.value = 0;
        const targetHeight = (dailyCompletion[i] / 100) * BAR_MAX_HEIGHT;
        bar.value = withDelay(
          300 + i * 80,
          withTiming(targetHeight, { duration: 500, easing: Easing.out(Easing.cubic) })
        );
      });
    } else {
      containerScale.value = 0.8;
      containerOpacity.value = 0;
    }
  }, [visible]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: containerScale.value }],
    opacity: containerOpacity.value,
  }));

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            { backgroundColor: colors.background, borderColor: colors.accent + "40" },
            containerStyle,
          ]}
        >
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Glow header */}
            <View style={[styles.glowHeader, { backgroundColor: colors.accent + "15" }]}>
              <Text style={styles.trophy}>🏆</Text>
              <Text style={[styles.headline, { color: colors.foreground }]}>
                {lang === "fr"
                  ? "Bravo ! Une semaine complète en Ghost Mode."
                  : lang === "pt"
                  ? "Parabéns! Uma semana completa no Ghost Mode."
                  : "Bravo! You completed a full week in Ghost Mode."}
              </Text>
              <Text style={[styles.subheadline, { color: colors.accent }]}>
                {getMotivationalCopy()}
              </Text>
            </View>

            {/* Bar chart — daily completion */}
            <View style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                {lang === "fr" ? "Complétion quotidienne" : lang === "pt" ? "Conclusão diária" : "Daily Completion"}
              </Text>
              <View style={styles.barChart}>
                {barHeights.map((barHeight, i) => {
                  const barStyle = useAnimatedStyle(() => ({
                    height: barHeight.value,
                    backgroundColor:
                      dailyCompletion[i] >= 80
                        ? colors.accent
                        : dailyCompletion[i] >= 50
                        ? colors.accent + "99"
                        : colors.accent + "44",
                  }));
                  return (
                    <View key={i} style={styles.barWrapper}>
                      <View style={styles.barContainer}>
                        <Animated.View style={[styles.bar, barStyle]} />
                      </View>
                      <Text style={[styles.barLabel, { color: colors.muted }]}>{dayLabels[i]}</Text>
                      <Text style={[styles.barPct, { color: colors.muted }]}>{dailyCompletion[i]}%</Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.accent + "40" }]}>
                <Text style={[styles.statValue, { color: colors.accent }]}>{avgCompletion}%</Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>
                  {lang === "fr" ? "Moy. hebdo" : lang === "pt" ? "Média semanal" : "Weekly avg"}
                </Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.accent + "40" }]}>
                <Text style={[styles.statValue, { color: colors.accent }]}>🔥 {state.streak}</Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>
                  {lang === "fr" ? "Jours de suite" : lang === "pt" ? "Dias seguidos" : "Day streak"}
                </Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.accent + "40" }]}>
                <Text style={[styles.statValue, { color: colors.accent }]}>+{weekXpEarned}</Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>XP</Text>
              </View>
            </View>

            {/* Key insights */}
            <View style={[styles.insightCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.foreground }]}>
                {lang === "fr" ? "Points clés" : lang === "pt" ? "Pontos-chave" : "Key Insights"}
              </Text>
              <View style={styles.insightRow}>
                <Text style={styles.insightEmoji}>✅</Text>
                <Text style={[styles.insightText, { color: colors.foreground }]}>
                  {lang === "fr"
                    ? `${totalHabitsDone} habitudes complétées cette semaine`
                    : lang === "pt"
                    ? `${totalHabitsDone} hábitos concluídos esta semana`
                    : `${totalHabitsDone} habits completed this week`}
                </Text>
              </View>
              <View style={styles.insightRow}>
                <Text style={styles.insightEmoji}>{moodEmoji}</Text>
                <Text style={[styles.insightText, { color: colors.foreground }]}>
                  {lang === "fr"
                    ? `Humeur moyenne : ${avgMood > 0 ? avgMood.toFixed(1) : "—"}/5`
                    : lang === "pt"
                    ? `Humor médio: ${avgMood > 0 ? avgMood.toFixed(1) : "—"}/5`
                    : `Average mood: ${avgMood > 0 ? avgMood.toFixed(1) : "—"}/5`}
                </Text>
              </View>
              <View style={styles.insightRow}>
                <Text style={styles.insightEmoji}>⚡</Text>
                <Text style={[styles.insightText, { color: colors.foreground }]}>
                  {lang === "fr"
                    ? `+${weekXpEarned} XP gagnés cette semaine`
                    : lang === "pt"
                    ? `+${weekXpEarned} XP ganhos esta semana`
                    : `+${weekXpEarned} XP earned this week`}
                </Text>
              </View>
            </View>

            {/* CTA */}
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onDismiss();
              }}
              activeOpacity={0.6}
            >
              <Text style={styles.ctaText}>
                {lang === "fr" ? "Continuer à grinder 🔥" : lang === "pt" ? "Continuar grindando 🔥" : "Keep Grinding 🔥"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  container: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1.5,
    maxHeight: "90%",
    overflow: "hidden",
  },
  scrollContent: {
    padding: 24,
    gap: 16,
  },
  glowHeader: {
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  trophy: {
    fontSize: 48,
  },
  headline: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subheadline: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    fontStyle: "italic",
  },
  chartCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  barChart: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: BAR_MAX_HEIGHT + 36,
  },
  barWrapper: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  barContainer: {
    width: "70%",
    height: BAR_MAX_HEIGHT,
    justifyContent: "flex-end",
  },
  bar: {
    width: "100%",
    borderRadius: 4,
    minHeight: 4,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  barPct: {
    fontSize: 9,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
  },
  insightCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  insightRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  insightEmoji: {
    fontSize: 18,
  },
  insightText: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  ctaButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.2,
  },
});
