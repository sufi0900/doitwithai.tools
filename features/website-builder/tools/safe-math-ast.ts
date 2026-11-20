/**
 * Safe Whitelisted Arithmetic AST Evaluator for Engine 1 (Formula Calculator Engine)
 * Strictly forbids dynamic code evaluation or arbitrary property access.
 * Supports: numbers, variable identifiers, +, -, *, /, ^, parentheses, and
 * whitelisted math functions: min, max, round, floor, ceil, abs, sqrt, pow, clamp.
 */

export type MathVariables = Record<string, number>;

type Token =
  | { type: "num"; value: number }
  | { type: "id"; value: string }
  | { type: "op"; value: "+" | "-" | "*" | "/" | "^" }
  | { type: "paren"; value: "(" | ")" }
  | { type: "comma" };

const SAFE_FUNCTIONS: Record<string, (...args: number[]) => number> = {
  min: (...args) => Math.min(...args),
  max: (...args) => Math.max(...args),
  round: (x, digits = 0) => {
    const f = Math.pow(10, Math.max(0, Math.min(6, Math.round(digits))));
    return Math.round(x * f) / f;
  },
  floor: (x) => Math.floor(x),
  ceil: (x) => Math.ceil(x),
  abs: (x) => Math.abs(x),
  sqrt: (x) => Math.sqrt(Math.max(0, x)),
  pow: (base, exp) => Math.pow(base, Math.max(-24, Math.min(24, exp))),
  clamp: (val, lo, hi) => Math.min(hi, Math.max(lo, val)),
};

export function tokenizeFormula(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const s = expr.trim();
  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (/[0-9.]/.test(ch)) {
      let numStr = "";
      while (i < s.length && /[0-9.]/.test(s[i])) {
        numStr += s[i++];
      }
      const parsed = Number(numStr);
      if (!Number.isFinite(parsed)) {
        throw new Error(`Invalid number literal: ${numStr}`);
      }
      tokens.push({ type: "num", value: parsed });
      continue;
    }
    if (/[a-zA-Z_]/.test(ch)) {
      let idStr = "";
      while (i < s.length && /[a-zA-Z0-9_]/.test(s[i])) {
        idStr += s[i++];
      }
      tokens.push({ type: "id", value: idStr });
      continue;
    }
    if (ch === "+" || ch === "-" || ch === "*" || ch === "/" || ch === "^") {
      tokens.push({ type: "op", value: ch });
      i++;
      continue;
    }
    if (ch === "(" || ch === ")") {
      tokens.push({ type: "paren", value: ch });
      i++;
      continue;
    }
    if (ch === ",") {
      tokens.push({ type: "comma" });
      i++;
      continue;
    }
    throw new Error(`Disallowed character in formula: ${ch}`);
  }
  return tokens;
}

export function evaluateSafeFormula(formula: string, vars: MathVariables): number {
  const tokens = tokenizeFormula(formula);
  let pos = 0;

  function peek(): Token | undefined {
    return tokens[pos];
  }

  function consume(): Token {
    const tok = tokens[pos++];
    if (!tok) throw new Error("Unexpected end of formula");
    return tok;
  }

  function parseExpression(): number {
    let left = parseTerm();
    while (true) {
      const next = peek();
      if (next && next.type === "op" && (next.value === "+" || next.value === "-")) {
        consume();
        const right = parseTerm();
        left = next.value === "+" ? left + right : left - right;
      } else {
        break;
      }
    }
    return left;
  }

  function parseTerm(): number {
    let left = parsePower();
    while (true) {
      const next = peek();
      if (next && next.type === "op" && (next.value === "*" || next.value === "/")) {
        consume();
        const right = parsePower();
        if (next.value === "*") {
          left = left * right;
        } else {
          left = right === 0 ? 0 : left / right;
        }
      } else {
        break;
      }
    }
    return left;
  }

  function parsePower(): number {
    let base = parseUnary();
    const next = peek();
    if (next && next.type === "op" && next.value === "^") {
      consume();
      const exp = parsePower();
      base = Math.pow(base, Math.max(-24, Math.min(24, exp)));
    }
    return base;
  }

  function parseUnary(): number {
    const next = peek();
    if (next && next.type === "op" && (next.value === "+" || next.value === "-")) {
      consume();
      const val = parseUnary();
      return next.value === "-" ? -val : val;
    }
    return parsePrimary();
  }

  function parsePrimary(): number {
    const tok = consume();
    if (tok.type === "num") {
      return tok.value;
    }
    if (tok.type === "paren" && tok.value === "(") {
      const val = parseExpression();
      const close = consume();
      if (close.type !== "paren" || close.value !== ")") {
        throw new Error("Expected closing parenthesis");
      }
      return val;
    }
    if (tok.type === "id") {
      const next = peek();
      if (next && next.type === "paren" && next.value === "(") {
        const fn = SAFE_FUNCTIONS[tok.value];
        if (!fn) {
          throw new Error(`Function '${tok.value}' is not in the safe whitelist`);
        }
        consume();
        const args: number[] = [];
        const afterOpen = peek();
        if (!(afterOpen && afterOpen.type === "paren" && afterOpen.value === ")")) {
          args.push(parseExpression());
          while (peek()?.type === "comma") {
            consume();
            args.push(parseExpression());
          }
        }
        const close = consume();
        if (close.type !== "paren" || close.value !== ")") {
          throw new Error("Expected closing parenthesis for function call");
        }
        return fn(...args);
      }
      const varVal = vars[tok.value];
      return typeof varVal === "number" && Number.isFinite(varVal) ? varVal : 0;
    }
    throw new Error("Unexpected token in formula");
  }

  const result = parseExpression();
  return Number.isFinite(result) ? result : 0;
}
