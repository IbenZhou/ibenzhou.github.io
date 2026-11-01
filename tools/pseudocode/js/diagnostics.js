const d = (en, zh) => ({ en, zh });

export const CODES = {
  E_KEYWORD_CASE: d(
    (c) => `Keyword '${c.kw}' must be written in UPPER CASE`,
    (c) => `关键字 ${c.kw} 必须全部大写`,
  ),
  E_ASSIGN_EQUALS: d(
    () => `'=' compares two values. Use '<-' to assign`,
    () => `'=' 用于比较，赋值要用 <-`,
  ),
  E_NOT_EQUALS: d(
    () => `'!=' is not pseudocode. Use '<>' for not equal`,
    () => `不等于要写成 <>`,
  ),
  E_COMMENT_HASH: d(
    () => `'#' does not start a comment. Use '//'`,
    () => `注释用 //，不是 #`,
  ),
  E_MOD_PERCENT: d(
    () => `'%' is not an operator. Use 'a MOD b'`,
    () => `取余写成 a MOD b，没有 % 运算符`,
  ),
  E_POWER: d(
    (c) => `'${c.op}' is not in the 9618 guide. Multiply it out, or write a function`,
    (c) => `考纲伪代码没有 ${c.op} 幂运算，请展开或用函数`,
  ),
  E_UNTERMINATED_STRING: d(
    () => `String is missing its closing double quote`,
    () => `字符串缺少右引号`,
  ),
  E_BAD_CHAR: d(
    (c) => `A CHAR literal holds exactly one character, not ${JSON.stringify(c.text)}`,
    () => `CHAR 只能放一个字符`,
  ),
  E_BAD_REAL: d(
    (c) => `A REAL needs digits on both sides of the point, e.g. ${c.text}`,
    () => `REAL 小数点两边都要有数字，例如 0.5`,
  ),
  E_BAD_NUMBER: d(
    (c) => `'${c.text}' is not a valid number`,
    () => `不是合法的数字`,
  ),
  E_BAD_DATE: d(
    (c) => `A DATE is written dd/mm/yyyy, and '${c.text}' is not one`,
    () => `DATE 写成 dd/mm/yyyy，这不是有效日期`,
  ),
  E_UNEXPECTED: d(
    (c) => `Unexpected ${c.what}`,
    (c) => `这里不该出现 ${c.what}`,
  ),
  E_UNSUPPORTED: d(
    (c) => `'${c.kw}' is part of the guide but not supported by this editor yet`,
    (c) => `${c.kw} 属于考纲，但本编辑器暂不支持`,
  ),
  E_STATEMENT_AFTER: d(
    (c) => `${c.kw} must end the line; put '${c.after}' on the next line and indent it`,
    (c) => `${c.kw} 必须单独占一行`,
  ),
  E_MISSING_THEN: d(
    () => `An IF needs THEN: IF <condition> THEN`,
    () => `IF 语句需要 THEN`,
  ),
  E_MISSING_END: d(
    (c) => `'${c.open}' opened on line ${c.line} is never closed by '${c.close}'`,
    (c) => `第 ${c.line} 行的 ${c.open} 没有用 ${c.close} 结束`,
  ),
  E_STRAY_END: d(
    (c) => `'${c.kw}' has no matching '${c.open}'`,
    (c) => `${c.kw} 没有对应的 ${c.open}`,
  ),
  E_EMPTY_BODY: d(
    (c) => `'${c.kw}' has no statements inside it`,
    (c) => `${c.kw} 里面没有语句`,
  ),
  E_BAD_DECLARE: d(
    (c) => `Declaration must be DECLARE name : TYPE or DECLARE name : ARRAY[lower:upper] OF TYPE`,
    () => `声明格式：DECLARE 名字 : 类型，或 DECLARE 名字 : ARRAY[下界:上界] OF 类型`,
  ),
  E_BAD_ARRAY: d(
    () => `An array needs both bounds, e.g. ARRAY[1:10] OF INTEGER`,
    () => `数组必须写明上下界，例如 ARRAY[1:10]`,
  ),
  E_BAD_CONSTANT: d(
    () => `A CONSTANT is assigned a literal only: CONSTANT Name = 6.50`,
    () => `CONSTANT 只能赋字面值`,
  ),
  E_MISSING_RETURNS: d(
    () => `A FUNCTION needs its return type: FUNCTION Name(...) RETURNS INTEGER`,
    () => `FUNCTION 必须写明 RETURNS 类型`,
  ),
  E_BAD_PARAM: d(
    (c) => `Parameter '${c.name}' needs a type: ${c.name} : INTEGER`,
    (c) => `参数 ${c.name} 必须带类型`,
  ),
  E_BYREF_FUNCTION: d(
    () => `Guide 8.3: parameters should not be passed by reference to a FUNCTION`,
    () => `考纲 8.3：FUNCTION 的参数不要用 BYREF`,
  ),
  E_DOUBLE_QUOTE_CHAR: d(
    () => `A CHAR uses single quotes; a STRING uses double quotes`,
    () => `CHAR 用单引号，STRING 用双引号`,
  ),
  E_NO_STMT: d(
    () => `Nothing to run`,
    () => `没有可运行的代码`,
  ),
  E_NEEDS_CALL: d(
    (c) => `A procedure is called with CALL ${c.name}(...), not ${c.name}(...) on its own`,
    (c) => `调用过程要写 CALL ${c.name}()`,
  ),
  E_NEXT_VAR: d(
    (c) => `This loop runs '${c.open}', so it must close with NEXT ${c.open}, not NEXT ${c.found}`,
    (c) => `NEXT 后面的变量要和 FOR 的循环变量一致`,
  ),
  E_MISSING_OF: d(
    () => `CASE must be followed by OF: CASE OF Mark`,
    () => `CASE 后面要写 OF`,
  ),
  E_BAD_CASE_LABEL: d(
    (c) => `A CASE label is a literal, a range 'a TO b', or OTHERWISE; '${c.text}' is none of these`,
    () => `CASE 的分支只能是字面值、范围或 OTHERWISE`,
  ),
  E_CASE_AFTER_OTHERWISE: d(
    () => `Guide 6.2: OTHERWISE must be the last case`,
    () => `OTHERWISE 必须放在最后`,
  ),
  E_MISSING_COLON: d(
    (c) => `A CASE branch needs a colon after its label: ${c.text} : statement`,
    () => `CASE 分支的标签后要写冒号`,
  ),
  E_ARRAY_RHS: d(
    (c) => `Guide 3.2: only whole arrays of the same size and type may be assigned (${c.a} = ${c.b})`,
    (c) => `整组赋值要求两个数组类型和范围一致`,
  ),
  E_STEP_ZERO: d(
    () => `A STEP of 0 makes the loop run forever`,
    () => `STEP 为 0 会死循环`,
  ),
  E_MISSING_RETURN: d(
    (c) => `FUNCTION '${c.name}' reaches its end without a RETURN`,
    (c) => `函数 ${c.name} 没有 RETURN 就结束了`,
  ),
  E_RECURSION: d(
    (c) => `'${c.name}' called itself ${c.depth} times deep; check the stopping condition`,
    (c) => `${c.name} 递归了 ${c.depth} 层，检查终止条件`,
  ),
  E_ARITY: d(
    (c) => `${c.name} takes ${c.want} argument${c.want === 1 ? "" : "s"}, you gave ${c.got}`,
    (c) => `${c.name} 需要 ${c.want} 个参数，你给了 ${c.got} 个`,
  ),
  E_TYPE_ARG: d(
    (c) => `${c.name} expected ${c.want}, got ${c.got}`,
    (c) => `${c.name} 需要 ${c.want}，实际是 ${c.got}`,
  ),
  E_UNKNOWN_FUNC: d(
    (c) => `'${c.name}' is not a built-in and is not defined in this program`,
    (c) => `${c.name} 既不是内置函数，程序里也没有定义`,
  ),
  E_NOT_A_FUNC: d(
    (c) => `'${c.name}' is a PROCEDURE, so it cannot be used inside an expression. Use CALL ${c.name}()`,
    (c) => `${c.name} 是过程，不能出现在表达式里`,
  ),
  W_CALL_PARENS: d(
    (c) => `A procedure call is written CALL ${c.name}()`,
    (c) => `调用过程要写 CALL ${c.name}()`,
  ),
  E_PROC_NOT_SUB: d(
    (c) => `'${c.name}' is a PROCEDURE, so it has no value to use here`,
    (c) => `${c.name} 是过程，没有返回值`,
  ),
  E_DIV_ZERO: d(
    (c) => `Division by zero on line ${c.line}`,
    (c) => `第 ${c.line} 行除以零`,
  ),
  E_MOD_ZERO: d(
    (c) => `MOD by zero on line ${c.line}`,
    (c) => `第 ${c.line} 行 MOD 零`,
  ),
  E_OUT_OF_BOUNDS: d(
    (c) => `${c.name}[${c.index}] is outside the declared bounds ${c.name}[${c.lo}..${c.hi}]`,
    (c) => `${c.name}[${c.index}] 超出了声明范围 ${c.lo}..${c.hi}`,
  ),
  E_INDEX_TYPE: d(
    (c) => `An array index must be an INTEGER, ${c.name}[...] got ${c.got}`,
    (c) => `下标必须是 INTEGER`,
  ),
  E_NOT_ARRAY: d(
    (c) => `'${c.name}' was declared as ${c.type}, not an array`,
    (c) => `${c.name} 不是数组`,
  ),
  E_ARRAY_ASSIGN: d(
    (c) => `Guide 3.2: assign whole arrays only when the bounds and type match (${c.a} vs ${c.b})`,
    (c) => `整组赋值要求类型和范围一致`,
  ),
  E_UNDECLARED: d(
    (c) => `'${c.name}' is used before it is declared. Add DECLARE ${c.name} : ${c.suggested}`,
    (c) => `${c.name} 没有声明，请先写 DECLARE ${c.name} : ${c.suggested}`,
  ),
  E_REDECLARE: d(
    (c) => `'${c.name}' is already declared on line ${c.line}`,
    (c) => `${c.name} 在第 ${c.line} 行已经声明过了`,
  ),
  E_RESERVED: d(
    (c) => `'${c.name}' is a keyword and cannot be used as a name`,
    (c) => `${c.name} 是关键字，不能做名字`,
  ),
  E_CONSTANT_ASSIGN: d(
    (c) => `'${c.name}' is a CONSTANT, so it cannot be assigned to`,
    (c) => `${c.name} 是常量，不能被赋值`,
  ),
  E_INPUT_TYPE: d(
    (c) => `'${c.text}' cannot be input into ${c.name} : ${c.type}`,
    (c) => `${c.text} 无法作为 ${c.type} 类型输入给 ${c.name}`,
  ),
  E_INPUT_ARRAY_TYPE: d(
    (c) => `INPUT into ${c.name} needs one value per element`,
    (c) => `给数组输入时，每个元素一行值`,
  ),
  E_STRING_PLUS: d(
    (c) => `Use '&' to join strings, not '+': ${c.example}`,
    (c) => `拼接字符串要用 &`,
  ),
  E_TYPE_OPERAND: d(
    (c) => `${c.op} needs ${c.want}, but ${c.side} operand is ${c.got}`,
    (c) => `${c.op} 需要 ${c.want}`,
  ),
  E_INT_OPERAND: d(
    (c) => `${c.op} needs INTEGER operands, got ${c.got}`,
    (c) => `${c.op} 的两个操作数都必须是 INTEGER`,
  ),
  E_STEP_LIMIT: d(
    (c) => `Stopped after ${c.steps} statements. The ${c.kind} starting on line ${c.line} never finishes`,
    (c) => `执行了 ${c.steps} 条语句后停止，第 ${c.line} 行的${c.kind}循环不会结束`,
  ),
  E_TIME_LIMIT: d(
    (c) => `Stopped after ${c.seconds} seconds in the ${c.kind} on line ${c.line}`,
    (c) => `运行 ${c.seconds} 秒后在第 ${c.line} 行的循环处停止`,
  ),
  E_STOPPED: d(
    () => `Stopped by you`,
    () => `已被你停止`,
  ),
  W_TYPE_ASSIGN: d(
    (c) => `${c.name} : ${c.type} was given a ${c.got}. Guide 2.6 wants the same type`,
    (c) => `把 ${c.got} 赋给了 ${c.name} : ${c.type}`,
  ),
  W_CONCAT_MIXED: d(
    (c) => `'&' joins two strings; ${c.got} was converted for you`,
    () => `& 两侧都应是字符串，已自动转换`,
  ),
  W_ELSEIF: d(
    () => `'ELSE IF' is not in the guide. Nested IF inside ELSE is the exam form`,
    () => `考纲没有 ELSE IF，请在 ELSE 里嵌套 IF`,
  ),
  W_NEXT_IDENT: d(
    () => `Guide 7.1: repeat the loop variable after NEXT, especially when loops nest`,
    () => `NEXT 后面要重复循环变量`,
  ),
  W_MULTI_DECLARE: d(
    () => `The guide declares one variable per line. Fine here, but write it out in an exam`,
    () => `考试时请一行声明一个变量`,
  ),
  W_IMPLICIT_REAL: d(
    () => `Guide 5.2: '/' always gives a REAL, even for two INTEGERs`,
    () => `除法 / 的结果永远是 REAL`,
  ),
  W_MISSING_INPUT: d(
    () => `The program asked for more input than the input box provided`,
    () => `输入框里的值不够用`,
  ),
  W_LOWER_KEYWORD: d(
    (c) => `'${c.kw}' is printed as ${c.fixed} in an exam paper`,
    () => `试卷里关键字是大写的`,
  ),
};

export function describe(code, ctx = {}) {
  const entry = CODES[code];
  if (!entry) return { en: String(code), zh: "" };
  const fix = (c) => (typeof c === "function" ? c(ctx) : String(c ?? ""));
  return { en: fix(entry.en), zh: fix(entry.zh) };
}
