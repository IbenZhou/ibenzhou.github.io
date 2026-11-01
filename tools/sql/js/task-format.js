function unquote(v) {
  const s = v.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) return s.slice(1, -1);
  return s;
}
export function parseDocument(text) {
  const src = text.replace(/\r\n/g, '\n');
  const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(src);
  if (!match) return { meta: {}, body: src.trim() };

  const meta = {};
  const lines = match[1].split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim() || line.trimStart().startsWith('#')) continue;

    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line);
    if (!kv) continue;

    const key = kv[1];
    const rest = kv[2];

    if (rest.startsWith('|')) {
      const collected = [];
      let j = i + 1;
      for (; j < lines.length; j++) {
        const next = lines[j];
        if (next.trim() === '') { collected.push(''); continue; }
        if (!/^\s/.test(next)) break;
        collected.push(next.replace(/^\s{2}/, ''));
      }
      meta[key] = collected.join('\n').replace(/\n+$/, '') + (rest === '|' ? '\n' : '');
      i = j - 1;
      continue;
    }
    if (rest === '') { meta[key] = ''; continue; }
    meta[key] = unquote(rest);
  }

  return { meta, body: match[2].trim() };
}

export function buildTask(id, text) {
  const { meta, body } = parseDocument(text);
  const task = {
    id,
    section: meta.section ?? '8.3',
    kind: meta.kind ?? 'dml',
    title: meta.title ?? id,
    marks: Number(meta.marks ?? 0),
    prompt: (meta.prompt || body || '').trim(),
    schema: (meta.schema ?? '').trim(),
    seed: (meta.seed ?? '').trim(),
    answer: (meta.answer ?? '').trim(),
    starter: meta.starter ?? '',
    check: meta.check ?? 'rows',
    wrong: (meta.wrong ?? '').trim(),
    checkTable: (meta.checktable ?? meta.checkTable ?? '').trim(),
    expectName: (meta.expectname ?? meta.expectName ?? '').trim(),
    coverage: (meta.coverage ?? '').split(/[,;]/).map(s => s.trim()).filter(Boolean),
    notes: meta.notes ?? '',
  };

  if (!task.answer && task.kind !== 'sandbox') {
    throw new Error(`task ${id}: no model answer`);
  }
  return task;
}
