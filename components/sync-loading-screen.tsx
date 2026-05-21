/**
 * SyncLoadingScreen
 *
 * Shown during the first-sync flow (pushAllState + pullAll) on first launch or reinstall.
 * Invisible on normal launches — sync happens in background.
 *
 * Shows a retry button if sync fails.
 */

import React, { useEffect, useRef } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from "react-native";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence, Easing } from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";

interface SyncLoadingScreenProps {
  error: string | null;
  onRetry: () => void;
}

export function SyncLoadingScreen({ error, onRetry }: SyncLoadingScreenProps) {
  const colors = useColors();
  const opacity = useSharedValue(1);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 900, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 900, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {error ? (
        <>
          <Text style={[styles.errorIcon]}>⚠️</Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Sync Failed</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{error}</Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            activeOpacity={0.8}
            onPress={onRetry}
          >
            <Text style={[styles.retryText, { color: "#fff" }]}>Retry</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Animated.Text style={[styles.icon, animatedStyle]}>☁️</Animated.Text>
          <Text style={[styles.title, { color: colors.foreground }]}>Syncing your data...</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Setting up your account. This only happens once.
          </Text>
          <ActivityIndicator
            size="small"
            color={colors.primary}
            style={styles.spinner}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
  },
  icon: {
    fontSize: 48,
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  spinner: {
    marginTop: 8,
  },
  retryButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 24,
    marginTop: 8,
  },
  retryText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
