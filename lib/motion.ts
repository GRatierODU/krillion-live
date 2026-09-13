export const DIVE_MS = 2100;
export const DIVE_SETTLE_MS = 180;

/** Slow cinematic sink: ~1.9–2.5s, then the result card. */
export function diveDuration(delta: number): number {
  const abs = Math.abs(delta);
  return Math.min(2500, Math.max(1900, 1860 + abs * 0.6));
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
