import { readFontSize } from './font-zoom.js';

const PREFIX = 'sql9618.';
function store() {
  try {
    const probe = `${PREFIX}probe`;
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    return window.localStorage;
  } catch {
    return null;
  }
}

const mem = new Map();

function get(key) {
  const s = store();
  if (!s) return mem.get(key) ?? null;
  try { return s.getItem(PREFIX + key); } catch { return null; }
}

function set(key, value) {
  const s = store();
  if (!s) { mem.set(key, value); return; }
  try { s.setItem(PREFIX + key, value); } catch { /* quota or private mode */ }
}

export function loadBuffer(id) {
  return get(`buffer.${id}`) ?? '';
}

export function saveBuffer(id, text) {
  set(`buffer.${id}`, text);
}

export function listBufferIds() {
  const s = store();
  if (!s) return [...mem.keys()].map(k => k.slice('buffer.'.length));
  const ids = [];
  for (let i = 0; i < s.length; i++) {
    const k = s.key(i);
    if (k?.startsWith(`${PREFIX}buffer.`)) ids.push(k.slice(PREFIX.length + 'buffer.'.length));
  }
  return ids;
}

export function loadTheme() { return get('theme') ?? 'light'; }
export function saveTheme(t) { set('theme', t); }
export function loadSelected() { return get('selected') ?? ''; }
export function saveSelected(id) { set('selected', id); }

export const MIN_FONT = 10;
export const MAX_FONT = 26;
export const DEFAULT_FONT = 14;

export function loadFontSize() {
  return readFontSize(get('fontSize'), { min: MIN_FONT, max: MAX_FONT, fallback: DEFAULT_FONT });
}

export function saveFontSize(px) {
  set('fontSize', String(Math.round(px)));
}

export function loadDoneList() {
  try {
    const raw = JSON.parse(get('training.done') || '[]');
    return Array.isArray(raw) ? raw.filter(x => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

export function markDone(id) {
  const done = new Set(loadDoneList());
  done.add(id);
  set('training.done', JSON.stringify([...done]));
}

export function clearDone() {
  set('training.done', '[]');
}

// The wrong-answer book: { [taskId]: { attempts, last } }, never uploaded.
export function loadWrongBook() {
  try {
    const raw = JSON.parse(get('training.wrong') || '{}');
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
    const book = {};
    for (const [id, entry] of Object.entries(raw)) {
      if (!entry || typeof entry !== 'object') continue;
      book[id] = {
        attempts: Number.isFinite(entry.attempts) ? entry.attempts : 1,
        last: Number.isFinite(entry.last) ? entry.last : 0,
      };
    }
    return book;
  } catch {
    return {};
  }
}

export function saveWrongBook(book) {
  set('training.wrong', JSON.stringify(book));
}

export function recordWrong(id) {
  const book = loadWrongBook();
  const previous = book[id];
  book[id] = { attempts: (previous ? previous.attempts : 0) + 1, last: Date.now() };
  saveWrongBook(book);
  return book;
}

export function clearWrong(id) {
  const book = loadWrongBook();
  if (!(id in book)) return book;
  delete book[id];
  saveWrongBook(book);
  return book;
}

export function clearWrongBook() {
  set('training.wrong', '{}');
}
