import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useMemo, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BottomNav } from '@/components/bottom-nav';
import { BrandedBackdrop, ChoiceChip, Field, InfoPanel, PrimaryButton, SecondaryButton, SectionTitle } from '@/components/ui';
import { COPY, WINDOW_LABELS } from '@/constants/copy';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';
import { useNakNak } from '@/context/naknak-context';
import { scheduleMedicationReminders } from '@/lib/notifications';
import { MedicationFrequency, MedicationWindow } from '@/types/naknak';

const FREQUENCIES: MedicationFrequency[] = ['1x', '2x', '3x', '4x', 'flexible'];
const WINDOWS: MedicationWindow[] = ['morning', 'noon', 'afternoon', 'evening', 'bedtime'];
const DEFAULT_TIMES: Record<Exclude<MedicationFrequency, 'flexible'>, string[]> = {
  '1x': ['08:00'],
  '2x': ['08:00', '20:00'],
  '3x': ['08:00', '13:00', '20:00'],
  '4x': ['08:00', '12:00', '16:00', '20:00'],
};
const WINDOW_TIMES: Record<MedicationWindow, string> = {
  morning: '08:00',
  noon: '12:00',
  afternoon: '16:00',
  evening: '19:00',
  bedtime: '21:00',
};

export default function MedicationsScreen() {
  const { state, addMedication, markMedicationTaken } = useNakNak();
  const copy = COPY[state.profile.language];
  const [name, setName] = useState('');
  const [dose, setDose] = useState('');
  const [frequency, setFrequency] = useState<MedicationFrequency>('1x');
  const [windows, setWindows] = useState<MedicationWindow[]>(['morning']);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [takenId, setTakenId] = useState('');
  const [showForm, setShowForm] = useState(false);
  const dosePlaceholder = state.profile.language === 'en' ? 'e.g. 1 tablet / 10 mg' : state.profile.language === 'ceb' ? 'pananglitan: 1 tablet / 10 mg' : 'hal. 1 tablet / 10 mg';

  const times = useMemo(
    () =>
      frequency === 'flexible'
        ? windows.map((window) => WINDOW_TIMES[window])
        : DEFAULT_TIMES[frequency],
    [frequency, windows],
  );

  const toggleWindow = (window: MedicationWindow) => {
    setWindows((current) =>
      current.includes(window) ? current.filter((item) => item !== window) : [...current, window],
    );
  };

  const save = async () => {
    if (!name.trim() || !dose.trim()) {
      setError(
        state.profile.language === 'en'
          ? 'Enter the medication and dose.'
          : state.profile.language === 'ceb'
            ? 'Isulat ang tambal ug dose.'
            : 'Ilagay ang gamot at dose.',
      );
      return;
    }
    if (!times.length) {
      setError(
        state.profile.language === 'en'
          ? 'Choose at least one time window.'
          : state.profile.language === 'ceb'
            ? 'Pili ug bisan usa ka bahin sa adlaw.'
            : 'Pumili ng kahit isang bahagi ng araw.',
      );
      return;
    }

    setSaving(true);
    setError('');
    let schedule = { enabled: false, notificationIds: [] as string[] };
    try {
      schedule = await scheduleMedicationReminders(name.trim(), dose.trim(), times);
    } catch {
      schedule = { enabled: false, notificationIds: [] };
    }

    addMedication({
      name: name.trim(),
      dose: dose.trim(),
      frequency,
      windows: frequency === 'flexible' ? windows : [],
      times,
      notificationIds: schedule.notificationIds,
      remindersEnabled: schedule.enabled,
    });
    setName('');
    setDose('');
    setFrequency('1x');
    setWindows(['morning']);
    setMessage(schedule.enabled ? copy.remindersOn : copy.remindersOff);
    setShowForm(false);
    setSaving(false);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <BrandedBackdrop />
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <Text accessibilityRole="header" style={styles.title}>
              {copy.medicationTitle}
            </Text>
            <Text style={styles.description}>{copy.medicationDescription}</Text>
          </View>

          <View style={styles.sectionHeader}>
            <SectionTitle>{copy.todaySchedules}</SectionTitle>
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{state.medications.length}</Text>
            </View>
          </View>
          {state.medications.length ? (
            <View style={styles.medications}>
              {state.medications.map((medication) => (
                <View key={medication.id} style={styles.medicationRow}>
                  <View style={styles.medicationIcon}>
                    <MaterialCommunityIcons color={colors.amberDark} name="pill" size={23} />
                  </View>
                  <View style={styles.medicationCopy}>
                    <Text style={styles.medicationName}>{medication.name} · {medication.dose}</Text>
                    <Text style={styles.medicationTimes}>{medication.times.join(' · ')}</Text>
                    <Text style={[styles.reminderState, medication.remindersEnabled && styles.reminderStateOn]}>
                      {medication.remindersEnabled ? copy.remindersOn : copy.remindersOff}
                    </Text>
                  </View>
                  <SecondaryButton
                    label={takenId === medication.id ? '✓' : copy.markTaken}
                    onPress={() => {
                      markMedicationTaken(medication.id);
                      setTakenId(medication.id);
                    }}
                    tone={takenId === medication.id ? 'neutral' : 'amber'}
                  />
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <MaterialCommunityIcons color={colors.redDark} name="calendar-heart" size={30} />
              </View>
              <View style={styles.emptyCopy}>
                <Text style={styles.emptyTitle}>{copy.noMedications}</Text>
                <Text style={styles.emptyBody}>{copy.medicationDescription}</Text>
              </View>
            </View>
          )}

          {message && !showForm ? (
            <View accessibilityLiveRegion="polite" style={styles.savedNotice}>
              <MaterialCommunityIcons color={colors.greenDark} name="check-circle" size={20} />
              <Text style={styles.message}>{message}</Text>
            </View>
          ) : null}

          {!showForm ? (
            <PrimaryButton
              label={copy.addMedication}
              onPress={() => {
                setError('');
                setMessage('');
                setShowForm(true);
              }}
            />
          ) : (
            <View style={styles.form}>
              <View style={styles.formHeading}>
                <View style={styles.formIcon}>
                  <MaterialCommunityIcons color={colors.red} name="pill-multiple" size={24} />
                </View>
                <SectionTitle>{copy.addMedication}</SectionTitle>
              </View>
              <Field label={copy.medicationName} value={name} onChangeText={setName} autoCapitalize="words" />
              <Field label={copy.dose} value={dose} onChangeText={setDose} placeholder={dosePlaceholder} />

              <View style={styles.group}>
                <Text style={styles.groupLabel}>{copy.frequency}</Text>
                <View style={styles.chips}>
                  {FREQUENCIES.map((item) => (
                    <ChoiceChip
                      key={item}
                      label={item === 'flexible' ? copy.flexibleLabel : item}
                      selected={frequency === item}
                      onPress={() => setFrequency(item)}
                    />
                  ))}
                </View>
              </View>

              {frequency === 'flexible' ? (
                <View style={styles.group}>
                  <Text style={styles.groupLabel}>{copy.flexibleWindows}</Text>
                  <View style={styles.chips}>
                    {WINDOWS.map((window) => (
                      <ChoiceChip
                        key={window}
                        label={WINDOW_LABELS[window][state.profile.language]}
                        selected={windows.includes(window)}
                        onPress={() => toggleWindow(window)}
                        large
                      />
                    ))}
                  </View>
                </View>
              ) : (
                <InfoPanel title={copy.defaultTimes} tone="blue">
                  {times.join(' · ')}. {copy.exactTimeNext}
                </InfoPanel>
              )}

              {error ? <Text style={styles.error}>{error}</Text> : null}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
      {showForm ? (
        <View style={styles.stickyActions}>
          <SecondaryButton
            label={copy.cancel}
            onPress={() => {
              setError('');
              setShowForm(false);
            }}
            style={styles.cancelButton}
          />
          <PrimaryButton
            disabled={saving}
            label={saving ? '…' : copy.saveMedication}
            onPress={save}
            style={styles.saveButton}
          />
        </View>
      ) : null}
      <BottomNav active="medicines" />
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
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  countBadge: { minWidth: 34, height: 34, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.redSoft },
  countText: { color: colors.redDark, fontSize: 16, fontFamily: typography.rounded },
  medications: { gap: spacing.sm },
  medicationRow: {
    minHeight: 96,
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
  medicationIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.amberSoft },
  medicationCopy: { flex: 1, minWidth: 0, gap: 3 },
  medicationName: { color: colors.ink, fontSize: 16, lineHeight: 20, fontFamily: typography.rounded },
  medicationTimes: { color: colors.inkMuted, fontSize: 13, lineHeight: 17, fontWeight: '700' },
  reminderState: { color: colors.amberDark, fontSize: 13, lineHeight: 17, fontFamily: typography.bold },
  reminderStateOn: { color: colors.greenDark },
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
  group: { gap: spacing.sm },
  groupLabel: { color: colors.ink, fontSize: 15, fontFamily: typography.bold },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  error: { color: colors.redDark, fontSize: 14, lineHeight: 19, fontWeight: '800', textAlign: 'center' },
  message: { color: colors.greenDark, fontSize: 15, lineHeight: 20, fontFamily: typography.bold, textAlign: 'center' },
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
