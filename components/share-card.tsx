import React, { useRef, useCallback } from "react";
import { View, Text, StyleSheet, Share, Alert, Platform } from "react-native";
import ViewShot, { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

// ─── Share Card Visual (dark aesthetic square) ───────────────────────────────
export interface ShareCardProps {
  userName: string;
  badgeIcon: string;
  badgeTitle: string;
  slogan: string;
  streak: number;
  rank: string;
}

export function ShareCardView({
  userName,
  badgeIcon,
  badgeTitle,
  slogan,
  streak,
  rank,
  cardRef,
}: ShareCardProps & { cardRef: React.RefObject<ViewShot | null> }) {
  return (
    <ViewShot
      ref={cardRef as React.RefObject<ViewShot>}
      options={{ format: "png", quality: 1.0 }}
      style={styles.card}
    >
      {/* Dark gradient background */}
      <View style={styles.cardBg}>
        {/* Top accent */}
        <View style={styles.topAccent} />

        {/* App brand */}
        <View style={styles.brandRow}>
          <Text style={styles.brandIcon}>👻</Text>
          <Text style={styles.brandName}>RISEGRIND</Text>
          <Text style={styles.brandTag}>GHOST MODE</Text>
        </View>

        {/* Badge */}
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeIcon}>{badgeIcon}</Text>
          <View style={styles.badgeGlow} />
        </View>

        {/* Badge title */}
        <Text style={styles.badgeTitle}>{badgeTitle.toUpperCase()}</Text>

        {/* User name */}
        <Text style={styles.userName}>{userName}</Text>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>🔥 {streak}</Text>
            <Text style={styles.statLabel}>DAY STREAK</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>⚡ {rank.toUpperCase()}</Text>
            <Text style={styles.statLabel}>CURRENT RANK</Text>
          </View>
        </View>

        {/* Slogan */}
        <Text style={styles.slogan}>"{slogan}"</Text>

        {/* Bottom */}
        <Text style={styles.bottomTag}>risegrind.app</Text>
      </View>
    </ViewShot>
  );
}

// ─── Hook for triggering share ────────────────────────────────────────────────
export function useShareCard() {
  const cardRef = useRef<ViewShot | null>(null);

  const shareCard = useCallback(async () => {
    try {
      if (Platform.OS === "web") {
        // Web fallback: just use text share
        await Share.share({ message: "I just unlocked a new rank on RiseGrind Ghost Mode! 👻" });
        return;
      }

      const uri = await captureRef(cardRef, {
        format: "png",
        quality: 1.0,
      });

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/png",
          dialogTitle: "Share your Ghost Mode achievement",
        });
      } else {
        await Share.share({
          url: uri,
          message: "I just unlocked a new rank on RiseGrind Ghost Mode! 👻",
        });
      }
    } catch (err) {
      // User dismissed or error — silently fail
    }
  }, []);

  return { cardRef, shareCard };
}

const styles = StyleSheet.create({
  card: {
    width: 320,
    height: 320,
  },
  cardBg: {
    flex: 1,
    backgroundColor: "#0A0A0C",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
  },
  topAccent: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    backgroundColor: "#6366F1",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  brandIcon: { fontSize: 14 },
  brandName: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 3,
  },
  brandTag: {
    color: "#6366F1",
    fontSize: 9,
    fontWeight: "700",
    letterSpacing: 2,
    backgroundColor: "#6366F120",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  badgeContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  badgeIcon: { fontSize: 64, zIndex: 1 },
  badgeGlow: {
    position: "absolute",
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6366F130",
  },
  badgeTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
  },
  userName: {
    color: "#9CA3AF",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#1A1A1F",
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 10,
    width: "100%",
    justifyContent: "center",
  },
  statItem: { alignItems: "center", gap: 2 },
  statValue: { color: "#fff", fontSize: 12, fontWeight: "800" },
  statLabel: { color: "#6B7280", fontSize: 9, letterSpacing: 1 },
  statDivider: { width: 1, height: 24, backgroundColor: "#374151" },
  slogan: {
    color: "#9CA3AF",
    fontSize: 11,
    fontStyle: "italic",
    textAlign: "center",
    paddingHorizontal: 8,
  },
  bottomTag: {
    color: "#374151",
    fontSize: 10,
    letterSpacing: 1,
  },
});
