export function asString(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function requireString(
  value: string | string[] | undefined,
  field: string,
): string {
  const normalized = asString(value);

  if (!normalized) {
    throw new Error(`${field} is required`);
  }

  return normalized;
}
