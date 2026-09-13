import type { CompactPrompt } from "./load";

export function mergeCompact(
  base: CompactPrompt[],
  extra: CompactPrompt[],
): CompactPrompt[] {
  const extraBy = new Map(extra.map((row) => [row[0], row]));
  const out = base.map((row) => extraBy.get(row[0]) ?? row);
  const seen = new Set(out.map((row) => row[0]));
  for (const row of extra) {
    if (!seen.has(row[0])) {
      out.push(row);
      seen.add(row[0]);
    }
  }
  return out;
}
