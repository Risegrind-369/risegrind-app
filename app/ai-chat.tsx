/**
 * AI Chat Screen — Ghost Mode Mentor
 *
 * Full-screen conversational interface with the Ghost Mode AI mentor.
 * Supports visual reports (text-based charts), personalized responses
 * using the user's streak/XP/habit/health data, and full i18n.
 */
import React, { useState, useRef, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useColors } from "@/hooks/use-colors";
import { useApp } from "@/lib/app-context";
import { useHealth } from "@/lib/health-provider";
import { useLanguage } from "@/lib/language-context";
import { trpc } from "@/lib/trpc";
import { HealthPermissionSheet } from "@/app/components/health-permission-sheet";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// ─── Quick prompt suggestions ─────────────────────────────────────────────────

const QUICK_PROMPTS: Record<string, string[]> = {
  en: [
    "Show me a visual report of my week",
    "How's my discipline streak?",
    "What should I focus on today?",
    "Analyze my sleep and steps",
    "Give me a challenge for tomorrow",
  ],
  fr: [
    "Montre-moi un rapport visuel de ma semaine",
    "Comment va ma série de discipline ?",
    "Sur quoi dois-je me concentrer aujourd'hui ?",
    "Analyse mon sommeil et mes pas",
    "Donne-moi un défi pour demain",
  ],
  pt: [
    "Mostre um relatório visual da minha semana",
    "Como está minha sequência de disciplina?",
    "No que devo focar hoje?",
    "Analise meu sono e passos",
    "Me dê um desafio para amanhã",
  ],
};

// ─── Message bubble ───────────────────────────────────────────────────────────

function MessageBubble({ message, colors }: { message: Message; colors: ReturnType<typeof useColors> }) {
  const isUser = message.role === "user";
  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowAssistant]}>
      {!isUser && (
        <View style={[styles.avatarDot, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarEmoji}>👻</Text>
        </View>
      )}
      <View
        style={[
          styles.bubble,
          isUser
            ? [styles.bubbleUser, { backgroundColor: colors.primary }]
            : [styles.bubbleAssistant, { backgroundColor: colors.surface, borderColor: colors.border }],
        ]}
      >
        <Text
          style={[
            styles.bubbleText,
            { color: isUser ? "#fff" : colors.foreground },
          ]}
        >
          {message.content}
        </Text>
        <Text style={[styles.bubbleTime, { color: isUser ? "rgba(255,255,255,0.6)" : colors.muted }]}>
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </Text>
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function AIChatScreen() {
  const colors = useColors();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t, i18n } = useTranslation();
  const { language } = useLanguage();
  const { state } = useApp();
  const { stepsToday, sleepLastNight, requestPermissions, isAuthorized } = useHealth();

  const lang = (language || i18n.language || "en") as "en" | "fr" | "pt";

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        lang === "fr"
          ? "Ghost Mode activé. Je suis ton mentor IA — direct, sans fioritures. Pose-moi n'importe quelle question sur ta progression, tes habitudes ou ta discipline."
          : lang === "pt"
          ? "Ghost Mode ativado. Sou seu mentor IA — direto, sem rodeios. Me pergunte qualquer coisa sobre seu progresso, hábitos ou disciplina."
          : "Ghost Mode activated. I'm your AI mentor — direct, no fluff. Ask me anything about your progress, habits, or discipline.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [showQuickPrompts, setShowQuickPrompts] = useState(true);
  const [showHealthPermissionSheet, setShowHealthPermissionSheet] = useState(false);
  const [healthPermissionAsked, setHealthPermissionAsked] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  // Check if user has already been asked about health permissions
  useEffect(() => {
    const checkHealthPermissionStatus = async () => {
      try {
        const asked = await AsyncStorage.getItem("@healthPermissionAsked");
        setHealthPermissionAsked(asked === "true");
      } catch (e) {
        console.warn("[HealthKit] Error checking permission status:", e);
      }
    };
    checkHealthPermissionStatus();
  }, []);

  // Compute user context for AI
  const todayStr = new Date().toISOString().split("T")[0];
  const completedToday = state.completions.filter((c) => c.date === todayStr).length;
  const habitRate = state.habits.length > 0 ? Math.round((completedToday / state.habits.length) * 100) : 0;

  const chatMutation = trpc.ai.chat.useMutation();

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: text.trim(),
        timestamp: new Date(),
      };

      const history = messages
        .filter((m) => m.id !== "welcome")
        .map((m) => ({ role: m.role, content: m.content }));

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setShowQuickPrompts(false);

      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);

      try {
        const result = await chatMutation.mutateAsync({
          message: text.trim(),
          history,
          streak: state.streak,
          xp: state.xp,
          habitRate,
          stepsToday: stepsToday ?? undefined,
          sleepLastNight: sleepLastNight ?? undefined,
          language: lang,
        });

        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: result.reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
      } catch {
        const errMsg: Message = {
          id: `err-${Date.now()}`,
          role: "assistant",
          content:
            lang === "fr"
              ? "Connexion impossible. Réessaie dans un instant."
              : lang === "pt"
              ? "Não foi possível conectar. Tente novamente."
              : "Couldn't connect. Try again in a moment.",
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
      }
    },
    [messages, state, habitRate, stepsToday, sleepLastNight, lang, chatMutation]
  );

  const quickPrompts = QUICK_PROMPTS[lang] ?? QUICK_PROMPTS.en;

  return (
    <View style={{ flex: 1 }}>
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: colors.background }]}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + 12, borderBottomColor: colors.border, backgroundColor: colors.background },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 8 })}
        >
          <Text style={[styles.backBtn, { color: colors.primary }]}>✕</Text>
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>
            {lang === "fr" ? "Mentor Ghost" : lang === "pt" ? "Mentor Ghost" : "Ghost Mentor"}
          </Text>
          <Text style={[styles.headerSub, { color: colors.muted }]}>
            {lang === "fr" ? "IA · Toujours actif" : lang === "pt" ? "IA · Sempre ativo" : "AI · Always on"}
          </Text>
        </View>
        <Pressable
          onPress={() => {
            Alert.alert(
              lang === "fr" ? "Effacer la conversation ?" : lang === "pt" ? "Limpar conversa?" : "Clear chat?",
              lang === "fr" ? "L'historique sera effacé." : lang === "pt" ? "O histórico será apagado." : "History will be cleared.",
              [
                { text: lang === "fr" ? "Annuler" : lang === "pt" ? "Cancelar" : "Cancel", style: "cancel" },
                {
                  text: lang === "fr" ? "Effacer" : lang === "pt" ? "Limpar" : "Clear",
                  style: "destructive",
                  onPress: () => {
                    setMessages([{
                      id: "welcome",
                      role: "assistant",
                      content: lang === "fr" ? "Conversation effacée. Nouvelle session Ghost Mode." : lang === "pt" ? "Conversa limpa. Nova sessão Ghost Mode." : "Chat cleared. New Ghost Mode session.",
                      timestamp: new Date(),
                    }]);
                    setShowQuickPrompts(true);
                  },
                },
              ]
            );
          }}
          style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 8 })}
        >
          <Text style={[styles.clearBtn, { color: colors.muted }]}>
            {lang === "fr" ? "Effacer" : lang === "pt" ? "Limpar" : "Clear"}
          </Text>
        </Pressable>
      </View>

      {/* Context bar */}
      <View style={[styles.contextBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.contextItem, { color: colors.muted }]}>🔥 {state.streak}d</Text>
        <Text style={[styles.contextItem, { color: colors.muted }]}>⚡ {state.xp} XP</Text>
        <Text style={[styles.contextItem, { color: colors.muted }]}>✅ {habitRate}%</Text>
        {stepsToday != null && (
          <Text style={[styles.contextItem, { color: colors.muted }]}>👟 {stepsToday.toLocaleString()} 🍎</Text>
        )}
        {sleepLastNight != null && (
          <Text style={[styles.contextItem, { color: colors.muted }]}>😴 {sleepLastNight}h 🍎</Text>
        )}
        {(stepsToday === null || sleepLastNight === null) && !healthPermissionAsked && (
          <Pressable
            onPress={() => {
              setShowHealthPermissionSheet(true);
            }}
            style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          >
            <Text style={[styles.contextItem, { color: colors.primary }]}>+ Health</Text>
          </Pressable>
        )}
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(m) => m.id}
        renderItem={({ item }) => <MessageBubble message={item} colors={colors} />}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListFooterComponent={
          chatMutation.isPending ? (
            <View style={styles.typingRow}>
              <View style={[styles.avatarDot, { backgroundColor: colors.primary }]}>
                <Text style={styles.avatarEmoji}>👻</Text>
              </View>
              <View style={[styles.typingBubble, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            </View>
          ) : null
        }
      />

      {/* Quick prompts */}
      {showQuickPrompts && (
        <View style={styles.quickPromptsWrap}>
          <FlatList
            data={quickPrompts}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item}
            contentContainerStyle={styles.quickPromptsList}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => sendMessage(item)}
                style={({ pressed }) => [
                  styles.quickPromptChip,
                  { backgroundColor: colors.surface, borderColor: colors.border, opacity: pressed ? 0.7 : 1 },
                ]}
              >
                <Text style={[styles.quickPromptText, { color: colors.foreground }]}>{item}</Text>
              </Pressable>
            )}
          />
        </View>
      )}

      {/* Input bar */}
      <View
        style={[
          styles.inputBar,
          { paddingBottom: insets.bottom + 8, backgroundColor: colors.background, borderTopColor: colors.border },
        ]}
      >
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.surface, color: colors.foreground, borderColor: colors.border },
          ]}
          value={input}
          onChangeText={setInput}
          placeholder={
            lang === "fr"
              ? "Pose une question à ton mentor..."
              : lang === "pt"
              ? "Faça uma pergunta ao seu mentor..."
              : "Ask your mentor anything..."
          }
          placeholderTextColor={colors.muted}
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={() => sendMessage(input)}
        />
        <Pressable
          onPress={() => sendMessage(input)}
          disabled={!input.trim() || chatMutation.isPending}
          style={({ pressed }) => [
            styles.sendBtn,
            {
              backgroundColor: input.trim() ? colors.primary : colors.border,
              opacity: pressed ? 0.8 : 1,
              transform: [{ scale: pressed ? 0.95 : 1 }],
            },
          ]}
        >
          <Text style={styles.sendBtnText}>↑</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>

    {/* Health Permission Sheet - Sibling to KeyboardAvoidingView */}
    <HealthPermissionSheet
      visible={showHealthPermissionSheet}
      onAllow={async () => {
        await requestPermissions();
        await AsyncStorage.setItem("@healthPermissionAsked", "true");
        setHealthPermissionAsked(true);
        setShowHealthPermissionSheet(false);
      }}
      onSkip={() => {
        AsyncStorage.setItem("@healthPermissionAsked", "true").catch(() => {});
        setHealthPermissionAsked(true);
        setShowHealthPermissionSheet(false);
      }}
    />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 0.5,
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 16, fontWeight: "700" },
  headerSub: { fontSize: 11, marginTop: 1 },
  backBtn: { fontSize: 18, fontWeight: "600" },
  clearBtn: { fontSize: 13, minWidth: 40, textAlign: "right" },
  contextBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 16,
    borderBottomWidth: 0.5,
  },
  contextItem: { fontSize: 12, fontWeight: "600" },
  messageList: { padding: 16, gap: 12, paddingBottom: 8 },
  bubbleRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 8 },
  bubbleRowUser: { justifyContent: "flex-end" },
  bubbleRowAssistant: { justifyContent: "flex-start" },
  avatarDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  avatarEmoji: { fontSize: 14 },
  bubble: {
    maxWidth: "78%",
    borderRadius: 18,
    padding: 12,
    gap: 4,
  },
  bubbleUser: { borderBottomRightRadius: 4 },
  bubbleAssistant: { borderBottomLeftRadius: 4, borderWidth: 1 },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  bubbleTime: { fontSize: 10, alignSelf: "flex-end" },
  typingRow: { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 8 },
  typingBubble: {
    padding: 12,
    borderRadius: 18,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    width: 60,
    alignItems: "center",
  },
  quickPromptsWrap: { paddingVertical: 8 },
  quickPromptsList: { paddingHorizontal: 16, gap: 8 },
  quickPromptChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  quickPromptText: { fontSize: 13, fontWeight: "500" },
  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 10,
    borderTopWidth: 0.5,
  },
  input: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
    lineHeight: 20,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnText: { color: "#fff", fontSize: 20, fontWeight: "700", marginTop: -2 },
});
