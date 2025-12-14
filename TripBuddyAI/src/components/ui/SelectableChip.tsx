import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '../../constants/theme';

interface SelectableChipProps {
  key?: string | number;
  label: string;
  selected: boolean;
  onPress: () => void;
  emoji?: string;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles: Record<NonNullable<SelectableChipProps['size']>, { paddingHorizontal: number; paddingVertical: number; borderRadius: number; textSize: number }> = {
  sm: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs, borderRadius: BorderRadius.md, textSize: FontSize.sm },
  md: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.sm, borderRadius: BorderRadius.lg, textSize: FontSize.md },
  lg: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md - 2, borderRadius: BorderRadius.xl, textSize: FontSize.lg },
};

export function SelectableChip({
  label,
  selected,
  onPress,
  emoji,
  style,
  size = 'md',
}: SelectableChipProps) {
  const palette = useMemo(() => {
    return selected
      ? {
          backgroundColor: Colors.primary,
          borderColor: Colors.primary,
          textColor: Colors.textOnPrimary,
        }
      : {
          backgroundColor: Colors.surface,
          borderColor: Colors.primary,
          textColor: Colors.textPrimary,
        };
  }, [selected]);

  const sizing = useMemo(() => sizeStyles[size], [size]);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={[
        styles.base,
        {
          backgroundColor: palette.backgroundColor,
          borderColor: palette.borderColor,
          paddingHorizontal: sizing.paddingHorizontal,
          paddingVertical: sizing.paddingVertical,
          borderRadius: sizing.borderRadius,
        },
        style,
      ]}
    >
      {emoji && (
        <Text style={styles.emoji} accessibilityElementsHidden>
          {emoji}
        </Text>
      )}
      <Text
        style={[
          styles.text,
          { color: palette.textColor, fontSize: sizing.textSize },
        ]}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 1,
  },
  text: {
    fontWeight: FontWeight.semibold as any,
  },
  emoji: {
    fontSize: FontSize.lg,
    marginRight: Spacing.xs,
  },
});
