export const DIVE_MS = 2100;
export const DIVE_SETTLE_MS = 180;
export const ASCENT_MS = 1680;
export const SURFACE_HOLD_MS = 1000;

/** Slow cinematic sink: ~1.9–2.5s, then the result card. */
export function diveDuration(delta: number): number {
  const abs = Math.abs(delta);
  return Math.min(2500, Math.max(1900, 1860 + abs * 0.6));
}

/** Calm rise back to 0 m — long enough that the last meters never snap. */
export function ascentDuration(fromMeters: number): number {
  const abs = Math.abs(fromMeters);
  if (abs < 2) return 0;
  return Math.min(2300, Math.max(1500, 1480 + abs * 0.55));
}

export function prefersReducedMotion(): boolean {
  try {
    if (typeof window === "undefined" || !window.matchMedia) return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  } catch {
    return false;
  }
}

export async function safeAnimate(
  el: Element | null,
  params: {
    opacity?: number[];
    translateY?: number[];
    scale?: number[];
    duration?: number;
    ease?: string;
  },
) {
  if (!el || prefersReducedMotion()) return;
  try {
    const mod = await import("animejs");
    if (typeof mod.animate !== "function") return;
    mod.animate(el, params);
  } catch {
    /* animation is optional — never blank the page */
  }
}
