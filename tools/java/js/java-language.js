const TYPES = [
  "boolean", "byte", "char", "short", "int", "long", "float", "double", "void",
  "String", "Integer", "Double", "Boolean", "Character", "Object", "Math", "System",
  "Scanner", "ArrayList", "File",
];

const KEYWORDS = [
  "abstract", "assert", "break", "case", "catch", "class", "const", "continue", "default",
  "do", "else", "enum", "extends", "final", "finally", "for", "goto", "if", "implements",
  "import", "instanceof", "interface", "native", "new", "package", "private", "protected",
  "public", "return", "static", "strictfp", "super", "switch", "synchronized", "this",
  "throw", "throws", "transient", "try", "volatile", "while",
];

const CONSTANTS = ["true", "false", "null"];

const SNIPPETS = [
  {
    label: "main",
    detail: "public class + main method",
    insertText: [
      "public class ${1:Main} {",
      "    public static void main(String[] args) {",
      "        $0",
      "    }",
      "}",
    ].join("\n"),
  },
  {
    label: "sout",
    detail: "System.out.println",
    insertText: "System.out.println(${1:message});",
  },
  {
    label: "souf",
    detail: "System.out.printf",
    insertText: 'System.out.printf("${1:%s}%n", ${2:value});',
  },
  {
    label: "scanner",
    detail: "Read from the input panel",
    insertText: "Scanner ${1:input} = new Scanner(System.in);",
  },
  {
    label: "importscanner",
    detail: "import java.util.Scanner;",
    insertText: "import java.util.Scanner;\n",
  },
  {
    label: "fori",
    detail: "Indexed for loop",
    insertText: "for (int ${1:i} = 0; $1 < ${2:n}; $1++) {\n\t$0\n}",
  },
  {
    label: "forr",
    detail: "Reverse indexed for loop",
    insertText: "for (int $1 = ${2:items}.length - 1; $1 >= 0; $1--) {\n\t$0\n}",
  },
  {
    label: "foreach",
    detail: "Enhanced for loop",
    insertText: "for (${1:String} ${2:item} : ${3:items}) {\n\t$0\n}",
  },
  {
    label: "while",
    detail: "while loop",
    insertText: "while (${1:condition}) {\n\t$0\n}",
  },
  {
    label: "if",
    detail: "if statement",
    insertText: "if (${1:condition}) {\n\t$0\n}",
  },
  {
    label: "ifelse",
    detail: "if / else",
    insertText: "if (${1:condition}) {\n\t$2\n} else {\n\t$0\n}",
  },
  {
    label: "class",
    detail: "A new class",
    insertText: "public class ${1:Name} {\n\t$0\n}",
  },
  {
    label: "method",
    detail: "Static method",
    insertText: "public static ${1:void} ${2:name}(${3}) {\n\t$0\n}",
  },
  {
    label: "array",
    detail: "Create an array",
    insertText: "int[] ${1:values} = new int[${2:5}];",
  },
  {
    label: "arraylist",
    detail: "Create an ArrayList",
    insertText: "ArrayList<${1:String}> ${2:list} = new ArrayList<${1:String}>();",
  },
  {
    label: "array2d",
    detail: "Create a 2D array",
    insertText: "int[][] ${1:grid} = new int[${2:3}][${3:4}];",
  },
  {
    label: "fileloop",
    detail: "Read a built-in data file",
    insertText: "Scanner ${1:file} = new Scanner(new File(\"${2:scores.txt}\"));\nwhile ($1.hasNext()) {\n\tString ${3:name} = $1.next();\n\tint ${4:score} = $1.nextInt();\n\t$0\n}",
  },
  {
    label: "parseint",
    detail: "String to int",
    insertText: "Integer.parseInt(${1:value})",
  },
  {
    label: "random",
    detail: "Random integer",
    insertText: "(int) (Math.random() * ${1:6}) + ${2:1}",
  },
];

export function registerJavaLanguage(monaco) {
  monaco.languages.register({ id: "java8" });

  monaco.languages.setLanguageConfiguration("java8", {
    comments: { lineComment: "//", blockComment: ["/*", "*/"] },
    brackets: [["{", "}"], ["[", "]"], ["(", ")"]],
    autoClosingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"', notIn: ["string", "comment"] },
      { open: "'", close: "'", notIn: ["string", "comment"] },
    ],
    surroundingPairs: [
      { open: "{", close: "}" },
      { open: "[", close: "]" },
      { open: "(", close: ")" },
      { open: '"', close: '"' },
      { open: "'", close: "'" },
    ],
    indentationRules: {
      increaseIndentPattern: /^.*\{[^}"']*$/,
      decreaseIndentPattern: /^\s*\}/,
    },
    onEnterRules: [
      {
        beforeText: /^\s*\/\*\*(?!\/)([^*]|\*(?!\/))*$/,
        afterText: /^\s*\*\/$/,
        action: { indentAction: monaco.languages.IndentAction.IndentOutdent, appendText: " * " },
      },
      {
        beforeText: /^\s*\/\*$/,
        afterText: /^\s*\*\/$/,
        action: { indentAction: monaco.languages.IndentAction.Indent, appendText: " * " },
      },
      {
        beforeText: /^\s*\*/,
        action: { indentAction: monaco.languages.Indent, appendText: "* " },
      },
    ],
  });

  monaco.languages.setMonarchTokensProvider("java8", {
    defaultToken: "",
    tokenPostfix: ".java",
    types: TYPES,
    keywords: KEYWORDS,
    constants: CONSTANTS,
    tokenizer: {
      root: [
        [/\s+/, "white"],
        [/\/\*/, "comment", "@comment"],
        [/\/\/.*$/, "comment"],
        [/@[A-Za-z_$][\w$]*/, "annotation"],
        [/"([^"\\]|\\.)*"/, "string"],
        [/'([^'\\]|\\.)*'/, "string"],
        [/0[xX][0-9a-fA-F_]+[lL]?/, "number"],
        [/\d[\d_]*(\.\d[\d_]*)?([eE][+-]?\d+)?[fFdDlL]?/, "number"],
        [/\b(?:true|false|null)\b/, "constant"],
        [/\b(?:boolean|byte|char|short|int|long|float|double|void)\b/, "type"],
        [/\b(?:String|Integer|Double|Boolean|Character|Object|Math|System|Scanner|ArrayList|File)\b/, "type"],
        [/\b(?:abstract|assert|break|case|catch|class|const|continue|default|do|else|enum|extends|final|finally|for|goto|if|implements|import|instanceof|interface|native|new|package|private|protected|public|return|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|volatile|while)\b/, "keyword"],
        [/[A-Za-z_$][\w$]*/, "identifier"],
        [/[{}()\[\]]/, "@brackets"],
        [/[=><!~?:&|+\-*\/\^%]+/, "operator"],
        [/[;,.]/, "delimiter"],
      ],
      comment: [
        [/[^/*]+/, "comment"],
        [/\*\//, "comment", "@pop"],
        [/[/*]/, "comment"],
      ],
    },
  });

  monaco.languages.registerCompletionItemProvider("java8", {
    provideCompletionItems(model, position) {
      const word = model.getWordUntilPosition(position);
      const range = new monaco.Range(
        position.lineNumber,
        word.startColumn,
        position.lineNumber,
        word.endColumn,
      );
      const suggestions = SNIPPETS.map((snippet) => ({
        label: snippet.label,
        kind: monaco.languages.CompletionItemKind.Snippet,
        detail: snippet.detail,
        documentation: snippet.detail,
        insertText: snippet.insertText,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
        range,
        sortText: `0-${snippet.label}`,
      }));
      const classes = ["Scanner", "ArrayList", "Math", "String", "Integer", "Double", "File"];
      for (const name of classes) {
        suggestions.push({
          label: name,
          kind: monaco.languages.CompletionItemKind.Class,
          detail: "Java class",
          insertText: name,
          range,
          sortText: `1-${name}`,
        });
      }
      return { suggestions };
    },
  });
}
