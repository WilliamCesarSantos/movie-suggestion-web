export function parseImportMovieNames(raw: string): string[] {
  const lines = raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  return Array.from(new Set(lines));
}
