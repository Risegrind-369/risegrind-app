import { TouchableOpacity } from "react-native";
import { View, Text, Pressable, ScrollView } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

export default function SocialHubScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();

  const handleNavigate = (route: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(route as any);
  };

  const features = [
    {
      id: 'partners',
      title: t('social.hub.partners', 'Accountability Partners'),
      description: t(
        'social.hub.partnersDesc',
        'Find partners with similar goals'
      ),
      icon: '🤝',
      route: '/social/partners',
      color: '#FF6B6B',
    },
    {
      id: 'groups',
      title: t('social.hub.groups', 'Mentor Groups'),
      description: t(
        'social.hub.groupsDesc',
        'Join communities and stay accountable'
      ),
      icon: '👥',
      route: '/social/groups',
      color: '#4ECDC4',
    },
    {
      id: 'leaderboard',
      title: t('social.hub.leaderboard', 'Leaderboards'),
      description: t(
        'social.hub.leaderboardDesc',
        'Track your consistency ranking'
      ),
      icon: '🏆',
      route: '/social/leaderboard',
      color: '#FFD93D',
    },
  ];

  return (
    <ScreenContainer className="p-4">
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-foreground mb-2">
            {t('social.hub.title', 'Social & Accountability')}
          </Text>
          <Text className="text-sm text-muted">
            {t(
              'social.hub.subtitle',
              'Build habits together with accountability partners and mentor groups'
            )}
          </Text>
        </View>

        {/* Quick Stats */}
        <View className="flex-row gap-3 mb-6">
          <View
            className="flex-1 rounded-lg p-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-xs text-muted mb-1">
              {t('social.hub.partners', 'Partners')}
            </Text>
            <Text className="text-2xl font-bold text-foreground">2</Text>
          </View>
          <View
            className="flex-1 rounded-lg p-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-xs text-muted mb-1">
              {t('social.hub.groups', 'Groups')}
            </Text>
            <Text className="text-2xl font-bold text-foreground">1</Text>
          </View>
          <View
            className="flex-1 rounded-lg p-4"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-xs text-muted mb-1">
              {t('social.hub.rank', 'Rank')}
            </Text>
            <Text className="text-2xl font-bold text-foreground">#47</Text>
          </View>
        </View>

        {/* Feature Cards */}
        <View className="mb-6">
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.id}
              onPress={() => handleNavigate(feature.route)}
              activeOpacity={0.6}
            >
              <View className="flex-row items-start gap-4">
                <View
                  className="w-12 h-12 rounded-lg items-center justify-center"
                  style={{ backgroundColor: feature.color + '20' }}
                >
                  <Text className="text-2xl">{feature.icon}</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-lg font-semibold text-foreground mb-1">
                    {feature.title}
                  </Text>
                  <Text className="text-sm text-muted">
                    {feature.description}
                  </Text>
                </View>
                <Text className="text-xl text-muted">→</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity */}
        <View className="mb-6">
          <Text className="text-lg font-bold text-foreground mb-3">
            {t('social.hub.recentActivity', 'Recent Activity')}
          </Text>
          <View
            className="rounded-lg p-4"
            style={{ backgroundColor: colors.surface }}
          >
            <View className="mb-3 pb-3 border-b" style={{ borderColor: colors.border }}>
              <Text className="text-sm font-semibold text-foreground mb-1">
                ✅ Partner accepted request
              </Text>
              <Text className="text-xs text-muted">2 hours ago</Text>
            </View>
            <View className="mb-3 pb-3 border-b" style={{ borderColor: colors.border }}>
              <Text className="text-sm font-semibold text-foreground mb-1">
                📈 You ranked up to #45
              </Text>
              <Text className="text-xs text-muted">1 day ago</Text>
            </View>
            <View>
              <Text className="text-sm font-semibold text-foreground mb-1">
                🎯 New group challenge
              </Text>
              <Text className="text-xs text-muted">2 days ago</Text>
            </View>
          </View>
        </View>

        {/* Tips Section */}
        <View
          className="rounded-lg p-4 mb-6"
          style={{ backgroundColor: colors.primary + '10' }}
        >
          <Text className="text-sm font-semibold text-primary mb-2">
            💡 {t('social.hub.tip', 'Pro Tip')}
          </Text>
          <Text className="text-xs text-muted leading-5">
            {t(
              'social.hub.tipText',
              'Find accountability partners with similar goals to increase your success rate by 3x!'
            )}
          </Text>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
