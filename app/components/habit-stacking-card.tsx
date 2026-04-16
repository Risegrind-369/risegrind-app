import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { useTranslation } from "react-i18next";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface StackingSuggestion {
  id: number;
  anchorHabitName: string;
  stackedHabitName: string;
  instruction: string;
  completionCount: number;
}

interface HabitStackingCardProps {
  suggestions: StackingSuggestion[];
  onAccept?: (suggestion: StackingSuggestion) => void;
  onDismiss?: () => void;
}

/**
 * Habit Stacking Card Component
 * Shows suggestions to stack a new habit after completing an existing one
 * Displays after habit completion with smooth animation
 */
export function HabitStackingCard({
  suggestions,
  onAccept,
  onDismiss,
}: HabitStackingCardProps) {
  const { t } = useTranslation();
  const colors = useColors();

  if (suggestions.length === 0) return null;

  return (
    <View className="bg-surface rounded-2xl p-4 gap-3 border border-primary/20">
      <View className="gap-1">
        <Text className="text-sm font-semibold text-primary">
          💡 {t("accountability.stackingTip") || "Habit Stacking Tip"}
        </Text>
        <Text className="text-sm text-foreground leading-relaxed">
          {t("accountability.stackingDescription") ||
            "Link your new habit to an existing one for better consistency."}
        </Text>
      </View>

      <FlatList
        data={suggestions}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View className="gap-2 py-2">
            <View className="bg-background rounded-lg p-3 gap-2">
              <Text className="text-sm font-semibold text-foreground">
                {t("accountability.afterHabit") || "After"}{" "}
                <Text className="text-primary">{item.anchorHabitName}</Text>
              </Text>
              <View className="flex-row items-center gap-2">
                <View className="flex-1 h-px bg-border" />
                <Text className="text-xs text-muted">→</Text>
                <View className="flex-1 h-px bg-border" />
              </View>
              <Text className="text-sm font-semibold text-foreground">
                {t("accountability.doHabit") || "Do"}{" "}
                <Text className="text-success">{item.stackedHabitName}</Text>
              </Text>
              {item.instruction && (
                <Text className="text-xs text-muted italic">
                  "{item.instruction}"
                </Text>
              )}
            </View>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={() => onAccept?.(item)}
                className="flex-1 bg-primary rounded-lg py-2 items-center"
              >
                <Text className="text-background font-semibold text-sm">
                  {t("common.accept") || "Accept"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onDismiss}
                className="flex-1 bg-surface border border-border rounded-lg py-2 items-center"
              >
                <Text className="text-foreground font-semibold text-sm">
                  {t("common.dismiss") || "Dismiss"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
}
