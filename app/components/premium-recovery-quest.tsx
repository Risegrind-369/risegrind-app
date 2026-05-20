import React, { useEffect } from "react";
import { View, Text, Modal, Animated, TouchableOpacity } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { useTranslation } from "react-i18next";
import * as Haptics from "expo-haptics";

interface PremiumRecoveryQuestProps {
  visible: boolean;
  onClose: () => void;
  onAccept: () => void;
  habitName: string;
}

export function PremiumRecoveryQuest({
  visible,
  onClose,
  onAccept,
  habitName,
}: PremiumRecoveryQuestProps) {
  const colors = useColors();
  const { t } = useTranslation();
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const glowAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 8,
        }),
        Animated.loop(
          Animated.sequence([
            Animated.timing(glowAnim, {
              toValue: 1,
              duration: 1500,
              useNativeDriver: false,
            }),
            Animated.timing(glowAnim, {
              toValue: 0,
              duration: 1500,
              useNativeDriver: false,
            }),
          ])
        ),
      ]).start();
    } else {
      scaleAnim.setValue(0);
    }
  }, [visible, scaleAnim, glowAnim]);

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(10, 10, 10, 0.9)",
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            width: "100%",
            maxWidth: 340,
          }}
        >
          {/* Glowing border effect */}
          <Animated.View
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 24,
              borderWidth: 2,
              borderColor: colors.success,
              opacity: glowOpacity,
            }}
          />

          {/* Card background */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: 24,
              padding: 32,
              alignItems: "center",
              shadowColor: colors.success,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.4,
              shadowRadius: 24,
              elevation: 20,
            }}
          >
            {/* Flame icon */}
            <Text style={{ fontSize: 64, marginBottom: 20 }}>🔥</Text>

            {/* Title */}
            <Text
              style={{
                fontSize: 28,
                fontWeight: "700",
                color: colors.foreground,
                textAlign: "center",
                marginBottom: 12,
                letterSpacing: -0.5,
              }}
            >
              {t("recovery_quest_title") || "Recovery Quest"}
            </Text>

            {/* Subtitle */}
            <Text
              style={{
                fontSize: 16,
                color: colors.muted,
                textAlign: "center",
                marginBottom: 24,
                lineHeight: 24,
              }}
            >
              {t("recovery_quest_description") || `Complete a 5-10 min challenge to recover 50% of your ${habitName} streak.`}
            </Text>

            {/* Challenge details */}
            <View
              style={{
                backgroundColor: "rgba(255, 98, 0, 0.08)",
                borderRadius: 16,
                padding: 16,
                marginBottom: 24,
                width: "100%",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-around",
                  alignItems: "center",
                }}
              >
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>⏱️</Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.muted,
                      fontWeight: "600",
                    }}
                  >
                    5-10 min
                  </Text>
                </View>
                <View style={{ width: 1, height: 40, backgroundColor: colors.border }} />
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>✨</Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.muted,
                      fontWeight: "600",
                    }}
                  >
                    50% Streak
                  </Text>
                </View>
                <View style={{ width: 1, height: 40, backgroundColor: colors.border }} />
                <View style={{ alignItems: "center" }}>
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>🎯</Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: colors.muted,
                      fontWeight: "600",
                    }}
                  >
                    Earn XP
                  </Text>
                </View>
              </View>
            </View>

            {/* Action buttons */}
            <View style={{ width: "100%", gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  onAccept();
                }}
                activeOpacity={0.6}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#0A0A0A",
                    letterSpacing: -0.3,
                  }}
                >
                  {t("accept_quest") || "Accept Challenge"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  onClose();
                }}
                activeOpacity={0.6}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "600",
                    color: colors.muted,
                    letterSpacing: -0.3,
                  }}
                >
                  {t("skip") || "Skip for now"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
