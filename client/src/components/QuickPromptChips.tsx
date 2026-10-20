import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SAMPLE_PROMPTS = [
  'How are my Apex Legends stats and K/D this week?',
  'What is my Warzone win rate and K/D?',
  'How did my top TikTok post perform?',
  'Show my YouTube views, likes, and comments',
];

interface QuickPromptChipsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

export const QuickPromptChips: React.FC<QuickPromptChipsProps> = ({
  onSelectPrompt,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.caption}>Ask about your gaming & social stats:</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {SAMPLE_PROMPTS.map((prompt) => (
          <TouchableOpacity
            key={prompt}
            style={[styles.chip, disabled && styles.chipDisabled]}
            onPress={() => onSelectPrompt(prompt)}
            disabled={disabled}
            activeOpacity={0.75}
          >
            <Text style={styles.chipText}>{prompt}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 8,
    paddingBottom: 6,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#0B0F19',
  },
  caption: {
    fontSize: 11,
    color: '#94A3B8',
    paddingHorizontal: 16,
    marginBottom: 6,
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 12,
    gap: 8,
  },
  chip: {
    backgroundColor: '#162032',
    borderWidth: 1,
    borderColor: '#334155',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginHorizontal: 4,
  },
  chipDisabled: {
    opacity: 0.5,
  },
  chipText: {
    color: '#CBD5E1',
    fontSize: 12,
    fontWeight: '500',
  },
});
