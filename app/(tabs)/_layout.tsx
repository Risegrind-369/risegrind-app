import { Tabs, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";

/**
 * Floating AI Chat Button — positioned above Intel tab.
 * Message icon with centered "AI" text overlay.
 */
function AIFloatingButton() {
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
        {
          backgroundColor: colors.accent,
          shadowColor: colors.accent,
          transform: [{ scale: pressed ? 0.92 : 1 }],
        },
      ]}
      accessibilityLabel={t("tabs.aiMentor", { defaultValue: "AI Mentor" })}
    >
      <Text style={styles.aiFabIcon}>💬</Text>
      <Text style={styles.aiFabText}>AI</Text>
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
          tabBarActiveTintColor: colors.accent,
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
        {/* Tab 1: Home */}
        <Tabs.Screen
          name="index"
          options={{
            title: t("tabs.home", { defaultValue: "Home" }),
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="house.fill" color={color} />,
          }}
        />

        {/* Hidden screens — not shown in tab bar */}
        {/* Hidden screens — not shown in tab bar */}
        <Tabs.Screen
          name="index-premium"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="routine"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="community"
          options={{ href: null }}
        />
        <Tabs.Screen
          name="profile"
          options={{ href: null }}
        />

        {/* Tab 2: Journal */}
        <Tabs.Screen
          name="journal"
          options={{
            title: t("tabs.journal", { defaultValue: "Journal" }),
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="book.fill" color={color} />,
          }}
        />

        {/* Tab 3: Intel (Insights) */}
        <Tabs.Screen
          name="insights"
          options={{
            title: t("tabs.intel", { defaultValue: "Intel" }),
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="chart.bar.fill" color={color} />,
          }}
        />

        {/* Tab 4: Side Quests */}
        <Tabs.Screen
          name="quests"
          options={{
            title: t("tabs.quests", { defaultValue: "Quests" }),
            tabBarIcon: ({ color }) => <IconSymbol size={24} name="star.fill" color={color} />,
          }}
        />
      </Tabs>

      {/* Floating AI Button — above Intel tab, bottom-right */}
      <View
        style={[
          styles.fabContainer,
          { bottom: bottomPadding + 70, right: 16 },
        ]}
        pointerEvents="box-none"
      >
        <AIFloatingButton />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fabContainer: {
    position: "absolute",
    zIndex: 100,
    pointerEvents: "box-none",
  },
  aiFab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  aiFabIcon: {
    fontSize: 20,
    marginBottom: 2,
  } as any,
  aiFabText: {
    fontSize: 10,
    fontWeight: "800",
    color: "#fff",
    letterSpacing: 0.5,
  } as any,
});
