import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
  Animated,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp, type Habit, type HabitCompletion } from "@/lib/app-context";
import { ProgressRing } from "@/components/ui/progress-ring";
import * as Haptics from "expo-haptics";

const HABIT_ICONS = ["☀️", "💧", "🧘", "🏃", "📖", "🚿", "🙏", "🥗", "💪", "🎯", "🧠", "✍️", "🎵", "🌿", "⚡"];

function HabitRow({
  habit,
  isCompleted,
  onToggle,
  onDelete,
}: {
  habit: Habit;
  isCompleted: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const colors = useColors();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handleToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    onToggle();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        onPress={handleToggle}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          Alert.alert("Remove Habit", `Remove "${habit.name}"?`, [
            { text: "Cancel", style: "cancel" },
            { text: "Remove", style: "destructive", onPress: onDelete },
          ]);
        }}
        style={[
          styles.habitRow,
          {
            backgroundColor: isCompleted ? colors.success + "12" : colors.surface,
            borderColor: isCompleted ? colors.success + "40" : colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.checkbox,
            {
              backgroundColor: isCompleted ? colors.success : "transparent",
              borderColor: isCompleted ? colors.success : colors.border,
            },
          ]}
        >
          {isCompleted && <Text style={styles.checkmark}>✓</Text>}
        </View>

        <Text style={styles.habitIcon}>{habit.icon}</Text>

        <View style={styles.habitInfo}>
          <Text
            style={[
              styles.habitName,
              {
                color: isCompleted ? colors.muted : colors.foreground,
                textDecorationLine: isCompleted ? "line-through" : "none",
              },
            ]}
          >
            {habit.name}
          </Text>
          {habit.durationMin > 0 && (
            <Text style={[styles.habitDuration, { color: colors.muted }]}>
              {habit.durationMin} min
            </Text>
          )}
        </View>

        {isCompleted && (
          <View style={[styles.xpBadge, { backgroundColor: colors.success + "20" }]}>
            <Text style={[styles.xpBadgeText, { color: colors.success }]}>+10 XP</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function RoutineScreen() {
  const colors = useColors();
  const { state, dispatch, todayCompletions, todayProgress } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitIcon, setNewHabitIcon] = useState("⭐");
  const [newHabitDuration, setNewHabitDuration] = useState("10");
  const [showComplete, setShowComplete] = useState(false);

  const todayStr = new Date().toISOString().split("T")[0];

  const isCompleted = (habitId: string) =>
    todayCompletions.some((c) => c.habitId === habitId);

  const handleToggle = (habit: Habit) => {
    const wasCompleted = isCompleted(habit.id);
    dispatch({
      type: "TOGGLE_HABIT",
      payload: { habitId: habit.id, date: todayStr, completedAt: Date.now() },
    });

    if (!wasCompleted) {
      dispatch({ type: "ADD_XP", payload: 10 });
      // Check if all habits are now done
      const newCount = todayCompletions.length + 1;
      if (newCount === state.habits.length) {
        dispatch({ type: "ADD_XP", payload: 50 });
        dispatch({ type: "UNLOCK_ACHIEVEMENT", payload: "first_routine" });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setShowComplete(true);
        setTimeout(() => setShowComplete(false), 3000);
      }
    }
  };

  const handleAddHabit = () => {
    if (!newHabitName.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch({
      type: "ADD_HABIT",
      payload: {
        id: `habit_${Date.now()}`,
        name: newHabitName.trim(),
        icon: newHabitIcon,
        durationMin: parseInt(newHabitDuration) || 0,
        isDefault: false,
        order: state.habits.length,
      },
    });
    setNewHabitName("");
    setNewHabitIcon("⭐");
    setNewHabitDuration("10");
    setShowAddModal(false);
  };

  const completedCount = todayCompletions.length;
  const totalCount = state.habits.length;

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Morning Routine</Text>
          <Text style={[styles.headerSub, { color: colors.muted }]}>
            {completedCount} of {totalCount} completed
          </Text>
        </View>
        <Pressable
          onPress={() => setShowAddModal(true)}
          style={({ pressed }) => [
            styles.addButton,
            { backgroundColor: colors.primary, transform: [{ scale: pressed ? 0.95 : 1 }] },
          ]}
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>

      {/* Progress Ring */}
      <View style={[styles.progressSection, { backgroundColor: colors.surface }]}>
        <ProgressRing
          progress={todayProgress}
          size={100}
          strokeWidth={10}
          color={colors.primary}
        >
          <Text style={[styles.progressPercent, { color: colors.foreground }]}>
            {Math.round(todayProgress * 100)}%
          </Text>
        </ProgressRing>
        <View style={styles.progressInfo}>
          <Text style={[styles.progressTitle, { color: colors.foreground }]}>
            {completedCount === totalCount && totalCount > 0
              ? "🎉 All done!"
              : `${totalCount - completedCount} remaining`}
          </Text>
          <Text style={[styles.progressSub, { color: colors.muted }]}>
            Long press a habit to remove it
          </Text>
          {completedCount > 0 && (
            <View style={[styles.xpEarned, { backgroundColor: colors.warning + "20" }]}>
              <Text style={[styles.xpEarnedText, { color: colors.warning }]}>
                ⚡ {completedCount * 10} XP earned today
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Habit List */}
      <FlatList
        data={state.habits}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <HabitRow
            habit={item}
            isCompleted={isCompleted(item.id)}
            onToggle={() => handleToggle(item)}
            onDelete={() => dispatch({ type: "DELETE_HABIT", payload: item.id })}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
      />

      {/* Completion Banner */}
      {showComplete && (
        <View style={[styles.completionBanner, { backgroundColor: colors.success }]}>
          <Text style={styles.completionText}>🎉 Routine Complete! +50 Bonus XP</Text>
        </View>
      )}

      {/* Add Habit Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.border }]} />
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add New Habit</Text>

            {/* Icon Picker */}
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>Choose Icon</Text>
            <View style={styles.iconGrid}>
              {HABIT_ICONS.map((icon) => (
                <Pressable
                  key={icon}
                  onPress={() => setNewHabitIcon(icon)}
                  style={[
                    styles.iconOption,
                    {
                      backgroundColor:
                        newHabitIcon === icon ? colors.primary + "20" : colors.surface,
                      borderColor:
                        newHabitIcon === icon ? colors.primary : colors.border,
                    },
                  ]}
                >
                  <Text style={styles.iconText}>{icon}</Text>
                </Pressable>
              ))}
            </View>

            {/* Name Input */}
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>Habit Name</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="e.g., Morning Walk"
              placeholderTextColor={colors.muted}
              value={newHabitName}
              onChangeText={setNewHabitName}
              autoFocus
              returnKeyType="next"
            />

            {/* Duration Input */}
            <Text style={[styles.fieldLabel, { color: colors.muted }]}>Duration (minutes)</Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  color: colors.foreground,
                },
              ]}
              placeholder="10"
              placeholderTextColor={colors.muted}
              value={newHabitDuration}
              onChangeText={setNewHabitDuration}
              keyboardType="number-pad"
              returnKeyType="done"
            />

            <View style={styles.modalActions}>
              <Pressable
                onPress={() => setShowAddModal(false)}
                style={[styles.cancelButton, { borderColor: colors.border }]}
              >
                <Text style={[styles.cancelButtonText, { color: colors.muted }]}>Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleAddHabit}
                disabled={!newHabitName.trim()}
                style={[
                  styles.saveButton,
                  {
                    backgroundColor: newHabitName.trim() ? colors.primary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.saveButtonText, { color: newHabitName.trim() ? "#fff" : colors.muted }]}>
                  Add Habit
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 13,
    marginTop: 2,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  progressSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 20,
  },
  progressPercent: {
    fontSize: 22,
    fontWeight: "800",
  },
  progressInfo: {
    flex: 1,
    gap: 4,
  },
  progressTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  progressSub: {
    fontSize: 12,
  },
  xpEarned: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  xpEarnedText: {
    fontSize: 12,
    fontWeight: "700",
  },
  listContent: {
    padding: 20,
    paddingTop: 12,
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  habitIcon: {
    fontSize: 22,
  },
  habitInfo: {
    flex: 1,
  },
  habitName: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
  },
  habitDuration: {
    fontSize: 12,
    marginTop: 1,
  },
  xpBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  xpBadgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  completionBanner: {
    position: "absolute",
    bottom: 100,
    left: 20,
    right: 20,
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  completionText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    paddingBottom: 48,
    gap: 12,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
    marginTop: 4,
  },
  iconGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  iconOption: {
    width: 44,
    height: 44,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    fontSize: 22,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    fontSize: 16,
    fontWeight: "500",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  saveButton: {
    flex: 2,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: "700",
  },
});
