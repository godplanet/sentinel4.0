import { addDays, addMonths, addYears, format, parseISO, isValid } from 'date-fns';

type FormulaContext = Record<string, string>;

function parseDate(val: string): Date | null {
  // Try DD.MM.YYYY
  const ddmmyyyy = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(val);
  if (ddmmyyyy) return new Date(+ddmmyyyy[3], +ddmmyyyy[2] - 1, +ddmmyyyy[1]);
  const d = parseISO(val);
  return isValid(d) ? d : null;
}

function formatOut(d: Date, fmt = 'dd.MM.yyyy'): string {
  return format(d, fmt);
}

// Tokenize a simple function call: funcName(arg1, arg2, ...)
function parseCall(expr: string): { fn: string; args: string[] } | null {
  const m = /^(\w+)\s*\((.+)\)$/.exec(expr.trim());
  if (!m) return null;
  // Split args by comma but not inside quotes
  const args: string[] = [];
  let depth = 0, cur = '', inQ = false;
  for (const ch of m[2]) {
    if (ch === '"' || ch === "'") { inQ = !inQ; cur += ch; }
    else if (!inQ && ch === '(') { depth++; cur += ch; }
    else if (!inQ && ch === ')') { depth--; cur += ch; }
    else if (!inQ && depth === 0 && ch === ',') { args.push(cur.trim()); cur = ''; }
    else { cur += ch; }
  }
  if (cur.trim()) args.push(cur.trim());
  return { fn: m[1].toLowerCase(), args };
}

function resolveArg(arg: string, ctx: FormulaContext): string {
  // strip quotes
  if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
    return arg.slice(1, -1);
  }
  // nested call
  if (/^\w+\s*\(/.test(arg)) return evaluateFormula(arg, ctx);
  // context lookup
  return ctx[arg] ?? arg;
}

export function evaluateFormula(expr: string, ctx: FormulaContext): string {
  const call = parseCall(expr);
  if (!call) {
    // plain key or literal
    const stripped = expr.replace(/^['"]|['"]$/g, '');
    return ctx[stripped] ?? stripped;
  }

  const { fn, args } = call;
  const a = (i: number) => resolveArg(args[i] ?? '', ctx);

  switch (fn) {
    case 'adddays': {
      const d = parseDate(a(0));
      if (!d) return `[invalid date: ${a(0)}]`;
      return formatOut(addDays(d, parseInt(a(1)) || 0));
    }
    case 'addmonths': {
      const d = parseDate(a(0));
      if (!d) return `[invalid date: ${a(0)}]`;
      return formatOut(addMonths(d, parseInt(a(1)) || 0));
    }
    case 'addyears': {
      const d = parseDate(a(0));
      if (!d) return `[invalid date: ${a(0)}]`;
      return formatOut(addYears(d, parseInt(a(1)) || 0));
    }
    case 'formatdate': {
      const d = parseDate(a(0));
      if (!d) return `[invalid date: ${a(0)}]`;
      return formatOut(d, a(1) || 'dd.MM.yyyy');
    }
    case 'concat':
      return args.map((_, i) => a(i)).join('');
    case 'upper':
      return a(0).toUpperCase();
    case 'lower':
      return a(0).toLowerCase();
    case 'if': {
      // if(condition, trueVal, falseVal) - condition is equality check "a=b"
      const cond = a(0);
      const [lhs, rhs] = cond.split('=').map(s => s.trim());
      const lhsVal = ctx[lhs] ?? lhs;
      const rhsVal = ctx[rhs] ?? rhs;
      return lhsVal === rhsVal ? a(1) : a(2);
    }
    case 'coalesce':
      for (let i = 0; i < args.length; i++) {
        const v = a(i);
        if (v && v !== 'null' && v !== 'undefined' && v !== '') return v;
      }
      return '';
    default:
      return `[unknown function: ${fn}]`;
  }
}

export function resolveAllFormulas(
  placeholders: Array<{ key: string; source_type: string; formula_expression: string | null }>,
  values: FormulaContext
): FormulaContext {
  const result = { ...values };
  // Multiple passes to handle dependencies
  for (let pass = 0; pass < 3; pass++) {
    for (const ph of placeholders) {
      if (ph.source_type === 'formula' && ph.formula_expression) {
        result[ph.key] = evaluateFormula(ph.formula_expression, result);
      }
    }
  }
  return result;
}
