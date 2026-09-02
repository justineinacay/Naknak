import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { InfoPanel, Screen, SecondaryButton } from '@/components/ui';
import { COPY } from '@/constants/copy';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { useNakNak } from '@/context/naknak-context';

export default function CaregiverHomeScreen() {
  const { state, resetApp } = useNakNak();
  const copy = COPY[state.profile.language];
  const currentTitle = state.profile.language === 'en' ? 'Available on this phone' : state.profile.language === 'ceb' ? 'Magamit niini nga phone' : 'Gumagana sa phone na ito';
  const nextTitle = state.profile.language === 'en' ? 'Next milestone' : state.profile.language === 'ceb' ? 'Sunod nga milestone' : 'Susunod na milestone';
  const currentItems = state.profile.language === 'en'
    ? ['Senior/PWD emergency calling', 'Medication schedules and local reminders']
    : state.profile.language === 'ceb'
      ? ['Emergency calling para sa Senior/PWD', 'Schedule sa tambal ug local reminders']
      : ['Emergency calling para sa Senior/PWD', 'Schedule ng gamot at local reminders'];

  const restart = async () => {
    await resetApp();
    router.replace('/');
  };

  return (
    <Screen scroll={false} contentStyle={styles.content}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{state.profile.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.headerCopy}>
          <Text accessibilityRole="header" style={styles.title}>{copy.caregiverTitle(state.profile.name)}</Text>
          <Text style={styles.subtitle}>Caregiver / Anak</Text>
        </View>
      </View>

      <View style={styles.main}>
        <InfoPanel title={copy.caregiverNotConnected} tone="amber" icon={<Text style={styles.warning}>!</Text>}>
          {copy.caregiverNotConnectedDetail}
        </InfoPanel>

        <View style={styles.milestoneCard}>
          <View style={styles.milestoneHeader}>
            <View style={styles.emptyIconShell}>
              <MaterialCommunityIcons color={colors.red} name="cellphone-check" size={29} />
            </View>
            <View style={styles.milestoneHeadingCopy}>
              <Text style={styles.milestoneEyebrow}>{currentTitle}</Text>
              <Text style={styles.emptyTitle}>{copy.noFamilyMembers}</Text>
            </View>
          </View>

          <View style={styles.checklist}>
            {currentItems.map((item) => (
              <View key={item} style={styles.checkRow}>
                <MaterialCommunityIcons color={colors.greenDark} name="check-circle" size={21} />
                <Text style={styles.checkText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.nextMilestone}>
            <MaterialCommunityIcons color={colors.amberDark} name="lock-clock" size={23} />
            <View style={styles.nextCopy}>
              <Text style={styles.nextTitle}>{nextTitle}</Text>
              <Text style={styles.emptyBody}>{copy.nativeMilestone}</Text>
            </View>
          </View>
        </View>
      </View>

      <SecondaryButton label={copy.restartOnboarding} onPress={restart} tone="danger" />
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.red },
  avatarText: { color: colors.white, fontSize: 25, fontWeight: '900' },
  headerCopy: { flex: 1 },
  title: { color: colors.ink, fontSize: 25, lineHeight: 30, fontWeight: '900', fontFamily: typography.rounded },
  subtitle: { color: colors.inkMuted, fontSize: 14, lineHeight: 19, fontWeight: '700' },
  main: { flex: 1, justifyContent: 'flex-start', gap: spacing.lg, paddingTop: spacing.xxl },
  warning: { color: colors.amberDark, fontSize: 22, fontWeight: '900' },
  milestoneCard: { gap: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface, padding: spacing.lg, ...shadows.card },
  milestoneHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  milestoneHeadingCopy: { flex: 1, gap: 2 },
  milestoneEyebrow: { color: colors.greenDark, fontSize: 14, lineHeight: 18, fontFamily: typography.bold },
  emptyIconShell: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.redSoft },
  emptyTitle: { color: colors.ink, fontSize: 19, lineHeight: 24, fontFamily: typography.rounded },
  checklist: { gap: spacing.md },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checkText: { flex: 1, color: colors.ink, fontSize: 15, lineHeight: 20, fontFamily: typography.regular },
  nextMilestone: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: colors.amberSoft, borderRadius: radius.md, padding: spacing.md },
  nextCopy: { flex: 1, gap: 3 },
  nextTitle: { color: colors.amberDark, fontSize: 15, lineHeight: 19, fontFamily: typography.rounded },
  emptyBody: { color: colors.inkMuted, fontSize: 15, lineHeight: 21, fontFamily: typography.regular },
});
