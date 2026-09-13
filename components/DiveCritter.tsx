"use client";

import { useEffect, useRef } from "react";
import {
  liveDiveTier,
  TIER_ASCEND,
  TIER_COLOR,
  TIER_CREATURE,
  TIER_CREATURE_KEY,
  TIER_LABEL,
} from "@/lib/scoring";
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
    <svg viewBox="0 0 48 36" width="80" height="60" aria-hidden>
      <circle cx="24" cy="18" r="8" fill="none" stroke={color} strokeWidth="2.5" />
      <circle cx="21" cy="15" r="2.2" fill={color} />
      <circle cx="10" cy="10" r="4" fill="none" stroke={color} strokeWidth="2" opacity="0.8" />
      <circle cx="38" cy="24" r="5" fill="none" stroke={color} strokeWidth="2" opacity="0.75" />
      <circle cx="36" cy="8" r="3" fill="none" stroke={color} strokeWidth="1.8" opacity="0.65" />
    </svg>
  );
}

function Shrimp({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 48 36" width="84" height="62" aria-hidden>
      <rect x="28" y="6" width="5" height="5" fill={color} />
      <rect x="18" y="11" width="18" height="6" fill={color} />
      <rect x="10" y="16" width="20" height="6" fill={color} />
      <rect x="5" y="21" width="11" height="5" fill={color} opacity="0.9" />
      <rect x="34" y="18" width="7" height="5" fill={color} opacity="0.75" />
      <rect x="32" y="8" width="2" height="6" fill={color} opacity="0.7" />
    </svg>
  );
}

function Fish({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 52 36" width="88" height="62" aria-hidden>
      <rect x="8" y="13" width="28" height="10" fill={color} />
      <rect x="14" y="8" width="18" height="20" fill={color} />
      <rect x="36" y="10" width="11" height="16" fill={color} />
      <rect x="3" y="15" width="6" height="6" fill={color} opacity="0.85" />
      <rect x="18" y="13" width="3" height="3" fill="#071018" />
    </svg>
  );
}

function RareFish({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 52 36" width="90" height="64" aria-hidden>
      <rect x="24" y="3" width="6" height="5" fill={color} />
      <rect x="10" y="11" width="26" height="13" fill={color} />
      <rect x="16" y="7" width="18" height="21" fill={color} />
      <rect x="36" y="8" width="12" height="18" fill={color} />
      <rect x="3" y="14" width="8" height="8" fill={color} opacity="0.9" />
      <rect x="20" y="13" width="3" height="3" fill="#071018" />
      <rect x="26" y="27" width="5" height="5" fill={color} opacity="0.75" />
    </svg>
  );
}

function Jelly({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 48 42" width="86" height="72" aria-hidden>
      <rect x="12" y="4" width="24" height="12" fill={color} />
      <rect x="8" y="11" width="32" height="9" fill={color} />
      <rect x="13" y="20" width="3" height="16" fill={color} opacity="0.8" />
      <rect x="22" y="20" width="3" height="18" fill={color} />
      <rect x="31" y="20" width="3" height="14" fill={color} opacity="0.8" />
      <rect x="18" y="10" width="4" height="3" fill="#071018" opacity="0.35" />
    </svg>
  );
}

function Angler({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 56 42" width="94" height="70" aria-hidden>
      <rect x="30" y="2" width="3" height="10" fill={color} />
      <rect x="33" y="2" width="6" height="5" fill="#fff4b0" />
      <rect x="10" y="15" width="30" height="12" fill={color} />
      <rect x="16" y="10" width="22" height="22" fill={color} />
      <rect x="40" y="13" width="12" height="16" fill={color} />
      <rect x="4" y="18" width="8" height="8" fill={color} opacity="0.9" />
      <rect x="22" y="16" width="5" height="5" fill="#071018" />
      <rect x="24" y="18" width="2" height="2" fill="#fff4b0" />
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
      data-creature={TIER_CREATURE_KEY[shown]}
      data-morph={live ? "live" : "settle"}
      style={{ color }}
      aria-label={`${TIER_CREATURE[shown]} · ${TIER_LABEL[shown]}`}
    >
      {live && (
        <span className="critter-trail" aria-hidden>
          <i />
          <i />
          <i />
        </span>
      )}
      <Creature tier={shown} color={color} />
      <span className="critter-name">{TIER_CREATURE[shown]}</span>
    </div>
  );
}
