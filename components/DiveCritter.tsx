"use client";

import { useEffect, useRef } from "react";
import { liveDiveTier, TIER_ASCEND, TIER_COLOR, TIER_LABEL } from "@/lib/scoring";
import { safeAnimate } from "@/lib/motion";
import type { TierId } from "@/lib/types";

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
  const u = Math.max(0, Math.min(1, t));
  return `rgb(${clamp(ar + (br - ar) * u)}, ${clamp(ag + (bg - ag) * u)}, ${clamp(ab + (bb - ab) * u)})`;
}

const BAND: Record<TierId, { from: number; to: number }> = {
  plancton: { from: 0, to: 100 },
  trop_malin: { from: 100, to: 200 },
  banc: { from: 200, to: 300 },
  rare: { from: 300, to: 500 },
  coupe: { from: 500, to: 700 },
  krillion: { from: 700, to: 1000 },
};

function colorAtDepth(meters: number, cap: TierId): string {
  const live = liveDiveTier(meters, cap);
  const next = TIER_ASCEND[Math.min(TIER_ASCEND.indexOf(live) + 1, TIER_ASCEND.indexOf(cap))];
  if (next === live) return TIER_COLOR[live];
  const { from, to } = BAND[live];
  const t = to <= from ? 1 : (meters - from) / (to - from);
  return mixHex(TIER_COLOR[live], TIER_COLOR[next], Math.max(0, Math.min(1, t)) * 0.55);
}

function Plancton({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 32 24" width="36" height="28" aria-hidden>
      <circle cx="16" cy="12" r="5" fill="none" stroke={color} strokeWidth="2" />
      <circle cx="14" cy="10" r="1.4" fill={color} />
      <circle cx="8" cy="7" r="2.2" fill="none" stroke={color} strokeWidth="1.5" opacity="0.75" />
      <circle cx="24" cy="16" r="2.6" fill="none" stroke={color} strokeWidth="1.5" opacity="0.7" />
    </svg>
  );
}

function Shrimp({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 32 24" width="40" height="30" aria-hidden>
      <rect x="18" y="5" width="3" height="3" fill={color} />
      <rect x="12" y="8" width="12" height="4" fill={color} />
      <rect x="7" y="11" width="13" height="4" fill={color} />
      <rect x="4" y="14" width="7" height="3" fill={color} opacity="0.85" />
      <rect x="22" y="12" width="4" height="3" fill={color} opacity="0.7" />
    </svg>
  );
}

function Fish({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 36 24" width="44" height="30" aria-hidden>
      <rect x="6" y="9" width="18" height="6" fill={color} />
      <rect x="10" y="6" width="12" height="12" fill={color} />
      <rect x="24" y="7" width="7" height="10" fill={color} />
      <rect x="3" y="10" width="4" height="4" fill={color} opacity="0.8" />
      <rect x="13" y="9" width="2" height="2" fill="#071018" />
    </svg>
  );
}

function RareFish({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 36 24" width="46" height="30" aria-hidden>
      <rect x="16" y="3" width="4" height="3" fill={color} />
      <rect x="7" y="8" width="18" height="8" fill={color} />
      <rect x="11" y="5" width="12" height="14" fill={color} />
      <rect x="25" y="6" width="8" height="12" fill={color} />
      <rect x="3" y="10" width="5" height="5" fill={color} opacity="0.85" />
      <rect x="14" y="9" width="2" height="2" fill="#071018" />
      <rect x="18" y="18" width="3" height="3" fill={color} opacity="0.7" />
    </svg>
  );
}

function Jelly({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 32 28" width="42" height="36" aria-hidden>
      <rect x="8" y="4" width="16" height="8" fill={color} />
      <rect x="6" y="8" width="20" height="6" fill={color} />
      <rect x="9" y="14" width="2" height="10" fill={color} opacity="0.75" />
      <rect x="15" y="14" width="2" height="12" fill={color} />
      <rect x="21" y="14" width="2" height="9" fill={color} opacity="0.75" />
      <rect x="12" y="7" width="3" height="2" fill="#071018" opacity="0.35" />
    </svg>
  );
}

function Angler({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 40 28" width="48" height="34" aria-hidden>
      <rect x="20" y="2" width="2" height="6" fill={color} />
      <rect x="22" y="2" width="4" height="3" fill="#fff4b0" />
      <rect x="8" y="10" width="20" height="8" fill={color} />
      <rect x="12" y="7" width="14" height="14" fill={color} />
      <rect x="28" y="9" width="8" height="10" fill={color} />
      <rect x="4" y="12" width="5" height="5" fill={color} opacity="0.85" />
      <rect x="16" y="11" width="3" height="3" fill="#071018" />
      <rect x="17" y="12" width="1" height="1" fill="#fff4b0" />
    </svg>
  );
}

function Creature({ tier, color }: { tier: TierId; color: string }) {
  if (tier === "plancton") return <Plancton color={color} />;
  if (tier === "trop_malin") return <Shrimp color={color} />;
  if (tier === "banc") return <Fish color={color} />;
  if (tier === "rare") return <RareFish color={color} />;
  if (tier === "coupe") return <Jelly color={color} />;
  return <Angler color={color} />;
}

type DiveCritterProps = {
  depth: number;
  cap: TierId;
  live?: boolean;
};

export function DiveCritter({ depth, cap, live = false }: DiveCritterProps) {
  const tier = liveDiveTier(depth, cap);
  const color = live ? colorAtDepth(depth, cap) : TIER_COLOR[cap];
  const shown = live ? tier : cap;
  const wrapRef = useRef<HTMLDivElement>(null);
  const lastTier = useRef<TierId>(shown);

  useEffect(() => {
    if (lastTier.current === shown) return;
    lastTier.current = shown;
    void safeAnimate(wrapRef.current, {
      scale: [1, 1.22, 1],
      duration: 320,
      ease: "out(3)",
    });
  }, [shown]);

  return (
    <div
      ref={wrapRef}
      className={`dive-critter${live ? " live" : ""}`}
      aria-label={TIER_LABEL[shown]}
    >
      {live && (
        <span className="critter-trail" aria-hidden>
          <i />
          <i />
          <i />
        </span>
      )}
      <Creature tier={shown} color={color} />
    </div>
  );
}
