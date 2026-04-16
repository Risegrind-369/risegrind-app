/**
 * Routine Cancellation Modal
 * Shows when user cancels routine, allows re-achievement for double XP
 */
import React, { useState } from "react";
import { View, Text, Pressable, Modal, StyleSheet } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  ZoomIn,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";

interface RoutineCancellationModalProps {
  visible: boolean;
  onCancel: () => void;
  onReachieve: () => void;
  streak: number;
  xp: number;
}

export function RoutineCancellationModal({
  visible,
  onCancel,
  onReachieve,
  streak,
  xp,
}: RoutineCancellationModalProps) {
  const colors = useColors();
  const scale = useSharedValue(0);

  React.useEffect(() => {
    if (visible) {
      scale.value = withSpring(1, { damping: 8, mass: 1 });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    }
  }, [visible, scale]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <Animated.View
        entering={FadeIn}
        exiting={FadeOut}
        style={[
          styles.overlay,
          { backgroundColor: "rgba(0, 0, 0, 0.6)" },
        ]}
      >
        <Animated.View
          style={[
            styles.container,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              transform: [{ scale }],
            },
          ]}
          entering={ZoomIn.springify()}
          exiting={FadeOut}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                { color: colors.foreground },
              ]}
            >
              Routine Cancelled
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: colors.muted },
              ]}
            >
              You can still recover with a quick re-achievement for double XP
            </Text>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                Current Streak
              </Text>
              <Text style={[styles.statValue, { color: colors.primary }]}>
                {streak}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                XP at Stake
              </Text>
              <Text style={[styles.statValue, { color: colors.warning }]}>
                {xp}
              </Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statLabel, { color: colors.muted }]}>
                Double XP
              </Text>
              <Text style={[styles.statValue, { color: colors.success }]}>
                {xp * 2}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onCancel();
              }}
              style={({ pressed }) => [
                styles.button,
                styles.cancelButton,
                {
                  backgroundColor: colors.surface,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text style={[styles.buttonText, { color: colors.foreground }]}>
                Accept Loss
              </Text>
            </Pressable>

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onReachieve();
              }}
              style={({ pressed }) => [
                styles.button,
                styles.reachieveButton,
                {
                  backgroundColor: colors.primary,
                  opacity: pressed ? 0.85 : 1,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <Text style={[styles.buttonText, { color: colors.background }]}>
                🔥 Re-achieve for 2x XP
              </Text>
            </Pressable>
          </View>

          {/* Motivational Text */}
          <Text style={[styles.motivational, { color: colors.muted }]}>
            "Ghost Mode never quits. Recover now and prove your discipline."
          </Text>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "85%",
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
  },
  header: {
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: "500",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
  },
  buttonRow: {
    gap: 12,
    marginBottom: 16,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelButton: {},
  reachieveButton: {},
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  motivational: {
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    lineHeight: 18,
  },
});
