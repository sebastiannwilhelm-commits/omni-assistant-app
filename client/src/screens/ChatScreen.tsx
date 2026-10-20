import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChatMessage, MessageBubble } from '../components/MessageBubble';
import { QuickPromptChips } from '../components/QuickPromptChips';
import { API_BASE_URL } from '../config/api';
import { checkServerHealth, sendChatPrompt } from '../services/chatApi';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    role: 'assistant',
    text: 'Hey! I am Omni-Assistant. Ask me anything about your gaming performance or social media analytics.',
    timestamp: new Date().toISOString(),
  },
];

export const ChatScreen: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isServerOnline, setIsServerOnline] = useState<boolean | null>(null);
  const flatListRef = useRef<FlatList<ChatMessage>>(null);

  const refreshHealth = useCallback(async () => {
    const healthy = await checkServerHealth();
    setIsServerOnline(healthy);
  }, []);

  useEffect(() => {
    void refreshHealth();
  }, [refreshHealth]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 80);
  }, []);

  const handleSend = useCallback(
    async (overridePrompt?: string) => {
      const promptToSend = (overridePrompt ?? inputText).trim();
      if (!promptToSend || isLoading) {
        return;
      }

      if (!overridePrompt) {
        setInputText('');
      }

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: promptToSend,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);
      scrollToBottom();

      try {
        const data = await sendChatPrompt(promptToSend);
        setIsServerOnline(true);

        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: data.reply,
          timestamp: data.timestamp || new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMessage]);
      } catch (err) {
        setIsServerOnline(false);
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Unable to reach Omni-Assistant server.';

        setMessages((prev) => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            role: 'error',
            text: `Could not reach server at ${API_BASE_URL}/chat (${errorMessage}). Make sure the backend is running in /server.`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
        scrollToBottom();
      }
    },
    [inputText, isLoading, scrollToBottom]
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Omni-Assistant</Text>
            <Text style={styles.subtitle}>Gaming & Social Stats AI</Text>
          </View>
          <TouchableOpacity
            style={styles.statusBadge}
            onPress={() => void refreshHealth()}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.statusDot,
                isServerOnline === true && styles.statusDotOnline,
                isServerOnline === false && styles.statusDotOffline,
              ]}
            />
            <Text style={styles.statusText}>
              {isServerOnline === null
                ? 'Checking...'
                : isServerOnline
                ? 'Server Online'
                : 'Server Offline'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Message History List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={scrollToBottom}
        />

        {/* Quick Starter Prompts */}
        <QuickPromptChips
          onSelectPrompt={(prompt) => void handleSend(prompt)}
          disabled={isLoading}
        />

        {/* Input Bar */}
        <View style={styles.inputBar}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask about your gaming or social stats..."
            placeholderTextColor="#64748B"
            multiline
            maxLength={500}
            editable={!isLoading}
            onSubmitEditing={() => void handleSend()}
            blurOnSubmit={false}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
            ]}
            onPress={() => void handleSend()}
            disabled={!inputText.trim() || isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.sendButtonText}>Send</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    backgroundColor: '#0F172A',
  },
  title: {
    fontSize: 19,
    fontWeight: '700',
    color: '#F8FAFC',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    color: '#94A3B8',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
    marginRight: 6,
  },
  statusDotOnline: {
    backgroundColor: '#10B981',
  },
  statusDotOffline: {
    backgroundColor: '#EF4444',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#E2E8F0',
  },
  listContent: {
    paddingVertical: 14,
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#0F172A',
    gap: 10,
  },
  textInput: {
    flex: 1,
    minHeight: 42,
    maxHeight: 110,
    backgroundColor: '#1E293B',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    color: '#F8FAFC',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sendButton: {
    height: 42,
    paddingHorizontal: 18,
    borderRadius: 21,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#334155',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});
