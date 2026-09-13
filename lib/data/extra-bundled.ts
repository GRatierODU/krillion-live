import { inflateGzipBase64 } from "./gunzip";
import type { CompactPrompt } from "./load";
import { E00 } from "./extra-chunks/e00";
import { E01 } from "./extra-chunks/e01";
import { E02 } from "./extra-chunks/e02";
import { E03 } from "./extra-chunks/e03";
import { E04 } from "./extra-chunks/e04";
import { E05 } from "./extra-chunks/e05";
import { E06 } from "./extra-chunks/e06";
import { E07 } from "./extra-chunks/e07";
import { E08 } from "./extra-chunks/e08";
import { E09 } from "./extra-chunks/e09";
import { E10 } from "./extra-chunks/e10";
import { E11 } from "./extra-chunks/e11";
import { E12 } from "./extra-chunks/e12";
import { E13 } from "./extra-chunks/e13";
import { E14 } from "./extra-chunks/e14";
import { E15 } from "./extra-chunks/e15";
import { E16 } from "./extra-chunks/e16";
import { E17 } from "./extra-chunks/e17";

export const EXTRA_CHUNKS = [
  E00,
  E01,
  E02,
  E03,
  E04,
  E05,
  E06,
  E07,
  E08,
  E09,
  E10,
  E11,
  E12,
  E13,
  E14,
  E15,
  E16,
  E17,
];

export async function loadExtra(): Promise<CompactPrompt[]> {
  return inflateGzipBase64(EXTRA_CHUNKS.join(""));
}
