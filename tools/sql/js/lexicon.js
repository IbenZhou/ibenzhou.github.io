export const KEYWORDS_9618 = [
  'SELECT', 'FROM', 'WHERE', 'ORDER', 'BY', 'GROUP', 'INNER', 'JOIN', 'AS',
  'AND', 'OR', 'NOT', 'NULL', 'IS', 'IN', 'BETWEEN', 'LIKE', 'INSERT', 'INTO',
  'VALUES', 'UPDATE', 'SET', 'DELETE', 'CREATE', 'DATABASE', 'TABLE', 'ALTER',
  'ADD', 'COLUMN', 'DROP', 'PRIMARY', 'KEY', 'FOREIGN', 'REFERENCES', 'UNIQUE',
  'DEFAULT', 'CHECK', 'ASC', 'DESC', 'COUNT', 'SUM', 'AVG',
  'CHARACTER', 'VARCHAR', 'BOOLEAN', 'INTEGER', 'REAL', 'DATE', 'TIME',
];

const KEYWORD_SET = new Set(KEYWORDS_9618);

const TYPES = {
  space: 'whitespace',
  comment: 'comment',
  string: 'string',
  qident: 'identifier.quote',
  number: 'number',
  ident: 'identifier',
  keyword: 'keyword',
  op: 'operator',
  punct: 'delimiter',
};

export function tokenize(sql) {
  const out = [];
  let i = 0;

  while (i < sql.length) {
    const at = i;
    const ch = sql[i];
    const two = sql.slice(i, i + 2);
    const push = (type, text) => out.push({ type, text, start: at, end: i });

    if (two === '--') {
      while (i < sql.length && sql[i] !== '\n') i++;
      push('comment', sql.slice(at, i));
      continue;
    }
    if (two === '/*') {
      let depth = 1;
      i += 2;
      while (i < sql.length && depth > 0) {
        const pair = sql.slice(i, i + 2);
        if (pair === '/*') { depth++; i += 2; }
        else if (pair === '*/') { depth--; i += 2; }
        else i++;
      }
      push('comment', sql.slice(at, i));
      continue;
    }
    if (ch === "'") {
      i++;
      while (i < sql.length) {
        if (sql[i] === "'") {
          if (sql[i + 1] === "'") { i += 2; continue; }
          i++;
          break;
        }
        i++;
      }
      push('string', sql.slice(at, i));
      continue;
    }
    if (ch === '$' && /^\$[A-Za-z_]*\$/.test(sql.slice(i))) {
      const open = /^\$[A-Za-z_]*\$/.exec(sql.slice(i))[0];
      const close = sql.indexOf(open, i + open.length);
      i = close === -1 ? sql.length : close + open.length;
      push('string', sql.slice(at, i));
      continue;
    }
    if (ch === '"') {
      i++;
      while (i < sql.length && sql[i] !== '"') i++;
      i++;
      push('qident', sql.slice(at, i));
      continue;
    }
    if (/\s/.test(ch)) {
      while (i < sql.length && /\s/.test(sql[i])) i++;
      push('space', sql.slice(at, i));
      continue;
    }
    if (/[0-9]/.test(ch) || (ch === '.' && /[0-9]/.test(sql[i + 1] || ''))) {
      while (i < sql.length && /[0-9.]/.test(sql[i])) i++;
      push('number', sql.slice(at, i));
      continue;
    }
    if (/[A-Za-z_]/.test(ch)) {
      while (i < sql.length && /[A-Za-z0-9_$]/.test(sql[i])) i++;
      const word = sql.slice(at, i);
      push(KEYWORD_SET.has(word.toUpperCase()) ? 'keyword' : 'ident', word);
      continue;
    }
    if (/[<>=!]/.test(ch)) {
      while (i < sql.length && /[<>=!]/.test(sql[i])) i++;
      push('op', sql.slice(at, i));
      continue;
    }
    i++;
    push('punct', ch);
  }
  return out;
}

export function meaningful(sql) {
  return tokenize(sql).filter(t => t.type !== 'space' && t.type !== 'comment');
}

export function wordSequence(tokens) {
  return tokens.filter(t => t.type === 'keyword' || t.type === 'ident')
    .map(t => t.text.toUpperCase());
}

export function splitStatements(sql) {
  const tokens = tokenize(sql);
  const statements = [];
  let from = 0;

  for (const t of tokens) {
    if (t.type === 'punct' && t.text === ';') {
      const text = sql.slice(from, t.end - 1);
      if (meaningful(text).length) statements.push({ text, start: from, end: t.end });
      from = t.end;
    }
  }

  const tail = sql.slice(from);
  if (meaningful(tail).length) statements.push({ text: tail, start: from, end: sql.length });
  return statements;
}

export function registerLanguage(monaco) {
  if (monaco.languages.getLanguages().some(l => l.id === 'sql9618')) return;

  monaco.languages.register({ id: 'sql9618' });

  monaco.languages.setMonarchTokensProvider('sql9618', {
    ignoreCase: true,
    keywords: KEYWORDS_9618,
    tokenizer: {
      root: [
        [/--.*$/, 'comment'],
        [/\/\*/, 'comment', '@block'],
        [/'(?:[^']|'')*'?/, 'string'],
        [/"[^"]*"?/, 'identifier.quote'],
        [/\d+(\.\d+)?/, 'number'],
        [/[A-Za-z_][A-Za-z0-9_$]*/, {
          cases: { '@keywords': 'keyword', '@default': 'identifier' },
        }],
        [/[<>=!]+/, 'operator'],
        [/[(),;.]/, 'delimiter'],
      ],
      block: [
        [/[^/*]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/[/*]/, 'comment'],
      ],
    },
  });

  monaco.languages.setLanguageConfiguration('sql9618', {
    comments: { lineComment: '--', blockComment: ['/*', '*/'] },
    brackets: [['(', ')'], ['[', ']']],
    autoClosingPairs: [
      { open: '(', close: ')' },
      { open: "'", close: "'" },
      { open: '"', close: '"' },
    ],
  });
}
