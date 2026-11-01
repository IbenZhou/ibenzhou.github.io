export function clampFont(px, min, max) {
  return Math.min(max, Math.max(min, Math.round(px)));
}

// A stored value can be missing, corrupt or out of band (an older build, a hand-edited
// localStorage, a private-mode failure), so read it defensively instead of trusting it.
export function readFontSize(raw, { min, max, fallback }) {
  const value = Number(raw);
  if (raw === null || raw === undefined || raw === '' || !Number.isFinite(value)) return fallback;
  if (value < min || value > max) return fallback;
  return Math.round(value);
}

// A mouse notch, a two-finger swipe and a trackpad pinch report wildly different deltaY
// values, so normalise everything to "one pixel of text per notch" and let the caller
// carry the remainder across events.
export function wheelStep(e, limit = 2) {
  const raw = e.deltaMode === 1 ? e.deltaY / 3 : e.deltaMode === 2 ? e.deltaY / 10 : e.deltaY / 100;
  return Math.max(-limit, Math.min(limit, raw));
}

// Positive return means "grow the text"; scrolling up should zoom in. A change of
// direction drops the banked fraction, otherwise a remainder from previous upward
// swipes would absorb the first notch of a downward flick and nothing would move.
export function accumulateZoom(carry, e, limit = 2) {
  const step = -wheelStep(e, limit);
  const base = carry && Math.sign(carry) !== Math.sign(step) ? 0 : carry;
  const next = base + step;
  const whole = Math.trunc(next);
  return { whole, carry: next - whole };
}
