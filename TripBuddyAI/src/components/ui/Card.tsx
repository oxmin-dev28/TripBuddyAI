import React, { useRef, useEffect } from 'react';
import { Animated, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Colors, Spacing, BorderRadius } from '../../constants/theme';
import { fadeIn } from '../../utils/animations';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
  animated?: boolean;
  delay?: number;
}

export function Card({ children, style, variant = 'default', animated = false, delay = 0 }: CardProps) {
  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;

  useEffect(() => {
    if (animated) {
      fadeIn(fadeAnim, 300, delay).start();
    }
  }, [animated, delay]);

  return (
    <Animated.View style={[styles.card, styles[variant], style, animated && { opacity: fadeAnim }]}>
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  outlined: {
    borderWidth: 1,
    borderColor: Colors.border,
  },
});

