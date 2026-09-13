import { inflateGzipBase64 } from "./gunzip";
import type { CompactPrompt } from "./load";
import { F00 } from "./extra2-chunks/f00";
import { F01 } from "./extra2-chunks/f01";
import { F02 } from "./extra2-chunks/f02";
import { F03 } from "./extra2-chunks/f03";
import { F04 } from "./extra2-chunks/f04";
import { F05 } from "./extra2-chunks/f05";

export const EXTRA2_CHUNKS = [
  F00,
  F01,
  F02,
  F03,
  F04,
  F05,
];

export async function loadExtra2(): Promise<CompactPrompt[]> {
  return inflateGzipBase64(EXTRA2_CHUNKS.join(""));
}
