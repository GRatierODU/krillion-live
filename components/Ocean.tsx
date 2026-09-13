"use client";

import { useSyncExternalStore } from "react";
import { Boat } from "./pixels";

type OceanProps = {
  depth: number;
  sinking?: boolean;
};

const DEPTH_STOPS: { d: number; c: string }[] = [
  { d: 0, c: "#163e86" },
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
  const d = Number.isFinite(depth) ? Math.max(0, depth) : 0;
  if (d < 2) return "#163e86";
  let mixed = DEPTH_STOPS[DEPTH_STOPS.length - 1].c;
  for (let i = 1; i < DEPTH_STOPS.length; i++) {
    if (d <= DEPTH_STOPS[i].d) {
      const prev = DEPTH_STOPS[i - 1];
      const next = DEPTH_STOPS[i];
      mixed = mixHex(prev.c, next.c, (d - prev.d) / (next.d - prev.d));
      break;
    }
  }
  if (d < 36) {
    return mixHex(mixed, "#163e86", 1 - (d - 2) / 34);
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
  { kind: "bubble", depth: 200, x: 28, delay: "1.1s" },
  { kind: "bubble", depth: 260, x: 54, delay: "0.8s" },
  { kind: "bubble", depth: 330, x: 12, delay: "1.7s" },
  { kind: "kelp", depth: 175, x: 2, h: 46, delay: "0s" },
  { kind: "kelp", depth: 210, x: 8, h: 34, flip: true, delay: "0.4s" },
  { kind: "kelp", depth: 235, x: 88, h: 40, flip: true, delay: "0.2s" },
  { kind: "kelp", depth: 270, x: 94, h: 52, delay: "0.7s" },
  { kind: "kelp", depth: 310, x: 4, h: 48, delay: "0.3s" },
  { kind: "kelp", depth: 345, x: 86, h: 44, flip: true, delay: "0.9s" },
  { kind: "kelp", depth: 400, x: 10, h: 38, delay: "0.5s" },
  { kind: "kelp", depth: 460, x: 91, h: 50, flip: true, delay: "0.1s" },
];

function worldTop(worldDepth: number, camera: number) {
  const min = camera - SPAN * 0.42;
  return ((worldDepth - min) / SPAN) * 100;
}

function subscribeLite(onChange: () => void) {
  if (typeof window === "undefined") return () => {};
  try {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const wide = window.matchMedia("(min-width: 520px)");
    motion.addEventListener("change", onChange);
    wide.addEventListener("change", onChange);
    return () => {
      motion.removeEventListener("change", onChange);
      wide.removeEventListener("change", onChange);
    };
  } catch {
    return () => {};
  }
}

function getLite() {
  try {
    return (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !window.matchMedia("(min-width: 520px)").matches
    );
  } catch {
    return true;
  }
}

function useLiteScene() {
  return useSyncExternalStore(subscribeLite, getLite, () => true);
}

export function Ocean({ depth, sinking = false }: OceanProps) {
  const lite = useLiteScene();
  const camera = Number.isFinite(depth) ? Math.max(0, depth) : 0;
  const diving = sinking && camera > 2;
  const skyAmt = Math.max(0, Math.min(1, 1 - camera / 140));
  const skyHeightPct = 8 + 38 * skyAmt;
  const skyHeight = `${skyHeightPct.toFixed(2)}%`;
  const boatTop =
    skyAmt > 0.02 ? `calc(${skyHeightPct.toFixed(2)}% - 28px)` : "-64px";
  const veil = Math.min(0.72, camera / 2200);
  const floorKelp = Math.max(0, Math.min(1, (camera - 130) / 200));
  const reduced = lite && !diving;

  const visible = WORLD.filter((item) => {
    const top = worldTop(item.depth, camera);
    return top > -12 && top < 112;
  });
  const fauna = lite ? visible.slice(0, 10) : visible;

  return (
    <div className={`scene${diving ? " sinking" : ""}`} aria-hidden>
      <div className="ocean" style={{ background: oceanColor(camera) }} />
      <div className="abyss-veil" style={{ opacity: veil }} />
      <div className="sky" style={{ height: skyHeight, opacity: skyAmt }}>
        <span className="sun" />
        <span className="cloud" style={{ top: 36, left: "7%" }} />
        <span className="cloud" style={{ top: 58, left: "24%" }} />
        <span className="cloud" style={{ top: 30, right: "22%" }} />
        <span className="cloud" style={{ top: 70, right: "6%" }} />
      </div>
      <div className="horizon" style={{ top: skyHeight, opacity: skyAmt }} />
      <div className="boat" style={{ top: boatTop, left: "18%", opacity: skyAmt }}>
        <Boat />
      </div>
      {fauna.map((item, i) => {
        const top = `${worldTop(item.depth, camera).toFixed(2)}%`;
        if (item.kind === "fish") {
          return (
            <span
              key={`f-${i}`}
              className={`life fish${item.big ? " big" : ""}${reduced ? " still" : ""}`}
              style={{
                top,
                left: `${item.x}%`,
                animationDelay: reduced ? undefined : item.delay,
                animationDuration: reduced ? undefined : item.dur,
              }}
            />
          );
        }
        if (item.kind === "bubble") {
          return (
            <span
              key={`b-${i}`}
              className={`life bubble${reduced ? " still" : ""}`}
              style={{
                top,
                left: `${item.x}%`,
                animationDelay: reduced ? undefined : item.delay,
              }}
            />
          );
        }
        return (
          <span
            key={`k-${i}`}
            className={`kelp drift${item.flip ? " flip" : ""}`}
            style={{
              top,
              left: `${item.x}%`,
              height: `${item.h}%`,
              animationDelay: item.delay,
            }}
          />
        );
      })}
      {floorKelp > 0.04 && (
        <>
          <span className="kelp floor" style={{ left: "1%", height: "42%", opacity: floorKelp * 0.7 }} />
          <span className="kelp floor flip" style={{ left: "7%", height: "30%", opacity: floorKelp * 0.55 }} />
          <span className="kelp floor flip" style={{ left: "87%", height: "38%", opacity: floorKelp * 0.65 }} />
          <span className="kelp floor" style={{ left: "94%", height: "50%", opacity: floorKelp * 0.75 }} />
        </>
      )}
    </div>
  );
}

export function DepthRuler({ depth }: { depth: number }) {
  const min = depth - SPAN * 0.42;
  const max = depth + SPAN * 0.58;
  const first = Math.ceil(min / 100) * 100;
  const ticks: number[] = [];
  for (let tick = first; tick <= max; tick += 100) {
    if (tick >= 0) ticks.push(tick);
  }
  const pct = (value: number) => {
    const t = (value - min) / (max - min);
    return `${Math.min(96, Math.max(4, t * 100))}%`;
  };

  return (
    <div className="ruler" aria-hidden>
      <div className="ruler-line" />
      {ticks.map((tick) => (
        <div key={tick} className="tick" style={{ top: pct(tick) }}>
          -{tick}m
        </div>
      ))}
      <div className="you" style={{ top: pct(depth) }}>
        VOUS
      </div>
    </div>
  );
}
