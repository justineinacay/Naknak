export type Role = 'senior_pwd' | 'caregiver';
export type Language = 'tl' | 'en' | 'ceb';
export type AccessibilityNeed = 'vision' | 'hearing' | 'mobility' | 'cognitive' | 'general';
export type MedicationFrequency = '1x' | '2x' | '3x' | '4x' | 'flexible';
export type MedicationWindow = 'morning' | 'noon' | 'afternoon' | 'evening' | 'bedtime';

export type Profile = {
  role: Role | null;
  name: string;
  language: Language;
  accessibilityNeeds: AccessibilityNeed[];
  onboarded: boolean;
};

export type EmergencyContact = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  primary: boolean;
};

export type Medication = {
  id: string;
  name: string;
  dose: string;
  frequency: MedicationFrequency;
  windows: MedicationWindow[];
  times: string[];
  notificationIds: string[];
  remindersEnabled: boolean;
  createdAt: string;
};

export type LocalEvent = {
  id: string;
  type: 'sos_opened' | 'check_in_ok' | 'medication_taken';
  createdAt: string;
  detail?: string;
};

export type NakNakState = {
  schemaVersion: 1;
  profile: Profile;
  contacts: EmergencyContact[];
  medications: Medication[];
  events: LocalEvent[];
  lastCheckInAt: string | null;
};

export const INITIAL_STATE: NakNakState = {
  schemaVersion: 1,
  profile: {
    role: null,
    name: '',
    language: 'tl',
    accessibilityNeeds: [],
    onboarded: false,
  },
  contacts: [],
  medications: [],
  events: [],
  lastCheckInAt: null,
};
