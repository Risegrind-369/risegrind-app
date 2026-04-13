import React, { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  View,
  Text,
  Pressable,
  FlatList,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import * as Speech from "expo-speech";
import { ScreenContainer } from "@/components/screen-container";
import { useColors } from "@/hooks/use-colors";
import { useApp, MOOD_EMOJIS, type JournalEntry } from "@/lib/app-context";
import { trpc } from "@/lib/trpc";
import * as Haptics from "expo-haptics";
import {
  useAudioRecorder,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from "expo-audio";
import * as FileSystem from "expo-file-system/legacy";

const FALLBACK_PROMPTS = [
  "What did you do today that your future self will thank you for?",
  "What noise are you blocking out right now?",
  "Describe the version of yourself you're building in silence.",
  "What's one thing you did today that required discipline?",
  "What would you do differently if no one was watching?",
  "What's the hardest thing you're working through right now?",
  "What's one habit that's quietly changing your life?",
  "What are you grateful for that you never talk about?",
];

function getRandomFromList(list: string[]): string {
  return list[Math.floor(Math.random() * list.length)];
}

function formatEntryDate(timestamp: number, locale: string): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) {
    return locale === "fr" ? "Aujourd'hui" : locale === "pt" ? "Hoje" : "Today";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return locale === "fr" ? "Hier" : locale === "pt" ? "Ontem" : "Yesterday";
  }
  const displayLocale = locale === "fr" ? "fr-FR" : locale === "pt" ? "pt-BR" : "en-US";
  return date.toLocaleDateString(displayLocale, { month: "long", day: "numeric" });
}

function JournalCard({
  entry,
  onDelete,
  locale,
}: {
  entry: JournalEntry;
  onDelete: () => void;
  locale: string;
}) {
  const colors = useColors();
  const { t } = useTranslation();
  const displayLocale = locale === "fr" ? "fr-FR" : locale === "pt" ? "pt-BR" : "en-US";
  return (
    <Pressable
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Alert.alert(
          t("journal.deleteTitle", { defaultValue: "Delete Entry?" }),
          t("journal.deleteConfirm", { defaultValue: "This cannot be undone." }),
          [
            { text: t("common.cancel", { defaultValue: "Cancel" }), style: "cancel" },
            { text: t("common.delete", { defaultValue: "Delete" }), style: "destructive", onPress: onDelete },
          ]
        );
      }}
      style={[styles.entryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.entryHeader}>
        <Text style={[styles.entryDate, { color: colors.muted }]}>
          {formatEntryDate(entry.createdAt, locale)}
        </Text>
        {entry.moodLevel && (
          <Text style={styles.entryMoodEmoji}>{MOOD_EMOJIS[entry.moodLevel]}</Text>
        )}
      </View>
      {entry.prompt ? (
        <Text style={[styles.entryPrompt, { color: colors.accent }]} numberOfLines={1}>
          👻 {entry.prompt}
        </Text>
      ) : null}
      <Text style={[styles.entryContent, { color: colors.foreground }]} numberOfLines={4}>
        {entry.content}
      </Text>
      <Text style={[styles.entryTime, { color: colors.muted }]}>
        {new Date(entry.createdAt).toLocaleTimeString(displayLocale, {
          hour: "numeric",
          minute: "2-digit",
        })}
      </Text>
    </Pressable>
  );
}

export default function JournalScreen() {
  const colors = useColors();
  const { state, dispatch } = useApp();
  const { t, i18n } = useTranslation();
  const locale = i18n.language || "en";
  const displayLocale = locale === "fr" ? "fr-FR" : locale === "pt" ? "pt-BR" : "en-US";

  const localizedPrompts = useMemo(() => {
    try {
      const arr = t("journal.prompts", { returnObjects: true }) as string[];
      return Array.isArray(arr) && arr.length > 0 ? arr : FALLBACK_PROMPTS;
    } catch {
      return FALLBACK_PROMPTS;
    }
  }, [t]);

  const [showEditor, setShowEditor] = useState(false);
  const [content, setContent] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState(() => getRandomFromList(FALLBACK_PROMPTS));
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const transcribeMutation = trpc.voice.transcribe.useMutation();
  const analyzeEntryMutation = trpc.journal.analyzeEntry.useMutation();

  const handleNewEntry = () => {
    setCurrentPrompt(getRandomFromList(localizedPrompts));
    setContent("");
    setAiResponse(null);
    setShowEditor(true);
  };

  const handleAnalyzeAI = async () => {
    if (!content.trim()) return;
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsAnalyzing(true);

    try {
      const recentExcerpts = state.journalEntries
        .slice(0, 3)
        .map((e) => e.content.slice(0, 120));
      const result = await analyzeEntryMutation.mutateAsync({
        entryContent: content,
        prompt: currentPrompt,
        moodLevel: state.todayMood?.level,
        streak: state.streak,
        recentEntries: recentExcerpts,
        language: locale as "en" | "fr" | "pt",
      });
      setAiResponse(result.reply ?? null);
    } catch {
      setAiResponse(null);
      Alert.alert(t("journal.aiError", { defaultValue: "AI Analysis Failed" }));
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const entry: JournalEntry = {
      id: `journal_${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
      content: content.trim(),
      prompt: currentPrompt,
      moodLevel: state.todayMood?.level,
      createdAt: Date.now(),
    };
    dispatch({ type: "ADD_JOURNAL", payload: entry });
    dispatch({ type: "ADD_XP", payload: 25 });
    dispatch({ type: "UNLOCK_ACHIEVEMENT", payload: "first_entry" });

    setShowEditor(false);
    setContent("");
    setAiResponse(null);
  };

  const handleCloseEditor = () => {
    setShowEditor(false);
    setAiResponse(null);
    setIsSpeaking(false);
    Speech.stop();
  };

  const refreshPrompt = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentPrompt(getRandomFromList(localizedPrompts));
  };

  const handleVoicePress = async () => {
    if (isRecording) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setIsRecording(false);
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (!uri) return;
      try {
        setIsTranscribing(true);
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        const result = await transcribeMutation.mutateAsync({
          audioBase64: base64,
          mimeType: "audio/m4a",
          language: locale as "en" | "fr" | "pt",
        });
        if (result.text) {
          setContent((prev) => (prev ? prev + " " + result.text : result.text));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch {
        Alert.alert(
          t("journal.transcribeFailed", { defaultValue: "Transcription Failed" }),
          t("journal.transcribeError", { defaultValue: "Could not transcribe audio." })
        );
      } finally {
        setIsTranscribing(false);
      }
    } else {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert(
          t("journal.permissionTitle", { defaultValue: "Permission Needed" }),
          t("journal.permissionBody", { defaultValue: "Allow microphone access to record." })
        );
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
    }
  };

  const handleSpeak = (text: string) => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsSpeaking(true);
    const speechLang = locale === "fr" ? "fr-FR" : locale === "pt" ? "pt-BR" : "en-US";
    Speech.speak(text, {
      language: speechLang,
      pitch: 0.95,
      rate: 0.9,
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
    });
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {t("journal.title", { defaultValue: "Ghost Journal" })}
          </Text>
          <Text style={[styles.headerSub, { color: colors.muted }]}>
            {state.journalEntries.length} {t("journal.entriesCount", { defaultValue: "entries" })} · {t("journal.tagline", { defaultValue: "Write in silence" })}
          </Text>
        </View>
        <Pressable
          onPress={handleNewEntry}
          style={({ pressed }) => [
            styles.newButton,
            { backgroundColor: colors.accent, transform: [{ scale: pressed ? 0.95 : 1 }] },
          ]}
        >
          <Text style={styles.newButtonText}>{t("journal.newEntry", { defaultValue: "New" })}</Text>
        </Pressable>
      </View>

      {/* Entry List */}
      {state.journalEntries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>👻</Text>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            {t("journal.emptyTitle", { defaultValue: "No entries yet" })}
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
            {t("journal.emptySubtitle", { defaultValue: "Start writing to unlock AI insights" })}
          </Text>
          <Pressable
            onPress={handleNewEntry}
            style={({ pressed }) => [
              styles.emptyButton,
              { backgroundColor: colors.accent, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <Text style={styles.emptyButtonText}>{t("journal.firstEntry", { defaultValue: "Write First Entry" })}</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={state.journalEntries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JournalCard
              entry={item}
              locale={locale}
              onDelete={() => dispatch({ type: "DELETE_JOURNAL", payload: item.id })}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        />
      )}

      {/* Editor Modal */}
      <Modal
        visible={showEditor}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseEditor}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={[styles.editorContainer, { backgroundColor: colors.background }]}>
            {/* Editor Header — Cancel (left), Title (center), Save (right) */}
            <View style={[styles.editorHeader, { borderBottomColor: colors.border }]}>
              <Pressable
                onPress={handleCloseEditor}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <Text style={[styles.editorCancel, { color: colors.muted }]}>
                  {t("common.cancel", { defaultValue: "Cancel" })}
                </Text>
              </Pressable>
              <Text style={[styles.editorTitle, { color: colors.foreground }]}>
                {t("journal.ghostJournal", { defaultValue: "Ghost Journal" })}
              </Text>
              <Pressable
                onPress={handleSave}
                disabled={!content.trim()}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.6 : content.trim() ? 1 : 0.4,
                })}
              >
                <Text style={[styles.editorSave, { color: colors.accent }]}>
                  {t("common.save", { defaultValue: "Save" })}
                </Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.editorScroll}
              contentContainerStyle={styles.editorScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Ghost Prompt */}
              <View
                style={[
                  styles.promptCard,
                  {
                    backgroundColor: colors.accent + "15",
                    borderColor: colors.accent + "30",
                  },
                ]}
              >
                <View style={styles.promptHeader}>
                  <Text style={[styles.promptLabel, { color: colors.accent }]}>
                    👻 {t("journal.ghostPrompt", { defaultValue: "Ghost Prompt" })}
                  </Text>
                  <Pressable
                    onPress={refreshPrompt}
                    style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
                  >
                    <Text style={[styles.refreshText, { color: colors.accent }]}>
                      ↻ {t("journal.newPrompt", { defaultValue: "New" })}
                    </Text>
                  </Pressable>
                </View>
                <Text style={[styles.promptText, { color: colors.foreground }]}>
                  {currentPrompt}
                </Text>
              </View>

              {/* Date + Mood */}
              <View style={styles.metaRow}>
                <Text style={[styles.metaDate, { color: colors.muted }]}>
                  {new Date().toLocaleDateString(displayLocale, {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
                {state.todayMood && (
                  <Text style={styles.metaMood}>{MOOD_EMOJIS[state.todayMood.level]}</Text>
                )}
              </View>

              {/* Voice Button */}
              <Pressable
                onPress={handleVoicePress}
                disabled={isTranscribing}
                style={({ pressed }) => [
                  styles.voiceButton,
                  {
                    backgroundColor: isRecording ? colors.error + "15" : colors.foreground + "08",
                    borderColor: isRecording ? colors.error : colors.border,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                {isTranscribing ? (
                  <View style={styles.voiceButtonInner}>
                    <ActivityIndicator size="small" color={colors.accent} />
                    <Text style={[styles.voiceButtonText, { color: colors.muted }]}>
                      {t("journal.transcribing", { defaultValue: "Transcribing..." })}
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.voiceButtonText,
                      { color: isRecording ? colors.error : colors.muted },
                    ]}
                  >
                    {isRecording
                      ? `🔴 ${t("journal.recording", { defaultValue: "Recording..." })}`
                      : `🎤 ${t("journal.speakToAI", { defaultValue: "Speak to AI" })}`}
                  </Text>
                )}
              </Pressable>

              {/* Text Editor */}
              <TextInput
                style={[styles.textEditor, { color: colors.foreground, borderColor: colors.border }]}
                placeholder={t("journal.placeholder", { defaultValue: "Write your thoughts..." })}
                placeholderTextColor={colors.muted}
                value={content}
                onChangeText={setContent}
                multiline
                autoFocus={true}
                textAlignVertical="top"
              />

              {/* AI Analysis Button — prominent, below text editor */}
              <Pressable
                onPress={handleAnalyzeAI}
                disabled={!content.trim() || isAnalyzing}
                style={({ pressed }) => [
                  styles.aiAnalysisButton,
                  {
                    backgroundColor: colors.accent,
                    opacity: pressed ? 0.85 : content.trim() && !isAnalyzing ? 1 : 0.5,
                  },
                ]}
              >
                {isAnalyzing ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.aiAnalysisButtonText}>
                    ⚡ {t("journal.aiAnalysis", { defaultValue: "AI Analysis" })}
                  </Text>
                )}
              </Pressable>

              {/* AI Response — shown BELOW the entry content */}
              {aiResponse && (
                <View
                  style={[
                    styles.aiResponsePanel,
                    {
                      backgroundColor: colors.accent + "10",
                      borderColor: colors.accent + "30",
                    },
                  ]}
                >
                  <View style={styles.aiResponseHeader}>
                    <Text style={[styles.aiResponseTitle, { color: colors.accent }]}>
                      ⚡ {t("journal.aiMentor", { defaultValue: "AI Mentor" })}
                    </Text>
                  </View>
                  <Text style={[styles.aiResponseText, { color: colors.foreground }]}>
                    {aiResponse}
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
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
  headerTitle: { fontSize: 24, fontWeight: "800", letterSpacing: -0.3 },
  headerSub: { fontSize: 13, marginTop: 2 },
  newButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  newButtonText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  listContent: { padding: 20 },
  entryCard: { borderRadius: 18, padding: 16, borderWidth: 1, gap: 8 },
  entryHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  entryDate: { fontSize: 12, fontWeight: "600", letterSpacing: 0.3, textTransform: "uppercase" },
  entryMoodEmoji: { fontSize: 18 },
  entryPrompt: { fontSize: 13, fontWeight: "500", fontStyle: "italic" },
  entryContent: { fontSize: 15, lineHeight: 22 },
  entryTime: { fontSize: 11, marginTop: 2 },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyEmoji: { fontSize: 64 },
  emptyTitle: { fontSize: 24, fontWeight: "800", textAlign: "center" },
  emptySubtitle: { fontSize: 15, textAlign: "center", lineHeight: 22 },
  emptyButton: { paddingHorizontal: 28, paddingVertical: 14, borderRadius: 16, marginTop: 8 },
  emptyButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  editorContainer: { flex: 1 },
  editorHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
  },
  editorCancel: { fontSize: 16, fontWeight: "500" },
  editorTitle: { fontSize: 17, fontWeight: "700" },
  editorSave: { fontSize: 16, fontWeight: "700" },
  editorScroll: { flex: 1 },
  editorScrollContent: { padding: 20, gap: 16, paddingBottom: 60 },
  promptCard: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 8 },
  promptHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  promptLabel: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  refreshText: { fontSize: 13, fontWeight: "600" },
  promptText: { fontSize: 16, lineHeight: 24, fontWeight: "500" },
  metaRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  metaDate: { fontSize: 13, fontWeight: "500" },
  metaMood: { fontSize: 20 },
  voiceButton: {
    borderRadius: 14,
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 52,
  },
  voiceButtonInner: { flexDirection: "row", alignItems: "center", gap: 10 },
  voiceButtonText: { fontSize: 15, fontWeight: "600" },
  textEditor: {
    fontSize: 17,
    lineHeight: 26,
    minHeight: 200,
    fontWeight: "400",
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
  },
  aiAnalysisButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  aiAnalysisButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  aiResponsePanel: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    gap: 12,
    marginTop: 12,
  },
  aiResponseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  aiResponseTitle: { fontSize: 14, fontWeight: "700", letterSpacing: 0.3 },
  speakButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  speakButtonText: { fontSize: 13, fontWeight: "600" },
  aiResponseText: { fontSize: 15, lineHeight: 23, fontWeight: "400" },
});
