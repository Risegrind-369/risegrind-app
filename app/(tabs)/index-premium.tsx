'use client';
import 'react-native-reanimated';
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useApp, MOOD_EMOJIS, MOOD_LABELS, type MoodLevel } from '@/lib/app-context';
import { AnimatedMoodPicker } from '@/components/animated-mood-picker';
import { AnimatedProgressRing } from '@/components/animated-progress-ring';
import { AnimatedStreakFire } from '@/components/animated-streak-fire';
import { XPBar } from '@/components/ui/xp-bar';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name} ☀️`;
  if (hour < 17) return `Good afternoon, ${name} 👋`;
  return `Good evening, ${name} 🌙`;
}

function formatDate(): string {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

function AnimatedPressable({
  children,
  onPress,
  style,
}: {
  children: React.ReactNode;
  onPress: () => void;
  style?: any;
}) {
  const scaleValue = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  return (
    <Pressable
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        scaleValue.value = withSpring(0.96, { damping: 8, mass: 1 });
        setTimeout(() => {
          scaleValue.value = withSpring(1, { damping: 8, mass: 1 });
        }, 50);
        onPress();
      }}
    >
      <Animated.View style={[animatedStyle, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}

export default function HomeScreenPremium() {
  const colors = useColors();
  const router = useRouter();
  const { state, dispatch, todayCompletions, todayProgress, rank } = useApp();
  const [showMoodPicker, setShowMoodPicker] = useState(false);
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];
  const hasMoodToday = !!state.todayMood;

  const handleMoodSelect = (level: MoodLevel) => {
    setSelectedMood(level);
  };

  const handleMoodSave = () => {
    if (!selectedMood) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    dispatch({
      type: 'SET_MOOD',
      payload: {
        id: `mood_${Date.now()}`,
        date: todayStr,
        level: selectedMood,
        emoji: MOOD_EMOJIS[selectedMood],
        timestamp: Date.now(),
      },
    });
    dispatch({ type: 'ADD_XP', payload: 5 });
    dispatch({ type: 'UPDATE_STREAK' });
    setShowMoodPicker(false);
    setSelectedMood(null);
  };

  const recentEntries = state.journalEntries.slice(0, 3);

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.foreground }]}>
              {getGreeting(state.userName || 'Friend')}
            </Text>
            <Text style={[styles.date, { color: colors.muted }]}>{formatDate()}</Text>
          </View>
          <AnimatedStreakFire streak={state.streak} isIncreasing={false} />
        </View>

        {/* Progress Ring + Stats */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.ringSection}>
            <AnimatedProgressRing
              progress={todayProgress}
              size={150}
              strokeWidth={14}
              color={colors.primary}
            >
              <Text style={[styles.ringPercent, { color: colors.foreground }]}>
                {Math.round(todayProgress * 100)}%
              </Text>
              <Text style={[styles.ringLabel, { color: colors.muted }]}>
                {todayCompletions.length}/{state.habits.length}
              </Text>
            </AnimatedProgressRing>

            <View style={styles.statsColumn}>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.foreground }]}>
                  {state.streak}
                </Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>Day Streak</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.foreground }]}>
                  {state.xp.toLocaleString()}
                </Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>Total XP</Text>
              </View>
              <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: colors.foreground }]}>
                  {state.journalEntries.length}
                </Text>
                <Text style={[styles.statLabel, { color: colors.muted }]}>Entries</Text>
              </View>
            </View>
          </View>

          {/* XP Bar */}
          <View style={styles.xpSection}>
            <XPBar xp={state.xp} />
          </View>
        </View>

        {/* Mood Check-in */}
        {!hasMoodToday ? (
          <AnimatedPressable
            onPress={() => setShowMoodPicker(true)}
            style={[
              styles.moodBanner,
              {
                backgroundColor: colors.primary + '12',
                borderColor: colors.primary + '40',
              },
            ]}
          >
            <Text style={styles.moodBannerEmoji}>😊</Text>
            <View style={styles.moodBannerText}>
              <Text style={[styles.moodBannerTitle, { color: colors.foreground }]}>
                How do you feel today?
              </Text>
              <Text style={[styles.moodBannerSub, { color: colors.muted }]}>
                Tap to log your mood
              </Text>
            </View>
            <Text style={[styles.moodBannerArrow, { color: colors.primary }]}>›</Text>
          </AnimatedPressable>
        ) : (
          <View
            style={[
              styles.moodDone,
              {
                backgroundColor: colors.success + '12',
                borderColor: colors.success + '40',
              },
            ]}
          >
            <Text style={styles.moodBannerEmoji}>{state.todayMood?.emoji}</Text>
            <View style={styles.moodBannerText}>
              <Text style={[styles.moodBannerTitle, { color: colors.foreground }]}>
                Feeling {MOOD_LABELS[state.todayMood?.level ?? 3]}
              </Text>
              <Text style={[styles.moodBannerSub, { color: colors.muted }]}>
                Mood logged for today ✓
              </Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <AnimatedPressable
              onPress={() => router.push('/(tabs)/routine' as never)}
              style={[
                styles.actionCard,
                { backgroundColor: '#3B82F620' },
              ]}
            >
              <Text style={styles.actionEmoji}>🏃</Text>
              <Text style={[styles.actionLabel, { color: colors.foreground }]}>
                Start Routine
              </Text>
              <Text style={[styles.actionSub, { color: colors.muted }]}>
                {todayCompletions.length}/{state.habits.length} done
              </Text>
            </AnimatedPressable>

            <AnimatedPressable
              onPress={() => router.push('/(tabs)/journal' as never)}
              style={[
                styles.actionCard,
                { backgroundColor: '#10B98120' },
              ]}
            >
              <Text style={styles.actionEmoji}>✍️</Text>
              <Text style={[styles.actionLabel, { color: colors.foreground }]}>
                Journal
              </Text>
              <Text style={[styles.actionSub, { color: colors.muted }]}>
                {state.journalEntries.length} entries
              </Text>
            </AnimatedPressable>

            <AnimatedPressable
              onPress={() => router.push('/(tabs)/insights' as never)}
              style={[
                styles.actionCard,
                { backgroundColor: '#8B5CF620' },
              ]}
            >
              <Text style={styles.actionEmoji}>🧠</Text>
              <Text style={[styles.actionLabel, { color: colors.foreground }]}>
                Insights
              </Text>
              <Text style={[styles.actionSub, { color: colors.muted }]}>
                AI analysis
              </Text>
            </AnimatedPressable>
          </View>
        </View>

        {/* Recent Journal Entries */}
        {recentEntries.length > 0 && (
          <View style={styles.recentSection}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Entries</Text>
            {recentEntries.map((entry) => (
              <View
                key={entry.id}
                style={[
                  styles.entryCard,
                  { backgroundColor: colors.surface, borderColor: colors.border },
                ]}
              >
                <Text style={[styles.entryDate, { color: colors.muted }]}>
                  {new Date(entry.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                  })}
                </Text>
                <Text
                  style={[styles.entryContent, { color: colors.foreground }]}
                  numberOfLines={2}
                >
                  {entry.content}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Animated Mood Picker Modal */}
      <AnimatedMoodPicker
        visible={showMoodPicker}
        onClose={() => setShowMoodPicker(false)}
        onSelect={handleMoodSelect}
        selectedMood={selectedMood}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
    lineHeight: 28,
  },
  date: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 2,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    gap: 16,
  },
  ringSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  ringPercent: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  ringLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  statsColumn: {
    flex: 1,
    gap: 10,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  statDivider: {
    height: 1,
    width: '80%',
    alignSelf: 'center',
  },
  xpSection: {
    paddingTop: 4,
  },
  moodBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  moodDone: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  moodBannerEmoji: {
    fontSize: 28,
  },
  moodBannerText: {
    flex: 1,
  },
  moodBannerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  moodBannerSub: {
    fontSize: 13,
    marginTop: 2,
  },
  moodBannerArrow: {
    fontSize: 24,
    fontWeight: '300',
  },
  quickActions: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCard: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    gap: 6,
    alignItems: 'center',
  },
  actionEmoji: {
    fontSize: 28,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  actionSub: {
    fontSize: 11,
    textAlign: 'center',
  },
  recentSection: {
    gap: 10,
  },
  entryCard: {
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 4,
  },
  entryDate: {
    fontSize: 12,
    fontWeight: '600',
  },
  entryContent: {
    fontSize: 14,
    lineHeight: 20,
  },
});
