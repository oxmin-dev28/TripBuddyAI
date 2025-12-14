import { Animated, Easing } from 'react-native';

/**
 * Apple-style animation presets
 * These match the easing curves used in iOS
 */

export const AnimationPresets = {
  // Standard spring animation (similar to iOS default)
  spring: {
    tension: 100,
    friction: 10,
    useNativeDriver: true,
  },
  
  // Smooth spring (softer than standard)
  smoothSpring: {
    tension: 40,
    friction: 7,
    useNativeDriver: true,
  },
  
  // Bouncy spring
  bouncySpring: {
    tension: 100,
    friction: 5,
    useNativeDriver: true,
  },
};

export const EasingPresets = {
  // iOS default easing
  standard: Easing.bezier(0.4, 0.0, 0.2, 1),
  
  // Accelerate (starts slow, ends fast)
  accelerate: Easing.bezier(0.4, 0.0, 1, 1),
  
  // Decelerate (starts fast, ends slow)
  decelerate: Easing.bezier(0.0, 0.0, 0.2, 1),
  
  // Sharp (quick in and out)
  sharp: Easing.bezier(0.4, 0.0, 0.6, 1),
  
  // Smooth (iOS spring-like cubic bezier)
  smooth: Easing.bezier(0.25, 0.1, 0.25, 1),
};

/**
 * Fade in animation
 */
export const fadeIn = (
  animatedValue: Animated.Value,
  duration: number = 300,
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 1,
    duration,
    delay,
    easing: EasingPresets.standard,
    useNativeDriver: true,
  });
};

/**
 * Fade out animation
 */
export const fadeOut = (
  animatedValue: Animated.Value,
  duration: number = 200,
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue: 0,
    duration,
    delay,
    easing: EasingPresets.sharp,
    useNativeDriver: true,
  });
};

/**
 * Scale animation (for cards, buttons, etc.)
 */
export const scaleIn = (
  animatedValue: Animated.Value,
  toValue: number = 1,
  duration: number = 300
): Animated.CompositeAnimation => {
  return Animated.spring(animatedValue, {
    toValue,
    ...AnimationPresets.smoothSpring,
  });
};

/**
 * Slide animation (for screens, modals)
 */
export const slideIn = (
  animatedValue: Animated.Value,
  fromValue: number,
  toValue: number = 0,
  duration: number = 400
): Animated.CompositeAnimation => {
  animatedValue.setValue(fromValue);
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing: EasingPresets.smooth,
    useNativeDriver: true,
  });
};

/**
 * Bounce animation (for confirmations, errors)
 */
export const bounce = (
  animatedValue: Animated.Value,
  toValue: number = 1.1,
  duration: number = 200
): Animated.CompositeAnimation => {
  return Animated.sequence([
    Animated.timing(animatedValue, {
      toValue,
      duration: duration / 2,
      easing: EasingPresets.accelerate,
      useNativeDriver: true,
    }),
    Animated.spring(animatedValue, {
      toValue: 1,
      ...AnimationPresets.bouncySpring,
    }),
  ]);
};

/**
 * Pulse animation (for loading, notifications)
 */
export const pulse = (
  animatedValue: Animated.Value,
  minValue: number = 0.95,
  maxValue: number = 1.05,
  duration: number = 1000
): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: maxValue,
        duration: duration / 2,
        easing: EasingPresets.smooth,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: minValue,
        duration: duration / 2,
        easing: EasingPresets.smooth,
        useNativeDriver: true,
      }),
    ])
  );
};

/**
 * Staggered animation (for lists)
 */
export const staggered = (
  animatedValues: Animated.Value[],
  staggerDelay: number = 50,
  animation: (value: Animated.Value, index: number) => Animated.CompositeAnimation
): Animated.CompositeAnimation => {
  return Animated.stagger(
    staggerDelay,
    animatedValues.map((value, index) => animation(value, index))
  );
};

/**
 * Parallax effect helper
 */
export const createParallax = (
  scrollY: Animated.Value,
  factor: number = 0.5
) => {
  return scrollY.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [-100 * factor, 0, 100 * factor],
    extrapolate: 'extend',
  });
};

/**
 * Create haptic-like bounce for buttons
 */
export const hapticBounce = (animatedValue: Animated.Value): void => {
  Animated.sequence([
    Animated.timing(animatedValue, {
      toValue: 0.95,
      duration: 100,
      easing: EasingPresets.sharp,
      useNativeDriver: true,
    }),
    Animated.spring(animatedValue, {
      toValue: 1,
      ...AnimationPresets.bouncySpring,
      friction: 4,
    }),
  ]).start();
};

