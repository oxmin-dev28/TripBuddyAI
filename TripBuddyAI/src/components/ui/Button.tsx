import React, { useMemo, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  PressableStateCallbackType,
  Text,
  View,
  ViewStyle,
} from 'react-native';
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
  className?: string;
}

const variantClassNames: Record<ButtonVariant, string> = {
  primary: 'bg-primary shadow-soft',
  secondary: 'bg-background border-2 border-primary shadow-soft',
  outline: 'bg-transparent border-2 border-primary shadow-soft',
  accent: 'bg-ink shadow-soft',
};

const textVariantClassNames: Record<ButtonVariant, string> = {
  primary: 'text-background',
  secondary: 'text-primary',
  outline: 'text-primary',
  accent: 'text-background',
};

const sizeClassNames: Record<ButtonSize, string> = {
  sm: 'px-3 py-2 rounded-lg',
  md: 'px-4 py-3 rounded-xl',
  lg: 'px-5 py-3.5 rounded-2xl',
};

const textSizeClassNames: Record<ButtonSize, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
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
  className,
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

  const combinedClassName = useMemo(() => {
    const parts = [
      'flex-row items-center justify-center gap-2',
      sizeClassNames[size],
      variantClassNames[variant],
      fullWidth ? 'w-full' : '',
      disabled ? 'opacity-60' : '',
      className ?? '',
    ];
    return parts.filter(Boolean).join(' ');
  }, [className, disabled, fullWidth, size, variant]);

  const textClassName = useMemo(() => {
    return [
      'font-semibold tracking-tight',
      textVariantClassNames[variant],
      textSizeClassNames[size],
      disabled ? 'opacity-90' : '',
    ]
      .filter(Boolean)
      .join(' ');
  }, [disabled, size, variant]);

  const handlePress = () => {
    hapticBounce(scaleAnim);
    onPress();
  };

  const pressableStyle = ({ pressed }: PressableStateCallbackType) => [
    style,
    pressed && { transform: [{ translateY: 1 }] },
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
        className={combinedClassName}
        style={pressableStyle}
      >
        {loading ? (
          <ActivityIndicator color={variant === 'outline' ? '#1E2A44' : '#F5F8FC'} />
        ) : (
          <View className="flex-row items-center gap-2">
            {icon}
            <Text className={textClassName} numberOfLines={1} ellipsizeMode="tail">
              {title}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}
