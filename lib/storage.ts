const KEY = "krillion-fr-stats";

export type Stats = {
  diveCount: number;
  bestDepth: number;
  bestScore: number;
  muted: boolean;
};

export const DEFAULT_STATS: Stats = {
  diveCount: 0,
  bestDepth: 0,
  bestScore: 0,
  muted: false,
};

const listeners = new Set<() => void>();

/** Same reference while values are unchanged — required by useSyncExternalStore. */
let snapshot: Stats = DEFAULT_STATS;

function emit() {
  for (const listener of listeners) listener();
}

export function subscribeStats(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function sameStats(a: Stats, b: Stats) {
  return (
    a.diveCount === b.diveCount &&
    a.bestDepth === b.bestDepth &&
    a.bestScore === b.bestScore &&
    a.muted === b.muted
  );
}

function remember(next: Stats): Stats {
  if (sameStats(snapshot, next)) return snapshot;
  snapshot = next;
  return snapshot;
}

function canUseStorage() {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function readStorage(): Stats {
  if (!canUseStorage()) return DEFAULT_STATS;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return DEFAULT_STATS;
    const parsed = JSON.parse(raw) as Partial<Stats>;
    return {
      diveCount: Number(parsed.diveCount) || 0,
      bestDepth: Number(parsed.bestDepth) || 0,
      bestScore: Number(parsed.bestScore) || 0,
      muted: Boolean(parsed.muted),
    };
  } catch {
    return DEFAULT_STATS;
  }
}

export function loadStats(): Stats {
  return remember(readStorage());
}

export function saveStats(next: Stats) {
  remember(next);
  if (canUseStorage()) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(snapshot));
    } catch {
      /* private mode / quota — keep playing */
    }
  }
  emit();
}

export function recordDive(score: number, depth: number): Stats {
  const current = loadStats();
  const next: Stats = {
    ...current,
    diveCount: current.diveCount + 1,
    bestScore: Math.max(current.bestScore, score),
    bestDepth: Math.max(current.bestDepth, depth),
  };
  saveStats(next);
  return snapshot;
}

export function setMuted(muted: boolean): Stats {
  saveStats({ ...loadStats(), muted });
  return snapshot;
}
