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
