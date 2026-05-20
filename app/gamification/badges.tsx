import { TouchableOpacity } from "react-native";
import { ScrollView, View, Text, FlatList, Pressable } from 'react-native';
import { useState, useEffect } from 'react';
import { ScreenContainer } from '@/components/screen-container';
import { AchievementBadge } from '@/components/gamification/achievement-badge';
import { useColors } from '@/hooks/use-colors';
import * as Haptics from 'expo-haptics';

interface Badge {
  id: string;
  name: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  description: string;
  isUnlocked: boolean;
  unlockedAt?: Date;
}

type FilterType = 'all' | 'common' | 'rare' | 'epic' | 'legendary';
type CategoryType = 'all' | 'streak' | 'consistency' | 'social' | 'milestone' | 'challenge' | 'gamification';

export default function BadgeGalleryScreen() {
  const colors = useColors();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [rarityFilter, setRarityFilter] = useState<FilterType>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryType>('all');

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/gamification/badges?userId=user-1');
      const data = await res.json();
      setBadges(data.badges || []);
    } catch (error) {
      console.error('Failed to fetch badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBadges = badges.filter((badge) => {
    const rarityMatch = rarityFilter === 'all' || badge.rarity === rarityFilter;
    return rarityMatch;
  });

  const handleFilterPress = (filter: FilterType) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRarityFilter(filter);
  };

  const rarityStats = {
    common: badges.filter((b) => b.rarity === 'common' && b.isUnlocked).length,
    rare: badges.filter((b) => b.rarity === 'rare' && b.isUnlocked).length,
    epic: badges.filter((b) => b.rarity === 'epic' && b.isUnlocked).length,
    legendary: badges.filter((b) => b.rarity === 'legendary' && b.isUnlocked).length,
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <Text className="text-foreground">Loading badges...</Text>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Header */}
        <View className="gap-2 mb-6">
          <Text className="text-3xl font-bold text-foreground">Badge Gallery</Text>
          <Text className="text-sm text-muted">
            {badges.filter((b) => b.isUnlocked).length} / {badges.length} badges unlocked
          </Text>
        </View>

        {/* Rarity Stats */}
        <View className="flex-row gap-2 mb-6">
          <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
            <Text className="text-xs text-muted">Common</Text>
            <Text className="text-lg font-bold text-foreground">{rarityStats.common}</Text>
          </View>
          <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
            <Text className="text-xs text-muted">Rare</Text>
            <Text className="text-lg font-bold text-blue-500">{rarityStats.rare}</Text>
          </View>
          <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
            <Text className="text-xs text-muted">Epic</Text>
            <Text className="text-lg font-bold text-purple-500">{rarityStats.epic}</Text>
          </View>
          <View className="flex-1 bg-surface rounded-lg p-3 border border-border">
            <Text className="text-xs text-muted">Legendary</Text>
            <Text className="text-lg font-bold text-yellow-500">{rarityStats.legendary}</Text>
          </View>
        </View>

        {/* Rarity Filter */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-foreground mb-3">Filter by Rarity</Text>
          <View className="flex-row gap-2 flex-wrap">
            {(['all', 'common', 'rare', 'epic', 'legendary'] as const).map((filter) => (
              <TouchableOpacity
                key={filter}
                onPress={() => handleFilterPress(filter)}
                activeOpacity={0.6}
              >
                <View
                  className={`px-4 py-2 rounded-full border ${
                    rarityFilter === filter
                      ? 'bg-primary border-primary'
                      : 'bg-surface border-border'
                  }`}
                  style={{
                    backgroundColor: rarityFilter === filter ? colors.primary : colors.surface,
                    borderColor: rarityFilter === filter ? colors.primary : colors.border,
                  }}
                >
                  <Text
                    className={`text-sm font-semibold capitalize ${
                      rarityFilter === filter ? 'text-background' : 'text-foreground'
                    }`}
                  >
                    {filter}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Badge Grid */}
        <FlatList
          data={filteredBadges}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View style={{ flex: 1 }}>
              <AchievementBadge
                name={item.name}
                description={item.description}
                icon={item.icon}
                rarity={item.rarity}
                isUnlocked={item.isUnlocked}
                unlockedAt={item.unlockedAt}
              />
            </View>
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-12">
              <Text className="text-muted">No badges match this filter</Text>
            </View>
          }
        />
      </ScrollView>
    </ScreenContainer>
  );
}
