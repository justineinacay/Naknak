import * as SQLite from 'expo-sqlite';

export type QueuedFamilyEvent = {
  id: string;
  householdId: string;
  memberId: string;
  event: 'check_in_ok' | 'sos_opened';
  occurredAt: string;
  attempts: number;
};

const databasePromise = SQLite.openDatabaseAsync('naknak.db');

async function database() {
  const db = await databasePromise;
  await db.execAsync(
    "CREATE TABLE IF NOT EXISTS naknak_family_outbox (" +
    "id TEXT PRIMARY KEY NOT NULL," +
    "household_id TEXT NOT NULL," +
    "member_id TEXT NOT NULL," +
    "event TEXT NOT NULL CHECK(event IN ('check_in_ok', 'sos_opened'))," +
    "occurred_at TEXT NOT NULL," +
    "attempts INTEGER NOT NULL DEFAULT 0," +
    "next_attempt_at TEXT NOT NULL);" +
    "CREATE INDEX IF NOT EXISTS naknak_family_outbox_due_idx " +
    "ON naknak_family_outbox(household_id, next_attempt_at);"
  );
  return db;
}

export async function enqueueFamilyEvent(event: Omit<QueuedFamilyEvent, 'attempts'>): Promise<void> {
  const db = await database();
  await db.runAsync(
    "INSERT INTO naknak_family_outbox " +
    "(id, household_id, member_id, event, occurred_at, next_attempt_at) " +
    "VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING",
    event.id,event.householdId,event.memberId,event.event,event.occurredAt,new Date(0).toISOString(),
  );
}

export async function listDueFamilyEvents(householdId: string): Promise<QueuedFamilyEvent[]> {
  const db = await database();
  const rows = await db.getAllAsync<{
    id: string; household_id: string; member_id: string;
    event: 'check_in_ok' | 'sos_opened'; occurred_at: string; attempts: number;
  }>(
    "SELECT id,household_id,member_id,event,occurred_at,attempts " +
    "FROM naknak_family_outbox WHERE household_id = ? AND next_attempt_at <= ? " +
    "ORDER BY occurred_at ASC LIMIT 30",
    householdId,new Date().toISOString(),
  );
  return rows.map(r=>({
    id:r.id,householdId:r.household_id,memberId:r.member_id,
    event:r.event,occurredAt:r.occurred_at,attempts:r.attempts,
  }));
}

export async function removeFamilyEvent(id: string): Promise<void> {
  const db = await database();
  await db.runAsync('DELETE FROM naknak_family_outbox WHERE id = ?',id);
}

export async function retryFamilyEvent(id: string,attempts: number): Promise<void> {
  const delayMs=Math.min(5*60_000,5_000*2**Math.min(attempts,6));
  const db=await database();
  await db.runAsync(
    'UPDATE naknak_family_outbox SET attempts = ?, next_attempt_at = ? WHERE id = ?',
    attempts+1,new Date(Date.now()+delayMs).toISOString(),id,
  );
}

export async function familyOutboxCount(householdId: string): Promise<number> {
  const db=await database();
  const row=await db.getFirstAsync<{total:number}>(
    'SELECT COUNT(*) AS total FROM naknak_family_outbox WHERE household_id = ?',householdId,
  );
  return row?.total??0;
}

export async function isFamilyEventPending(id: string): Promise<boolean> {
  const db=await database();
  const row=await db.getFirstAsync<{id:string}>(
    'SELECT id FROM naknak_family_outbox WHERE id = ?',id,
  );
  return Boolean(row);
}

export async function clearFamilyOutbox(): Promise<void> {
  const db=await database();
  await db.runAsync('DELETE FROM naknak_family_outbox');
}
