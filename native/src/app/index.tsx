import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { ComponentProps, useEffect } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { COPY } from '@/constants/copy';
import { colors, gradients, radius, shadows, spacing, typography } from '@/constants/theme';
import { useNakNak } from '@/context/naknak-context';
import { Language, Role } from '@/types/naknak';

const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'tl', label: 'Filipino' },
  { id: 'en', label: 'English' },
  { id: 'ceb', label: 'Bisaya' },
];

export default function RoleSelectionScreen() {
  const { state, loading, setLanguage, startRole } = useNakNak();
  const copy = COPY[state.profile.language];
  const tagline = state.profile.language === 'en'
    ? 'Safety and support, always within reach.'
    : state.profile.language === 'ceb'
      ? 'Tabang ug pag-atiman, kanunay duol.'
      : 'Tulong at alaga, laging abot-kamay.';
  const footer = state.profile.language === 'en'
    ? 'SAFE · SIMPLE · FOR FAMILY'
    : state.profile.language === 'ceb'
      ? 'LIG-ON · SAYON · PARA SA PAMILYA'
      : 'LIGTAS · SIMPLE · PANG-PAMILYA';

  useEffect(() => {
    if (!loading && state.profile.onboarded) {
      router.replace(state.profile.role === 'caregiver' ? '/caregiver/home' : '/senior/home');
    }
  }, [loading, state.profile.onboarded, state.profile.role]);

  const chooseRole = (role: Role) => {
    startRole(role);
    router.push('/onboarding/name');
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <LinearGradient
        colors={gradients.redDark}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={[styles.ambientGlow, styles.noPointerEvents]} />
      <View style={[styles.foldLight, styles.noPointerEvents]} />
      <View style={styles.brandArea}>
        <View style={styles.logoShell}>
          <Image
            accessibilityIgnoresInvertColors
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
          />
        </View>
        <Text style={styles.brand}>NakNak</Text>
        <Text style={styles.tagline}>{tagline}</Text>
      </View>

      <View accessibilityRole="radiogroup" style={styles.languageRow}>
        {LANGUAGES.map((language) => {
          const selected = state.profile.language === language.id;
          return (
            <Pressable
              key={language.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              onPress={() => setLanguage(language.id)}
              style={({ pressed }) => [
                styles.languageButton,
                selected && styles.languageButtonSelected,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.languageLabel, selected && styles.languageLabelSelected]}>
                {language.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.roleArea}>
        <Text accessibilityRole="header" style={styles.question}>
          {copy.roleQuestion}
        </Text>

        <RoleButton
          icon="human-cane"
          title={copy.seniorRole}
          description={copy.seniorRoleDescription}
          onPress={() => chooseRole('senior_pwd')}
        />
        <RoleButton
          icon="account-heart"
          title={copy.caregiverRole}
          description={copy.caregiverRoleDescription}
          onPress={() => chooseRole('caregiver')}
        />
      </View>

      <Text style={styles.footer}>{footer}</Text>
    </SafeAreaView>
  );
}

function RoleButton({
  icon,
  title,
  description,
  onPress,
}: {
  icon: ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  description: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}. ${description}`}
      onPress={onPress}
      style={({ pressed }) => [styles.roleButton, pressed && styles.pressed]}
    >
      <LinearGradient colors={gradients.surface} style={styles.roleIcon}>
        <MaterialCommunityIcons color={colors.red} name={icon} size={28} />
      </LinearGradient>
      <View style={styles.roleCopy}>
        <Text style={styles.roleTitle}>{title}</Text>
        <Text style={styles.roleDescription}>{description}</Text>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.black,
    overflow: 'hidden',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  noPointerEvents: { pointerEvents: 'none' },
  ambientGlow: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    top: -270,
    right: -180,
    backgroundColor: 'rgba(255, 80, 84, 0.22)',
  },
  foldLight: {
    position: 'absolute',
    width: 300,
    height: 520,
    right: -210,
    top: 130,
    backgroundColor: 'rgba(255,255,255,0.045)',
    transform: [{ rotate: '24deg' }],
  },
  brandArea: { alignItems: 'center', gap: spacing.sm, marginTop: spacing.lg },
  logoShell: { width: 82, height: 82, borderRadius: 24, ...shadows.sos },
  logo: { width: 82, height: 82, borderRadius: 24 },
  brand: { color: colors.white, fontSize: 42, lineHeight: 46, fontFamily: typography.rounded, letterSpacing: -1.2 },
  tagline: { color: '#FFE0DC', fontSize: 16, fontFamily: typography.regular, textAlign: 'center' },
  languageRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.xl },
  languageButton: {
    minHeight: 44,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.26)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  languageButtonSelected: { backgroundColor: colors.white, borderColor: colors.white },
  languageLabel: { color: '#FFE0DC', fontSize: 14, fontFamily: typography.bold },
  languageLabelSelected: { color: colors.redDark },
  roleArea: { flex: 1, justifyContent: 'center', gap: spacing.md },
  question: { color: colors.white, fontSize: 25, lineHeight: 30, fontFamily: typography.rounded, letterSpacing: -0.4, marginBottom: spacing.xs },
  roleButton: {
    minHeight: 104,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.18)',
    borderRadius: 22,
    padding: spacing.lg,
    backgroundColor: 'rgba(57, 3, 9, 0.72)',
    ...shadows.card,
  },
  roleIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    ...shadows.raised,
  },
  roleCopy: { flex: 1, gap: spacing.xs },
  roleTitle: { color: colors.white, fontSize: 18, lineHeight: 22, fontFamily: typography.rounded },
  roleDescription: { color: '#EFCAC5', fontSize: 14, lineHeight: 19, fontFamily: typography.regular },
  chevron: { color: colors.white, fontSize: 34, fontWeight: '400' },
  footer: { color: '#D69B95', fontSize: 11, letterSpacing: 1.2, fontFamily: typography.bold, textAlign: 'center' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.99 }] },
});
