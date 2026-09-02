import * as Linking from 'expo-linking';

export type CallResult = { ok: true } | { ok: false; reason: string };

export async function callPhoneNumber(phone: string): Promise<CallResult> {
  const sanitized = phone.replace(/[^+\d]/g, '');
  if (!sanitized) return { ok: false, reason: 'Walang wastong numero na tatawagan.' };

  const url = `tel:${sanitized}`;
  try {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      return { ok: false, reason: 'Hindi makapagbukas ng phone dialer sa device na ito.' };
    }
    await Linking.openURL(url);
    return { ok: true };
  } catch {
    return { ok: false, reason: 'Hindi nabuksan ang phone dialer. Subukan muli.' };
  }
}
