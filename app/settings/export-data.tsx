import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Share,
} from "react-native";
import { useTranslation } from "react-i18next";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

export default function ExportDataScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const [isExporting, setIsExporting] = useState(false);

  const exportDataMutation = trpc.account.exportData.useQuery(undefined, {
    enabled: false,
  });

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      const data = await exportDataMutation.refetch();

      if (!data.data) {
        throw new Error("No data returned");
      }

      // Convert to JSON string
      const jsonString = JSON.stringify(data.data, null, 2);

      // Create filename with timestamp
      const timestamp = new Date().toISOString().split("T")[0];
      const filename = `risegrind_data_${timestamp}.json`;

      // Share or copy to clipboard
      await Share.share({
        message: jsonString,
        title: filename,
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        t("settings.exportData.success") || "Data Exported",
        t("settings.exportData.successMessage") ||
          "Your data has been exported successfully. You can now save it to your device."
      );
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        t("common.error") || "Error",
        t("settings.exportData.error") ||
          "Failed to export data. Please try again."
      );
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-1 p-6 gap-6">
          {/* Header */}
          <View className="gap-2">
            <Text
              className="text-3xl font-bold text-foreground"
              style={{ color: colors.foreground }}
            >
              {t("settings.exportData.title") || "Export Your Data"}
            </Text>
            <Text
              className="text-base text-muted"
              style={{ color: colors.muted }}
            >
              {t("settings.exportData.subtitle") ||
                "Download all your personal data in a portable format (GDPR)"}
            </Text>
          </View>

          {/* Info Box */}
          <View
            className="p-4 rounded-lg gap-3"
            style={{
              backgroundColor: colors.primary + "10",
              borderLeftWidth: 4,
              borderLeftColor: colors.primary,
            }}
          >
            <Text
              className="font-semibold text-base"
              style={{ color: colors.foreground }}
            >
              {t("settings.exportData.infoTitle") || "What's included:"}
            </Text>
            <Text
              className="text-sm text-muted leading-relaxed"
              style={{ color: colors.muted }}
            >
              • Your profile and account information
              {"\n"}• All habits and routines
              {"\n"}• Habit completion history
              {"\n"}• Journal entries and mood logs
              {"\n"}• Streaks and XP data
            </Text>
          </View>

          {/* Data Items */}
          <View className="gap-3">
            {[
              {
                icon: "👤",
                title: t("settings.exportData.item1") || "Profile Data",
                desc: t("settings.exportData.item1Desc") ||
                  "Name, email, preferences",
              },
              {
                icon: "📊",
                title: t("settings.exportData.item2") || "Habits",
                desc: t("settings.exportData.item2Desc") ||
                  "All routines and completions",
              },
              {
                icon: "📝",
                title: t("settings.exportData.item3") || "Journal",
                desc: t("settings.exportData.item3Desc") ||
                  "All entries and reflections",
              },
              {
                icon: "😊",
                title: t("settings.exportData.item4") || "Mood Data",
                desc: t("settings.exportData.item4Desc") ||
                  "Mood logs and trends",
              },
            ].map((item, idx) => (
              <View
                key={idx}
                className="flex-row gap-3 p-3 rounded-lg"
                style={{ backgroundColor: colors.surface }}
              >
                <Text className="text-xl">{item.icon}</Text>
                <View className="flex-1">
                  <Text
                    className="font-semibold text-foreground"
                    style={{ color: colors.foreground }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    className="text-sm text-muted mt-1"
                    style={{ color: colors.muted }}
                  >
                    {item.desc}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* Spacer */}
          <View className="flex-1" />

          {/* Export Button */}
          <Pressable
            onPress={handleExportData}
            disabled={isExporting}
            style={({ pressed }) => [
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
            className="py-4 rounded-lg items-center"
          >
            {isExporting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                {t("settings.exportData.button") || "Export All My Data"}
              </Text>
            )}
          </Pressable>

          {/* Info text */}
          <Text
            className="text-xs text-muted text-center"
            style={{ color: colors.muted }}
          >
            {t("settings.exportData.info") ||
              "Your data will be exported as a JSON file that you can save and use anywhere."}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
