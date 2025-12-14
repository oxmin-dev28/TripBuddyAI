// TripBuddy AI Design System

export const Colors = {
  // Primary palette
  primary: '#1E3A8A',
  primaryDark: '#172554',
  primaryLight: '#3B82F6',
  
  // Accent
  accent: '#F97316',
  accentDark: '#EA580C',
  accentLight: '#FB923C',
  
  // Status
  success: '#10B981',
  successLight: '#34D399',
  warning: '#FBBF24',
  error: '#EF4444',
  errorLight: '#FEE2E2',
  
  // Neutrals
  background: '#F8FAFC',
  surface: '#FFFFFF',
  surfaceAlt: '#F1F5F9',
  border: '#E2E8F0',
  
  // Text
  textPrimary: '#0F172A',
  textSecondary: '#475569',
  textMuted: '#94A3B8',
  textOnPrimary: '#FFFFFF',
  textOnAccent: '#FFFFFF',
  
  // Overlays
  overlay: 'rgba(15, 23, 42, 0.5)',
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


