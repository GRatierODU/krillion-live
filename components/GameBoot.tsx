"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { loadPrompts } from "@/lib/data";
import type { Prompt } from "@/lib/types";
import { useVisualViewport } from "@/lib/viewport";
import { GameErrorBoundary } from "./GameErrorBoundary";

function BootShell() {
  return (
    <div className="game-root">
      <div className="scene" aria-hidden>
        <div className="ocean" style={{ background: "#163e86" }} />
        <div className="sky" style={{ height: "46%" }}>
          <span className="sun" />
        </div>
      </div>
      <div className="stage home">
        <div className="title-wrap">
          <h1 className="brand">KRILLION</h1>
          <p className="subtitle">LA PLONGÉE ILLIMITÉE</p>
          <p className="tagline">chargement de la descente…</p>
        </div>
      </div>
    </div>
  );
}

const KrillionGame = dynamic(
  () =>
    import("./KrillionGame").then((mod) => ({ default: mod.KrillionGame })),
  { ssr: false, loading: () => <BootShell /> },
);

function CatalogGate() {
  const [prompts, setPrompts] = useState<Prompt[] | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadPrompts()
      .then((next) => {
        if (!cancelled) {
          setPrompts(next);
          try {
            window.__KRILLION_COUNT = next.length;
          } catch {
            /* ignore */
          }
        }
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed) {
    return (
      <div className="crash-fallback">
        <p className="crash-k">KRILLION</p>
        <h1>Le catalogue n’a pas pu être chargé.</h1>
        <p>Vérifie ta connexion, puis relance la descente.</p>
        <button
          className="cta"
          type="button"
          onClick={() => window.location.reload()}
        >
          RÉESSAYER
        </button>
      </div>
    );
  }

  if (!prompts) return <BootShell />;
  return <KrillionGame prompts={prompts} />;
}

export function GameBoot() {
  useVisualViewport();
  return (
    <GameErrorBoundary>
      <CatalogGate />
    </GameErrorBoundary>
  );
}
