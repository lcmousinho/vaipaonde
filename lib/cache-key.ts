export function createCacheKey(prefix: string, payload: unknown): string {
  if (!payload || typeof payload !== "object") {
    return `${prefix}:${String(payload)}`;
  }

  const normalizedEntries = Object.entries(payload)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.trim().toLowerCase()];
      }

      return [key, value];
    });

  return `${prefix}:${JSON.stringify(Object.fromEntries(normalizedEntries))}`;
}