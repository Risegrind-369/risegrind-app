import React, { useState } from "react";
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

const ALL_PROMPTS = [
  // Classic prompts
  "What's one thing you're grateful for today?",
  "What would make today a great day?",
  "What's been on your mind lately?",
  "Describe a challenge you're working through.",
  "How did your morning routine go today?",
  "Reflect on a recent win, big or small.",
  "What would your future self thank you for doing today?",
  "How are you taking care of yourself this week?",
  // Ghost Mode prompts
  "What did you do today that your future self will thank you for?",
  "What noise are you blocking out right now?",
  "Describe the version of yourself you're building in silence.",
  "What's one thing you did today that required discipline?",
  "What would you do differently if no one was watching?",
  "What's the hardest thing you're working through right now?",
  "What's one habit that's quietly changing your life?",
  "What are you grateful for that you never talk about?",
  "What does locking in look like for you today?",
];

function getRandomPrompt(): string {
  return ALL_PROMPTS[Math.floor(Math.random() * ALL_PROMPTS.length)];
}

function formatEntryDate(timestamp: number): string {
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (date.toDateString() === today.toDateString()) return "Today";
  if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
  return date.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function JournalCard({ entry, onDelete }: { entry: JournalEntry; onDelete: () => void }) {
  const colors = useColors();
  return (
    <Pressable
      onLongPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        Alert.alert("Delete Entry", "Are you sure you want to delete this journal entry?", [
          { text: "Cancel", style: "cancel" },
          { text: "Delete", style: "destructive", onPress: onDelete },
        ]);
      }}
      style={[styles.entryCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
    >
      <View style={styles.entryHeader}>
        <Text style={[styles.entryDate, { color: colors.muted }]}>
          {formatEntryDate(entry.createdAt)}
        </Text>
        {entry.moodLevel && <Text style={styles.entryMoodEmoji}>{MOOD_EMOJIS[entry.moodLevel]}</Text>}
      </View>
      {entry.prompt ? (
        <Text style={[styles.entryPrompt, { color: colors.primary }]} numberOfLines={1}>
          👻 {entry.prompt}
        </Text>
      ) : null}
      <Text style={[styles.entryContent, { color: colors.foreground }]} numberOfLines={4}>
        {entry.content}
      </Text>
      <Text style={[styles.entryTime, { color: colors.muted }]}>
        {new Date(entry.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
      </Text>
    </Pressable>
  );
}

export default function JournalScreen() {
  const colors = useColors();
  const { state, dispatch } = useApp();
  const [showEditor, setShowEditor] = useState(false);
  const [content, setContent] = useState("");
  const [currentPrompt, setCurrentPrompt] = useState(getRandomPrompt());
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const transcribeMutation = trpc.voice.transcribe.useMutation();

  const handleNewEntry = () => {
    setCurrentPrompt(getRandomPrompt());
    setContent("");
    setShowEditor(true);
  };

  const handleSave = () => {
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
  };

  const refreshPrompt = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCurrentPrompt(getRandomPrompt());
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
        const result = await transcribeMutation.mutateAsync({ audioBase64: base64, mimeType: "audio/m4a" });
        if (result.text) {
          setContent((prev) => (prev ? prev + " " + result.text : result.text));
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
      } catch {
        Alert.alert("Transcription failed", "Could not transcribe audio. Please try again.");
      } finally {
        setIsTranscribing(false);
      }
    } else {
      const { granted } = await requestRecordingPermissionsAsync();
      if (!granted) {
        Alert.alert("Permission needed", "Microphone access is required for voice journaling.");
        return;
      }
      await setAudioModeAsync({ playsInSilentMode: true });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecording(true);
    }
  };

  return (
    <ScreenContainer containerClassName="bg-background">
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Ghost Journal</Text>
          <Text style={[styles.headerSub, { color: colors.muted }]}>
            {state.journalEntries.length} entries · Build in silence
          </Text>
        </View>
        <Pressable
          onPress={handleNewEntry}
          style={({ pressed }) => [
            styles.newButton,
            { backgroundColor: colors.primary, transform: [{ scale: pressed ? 0.95 : 1 }] },
          ]}
        >
          <Text style={styles.newButtonText}>+ New</Text>
        </Pressable>
      </View>

      {/* Entry List */}
      {state.journalEntries.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>👻</Text>
          <Text style={[styles.emptyTitle, { color: colors.foreground }]}>
            Go Ghost. Start Writing.
          </Text>
          <Text style={[styles.emptySubtitle, { color: colors.muted }]}>
            Your journal is your private space to build in silence. No audience. Just you and your growth.
          </Text>
          <Pressable
            onPress={handleNewEntry}
            style={({ pressed }) => [
              styles.emptyButton,
              { backgroundColor: colors.primary, transform: [{ scale: pressed ? 0.97 : 1 }] },
            ]}
          >
            <Text style={styles.emptyButtonText}>Write First Entry</Text>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={state.journalEntries}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <JournalCard
              entry={item}
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
        onRequestClose={() => setShowEditor(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={[styles.editorContainer, { backgroundColor: colors.background }]}>
            {/* Editor Header */}
            <View style={[styles.editorHeader, { borderBottomColor: colors.border }]}>
              <Pressable
                onPress={() => setShowEditor(false)}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <Text style={[styles.editorCancel, { color: colors.muted }]}>Cancel</Text>
              </Pressable>
              <Text style={[styles.editorTitle, { color: colors.foreground }]}>New Entry</Text>
              <Pressable
                onPress={handleSave}
                disabled={!content.trim()}
                style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}
              >
                <Text style={[styles.editorSave, { color: content.trim() ? colors.primary : colors.muted }]}>
                  Save
                </Text>
              </Pressable>
            </View>

            <ScrollView
              style={styles.editorScroll}
              contentContainerStyle={styles.editorScrollContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Ghost Prompt */}
              <View style={[styles.promptCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
                <View style={styles.promptHeader}>
                  <Text style={[styles.promptLabel, { color: colors.primary }]}>👻 Ghost Prompt</Text>
                  <Pressable onPress={refreshPrompt} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
                    <Text style={[styles.refreshText, { color: colors.primary }]}>↻ New</Text>
                  </Pressable>
                </View>
                <Text style={[styles.promptText, { color: colors.foreground }]}>{currentPrompt}</Text>
              </View>

              {/* Date + Mood */}
              <View style={styles.metaRow}>
                <Text style={[styles.metaDate, { color: colors.muted }]}>
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </Text>
                {state.todayMood && <Text style={styles.metaMood}>{MOOD_EMOJIS[state.todayMood.level]}</Text>}
              </View>

              {/* Voice Button */}
              <Pressable
                onPress={handleVoicePress}
                disabled={isTranscribing}
                style={({ pressed }) => [
                  styles.voiceButton,
                  {
                    backgroundColor: isRecording ? "#EF444418" : colors.foreground + "08",
                    borderColor: isRecording ? "#EF4444" : colors.border,
                    transform: [{ scale: pressed ? 0.97 : 1 }],
                  },
                ]}
              >
                {isTranscribing ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  <Text style={[styles.voiceButtonText, { color: isRecording ? "#EF4444" : colors.muted }]}>
                    {isRecording ? "🔴 Recording... tap to stop" : "🎤 Tap to record voice note"}
                  </Text>
                )}
              </Pressable>

              {/* Text Editor */}
              <TextInput
                style={[styles.textEditor, { color: colors.foreground }]}
                placeholder="Start writing or use voice above..."
                placeholderTextColor={colors.muted}
                value={content}
                onChangeText={setContent}
                multiline
                autoFocus
                textAlignVertical="top"
              />
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
  editorScrollContent: { padding: 20, gap: 16, paddingBottom: 40 },
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
    minHeight: 48,
  },
  voiceButtonText: { fontSize: 15, fontWeight: "600" },
  textEditor: {
    fontSize: 17,
    lineHeight: 26,
    minHeight: 260,
    fontWeight: "400",
  },
});
