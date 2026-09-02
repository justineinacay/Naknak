import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { PropsWithChildren, ReactNode } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, gradients, radius, shadows, spacing, typography } from '@/constants/theme';

export function BrandedBackdrop() {
  return (
    <View style={[StyleSheet.absoluteFill, styles.noPointerEvents, styles.backdrop]}>
      <LinearGradient
        colors={gradients.canvas}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.ambientRed} />
      <View style={styles.ambientGold} />
    </View>
  );
}

export function Screen({
  children,
  scroll = true,
  style,
  contentStyle,
}: PropsWithChildren<{
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}>) {
  if (!scroll) {
    return (
      <SafeAreaView style={[styles.screen, style]} edges={['top', 'bottom']}>
        <BrandedBackdrop />
        <View style={[styles.staticContent, contentStyle]}>{children}</View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, style]} edges={['top', 'bottom']}>
      <BrandedBackdrop />
      <ScrollView
        contentContainerStyle={[styles.scrollContent, contentStyle]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function LoadingScreen() {
  return (
    <Screen scroll={false} contentStyle={styles.loading}>
      <View style={styles.loadingLogoShell}>
        <Image source={require('../../assets/images/icon.png')} style={styles.loadingLogo} />
      </View>
      <ActivityIndicator size="small" color={colors.red} />
      <Text style={styles.loadingText}>Binubuksan ang NakNak…</Text>
    </Screen>
  );
}

export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <View style={[styles.brandMark, inverse && styles.brandMarkInverse]} accessible={false}>
      <Image
        source={require('../../assets/images/icon.png')}
        style={[styles.brandMarkImage, inverse && styles.brandMarkImageInverse]}
      />
    </View>
  );
}

export function PageHeader({
  title,
  description,
  onBack,
}: {
  title: string;
  description?: string;
  onBack?: () => void;
}) {
  return (
    <View style={styles.header}>
      {onBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Bumalik"
          hitSlop={8}
          onPress={onBack}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <MaterialCommunityIcons color={colors.redDark} name="arrow-left" size={25} />
        </Pressable>
      ) : null}
      <View style={styles.headerCopy}>
        <Text accessibilityRole="header" style={styles.pageTitle}>
          {title}
        </Text>
        {description ? <Text style={styles.pageDescription}>{description}</Text> : null}
      </View>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled = false,
  tone = 'red',
  accessibilityHint,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: 'red' | 'green' | 'neutral';
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const fillColors =
    tone === 'green' ? gradients.green : tone === 'neutral' ? gradients.surface : gradients.red;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        tone === 'green' && styles.primaryGreen,
        tone === 'neutral' && styles.primaryNeutral,
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <LinearGradient
        colors={fillColors}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={styles.primaryFill}
      >
        <Text style={[styles.primaryButtonText, tone === 'neutral' && styles.primaryNeutralText]}>
          {label}
        </Text>
      </LinearGradient>
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
  tone = 'neutral',
  style,
}: {
  label: string;
  onPress: () => void;
  tone?: 'neutral' | 'amber' | 'danger';
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.secondaryButton,
        tone === 'amber' && styles.secondaryAmber,
        tone === 'danger' && styles.secondaryDanger,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Text
        style={[
          styles.secondaryButtonText,
          tone === 'amber' && styles.secondaryAmberText,
          tone === 'danger' && styles.secondaryDangerText,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export function Field({
  label,
  error,
  inputStyle,
  ...props
}: TextInputProps & { label: string; error?: string; inputStyle?: StyleProp<TextStyle> }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[styles.inputShell, error && styles.inputError]}>
        <TextInput
          {...props}
          accessibilityLabel={label}
          placeholderTextColor={colors.inkMuted}
          style={[styles.input, inputStyle]}
        />
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export function ChoiceChip({
  label,
  selected,
  onPress,
  large = false,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
  large?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        large && styles.chipLarge,
        selected && styles.chipSelected,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

export function InfoPanel({
  title,
  children,
  tone = 'neutral',
  icon,
}: PropsWithChildren<{
  title: string;
  tone?: 'neutral' | 'green' | 'amber' | 'red' | 'blue';
  icon?: ReactNode;
}>) {
  return (
    <View
      style={[
        styles.infoPanel,
        tone === 'green' && styles.infoGreen,
        tone === 'amber' && styles.infoAmber,
        tone === 'red' && styles.infoRed,
        tone === 'blue' && styles.infoBlue,
      ]}
    >
      {icon ? <View style={styles.infoIcon}>{icon}</View> : null}
      <View style={styles.infoCopy}>
        <Text style={styles.infoTitle}>{title}</Text>
        <Text style={styles.infoBody}>{children}</Text>
      </View>
    </View>
  );
}

export function SectionTitle({ children }: PropsWithChildren) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background, overflow: 'hidden' },
  backdrop: { overflow: 'hidden' },
  noPointerEvents: { pointerEvents: 'none' },
  ambientRed: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    top: -150,
    right: -130,
    backgroundColor: 'rgba(255, 64, 70, 0.09)',
  },
  ambientGold: {
    position: 'absolute',
    width: 230,
    height: 230,
    borderRadius: 115,
    bottom: -150,
    left: -120,
    backgroundColor: 'rgba(246, 180, 61, 0.08)',
  },
  staticContent: { flex: 1, zIndex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl, zIndex: 1 },
  loading: { alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  loadingLogoShell: { width: 72, height: 72, borderRadius: 22, ...shadows.card },
  loadingLogo: { width: 72, height: 72, borderRadius: 22 },
  loadingText: { color: colors.ink, fontSize: 17, fontFamily: typography.medium },
  brandMark: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    overflow: 'hidden',
    ...shadows.card,
  },
  brandMarkInverse: { backgroundColor: colors.white },
  brandMarkImage: { width: '100%', height: '100%' },
  brandMarkImageInverse: { opacity: 0.96 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, paddingTop: spacing.md },
  headerCopy: { flex: 1, gap: spacing.xs },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.card,
  },
  pageTitle: { color: colors.ink, fontSize: 28, lineHeight: 32, fontFamily: typography.rounded, letterSpacing: -0.6 },
  pageDescription: { color: colors.inkMuted, fontSize: 15, lineHeight: 21, fontFamily: typography.regular },
  primaryButton: {
    minHeight: 56,
    borderRadius: radius.pill,
    ...shadows.raised,
  },
  primaryGreen: {},
  primaryNeutral: { borderWidth: 1, borderColor: colors.border },
  primaryFill: {
    flex: 1,
    minHeight: 56,
    width: '100%',
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  primaryButtonText: { color: colors.white, fontSize: 18, fontFamily: typography.rounded, textAlign: 'center' },
  primaryNeutralText: { color: colors.ink },
  secondaryButton: {
    minHeight: 50,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  secondaryAmber: { borderColor: '#D4A13C', backgroundColor: colors.amberSoft },
  secondaryDanger: { borderColor: colors.red, backgroundColor: colors.redSoft },
  secondaryButtonText: { color: colors.ink, fontSize: 16, fontFamily: typography.bold, textAlign: 'center' },
  secondaryAmberText: { color: colors.amberDark },
  secondaryDangerText: { color: colors.redDark },
  disabled: { opacity: 0.45, elevation: 0 },
  pressed: { opacity: 0.76, transform: [{ scale: 0.985 }] },
  field: { gap: 6 },
  fieldLabel: { color: colors.ink, fontSize: 16, fontFamily: typography.bold },
  inputShell: {
    minHeight: 54,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  input: {
    flex: 1,
    minHeight: 51,
    paddingHorizontal: spacing.lg,
    color: colors.ink,
    fontSize: 17,
    fontFamily: typography.regular,
  },
  inputError: { borderColor: colors.red },
  errorText: { color: colors.redDark, fontSize: 14, fontFamily: typography.medium },
  chip: {
    minHeight: 44,
    borderRadius: radius.pill,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipLarge: { minHeight: 52 },
  chipSelected: { backgroundColor: colors.redSoft, borderColor: colors.red },
  chipText: { color: colors.ink, fontSize: 16, fontFamily: typography.bold, textAlign: 'center' },
  chipTextSelected: { color: colors.redDark },
  infoPanel: {
    flexDirection: 'row',
    gap: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(227, 23, 34, 0.08)',
  },
  infoGreen: { backgroundColor: colors.greenSoft },
  infoAmber: { backgroundColor: colors.amberSoft },
  infoRed: { backgroundColor: colors.redSoft },
  infoBlue: { backgroundColor: colors.blueSoft },
  infoIcon: { paddingTop: 1 },
  infoCopy: { flex: 1, gap: spacing.xs },
  infoTitle: { color: colors.ink, fontSize: 16, fontFamily: typography.rounded },
  infoBody: { color: colors.inkMuted, fontSize: 15, lineHeight: 21, fontFamily: typography.regular },
  sectionTitle: { color: colors.ink, fontSize: 20, lineHeight: 25, fontFamily: typography.rounded, marginTop: spacing.sm },
});
