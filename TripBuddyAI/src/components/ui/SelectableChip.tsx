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
