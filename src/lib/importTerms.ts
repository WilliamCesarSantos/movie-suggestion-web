export const IMPORT_MAX_PAGES = 5;

export function normalizeSearchTerms(text: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const line of text.split(/\r\n|\n|\r/)) {
    const term = line.trim();
    if (!term) continue;
    const key = term.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(term);
  }
  return result;
}
