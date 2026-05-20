import React, { useState } from "react";
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import { useAuth } from "@/hooks/use-auth";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

export default function DeleteAccountScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const { dispatch } = useApp();
  const [isDeleting, setIsDeleting] = useState(false);
  const [step, setStep] = useState<"warning" | "confirm" | "deleted">("warning");

  const deleteAccountMutation = trpc.account.deleteAccount.useMutation();

  const handleDeleteAccount = async () => {
    Alert.alert(
      t("settings.deleteAccount.confirmTitle") || "Delete Account?",
      t("settings.deleteAccount.confirmMessage") ||
        "This action cannot be undone. All your data will be permanently deleted.",
      [
        {
          text: t("common.cancel") || "Cancel",
          style: "cancel",
        },
        {
          text: t("settings.deleteAccount.confirm") || "Delete My Account",
          style: "destructive",
          onPress: async () => {
            setIsDeleting(true);
            try {
              await deleteAccountMutation.mutateAsync();
              Haptics.notificationAsync(
                Haptics.NotificationFeedbackType.Success
              );
              setStep("deleted");

              // Clear local state
              dispatch({ type: "SET_LOADING", payload: true });

              // Redirect to login after 2 seconds
              setTimeout(() => {
                router.push("/");
              }, 2000);
            } catch (error) {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              Alert.alert(
                t("common.error") || "Error",
                t("settings.deleteAccount.error") ||
                  "Failed to delete account. Please try again."
              );
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (step === "deleted") {
    return (
      <ScreenContainer className="flex-1 items-center justify-center p-6">
        <View className="items-center gap-4">
          <Text className="text-6xl">👋</Text>
          <Text
            className="text-2xl font-bold text-foreground text-center"
            style={{ color: colors.foreground }}
          >
            {t("settings.deleteAccount.goodbye") || "Account Deleted"}
          </Text>
          <Text
            className="text-base text-muted text-center"
            style={{ color: colors.muted }}
          >
            {t("settings.deleteAccount.redirecting") ||
              "Redirecting you to the login screen..."}
          </Text>
          <ActivityIndicator
            size="large"
            color={colors.primary}
            style={{ marginTop: 20 }}
          />
        </View>
      </ScreenContainer>
    );
  }

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
              {t("settings.deleteAccount.title") || "Delete Account"}
            </Text>
            <Text
              className="text-base text-muted"
              style={{ color: colors.muted }}
            >
              {t("settings.deleteAccount.subtitle") ||
                "Permanently delete your account and all associated data"}
            </Text>
          </View>

          {/* Warning Box */}
          <View
            className="p-4 rounded-lg border gap-3"
            style={{
              backgroundColor: colors.error + "10",
              borderColor: colors.error + "40",
            }}
          >
            <View className="flex-row gap-3">
              <Text className="text-2xl">⚠️</Text>
              <View className="flex-1">
                <Text
                  className="font-semibold text-base text-foreground mb-2"
                  style={{ color: colors.foreground }}
                >
                  {t("settings.deleteAccount.warningTitle") ||
                    "This action is permanent"}
                </Text>
                <Text
                  className="text-sm text-muted leading-relaxed"
                  style={{ color: colors.muted }}
                >
                  {t("settings.deleteAccount.warningContent") ||
                    "Deleting your account will:\n• Permanently delete all your habits and history\n• Remove all journal entries\n• Cancel any active subscriptions\n• This cannot be undone"}
                </Text>
              </View>
            </View>
          </View>

          {/* What happens section */}
          <View className="gap-3">
            <Text
              className="text-lg font-semibold text-foreground"
              style={{ color: colors.foreground }}
            >
              {t("settings.deleteAccount.whatHappens") || "What happens:"}
            </Text>

            {[
              {
                icon: "📊",
                title: t("settings.deleteAccount.item1Title") || "Your data",
                desc: t("settings.deleteAccount.item1Desc") ||
                  "All habits, journal entries, and streaks will be permanently deleted.",
              },
              {
                icon: "💳",
                title: t("settings.deleteAccount.item2Title") ||
                  "Subscriptions",
                desc: t("settings.deleteAccount.item2Desc") ||
                  "Any active subscriptions will be cancelled immediately.",
              },
              {
                icon: "👤",
                title: t("settings.deleteAccount.item3Title") || "Account",
                desc: t("settings.deleteAccount.item3Desc") ||
                  "Your account and login credentials will be removed.",
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

          {/* Delete Button */}
          <TouchableOpacity
            onPress={handleDeleteAccount}
            disabled={isDeleting}
            activeOpacity={0.6}
            className="py-4 rounded-lg items-center"
          >
            {isDeleting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-semibold text-base">
                {t("settings.deleteAccount.button") ||
                  "Delete My Account Permanently"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.6}
            className="py-4 items-center"
          >
            <Text
              className="font-semibold text-base"
              style={{ color: colors.primary }}
            >
              {t("common.cancel") || "Cancel"}
            </Text>
          </TouchableOpacity>

          {/* Info text */}
          <Text
            className="text-xs text-muted text-center"
            style={{ color: colors.muted }}
          >
            {t("settings.deleteAccount.info") ||
              "If you have questions, please contact support@risegrind.app"}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
