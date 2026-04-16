import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useTranslation } from "react-i18next";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";

interface FutureLetterScreenProps {
  onComplete?: () => void;
  onClose?: () => void;
}

/**
 * Future Self Letter Screen
 * Allows users to write a motivational letter to their future self
 * Letter is shown weekly as part of accountability system
 */
export function FutureLetterScreen({
  onComplete,
  onClose,
}: FutureLetterScreenProps) {
  const { t } = useTranslation();
  const colors = useColors();
  const [letterContent, setLetterContent] = useState("");
  const [reason, setReason] = useState("");
  const [mantra, setMantra] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [existingLetter, setExistingLetter] = useState<any>(null);
  const [step, setStep] = useState<"intro" | "write" | "review">("intro");

  // Fetch existing letter on mount
  useEffect(() => {
    const fetchLetter = async () => {
      try {
        // TODO: Call tRPC to fetch existing letter
        // const letter = await trpc.accountability.getFutureLetter.query();
        // if (letter) setExistingLetter(letter);
      } catch (error) {
        console.error("Error fetching letter:", error);
      }
    };
    fetchLetter();
  }, []);

  const handleSaveLetter = async () => {
    if (!letterContent.trim() || !reason.trim()) {
      alert(t("accountability.letterValidation") || "Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Call tRPC to save letter
      // await trpc.accountability.saveFutureLetter.mutate({
      //   content: letterContent,
      //   reason,
      //   mantra,
      // });
      setStep("review");
      onComplete?.();
    } catch (error) {
      console.error("Error saving letter:", error);
      alert(t("accountability.saveError") || "Failed to save letter");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        className="flex-1 p-4"
      >
        {step === "intro" && (
          <View className="flex-1 justify-center gap-6">
            <View className="gap-2">
              <Text className="text-3xl font-bold text-foreground">
                {t("accountability.letterTitle") || "Letter to Your Future Self"}
              </Text>
              <Text className="text-base text-muted leading-relaxed">
                {t("accountability.letterDescription") ||
                  "Write a heartfelt letter to your future self. This will remind you why you started this journey, especially when motivation is low."}
              </Text>
            </View>

            <View className="gap-3 bg-surface rounded-2xl p-4">
              <Text className="text-sm font-semibold text-foreground">
                {t("accountability.whatToInclude") || "What to include:"}
              </Text>
              <View className="gap-2">
                <Text className="text-sm text-muted">
                  • {t("accountability.letterTip1") || "Your current struggles"}
                </Text>
                <Text className="text-sm text-muted">
                  • {t("accountability.letterTip2") || "Your goals and dreams"}
                </Text>
                <Text className="text-sm text-muted">
                  • {t("accountability.letterTip3") || "Why this matters to you"}
                </Text>
                <Text className="text-sm text-muted">
                  • {t("accountability.letterTip4") ||
                    "A personal mantra or quote"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setStep("write")}
              className="bg-primary rounded-full py-3 items-center"
            >
              <Text className="text-background font-semibold text-base">
                {t("accountability.startWriting") || "Start Writing"}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {step === "write" && (
          <View className="flex-1 gap-4">
            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">
                {t("accountability.letterPrompt") || "Write your letter:"}
              </Text>
              <TextInput
                multiline
                numberOfLines={6}
                placeholder={
                  t("accountability.letterPlaceholder") ||
                  "Dear future self, I want you to remember..."
                }
                value={letterContent}
                onChangeText={setLetterContent}
                className="bg-surface rounded-xl p-4 text-foreground border border-border"
                placeholderTextColor={colors.muted}
                style={{ minHeight: 150 }}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">
                {t("accountability.whyReason") || "Why are you doing this?"}
              </Text>
              <TextInput
                multiline
                numberOfLines={3}
                placeholder={
                  t("accountability.reasonPlaceholder") ||
                  "My main reason is..."
                }
                value={reason}
                onChangeText={setReason}
                className="bg-surface rounded-xl p-4 text-foreground border border-border"
                placeholderTextColor={colors.muted}
                style={{ minHeight: 100 }}
              />
            </View>

            <View className="gap-2">
              <Text className="text-sm font-semibold text-foreground">
                {t("accountability.mantra") || "Your personal mantra (optional):"}
              </Text>
              <TextInput
                placeholder={
                  t("accountability.mantraPlaceholder") ||
                  "e.g., 'I am stronger than my excuses'"
                }
                value={mantra}
                onChangeText={setMantra}
                className="bg-surface rounded-xl p-4 text-foreground border border-border"
                placeholderTextColor={colors.muted}
              />
            </View>

            <View className="gap-2 flex-row">
              <TouchableOpacity
                onPress={() => setStep("intro")}
                className="flex-1 bg-surface rounded-full py-3 items-center border border-border"
              >
                <Text className="text-foreground font-semibold">
                  {t("common.back") || "Back"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setStep("review")}
                disabled={!letterContent.trim() || !reason.trim()}
                className={cn(
                  "flex-1 rounded-full py-3 items-center",
                  letterContent.trim() && reason.trim()
                    ? "bg-primary"
                    : "bg-surface opacity-50"
                )}
              >
                <Text
                  className={cn(
                    "font-semibold",
                    letterContent.trim() && reason.trim()
                      ? "text-background"
                      : "text-muted"
                  )}
                >
                  {t("common.review") || "Review"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {step === "review" && (
          <View className="flex-1 gap-4">
            <View className="gap-2">
              <Text className="text-2xl font-bold text-foreground">
                {t("accountability.reviewLetter") || "Your Letter"}
              </Text>
            </View>

            <View className="bg-surface rounded-2xl p-4 gap-4">
              <View className="gap-2">
                <Text className="text-xs font-semibold text-muted uppercase">
                  {t("accountability.letterContent") || "Letter"}
                </Text>
                <Text className="text-base text-foreground leading-relaxed">
                  {letterContent}
                </Text>
              </View>

              <View className="h-px bg-border" />

              <View className="gap-2">
                <Text className="text-xs font-semibold text-muted uppercase">
                  {t("accountability.whyReason") || "Why"}
                </Text>
                <Text className="text-base text-foreground leading-relaxed">
                  {reason}
                </Text>
              </View>

              {mantra && (
                <>
                  <View className="h-px bg-border" />
                  <View className="gap-2">
                    <Text className="text-xs font-semibold text-muted uppercase">
                      {t("accountability.mantra") || "Mantra"}
                    </Text>
                    <Text className="text-base font-semibold text-primary">
                      "{mantra}"
                    </Text>
                  </View>
                </>
              )}
            </View>

            <View className="gap-2 flex-row">
              <TouchableOpacity
                onPress={() => setStep("write")}
                className="flex-1 bg-surface rounded-full py-3 items-center border border-border"
              >
                <Text className="text-foreground font-semibold">
                  {t("common.edit") || "Edit"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSaveLetter}
                disabled={isLoading}
                className="flex-1 bg-primary rounded-full py-3 items-center"
              >
                {isLoading ? (
                  <ActivityIndicator color={colors.background} />
                ) : (
                  <Text className="text-background font-semibold">
                    {t("common.save") || "Save"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
