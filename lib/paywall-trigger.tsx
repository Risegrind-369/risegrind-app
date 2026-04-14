/**
 * PaywallTriggerProvider
 *
 * Automatically shows a bottom-sheet paywall after 1–2 days of use
 * if the user is not yet subscribed. The sheet navigates to the full
 * paywall screen when the user taps the CTA.
 */
import React, { useEffect, useState } from 'react';
import { Modal, View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/use-colors';
import { useRevenueCat } from './revenuecat-provider';
import { useTranslation } from 'react-i18next';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ICON_URL = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663533327081/FX74FzCVEe6tC4xxrVKhws/risegrind-icon-v2-fGbAHYbpaF4huMRJsUSWRR.png';

interface PaywallTriggerProps {
  children: React.ReactNode;
}

export function PaywallTriggerProvider({ children }: PaywallTriggerProps) {
  const [showPaywall, setShowPaywall] = useState(false);
  const colors = useColors();
  const router = useRouter();
  const { isPremium } = useRevenueCat();
  const { t } = useTranslation();

  useEffect(() => {
    // Don't show paywall if user has premium or active trial
    if (isPremium) {
      setShowPaywall(false);
      return;
    }
    checkAndTriggerPaywall();
  }, [isPremium]);

  const checkAndTriggerPaywall = async () => {
    try {
      // First check if user has an active trial (set in trial-reveal.tsx)
      const trialStartedAt = await AsyncStorage.getItem('trialStartedAt');
      if (trialStartedAt) {
        const startTime = parseInt(trialStartedAt, 10);
        const now = Date.now();
        const trialDurationMs = 3 * 24 * 60 * 60 * 1000; // 72 hours
        if (now - startTime < trialDurationMs) {
          // Trial is still active, don't show paywall
          console.log('[PaywallTrigger] Trial is active, not showing paywall');
          return;
        } else {
          // Trial has expired, clear the marker
          await AsyncStorage.removeItem('trialStartedAt');
        }
      }
      
      const savedStartTime = await AsyncStorage.getItem('appStartTime');
      const now = Date.now();

      if (!savedStartTime) {
        // First app open — record the time, don't show paywall yet
        await AsyncStorage.setItem('appStartTime', now.toString());
        return;
      }

      const startTime = parseInt(savedStartTime, 10);
      const daysPassed = (now - startTime) / (1000 * 60 * 60 * 24);

      // Show paywall between day 1 and day 2 of usage (only if no active trial)
      if (daysPassed >= 1 && daysPassed < 2) {
        const alreadyShown = await AsyncStorage.getItem('paywallShownDay1');
        if (!alreadyShown) {
          await AsyncStorage.setItem('paywallShownDay1', 'true');
          setTimeout(() => {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            setShowPaywall(true);
          }, 800);
        }
      }
    } catch (e) {
      console.warn('[PaywallTrigger] Error checking trigger:', e);
    }
  };

  const handleOpenPaywall = () => {
    setShowPaywall(false);
    // Navigate to the full paywall screen
    router.push('/onboarding/paywall' as never);
  };

  return (
    <>
      {children}

      <Modal
        visible={showPaywall}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPaywall(false)}
      >
        <View style={styles.overlay}>
          <View style={[styles.sheet, { backgroundColor: colors.background }]}>
            {/* Handle */}
            <View style={[styles.handle, { backgroundColor: colors.border }]} />

            {/* Icon */}
            <Image source={{ uri: ICON_URL }} style={styles.icon} />

            {/* Copy */}
            <Text style={[styles.title, { color: colors.foreground }]}>
              {t('paywallTrigger.title', { defaultValue: 'Your Free Trial Awaits' })}
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              {t('paywallTrigger.subtitle', {
                defaultValue:
                  'Start your 3-day free trial – Full access to AI coach, unlimited habits, deep insights, and Ghost Mode tools. Then $4.99/month or $39.99/year – cancel anytime.',
              })}
            </Text>

            {/* Benefits */}
            <View style={[styles.benefitsBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              {[
                { icon: '👻', key: 'benefit1', fallback: 'Ghost Mode — full discipline toolkit' },
                { icon: '🧠', key: 'benefit2', fallback: 'AI Coach — daily clarity & direction' },
                { icon: '🔥', key: 'benefit3', fallback: 'Unlimited habits & streak protection' },
                { icon: '📊', key: 'benefit4', fallback: 'Ghost Intel — deep analytics & insights' },
              ].map(({ icon, key, fallback }) => (
                <View key={key} style={styles.benefitRow}>
                  <Text style={styles.benefitIcon}>{icon}</Text>
                  <Text style={[styles.benefitText, { color: colors.foreground }]}>
                    {t(`paywallTrigger.${key}`, { defaultValue: fallback })}
                  </Text>
                </View>
              ))}
            </View>

            {/* CTA */}
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                handleOpenPaywall();
              }}
              style={({ pressed }) => [
                styles.ctaButton,
                { backgroundColor: '#F97316', transform: [{ scale: pressed ? 0.97 : 1 }] },
              ]}
            >
              <Text style={styles.ctaText}>
                {t('paywallTrigger.cta', { defaultValue: 'Start 3-Day Free Trial' })}
              </Text>
              <Text style={styles.ctaSub}>
                {t('paywallTrigger.ctaSub', { defaultValue: 'No charge today · Cancel anytime' })}
              </Text>
            </Pressable>

            {/* Dismiss */}
            <Pressable
              onPress={() => setShowPaywall(false)}
              style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, padding: 12 })}
            >
              <Text style={[styles.dismissText, { color: colors.muted }]}>
                {t('paywallTrigger.dismiss', { defaultValue: 'Remind me later' })}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 44,
    gap: 16,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 4,
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: 14,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  benefitsBox: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    borderWidth: 1,
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
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    lineHeight: 20,
  },
  ctaButton: {
    width: '100%',
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    marginTop: 4,
  },
  ctaText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  ctaSub: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '500',
  },
  dismissText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});
