// ─── SNAPSY DESIGN TOKENS ────────────────────────────────────────────────────
// Place this file at: constants/tokens.ts
// Import as: import { colors, spacing, radii, typography, shadows } from '@/constants/tokens'

export const colors = {
  // Brand
  primary:      '#6CF073',
  primaryDark:  '#3DB844',
  primaryDeep:  '#1A5E1F',
  primaryLight: '#EAFBEB',
  primaryMid:   '#B8F5BB',

  // Neutrals
  white:   '#FFFFFF',
  grey50:  '#F7F8F7',
  grey100: '#EFF0EF',
  grey200: '#D9DBD9',
  grey300: '#B8BCB8',
  grey400: '#8E948E',
  grey500: '#636863',
  grey600: '#454945',
  grey700: '#2E322E',
  grey800: '#1C1F1C',
  grey900: '#0F110F',

  // Semantic
  success:      '#3DB844',
  successLight: '#EAFBEB',
  error:        '#E53935',
  errorLight:   '#FDECEA',
  errorDark:    '#7B1F1F',
  warning:      '#F59E0B',
  warningLight: '#FFFBEB',
  info:         '#2196F3',
  infoLight:    '#E3F2FD',

  // App surfaces (Snapsy is light-only)
  // These keys keep their names for compatibility but now map to light values.
  darkBg:       '#F7F8F7', // use light background instead of true dark
  darkSurface:  '#FFFFFF',
  darkSurface2: '#EFF0EF',
  darkBorder:   '#D9DBD9',
} as const;

// 8pt grid — base unit is 4px
export const spacing = {
  0:    0,
  0.5:  2,
  1:    4,
  1.5:  6,
  2:    8,
  2.5:  10,
  3:    12,
  3.5:  14,
  4:    16,
  5:    20,
  6:    24,
  7:    28,
  8:    32,
  9:    36,
  10:   40,
  11:   44,
  12:   48,
  14:   56,
  16:   64,
  20:   80,
  24:   96,
} as const;

export const radii = {
  none:  0,
  xs:    4,
  sm:    8,
  md:    12,
  lg:    16,
  xl:    20,
  '2xl': 24,
  '3xl': 32,
  full:  9999,
} as const;

export const typography = {
  // Map to font files in /Fonts folder
  fontFamily: {
    regular:   'PlusJakartaSans-Regular',
    medium:    'PlusJakartaSans-Medium',
    semibold:  'PlusJakartaSans-SemiBold',
    bold:      'PlusJakartaSans-Bold',
    extrabold: 'PlusJakartaSans-ExtraBold',
  },
  size: {
    xs:    11,
    sm:    12,
    base:  14,
    md:    15,
    lg:    16,
    xl:    18,
    '2xl': 20,
    '3xl': 24,
    '4xl': 28,
    '5xl': 32,
    '6xl': 40,
  },
  weight: {
    regular:   '400' as const,
    medium:    '500' as const,
    semibold:  '600' as const,
    bold:      '700' as const,
    extrabold: '800' as const,
  },
  lineHeight: {
    tight:   1.2,
    snug:    1.35,
    normal:  1.5,
    relaxed: 1.65,
  },
} as const;

export const shadows = {
  none: {},
  sm: {
    shadowColor:  '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius:  3,
    elevation:     2,
  },
  md: {
    shadowColor:  '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius:  12,
    elevation:     4,
  },
  lg: {
    shadowColor:  '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius:  24,
    elevation:     8,
  },
  xl: {
    shadowColor:  '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius:  40,
    elevation:     16,
  },
  primary: {
    shadowColor:  '#6CF073',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius:  24,
    elevation:     8,
  },
  primarySm: {
    shadowColor:  '#6CF073',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius:  12,
    elevation:     4,
  },
} as const;

// Minimum tap target (iOS HIG + Android Material)
export const TAP_TARGET = 44;

// Icon sizes for consistent usage
export const iconSize = {
  xs:    12,  // inline text
  sm:    16,  // inputs
  md:    18,  // list items
  lg:    20,  // buttons, tabs
  xl:    22,  // active tab
  '2xl': 24,  // section headers
  '3xl': 32,  // empty states
  '4xl': 40,  // hero
} as const;
