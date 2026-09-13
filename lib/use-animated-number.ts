"use client";

import { useEffect, useRef, useState } from "react";
import { DIVE_MS, prefersReducedMotion } from "./motion";

export type NumberEase = "out" | "inout";

function easeOut(t: number) {
  return 1 - Math.pow(1 - t, 1.28);
}

function easeInOut(t: number) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

const EPS = 0.05;

export function useAnimatedNumber(
  target: number,
  duration = DIVE_MS,
  easing: NumberEase = "out",
): number {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);
  const durationRef = useRef(duration);
  const easingRef = useRef(easing);
  durationRef.current = duration;
  easingRef.current = easing;

  useEffect(() => {
    const dest = target;
    const ms = durationRef.current;
    if (prefersReducedMotion() || ms <= 0 || Math.abs(valueRef.current - dest) < EPS) {
      valueRef.current = dest;
      setValue(dest);
      return;
    }
    const from = valueRef.current;
    const start = performance.now();
    const ease = easingRef.current === "inout" ? easeInOut : easeOut;
    let raf = 0;
    let alive = true;
    const tick = (now: number) => {
      if (!alive) return;
      const t = Math.min(1, (now - start) / ms);
      const next = from + (dest - from) * ease(t);
      valueRef.current = next;
      setValue(next);
      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        valueRef.current = dest;
        setValue(dest);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
    };
  }, [target]);

  return value;
}
