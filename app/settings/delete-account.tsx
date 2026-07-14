import React, { useState, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import { useSupabaseAuth } from "@/lib/supabase/auth-context";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";
import { completeLogout } from "@/lib/supabase/auth";

export default function DeleteAccountScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();
  const { user } = useSupabaseAuth();
  const { dispatch } = useApp();
  const [isDeleting, setIsDeleting] = useState(false);
  const [step, setStep] = useState<"warning" | "confirm" | "deleted">("warning");
  const isLoggingOutRef = useRef(false);

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

              // CRITICAL: Use completeLogout() to properly clear all auth state
              // This handles: Supabase signOut, token clearing, AsyncStorage isOnboarded patch,
              // and in-memory state reset. The 2-second delay gives the auth context time to update.
              try {
                await completeLogout(dispatch, isLoggingOutRef, true);
                console.log("[DeleteAccount] Auth state cleared via completeLogout, navigating to login");
              } catch (logoutError) {
                console.error("[DeleteAccount] completeLogout failed (non-fatal):", logoutError);
                // Continue with navigation even if logout fails
              }

              // Redirect to login after 2 seconds
              // By this time, auth context should have updated and guards will see no session
              setTimeout(() => {
                router.push("/");
              }, 2000);
            } catch (error) {
              console.error("[DeleteAccount] Error:", error);
              console.error("[DeleteAccount] Error details:", {
                message: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
              });
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
              // TEMPORARY: Show actual error for debugging on TestFlight
              const errorMessage = error instanceof Error ? error.message : String(error);
              Alert.alert(
                "Delete Failed",
                `Error: ${errorMessage}`
              );
              // TODO: Revert to user-friendly message after confirming the root cause
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
          <Pressable
            onPress={handleDeleteAccount}
            disabled={isDeleting}
            style={({ pressed }) => [
              {
                backgroundColor: colors.error,
                opacity: pressed ? 0.8 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
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
          </Pressable>

          {/* Cancel Button */}
          <Pressable
            onPress={() => router.back()}
            style={({ pressed }) => [
              {
                opacity: pressed ? 0.6 : 1,
              },
            ]}
            className="py-4 items-center"
          >
            <Text
              className="font-semibold text-base"
              style={{ color: colors.primary }}
            >
              {t("common.cancel") || "Cancel"}
            </Text>
          </Pressable>

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
