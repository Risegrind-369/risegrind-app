import { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  Pressable,
  TextInput,
  Modal,
} from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { GroupCard } from '@/components/social/group-card';
import { useColors } from '@/hooks/use-colors';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';

interface MentorGroup {
  id: number;
  name: string;
  description?: string;
  habitFocus?: string;
  memberCount: number;
  visibility: 'public' | 'private';
  creatorId: number;
}

export default function GroupsScreen() {
  const colors = useColors();
  const { t } = useTranslation();
  const router = useRouter();

  const [publicGroups, setPublicGroups] = useState<MentorGroup[]>([]);
  const [myGroups, setMyGroups] = useState<MentorGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'public' | 'my'>('public');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [habitFocus, setHabitFocus] = useState('');

  // TODO: Get current user ID from auth context
  const currentUserId = 1;

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setLoading(true);

      // Fetch public groups
      const publicRes = await fetch('/api/social/groups/public');
      if (publicRes.ok) {
        const groups = await publicRes.json();
        setPublicGroups(groups);
      }

      // TODO: Fetch user's groups from backend
      // For now, we'll just set an empty array
      setMyGroups([]);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) return;

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const res = await fetch('/api/social/groups/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: groupName,
          description: groupDescription,
          creatorId: currentUserId,
          habitFocus: habitFocus || undefined,
          visibility: 'public',
        }),
      });

      if (res.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setGroupName('');
        setGroupDescription('');
        setHabitFocus('');
        setShowCreateModal(false);
        await loadGroups();
      }
    } catch (error) {
      console.error('Error creating group:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleJoinGroup = async (groupId: number) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      const res = await fetch(`/api/social/groups/${groupId}/join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId }),
      });

      if (res.ok) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await loadGroups();
      }
    } catch (error) {
      console.error('Error joining group:', error);
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

  return (
    <ScreenContainer className="p-4">
      {/* Header */}
      <View className="mb-4">
        <Text className="text-2xl font-bold text-foreground mb-1">
          {t('social.groups.title', 'Mentor Groups')}
        </Text>
        <Text className="text-sm text-muted">
          {t('social.groups.subtitle', 'Join communities and stay accountable')}
        </Text>
      </View>

      {/* Action Buttons */}
      <View className="flex-row gap-2 mb-4">
        <Pressable
          onPress={() => setShowCreateModal(true)}
          style={({ pressed }) => [
            {
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderRadius: 8,
              backgroundColor: colors.primary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text className="text-center font-semibold text-white text-sm">
            {t('social.groups.createGroup', 'Create Group')}
          </Text>
        </Pressable>
      </View>

      {/* Tab Navigation */}
      <View className="flex-row gap-2 mb-4">
        {(['public', 'my'] as const).map((tab) => (
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
              {tab === 'public'
                ? `Public (${publicGroups.length})`
                : `My Groups (${myGroups.length})`}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Groups List */}
      <FlatList
        data={activeTab === 'public' ? publicGroups : myGroups}
        keyExtractor={(item) => `group-${item.id}`}
        renderItem={({ item }) => (
          <GroupCard
            id={item.id}
            name={item.name}
            description={item.description}
            habitFocus={item.habitFocus}
            memberCount={item.memberCount}
            visibility={item.visibility}
            isMember={myGroups.some((g) => g.id === item.id)}
            onJoin={() => handleJoinGroup(item.id)}
          />
        )}
        ListEmptyComponent={
          <View className="items-center justify-center py-8">
            <Text className="text-muted text-center">
              {activeTab === 'public'
                ? t('social.groups.noPublicGroups', 'No public groups found')
                : t('social.groups.noMyGroups', 'You have not joined any groups')}
            </Text>
          </View>
        }
        scrollEnabled={false}
      />

      {/* Create Group Modal */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View
          className="flex-1 justify-end"
          style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}
        >
          <View
            className="rounded-t-3xl p-6 pb-8"
            style={{ backgroundColor: colors.surface }}
          >
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-bold text-foreground">
                {t('social.groups.createNew', 'Create New Group')}
              </Text>
              <Pressable onPress={() => setShowCreateModal(false)}>
                <Text className="text-lg text-muted">✕</Text>
              </Pressable>
            </View>

            {/* Form */}
            <TextInput
              placeholder={t('social.groups.groupName', 'Group Name')}
              value={groupName}
              onChangeText={setGroupName}
              placeholderTextColor={colors.muted}
              style={{
                backgroundColor: colors.background,
                color: colors.foreground,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 12,
                fontSize: 16,
              }}
            />

            <TextInput
              placeholder={t('social.groups.description', 'Description')}
              value={groupDescription}
              onChangeText={setGroupDescription}
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              style={{
                backgroundColor: colors.background,
                color: colors.foreground,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 12,
                fontSize: 16,
                textAlignVertical: 'top',
              }}
            />

            <TextInput
              placeholder={t('social.groups.habitFocus', 'Habit Focus (e.g., Fitness)')}
              value={habitFocus}
              onChangeText={setHabitFocus}
              placeholderTextColor={colors.muted}
              style={{
                backgroundColor: colors.background,
                color: colors.foreground,
                borderColor: colors.border,
                borderWidth: 1,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                marginBottom: 16,
                fontSize: 16,
              }}
            />

            {/* Buttons */}
            <View className="flex-row gap-2">
              <Pressable
                onPress={() => setShowCreateModal(false)}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: colors.border,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text className="text-center font-semibold text-foreground">
                  {t('common.cancel', 'Cancel')}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleCreateGroup}
                disabled={!groupName.trim()}
                style={({ pressed }) => [
                  {
                    flex: 1,
                    paddingVertical: 12,
                    borderRadius: 8,
                    backgroundColor: colors.primary,
                    opacity:
                      pressed && groupName.trim() ? 0.8 : groupName.trim() ? 1 : 0.5,
                  },
                ]}
              >
                <Text className="text-center font-semibold text-white">
                  {t('common.create', 'Create')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
