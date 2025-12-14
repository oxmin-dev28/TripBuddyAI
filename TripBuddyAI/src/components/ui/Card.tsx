import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { Colors, BorderRadius, Spacing } from '../../constants/theme';
import { fadeIn } from '../../utils/animations';

interface CardProps {
  key?: string | number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
  animated?: boolean;
  delay?: number;
}

const variantStyles: Record<NonNullable<CardProps['variant']>, ViewStyle> = {
  default: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 2,
  },
  elevated: {
    backgroundColor: Colors.surface,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 3,
  },
  outlined: {
    backgroundColor: Colors.surface,
    borderColor: Colors.primary,
    borderWidth: 1,
  },
};

export function Card({ children, style, variant = 'default', animated = false, delay = 0 }: CardProps) {
  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;

  useEffect(() => {
    if (animated) {
      fadeIn(fadeAnim, 280, delay).start();
    }
  }, [animated, delay, fadeAnim]);

  const containerStyle = useMemo(
    () => [styles.base, variantStyles[variant], style, animated && { opacity: fadeAnim }],
    [animated, fadeAnim, style, variant]
  );

  return <Animated.View style={containerStyle}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
});
