import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Switch,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import {
  useApp,
  getRank,
  getNextRankXP,
  RANK_THRESHOLDS,
  ALL_ACHIEVEMENTS,
  type Rank,
} from "@/lib/app-context";
import { XPBar } from "@/components/ui/xp-bar";
import { useRevenueCat } from "@/lib/revenuecat-provider";
import { useColorScheme } from "@/hooks/use-color-scheme";
import * as Haptics from "expo-haptics";

const RANK_ICONS: Record<Rank, string> = {
  "Early Riser": "🌅",
  "Morning Warrior": "⚔️",
  "Grind Master": "💎",
  "Grind Legend": "👑",
};

const RANK_COLORS: Record<Rank, string> = {
  "Early Riser": "#F97316",
  "Morning Warrior": "#3B82F6",
  "Grind Master": "#8B5CF6",
  "Grind Legend": "#F59E0B",
};

export default function ProfileScreen() {
  const colors = useColors();
  const { state, dispatch } = useApp();
  const { isPremium, restorePurchases } = useRevenueCat();
  const colorScheme = useColorScheme();
  const [showNameEdit, setShowNameEdit] = useState(false);
  const [editName, setEditName] = useState(state.userName);

  const rank = getRank(state.xp);
  const nextXP = getNextRankXP(state.xp);
  const rankColor = RANK_COLORS[rank];
  const rankIcon = RANK_ICONS[rank];

  // Find next rank
  const currentRankIdx = RANK_THRESHOLDS.findIndex((t) => t.rank === rank);
  const nextRank = RANK_THRESHOLDS[currentRankIdx + 1];

  const totalHabitsCompleted = state.completions.length;
  const unlockedAchievements = state.achievements.filter((a) => a.unlockedAt);

  const handleSaveName = () => {
    const trimmed = editName.trim() || state.userName;
    dispatch({ type: "SET_ONBOARDED", payload: { userName: trimmed } });
    setShowNameEdit(false);
  };

  const handleResetData = () => {
    Alert.alert(
      "Reset All Data",
      "This will permanently delete all your habits, journal entries, moods, and progress. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            Alert.alert("Feature", "Data reset would clear AsyncStorage in production.");
          },
        },
      ]
    );
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: rankColor + "15", borderColor: rankColor + "30" }]}>
          <View style={[styles.avatarContainer, { backgroundColor: rankColor + "25" }]}>
            <Text style={styles.avatarEmoji}>{rankIcon}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Pressable
              onPress={() => setShowNameEdit(true)}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text style={[styles.profileName, { color: colors.foreground }]}>
                {state.userName || "Friend"} ✏️
              </Text>
            </Pressable>
            <View style={[styles.rankBadge, { backgroundColor: rankColor }]}>
              <Text style={styles.rankBadgeText}>{rank}</Text>
            </View>
            {nextRank && (
              <Text style={[styles.nextRankText, { color: colors.muted }]}>
                {nextXP - state.xp} XP to {nextRank.rank}
              </Text>
            )}
          </View>
        </View>

        {/* XP Bar */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <XPBar xp={state.xp} />
        </View>

        {/* Stats Grid */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Your Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>🔥</Text>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{state.streak}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Day Streak</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>⚡</Text>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{state.xp.toLocaleString()}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Total XP</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>✅</Text>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{totalHabitsCompleted}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Habits Done</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <View style={styles.statItem}>
              <Text style={styles.statEmoji}>📖</Text>
              <Text style={[styles.statValue, { color: colors.foreground }]}>{state.journalEntries.length}</Text>
              <Text style={[styles.statLabel, { color: colors.muted }]}>Journal Entries</Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>
            Achievements ({unlockedAchievements.length}/{ALL_ACHIEVEMENTS.length})
          </Text>
          <View style={styles.achievementsGrid}>
            {ALL_ACHIEVEMENTS.map((achievement) => {
              const isUnlocked = !!achievement.unlockedAt || !!state.achievements.find(a => a.id === achievement.id)?.unlockedAt;
              return (
                <View
                  key={achievement.id}
                  style={[
                    styles.achievementItem,
                    {
                      backgroundColor: isUnlocked ? colors.primary + "15" : colors.border + "40",
                      borderColor: isUnlocked ? colors.primary + "40" : colors.border,
                      opacity: isUnlocked ? 1 : 0.5,
                    },
                  ]}
                >
                  <Text style={[styles.achievementIcon, { opacity: isUnlocked ? 1 : 0.4 }]}>
                    {achievement.icon}
                  </Text>
                  <Text style={[styles.achievementTitle, { color: colors.foreground }]} numberOfLines={1}>
                    {achievement.title}
                  </Text>
                  <Text style={[styles.achievementDesc, { color: colors.muted }]} numberOfLines={2}>
                    {achievement.description}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Subscription */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Subscription</Text>
          <View style={styles.subscriptionRow}>
            <View style={[styles.premiumBadge, { backgroundColor: isPremium ? "#F59E0B20" : colors.border }]}>
              <Text style={styles.premiumBadgeEmoji}>{isPremium ? "👑" : "🔒"}</Text>
              <Text style={[styles.premiumBadgeText, { color: isPremium ? "#F59E0B" : colors.muted }]}>
                {isPremium ? "Premium Active" : "Free Plan"}
              </Text>
            </View>
            <Pressable
              onPress={() => restorePurchases()}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
            >
              <Text style={[styles.restoreText, { color: colors.primary }]}>Restore</Text>
            </Pressable>
          </View>
        </View>

        {/* Settings */}
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.cardTitle, { color: colors.foreground }]}>Settings</Text>

          <View style={styles.settingRow}>
            <Text style={styles.settingEmoji}>🌙</Text>
            <Text style={[styles.settingLabel, { color: colors.foreground }]}>Appearance</Text>
            <Text style={[styles.settingValue, { color: colors.muted }]}>
              {colorScheme === "dark" ? "Dark" : "Light"}
            </Text>
          </View>

          <View style={[styles.settingDivider, { backgroundColor: colors.border }]} />

          <Pressable
            onPress={handleResetData}
            style={({ pressed }) => [styles.settingRow, { opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={styles.settingEmoji}>🗑️</Text>
            <Text style={[styles.settingLabel, { color: colors.error }]}>Reset All Data</Text>
          </Pressable>
        </View>

        {/* App Info */}
        <Text style={[styles.appInfo, { color: colors.muted }]}>
          RiseGrind v1.0.0 · Built with ❤️
        </Text>
      </ScrollView>

      {/* Name Edit Modal */}
      <Modal
        visible={showNameEdit}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNameEdit(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Edit Name</Text>
            <TextInput
              style={[styles.nameInput, { backgroundColor: colors.surface, borderColor: colors.border, color: colors.foreground }]}
              value={editName}
              onChangeText={setEditName}
              autoFocus
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
              maxLength={30}
            />
            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setShowNameEdit(false)}
                style={[styles.modalCancel, { borderColor: colors.border }]}
              >
                <Text style={[styles.modalCancelText, { color: colors.muted }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveName}
                style={[styles.modalSave, { backgroundColor: colors.primary }]}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
    gap: 16,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarEmoji: {
    fontSize: 36,
  },
  profileInfo: {
    flex: 1,
    gap: 6,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  rankBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  rankBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  nextRankText: {
    fontSize: 12,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 14,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statEmoji: {
    fontSize: 20,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "500",
    textAlign: "center",
  },
  statDivider: {
    width: 1,
    height: "80%",
    alignSelf: "center",
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  achievementItem: {
    width: "47%",
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    gap: 4,
    alignItems: "center",
  },
  achievementIcon: {
    fontSize: 28,
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: "700",
    textAlign: "center",
  },
  achievementDesc: {
    fontSize: 11,
    textAlign: "center",
    lineHeight: 15,
  },
  subscriptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  premiumBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  premiumBadgeEmoji: {
    fontSize: 18,
  },
  premiumBadgeText: {
    fontSize: 14,
    fontWeight: "700",
  },
  restoreText: {
    fontSize: 14,
    fontWeight: "600",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingEmoji: {
    fontSize: 20,
    width: 28,
  },
  settingLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
  },
  settingValue: {
    fontSize: 14,
  },
  settingDivider: {
    height: 1,
    marginVertical: 4,
  },
  appInfo: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 8,
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
    paddingBottom: 48,
    gap: 16,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
  },
  nameInput: {
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    fontSize: 17,
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancel: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "600",
  },
  modalSave: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSaveText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
