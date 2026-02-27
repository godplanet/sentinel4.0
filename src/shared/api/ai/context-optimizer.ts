const MAX_ARRAY_ITEMS = 5;
const STRIP_KEYS = new Set([
  'tenant_id', 'created_by', 'updated_at', 'updated_by',
  'is_archived', 'is_deleted', 'raw_json', 'embedding',
  'vector', 'hash', 'checksum',
]);

function isHeavyArray(val: unknown): val is unknown[] {
  return Array.isArray(val) && val.length > MAX_ARRAY_ITEMS;
}

function sanitizeValue(key: string, val: unknown, depth: number): unknown {
  if (STRIP_KEYS.has(key)) return undefined;
  if (val === null || val === undefined) return undefined;
  if (typeof val === 'string' && val.length > 500) return val.slice(0, 500) + '...';
  if (isHeavyArray(val)) {
    const trimmed = val.slice(0, MAX_ARRAY_ITEMS).map((item, i) =>
      typeof item === 'object' && item !== null
        ? sanitizeObject(item as Record<string, unknown>, depth + 1)
        : item
    );
    return [...trimmed, `...(+${val.length - MAX_ARRAY_ITEMS} more)`];
  }
  if (typeof val === 'object' && !Array.isArray(val)) {
    return sanitizeObject(val as Record<string, unknown>, depth + 1);
  }
  return val;
}

function sanitizeObject(obj: Record<string, unknown>, depth: number): Record<string, unknown> {
  if (depth > 4) return { _truncated: true };
  const result: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(obj)) {
    const cleaned = sanitizeValue(key, val, depth);
    if (cleaned !== undefined) {
      result[key] = cleaned;
    }
  }
  return result;
}

export function optimizeContext(data: unknown): string {
  if (!data) return '';
  if (typeof data === 'string') return data.slice(0, 3000);

  try {
    const sanitized = typeof data === 'object'
      ? sanitizeObject(data as Record<string, unknown>, 0)
      : data;
    return JSON.stringify(sanitized, null, 2).slice(0, 4000);
  } catch {
    return String(data).slice(0, 3000);
  }
}
