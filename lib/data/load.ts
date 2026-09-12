import type { Prompt, TierId } from "../types";

const TIER: Record<string, TierId> = {
  p: "plancton",
  t: "trop_malin",
  b: "banc",
  r: "rare",
  c: "coupe",
  k: "krillion",
};

type CompactAnswer = [string, string] | [string, string, string[]];
export type CompactPrompt = [string, string, string, CompactAnswer[]];

export const BANK_URLS = [
  "/bank.json",
  "/api/catalog",
  "https://raw.githubusercontent.com/GRatierODU/krillion-prompts/main/bank.json",
  "https://cdn.jsdelivr.net/gh/GRatierODU/krillion-prompts@main/bank.json",
];

export function inflate(rows: CompactPrompt[]): Prompt[] {
  return rows.map(([id, category, text, answers]) => ({
    id,
    category,
    text,
    answers: answers.map((row) => ({
      display: row[0],
      tier: TIER[row[1]] ?? "plancton",
      aliases: row[2] ?? [],
    })),
  }));
}

let cached: Prompt[] | null = null;

export async function loadPrompts(): Promise<Prompt[]> {
  if (cached) return cached;

  const errors: string[] = [];
  for (const url of BANK_URLS) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const rows = (await response.json()) as CompactPrompt[];
      const prompts = inflate(rows);
      if (prompts.length < 7) {
        throw new Error(`banque trop petite (${prompts.length})`);
      }
      const ids = new Set<string>();
      for (const prompt of prompts) {
        if (ids.has(prompt.id)) {
          throw new Error(`Prompt id dupliqué: ${prompt.id}`);
        }
        ids.add(prompt.id);
      }
      cached = prompts;
      return prompts;
    } catch (error) {
      errors.push(`${url}: ${error instanceof Error ? error.message : "échec"}`);
    }
  }
  throw new Error(errors.join(" · "));
}

export function promptCount(): number {
  return cached?.length ?? 0;
}
