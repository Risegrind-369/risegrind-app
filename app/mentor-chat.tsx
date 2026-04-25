import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  timestamp: string;
  personality?: string;
}

export default function MentorChatScreen() {
  const colors = useColors();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [mentorPersonality, setMentorPersonality] = useState('supportive');
  const scrollViewRef = useRef<ScrollView>(null);

  const personalities = [
    { id: 'supportive', name: '🤝 Supportive' },
    { id: 'challenging', name: '💪 Challenging' },
    { id: 'scientific', name: '🧠 Scientific' },
    { id: 'friendly', name: '😊 Friendly' }
  ];

  // Load chat history on mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const userId = '1'; // TODO: Get from auth context
      const response = await fetch(`/api/mentor/chat-history?userId=${userId}&limit=20`);
      const data = await response.json();
      setMessages(data.map((msg: any, idx: number) => ({
        id: `${idx}`,
        role: msg.role,
        message: msg.message,
        timestamp: new Date(msg.createdAt).toLocaleTimeString(),
        personality: msg.mentorPersonality
      })));
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      message: inputText,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const userId = '1'; // TODO: Get from auth context
      const response = await fetch('/api/mentor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: inputText,
          mentorPersonality
        })
      });

      const data = await response.json();

      const mentorMessage: ChatMessage = {
        id: `mentor-${Date.now()}`,
        role: 'assistant',
        message: data.message,
        timestamp: new Date().toLocaleTimeString(),
        personality: data.personality
      };

      setMessages(prev => [...prev, mentorMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <View className="flex-1 flex-col">
        {/* Header */}
        <View className="px-4 py-4 border-b border-border">
          <Text className="text-2xl font-bold text-foreground">Your AI Mentor</Text>
          <Text className="text-sm text-muted mt-1">24/7 Coaching & Support</Text>
        </View>

        {/* Personality Selector */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="px-4 py-3 border-b border-border"
        >
          {personalities.map(p => (
            <TouchableOpacity
              key={p.id}
              onPress={() => setMentorPersonality(p.id)}
              className={cn(
                'px-4 py-2 rounded-full mr-2 border',
                mentorPersonality === p.id
                  ? 'bg-primary border-primary'
                  : 'bg-surface border-border'
              )}
            >
              <Text
                className={cn(
                  'text-sm font-semibold',
                  mentorPersonality === p.id ? 'text-background' : 'text-foreground'
                )}
              >
                {p.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 0 ? (
            <View className="flex-1 items-center justify-center py-8">
              <Text className="text-lg font-semibold text-foreground mb-2">👋 Welcome!</Text>
              <Text className="text-sm text-muted text-center">
                Start a conversation with your AI mentor. They're here to support your habit journey.
              </Text>
            </View>
          ) : (
            messages.map(msg => (
              <Animated.View
                key={msg.id}
                entering={FadeIn}
                className={cn(
                  'mb-4 max-w-xs',
                  msg.role === 'user' ? 'self-end' : 'self-start'
                )}
              >
                <View
                  className={cn(
                    'px-4 py-3 rounded-2xl',
                    msg.role === 'user'
                      ? 'bg-primary rounded-br-none'
                      : 'bg-surface border border-border rounded-bl-none'
                  )}
                >
                  <Text
                    className={cn(
                      'text-sm',
                      msg.role === 'user' ? 'text-background' : 'text-foreground'
                    )}
                  >
                    {msg.message}
                  </Text>
                  <Text
                    className={cn(
                      'text-xs mt-1',
                      msg.role === 'user' ? 'text-background/70' : 'text-muted'
                    )}
                  >
                    {msg.timestamp}
                  </Text>
                </View>
              </Animated.View>
            ))
          )}
          {loading && (
            <View className="mb-4 self-start">
              <View className="px-4 py-3 rounded-2xl bg-surface border border-border rounded-bl-none">
                <ActivityIndicator size="small" color={colors.primary} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View className="px-4 py-4 border-t border-border bg-background">
          <View className="flex-row items-center gap-2">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Ask your mentor..."
              placeholderTextColor={colors.muted}
              className="flex-1 px-4 py-3 rounded-full bg-surface text-foreground border border-border"
              editable={!loading}
            />
            <TouchableOpacity
              onPress={sendMessage}
              disabled={!inputText.trim() || loading}
              className={cn(
                'w-12 h-12 rounded-full items-center justify-center',
                inputText.trim() && !loading ? 'bg-primary' : 'bg-border'
              )}
            >
              <Text className="text-xl">{'→'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScreenContainer>
  );
}
