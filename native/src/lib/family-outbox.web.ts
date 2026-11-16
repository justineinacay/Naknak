import type { QueuedFamilyEvent } from './family-outbox.native';

// Browser-only preview persistence; does not grant server access or guarantee delivery.
// The real iOS/Android build uses the .native.ts SQLite implementation.
const KEY = 'naknak_family_outbox_preview_v1';
const read = (): QueuedFamilyEvent[] => {
  if(typeof localStorage==='undefined')return [];
  try {
    const value=JSON.parse(localStorage.getItem(KEY)||'[]');
    return Array.isArray(value)?value:[];
  } catch {return [];}
};
const write = (rows:QueuedFamilyEvent[])=>{
  if(typeof localStorage!=='undefined')localStorage.setItem(KEY,JSON.stringify(rows));
};
export async function enqueueFamilyEvent(e: Omit<QueuedFamilyEvent,'attempts'>):Promise<void>{
  const rows=read();
  if(!rows.some(x=>x.id===e.id))write([...rows,{...e,attempts:0}]);
}
export async function listDueFamilyEvents(householdId:string):Promise<QueuedFamilyEvent[]>{
  return read().filter(e=>e.householdId===householdId).slice(0,30);
}
export async function removeFamilyEvent(id:string):Promise<void>{
  write(read().filter(e=>e.id!==id));
}
export async function retryFamilyEvent(id:string,attempts:number):Promise<void>{
  write(read().map(e=>e.id===id?{...e,attempts:attempts+1}:e));
}
export async function familyOutboxCount(householdId:string):Promise<number>{
  return read().filter(e=>e.householdId===householdId).length;
}
export async function isFamilyEventPending(id:string):Promise<boolean>{
  return read().some(e=>e.id===id);
}
export async function clearFamilyOutbox():Promise<void>{write([]);}
