import { useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { completeLogout } from "@/lib/supabase/auth";
import * as Haptics from "expo-haptics";
import { ImpactFeedbackStyle, NotificationFeedbackType } from "expo-haptics";

export default function LogoutScreen() {
  const colors = useColors();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      Haptics.impactAsync(ImpactFeedbackStyle.Light);

      console.log("[Logout] User initiated logout");

      // Call complete logout function
      await completeLogout();

      console.log("[Logout] Logout successful, redirecting to signin...");
      Haptics.notificationAsync(NotificationFeedbackType.Success);

      // Redirect to signin screen
      router.replace("/auth/signin");
    } catch (error) {
      console.error("[Logout] Error during logout:", error);
      Haptics.notificationAsync(NotificationFeedbackType.Error);

      Alert.alert(
        "Logout Error",
        "Failed to logout. Please try again.",
        [
          {
            text: "Try Again",
            onPress: () => {
              setIsLoggingOut(false);
            },
          },
          {
            text: "Force Logout",
            onPress: async () => {
              // Force logout even if there's an error
              try {
                router.replace("/auth/signin");
              } catch (e) {
                console.error("[Logout] Force logout error:", e);
              }
            },
          },
        ]
      );
    }
  };

  return (
    <ScreenContainer className="p-6 justify-center">
      <View className="gap-6">
        <View className="gap-2">
          <Text className="text-2xl font-bold text-foreground">Logout</Text>
          <Text className="text-base text-muted">
            You will be logged out and returned to the login screen. Your data is safely stored.
          </Text>
        </View>

        <Pressable
          onPress={handleLogout}
          disabled={isLoggingOut}
          style={({ pressed }) => [
            {
              backgroundColor: colors.error,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
          className="rounded-lg p-4 items-center"
        >
          {isLoggingOut ? (
            <ActivityIndicator color={colors.background} />
          ) : (
            <Text className="text-base font-semibold text-background">Logout</Text>
          )}
        </Pressable>

        <Pressable
          onPress={() => router.back()}
          disabled={isLoggingOut}
          className="rounded-lg p-4 items-center border"
          style={{
            borderColor: colors.border,
          }}
        >
          <Text className="text-base font-semibold text-foreground">Cancel</Text>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}
