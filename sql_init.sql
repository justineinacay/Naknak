CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  assigneeUid TEXT,
  assigneeName TEXT,
  assigneeInitials TEXT,
  assigneeColor TEXT,
  clientId TEXT,
  project TEXT,
  priority TEXT,
  dueDate TEXT,
  done BOOLEAN DEFAULT FALSE,
  isOos BOOLEAN DEFAULT FALSE,
  oosValue INTEGER,
  createdDate TEXT,
  completedDate TEXT,
  firstResponseAt TEXT,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  clientPin TEXT,
  status TEXT,
  package TEXT,
  rateUsd INTEGER,
  vaCostPhp INTEGER,
  priority TEXT,
  assignedVaUid TEXT,
  assignedVa TEXT,
  assignedVaInitials TEXT,
  assignedVaColor TEXT,
  lastContact TEXT,
  contractEnd TEXT,
  timezone TEXT,
  healthScore INTEGER,
  onboardingStep INTEGER,
  onboardingDone BOOLEAN DEFAULT FALSE,
  oosCount INTEGER DEFAULT 0,
  oosValue INTEGER DEFAULT 0,
  archived BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  clientId TEXT,
  contact TEXT,
  contactRole TEXT,
  type TEXT,
  assignedVaUid TEXT,
  preview TEXT,
  messages JSONB DEFAULT '[]'::jsonb,
  unread INTEGER DEFAULT 0,
  updatedAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE timelogs (
  id TEXT PRIMARY KEY,
  vaUid TEXT,
  taskId TEXT,
  taskTitle TEXT,
  description TEXT,
  date TEXT,
  minutes INTEGER,
  seconds INTEGER,
  note TEXT,
  archived BOOLEAN DEFAULT FALSE
);

CREATE TABLE team (
  id TEXT PRIMARY KEY,
  displayName TEXT,
  email TEXT,
  role TEXT,
  initials TEXT,
  avatarColor TEXT,
  capacity INTEGER,
  status TEXT,
  skills JSONB,
  clientCount INTEGER,
  pin TEXT,
  kpi JSONB
);

CREATE TABLE content (
  id TEXT PRIMARY KEY,
  clientId TEXT,
  title TEXT,
  platform TEXT,
  dueLabel TEXT,
  urgency TEXT,
  status TEXT,
  vaName TEXT,
  vaInitials TEXT,
  vaColor TEXT,
  archived BOOLEAN DEFAULT FALSE
);

CREATE TABLE invoices (
  id TEXT PRIMARY KEY,
  number TEXT,
  clientId TEXT,
  client TEXT,
  amountUsd INTEGER,
  status TEXT,
  issuedDate TEXT,
  dueDate TEXT,
  paidAt TEXT,
  archived BOOLEAN DEFAULT FALSE
);

CREATE TABLE goals (
  id TEXT PRIMARY KEY,
  name TEXT,
  status TEXT,
  category TEXT,
  current INTEGER,
  target INTEGER,
  unit TEXT,
  quarter TEXT,
  year INTEGER,
  archived BOOLEAN DEFAULT FALSE
);

CREATE TABLE sops (
  id TEXT PRIMARY KEY,
  emoji TEXT,
  title TEXT,
  driveUrl TEXT,
  steps JSONB
);

CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  user_name TEXT,
  userInitials TEXT,
  action TEXT,
  type TEXT,
  record TEXT,
  icon TEXT,
  color TEXT,
  ts INTEGER
);
