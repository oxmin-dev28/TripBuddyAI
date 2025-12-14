import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';
import { fadeIn } from '../../utils/animations';

interface CardProps {
  key?: string | number;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  variant?: 'default' | 'elevated' | 'outlined';
  animated?: boolean;
  delay?: number;
  className?: string;
}

const variantClassNames: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'bg-surface shadow-soft',
  elevated: 'bg-surface shadow-card',
  outlined: 'bg-surface border border-primary/40',
};

export function Card({
  children,
  style,
  variant = 'default',
  animated = false,
  delay = 0,
  className,
}: CardProps) {
  const fadeAnim = useRef(new Animated.Value(animated ? 0 : 1)).current;

  useEffect(() => {
    if (animated) {
      fadeIn(fadeAnim, 280, delay).start();
    }
  }, [animated, delay, fadeAnim]);

  const containerClassName = useMemo(() => {
    const parts = [
      'rounded-3xl p-4',
      variantClassNames[variant],
      className ?? '',
    ];
    return parts.filter(Boolean).join(' ');
  }, [className, variant]);

  return (
    <Animated.View
      className={containerClassName}
      style={[style, animated && { opacity: fadeAnim }]}
    >
      {children}
    </Animated.View>
  );

  return <Animated.View style={containerStyle}>{children}</Animated.View>;
}
