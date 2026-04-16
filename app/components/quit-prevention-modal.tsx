import { View, Text, TouchableOpacity, Modal } from "react-native";
import { useTranslation } from "react-i18next";
import { useColors } from "@/hooks/use-colors";

interface QuitPreventionModalProps {
  visible: boolean;
  quote?: {
    text: string;
    author?: string;
  };
  onContinue?: () => void;
  onQuit?: () => void;
}

/**
 * Quit Prevention Modal
 * Shows when user is about to quit or skip habits
 * Displays motivational quote and reason to continue
 */
export function QuitPreventionModal({
  visible,
  quote,
  onContinue,
  onQuit,
}: QuitPreventionModalProps) {
  const { t } = useTranslation();
  const colors = useColors();

  const defaultQuote = {
    text: t("accountability.defaultQuote") ||
      "The only way to do great work is to love what you do.",
    author: "Steve Jobs",
  };

  const displayQuote = quote || defaultQuote;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View className="flex-1 bg-black/60 justify-center items-center p-4">
        <View className="bg-background rounded-3xl w-full max-w-sm overflow-hidden gap-6 p-6">
          {/* Header */}
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground text-center">
              {t("accountability.waitTitle") || "Wait! 🛑"}
            </Text>
            <Text className="text-base text-muted text-center leading-relaxed">
              {t("accountability.waitDescription") ||
                "Before you go, remember why you started..."}
            </Text>
          </View>

          {/* Quote */}
          <View className="bg-surface rounded-2xl p-6 gap-4 border-l-4 border-primary">
            <Text className="text-xl font-bold text-primary text-center leading-relaxed">
              "{displayQuote.text}"
            </Text>
            {displayQuote.author && (
              <Text className="text-sm text-muted text-center italic">
                — {displayQuote.author}
              </Text>
            )}
          </View>

          {/* Motivation */}
          <View className="bg-success/10 rounded-xl p-4 gap-2 border border-success/20">
            <Text className="text-sm font-semibold text-success">
              {t("accountability.youCanDo") || "💪 You can do this!"}
            </Text>
            <Text className="text-sm text-foreground leading-relaxed">
              {t("accountability.quitMotivation") ||
                "Every single day you show up is a victory. Your future self will thank you."}
            </Text>
          </View>

          {/* Actions */}
          <View className="gap-3">
            <TouchableOpacity
              onPress={onContinue}
              className="bg-primary rounded-full py-4 items-center"
            >
              <Text className="text-background font-bold text-base">
                {t("accountability.keepGoing") || "Keep Going! 💪"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onQuit}
              className="bg-surface border border-border rounded-full py-3 items-center"
            >
              <Text className="text-foreground font-semibold">
                {t("accountability.quitAnyway") || "Quit Anyway"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
