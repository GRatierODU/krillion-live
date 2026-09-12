"use client";

import { useEffect } from "react";

function syncVisualViewport() {
  const root = document.documentElement;
  const vv = window.visualViewport;
  try {
    window.scrollTo(0, 0);
    document.body?.scrollTo?.(0, 0);
  } catch {
    /* ignore */
  }

  if (!vv) {
    root.style.setProperty("--vvh", `${window.innerHeight}px`);
    root.style.setProperty("--vv-top", "0px");
    root.style.setProperty("--kb", "0px");
    root.classList.remove("kb-open");
    return;
  }

  const kb = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
  root.style.setProperty("--vvh", `${Math.round(vv.height)}px`);
  root.style.setProperty("--vv-top", `${Math.round(vv.offsetTop)}px`);
  root.style.setProperty("--kb", `${Math.round(kb)}px`);
  root.classList.toggle("kb-open", kb > 72);
}

export function useVisualViewport() {
  useEffect(() => {
    syncVisualViewport();
    const vv = window.visualViewport;
    vv?.addEventListener("resize", syncVisualViewport);
    vv?.addEventListener("scroll", syncVisualViewport);
    window.addEventListener("resize", syncVisualViewport);
    window.addEventListener("orientationchange", syncVisualViewport);
    return () => {
      vv?.removeEventListener("resize", syncVisualViewport);
      vv?.removeEventListener("scroll", syncVisualViewport);
      window.removeEventListener("resize", syncVisualViewport);
      window.removeEventListener("orientationchange", syncVisualViewport);
    };
  }, []);
}
