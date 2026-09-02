import { INITIAL_STATE, NakNakState } from '@/types/naknak';

const STORAGE_KEY = 'naknak_native_preview_state';

export async function loadState(): Promise<NakNakState> {
  if (typeof window === 'undefined') return INITIAL_STATE;
  const value = window.localStorage.getItem(STORAGE_KEY);
  if (!value) return INITIAL_STATE;

  try {
    const parsed = JSON.parse(value) as NakNakState;
    return parsed.schemaVersion === 1 ? parsed : INITIAL_STATE;
  } catch {
    return INITIAL_STATE;
  }
}

export async function saveState(state: NakNakState): Promise<void> {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
}

export async function clearState(): Promise<void> {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}
