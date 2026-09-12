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

/** Conservative typo check: accents already stripped. Unrelated short words stay out. */
export function closeEnough(input: string, candidate: string): boolean {
  if (!input || !candidate) return false;
  if (input === candidate) return true;
  const min = Math.min(input.length, candidate.length);
  const max = Math.max(input.length, candidate.length);
  if (min < 3) return false;
  if (max - min > (min <= 5 ? 1 : 2)) return false;
  const distance = levenshtein(input, candidate);
  if (min <= 5) return distance <= 1;
  return distance <= 2;
}
