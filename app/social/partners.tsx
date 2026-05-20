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
import { PartnerCard } from '@/components/social/partner-card';
import { useColors } from '@/hooks/use-colors';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface PartnerMatch {
  userId: number;
  matchScore: number;
  commonGoals: string[];
  motivationStyle?: string;
}

interface Partnership {
  id: number;
  userId: number;
  partnerId: number;
  status: 'pending' | 'accepted' | 'rejected' | 'ended';
  matchScore: number;
  commonGoals: string[];
  startDate?: string;
}

export default function PartnersScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();

  const [potentialMatches, setPotentialMatches] = useState<PartnerMatch[]>([]);
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'matches' | 'requests' | 'partners'>(
    'matches'
  );

  // TODO: Get current user ID from auth context
  const currentUserId = 1;

  useEffect(() => {
    loadPartnerData();
  }, []);

  const loadPartnerData = async () => {
    try {
      setLoading(true);

      // Fetch potential matches
      const matchesRes = await fetch('/api/social/partners/find-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      });

      if (matchesRes.ok) {
        const matches = await matchesRes.json();
        setPotentialMatches(matches);
      }

      // Fetch current partnerships
      const partnersRes = await fetch(`/api/social/partners/${currentUserId}`);
      if (partnersRes.ok) {
        const partners = await partnersRes.json();
        setPartnerships(partners);
      }
    } catch (error) {
      console.error('Error loading partner data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (partnerId: number, commonGoals: string[]) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const res = await fetch('/api/social/partners/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUserId,
          partnerId,
          commonGoals,
        }),
      });

      if (res.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        // Refresh data
        await loadPartnerData();
      }
    } catch (error) {
      console.error('Error sending request:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleAcceptRequest = async (partnerId: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const partnership = partnerships.find(
        (p) => p.partnerId === partnerId && p.status === 'pending'
      );
      if (!partnership) return;

      const res = await fetch(`/api/social/partners/${partnership.id}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (res.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await loadPartnerData();
      }
    } catch (error) {
      console.error('Error accepting request:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  if (loading) {
    return (
      <ScreenContainer className="items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const pendingRequests = partnerships.filter((p) => p.status === 'pending');
  const acceptedPartners = partnerships.filter((p) => p.status === 'accepted');

  return (
    <ScreenContainer className="p-4">
      {/* Header */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-foreground mb-1">
          {t('social.partners.title', 'Accountability Partners')}
        </Text>
        <Text className="text-sm text-muted">
          {t('social.partners.subtitle', 'Find partners to stay accountable')}
        </Text>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row gap-2 mb-4">
        {(['matches', 'requests', 'partners'] as const).map((tab) => (
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
              {tab === 'matches'
                ? `Matches (${potentialMatches.length})`
                : tab === 'requests'
                  ? `Requests (${pendingRequests.length})`
                  : `Partners (${acceptedPartners.length})`}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Content */}
      <FlatList
        data={
          activeTab === 'matches'
            ? potentialMatches
            : activeTab === 'requests'
              ? pendingRequests
              : acceptedPartners
        }
        keyExtractor={(item, idx) => {
          if (activeTab === 'matches') {
            return `match-${(item as PartnerMatch).userId}`;
          } else {
            return `partnership-${(item as Partnership).id}`;
          }
        }}
        renderItem={({ item }) => {
          if (activeTab === 'matches') {
            const match = item as PartnerMatch;
            return (
              <PartnerCard
                userId={match.userId}
                name={`User ${match.userId}`}
                matchScore={match.matchScore}
                commonGoals={match.commonGoals}
                motivationStyle={match.motivationStyle}
                onAction={(action) => {
                  if (action === 'send') {
                    handleSendRequest(match.userId, match.commonGoals);
                  }
                }}
              />
            );
          } else if (activeTab === 'requests') {
            const partnership = item as Partnership;
            return (
              <PartnerCard
                userId={partnership.partnerId}
                name={`User ${partnership.partnerId}`}
                matchScore={partnership.matchScore}
                commonGoals={partnership.commonGoals}
                status="pending"
                onAction={(action) => {
                  if (action === 'send') {
                    handleAcceptRequest(partnership.partnerId);
                  }
                }}
                actionLabel="Accept"
              />
            );
          } else {
            const partnership = item as Partnership;
            return (
              <PartnerCard
                userId={partnership.partnerId}
                name={`User ${partnership.partnerId}`}
                matchScore={partnership.matchScore}
                commonGoals={partnership.commonGoals}
                status="accepted"
                onAction={(action) => {
                  if (action === 'view') {
                    // Navigate to partner detail (will be implemented in next phase)
                    console.log('View partner:', partnership.partnerId);
                  }
                }}
              />
            );
          }
        }}
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            <Text className="text-muted text-center">
              {activeTab === 'matches'
                ? t('social.partners.noMatches', 'No matches found')
                : activeTab === 'requests'
                  ? t('social.partners.noRequests', 'No pending requests')
                  : t('social.partners.noPartners', 'No partners yet')}
            </Text>
          </View>
        }
        scrollEnabled={false}
      />
    </ScreenContainer>
  );
}
