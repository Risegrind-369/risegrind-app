import { ScrollView, View, Text, FlatList } from 'react-native';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { XpBar } from '@/components/gamification/xp-bar';
import { MentorStyleSelector } from '@/components/gamification/mentor-style-selector';
import { useColors } from '@/hooks/use-colors';

interface MentorLevel {
  currentLevel: number;
  totalXp: number;
  xpToNextLevel: number;
  mentorStyle: string;
  unlockedStyles: string[];
}

interface MentorStyle {
  name: string;
  description: string;
  icon: string;
  unlockedAtLevel: number;
}

const MENTOR_STYLES: MentorStyle[] = [
  {
    name: 'Strict Mentor',
    description: 'No-nonsense, direct feedback',
    icon: '🎯',
    unlockedAtLevel: 1,
  },
  {
    name: 'Supportive Mentor',
    description: 'Encouraging and compassionate',
    icon: '💪',
    unlockedAtLevel: 5,
  },
  {
    name: 'Motivational Mentor',
    description: 'Inspiring and energetic',
    icon: '🚀',
    unlockedAtLevel: 10,
  },
  {
    name: 'Analytical Mentor',
    description: 'Data-driven insights',
    icon: '📊',
    unlockedAtLevel: 15,
  },
  {
    name: 'Zen Mentor',
    description: 'Calm and mindful approach',
    icon: '🧘',
    unlockedAtLevel: 20,
  },
  {
    name: 'Gamified Mentor',
    description: 'Game-like challenges and rewards',
    icon: '🎮',
    unlockedAtLevel: 25,
  },
  {
    name: 'Personalized Mentor',
    description: 'AI-trained on your habits',
    icon: '🤖',
    unlockedAtLevel: 30,
  },
  {
    name: 'Master Mentor',
    description: 'Combined all styles',
    icon: '👑',
    unlockedAtLevel: 40,
  },
  {
    name: 'Legendary Mentor',
    description: 'Exclusive ultimate mentor',
    icon: '⭐',
    unlockedAtLevel: 50,
  },
];

export default function MentorLevelScreen() {
  const colors = useColors();
  const [mentorLevel, setMentorLevel] = useState<MentorLevel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMentorLevel();
  }, []);

  const fetchMentorLevel = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/gamification/mentor/level?userId=user-1');
      const data = await res.json();
      setMentorLevel(data);
    } catch (error) {
      console.error('Failed to fetch mentor level:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStyle = async (style: string) => {
    try {
      await fetch('/api/gamification/mentor/set-style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: 'user-1', style }),
      });
      if (mentorLevel) {
        setMentorLevel({ ...mentorLevel, mentorStyle: style });
      }
    } catch (error) {
      console.error('Failed to set mentor style:', error);
    }
  };

  if (loading || !mentorLevel) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">Loading mentor level...</Text>
      </ScreenContainer>
    );
  }

  // Generate level progression data
  const levelProgression = Array.from({ length: 50 }, (_, i) => {
    const level = i + 1;
    const xpRequired = 100 * (level - 1) + 50 * Math.pow(level - 1, 2);
    const isUnlocked = level <= mentorLevel.currentLevel;
    const isCurrent = level === mentorLevel.currentLevel;

    return {
      level,
      xpRequired,
      isUnlocked,
      isCurrent,
    };
  });

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="gap-2 mb-6">
          <Text className="text-3xl font-bold text-foreground">Mentor Levels</Text>
          <Text className="text-sm text-muted">Progress through 50 levels and unlock new mentor styles</Text>
        </View>

        {/* Current Level Card */}
        <View className="bg-surface rounded-2xl p-6 mb-6 border border-border">
          <View className="flex-row items-center justify-between mb-4">
            <View>
              <Text className="text-4xl font-bold text-primary">{mentorLevel.currentLevel}</Text>
              <Text className="text-sm text-muted">Current Level</Text>
            </View>
            <Text className="text-5xl">
              {mentorLevel.currentLevel === 50 ? '👑' : '📈'}
            </Text>
          </View>

          <XpBar
            currentXp={mentorLevel.totalXp}
            xpToNextLevel={mentorLevel.xpToNextLevel}
            currentLevel={mentorLevel.currentLevel}
          />

          {mentorLevel.currentLevel === 50 && (
            <View className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary">
              <Text className="text-sm font-semibold text-primary">🎉 Max Level Reached!</Text>
              <Text className="text-xs text-muted mt-1">You have unlocked all mentor styles</Text>
            </View>
          )}
        </View>

        {/* Mentor Style Selector */}
        <MentorStyleSelector
          styles={MENTOR_STYLES}
          activeMentorStyle={mentorLevel.mentorStyle}
          currentLevel={mentorLevel.currentLevel}
          onSelectStyle={handleSelectStyle}
          className="mb-8"
        />

        {/* Level Progression Timeline */}
        <View className="gap-4">
          <Text className="text-lg font-bold text-foreground">Level Progression</Text>

          <FlatList
            data={levelProgression}
            keyExtractor={(item) => `level-${item.level}`}
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View
                className={`flex-row items-center gap-3 p-3 rounded-lg mb-2 border ${
                  item.isCurrent
                    ? 'bg-primary/10 border-primary'
                    : item.isUnlocked
                      ? 'bg-surface border-border'
                      : 'bg-surface/50 border-border/50 opacity-50'
                }`}
                style={{
                  backgroundColor: item.isCurrent ? `${colors.primary}10` : colors.surface,
                  borderColor: item.isCurrent ? colors.primary : colors.border,
                }}
              >
                <View className="items-center justify-center w-12 h-12 rounded-lg bg-background">
                  <Text className="font-bold text-foreground">{item.level}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-sm font-semibold text-foreground">
                    Level {item.level}
                  </Text>
                  <Text className="text-xs text-muted">{item.xpRequired.toLocaleString()} XP</Text>
                </View>
                {item.isCurrent && (
                  <Text className="text-lg">📍</Text>
                )}
                {item.isUnlocked && !item.isCurrent && (
                  <Text className="text-lg">✅</Text>
                )}
              </View>
            )}
          />
        </View>

        {/* Benefits Section */}
        <View className="mt-8 gap-3">
          <Text className="text-lg font-bold text-foreground">Level Benefits</Text>
          <View className="bg-surface rounded-lg p-4 border border-border gap-2">
            <View className="flex-row gap-2">
              <Text>📈</Text>
              <Text className="text-sm text-foreground flex-1">
                Unlock new mentor styles every 5 levels
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Text>⭐</Text>
              <Text className="text-sm text-foreground flex-1">
                Increase XP multiplier (1.0x → 1.5x at level 50)
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Text>🎁</Text>
              <Text className="text-sm text-foreground flex-1">
                Unlock advanced features and exclusive badges
              </Text>
            </View>
            <View className="flex-row gap-2">
              <Text>🏆</Text>
              <Text className="text-sm text-foreground flex-1">
                Boost your leaderboard ranking
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
