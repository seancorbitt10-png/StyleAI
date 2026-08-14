export const tokens = {
  color: {
    bg: '#F4EFE8',
    surface: '#FFFcf7',
    ink: '#1C1917',
    muted: '#78716C',
    line: '#E7E0D8',
    accent: '#1C1917',
    accentOn: '#F4EFE8',
    danger: '#B42318',
    success: '#3F6212',
  },
  space: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 40,
    xxxl: 64,
  },
  radius: {
    sm: 8,
    md: 14,
    lg: 22,
    pill: 999,
  },
  type: {
    display: 40,
    title: 28,
    heading: 20,
    body: 16,
    caption: 13,
  },
  shadow: {
    card: {
      shadowColor: '#1C1917',
      shadowOpacity: 0.06,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
  },
} as const;

export type Tokens = typeof tokens;
