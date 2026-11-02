export function encodeState(object) {
  const bytes = new TextEncoder().encode(JSON.stringify(object));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeState(text) {
  let base = text.replace(/-/g, "+").replace(/_/g, "/");
  while (base.length % 4) base += "=";
  const binary = atob(base);
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes));
}
