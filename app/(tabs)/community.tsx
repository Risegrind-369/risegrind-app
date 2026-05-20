import React, { useState } from "react";
import { View, Text, ScrollView, TextInput, StyleSheet, Alert, Share, Platform, TouchableOpacity } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Haptics from "expo-haptics";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp, getRank, type GhostFriend } from "@/lib/app-context";
import { useTranslation } from "react-i18next";

// ─── Rank medal helper ────────────────────────────────────────────────────────
function rankMedal(xp: number): string {
  if (xp >= 3500) return "💀";
  if (xp >= 1500) return "👻";
  if (xp >= 500) return "🌙";
  return "🌅";
}

// ─── Leaderboard Entry ────────────────────────────────────────────────────────
function LeaderboardRow({
  position,
  name,
  streak,
  xp,
  isYou,
}: {
  position: number;
  name: string;
  streak: number;
  xp: number;
  isYou: boolean;
}) {
  const colors = useColors();
  const { t } = useTranslation();
  const rank = getRank(xp);
  const medal = rankMedal(xp);
  const posEmoji = position === 1 ? "🥇" : position === 2 ? "🥈" : position === 3 ? "🥉" : `#${position}`;

  return (
    <View
      style={[
        styles.leaderboardRow,
        {
          backgroundColor: isYou ? colors.primary + "18" : colors.surface,
          borderColor: isYou ? colors.primary + "50" : colors.border,
          borderWidth: isYou ? 1.5 : 1,
        },
      ]}
    >
      <Text style={styles.positionText}>{posEmoji}</Text>
      <Text style={styles.medalText}>{medal}</Text>
      <View style={styles.leaderboardInfo}>
        <View style={styles.leaderboardNameRow}>
          <Text style={[styles.leaderboardName, { color: colors.foreground }]}>
            {name}
            {isYou && (
              <Text style={[styles.youBadge, { color: colors.primary }]}>
                {" "}({t("community.you")})
              </Text>
            )}
          </Text>
        </View>
        <Text style={[styles.leaderboardRank, { color: colors.muted }]}>
          {t(`ranks.${rank}`)} · {xp.toLocaleString()} XP
        </Text>
      </View>
      <View style={styles.streakBadge}>
        <Text style={styles.streakFire}>🔥</Text>
        <Text style={[styles.streakCount, { color: colors.foreground }]}>{streak}</Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function CommunityScreen() {
  const colors = useColors();
  const { state, dispatch } = useApp();
  const { t } = useTranslation();
  const [friendCode, setFriendCode] = useState("");
  const [adding, setAdding] = useState(false);

  // Build leaderboard: self + friends, sorted by XP desc
  const allPlayers = [
    { code: state.ghostCode, name: state.userName || "You", streak: state.streak, xp: state.xp, isYou: true },
    ...state.friends.map((f) => ({ ...f, isYou: false })),
  ].sort((a, b) => b.xp - a.xp);

  const handleCopyCode = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Clipboard.setStringAsync(state.ghostCode);
    Alert.alert("👻", t("community.codeCopied"));
  };

  const handleShare = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Share.share({
        title: t("community.shareTitle"),
        message: `${t("community.shareMsg")}${state.ghostCode} — https://risegrind.app`,
      });
    } catch {
      // user dismissed
    }
  };

  const handleAddFriend = () => {
    const code = friendCode.trim().toUpperCase();
    if (code.length !== 6) {
      Alert.alert("👻", t("community.invalidCode"));
      return;
    }
    if (code === state.ghostCode) {
      Alert.alert("👻", "That's your own code!");
      return;
    }
    if (state.friends.some((f) => f.code === code)) {
      Alert.alert("👻", t("community.friendAdded"));
      return;
    }

    setAdding(true);
    // In a real app this would hit the server. For now we simulate a "found" ghost.
    setTimeout(() => {
      setAdding(false);
      // Simulate a friend with random stats
      const simulatedFriend: GhostFriend = {
        code,
        name: `Ghost_${code.slice(0, 4)}`,
        streak: Math.floor(Math.random() * 20) + 1,
        xp: Math.floor(Math.random() * 2000) + 100,
        addedAt: Date.now(),
      };
      dispatch({ type: "ADD_FRIEND", payload: simulatedFriend });
      setFriendCode("");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert("👻", t("community.friendAdded"));
    }, 800);
  };

  const handleRemoveFriend = (code: string, name: string) => {
    Alert.alert(
      "Remove Ghost",
      `Remove ${name} from your crew?`,
      [
        { text: t("common.cancel"), style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => dispatch({ type: "REMOVE_FRIEND", payload: code }),
        },
      ]
    );
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {t("community.title")}
          </Text>
          <Text style={[styles.headerSub, { color: colors.muted }]}>
            {t("community.subtitle")}
          </Text>
        </View>

        {/* Your Ghost Code */}
        <View style={[styles.codeCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.codeLabel, { color: colors.muted }]}>
            {t("community.yourCode")}
          </Text>
          <Text style={[styles.codeValue, { color: colors.foreground }]}>
            {state.ghostCode}
          </Text>
          <Text style={[styles.codeHint, { color: colors.muted }]}>
            {t("community.codeHint")}
          </Text>
          <View style={styles.codeActions}>
            <TouchableOpacity
              onPress={handleCopyCode}
              activeOpacity={0.6}
            >
              <Text style={[styles.codeBtnText, { color: colors.foreground }]}>
                📋 {t("common.copy")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleShare}
              activeOpacity={0.6}
            >
              <Text style={[styles.codeBtnText, { color: "#fff" }]}>
                🔗 {t("community.shareCode")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Add Friend */}
        <View style={[styles.addCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.addTitle, { color: colors.foreground }]}>
            {t("community.addFriend")}
          </Text>
          <View style={styles.addRow}>
            <TextInput
              value={friendCode}
              onChangeText={(v) => setFriendCode(v.toUpperCase().slice(0, 6))}
              placeholder={t("community.addFriendPlaceholder")}
              placeholderTextColor={colors.muted}
              autoCapitalize="characters"
              maxLength={6}
              style={[
                styles.codeInput,
                { color: colors.foreground, borderColor: colors.border, backgroundColor: colors.background },
              ]}
            />
            <TouchableOpacity
              onPress={handleAddFriend}
              disabled={adding || friendCode.length < 6}
              activeOpacity={0.6}
            >
              <Text style={styles.addBtnText}>
                {adding ? "..." : t("community.addFriendBtn")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Leaderboard */}
        <View style={styles.leaderboardSection}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            🏆 {t("community.leaderboard")}
          </Text>

          {allPlayers.length === 1 && !state.friends.length ? (
            <View style={[styles.emptyCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={styles.emptyEmoji}>👻</Text>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
                {t("community.noFriends")}
              </Text>
              <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
                {t("community.noFriendsSubtitle")}
              </Text>
            </View>
          ) : (
            <View style={styles.leaderboardList}>
              {allPlayers.map((player, i) => (
                <TouchableOpacity
                  key={player.code}
                  onLongPress={
                    !player.isYou
                      ? () => handleRemoveFriend(player.code, player.name)
                      : undefined
                  }
                >
                  <LeaderboardRow
                    position={i + 1}
                    name={player.name}
                    streak={player.streak}
                    xp={player.xp}
                    isYou={player.isYou}
                  />
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Privacy note */}
        <Text style={[styles.privacyNote, { color: colors.muted }]}>
          🔒 Journal entries are always private. Only streaks and XP are visible to friends.
        </Text>
      </ScrollView>
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
  header: { gap: 4 },
  headerTitle: { fontSize: 28, fontWeight: "800", letterSpacing: -0.3 },
  headerSub: { fontSize: 14 },
  codeCard: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  codeLabel: { fontSize: 12, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" },
  codeValue: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: 8,
    fontVariant: ["tabular-nums"],
  },
  codeHint: { fontSize: 12, textAlign: "center" },
  codeActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  codeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  codeBtnText: { fontSize: 13, fontWeight: "600" },
  addCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  addTitle: { fontSize: 15, fontWeight: "700" },
  addRow: { flexDirection: "row", gap: 10 },
  codeInput: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 4,
    textAlign: "center",
  },
  addBtn: {
    paddingHorizontal: 20,
    height: 44,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "700", fontSize: 14 },
  leaderboardSection: { gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "800" },
  leaderboardList: { gap: 8 },
  leaderboardRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  positionText: { fontSize: 18, width: 28, textAlign: "center" },
  medalText: { fontSize: 20 },
  leaderboardInfo: { flex: 1 },
  leaderboardNameRow: { flexDirection: "row", alignItems: "center" },
  leaderboardName: { fontSize: 15, fontWeight: "700" },
  youBadge: { fontSize: 13, fontWeight: "600" },
  leaderboardRank: { fontSize: 12, marginTop: 2 },
  streakBadge: { alignItems: "center", gap: 2 },
  streakFire: { fontSize: 14 },
  streakCount: { fontSize: 14, fontWeight: "800" },
  emptyCard: {
    borderRadius: 16,
    padding: 32,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  emptyEmoji: { fontSize: 40 },
  emptyTitle: { fontSize: 16, fontWeight: "700" },
  emptySubtitle: { fontSize: 13, textAlign: "center" },
  privacyNote: { fontSize: 11, textAlign: "center", paddingHorizontal: 16 },
});
