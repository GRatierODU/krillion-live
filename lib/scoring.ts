import { closeEnough, levenshtein, substantialContainment } from "./fuzzy";
import { aliasSet, compactKey, normalize } from "./normalize";
import { rememberRecentIds, recentPromptIds } from "./storage";
import type { AnswerSpec, Grade, Prompt, TierId } from "./types";

export const TIER_POINTS: Record<TierId, number> = {
  plancton: 10,
  trop_malin: 20,
  banc: 30,
  rare: 50,
  coupe: 70,
  krillion: 100,
};

export const TIER_LABEL: Record<TierId, string> = {
  plancton: "PLANCTON",
  trop_malin: "TROP MALIN",
  banc: "BANC",
  rare: "RARE",
  coupe: "COUPE PROFONDE",
  krillion: "UN SUR UN KRILLION",
};

export const TIER_FLAVOR: Record<TierId, string> = {
  plancton: "la réponse que tout le monde sort.",
  trop_malin: "malin — mais le banc y avait pensé.",
  banc: "solide — nage avec le banc.",
  rare: "ça descend. peu de monde y pense.",
  coupe: "les abysses s'ouvrent.",
  krillion: "une perle. presque personne.",
};

export const TIER_COLOR: Record<TierId, string> = {
  plancton: "#f5d76e",
  trop_malin: "#7ecbff",
  banc: "#5ee0e8",
  rare: "#ff7eb3",
  coupe: "#c9b6ff",
  krillion: "#fff4b0",
};

/** French creature names shown above the answer placard while diving. */
export const TIER_CREATURE: Record<TierId, string> = {
  plancton: "BULLES",
  trop_malin: "CREVETTE",
  banc: "POISSON",
  rare: "POISSON ROSE",
  coupe: "MÉDUSE",
  krillion: "BAUDROIE",
};

export const TIER_CREATURE_KEY: Record<TierId, string> = {
  plancton: "bulles",
  trop_malin: "crevette",
  banc: "poisson",
  rare: "poisson-rose",
  coupe: "meduse",
  krillion: "baudroie",
};

/** Bilan catalogue: rarest first, plancton last. */
export const TIER_ORDER: TierId[] = [
  "krillion",
  "coupe",
  "rare",
  "banc",
  "trop_malin",
  "plancton",
];

/** Shallow → abyss, for the live dive creature. */
export const TIER_ASCEND: TierId[] = [
  "plancton",
  "trop_malin",
  "banc",
  "rare",
  "coupe",
  "krillion",
];

/** Creature / color band from current camera depth. Lands on a tier at its settle depth. */
export function tierAtMeters(meters: number): TierId {
  const d = Math.max(0, meters);
  if (d > 700) return "krillion";
  if (d > 500) return "coupe";
  if (d > 300) return "rare";
  if (d > 200) return "banc";
  if (d > 100) return "trop_malin";
  return "plancton";
}

export function liveDiveTier(shownMeters: number, cap: TierId): TierId {
  const raw = TIER_ASCEND.indexOf(tierAtMeters(shownMeters));
  const limit = TIER_ASCEND.indexOf(cap);
  return TIER_ASCEND[Math.max(0, Math.min(raw, limit))];
}

export const METERS_PER_POINT = 10;
export const PROMPTS_PER_DIVE = 7;
export const SECONDS_PER_PROMPT = 25;

/** Banc — palier « nage avec le banc », dénominateur du coef de difficulté. */
export const TYPICAL_TIER_POINTS = TIER_POINTS.banc;
export const DIFFICULTY_MIN = 0.75;
export const DIFFICULTY_MAX = 1.5;

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n));
}

/** Médiane ; si N pair, moyenne des deux valeurs centrales. */
export function medianNumber(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

export function promptMedianPoints(answers: AnswerSpec[]): number {
  return medianNumber(answers.map((item) => TIER_POINTS[item.tier] ?? 0));
}

/** Coef 0,75–1,5 : médiane du prompt ÷ 30 pts (Banc), borné. */
export function promptDifficulty(medianPoints: number): number {
  if (!Number.isFinite(medianPoints) || medianPoints <= 0) return DIFFICULTY_MIN;
  return clamp(medianPoints / TYPICAL_TIER_POINTS, DIFFICULTY_MIN, DIFFICULTY_MAX);
}

/**
 * Joueur moyen sur ces 7 : moyenne des médianes pondérée par la difficulté,
 * ramenée à un total de 7 questions.
 * reference = Σ(médiane_i × coef_i) / Σ(coef_i) × 7
 */
export function typicalDiveReference(catalogs: AnswerSpec[][]): number {
  if (catalogs.length === 0) return 0;
  let weighted = 0;
  let weight = 0;
  for (const answers of catalogs) {
    const median = promptMedianPoints(answers);
    const difficulty = promptDifficulty(median);
    weighted += median * difficulty;
    weight += difficulty;
  }
  if (weight <= 0) return 0;
  return (weighted / weight) * catalogs.length;
}

export function metersFromPoints(points: number): number {
  return points * METERS_PER_POINT;
}

function keysOf(answer: AnswerSpec): string[] {
  return aliasSet(answer.display, answer.aliases);
}

const TIER_COMMON_FIRST = TIER_ASCEND;

type MatchRank = 0 | 1 | 2 | 3;

function tierCommonness(tier: TierId): number {
  const idx = TIER_COMMON_FIRST.indexOf(tier);
  return idx < 0 ? 99 : idx;
}

function betterMatch(
  next: { answer: AnswerSpec; rank: MatchRank; score: number },
  best: { answer: AnswerSpec; rank: MatchRank; score: number } | null,
): boolean {
  if (!best) return true;
  if (next.rank !== best.rank) return next.rank < best.rank;
  if (next.score !== best.score) return next.score > best.score;
  return tierCommonness(next.answer.tier) < tierCommonness(best.answer.tier);
}

export function matchAnswer(prompt: Prompt, raw: string): AnswerSpec | null {
  const key = normalize(raw);
  if (!key) return null;
  const compact = compactKey(key);

  let best: { answer: AnswerSpec; rank: MatchRank; score: number } | null = null;

  for (const entry of prompt.answers) {
    for (const alias of keysOf(entry)) {
      const aliasCompact = compactKey(alias);
      let rank: MatchRank | null = null;
      let score = 0;

      if (alias === key) {
        rank = 0;
        score = 1;
      } else if (compact.length >= 4 && aliasCompact === compact) {
        rank = 1;
        score = 1;
      } else if (
        substantialContainment(key, alias) ||
        (compact.length >= 4 && substantialContainment(compact, aliasCompact))
      ) {
        rank = 2;
        const shorter = Math.min(compact.length, aliasCompact.length);
        const longer = Math.max(compact.length, aliasCompact.length) || 1;
        score = shorter / longer;
      } else if (
        closeEnough(key, alias) ||
        (compact.length >= 4 && closeEnough(compact, aliasCompact))
      ) {
        rank = 3;
        const dist = Math.min(
          levenshtein(key, alias),
          compact && aliasCompact ? levenshtein(compact, aliasCompact) : 99,
        );
        const span = Math.max(compact.length, aliasCompact.length, key.length, alias.length, 1);
        score = 1 - dist / span;
      }

      if (rank === null) continue;
      const next = { answer: entry, rank, score };
      if (betterMatch(next, best)) best = next;
    }
  }

  return best?.answer ?? null;
}

export function gradeMatch(entry: AnswerSpec): Grade {
  const points = TIER_POINTS[entry.tier];
  return {
    ok: true,
    display: entry.display,
    tier: entry.tier,
    points,
    meters: metersFromPoints(points),
  };
}

export function gradeTimeout(): Grade {
  return { ok: false, display: "", points: 0, meters: 0, reason: "timeout" };
}

export function groupCatalog(
  catalog: AnswerSpec[],
): { tier: TierId; words: string[] }[] {
  return TIER_ORDER.map((tier) => ({
    tier,
    words: catalog
      .filter((item) => item.tier === tier)
      .map((item) => item.display),
  })).filter((group) => group.words.length > 0);
}

const TEST_DIVE_IDS = [
  "peintre",
  "capitale-eu",
  "pays-i",
  "ocean",
  "fromage",
  "element",
  "jour",
];

export function pickPlayableDive(bank: Prompt[]): Prompt[] {
  if (typeof window !== "undefined") {
    try {
      if (new URLSearchParams(window.location.search).has("test")) {
        const chosen = TEST_DIVE_IDS.map((id) =>
          bank.find((prompt) => prompt.id === id),
        ).filter((prompt): prompt is Prompt => Boolean(prompt));
        if (chosen.length === PROMPTS_PER_DIVE) return chosen;
      }
    } catch {
      /* ignore bad query strings */
    }
  }
  return pickDive(bank);
}

function cryptoInt(maxExclusive: number): number {
  if (maxExclusive <= 1) return 0;
  const rng = typeof globalThis.crypto !== "undefined" ? globalThis.crypto : null;
  if (rng?.getRandomValues) {
    const limit = 0x100000000 - (0x100000000 % maxExclusive);
    const buf = new Uint32Array(1);
    let x = 0;
    do {
      rng.getRandomValues(buf);
      x = buf[0];
    } while (x >= limit);
    return x % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
}

export function shuffleInPlace<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = cryptoInt(i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

export function pickDive(bank: Prompt[], count = PROMPTS_PER_DIVE): Prompt[] {
  if (bank.length < count) {
    throw new Error("La banque de prompts est trop petite.");
  }
  const recent = new Set(recentPromptIds());
  const fresh = shuffleInPlace(bank.filter((prompt) => !recent.has(prompt.id)));
  const reused = shuffleInPlace(bank.filter((prompt) => recent.has(prompt.id)));
  const picked: Prompt[] = [];
  const seen = new Set<string>();
  for (const prompt of [...fresh, ...reused]) {
    if (seen.has(prompt.id)) continue;
    seen.add(prompt.id);
    picked.push(prompt);
    if (picked.length === count) break;
  }
  rememberRecentIds(picked.map((prompt) => prompt.id));
  return picked;
}

export function answer(display: string, tier: TierId, aliases: string[] = []) {
  return { display, aliases, tier };
}
