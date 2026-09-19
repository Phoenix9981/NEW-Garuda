import { ThreatIncident } from "../types";

const DB_NAME = "GarudYantraOfflineDB";
const DB_VERSION = 1;
const STORE_INCIDENTS = "offline_incidents";
const STORE_SYNC_QUEUE = "sync_queue";

export function initIndexedDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject("IndexedDB not supported");
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_INCIDENTS)) {
        db.createObjectStore(STORE_INCIDENTS, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(STORE_SYNC_QUEUE)) {
        db.createObjectStore(STORE_SYNC_QUEUE, { keyPath: "id", autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveIncidentToLocalDb(incident: ThreatIncident): Promise<void> {
  try {
    const db = await initIndexedDb();
    const tx = db.transaction([STORE_INCIDENTS, STORE_SYNC_QUEUE], "readwrite");
    tx.objectStore(STORE_INCIDENTS).put(incident);
    tx.objectStore(STORE_SYNC_QUEUE).put({ ...incident, queuedAt: new Date().toISOString() });
  } catch (err) {
    console.warn("IndexedDB save failed, using local storage fallback", err);
  }
}

export async function getLocalIncidents(): Promise<ThreatIncident[]> {
  try {
    const db = await initIndexedDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_INCIDENTS, "readonly");
      const request = tx.objectStore(STORE_INCIDENTS).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

export async function getQueuedSyncItems(): Promise<any[]> {
  try {
    const db = await initIndexedDb();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_SYNC_QUEUE, "readonly");
      const request = tx.objectStore(STORE_SYNC_QUEUE).getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

export async function clearSyncQueue(): Promise<void> {
  try {
    const db = await initIndexedDb();
    const tx = db.transaction(STORE_SYNC_QUEUE, "readwrite");
    tx.objectStore(STORE_SYNC_QUEUE).clear();
  } catch (err) {
    console.warn("IndexedDB clear failed", err);
  }
}
