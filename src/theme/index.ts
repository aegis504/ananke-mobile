export const Colors = {
  // Warm Ananke palette
  background: '#FBF7F0',
  surface: '#FFFFFF',
  border: '#E8DCC4',
  borderLight: '#F0E8D8',

  // Text
  textPrimary: '#1A1A1A',
  textSecondary: '#666666',
  textMuted: '#999999',

  // Brand
  primary: '#1A1A2E',
  primaryLight: '#2D2D4E',
  accent: '#E8A830',
  accentLight: '#F5C842',

  // Status
  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Priority colors
  priorityHigh: '#EF4444',
  priorityMedium: '#F59E0B',
  priorityLow: '#22C55E',

  // Mode
  digital: '#8B5CF6',
  physical: '#3B82F6',

  // Tab bar
  tabActive: '#1A1A2E',
  tabInactive: '#999999',
  tabBar: '#FFFFFF',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const Typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: Colors.textPrimary },
  h2: { fontSize: 22, fontWeight: '700' as const, color: Colors.textPrimary },
  h3: { fontSize: 18, fontWeight: '600' as const, color: Colors.textPrimary },
  body: { fontSize: 15, fontWeight: '400' as const, color: Colors.textPrimary },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, color: Colors.textSecondary },
  caption: { fontSize: 11, fontWeight: '500' as const, color: Colors.textMuted },
  label: { fontSize: 12, fontWeight: '600' as const, color: Colors.textSecondary },
};

export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
