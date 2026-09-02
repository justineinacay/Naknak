import * as SQLite from 'expo-sqlite';

import { INITIAL_STATE, NakNakState } from '@/types/naknak';

const databasePromise = SQLite.openDatabaseAsync('naknak.db');

async function prepareDatabase() {
  const database = await databasePromise;
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS naknak_state (
      key TEXT PRIMARY KEY NOT NULL,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
  `);
  return database;
}

export async function loadState(): Promise<NakNakState> {
  const database = await prepareDatabase();
  const row = await database.getFirstAsync<{ value: string }>(
    'SELECT value FROM naknak_state WHERE key = ?',
    'app_state',
  );

  if (!row?.value) return INITIAL_STATE;

  try {
    const parsed = JSON.parse(row.value) as NakNakState;
    return parsed.schemaVersion === 1 ? parsed : INITIAL_STATE;
  } catch {
    return INITIAL_STATE;
  }
}

export async function saveState(state: NakNakState): Promise<void> {
  const database = await prepareDatabase();
  await database.runAsync(
    `INSERT INTO naknak_state (key, value, updated_at)
     VALUES (?, ?, ?)
     ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at`,
    'app_state',
    JSON.stringify(state),
    new Date().toISOString(),
  );
}

export async function clearState(): Promise<void> {
  const database = await prepareDatabase();
  await database.runAsync('DELETE FROM naknak_state WHERE key = ?', 'app_state');
}
