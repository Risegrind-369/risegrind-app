import { ScrollView, View, Text, FlatList, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { XpBar } from '@/components/gamification/xp-bar';
import { MasteryTierBadge } from '@/components/gamification/mastery-tier-badge';
import { AchievementBadge } from '@/components/gamification/achievement-badge';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';

interface MentorLevel {
  currentLevel: number;
  totalXp: number;
  xpToNextLevel: number;
  mentorStyle: string;
}

interface HabitMastery {
  habitId: string;
  habitName: string;
  tier: 'beginner' | 'consistent' | 'automatic' | 'master';
  streakDays: number;
}

interface Badge {
  id: string;
  name: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  isUnlocked: boolean;
}

export default function GamificationScreen() {
  const colors = useColors();
  const [mentorLevel, setMentorLevel] = useState<MentorLevel | null>(null);
  const [masteries, setMasteries] = useState<HabitMastery[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'masteries'>('overview');

  useEffect(() => {
    fetchGamificationData();
  }, []);

  const fetchGamificationData = async () => {
    try {
      setLoading(true);

      // Fetch mentor level
      const levelRes = await fetch('/api/gamification/mentor/level?userId=user-1');
      const levelData = await levelRes.json();
      setMentorLevel(levelData);

      // Fetch habit masteries
      const masteriesRes = await fetch('/api/gamification/mastery/all?userId=user-1');
      const masteriesData = await masteriesRes.json();
      setMasteries(masteriesData.masteries || []);

      // Fetch badges
      const badgesRes = await fetch('/api/gamification/badges?userId=user-1');
      const badgesData = await badgesRes.json();
      setBadges(badgesData.badges || []);
    } catch (error) {
      console.error('Failed to fetch gamification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabPress = (tab: typeof activeTab) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">Loading gamification data...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="gap-2 mb-6">
          <Text className="text-3xl font-bold text-foreground">Gamification</Text>
          <Text className="text-sm text-muted">Track your progress and unlock rewards</Text>
        </View>

        {/* Mentor Level Card */}
        {mentorLevel && (
          <View className="bg-surface rounded-2xl p-6 mb-6 border border-border">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-2xl font-bold text-foreground">
                Level {mentorLevel.currentLevel}
              </Text>
              <Text className="text-3xl">{mentorLevel.mentorStyle === 'Strict Mentor' ? '🎯' : '✨'}</Text>
            </View>
            <XpBar
              currentXp={mentorLevel.totalXp}
              xpToNextLevel={mentorLevel.xpToNextLevel}
              currentLevel={mentorLevel.currentLevel}
            />
            <Text className="text-xs text-muted mt-3">Active: {mentorLevel.mentorStyle}</Text>
          </View>
        )}

        {/* Tab Navigation */}
        <View className="flex-row gap-2 mb-6">
          {(['overview', 'badges', 'masteries'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => handleTabPress(tab)}
              style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
            >
              <View
                className={`px-4 py-2 rounded-full border ${
                  activeTab === tab
                    ? 'bg-primary border-primary'
                    : 'bg-surface border-border'
                }`}
                style={{
                  backgroundColor: activeTab === tab ? colors.primary : colors.surface,
                  borderColor: activeTab === tab ? colors.primary : colors.border,
                }}
              >
                <Text
                  className={`text-sm font-semibold ${
                    activeTab === tab ? 'text-background' : 'text-foreground'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <View className="gap-4">
            {/* Stats Grid */}
            <View className="flex-row gap-3">
              <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
                <Text className="text-2xl font-bold text-primary">{badges.filter(b => b.isUnlocked).length}</Text>
                <Text className="text-xs text-muted mt-1">Badges Unlocked</Text>
              </View>
              <View className="flex-1 bg-surface rounded-xl p-4 border border-border">
                <Text className="text-2xl font-bold text-success">{masteries.length}</Text>
                <Text className="text-xs text-muted mt-1">Habits Tracked</Text>
              </View>
            </View>

            {/* Recent Masteries */}
            <View>
              <Text className="text-lg font-bold text-foreground mb-3">Recent Habits</Text>
              {masteries.slice(0, 3).map((mastery) => (
                <View
                  key={mastery.habitId}
                  className="flex-row items-center justify-between bg-surface rounded-xl p-4 mb-2 border border-border"
                >
                  <View className="flex-1">
                    <Text className="font-semibold text-foreground">{mastery.habitName}</Text>
                    <Text className="text-xs text-muted mt-1">
                      {mastery.streakDays} day streak
                    </Text>
                  </View>
                  <MasteryTierBadge tier={mastery.tier} size="md" showLabel={false} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <View>
            <Text className="text-lg font-bold text-foreground mb-3">
              {badges.filter(b => b.isUnlocked).length} / {badges.length} Badges
            </Text>
            <FlatList
              data={badges}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={{ gap: 12 }}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={{ flex: 1 }}>
                  <AchievementBadge
                    name={item.name}
                    description="Achievement badge"
                    icon={item.icon}
                    rarity={item.rarity}
                    isUnlocked={item.isUnlocked}
                  />
                </View>
              )}
            />
          </View>
        )}

        {/* Masteries Tab */}
        {activeTab === 'masteries' && (
          <View>
            <Text className="text-lg font-bold text-foreground mb-3">Habit Mastery</Text>
            {masteries.map((mastery) => (
              <View
                key={mastery.habitId}
                className="bg-surface rounded-xl p-4 mb-3 border border-border"
              >
                <View className="flex-row items-center justify-between mb-3">
                  <Text className="font-semibold text-foreground flex-1">{mastery.habitName}</Text>
                  <MasteryTierBadge tier={mastery.tier} size="lg" showLabel={true} />
                </View>
                <Text className="text-sm text-muted">
                  🔥 {mastery.streakDays} day streak
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
