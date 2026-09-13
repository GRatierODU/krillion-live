export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = cur;
  }
  return prev[n] ?? n;
}

/** Length-scaled typo check. Accents already stripped. */
export function closeEnough(input: string, candidate: string): boolean {
  if (!input || !candidate) return false;
  if (input === candidate) return true;
  const min = Math.min(input.length, candidate.length);
  const max = Math.max(input.length, candidate.length);
  if (min < 3) return false;
  const allowed = min <= 4 ? 1 : min <= 7 ? 2 : min <= 11 ? 3 : 4;
  if (max - min > allowed) return false;
  return levenshtein(input, candidate) <= allowed;
}

/** Substantial substring after normalize/compact. Blocks 1–2 letter junk. */
export function substantialContainment(input: string, candidate: string): boolean {
  if (!input || !candidate || input === candidate) return false;
  const shorter = input.length <= candidate.length ? input : candidate;
  const longer = input.length <= candidate.length ? candidate : input;
  if (shorter.length < 4 && shorter.length < 0.6 * longer.length) return false;
  if (input.length < 4 && candidate.length >= 4 && !longer.includes(shorter)) {
    return false;
  }
  return longer.includes(shorter);
}
