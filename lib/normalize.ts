const ARTICLES = new Set([
  "le",
  "la",
  "les",
  "un",
  "une",
  "des",
  "du",
  "de",
  "l",
  "au",
  "aux",
  "d",
]);

export function normalize(raw: string): string {
  const stripped = raw
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/['’`´]/g, "")
    .replace(/&/g, " et ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

  if (!stripped) return "";

  const words = stripped.split(" ");
  while (words.length > 1 && ARTICLES.has(words[0])) {
    words.shift();
  }
  return words.join(" ");
}

export function aliasSet(canonical: string, aliases: string[] = []): string[] {
  const all = [canonical, ...aliases];
  const unique = new Set(all.map(normalize).filter(Boolean));
  return [...unique];
}
