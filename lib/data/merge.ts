import type { CompactPrompt } from "./load";

export function isTombstone(row: CompactPrompt): boolean {
  return row[2] === "" && Array.isArray(row[3]) && row[3].length === 0;
}

export function mergeCompact(
  base: CompactPrompt[],
  extra: CompactPrompt[],
): CompactPrompt[] {
  const extraBy = new Map(extra.map((row) => [row[0], row]));
  const removed = new Set(
    extra.filter(isTombstone).map((row) => row[0]),
  );
  const out: CompactPrompt[] = [];
  const seen = new Set<string>();
  for (const row of base) {
    if (removed.has(row[0])) continue;
    const next = extraBy.get(row[0]) ?? row;
    if (isTombstone(next)) continue;
    out.push(next);
    seen.add(next[0]);
  }
  for (const row of extra) {
    if (seen.has(row[0]) || removed.has(row[0]) || isTombstone(row)) continue;
    out.push(row);
    seen.add(row[0]);
  }
  return out;
}
