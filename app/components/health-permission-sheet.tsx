import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInUp,
  SlideOutDown,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/use-colors";

interface HealthPermissionSheetProps {
  visible: boolean;
  onAllow: () => Promise<void>;
  onSkip: () => void;
}

export function HealthPermissionSheet({
  visible,
  onAllow,
  onSkip,
}: HealthPermissionSheetProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);

  const handleAllow = async () => {
    setIsRequesting(true);
    try {
      await onAllow();
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <Animated.View
      style={[
        styles.overlay,
        {
          pointerEvents: visible ? "auto" : "none",
        },
      ]}
      entering={visible ? FadeIn.duration(200) : undefined}
      exiting={!visible ? FadeOut.duration(200) : undefined}
    >
      <Animated.View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom,
          },
        ]}
        entering={visible ? SlideInUp.springify() : undefined}
        exiting={!visible ? SlideOutDown.springify() : undefined}
      >
        {/* Scrollable Content */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 8 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerEmoji}>🏃</Text>
            <Text style={[styles.headerTitle, { color: colors.foreground }]}>
              Unlock Personalized Insights
            </Text>
            <Text
              style={[styles.headerSubtitle, { color: colors.muted }]}
            >
              Connect your health data to get smarter recommendations from your AI mentor.
            </Text>
          </View>

          {/* Benefits */}
          <View style={styles.benefits}>
            <BenefitItem
              icon="👟"
              title="Step Tracking"
              description="Monitor your daily activity and movement patterns"
              colors={colors}
            />
            <BenefitItem
              icon="😴"
              title="Sleep Analysis"
              description="Track sleep duration and quality for better recovery insights"
              colors={colors}
            />
            <BenefitItem
              icon="🎯"
              title="Smarter Advice"
              description="Receive personalized recommendations based on your real data"
              colors={colors}
            />
          </View>

          {/* Privacy Notice */}
          <View
            style={[
              styles.privacyNotice,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            <Text
              style={[styles.privacyTitle, { color: colors.foreground }]}
            >
              🔒 Your Privacy Matters
            </Text>
            <Text style={[styles.privacyText, { color: colors.muted }]}>
              We only read your steps and sleep data. Your data is never shared with third parties.
            </Text>
          </View>

          {/* Data Usage */}
          <View style={styles.dataUsage}>
            <Text
              style={[styles.dataUsageTitle, { color: colors.foreground }]}
            >
              Data We Access:
            </Text>
            <DataItem label="Daily Step Count" colors={colors} />
            <DataItem label="Sleep Duration" colors={colors} />
            <DataItem label="Active Energy" colors={colors} />
          </View>
        </ScrollView>

        {/* Call to Action Section */}
        <View
          style={[
            styles.ctaSection,
            { borderBottomColor: colors.border },
          ]}
        >
          <Text style={[styles.ctaText, { color: colors.foreground }]}>
            Let RiseGrind see your steps and sleep so your AI mentor can give better advice.
          </Text>
        </View>

        {/* Actions Footer */}
        <View
          style={[
            styles.actions,
            { borderTopColor: colors.border, paddingBottom: insets.bottom + 8 },
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
            {isRequesting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.allowText}>
                Allow Access
              </Text>
            )}
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
    position: "absolute",
    inset: 0,
    justifyContent: "flex-end",
    zIndex: 1000,
  },
  container: {
    maxHeight: "95%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    flexDirection: "column",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
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
  ctaSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    flexShrink: 0,
  },
  ctaText: {
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    textAlign: "center",
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
    paddingTop: 12,
    borderTopWidth: 1,
    flexShrink: 0,
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
    justifyContent: "center",
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
