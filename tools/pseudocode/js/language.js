import { keywordsFor, builtinListFor } from "./reference.js";
import { BUILTINS } from "./builtins.js";

// Shared Monaco language setup for the editor page and the practice page.
// `getDialect` returns the active dialect object, so completion follows the
// syllabus switch without duplicating the definition.

/* ------------------------------------------------------------- monaco setup */

export function defineThemes() {
  const base = {
    "editor.background": "#ffffff",
    "editor.foreground": "#1c1f24",
    "editorLineNumber.foreground": "#b6bcc6",
    "editorGutter.background": "#f6f7f9",
  };
  monaco.editor.defineTheme("pc-light", {
    base: "vs", inherit: true, rules: [
      { token: "keyword", foreground: "b4245a", fontStyle: "bold" },
      { token: "builtin", foreground: "1f6feb" },
      { token: "string", foreground: "0a7d43" },
      { token: "string.quote", foreground: "0a7d43" },
      { token: "number", foreground: "8a4b00" },
      { token: "comment", foreground: "8b949e", fontStyle: "italic" },
      { token: "operator", foreground: "6f42c1" },
    ], colors: base,
  });
  monaco.editor.defineTheme("pc-dark", {
    base: "vs-dark", inherit: true, rules: [
      { token: "keyword", foreground: "f27ba7", fontStyle: "bold" },
      { token: "builtin", foreground: "79b8ff" },
      { token: "string", foreground: "6bd693" },
      { token: "string.quote", foreground: "6bd693" },
      { token: "number", foreground: "e3b341" },
      { token: "comment", foreground: "7d8590", fontStyle: "italic" },
      { token: "operator", foreground: "d2a8ff" },
    ], colors: { "editor.background": "#171a1f", "editor.foreground": "#e6edf3", "editorLineNumber.foreground": "#4d5560", "editorGutter.background": "#1d2127" },
  });
}

export function registerLanguage(getDialect) {
  monaco.languages.register({ id: "pseudocode" });

  monaco.languages.setLanguageConfiguration("pseudocode", {
    comments: { lineComment: "//" },
    brackets: [["(", ")"], ["[", "]"]],
    autoClosingPairs: [
      { open: "(", close: ")" }, { open: "[", close: "]" },
      { open: '"', close: '"' }, { open: "'", close: "'" },
    ],
    surroundingPairs: [
      { open: "(", close: ")" }, { open: "[", close: "]" },
      { open: '"', close: '"' }, { open: "'", close: "'" },
    ],
    onEnterRules: [
      {
        beforeText: /^\s*(IF|ELSE|CASE|FOR|WHILE|REPEAT|PROCEDURE|FUNCTION|TYPE)\b.*$/i,
        action: { indentAction: monaco.languages.IndentAction.Indent },
      },
    ],
  });

  monaco.languages.setMonarchTokensProvider("pseudocode", monarchFor(getDialect()));
}

export function monarchFor(d) {
  return {
    keywords: keywordsFor(d.id),
    builtins: builtinListFor(d.id),
    tokenizer: {
      root: [
        [/\/\/.*/, "comment"],
        [/[A-Za-z][A-Za-z0-9_]*/, {
          cases: {
            "@keywords": "keyword",
            "@builtins": "builtin",
            "@default": "identifier",
          },
        }],
        [/"(?:[^"\\]|\\.)*"/, "string"],
        [/'(?:[^'\\]|\\.)*'/, "string.quote"],
        [/[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{4}/, "number.date"],
        [/[0-9]*\.[0-9]+|[0-9]+/, "number"],
        [/(<=|>=|<>|<-|←|=|<|>)/, "operator"],
        [/[+\-*/&]/, "operator"],
        [/[(),\[\]:]/, "delimiter"],
        [/[^\s]+/, "invalid"],
      ],
    },
  };
}

export function registerCompletion(getDialect) {
  monaco.languages.registerCompletionItemProvider("pseudocode", {
    provideCompletionItems(editorModel, position) {
      const word = editorModel.getWordUntilPosition(position);
      const range = new monaco.Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn);
      const text = editorModel.getValue();
      const suggestions = [];

      for (const keyword of keywordsFor(getDialect())) {
        suggestions.push({ label: keyword, kind: monaco.languages.CompletionItemKind.Keyword, insertText: keyword, range, detail: "keyword" });
      }
      for (const name of builtinListFor(getDialect())) {
        const fn = BUILTINS[name];
        suggestions.push({
          label: name, kind: monaco.languages.CompletionItemKind.Function,
          insertText: name + "($0)", insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
          range, detail: fn.signature, documentation: fn.doc,
        });
      }
      for (const declared of declaredNames(text)) {
        suggestions.push({ label: declared.name, kind: monaco.languages.CompletionItemKind.Variable, insertText: declared.name, range, detail: declared.type });
      }
      for (const routine of routineNames(text)) {
        suggestions.push({ label: routine.name, kind: monaco.languages.CompletionItemKind.Method, insertText: routine.name, range, detail: routine.kind });
      }
      return { suggestions };
    },
  });

  monaco.languages.registerSignatureHelpProvider("pseudocode", {
    signatureHelpTriggerCharacters: ["(", ","],
    provideSignatureHelp(editorModel, position) {
      const before = editorModel.getValueInRange({
        startLineNumber: position.lineNumber, startColumn: 1,
        endLineNumber: position.lineNumber, endColumn: position.column,
      });
      const match = /([A-Za-z][A-Za-z0-9_]*)\s*\(([^()]*)$/.exec(before);
      if (!match) return null;
      const name = match[1].toUpperCase();
      const fn = BUILTINS[name];
      if (!fn) return null;
      return {
        value: {
          signatures: [{ label: fn.signature, parameters: fn.args(getDialect()).map((types) => ({ label: types.join("|") })) }],
          activeSignature: 0,
          activeParameter: Math.min(match[2].split(",").length - 1, Math.max(0, fn.args(getDialect()).length - 1)),
        },
        dispose() {},
      };
    },
  });
}

export function declaredNames(text) {
  const found = [];
  const seen = new Set();
  const pattern = /DECLARE\s+([A-Za-z][A-Za-z0-9_,\s]*?)\s*:\s*(ARRAY\[[^\]]*\]\s*OF\s*[A-Z]+|[A-Z]+)/gi;
  let match;
  while ((match = pattern.exec(text))) {
    const type = match[2].toUpperCase().replace(/\s+/g, " ");
    for (const name of match[1].split(",")) {
      const trimmed = name.trim();
      const key = trimmed.toUpperCase();
      if (trimmed && !seen.has(key)) { seen.add(key); found.push({ name: trimmed, type }); }
    }
  }
  const paramPattern = /(?:PROCEDURE|FUNCTION)\s+([A-Za-z][A-Za-z0-9_]*)\s*\(([^)]*)\)/gi;
  while ((match = paramPattern.exec(text))) {
    for (const part of match[2].split(",")) {
      const name = part.replace(/BYREF|BYVAL/gi, "").trim().split(/[\s:]/)[0];
      const key = name.toUpperCase();
      if (name && !seen.has(key)) { seen.add(key); found.push({ name, type: "parameter" }); }
    }
  }
  return found;
}

export function routineNames(text) {
  const out = [];
  const pattern = /(PROCEDURE|FUNCTION)\s+([A-Za-z][A-Za-z0-9_]*)/gi;
  let match;
  while ((match = pattern.exec(text))) out.push({ name: match[2], kind: match[1].toUpperCase() });
  return out;
}
