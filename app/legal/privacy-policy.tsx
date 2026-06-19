import React from "react";
import { View, Text, ScrollView, Pressable, Linking } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useTranslation } from "react-i18next";

export default function PrivacyPolicyScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <ScreenContainer containerClassName="bg-background">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b" style={{ borderBottomColor: colors.border }}>
          <Text className="text-xl font-bold text-foreground" style={{ color: colors.foreground }}>
            {t("legal.privacyPolicy") || "Privacy Policy"}
          </Text>
          <Pressable onPress={() => router.back()}>
            <Text className="text-2xl">✕</Text>
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <View className="gap-6 pb-8">
            {/* Last Updated */}
            <Text className="text-sm text-muted" style={{ color: colors.muted }}>
              {t("legal.lastUpdated") || "Last Updated"}: May 6, 2026
            </Text>

            {/* Introduction */}
            <View className="gap-2">
              <Text className="text-lg font-bold text-foreground" style={{ color: colors.foreground }}>
                {t("legal.introduction") || "Introduction"}
              </Text>
              <Text className="text-base text-muted leading-relaxed" style={{ color: colors.muted }}>
                RiseGrind ("we", "us", "our", or "Company") operates the RiseGrind mobile application (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
              </Text>
            </View>

            {/* Information Collection */}
            <View className="gap-2">
              <Text className="text-lg font-bold text-foreground" style={{ color: colors.foreground }}>
                {t("legal.informationCollection") || "Information We Collect"}
              </Text>
              <View className="gap-3">
                <View>
                  <Text className="font-semibold text-foreground mb-1" style={{ color: colors.foreground }}>
                    Personal Data
                  </Text>
                  <Text className="text-sm text-muted leading-relaxed" style={{ color: colors.muted }}>
                    • Email address and password (for authentication)
                    • Name and profile information
                    • Habits, routines, and completion data
                    • Journal entries and mood logs
                    • Health data (steps, sleep) if you connect HealthKit
                  </Text>
                </View>
                <View>
                  <Text className="font-semibold text-foreground mb-1" style={{ color: colors.foreground }}>
                    Usage Data
                  </Text>
                  <Text className="text-sm text-muted leading-relaxed" style={{ color: colors.muted }}>
                    • Device information (OS, app version)
                    • Crash reports and error logs
                    • Feature usage analytics
                  </Text>
                </View>
              </View>
            </View>

            {/* Use of Data */}
            <View className="gap-2">
              <Text className="text-lg font-bold text-foreground" style={{ color: colors.foreground }}>
                {t("legal.useOfData") || "How We Use Your Data"}
              </Text>
              <Text className="text-sm text-muted leading-relaxed" style={{ color: colors.muted }}>
                • To provide and maintain the Service
                • To notify you about changes to our Service
                • To allow you to participate in interactive features
                • To provide customer support
                • To gather analysis or valuable information to improve the Service
                • To monitor the usage of the Service
                • To detect, prevent and address technical issues
              </Text>
            </View>

            {/* Third-Party AI Processing */}
            <View className="gap-2">
              <Text className="text-lg font-bold text-foreground" style={{ color: colors.foreground }}>
                Third-Party AI Processing
              </Text>
              <Text className="text-sm text-muted leading-relaxed" style={{ color: colors.muted }}>
                RiseGrind uses Anthropic's Claude API to provide AI-powered features including journal entry analysis and AI mentor chat. When you use these features, your journal entries and chat messages are sent to Anthropic for processing. Anthropic processes this data according to their privacy policy. For more information, visit{" "}
                <Text
                  style={{ color: colors.accent, textDecorationLine: "underline" }}
                  onPress={() => Linking.openURL("https://www.anthropic.com/privacy")}
                >
                  Anthropic's Privacy Policy
                </Text>
                .{"\n\n"}You can choose not to use AI features to avoid sending data to Anthropic. Your journal entries remain stored securely in RiseGrind's database.
              </Text>
            </View>

            {/* Data Security */}
            <View className="gap-2">
              <Text className="text-lg font-bold text-foreground" style={{ color: colors.foreground }}>
                {t("legal.dataSecurity") || "Data Security"}
              </Text>
              <Text className="text-sm text-muted leading-relaxed" style={{ color: colors.muted }}>
                The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
              </Text>
            </View>

            {/* Your Rights */}
            <View className="gap-2">
              <Text className="text-lg font-bold text-foreground" style={{ color: colors.foreground }}>
                {t("legal.yourRights") || "Your Rights"}
              </Text>
              <Text className="text-sm text-muted leading-relaxed" style={{ color: colors.muted }}>
                You have the right to:
                • Access your personal data
                • Correct inaccurate data
                • Request deletion of your data
                • Export your data in a portable format
                • Withdraw consent at any time
              </Text>
            </View>

            {/* Contact Us */}
            <View className="gap-2">
              <Text className="text-lg font-bold text-foreground" style={{ color: colors.foreground }}>
                {t("legal.contactUs") || "Contact Us"}
              </Text>
              <Text className="text-sm text-muted leading-relaxed" style={{ color: colors.muted }}>
                If you have any questions about this Privacy Policy, please contact us at:
                {"\n"}privacy@risegrind.app
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
