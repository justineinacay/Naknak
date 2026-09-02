import { AccessibilityNeed, Language, MedicationWindow } from '@/types/naknak';

type Copy = {
  roleQuestion: string;
  seniorRole: string;
  seniorRoleDescription: string;
  caregiverRole: string;
  caregiverRoleDescription: string;
  nameTitle: string;
  nameDescription: string;
  nameLabel: string;
  namePlaceholder: string;
  continue: string;
  back: string;
  accessibilityTitle: (name: string) => string;
  accessibilityDescription: string;
  finish: string;
  skip: string;
  greeting: string;
  offlineReady: string;
  offlineShort: string;
  sosLabel: string;
  sosHelp: string;
  okay: string;
  rescue: string;
  rescueTitle: string;
  rescueAction: string;
  cognitiveHelper: string;
  home: string;
  medicines: string;
  call: string;
  profile: string;
  sosActive: string;
  sosHonestSubtitle: string;
  savedLocally: string;
  savedLocallyDetail: string;
  caregiverNotSent: string;
  caregiverNotSentDetail: string;
  locationNotShared: string;
  locationNotSharedDetail: string;
  callPrimary: (name: string) => string;
  noPrimaryContact: string;
  emergencyNumbers: string;
  returnHome: string;
  contactsTitle: string;
  contactsDescription: string;
  contactName: string;
  relationship: string;
  phoneNumber: string;
  saveContact: string;
  directCallNote: string;
  noContacts: string;
  emergencyContacts: string;
  addContact: string;
  medicationTitle: string;
  medicationDescription: string;
  medicationName: string;
  dose: string;
  frequency: string;
  flexibleWindows: string;
  saveMedication: string;
  remindersOn: string;
  remindersOff: string;
  noMedications: string;
  markTaken: string;
  todaySchedules: string;
  addMedication: string;
  flexibleLabel: string;
  defaultTimes: string;
  exactTimeNext: string;
  cancel: string;
  profileTitle: string;
  accessibilityNeeds: string;
  offlineSection: string;
  offlineFacts: string[];
  restartOnboarding: string;
  caregiverTitle: (name: string) => string;
  caregiverNotConnected: string;
  caregiverNotConnectedDetail: string;
  noFamilyMembers: string;
  nativeMilestone: string;
};

export const COPY: Record<Language, Copy> = {
  tl: {
    roleQuestion: 'Paano mo gagamitin ang NakNak?',
    seniorRole: 'Senior / PWD User',
    seniorRoleDescription: 'Safety, gamot, check-in, at emergency support para sa iyo',
    caregiverRole: 'Caregiver / Anak User',
    caregiverRoleDescription: 'Para maalalayan at mabantayan ang kapamilya mo',
    nameTitle: 'Ano ang pangalan mo?',
    nameDescription: 'Gagamitin ito para malinaw at personal ang iyong mga paalala.',
    nameLabel: 'Pangalan',
    namePlaceholder: 'Halimbawa: Nanay Cora',
    continue: 'Magpatuloy',
    back: 'Bumalik',
    accessibilityTitle: (name) => `Paano ka namin matutulungan, ${name}?`,
    accessibilityDescription: 'Pumili ng isa o higit pa. Babaguhin nito ang laki, gabay, at galaw ng app.',
    finish: 'Buksan ang NakNak',
    skip: 'Gamitin muna ang standard na setting',
    greeting: 'Magandang araw,',
    offlineReady: 'Handa ang pangunahing app kahit offline',
    offlineShort: 'Handa offline',
    sosLabel: 'NakNak',
    sosHelp: 'Pindutin kung kailangan mo ng tulong',
    okay: 'Ayos ako',
    rescue: 'Rescue Bridge · Tumawag sa 911 / 112',
    rescueTitle: 'Rescue Bridge',
    rescueAction: 'Tumawag sa 911 / 112',
    cognitiveHelper: 'Kung kailangan mo ng tulong, pindutin ang malaking pulang bilog.',
    home: 'Home',
    medicines: 'Gamot',
    call: 'Tawag',
    profile: 'Profile',
    sosActive: 'Emergency screen active',
    sosHonestSubtitle: 'Walang alert na ipinapakitang naipadala hangga’t hindi ito nakumpirma.',
    savedLocally: 'Naitala sa phone',
    savedLocallyDetail: 'Naka-save ang oras ng paghingi mo ng tulong sa device na ito.',
    caregiverNotSent: 'Hindi pa naipadala sa caregiver',
    caregiverNotSentDetail: 'Hindi pa nakakonekta ang remote caregiver alert sa native build na ito.',
    locationNotShared: 'Hindi ibinahagi ang lokasyon',
    locationNotSharedDetail: 'Walang lokasyong ipinadala nang walang tunay na delivery confirmation.',
    callPrimary: (name) => `Tawagan si ${name}`,
    noPrimaryContact: 'Magdagdag ng emergency contact para sa isang-tap na pagtawag.',
    emergencyNumbers: 'Mga emergency number',
    returnHome: 'Bumalik sa Home',
    contactsTitle: 'Tawag at Rescue Bridge',
    contactsDescription: 'Direktang bubuksan ng NakNak ang phone dialer. Walang dagdag na NakNak confirmation.',
    contactName: 'Pangalan ng contact',
    relationship: 'Relasyon',
    phoneNumber: 'Numero ng telepono',
    saveContact: 'I-save ang contact',
    directCallNote: 'Kailangan pa rin ng cellular signal para makakonekta ang tawag.',
    noContacts: 'Wala pang emergency contact.',
    emergencyContacts: 'Mga emergency contact',
    addContact: 'Magdagdag ng contact',
    medicationTitle: 'Mga gamot',
    medicationDescription: 'Naka-save sa phone ang schedule. Ang local reminder ay maaaring gumana kahit walang internet.',
    medicationName: 'Pangalan ng gamot',
    dose: 'Dose',
    frequency: 'Dalas',
    flexibleWindows: 'Pumili ng oras o bahagi ng araw',
    saveMedication: 'I-save at i-schedule',
    remindersOn: 'Local reminders naka-on',
    remindersOff: 'Naka-save offline · reminders hindi pinayagan',
    noMedications: 'Wala pang gamot na naka-schedule.',
    markTaken: 'Nainom ko na',
    todaySchedules: 'Mga schedule ngayon',
    addMedication: 'Magdagdag ng gamot',
    flexibleLabel: 'Flexible na oras',
    defaultTimes: 'Mga default na oras',
    exactTimeNext: 'Susunod na pagpapahusay ang pag-edit ng eksaktong oras.',
    cancel: 'Kanselahin',
    profileTitle: 'Iyong profile',
    accessibilityNeeds: 'Mga setting sa accessibility',
    offlineSection: 'Ano ang gumagana offline',
    offlineFacts: [
      'Bubukas ang naka-install na native app.',
      'Naka-save sa device ang gamot at emergency contacts.',
      'Maaaring magbukas ang phone dialer; cellular signal ang kailangan sa tawag.',
      'Hindi nagpapanggap ang NakNak na naipadala ang remote alert kapag offline.',
    ],
    restartOnboarding: 'Palitan ang role o profile',
    caregiverTitle: (name) => `Kumusta, ${name}`,
    caregiverNotConnected: 'Hindi pa connected ang family sync',
    caregiverNotConnectedDetail: 'Walang remote SOS, push notification, o live status na ipinapakitang gumagana sa milestone na ito.',
    noFamilyMembers: 'Wala pang family member na nakakonekta.',
    nativeMilestone: 'Senior/PWD emergency at medication flow muna ang unang native milestone.',
  },
  en: {
    roleQuestion: 'How will you use NakNak?',
    seniorRole: 'Senior / PWD User',
    seniorRoleDescription: 'Safety, medicine, check-ins, and emergency support for you',
    caregiverRole: 'Caregiver / Anak User',
    caregiverRoleDescription: 'Support and look after a family member',
    nameTitle: 'What is your name?',
    nameDescription: 'We use this to make reminders clear and personal.',
    nameLabel: 'Name',
    namePlaceholder: 'Example: Nanay Cora',
    continue: 'Continue',
    back: 'Back',
    accessibilityTitle: (name) => `How can we support you, ${name}?`,
    accessibilityDescription: 'Choose one or more. This changes sizing, guidance, and interaction behavior.',
    finish: 'Open NakNak',
    skip: 'Use standard settings',
    greeting: 'Good day,',
    offlineReady: 'Core app ready even when offline',
    offlineShort: 'Ready offline',
    sosLabel: 'NakNak',
    sosHelp: 'Tap if you need help',
    okay: 'I’m okay',
    rescue: 'Rescue Bridge · Call 911 / 112',
    rescueTitle: 'Rescue Bridge',
    rescueAction: 'Call 911 / 112',
    cognitiveHelper: 'If you need help, press the large red circle.',
    home: 'Home',
    medicines: 'Medicine',
    call: 'Call',
    profile: 'Profile',
    sosActive: 'Emergency screen active',
    sosHonestSubtitle: 'NakNak does not show an alert as sent until delivery is genuinely confirmed.',
    savedLocally: 'Recorded on this phone',
    savedLocallyDetail: 'The time you asked for help is saved on this device.',
    caregiverNotSent: 'Not sent to caregiver',
    caregiverNotSentDetail: 'Remote caregiver alerts are not connected in this native milestone.',
    locationNotShared: 'Location not shared',
    locationNotSharedDetail: 'No location is presented as delivered without confirmation.',
    callPrimary: (name) => `Call ${name}`,
    noPrimaryContact: 'Add an emergency contact for one-tap calling.',
    emergencyNumbers: 'Emergency numbers',
    returnHome: 'Return Home',
    contactsTitle: 'Calls and Rescue Bridge',
    contactsDescription: 'NakNak opens the phone dialer directly, without an extra NakNak confirmation.',
    contactName: 'Contact name',
    relationship: 'Relationship',
    phoneNumber: 'Phone number',
    saveContact: 'Save contact',
    directCallNote: 'A cellular signal is still required to connect the call.',
    noContacts: 'No emergency contact yet.',
    emergencyContacts: 'Emergency contacts',
    addContact: 'Add a contact',
    medicationTitle: 'Medications',
    medicationDescription: 'Schedules are stored on the phone. Local reminders can work without internet.',
    medicationName: 'Medication name',
    dose: 'Dose',
    frequency: 'Frequency',
    flexibleWindows: 'Choose times or parts of the day',
    saveMedication: 'Save and schedule',
    remindersOn: 'Local reminders enabled',
    remindersOff: 'Saved offline · reminders not allowed',
    noMedications: 'No medications scheduled yet.',
    markTaken: 'I took this',
    todaySchedules: 'Today’s schedules',
    addMedication: 'Add medication',
    flexibleLabel: 'Flexible timing',
    defaultTimes: 'Default reminder times',
    exactTimeNext: 'Editing exact times is the next medication enhancement.',
    cancel: 'Cancel',
    profileTitle: 'Your profile',
    accessibilityNeeds: 'Accessibility settings',
    offlineSection: 'What works offline',
    offlineFacts: [
      'The installed native app opens.',
      'Medications and emergency contacts stay on the device.',
      'The phone dialer can open; the call requires cellular coverage.',
      'NakNak does not claim a remote alert was delivered while offline.',
    ],
    restartOnboarding: 'Change role or profile',
    caregiverTitle: (name) => `Hello, ${name}`,
    caregiverNotConnected: 'Family sync is not connected yet',
    caregiverNotConnectedDetail: 'This milestone does not claim remote SOS, push notifications, or live status are working.',
    noFamilyMembers: 'No family member is connected yet.',
    nativeMilestone: 'The Senior/PWD emergency and medication flow is the first native milestone.',
  },
  ceb: {
    roleQuestion: 'Unsaon nimo paggamit ang NakNak?',
    seniorRole: 'Senior / PWD User',
    seniorRoleDescription: 'Safety, tambal, check-in, ug emergency support para nimo',
    caregiverRole: 'Caregiver / Anak User',
    caregiverRoleDescription: 'Para maatiman ug mabantayan ang imong kapamilya',
    nameTitle: 'Unsa imong ngalan?',
    nameDescription: 'Gamiton kini aron klaro ug personal ang mga pahinumdom.',
    nameLabel: 'Ngalan',
    namePlaceholder: 'Pananglitan: Nanay Cora',
    continue: 'Padayon',
    back: 'Balik',
    accessibilityTitle: (name) => `Unsaon namo pagtabang nimo, ${name}?`,
    accessibilityDescription: 'Pili ug usa o daghan. Mausab niini ang gidak-on ug giya sa app.',
    finish: 'Ablihi ang NakNak',
    skip: 'Gamita una ang standard nga setting',
    greeting: 'Maayong adlaw,',
    offlineReady: 'Andam ang pangunang app bisan offline',
    offlineShort: 'Andam offline',
    sosLabel: 'NakNak',
    sosHelp: 'Pindota kung kinahanglan ka ug tabang',
    okay: 'Okay ra ko',
    rescue: 'Rescue Bridge · Tawag 911 / 112',
    rescueTitle: 'Rescue Bridge',
    rescueAction: 'Tawag sa 911 / 112',
    cognitiveHelper: 'Kung kinahanglan ka ug tabang, pindota ang dako nga pula nga lingin.',
    home: 'Home',
    medicines: 'Tambal',
    call: 'Tawag',
    profile: 'Profile',
    sosActive: 'Aktibo ang emergency screen',
    sosHonestSubtitle: 'Dili ipakita sa NakNak nga napadala ang alert hangtod makumpirma gyud.',
    savedLocally: 'Narekord sa phone',
    savedLocallyDetail: 'Naka-save sa device ang oras sa imong pagpangayo ug tabang.',
    caregiverNotSent: 'Wala pa napadala sa caregiver',
    caregiverNotSentDetail: 'Wala pa nakakonekta ang remote caregiver alert niini nga milestone.',
    locationNotShared: 'Wala gipaambit ang lokasyon',
    locationNotSharedDetail: 'Walay lokasyon nga giingong napadala kung walay kumpirmasyon.',
    callPrimary: (name) => `Tawagi si ${name}`,
    noPrimaryContact: 'Pagdugang ug emergency contact para sa usa ka tap nga tawag.',
    emergencyNumbers: 'Mga emergency number',
    returnHome: 'Balik sa Home',
    contactsTitle: 'Tawag ug Rescue Bridge',
    contactsDescription: 'Direktang ablihan sa NakNak ang phone dialer, walay dugang nga NakNak confirmation.',
    contactName: 'Ngalan sa contact',
    relationship: 'Relasyon',
    phoneNumber: 'Numero sa telepono',
    saveContact: 'I-save ang contact',
    directCallNote: 'Kinahanglan gihapon ug cellular signal aron makakonekta ang tawag.',
    noContacts: 'Wala pay emergency contact.',
    emergencyContacts: 'Mga emergency contact',
    addContact: 'Pagdugang ug contact',
    medicationTitle: 'Mga tambal',
    medicationDescription: 'Naka-save sa phone ang schedule. Ang local reminder mahimong molihok bisan walay internet.',
    medicationName: 'Ngalan sa tambal',
    dose: 'Dose',
    frequency: 'Kadaghanon',
    flexibleWindows: 'Pili ug oras o bahin sa adlaw',
    saveMedication: 'I-save ug i-schedule',
    remindersOn: 'Naka-on ang local reminders',
    remindersOff: 'Naka-save offline · reminders wala gitugotan',
    noMedications: 'Wala pay tambal nga naka-schedule.',
    markTaken: 'Nainom na nako',
    todaySchedules: 'Mga schedule karon',
    addMedication: 'Pagdugang ug tambal',
    flexibleLabel: 'Flexible nga oras',
    defaultTimes: 'Mga default nga oras',
    exactTimeNext: 'Ang sunod nga pagpaayo mao ang pag-edit sa eksaktong oras.',
    cancel: 'Kanselahon',
    profileTitle: 'Imong profile',
    accessibilityNeeds: 'Mga setting sa accessibility',
    offlineSection: 'Unsa ang molihok offline',
    offlineFacts: [
      'Moabli ang naka-install nga native app.',
      'Naa sa device ang tambal ug emergency contacts.',
      'Maablihan ang phone dialer; cellular signal ang kinahanglan sa tawag.',
      'Dili moingon ang NakNak nga nadeliver ang remote alert kung offline.',
    ],
    restartOnboarding: 'Ilisi ang role o profile',
    caregiverTitle: (name) => `Kumusta, ${name}`,
    caregiverNotConnected: 'Wala pa nakakonekta ang family sync',
    caregiverNotConnectedDetail: 'Walay remote SOS, push notification, o live status nga giingong aktibo niini nga milestone.',
    noFamilyMembers: 'Wala pay kapamilya nga nakakonekta.',
    nativeMilestone: 'Ang Senior/PWD emergency ug medication flow mao ang unang native milestone.',
  },
};

export const ACCESSIBILITY_OPTIONS: Record<
  AccessibilityNeed,
  {
    icon: 'eye-outline' | 'ear-hearing' | 'wheelchair-accessibility' | 'head-cog-outline' | 'hand-heart';
    label: Record<Language, string>;
    description: Record<Language, string>;
  }
> = {
  vision: {
    icon: 'eye-outline',
    label: { tl: 'Visual', en: 'Visual', ceb: 'Visual' },
    description: { tl: 'Mas malaking text at contrast', en: 'Larger text and contrast', ceb: 'Mas dako nga text ug contrast' },
  },
  hearing: {
    icon: 'ear-hearing',
    label: { tl: 'Hearing', en: 'Hearing', ceb: 'Hearing' },
    description: { tl: 'Visual at haptic na feedback', en: 'Visual and haptic feedback', ceb: 'Visual ug haptic feedback' },
  },
  mobility: {
    icon: 'wheelchair-accessibility',
    label: { tl: 'Mobility / Physical', en: 'Mobility / Physical', ceb: 'Mobility / Physical' },
    description: { tl: 'Mas malalaki at hiwalay na controls', en: 'Larger, separated controls', ceb: 'Mas dako ug bulag nga controls' },
  },
  cognitive: {
    icon: 'head-cog-outline',
    label: { tl: 'Cognitive / Memory', en: 'Cognitive / Memory', ceb: 'Cognitive / Memory' },
    description: { tl: 'Mas kaunting choices at malinaw na gabay', en: 'Fewer choices and clear guidance', ceb: 'Mas gamay nga choices ug klaro nga giya' },
  },
  general: {
    icon: 'hand-heart',
    label: { tl: 'General Assistance', en: 'General Assistance', ceb: 'General Assistance' },
    description: { tl: 'Extra laki at gabay sa mahahalagang aksyon', en: 'Extra sizing and guidance for key actions', ceb: 'Dugang gidak-on ug giya sa importanteng aksyon' },
  },
};

export const WINDOW_LABELS: Record<MedicationWindow, Record<Language, string>> = {
  morning: { tl: 'Umaga · 8:00', en: 'Morning · 8:00', ceb: 'Buntag · 8:00' },
  noon: { tl: 'Tanghali · 12:00', en: 'Noon · 12:00', ceb: 'Udto · 12:00' },
  afternoon: { tl: 'Hapon · 4:00', en: 'Afternoon · 4:00', ceb: 'Hapon · 4:00' },
  evening: { tl: 'Gabi · 7:00', en: 'Evening · 7:00', ceb: 'Gabii · 7:00' },
  bedtime: { tl: 'Bago matulog · 9:00', en: 'Bedtime · 9:00', ceb: 'Sa dili pa matulog · 9:00' },
};
