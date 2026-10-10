import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { InfoPanel, PrimaryButton, Screen, SecondaryButton } from '@/components/ui';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { useNakNak } from '@/context/naknak-context';

const FAMILY_DASHBOARD_URL = 'https://justineinacay.github.io/Naknak/dashboard.html';

export default function CaregiverHomeScreen() {
  const { state, resetApp, startRole } = useNakNak();

  const text = state.profile.language === 'en'
    ? {
        title: 'Caregiver tools moved to NakNak Family',
        body: 'The native app is now focused on the Senior/PWD user. Pairing, household setup, device management, and family status belong in the web Family Dashboard.',
        dashboard: 'Open Family Dashboard',
        switchTitle: 'Using this phone for the Senior/PWD?',
        switchBody: 'You can reset this beta profile and set the phone up as the Senior/PWD safety device.',
        switch: 'Set up as Senior / PWD',
      }
    : state.profile.language === 'ceb'
      ? {
          title: 'Ang Caregiver tools naa na sa NakNak Family',
          body: 'Ang native app gi-focus na sa Senior/PWD user. Ang pairing, household setup, device management, ug family status naa sa web Family Dashboard.',
          dashboard: 'Ablihi ang Family Dashboard',
          switchTitle: 'Para ba sa Senior/PWD kini nga phone?',
          switchBody: 'Mahimo nimong i-reset ang beta profile ug i-set up kini isip Senior/PWD safety device.',
          switch: 'I-set up isip Senior / PWD',
        }
      : {
          title: 'Nasa NakNak Family na ang Caregiver tools',
          body: 'Ang native app ay nakatuon na sa Senior/PWD user. Ang pairing, household setup, device management, at family status ay nasa web Family Dashboard.',
          dashboard: 'Buksan ang Family Dashboard',
          switchTitle: 'Para ba sa Senior/PWD ang phone na ito?',
          switchBody: 'Maaari mong i-reset ang beta profile at i-set up ito bilang Senior/PWD safety device.',
          switch: 'I-set up bilang Senior / PWD',
        };

  const switchToSenior = async () => {
    await resetApp();
    startRole('senior_pwd');
    router.replace('/onboarding/name');
  };

  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <View style={styles.hero}>
        <View style={styles.icon}>
          <MaterialCommunityIcons color={colors.redDark} name="account-heart" size={32} />
        </View>
        <Text accessibilityRole="header" style={styles.title}>{text.title}</Text>
        <Text style={styles.body}>{text.body}</Text>
      </View>

      <View style={styles.main}>
        <PrimaryButton
          label={text.dashboard}
          onPress={() => Linking.openURL(FAMILY_DASHBOARD_URL)}
        />

        <InfoPanel title={text.switchTitle} tone="neutral">
          {text.switchBody}
        </InfoPanel>
        <SecondaryButton label={text.switch} onPress={switchToSenior} />
      </View>

      <Text style={styles.note}>
        NakNak keeps the emergency phone experience separate from caregiver management so critical controls remain simple and easy to find.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingVertical: spacing.xl, gap: spacing.xl },
  hero: { alignItems: 'center', gap: spacing.md, paddingTop: spacing.xl },
  icon: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.redSoft,
    borderWidth: 1,
    borderColor: 'rgba(227,23,34,0.12)',
    ...shadows.card,
  },
  title: {
    color: colors.ink,
    fontSize: 29,
    lineHeight: 34,
    fontFamily: typography.rounded,
    letterSpacing: -0.7,
    textAlign: 'center',
  },
  body: { color: colors.inkMuted, fontSize: 16, lineHeight: 23, fontFamily: typography.regular, textAlign: 'center' },
  main: { flex: 1, justifyContent: 'center', gap: spacing.md },
  note: {
    color: colors.inkMuted,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: typography.regular,
    textAlign: 'center',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    padding: spacing.md,
  },
});