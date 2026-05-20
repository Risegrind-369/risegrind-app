/**
 * Echo Journal Card
 * Shows past journal entry from 7/30/90 days ago with AI-generated growth highlights
 */
import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Animated, {
  FadeIn,
  SlideInLeft,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";

interface EchoJournalCardProps {
  daysBack: number;
  originalEntry: string;
  growthHighlights: string;
  onMarkMeaningful: () => void;
}

export function EchoJournalCard({
  daysBack,
  originalEntry,
  growthHighlights,
  onMarkMeaningful,
}: EchoJournalCardProps) {
  const colors = useColors();
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSpring(0.98, { damping: 10 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onMarkMeaningful();
  };

  const timeLabel =
    daysBack === 7 ? "1 week ago" : daysBack === 30 ? "1 month ago" : "3 months ago";

  return (
    <Animated.View
      entering={SlideInLeft.springify()}
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          borderColor: colors.primary,
          borderLeftWidth: 4,
        },
      ]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.timeLabel, { color: colors.primary }]}>
          📜 Echo from {timeLabel}
        </Text>
      </View>

      {/* Original Entry */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.muted }]}>
          What you wrote:
        </Text>
        <Text
          style={[styles.entryText, { color: colors.foreground }]}
          numberOfLines={3}
        >
          "{originalEntry}"
        </Text>
      </View>

      {/* Growth Highlights */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.success }]}>
          ✨ Your growth since then:
        </Text>
        <Text
          style={[styles.highlightText, { color: colors.foreground }]}
          numberOfLines={4}
        >
          {growthHighlights}
        </Text>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.6}
      >
        <Text style={[styles.buttonText, { color: colors.background }]}>
          This moved me 💜
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 16,
    marginVertical: 12,
    gap: 12,
  },
  header: {
    marginBottom: 4,
  },
  timeLabel: {
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  section: {
    gap: 6,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  entryText: {
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
  },
  highlightText: {
    fontSize: 13,
    lineHeight: 19,
  },
  button: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "600",
  },
});
