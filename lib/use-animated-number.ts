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

export function useAnimatedNumber(
  target: number,
  duration = DIVE_MS,
  easing: NumberEase = "out",
): number {
  const [value, setValue] = useState(target);
  const valueRef = useRef(target);

  useEffect(() => {
    if (prefersReducedMotion() || duration <= 0 || valueRef.current === target) {
      valueRef.current = target;
      setValue(target);
      return;
    }
    const from = valueRef.current;
    const start = performance.now();
    let raf = 0;
    const ease = easing === "inout" ? easeInOut : easeOut;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const next = from + (target - from) * ease(t);
      valueRef.current = next;
      setValue(next);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, easing]);

  return value;
}
