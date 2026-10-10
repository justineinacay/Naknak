import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Image, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, gradients, radius, shadows, spacing, typography } from '@/constants/theme';
import { useNakNak } from '@/context/naknak-context';
import { Language } from '@/types/naknak';

const LANGUAGES: { id: Language; label: string }[] = [
  { id: 'tl', label: 'Filipino' },
  { id: 'en', label: 'English' },
  { id: 'ceb', label: 'Bisaya' },
];

const FAMILY_DASHBOARD_URL = 'https://justineinacay.github.io/Naknak/dashboard.html';

const TEXT = {
  tl: {
    eyebrow: 'NakNak para sa Senior / PWD',
    title: 'Safety app na simple gamitin kapag kailangan mo ng tulong.',
    body: 'Ang mobile app na ito ay para sa Senior/PWD. Ang Caregiver / Anak tools ay nasa hiwalay na Family Dashboard para hindi maging magulo ang emergency screen.',
    setup: 'I-set up ang phone na ito',
    setupDetail: 'SOS, Ayos Ako, tawag, contacts, gamot, at accessibility settings',
    caregiver: 'Caregiver / Anak ka ba?',
    caregiverDetail: 'Buksan ang NakNak Family Dashboard sa browser para sa pairing at family status.',
    dashboard: 'Buksan ang Family Dashboard',
    footer: 'LIGTAS · SIMPLE · PANG-PAMILYA',
  },
  en: {
    eyebrow: 'NakNak for Senior / PWD',
    title: 'A safety app designed to stay simple when you need help.',
    body: 'This mobile app is for the Senior/PWD user. Caregiver / Anak tools live in a separate Family Dashboard so the emergency experience stays uncluttered.',
    setup: 'Set up this phone',
    setupDetail: 'SOS, I’m Okay, calling, contacts, medicine, and accessibility settings',
    caregiver: 'Are you a Caregiver / Anak?',
    caregiverDetail: 'Open the NakNak Family Dashboard in your browser for pairing and family status.',
    dashboard: 'Open Family Dashboard',
    footer: 'SAFE · SIMPLE · FOR FAMILY',
  },
  ceb: {
    eyebrow: 'NakNak para sa Senior / PWD',
    title: 'Safety app nga sayon gamiton kung kinahanglan ka ug tabang.',
    body: 'Kini nga mobile app para sa Senior/PWD. Ang Caregiver / Anak tools naa sa lahi nga Family Dashboard aron dili maghuot ang emergency screen.',
    setup: 'I-set up kini nga phone',
    setupDetail: 'SOS, Okay Ra Ko, tawag, contacts, tambal, ug accessibility settings',
    caregiver: 'Caregiver / Anak ka?',
    caregiverDetail: 'Ablihi ang NakNak Family Dashboard sa browser para sa pairing ug family status.',
    dashboard: 'Ablihi ang Family Dashboard',
    footer: 'LIG-ON · SAYON · PARA SA PAMILYA',
  },
};

export default function EntryScreen() {
  const { state, loading, setLanguage, startRole } = useNakNak();
  const copy = TEXT[state.profile.language];

  useEffect(() => {
    if (!loading && state.profile.onboarded && state.profile.role === 'senior_pwd') {
      router.replace('/senior/home');
    }
  }, [loading, state.profile.onboarded, state.profile.role]);

  const startSeniorSetup = () => {
    startRole('senior_pwd');
    router.push('/onboarding/name');
  };

  const openDashboard = async () => {
    await Linking.openURL(FAMILY_DASHBOARD_URL);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <LinearGradient
        colors={gradients.redDark}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <View pointerEvents="none" style={styles.ambientGlow} />
      <View pointerEvents="none" style={styles.foldLight} />

      <View style={styles.top}>
        <View style={styles.brandRow}>
          <View style={styles.logoShell}>
            <Image
              accessibilityIgnoresInvertColors
              accessibilityLabel="NakNak"
              source={require('../../assets/images/icon.png')}
              style={styles.logo}
            />
          </View>
          <View style={styles.brandCopy}>
            <Text style={styles.brand}>NakNak</Text>
            <Text style={styles.eyebrow}>{copy.eyebrow}</Text>
          </View>
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
      </View>

      <View style={styles.main}>
        <View style={styles.intro}>
          <Text accessibilityRole="header" style={styles.title}>
            {copy.title}
          </Text>
          <Text style={styles.body}>{copy.body}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={copy.setup + '. ' + copy.setupDetail}
          onPress={startSeniorSetup}
          style={({ pressed }) => [styles.primaryCard, pressed && styles.pressed]}
        >
          <View style={styles.primaryIcon}>
            <MaterialCommunityIcons color={colors.red} name="human-cane" size={30} />
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.primaryTitle}>{copy.setup}</Text>
            <Text style={styles.primaryBody}>{copy.setupDetail}</Text>
          </View>
          <MaterialCommunityIcons color={colors.redDark} name="chevron-right" size={28} />
        </Pressable>

        <View style={styles.caregiverCard}>
          <View style={styles.caregiverHeading}>
            <View style={styles.caregiverIcon}>
              <MaterialCommunityIcons color={colors.amberDark} name="account-heart" size={24} />
            </View>
            <View style={styles.cardCopy}>
              <Text style={styles.caregiverTitle}>{copy.caregiver}</Text>
              <Text style={styles.caregiverBody}>{copy.caregiverDetail}</Text>
            </View>
          </View>
          <Pressable
            accessibilityRole="link"
            accessibilityLabel={copy.dashboard}
            onPress={openDashboard}
            style={({ pressed }) => [styles.dashboardButton, pressed && styles.pressed]}
          >
            <MaterialCommunityIcons color={colors.redDark} name="open-in-new" size={20} />
            <Text style={styles.dashboardLabel}>{copy.dashboard}</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.footer}>{copy.footer}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    overflow: 'hidden',
    backgroundColor: colors.black,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  ambientGlow: {
    position: 'absolute',
    width: 420,
    height: 420,
    borderRadius: 210,
    top: -250,
    right: -170,
    backgroundColor: 'rgba(255, 80, 84, 0.22)',
  },
  foldLight: {
    position: 'absolute',
    width: 320,
    height: 580,
    right: -230,
    top: 120,
    backgroundColor: 'rgba(255,255,255,0.04)',
    transform: [{ rotate: '24deg' }],
  },
  top: { gap: spacing.lg },
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  logoShell: { width: 64, height: 64, borderRadius: 19, ...shadows.sos },
  logo: { width: 64, height: 64, borderRadius: 19 },
  brandCopy: { flex: 1, gap: 2 },
  brand: {
    color: colors.white,
    fontSize: 34,
    lineHeight: 38,
    fontFamily: typography.rounded,
    letterSpacing: -0.9,
  },
  eyebrow: {
    color: '#FFD8D3',
    fontSize: 13,
    lineHeight: 18,
    fontFamily: typography.bold,
  },
  languageRow: { flexDirection: 'row', gap: spacing.sm },
  languageButton: {
    minHeight: 44,
    flex: 1,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  languageButtonSelected: { backgroundColor: colors.white, borderColor: colors.white },
  languageLabel: { color: '#FFE0DC', fontSize: 13, fontFamily: typography.bold },
  languageLabelSelected: { color: colors.redDark },
  main: { flex: 1, justifyContent: 'center', gap: spacing.md, paddingVertical: spacing.md },
  intro: { gap: spacing.sm, marginBottom: spacing.sm },
  title: {
    color: colors.white,
    fontSize: 30,
    lineHeight: 35,
    fontFamily: typography.rounded,
    letterSpacing: -0.7,
  },
  body: { color: '#F3CBC6', fontSize: 15, lineHeight: 21, fontFamily: typography.regular },
  primaryCard: {
    minHeight: 108,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    borderRadius: 23,
    backgroundColor: colors.white,
    padding: spacing.lg,
    ...shadows.raised,
  },
  primaryIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.redSoft,
  },
  cardCopy: { flex: 1, gap: 4 },
  primaryTitle: { color: colors.ink, fontSize: 19, lineHeight: 23, fontFamily: typography.rounded },
  primaryBody: { color: colors.inkMuted, fontSize: 14, lineHeight: 19, fontFamily: typography.regular },
  caregiverCard: {
    gap: spacing.md,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(57, 3, 9, 0.68)',
    padding: spacing.lg,
  },
  caregiverHeading: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  caregiverIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF2D6',
  },
  caregiverTitle: { color: colors.white, fontSize: 17, lineHeight: 21, fontFamily: typography.rounded },
  caregiverBody: { color: '#EFCAC5', fontSize: 14, lineHeight: 19, fontFamily: typography.regular },
  dashboardButton: {
    minHeight: 48,
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
    backgroundColor: colors.white,
  },
  dashboardLabel: { color: colors.redDark, fontSize: 15, fontFamily: typography.bold },
  footer: {
    color: '#D69B95',
    fontSize: 11,
    letterSpacing: 1.15,
    fontFamily: typography.bold,
    textAlign: 'center',
    paddingTop: spacing.sm,
  },
  pressed: { opacity: 0.75, transform: [{ scale: 0.99 }] },
});