import React, { useMemo } from 'react';
import { Pressable, Text, ViewStyle } from 'react-native';

interface SelectableChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  emoji?: string;
  style?: ViewStyle;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClassNames: Record<NonNullable<SelectableChipProps['size']>, string> = {
  sm: 'px-3 py-1.5 rounded-lg',
  md: 'px-4 py-2 rounded-xl',
  lg: 'px-5 py-2.5 rounded-2xl',
};

export function SelectableChip({
  label,
  selected,
  onPress,
  emoji,
  style,
  size = 'md',
  className,
}: SelectableChipProps) {
  const chipClassName = useMemo(() => {
    const base = 'flex-row items-center gap-2 border shadow-soft';
    const palette = selected
      ? 'bg-primary border-primary'
      : 'bg-surface border-primary/30';
    return [base, palette, sizeClassNames[size], className ?? '']
      .filter(Boolean)
      .join(' ');
  }, [className, selected, size]);

  const textClassName = selected
    ? 'text-background font-semibold'
    : 'text-ink font-semibold';

  return (
    <Pressable
      onPress={onPress}
      className={chipClassName}
      style={style}
      accessibilityRole="button"
    >
      {emoji && <Text className="text-lg" accessibilityElementsHidden>{emoji}</Text>}
      <Text
        className={`${textClassName} text-sm`}
        numberOfLines={2}
        ellipsizeMode="tail"
      >
        {label}
      </Text>
    </Pressable>
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
    shadowColor: Colors.primaryDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 3,
    elevation: 2,
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

