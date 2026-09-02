import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/bottom-nav';
import { BrandedBackdrop, Field, PrimaryButton, SecondaryButton, SectionTitle } from '@/components/ui';
import { COPY } from '@/constants/copy';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { useNakNak } from '@/context/naknak-context';
import { callPhoneNumber } from '@/lib/calling';

export default function ContactsScreen() {
  const { state, addContact } = useNakNak();
  const copy = COPY[state.profile.language];
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');
  const [formError, setFormError] = useState('');
  const [callError, setCallError] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [showForm, setShowForm] = useState(false);

  const call = async (number: string) => {
    setCallError('');
    const result = await callPhoneNumber(number);
    if (!result.ok) setCallError(result.reason);
  };

  const save = () => {
    if (!name.trim() || phone.replace(/\D/g, '').length < 3) {
      setFormError(
        state.profile.language === 'en'
          ? 'Enter a name and valid phone number.'
          : state.profile.language === 'ceb'
            ? 'Isulat ang ngalan ug hustong numero sa telepono.'
            : 'Ilagay ang pangalan at wastong numero.',
      );
      return;
    }
    addContact({
      name: name.trim(),
      relationship: relationship.trim() || (state.profile.language === 'en' ? 'Family' : 'Pamilya'),
      phone: phone.trim(),
    });
    setName('');
    setRelationship('');
    setPhone('');
    setFormError('');
    setSavedMessage(
      state.profile.language === 'en'
        ? 'Emergency contact saved on this phone.'
        : state.profile.language === 'ceb'
          ? 'Naka-save niini nga phone ang emergency contact.'
          : 'Naka-save sa phone ang emergency contact.',
    );
    setShowForm(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <BrandedBackdrop />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>
              {copy.contactsTitle}
            </Text>
            <Text style={styles.description}>{copy.contactsDescription}</Text>
          </View>

          <View style={styles.rescueSection}>
            <SectionTitle>{copy.emergencyNumbers}</SectionTitle>
            <View style={styles.rescueRow}>
              {['911', '112'].map((number) => (
                <Pressable
                  key={number}
                  accessibilityRole="button"
                  accessibilityLabel={`${copy.call} ${number}`}
                  onPress={() => call(number)}
                  style={({ pressed }) => [styles.rescueButton, pressed && styles.pressed]}
                >
                  <View style={styles.rescueIcon}>
                    <MaterialCommunityIcons color={colors.white} name="phone-in-talk" size={23} />
                  </View>
                  <View>
                    <Text style={styles.rescueEyebrow}>{copy.call}</Text>
                    <Text style={styles.rescueNumber}>{number}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
            <Text style={styles.note}>{copy.directCallNote}</Text>
          </View>

          <View style={styles.sectionHeader}>
            <SectionTitle>{copy.emergencyContacts}</SectionTitle>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{state.contacts.length}</Text>
            </View>
          </View>
          {state.contacts.length ? (
            <View style={styles.contacts}>
              {state.contacts.map((contact) => (
                <View key={contact.id} style={styles.contactRow}>
                  <View style={styles.contactAvatar}>
                    <Text style={styles.contactAvatarText}>{contact.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.contactCopy}>
                    <View style={styles.contactNameRow}>
                      <Text style={styles.contactName}>{contact.name}</Text>
                      {contact.primary ? <Text style={styles.primaryTag}>PRIMARY</Text> : null}
                    </View>
                    <Text style={styles.contactMeta}>{contact.relationship} · {contact.phone}</Text>
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${copy.call} ${contact.name}`}
                    onPress={() => call(contact.phone)}
                    style={({ pressed }) => [styles.contactCall, pressed && styles.pressed]}
                  >
                    <MaterialCommunityIcons color={colors.white} name="phone" size={23} />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons color={colors.redDark} name="account-heart" size={30} />
              </View>
              <View style={styles.emptyCopy}>
                <Text style={styles.emptyTitle}>{copy.noContacts}</Text>
                <Text style={styles.emptyBody}>{copy.noPrimaryContact}</Text>
              </View>
            </View>
          )}

          {savedMessage && !showForm ? (
            <View accessibilityLiveRegion="polite" style={styles.savedNotice}>
              <MaterialCommunityIcons color={colors.greenDark} name="check-circle" size={20} />
              <Text style={styles.saved}>{savedMessage}</Text>
            </View>
          ) : null}

          {!showForm ? (
            <PrimaryButton
              label={copy.addContact}
              onPress={() => {
                setFormError('');
                setSavedMessage('');
                setShowForm(true);
              }}
            />
          ) : (
            <View style={styles.form}>
              <View style={styles.formHeading}>
                <View style={styles.formIcon}>
                  <MaterialCommunityIcons color={colors.red} name="account-plus" size={25} />
                </View>
                <SectionTitle>{copy.addContact}</SectionTitle>
              </View>
              <Field label={copy.contactName} value={name} onChangeText={setName} autoCapitalize="words" />
              <Field label={copy.relationship} value={relationship} onChangeText={setRelationship} autoCapitalize="words" />
              <Field
                label={copy.phoneNumber}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoComplete="tel"
              />
              {formError ? <Text style={styles.error}>{formError}</Text> : null}
            </View>
          )}

          {callError ? (
            <Text accessibilityLiveRegion="assertive" style={styles.error}>
              {callError}
            </Text>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
      {showForm ? (
        <View style={styles.stickyActions}>
          <SecondaryButton
            label={copy.cancel}
            onPress={() => {
              setFormError('');
              setShowForm(false);
            }}
            style={styles.cancelButton}
          />
          <PrimaryButton label={copy.saveContact} onPress={save} style={styles.saveButton} />
        </View>
      ) : null}
      <BottomNav active="call" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.xl, gap: spacing.lg },
  header: { gap: spacing.xs },
  title: { color: colors.ink, fontSize: 28, lineHeight: 32, fontFamily: typography.rounded, letterSpacing: -0.6 },
  description: { color: colors.inkMuted, fontSize: 15, lineHeight: 21, fontFamily: typography.regular },
  rescueSection: { gap: spacing.sm },
  rescueRow: { flexDirection: 'row', gap: spacing.sm },
  rescueButton: {
    flex: 1,
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.lg,
    backgroundColor: colors.redSoft,
    borderWidth: 2,
    borderColor: colors.red,
  },
  rescueIcon: { width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.red },
  rescueEyebrow: { color: colors.redDark, fontSize: 13, lineHeight: 16, fontFamily: typography.bold },
  rescueNumber: { color: colors.redDark, fontSize: 22, lineHeight: 25, fontFamily: typography.rounded },
  note: { color: colors.inkMuted, fontSize: 14, lineHeight: 20, fontFamily: typography.regular },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countBadge: { minWidth: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.redSoft },
  countText: { color: colors.redDark, fontSize: 16, fontFamily: typography.rounded },
  contacts: { gap: spacing.sm },
  contactRow: {
    minHeight: 76,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(227, 23, 34, 0.08)',
    ...shadows.card,
  },
  contactAvatar: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.redSoft },
  contactAvatarText: { color: colors.redDark, fontSize: 20, fontFamily: typography.rounded },
  contactCopy: { flex: 1, minWidth: 0, gap: 3 },
  contactNameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  contactName: { color: colors.ink, fontSize: 16, fontFamily: typography.rounded, flexShrink: 1 },
  contactMeta: { color: colors.inkMuted, fontSize: 13, lineHeight: 17, fontFamily: typography.regular },
  primaryTag: { color: colors.greenDark, backgroundColor: colors.greenSoft, fontSize: 12, fontFamily: typography.bold, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 7 },
  contactCall: { width: 50, height: 50, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.red, ...shadows.raised },
  emptyState: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  emptyIcon: { width: 56, height: 56, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.redSoft },
  emptyCopy: { flex: 1, gap: 4 },
  emptyTitle: { color: colors.ink, fontSize: 18, lineHeight: 23, fontFamily: typography.rounded },
  emptyBody: { color: colors.inkMuted, fontSize: 15, lineHeight: 21, fontFamily: typography.regular },
  savedNotice: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, backgroundColor: colors.greenSoft, borderRadius: radius.md, padding: spacing.md },
  form: { gap: spacing.md, paddingTop: spacing.sm },
  formHeading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  formIcon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.redSoft },
  error: { color: colors.redDark, fontSize: 14, lineHeight: 19, fontWeight: '800', textAlign: 'center' },
  saved: { color: colors.greenDark, fontSize: 15, lineHeight: 20, fontFamily: typography.bold, textAlign: 'center' },
  pressed: { opacity: 0.72, transform: [{ scale: 0.985 }] },
  stickyActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
    ...shadows.nav,
  },
  cancelButton: { width: 112 },
  saveButton: { flex: 1 },
});
