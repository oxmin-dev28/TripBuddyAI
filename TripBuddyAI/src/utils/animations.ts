import { Animated } from 'react-native';

export const hapticBounce = (value: Animated.Value) => {
  Animated.sequence([
    Animated.spring(value, {
      toValue: 0.98,
      tension: 120,
      friction: 12,
      useNativeDriver: true,
    }),
    Animated.spring(value, {
      toValue: 1,
      tension: 140,
      friction: 14,
      useNativeDriver: true,
    }),
  ]).start();
};

export const fadeIn = (value: Animated.Value, duration = 320, delay = 0) =>
  Animated.timing(value, {
    toValue: 1,
    duration,
    delay,
    useNativeDriver: true,
  });
