import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AppState } from 'react-native';

import { clearState, loadState, saveState } from '@/lib/storage';
import { cancelMedicationReminders } from '@/lib/notifications';
import {
  checkFamilyConnection,
  disconnectNativeDevice,
  FamilyConnection,
  FamilyCredentials,
  pairNativeDevice,
  reportNativeEvent,
} from '@/lib/family-sync';
import { clearFamilyCredentials, loadFamilyCredentials, saveFamilyCredentials } from '@/lib/sync-storage';
import {
  enqueueFamilyEvent, listDueFamilyEvents, removeFamilyEvent, retryFamilyEvent,
  familyOutboxCount, isFamilyEventPending, clearFamilyOutbox,
} from '@/lib/family-outbox';
import {
  AccessibilityNeed,
  EmergencyContact,
  INITIAL_STATE,
  Language,
  LocalEvent,
  Medication,
  NakNakState,
  Role,
} from '@/types/naknak';

type NakNakContextValue = {
  state: NakNakState;
  loading: boolean;
  familyConnection: FamilyConnection;
  setLanguage: (language: Language) => void;
  startRole: (role: Role) => void;
  setName: (name: string) => void;
  finishSeniorOnboarding: (needs: AccessibilityNeed[]) => void;
  finishCaregiverOnboarding: () => void;
  addContact: (contact: Omit<EmergencyContact, 'id' | 'primary'>) => void;
  addMedication: (medication: Omit<Medication, 'id' | 'createdAt'>) => void;
  markMedicationTaken: (medicationId: string) => void;
  pairWithFamilyCode: (code: string) => Promise<void>;
  disconnectFamily: () => Promise<void>;
  recordCheckIn: () => Promise<boolean>;
  recordSosOpened: () => Promise<boolean>;
  resetApp: () => Promise<void>;
};

const NakNakContext = createContext<NakNakContextValue | null>(null);

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function NakNakProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<NakNakState>(INITIAL_STATE);
  const [loading, setLoading] = useState(true);
  const [familyCredentials, setFamilyCredentials] = useState<FamilyCredentials | null>(null);
  const [familyConnection, setFamilyConnection] = useState<FamilyConnection>({ status: 'local' });
  const sendingRef = useRef(false);

  useEffect(() => {
    let active = true;
    Promise.all([loadState(), loadFamilyCredentials()])
      .then(([stored, credentials]) => {
        if (active) {
          setState(stored);
          setFamilyCredentials(credentials);
          if (credentials) setFamilyConnection({ status: 'checking', seniorName: credentials.seniorName });
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (loading || !familyCredentials) return;
    let active = true;
    checkFamilyConnection(familyCredentials)
      .then((connection) => {
        if (active) setFamilyConnection(connection);
      })
      .catch((error: unknown) => {
        if (active) {
          setFamilyConnection({
            status: 'error',
            seniorName: familyCredentials.seniorName,
            message: error instanceof Error ? error.message : 'Hindi makumpirma ang family connection.',
          });
        }
      });
    return () => {
      active = false;
    };
  }, [familyCredentials, loading]);

  useEffect(() => {
    if (!loading) void saveState(state);
  }, [loading, state]);

  const setLanguage = useCallback((language: Language) => {
    setState((current) => ({
      ...current,
      profile: { ...current.profile, language },
    }));
  }, []);

  const startRole = useCallback((role: Role) => {
    setState((current) => ({
      ...current,
      profile: {
        ...current.profile,
        role,
        name: '',
        accessibilityNeeds: [],
        onboarded: false,
      },
    }));
  }, []);

  const setName = useCallback((name: string) => {
    setState((current) => ({
      ...current,
      profile: { ...current.profile, name: name.trim() },
    }));
  }, []);

  const finishSeniorOnboarding = useCallback((accessibilityNeeds: AccessibilityNeed[]) => {
    setState((current) => ({
      ...current,
      profile: { ...current.profile, accessibilityNeeds, onboarded: true },
    }));
  }, []);

  const finishCaregiverOnboarding = useCallback(() => {
    setState((current) => ({
      ...current,
      profile: { ...current.profile, onboarded: true },
    }));
  }, []);

  const addContact = useCallback((contact: Omit<EmergencyContact, 'id' | 'primary'>) => {
    setState((current) => ({
      ...current,
      contacts: [
        ...current.contacts,
        {
          ...contact,
          id: createId('contact'),
          primary: current.contacts.length === 0,
        },
      ],
    }));
  }, []);

  const addMedication = useCallback((medication: Omit<Medication, 'id' | 'createdAt'>) => {
    setState((current) => ({
      ...current,
      medications: [
        ...current.medications,
        { ...medication, id: createId('medication'), createdAt: new Date().toISOString() },
      ],
    }));
  }, []);

  const appendEvent = useCallback((event: Omit<LocalEvent, 'id' | 'createdAt'>) => {
    setState((current) => ({
      ...current,
      events: [
        { ...event, id: createId('event'), createdAt: new Date().toISOString() },
        ...current.events,
      ].slice(0, 100),
    }));
  }, []);

  const markMedicationTaken = useCallback(
    (medicationId: string) => {
      const medication = state.medications.find((item) => item.id === medicationId);
      appendEvent({
        type: 'medication_taken',
        detail: medication ? `${medication.name} ${medication.dose}` : medicationId,
      });
    },
    [appendEvent, state.medications],
  );

  // Retry loop is backed by SQLite so an app process crash cannot erase the
  // pending event. A server receipt confirms recording, not caregiver delivery.
  const flushFamilyOutbox = useCallback(async () => {
    const credentials=familyCredentials;
    if(!credentials||sendingRef.current)return;
    sendingRef.current=true;
    try {
      const due=await listDueFamilyEvents(credentials.householdId);
      for(const entry of due) {
        // Never send a prior household/member's event with newly paired credentials.
        if(entry.memberId!==credentials.seniorId) continue;
        try {
          const receipt=await reportNativeEvent(credentials,entry.event,entry.id);
          if(!receipt.delivered)throw new Error('No server receipt');
          await removeFamilyEvent(entry.id);
          setFamilyConnection({
            status:'connected',
            seniorName:credentials.seniorName,
            lastConfirmedAt:receipt.serverReceivedAt,
          });
        } catch(error) {
          await retryFamilyEvent(entry.id,entry.attempts);
          setFamilyConnection({
            status:'error',
            seniorName:credentials.seniorName,
            message:error instanceof Error
              ? 'Naka-queue para ipadala kapag may koneksiyon: '+error.message
              : 'Naka-queue para sa susunod na koneksiyon.',
          });
          break;
        }
      }
    } finally {
      sendingRef.current=false;
    }
  },[familyCredentials]);

  // Resume and periodic active-app retries. The background OS is not
  // guaranteed to execute timers; this is not a background monitoring service.
  useEffect(()=>{
    if(loading||!familyCredentials)return;
    void flushFamilyOutbox().catch(()=>undefined);
    const subscription=AppState.addEventListener('change',status=>{
      if(status==='active')void flushFamilyOutbox().catch(()=>undefined);
    });
    const interval=setInterval(()=>{
      if(AppState.currentState==='active')void flushFamilyOutbox().catch(()=>undefined);
    },30_000);
    return ()=>{subscription.remove();clearInterval(interval);};
  },[familyCredentials,flushFamilyOutbox,loading]);

  const queueAndReportToFamily = useCallback(async (
    event:'check_in_ok'|'sos_opened',eventId:string,occurredAt:string,
  )=>{
    const credentials=familyCredentials;
    if(!credentials)return false;
    try {
      // Write to durable storage before making a network attempt.
      await enqueueFamilyEvent({
        id:eventId,event,occurredAt,
        householdId:credentials.householdId,memberId:credentials.seniorId,
      });
      await flushFamilyOutbox();
      return !(await isFamilyEventPending(eventId));
    } catch(error) {
      setFamilyConnection({
        status:'error',seniorName:credentials.seniorName,
        message:'Hindi makumpirma ang pag-save/padala. Suriin ang NakNak storage at koneksiyon.',
      });
      return false;
    }
  },[familyCredentials,flushFamilyOutbox]);

  const pairWithFamilyCode = useCallback(async (code: string) => {
    setFamilyConnection({ status: 'checking' });
    try {
      const credentials = await pairNativeDevice(code, state.profile.name);
      await saveFamilyCredentials(credentials);
      setFamilyCredentials(credentials);
      setFamilyConnection({
        status: 'connected',
        seniorName: credentials.seniorName,
        lastConfirmedAt: new Date().toISOString(),
      });
    } catch (error) {
      setFamilyConnection({
        status: 'error',
        message: error instanceof Error ? error.message : 'Hindi makakonekta gamit ang Family Code.',
      });
      throw error;
    }
  }, [state.profile.name]);

  const disconnectFamily = useCallback(async () => {
    const credentials = familyCredentials;
    let remotelyRevoked = !credentials;
    if (credentials) {
      try {
        remotelyRevoked = await disconnectNativeDevice(credentials);
      } catch {
        remotelyRevoked = false;
      }
    }
    await clearFamilyCredentials();
    await clearFamilyOutbox();
    setFamilyCredentials(null);
    setFamilyConnection(remotelyRevoked
      ? { status: 'local' }
      : {
          status: 'error',
          message: 'Naka-disconnect ang phone. Tanggalin din ang lumang device sa caregiver dashboard kapag online.',
        });
  }, [familyCredentials]);

  const recordCheckIn = useCallback(async () => {
    const now=new Date().toISOString(),eventId=createId('event');
    setState(current=>({
      ...current,lastCheckInAt:now,
      events:[{id:eventId,type:'check_in_ok' as const,createdAt:now},...current.events].slice(0,100),
    }));
    return queueAndReportToFamily('check_in_ok',eventId,now);
  },[queueAndReportToFamily]);

  const recordSosOpened = useCallback(async () => {
    const now=new Date().toISOString(),eventId=createId('event');
    setState(current=>({
      ...current,
      events:[{id:eventId,type:'sos_opened' as const,createdAt:now,detail:'Emergency screen opened locally'},...current.events].slice(0,100),
    }));
    return queueAndReportToFamily('sos_opened',eventId,now);
  },[queueAndReportToFamily]);

  const resetApp = useCallback(async () => {
    const notificationIds = state.medications.flatMap((medication) => medication.notificationIds);
    await cancelMedicationReminders(notificationIds);
    if (familyCredentials) {
      try {
        await disconnectNativeDevice(familyCredentials);
      } catch {
        // Reset must still work offline; a caregiver can revoke the stale row later.
      }
    }
    await clearFamilyCredentials();
    await clearFamilyOutbox();
    await clearState();
    setFamilyCredentials(null);
    setFamilyConnection({ status: 'local' });
    setState(INITIAL_STATE);
  }, [familyCredentials, state.medications]);

  const value = useMemo<NakNakContextValue>(
    () => ({
      state,
      loading,
      familyConnection,
      setLanguage,
      startRole,
      setName,
      finishSeniorOnboarding,
      finishCaregiverOnboarding,
      pairWithFamilyCode,
      disconnectFamily,
      addContact,
      addMedication,
      markMedicationTaken,
      recordCheckIn,
      recordSosOpened,
      resetApp,
    }),
    [
      addContact,
      addMedication,
      finishCaregiverOnboarding,
      finishSeniorOnboarding,
      familyConnection,
      loading,
      markMedicationTaken,
      pairWithFamilyCode,
      disconnectFamily,
      recordCheckIn,
      recordSosOpened,
      resetApp,
      setLanguage,
      setName,
      startRole,
      state,
    ],
  );

  return <NakNakContext.Provider value={value}>{children}</NakNakContext.Provider>;
}

export function useNakNak() {
  const context = useContext(NakNakContext);
  if (!context) throw new Error('useNakNak must be used inside NakNakProvider');
  return context;
}
