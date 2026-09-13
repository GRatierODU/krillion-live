import { closeEnough, levenshtein } from "./fuzzy";
import { aliasSet, normalize } from "./normalize";
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

export function metersFromPoints(points: number): number {
  return points * METERS_PER_POINT;
}

function keysOf(answer: AnswerSpec): string[] {
  return aliasSet(answer.display, answer.aliases);
}

export function matchAnswer(prompt: Prompt, raw: string): AnswerSpec | null {
  const key = normalize(raw);
  if (!key) return null;
  const compact = key.replace(/ /g, "");

  for (const entry of prompt.answers) {
    for (const alias of keysOf(entry)) {
      if (alias === key) return entry;
      const aliasCompact = alias.replace(/ /g, "");
      if (compact.length >= 4 && aliasCompact === compact) return entry;
    }
  }

  let best: { answer: AnswerSpec; distance: number } | null = null;
  const tied = new Set<string>();
  for (const entry of prompt.answers) {
    for (const alias of keysOf(entry)) {
      const aliasCompact = alias.replace(/ /g, "");
      const hit =
        closeEnough(key, alias) ||
        (compact.length >= 4 && closeEnough(compact, aliasCompact));
      if (!hit) continue;
      const distance = Math.min(
        levenshtein(key, alias),
        compact && aliasCompact ? levenshtein(compact, aliasCompact) : 99,
      );
      if (!best || distance < best.distance) {
        best = { answer: entry, distance };
        tied.clear();
        tied.add(entry.display);
      } else if (distance === best.distance) {
        tied.add(entry.display);
      }
    }
  }
  if (!best || tied.size > 1) return null;
  return best.answer;
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
