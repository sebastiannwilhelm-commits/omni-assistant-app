import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'error';
  text: string;
  timestamp: string;
}

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const isError = message.role === 'error';

  const formattedTime = React.useMemo(() => {
    try {
      const date = new Date(message.timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }, [message.timestamp]);

  return (
    <View
      style={[
        styles.row,
        isUser ? styles.userRow : styles.assistantRow,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser && styles.userBubble,
          message.role === 'assistant' && styles.assistantBubble,
          isError && styles.errorBubble,
        ]}
      >
        {!isUser && (
          <Text style={[styles.senderLabel, isError && styles.errorSenderLabel]}>
            {isError ? 'Connection Notice' : 'Omni-Assistant'}
          </Text>
        )}
        <Text
          style={[
            styles.messageText,
            isUser && styles.userMessageText,
            isError && styles.errorMessageText,
          ]}
        >
          {message.text}
        </Text>
        {formattedTime ? (
          <Text
            style={[
              styles.timestamp,
              isUser ? styles.userTimestamp : styles.assistantTimestamp,
            ]}
          >
            {formattedTime}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    marginVertical: 6,
    paddingHorizontal: 16,
    flexDirection: 'row',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  userBubble: {
    backgroundColor: '#6366F1',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    borderBottomLeftRadius: 4,
  },
  errorBubble: {
    backgroundColor: '#3B1D2E',
    borderWidth: 1,
    borderColor: '#F43F5E',
    borderBottomLeftRadius: 4,
  },
  senderLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#818CF8',
    marginBottom: 4,
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  errorSenderLabel: {
    color: '#FB7185',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 21,
    color: '#F8FAFC',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  errorMessageText: {
    color: '#FFE4E6',
  },
  timestamp: {
    fontSize: 10,
    marginTop: 5,
    alignSelf: 'flex-end',
  },
  userTimestamp: {
    color: '#E0E7FF',
  },
  assistantTimestamp: {
    color: '#94A3B8',
  },
});
