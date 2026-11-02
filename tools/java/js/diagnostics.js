const JAVA_KEYWORDS = new Set([
  "abstract", "assert", "boolean", "break", "byte", "case", "catch", "char", "class", "const",
  "continue", "default", "do", "double", "else", "enum", "extends", "final", "finally", "float",
  "for", "goto", "if", "implements", "import", "instanceof", "int", "interface", "long", "native",
  "new", "package", "private", "protected", "public", "return", "short", "static", "strictfp",
  "super", "switch", "synchronized", "this", "throw", "throws", "transient", "try", "void",
  "volatile", "while", "true", "false", "null",
]);

const MODIFIERS = new Set(["public", "protected", "private", "static", "final", "abstract", "strictfp", "native", "synchronized", "transient", "volatile"]);
const MULTI_OPERATORS = [">>>=", "<<=", ">>=", ">>>", "==", "!=", "<=", ">=", "&&", "||", "++", "--", "+=", "-=", "*=", "/=", "%=", "&=", "|=", "^=", "<<", ">>", "->", "::"];

function isIdentifierStart(ch) {
  return /[A-Za-z_$]/.test(ch);
}

function isIdentifierPart(ch) {
  return /[A-Za-z0-9_$]/.test(ch);
}

function lexJava(code) {
  const tokens = [];
  let index = 0;
  const length = code.length;

  while (index < length) {
    const ch = code[index];

    if (/\s/.test(ch)) {
      index += 1;
      continue;
    }

    if (ch === "/" && code[index + 1] === "/") {
      const start = index;
      index += 2;
      while (index < length && code[index] !== "\n") index += 1;
      tokens.push({ type: "comment", value: code.slice(start, index), start, end: index });
      continue;
    }

    if (ch === "/" && code[index + 1] === "*") {
      const start = index;
      index += 2;
      while (index < length && !(code[index] === "*" && code[index + 1] === "/")) index += 1;
      index = Math.min(length, index + 2);
      tokens.push({ type: "comment", value: code.slice(start, index), start, end: index });
      continue;
    }

    if (ch === '"' || ch === "'") {
      const quote = ch;
      const start = index;
      index += 1;
      while (index < length) {
        if (code[index] === "\\") {
          index += 2;
          continue;
        }
        if (code[index] === quote) {
          index += 1;
          break;
        }
        index += 1;
      }
      tokens.push({ type: quote === '"' ? "string" : "char", value: code.slice(start, index), start, end: index });
      continue;
    }

    if (/[0-9]/.test(ch) || (ch === "." && /[0-9]/.test(code[index + 1] || ""))) {
      const rest = code.slice(index);
      const match = /^(?:0[xX][0-9a-fA-F_]+|0[bB][01_]+|(?:\d[\d_]*(?:\.[\d_]*)?|\.\d[\d_]*)(?:[eE][+-]?\d+)?)(?:[lLfFdD])?/.exec(rest);
      const value = match ? match[0] : ch;
      tokens.push({ type: "number", value, start: index, end: index + value.length });
      index += value.length;
      continue;
    }

    if (isIdentifierStart(ch)) {
      const start = index;
      index += 1;
      while (index < length && isIdentifierPart(code[index])) index += 1;
      tokens.push({ type: "identifier", value: code.slice(start, index), start, end: index });
      continue;
    }

    const multi = MULTI_OPERATORS.find((operator) => code.startsWith(operator, index));
    if (multi) {
      tokens.push({ type: "operator", value: multi, start: index, end: index + multi.length });
      index += multi.length;
      continue;
    }

    tokens.push({
      type: "(){}[];,.".includes(ch) ? "punct" : "operator",
      value: ch,
      start: index,
      end: index + 1,
    });
    index += 1;
  }

  const lineStarts = [0];
  for (let cursor = 0; cursor < code.length; cursor += 1) {
    if (code[cursor] === "\n") lineStarts.push(cursor + 1);
  }
  const lineAt = (position) => {
    let low = 0;
    let high = lineStarts.length - 1;
    while (low < high) {
      const mid = Math.ceil((low + high) / 2);
      if (lineStarts[mid] <= position) low = mid;
      else high = mid - 1;
    }
    return low + 1;
  };

  for (const token of tokens) token.line = lineAt(token.start);
  return { tokens, lineAt, lineStarts };
}

function significantTokens(tokens) {
  return tokens.filter((token) => token.type !== "comment");
}

function maskCode(code) {
  const { tokens } = lexJava(code);
  const characters = code.split("");
  for (const token of tokens) {
    if (token.type !== "comment" && token.type !== "string" && token.type !== "char") continue;
    for (let cursor = token.start; cursor < token.end; cursor += 1) {
      if (characters[cursor] !== "\n" && characters[cursor] !== "\r") characters[cursor] = " ";
    }
  }
  return characters.join("");
}

function basename(path) {
  return String(path).split("/").pop().split("\\").pop();
}

export function detectPublicTypeName(code) {
  const tokens = significantTokens(lexJava(code).tokens);
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.value !== "public") continue;
    let cursor = index + 1;
    while (cursor < tokens.length && MODIFIERS.has(tokens[cursor].value)) cursor += 1;
    if (!["class", "interface", "enum"].includes(tokens[cursor] ? tokens[cursor].value : "")) continue;
    const nameToken = tokens[cursor + 1];
    if (nameToken && nameToken.type === "identifier") return nameToken.value;
  }
  return null;
}

function enclosingClassName(tokens, position) {
  for (let index = position; index >= 0; index -= 1) {
    if (tokens[index].value !== "class") continue;
    let cursor = index + 1;
    while (cursor < tokens.length && tokens[cursor].type !== "identifier") cursor += 1;
    if (tokens[cursor]) return tokens[cursor].value;
  }
  return null;
}

export function detectMainClassName(code) {
  const tokens = significantTokens(lexJava(code).tokens);
  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];
    if (token.value !== "main") continue;
    if (!tokens[index + 1] || tokens[index + 1].value !== "(") continue;
    const modifiers = tokens.slice(Math.max(0, index - 7), index).map((item) => item.value);
    if (!modifiers.includes("static") || !modifiers.includes("void")) continue;
    const className = enclosingClassName(tokens, index);
    if (className) return className;
  }
  return null;
}

export function firstClassName(code) {
  const tokens = significantTokens(lexJava(code).tokens);
  for (let index = 0; index < tokens.length; index += 1) {
    if (tokens[index].value !== "class") continue;
    const nameToken = tokens[index + 1];
    if (nameToken && nameToken.type === "identifier") return nameToken.value;
  }
  return null;
}

export function hasMainMethod(code) {
  return Boolean(detectMainClassName(code));
}

export function sourceFileNameFor(code) {
  const publicName = detectPublicTypeName(code);
  if (publicName && isJavaIdentifier(publicName)) return `${publicName}.java`;
  const mainName = detectMainClassName(code);
  if (mainName && isJavaIdentifier(mainName)) return `${mainName}.java`;
  return "Main.java";
}

function isJavaIdentifier(value) {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(value) && !JAVA_KEYWORDS.has(value);
}

export function sanitizeFileName(name) {
  const cleaned = String(name || "")
    .replace(/[\\/:*?"<>|\u0000-\u001f]/g, "-")
    .replace(/^[.\s]+|[.\s]+$/g, "")
    .slice(0, 80);
  return cleaned || "Program";
}

export function uniqueName(base, existingNames) {
  const trimmed = String(base || "").trim().slice(0, 60) || "Untitled";
  const taken = new Set([...existingNames].map((name) => name.toLowerCase()));
  if (!taken.has(trimmed.toLowerCase())) return trimmed;
  let counter = 2;
  while (taken.has(`${trimmed} ${counter}`.toLowerCase())) counter += 1;
  return `${trimmed} ${counter}`;
}

function extractField(detail, label) {
  const match = new RegExp(`${label}:\\s*(.+)`).exec(detail);
  return match ? match[1].trim() : "";
}

function translateCompileMessage(message, detail) {
  const symbol = extractField(detail, "symbol");
  const required = extractField(detail, "required");
  const found = extractField(detail, "found");

  if (message.startsWith("cannot find symbol")) {
    if (/class Scanner\b/.test(symbol) || /Scanner/.test(detail)) {
      return { en: "Cannot find symbol: Scanner", zh: "缺少 import java.util.Scanner; 或类名拼写错误。" };
    }
    if (symbol.startsWith("variable")) {
      return { en: `Cannot find symbol — ${symbol}`, zh: "变量未声明、超出作用域或拼写错误。" };
    }
    if (symbol.startsWith("method")) {
      return { en: `Cannot find symbol — ${symbol}`, zh: "方法不存在，或方法名/参数拼写错误。" };
    }
    if (symbol.startsWith("class")) {
      return { en: `Cannot find symbol — ${symbol}`, zh: "类不存在：检查 import 或类名拼写。" };
    }
    return { en: symbol ? `Cannot find symbol — ${symbol}` : "Cannot find symbol", zh: "找不到名称：检查拼写、声明位置或 import。" };
  }

  if (message.startsWith("incompatible types")) {
    const extra = found ? ` (found ${found})` : "";
    return { en: `${message}${extra}`, zh: "类型不匹配：检查赋值、参数或返回值类型。" };
  }

  if (message.includes("possible lossy conversion")) {
    return { en: message, zh: "类型转换会丢失精度；必要时使用显式强制转换。" };
  }

  if (message === "';' expected") {
    return { en: "Missing semicolon", zh: "缺少分号：检查这一行的末尾。" };
  }

  if (/^'.*' expected$/.test(message)) {
    const expected = message.replace(/^'(.*)' expected$/, "$1");
    return { en: `Expected '${expected}'`, zh: `缺少 '${expected}'：检查这一行附近的符号是否配对。` };
  }

  if (message === "class, interface, or enum expected") {
    return { en: message, zh: "通常是缺少右大括号，或语句写在了类的外面。" };
  }

  if (message === "illegal start of expression") {
    return { en: message, zh: "语法错误：检查这一行附近的符号、关键字或括号。" };
  }

  if (message === "not a statement") {
    return { en: message, zh: "这不是一条合法语句：检查是否多写了符号或少了赋值。" };
  }

  if (message.startsWith("reached end of file while parsing")) {
    return { en: message, zh: "文件提前结束：大括号 { } 数量不匹配。" };
  }

  if (message === "missing return statement") {
    return { en: message, zh: "方法缺少 return 语句：所有分支都要返回一个值。" };
  }

  if (message === "unreachable statement") {
    return { en: message, zh: "不可达代码：这行永远不会执行，检查 return/break 的位置。" };
  }

  if (/might not have been initialized/.test(message)) {
    return { en: message, zh: "变量在使用前必须先赋值。" };
  }

  if (/non-static .* cannot be referenced from a static context/.test(message)) {
    return { en: message, zh: "main 是 static 方法，不能直接访问实例字段或实例方法。" };
  }

  if (/array required, but .* found/.test(message)) {
    return { en: message, zh: "这里需要数组，但得到的是其他类型：检查变量声明。" };
  }

  if (/integer number too large/.test(message)) {
    return { en: message, zh: "整数字面量超出 int 范围；大数请使用 long（加 L）。" };
  }

  if (/package .* does not exist/.test(message)) {
    return { en: message, zh: "包不存在：检查 import 拼写；AP CSA 常用 java.util.Scanner。" };
  }

  if (/cannot access/.test(message)) {
    return { en: message, zh: "无法访问该类或成员：检查访问权限与 import。" };
  }

  if (/duplicate class/.test(message)) {
    return { en: message, zh: "同一个类被定义了多次：检查类名是否重复。" };
  }

  if (/method .* cannot be applied to given types/.test(message)) {
    const detailText = required || found ? ` (required: ${required}; found: ${found})` : "";
    return { en: `${message}${detailText}`, zh: "方法参数不匹配：检查参数个数、顺序和类型。" };
  }

  if (/constructor .* cannot be applied/.test(message)) {
    return { en: message, zh: "构造方法参数不匹配：检查 new 时传入的参数。" };
  }

  if (/bad operand types for binary operator/.test(message)) {
    return { en: message, zh: "运算符两边的类型不匹配：检查是否把字符串和数字混用。" };
  }

  if (/incomparable types/.test(message)) {
    return { en: message, zh: "两个值无法比较：检查类型是否一致。" };
  }

  if (/cannot assign a value to final variable/.test(message)) {
    return { en: message, zh: "不能给 final 变量重新赋值。" };
  }

  return { en: message, zh: "编译错误：检查对应行。" };
}

export function parseCompileOutput(text, studentFile = "Main.java") {
  const lines = String(text || "").replace(/\r\n?/g, "\n").split("\n");
  const problems = [];
  const headerPattern = /^(?:.*[\\/])?([^\\/:]+\.java):(\d+): (error|warning): (.*)$/;
  let current = null;

  const flush = () => {
    if (!current) return;
    const detail = current.detailLines.join("\n").trim();
    const translated = translateCompileMessage(current.message, detail);
    const file = current.file;
    problems.push({
      severity: current.severity,
      line: current.line,
      file,
      en: translated.en,
      zh: translated.zh,
      original: `${file}:${current.line}: ${current.message}`,
      detail,
      isSandboxFile: file === "__JavaRunner.java",
    });
    current = null;
  };

  for (const line of lines) {
    if (/^Deprecated: Use cheerpOSAddStringFile/.test(line)) continue;
    const match = headerPattern.exec(line);
    if (match) {
      flush();
      current = {
        file: match[1],
        line: Number(match[2]),
        severity: match[3] === "error" ? "error" : "warning",
        message: match[4].trim(),
        detailLines: [],
      };
      continue;
    }
    if (/^\d+ (error|warning)s?$/.test(line.trim()) || /^\d+ (error|warning)s? and \d+ warning/.test(line.trim())) {
      flush();
      continue;
    }
    if (current) current.detailLines.push(line.replace(/^\s*/, "  "));
  }
  flush();

  const filtered = problems.filter((problem) => !problem.isSandboxFile || problem.severity === "error");
  if (!filtered.length) {
    const cleaned = lines
      .filter((line) => line.trim() && !/^Deprecated: Use cheerpOSAddStringFile/.test(line))
      .join("\n")
      .trim();
    if (cleaned && /error/i.test(cleaned)) {
      return [{
        severity: "error",
        line: null,
        file: studentFile,
        en: "Compilation failed",
        zh: "编译失败：请查看原始信息。",
        original: cleaned,
        detail: cleaned,
      }];
    }
  }

  return filtered.sort((left, right) => (left.line || 0) - (right.line || 0));
}

const EXCEPTION_HELP = {
  NullPointerException: {
    en: "NullPointerException — something is still null.",
    zh: "空指针：对象还没有用 new 创建，或已经被赋值为 null。",
  },
  ArrayIndexOutOfBoundsException: {
    en: "Array index is out of bounds.",
    zh: "数组下标越界：合法范围是 0 到 length - 1。",
  },
  IndexOutOfBoundsException: {
    en: "Index is out of bounds.",
    zh: "下标越界：用 size() 检查 ArrayList 的范围。",
  },
  StringIndexOutOfBoundsException: {
    en: "String index is out of bounds.",
    zh: "字符串下标越界：检查 charAt / substring 的范围。",
  },
  InputMismatchException: {
    en: "Input type mismatch.",
    zh: "输入类型不匹配：nextInt() 读到了非整数。",
  },
  NoSuchElementException: {
    en: "Not enough input.",
    zh: "输入不足：请在上方 Input values 里补充输入。",
  },
  ArithmeticException: {
    en: "Arithmetic error (often division by zero).",
    zh: "算术错误：通常是整数除以 0。",
  },
  NumberFormatException: {
    en: "Number format error.",
    zh: "数字格式错误：parseInt / parseDouble 收到了非数字字符串。",
  },
  ClassCastException: {
    en: "Invalid cast.",
    zh: "类型转换错误：检查强制转换是否合法。",
  },
  FileNotFoundException: {
    en: "File not found.",
    zh: "找不到文件：文件名要与 Data files 中的名称完全一致。",
  },
  StackOverflowError: {
    en: "Stack overflow (runaway recursion).",
    zh: "递归太深或没有终止条件。",
  },
  OutOfMemoryError: {
    en: "Out of memory.",
    zh: "内存不足：检查是否创建了过大的数组或集合。",
  },
};

export function parseRuntimeError(text) {
  const normalized = String(text || "").replace(/\r\n?/g, "\n").replace(/\t(?=at\s)/g, "\n");
  const lines = normalized.split("\n");
  const exceptionPattern = /^(?:Exception in thread "[^"]*"\s+)?([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*(?:Exception|Error))(?::\s*(.*))?$/;
  let type = null;
  let message = "";
  let original = "";
  for (const line of lines) {
    const match = exceptionPattern.exec(line.trim());
    if (match) {
      type = match[1];
      message = (match[2] || "").trim();
      original = line.trim();
      break;
    }
  }
  if (!type) return null;

  let lineNumber = null;
  const framePattern = /^\s*at\s+([\w$.]+)\.([\w$<>]+)\(([^():]+\.java):(\d+)\)/;
  for (const line of lines) {
    const match = framePattern.exec(line);
    if (!match) continue;
    const owner = match[1];
    if (owner === "__JavaRunner" || /^(java|javax|sun|jdk|com\.sun|org\.\w)/.test(owner)) continue;
    lineNumber = Number(match[4]);
    break;
  }

  const simpleName = type.split(".").pop();
  const help = EXCEPTION_HELP[simpleName];
  const en = help ? help.en : `${simpleName}${message ? `: ${message}` : ""}`;
  const zh = help ? help.zh : "运行时异常：根据右侧堆栈定位到学生代码。";
  return {
    severity: "error",
    line: lineNumber,
    file: null,
    en,
    zh,
    original,
    detail: lines.filter((line) => framePattern.test(line)).slice(0, 4).join("\n"),
    type: simpleName,
    runtime: true,
  };
}

function collectStringVariables(tokens) {
  const names = new Set();
  for (let index = 0; index < tokens.length; index += 1) {
    if (tokens[index].value !== "String") continue;
    const previous = tokens[index - 1];
    if (previous && previous.value === ".") continue;
    let cursor = index + 1;
    while (tokens[cursor] && tokens[cursor].value === "[") {
      if (!tokens[cursor + 1] || tokens[cursor + 1].value !== "]") break;
      cursor += 2;
    }
    const nameToken = tokens[cursor];
    if (!nameToken || nameToken.type !== "identifier") continue;
    const after = tokens[cursor + 1];
    const afterValue = after ? after.value : "";
    if (["=", ";", ",", ")", ":", "["].includes(afterValue)) names.add(nameToken.value);
  }
  return names;
}

export function findPitfalls(code) {
  const { tokens, lineAt } = lexJava(code);
  const significant = significantTokens(tokens);
  const stringVariables = collectStringVariables(significant);
  const masked = maskCode(code);
  const problems = [];
  const seen = new Set();

  const add = (line, en, zh, rule) => {
    const key = `${rule}:${line}`;
    if (seen.has(key)) return;
    seen.add(key);
    problems.push({ severity: "tip", line, file: null, en, zh, original: "", detail: "", rule });
  };

  for (let index = 0; index < significant.length; index += 1) {
    const token = significant[index];
    if (token.value !== "==" && token.value !== "!=") continue;
    const previous = significant[index - 1];
    const next = significant[index + 1];
    if (!previous || !next) continue;
    if (previous.value === "null" || next.value === "null") continue;

    const previousIsString = previous.type === "string" ||
      (previous.type === "identifier" && stringVariables.has(previous.value));
    const nextIsString = next.type === "string" ||
      (next.type === "identifier" && stringVariables.has(next.value));
    const nextIsValue = ["string", "identifier", ")"].includes(next.type) || next.type === "punct";
    const previousIsValue = ["string", "identifier", ")"].includes(previous.type) || previous.type === "punct";

    if ((previousIsString && nextIsValue) || (nextIsString && previousIsValue)) {
      add(
        token.line,
        "Comparing Strings with == / != checks whether they are the same object, not the same text. Use .equals().",
        "用 == 比较 String 比较的是对象引用，不是内容；比较内容请用 .equals()。",
        "string-equality",
      );
    }
  }

  const nextIntIndex = significant.findIndex((token) => token.value === "nextInt");
  if (nextIntIndex >= 0) {
    for (let index = nextIntIndex + 1; index < significant.length; index += 1) {
      if (significant[index].value === "nextLine") {
        add(
          significant[index].line,
          "nextInt() leaves the newline in the input buffer. Call nextLine() once to consume it before reading a full line.",
          "nextInt() 后换行符仍留在输入缓冲区；读取整行前先补一次 nextLine()。",
          "nextint-nextline",
        );
        break;
      }
    }
  }

  const offByOne = /for\s*\([^;]*;[^;]*<=\s*[A-Za-z_$][\w$]*(?:\s*\.\s*[A-Za-z_$][\w$]*)*\s*\.\s*(?:length|size\s*\(\s*\))\s*;/g;
  let match;
  while ((match = offByOne.exec(masked)) !== null) {
    add(
      lineAt(match.index),
      "This loop uses <= with length / size(), which usually runs one index past the end.",
      "循环条件使用 <= length / size()，通常会多访问一个下标（越界）。",
      "off-by-one",
    );
  }

  const integerDivision = /(?<![\w.])(\d[\d_]*)\s*\/\s*(\d[\d_]*)(?![\w.])/g;
  while ((match = integerDivision.exec(masked)) !== null) {
    const numerator = Number(match[1].replace(/_/g, ""));
    const denominator = Number(match[2].replace(/_/g, ""));
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) continue;
    if (denominator === 0 || numerator % denominator === 0) continue;
    add(
      lineAt(match.index),
      "Integer division truncates: 5 / 2 is 2. Use 5 / 2.0 if you need 2.5.",
      "整数除法会截断小数；需要小数时写成 2.0 或使用强制转换。",
      "integer-division",
    );
  }

  return problems.sort((left, right) => (left.line || 0) - (right.line || 0)).slice(0, 8);
}

export function displayFileName(path) {
  return basename(path || "");
}
