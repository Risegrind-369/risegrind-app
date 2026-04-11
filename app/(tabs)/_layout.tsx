import { Tabs, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

/**
 * Central AI Chat floating button — sits in the middle of the tab bar.
 * Opens the full-screen AI mentor chat.
 */
function AIChatTabButton() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/ai-chat" as never);
      }}
      style={({ pressed }) => [
        styles.aiFab,
        { backgroundColor: colors.primary, transform: [{ scale: pressed ? 0.92 : 1 }] },
      ]}
      accessibilityLabel={t("tabs.aiMentor")}
    >
      <Text style={styles.aiFabEmoji}>👻</Text>
    </Pressable>
  );
}

export default function TabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 60 + bottomPadding;

  return (
    <View style={{ flex: 1 }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.muted,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            paddingTop: 8,
            paddingBottom: bottomPadding,
            height: tabBarHeight,
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            borderTopWidth: 0.5,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: "600",
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t("tabs.home"),
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
          }}
        />
        {/* index-premium hidden — legacy screen, not shown in tab bar */}
        <Tabs.Screen
          name="index-premium"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="routine"
          options={{
            title: t("tabs.routine"),
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="list.bullet" color={color} />,
          }}
        />
        <Tabs.Screen
          name="journal"
          options={{
            title: t("tabs.journal"),
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="book.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="insights"
          options={{
            title: t("tabs.intel"),
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="chart.bar.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="quests"
          options={{
            title: t("tabs.quests"),
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="star.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="community"
          options={{
            title: t("tabs.community"),
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.2.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: t("tabs.profile"),
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="person.fill" color={color} />,
          }}
        />
      </Tabs>

      {/* Floating AI Chat Button — centered above tab bar */}
      <View
        style={[
          styles.fabContainer,
          { bottom: tabBarHeight - 24 },
        ]}
        pointerEvents="box-none"
      >
        <AIChatTabButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 100,
    pointerEvents: "box-none",
  },
  aiFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  aiFabEmoji: {
    fontSize: 24,
  },
});
