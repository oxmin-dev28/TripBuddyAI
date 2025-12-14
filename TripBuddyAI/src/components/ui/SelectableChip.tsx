import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { Colors, Spacing, FontSize, BorderRadius } from '../../constants/theme';

interface SelectableChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  emoji?: string;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
}

export function SelectableChip({
  label,
  selected,
  onPress,
  emoji,
  style,
  size = 'md',
}: SelectableChipProps) {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        styles[`size_${size}`],
        selected && styles.selected,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {emoji && <Text style={styles.emoji}>{emoji}</Text>}
      <Text style={[styles.label, selected && styles.labelSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2,
  },
  
  size_sm: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  size_md: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  size_lg: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  
  selected: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  
  emoji: {
    fontSize: FontSize.lg,
  },
  
  label: {
    fontSize: FontSize.md,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  
  labelSelected: {
    color: Colors.textOnPrimary,
  },
});

