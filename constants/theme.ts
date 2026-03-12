/**
 * Snapsy design system – Unified Visual Identity
 * 8pt base grid, premium aesthetics, linear/solid icon convention
 */

import { Platform } from 'react-native';

// Brand Tokens
export const PRIMARY = '#6CF073';
export const PRIMARY_DARK = '#3DB844';
export const PRIMARY_DEEP = '#1A5E1F';
export const PRIMARY_LIGHT = '#EAFBEB';
export const PRIMARY_MID = '#B8F5BB';

// Semantic Tokens
export const SUCCESS = '#3DB844';
export const SUCCESS_LIGHT = '#EAFBEB';
export const ERROR = '#E53935';
export const ERROR_LIGHT = '#FDECEA';
export const WARNING = '#F59E0B';
export const WARNING_LIGHT = '#FFFBEB';

// Backgrounds & Surfaces
export const BACKGROUND_LIGHT = '#FFFFFF';
export const BACKGROUND_DARK = '#0F110F';
export const SURFACE_DARK = '#1C1F1C';
export const BORDER_DARK = '#3A3E3A';

// Neutrals
export const G50 = '#F7F8F7';
export const G100 = '#EFF0EF';
export const G200 = '#D9DBD9'; // Borders
export const G300 = '#B8BCB8';
export const G400 = '#8E948E'; // Icons disabled / Text secondary
export const G500 = '#636863';
export const G600 = '#454945';
export const G700 = '#2E322E';
export const G800 = '#1C1F1C';
export const G900 = '#0F110F';

const tintColorLight = PRIMARY_DEEP;
const tintColorDark = PRIMARY;

export const Colors = {
  light: {
    text: G900,
    textSecondary: G500,
    background: BACKGROUND_LIGHT,
    surface: G50,
    surfaceHighlight: G100,
    border: G200,
    tint: tintColorLight,
    icon: G500,
    tabIconDefault: G400,
    tabIconSelected: PRIMARY_DEEP,
    primary: PRIMARY,
    primaryBase: G900,
    error: ERROR,
    success: SUCCESS,
    warning: WARNING,
  },
  dark: {
    text: '#ECEDEE',
    textSecondary: G400,
    background: BACKGROUND_DARK,
    surface: SURFACE_DARK,
    surfaceHighlight: '#233B1E',
    border: BORDER_DARK,
    tint: tintColorDark,
    icon: G600,
    tabIconDefault: G600,
    tabIconSelected: PRIMARY,
    primary: PRIMARY,
    primaryBase: PRIMARY_DEEP,
    error: ERROR,
    success: SUCCESS,
    warning: WARNING,
  },
};

// 8pt base grid
export const SPACING = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  full: 9999,
} as const;

// Typography – Satoshi (Configured for project)
export const Fonts = {
  light: 'Satoshi-Light',
  regular: 'Satoshi-Regular',
  medium: 'Satoshi-Medium',
  bold: 'Satoshi-Bold',
  ...Platform.select({
    ios: {
      sans: 'system-ui',
    },
    default: {
      sans: 'normal',
    },
    web: {
      sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    },
  }) as Record<string, string>,
};
