/**
 * Health Permission Sheet
 * Requests Apple HealthKit permission with clear benefits explanation
 */

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useColors } from "@/hooks/use-colors";
import Animated, { FadeIn, SlideInUp } from "react-native-reanimated";

interface HealthPermissionSheetProps {
  visible: boolean;
  onAllow: () => Promise<void>;
  onSkip: () => void;
  loading?: boolean;
}

export function HealthPermissionSheet({
  visible,
  onAllow,
  onSkip,
  loading = false,
}: HealthPermissionSheetProps) {
  const colors = useColors();
  const [isRequesting, setIsRequesting] = useState(false);

  const handleAllow = async () => {
    setIsRequesting(true);
    try {
      await onAllow();
    } finally {
      setIsRequesting(false);
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      entering={FadeIn}
      style={[
        styles.overlay,
        { backgroundColor: "rgba(0,0,0,0.5)" },
      ]}
    >
      <Animated.View
        entering={SlideInUp.springify()}
        style={[
          styles.container,
          { backgroundColor: colors.background, borderColor: colors.border },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>❤️</Text>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              Connect Apple Health
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.muted }]}>
              Get personalized routines based on your sleep & activity
            </Text>
          </View>

          {/* Benefits */}
          <View style={styles.benefits}>
            <BenefitItem
              icon="😴"
              title="Smart Sleep Tracking"
              description="Your sleep data helps us adjust your routine difficulty"
              colors={colors}
            />
            <BenefitItem
              icon="👟"
              title="Activity Insights"
              description="Steps and active energy inform your energy score"
              colors={colors}
            />
            <BenefitItem
              icon="⚡"
              title="Energy Score"
              description="See your daily energy level and get personalized recommendations"
              colors={colors}
            />
            <BenefitItem
              icon="🎯"
              title="Adaptive Routines"
              description="Your morning routine adjusts to your current energy level"
              colors={colors}
            />
          </View>

          {/* Privacy Notice */}
          <View
            style={[
              styles.privacyNotice,
              { backgroundColor: `${colors.primary}15`, borderColor: colors.primary },
            ]}
          >
            <Text style={[styles.privacyTitle, { color: colors.primary }]}>
              🔒 Your privacy is protected
            </Text>
            <Text style={[styles.privacyText, { color: colors.muted }]}>
              We only read your health data. You control what RiseGrind can access, and you can
              revoke access anytime in Settings.
            </Text>
          </View>

          {/* Data Usage */}
          <View style={styles.dataUsage}>
            <Text style={[styles.dataUsageTitle, { color: colors.foreground }]}>
              What we use:
            </Text>
            <DataItem label="Sleep Analysis" colors={colors} />
            <DataItem label="Step Count" colors={colors} />
            <DataItem label="Active Energy" colors={colors} />
          </View>
        </ScrollView>

        {/* Actions */}
        <View
          style={[
            styles.actions,
            { borderTopColor: colors.border },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.skipButton,
              { borderColor: colors.border },
            ]}
            onPress={onSkip}
            disabled={loading || isRequesting}
          >
            <Text style={[styles.skipText, { color: colors.muted }]}>
              Skip for now
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.allowButton,
              { backgroundColor: colors.primary },
              (loading || isRequesting) && styles.allowButtonDisabled,
            ]}
            onPress={handleAllow}
            disabled={loading || isRequesting}
          >
            <Text style={styles.allowText}>
              {isRequesting ? "Connecting..." : "Allow Access"}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
}

interface BenefitItemProps {
  icon: string;
  title: string;
  description: string;
  colors: any;
}

function BenefitItem({ icon, title, description, colors }: BenefitItemProps) {
  return (
    <View style={styles.benefitItem}>
      <Text style={styles.benefitIcon}>{icon}</Text>
      <View style={styles.benefitContent}>
        <Text style={[styles.benefitTitle, { color: colors.foreground }]}>
          {title}
        </Text>
        <Text style={[styles.benefitDescription, { color: colors.muted }]}>
          {description}
        </Text>
      </View>
    </View>
  );
}

interface DataItemProps {
  label: string;
  colors: any;
}

function DataItem({ label, colors }: DataItemProps) {
  return (
    <View style={styles.dataItem}>
      <View
        style={[
          styles.dataItemDot,
          { backgroundColor: colors.primary },
        ]}
      />
      <Text style={[styles.dataItemLabel, { color: colors.muted }]}>
        {label}
      </Text>
    </View>
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
    maxHeight: "90%",
    borderTopWidth: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  benefits: {
    marginBottom: 24,
    gap: 12,
  },
  benefitItem: {
    flexDirection: "row",
    gap: 12,
  },
  benefitIcon: {
    fontSize: 24,
    width: 32,
    textAlign: "center",
  },
  benefitContent: {
    flex: 1,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  privacyNotice: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 24,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 13,
    lineHeight: 18,
  },
  dataUsage: {
    marginBottom: 24,
  },
  dataUsageTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
  },
  dataItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  dataItemDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dataItemLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
  },
  skipButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  skipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  allowButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  allowButtonDisabled: {
    opacity: 0.6,
  },
  allowText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
});
