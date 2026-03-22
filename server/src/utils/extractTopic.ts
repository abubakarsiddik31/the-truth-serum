const CANDIDATE_KEYS = ['topic', 'query', 'product', 'trend'];
const WRAPPER_KEYS = ['parameters', 'body', 'payload', 'request_body', 'data', 'input', 'args'];

export function extractTopic(body: unknown = {}): string {
  const find = (value: unknown, depth = 0): string => {
    if (depth > 6 || value == null) return '';

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return '';
      if (depth > 0) return trimmed;
      if (
        (trimmed.startsWith('{') && trimmed.endsWith('}')) ||
        (trimmed.startsWith('[') && trimmed.endsWith(']'))
      ) {
        try {
          return find(JSON.parse(trimmed), depth + 1);
        } catch {
          return '';
        }
      }
      return '';
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (!item || typeof item !== 'object') continue;
        const rec = item as Record<string, unknown>;
        const keyName = [rec.name, rec.id, rec.key, rec.field].find(
          (v): v is string => typeof v === 'string',
        );
        const valCandidate = [rec.value, rec.constant_value, rec.text].find(
          (v): v is string => typeof v === 'string' && v.trim() !== '',
        );
        if (keyName && CANDIDATE_KEYS.includes(keyName) && valCandidate) {
          return valCandidate.trim();
        }
      }
      for (const item of value) {
        const found = find(item, depth + 1);
        if (found) return found;
      }
      return '';
    }

    if (typeof value !== 'object') return '';

    const obj = value as Record<string, unknown>;

    for (const key of CANDIDATE_KEYS) {
      const field = obj[key];
      if (typeof field === 'string' && field.trim()) return field.trim();
    }
    for (const key of WRAPPER_KEYS) {
      const found = find(obj[key], depth + 1);
      if (found) return found;
    }
    for (const nested of Object.values(obj)) {
      const found = find(nested, depth + 1);
      if (found) return found;
    }
    return '';
  };

  return find(body);
}
