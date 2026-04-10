'use client';
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { useRevenueCat } from './revenuecat-provider';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface PaywallTriggerProps {
  children: React.ReactNode;
}

export function PaywallTriggerProvider({ children }: PaywallTriggerProps) {
  const [showPaywall, setShowPaywall] = useState(false);
  const [appStartTime, setAppStartTime] = useState<number | null>(null);
  const colors = useColors();
  const { isPremium } = useRevenueCat();

  useEffect(() => {
    const initializePaywallTrigger = async () => {
      const savedStartTime = await AsyncStorage.getItem('appStartTime');
      const now = Date.now();

      if (!savedStartTime) {
        // First app open
        await AsyncStorage.setItem('appStartTime', now.toString());
        setAppStartTime(now);
      } else {
        const startTime = parseInt(savedStartTime);
        setAppStartTime(startTime);

        // Check if 1-2 days have passed
        const daysPassed = (now - startTime) / (1000 * 60 * 60 * 24);
        if (daysPassed >= 1 && daysPassed < 2 && !isPremium) {
          // Show paywall after 1-2 days
          setTimeout(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setShowPaywall(true);
          }, 500);
        }
      }
    };

    initializePaywallTrigger();
  }, [isPremium]);

  const handleShowPaywall = () => {
    setShowPaywall(false);
    // Trigger paywall modal in main app
  };

  return (
    <>
      {children}

      {/* Paywall Trigger Modal */}
      <Modal
        visible={showPaywall}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaywall(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />

            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              Your free trial is ending soon
            </Text>
            <Text style={[styles.modalSub, { color: colors.muted }]}>
              You've experienced the full power of RiseGrind. Continue your journey with a premium subscription.
            </Text>

            <View style={[styles.benefitsBox, { backgroundColor: colors.surface }]}>
              <BenefitRow icon="🔥" text="Unlimited habits & routines" />
              <BenefitRow icon="📖" text="Unlimited journal entries" />
              <BenefitRow icon="🧠" text="Full AI analysis & insights" />
              <BenefitRow icon="🏆" text="All achievements & badges" />
            </View>

            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                handleShowPaywall();
              }}
              style={({ pressed }) => [
                styles.ctaButton,
                {
                  backgroundColor: colors.primary,
                  transform: [{ scale: pressed ? 0.97 : 1 }],
                },
              ]}
            >
              <Text style={styles.ctaText}>Continue with Premium</Text>
            </Pressable>

            <Pressable
              onPress={() => setShowPaywall(false)}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 12 })}
            >
              <Text style={[styles.dismissText, { color: colors.muted }]}>Remind me later</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

function BenefitRow({ icon, text }: { icon: string; text: string }) {
  const colors = useColors();
  return (
    <View style={styles.benefitRow}>
      <Text style={styles.benefitIcon}>{icon}</Text>
      <Text style={[styles.benefitText, { color: colors.foreground }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalSub: {
    fontSize: 15,
    lineHeight: 22,
  },
  benefitsBox: {
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  benefitIcon: {
    fontSize: 20,
    width: 28,
  },
  benefitText: {
    fontSize: 15,
    fontWeight: '500',
    flex: 1,
  },
  ctaButton: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  ctaText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  dismissText: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'center',
  },
});
