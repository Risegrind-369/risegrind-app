import { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface WeeklyReminderData {
  letter: {
    content: string;
    reason: string;
    mantra?: string;
  };
  summary: {
    habitsCompleted: number;
    totalHabits: number;
    xpEarned: number;
    streakDays: number;
  };
  quote: {
    text: string;
    author?: string;
  };
}

interface WeeklyReminderModalProps {
  visible: boolean;
  data: WeeklyReminderData | null;
  isLoading?: boolean;
  onClose?: () => void;
  onMarkViewed?: () => void;
}

/**
 * Weekly Reminder Modal
 * Shows user's future self letter, weekly summary, and motivational quote
 * Displayed every Monday morning as accountability check-in
 */
export function WeeklyReminderModal({
  visible,
  data,
  isLoading = false,
  onClose,
  onMarkViewed,
}: WeeklyReminderModalProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const [currentStep, setCurrentStep] = useState<
    "letter" | "summary" | "quote"
  >("letter");

  useEffect(() => {
    if (visible) {
      setCurrentStep("letter");
    }
  }, [visible]);

  if (!data) return null;

  const completionRate = Math.round(
    (data.summary.habitsCompleted / data.summary.totalHabits) * 100
  );

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-background rounded-3xl w-full max-w-sm overflow-hidden">
          {isLoading ? (
            <View className="h-96 justify-center items-center">
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : (
            <>
              <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                className="p-6"
              >
                {currentStep === "letter" && (
                  <View className="gap-4">
                    <View className="gap-2">
                      <Text className="text-xs font-semibold text-primary uppercase">
                        {t("accountability.weeklyReminder") ||
                          "Weekly Check-In"}
                      </Text>
                      <Text className="text-2xl font-bold text-foreground">
                        {t("accountability.letterFromYou") ||
                          "Letter from Your Future Self"}
                      </Text>
                    </View>

                    <View className="bg-surface rounded-2xl p-4 gap-3">
                      <Text className="text-base text-foreground leading-relaxed">
                        {data.letter.content}
                      </Text>

                      {data.letter.mantra && (
                        <>
                          <View className="h-px bg-border" />
                          <Text className="text-base font-semibold text-primary text-center italic">
                            "{data.letter.mantra}"
                          </Text>
                        </>
                      )}
                    </View>
                  </View>
                )}

                {currentStep === "summary" && (
                  <View className="gap-4">
                    <View className="gap-2">
                      <Text className="text-xs font-semibold text-success uppercase">
                        {t("accountability.weekSummary") || "Week Summary"}
                      </Text>
                      <Text className="text-2xl font-bold text-foreground">
                        {t("accountability.greatWeek") || "Great Week!"}
                      </Text>
                    </View>

                    <View className="gap-3">
                      {/* Completion Rate */}
                      <View className="bg-surface rounded-2xl p-4 gap-3">
                        <View className="flex-row justify-between items-center">
                          <Text className="text-sm text-muted">
                            {t("accountability.habitCompletion") ||
                              "Habit Completion"}
                          </Text>
                          <Text className="text-2xl font-bold text-primary">
                            {completionRate}%
                          </Text>
                        </View>
                        <View className="h-2 bg-background rounded-full overflow-hidden">
                          <View
                            className="h-full bg-primary rounded-full"
                            style={{ width: `${completionRate}%` }}
                          />
                        </View>
                        <Text className="text-xs text-muted">
                          {data.summary.habitsCompleted} of{" "}
                          {data.summary.totalHabits}{" "}
                          {t("accountability.habitsCompleted") ||
                            "habits completed"}
                        </Text>
                      </View>

                      {/* Stats Grid */}
                      <View className="gap-2">
                        <View className="flex-row gap-2">
                          <View className="flex-1 bg-surface rounded-xl p-3 gap-1">
                            <Text className="text-xs text-muted">
                              {t("accountability.xpEarned") || "XP Earned"}
                            </Text>
                            <Text className="text-2xl font-bold text-success">
                              +{data.summary.xpEarned}
                            </Text>
                          </View>
                          <View className="flex-1 bg-surface rounded-xl p-3 gap-1">
                            <Text className="text-xs text-muted">
                              {t("accountability.streak") || "Streak"}
                            </Text>
                            <Text className="text-2xl font-bold text-warning">
                              {data.summary.streakDays}🔥
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                {currentStep === "quote" && (
                  <View className="gap-4">
                    <View className="gap-2">
                      <Text className="text-xs font-semibold text-warning uppercase">
                        {t("accountability.dailyInspiration") ||
                          "Daily Inspiration"}
                      </Text>
                      <Text className="text-2xl font-bold text-foreground">
                        {t("accountability.todaysQuote") || "Today's Quote"}
                      </Text>
                    </View>

                    <View className="flex-1 justify-center">
                      <View className="bg-surface rounded-2xl p-6 gap-4">
                        <Text className="text-2xl font-bold text-primary text-center leading-relaxed">
                          "{data.quote.text}"
                        </Text>
                        {data.quote.author && (
                          <Text className="text-sm text-muted text-center italic">
                            — {data.quote.author}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Navigation */}
              <View className="border-t border-border p-4 gap-3">
                <View className="flex-row gap-2 justify-center">
                  <TouchableOpacity
                    onPress={() => setCurrentStep("letter")}
                    className={cn(
                      "h-2 rounded-full flex-1",
                      currentStep === "letter"
                        ? "bg-primary"
                        : "bg-surface border border-border"
                    )}
                  />
                  <TouchableOpacity
                    onPress={() => setCurrentStep("summary")}
                    className={cn(
                      "h-2 rounded-full flex-1",
                      currentStep === "summary"
                        ? "bg-primary"
                        : "bg-surface border border-border"
                    )}
                  />
                  <TouchableOpacity
                    onPress={() => setCurrentStep("quote")}
                    className={cn(
                      "h-2 rounded-full flex-1",
                      currentStep === "quote"
                        ? "bg-primary"
                        : "bg-surface border border-border"
                    )}
                  />
                </View>

                <TouchableOpacity
                  onPress={() => {
                    onMarkViewed?.();
                    onClose?.();
                  }}
                  className="bg-primary rounded-full py-3 items-center"
                >
                  <Text className="text-background font-semibold">
                    {t("accountability.keepGoing") || "Keep Going! 💪"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}
