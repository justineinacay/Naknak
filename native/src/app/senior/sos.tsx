import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandedBackdrop, InfoPanel, PrimaryButton, SecondaryButton } from '@/components/ui';
import { COPY } from '@/constants/copy';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { useNakNak } from '@/context/naknak-context';
import { callPhoneNumber } from '@/lib/calling';

export default function SosScreen() {
  const { state, recordSosOpened } = useNakNak();
  const recorded = useRef(false);
  const [callError, setCallError] = useState('');
  const [delivery, setDelivery] = useState<'sending' | 'delivered' | 'local'>('sending');
  const copy = COPY[state.profile.language];
  const primaryContact = state.contacts.find((contact) => contact.primary) ?? state.contacts[0];

  const strings = state.profile.language === 'en'
    ? {
        callNow: 'Call for help now',
        callHint: 'Choose a saved contact or emergency number. NakNak opens the phone dialer directly.',
        statusTitle: 'What NakNak recorded',
        delivered: 'SOS status confirmed in Family Dashboard',
        deliveredDetail: 'NakNak confirmed the SOS-opened event on the server. This does not mean a caregiver push notification was received.',
        checking: 'Checking family connection',
        checkingDetail: 'The SOS-opened event is already saved on this phone while NakNak checks the paired connection.',
        local: 'SOS saved on this phone only',
        add: 'Add an emergency contact',
      }
    : state.profile.language === 'ceb'
      ? {
          callNow: 'Tawag dayon para mangayo ug tabang',
          callHint: 'Pili ug saved contact o emergency number. Direktang ablihan sa NakNak ang phone dialer.',
          statusTitle: 'Unsa ang narekord sa NakNak',
          delivered: 'Nakumpirma ang SOS status sa Family Dashboard',
          deliveredDetail: 'Nakumpirma sa NakNak server ang SOS-opened event. Dili kini pasabot nga nakadawat na ug push notification ang caregiver.',
          checking: 'Gikumpirma ang family connection',
          checkingDetail: 'Naka-save na ang SOS-opened event niini nga phone samtang gi-check ang paired connection.',
          local: 'Naka-save lang ang SOS niini nga phone',
          add: 'Pagdugang ug emergency contact',
        }
      : {
          callNow: 'Tumawag agad para humingi ng tulong',
          callHint: 'Pumili ng saved contact o emergency number. Direktang bubuksan ng NakNak ang phone dialer.',
          statusTitle: 'Ano ang naitala ng NakNak',
          delivered: 'Nakumpirma ang SOS status sa Family Dashboard',
          deliveredDetail: 'Kinumpirma ng NakNak server ang SOS-opened event. Hindi nito ibig sabihin na nakatanggap na ng push notification ang caregiver.',
          checking: 'Kinukumpirma ang family connection',
          checkingDetail: 'Naka-save na ang SOS-opened event sa phone habang chine-check ang paired connection.',
          local: 'Sa phone lang naka-save ang SOS',
          add: 'Magdagdag ng emergency contact',
        };

  useEffect(() => {
    if (recorded.current) return;
    recorded.current = true;
    void recordSosOpened().then((delivered) => setDelivery(delivered ? 'delivered' : 'local'));
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => undefined);
  }, [recordSosOpened]);

  const call = async (phone: string) => {
    setCallError('');
    const result = await callPhoneNumber(phone);
    if (!result.ok) setCallError(result.reason);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'bottom']}>
      <BrandedBackdrop />
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <View style={styles.sosMark}>
            <MaterialCommunityIcons color={colors.white} name="shield-alert" size={30} />
          </View>
          <View style={styles.heroCopy}>
            <Text accessibilityRole="header" style={styles.title}>{copy.sosActive}</Text>
            <Text style={styles.subtitle}>{copy.sosHonestSubtitle}</Text>
          </View>
        </View>

        <View style={styles.callCard}>
          <View style={styles.callHeading}>
            <MaterialCommunityIcons color={colors.redDark} name="phone-alert" size={24} />
            <View style={styles.callHeadingCopy}>
              <Text style={styles.callTitle}>{strings.callNow}</Text>
              <Text style={styles.callHint}>{strings.callHint}</Text>
            </View>
          </View>

          {primaryContact ? (
            <PrimaryButton
              accessibilityHint={strings.callHint}
              label={copy.callPrimary(primaryContact.name)}
              onPress={() => call(primaryContact.phone)}
            />
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={() => router.push('/senior/contacts')}
              style={({ pressed }) => [styles.addContact, pressed && styles.pressed]}
            >
              <MaterialCommunityIcons color={colors.redDark} name="account-plus" size={21} />
              <View style={styles.addContactCopy}>
                <Text style={styles.addContactTitle}>{copy.noPrimaryContact}</Text>
                <Text style={styles.addContactLink}>{strings.add}</Text>
              </View>
            </Pressable>
          )}

          <View style={styles.emergencyRow}>
            <SecondaryButton
              label={copy.call + ' 911'}
              onPress={() => call('911')}
              tone="danger"
              style={styles.emergencyButton}
            />
            <SecondaryButton
              label={copy.call + ' 112'}
              onPress={() => call('112')}
              tone="danger"
              style={styles.emergencyButton}
            />
          </View>
        </View>

        {callError ? (
          <Text accessibilityLiveRegion="assertive" style={styles.error}>
            {callError}
          </Text>
        ) : null}

        <View style={styles.statusHeader}>
          <Text style={styles.statusTitle}>{strings.statusTitle}</Text>
          <View
            accessibilityLiveRegion="polite"
            style={[
              styles.deliveryPill,
              delivery === 'delivered' ? styles.deliveryPillGood : styles.deliveryPillPending,
            ]}
          >
            <Text
              style={[
                styles.deliveryPillText,
                delivery === 'delivered' ? styles.deliveryTextGood : styles.deliveryTextPending,
              ]}
            >
              {delivery === 'delivered' ? 'Confirmed' : delivery === 'sending' ? 'Checking' : 'Local'}
            </Text>
          </View>
        </View>

        <View style={styles.statuses}>
          <InfoPanel
            title={copy.savedLocally}
            tone="green"
            icon={<MaterialCommunityIcons color={colors.greenDark} name="cellphone-check" size={23} />}
          >
            {copy.savedLocallyDetail}
          </InfoPanel>

          <InfoPanel
            title={
              delivery === 'delivered'
                ? strings.delivered
                : delivery === 'sending'
                  ? strings.checking
                  : strings.local
            }
            tone={delivery === 'delivered' ? 'green' : 'amber'}
            icon={
              <MaterialCommunityIcons
                color={delivery === 'delivered' ? colors.greenDark : colors.amberDark}
                name={delivery === 'delivered' ? 'cloud-check' : 'cloud-alert'}
                size={23}
              />
            }
          >
            {delivery === 'delivered'
              ? strings.deliveredDetail
              : delivery === 'sending'
                ? strings.checkingDetail
                : copy.caregiverNotSentDetail}
          </InfoPanel>

          <InfoPanel
            title={copy.locationNotShared}
            tone="neutral"
            icon={<MaterialCommunityIcons color={colors.inkMuted} name="map-marker-off" size={23} />}
          >
            {copy.locationNotSharedDetail}
          </InfoPanel>
        </View>

        <SecondaryButton label={copy.returnHome} onPress={() => router.replace('/senior/home')} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.lg,
  },
  hero: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sosMark: {
    width: 66,
    height: 66,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.red,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.76)',
    ...shadows.sos,
  },
  heroCopy: { flex: 1, gap: 4 },
  title: {
    color: colors.ink,
    fontSize: 26,
    lineHeight: 31,
    fontFamily: typography.rounded,
    letterSpacing: -0.5,
  },
  subtitle: { color: colors.inkMuted, fontSize: 14, lineHeight: 19, fontFamily: typography.regular },
  callCard: {
    gap: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: 'rgba(227,23,34,0.15)',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    ...shadows.raised,
  },
  callHeading: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  callHeadingCopy: { flex: 1, gap: 3 },
  callTitle: { color: colors.redDark, fontSize: 19, lineHeight: 23, fontFamily: typography.rounded },
  callHint: { color: colors.inkMuted, fontSize: 14, lineHeight: 19, fontFamily: typography.regular },
  addContact: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: colors.red,
    borderRadius: radius.md,
    backgroundColor: colors.redSoft,
    paddingHorizontal: spacing.md,
  },
  addContactCopy: { flex: 1, gap: 2 },
  addContactTitle: { color: colors.ink, fontSize: 14, lineHeight: 19, fontFamily: typography.bold },
  addContactLink: { color: colors.redDark, fontSize: 15, lineHeight: 19, fontFamily: typography.rounded },
  emergencyRow: { flexDirection: 'row', gap: spacing.sm },
  emergencyButton: { flex: 1, minHeight: 54 },
  error: {
    color: colors.redDark,
    fontSize: 14,
    lineHeight: 19,
    fontFamily: typography.bold,
    textAlign: 'center',
    backgroundColor: colors.redSoft,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  statusHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  statusTitle: { color: colors.ink, fontSize: 18, lineHeight: 22, fontFamily: typography.rounded },
  deliveryPill: { borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 6 },
  deliveryPillGood: { backgroundColor: colors.greenSoft },
  deliveryPillPending: { backgroundColor: colors.amberSoft },
  deliveryPillText: { fontSize: 12, lineHeight: 15, fontFamily: typography.bold },
  deliveryTextGood: { color: colors.greenDark },
  deliveryTextPending: { color: colors.amberDark },
  statuses: { gap: spacing.sm },
  pressed: { opacity: 0.72 },
});