import { CommandRegistry, CommandDef } from './CommandRegistry';

export interface Action {
  cmd: CommandDef;
  params: any;
  path: string;
  rawLine: string;
}

export const Interpreter = {
  parseParams(str: string) {
    const p: Record<string, any> = {};
    if (!str || !str.trim()) return p;
    let pos = 0;
    str.split(',').forEach(chunk => {
      chunk = chunk.trim();
      if (!chunk) return;
      if (chunk.includes('=')) {
        const [k, v] = chunk.split('=').map(s => s.trim());
        p[k] = isNaN(Number(v)) ? v.replace(/['"]/g, '') : Number(v);
      } else {
        p['_p' + (pos++)] = isNaN(Number(chunk)) ? chunk.replace(/['"]/g, '') : Number(chunk);
      }
    });
    return p;
  },

  parseLine(line: string): { error?: string; cmd?: CommandDef; params?: any; path?: string; rawLine?: string } | null {
    line = line.trim();
    if (!line || line.startsWith('#')) return null;
    const m = line.match(/^robot\.([a-zA-Z_][\w]*(?:\.[\w]+)*)\((.*?)\)$/);
    if (!m) return { error: `Syntax error: "${line}"` };
    const path = m[1], raw = m[2];
    const cmd = CommandRegistry.get(path);
    if (!cmd) return { error: `Unknown command: robot.${path}()` };
    
    const params = this.parseParams(raw);
    
    // Assign positional args
    if (cmd.params) {
      cmd.params.forEach((cp, i) => {
        if (params[cp.name] === undefined) {
          if (params['_p' + i] !== undefined) params[cp.name] = params['_p' + i];
          else if (cp.default !== undefined) params[cp.name] = cp.default;
        }
      });
    }
    return { cmd, params, path, rawLine: line };
  },

  expandLoops(lines: string[]): string[] {
    const out: string[] = [];
    let i = 0;
    while (i < lines.length) {
      const l = lines[i];
      const lm = l.match(/^for\s+\w+\s+in\s+range\(([^)]+)\)\s*:/);
      if (lm) {
        const rangeArgs = lm[1].split(',').map(s => parseInt(s.trim(), 10));
        let start = 0, stop = 0, step = 1;
        if (rangeArgs.length === 1) {
          stop = rangeArgs[0];
        } else if (rangeArgs.length === 2) {
          start = rangeArgs[0];
          stop = rangeArgs[1];
        } else if (rangeArgs.length >= 3) {
          start = rangeArgs[0];
          stop = rangeArgs[1];
          step = rangeArgs[2] || 1;
        }
        const body: string[] = [];
        i++;
        while (i < lines.length && (lines[i].startsWith(' ') || lines[i].startsWith('\t') || !lines[i].trim())) {
          if (lines[i].trim()) body.push(lines[i].replace(/^[ \t]+/, ''));
          i++;
        }
        if (step > 0) {
          for (let j = start; j < stop; j += step) out.push(...this.expandLoops(body));
        } else {
          for (let j = start; j > stop; j += step) out.push(...this.expandLoops(body));
        }
      } else {
        out.push(l);
        i++;
      }
    }
    return out;
  },

  compile(code: string): { actions: Action[]; errors: { line: number; msg: string }[] } {
    const lines = this.expandLoops(code.split('\n'));
    const actions: Action[] = [];
    const errors: { line: number; msg: string }[] = [];
    
    lines.forEach((line, idx) => {
      if (!line.trim() || line.trim().startsWith('#')) return;
      const r = this.parseLine(line.trim());
      if (!r) return;
      if (r.error) errors.push({ line: idx + 1, msg: r.error });
      else if (r.cmd && r.params && r.path && r.rawLine) {
        actions.push({ cmd: r.cmd, params: r.params, path: r.path, rawLine: r.rawLine });
      }
    });
    return { actions, errors };
  }
};
