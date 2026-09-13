"use client";

import { useSyncExternalStore } from "react";
import { Boat, Krill } from "./pixels";

type OceanProps = {
  depth: number;
  sinking?: boolean;
  hidePlayer?: boolean;
};

const DEPTH_STOPS: { d: number; c: string }[] = [
  { d: 0, c: "#2a6bb8" },
  { d: 80, c: "#1c529e" },
  { d: 160, c: "#164686" },
  { d: 240, c: "#123a70" },
  { d: 340, c: "#0c2c54" },
  { d: 480, c: "#081e3c" },
  { d: 720, c: "#051428" },
  { d: 1200, c: "#030c18" },
  { d: 2000, c: "#020814" },
];

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function mixHex(a: string, b: string, t: number): string {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return `rgb(${clamp(ar + (br - ar) * t)}, ${clamp(ag + (bg - ag) * t)}, ${clamp(ab + (bb - ab) * t)})`;
}

function oceanColor(depth: number): string {
  const d = Math.max(0, depth);
  if (d <= 0) return "#163e86";
  let mixed = DEPTH_STOPS[DEPTH_STOPS.length - 1].c;
  for (let i = 1; i < DEPTH_STOPS.length; i++) {
    if (d <= DEPTH_STOPS[i].d) {
      const prev = DEPTH_STOPS[i - 1];
      const next = DEPTH_STOPS[i];
      mixed = mixHex(prev.c, next.c, (d - prev.d) / (next.d - prev.d));
      break;
    }
  }
  if (d < 28) {
    return mixHex(mixed, "#163e86", 1 - d / 28);
  }
  return mixed;
}

const SPAN = 280;

type Critter =
  | { kind: "fish"; depth: number; x: number; big?: boolean; delay: string; dur: string }
  | { kind: "bubble"; depth: number; x: number; delay: string }
  | { kind: "kelp"; depth: number; x: number; h: number; flip?: boolean; delay: string };

const WORLD: Critter[] = [
  { kind: "fish", depth: 20, x: 14, delay: "0s", dur: "22s" },
  { kind: "fish", depth: 55, x: 78, big: true, delay: "4s", dur: "26s" },
  { kind: "fish", depth: 88, x: 32, delay: "9s", dur: "19s" },
  { kind: "fish", depth: 125, x: 86, delay: "2s", dur: "28s" },
  { kind: "fish", depth: 165, x: 18, big: true, delay: "12s", dur: "24s" },
  { kind: "fish", depth: 205, x: 68, delay: "16s", dur: "21s" },
  { kind: "fish", depth: 248, x: 8, delay: "6s", dur: "23s" },
  { kind: "fish", depth: 292, x: 90, big: true, delay: "1s", dur: "25s" },
  { kind: "fish", depth: 340, x: 42, delay: "8s", dur: "20s" },
  { kind: "fish", depth: 395, x: 72, delay: "3s", dur: "27s" },
  { kind: "fish", depth: 460, x: 22, big: true, delay: "11s", dur: "22s" },
  { kind: "fish", depth: 540, x: 80, delay: "5s", dur: "24s" },
  { kind: "fish", depth: 640, x: 16, delay: "14s", dur: "26s" },
  { kind: "fish", depth: 760, x: 64, big: true, delay: "7s", dur: "21s" },
  { kind: "bubble", depth: 35, x: 22, delay: "0s" },
  { kind: "bubble", depth: 70, x: 48, delay: "1.4s" },
  { kind: "bubble", depth: 110, x: 63, delay: "0.6s" },
  { kind: "bubble", depth: 155, x: 81, delay: "2.1s" },
  { kind: "blobble", depth: 200, x: 28, delay: "1.1s" },
];
