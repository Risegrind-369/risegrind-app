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
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp, type SideQuest } from "@/lib/app-context";
import * as Haptics from "expo-haptics";

const CATEGORY_LABELS: Record<SideQuest["category"], string> = {
  discipline: "Discipline",
  wellness: "Wellness",
  mindset: "Mindset",
  body: "Body",
};

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
}: {
  quest: SideQuest;
  onPress: () => void;
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
          <Text style={[styles.statusBadgeText, { color: colors.success }]}>✓ COMPLETED</Text>
        </View>
      )}
      {isActive && (
        <View style={[styles.statusBadge, { backgroundColor: catColor + "20" }]}>
          <Text style={[styles.statusBadgeText, { color: catColor }]}>⚡ IN PROGRESS</Text>
        </View>
      )}

      <View style={styles.questHeader}>
        <Text style={styles.questIcon}>{quest.icon}</Text>
        <View style={styles.questInfo}>
          <Text style={[styles.questTitle, { color: colors.foreground }]}>{quest.title}</Text>
          <View style={styles.questMeta}>
            <View style={[styles.catBadge, { backgroundColor: catColor + "20" }]}>
              <Text style={[styles.catBadgeText, { color: catColor }]}>
                {CATEGORY_LABELS[quest.category]}
              </Text>
            </View>
            <Text style={[styles.questDuration, { color: colors.muted }]}>
              {quest.durationDays}d · +{quest.xpReward} XP
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
            Day {daysElapsed} of {quest.durationDays}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

export default function QuestsScreen() {
  const colors = useColors();
  const { state, dispatch } = useApp();
  const [selectedQuest, setSelectedQuest] = useState<SideQuest | null>(null);
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
      "Mark as Complete?",
      `Complete "${quest.title}" and earn ${quest.xpReward} XP?`,
      [
        { text: "Not yet", style: "cancel" },
        {
          text: "Complete",
          onPress: () => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            dispatch({ type: "COMPLETE_SIDE_QUEST", payload: quest.id });
            setSelectedQuest(null);
          },
        },
      ]
    );
  };

  const handleAbandon = (quest: SideQuest) => {
    Alert.alert(
      "Abandon Quest?",
      "Your progress will be lost. Ghost Mode doesn't quit — but the choice is yours.",
      [
        { text: "Keep Going", style: "cancel" },
        {
          text: "Abandon",
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
    { key: "all", label: "All", count: quests.length },
    { key: "active", label: "Active", count: activeQuests.length },
    { key: "available", label: "Available", count: availableQuests.length },
    { key: "completed", label: "Done", count: completedQuests.length },
  ];

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Side Quests</Text>
          <Text style={[styles.headerSub, { color: colors.muted }]}>
            Bonus missions. Extra XP. Ghost Mode unlocked.
          </Text>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>⚡</Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{activeQuests.length}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Active</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>✅</Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>{completedQuests.length}</Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>Completed</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={[styles.statValue, { color: colors.foreground }]}>
              {completedQuests.reduce((sum, q) => sum + q.xpReward, 0)}
            </Text>
            <Text style={[styles.statLabel, { color: colors.muted }]}>XP Earned</Text>
          </View>
        </View>

        {/* Ghost Mode callout */}
        <View style={[styles.callout, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
          <Text style={[styles.calloutText, { color: colors.foreground }]}>
            👻 <Text style={{ fontWeight: "700" }}>Ghost Mode missions</Text> are optional bonus challenges that push you beyond your daily routine. Complete them to earn extra XP and unlock exclusive badges.
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
                    { color: filter === f.key ? "#fff" : colors.muted },
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
              {filter === "completed" ? "No completed quests yet" : "No quests here"}
            </Text>
            <Text style={[styles.emptyDesc, { color: colors.muted }]}>
              {filter === "completed"
                ? "Complete a quest to see it here."
                : "Switch to Available to start a quest."}
            </Text>
          </View>
        ) : (
          filteredQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onPress={() => setSelectedQuest(quest)}
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
                    {CATEGORY_LABELS[selectedQuest.category]}
                  </Text>
                </View>
                <Text style={[styles.questDuration, { color: colors.muted }]}>
                  {selectedQuest.durationDays} days · +{selectedQuest.xpReward} XP
                </Text>
              </View>

              <Text style={[styles.modalDesc, { color: colors.muted }]}>{selectedQuest.description}</Text>

              {/* Active progress */}
              {selectedQuest.startedAt && !selectedQuest.completedAt && (
                <View style={[styles.activeInfo, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Text style={[styles.activeInfoText, { color: colors.foreground }]}>
                    Day {getDaysElapsed(selectedQuest.startedAt)} of {selectedQuest.durationDays}
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
                    <Text style={styles.actionBtnText}>⚡ Accept Mission</Text>
                  </Pressable>
                )}
                {selectedQuest.startedAt && !selectedQuest.completedAt && (
                  <>
                    <Pressable
                      onPress={() => handleComplete(selectedQuest)}
                      style={[styles.actionBtn, { backgroundColor: colors.success }]}
                    >
                      <Text style={styles.actionBtnText}>✓ Mark Complete</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => handleAbandon(selectedQuest)}
                      style={[styles.abandonBtn, { borderColor: colors.error }]}
                    >
                      <Text style={[styles.abandonBtnText, { color: colors.error }]}>Abandon Quest</Text>
                    </Pressable>
                  </>
                )}
                {selectedQuest.completedAt && (
                  <View style={[styles.completedBanner, { backgroundColor: colors.success + "15" }]}>
                    <Text style={[styles.completedBannerText, { color: colors.success }]}>
                      ✓ Quest completed · +{selectedQuest.xpReward} XP earned
                    </Text>
                  </View>
                )}
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
});
