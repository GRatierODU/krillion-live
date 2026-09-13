import { inflateGzipBase64 } from "./gunzip";
import type { CompactPrompt } from "./load";
import { C00 } from "./chunks/c00";
import { C01 } from "./chunks/c01";
import { C02 } from "./chunks/c02";
import { C03 } from "./chunks/c03";
import { C04 } from "./chunks/c04";
import { C05 } from "./chunks/c05";
import { C06 } from "./chunks/c06";
import { C07 } from "./chunks/c07";
import { C08 } from "./chunks/c08";
import { C09 } from "./chunks/c09";
import { C10 } from "./chunks/c10";
import { C11 } from "./chunks/c11";
import { C12 } from "./chunks/c12";
import { C13 } from "./chunks/c13";
import { C14 } from "./chunks/c14";
import { C15 } from "./chunks/c15";
import { C16 } from "./chunks/c16";
import { C17 } from "./chunks/c17";
import { C18 } from "./chunks/c18";
import { C19 } from "./chunks/c19";
import { C20 } from "./chunks/c20";
import { C21 } from "./chunks/c21";
import { C22 } from "./chunks/c22";
import { C23 } from "./chunks/c23";
import { C24 } from "./chunks/c24";
import { C25 } from "./chunks/c25";
import { C26 } from "./chunks/c26";
import { C27 } from "./chunks/c27";
import { C28 } from "./chunks/c28";
import { C29 } from "./chunks/c29";
import { C30 } from "./chunks/c30";
import { C31 } from "./chunks/c31";
import { C32 } from "./chunks/c32";
import { C33 } from "./chunks/c33";
import { C34 } from "./chunks/c34";
import { C35 } from "./chunks/c35";
import { C36 } from "./chunks/c36";
import { C37 } from "./chunks/c37";
import { C38 } from "./chunks/c38";
import { C39 } from "./chunks/c39";
import { C40 } from "./chunks/c40";
import { C41 } from "./chunks/c41";
import { C42 } from "./chunks/c42";
import { C43 } from "./chunks/c43";
import { C44 } from "./chunks/c44";
import { C45 } from "./chunks/c45";
import { C46 } from "./chunks/c46";
import { C47 } from "./chunks/c47";
import { C48 } from "./chunks/c48";
import { C49 } from "./chunks/c49";
import { C50 } from "./chunks/c50";
import { C51 } from "./chunks/c51";
import { C52 } from "./chunks/c52";
import { C53 } from "./chunks/c53";
import { C54 } from "./chunks/c54";
import { C55 } from "./chunks/c55";
import { C56 } from "./chunks/c56";
import { C57 } from "./chunks/c57";

export const BANK_CHUNKS = [
  C00,
  C01,
  C02,
  C03,
  C04,
  C05,
  C06,
  C07,
  C08,
  C09,
  C10,
  C11,
  C12,
  C13,
  C14,
  C15,
  C16,
  C17,
  C18,
  C19,
  C20,
  C21,
  C22,
  C23,
  C24,
  C25,
  C26,
  C27,
  C28,
  C29,
  C30,
  C31,
  C32,
  C33,
  C34,
  C35,
  C36,
  C37,
  C38,
  C39,
  C40,
  C41,
  C42,
  C43,
  C44,
  C45,
  C46,
  C47,
  C48,
  C49,
  C50,
  C51,
  C52,
  C53,
  C54,
  C55,
  C56,
  C57,
];

export async function loadBundled(): Promise<CompactPrompt[]> {
  return inflateGzipBase64(BANK_CHUNKS.join(""));
}
