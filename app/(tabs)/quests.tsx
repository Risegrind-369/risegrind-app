import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Modal,
  Alert,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/lib/language-context";
import { getSideQuestTranslation } from "@/lib/translations-helper";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp, type SideQuest } from "@/lib/app-context";
import * as Haptics from "expo-haptics";

const CATEGORY_LABELS_EN: Record<SideQuest["category"], string> = {
  discipline: "Discipline",
  wellness: "Wellness",
  mindset: "Mindset",
  body: "Body",
};

const CATEGORY_LABELS_FR: Record<SideQuest["category"], string> = {
  discipline: "Discipline",
  wellness: "Bien-être",
  mindset: "Mentalité",
  body: "Corps",
};

const CATEGORY_LABELS_PT: Record<SideQuest["category"], string> = {
  discipline: "Disciplina",
  wellness: "Bem-estar",
  mindset: "Mentalidade",
  body: "Corpo",
};

function getCategoryLabel(category: SideQuest["category"], lang: "en" | "fr" | "pt"): string {
  const labels = lang === "fr" ? CATEGORY_LABELS_FR : lang === "pt" ? CATEGORY_LABELS_PT : CATEGORY_LABELS_EN;
  return labels[category];
}

const CATEGORY_COLORS: Record<SideQuest["category"], string> = {
  discipline: "#6366F1",
  wellness: "#22C55E",
  mindset: "#F59E0B",
  body: "#EF4444",
};

function getDaysElapsed(startedAt: number): number {
  return Math.floor((Date.now() - startedAt) / (1000 * 60 * 60 * 24));
}

function QuestCard({
  quest,
  onPress,
  lang,
  t,
}: {
  quest: SideQuest;
  onPress: () => void;
  lang: "en" | "fr" | "pt";
  t: (key: string, values?: Record<string, any>) => string;
}) {
  const colors = useColors();
  const isActive = !!quest.startedAt && !quest.completedAt;
  const isCompleted = !!quest.completedAt;
  const isAvailable = !quest.startedAt && !quest.completedAt;

  const daysElapsed = isActive ? getDaysElapsed(quest.startedAt!) : 0;
  const progress = isActive ? Math.min(daysElapsed / quest.durationDays, 1) : isCompleted ? 1 : 0;
  const catColor = CATEGORY_COLORS[quest.category];

  return (
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onPress();
              }}
      style={({ pressed }) => [
        styles.questCard,
        {
          backgroundColor: colors.surface,
          borderColor: isActive ? catColor + "60" : isCompleted ? colors.success + "40" : colors.border,
          borderWidth: isActive ? 1.5 : 1,
          opacity: pressed ? 0.9 : 1,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      {/* Status badge */}
      {isCompleted && (
        <View style={[styles.statusBadge, { backgroundColor: colors.success + "20" }]}>
          <Text style={[styles.statusBadgeText, { color: colors.success }]}>✓ {lang === "fr" ? "COMPLÉTÉE" : lang === "pt" ? "CONCLUÍDA" : "COMPLETED"}</Text>
        </View>
      )}
      {isActive && (
        <View style={[styles.statusBadge, { backgroundColor: catColor + "20" }]}>
          <Text style={[styles.statusBadgeText, { color: catColor }]}>⚡ {lang === "fr" ? "EN COURS" : lang === "pt" ? "EM PROGRESSO" : "IN PROGRESS"}</Text>
        </View>
      )}

      <View style={styles.questHeader}>
        <Text style={styles.questIcon}>{quest.icon}</Text>
        <View style={styles.questInfo}>
          <Text style={[styles.questTitle, { color: colors.foreground }]}>{quest.title}</Text>
          <View style={styles.questMeta}>
            <View style={[styles.catBadge, { backgroundColor: catColor + "20" }]}>
              <Text style={[styles.catBadgeText, { color: catColor }]}>
                {getCategoryLabel(quest.category, lang)}
              </Text>
            </View>
                <Text style={[styles.questDuration, { color: colors.muted }]}>
              {t("quests.durationFormat", { days: quest.durationDays, xp: quest.xpReward })}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.questDesc, { color: colors.muted }]} numberOfLines={2}>
        {quest.description}
      </Text>

      {/* Progress bar for active quests */}
      {isActive && (
        <View style={styles.progressSection}>
          <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
            <View
              style={[
                styles.progressFill,
                { width: `${progress * 100}%` as `${number}%`, backgroundColor: catColor },
              ]}
            />
          </View>
          <Text style={[styles.progressText, { color: colors.muted }]}>
            {t("quests.progressFormat", { current: daysElapsed, total: quest.durationDays })}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export default function QuestsScreen() {
  const colors = useColors();
  const { state, dispatch } = useApp();
  const { t, i18n } = useTranslation();
  const { language: userLanguage } = useLanguage();
  const lang = (userLanguage || i18n.language || "en") as "en" | "fr" | "pt";
  const [selectedQuest, setSelectedQuest] = useState<SideQuest | null>(null);
  const [shareQuest, setShareQuest] = useState<SideQuest | null>(null);
  const [filter, setFilter] = useState<"all" | "active" | "available" | "completed">("all");

  const quests = state.sideQuests ?? [];

  const activeQuests = quests.filter((q) => !!q.startedAt && !q.completedAt);
  const completedQuests = quests.filter((q) => !!q.completedAt);
  const availableQuests = quests.filter((q) => !q.startedAt && !q.completedAt);

  const filteredQuests = filter === "active"
    ? activeQuests
    : filter === "completed"
    ? completedQuests
    : filter === "available"
    ? availableQuests
    : quests;

  const handleStart = (quest: SideQuest) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    dispatch({ type: "START_SIDE_QUEST", payload: quest.id });
    setSelectedQuest(null);
  };

  const handleComplete = (quest: SideQuest) => {
    Alert.alert(
      lang === "fr" ? "Marquer comme terminé ?" : lang === "pt" ? "Marcar como concluído?" : "Mark as Complete?",
      `${lang === "fr" ? "Terminer" : lang === "pt" ? "Concluir" : "Complete"} "${quest.title}" ${lang === "fr" ? "et gagner" : lang === "pt" ? "e ganhar" : "and earn"} ${quest.xpReward} XP?`,
      [
        { text: lang === "fr" ? "Pas encore" : lang === "pt" ? "Ainda não" : "Not yet", style: "cancel" },
        {
          text: lang === "fr" ? "Terminer" : lang === "pt" ? "Concluir" : "Complete",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            dispatch({ type: "COMPLETE_SIDE_QUEST", payload: quest.id });
            setSelectedQuest(null);
            setShareQuest(quest);
          },
        },
      ]
    );
  };

  const handleAbandon = (quest: SideQuest) => {
    Alert.alert(
      lang === "fr" ? "Abandonner la mission ?" : lang === "pt" ? "Abandonar a missão?" : "Abandon Quest?",
      lang === "fr" ? "Votre progression sera perdue. Ghost Mode ne renonce pas — mais le choix est vôtre." : lang === "pt" ? "Seu progresso será perdido. Ghost Mode não desiste — mas a escolha é sua." : "Your progress will be lost. Ghost Mode doesn't quit — but the choice is yours.",
      [
        { text: lang === "fr" ? "Continuer" : lang === "pt" ? "Continuar" : "Keep Going", style: "cancel" },
        {
          text: lang === "fr" ? "Abandonner" : lang === "pt" ? "Abandonar" : "Abandon",
          style: "destructive",
          onPress: () => {
            dispatch({ type: "ABANDON_SIDE_QUEST", payload: quest.id });
            setSelectedQuest(null);
          },
        },
      ]
    );
  };

  const FILTERS: { key: typeof filter; label: string; count: number }[] = [
    { key: "all", label: lang === "fr" ? "Tout" : lang === "pt" ? "Todos" : "All", count: quests.length },
    { key: "active", label: lang === "fr" ? "Actif" : lang === "pt" ? "Ativo" : "Active", count: activeQuests.length },
    { key: "available", label: lang === "fr" ? "Disponible" : lang === "pt" ? "Disponível" : "Available", count: availableQuests.length },
    { key: "completed", label: lang === "fr" ? "Terminé" : lang === "pt" ? "Concluído" : "Done", count: completedQuests.length },
  ];

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>{lang === "fr" ? "Missions Ghost" : lang === "pt" ? "Missões Ghost" : "Side Quests"}</Text>
          <Text style={[styles.headerSub, { color: colors.muted }]}>
            {lang === "fr" ? "Missions bonus. XP supplémentaire. Ghost Mode activé." : lang === "pt" ? "Missões bônus. XP extra. Ghost Mode desbloqueado." : "Bonus missions. Extra XP. Ghost Mode unlocked."}
          </Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>⚡</Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{activeQuests.length}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>{lang === "fr" ? "Actif" : lang === "pt" ? "Ativo" : "Active"}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{completedQuests.length}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>{lang === "fr" ? "Terminé" : lang === "pt" ? "Concluído" : "Completed"}</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {completedQuests.reduce((sum, q) => sum + q.xpReward, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>{lang === "fr" ? "XP Gagné" : lang === "pt" ? "XP Ganho" : "XP Earned"}</Text>
          </View>
        </View>

        {/* Ghost Mode callout */}
        <View style={[styles.callout, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
          <Text style={[styles.calloutText, { color: colors.foreground }]}>
            👻 <Text style={{ fontWeight: "700" }}>{lang === "fr" ? "Missions Ghost Mode" : lang === "pt" ? "Missões Ghost Mode" : "Ghost Mode missions"}</Text> {lang === "fr" ? "sont des défis bonus optionnels qui vous poussent au-delà de votre routine quotidienne. Terminez-les pour gagner des XP supplémentaires et débloquer des badges exclusifs." : lang === "pt" ? "são desafios bônus opcionais que te empurram além da sua rotina diária. Conclua-os para ganhar XP extra e desbloquear badges exclusivos." : "are optional bonus challenges that push you beyond your daily routine. Complete them to earn extra XP and unlock exclusive badges."}
          </Text>
        </View>

        {/* Filter tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <View style={styles.filterRow}>
            {FILTERS.map((f) => (
              <Pressable
                key={f.key}
                onPress={() => {
                  setFilter(f.key);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.filterTab,
                  {
                    backgroundColor: filter === f.key ? colors.primary : colors.surface,
                    borderColor: filter === f.key ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: filter === f.key ? "#fff" : colors.foreground },
                  ]}
                >
                  {f.label} {f.count > 0 ? `(${f.count})` : ""}
                </Text>
              </Pressable>
            ))}
          </View>
        </ScrollView>

        {/* Quest list */}
        {filteredQuests.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {filter === "completed" ? (lang === "fr" ? "Aucune mission terminée" : lang === "pt" ? "Nenhuma missão concluída" : "No completed quests yet") : (lang === "fr" ? "Aucune mission ici" : lang === "pt" ? "Nenhuma missão aqui" : "No quests here")}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.muted }]}>
                {filter === "completed"
                ? (lang === "fr" ? "Terminez une mission pour la voir ici." : lang === "pt" ? "Conclua uma missão para vê-la aqui." : "Complete a quest to see it here.")
                : (lang === "fr" ? "Passez à Disponible pour commencer une mission." : lang === "pt" ? "Mude para Disponível para iniciar uma missão." : "Switch to Available to start a quest.")}
            </Text>
          </View>
        ) : (
          filteredQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onPress={() => setSelectedQuest(quest)}
              lang={lang}
              t={t}
            />
          ))
        )}
      </ScrollView>

      {/* Quest Detail Modal */}
      <Modal
        visible={!!selectedQuest}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedQuest(null)}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setSelectedQuest(null)} />
          {selectedQuest && (
            <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
              <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

              <Text style={styles.modalIcon}>{selectedQuest.icon}</Text>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>{selectedQuest.title}</Text>

              <View style={styles.modalMeta}>
                <View style={[styles.catBadge, { backgroundColor: CATEGORY_COLORS[selectedQuest.category] + "20" }]}>
                  <Text style={[styles.catBadgeText, { color: CATEGORY_COLORS[selectedQuest.category] }]}>
                    {getCategoryLabel(selectedQuest.category, lang)}
                  </Text>
                </View>
                <Text style={[styles.questDuration, { color: colors.muted }]}>
                  {t("quests.durationFormat", { days: selectedQuest.durationDays, xp: selectedQuest.xpReward })}
                </Text>
              </View>

              <Text style={[styles.modalDesc, { color: colors.muted }]}>{selectedQuest.description}</Text>

              {/* Active progress */}
              {selectedQuest.startedAt && !selectedQuest.completedAt && (
                <View style={[styles.activeInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.activeInfoText, { color: colors.foreground }]}>
                    {t("quests.progressFormat", { current: getDaysElapsed(selectedQuest.startedAt), total: selectedQuest.durationDays })}
                  </Text>
                  <View style={[styles.progressTrack, { backgroundColor: colors.border }]}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${Math.min(getDaysElapsed(selectedQuest.startedAt) / selectedQuest.durationDays, 1) * 100}%` as `${number}%`,
                          backgroundColor: CATEGORY_COLORS[selectedQuest.category],
                        },
                      ]}
                    />
                  </View>
                </View>
              )}

              {/* Actions */}
              <View style={styles.modalActions}>
                {!selectedQuest.startedAt && !selectedQuest.completedAt && (
                  <Pressable
                    onPress={() => handleStart(selectedQuest)}
                    style={[styles.actionBtn, { backgroundColor: colors.primary }]}
                  >
                    <Text style={styles.actionBtnText}>⚡ {lang === "fr" ? "Accepter la mission" : lang === "pt" ? "Aceitar missão" : "Accept Mission"}</Text>
                  </Pressable>
                )}
                {selectedQuest.startedAt && !selectedQuest.completedAt && (
                  <>
                    <Pressable
                      onPress={() => handleComplete(selectedQuest)}
                      style={[styles.actionBtn, { backgroundColor: colors.success }]}
                    >
                      <Text style={styles.actionBtnText}>✓ {lang === "fr" ? "Marquer terminé" : lang === "pt" ? "Marcar concluído" : "Mark Complete"}</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleAbandon(selectedQuest)}
                      style={[styles.abandonBtn, { borderColor: colors.error }]}
                    >
                      <Text style={[styles.abandonBtnText, { color: colors.error }]}>{lang === "fr" ? "Abandonner" : lang === "pt" ? "Abandonar" : "Abandon Quest"}</Text>
                    </Pressable>
                  </>
                )}
                {selectedQuest.completedAt && (
                  <View style={[styles.completedBanner, { backgroundColor: colors.success + "15" }]}>
                    <Text style={[styles.completedBannerText, { color: colors.success }]}>
                      ✓ {lang === "fr" ? "Mission terminée" : lang === "pt" ? "Missão concluída" : "Quest completed"} · +{selectedQuest.xpReward} XP {lang === "fr" ? "gagné" : lang === "pt" ? "ganho" : "earned"}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </Modal>

      {/* Quest Completed Share Modal */}
      <Modal
        visible={!!shareQuest}
        transparent
        animationType="fade"
        onRequestClose={() => setShareQuest(null)}
      >
        <View style={[styles.modalOverlay, { justifyContent: "center", paddingHorizontal: 24 }]}>
          <Pressable style={[styles.modalBackdrop, { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }]} onPress={() => setShareQuest(null)} />
          {shareQuest && (
            <View style={[styles.shareCard, { backgroundColor: "#0D0D0F", borderColor: "#333" }]}>
              <Text style={{ fontSize: 60, textAlign: "center", marginBottom: 8 }}>{shareQuest.icon}</Text>
              <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 3, color: "#888", textAlign: "center", marginBottom: 4 }}>
                {lang === "fr" ? "MISSION TERMINÉE" : lang === "pt" ? "MISSÃO CONCLUÍDA" : "QUEST COMPLETED"}
              </Text>
              <Text style={{ fontSize: 22, fontWeight: "900", color: "#fff", textAlign: "center", marginBottom: 4 }}>
                {shareQuest.title}
              </Text>
              <Text style={{ fontSize: 13, color: "#888", textAlign: "center", marginBottom: 16 }}>
                +{shareQuest.xpReward} XP · {lang === "fr" ? "Ghost Mode activé" : lang === "pt" ? "Ghost Mode ativo" : "Ghost Mode active"}
              </Text>
              <Text style={{ fontSize: 16, fontStyle: "italic", color: "#aaa", textAlign: "center", marginBottom: 24, lineHeight: 24 }}>
                {lang === "fr" ? "“La discipline est la seule voie.”" : lang === "pt" ? "“A disciplina é o único caminho.”" : "“Discipline is the only way.”"}
              </Text>
              <Text style={{ fontSize: 11, color: "#555", textAlign: "center", marginBottom: 20 }}>risegrind.app</Text>
              <View style={{ gap: 10 }}>
                <Pressable
                  onPress={() => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    setShareQuest(null);
                  }}
                  style={({ pressed }) => ({
                    backgroundColor: "#fff",
                    paddingVertical: 14,
                    borderRadius: 14,
                    alignItems: "center",
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text style={{ color: "#000", fontSize: 16, fontWeight: "800" }}>
                    📸 {lang === "fr" ? "Partager sur Stories" : lang === "pt" ? "Compartilhar nos Stories" : "Share to Stories"}
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setShareQuest(null)}
                  style={({ pressed }) => ({
                    paddingVertical: 12,
                    borderRadius: 14,
                    alignItems: "center",
                    opacity: pressed ? 0.6 : 1,
                  })}
                >
                  <Text style={{ color: "#666", fontSize: 14 }}>
                    {lang === "fr" ? "Fermer" : lang === "pt" ? "Fechar" : "Close"}
                  </Text>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    gap: 4,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 14,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: "center",
    borderWidth: 1,
    gap: 4,
  },
  statEmoji: {
    fontSize: 20,
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
  callout: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  calloutText: {
    fontSize: 14,
    lineHeight: 21,
  },
  filterScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  filterRow: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 20,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "600",
  },
  questCard: {
    borderRadius: 18,
    padding: 16,
    gap: 10,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  questHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  questIcon: {
    fontSize: 32,
    marginTop: 2,
  },
  questInfo: {
    flex: 1,
    gap: 6,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  questMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  catBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  questDuration: {
    fontSize: 12,
    fontWeight: "500",
  },
  questDesc: {
    fontSize: 14,
    lineHeight: 20,
  },
  progressSection: {
    gap: 6,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: 6,
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
  },
  emptyState: {
    borderRadius: 18,
    padding: 32,
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
  },
  emptyEmoji: {
    fontSize: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  emptyDesc: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 48,
    gap: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  modalIcon: {
    fontSize: 48,
    textAlign: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  modalMeta: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
  },
  modalDesc: {
    fontSize: 15,
    lineHeight: 23,
    textAlign: "center",
  },
  activeInfo: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  activeInfoText: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
  modalActions: {
    gap: 10,
    marginTop: 4,
  },
  actionBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  actionBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  abandonBtn: {
    height: 44,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  abandonBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  completedBanner: {
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  completedBannerText: {
    fontSize: 15,
    fontWeight: "700",
  },
  shareCard: {
    borderRadius: 24,
    padding: 28,
    borderWidth: 1,
    alignItems: "center",
  },
});
