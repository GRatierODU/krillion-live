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
import { E18 } from "./extra-chunks/e18";
import { E19 } from "./extra-chunks/e19";
import { E20 } from "./extra-chunks/e20";
import { E21 } from "./extra-chunks/e21";
import { E22 } from "./extra-chunks/e22";
import { E23 } from "./extra-chunks/e23";
import { E24 } from "./extra-chunks/e24";
import { E25 } from "./extra-chunks/e25";
import { E26 } from "./extra-chunks/e26";
import { E27 } from "./extra-chunks/e27";
import { E28 } from "./extra-chunks/e28";
import { E29 } from "./extra-chunks/e29";
import { E30 } from "./extra-chunks/e30";
import { E31 } from "./extra-chunks/e31";
import { E32 } from "./extra-chunks/e32";
import { E33 } from "./extra-chunks/e33";
import { E34 } from "./extra-chunks/e34";

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
  E18,
  E19,
  E20,
  E21,
  E22,
  E23,
  E24,
  E25,
  E26,
  E27,
  E28,
  E29,
  E30,
  E31,
  E32,
  E33,
  E34,
];

export async function loadExtra(): Promise<CompactPrompt[]> {
  return inflateGzipBase64(EXTRA_CHUNKS.join(""));
}
