export const DIVE_MS = 1700;

/** One continuous 1–2s sink after a valid answer. */
export function diveDuration(delta: number): number {
  const abs = Math.abs(delta);
  return Math.min(2000, Math.max(1500, 1480 + abs * 0.5));
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
