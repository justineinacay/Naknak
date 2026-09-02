import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';

import { Field, PageHeader, PrimaryButton, Screen } from '@/components/ui';
import { COPY } from '@/constants/copy';
import { colors, shadows, spacing } from '@/constants/theme';
import { useNakNak } from '@/context/naknak-context';

export default function NameOnboardingScreen() {
  const { state, setName, finishCaregiverOnboarding } = useNakNak();
  const copy = COPY[state.profile.language];
  const [value, setValue] = useState(state.profile.name);
  const [error, setError] = useState('');

  const submit = () => {
    const name = value.trim();
    if (name.length < 2) {
      setError(
        state.profile.language === 'en'
          ? 'Please enter your name.'
          : state.profile.language === 'ceb'
            ? 'Palihog isulat imong ngalan.'
            : 'Ilagay ang iyong pangalan.',
      );
      return;
    }
    setName(name);
    if (state.profile.role === 'caregiver') {
      finishCaregiverOnboarding();
      router.replace('/caregiver/home');
    } else {
      router.push('/onboarding/accessibility');
    }
  };

  return (
    <Screen scroll={false} contentStyle={styles.screenContent}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardArea}
      >
        <PageHeader title={copy.nameTitle} description={copy.nameDescription} onBack={() => router.back()} />

        <View style={styles.formArea}>
          <View style={styles.avatar}>
            <MaterialCommunityIcons color={colors.red} name="account-heart" size={38} />
          </View>
          <Field
            autoCapitalize="words"
            autoComplete="name"
            autoFocus
            error={error}
            label={copy.nameLabel}
            onChangeText={(text) => {
              setValue(text);
              if (error) setError('');
            }}
            onSubmitEditing={submit}
            placeholder={copy.namePlaceholder}
            returnKeyType="next"
            value={value}
          />
        </View>

        <PrimaryButton disabled={!value.trim()} label={copy.continue} onPress={submit} />
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: { paddingHorizontal: spacing.lg },
  keyboardArea: { flex: 1, paddingBottom: spacing.lg },
  formArea: { flex: 1, justifyContent: 'center', gap: spacing.xl },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.redSoft,
    borderWidth: 1,
    borderColor: 'rgba(227, 23, 34, 0.13)',
    ...shadows.card,
  },
});
