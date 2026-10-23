export function safeNavigationHref(target?: string): string | undefined {
  const value = target?.trim();
  if (!value) return undefined;
  if (value.startsWith("#") || (value.startsWith("/") && !value.startsWith("//"))) return value;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? value : undefined;
  } catch {
    return undefined;
  }
}
