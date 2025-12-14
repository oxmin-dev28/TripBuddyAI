import React, { useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  PressableStateCallbackType,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { Colors, BorderRadius, Spacing, FontSize, FontWeight } from '../../constants/theme';
import { hapticBounce } from '../../utils/animations';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'accent';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, { container: ViewStyle; text: ViewStyle }> = {
  primary: {
    container: { backgroundColor: Colors.primary },
    text: { color: Colors.textOnPrimary },
  },
  secondary: {
    container: {
      backgroundColor: Colors.background,
      borderColor: Colors.primary,
      borderWidth: 2,
    },
    text: { color: Colors.primary },
  },
  outline: {
    container: {
      backgroundColor: 'transparent',
      borderColor: Colors.primary,
      borderWidth: 2,
    },
    text: { color: Colors.primary },
  },
  accent: {
    container: { backgroundColor: Colors.primaryDark },
    text: { color: Colors.textOnPrimary },
  },
};

const sizeStyles: Record<ButtonSize, { paddingVertical: number; paddingHorizontal: number; borderRadius: number; textSize: number }> = {
  sm: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs + 4, borderRadius: BorderRadius.md, textSize: FontSize.sm },
  md: { paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md - 2, borderRadius: BorderRadius.lg, textSize: FontSize.md },
  lg: { paddingHorizontal: Spacing.lg + 4, paddingVertical: Spacing.md, borderRadius: BorderRadius.xl, textSize: FontSize.lg },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  style,
  fullWidth = false,
}: ButtonProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 120,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const { container: variantContainer, text: variantText } = useMemo(
    () => variantStyles[variant],
    [variant]
  );

  const sizeStyle = useMemo(() => sizeStyles[size], [size]);

  const pressableStyle = ({ pressed }: PressableStateCallbackType) => [
    styles.base,
    variantContainer,
    {
      paddingHorizontal: sizeStyle.paddingHorizontal,
      paddingVertical: sizeStyle.paddingVertical,
      borderRadius: sizeStyle.borderRadius,
      width: fullWidth ? '100%' : undefined,
      opacity: disabled ? 0.6 : 1,
    },
    pressed && { transform: [{ translateY: 1 }] },
    style,
  ];

  const textStyle = [
    styles.textBase,
    variantText,
    { fontSize: sizeStyle.textSize },
    disabled && styles.textDisabled,
  ];

  const handlePress = () => {
    hapticBounce(scaleAnim);
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <Pressable
        accessibilityRole="button"
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={pressableStyle}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'outline' ? Colors.primary : Colors.textOnPrimary} />
        ) : (
          <View style={styles.content}>
            {icon}
            <Text style={textStyle} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  textBase: {
    fontWeight: FontWeight.semibold as any,
    letterSpacing: -0.2,
  },
  textDisabled: {
    opacity: 0.9,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
