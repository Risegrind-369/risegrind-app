import React, { useState, useEffect } from "react";
import { View, Text, Pressable, StyleSheet, ScrollView, TextInput, Alert, FlatList, ActivityIndicator, TouchableOpacity, RefreshControl } from "react-native";
import { pullAllFromServer } from "@/lib/sync";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";

export default function FriendsScreen() {
  const colors = useColors();
  const router = useRouter();
  const { t } = useTranslation();
  const { state, dispatch } = useApp();
  const [showAddFriend, setShowAddFriend] = useState(false);
  const [friendName, setFriendName] = useState("");
  const [friendCode, setFriendCode] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const addFriendMutation = trpc.sync.addFriendByCode.useMutation();

  // Pull latest friend stats from server on mount
  useEffect(() => {
    const refresh = async () => {
      const data = await pullAllFromServer();
      if (!data) return;
      const serverFriends = (data.friends as Array<{ code: string; name: string; streak: number; xp: number; addedAt: number }>) ?? [];
      serverFriends.forEach((sf) => dispatch({ type: "ADD_FRIEND", payload: sf }));
    };
    refresh();
  }, [dispatch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await pullAllFromServer();
      if (data) {
        const serverFriends = (data.friends as Array<{ code: string; name: string; streak: number; xp: number; addedAt: number }>) ?? [];
        serverFriends.forEach((sf) => dispatch({ type: "ADD_FRIEND", payload: sf }));
      }
    } finally {
      setRefreshing(false);
    }
  };

  const handleAddFriend = async () => {
    if (!friendCode.trim()) {
      Alert.alert(t("friends.error", { defaultValue: "Error" }), t("friends.fillFields", { defaultValue: "Please enter a Ghost Code" }));
      return;
    }

    setIsAdding(true);
    try {
      const result = await addFriendMutation.mutateAsync({ code: friendCode.trim().toUpperCase() });

      if (!result.success) {
        Alert.alert(t("friends.error", { defaultValue: "Error" }), result.error ?? "Could not add friend");
        return;
      }

      // result.friend has live streak/xp from server
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      dispatch({
        type: "ADD_FRIEND",
        payload: {
          code: result.friend.code,
          name: result.friend.name,
          streak: result.friend.streak,
          xp: result.friend.xp,
          addedAt: result.friend.addedAt,
        },
      });

      Alert.alert(
        t("friends.success", { defaultValue: "Friend Added!" }),
        t("friends.friendAdded", { defaultValue: `${result.friend.name} has been added to your Ghost Crew.` })
      );

      setFriendName("");
      setFriendCode("");
      setShowAddFriend(false);
    } catch (err) {
      console.error("[friends] addFriendByCode error:", err);
      Alert.alert(t("friends.error", { defaultValue: "Error" }), "Could not reach server. Try again.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            activeOpacity={0.6}
          >
            <Text style={[styles.backButton, { color: colors.accent }]}>← {t("common.back", { defaultValue: "Back" })}</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: colors.foreground }]}>
            {t("friends.title", { defaultValue: "Ghost Crew" })}
          </Text>
        </View>

        {/* Your Code Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {t("friends.yourCode", { defaultValue: "Your Friend Code" })}
          </Text>
          <View style={[styles.codeCard, { backgroundColor: colors.surface, borderColor: colors.accent }]}>
            <Text style={[styles.codeValue, { color: colors.accent }]}>
              {state.ghostCode || "GENERATING..."}
            </Text>
            <Text style={[styles.codeHint, { color: colors.muted }]}>
              {t("friends.shareCode", { defaultValue: "Share this code with friends" })}
            </Text>
          </View>
        </View>

        {/* Friends List */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {t("friends.yourFriends", { defaultValue: "Your Friends" })} ({state.friends.length})
          </Text>

          {state.friends.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.emptyStateEmoji, { fontSize: 48 }]}>👥</Text>
              <Text style={[styles.emptyStateTitle, { color: colors.foreground }]}>
                {t("friends.noFriends", { defaultValue: "No friends yet" })}
              </Text>
              <Text style={[styles.emptyStateText, { color: colors.muted }]}>
                {t("friends.addFriendsHint", { defaultValue: "Add friends to see their streaks and compete together" })}
              </Text>
            </View>
          ) : (
            <FlatList
              scrollEnabled={false}
              data={state.friends}
              keyExtractor={(item) => item.code}
              renderItem={({ item, index }) => (
                <View key={item.code}>
                  <View style={[styles.friendCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <View style={styles.friendInfo}>
                      <Text style={[styles.friendName, { color: colors.foreground }]}>
                        {item.name}
                      </Text>
                      <Text style={[styles.friendCode, { color: colors.muted }]}>
                        {item.code}
                      </Text>
                    </View>
                    <View style={styles.friendStats}>
                      <View style={styles.stat}>
                        <Text style={[styles.statValue, { color: "#F97316" }]}>🔥 {item.streak}</Text>
                      </View>
                      <View style={styles.stat}>
                        <Text style={[styles.statValue, { color: colors.foreground }]}>⚡ {item.xp}</Text>
                      </View>
                    </View>
                  </View>
                  {index < state.friends.length - 1 && <View style={[styles.divider, { backgroundColor: colors.border }]} />}
                </View>
              )}
            />
          )}
        </View>

        {/* Add Friend Button */}
        <Pressable
          onPress={() => setShowAddFriend(true)}
          style={({ pressed }) => [
            styles.addButton,
            {
              backgroundColor: colors.accent,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={styles.addButtonText}>+ {t("friends.addFriend", { defaultValue: "Add Friend" })}</Text>
        </Pressable>
      </ScrollView>

      {/* Add Friend Bottom Sheet Modal */}
      {showAddFriend && (
        <View style={[styles.bottomSheetOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
          <Pressable
            style={styles.bottomSheetBackdrop}
            onPress={() => setShowAddFriend(false)}
          />
          <View style={[styles.bottomSheet, { backgroundColor: colors.surface }]}>
            <View style={styles.bottomSheetHandle} />

            <Text style={[styles.bottomSheetTitle, { color: colors.foreground }]}>
              {t("friends.addFriendTitle", { defaultValue: "Add a Friend" })}
            </Text>

            <View style={styles.bottomSheetForm}>
              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.muted }]}>
                  {t("friends.friendName", { defaultValue: "Friend's Name" })}
                </Text>
                <TextInput
                  placeholder={t("friends.namePlaceholder", { defaultValue: "e.g., Alex" })}
                  placeholderTextColor={colors.muted}
                  value={friendName}
                  onChangeText={setFriendName}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.foreground,
                    },
                  ]}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={[styles.formLabel, { color: colors.muted }]}>
                  {t("friends.friendCode", { defaultValue: "Friend's Code" })}
                </Text>
                <TextInput
                  placeholder={t("friends.codePlaceholder", { defaultValue: "e.g., ABC123XYZ" })}
                  placeholderTextColor={colors.muted}
                  value={friendCode}
                  onChangeText={setFriendCode}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.background,
                      borderColor: colors.border,
                      color: colors.foreground,
                    },
                  ]}
                />
              </View>

              <Pressable
                onPress={handleAddFriend}
                style={({ pressed }) => [
                  styles.submitButton,
                  {
                    backgroundColor: colors.accent,
                    opacity: pressed ? 0.8 : 1,
                  },
                ]}
              >
                <Text style={styles.submitButtonText}>
                  {t("friends.addFriend", { defaultValue: "Add Friend" })}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setShowAddFriend(false)}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <Text style={[styles.cancelButtonText, { color: colors.muted }]}>
                  {t("common.cancel", { defaultValue: "Cancel" })}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 24,
  },
  header: {
    gap: 12,
    marginBottom: 8,
  },
  backButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  codeCard: {
    borderRadius: 14,
    borderWidth: 2,
    padding: 20,
    alignItems: "center",
    gap: 8,
  },
  codeValue: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 2,
    fontFamily: "Courier New",
  },
  codeHint: {
    fontSize: 13,
    fontWeight: "500",
  },
  emptyState: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 32,
    alignItems: "center",
    gap: 12,
  },
  emptyStateEmoji: {
    marginBottom: 8,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  friendCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  friendInfo: {
    flex: 1,
    gap: 4,
  },
  friendName: {
    fontSize: 16,
    fontWeight: "700",
  },
  friendCode: {
    fontSize: 12,
    fontWeight: "500",
  },
  friendStats: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  stat: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  addButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  bottomSheetOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
  },
  bottomSheetBackdrop: {
    flex: 1,
  },
  bottomSheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 20,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#ccc",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 12,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
  },
  bottomSheetForm: {
    gap: 16,
  },
  formGroup: {
    gap: 8,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  input: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  submitButton: {
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
    paddingVertical: 12,
  },
});
