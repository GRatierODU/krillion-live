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
