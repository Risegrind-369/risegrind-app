/**
 * Recovery Quest Modal
 * Shows when a user misses a habit - offers a 5-10 min challenge to save/recover streak
 */

import React, { useState } from "react";
import { View, Text, TouchableOpacity, Modal, StyleSheet } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

interface RecoveryQuestModalProps {
  visible: boolean;
  habitName: string;
  questDescription: string;
  durationMin: number;
  streakRecoveryPercent: number;
  onAccept: () => void;
  onDecline: () => void;
  loading?: boolean;
}

export function RecoveryQuestModal({
  visible,
  habitName,
  questDescription,
  durationMin,
  streakRecoveryPercent,
  onAccept,
  onDecline,
  loading = false,
}: RecoveryQuestModalProps) {
  const colors = useColors();
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAccept = async () => {
    setIsAccepting(true);
    await onAccept();
    setIsAccepting(false);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={[styles.overlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
        <Animated.View
          entering={SlideInUp.springify()}
          exiting={FadeOut}
          style={[
            styles.container,
            { backgroundColor: colors.background, borderColor: colors.border },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.headerEmoji]}>🎯</Text>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              Recovery Quest
            </Text>
          </View>

          {/* Content */}
          <View style={styles.content}>
            <Text style={[styles.missedHabit, { color: colors.muted }]}>
              You missed
            </Text>
            <Text style={[styles.habitName, { color: colors.foreground }]}>
              {habitName}
            </Text>

            {/* Quest Card */}
            <View
              style={[
                styles.questCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.questHeader}>
                <Text style={[styles.questTitle, { color: colors.foreground }]}>
                  {questDescription}
                </Text>
                <Text style={[styles.duration, { color: colors.primary }]}>
                  {durationMin} min
                </Text>
              </View>

              <Text style={[styles.questDescription, { color: colors.muted }]}>
                Complete this quick challenge to recover {streakRecoveryPercent}% of your streak.
              </Text>

              {/* Recovery Meter */}
              <View style={styles.recoveryMeter}>
                <View style={styles.meterLabel}>
                  <Text style={[styles.meterText, { color: colors.muted }]}>
                    Streak Recovery
                  </Text>
                  <Text style={[styles.meterPercent, { color: colors.primary }]}>
                    {streakRecoveryPercent}%
                  </Text>
                </View>
                <View
                  style={[
                    styles.meterBar,
                    { backgroundColor: colors.border },
                  ]}
                >
                  <Animated.View
                    style={[
                      styles.meterFill,
                      {
                        backgroundColor: colors.primary,
                        width: `${streakRecoveryPercent}%`,
                      },
                    ]}
                  />
                </View>
              </View>

              {/* Empathy Message */}
              <Text style={[styles.empathy, { color: colors.muted }]}>
                Life happens. We've all missed a day. Give it a shot and get back on track! 💪
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[
                styles.declineButton,
                { borderColor: colors.border },
              ]}
              onPress={onDecline}
              disabled={loading}
            >
              <Text style={[styles.declineText, { color: colors.muted }]}>
                Skip for now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.acceptButton,
                { backgroundColor: colors.primary },
                loading && styles.acceptButtonDisabled,
              ]}
              onPress={handleAccept}
              disabled={loading || isAccepting}
            >
              <Text style={styles.acceptText}>
                {isAccepting ? "Starting..." : "Accept Challenge"}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
  },
  content: {
    marginBottom: 24,
  },
  missedHabit: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  habitName: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
  },
  questCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16,
  },
  questHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  questTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  duration: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 12,
  },
  questDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  recoveryMeter: {
    marginBottom: 16,
  },
  meterLabel: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  meterText: {
    fontSize: 12,
    fontWeight: "500",
  },
  meterPercent: {
    fontSize: 14,
    fontWeight: "700",
  },
  meterBar: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  meterFill: {
    height: "100%",
    borderRadius: 4,
  },
  empathy: {
    fontSize: 13,
    lineHeight: 18,
    fontStyle: "italic",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  declineButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  declineText: {
    fontSize: 14,
    fontWeight: "600",
  },
  acceptButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  acceptButtonDisabled: {
    opacity: 0.6,
  },
  acceptText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
});
