// TripBuddy AI Design System

export const Colors = {
  // Core palette (restricted to the four approved tones)
  background: '#F5F8FC',
  surface: '#F5F8FC',
  surfaceAlt: '#1E2A44',
  border: '#1E2A44',

  primary: '#1E2A44',
  primaryDark: '#141D2D',
  primaryLight: '#0E141E',

  accent: '#1E2A44',
  accentDark: '#141D2D',
  accentLight: '#0E141E',

  // Status mapped to the approved palette to avoid extra colors
  success: '#1E2A44',
  successLight: '#1E2A44',
  warning: '#141D2D',
  error: '#141D2D',
  errorLight: '#F5F8FC',

  // Text
  textPrimary: '#0E141E',
  textSecondary: '#141D2D',
  textMuted: '#1E2A44',
  textOnPrimary: '#F5F8FC',
  textOnAccent: '#F5F8FC',

  // Overlays
  overlay: 'rgba(14, 20, 30, 0.5)',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const FontSize = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  display: 40,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// Shadows removed - use inline styles instead
// Example: shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3


