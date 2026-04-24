import { Tabs, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { TabBadge } from "@/components/tab-badge";
import { useColors } from "@/hooks/use-colors";
import { GlassOrb } from "@/components/glass-orb";
import { usePathname } from "expo-router";
import { useMemo, useState } from "react";

/**
 * Floating Connect Button — positioned at bottom-left, same height as AI FAB.
 * Opens the friends / community bottom sheet.
 */
function ConnectFloatingButton({ bottom }: { bottom: number }) {
  const colors = useColors();
  const router = useRouter();

  return (
    <View
      style={[styles.fabContainer, { bottom, left: 16 }]}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          router.push("/friends" as never);
        }}
        style={({ pressed }) => [
          styles.connectFab,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            transform: [{ scale: pressed ? 0.92 : 1 }],
          },
        ]}
        accessibilityLabel="Connect with friends"
      >
        <Text style={styles.connectFabIcon}>👥</Text>
      </Pressable>
    </View>
  );
}

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
  const pathname = usePathname();
  const bottomPadding = Platform.OS === "web" ? 12 : Math.max(insets.bottom, 8);
  const tabBarHeight = 60 + bottomPadding;

  // Unread counts for each tab (can be replaced with real data from state/API)
  const [unreadCounts] = useState({
    home: 0,
    journal: 2,
    insights: 0,
    quests: 5,
  });

  // Determine active tab index based on current route
  const activeTabIndex = useMemo(() => {
    if (pathname === "/" || pathname.startsWith("/(tabs)/index")) return 0;
    if (pathname.startsWith("/(tabs)/journal")) return 1;
    if (pathname.startsWith("/(tabs)/insights")) return 2;
    if (pathname.startsWith("/(tabs)/quests")) return 3;
    return 0;
  }, [pathname]);

  return (
    <View style={{ flex: 1 }}>
      {/* Glass Orb Indicator */}
      {Platform.OS !== "web" && (
        <GlassOrb
          activeTabIndex={activeTabIndex}
          tabCount={4}
          tabBarHeight={tabBarHeight}
          bottomInset={bottomPadding}
        />
      )}

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
            tabBarIcon: ({ color }) => (
              <View style={{ position: "relative" }}>
                <IconSymbol size={24} name="house.fill" color={color} />
                <TabBadge count={unreadCounts.home} position="top-right" />
              </View>
            ),
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
            tabBarIcon: ({ color }) => (
              <View style={{ position: "relative" }}>
                <IconSymbol size={24} name="book.fill" color={color} />
                <TabBadge count={unreadCounts.journal} position="top-right" />
              </View>
            ),
          }}
        />

        {/* Tab 3: Intel (Insights) */}
        <Tabs.Screen
          name="insights"
          options={{
            title: t("tabs.intel", { defaultValue: "Intel" }),
            tabBarIcon: ({ color }) => (
              <View style={{ position: "relative" }}>
                <IconSymbol size={24} name="chart.bar.fill" color={color} />
                <TabBadge count={unreadCounts.insights} position="top-right" />
              </View>
            ),
          }}
        />

        {/* Tab 4: Side Quests */}
        <Tabs.Screen
          name="quests"
          options={{
            title: t("tabs.quests", { defaultValue: "Quests" }),
            tabBarIcon: ({ color }) => (
              <View style={{ position: "relative" }}>
                <IconSymbol size={24} name="star.fill" color={color} />
                <TabBadge count={unreadCounts.quests} position="top-right" />
              </View>
            ),
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

      {/* Connect Button — same height as AI FAB, bottom-left */}
      <ConnectFloatingButton bottom={bottomPadding + 70} />
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
  connectFab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  connectFabIcon: {
    fontSize: 22,
  },
});
