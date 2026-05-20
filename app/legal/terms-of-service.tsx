import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useTranslation } from "react-i18next";

export default function TermsOfServiceScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <ScreenContainer containerClassName="bg-background">
      <View className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between p-4 border-b" style={{ borderBottomColor: colors.border }}>
          <Text className="text-xl font-bold text-foreground" style={{ color: colors.foreground }}>
            {t("legal.termsOfService") || "Terms of Service"}
          </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text className="text-2xl">✕</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <View className="gap-6 pb-8">
            {/* Last Updated */}
            <Text className="text-sm text-muted" style={{ color: colors.muted }}>
              {t("legal.lastUpdated") || "Last Updated"}: May 6, 2026
            </Text>

            {/* Agreement */}
            <View className="gap-2">
              <Text className="text-lg font-bold text-foreground" style={{ color: colors.foreground }}>
                {t("legal.agreement") || "Agreement to Terms"}
              </Text>
              <Text className="text-sm text-muted leading-relaxed" style={{ color: colors.muted }}>
                By accessing and using RiseGrind, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </Text>
            </View>

            {/* Use License */}
            <View className="gap-2">
              <Text className="text-lg font-bold text-foreground" style={{ color: colors.foreground }}>
                {t("legal.useLicense") || "Use License"}
              </Text>
              <Text className="text-sm text-muted leading-relaxed" style={{ color: colors.muted }}>
                Permission is granted to temporarily download one copy of the materials (information or software) on RiseGrind for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                {"\n"}• Modify or copy the materials
                {"\n"}• Use the materials for any commercial purpose or for any public display
                {"\n"}• Attempt to decompile or reverse engineer any software
                {"\n"}• Remove any copyright or other proprietary notations
                {"\n"}• Transfer the materials to another person or "mirror" the materials on any other server
              </Text>
            </View>

            {/* Disclaimer */}
            <View className="gap-2">
              <Text className="text-lg font-bold text-foreground" style={{ color: colors.foreground }}>
                {t("legal.disclaimer") || "Disclaimer"}
              </Text>
              <Text className="text-sm text-muted leading-relaxed" style={{ color: colors.muted }}>
                The materials on RiseGrind are provided on an 'as is' basis. RiseGrind makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
              </Text>
            </View>

            {/* Limitations */}
            <View className="gap-2">
              <Text className="text-lg font-bold text-foreground" style={{ color: colors.foreground }}>
                {t("legal.limitations") || "Limitations"}
              </Text>
              <Text className="text-sm text-muted leading-relaxed" style={{ color: colors.muted }}>
                In no event shall RiseGrind or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on RiseGrind, even if RiseGrind or an authorized representative has been notified orally or in writing of the possibility of such damage.
              </Text>
            </View>

            {/* Accuracy of Materials */}
            <View className="gap-2">
              <Text className="text-lg font-bold text-foreground" style={{ color: colors.foreground }}>
                {t("legal.accuracyOfMaterials") || "Accuracy of Materials"}
              </Text>
              <Text className="text-sm text-muted leading-relaxed" style={{ color: colors.muted }}>
                The materials appearing on RiseGrind could include technical, typographical, or photographic errors. RiseGrind does not warrant that any of the materials on its website are accurate, complete, or current. RiseGrind may make changes to the materials contained on its website at any time without notice.
              </Text>
            </View>

            {/* Links */}
            <View className="gap-2">
              <Text className="text-lg font-bold text-foreground" style={{ color: colors.foreground }}>
                {t("legal.links") || "Links"}
              </Text>
              <Text className="text-sm text-muted leading-relaxed" style={{ color: colors.muted }}>
                RiseGrind has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by RiseGrind of the site. Use of any such linked website is at the user's own risk.
              </Text>
            </View>

            {/* Modifications */}
            <View className="gap-2">
              <Text className="text-lg font-bold text-foreground" style={{ color: colors.foreground }}>
                {t("legal.modifications") || "Modifications"}
              </Text>
              <Text className="text-sm text-muted leading-relaxed" style={{ color: colors.muted }}>
                RiseGrind may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
              </Text>
            </View>

            {/* Governing Law */}
            <View className="gap-2">
              <Text className="text-lg font-bold text-foreground" style={{ color: colors.foreground }}>
                {t("legal.governingLaw") || "Governing Law"}
              </Text>
              <Text className="text-sm text-muted leading-relaxed" style={{ color: colors.muted }}>
                These terms and conditions are governed by and construed in accordance with the laws of the jurisdiction in which RiseGrind operates, and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
              </Text>
            </View>

            {/* Contact */}
            <View className="gap-2">
              <Text className="text-lg font-bold text-foreground" style={{ color: colors.foreground }}>
                {t("legal.contactUs") || "Contact Us"}
              </Text>
              <Text className="text-sm text-muted leading-relaxed" style={{ color: colors.muted }}>
                If you have any questions about these Terms of Service, please contact us at:
                {"\n"}legal@risegrind.app
              </Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </ScreenContainer>
  );
}
