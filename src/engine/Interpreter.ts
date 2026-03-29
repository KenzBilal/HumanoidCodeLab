import { CommandRegistry, CommandDef } from './CommandRegistry';

// ─────────────────────────────────────────────────────────────
// PUBLIC TYPES
// ─────────────────────────────────────────────────────────────

export interface Action {
  cmd: CommandDef;
  params: Record<string, any>;
  path: string;
  rawLine: string;
  srcLine: number; // original line number in user code
}

export interface CompileError {
  line: number;
  msg: string;
}

export interface CompileResult {
  actions: Action[];
  errors: CompileError[];
}

// ─────────────────────────────────────────────────────────────
// INTERNAL TYPES
// ─────────────────────────────────────────────────────────────

type VarValue = number | string | boolean;
type Vars = Record<string, VarValue>;

interface SourceLine {
  text: string;
  srcLine: number; // 1-indexed
}

// ─────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────

const MAX_ACTIONS = 500;

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function getIndent(text: string): number {
  let n = 0;
  for (const ch of text) {
    if (ch === ' ') n++;
    else if (ch === '\t') n += 4;
    else break;
  }
  return n;
}

function extractBody(
  lines: SourceLine[],
  startIdx: number,
  headerIndent: number
): { body: SourceLine[]; endIdx: number } {
  const body: SourceLine[] = [];
  let i = startIdx;
  while (i < lines.length) {
    const { text } = lines[i];
    if (!text.trim()) { i++; continue; }
    if (getIndent(text) <= headerIndent) break;
    body.push(lines[i]);
    i++;
  }
  return { body, endIdx: i };
}

function substituteVars(argStr: string, vars: Vars): string {
  return argStr.replace(/\b([a-zA-Z_]\w*)\b/g, (match) =>
    match in vars ? String(vars[match]) : match
  );
}

// ─────────────────────────────────────────────────────────────
// CONDITION EVALUATOR
// ─────────────────────────────────────────────────────────────

type TokenKind =
  | 'NUM' | 'STR' | 'BOOL' | 'IDENT'
  | 'EQ' | 'NEQ' | 'LTE' | 'GTE' | 'LT' | 'GT'
  | 'AND' | 'OR' | 'NOT'
  | 'LPAREN' | 'RPAREN';

interface Token { kind: TokenKind; value: any; }

function tokenize(expr: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < expr.length) {
    if (/\s/.test(expr[i])) { i++; continue; }

    if (expr[i] === '"' || expr[i] === "'") {
      const q = expr[i++];
      let s = '';
      while (i < expr.length && expr[i] !== q) s += expr[i++];
      if (i < expr.length) i++;
      tokens.push({ kind: 'STR', value: s });
      continue;
    }

    const two = expr.slice(i, i + 2);
    if (two === '==') { tokens.push({ kind: 'EQ',  value: '==' }); i += 2; continue; }
    if (two === '!=') { tokens.push({ kind: 'NEQ', value: '!=' }); i += 2; continue; }
    if (two === '<=') { tokens.push({ kind: 'LTE', value: '<=' }); i += 2; continue; }
    if (two === '>=') { tokens.push({ kind: 'GTE', value: '>=' }); i += 2; continue; }
    if (expr[i] === '<') { tokens.push({ kind: 'LT',     value: '<' }); i++; continue; }
    if (expr[i] === '>') { tokens.push({ kind: 'GT',     value: '>' }); i++; continue; }
    if (expr[i] === '(') { tokens.push({ kind: 'LPAREN', value: '(' }); i++; continue; }
    if (expr[i] === ')') { tokens.push({ kind: 'RPAREN', value: ')' }); i++; continue; }

    const prevKind = tokens.length > 0 ? tokens[tokens.length - 1].kind : null;
    const opKinds: (TokenKind | null)[] = [
      null, 'EQ', 'NEQ', 'LT', 'GT', 'LTE', 'GTE', 'AND', 'OR', 'NOT', 'LPAREN',
    ];
    const canBeNeg = expr[i] === '-' && opKinds.includes(prevKind);
    if (/\d/.test(expr[i]) || canBeNeg) {
      let s = '';
      if (expr[i] === '-') s += expr[i++];
      while (i < expr.length && /[\d.]/.test(expr[i])) s += expr[i++];
      if (s !== '-') { tokens.push({ kind: 'NUM', value: parseFloat(s) }); continue; }
    }

    if (/[a-zA-Z_]/.test(expr[i])) {
      let s = '';
      while (i < expr.length && /\w/.test(expr[i])) s += expr[i++];
      if      (s === 'and')   tokens.push({ kind: 'AND',  value: 'and'  });
      else if (s === 'or')    tokens.push({ kind: 'OR',   value: 'or'   });
      else if (s === 'not')   tokens.push({ kind: 'NOT',  value: 'not'  });
      else if (s === 'True')  tokens.push({ kind: 'BOOL', value: true   });
      else if (s === 'False') tokens.push({ kind: 'BOOL', value: false  });
      else                    tokens.push({ kind: 'IDENT', value: s     });
      continue;
    }

    i++;
  }
  return tokens;
}

function evalTokens(tokens: Token[], vars: Vars): boolean {
  let pos = 0;
  const peek    = (): Token | null => tokens[pos] ?? null;
  const consume = (): Token        => tokens[pos++];

  function parseAtom(): any {
    const t = peek();
    if (!t) return false;
    if (t.kind === 'LPAREN') {
      consume();
      const val = parseOr();
      if (peek()?.kind === 'RPAREN') consume();
      return val;
    }
    if (t.kind === 'NUM' || t.kind === 'STR' || t.kind === 'BOOL') {
      consume(); return t.value;
    }
    if (t.kind === 'IDENT') {
      consume();
      return t.value in vars ? vars[t.value] : t.value;
    }
    return false;
  }

  function parseCompare(): any {
    const left = parseAtom();
    const op   = peek();
    const CMP: TokenKind[] = ['EQ','NEQ','LT','GT','LTE','GTE'];
    if (!op || !CMP.includes(op.kind)) return left;
    consume();
    const right = parseAtom();
    switch (op.kind) {
      case 'EQ':  return left == right;  // eslint-disable-line eqeqeq
      case 'NEQ': return left != right;  // eslint-disable-line eqeqeq
      case 'LT':  return left <  right;
      case 'GT':  return left >  right;
      case 'LTE': return left <= right;
      case 'GTE': return left >= right;
    }
    return false;
  }

  function parseNot(): any {
    if (peek()?.kind === 'NOT') { consume(); return !parseNot(); }
    return parseCompare();
  }

  function parseAnd(): any {
    let left = parseNot();
    while (peek()?.kind === 'AND') { consume(); left = Boolean(left) && Boolean(parseNot()); }
    return left;
  }

  function parseOr(): any {
    let left = parseAnd();
    while (peek()?.kind === 'OR') { consume(); left = Boolean(left) || Boolean(parseAnd()); }
    return left;
  }

  try { return Boolean(parseOr()); } catch { return false; }
}

function evalCondition(expr: string, vars: Vars): boolean {
  try {
    return evalTokens(tokenize(substituteVars(expr, vars)), vars);
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// BLOCK PROCESSOR
// ─────────────────────────────────────────────────────────────

interface ProcessResult {
  resolved: SourceLine[];
  errors:   CompileError[];
}

function processLines(lines: SourceLine[], vars: Vars): ProcessResult {
  const resolved: SourceLine[] = [];
  const errors:   CompileError[] = [];
  let i = 0;

  while (i < lines.length) {
    const { text, srcLine } = lines[i];
    const trimmed = text.trim();

    if (!trimmed || trimmed.startsWith('#')) { i++; continue; }

    const headerIndent = getIndent(text);

    // ── Variable assignment ──────────────────────────────────
    const assignMatch = trimmed.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
    if (assignMatch && !trimmed.startsWith('robot.')) {
      const [, name, raw] = assignMatch;
      const v = raw.trim();
      if (!isNaN(Number(v))) {
        vars[name] = Number(v);
      } else if (v === 'True') {
        vars[name] = true;
      } else if (v === 'False') {
        vars[name] = false;
      } else if (
        (v.startsWith('"') && v.endsWith('"')) ||
        (v.startsWith("'") && v.endsWith("'"))
      ) {
        vars[name] = v.slice(1, -1);
      } else if (v in vars) {
        vars[name] = vars[v];
      } else {
        vars[name] = v;
      }
      i++;
      continue;
    }

    // ── for … in range(…): ───────────────────────────────────
    const forMatch = trimmed.match(/^for\s+(\w+)\s+in\s+range\(([^)]+)\)\s*:/);
    if (forMatch) {
      const [, iterVar, rangeRaw] = forMatch;
      const rangeArgs = rangeRaw.split(',').map(s => parseInt(substituteVars(s.trim(), vars), 10));
      let start = 0, stop = 0, step = 1;
      if (rangeArgs.length === 1)      [stop]              = rangeArgs;
      else if (rangeArgs.length === 2) [start, stop]       = rangeArgs;
      else                             [start, stop, step] = rangeArgs;
      step = step || 1;

      i++;
      const { body, endIdx } = extractBody(lines, i, headerIndent);
      i = endIdx;

      const iterations = step > 0
        ? Array.from({ length: Math.max(0, Math.ceil((stop - start) / step)) }, (_, k) => start + k * step)
        : Array.from({ length: Math.max(0, Math.ceil((start - stop) / -step)) }, (_, k) => start + k * step);

      for (const j of iterations) {
        const { resolved: sub, errors: subErr } = processLines(body, { ...vars, [iterVar]: j });
        resolved.push(...sub);
        errors.push(...subErr);
      }
      continue;
    }

    // ── if / elif / else ─────────────────────────────────────
    const ifMatch = trimmed.match(/^if\s+(.+)\s*:/);
    if (ifMatch) {
      type Branch = { condition: string | null; bodyLines: SourceLine[] };
      const branches: Branch[] = [];

      i++;
      const { body: ifBody, endIdx: afterIf } = extractBody(lines, i, headerIndent);
      i = afterIf;
      branches.push({ condition: ifMatch[1].trim(), bodyLines: ifBody });

      // Collect elif / else at same indent level
      while (i < lines.length) {
        const nl = lines[i];
        const nt = nl.text.trim();
        if (!nt) { i++; continue; }
        if (getIndent(nl.text) !== headerIndent) break;

        const elifMatch = nt.match(/^elif\s+(.+)\s*:/);
        if (elifMatch) {
          i++;
          const { body: elifBody, endIdx: afterElif } = extractBody(lines, i, headerIndent);
          i = afterElif;
          branches.push({ condition: elifMatch[1].trim(), bodyLines: elifBody });
          continue;
        }

        if (nt === 'else:') {
          i++;
          const { body: elseBody, endIdx: afterElse } = extractBody(lines, i, headerIndent);
          i = afterElse;
          branches.push({ condition: null, bodyLines: elseBody });
          break;
        }

        break;
      }

      // Evaluate — run first matching branch
      let matched = false;
      for (const branch of branches) {
        if (matched) break;
        const run = branch.condition === null
          ? true
          : evalCondition(branch.condition, vars);
        if (run) {
          matched = true;
          const { resolved: sub, errors: subErr } = processLines(branch.bodyLines, { ...vars });
          resolved.push(...sub);
          errors.push(...subErr);
        }
      }
      continue;
    }

    // ── robot.xxx() command ───────────────────────────────────
    if (trimmed.startsWith('robot.')) {
      const substituted = trimmed.replace(
        /^(robot\.[^(]+\()(.*)(\))$/,
        (_, pre: string, args: string, suf: string) =>
          pre + substituteVars(args, vars) + suf
      );
      resolved.push({ text: substituted, srcLine });
      i++;
      continue;
    }

    // ── Unrecognised line ────────────────────────────────────
    errors.push({ line: srcLine, msg: `Syntax error: "${trimmed}"` });
    i++;
  }

  return { resolved, errors };
}

// ─────────────────────────────────────────────────────────────
// PARAM PARSER
// ─────────────────────────────────────────────────────────────

function parseParams(str: string): Record<string, any> {
  const p: Record<string, any> = {};
  if (!str?.trim()) return p;
  let pos = 0;
  str.split(',').forEach(chunk => {
    chunk = chunk.trim();
    if (!chunk) return;
    if (chunk.includes('=')) {
      const eqIdx = chunk.indexOf('=');
      const k = chunk.slice(0, eqIdx).trim();
      const v = chunk.slice(eqIdx + 1).trim();
      p[k] = isNaN(Number(v)) ? v.replace(/['"]/g, '') : Number(v);
    } else {
      p['_p' + (pos++)] = isNaN(Number(chunk))
        ? chunk.replace(/['"]/g, '')
        : Number(chunk);
    }
  });
  return p;
}

// ─────────────────────────────────────────────────────────────
// LINE PARSER
// ─────────────────────────────────────────────────────────────

type ParsedLine =
  | { error: string }
  | { cmd: CommandDef; params: Record<string, any>; path: string; rawLine: string };

function parseLine(line: string): ParsedLine | null {
  line = line.trim();
  if (!line || line.startsWith('#')) return null;

  const m = line.match(/^robot\.([a-zA-Z_][\w]*(?:\.[\w]+)*)\((.*?)\)$/);
  if (!m) return { error: `Syntax error: "${line}"` };

  const [, path, rawArgs] = m;
  const cmd = CommandRegistry.get(path);
  if (!cmd) return { error: `Unknown command: robot.${path}()` };

  const params = parseParams(rawArgs);
  cmd.params?.forEach((cp, idx) => {
    if (params[cp.name] === undefined) {
      if (params['_p' + idx] !== undefined) params[cp.name] = params['_p' + idx];
      else if (cp.default !== undefined)    params[cp.name] = cp.default;
    }
  });

  return { cmd, params, path, rawLine: line };
}

// ─────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────

export const Interpreter = {
  /**
   * Compile a user script into a flat, executable Action list.
   *
   * Pipeline:
   *  1. Tag each line with its source line number.
   *  2. processLines() — variable assignment, for loops,
   *                      if/elif/else, variable substitution.
   *  3. Guard against expanded scripts exceeding MAX_ACTIONS.
   *  4. parseLine()    — validate each robot.xxx() call and
   *                      resolve params against CommandRegistry.
   */
  compile(code: string): CompileResult {
    const rawLines: SourceLine[] = code
      .split('\n')
      .map((text, idx) => ({ text, srcLine: idx + 1 }));

    const vars: Vars = {};
    const { resolved, errors: processErrors } = processLines(rawLines, vars);

    if (resolved.length > MAX_ACTIONS) {
      return {
        actions: [],
        errors: [{
          line: 0,
          msg: `Script expanded to ${resolved.length} actions (max ${MAX_ACTIONS}). ` +
               `Possible infinite loop — check your for loop range.`,
        }],
      };
    }

    const actions: Action[] = [];
    const errors: CompileError[] = [...processErrors];

    for (const { text, srcLine } of resolved) {
      const trimmed = text.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const result = parseLine(trimmed);
      if (!result) continue;
      if ('error' in result) {
        errors.push({ line: srcLine, msg: result.error });
      } else {
        actions.push({ ...result, srcLine });
      }
    }

    return { actions, errors };
  },
};
