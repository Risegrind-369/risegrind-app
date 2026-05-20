import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  ScrollView,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { LeaderboardRow } from '@/components/social/leaderboard-row';
import { useColors } from '@/hooks/use-colors';
import { useTranslation } from 'react-i18next';

interface LeaderboardEntry {
  id: number;
  userId: number;
  groupId?: number;
  consistencyScore: number;
  currentStreak: number;
  longestStreak: number;
  completedHabits: number;
  totalHabits: number;
  rank?: number;
}

export default function LeaderboardScreen() {
  const colors = useColors();
  const { t } = useTranslation();

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'global' | 'weekly' | 'monthly'>(
    'global'
  );
  const [userRank, setUserRank] = useState<number | null>(null);

  // TODO: Get current user ID from auth context
  const currentUserId = 1;

  useEffect(() => {
    loadLeaderboard();
  }, [activeTab]);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);

      // For now, we'll use a mock group ID. In production, this would be dynamic.
      const groupId = 1;

      const res = await fetch(`/api/social/leaderboard/group/${groupId}`);
      if (res.ok) {
        const data = await res.json();
        // Add rank based on position
        const ranked = data.map((entry: LeaderboardEntry, idx: number) => ({
          ...entry,
          rank: idx + 1,
        }));
        setLeaderboardData(ranked);

        // Find current user's rank
        const userEntry = ranked.find((e: any) => e.userId === currentUserId);
        if (userEntry) {
          setUserRank(userEntry.rank);
        }
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      {/* Header */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-foreground mb-1">
          {t('social.leaderboard.title', 'Leaderboards')}
        </Text>
        <Text className="text-sm text-muted">
          {t('social.leaderboard.subtitle', 'Track your consistency ranking')}
        </Text>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row gap-2 mb-4">
        {(['global', 'weekly', 'monthly'] as const).map((tab) => (
          <Pressable
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={({ pressed }) => [
              {
                flex: 1,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: 8,
                backgroundColor:
                  activeTab === tab ? colors.primary : colors.surface,
                opacity: pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text
              className="text-center text-sm font-semibold"
              style={{
                color: activeTab === tab ? 'white' : colors.foreground,
              }}
            >
              {tab === 'global'
                ? t('social.leaderboard.global', 'Global')
                : tab === 'weekly'
                  ? t('social.leaderboard.weekly', 'Weekly')
                  : t('social.leaderboard.monthly', 'Monthly')}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* User's Rank Card */}
      {userRank && (
        <View
          className="rounded-lg p-4 mb-4 border"
          style={{
            backgroundColor: colors.primary + '10',
            borderColor: colors.primary,
          }}
        >
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-sm text-muted mb-1">
                {t('social.leaderboard.yourRank', 'Your Rank')}
              </Text>
              <Text className="text-2xl font-bold text-primary">
                #{userRank}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-3xl">🏆</Text>
            </View>
          </View>
        </View>
      )}

      {/* Leaderboard List */}
      <FlatList
        data={leaderboardData}
        keyExtractor={(item) => `leaderboard-${item.id}`}
        renderItem={({ item, index }) => (
          <LeaderboardRow
            rank={index + 1}
            userName={`User ${item.userId}`}
            consistencyScore={item.consistencyScore}
            currentStreak={item.currentStreak}
            isCurrentUser={item.userId === currentUserId}
            rankChange={item.userId === currentUserId ? 5 : undefined}
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            <Text className="text-muted text-center">
              {t('social.leaderboard.empty', 'No leaderboard data available')}
            </Text>
          </View>
        }
        scrollEnabled={false}
      />

      {/* Info Section */}
      <View className="mt-6 p-4 rounded-lg" style={{ backgroundColor: colors.surface }}>
        <Text className="text-sm font-semibold text-foreground mb-2">
          {t('social.leaderboard.howItWorks', 'How It Works')}
        </Text>
        <Text className="text-xs text-muted leading-5">
          {t(
            'social.leaderboard.explanation',
            'Your consistency score is calculated based on the percentage of habits you complete each day. Higher streaks and more completed habits improve your ranking.'
          )}
        </Text>
      </View>
    </ScreenContainer>
  );
}
