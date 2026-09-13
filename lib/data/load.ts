import type { Prompt, TierId } from "../types";
import { loadBundled } from "./bundled";

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

type Manifest = { parts: string[] };

export const BANK_URLS = [
  "/bank.json",
  "/api/catalog",
  "https://raw.githubusercontent.com/GRatierODU/krillion-prompts/main/bank.json",
  "https://cdn.jsdelivr.net/gh/GRatierODU/krillion-prompts@main/bank.json",
];

export function inflate(rows: CompactPrompt[]): Prompt[] {
  return rows
    .filter((row) => row[2] !== "" && Array.isArray(row[3]) && row[3].length > 0)
    .map(([id, category, text, answers]) => ({
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

function isPromptArray(data: unknown): data is CompactPrompt[] {
  return Array.isArray(data) && data.length > 0 && Array.isArray(data[0]);
}

function isManifest(data: unknown): data is Manifest {
  return Boolean(
    data &&
      typeof data === "object" &&
      Array.isArray((data as Manifest).parts) &&
      (data as Manifest).parts.length > 0,
  );
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function resolvePart(base: string, part: string): string {
  if (/^https?:\/\//.test(part)) return part;
  return base.replace(/[^/]+$/, "") + part;
}

async function rowsFrom(url: string): Promise<CompactPrompt[]> {
  const data = await fetchJson(url);
  if (isPromptArray(data)) return data;
  if (!isManifest(data)) throw new Error("format de banque inconnu");
  const rows: CompactPrompt[] = [];
  for (const part of data.parts) {
    const piece = await fetchJson(resolvePart(url, part));
    if (!isPromptArray(piece)) throw new Error(`partie invalide: ${part}`);
    rows.push(...piece);
  }
  return rows;
}

let cached: Prompt[] | null = null;

export async function loadPrompts(): Promise<Prompt[]> {
  if (cached) return cached;

  const errors: string[] = [];
  try {
    const bundled = inflate(await loadBundled());
    if (bundled.length >= 500) {
      const ids = new Set<string>();
      for (const prompt of bundled) {
        if (ids.has(prompt.id)) {
          throw new Error(`Prompt id dupliqué: ${prompt.id}`);
        }
        ids.add(prompt.id);
      }
      cached = bundled;
      return cached;
    }
    errors.push(`bundled: banque trop petite (${bundled.length})`);
  } catch (error) {
    errors.push(`bundled: ${error instanceof Error ? error.message : "échec"}`);
  }

  for (const url of BANK_URLS) {
    try {
      const prompts = inflate(await rowsFrom(url));
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
