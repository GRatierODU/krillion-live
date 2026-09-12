"use client";

import { useSyncExternalStore } from "react";
import { Boat, Krill } from "./pixels";

type OceanProps = {
  depth: number;
  surface: boolean;
};

function oceanColor(depth: number, surface: boolean): string {
  if (surface) return "#163e86";
  if (depth < 80) return "#1a4d99";
  if (depth < 220) return "#0d3a78";
  if (depth < 450) return "#08244f";
  if (depth < 800) return "#061830";
  if (depth < 1600) return "#04101f";
  return "#020814";
}

const FISH = [
  { top: "58%", delay: "0s", duration: "22s", big: false },
  { top: "66%", delay: "4s", duration: "26s", big: true },
  { top: "74%", delay: "9s", duration: "19s", big: false },
  { top: "82%", delay: "2s", duration: "28s", big: false },
  { top: "90%", delay: "12s", duration: "24s", big: true },
  { top: "62%", delay: "16s", duration: "21s", big: false },
];

const BUBBLES = [
  { left: "12%", top: "62%", delay: "0s" },
  { left: "28%", top: "71%", delay: "1.4s" },
  { left: "63%", top: "78%", delay: "0.6s" },
  { left: "81%", top: "68%", delay: "2.1s" },
  { left: "44%", top: "88%", delay: "1.1s" },
];

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

export function Ocean({ depth, surface }: OceanProps) {
  const lite = useLiteScene();
  const skyHidden = !surface && depth > 40;
  const skyHeight = surface ? "46%" : depth < 40 ? "22%" : "0%";
  const boatTop = surface
    ? "calc(46% - 28px)"
    : depth < 40
      ? "calc(22% - 28px)"
      : "-40px";

  return (
    <div className="scene" aria-hidden>
      <div
        className="ocean"
        style={{ background: oceanColor(depth, surface) }}
      />
      <div
        className="sky"
        style={{
          height: skyHeight,
          opacity: skyHidden ? 0 : 1,
        }}
      >
        <span className="sun" />
        <span className="cloud" style={{ top: 36, left: "7%" }} />
        <span className="cloud" style={{ top: 58, left: "24%" }} />
        <span className="cloud" style={{ top: 30, right: "22%" }} />
        <span className="cloud" style={{ top: 70, right: "6%" }} />
      </div>
      <div className="horizon" style={{ top: skyHeight, opacity: skyHidden ? 0 : 1 }} />
      <div className="boat" style={{ top: boatTop, left: "18%", opacity: skyHidden ? 0 : 1 }}>
        <Boat />
      </div>
      {(lite ? FISH.slice(0, 2) : FISH).map((fish, i) => (
        <span
          key={i}
          className={`life fish${fish.big ? " big" : ""}${lite ? " still" : ""}`}
          style={{
            top: fish.top,
            left: lite ? `${12 + i * 28}%` : undefined,
            animationDelay: lite ? undefined : fish.delay,
            animationDuration: lite ? undefined : fish.duration,
          }}
        />
      ))}
      {(lite ? BUBBLES.slice(0, 2) : BUBBLES).map((bubble, i) => (
        <span
          key={`b-${i}`}
          className={`life bubble${lite ? " still" : ""}`}
          style={{
            left: bubble.left,
            top: bubble.top,
            animationDelay: lite ? undefined : bubble.delay,
          }}
        />
      ))}
      <span className={`life krill${lite ? " still" : ""}`} style={{ left: "9%", top: "62%" }}>
        <Krill />
      </span>
    </div>
  );
}

export function DepthRuler({ depth }: { depth: number }) {
  const window = 220;
  const start = Math.max(0, Math.round((depth - window / 2) / 100) * 100);
  const ticks = [start, start + 100, start + 200].filter((n) => n >= 0);
  const min = ticks[0] ?? 0;
  const max = (ticks[ticks.length - 1] ?? 200) + 20;
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
