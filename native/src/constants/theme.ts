import { Platform, ViewStyle } from 'react-native';

export const colors = {
  background: '#FFF8F5',
  surface: '#FFFFFF',
  surfaceMuted: '#FFF0EC',
  ink: '#2B1111',
  inkMuted: '#765755',
  border: '#EFCBC6',
  red: '#E31722',
  redBright: '#FF3340',
  redDark: '#A50612',
  redDeep: '#68020A',
  redSoft: '#FFE8E6',
  green: '#209B57',
  greenBright: '#35C46F',
  greenDark: '#126438',
  greenSoft: '#E5F7EC',
  amber: '#B87509',
  amberDark: '#714400',
  amberSoft: '#FFF3D4',
  blue: '#17697B',
  blueSoft: '#E8F5F8',
  white: '#FFFFFF',
  black: '#1A0608',
} as const;

export const gradients = {
  canvas: ['#FFFDFC', '#FFF7F3', '#FFEDE9'] as const,
  red: ['#FF3A45', '#E31722', '#AE0714'] as const,
  redDark: ['#3A0208', '#780711', '#B90A18'] as const,
  green: ['#37C675', '#209B57', '#167543'] as const,
  amber: ['#FFF9EA', '#FFF0C7'] as const,
  surface: ['#FFFFFF', '#FFF9F7'] as const,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 16,
  pill: 999,
} as const;

export const typography = {
  regular: 'Nunito_600SemiBold',
  medium: 'Nunito_700Bold',
  bold: 'Nunito_800ExtraBold',
  rounded: 'Nunito_900Black',
} as const;

export const shadows = {
  sos: Platform.select({
    ios: {
      shadowColor: colors.redDark,
      shadowOpacity: 0.3,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 6 },
    },
    android: { elevation: 8 },
    default: { boxShadow: '0 16px 34px rgba(157, 4, 15, 0.34)' } as ViewStyle,
  }),
  raised: Platform.select({
    ios: {
      shadowColor: colors.black,
      shadowOpacity: 0.1,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 3 },
    },
    android: { elevation: 3 },
    default: { boxShadow: '0 8px 20px rgba(91, 20, 18, 0.14)' } as ViewStyle,
  }),
  card: Platform.select({
    ios: {
      shadowColor: '#6C1A17',
      shadowOpacity: 0.11,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 7 },
    },
    android: { elevation: 4 },
    default: { boxShadow: '0 10px 28px rgba(91, 20, 18, 0.11)' } as ViewStyle,
  }),
  nav: Platform.select({
    ios: {
      shadowColor: '#5A1714',
      shadowOpacity: 0.12,
      shadowRadius: 15,
      shadowOffset: { width: 0, height: -5 },
    },
    android: { elevation: 12 },
    default: { boxShadow: '0 -8px 24px rgba(91, 20, 18, 0.11)' } as ViewStyle,
  }),
} as const;
