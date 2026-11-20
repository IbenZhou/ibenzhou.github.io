const DATA_LINE_MAX = 24;

function looksLikeData(line) {
  const text = line.trim();
  if (!text || text.length > DATA_LINE_MAX) return false;
  if (/\s/.test(text)) return false;
  return !/[.,;:!?]$/.test(text);
}

// Prompts are hard-wrapped at the source, so join a broken sentence back up while
// keeping the breaks that carry meaning: after a colon, and around short data lines.
function joinSoft(lines) {
  let out = '';
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].trim();
    if (i > 0) {
      const previous = lines[i - 1].trim();
      const keepBreak = previous.endsWith(':') || looksLikeData(previous) || looksLikeData(line);
      out += keepBreak ? '\n' : ' ';
    }
    out += line;
  }
  return out;
}

const INLINE = /(`([^`\n]+)`|\*\*([^*\n]+)\*\*)/g;

function inlineNodes(text) {
  const fragment = document.createDocumentFragment();
  let last = 0;
  for (const match of text.matchAll(INLINE)) {
    if (match.index > last) fragment.append(text.slice(last, match.index));
    if (match[2] !== undefined) {
      const code = document.createElement('code');
      code.textContent = match[2];
      fragment.append(code);
    } else {
      const strong = document.createElement('strong');
      strong.textContent = match[3];
      fragment.append(strong);
    }
    last = match.index + match[0].length;
  }
  if (last < text.length) fragment.append(text.slice(last));
  return fragment;
}

export function renderPrompt(text) {
  const fragment = document.createDocumentFragment();
  const lines = String(text ?? '').split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i += 1; continue; }

    if (/^\s*```/.test(line)) {
      i += 1;
      const code = [];
      while (i < lines.length && !/^\s*```/.test(lines[i])) { code.push(lines[i]); i += 1; }
      if (i < lines.length) i += 1;
      const pre = document.createElement('pre');
      pre.className = 'code-block';
      pre.textContent = code.join('\n');
      fragment.append(pre);
      continue;
    }

    if (/^\s*[-*]\s+/.test(line)) {
      const list = document.createElement('ul');
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        const parts = [lines[i].replace(/^\s*[-*]\s+/, '')];
        i += 1;
        while (i < lines.length && lines[i].trim() && /^\s+/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i])) {
          parts.push(lines[i].trim());
          i += 1;
        }
        const li = document.createElement('li');
        li.append(inlineNodes(joinSoft(parts)));
        list.append(li);
      }
      fragment.append(list);
      continue;
    }

    const paragraph = [];
    while (i < lines.length && lines[i].trim() && !/^\s*```/.test(lines[i]) && !/^\s*[-*]\s+/.test(lines[i])) {
      paragraph.push(lines[i]);
      i += 1;
    }
    const p = document.createElement('p');
    p.append(inlineNodes(joinSoft(paragraph)));
    fragment.append(p);
  }

  return fragment;
}
