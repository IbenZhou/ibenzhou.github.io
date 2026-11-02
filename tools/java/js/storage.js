const DB_NAME = "iben-java-sandbox";
const DB_VERSION = 1;
const STORE = "programs";

let openPromise = null;

export function newId() {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB request failed"));
  });
}

export function openDb() {
  if (openPromise) return openPromise;
  openPromise = new Promise((resolve, reject) => {
    if (!("indexedDB" in globalThis)) {
      reject(new Error("IndexedDB is not available"));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("Could not open IndexedDB"));
    request.onblocked = () => reject(new Error("IndexedDB is blocked by another tab"));
  });
  return openPromise;
}

export async function listPrograms() {
  const db = await openDb();
  const tx = db.transaction(STORE, "readonly");
  return requestToPromise(tx.objectStore(STORE).getAll());
}

export async function putProgram(record) {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  await requestToPromise(tx.objectStore(STORE).put(record));
  return record;
}

export async function deleteProgram(id) {
  const db = await openDb();
  const tx = db.transaction(STORE, "readwrite");
  await requestToPromise(tx.objectStore(STORE).delete(id));
}
